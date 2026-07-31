// tools/build-search-index.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DEFAULT_DOCS_DIR = path.join(ROOT, 'docs', 'docs');
const DEFAULT_I18N_DIR = path.join(ROOT, 'docs', 'i18n');
const DEFAULT_SHELL_PATH = path.join(ROOT, 'docs', 'docs-shell.js');
const DEFAULT_OUTPUT_PATH = path.join(ROOT, 'docs', 'search-index.json');

/* Extracts the `var NAV = [...]` literal out of docs-shell.js and evaluates
   it in an isolated vm context (no access to real globals) -- safer than a
   plain eval() of the whole file, and avoids needing docs-shell.js to
   export anything just for this tool. Bracket-matched, not regex-terminated,
   so it doesn't break if a label/kw string ever contains "];" . */
function extractNav(shellPath) {
  const src = fs.readFileSync(shellPath, 'utf8');
  const marker = 'var NAV = ';
  const start = src.indexOf(marker);
  if (start === -1) throw new Error('extractNav: "var NAV = [" not found in ' + shellPath);
  let depth = 0, i = start + marker.length, end = -1;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) throw new Error('extractNav: unterminated NAV array literal in ' + shellPath);
  const literal = src.slice(start + marker.length, end);
  const sandbox = {};
  vm.createContext(sandbox);
  return vm.runInContext('(' + literal + ')', sandbox);
}

function stripTags(html) {
  return html
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' ') // code samples: out of scope for prose search
    // material-symbols-outlined spans render as icon glyphs via font ligature; their text
    // content (e.g. "widgets", "info") is not prose and must not leak into titles/slugs/search text.
    .replace(/<span class="material-symbols-outlined"[^>]*>[\s\S]*?<\/span>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text, existingIds) {
  let base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!base) base = 'section';
  let candidate = base, n = 2;
  while (existingIds.has(candidate)) { candidate = base + '-' + n; n++; }
  existingIds.add(candidate);
  return candidate;
}

/* Splits a page's .docs-page content into sections at each
   .docs-section-title boundary, generates/reuses a stable id per section,
   patches the HTML with any missing ids, and returns both the parsed
   sections and (if anything changed) the patched HTML to write back. */
function extractSections(html, pageFile) {
  const pageOpenMatch = html.match(/<div class="docs-page"[^>]*>/);
  const shellScriptIdx = html.indexOf('<script src="../docs-shell.js">');
  if (!pageOpenMatch || shellScriptIdx === -1) {
    throw new Error('extractSections: could not find .docs-page / docs-shell.js boundary in ' + pageFile);
  }
  const contentStart = pageOpenMatch.index + pageOpenMatch[0].length;
  const content = html.slice(contentStart, shellScriptIdx);

  const titleRe = /<div class="docs-section-title"( id="([a-z0-9-]+)")?([^>]*)>([\s\S]*?)<\/div>/g;
  const matches = [];
  let m;
  while ((m = titleRe.exec(content)) !== null) {
    matches.push({ fullMatch: m[0], index: m.index, existingId: m[2] || null, attrs: m[3], titleInner: m[4] });
  }

  const existingIds = new Set(matches.filter(x => x.existingId).map(x => x.existingId));
  const sections = [];
  let changed = false;
  let patchedContent = content;
  let offsetShift = 0;

  matches.forEach((match, idx) => {
    const sectionStart = match.index;
    const sectionEnd = idx + 1 < matches.length ? matches[idx + 1].index : content.length;
    const sectionSpan = content.slice(sectionStart, sectionEnd);
    const titleText = stripTags(match.titleInner);
    const sectionId = match.existingId || slugify(titleText, existingIds);

    const idAttrMatch = match.attrs.match(/data-wui-i18n(-html)?="([\w]+)"/);
    // Collect every data-wui-i18n*/data-wui-i18n-html id referenced anywhere in this section's span.
    const ids = [];
    const idRe = /data-wui-i18n(?:-html)?="([\w]+)"/g;
    let im;
    while ((im = idRe.exec(sectionSpan)) !== null) ids.push(im[1]);

    sections.push({ sectionId, titleText, ids, rawTextEn: stripTags(sectionSpan) });

    if (!match.existingId) {
      changed = true;
      const insertAt = match.index + match.fullMatch.indexOf('"docs-section-title"') + '"docs-section-title"'.length + offsetShift;
      const insertion = ' id="' + sectionId + '"';
      patchedContent = patchedContent.slice(0, insertAt) + insertion + patchedContent.slice(insertAt);
      offsetShift += insertion.length;
    }
  });

  const patchedHtml = changed
    ? html.slice(0, contentStart) + patchedContent + html.slice(shellScriptIdx)
    : html;

  return { sections, patchedHtml, changed };
}

/* Resolves EN+AR text for a list of i18n ids against docs/i18n/<page>.js,
   if that file exists. EN is NOT read from here -- callers already have EN
   from the HTML itself (extractSections' rawTextEn), since the HTML's own
   marker content IS the EN fallback by WUI.i18n's design. This function's
   job is purely: get AR text, and report any id with no AR entry so the
   caller can decide whether that's a real gap (page has an i18n file but is
   missing this one id) vs expected (page has no i18n file at all). */
function resolveI18n(ids, pageFile, i18nDir) {
  const i18nFile = path.join(i18nDir, pageFile.replace(/\.html$/, '.js'));
  if (!fs.existsSync(i18nFile)) {
    return { textAr: '', missing: [] };
  }
  const src = fs.readFileSync(i18nFile, 'utf8');
  const entryRe = /\{\s*lang:\s*'(en|ar)',\s*id:\s*'([\w]+)',\s*value:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  const arById = {};
  const seenIds = new Set();
  let em;
  while ((em = entryRe.exec(src)) !== null) {
    const [, lang, id, rawValue] = em;
    seenIds.add(id);
    if (lang === 'ar') arById[id] = rawValue.replace(/\\'/g, "'").replace(/\\n/g, ' ');
  }
  const missing = ids.filter(id => !seenIds.has(id));
  const textAr = stripTags(ids.map(id => arById[id] || '').join(' '));
  return { textAr, missing };
}

function buildIndex(opts) {
  const docsDir = (opts && opts.docsDir) || DEFAULT_DOCS_DIR;
  const i18nDir = (opts && opts.i18nDir) || DEFAULT_I18N_DIR;
  const shellPath = (opts && opts.shellPath) || DEFAULT_SHELL_PATH;

  const nav = extractNav(shellPath);
  const navByFile = {};
  nav.forEach(group => group.items.forEach(item => {
    if (item.file) navByFile[item.file] = { group: group.group, label: item.label, kw: item.kw || '' };
  }));

  const index = [];
  const missingRefs = [];
  const patchedFiles = [];

  const pageFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.html'));
  pageFiles.forEach(pageFile => {
    const fullPath = path.join(docsDir, pageFile);
    const html = fs.readFileSync(fullPath, 'utf8');
    const heroTitleMatch = html.match(/<div class="docs-hero-title"[^>]*>([\s\S]*?)<\/div>/);
    const pageTitle = heroTitleMatch ? stripTags(heroTitleMatch[1]) : pageFile.replace(/\.html$/, '');
    const navEntry = navByFile[pageFile] || { group: '', label: pageTitle, kw: '' };

    const { sections, patchedHtml, changed } = extractSections(html, pageFile);
    if (changed) {
      fs.writeFileSync(fullPath, patchedHtml, 'utf8');
      patchedFiles.push(pageFile);
    }

    sections.forEach(section => {
      const { textAr, missing } = resolveI18n(section.ids, pageFile, i18nDir);
      missing.forEach(id => missingRefs.push({ page: pageFile, id: id }));
      index.push({
        id: pageFile.replace(/\.html$/, '') + '#' + section.sectionId,
        kind: 'section',
        page: pageFile,
        pageTitle: pageTitle,
        group: navEntry.group,
        sectionId: section.sectionId,
        textEn: section.rawTextEn,
        textAr: textAr
      });
    });

    index.push({
      id: 'nav#' + pageFile.replace(/\.html$/, ''),
      kind: 'nav',
      page: pageFile,
      pageTitle: pageTitle,
      group: navEntry.group,
      textEn: (navEntry.label + ' ' + navEntry.kw).trim(),
      textAr: ''
    });
  });

  return { index, missingRefs, patchedFiles };
}

function main() {
  const { index, missingRefs, patchedFiles } = buildIndex({});
  if (missingRefs.length > 0) {
    console.error('build-search-index: ' + missingRefs.length + ' unresolved i18n reference(s):');
    missingRefs.forEach(r => console.error('  ' + r.page + ': missing AR entry for id "' + r.id + '"'));
    process.exit(1);
  }
  fs.writeFileSync(DEFAULT_OUTPUT_PATH, JSON.stringify(index, null, 1), 'utf8');
  console.log('build-search-index: wrote ' + index.length + ' documents to docs/search-index.json' +
    (patchedFiles.length ? ('; injected section ids into ' + patchedFiles.length + ' page(s): ' + patchedFiles.join(', ')) : ''));
}

module.exports = { extractNav, extractSections, resolveI18n, buildIndex };
if (require.main === module) main();
