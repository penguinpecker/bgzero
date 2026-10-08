import { useState } from "react";
import { articles, categories } from "../content/articles";
import Icon from "./Icon";

export function ArticleArt({ article, large = false }) {
  return (
    <div
      className={`article-art ${article.theme} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      {article.image === "formats" ? (
        <div className="format-art">
          <span>.png</span>
          <span>.webp</span>
          <span>.jpg</span>
        </div>
      ) : article.image === "collection" ? (
        <div className="collection-art">
          <img src="/images/plant.jpg" alt="" loading="lazy" />
          <img src="/images/sneaker.jpg" alt="" loading="lazy" />
          <img src="/images/portrait.jpg" alt="" loading="lazy" />
        </div>
      ) : (
        <>
          <div className="art-frame checker">
            <img
              src={`/images/${article.image === "plant" ? "plant-cutout.png" : `${article.image}.jpg`}`}
              alt=""
              loading="lazy"
            />
          </div>
          <span className="art-corner">
            <Icon name="spark" size={24} />
          </span>
        </>
      )}
    </div>
  );
}
export function ArticleCard({ article }) {
  return (
    <article className="article-card">
      <a
        href={`/blog/${article.slug}`}
        className="article-image-link"
        aria-label={article.title}
      >
        <ArticleArt article={article} />
      </a>
      <div className="article-meta">
        <span>{article.category}</span>
        <span>{article.minutes} min read</span>
      </div>
      <h3>
        <a href={`/blog/${article.slug}`}>{article.title}</a>
      </h3>
      <p>{article.description}</p>
      <a className="read-link" href={`/blog/${article.slug}`}>
        Read the guide <Icon name="arrow" size={16} />
        <span className="visually-hidden">: {article.title}</span>
      </a>
    </article>
  );
}
export function JournalPreview() {
  return (
    <section className="journal-preview section" id="guides">
      <div className="section-header">
        <div>
          <span className="eyebrow">The BGZERO journal</span>
          <h2>
            Good images start
            <br />
            with a little know-how.
          </h2>
        </div>
        <a className="button secondary" href="/blog">
          Explore all 10 guides <Icon name="arrow" size={17} />
        </a>
      </div>
      <div className="article-grid">
        {[articles[0], articles[2], articles[4]].map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
export function Journal() {
  const [category, setCategory] = useState("All articles"),
    [query, setQuery] = useState("");
  const matches = articles.filter(
    (article) =>
      (category === "All articles" || article.category === category) &&
      `${article.title} ${article.description}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <section className="page-intro journal-intro">
        <span className="eyebrow">The BGZERO journal</span>
        <h1>
          A better image.
          <br />
          <span>A little know-how.</span>
        </h1>
        <p>
          Practical guides for clean cutouts, considered compositions,
          <br className="desktop-break" /> and images that are ready for
          whatever’s next.
        </p>
      </section>
      <section className="journal-library">
        <div className="journal-controls">
          <div
            className="category-filters"
            aria-label="Filter articles by category"
          >
            {categories.map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search-input">
            <Icon name="search" size={18} />
            <input
              type="search"
              placeholder="Find a guide…"
              value={query}
              aria-label="Search articles"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <p className="result-count" role="status">
          {matches.length} {matches.length === 1 ? "guide" : "guides"} for your
          next project
        </p>
        <div className="article-grid">
          {matches.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        {!matches.length && (
          <div className="empty-search">
            <h2>No guides found</h2>
            <p>Try “PNG,” “product,” or a different category.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setCategory("All articles");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
export function ArticlePage({ article }) {
  const related = article.related
    .map((slug) => articles.find((item) => item.slug === slug))
    .filter(Boolean);
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/blog">Journal</a>
        <span>/</span>
        <span>{article.category}</span>
      </nav>
      <header className="article-header">
        <span className="eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <p>{article.intro}</p>
        <div className="byline">
          <span className="author-mark">b.</span>
          <span>
            <a href="/about">By {article.author}</a>
            <small>
              <time dateTime={article.date}>October 9, 2026</time>
              <span>·</span>
              {article.minutes} min read
            </small>
          </span>
        </div>
      </header>
      <div className="article-cover">
        <ArticleArt article={article} large />
      </div>
      <div className="article-layout">
        <aside className="article-toc">
          <span className="eyebrow">In this guide</span>
          <nav aria-label="Article contents">
            {article.sections.map((section, index) => (
              <a key={section.heading} href={`#section-${index + 1}`}>
                {section.heading}
              </a>
            ))}
          </nav>
          <a className="button small" href="/#studio">
            Try the studio <Icon name="arrow" size={16} />
          </a>
        </aside>
        <article className="article-body">
          <div className="takeaway">
            <Icon name="spark" size={23} />
            <div>
              <strong>The useful bit</strong>
              <p>{article.takeaway}</p>
            </div>
          </div>
          {article.sections.map((section, index) => (
            <section key={section.heading} id={`section-${index + 1}`}>
              <h2>{section.heading}</h2>
              {section.list && (
                <ol>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <div className="article-next-step">
            <h2>Put it into practice.</h2>
            <p>
              Bring an image. Leave with a clean cutout and a few more
              possibilities.
            </p>
            <a className="button" href="/#studio">
              Remove a background <Icon name="arrow" size={17} />
            </a>
          </div>
          <section className="article-sources">
            <h2>Sources & further reading</h2>
            <p>
              Official references for the formats, platforms, or tools mentioned
              in this guide.
            </p>
            <ul>
              {article.sources.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
      <section className="related-articles section">
        <div className="section-header">
          <h2>A little more to explore.</h2>
          <a href="/blog" className="read-link">
            All guides <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="article-grid">
          {related.map((item) => (
            <ArticleCard article={item} key={item.slug} />
          ))}
        </div>
      </section>
    </>
  );
}
