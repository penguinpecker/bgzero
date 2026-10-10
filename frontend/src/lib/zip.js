export function zipFiles(files) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/zip.worker.js", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = ({ data }) => {
      worker.terminate();
      if (data.error) reject(new Error(data.error));
      else resolve(new Blob([data.archive], { type: "application/zip" }));
    };
    worker.onerror = () => {
      worker.terminate();
      reject(
        new Error(
          "Could not prepare the ZIP. Retry or download the images individually.",
        ),
      );
    };
    worker.postMessage(
      files,
      Object.values(files).map((file) => file.buffer),
    );
  });
}
