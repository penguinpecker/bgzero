import sharp from "sharp";
import { readFile } from "node:fs/promises";
const root = new URL("../public/images/", import.meta.url);
const jobs = [
  ...["plant", "sneaker", "portrait"].flatMap((name) => [
    {
      source: `${name}.jpg`,
      target: `${name}-thumb.webp`,
      width: 128,
      quality: 82,
    },
    {
      source: `${name}.jpg`,
      target: `${name}-display.webp`,
      width: 900,
      quality: 88,
    },
  ]),
  {
    source: "plant-cutout.png",
    target: "plant-cutout-display.webp",
    width: 1000,
    quality: 90,
  },
];
await Promise.all(
  jobs.map(async (job) => {
    const input = new URL(job.source, root),
      output = new URL(job.target, root);
    await sharp(await readFile(input))
      .rotate()
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: job.quality, alphaQuality: 100 })
      .toFile(output.pathname);
  }),
);
console.log(
  "Optimized sample thumbnails and display images; upload originals are unchanged.",
);
