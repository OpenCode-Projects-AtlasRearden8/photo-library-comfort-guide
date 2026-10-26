'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');

const EXPECTED = [
  'index.html',
  '01-monthly-triage-hour.html',
  '02-duplicates-decoded.html',
  '03-albums-youll-actually-keep.html',
  '04-naming-and-dating-scans.html',
  '05-cloud-or-drive.html',
  '06-sensitive-photos.html',
  '07-print-books-and-gifts.html',
  '08-retire-old-phones.html',
  'glossary.html',
  'triage-worksheet.html'
];

test.before(() => {
  const result = spawnSync('node', ['scripts/build.js'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, `build failed: ${result.stderr || result.stdout}`);
});

test('build produces every expected page', () => {
  for (const file of EXPECTED) {
    assert.ok(fs.existsSync(path.join(SITE, file)), `missing built page: site/${file}`);
  }
});

test('every page is a complete, standalone HTML document', () => {
  for (const file of EXPECTED) {
    const html = fs.readFileSync(path.join(SITE, file), 'utf8');
    assert.ok(html.startsWith('<!doctype html>'), `${file} should start with doctype`);
    assert.ok(/<title>[^<]+<\/title>/.test(html), `${file} needs a title`);
    assert.ok(html.includes('lang="en"'), `${file} needs lang`);
    assert.ok(html.includes('viewport'), `${file} needs viewport meta`);
    assert.ok(html.includes('Copyright (c) 2026 Asdale Dynamics, LLC'), `${file} footer must credit the LLC`);
    assert.ok(html.includes('Asdale Dynamics, LLC'), `${file} must credit the LLC`);
    assert.ok(!html.includes('\u0000'), `${file} has an unresolved code placeholder`);
    assert.ok(!/undefined/.test(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')), `${file} contains the string undefined`);
  }
});

test('every internal link resolves, including anchors', () => {
  const idsOf = (file) => {
    const html = fs.readFileSync(path.join(SITE, file), 'utf8');
    return new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  };
  for (const file of EXPECTED) {
    const html = fs.readFileSync(path.join(SITE, file), 'utf8');
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const [target, anchor] = href.split('#');
      assert.ok(!target.endsWith('.md'), `${file} still links to a markdown file: ${href}`);
      assert.ok(fs.existsSync(path.join(SITE, target)), `${file} links to missing page: ${href}`);
      if (anchor) {
        assert.ok(idsOf(target).has(anchor), `${file} links to missing anchor #${anchor} in ${target}`);
      }
    }
  }
});

test('worksheet page renders printable checkboxes', () => {
  const html = fs.readFileSync(path.join(SITE, 'triage-worksheet.html'), 'utf8');
  const boxes = html.match(/<input type="checkbox"/g) || [];
  assert.ok(boxes.length >= 15, `worksheet needs >= 15 rendered checkboxes, found ${boxes.length}`);
});

test('glossary page renders at least 20 anchored terms', () => {
  const html = fs.readFileSync(path.join(SITE, 'glossary.html'), 'utf8');
  const h3 = html.match(/<h3 id="/g) || [];
  assert.ok(h3.length >= 20, `glossary needs >= 20 anchored terms, found ${h3.length}`);
});

test('tables and code blocks made it through conversion', () => {
  const cloud = fs.readFileSync(path.join(SITE, '05-cloud-or-drive.html'), 'utf8');
  assert.ok(cloud.includes('<table>'), 'cloud chapter should contain a table');
  const hour = fs.readFileSync(path.join(SITE, '01-monthly-triage-hour.html'), 'utf8');
  assert.ok(hour.includes('<pre><code>'), 'triage chapter should contain a code block');
  assert.ok(hour.includes('<table>'), 'triage chapter should contain the hour table');
});

test('navigation links every page from every page', () => {
  for (const file of EXPECTED) {
    const html = fs.readFileSync(path.join(SITE, file), 'utf8');
    for (const target of EXPECTED) {
      assert.ok(html.includes(`href="${target}"`), `${file} nav should link ${target}`);
    }
  }
});
