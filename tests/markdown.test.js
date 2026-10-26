'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { escapeHtml, slugify, inline, mdToHtml, extractTitle } = require('../scripts/markdown');

const AMP = '&' + 'amp;';
const LT = '&' + 'lt;';
const GT = '&' + 'gt;';
const QUOT = '&' + 'quot;';

test('escapeHtml escapes the dangerous characters', () => {
  assert.equal(escapeHtml('<b>&"x'), LT + 'b' + GT + AMP + QUOT + 'x');
});

test('slugify produces stable anchor ids', () => {
  assert.equal(slugify('The Monthly Triage Hour'), 'the-monthly-triage-hour');
  assert.equal(slugify('Keep, question, delete'), 'keep-question-delete');
  assert.equal(slugify('Block 2 — duplicates'), 'block-2-duplicates');
  assert.equal(slugify('photo-dedupe-lite-cli'), 'photo-dedupe-lite-cli');
});

test('inline renders bold, emphasis, links, and code', () => {
  assert.equal(inline('a **bold** move'), 'a <strong>bold</strong> move');
  assert.equal(inline('a *gentle* nudge'), 'a <em>gentle</em> nudge');
  assert.equal(inline('[label](file.md)'), '<a href="file.md">label</a>');
  assert.equal(inline('run `ls -la` first'), 'run <code>ls -la</code> first');
});

test('inline escapes html in prose and code spans', () => {
  assert.equal(inline('5 < 6 & 7 > 4'), '5 ' + LT + ' 6 ' + AMP + ' 7 ' + GT + ' 4');
  assert.equal(inline('use `<div>` tags'), 'use <code>' + LT + 'div' + GT + '</code> tags');
});

test('mdToHtml renders headings with anchor ids', () => {
  const html = mdToHtml('# Welcome\n\n## Second level');
  assert.match(html, /<h1 id="welcome">Welcome<\/h1>/);
  assert.match(html, /<h2 id="second-level">Second level<\/h2>/);
});

test('mdToHtml renders paragraphs joined across soft wraps', () => {
  const html = mdToHtml('first line\nstill the same paragraph');
  assert.match(html, /<p>first line still the same paragraph<\/p>/);
});

test('mdToHtml renders unordered, ordered, and task lists', () => {
  assert.match(mdToHtml('- one\n- two'), /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(mdToHtml('1. one\n2. two'), /<ol><li>one<\/li><li>two<\/li><\/ol>/);
  const tasks = mdToHtml('- [ ] todo\n- [x] done');
  assert.match(tasks, /<ul class="tasks">/);
  assert.match(tasks, /<input type="checkbox" disabled>/);
  assert.match(tasks, /<input type="checkbox" disabled checked>/);
});

test('mdToHtml renders blockquotes', () => {
  const html = mdToHtml('> wise words\n> more wisdom');
  assert.match(html, /<blockquote><p>wise words more wisdom<\/p><\/blockquote>/);
});

test('mdToHtml renders fenced code blocks escaped', () => {
  const html = mdToHtml('```text\n<img>\n```');
  assert.match(html, /<pre><code>/);
  assert.ok(html.includes('<pre><code>' + LT + 'img' + GT + '</code></pre>'));
});

test('mdToHtml renders pipe tables', () => {
  const html = mdToHtml('| A | B |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /<table><thead><tr><th>A<\/th><th>B<\/th><\/tr><\/thead>/);
  assert.match(html, /<tbody><tr><td>1<\/td><td>2<\/td><\/tr><\/tbody><\/table>/);
});

test('mdToHtml renders horizontal rules', () => {
  assert.match(mdToHtml('above\n\n---\n\nbelow'), /<hr>/);
});

test('extractTitle reads the first h1', () => {
  assert.equal(extractTitle('# Hello there\n\nbody'), 'Hello there');
  assert.equal(extractTitle('no heading', 'Fallback'), 'Fallback');
});
