// Run after `npm run build` with Vite preview listening on port 4199.
// Uploads four files together to the real backend and inspects each ZIP entry.
await page.open("http://127.0.0.1:4199/");
await page.wait(".connection.ready", 45000);
console.log(
  await page.eval(async () => {
    window.__batchResults = [];
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (url, options) => {
      const start = performance.now();
      const response = await originalFetch(url, options);
      if (String(url).endsWith("/remove") && response.ok) {
        const bytes = await response.clone().arrayBuffer();
        const original = await createImageBitmap(options.body.get("file"));
        window.__batchResults.push({
          hash: Array.from(
            new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
          ).join(","),
          width: original.width,
          height: original.height,
          elapsedMs: Math.round(performance.now() - start),
          processingMs: response.headers.get("X-Processing-Time-Ms"),
        });
        original.close();
      }
      return response;
    };
    const files = await Promise.all(
      ["plant", "sneaker", "portrait", "plant"].map(
        async (name) =>
          new File(
            [await (await originalFetch(`/images/${name}.jpg`)).blob()],
            `${name}.jpg`,
            { type: "image/jpeg" },
          ),
      ),
    );
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    const input = document.querySelector("#image-upload");
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    window.__batchStart = performance.now();
    return "Uploaded four images in one file-selection event, including duplicate filenames.";
  }),
);
await page.wait(".filmstrip-item:nth-child(4) .item-state.done", 60000);
console.log(
  await page.eval(() => {
    if (
      document.querySelectorAll(".item-state.done").length !== 4 ||
      window.__batchResults.length !== 4
    )
      throw new Error("Not all four files completed");
    return JSON.stringify({
      pass: "All four background removals completed",
      elapsedMs: Math.round(performance.now() - window.__batchStart),
      requests: window.__batchResults.map(({ hash, ...result }) => result),
    });
  }),
);
await page.eval(() => {
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download !== "rmvbackground-images.zip") return originalClick.call(this);
    fetch(this.href)
      .then((response) => response.blob())
      .then(async (blob) => {
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const view = new DataView(bytes.buffer),
          entries = [];
        let offset = 0;
        while (
          offset + 30 < bytes.length &&
          view.getUint32(offset, true) === 0x04034b50
        ) {
          if (view.getUint16(offset + 8, true) !== 0)
            throw new Error("Unexpected ZIP compression");
          const size = view.getUint32(offset + 18, true),
            nameLength = view.getUint16(offset + 26, true),
            extraLength = view.getUint16(offset + 28, true);
          const name = new TextDecoder().decode(
            bytes.slice(offset + 30, offset + 30 + nameLength),
          );
          const start = offset + 30 + nameLength + extraLength;
          const data = bytes.slice(start, start + size);
          const image = await createImageBitmap(
            new Blob([data], { type: "image/png" }),
          );
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const pixels = context.getImageData(
            0,
            0,
            image.width,
            image.height,
          ).data;
          let transparent = 0,
            opaque = 0;
          for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
            if (pixels[i] > 250) opaque++;
          }
          const source = window.__batchResults[entries.length];
          const hash = Array.from(
            new Uint8Array(await crypto.subtle.digest("SHA-256", data)),
          ).join(",");
          if (
            image.width !== source.width ||
            image.height !== source.height ||
            !transparent ||
            !opaque ||
            hash !== source.hash
          )
            throw new Error(
              `Invalid cutout or altered original resolution/bytes: ${name}`,
            );
          entries.push({
            name,
            width: image.width,
            height: image.height,
            bytes: size,
            transparentPixels: transparent,
            opaquePixels: opaque,
            identicalToServer: true,
          });
          image.close();
          offset = start + size;
        }
        if (
          entries.length !== 4 ||
          new Set(entries.map((x) => x.name)).size !== 4
        )
          throw new Error("Missing files or duplicate archive names");
        window.__batchArchive = {
          entries,
          bytes: blob.size,
          exportMs: Math.round(performance.now() - window.__exportStart),
        };
        document.body.dataset.batchVerified = "true";
      })
      .catch((error) => {
        window.__batchArchive = { error: error.message };
        document.body.dataset.batchVerified = "error";
      });
  };
  window.__exportStart = performance.now();
});
await page.click(".tray-heading .button");
await page.wait("body[data-batch-verified]", 30000);
console.log(await page.eval(() => JSON.stringify(window.__batchArchive)));
// Canvas edits should draw directly, without producing intermediate encoded blobs.
console.log(
  await page.eval(async () => {
    let encodes = 0;
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (...args) {
      encodes++;
      return original.apply(this, args);
    };
    document.querySelector('[aria-label="Peach background"]').click();
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    const canvas = document.querySelector("canvas.result-image");
    const corner = Array.from(
      canvas.getContext("2d").getImageData(0, 0, 1, 1).data,
    );
    HTMLCanvasElement.prototype.toBlob = original;
    if (encodes !== 0 || corner.join(",") !== "243,223,206,255")
      throw new Error(
        "Direct canvas preview failed: " + JSON.stringify({ encodes, corner }),
      );
    return "PASS: edited preview updates with no intermediate image encoding.";
  }),
);
