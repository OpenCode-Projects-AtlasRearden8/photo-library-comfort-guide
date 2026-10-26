'use strict';

const fs = require('fs');
const path = require('path');
const { mdToHtml, extractTitle } = require('./markdown');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');

const PAGES = [
  { src: 'docs/00-start-here.md', out: 'index.html', nav: 'Start here' },
  { src: 'docs/01-monthly-triage-hour.md', out: '01-monthly-triage-hour.html', nav: 'Triage hour' },
  { src: 'docs/02-duplicates-decoded.md', out: '02-duplicates-decoded.html', nav: 'Duplicates' },
  { src: 'docs/03-albums-youll-actually-keep.md', out: '03-albums-youll-actually-keep.html', nav: 'Albums' },
  { src: 'docs/04-naming-and-dating-scans.md', out: '04-naming-and-dating-scans.html', nav: 'Scans' },
  { src: 'docs/05-cloud-or-drive.md', out: '05-cloud-or-drive.html', nav: 'Cloud or drive' },
  { src: 'docs/06-sensitive-photos.md', out: '06-sensitive-photos.html', nav: 'Sensitive photos' },
  { src: 'docs/07-print-books-and-gifts.md', out: '07-print-books-and-gifts.html', nav: 'Print and gifts' },
  { src: 'docs/08-retire-old-phones.md', out: '08-retire-old-phones.html', nav: 'Retire a phone' },
  { src: 'docs/glossary.md', out: 'glossary.html', nav: 'Glossary' },
  { src: 'worksheet/triage-worksheet.md', out: 'triage-worksheet.html', nav: 'Worksheet' }
];

const CSS = `
:root {
  --paper: #faf6f0;
  --card: #ffffff;
  --ink: #33302c;
  --muted: #6f6a63;
  --accent: #b0563f;
  --accent-dark: #8f4430;
  --accent-soft: #f3e4de;
  --border: #e6ddd2;
  --good: #2e7d54;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 400 17px/1.65 ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
nav.topbar {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 0.6rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  justify-content: center;
}
nav.topbar a {
  color: var(--accent-dark);
  text-decoration: none;
  font-size: 0.92rem;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
}
nav.topbar a:hover { background: var(--accent-soft); }
nav.topbar a.active { background: var(--accent); color: #fff; }
main { max-width: 46rem; margin: 2rem auto 3rem; padding: 0 1.25rem; }
h1, h2, h3, h4, h5, h6 {
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  line-height: 1.25;
  color: var(--ink);
}
h1 { font-size: 2rem; margin: 0.4rem 0 1rem; }
h2 { font-size: 1.45rem; margin: 2.2rem 0 0.6rem; }
h3 { font-size: 1.15rem; margin: 1.6rem 0 0.4rem; }
p, li { overflow-wrap: break-word; }
a { color: var(--accent); text-underline-offset: 2px; }
a:hover { color: var(--accent-dark); }
code {
  background: #f1ebe2;
  border-radius: 4px;
  padding: 0.1em 0.35em;
  font-size: 0.88em;
}
pre { background: #f1ebe2; border: 1px solid var(--border); border-radius: 8px; padding: 0.9rem 1rem; overflow-x: auto; }
pre code { background: none; padding: 0; }
blockquote {
  margin: 1.2rem 0;
  padding: 0.7rem 1rem;
  border-left: 4px solid var(--accent);
  background: var(--accent-soft);
  border-radius: 0 8px 8px 0;
}
blockquote p { margin: 0.3rem 0; }
table { width: 100%; border-collapse: collapse; margin: 1.2rem 0; background: var(--card); font-size: 0.95rem; }
th, td { border: 1px solid var(--border); padding: 0.5rem 0.7rem; text-align: left; vertical-align: top; }
th { background: var(--accent-soft); font-family: ui-serif, Georgia, serif; }
ul.tasks { list-style: none; padding-left: 0.2rem; }
ul.tasks li { margin: 0.45rem 0; }
ul.tasks input { accent-color: var(--accent); margin-right: 0.45rem; }
hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
footer {
  border-top: 1px solid var(--border);
  background: var(--card);
  text-align: center;
  padding: 1.4rem 1rem;
  color: var(--muted);
  font-size: 0.88rem;
}
footer a { color: var(--muted); }
@media print {
  nav.topbar, footer { display: none; }
  body { background: #fff; }
  main { margin: 0; max-width: none; }
  a { color: var(--ink); }
}
`;

function rewriteLinks(html, srcRel) {
  const srcDir = path.posix.dirname(srcRel);
  return html.replace(/href="([^"]+)"/g, (match, href) => {
    if (/^(https?:|mailto:|#)/.test(href)) return match;
    const [rawPath, rawAnchor] = href.split('#');
    if (!rawPath || !rawPath.endsWith('.md')) return match;
    const resolved = path.posix.normalize(path.posix.join(srcDir, rawPath));
    const page = PAGES.find((p) => p.src === resolved);
    if (!page) throw new Error(`Broken internal link in ${srcRel}: ${href}`);
    return rawAnchor ? `href="${page.out}#${rawAnchor}"` : `href="${page.out}"`;
  });
}

function buildNav(activeOut) {
  const links = PAGES.map((p) => {
    const cls = p.out === activeOut ? ' class="active"' : '';
    return `<a href="${p.out}"${cls}>${p.nav}</a>`;
  }).join('');
  return `<nav class="topbar">${links}</nav>`;
}

function pageTemplate(title, nav, content) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
${nav}
<main>
${content}
</main>
<footer>
Photo Library Comfort Guide. A warm, beginner-friendly manual from <strong>Asdale Dynamics, LLC</strong>.<br>
MIT License. Copyright (c) 2026 Asdale Dynamics, LLC. No photos or personal data required, ever.
</footer>
</body>
</html>
`;
}

function build() {
  const siteRoot = path.join(ROOT, 'site');
  fs.mkdirSync(siteRoot, { recursive: true });

  const sources = PAGES.map((page) => {
    const abs = path.join(ROOT, page.src);
    if (!fs.existsSync(abs)) throw new Error(`Missing source markdown: ${page.src}`);
    return { ...page, markdown: fs.readFileSync(abs, 'utf8') };
  });

  const built = [];
  for (const page of sources) {
    let html = mdToHtml(page.markdown);
    html = rewriteLinks(html, page.src);
    const title = extractTitle(page.markdown, 'Photo Library Comfort Guide');
    const full = pageTemplate(title, buildNav(page.out), html);
    fs.writeFileSync(path.join(siteRoot, page.out), full);
    built.push(page.out);
  }

  return built;
}

if (require.main === module) {
  const outputs = build();
  console.log(`Built ${outputs.length} pages into site/:`);
  for (const file of outputs) console.log(`  site/${file}`);
}

module.exports = { build, PAGES, SITE };
