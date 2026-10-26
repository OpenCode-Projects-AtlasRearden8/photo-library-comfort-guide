'use strict';

const AMP = '&' + 'amp;';
const LT = '&' + 'lt;';
const GT = '&' + 'gt;';
const QUOT = '&' + 'quot;';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT);
}

function slugify(text) {
  return String(text)
    .replace(/[*`_]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function inline(text) {
  const codes = [];
  let s = String(text).replace(/`([^`]+)`/g, (match, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = escapeHtml(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
    return `<a href="${href}">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (match, index) => {
    return `<code>${escapeHtml(codes[Number(index)])}</code>`;
  });
  return s;
}

function isHr(line) {
  return /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function isTableSeparator(line) {
  return /^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
}

function isTableRow(line) {
  return /^\s*\|.+\|\s*$/.test(line);
}

function isTableStart(line, next) {
  return isTableRow(line) && next !== undefined && isTableSeparator(next);
}

function parseRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function renderTable(headerCells, bodyRows) {
  const head = `<tr>${headerCells.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr>`;
  const body = bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

const blockStart = /^(#{1,6})\s+|^```|^>|^\s*\||^\s*([-*+]|\d+[.)])\s+|^[-*]{3,}$/;

function renderBlocks(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    if (line.trim().startsWith('```')) {
      i += 1;
      const buffer = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(`<pre><code>${escapeHtml(buffer.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level} id="${slugify(heading[2])}">${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }
    if (isHr(line)) {
      out.push('<hr>');
      i += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const buffer = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        buffer.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${renderBlocks(buffer)}</blockquote>`);
      continue;
    }
    if (i + 1 < lines.length && isTableStart(line, lines[i + 1])) {
      const headerCells = parseRow(line);
      i += 2;
      const bodyRows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        bodyRows.push(parseRow(lines[i]));
        i += 1;
      }
      out.push(renderTable(headerCells, bodyRows));
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2]);
      const itemPattern = ordered ? /^(\s*)(\d+[.)])\s+(.*)$/ : /^(\s*)([-*+])\s+(.*)$/;
      let taskAll = true;
      let anyTask = false;
      const items = [];
      while (i < lines.length) {
        if (lines[i].trim() === '') {
          if (i + 1 < lines.length && itemPattern.test(lines[i + 1])) {
            i += 1;
            continue;
          }
          break;
        }
        const m = lines[i].match(itemPattern);
        if (!m) break;
        let content = m[3];
        const task = content.match(/^\[( |x|X)\]\s*(.*)$/);
        if (task) {
          anyTask = true;
          const checked = /x/i.test(task[1]) ? ' checked' : '';
          content = `<input type="checkbox" disabled${checked}> ${inline(task[2])}`;
        } else {
          taskAll = false;
          content = inline(content);
        }
        items.push(content);
        i += 1;
      }
      const cls = anyTask && taskAll && !ordered ? ' class="tasks"' : '';
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}${cls}>${items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`);
      continue;
    }
    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== '' && !blockStart.test(lines[i])) {
      paragraph.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${inline(paragraph.join(' ').trim())}</p>`);
  }
  return out.join('\n');
}

function mdToHtml(markdown) {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  return renderBlocks(lines);
}

function extractTitle(markdown, fallback) {
  const match = String(markdown).match(/^#\s+(.+)$/m);
  return match ? inline(match[1]) : fallback || 'Untitled';
}

module.exports = { escapeHtml, slugify, inline, mdToHtml, extractTitle };
