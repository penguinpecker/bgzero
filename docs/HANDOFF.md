# rmvbackground developer handoff

Updated October 10, 2026. The redesigned background removal tool, ten guides,
policy pages, performance improvements, and search metadata are deployed. The
application changes are pushed to a feature branch; the draft PR is still open.
The main remaining launch task is connecting `rmvbackground.com`.

## Current state

| Item | Value |
| --- | --- |
| Live site | https://rmvbackground.vercel.app |
| Repository | https://github.com/penguinpecker/bgzero |
| Local checkout | `/Users/pp/Projects/bgzero` |
| Branch | `feat/studio-and-guides` |
| Latest application commit | `c184f50274a0998b40ae72f0ea0336b221b5c4c0` |
| Draft PR | https://github.com/penguinpecker/bgzero/pull/1 |
| PR target | `main`; application changes are not merged |
| Vercel project | `rmvbackground` |
| Vercel team | `penguinpeckers-projects` |
| Project ID | `prj_1HSAggYqZah5zucQ1dyZRp3x5Z6T` |
| Production deployment | `dpl_Ee5SKByvWm3jfZ8TNZ5Rczm1UfvC` |
| Deployment URL | https://rmvbackground-5a3tzlox8-penguinpeckers-projects.vercel.app |
| Hosted processing API | https://penguinpecker--bgzero-serve.modal.run |

On October 10, the live homepage returned HTTP 200. The previous hostname,
`bgzero-rho.vercel.app`, returned a permanent 308 redirect to the new hostname,
preserving the tested article-index path and query string. This redirect lives
in the Vercel project-domain configuration, not in `frontend/vercel.json`.
The intended `rmvbackground.com` domain still did not resolve in DNS.

The public brand is **rmvbackground**. The GitHub repository and Modal API retain
their existing technical names. GitHub's repository homepage points to the new
live site. There is no need to rename backend resources to change visible copy.

## Completed work

- Enlarged the responsive studio, upload area, and upload button.
- Added drag and drop, clipboard paste, sample images, a sequential batch queue,
  progress, retry, cancel, clear, and before/after comparison.
- Added transparent and custom-color backgrounds, canvas presets, scale, soft
  shadows, PNG/JPG/WebP downloads, and batch ZIP downloads.
- Published an about page, terms, privacy, cookies, a searchable blog, ten original
  guides, related-guide links, official references, and a branded 404.
- Prerendered 17 HTML routes: 16 indexable content pages and one noindexed 404.
  Added canonical URLs, structured data, sitemap.xml, and robots.txt.
- Added unique search titles and descriptions, matching Open Graph and X copy,
  preview images, and descriptive preview-image alt text for every route.
- Reduced initial JavaScript by approximately 20% and initial demo/thumbnail
  image bytes by approximately 88% relative to the earlier implementation.
  Static article and policy pages need no application JavaScript; previews draw
  directly to canvas, unchanged PNG exports reuse server bytes, and ZIP creation
  runs in a worker. These are asset-size improvements, not measured ranking gains.

The homepage title is **Free AI Background Remover Online | rmvbackground**.
Its description is: “Remove image backgrounds for free with AI. Download
transparent PNGs, change background colors, and remove backgrounds in bulk.
No sign-up or watermarks.”

Keyword targets cover free background removal, transparent PNGs, bulk removal,
product photos, background colors, profile photos, and related workflows. Use
natural, accurate wording. No external backlinks have been acquired, outreach
has not been sent, and search rankings have not been measured. Internal links
and outbound references are already present. See [the SEO plan](SEO.md).

## Code map

| Area | File |
| --- | --- |
| Page layouts and routes | `frontend/src/App.jsx` |
| Studio, uploads, queue, controls | `frontend/src/components/Studio.jsx` |
| Preview and comparison | `frontend/src/components/ImagePreview.jsx`, `Compare.jsx` |
| Image validation and export | `frontend/src/lib/image.js` |
| ZIP creation | `frontend/src/lib/zip.js`, `frontend/src/workers/zip.worker.js` |
| Site styling | `frontend/src/index.css` |
| Ten guide articles | `frontend/src/content/articles.js` |
| Terms, privacy, cookies | `frontend/src/content/policies.js` |
| Search titles, descriptions, keyword map | `frontend/src/content/seo.js` |
| HTML, metadata, schema, sitemap generation | `frontend/scripts/prerender.mjs` |
| Asset optimization | `frontend/scripts/optimize-assets.mjs` |
| Hosted backend definition | `modal_app.py` |
| Self-hosted FastAPI backend | `backend/main.py`, `backend/engine.py` |

The keyword map is used at build time and adds no client JavaScript. Search
titles are separate from editorial article headings. The app uses React 19 and
Vite 6; it is not a Next.js project.

## Verification and local commands

The application delivery passed the build, page checks, and image tests. Browser
verification exercised the real processing service and image exports. A four-file
multiselect batch, including duplicate filenames, completed; its ZIP entries were
decoded and checked for dimensions, transparency, and matching SHA-256 hashes
against the server's original PNG responses.

After the latest metadata deployment, all 17 live routes were checked for exact
titles/descriptions, matching social tags, canonical URLs, working preview
images, and a real noindexed 404. The metadata-only change did not alter runtime
JavaScript. This handoff adds documentation only; it does not change the app.

Run from `frontend`:

```bash
npm ci
npm test
npm run build
npm run check:pages
```

Keep the existing `.env.local`; do not overwrite or commit it. On a fresh checkout,
use `.env.example` as a template and set `VITE_API_URL` to the intended backend.
Production already has its hosted API configured in Vercel. `SITE_URL` is read
by the prerender script from the build process environment and defaults to
`https://rmvbackground.vercel.app`.

For the browser flow, start `npm run dev -- --host 127.0.0.1 --port 4198`, then run
`opera-browser-cli run < scripts/verify-browser.js` in another terminal.
For the full batch test, build first, start
`npm run preview -- --host 127.0.0.1 --port 4199`, then run
`opera-browser-cli run < scripts/verify-batch.js`.
These scripts call the real backend and inspect intercepted browser downloads.

## Deployment workflow

The checkout is already linked through `frontend/.vercel/project.json`. Vercel
CLI authentication worked during delivery. A connector returned 403 for this
team, so deployment used the authenticated CLI successfully.

Run from `frontend` after the checks pass:

```bash
vercel deploy --prod --skip-domain --yes --scope penguinpeckers-projects
```

Inspect the returned deployment before promoting it. For protected deployments,
use the authenticated request helper, replacing `DEPLOYMENT_URL`:

```bash
vercel curl / --deployment DEPLOYMENT_URL -- --silent --output /tmp/rmvbackground-check.html --write-out '%{http_code}'
```

Do not put `--scope` after `vercel curl`; this CLI version forwards it to curl.
Once verification succeeds, promote the same deployment:

```bash
vercel promote DEPLOYMENT_URL --yes --scope penguinpeckers-projects
```

Verify the public homepage, one article, sitemap, 404, and old-host redirect after
promotion. Application changes are already published from the feature branch;
merging the PR and deploying are separate actions.

## Remaining launch work

1. Connect the owned `rmvbackground.com` domain to the existing Vercel project,
   apply the DNS records Vercel provides, and verify HTTPS and content routes.
2. Set production `SITE_URL=https://rmvbackground.com` and rebuild only after the
   domain serves the site. This updates canonicals, social URLs, structured data,
   robots.txt, and the sitemap together. Update public README and GitHub homepage
   links to the custom domain at the same time.
3. Redirect previous public hosts to the new domain while preserving paths and
   query strings; avoid redirect loops. Recheck all generated URLs after launch.
4. Verify the site in Google Search Console, submit the appropriate sitemap, and
   begin measuring indexing, impressions, clicks, and relevant queries.
5. Review the draft PR and merge when ready. Add the operator's business identity
   and preferred private contact to the policies when available.

The frontend workspace allows up to 50 images, 50 MB per file, 150 MB total input,
and 40 megapixels per image, with further dimension and export-size checks.
Batch processing is sequential. Images are sent to the hosted processor;
background removal is not entirely local. Quality, Ultra, and Matting currently
share the hosted backend's refinement path, unlike the self-hosted implementation.
There are no application analytics tags or cookies, and model licenses remain
separate from free access to the interface.
