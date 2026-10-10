export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 50;
export const MAX_PIXELS = 40_000_000;
export const presets = {
  original: { label: "Original size" },
  square: { label: "Square · 1080 × 1080", width: 1080, height: 1080 },
  portrait: { label: "Portrait · 1080 × 1350", width: 1080, height: 1350 },
  story: { label: "Story · 1080 × 1920", width: 1080, height: 1920 },
  landscape: { label: "Landscape · 1920 × 1080", width: 1920, height: 1080 },
};
export const defaultSettings = {
  background: "transparent",
  format: "png",
  size: "original",
  scale: 100,
  shadow: false,
  quality: 92,
};
export function validateFile(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    return `${file.name}: choose a PNG, JPEG, or WebP image.`;
  if (!file.size) return `${file.name}: this file is empty.`;
  if (file.size > MAX_FILE_BYTES)
    return `${file.name}: the limit is 50 MB per image.`;
  return null;
}
export function outputName(name, format, index) {
  const stem =
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "image";
  return `${stem}-rmvbackground${index == null ? "" : `-${index + 1}`}.${format}`;
}
export function fitImage(
  sourceWidth,
  sourceHeight,
  width,
  height,
  scale = 100,
) {
  const ratio =
    (Math.min(width / sourceWidth, height / sourceHeight) * scale) / 100;
  const w = sourceWidth * ratio,
    h = sourceHeight * ratio;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "This image could not be read. Try exporting it as PNG or JPEG.",
        ),
      );
    img.src = src;
  });
}
export function drawImage(canvas, img, settings, { preview = false } = {}) {
  const preset = presets[settings.size] || presets.original;
  let width = preset.width || img.naturalWidth,
    height = preset.height || img.naturalHeight;
  if (preview) {
    const ratio = Math.min(1, 1200 / Math.max(width, height));
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error(
      "Your browser could not create the image. Close other tabs and try again.",
    );
  const background =
    settings.background === "transparent" && settings.format === "jpg"
      ? "#ffffff"
      : settings.background;
  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  const box = fitImage(
    img.naturalWidth,
    img.naturalHeight,
    width,
    height,
    settings.scale,
  );
  if (settings.shadow) {
    ctx.shadowColor = "rgba(32,28,24,0.25)";
    ctx.shadowBlur = width * 0.024;
    ctx.shadowOffsetY = height * 0.018;
  }
  ctx.drawImage(img, box.x, box.y, box.width, box.height);
  return { width, height };
}

export function isOriginalPng(settings) {
  return (
    settings.format === "png" &&
    settings.background === "transparent" &&
    settings.size === "original" &&
    settings.scale === 100 &&
    !settings.shadow
  );
}

export async function renderImage(src, settings, { signal } = {}) {
  const img = await loadImage(src);
  signal?.throwIfAborted();
  const canvas = document.createElement("canvas");
  const { width, height } = drawImage(canvas, img, settings);
  const mime = `image/${settings.format === "jpg" ? "jpeg" : settings.format}`;
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, mime, settings.quality / 100),
  );
  signal?.throwIfAborted();
  if (!blob) throw new Error("Image export failed. Try a smaller canvas size.");
  if (blob.type !== mime)
    throw new Error(
      `Your browser does not support ${settings.format.toUpperCase()} export. Choose PNG instead.`,
    );
  return { blob, width, height };
}

export async function exportImage(item) {
  // Reuse the lossless server result instead of decoding and encoding it again.
  if (item.resultBlob?.type === "image/png" && isOriginalPng(item.settings)) {
    return { blob: item.resultBlob, width: item.width, height: item.height };
  }
  return renderImage(item.resultUrl, item.settings);
}
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
