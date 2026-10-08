import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";

const origin = (
  process.env.SITE_URL || "https://bgzero-rho.vercel.app"
).replace(/\/$/, "");
if (new URL(origin).protocol !== "https:")
  throw new Error("SITE_URL must use https");
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const { articles } = await server.ssrLoadModule("/src/content/articles.js");
  const { policies } = await server.ssrLoadModule("/src/content/policies.js");
  const template = (await readFile("dist/index.html", "utf8")).replace(
    /<title>.*?<\/title>/,
    "",
  );
  const pages = [
    {
      route: "/",
      title: "Free Background Remover & Image Studio | BGZERO",
      description:
        "Remove image backgrounds with BGZERO. Create transparent PNGs, change colors, resize your canvas, and download batches. No sign-up or watermarks.",
    },
    {
      route: "/blog",
      title: "Background Removal Guides & Image Editing Tips | BGZERO",
      description:
        "Ten practical guides to transparent PNGs, product photos, background colors, batch editing, hair edges, profile pictures, and image SEO.",
    },
    {
      route: "/about",
      title: "About BGZERO | A Simpler Image Workflow",
      description:
        "Learn about BGZERO’s background removal studio, image editing workflow, public source code, and practical image guides.",
    },
    ...Object.entries(policies).map(([slug, policy]) => ({
      route: `/${slug}`,
      title: `${policy.title} | BGZERO`,
      description: policy.description,
    })),
    ...articles.map((article) => ({
      route: `/blog/${article.slug}`,
      title: `${article.title} | BGZERO`,
      description: article.description,
      article,
    })),
    {
      route: "/404",
      title: "Page not found | BGZERO",
      description:
        "This page could not be found. Return to the background removal studio or browse the BGZERO journal.",
      noindex: true,
    },
  ];
  for (const page of pages) {
    const url = origin + (page.route === "/" ? "/" : page.route);
    const organization = {
      "@type": "Organization",
      name: "BGZERO",
      url: `${origin}/`,
      logo: `${origin}/favicon.svg`,
    };
    const graph = page.article
      ? [
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: page.article.title,
            description: page.description,
            mainEntityOfPage: url,
            datePublished: `${page.article.date}T00:00:00+05:30`,
            dateModified: `${page.article.date}T00:00:00+05:30`,
            author: { ...organization, url: `${origin}/about` },
            publisher: organization,
            articleSection: page.article.category,
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${origin}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Journal",
                item: `${origin}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: page.article.title,
                item: url,
              },
            ],
          },
        ]
      : page.route === "/"
        ? [
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "BGZERO",
              url,
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web browser",
              description: page.description,
              featureList: [
                "Background removal",
                "Transparent PNG export",
                "Background colors",
                "Canvas presets",
                "Batch ZIP download",
              ],
              publisher: organization,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "BGZERO",
              url,
              publisher: organization,
            },
          ]
        : [];
    const metadata = `<title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}" />
    <meta name="robots" content="${page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />
    <link rel="canonical" href="${escape(url)}" />
    <meta property="og:type" content="${page.article ? "article" : "website"}" />
    <meta property="og:site_name" content="BGZERO" />
    <meta property="og:title" content="${escape(page.title)}" />
    <meta property="og:description" content="${escape(page.description)}" />
    <meta property="og:url" content="${escape(url)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escape(page.title)}" />
    <meta name="twitter:description" content="${escape(page.description)}" />
    ${page.article ? `<meta property="article:published_time" content="${page.article.date}T00:00:00+05:30" />` : ""}
    ${graph.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`).join("\n")}`;
    const html = template
      .replace("<!--page-meta-->", metadata)
      .replace(
        "<!--app-html-->",
        renderToString(React.createElement(App, { path: page.route })),
      );
    const file = path.join(
      "dist",
      page.route === "/" ? "index.html" : `${page.route.slice(1)}.html`,
    );
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
      .filter((page) => !page.noindex)
      .map(
        (page) =>
          `  <url><loc>${escape(origin + (page.route === "/" ? "/" : page.route))}</loc>${page.article ? `<lastmod>${page.article.date}</lastmod>` : ""}</url>`,
      )
      .join("\n")}\n</urlset>\n`,
  );
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  );
  console.log(
    `Prerendered ${pages.length} complete HTML pages, sitemap.xml, and robots.txt.`,
  );
} finally {
  await server.close();
}
