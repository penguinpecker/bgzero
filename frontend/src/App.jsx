import Icon from "./components/Icon";
import Studio from "./components/Studio";
import { Journal, JournalPreview, ArticlePage } from "./components/Journal";
import { articleBySlug } from "./content/articles";
import { policies } from "./content/policies";

export const faqs = [
  [
    "Is rmvbackground free to use?",
    "Yes. rmvbackground is a free background remover with no account requirement or export watermark. Processing is subject to service availability and workspace limits. Model licensing is separate; see the terms before relying on it for commercial work.",
  ],
  [
    "Which images can I upload?",
    "Use JPG, PNG, or WebP files up to 50 MB each. The workspace holds up to 50 images and 150 MB in total. Images must be no larger than 8192 pixels on either side and 40 megapixels.",
  ],
  [
    "Can I download a transparent background?",
    "Yes. Choose the transparent checkerboard swatch and export as PNG or WebP. JPG cannot store transparency, so transparent areas become white in a JPG export.",
  ],
  [
    "Can I edit several images at once?",
    "Yes. Upload a batch, then use the thumbnails to edit each result. Every image keeps its own export settings. When two or more results are ready, you can download them together in a ZIP.",
  ],
  [
    "Where are my images processed?",
    "Images are sent to the configured processing service; the public site uses a Modal-hosted backend. Color, canvas, and export edits happen in your browser. Read the privacy notice for the full data flow.",
  ],
  [
    "Will my workspace be saved?",
    "Your workspace stays in the current browser tab. Download finished images before refreshing or closing it. rmvbackground does not currently provide accounts or a saved image library.",
  ],
];
function Brand() {
  return (
    <a href="/" className="brand" aria-label="rmvbackground home">
      <span className="brand-icon">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>
        rmv<span className="brand-light">background</span>
        <span className="brand-period">.</span>
      </span>
    </a>
  );
}
function Header({ path }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="/" aria-current={path === "/" ? "page" : undefined}>
            Free background remover
          </a>
          <a href="/#how-it-works">How it works</a>
          <a
            href="/blog"
            aria-current={path.startsWith("/blog") ? "page" : undefined}
          >
            Journal
          </a>
        </nav>
        <a
          className="header-cta"
          href={
            path === "/"
              ? "https://github.com/penguinpecker/bgzero"
              : "/#studio"
          }
        >
          {path === "/" ? (
            <>
              <Icon name="code" size={17} />
              <span>View source</span>
              <span>↗</span>
            </>
          ) : (
            <>
              Open free studio <Icon name="arrow" size={16} />
            </>
          )}
        </a>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Brand />
          <p>
            Less background.
            <br />
            More room for your ideas.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Create</strong>
            <a href="/#studio">Free background remover</a>
            <a href="/blog">Guides & articles</a>
            <a href="/about">About rmvbackground</a>
          </div>
          <div>
            <strong>The details</strong>
            <a href="/terms">Terms of use</a>
            <a href="/privacy">Privacy notice</a>
            <a href="/cookies">Cookies & storage</a>
          </div>
          <div>
            <strong>Behind the tool</strong>
            <a href="https://github.com/penguinpecker/bgzero">Source code ↗</a>
            <a href="https://github.com/penguinpecker/bgzero/issues">
              Feedback & support ↗
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 rmvbackground</span>
        <span>Made for the part worth keeping.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
function Home() {
  return (
    <>
      <section className="hero-intro">
        <div>
          <span className="eyebrow">
            <span className="status-dot" /> Free online image studio
          </span>
          <h1>
            Free background <br />
            <span>remover.</span>
          </h1>
        </div>
        <div className="hero-description">
          <p>
            Remove image backgrounds for free. <br />
            Make a transparent PNG, choose a new color,
            <br className="desktop-break" /> and download at full resolution.
          </p>
          <div>
            <span>
              <Icon name="check" size={15} /> No sign-up
            </span>
            <span>
              <Icon name="check" size={15} /> No watermarks
            </span>
          </div>
        </div>
      </section>
      <div id="studio-root">
        <Studio />
      </div>
      <div className="tool-benefits">
        <span>
          <Icon name="spark" size={18} />
          AI-powered cutouts
        </span>
        <span>
          <Icon name="layers" size={18} />
          Batch-friendly workflow
        </span>
        <span>
          <Icon name="image" size={18} />
          Full-resolution exports
        </span>
        <span>
          <Icon name="sliders" size={18} />
          Your colors. Your canvas.
        </span>
      </div>
      <section id="how-it-works" className="how-section section">
        <div className="how-heading">
          <span className="eyebrow">From photo to possibility</span>
          <h2>
            Three steps.
            <br />A clean slate.
          </h2>
          <p>
            No tracing around the edges.
            <br />
            No complicated workspace.
          </p>
        </div>
        <div className="steps">
          <div>
            <span className="step-number">01</span>
            <h3>Bring your image</h3>
            <p>
              Drag, upload, or paste a photo. Start with one image or add a
              whole set.
            </p>
            <Icon name="upload" size={23} />
          </div>
          <div>
            <span className="step-number">02</span>
            <h3>Make it yours</h3>
            <p>
              Get a clean cutout. Try a new color, choose a canvas, and give it
              room to breathe.
            </p>
            <Icon name="sliders" size={23} />
          </div>
          <div>
            <span className="step-number">03</span>
            <h3>Take it anywhere</h3>
            <p>
              Download a PNG, WebP, or JPG. Your next listing, slide, or post is
              waiting.
            </p>
            <Icon name="download" size={23} />
          </div>
        </div>
      </section>
      <section className="possibilities section" id="features">
        <div className="section-header">
          <div>
            <span className="eyebrow">One cutout. A lot of possibilities.</span>
            <h2>
              A small tool for
              <br />
              your next big thing.
            </h2>
          </div>
          <p>
            For the shop you’re building.
            <br />
            The idea you’re sharing.
            <br />
            The details you want to get right.
          </p>
        </div>
        <div className="usecase-grid">
          <a
            href="/blog/white-background-product-photos"
            className="usecase product-usecase"
          >
            <div className="usecase-visual">
              <img
                src="/images/sneaker-display.webp"
                alt="Red sneaker photographed for a product listing"
                loading="lazy"
              />
              <span className="visual-note">Ready for the storefront.</span>
            </div>
            <div>
              <span>For sellers</span>
              <h3>Let the product do the talking.</h3>
              <p>
                Clean backgrounds and consistent canvases for a catalog that
                feels considered.
              </p>
              <span className="read-link">
                Explore product photography <Icon name="arrow" size={17} />
              </span>
            </div>
          </a>
          <a
            href="/blog/profile-picture-background"
            className="usecase creator-usecase"
          >
            <div className="usecase-visual">
              <img
                src="/images/portrait-display.webp"
                alt="Portrait for a profile picture"
                loading="lazy"
              />
              <span className="visual-note">A little more you.</span>
            </div>
            <div>
              <span>For creators</span>
              <h3>Find your place in the frame.</h3>
              <p>
                Simple portraits, better profile pictures, and a fresh canvas
                for your next idea.
              </p>
              <span className="read-link">
                Make a profile picture <Icon name="arrow" size={17} />
              </span>
            </div>
          </a>
        </div>
      </section>
      <JournalPreview />
      <section className="faq-section section" id="faq">
        <div>
          <span className="eyebrow">A few useful answers</span>
          <h2>Good to know.</h2>
          <p>
            Still curious? <a href="/about">Meet the tool.</a>
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Icon name="plus" size={18} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="closing-cta">
        <span className="eyebrow">Make some room for your ideas</span>
        <h2>
          Keep the good.
          <br />
          <em>Lose the background.</em>
        </h2>
        <a href="#studio" className="button">
          Remove a background for free <Icon name="arrow" size={18} />
        </a>
        <span>No sign-up. Just your image.</span>
      </section>
    </>
  );
}
function Policy({ policy }) {
  return (
    <div className="policy-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <span>{policy.title}</span>
      </nav>
      <header className="policy-header">
        <span className="eyebrow">The details, in plain language</span>
        <h1>{policy.title}</h1>
        <p>{policy.intro}</p>
        <span className="updated">Last updated October 9, 2026</span>
      </header>
      <div className="policy-layout">
        <aside>
          <a href="/terms">Terms of use</a>
          <a href="/privacy">Privacy notice</a>
          <a href="/cookies">Cookies & storage</a>
        </aside>
        <article className="prose">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.links?.map((link) => (
                <p key={link.url}>
                  <a href={link.url}>{link.title} ↗</a>
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
function About() {
  return (
    <div className="about-page">
      <section className="page-intro">
        <span className="eyebrow">About rmvbackground</span>
        <h1>
          Make room
          <br />
          <span>for the good stuff.</span>
        </h1>
        <p>
          rmvbackground is a free tool for removing image backgrounds and
          preparing the result for whatever comes next.
        </p>
      </section>
      <div className="about-grid">
        <div className="about-image checker">
          <img
            src="/images/plant-cutout-display.webp"
            alt="Succulent plant with its background removed"
          />
        </div>
        <div className="prose">
          <h2>A simpler image workflow</h2>
          <p>
            The studio brings background removal, color changes, canvas presets,
            and common export formats into one place. Use it for individual
            photos or work through a batch, with separate settings for each
            image.
          </p>
          <p>
            The frontend and processing code are available in the project
            repository. The public site uses a hosted processor; the repository
            also explains how to run your own backend.
          </p>
          <h2>About the journal</h2>
          <p>
            Our ten guides explain the workflows supported by the tool. Articles
            are published under the rmvbackground byline, include official
            references where relevant, and describe limitations alongside
            practical steps. They do not imply endorsement by the platforms
            mentioned.
          </p>
          <h2>Built in the open</h2>
          <p>
            Have an idea or found a rough edge? Share feedback through the
            repository. Check the terms for model licensing and the privacy
            notice for how uploaded images are handled.
          </p>
          <a
            className="button secondary"
            href="https://github.com/penguinpecker/bgzero"
          >
            Explore the source <Icon name="code" size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">404 · Something’s missing</span>
      <h1>
        This page lost
        <br />
        more than its background.
      </h1>
      <p>Let’s get you back to something useful.</p>
      <div>
        <a href="/" className="button">
          Open free studio <Icon name="arrow" size={17} />
        </a>
        <a href="/blog" className="button secondary">
          Browse the guides
        </a>
      </div>
    </section>
  );
}
export default function App({ path = "/" }) {
  const normalized = path.replace(/\/+$/, "") || "/";
  const article = normalized.startsWith("/blog/")
    ? articleBySlug(normalized.slice(6))
    : null;
  const policy = policies[normalized.slice(1)];
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div id="top" />
      <Header path={normalized} />
      <main id="main-content" className="container">
        {normalized === "/" ? (
          <Home />
        ) : normalized === "/blog" ? (
          <div id="journal-root">
            <Journal />
          </div>
        ) : article ? (
          <ArticlePage article={article} />
        ) : policy ? (
          <Policy policy={policy} />
        ) : normalized === "/about" ? (
          <About />
        ) : (
          <NotFound />
        )}
      </main>
      <div className="container">
        <Footer />
      </div>
    </>
  );
}
