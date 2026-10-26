'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

test('project stays dependency-free and local-first', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.dependencies, undefined, 'no runtime dependencies allowed');
  assert.equal(pkg.devDependencies, undefined, 'no dev dependencies allowed');
  for (const script of ['scripts/build.js', 'scripts/markdown.js']) {
    const code = read(script);
    assert.ok(!/require\(['"](http|https|axios|node-fetch|got|request)['"]\)/.test(code), `${script} must not make network calls`);
  }
});

test('the guide is warm and written like a friend would', () => {
  const welcome = read('docs/00-start-here.md').toLowerCase();
  assert.ok(welcome.includes('never condescending'), 'welcome chapter should state the tone');
  assert.ok(read('README.md').toLowerCase().includes('warm'), 'README should carry the warmth');
  assert.ok(welcome.includes('guilt'), 'the guide should explicitly defuse guilt');
});

test('the monthly ritual is concrete and repeatable', () => {
  const hour = read('docs/01-monthly-triage-hour.md').toLowerCase().replace(/–/g, '-');
  assert.ok(hour.includes('monthly'), 'the hour must be explicitly monthly');
  for (const block of ['block one', 'block two', 'block three', 'block four', 'block five']) {
    assert.ok(hour.includes(block), `the hour should define ${block}`);
  }
  assert.ok(hour.includes('55-60'), 'the hour must be bounded at 60 minutes');
});

test('STATUS.md documents the project honestly', () => {
  const status = read('STATUS.md').toLowerCase();
  for (const section of ['what was built', 'how to run', 'verification', 'known gaps']) {
    assert.ok(status.includes(section), `STATUS.md needs a "${section}" section`);
  }
});

test('site output is regenerable, never a source of truth', () => {
  const ignore = read('.gitignore');
  assert.ok(ignore.includes('site/'), 'generated site must be gitignored');
  assert.ok(ignore.includes('node_modules/'), 'node_modules must be gitignored');
});
