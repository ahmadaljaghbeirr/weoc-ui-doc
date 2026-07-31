# Deep Content Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `docs-shell.js`'s nav-label-only search with section-level, bilingual (EN/AR) full-content search, backed by a build-time index that is regenerated and enforced fresh by a git pre-commit hook.

**Architecture:** A Node build script (`tools/build-search-index.js`, zero npm dependencies) walks every `docs/docs/*.html` page, extracts each `.docs-section-title` section's prose (EN always from the HTML itself, AR from `docs/i18n/<page>.js` when that file exists), assigns each section a stable `id`, writes that id back into the HTML if missing, and emits `docs/search-index.json`. A git pre-commit hook re-runs this script whenever `docs/docs/*.html` or `docs/i18n/*.js` changes and blocks the commit on an unresolved reference. At runtime, `docs-shell.js` lazy-loads `search-index.json` on first search-box focus, builds a client-side `MiniSearch` index (vendored, self-hosted), and replaces the old nav-label matcher. Search results are grouped by page with snippets; clicking a result deep-links to `page.html#sectionId` and the post-swap hook scrolls/flashes that section.

**Tech Stack:** Plain Node.js (`fs`, `path`, `vm` — no npm dependencies for the indexer), vendored MiniSearch (browser UMD build) for the runtime, existing htmx/Alpine SPA infrastructure for navigation.

## Global Constraints

- Zero build step for the served site itself — only the indexer is a build-time tool; nothing here adds a bundler or changes how `docs/docs/*.html` are served.
- Any new `<script>` or `<style>` added to a page's own HTML (not `docs-shell.js`/`docs-style.css`) MUST live inside `.docs-page`/`#docs-main`, never in `<head>` or after `.docs-page` closes — confirmed hard requirement this session: content outside `#docs-main` never travels with an htmx swap (`hx-select="#docs-main > *"`), so anything placed there only works on a hard reload and silently breaks on every SPA navigation. This plan's own additions to `docs-shell.js`/`docs-style.css` are shared global assets and are exempt (they load once, persist across swaps by design).
- `docs/i18n/<page>.js` exists for only 15 of the 30 `docs/docs/*.html` pages (`I18N_PAGES` array, `docs-shell.js:361-362`). The indexer must not fail or skip a page just because it lacks an i18n file — EN text comes from the HTML itself either way; AR text is simply omitted where no i18n file exists.
- The indexer has zero npm dependencies. Do not add MiniSearch (or anything else) as an npm dependency — it is a vendored, self-hosted **browser** UMD build (`docs/vendor/minisearch/`), unrelated to the indexer's own Node execution.
- Match the existing self-hosted-vendor convention: `docs/vendor/htmx/`, `docs/vendor/alpine/`, `docs/vendor/prism/` are the precedent for `docs/vendor/minisearch/`.

---

## File Structure

**New files:**
- `tools/build-search-index.js` — the indexer. Pure Node, no deps. Exports its core functions (`extractNav`, `extractSections`, `resolveI18n`, `buildIndex`) via `module.exports` so the test file can call them directly, and runs `buildIndex()` when invoked as `node tools/build-search-index.js`.
- `tools/build-search-index.test.js` — automated tests using Node's built-in test runner (`node --test`), no framework dependency.
- `tools/git-hooks/pre-commit` — the enforcement hook (POSIX shell, matches how git invokes hooks).
- `package.json` — repo root, new. Exists only to document `npm run build:search-index` as a convenience alias for `node tools/build-search-index.js`; the indexer itself never requires `npm install` to run.
- `docs/vendor/minisearch/minisearch.min.js` — vendored real MiniSearch UMD build (downloaded, not hand-authored).
- `docs/search-index.json` — generated output, not hand-edited. Task 2's tests generate it against a small fixture; the real one (against all 30 pages) is generated once at the end of Task 2 and committed so the site works before anyone's local hook has run.

**Modified files:**
- `docs/docs-shell.js` — `searchMatches()`/`renderSearchResults()`/`bindSearch()` (currently `~941-1029`) replaced with a MiniSearch-backed version; `applySwappedPage()` (`~809-813`) gains a post-swap anchor-scroll-and-highlight step.
- `docs/docs-style.css` — new grouped/snippet result styles extending the existing `.docs-search-*` rules (`547-648`), plus a generalized flash-highlight keyframe (currently duplicated as page-scoped `dashTileFlash` in `kpi-recipes.html`).
- Every `docs/docs/*.html` page — the indexer injects a stable `id="…"` onto each `.docs-section-title` div that doesn't already have one. This happens automatically when the indexer runs (Task 2's last step), not as manual edits.

---

### Task 1: Vendor MiniSearch

**Files:**
- Create: `docs/vendor/minisearch/minisearch.min.js`

**Interfaces:**
- Produces: `window.MiniSearch` global (UMD build), consumed by Task 4.

- [ ] **Step 1: Download the real MiniSearch UMD build**

Fetch the actual library — do not hand-write a substitute implementation, a fake/simplified reimplementation will silently misbehave on real queries:

```bash
curl -o docs/vendor/minisearch/minisearch.min.js https://cdn.jsdelivr.net/npm/minisearch@7.1.0/dist/umd/index.min.js
```

- [ ] **Step 2: Verify it's the real UMD build exposing `window.MiniSearch`**

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('docs/vendor/minisearch/minisearch.min.js', 'utf8');
if (!src.includes('MiniSearch')) { console.error('FAIL: MiniSearch not found in downloaded file'); process.exit(1); }
console.log('OK, file size:', src.length, 'bytes');
"
```

Expected: `OK, file size: <some number > 10000> bytes` (the real minified library is ~15-20KB; if the download returned an HTML error page instead, this file will be tiny and this check should catch it — if it's under 5000 bytes, the download failed, re-check the URL).

- [ ] **Step 3: Commit**

```bash
git add docs/vendor/minisearch/minisearch.min.js
git commit -m "chore(docs): vendor MiniSearch for client-side search index"
```

---

### Task 2: Build-time indexer

**Files:**
- Create: `tools/build-search-index.js`
- Create: `tools/build-search-index.test.js`
- Test: `tools/build-search-index.test.js` (run via `node --test tools/`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces (for Task 3 and Task 4 to rely on):
  - CLI: `node tools/build-search-index.js` — writes `docs/search-index.json`, patches any `docs/docs/*.html` files that were missing section ids, prints a one-line summary, and exits non-zero with a clear message if any `data-wui-i18n*` id has no matching entry in its page's `docs/i18n/<page>.js` (when that file exists).
  - `docs/search-index.json` shape (array of documents), consumed by Task 4's runtime code:
    ```json
    [
      { "id": "charts#overview", "kind": "section", "page": "charts.html", "pageTitle": "Charts", "group": "Data Display", "sectionId": "overview", "textEn": "...", "textAr": "..." },
      { "id": "nav#charts", "kind": "nav", "page": "charts.html", "pageTitle": "Charts", "group": "Data Display", "textEn": "Charts chart chart.js uplot", "textAr": "" }
    ]
    ```
  - `module.exports = { extractNav, extractSections, resolveI18n, buildIndex }` for Task 2's own tests to call directly.

- [ ] **Step 1: Create a fixture directory for the tests**

```bash
mkdir -p tools/__fixtures__/docs/docs tools/__fixtures__/docs/i18n
```

Write `tools/__fixtures__/docs/docs/widgets.html` (a minimal 2-section page with one section covered by i18n and one not, to exercise both code paths):

```html
<!DOCTYPE html>
<html>
<head><title>Widgets</title></head>
<body class="wui-body-shell">
  <div id="docs-main">
    <div class="docs-page" x-data="widgetsPage()">
      <div class="docs-hero">
        <div class="docs-hero-eyebrow">Data Display</div>
        <div class="docs-hero-title">Widgets</div>
      </div>
      <div class="docs-section-title" data-wui-i18n-html="docs_widgets_1"><span class="material-symbols-outlined">widgets</span>Overview</div>
      <p data-wui-i18n-html="docs_widgets_2">Widgets are reusable pieces.</p>
      <div class="docs-section-title">Untranslated Section</div>
      <p>This section has no i18n file entry at all, only raw HTML text.</p>
      <pre class="docs-code"><code>const x = 1; // code samples must NOT be indexed</code></pre>
    </div>
  </div>
  <script src="../docs-shell.js"></script>
  <script>DocShell.init('widgets');</script>
</body>
</html>
```

Write `tools/__fixtures__/docs/i18n/widgets.js`:

```js
(function () {
  if (!window.WUI || !window.WUI.i18n) return;
  WUI.i18n.register([
    { lang:'en', id:'docs_widgets_1', value:'<span class="material-symbols-outlined">widgets</span>Overview' }, { lang:'ar', id:'docs_widgets_1', value:'<span class="material-symbols-outlined">widgets</span>نظرة عامة' },
    { lang:'en', id:'docs_widgets_2', value:'Widgets are reusable pieces.' }, { lang:'ar', id:'docs_widgets_2', value:'الودجات هي قطع قابلة لإعادة الاستخدام.' }
  ]);
})();
```

Write a minimal `tools/__fixtures__/docs/docs-shell.js` with just a `NAV` array (the real file's exact shape, trimmed to what the fixture test needs):

```js
(function () {
  'use strict';
  var NAV = [
    { group: 'Data Display', items: [
      { key: 'widgets', label: 'Widgets', file: 'widgets.html', kw: 'widget component reusable' }
    ] }
  ];
})();
```

- [ ] **Step 2: Write the failing tests**

```js
// tools/build-search-index.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { extractNav, extractSections, resolveI18n, buildIndex } = require('./build-search-index.js');

const FIXTURE_ROOT = path.join(__dirname, '__fixtures__');
const FIXTURE_SHELL = path.join(FIXTURE_ROOT, 'docs', 'docs-shell.js');
const FIXTURE_PAGE = path.join(FIXTURE_ROOT, 'docs', 'docs', 'widgets.html');
const FIXTURE_I18N_DIR = path.join(FIXTURE_ROOT, 'docs', 'i18n');

test('extractNav reads the NAV array literal without executing the rest of the file', () => {
  const nav = extractNav(FIXTURE_SHELL);
  assert.equal(nav.length, 1);
  assert.equal(nav[0].group, 'Data Display');
  assert.equal(nav[0].items[0].key, 'widgets');
  assert.equal(nav[0].items[0].file, 'widgets.html');
});

test('extractSections finds both sections and generates stable slug ids', () => {
  const html = fs.readFileSync(FIXTURE_PAGE, 'utf8');
  const { sections, patchedHtml, changed } = extractSections(html, 'widgets.html');
  assert.equal(sections.length, 2);
  assert.equal(sections[0].sectionId, 'overview');
  assert.equal(sections[1].sectionId, 'untranslated-section');
  assert.equal(changed, true, 'should report that ids were injected');
  assert.match(patchedHtml, /docs-section-title" id="overview"/);
  assert.match(patchedHtml, /docs-section-title" id="untranslated-section"/);
});

test('extractSections is idempotent: re-running on already-patched HTML keeps the same ids', () => {
  const html = fs.readFileSync(FIXTURE_PAGE, 'utf8');
  const first = extractSections(html, 'widgets.html');
  const second = extractSections(first.patchedHtml, 'widgets.html');
  assert.equal(second.changed, false, 'no new ids should be injected on a second run');
  assert.equal(second.sections[0].sectionId, first.sections[0].sectionId);
  assert.equal(second.sections[1].sectionId, first.sections[1].sectionId);
});

test('extractSections strips <pre><code> blocks from indexed text', () => {
  const html = fs.readFileSync(FIXTURE_PAGE, 'utf8');
  const { sections } = extractSections(html, 'widgets.html');
  const untranslated = sections.find(s => s.sectionId === 'untranslated-section');
  assert.ok(!untranslated.rawTextEn.includes('const x = 1'), 'code sample text must not leak into the section text');
});

test('resolveI18n pulls EN+AR from the i18n file when it exists', () => {
  const ids = ['docs_widgets_1', 'docs_widgets_2'];
  const result = resolveI18n(ids, 'widgets.html', FIXTURE_I18N_DIR);
  assert.equal(result.textAr.includes('نظرة عامة'), true);
  assert.equal(result.missing.length, 0);
});

test('resolveI18n reports missing ids instead of throwing, when the i18n file exists but lacks an id', () => {
  const result = resolveI18n(['docs_widgets_1', 'docs_widgets_999'], 'widgets.html', FIXTURE_I18N_DIR);
  assert.deepEqual(result.missing, ['docs_widgets_999']);
});

test('resolveI18n returns empty AR text (not an error) when the page has no i18n file at all', () => {
  const result = resolveI18n(['docs_nope_1'], 'no-such-page.html', FIXTURE_I18N_DIR);
  assert.equal(result.textAr, '');
  assert.deepEqual(result.missing, []);
});

test('buildIndex emits one nav doc per NAV item and one section doc per section, with no missing refs', () => {
  const result = buildIndex({ docsDir: path.join(FIXTURE_ROOT, 'docs', 'docs'), i18nDir: FIXTURE_I18N_DIR, shellPath: FIXTURE_SHELL });
  assert.equal(result.missingRefs.length, 0);
  const navDocs = result.index.filter(d => d.kind === 'nav');
  const sectionDocs = result.index.filter(d => d.kind === 'section');
  assert.equal(navDocs.length, 1);
  assert.equal(navDocs[0].id, 'nav#widgets');
  assert.equal(sectionDocs.length, 2);
  assert.equal(sectionDocs[0].id, 'widgets#overview');
  assert.match(sectionDocs[0].textEn, /Widgets are reusable pieces/);
  assert.match(sectionDocs[0].textAr, /الودجات/);
});

test('buildIndex surfaces a missing i18n ref instead of silently dropping it', () => {
  const brokenPage = path.join(FIXTURE_ROOT, 'docs', 'docs', 'broken.html');
  fs.writeFileSync(brokenPage, `<!DOCTYPE html><html><head></head><body><div id="docs-main"><div class="docs-page">
    <div class="docs-section-title" data-wui-i18n-html="docs_widgets_999">Broken</div>
  </div></div><script src="../docs-shell.js"></script></body></html>`, 'utf8');
  try {
    const result = buildIndex({ docsDir: path.join(FIXTURE_ROOT, 'docs', 'docs'), i18nDir: FIXTURE_I18N_DIR, shellPath: FIXTURE_SHELL });
    assert.equal(result.missingRefs.length, 1);
    assert.equal(result.missingRefs[0].page, 'broken.html');
    assert.equal(result.missingRefs[0].id, 'docs_widgets_999');
  } finally {
    fs.unlinkSync(brokenPage);
  }
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
node --test tools/build-search-index.test.js
```

Expected: FAIL — `Cannot find module './build-search-index.js'` (it doesn't exist yet).

- [ ] **Step 4: Write the indexer implementation**

```js
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
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
node --test tools/build-search-index.test.js
```

Expected: PASS, all 9 tests green.

- [ ] **Step 6: Run the indexer against the real 30-page docs site**

```bash
node tools/build-search-index.js
```

Expected: `build-search-index: wrote <N> documents to docs/search-index.json; injected section ids into <M> page(s): ...` — no missing-reference errors. If it reports missing refs, that means some page's `data-wui-i18n*` marker points at an id that genuinely doesn't exist in its `docs/i18n/<page>.js` file (a real, pre-existing content bug worth flagging, not a reason to change the indexer).

Inspect the result:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('docs/search-index.json','utf8')).length, 'documents')"
git diff --stat docs/docs/*.html
```

Confirm the diff on the patched HTML files is ONLY new `id="…"` attributes on `.docs-section-title` divs (nothing else changed).

- [ ] **Step 7: Commit**

```bash
git add tools/build-search-index.js tools/build-search-index.test.js tools/__fixtures__ docs/search-index.json docs/docs/*.html
git commit -m "feat(docs): build-time search indexer, section ids, initial index"
```

---

### Task 3: Pre-commit hook enforcement

**Files:**
- Create: `tools/git-hooks/pre-commit`
- Create: `package.json`

**Interfaces:**
- Consumes: `node tools/build-search-index.js` (Task 2's CLI, exit code 0/1).
- Produces: nothing new for later tasks — this task only wires enforcement around Task 2's existing script.

- [ ] **Step 1: Write the hook script**

```bash
#!/bin/sh
# tools/git-hooks/pre-commit
# Regenerates docs/search-index.json whenever a staged change touches
# docs/docs/*.html or docs/i18n/*.js, and re-stages anything the indexer
# wrote (the index itself, plus any HTML files it patched with new section
# ids). Aborts the commit if the indexer finds an unresolved i18n reference
# -- see tools/build-search-index.js's own exit-1 path.

set -e

CHANGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^docs/docs/.*\.html$|^docs/i18n/.*\.js$' || true)

if [ -z "$CHANGED" ]; then
  exit 0
fi

echo "pre-commit: docs/i18n or docs/docs changed, regenerating search index..."
node tools/build-search-index.js
STATUS=$?

if [ $STATUS -ne 0 ]; then
  echo "pre-commit: aborting commit -- fix the unresolved i18n reference(s) above."
  exit 1
fi

git add docs/search-index.json
for f in $CHANGED; do
  case "$f" in
    docs/docs/*.html)
      git add "$f"
      ;;
  esac
done

exit 0
```

- [ ] **Step 2: Make it executable and install it via `core.hooksPath`**

```bash
chmod +x tools/git-hooks/pre-commit
git config core.hooksPath tools/git-hooks
```

- [ ] **Step 3: Write `package.json`** (documents the command; `npm install` is never required to run it)

```json
{
  "name": "weoc-ui-doc-tools",
  "private": true,
  "description": "Build-time tooling for the weoc-ui-doc static site. The site itself has no build step -- this only covers the search index generator.",
  "scripts": {
    "build:search-index": "node tools/build-search-index.js"
  }
}
```

- [ ] **Step 4: Verify the hook blocks a broken commit**

```bash
cp docs/docs/charts.html /tmp/charts.html.bak
sed -i 's/data-wui-i18n-html="docs_charts_6"/data-wui-i18n-html="docs_charts_does_not_exist"/' docs/docs/charts.html
git add docs/docs/charts.html
git commit -m "test: should be blocked"
```

Expected: commit FAILS, hook prints `pre-commit: aborting commit -- fix the unresolved i18n reference(s) above.` and a line naming `docs_charts_does_not_exist`.

Restore the file:

```bash
git reset HEAD docs/docs/charts.html
cp /tmp/charts.html.bak docs/docs/charts.html
```

- [ ] **Step 5: Verify the hook passes and re-stages on a legitimate change**

```bash
# Add a new sentence to an existing section's EN text in charts.html, staged only:
sed -i 's/is an adapter layer\./is an adapter layer for real-time boards./' docs/docs/charts.html
git add docs/docs/charts.html
git commit -m "test: should regenerate index and pass"
```

Expected: commit SUCCEEDS; `git show --stat HEAD` includes both `docs/docs/charts.html` and `docs/search-index.json` in the same commit (the hook's `git add docs/search-index.json` picked it up automatically). Then revert this test commit:

```bash
git revert --no-edit HEAD
```

- [ ] **Step 6: Commit the hook infrastructure itself**

```bash
git add tools/git-hooks/pre-commit package.json
git commit -m "feat(docs): pre-commit hook enforces fresh search index"
```

---

### Task 4: Runtime search — MiniSearch integration

**Files:**
- Modify: `docs/docs-shell.js:941-1029` (replace `searchMatches()`/`renderSearchResults()`/`bindSearch()`/`closeSearch()`)

**Interfaces:**
- Consumes: `docs/search-index.json` (Task 2's output shape), `window.MiniSearch` (Task 1's vendored global), `WUI.i18n.getLang()` (existing, `JS/weoc-ui.js:281`), `getHref`/`getRoot`/`htmxSwapSpec` (existing, `docs-shell.js:128-241`).
- Produces: same public surface the old code had (`bindSearch()` called once from `DocShell.init()`, `~1113`) — no other file needs to change to pick this up.

- [ ] **Step 1: Read the current implementation to confirm line numbers haven't drifted**

```bash
grep -n "Search (over NAV labels" docs/docs-shell.js
```

If the line number differs from `941`, use the actual line number reported here for the replacement in Step 2.

- [ ] **Step 2: Replace the search block**

Replace the entire `/* ── Search (over NAV labels + keywords) ── */` section (from that comment through the end of `closeSearch()`, currently `docs-shell.js:941-1029`) with:

```js
  /* ── Search (section-level, bilingual, MiniSearch-backed) ──────────────────
     Index is lazy-loaded on first focus of #docs-search (not on page load,
     to avoid blocking initial render) and cached for the session -- rebuilt
     from scratch on a fresh hard load, reused across every SPA navigation
     since docs-shell.js itself never reloads. */
  var searchBound = false;
  var searchIndexPromise = null;

  function loadSearchIndex(root) {
    if (searchIndexPromise) return searchIndexPromise;
    searchIndexPromise = Promise.all([
      fetch(root + 'search-index.json').then(function (r) {
        if (!r.ok) throw new Error('search-index.json ' + r.status);
        return r.json();
      }),
      loadScript(root + 'vendor/minisearch/minisearch.min.js').then(function () { return window.MiniSearch; })
    ]).then(function (results) {
      var docs = results[0], MiniSearch = results[1];
      var mini = new MiniSearch({
        idField: 'id',
        fields: ['textEn', 'textAr'],
        storeFields: ['kind', 'page', 'pageTitle', 'group', 'sectionId', 'textEn', 'textAr']
      });
      mini.addAll(docs);
      return mini;
    }).catch(function (err) {
      var input = document.getElementById('docs-search');
      if (input) {
        input.disabled = true;
        input.placeholder = 'Search unavailable';
        input.classList.add('docs-search-input-disabled');
      }
      searchIndexPromise = null; // allow a retry on the next focus (e.g. after a flaky network blip)
      throw err;
    });
    return searchIndexPromise;
  }

  function highlightSnippet(text, terms) {
    if (!text) return '';
    var snippet = text.length > 140 ? text.slice(0, 140) + '…' : text;
    terms.forEach(function (term) {
      if (!term) return;
      var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      snippet = snippet.replace(re, '<mark>$1</mark>');
    });
    return snippet;
  }

  function renderSearchResults(q, root) {
    var panel = document.getElementById('docs-search-results');
    if (!panel) return;
    q = (q || '').trim();
    if (!q) { panel.innerHTML = ''; panel.classList.remove('is-open'); return; }

    loadSearchIndex(root).then(function (mini) {
      var lang = (window.WUI && window.WUI.i18n) ? window.WUI.i18n.getLang() : 'en';
      var field = lang === 'ar' ? 'textAr' : 'textEn';
      var results = mini.search(q, { fields: [field], prefix: true, fuzzy: 0.2 }).slice(0, 20);

      if (!results.length) {
        panel.innerHTML = '<div class="docs-search-empty">No matches</div>';
        panel.classList.add('is-open');
        return;
      }

      var byPage = {};
      var order = [];
      results.forEach(function (r) {
        if (!byPage[r.page]) { byPage[r.page] = []; order.push(r.page); }
        byPage[r.page].push(r);
      });

      var terms = q.split(/\s+/);
      var swapSpec = htmxSwapSpec();
      var html = '';
      order.forEach(function (page) {
        var hits = byPage[page];
        html += '<div class="docs-search-group"><div class="docs-search-group-title">' + hits[0].pageTitle + '</div>';
        hits.forEach(function (hit) {
          var href = root + 'docs/' + hit.page + (hit.kind === 'section' ? '#' + hit.sectionId : '');
          var snippet = hit.kind === 'section' ? highlightSnippet(hit[field] || hit.textEn, terms) : '';
          html += '<a class="docs-search-hit" href="' + href + '" data-search-hit' +
            ' hx-get="' + href + '" hx-push-url="true" hx-target="#docs-main"' +
            ' hx-select="#docs-main &gt; *" hx-swap="' + swapSpec + '">' +
            '<span class="docs-search-hit-label">' + (hit.kind === 'section' ? hit.sectionId.replace(/-/g, ' ') : hit.pageTitle) + '</span>' +
            (snippet ? '<span class="docs-search-hit-snippet">' + snippet + '</span>' : '') +
            '</a>';
        });
        html += '</div>';
      });
      panel.innerHTML = html;
      panel.classList.add('is-open');
      if (window.htmx) window.htmx.process(panel);
    }).catch(function () {
      // loadSearchIndex() already put the input into its disabled state and
      // logged nothing user-facing beyond that -- nothing further to do here
      // besides not leaving an unhandled rejection.
    });
  }

  function bindSearch() {
    if (searchBound) return;
    searchBound = true;
    var root = getRoot();
    document.addEventListener('focus', function (e) {
      if (e.target && e.target.id === 'docs-search') loadSearchIndex(root);
    }, true);
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'docs-search') renderSearchResults(e.target.value, root);
    });
    document.addEventListener('keydown', function (e) {
      var input = document.getElementById('docs-search');
      if (!input) return;
      if (e.key === 'Enter' && document.activeElement === input) {
        var first = document.querySelector('#docs-search-results [data-search-hit]');
        if (first) { e.preventDefault(); first.click(); closeSearch(); }
      } else if (e.key === 'Escape') { closeSearch(); input.blur(); }
      else if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); input.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-hit]')) { closeSearch(); }
      else if (!e.target.closest('.docs-search')) { closeSearch(); }
    });
  }
  function closeSearch() {
    var panel = document.getElementById('docs-search-results');
    var input = document.getElementById('docs-search');
    if (panel) { panel.classList.remove('is-open'); panel.innerHTML = ''; }
    if (input) input.value = '';
  }
```

Note: `getRoot`/`htmxSwapSpec`/`loadScript` are pre-existing functions in this same file (`docs-shell.js:128,232,347`) — do not redefine them.

- [ ] **Step 3: Manual verification — index loads and searches**

Serve the site locally (any static server; the existing convention this session used a plain Node server) and in the browser console on any page:

```js
document.getElementById('docs-search').focus();
await new Promise(r => setTimeout(r, 1000));
document.getElementById('docs-search').value = 'chart';
document.getElementById('docs-search').dispatchEvent(new Event('input'));
document.getElementById('docs-search-results').classList.contains('is-open')
```

Expected: `true`, and the results panel (inspect via `document.getElementById('docs-search-results').innerHTML`) contains a `docs-search-group` for at least the Charts page with a snippet containing "chart" (case-insensitive), not just a page-title match.

- [ ] **Step 4: Manual verification — Arabic query in Arabic mode**

```js
document.querySelector('[data-wui-lang-toggle]').click(); // or the header translate button
await new Promise(r => setTimeout(r, 300));
document.getElementById('docs-search').value = 'نظرة'; // "overview" in Arabic, present on several pages
document.getElementById('docs-search').dispatchEvent(new Event('input'));
document.getElementById('docs-search-results').innerHTML.includes('docs-search-hit')
```

Expected: `true`, results returned matching Arabic text.

- [ ] **Step 5: Commit**

```bash
git add docs/docs-shell.js
git commit -m "feat(docs): section-level bilingual search backed by MiniSearch index"
```

---

### Task 5: Result UI styling

**Files:**
- Modify: `docs/docs-style.css` (append after the existing `.docs-search-*` rules, `547-648`)

**Interfaces:**
- Consumes: the DOM shape Task 4's `renderSearchResults()` produces (`.docs-search-group`, `.docs-search-group-title`, `.docs-search-hit-snippet`, `mark`).
- Produces: nothing consumed by code — visual only.

- [ ] **Step 1: Add the new rules**

Append to `docs/docs-style.css`, right after the existing `.docs-search-empty { ... }` rule (`~633-646`):

```css
.docs-search-group + .docs-search-group { border-top: 1px solid var(--color-border); margin-top: var(--space-2); padding-top: var(--space-2); }
.docs-search-group-title {
  font-size: var(--text-2xs); font-weight: var(--font-semibold); text-transform: uppercase;
  letter-spacing: .04em; color: var(--color-text-secondary); padding: var(--space-1) var(--space-3);
}
.docs-search-hit-snippet {
  display: block; font-size: var(--text-xs); color: var(--color-text-secondary);
  white-space: normal; line-height: 1.35; margin-top: 2px;
}
.docs-search-hit-snippet mark { background: var(--color-10-light); color: var(--color-10); border-radius: 2px; padding: 0 2px; }
.docs-search-input-disabled { opacity: 0.5; cursor: not-allowed; }
```

- [ ] **Step 2: Manual verification — happy path**

Open any page, focus search, type a term that matches a section body (not just a nav label). Confirm visually: results are grouped under a page-title sub-header, each hit shows a snippet with the matched term highlighted, and the panel still opens/closes/keyboard-navigates exactly as before (no regression on the existing `.docs-search-hit`/`.docs-search-results` behavior).

- [ ] **Step 3: Manual verification — index fetch failure**

In DevTools, block the network request for `search-index.json` (Network tab → right-click the request after it appears once → "Block request URL", or temporarily rename the file on disk) and focus the search box on a fresh reload. Confirm: the input becomes visibly disabled with placeholder text "Search unavailable", the rest of the page is completely unaffected, and the console shows the fetch rejection with no unhandled-promise-rejection warning. Restore the file/unblock afterward.

- [ ] **Step 4: Commit**

```bash
git add docs/docs-style.css
git commit -m "style(docs): grouped, snippet-highlighted search results"
```

---

### Task 6: Anchor-scroll-and-highlight navigation

**Files:**
- Modify: `docs/docs-shell.js:809-813` (`applySwappedPage`)
- Modify: `docs/docs-style.css` (add the generalized flash keyframe)

**Interfaces:**
- Consumes: `location.hash` (set by the browser automatically from the `href="...#sectionId"` Task 4 already produces), `revealOut()` (existing, called at the end of `applySwappedPage`).
- Produces: nothing new for later tasks — this is the last functional task.

- [ ] **Step 1: Add the generalized flash keyframe to `docs-style.css`**

Append (this replaces the page-scoped `dashTileFlash` duplication that currently only exists in `kpi-recipes.html:112-114` — leave that page-local copy as-is, this is a new shared name so nothing needs to be migrated off it in this task):

```css
@keyframes docsSearchFlash { 0%, 100% { box-shadow: none; } 50% { box-shadow: 0 0 0 2px var(--color-10); } }
.docs-search-target-flash { animation: docsSearchFlash 0.6s ease 2; }
```

- [ ] **Step 2: Add the anchor-scroll step to `applySwappedPage`**

Current code (`docs-shell.js:809-813`):

```js
  function applySwappedPage(ns, root) {
    renderChrome(ns, root); // already ends with its own WUI.i18n.apply(document)
    runPageInit();
    revealOut(document.getElementById('docs-main'));
  }
```

Replace with:

```js
  function applySwappedPage(ns, root) {
    renderChrome(ns, root); // already ends with its own WUI.i18n.apply(document)
    runPageInit();
    revealOut(document.getElementById('docs-main'));
    scrollToHashTarget();
  }

  /* Deep-search hits (and any future in-page anchor link) carry a
     #sectionId. On a normal page-to-page nav this scroll already happened
     for free via the browser's native hash-jump on load -- but SPA swaps
     never trigger that (the URL's hash was already set by pushState before
     the new content existed), so it has to be done explicitly here, once
     the swapped content is actually in the DOM. */
  function scrollToHashTarget() {
    var hash = location.hash ? location.hash.slice(1) : '';
    if (!hash) return;
    var target = document.getElementById(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('docs-search-target-flash');
    setTimeout(function () { target.classList.remove('docs-search-target-flash'); }, 1300);
  }
```

- [ ] **Step 3: Handle the same-page-hit case in `renderSearchResults` (Task 4's code)**

Cross-page hits already work via Step 2 (they go through `applySwappedPage` like any other nav). Same-page hits (search result on the page you're already on) never trigger a swap at all, so `applySwappedPage` never runs for them. In `docs-shell.js`, find the click handler added in Task 4's `bindSearch()`:

```js
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-hit]')) { closeSearch(); }
      else if (!e.target.closest('.docs-search')) { closeSearch(); }
    });
```

Replace with:

```js
    document.addEventListener('click', function (e) {
      var hit = e.target.closest('[data-search-hit]');
      if (hit) {
        var hitPage = hit.getAttribute('href').split('#')[0].split('/').pop();
        var currentPage = location.pathname.split('/').pop() || 'index.html';
        closeSearch();
        if (hitPage === currentPage) {
          // Same page: htmx never fires (no navigation happens), so scroll
          // has to be driven directly instead of waiting on applySwappedPage.
          e.preventDefault();
          history.pushState(null, '', hit.getAttribute('href'));
          scrollToHashTarget();
        }
        // Cross-page: let the anchor's own hx-get proceed normally --
        // applySwappedPage's scrollToHashTarget() call handles it post-swap.
      } else if (!e.target.closest('.docs-search')) { closeSearch(); }
    });
```

- [ ] **Step 4: Manual verification — cross-page hit**

From any page other than Charts, search a term you know is in `charts.html`'s body text, click the result. Confirm: page navigates (curtain transition plays), lands on `charts.html`, and the matched section is scrolled into view with a brief highlight flash — not just scrolled to the top of the page.

- [ ] **Step 5: Manual verification — same-page hit**

While already on `charts.html`, search a term from one of its own sections, click the result. Confirm: no page navigation/curtain (you're already there), URL hash updates, and the target section scrolls into view and flashes.

- [ ] **Step 6: Commit**

```bash
git add docs/docs-shell.js docs/docs-style.css
git commit -m "feat(docs): scroll-and-highlight search-result navigation"
```

---

### Task 7: Full regression pass

**Files:** none (verification only).

- [ ] **Step 1: Fresh hard reload, 0 console errors**

Load the home page with a hard reload, open DevTools console, confirm no errors on load.

- [ ] **Step 2: EN search sweep**

Search 3 terms known to exist only in section BODY text (not nav labels) across 3 different pages. Confirm all 3 return correct results with working snippets.

- [ ] **Step 3: AR search sweep**

Switch to Arabic, repeat with 3 Arabic terms from 3 different (i18n-covered) pages.

- [ ] **Step 4: Pages with no i18n file still work in EN**

Search a term from `buttons.html` (one of the 15 pages with no `docs/i18n/buttons.js`) while in EN mode. Confirm it's found. Switch to AR, search the same term — confirm it correctly returns nothing (not an error, not a stale EN match).

- [ ] **Step 5: Nav + click-through, both directions**

Cross-page hit and same-page hit, as in Task 6 Steps 4-5, one more time end-to-end after all tasks are merged together.

- [ ] **Step 6: Pre-commit hook, end-to-end**

Edit a real section's text in any page, stage it, commit. Confirm the index regenerates and the new text is immediately searchable without a manual `npm run build:search-index` step.

- [ ] **Step 7: Zero console errors across the whole sweep**

Re-check DevTools console after Steps 2-6. Expected: clean throughout (matching this project's established verification bar).

- [ ] **Step 8: Final commit** (only if Step 7 surfaced anything to fix; otherwise no commit needed — the feature is already fully committed by Task 6)
