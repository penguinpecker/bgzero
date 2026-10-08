import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import Compare from "./Compare";
import {
  defaultSettings,
  presets,
  validateFile,
  loadImage,
  renderImage,
  saveBlob,
  outputName,
  MAX_FILES,
  MAX_PIXELS,
} from "../lib/image";

const API = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8420" : "")
).replace(/\/$/, "");
const colors = [
  "transparent",
  "#ffffff",
  "#242724",
  "#e6e9de",
  "#f3dfce",
  "#dce8ee",
  "#e7dfee",
];
const colorNames = [
  "Transparent",
  "White",
  "Charcoal",
  "Sage",
  "Peach",
  "Sky",
  "Lilac",
];
const samples = [
  { name: "Plant", file: "plant.jpg" },
  { name: "Sneaker", file: "sneaker.jpg" },
  { name: "Portrait", file: "portrait.jpg" },
];

export default function Studio() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("quality");
  const [connection, setConnection] = useState("checking");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [view, setView] = useState("result");
  const [exporting, setExporting] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [demoBackground, setDemoBackground] = useState("transparent");
  const input = useRef(null),
    queue = useRef([]),
    running = useRef(false),
    activeRequest = useRef(null);
  const urls = useRef(new Set()),
    sequence = useRef(0),
    mounted = useRef(true),
    count = useRef(0),
    totalBytes = useRef(0),
    healthSequence = useRef(0);
  const active = items.find((item) => item.id === selected) || items[0];
  const done = items.filter((item) => item.status === "done");
  const pending = items.filter((item) =>
    ["queued", "processing"].includes(item.status),
  ).length;
  const settings = active?.settings || defaultSettings;
  const update = useCallback((id, changes) => {
    if (mounted.current)
      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, ...changes } : item,
        ),
      );
  }, []);
  const objectUrl = useCallback((blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }, []);
  const release = useCallback((url) => {
    if (url) {
      URL.revokeObjectURL(url);
      urls.current.delete(url);
    }
  }, []);

  const checkConnection = useCallback(async (signal) => {
    const requestId = ++healthSequence.current;
    setConnection("checking");
    if (!API) {
      setConnection("unconfigured");
      return;
    }
    try {
      const response = await fetch(`${API}/health`, {
        signal: signal || AbortSignal.timeout(45000),
      });
      const health = await response.json();
      if (!response.ok || health.status !== "ok")
        throw new Error("unavailable");
      if (mounted.current && requestId === healthSequence.current)
        setConnection("ready");
    } catch {
      if (mounted.current && requestId === healthSequence.current)
        setConnection("offline");
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    checkConnection(
      AbortSignal.any([controller.signal, AbortSignal.timeout(44000)]),
    );
    return () => {
      mounted.current = false;
      clearTimeout(timeout);
      controller.abort();
      activeRequest.current?.controller.abort();
      queue.current = [];
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current.clear();
    };
  }, [checkConnection]);

  const processQueue = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      while (queue.current.length && mounted.current) {
        const job = queue.current.shift();
        const controller = new AbortController();
        activeRequest.current = { id: job.id, controller };
        const timeout = setTimeout(() => controller.abort("timeout"), 120000);
        update(job.id, { status: "processing", error: null });
        try {
          const image = await loadImage(job.originalUrl);
          if (
            image.naturalWidth * image.naturalHeight > MAX_PIXELS ||
            Math.max(image.naturalWidth, image.naturalHeight) > 8192
          )
            throw new Error(
              "Resize this image to at most 8192 px on either side and 40 megapixels, then try again.",
            );
          controller.signal.throwIfAborted();
          const form = new FormData();
          form.append("file", job.file);
          form.append("mode", job.mode);
          form.append("format", "png");
          form.append("bg_color", "none");
          const response = await fetch(`${API}/remove`, {
            method: "POST",
            body: form,
            signal: controller.signal,
          });
          if (!response.ok) {
            if (response.status === 413)
              throw new Error(
                "This image exceeds the server limit. Try a smaller file.",
              );
            if (response.status === 429)
              throw new Error(
                "The service is busy. Wait a moment, then retry.",
              );
            throw new Error(
              "The image could not be processed. Try again or choose another image.",
            );
          }
          const blob = await response.blob();
          controller.signal.throwIfAborted();
          if (!blob.type.startsWith("image/"))
            throw new Error(
              "The service returned an unexpected response. Please retry.",
            );
          const resultUrl = objectUrl(blob);
          update(job.id, {
            status: "done",
            resultUrl,
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
          if (mounted.current) setConnection("ready");
        } catch (error) {
          if (
            controller.signal.aborted &&
            controller.signal.reason !== "timeout"
          )
            continue;
          update(job.id, {
            status: "error",
            error:
              controller.signal.reason === "timeout"
                ? "Processing took too long. The service may be waking up; please retry."
                : error instanceof TypeError
                  ? "Could not reach the processing service. Check your connection and retry."
                  : error.message || "Processing failed. Please retry.",
          });
        } finally {
          clearTimeout(timeout);
          activeRequest.current = null;
        }
      }
    } finally {
      running.current = false;
    }
  }, [objectUrl, update]);

  const addFiles = useCallback(
    (files) => {
      if (!API) {
        setMessage(
          "The processing service is not configured for this deployment. Please try again later.",
        );
        return;
      }
      const errors = [],
        jobs = [];
      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
          continue;
        }
        if (count.current >= MAX_FILES) {
          errors.push(
            "You can keep up to 50 images in the workspace. Remove some to add more.",
          );
          break;
        }
        if (totalBytes.current + file.size > 150 * 1024 * 1024) {
          errors.push(
            "The workspace limit is 150 MB. Remove some images before adding more.",
          );
          break;
        }
        count.current++;
        totalBytes.current += file.size;
        jobs.push({
          id: ++sequence.current,
          file,
          originalUrl: objectUrl(file),
          resultUrl: null,
          mode,
          status: "queued",
          settings: { ...defaultSettings },
        });
      }
      setMessage(errors.join(" "));
      if (!jobs.length) return;
      setItems((previous) => [...previous, ...jobs]);
      setSelected(jobs[0].id);
      setView("result");
      queue.current.push(...jobs);
      processQueue();
    },
    [mode, objectUrl, processQueue],
  );

  useEffect(() => {
    const paste = (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest('input, textarea, [contenteditable="true"]')
      )
        return;
      const files = Array.from(event.clipboardData?.files || []);
      if (files.length) {
        event.preventDefault();
        addFiles(files);
      }
    };
    document.addEventListener("paste", paste);
    return () => document.removeEventListener("paste", paste);
  }, [addFiles]);

  useEffect(() => {
    setPreview(null);
    if (!active?.resultUrl) return;
    const controller = new AbortController();
    let url;
    const timer = setTimeout(async () => {
      try {
        const output = await renderImage(active.resultUrl, active.settings, {
          preview: true,
          signal: controller.signal,
        });
        url = URL.createObjectURL(output.blob);
        setPreview(url);
      } catch (error) {
        if (!controller.signal.aborted) setMessage(error.message);
      }
    }, 80);
    return () => {
      clearTimeout(timer);
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [active?.resultUrl, active?.settings]);

  const setSetting = (key, value) => {
    if (active) update(active.id, { settings: { ...settings, [key]: value } });
  };
  const remove = (item) => {
    queue.current = queue.current.filter((job) => job.id !== item.id);
    if (activeRequest.current?.id === item.id)
      activeRequest.current.controller.abort();
    release(item.originalUrl);
    release(item.resultUrl);
    count.current--;
    totalBytes.current -= item.file.size;
    setItems((previous) => previous.filter((job) => job.id !== item.id));
  };
  const retry = (item) => {
    update(item.id, { status: "queued", error: null });
    queue.current.push(item);
    processQueue();
  };
  const clear = () => {
    activeRequest.current?.controller.abort();
    queue.current = [];
    items.forEach((item) => {
      release(item.originalUrl);
      release(item.resultUrl);
    });
    count.current = 0;
    totalBytes.current = 0;
    setItems([]);
    setSelected(null);
    setMessage("");
  };
  const sample = async (file) => {
    setSampleLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/images/${file}`);
      if (!response.ok)
        throw new Error("Sample could not be loaded. Try uploading an image.");
      const blob = await response.blob();
      addFiles([new File([blob], file, { type: blob.type })]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSampleLoading(false);
    }
  };
  const download = async (all = false) => {
    setExporting(true);
    setMessage("");
    try {
      if (all) {
        const { zipSync } = await import("fflate");
        const files = {};
        let bytes = 0;
        for (const [index, item] of done.entries()) {
          const { blob } = await renderImage(item.resultUrl, item.settings);
          bytes += blob.size;
          if (bytes > 250 * 1024 * 1024)
            throw new Error(
              "This ZIP is too large for the browser. Download the images individually.",
            );
          files[outputName(item.file.name, item.settings.format, index)] =
            new Uint8Array(await blob.arrayBuffer());
        }
        saveBlob(
          new Blob([zipSync(files, { level: 0 })], { type: "application/zip" }),
          "bgzero-images.zip",
        );
      } else if (active?.resultUrl) {
        const { blob } = await renderImage(active.resultUrl, active.settings);
        saveBlob(blob, outputName(active.file.name, active.settings.format));
      }
    } catch (error) {
      setMessage(error.message || "Export failed. Try a smaller canvas size.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section
      id="studio"
      className={`studio ${dragging ? "is-dragging" : ""}`}
      aria-label="Background removal studio"
      onDragOver={(event) => {
        event.preventDefault();
        if (event.dataTransfer.types.includes("Files")) setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        addFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={input}
        id="image-upload"
        aria-label="Choose images for background removal"
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        tabIndex={-1}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="studio-topline">
        <span>
          <span className="tiny-mark" /> The background removal studio
        </span>
        <span className={`connection ${connection}`} role="status">
          <i />
          {connection === "ready"
            ? "Ready to create"
            : connection === "checking"
              ? "Connecting to studio…"
              : connection === "unconfigured"
                ? "Service not configured"
                : "Service unavailable"}
          {connection === "offline" && (
            <button onClick={() => checkConnection()}>Reconnect</button>
          )}
        </span>
      </div>
      {message && (
        <div className="notice" role="alert">
          <span>{message}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <div className={`studio-grid ${active ? "has-images" : ""}`}>
        <div className="studio-visual">
          {!active ? (
            <>
              <Compare
                original="/images/plant.jpg"
                result="/images/plant-cutout.png"
                label="Potted succulent sample"
                background={demoBackground}
              />
              <div className="demo-bottom">
                <span>
                  A little less background.
                  <br />
                  <strong>A lot more possibility.</strong>
                </span>
                <div className="swatches" aria-label="Preview background">
                  {colors.slice(0, 5).map((color, index) => (
                    <button
                      key={color}
                      className={`swatch ${color === "transparent" ? "checker" : ""} ${demoBackground === color ? "selected" : ""}`}
                      style={{
                        backgroundColor:
                          color === "transparent" ? undefined : color,
                      }}
                      aria-label={`Preview ${colorNames[index].toLowerCase()} background`}
                      aria-pressed={demoBackground === color}
                      onClick={() => setDemoBackground(color)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="canvas-toolbar">
                <span className="filename" title={active.file.name}>
                  {active.file.name}
                </span>
                <div className="segmented" aria-label="Preview mode">
                  {["result", "compare", "original"].map((value) => (
                    <button
                      key={value}
                      aria-pressed={view === value}
                      onClick={() => setView(value)}
                    >
                      {value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="editor-canvas checker"
                aria-busy={active.status === "processing"}
              >
                {active.status === "done" ? (
                  view === "compare" ? (
                    <Compare
                      original={active.originalUrl}
                      result={active.resultUrl}
                      label={active.file.name}
                    />
                  ) : (
                    <img
                      className="result-image"
                      src={
                        view === "original"
                          ? active.originalUrl
                          : preview || active.resultUrl
                      }
                      alt={
                        view === "original"
                          ? `Original ${active.file.name}`
                          : `Edited ${active.file.name}`
                      }
                    />
                  )
                ) : (
                  <>
                    <img
                      className="pending-image"
                      src={active.originalUrl}
                      alt={`Uploaded ${active.file.name}`}
                    />
                    <div className="processing-overlay" role="status">
                      {active.status === "error" ? (
                        <>
                          <Icon name="image" size={28} />
                          <strong>Let’s try that again</strong>
                          <p>{active.error}</p>
                          <button
                            className="button small"
                            onClick={() => retry(active)}
                          >
                            Retry image <Icon name="reset" size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="processing-mark">
                            <Icon name="spark" size={32} />
                          </span>
                          <strong>
                            {active.status === "queued"
                              ? "Your image is in the queue"
                              : "Finding the edges…"}
                          </strong>
                          <p>
                            {active.status === "queued"
                              ? "We process one image at a time."
                              : "The first image may take longer while the service wakes up."}
                          </p>
                          <button
                            className="text-button"
                            onClick={() => remove(active)}
                          >
                            Cancel image
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="canvas-bottom">
                <span>
                  {active.width
                    ? `${active.width} × ${active.height} px`
                    : `${(active.file.size / 1024 / 1024).toFixed(1)} MB`}
                  <span className="dot-separator">·</span>
                  {active.status === "done"
                    ? view === "compare"
                      ? "Original cutout comparison"
                      : settings.size === "original"
                        ? "Original canvas"
                        : presets[settings.size].label
                    : active.status}
                </span>
                <button
                  className="text-button"
                  disabled={exporting}
                  onClick={() => remove(active)}
                >
                  Remove image
                </button>
              </div>
            </>
          )}
        </div>
        {!active ? (
          <div className={`upload-panel ${dragging ? "is-dragging" : ""}`}>
            <div className="upload-art">
              <span className="upload-art-back" />
              <span className="upload-art-front">
                <Icon name="image" size={34} />
                <i>
                  <Icon name="plus" size={14} />
                </i>
              </span>
            </div>
            <h2>A fresh start for any image.</h2>
            <p>
              Drop your images here. <br />
              We’ll take care of the background.
            </p>
            <button
              className="button upload-button"
              onClick={() => input.current?.click()}
            >
              <Icon name="upload" /> Upload images{" "}
              <Icon name="arrow" size={18} />
            </button>
            <span className="upload-hint">
              or paste an image with <kbd>⌘ / Ctrl</kbd> + <kbd>V</kbd>
            </span>
            <span className="file-hint">PNG, JPG, WebP · Up to 50 MB each</span>
            <div className="sample-picker">
              <span>
                No image?
                <br />
                <strong>Try one of ours</strong>
              </span>
              <div>
                {samples.map((item) => (
                  <button
                    key={item.file}
                    aria-label={`Try ${item.name.toLowerCase()} sample`}
                    disabled={sampleLoading}
                    onClick={() => sample(item.file)}
                  >
                    <img
                      src={`/images/${item.file}`}
                      alt={item.name}
                      width="48"
                      height="48"
                    />
                  </button>
                ))}
              </div>
            </div>
            <p className="privacy-note">
              Images are sent to our processing service.{" "}
              <a href="/privacy">How we handle your images</a>
            </p>
          </div>
        ) : (
          <aside className="edit-panel" aria-label="Image settings">
            <div className="panel-heading">
              <h2>Make it yours</h2>
              <button
                className="icon-button"
                title="Reset image settings"
                aria-label="Reset image settings"
                onClick={() =>
                  update(active.id, { settings: { ...defaultSettings } })
                }
              >
                <Icon name="reset" size={17} />
              </button>
            </div>
            <fieldset disabled={active.status !== "done" || exporting}>
              <legend className="visually-hidden">Export settings</legend>
              <label className="control-label">
                Background{" "}
                <span>
                  {settings.background === "transparent"
                    ? "Transparent"
                    : settings.background.toUpperCase()}
                </span>
              </label>
              <div className="swatches edit-swatches">
                {colors.map((color, index) => (
                  <button
                    key={color}
                    className={`swatch ${color === "transparent" ? "checker" : ""} ${settings.background === color ? "selected" : ""}`}
                    style={{
                      backgroundColor:
                        color === "transparent" ? undefined : color,
                    }}
                    aria-label={`${colorNames[index]} background`}
                    aria-pressed={settings.background === color}
                    onClick={() => setSetting("background", color)}
                  />
                ))}
                <label className="custom-color" title="Custom background color">
                  <Icon name="plus" size={16} />
                  <input
                    type="color"
                    aria-label="Custom background color"
                    value={
                      settings.background === "transparent"
                        ? "#f3dfce"
                        : settings.background
                    }
                    onChange={(event) =>
                      setSetting("background", event.target.value)
                    }
                  />
                </label>
              </div>
              <label className="control-label" htmlFor="canvas-size">
                Canvas size
              </label>
              <select
                id="canvas-size"
                value={settings.size}
                onChange={(event) => setSetting("size", event.target.value)}
              >
                {Object.entries(presets).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <label className="control-label" htmlFor="subject-scale">
                Image scale <span>{settings.scale}%</span>
              </label>
              <input
                id="subject-scale"
                type="range"
                min="40"
                max="100"
                step="1"
                value={settings.scale}
                onChange={(event) =>
                  setSetting("scale", Number(event.target.value))
                }
              />
              <label className="checkbox-row">
                <span>Soft shadow</span>
                <input
                  type="checkbox"
                  checked={settings.shadow}
                  onChange={(event) =>
                    setSetting("shadow", event.target.checked)
                  }
                />
              </label>
              <label className="control-label">Export format</label>
              <div
                className="segmented format-options"
                aria-label="Export format"
              >
                {["png", "webp", "jpg"].map((format) => (
                  <button
                    key={format}
                    aria-pressed={settings.format === format}
                    onClick={() => setSetting("format", format)}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
              {settings.format === "jpg" &&
                settings.background === "transparent" && (
                  <p className="control-note">
                    JPG uses a white background. Choose PNG or WebP to keep
                    transparency.
                  </p>
                )}
              {settings.format !== "png" && (
                <>
                  <label className="control-label" htmlFor="export-quality">
                    Export quality <span>{settings.quality}%</span>
                  </label>
                  <input
                    id="export-quality"
                    type="range"
                    min="50"
                    max="100"
                    value={settings.quality}
                    onChange={(event) =>
                      setSetting("quality", Number(event.target.value))
                    }
                  />
                </>
              )}
            </fieldset>
            <button
              className="button download-button"
              disabled={active.status !== "done" || exporting}
              onClick={() => download()}
            >
              <Icon name="download" size={18} />
              {exporting
                ? "Preparing download…"
                : `Download ${settings.format.toUpperCase()}`}
            </button>
            <span className="export-note">
              No watermark. Your image, ready to go.
            </span>
          </aside>
        )}
      </div>
      <div className="studio-footer">
        <div className="mode-picker">
          <Icon name="sliders" size={16} />
          <label htmlFor="processing-mode">Processing</label>
          <select
            id="processing-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option value="fast">Fast</option>
            <option value="quality">Quality</option>
            <option value="ultra">Ultra</option>
            <option value="matting">Matting</option>
          </select>
          <span>Applies to new uploads</span>
        </div>
        <span>
          <Icon name="layers" size={15} />{" "}
          {items.length
            ? `${done.length} ready${pending ? ` · ${pending} in progress` : ""}`
            : "One image or a whole batch"}
        </span>
      </div>
      {!!items.length && (
        <div className="workspace-tray">
          <div className="tray-heading">
            <span>
              Your workspace <b>{items.length}</b>
            </span>
            <div>
              <button
                className="text-button"
                onClick={clear}
                disabled={exporting}
              >
                Clear all
              </button>
              {done.length > 1 && (
                <button
                  className="button small secondary"
                  disabled={exporting}
                  onClick={() => download(true)}
                >
                  <Icon name="download" size={16} />
                  Download all ({done.length}) · ZIP
                </button>
              )}
            </div>
          </div>
          <div className="filmstrip">
            {items.map((item) => (
              <button
                key={item.id}
                className={`filmstrip-item ${active?.id === item.id ? "selected" : ""}`}
                aria-label={`Select ${item.file.name}, ${item.status}`}
                aria-pressed={active?.id === item.id}
                onClick={() => {
                  setSelected(item.id);
                  setView("result");
                }}
              >
                <img
                  src={item.resultUrl || item.originalUrl}
                  alt={item.file.name}
                />
                <span className={`item-state ${item.status}`}>
                  {item.status === "done" ? (
                    <Icon name="check" size={12} />
                  ) : item.status === "error" ? (
                    "!"
                  ) : (
                    "…"
                  )}
                </span>
              </button>
            ))}
            <button
              className="add-image"
              onClick={() => input.current?.click()}
            >
              <Icon name="plus" size={22} />
              <span>Add images</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
