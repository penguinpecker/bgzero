// Run against the local development page with opera-browser-cli run < scripts/verify-browser.js.
// Uses the real configured service for the first upload, then tests deterministic failures.
await page.open("http://127.0.0.1:4198/");
await page.click('[aria-label="Try plant sample"]');
await page.wait(".download-button:not(:disabled)", 30000);
console.log("PASS: sample upload -> live processing service -> editable image");
await page.eval(() => {
  window.__downloads = [];
  const original = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (!this.download || !this.href.startsWith("blob:"))
      return original.call(this);
    const href = this.href,
      name = this.download;
    fetch(href)
      .then((r) => r.blob())
      .then(async (blob) => {
        const output = { name, type: blob.type, bytes: blob.size };
        if (blob.type.startsWith("image/")) {
          const image = await createImageBitmap(blob);
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          output.width = image.width;
          output.height = image.height;
          output.corner = [...context.getImageData(0, 0, 1, 1).data];
          image.close();
        } else {
          const bytes = new Uint8Array(await blob.arrayBuffer()),
            view = new DataView(bytes.buffer);
          output.entries = [];
          let offset = 0;
          while (
            offset + 30 < bytes.length &&
            view.getUint32(offset, true) === 0x04034b50
          ) {
            const size = view.getUint32(offset + 18, true),
              nameLength = view.getUint16(offset + 26, true),
              extraLength = view.getUint16(offset + 28, true);
            output.entries.push(
              new TextDecoder().decode(
                bytes.slice(offset + 30, offset + 30 + nameLength),
              ),
            );
            offset += 30 + nameLength + extraLength + size;
          }
        }
        window.__downloads.push(output);
        document.body.dataset.downloads = window.__downloads.length;
      });
  };
});
await page.click(".download-button");
await page.wait('body[data-downloads="1"]');
console.log(
  await page.eval(() => {
    const output = window.__downloads[0];
    if (
      output.type !== "image/png" ||
      output.width !== 1000 ||
      output.height !== 666 ||
      output.corner[3] !== 0
    )
      throw new Error(
        "Transparent PNG export failed: " + JSON.stringify(output),
      );
    return "PASS: transparent PNG, 1000 × 666, alpha 0 at corner";
  }),
);
await page.eval(() => {
  const select = document.querySelector("#canvas-size");
  select.value = "square";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  document.querySelectorAll(".format-options button")[2].click();
});
await page.wait(".control-note");
await page.click(".download-button");
await page.wait('body[data-downloads="2"]');
console.log(
  await page.eval(() => {
    const output = window.__downloads[1];
    if (
      output.type !== "image/jpeg" ||
      !output.name.endsWith(".jpg") ||
      output.width !== 1080 ||
      output.height !== 1080 ||
      output.corner.some((v) => v < 250)
    )
      throw new Error("Square JPG export failed: " + JSON.stringify(output));
    return "PASS: square JPG, 1080 × 1080, white background and matching filename";
  }),
);
await page.click('[aria-label="Peach background"]');
await page.eval(() =>
  document.querySelectorAll(".format-options button")[1].click(),
);
await page.click(".download-button");
await page.wait('body[data-downloads="3"]');
console.log(
  await page.eval(() => {
    const output = window.__downloads[2];
    if (
      output.type !== "image/webp" ||
      !output.name.endsWith(".webp") ||
      output.width !== 1080 ||
      output.corner[3] !== 255 ||
      Math.abs(output.corner[0] - 243) > 8 ||
      Math.abs(output.corner[1] - 223) > 8
    )
      throw new Error("Colored WebP export failed: " + JSON.stringify(output));
    return "PASS: WebP export, custom background and preserved canvas dimensions";
  }),
);
await page.eval(async () => {
  const file = new File(
    [await (await fetch("/images/plant.jpg")).blob()],
    "plant.jpg",
    { type: "image/jpeg" },
  );
  const data = new DataTransfer();
  data.items.add(file);
  const input = document.querySelector("#image-upload");
  input.files = data.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.wait(".filmstrip-item:nth-child(2) .item-state.done", 30000);
console.log(
  await page.eval(() => {
    if (
      document.querySelector("#canvas-size").value !== "original" ||
      document.querySelector(".format-options [aria-pressed=true]")
        .textContent !== "PNG"
    )
      throw new Error("New image inherited previous settings");
    document.querySelector(".filmstrip-item").click();
    return "PASS: second upload has independent default settings";
  }),
);
await page.wait(".control-label span");
console.log(
  await page.eval(() => {
    if (
      document.querySelector("#canvas-size").value !== "square" ||
      document.querySelector(".format-options [aria-pressed=true]")
        .textContent !== "WEBP"
    )
      throw new Error("First image settings were lost");
    return "PASS: previous image retains canvas, background, and format";
  }),
);
await page.click(".tray-heading .button");
await page.wait('body[data-downloads="4"]');
console.log(
  await page.eval(() => {
    const output = window.__downloads[3];
    if (
      output.type !== "application/zip" ||
      output.entries.length !== 2 ||
      !output.entries.includes("plant-rmvbackground-1.webp") ||
      !output.entries.includes("plant-rmvbackground-2.png")
    )
      throw new Error("ZIP export failed: " + JSON.stringify(output));
    return "PASS: ZIP contains two correctly named files with each image’s export format";
  }),
);
await page.eval(() => {
  const data = new DataTransfer();
  data.items.add(
    new File(["not an image"], "notes.txt", { type: "text/plain" }),
  );
  const input = document.querySelector("#image-upload");
  input.files = data.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.wait("[role=alert]");
console.log(
  await page.eval(() => {
    if (
      !document
        .querySelector("[role=alert]")
        .textContent.includes("PNG, JPEG, or WebP") ||
      document.querySelectorAll(".filmstrip-item").length !== 2
    )
      throw new Error("Unsupported file validation failed");
    return "PASS: invalid file shows inline error without entering the queue";
  }),
);
await page.eval(async () => {
  window.__originalFetch = window.fetch;
  window.fetch = (url, options) =>
    String(url).endsWith("/remove")
      ? Promise.resolve(new Response("Busy", { status: 429 }))
      : window.__originalFetch(url, options);
  const blob = await (await fetch("/images/sneaker.jpg")).blob();
  const data = new DataTransfer();
  data.items.add(new File([blob], "sneaker.jpg", { type: "image/jpeg" }));
  const input = document.querySelector("#image-upload");
  input.files = data.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.wait(".filmstrip-item:nth-child(3) .item-state.error");
console.log(
  await page.eval(() => {
    if (
      !document
        .querySelector(".processing-overlay")
        .textContent.includes("service is busy")
    )
      throw new Error("429 error message missing");
    window.fetch = window.__originalFetch;
    return "PASS: server failure produces retryable inline state";
  }),
);
await page.click(".processing-overlay .button");
await page.wait(".filmstrip-item:nth-child(3) .item-state.done", 30000);
console.log("PASS: failed image retries successfully against the live service");
await page.eval(() =>
  document.querySelector(".tray-heading .text-button").click(),
);
await page.wait(".upload-panel");
console.log(
  await page.eval(() => {
    if (
      document.querySelectorAll(".filmstrip-item").length ||
      document.querySelector("[role=alert]")
    )
      throw new Error("Clear workspace failed");
    return "PASS: clear workspace restores upload state";
  }),
);
