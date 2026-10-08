import { zipSync } from "fflate";

self.onmessage = ({ data }) => {
  try {
    // Images are already compressed. Storing them avoids wasted compression work.
    const archive = zipSync(data, { level: 0 });
    self.postMessage({ archive }, [archive.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || "Could not create the ZIP." });
  }
};
