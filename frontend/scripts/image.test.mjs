import test from "node:test";
import assert from "node:assert/strict";
import {
  validateFile,
  fitImage,
  outputName,
  MAX_FILE_BYTES,
} from "../src/lib/image.js";

test("input limits reject unsupported, empty, and oversized files", () => {
  assert.equal(
    validateFile({ name: "photo.jpg", type: "image/jpeg", size: 2048 }),
    null,
  );
  assert.match(
    validateFile({ name: "photo.gif", type: "image/gif", size: 100 }),
    /PNG, JPEG, or WebP/,
  );
  assert.match(
    validateFile({ name: "empty.png", type: "image/png", size: 0 }),
    /empty/,
  );
  assert.match(
    validateFile({
      name: "large.png",
      type: "image/png",
      size: MAX_FILE_BYTES + 1,
    }),
    /50 MB/,
  );
});
test("canvas fitting preserves aspect ratio and centers landscape and portrait images", () => {
  assert.deepEqual(fitImage(1200, 600, 1080, 1080), {
    x: 0,
    y: 270,
    width: 1080,
    height: 540,
  });
  assert.deepEqual(fitImage(600, 1200, 1080, 1080), {
    x: 270,
    y: 0,
    width: 540,
    height: 1080,
  });
  assert.deepEqual(fitImage(1000, 1000, 1080, 1920, 50), {
    x: 270,
    y: 690,
    width: 540,
    height: 540,
  });
});
test("exports use the requested format and make duplicate archive names distinct", () => {
  assert.equal(outputName("product.jpg", "webp"), "product-bgzero.webp");
  assert.notEqual(
    outputName("product.jpg", "png", 0),
    outputName("product.jpg", "png", 1),
  );
  assert.equal(outputName("../../photo.png", "jpg", 0), "photo-bgzero-1.jpg");
});
