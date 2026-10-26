'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const DOCS = [
  'docs/00-start-here.md',
  'docs/01-monthly-triage-hour.md',
  'docs/02-duplicates-decoded.md',
  'docs/03-albums-youll-actually-keep.md',
  'docs/04-naming-and-dating-scans.md',
  'docs/05-cloud-or-drive.md',
  'docs/06-sensitive-photos.md',
  'docs/07-print-books-and-gifts.md',
  'docs/08-retire-old-phones.md',
  'docs/glossary.md',
  'worksheet/triage-worksheet.md'
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function words(text) {
  return text.toLowerCase().split(/\s+/).filter(Boolean).length;
}

test('every expected source file exists', () => {
  for (const file of DOCS.concat(['README.md', 'LICENSE', 'STATUS.md', 'package.json', '.gitignore'])) {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `missing file: ${file}`);
  }
});

test('every doc opens with a single top-level heading', () => {
  for (const file of DOCS) {
    const md = read(file);
    assert.ok(md.startsWith('# '), `${file} must open with an H1`);
    assert.equal(md.match(/^# /gm).length, 1, `${file} must have exactly one H1`);
  }
});

test('chapters cover the original goal topics', () => {
  const coverage = {
    'docs/00-start-here.md': ['rescue', 'monthly', 'plain english', 'local-first'],
    'docs/01-monthly-triage-hour.md': ['one hour', 'once a month', 'sweep', 'duplicates', 'albums', 'favorites'],
    'docs/02-duplicates-decoded.md': ['exact duplicate', 'near-dupe', 'blurry', 'button shot', 'pocket shot', 'hero shot'],
    'docs/03-albums-youll-actually-keep.md': ['album', 'archive', 'retrieval', 'low-energy'],
    'docs/04-naming-and-dating-scans.md': ['yyyy-mm-dd', 'scan', 'date', 'unknown'],
    'docs/05-cloud-or-drive.md': ['cloud', 'own drive', 'privacy', 'two-copies rule', 'offsite'],
    'docs/06-sensitive-photos.md': ['sensitive', 'hidden', 'medical', 'kids', 'vault'],
    'docs/07-print-books-and-gifts.md': ['print', 'book', 'frame', 'calendar'],
    'docs/08-retire-old-phones.md': ['rescue the photos', 'factory reset', 'sim', 'recycle', 'battery'],
    'docs/glossary.md': ['triage', 'two-copies rule', 'hero shot', 'metadata']
  };
  for (const [file, terms] of Object.entries(coverage)) {
    const text = read(file).toLowerCase();
    for (const term of terms) {
      assert.ok(text.includes(term), `${file} must cover "${term}"`);
    }
  }
});

test('each chapter is substantial and links onward', () => {
  for (const file of DOCS.slice(0, 9)) {
    const md = read(file);
    assert.ok(words(md) >= 400, `${file} should be substantive (>= 400 words), got ${words(md)}`);
    assert.ok(/\]\([^)]+\.md/.test(md), `${file} should link to another guide page`);
  }
});

test('glossary defines at least 20 terms', () => {
  const terms = read('docs/glossary.md').match(/^### /gm) || [];
  assert.ok(terms.length >= 20, `glossary needs >= 20 terms, found ${terms.length}`);
});

test('worksheet is printable with real checkboxes', () => {
  const ws = read('worksheet/triage-worksheet.md');
  const boxes = ws.match(/^- \[ \]/gm) || [];
  assert.ok(boxes.length >= 15, `worksheet needs >= 15 checkboxes, found ${boxes.length}`);
  assert.ok(ws.includes('Block 1'), 'worksheet should mirror the hour blocks');
  assert.ok(ws.includes('two-copies rule'), 'worksheet should mention the two-copies rule');
});

test('every internal markdown link in docs resolves to a real file', () => {
  for (const file of DOCS) {
    const dir = path.dirname(path.join(ROOT, file));
    const text = read(file);
    const links = [...text.matchAll(/\]\(([^)#]+?\.md)(#[^)]*)?\)/g)].map((m) => m[1]);
    for (const link of links) {
      const target = path.resolve(dir, link);
      assert.ok(
        fs.existsSync(target),
        `${file} links to missing file: ${link}`
      );
    }
  }
});

test('README is complete and credits the LLC', () => {
  const readme = read('README.md');
  for (const needle of [
    'photo-dedupe-lite-cli',
    'backup-basics-handbook',
    'Asdale Dynamics, LLC',
    'Copyright (c) 2026 Asdale Dynamics, LLC',
    'npm run build',
    'npm test',
    'site/index.html',
    'works offline',
    'MIT'
  ]) {
    assert.ok(readme.includes(needle), `README should include "${needle}"`);
  }
  assert.ok(words(readme) >= 350, 'README should be substantive');
});

test('LICENSE carries the exact required copyright line', () => {
  const license = read('LICENSE');
  assert.ok(license.includes('MIT License'), 'LICENSE should be MIT');
  assert.ok(
    license.includes('Copyright (c) 2026 Asdale Dynamics, LLC'),
    'LICENSE copyright line must be exact'
  );
});

test('no secrets or personal data anywhere in the repo', () => {
  const offenders = [];
  const patterns = [
    [/AKIA[0-9A-Z]{16}/, 'aws access key id'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
    [/\b(sk-|ghp_|gho_|github_pat_)[A-Za-z0-9_\-]{20,}/, 'api token'],
    [/(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][^"']{8,}["']/i, 'hardcoded credential'],
    [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, 'email address']
  ];
  const files = DOCS.concat(
    ['README.md', 'LICENSE', 'STATUS.md', 'package.json'],
    fs.readdirSync(path.join(ROOT, 'scripts')).map((f) => `scripts/${f}`),
    fs.readdirSync(path.join(ROOT, 'tests')).map((f) => `tests/${f}`)
  );
  for (const file of files) {
    const text = read(file);
    for (const [pattern, label] of patterns) {
      if (pattern.test(text)) offenders.push(`${file}: ${label}`);
    }
  }
  assert.deepEqual(offenders, []);
});
