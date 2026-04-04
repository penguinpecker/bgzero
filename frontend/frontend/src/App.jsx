import { useState, useRef, useCallback, useEffect } from "react";

const A = import.meta.env.VITE_API_URL || "http://localhost:8420";
const fB = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

function Drop({ onFiles, disabled, count }) {
  const [d, setD] = useState(false);
  const r = useRef(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setD(true); }}
      onDragLeave={() => setD(false)}
      onDrop={(e) => { e.preventDefault(); setD(false); if (!disabled) { const f = [...e.dataTransfer.files].filter((f) => f.type.startsWith("image/")); if (f.length) onFiles(f); } }}
      onClick={() => !disabled && r.current?.click()}
      style={{ border: "2px dashed " + (d ? "#fff" : "#333"), borderRadius: 16, minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", transition: "all .3s", background: d ? "rgba(255,255,255,.05)" : "transparent", position: "relative" }}
    >
      <input ref={r} type="file" accept="image/*" multiple onChange={(e) => { const f = [...(e.target.files || [])]; if (f.length) onFiles(f); e.target.value = ""; }} style={{ display: "none" }} />
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Drop images here or click to upload</p>
      <p style={{ color: "rgba(255,255,255,.25)", fontSize: 12 }}>PNG, JPEG, WebP</p>
      {count > 0 && <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.4)", fontSize: 11, padding: "2px 10px", borderRadius: 99 }}>{count} queued</span>}
    </div>
  );
}

function BA({ original, result }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const drag = useRef(false);
  const mv = useCallback((cx) => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setPos(Math.max(2, Math.min(98, ((cx - r.left) / r.width) * 100))); }, []);
  useEffect(() => {
    const m = (e) => { if (!drag.current) return; mv(e.touches ? e.touches[0].clientX : e.clientX); };
    const u = () => { drag.current = false; };
    window.addEventListener("mousemove", m); window.addEventListener("touchmove", m); window.addEventListener("mouseup", u); window.addEventListener("touchend", u);
    return () => { window.removeEventListener("mousemove", m); window.removeEventListener("touchmove", m); window.removeEventListener("mouseup", u); window.removeEventListener("touchend", u); };
  }, [mv]);
  return (
    <div ref={ref} style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "repeating-conic-gradient(#333 0% 25%,#222 0% 50%) 0 0/20px 20px", userSelect: "none" }}>
      <img src={original} style={{ width: "100%", display: "block" }} draggable={false} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: pos + "%" }}>
        <img src={result} style={{ width: ref.current?.offsetWidth || "100%", display: "block" }} draggable={false} />
      </div>
      <div onMouseDown={() => { drag.current = true; }} onTouchStart={() => { drag.current = true; }} style={{ position: "absolute", top: 0, bottom: 0, left: pos + "%", width: 2, background: "#fff", cursor: "ew-resize", zIndex: 10 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: 99, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.4)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 2L1 7L4 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 2L13 7L10 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.6)", color: "rgba(255,255,255,.7)", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Result</span>
      <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", color: "rgba(255,255,255,.7)", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Original</span>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("quality");
  const [fmt, setFmt] = useState("png");
  const [bg, setBg] = useState("transparent");
  const [conn, setConn] = useState(null);
  const proc = useRef(false);
  const q = useRef([]);
  const idC = useRef(0);

  useEffect(() => { fetch(A + "/health").then((r) => r.json()).then((d) => setConn(d)).catch(() => setConn(false)); }, []);

  const upd = (id, u) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...u } : i)));

  const next = useCallback(async () => {
    if (proc.current || !q.current.length) return;
    proc.current = true;
    const id = q.current.shift();
    let file;
    setItems((p) => { file = p.find((i) => i.id === id)?.file; return p.map((i) => (i.id === id ? { ...i, status: "processing" } : i)); });
    await new Promise((r) => setTimeout(r, 50));
    if (!file) { proc.current = false; next(); return; }
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      fd.append("format", fmt);
      fd.append("bg_color", bg === "transparent" ? "none" : bg.replace("#", ""));
      const t = performance.now();
      const res = await fetch(A + "/remove", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "HTTP " + res.status);
      const blob = await res.blob();
      upd(id, { status: "done", resultUrl: URL.createObjectURL(blob), timeMs: performance.now() - t, serverMs: res.headers.get("X-Processing-Time-Ms") });
    } catch (e) { upd(id, { status: "error", error: e.message }); }
    proc.current = false;
    next();
  }, [mode, fmt, bg]);

  const addFiles = useCallback((files) => {
    const nw = files.map((f) => ({ id: ++idC.current, file: f, originalUrl: URL.createObjectURL(f), status: "queued", resultUrl: null, timeMs: null, error: null }));
    setItems((p) => [...nw, ...p]);
    nw.forEach((i) => q.current.push(i.id));
    next();
  }, [next]);

  const dl = (i) => { if (!i.resultUrl) return; const a = document.createElement("a"); a.href = i.resultUrl; a.download = i.file.name.replace(/\.[^.]+$/, "") + "_nobg." + fmt; a.click(); };
  const retry = (id) => { upd(id, { status: "queued", error: null }); q.current.push(id); next(); };
  const act = items.filter((i) => i.status === "processing" || i.status === "queued").length;
  const done = items.filter((i) => i.status === "done").length;
  const bs = (on, extra = {}) => ({ ...extra, padding: "6px 14px", fontSize: 12, borderRadius: 8, border: "none", cursor: "pointer", transition: "all .2s", background: on ? "#fff" : "transparent", color: on ? "#000" : "rgba(255,255,255,.4)", fontWeight: on ? 500 : 400 });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#0a0a0a,#111 40%,#0d0d0d)", color: "#fff", fontFamily: "system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, fontFamily: "DM Sans" }}>
            BG<span style={{ color: "rgba(255,255,255,.25)", fontWeight: 300 }}>ZERO</span>
          </h1>
          {conn === false ? <span style={{ fontSize: 10, background: "rgba(239,68,68,.15)", color: "#f87171", padding: "2px 8px", borderRadius: 99, fontFamily: "JetBrains Mono" }}>OFFLINE</span>
            : conn ? <span style={{ fontSize: 10, background: "rgba(16,185,129,.15)", color: "#34d399", padding: "2px 8px", borderRadius: 99, fontFamily: "JetBrains Mono" }}>{String(conn.device).toUpperCase()}</span>
              : <span style={{ fontSize: 10, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.3)", padding: "2px 8px", borderRadius: 99, fontFamily: "JetBrains Mono" }}>...</span>}
        </div>
        <p style={{ color: "rgba(255,255,255,.25)", fontSize: 13, margin: "0 0 24px", fontFamily: "DM Sans" }}>Background removal on your hardware. No limits.</p>

        {/* Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Mode</div>
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 2 }}>
              {["fast", "quality", "ultra", "matting"].map((m) => <button key={m} onClick={() => setMode(m)} style={bs(mode === m)}>{m[0].toUpperCase() + m.slice(1)}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Format</div>
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 2 }}>
              {["png", "webp", "jpg"].map((f) => <button key={f} onClick={() => setFmt(f)} style={bs(fmt === f, { fontFamily: "JetBrains Mono" })}>{f.toUpperCase()}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Background</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 4 }}>
              {[{ id: "transparent", s: "conic-gradient(#666 25%,#444 25% 50%,#666 50% 75%,#444 75%)" }, { id: "#ffffff", s: "#fff" }, { id: "#000000", s: "#000" }].map((b) =>
                <button key={b.id} onClick={() => setBg(b.id)} style={{ width: 28, height: 28, borderRadius: 8, border: bg === b.id ? "2px solid #fff" : "2px solid transparent", background: b.s, cursor: "pointer", padding: 0 }} />
              )}
              <input type="color" value={bg.startsWith("#") ? bg : "#ffffff"} onChange={(e) => setBg(e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, cursor: "pointer", border: "none", padding: 0, background: "transparent" }} />
            </div>
          </div>
        </div>

        <Drop onFiles={addFiles} disabled={conn === false} count={act} />

        {done > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.04)", borderRadius: 12, padding: "10px 16px", margin: "16px 0" }}>
            <span style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>{done} done</span>
            <button onClick={() => items.filter((i) => i.status === "done").forEach((i) => setTimeout(() => dl(i), 100))} style={{ fontSize: 12, fontWeight: 500, background: "#fff", color: "#000", border: "none", padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}>Download All</button>
          </div>
        )}

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: "rgba(255,255,255,.03)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: item.status === "done" ? 12 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,.06)", flexShrink: 0 }}>
                    {item.originalUrl && <img src={item.originalUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</p>
                    <p style={{ color: "rgba(255,255,255,.25)", fontSize: 11, margin: 0, fontFamily: "JetBrains Mono" }}>{fB(item.file.size)}{item.serverMs && " \u00b7 " + Number(item.serverMs).toFixed(0) + "ms"}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", letterSpacing: .5,
                    background: item.status === "done" ? "rgba(16,185,129,.12)" : item.status === "processing" ? "rgba(234,179,8,.12)" : item.status === "error" ? "rgba(239,68,68,.12)" : "rgba(255,255,255,.05)",
                    color: item.status === "done" ? "#34d399" : item.status === "processing" ? "#facc15" : item.status === "error" ? "#f87171" : "rgba(255,255,255,.3)"
                  }}>{item.status}</span>
                  {item.status === "error" && <button onClick={() => retry(item.id)} style={{ color: "rgba(255,255,255,.4)", fontSize: 11, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Retry</button>}
                  {item.status === "done" && <button onClick={() => dl(item)} style={{ color: "rgba(255,255,255,.5)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </button>}
                </div>
              </div>
              {item.status === "done" && item.resultUrl && <BA original={item.originalUrl} result={item.resultUrl} />}
              {item.status === "error" && <p style={{ color: "rgba(239,68,68,.6)", fontSize: 12, margin: "8px 0 0" }}>{item.error}</p>}
            </div>
          ))}
        </div>

        {items.length === 0 && <p style={{ textAlign: "center", color: "rgba(255,255,255,.08)", fontSize: 12, marginTop: 40, fontFamily: "JetBrains Mono" }}>BiRefNet + Edge Refinement running locally</p>}
      </div>
    </div>
  );
}
