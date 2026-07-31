// tools/build-search-index.test.js
const test = require('node:test');
const { before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { extractNav, extractSections, resolveI18n, buildIndex } = require('./build-search-index.js');

const FIXTURE_ROOT = path.join(__dirname, '__fixtures__');
const FIXTURE_SHELL = path.join(FIXTURE_ROOT, 'docs', 'docs-shell.js');
const FIXTURE_PAGE = path.join(FIXTURE_ROOT, 'docs', 'docs', 'widgets.html');
const FIXTURE_I18N_DIR = path.join(FIXTURE_ROOT, 'docs', 'i18n');

// buildIndex() intentionally patches missing section ids back onto disk (that's the
// real CLI's job against docs/docs/*.html). Since the "buildIndex emits..." test below
// runs buildIndex against this same fixtures dir, it permanently patches widgets.html
// on disk as a side effect -- which would make a second run of this suite see an
// already-patched fixture and break the "generates stable slug ids" test's `changed:
// true` assertion. Reset the fixture to its pristine (unpatched) form before every run
// so the suite is repeatable regardless of what a prior run left on disk.
const PRISTINE_WIDGETS_HTML = `<!DOCTYPE html>
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
`;
before(() => { fs.writeFileSync(FIXTURE_PAGE, PRISTINE_WIDGETS_HTML, 'utf8'); });

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
  // NOTE: this deliberately models "broken.html HAS its own i18n file (broken.js),
  // but that file lacks an entry for the id the HTML references" -- i.e. the same
  // "file exists but missing this one id" case resolveI18n itself is tested against
  // above. A page with NO i18n file at all is the expected/non-error case (see the
  // "no i18n file at all" test above and the 15 real unlocalized docs pages, which
  // all carry dozens of data-wui-i18n markers with no matching i18n file and must
  // NOT be flagged) -- so this test must not conflate "no file" with "missing id".
  const brokenPage = path.join(FIXTURE_ROOT, 'docs', 'docs', 'broken.html');
  const brokenI18n = path.join(FIXTURE_I18N_DIR, 'broken.js');
  fs.writeFileSync(brokenPage, `<!DOCTYPE html><html><head></head><body><div id="docs-main"><div class="docs-page">
    <div class="docs-section-title" data-wui-i18n-html="docs_widgets_999">Broken</div>
  </div></div><script src="../docs-shell.js"></script></body></html>`, 'utf8');
  fs.writeFileSync(brokenI18n, `(function () {
    if (!window.WUI || !window.WUI.i18n) return;
    WUI.i18n.register([
      { lang:'en', id:'docs_broken_1', value:'Some other id' }, { lang:'ar', id:'docs_broken_1', value:'معرف آخر' }
    ]);
  })();`, 'utf8');
  try {
    const result = buildIndex({ docsDir: path.join(FIXTURE_ROOT, 'docs', 'docs'), i18nDir: FIXTURE_I18N_DIR, shellPath: FIXTURE_SHELL });
    assert.equal(result.missingRefs.length, 1);
    assert.equal(result.missingRefs[0].page, 'broken.html');
    assert.equal(result.missingRefs[0].id, 'docs_widgets_999');
  } finally {
    fs.unlinkSync(brokenPage);
    fs.unlinkSync(brokenI18n);
  }
});
