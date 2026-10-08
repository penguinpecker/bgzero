import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { articles } from "../src/content/articles.js";
const origin = (
  process.env.SITE_URL || "https://rmvbackground.vercel.app"
).replace(/\/$/, "");
const paths = await readdir("dist", { recursive: true });
const htmlPaths = paths.filter((file) => file.endsWith(".html"));
assert.equal(articles.length, 10);
assert.equal(htmlPaths.length, 17);
const slugs = new Set(articles.map((article) => article.slug));
assert.equal(slugs.size, 10);
const titles = new Set();
const descriptions = new Set();
for (const file of htmlPaths) {
  const html = await readFile(path.join("dist", file), "utf8");
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `Unique title: ${file}`);
  titles.add(title);
  const route = file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`;
  assert.ok(
    html.includes(`<link rel="canonical" href="${origin}${route}"`),
    `Canonical URL: ${file}`,
  );
  assert.ok(title.includes("rmvbackground"), `Current brand in title: ${file}`);
  assert.ok(!html.includes("BGZERO"), `No previous brand copy: ${file}`);
  const meta = (attribute, name) => {
    const matches = [
      ...html.matchAll(
        new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`, "g"),
      ),
    ];
    assert.equal(matches.length, 1, `One ${name} tag: ${file}`);
    assert.ok(matches[0][1].trim(), `Nonempty ${name}: ${file}`);
    return matches[0][1];
  };
  assert.equal((html.match(/<title>/g) || []).length, 1, `One title: ${file}`);
  const description = meta("name", "description");
  assert.ok(!descriptions.has(description), `Unique description: ${file}`);
  descriptions.add(description);
  assert.equal(meta("property", "og:title"), title, `Social title: ${file}`);
  assert.equal(
    meta("property", "og:description"),
    description,
    `Social description: ${file}`,
  );
  assert.equal(meta("name", "twitter:title"), title, `X title: ${file}`);
  assert.equal(
    meta("name", "twitter:description"),
    description,
    `X description: ${file}`,
  );
  const socialImage = meta("property", "og:image");
  assert.equal(
    meta("name", "twitter:image"),
    socialImage,
    `Shared preview image: ${file}`,
  );
  assert.ok(
    socialImage.startsWith(`${origin}/`),
    `Absolute preview URL: ${file}`,
  );
  assert.ok(
    paths.includes(new URL(socialImage).pathname.slice(1)),
    `Existing preview image: ${file}`,
  );
  meta("property", "og:image:alt");
  meta("name", "twitter:image:alt");
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `One h1: ${file}`);
  assert.ok(!html.includes("<!--app-html-->"), `Rendered HTML: ${file}`);
  assert.equal(
    /<script type="module"/.test(html),
    ["index.html", "blog.html"].includes(file),
    `Only interactive pages load JavaScript: ${file}`,
  );
  for (const match of html.matchAll(/src="(\/images\/[^" ]+)"/g)) {
    assert.ok(
      paths.includes(match[1].slice(1)),
      `Missing display asset in ${file}: ${match[1]}`,
    );
  }
  for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const href = match[1];
    const target =
      href === "/"
        ? "index.html"
        : /\.[a-z0-9]+$/.test(href)
          ? href.slice(1)
          : `${href.slice(1)}.html`;
    assert.ok(paths.includes(target), `Broken link in ${file}: ${href}`);
  }
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  ))
    JSON.parse(match[1]);
}
for (const article of articles) {
  const html = await readFile(`dist/blog/${article.slug}.html`, "utf8");
  assert.match(html, /"@type":"BlogPosting"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  for (const related of article.related)
    assert.ok(slugs.has(related), `Related article ${related}`);
  assert.ok(article.sources.length > 0);
  const words = [
    article.intro,
    article.takeaway,
    ...article.sections.flatMap((section) => [
      ...(section.paragraphs || []),
      ...(section.list || []),
    ]),
  ]
    .join(" ")
    .split(/\s+/).length;
  assert.ok(words >= 350, `${article.slug}: complete practical guide`);
}
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, 16);
assert.ok(!sitemap.includes("/404"));
assert.match(await readFile("dist/404.html", "utf8"), /noindex, follow/);
console.log(
  "PASS: 17 rendered pages; 10 substantive guides; unique metadata; matching social tags and preview images; structured data; all internal links; 16 sitemap URLs; noindexed 404.",
);
