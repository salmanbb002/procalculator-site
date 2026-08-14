#!/usr/bin/env node
// Renders static <a> card HTML into the JS-populated grid containers on the
// homepage and every calculators/*.html page, using assets/js/tools-data.js
// as the single source of truth. This keeps the raw HTML crawlable without
// requiring JS execution, while the same client-side scripts (home.js /
// browse.js) still run on load and re-render identical (or filtered) markup.
//
// Re-run this any time a calculator is added to tools-data.js:
//   node scripts/prerender.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// --- load tools-data.js (a plain browser script, not a module) into a sandbox ---
// `const`/`let` at the top level of a vm context create bindings in a
// lexical environment that isn't exposed on the sandbox object, so rewrite
// to `var` (function declarations are already sandbox properties).
const dataSrc = readFileSync(path.join(ROOT, 'assets/js/tools-data.js'), 'utf8')
  .replace(/^const /gm, 'var ');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const { CATEGORIES, TOOLS, NEW_TOOLS, POPULAR_TOOLS, FUN_TOOLS, getCategoryById, toolsInCategory } = sandbox;

const badgeLabel = { hot: 'Hot', trending: 'Trending', new: 'New' };

function badgeHtml(t) {
  if (t.badge) return `<span class="badge badge-${t.badge}">${badgeLabel[t.badge]}</span>`;
  if (!t.functional) return '<span class="badge badge-soon">Coming soon</span>';
  return '';
}

function toolCardHtml(t, catLabel) {
  return `
        <a class="card card-link tool-card" href="/calculator/${t.id}">
          <div class="top-row"><div class="tool-icon">${t.icon}</div>${badgeHtml(t)}</div>
          <div><span class="cat-tag">${catLabel}</span><h3>${t.title}</h3><p>${t.desc}</p></div>
        </a>`;
}

function funCardHtml(t) {
  const soon = !t.functional ? '<span class="badge badge-soon">Soon</span>' : '';
  return `
      <a class="card card-link tool-card fun-card" href="/calculator/${t.id}">
        <div class="top-row"><div class="tool-icon">${t.icon}</div>${soon}</div>
        <div><span class="cat-tag">Fun &amp; Quirky</span><h3>${t.title}</h3><p>${t.desc}</p></div>
      </a>`;
}

function categoryCardHtml(c) {
  const tools = toolsInCategory(c.id);
  const links = tools.slice(0, 5)
    .map(t => `<li><a href="/calculator/${t.id}">${t.title.replace(/ Calculator.*| Estimator.*/, '')}</a></li>`)
    .join('');
  return `
        <div class="card category-card">
          <div class="head"><div class="emoji">${c.emoji}</div>
            <div><h3>${c.label}</h3><span class="count">${tools.length} calculators</span></div>
          </div>
          <p>${c.blurb}</p>
          <ul class="cat-links">${links}</ul>
          <a class="view-all" href="/calculators/${c.id}">View all ${c.label} calculators →</a>
        </div>`;
}

function newItemHtml(t) {
  return `
      <a class="new-item card-link" href="/calculator/${t.id}">
        <div class="emoji">${t.icon}</div>
        <div class="info"><strong>${t.title}</strong><span>${getCategoryById(t.category).label} · Added this month</span></div>
        <span class="badge badge-new">New</span>
      </a>`;
}

// Replace a data-attributed div's complete inner HTML. A non-greedy regex is
// unsafe here because every card contains nested divs; repeated prerenders
// would stop at the first child closing tag and leave duplicate card markup.
function injectInto(html, attr, innerHtml) {
  const openRe = new RegExp(`<div\\b[^>]*\\b${attr}(?:="[^"]*")?[^>]*>`, 'i');
  const openMatch = openRe.exec(html);
  if (!openMatch) throw new Error(`Could not find container for ${attr}`);

  const contentStart = openMatch.index + openMatch[0].length;
  const divTagRe = /<\/?div\b[^>]*>/gi;
  divTagRe.lastIndex = contentStart;
  let depth = 1;
  let closingStart = -1;
  let match;

  while ((match = divTagRe.exec(html))) {
    if (/^<\/div/i.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      closingStart = match.index;
      break;
    }
  }

  if (closingStart < 0) throw new Error(`Could not find closing div for ${attr}`);
  return `${html.slice(0, contentStart)}${innerHtml}\n        ${html.slice(closingStart)}`;
}

function writeFile(relPath, html) {
  writeFileSync(path.join(ROOT, relPath), html, 'utf8');
  console.log('updated', relPath);
}

// ---------------- index.html ----------------
{
  let html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  html = injectInto(html, 'data-popular-grid', POPULAR_TOOLS.map(t => toolCardHtml(t, getCategoryById(t.category).label)).join(''));
  html = injectInto(html, 'data-fun-row', FUN_TOOLS.map(funCardHtml).join(''));
  html = injectInto(html, 'data-category-grid', CATEGORIES.filter(c => c.id !== 'fun').map(categoryCardHtml).join(''));
  html = injectInto(html, 'data-new-list', NEW_TOOLS.map(newItemHtml).join(''));
  writeFile('index.html', html);
}

// ---------------- about.html (category grid only) ----------------
{
  let html = readFileSync(path.join(ROOT, 'about.html'), 'utf8');
  html = injectInto(html, 'data-category-grid', CATEGORIES.filter(c => c.id !== 'fun').map(categoryCardHtml).join(''));
  writeFile('about.html', html);
}

// ---------------- calculators.html (all tools) ----------------
{
  let html = readFileSync(path.join(ROOT, 'calculators.html'), 'utf8');
  const grid = TOOLS.map(t => toolCardHtml(t, getCategoryById(t.category).label)).join('');
  html = injectInto(html, 'data-tool-grid', grid);
  html = html.replace(
    /(<p class="results-meta" data-results-meta>)([\s\S]*?)(<\/p>)/,
    `$1Showing ${TOOLS.length} of ${TOOLS.length} calculators$3`
  );
  writeFile('calculators.html', html);
}

// ---------------- calculators/*.html (per category) ----------------
for (const c of CATEGORIES) {
  const rel = `calculators/${c.id}.html`;
  let html;
  try {
    html = readFileSync(path.join(ROOT, rel), 'utf8');
  } catch {
    console.warn('skip (not found):', rel);
    continue;
  }
  const tools = toolsInCategory(c.id);
  const grid = tools.map(t => toolCardHtml(t, c.label)).join('');
  html = injectInto(html, 'data-tool-grid', grid);
  html = html.replace(
    /(<p class="results-meta" data-results-meta>)([\s\S]*?)(<\/p>)/,
    `$1Showing ${tools.length} of ${tools.length} calculators$3`
  );
  writeFile(rel, html);
}

console.log(`\nDone. Prerendered ${TOOLS.length} tools across ${CATEGORIES.length} categories.`);
