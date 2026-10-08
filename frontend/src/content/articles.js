const source = {
  png: {
    title: "W3C: PNG specification and alpha transparency",
    url: "https://www.w3.org/TR/png-3/",
  },
  formats: {
    title: "MDN: Image file types and formats",
    url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types",
  },
  webp: {
    title: "Google: WebP image format",
    url: "https://developers.google.com/speed/webp",
  },
  merchant: {
    title: "Google Merchant Center: Product image requirements",
    url: "https://support.google.com/merchants/answer/6324350?hl=en",
  },
  shopify: {
    title: "Shopify: Product media types",
    url: "https://help.shopify.com/en/manual/products/product-media/product-media-types",
  },
  seo: {
    title: "Google Search Central: Image SEO best practices",
    url: "https://developers.google.com/search/docs/appearance/google-images",
  },
  model: {
    title: "BRIA: RMBG 2.0 model card and license",
    url: "https://huggingface.co/briaai/RMBG-2.0",
  },
  repo: {
    title: "BGZERO: Source code and self-hosting instructions",
    url: "https://github.com/penguinpecker/bgzero",
  },
};

export const articles = [
  {
    slug: "remove-background-from-image",
    title: "How to remove a background from an image",
    description:
      "A practical guide to removing image backgrounds with BGZERO, checking the edges, and downloading a transparent PNG without a watermark.",
    category: "The essentials",
    keyword: "remove background from image",
    image: "plant",
    theme: "sage",
    intro:
      "A clean cutout starts with a clear subject. Whether you are preparing a product photo, a presentation, or a profile picture, the goal is the same: keep the part that matters and make the rest easy to replace.",
    takeaway:
      "Upload a JPG, PNG, or WebP, inspect the cutout against light and dark backgrounds, then export a transparent PNG for the most flexible next step.",
    sections: [
      {
        heading: "Choose a useful starting image",
        paragraphs: [
          "Use the original photo when you can. A screenshot of a photo usually carries fewer pixels and may include interface elements that confuse the selection. Keep the whole subject inside the frame, including the ends of leaves, loose hair, straps, and handles.",
          "A subject that stands apart from its background is easier to separate. A pale object against a pale wall, a transparent glass, or motion-blurred fur can need more attention. Background removal does not restore missing detail or reconstruct parts of an object that are outside the photo.",
        ],
      },
      {
        heading: "Remove the background in BGZERO",
        list: [
          "Open the background removal studio and choose Quality for your first attempt.",
          "Upload your image, drag it into the upload area, or paste an image from your clipboard.",
          "Wait for the processed result. The service can take longer on the first request while it starts up.",
          "Switch between Result, Compare, and Original to check that the important parts remain.",
          "Choose Transparent under Background, keep Original size, and download a PNG.",
        ],
        paragraphs: [
          "You can add several images at once. The workspace processes them in sequence and keeps each result available while the page remains open. Save anything you need before refreshing or closing the tab.",
        ],
      },
      {
        heading: "Check the parts an automatic selection can miss",
        paragraphs: [
          "Look around the outline, then check the holes inside the subject. Chair legs, bag handles, and spaces between leaves can keep small pieces of the original background. Switch to charcoal and then white to make pale and dark fringes easier to see.",
          "Inspect the downloaded file at its intended display size as well as at full resolution. Tiny imperfections that do not matter in a small card may become visible on a large banner. For critical images, finish difficult edges in a dedicated editor or reshoot the subject against a simpler background.",
        ],
      },
      {
        heading: "Choose an export that fits the next step",
        paragraphs: [
          "PNG is a useful master when you need transparency for future layouts. WebP is another transparent option for web use. JPG needs a solid background; BGZERO fills transparent areas with white when you select JPG without another color.",
          "Keep your original photo and the transparent master together. Create smaller or colored versions from the master, rather than repeatedly saving a compressed derivative. A clear filename, such as green-planter-front-transparent.png, also makes a growing asset folder easier to navigate.",
        ],
      },
    ],
    sources: [source.formats, source.png],
    related: [
      "make-transparent-png",
      "remove-background-hair-fur",
      "png-vs-webp-vs-jpg",
    ],
  },
  {
    slug: "make-transparent-png",
    title: "Make a transparent PNG that stays transparent",
    description:
      "Learn how to make a transparent PNG, verify its alpha channel, avoid white backgrounds, and reuse your cutout in designs and presentations.",
    category: "The essentials",
    keyword: "make transparent PNG",
    image: "plant",
    theme: "checker",
    intro:
      "A white background and a transparent background can look identical in an image viewer. The difference appears when you place the image over something else. A transparent PNG lets the new background show through.",
    takeaway:
      "Keep Background set to Transparent and export as PNG. Test the downloaded image on a colored surface instead of trusting a white preview window.",
    sections: [
      {
        heading: "What transparency actually stores",
        paragraphs: [
          "An image with an alpha channel can describe how opaque each pixel is. This makes a cutout more flexible than a rectangular photo: empty pixels reveal the page underneath, while partially transparent pixels can preserve softer edges.",
          "The checkerboard in an editor is usually just a visual aid. It shows where the image is transparent; it should not become part of the saved picture. Taking a screenshot of that preview captures the checkerboard itself, so use the download button instead.",
        ],
      },
      {
        heading: "Create the file in the studio",
        list: [
          "Upload the original photo in BGZERO and wait for background removal.",
          "Choose Result to inspect the processed image.",
          "Select the checkerboard swatch labeled Transparent.",
          "Choose PNG as the export format and keep Original size if you need a reusable master.",
          "Download the file and insert it into the destination design as an image layer.",
        ],
        paragraphs: [
          "For extra breathing room, choose a canvas preset and reduce Image scale. This changes the composition without cropping the subject. A smaller subject on a larger transparent canvas can be helpful when your destination aligns images by their rectangular bounds.",
        ],
      },
      {
        heading: "Why a transparent image can look white or black",
        paragraphs: [
          "Some viewers place transparent pixels over a default white or black canvas. That does not automatically mean the transparency is gone. Put the file over a bright color in a design editor: if the color shows around the subject, the file is working.",
          "If a solid rectangle remains, check the file you actually imported. A JPG copy cannot preserve the alpha channel. A screenshot or flattened export may also have turned the background into image pixels. Return to the cutout and download a fresh PNG.",
        ],
      },
      {
        heading: "Keep the master separate from delivery versions",
        paragraphs: [
          "Use a simple naming convention such as planter-master-transparent.png, planter-web.webp, and planter-white.jpg. The master is your flexible starting point; the other files serve particular channels. Avoid overwriting the master when experimenting with background colors.",
          "If you are building a presentation, place the PNG directly over the slide color. If you are preparing a website, compare a WebP version for file size and visual quality. If you are sending a file to someone else, state that it contains transparency so they know why it appears differently in different viewers.",
        ],
      },
    ],
    sources: [source.png],
    related: [
      "png-vs-webp-vs-jpg",
      "change-image-background-color",
      "remove-background-from-image",
    ],
  },
  {
    slug: "white-background-product-photos",
    title: "Give product photos a clean white background",
    description:
      "Create consistent white-background product photos, control image scale, preserve product details, and check your exports before publishing.",
    category: "For sellers",
    keyword: "white background product photos",
    image: "sneaker",
    theme: "peach",
    intro:
      "A white background makes a catalog easier to scan, but consistency matters as much as the background color. Products should feel like they belong to the same collection without hiding their size, material, or shape.",
    takeaway:
      "Remove the background, choose white, and match the canvas and visual scale across the set. Keep a transparent master so you can reuse the cutout later.",
    sections: [
      {
        heading: "Start with an accurate product photograph",
        paragraphs: [
          "Photograph the exact item and variation you intend to show. Keep packaging text legible, avoid clipped highlights, and use soft light that preserves the outline. A background remover cannot repair an out-of-focus label or recover the edge of a white bottle that disappeared into glare.",
          "Take a straight-on image and a useful secondary angle. Do not rely on one cutout to communicate every feature. A simple main image can sit alongside close-ups and contextual photos that help someone understand the product.",
        ],
      },
      {
        heading: "Build the white-background version",
        list: [
          "Upload the photo and review the cutout in Compare view.",
          "Select White under Background.",
          "Choose a consistent canvas. Square works well for a uniform grid; keep Original size when you need more resolution.",
          "Adjust Image scale until the framing matches the rest of the collection.",
          "Download JPG for a solid-background delivery file, or PNG when your workflow calls for it.",
        ],
        paragraphs: [
          "Before you add a shadow, decide whether the destination needs a strictly plain image. BGZERO’s Soft shadow setting is a simple compositing effect, not a reconstruction of the lighting in the original photograph. Keep it restrained and check the channel’s current rules.",
        ],
      },
      {
        heading: "Make a catalog look consistent",
        paragraphs: [
          "Choose a reference image and compare the rest against it. Look at top and bottom spacing, the center of the object, and how much of the frame it occupies. Matching canvas dimensions alone does not produce matching visual scale.",
          "Tall bottles and wide shoes need different framing decisions. Leave enough room for the entire object and avoid forcing every product into the same silhouette. A repeatable rule is more useful than chasing identical margins on products with completely different shapes.",
        ],
      },
      {
        heading: "Check before publishing",
        paragraphs: [
          "Inspect light-colored edges against both charcoal and white. A halo can hide on a white canvas and appear later in another design. Check interior holes, shoelaces, jewelry chains, and reflective areas that the model might misread.",
          "Marketplace requirements vary and can change. Google Merchant Center, for example, publishes rules for the primary product image, including restrictions on promotional overlays. Review the linked official guidance for the channel you use instead of treating a canvas preset as a compliance guarantee. Keep a larger original if the destination needs more pixels than a social preset provides.",
        ],
      },
    ],
    sources: [source.merchant],
    related: [
      "shopify-product-image-workflow",
      "batch-background-removal",
      "change-image-background-color",
    ],
  },
  {
    slug: "batch-background-removal",
    title: "Remove backgrounds from a batch of images",
    description:
      "A repeatable batch background removal workflow: organize source images, review individual cutouts, preserve export settings, and download a ZIP.",
    category: "Better workflows",
    keyword: "batch background removal",
    image: "collection",
    theme: "peach",
    intro:
      "Batch editing saves repetitive work, but a batch still contains individual images. The useful workflow is to automate the first pass, review each result, and deliver a tidy folder that the next person can understand.",
    takeaway:
      "Upload a set, review every cutout, and download the finished images as one ZIP. In BGZERO, each image keeps its own background, canvas, and export format.",
    sections: [
      {
        heading: "Organize before you upload",
        paragraphs: [
          "Group photos by their intended destination. A folder of store thumbnails and a folder of portrait graphics are easier to finish than a mixed pile of unrelated assets. Give source files meaningful names so you can recognize them in the workspace.",
          "Start with a small representative sample, especially when the photos share a difficult material such as glass, white fabric, or glossy packaging. If the model struggles with one example, inspect the rest carefully before committing to a large delivery.",
        ],
      },
      {
        heading: "Process the set in BGZERO",
        list: [
          "Select a processing mode before adding images. It applies to new uploads.",
          "Choose several files in the file picker, or drop them into the empty upload panel.",
          "Use the thumbnails below the editor to move between images as they finish.",
          "Set the background, canvas size, shadow, and export format for each result.",
          "When at least two images are ready, choose Download all to create a ZIP.",
        ],
        paragraphs: [
          "The workspace accepts up to 50 images, with a 50 MB limit per file and a 150 MB total input limit. Processing runs one image at a time. These limits help keep browser memory manageable; very large originals may still need resizing before upload.",
        ],
      },
      {
        heading: "Understand what the ZIP includes",
        paragraphs: [
          "Download all includes completed results at the moment you click it. An image that is still processing or has failed is not a finished result and will not appear in that export. Compare the ready count with the number of files you intended to deliver.",
          "The archive uses each image’s settings. One item can be a transparent PNG while another is a white-background JPG. Exported filenames include a number in the ZIP so two source photos with the same name do not overwrite each other.",
        ],
      },
      {
        heading: "Recover gracefully from a failed image",
        paragraphs: [
          "A network interruption or a cold service can affect a request. Use Retry on the failed image instead of uploading the whole batch again. If the source repeatedly fails, try a smaller original and make sure it is a supported PNG, JPEG, or WebP.",
          "Download completed work before refreshing the page. The current workspace lives in the tab, not in a cloud image library. Clear all releases the images from that workspace; it is useful when you finish one job and want to begin another. For a recurring workflow, retain source photos and approved exports in your own organized folders.",
        ],
      },
    ],
    sources: [source.repo],
    related: [
      "white-background-product-photos",
      "shopify-product-image-workflow",
      "image-seo-checklist",
    ],
  },
  {
    slug: "remove-background-hair-fur",
    title: "Better background removal around hair and fur",
    description:
      "Learn how to inspect hair and fur cutouts, spot halos, choose better source photos, and understand the limits of automatic background removal.",
    category: "The finer details",
    keyword: "remove background hair fur",
    image: "portrait",
    theme: "lavender",
    intro:
      "Hair and fur rarely form a hard outline. Fine strands blend into the background, which makes them a useful test of any background remover. Good results come from a strong source photo and careful checking, not just a more impressive mode name.",
    takeaway:
      "Check soft edges over both light and dark backgrounds. Preserve natural softness where it belongs, and use a dedicated masking editor when an automatic result needs precise repairs.",
    sections: [
      {
        heading: "Give the model a clear separation",
        paragraphs: [
          "Use a well-focused photo with visible detail at the outline. A slightly different background tone helps separate dark hair from a dark wall or pale fur from a bright sky. Avoid strong motion blur if the final image needs a sharp cutout.",
          "Backlighting can reveal individual strands, but it can also create a strong rim of color from the old background. Keep the original file with the most detail you have. Enlarging a small screenshot does not add the strands that were lost when it was reduced.",
        ],
      },
      {
        heading: "Inspect more than the silhouette",
        list: [
          "Upload the photo and start with Quality processing.",
          "Use Compare to check whether the cutout has lost large sections of hair or fur.",
          "Switch to Result and try White, then Charcoal as the background.",
          "Look for pale halos, leftover background color, hard clipped edges, and transparent patches inside the subject.",
          "Check the file at the size it will actually be displayed before deciding whether further editing is necessary.",
        ],
        paragraphs: [
          "The original comparison shows the raw cutout. Your colored background and canvas edits appear in Result view. Using both views helps distinguish a selection problem from a compositing choice.",
        ],
      },
      {
        heading: "Know what a mode can and cannot promise",
        paragraphs: [
          "BGZERO exposes Fast, Quality, Ultra, and Matting to support its processing backends. Their behavior depends on the backend configuration. The hosted implementation currently uses the same refinement path for Quality, Ultra, and Matting; choosing a different label does not guarantee a different result.",
          "If a fine edge is important and the automatic cutout is not good enough, a photo editor with manual layer masks is the right next step. BGZERO’s studio does not currently include a restore brush or a strand-by-strand masking tool. Keep the original photo so manual work remains possible.",
        ],
      },
      {
        heading: "Choose the final background with the edge in mind",
        paragraphs: [
          "A cutout can look natural on a midtone background and harsh on pure black. That does not make the original selection perfect; it tells you that the transition matters. Test the actual background the image will appear on instead of evaluating only a checkerboard.",
          "Export a transparent PNG while you are still deciding on the layout. Avoid adding an exaggerated shadow to hide edge problems, particularly around a portrait. If the source was too blurred or too similar to the background, a new photo may produce a better result in less time than repeated processing.",
        ],
      },
    ],
    sources: [source.model, source.repo],
    related: [
      "profile-picture-background",
      "make-transparent-png",
      "remove-background-from-image",
    ],
  },
  {
    slug: "png-vs-webp-vs-jpg",
    title: "PNG, WebP, or JPG: which should you download?",
    description:
      "Compare PNG, WebP, and JPG for background removal. Pick the right format for transparency, reusable masters, websites, and solid-background photos.",
    category: "The essentials",
    keyword: "PNG vs WebP vs JPG background removal",
    image: "formats",
    theme: "lavender",
    intro:
      "The best export format depends on where the image goes next. A reusable cutout, a storefront thumbnail, and an email attachment can start from the same photo but need different delivery files.",
    takeaway:
      "Use PNG for a transparent master, compare WebP for web delivery, and choose JPG when you want a solid background and broad photographic compatibility.",
    sections: [
      {
        heading: "PNG: the reusable transparent master",
        paragraphs: [
          "PNG supports transparency and lossless image compression. It is a practical choice for a cutout you will reuse in several layouts. The file can be larger than a compressed photographic alternative, especially when the image contains lots of texture.",
          "In BGZERO, choose Transparent and PNG to preserve the cutout. Keep Original size if you want the source dimensions. This gives you a useful starting file for later colored versions, presentation layouts, and design handoffs.",
        ],
      },
      {
        heading: "WebP: a flexible web delivery option",
        paragraphs: [
          "WebP supports transparency and offers lossy and lossless compression. BGZERO’s browser export exposes a quality setting for WebP. A lower setting may reduce file size but can change fine texture, so compare the exported image before publishing.",
          "Use a realistic test: the same canvas, the same subject scale, and the same intended display size. A format name alone does not tell you which file will be smallest or look best for your image. Keep the PNG master if you expect to make more versions.",
        ],
      },
      {
        heading: "JPG: a photograph with a filled background",
        paragraphs: [
          "JPG does not preserve transparency. It is useful for photos with a finished solid background, especially when the receiving system expects JPEG. Choose your color before exporting; BGZERO uses white if you leave the background transparent while selecting JPG.",
          "Repeatedly editing and saving a lossy file can reduce quality. Create new JPG delivery versions from your original or transparent master instead of using the last compressed download as the next source.",
        ],
      },
      {
        heading: "A simple decision process",
        list: [
          "Will the background change later? Keep a transparent PNG master.",
          "Does the website accept WebP? Export a WebP version and compare its appearance and size.",
          "Does the destination require JPEG? Pick a solid background and download JPG.",
          "Do small labels or texture look damaged? Increase quality or try PNG.",
          "Is the file still too large? Reduce the canvas dimensions before lowering quality aggressively.",
        ],
        paragraphs: [
          "Pixel dimensions and format solve different problems. A 1080-pixel social graphic should not be the master for a larger print layout. Likewise, sending a huge original to a tiny website card can waste bandwidth. Decide what the destination needs, then export the smallest version that still shows the necessary detail.",
          "Finally, keep the extension accurate. Renaming a PNG file to .jpg does not convert its contents. Use the export controls so the image data and filename describe the same format.",
        ],
      },
    ],
    sources: [source.formats, source.webp],
    related: [
      "make-transparent-png",
      "white-background-product-photos",
      "image-seo-checklist",
    ],
  },
  {
    slug: "change-image-background-color",
    title: "Change an image background to any color",
    description:
      "Replace a photo background with white, a brand color, or a muted tone. Preview contrast, adjust spacing, and export the right version in BGZERO.",
    category: "Creative work",
    keyword: "change image background color",
    image: "plant",
    theme: "peach",
    intro:
      "A single cutout can work in many places. Put it on white for a catalog, a muted color for a social card, or your brand color for a presentation. Separating the subject first keeps those choices flexible.",
    takeaway:
      "Remove the original background once, then use the color swatches or custom color picker. BGZERO composites color changes in the browser without reprocessing the cutout.",
    sections: [
      {
        heading: "Remove first, recolor second",
        paragraphs: [
          "Upload your image and let the studio create a transparent cutout. This separates the selection task from the styling task. After processing, you can try several colors without sending the image for another removal request.",
          "The background color fills the canvas behind the cutout. It does not change the color of the product itself. If the original wall reflected onto a glossy object, a remaining tint may be part of the subject pixels and may need additional work in a photo editor.",
        ],
      },
      {
        heading: "Choose a background in BGZERO",
        list: [
          "Select your completed image in the workspace.",
          "Open Result view so you can see your composition changes.",
          "Try a preset swatch, or use the custom color picker for a specific color.",
          "Choose a canvas preset and reduce Image scale when you need more empty space.",
          "Download the colored result in PNG, WebP, or JPG.",
        ],
        paragraphs: [
          "If you want to return to the original cutout, select the checkerboard swatch. Reset image settings restores the transparent background, original canvas, and default export options for the selected image. Other images keep their own settings.",
        ],
      },
      {
        heading: "Check contrast around the whole subject",
        paragraphs: [
          "Compare the lightest and darkest parts of the outline against your new background. A dark bag on charcoal may lose its handles; a white shirt on a pale canvas may lose its sleeves. The right color helps viewers understand the shape without needing an exaggerated shadow.",
          "Do not judge color only from a tiny thumbnail. Open the result at a useful size and look for residual halos. A strongly saturated background can reveal edge contamination that was invisible on white. If the new color clashes with reflections in the original photo, a quieter tone may look more natural.",
        ],
      },
      {
        heading: "Keep a small, reusable color system",
        paragraphs: [
          "For a series of product or creator graphics, choose a limited palette and use each color for a purpose. For example, white can serve the catalog, sage can support educational posts, and a darker neutral can frame a cover image. Repeating those choices makes the collection feel intentional.",
          "Save both a transparent master and the approved colored versions. BGZERO’s workspace is temporary, so the safest record of a finished design is the file you download. Use descriptive names in your own folders to distinguish the background color, destination, and revision. A little organization now prevents an unnecessary round of editing later.",
        ],
      },
    ],
    sources: [source.png],
    related: [
      "make-transparent-png",
      "profile-picture-background",
      "white-background-product-photos",
    ],
  },
  {
    slug: "profile-picture-background",
    title: "Make a cleaner profile picture background",
    description:
      "Prepare a profile picture with a simple background, comfortable framing, and clean hair edges. Export a square image without cropping your subject.",
    category: "Creative work",
    keyword: "profile picture background remover",
    image: "portrait",
    theme: "sage",
    intro:
      "A profile image is often seen at a very small size. A simple background and a clear silhouette help the face remain recognizable, whether the image appears beside a comment, on a team page, or in a contact card.",
    takeaway:
      "Start with a sharp, well-lit portrait, use a simple background, and preview the result as both a square and a small circular crop before uploading it to a profile.",
    sections: [
      {
        heading: "Pick a portrait with room to work",
        paragraphs: [
          "Choose a photo with the full top of the head visible and some space around the shoulders. A tight source crop gives you fewer options later. Look for an expression and camera angle that suit the context rather than trying to fix an unsuitable portrait through background changes.",
          "Soft, even light makes facial detail easier to read. A very bright background can wash out fine hair edges, while a dark wall can merge with dark hair. If you have several photos, start with the one that separates the person most clearly from the surroundings.",
        ],
      },
      {
        heading: "Build a simple profile version",
        list: [
          "Upload the portrait to the BGZERO studio.",
          "Inspect hair and shoulders in Compare view.",
          "Select a solid background that separates the outline from the canvas.",
          "Choose Square and adjust Image scale to leave comfortable room around the person.",
          "Download the file and preview it in the destination platform’s crop tool.",
        ],
        paragraphs: [
          "The square preset is 1080 × 1080 pixels. It fits the original image within the canvas rather than automatically finding and cropping the face. If the face needs repositioning, crop the original in a photo editor first, or adjust the crop in the platform where you will use it.",
        ],
      },
      {
        heading: "Design for the small version",
        paragraphs: [
          "Reduce your preview to roughly the size of a profile thumbnail. Check that the face is still recognizable and that the background does not dominate. A loud color may be appropriate for a creator identity but distracting for a staff directory.",
          "Many services display a circular crop even when the uploaded file is square. Check the top of the head, hair on either side, and the shoulders inside that circle. Leave enough room that a platform’s automatic crop does not cut off important parts.",
        ],
      },
      {
        heading: "Finish the edge and choose a format",
        paragraphs: [
          "Inspect hair on both light and dark backgrounds before settling on a final color. Avoid using a heavy shadow to disguise a poor selection. Fine hair can remain soft; it does not need to look like a hard sticker outline.",
          "Use JPG or WebP for a finished image with a solid background when your destination accepts them. Keep a transparent PNG if the portrait will also appear in presentation slides, speaker cards, or team graphics. Do not assume that a profile image workflow meets passport or identity-document requirements; official documents have their own rules for appearance and editing.",
        ],
      },
    ],
    sources: [source.formats],
    related: [
      "remove-background-hair-fur",
      "change-image-background-color",
      "make-transparent-png",
    ],
  },
  {
    slug: "shopify-product-image-workflow",
    title: "A repeatable product image workflow for Shopify",
    description:
      "Prepare a consistent Shopify image set with clean backgrounds, sensible canvas sizes, accurate product variants, and organized exports.",
    category: "For sellers",
    keyword: "Shopify product image background removal",
    image: "sneaker",
    theme: "sage",
    intro:
      "A store needs more than one nice product photo. It needs a repeatable way to produce images that line up in a grid, show the correct variation, and remain useful when the theme or marketing layout changes.",
    takeaway:
      "Create a transparent master for each product, then prepare consistent storefront versions. Check the actual theme and Shopify’s current media guidance before choosing final dimensions.",
    sections: [
      {
        heading: "Create an asset plan for each product",
        paragraphs: [
          "Prepare a main image, a secondary angle, and a detail view where those help explain the item. Name files with the product, variation, and angle. A clear name such as canvas-tote-olive-front is more useful than a camera’s default sequence number.",
          "Keep the exact variation accurate. Background editing should not make a material, color, or included accessory look different from what the customer receives. Use contextual photos separately when they help explain scale or use.",
        ],
      },
      {
        heading: "Make the clean masters",
        list: [
          "Upload the source photographs to BGZERO in a manageable batch.",
          "Review the outlines and interior spaces of each cutout.",
          "Export a transparent PNG master at the original canvas size.",
          "For your storefront version, choose a consistent background and canvas shape.",
          "Check image scale across the set and download the completed files.",
        ],
        paragraphs: [
          "BGZERO’s square preset is useful for a quick 1080-pixel asset, but it is not a universal Shopify requirement. If your theme uses large zoomable product images, keep a suitably large original export and size it for that destination.",
        ],
      },
      {
        heading: "Review in the real storefront layout",
        paragraphs: [
          "A product image that looks balanced by itself can feel inconsistent beside neighboring products. Upload a small test set and inspect collection cards, the product gallery, and the mobile layout. Theme settings can change the crop and available space.",
          "Watch the visual center of each product. A tall bottle and a wide pair of shoes may need different spacing to feel balanced together. Avoid cutting off part of the item simply to fill every square. Keep the customer’s ability to understand the product ahead of decorative consistency.",
        ],
      },
      {
        heading: "Keep the publishing handoff organized",
        paragraphs: [
          "Store source photos, transparent masters, and delivery files in separate folders. Keep a small record of the background color and intended canvas for the collection. This makes it easier to add the next product without reconstructing the earlier decisions.",
          "Before publishing, check file size, legibility, and the correct association between images and variants. Add useful alternative text that describes the visible item in context. BGZERO prepares the image files; it does not upload them to Shopify or manage the store’s product records. Use the official Shopify media documentation below for supported types and current limits.",
        ],
      },
    ],
    sources: [source.shopify],
    related: [
      "white-background-product-photos",
      "batch-background-removal",
      "image-seo-checklist",
    ],
  },
  {
    slug: "image-seo-checklist",
    title: "An image SEO checklist for your finished photos",
    description:
      "Prepare web images with descriptive filenames, useful alt text, sensible dimensions, and relevant page context after removing their backgrounds.",
    category: "Better workflows",
    keyword: "image SEO checklist",
    image: "formats",
    theme: "peach",
    intro:
      "Removing a background can improve a photo’s presentation, but search visibility also depends on the page that uses it. A polished cutout needs a sensible file, a clear description, and a place where it helps someone understand the content.",
    takeaway:
      "Use descriptive files, useful alternative text, appropriate dimensions, and relevant surrounding content. Background removal alone does not guarantee better search rankings.",
    sections: [
      {
        heading: "Name the image for a person who needs to find it",
        paragraphs: [
          "Use a short, descriptive filename that identifies the image. green-ceramic-planter-front.webp is easier to recognize than IMG_6042-final-final.webp. Do not turn the filename into a long sequence of near-identical search phrases.",
          "BGZERO appends bgzero to the source stem when exporting and numbers files in a batch archive to prevent collisions. You can rename a finished file for your own catalog. Keep its extension consistent with the actual format; renaming is not a format conversion.",
        ],
      },
      {
        heading: "Write alternative text for the image’s purpose",
        paragraphs: [
          "Describe the useful visual information in the context where the image appears. For a product card, that may be the item and visible variation. For a how-to article, it may be the step or result the illustration explains. Avoid inserting every keyword you hope to rank for.",
          "A decorative image may need an empty alt attribute in the website’s markup. A meaningful product photo usually needs a useful description. The choice belongs to the page context, not just the image file, so it should be reviewed when the image is added to the site.",
        ],
      },
      {
        heading: "Match the file to the layout",
        list: [
          "Keep a high-quality master for future uses.",
          "Create a delivery image with enough pixels for the intended display, without unnecessary excess.",
          "Compare WebP and JPG for solid-background photos, or WebP and PNG when transparency matters.",
          "Inspect labels, texture, and soft edges after compression.",
          "Have the website provide image dimensions and responsive versions where appropriate.",
        ],
        paragraphs: [
          "A small file that looks damaged is not a good outcome. Compare exports visually rather than following one quality percentage for every photo. Dense texture, fine text, and soft gradients respond differently to compression.",
        ],
      },
      {
        heading: "Publish the image where it adds information",
        paragraphs: [
          "Place the photo beside content that explains the relevant product, process, or example. Use an image URL that your website can serve reliably. Google’s image guidance covers crawlability, image context, descriptive text, and technical presentation; the official resource below is a better reference than promises of a guaranteed ranking boost.",
          "After publishing, check the page on mobile and verify that the image loads without shifting the surrounding content. Use Search Console, if you manage the site, to review actual search performance over time. Treat observations as feedback: improve the page and its usefulness rather than repeatedly changing filenames or adding more keywords without a reason.",
        ],
      },
    ],
    sources: [source.seo],
    related: [
      "png-vs-webp-vs-jpg",
      "shopify-product-image-workflow",
      "batch-background-removal",
    ],
  },
].map((article) => ({
  ...article,
  date: "2026-10-09",
  author: "BGZERO",
  minutes: Math.max(
    2,
    Math.ceil(
      [
        article.intro,
        article.takeaway,
        ...article.sections.flatMap((section) => [
          section.heading,
          ...(section.paragraphs || []),
          ...(section.list || []),
        ]),
      ]
        .join(" ")
        .split(/\s+/).length / 200,
    ),
  ),
}));

export const categories = [
  "All articles",
  ...new Set(articles.map((article) => article.category)),
];
export const articleBySlug = (slug) =>
  articles.find((article) => article.slug === slug);
