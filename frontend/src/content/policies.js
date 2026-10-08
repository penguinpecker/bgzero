export const policies = {
  terms: {
    title: "Terms of use",
    description:
      "The terms for using the rmvbackground background removal tool, image editor, and educational guides.",
    intro:
      "These terms explain what you can expect from rmvbackground and what we ask of people using the tool.",
    sections: [
      {
        heading: "Using the service",
        paragraphs: [
          "rmvbackground provides image background removal and basic export tools. You may use the interface without creating an account. Upload only images you have permission to process, and use the service in accordance with applicable law.",
          "Do not use the service to infringe someone’s rights, create deceptive or unlawful material, interfere with the service, or bypass its technical limits. You are responsible for obtaining any permissions needed from the people depicted in your images.",
        ],
      },
      {
        heading: "Your images and results",
        paragraphs: [
          "You retain whatever rights you hold in your uploaded images. You authorize rmvbackground and its processing infrastructure to handle those images to perform the edits you request and return the result. This does not give you rights to third-party content that you did not already have.",
          "Automatic background removal can miss details or remove parts of a subject. Review each result before using or publishing it. Keep your original images and download finished work before closing or refreshing the page; the workspace is not a permanent storage service.",
        ],
      },
      {
        heading: "Availability and limits",
        paragraphs: [
          "Processing depends on network access and the availability of the configured image service. The interface currently limits a workspace to 50 images, 50 MB per file, and 150 MB of source files in total. Large image dimensions are also limited. These limits and available features may change.",
          "The public interface currently has no checkout or per-image payment flow. Availability at no charge is not a commitment to unlimited processing or permanent access. Service features may be changed or discontinued.",
        ],
      },
      {
        heading: "Model and commercial-use terms",
        paragraphs: [
          "Image rights, application source rights, and model rights are separate. The configured hosted processor uses RMBG 2.0. Its model provider publishes separate license terms, including commercial-use conditions. Do not assume that free access to this interface grants a commercial license for the underlying model.",
          "Before relying on results for a commercial workflow or self-hosting the engine, check the provider’s current terms and any permissions applicable to your deployment. See the linked model card for the authoritative license information.",
        ],
        links: [
          {
            title: "RMBG 2.0 model card and licensing",
            url: "https://huggingface.co/briaai/RMBG-2.0",
          },
        ],
      },
      {
        heading: "Guides and external resources",
        paragraphs: [
          "Our articles provide general workflow guidance. External platforms can change their image requirements, so check the destination’s current documentation before publishing. Links to outside resources do not imply that those organizations endorse rmvbackground.",
          "The service is provided as available, without a promise of perfect selections, uninterrupted access, or fitness for a particular purpose. Nothing in these terms excludes rights or obligations that cannot lawfully be excluded.",
        ],
      },
      {
        heading: "Updates and contact",
        paragraphs: [
          "We may update these terms when the service changes. The date on this page identifies this version. For a service issue or a request to contact the maintainer, use the project repository linked below. Public issues are visible to others; do not include confidential images or personal information.",
        ],
        links: [
          {
            title: "Contact the rmvbackground project maintainer",
            url: "https://github.com/penguinpecker/bgzero/issues",
          },
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy notice",
    description:
      "How rmvbackground handles uploaded images, temporary browser state, hosting requests, and its image-processing service.",
    intro:
      "Background removal requires sending your image to a processing service. This page describes the data flow in the current rmvbackground application.",
    sections: [
      {
        heading: "Where your images go",
        paragraphs: [
          "When you upload or paste an image, the browser sends the file, its filename, and the selected processing mode to the configured image-processing endpoint. The public deployment uses a Modal-hosted processing service. Background removal does not run entirely in your browser.",
          "The processor returns an image with transparency. Background colors, canvas sizing, shadows, and export conversion then happen in your browser. The application code does not create a user image library or an intentional permanent archive of uploaded images. This is not a guarantee about all infrastructure logging or retention.",
        ],
      },
      {
        heading: "Temporary workspace data",
        paragraphs: [
          "Your current images, generated previews, and export settings are held in the active page’s memory. rmvbackground does not save those images to cookies, local storage, or a user account. Refreshing or closing the page clears the application workspace; downloaded files remain wherever you save them.",
          "Removing an image or clearing the workspace releases the browser resources used by this page. It does not issue a deletion request to infrastructure logs or erase copies you downloaded yourself.",
        ],
      },
      {
        heading: "Hosting and technical information",
        paragraphs: [
          "Vercel serves the website, and Modal runs the hosted image processor. Requests to these services can include an IP address, browser information, timestamps, and request metadata needed to deliver and secure the service. Their handling of infrastructure data is governed by their own arrangements and privacy notices.",
          "This application does not add advertising pixels, analytics tags, or a cross-site marketing identifier. Fonts and sample photos are served as website assets. Following an external link takes you to a separate website with its own policies.",
        ],
        links: [
          {
            title: "Vercel privacy notice",
            url: "https://vercel.com/legal/privacy-notice",
          },
          {
            title: "Modal privacy policy",
            url: "https://modal.com/legal/privacy-policy",
          },
        ],
      },
      {
        heading: "Sensitive images and permissions",
        paragraphs: [
          "Only submit files you are authorized to process. If an image is confidential or contains sensitive personal information, consider whether sending it to the hosted processor is appropriate for your requirements.",
          "The repository includes self-hosting instructions for people who want to operate their own processing infrastructure. A self-hosted deployment has its own operator, configuration, and data-handling responsibilities; this notice describes the public rmvbackground interface.",
        ],
      },
      {
        heading: "Questions and requests",
        paragraphs: [
          "Privacy rights depend on your location and the circumstances of processing. To raise a privacy question or request a private contact channel, contact the project maintainer through the repository. Do not post private images, identity documents, or other sensitive details in a public issue.",
          "This notice may change as the application changes. The date on this page identifies the version currently published.",
        ],
        links: [
          {
            title: "Contact the rmvbackground project maintainer",
            url: "https://github.com/penguinpecker/bgzero/issues",
          },
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies & browser storage",
    description:
      "Learn which cookies and browser storage rmvbackground uses, how the temporary image workspace works, and how to manage site data.",
    intro:
      "The rmvbackground application does not set analytics, advertising, or preference cookies. Here is what the current site does use.",
    sections: [
      {
        heading: "Application cookies",
        paragraphs: [
          "The current application does not set first-party cookies and does not embed an analytics or advertising service. There are no optional tracking categories to enable in this version, so the interface does not show an accept-all cookie banner.",
          "The hosting provider may use infrastructure mechanisms for security or delivery. Those are distinct from the application code. If tracking or optional third-party features are added in the future, this page and any required controls should be updated before those features are enabled.",
        ],
      },
      {
        heading: "What is stored in the browser",
        paragraphs: [
          "Uploaded images, cutouts, and editor settings live in page memory while you use the studio. They are not written by rmvbackground to local storage, session storage, or IndexedDB. Clearing the workspace or closing the page removes the working session from the application.",
          "Your browser may cache ordinary public files such as scripts, fonts, and sample images. Files you deliberately download are saved by your browser outside the temporary workspace. Clearing the site’s cookies does not delete those downloads.",
        ],
      },
      {
        heading: "Managing site data",
        paragraphs: [
          "Use your browser’s site settings to inspect or remove stored site data and cached files. Download any finished images before refreshing, because the editor does not persist your work between visits.",
          "Blocking public assets or requests to the processing service can prevent the tool from working. Read the privacy notice for the current image-processing data flow.",
        ],
        links: [{ title: "Read the privacy notice", url: "/privacy" }],
      },
      {
        heading: "Changes and questions",
        paragraphs: [
          "This page describes the implementation currently published, rather than a blanket statement about every possible future integration. The date below changes when this notice is substantively updated.",
          "For a question about site behavior, contact the project maintainer. Public issues are visible to everyone, so do not include sensitive browsing or account information.",
        ],
        links: [
          {
            title: "Contact the rmvbackground project maintainer",
            url: "https://github.com/penguinpecker/bgzero/issues",
          },
        ],
      },
    ],
  },
};
