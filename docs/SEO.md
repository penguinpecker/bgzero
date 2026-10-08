# rmvbackground search content and link plan

The site contains ten original practical guides (approximately 400–440 words each), one blog index, an about page, and three policy pages. Articles link back to the studio, to three relevant guides, and to official resources. These are internal links and outbound citations. No external backlinks have been acquired or claimed.

## Search intent map

| Page                                    | Primary query intent                     | Supporting queries                                |
| --------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| `/`                                     | free background remover                  | remove image background, transparent image maker  |
| `/blog/remove-background-from-image`    | remove background from image free        | background removal tutorial, photo cutout         |
| `/blog/make-transparent-png`            | make transparent PNG free                | PNG with no background, transparent image         |
| `/blog/white-background-product-photos` | white background product photos          | product background remover, clean product photo   |
| `/blog/batch-background-removal`        | free batch background removal            | bulk background remover, download image batch     |
| `/blog/remove-background-hair-fur`      | remove background hair fur               | hair cutout, background removal halos             |
| `/blog/png-vs-webp-vs-jpg`              | PNG vs WebP vs JPG                       | transparent image format, PNG or WebP             |
| `/blog/change-image-background-color`   | change image background color free       | replace photo background color                    |
| `/blog/profile-picture-background`      | free profile picture background remover  | clean profile photo background                    |
| `/blog/shopify-product-image-workflow`  | Shopify product image background removal | Shopify image workflow, product photo consistency |
| `/blog/image-seo-checklist`             | image SEO checklist                      | image filenames, product photo alt text           |

These are editorial targets based on the product's capabilities, not measured search-volume or ranking claims. No paid keyword dataset or Search Console history was available.

## Implemented technical SEO

- Complete, prerendered HTML for all 16 public content routes; JavaScript hydrates only the studio and journal; individual articles and legal pages need no application JavaScript.
- Unique page titles and descriptions, canonical URLs, Open Graph and X summary metadata.
- BlogPosting and BreadcrumbList structured data for articles; WebApplication and WebSite data on the home page.
- `/sitemap.xml` and `/robots.txt`; noindexed branded 404 with a real 404 response on Vercel.
- Actual publication date for all new articles, organization byline linked to the about page, and official references.
- Locally served fonts and sample assets, responsive layouts, keyboard controls, meaningful alt text, and related-guide links.
- No fabricated testimonials, review ratings, search metrics, author credentials, or publication history.

## Earned backlinks: practical next actions

These are proposals, not submitted outreach or acquired links. External publication requires authorization and a publisher's acceptance.

1. Link the studio and relevant guides from the repository README. The prepared README contains these links; they become public when the branch is merged or viewed.
2. Offer an original before/after walkthrough to photography and ecommerce educators who already publish tutorials. Match the proposed example to their audience and disclose your relationship to rmvbackground.
3. Create a small reproducible set of licensed photos and a transparent-format comparison. Publish the files and exact settings; educators can cite a useful reference instead of a generic marketing claim.
4. Prepare a launch submission for a relevant tool directory only after checking its current submission rules and confirming that the operator wants a listing. Avoid bulk directory packages and paid ranking links.
5. Answer specific community questions with genuinely useful steps. Link a guide only if the community rules permit it and it directly answers the question; disclose that you operate the tool.

Suggested outreach draft, not sent:

> Hello — I maintain rmvbackground, a background removal tool. Your tutorial on preparing product images covers a workflow our readers also ask about. We published a practical guide with a transparent-master workflow, edge checks, and format choices: [choose the relevant guide URL]. If it would help your readers, you are welcome to cite it. I can also provide the source and exported files for a reproducible example. No reciprocal link is required.

## Measuring the outcome

After the site owner connects the property to Google Search Console, submit `https://rmvbackground.vercel.app/sitemap.xml`. Check indexing, then compare impressions, clicks, and relevant queries over a meaningful period. Update articles when the product changes or user questions reveal missing information. Publishing and linking do not guarantee indexing or higher positions.

Primary references: [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [image SEO guidance](https://developers.google.com/search/docs/appearance/google-images), and [link-spam policies](https://developers.google.com/search/docs/essentials/spam-policies#link-spam).

## rmvbackground.com launch

The public brand is **rmvbackground**. As checked on October 9, 2026, the intended
custom domain did not resolve in DNS and was not assigned to the Vercel project.
Canonical URLs, structured-data URLs, and the sitemap use
`https://rmvbackground.vercel.app` until the custom domain is live. The previous
`bgzero-rho.vercel.app` hostname redirects permanently to the same path on the
new Vercel address. This redirect is configured on the Vercel project domain
with status 308 and persists across deployments. The repository and API retain
their existing technical addresses.

1. Connect the owned domain to the existing Vercel project and configure the exact DNS records Vercel returns. Check HTTPS and all content routes.
2. Set the production environment variable `SITE_URL=https://rmvbackground.com` and rebuild. The page generator updates canonical URLs, social URLs, structured-data URLs, robots.txt, and sitemap.xml together.
3. Redirect the old public hostname to the corresponding path on the new domain, once the destination is working. Preserve article paths and query strings.
4. Verify the new property in Search Console, submit `https://rmvbackground.com/sitemap.xml`, and use Google's Change of Address flow where applicable.

The home title and heading target “free background remover.” Relevant guide titles,
descriptions, and studio calls to action use natural variants. Do not repeat FREE
in every sentence or add hidden keyword blocks. Free access describes the current
studio; workspace limits and separate model licensing remain documented.

References: [Google's keyword-stuffing policy](https://developers.google.com/search/docs/essentials/spam-policies#keyword-stuffing) and [domain-migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

## Metadata copy and keyword targets

All 17 routes have dedicated search titles and descriptions in
`frontend/src/content/seo.js`. This file is used only during the build, so the
keyword map adds no browser JavaScript. Each indexed route has one primary topic
and related terms that are used only where they describe the actual page.
Editorial article headings remain in `articles.js`; search titles can be shorter.

The homepage targets **free AI background remover**, supported by **remove
background online free**, **transparent PNG download**, and **bulk background
remover**. Guides cover transparent PNG creation, free white product backgrounds,
bulk background removal, hair and fur cutouts, file formats, background color
changes, profile photos, Shopify images, and image SEO. Legal-page metadata
summarizes its policy instead of repeating the homepage pitch.

The build emits one title and description per route, matching Open Graph and X
copy, canonical URLs, application/author tags, image-preview URLs and descriptive
image alt text. Article structured data includes its representative image. The
404 remains noindexed. Existing route paths and publication dates are preserved.

Titles and descriptions are deliberately concise, without treating editorial
length targets as Google-enforced character limits;
search results may truncate or rewrite the supplied copy. No ranking gains or
search volumes are assumed. Keyword targets are not emitted as a meta-keywords
tag, which Google Search does not use for indexing or ranking.

References: [title-link guidance](https://developers.google.com/search/docs/appearance/title-link),
[description guidance](https://developers.google.com/search/docs/appearance/snippet),
and [supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags).
