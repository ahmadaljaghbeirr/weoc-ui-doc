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
   sections and (if anything changed) the patched HTML to write back.

   The closing boundary is "wherever this page loads docs-shell.js" --
   matched by a relative-path-agnostic regex (`[^"]*docs-shell\.js`)
   rather than a literal `../docs-shell.js`, because docs/docs/*.html pages
   are one level deep (`../docs-shell.js`) but docs/index.html (the home
   page) lives at the docs root and loads it as `./docs-shell.js`. */
function extractSections(html, pageFile) {
  const pageOpenMatch = html.match(/<div class="docs-page"[^>]*>/);
  const shellScriptMatch = html.match(/<script src="[^"]*docs-shell\.js"[^>]*>/);
  if (!pageOpenMatch || !shellScriptMatch) {
    throw new Error('extractSections: could not find .docs-page / docs-shell.js boundary in ' + pageFile);
  }
  const contentStart = pageOpenMatch.index + pageOpenMatch[0].length;
  const shellScriptIdx = shellScriptMatch.index;
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

    // The title div's OWN i18n id (if it carries one directly), distinct from
    // `ids` below (every i18n id anywhere in the section's span, used for the
    // section's full-text AR resolution). Used to resolve just the title's AR
    // text for search-result labels -- see resolveI18n call sites in
    // buildIndex(). null when the title div has no i18n marker of its own
    // (e.g. an untranslated/legacy section).
    const idAttrMatch = match.attrs.match(/data-wui-i18n(-html)?="([\w]+)"/);
    const titleId = idAttrMatch ? idAttrMatch[2] : null;

    // Collect every data-wui-i18n*/data-wui-i18n-html id referenced anywhere in this section's span.
    const ids = [];
    const idRe = /data-wui-i18n(?:-html)?="([\w]+)"/g;
    let im;
    while ((im = idRe.exec(sectionSpan)) !== null) ids.push(im[1]);

    sections.push({ sectionId, titleText, titleId, ids, rawTextEn: stripTags(sectionSpan) });

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
   from the HTML itself (extractSections' rawTextEn/titleText), since the
   HTML's own marker content IS the EN fallback by WUI.i18n's design. This
   function's job is purely: get AR text, and report any id with no AR entry
   so the caller can decide whether that's a real gap (page has an i18n file
   but is missing this one id) vs expected (page has no i18n file at all).

   index.html (the home page) is special-cased to home.js: every other page's
   i18n file shares its basename with the page (widgets.html -> widgets.js),
   but the home page's i18n file predates this indexer and is named home.js,
   not index.js. */
function resolveI18n(ids, pageFile, i18nDir) {
  const i18nBasename = pageFile === 'index.html' ? 'home' : pageFile.replace(/\.html$/, '');
  const i18nFile = path.join(i18nDir, i18nBasename + '.js');
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
  // The home page (docs/index.html) lives one directory above docsDir
  // (docs/docs) -- deriving it that way keeps a fixtures dir shaped like
  // <fixtureRoot>/docs/docs + <fixtureRoot>/docs/index.html working the same
  // way the real repo's docs/docs + docs/index.html does, with no separate
  // default constant to keep in sync. opts.homePath overrides for tests that
  // want to point at an arbitrary fixture location (or opt out with null).
  const homePath = (opts && 'homePath' in opts) ? opts.homePath : path.join(docsDir, '..', 'index.html');

  const nav = extractNav(shellPath);
  // Keyed by `page` (the file name search docs/href logic uses everywhere
  // else -- 'widgets.html', etc.) -- including the home NAV item, whose
  // `file` is null but which is addressed as 'index.html' throughout this
  // indexer and at runtime (docs-shell.js getHref/nsForUrl/rootForPath all
  // special-case null-file/index.html as "the page at root").
  const navByFile = {};
  nav.forEach(group => group.items.forEach(item => {
    const page = item.file || 'index.html';
    navByFile[page] = { group: group.group, label: item.label, kw: item.kw || '', key: item.key };
  }));

  const index = [];
  const missingRefs = [];
  const patchedFiles = [];
  const pageTitleByFile = {};

  const pageFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.html'))
    .map(f => ({ pageFile: f, fullPath: path.join(docsDir, f) }));
  if (homePath && fs.existsSync(homePath)) {
    pageFiles.push({ pageFile: 'index.html', fullPath: homePath });
  }

  pageFiles.forEach(({ pageFile, fullPath }) => {
    const html = fs.readFileSync(fullPath, 'utf8');
    const heroTitleMatch = html.match(/<div class="docs-hero-title"[^>]*>([\s\S]*?)<\/div>/);
    const pageTitle = heroTitleMatch ? stripTags(heroTitleMatch[1]) : pageFile.replace(/\.html$/, '');
    pageTitleByFile[pageFile] = pageTitle;
    const navEntry = navByFile[pageFile] || { group: '', label: pageTitle, kw: '' };

    const { sections, patchedHtml, changed } = extractSections(html, pageFile);
    if (changed) {
      fs.writeFileSync(fullPath, patchedHtml, 'utf8');
      // Repo-root-relative, forward-slashed -- consumed by main()'s
      // PATCHED: output and, downstream, by tools/git-hooks/pre-commit to
      // `git add` exactly the files this run actually touched.
      patchedFiles.push(path.relative(ROOT, fullPath).replace(/\\/g, '/'));
    }

    sections.forEach(section => {
      const { textAr, missing } = resolveI18n(section.ids, pageFile, i18nDir);
      missing.forEach(id => missingRefs.push({ page: pageFile, id: id }));
      // Title AR resolution is intentionally a second, narrower resolveI18n
      // call scoped to just the title's own id (when it has one) rather than
      // reusing `textAr` above -- the section's full-text AR is the whole
      // span's translation, not just the title's. Any missing-id here was
      // already reported by the call above (titleId is always a member of
      // `ids`, since idRe scans the same span starting at the title div
      // itself), so its `missing` is deliberately discarded to avoid a
      // duplicate report for the same id.
      const titleAr = section.titleId ? resolveI18n([section.titleId], pageFile, i18nDir).textAr : '';
      index.push({
        id: pageFile.replace(/\.html$/, '') + '#' + section.sectionId,
        kind: 'section',
        page: pageFile,
        pageTitle: pageTitle,
        group: navEntry.group,
        sectionId: section.sectionId,
        titleEn: section.titleText,
        titleAr: titleAr,
        textEn: section.rawTextEn,
        textAr: textAr
      });
    });
  });

  // Nav-level docs: one per NAV array entry (spec requirement -- "emit one
  // index document per existing NAV array entry"), driven by the NAV array
  // itself rather than by which page files exist on disk. This is what makes
  // the home item (`file: null`, no docs/docs/*.html counterpart at all)
  // still get an index document -- walking pageFiles alone can never produce
  // one for it, since it lives outside docsDir under a different file name.
  nav.forEach(group => group.items.forEach(item => {
    const page = item.file || 'index.html';
    index.push({
      id: 'nav#' + item.key,
      kind: 'nav',
      page: page,
      pageTitle: pageTitleByFile[page] || item.label,
      group: group.group,
      textEn: (item.label + ' ' + (item.kw || '')).trim(),
      textAr: ''
    });
  }));

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
  // Machine-readable, one repo-root-relative path per line, prefixed so a
  // shell consumer (tools/git-hooks/pre-commit) can grep it out of stdout
  // without parsing the human-readable summary line above. Kept as plain
  // stdout lines rather than a temp file/second output mode -- the hook
  // already captures this command's stdout in full to check its exit code.
  patchedFiles.forEach(f => console.log('PATCHED:' + f));
}

module.exports = { extractNav, extractSections, resolveI18n, buildIndex };
if (require.main === module) main();
