# STATUS

## What was built

The **Photo Library Comfort Guide** — a complete, camera-roll rescue manual for beginners, built from an empty folder against the project goal. Everything below is plain Markdown plus one dependency-free build script; no frameworks, no accounts, no network calls.

**The guide (docs/, ~8,300 words total):**

- `00-start-here.md` — welcome, chapter map, low-energy paths, tone
- `01-monthly-triage-hour.md` — the exact 60-minute monthly triage flow (five timed blocks)
- `02-duplicates-decoded.md` — exact duplicates vs near-dupes (blurry, button/pocket shots), tie-breaker rules, deletion-safety caveat
- `03-albums-youll-actually-keep.md` — six-albums-plus-archive structure, retrieval test, low-energy two-album path
- `04-naming-and-dating-scans.md` — `YYYY-MM-DD_subject_source` naming, unknown-date conventions, scan sessions
- `05-cloud-or-drive.md` — cloud vs your own drive, the privacy trade in plain terms, the two-copies rule
- `06-sensitive-photos.md` — IDs, medical moments, kids, hidden/locked/vault storage, sharing, quarterly sweep
- `07-print-books-and-gifts.md` — theme-first photo books, resolution table, calendars, frames, digital frames
- `08-retire-old-phones.md` — rescue-verify-sign-out-wipe order of operations, batteries, recycling
- `glossary.md` — 22 friendly term definitions with anchors
- `worksheet/triage-worksheet.md` — printable monthly worksheet with 30+ checkboxes

**The tooling:**

- `scripts/build.js` — turns the Markdown into an 11-page static site in `site/` (nav bar, anchor links, internal-link rewriting, printable CSS, footer credit). Built entirely on Node built-ins.
- `scripts/markdown.js` — small tested Markdown engine (headings with slugs, lists, task lists, tables, blockquotes, fenced code, inline markup, HTML escaping).
- `tests/` — 34 tests in 4 files: markdown unit tests, build verification (links, anchors, nav, checkboxes), content coverage against the original goal topics, and a "goal" test enforcing local-first/dependency-free, warm tone, honest STATUS.
- `README.md`, `LICENSE` (MIT, exact line `Copyright (c) 2026 Asdale Dynamics, LLC`), `.gitignore` (site/ and node_modules/ are regenerable, never source of truth).

The guide pairs with **photo-dedupe-lite-cli** (exact-duplicate cleanup on the computer) and **backup-basics-handbook** (copy discipline deep-dive); both are credited in the README, glossary, and relevant chapters.

## How to run

Requires Node.js 18+. Everything runs locally and offline:

```bash
npm run build   # regenerate site/ (11 pages)
npm test        # run all 34 tests
npm run check   # build, then test
```

Then open `site/index.html` in any browser (works from the file system, no server needed). To read without building, the Markdown files in `docs/` and `worksheet/` are the source of truth.

## Verification

- `npm run check` — build succeeds (11 pages) and **34/34 tests pass** (0 failures, 0 skipped).
- Link integrity: every internal link and anchor in the generated site was checked programmatically (build test walks all `href` targets and heading ids on all 11 pages).
- Content coverage: automated checks confirm each original-goal topic is present in its chapter (one-hour monthly triage; exact vs near-dupes incl. blurry and button shots; album structure; scan naming/dating; cloud-vs-drive privacy trade; sensitive photos; printing/books/frames; phone retirement), plus glossary term count and worksheet checkboxes.
- Local-first: tests assert zero dependencies in package.json and no network calls in build scripts; the site works from `file://`.
- Privacy: automated secret scan across all source files (API keys, private keys, tokens, hardcoded credentials, email addresses) — clean; no personal data in the repo.
- Manual spot-check: stripped-text dumps of `index.html`, `02-duplicates-decoded.html`, and `triage-worksheet.html` read correctly; tables, task checkboxes, code fences, and blockquotes render as intended.

## Known gaps

- **No images or screenshots.** The guide is text-first; future versions could add illustrated examples (the build already supports print CSS but not image embedding).
- **Markdown engine covers a subset.** Headings, lists (incl. task lists), tables, blockquotes, fenced code, and inline markup. No nested lists, images, footnotes, or YAML front matter — fine for this content, but worth knowing before reusing the engine.
- **Site is not deployed anywhere.** Per project rules, nothing was pushed or published; `site/` is local-only and regenerated via `npm run build`.
- **The `repository` field in package.json points at a GitHub location that has not been created** (no remote setup was allowed); it is metadata only.
- **Print fill-in fields are underscores**, not interactive form fields — by design for printing, but a fillable-PDF variant of the worksheet is a possible future extra.
- **Glossary navigation is find-in-page/anchor based**, no client-side search.
- **No CI.** Tests run locally via `npm test`; wiring them to a CI runner was out of scope for a local-first, never-published project.
