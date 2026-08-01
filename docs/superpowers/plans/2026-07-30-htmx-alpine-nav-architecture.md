# htmx + Alpine Navigation Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled fetch+innerHTML swap router in `weoc-ui-doc`'s docs site with htmx (boosted navigation, reliable swap lifecycle), and replace the centralized `PAGE_INIT` dispatch registry with per-page `Alpine.data()` components, while preserving the existing GSAP curtain transition.

**Architecture:** htmx owns navigation (`hx-boost`, link interception, history, real `<script>` re-execution on swap). Alpine owns per-page component state via `Alpine.data()` factories registered and instantiated inside the swapped `#docs-main` fragment. The GSAP curtain wipe is preserved by choreographing `coverIn()`/`revealOut()` off htmx's `swapDelay`/`settleDelay` window (a documented, native htmx mechanism) rather than overriding htmx's internal swap/history handling — this was verified against htmx's official docs before writing this plan (history/swap-timing interaction with a manual `shouldSwap=false` override is undocumented and was rejected as too risky; `swapDelay`/`settleDelay` are documented `swapSpec` properties, confirmed via `https://htmx.org/api/`).

**Tech Stack:** htmx 2.0.10 (self-hosted), Alpine.js (already vendored at `docs/vendor/alpine/`), vanilla JS. No build step. No change to the Cloudflare Worker/static-assets deploy model.

**Spec:** `docs/superpowers/specs/2026-07-30-htmx-alpine-nav-architecture-design.md` (this repo, commit `c12d2dc`).

## Global Constraints

- Zero-build: no bundler/compiler step introduced for the docs site (`docs/**`). Plain `<script>` tags only.
- All vendor libraries self-hosted under `docs/vendor/<lib>/`, matching the existing convention (`vendor/prism/`, `vendor/tinymce-8.6.0/`, `vendor/alpine/`). No CDN references in shipped pages.
- The Cloudflare Worker + static-assets deploy model (`worker.js`, `wrangler.jsonc`) is not modified.
- The GSAP curtain transition (`coverIn`/`revealOut`) must be preserved — explicit user requirement, not optional.
- `Alpine.data()` registration `<script>` and any `x-data="..."` usage for a page must live **inside** `#docs-main`, not after it — only content inside the swap target travels with htmx and gets its `<script>` tags re-executed on every visit.
- Underlying component factories (`WUI.chart`, `WUI.pie`/`donut`/`gauge`/`barRow`, `TomSelectFactory`, `FlatpickrFactory`, `WUICalendar`, `WUIAnim`, `EOCLists`) are not modified — only the per-page glue code that wires a factory to specific DOM elements moves out of `PAGE_INIT` and into that page's own markup.
- No change to the `weoc-ui` component library itself (`JS/weoc-ui.js`, `JS/wui-charts.js`, any `CSS/weoc-ui/*.css`).
- Preserve existing page behavior exactly when converting — this is a mechanism swap (registry → component), not a redesign of what any demo does.

---

### Task 1: Vendor htmx + wire `hx-boost` infrastructure (no page files touched)

**Files:**
- Create: `docs/vendor/htmx/htmx.min.js`
- Modify: `docs/docs-shell.js` (`ensureGlobalAssets`, `DocShell.init`)

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces: `window.htmx` (global, once loaded). `#docs-split` carries `hx-boost="true"` / `hx-target="#docs-main"` / `hx-select="#docs-main"` after `DocShell.init()` runs. Later tasks rely on `window.htmx` existing and on `#docs-split` being the boosted ancestor.

This task is deliberately scoped to be a working, independently-testable milestone on its own: after this task, clicking a sidebar link already performs an AJAX-swapped navigation of `#docs-main` (htmx's own default behavior) — header/sidebar re-render, GSAP curtain, and page-specific JS re-init are NOT yet wired (that's Task 2). This is expected and will look/behave incompletely; do not try to fix it in this task.

- [ ] **Step 1: Vendor htmx**

```bash
mkdir -p docs/vendor/htmx
curl -o docs/vendor/htmx/htmx.min.js https://unpkg.com/htmx.org@2.0.10/dist/htmx.min.js
```

Verify the file downloaded and is non-empty:

```bash
wc -l docs/vendor/htmx/htmx.min.js
```

Expected: a single minified line, file size roughly 45-50KB (htmx 2.0.10 is ~48KB unminified-source-derived min build).

- [ ] **Step 2: Load htmx lazily alongside Alpine in `ensureGlobalAssets`**

In `docs/docs-shell.js`, find this line inside `ensureGlobalAssets` (currently loads Alpine):

```js
    if (!window.Alpine)      jobs.push(loadScript(root + 'vendor/alpine/cdn.min.js'));
```

Add immediately after it:

```js
    if (!window.htmx)        jobs.push(loadScript(root + 'vendor/htmx/htmx.min.js'));
```

- [ ] **Step 3: Set `hx-boost` on `#docs-split` once, in `DocShell.init`**

In `docs/docs-shell.js`, inside `window.DocShell.init = function (activeKey) { ... }`, find the line:

```js
      bindRouter();
```

Replace it with:

```js
      var splitEl = document.getElementById('docs-split');
      if (splitEl) {
        splitEl.setAttribute('hx-boost', 'true');
        splitEl.setAttribute('hx-target', '#docs-main');
        splitEl.setAttribute('hx-select', '#docs-main');
        if (window.htmx) window.htmx.process(splitEl);
      }
```

(`bindRouter()` itself — and the old router functions it wires up — are removed in Task 2, not this task. Leave the `bindRouter` function definition in place for now; only this one call site changes.)

- [ ] **Step 4: Verify live in browser**

Start the existing local static server (project convention: `node` static server on port 8934, `Cache-Control: no-store` — reuse if already running, otherwise start one against the repo root).

Navigate to `docs/weoc-ui-docs.html`, open devtools console, run:

```js
document.getElementById('docs-split').getAttribute('hx-boost')
```

Expected: `"true"`.

```js
typeof window.htmx
```

Expected: `"object"`.

Click any sidebar nav link (e.g. "Controls"). Expected: URL changes, `#docs-main`'s content changes to the new page's content, **no full page reload** (confirm via Network tab: a `fetch`/XHR request for the target `.html`, not a full navigation). Header/sidebar will NOT update yet (still shows the previous page's active state) — this is expected, fixed in Task 2.

- [ ] **Step 5: Commit**

```bash
git add docs/vendor/htmx/htmx.min.js docs/docs-shell.js
git commit -m "feat(docs): vendor htmx, wire hx-boost on docs-split

First step of replacing the hand-rolled fetch+swap router with htmx.
#docs-main now navigates via htmx boost; chrome re-render, GSAP
curtain, and PAGE_INIT re-run are wired in the next commit."
```

---

### Task 2: htmx swap lifecycle — chrome re-render, page-init re-run, GSAP curtain, remove old router

**Files:**
- Modify: `docs/docs-shell.js`

**Interfaces:**
- Consumes: `window.htmx` (Task 1), existing `renderChrome(ns, root)`, `runPageInit(ns)`, `nsForUrl(url)`, `rootForPath(path)`, `coverIn(target)`, `revealOut(target)` — all pre-existing functions, unchanged signatures.
- Produces: `window.DocShell.ready` — a `Promise` that resolves once `ensureGlobalAssets()` has fully resolved (both the first and second `jobs`/`jobs2` batches). Task 3 and Task 4's per-page `Alpine.data()` factories depend on this to avoid initializing before their required library (`FlatpickrFactory`, `TomSelectFactory`, chart libs, etc.) has loaded.

**Why `DocShell.ready` is needed (read before implementing):** today, `PAGE_INIT[ns]()` is only ever called from inside `ensureGlobalAssets(root).then(...)`, so it's guaranteed every lazy-loaded library is ready first. Alpine's `x-init` fires the moment its `x-data` element appears in the DOM — which can be *before* `ensureGlobalAssets` resolves (Alpine itself loads and calls `Alpine.start()` in the first `jobs` batch, before the second `jobs2` batch that loads `FlatpickrFactory`/`TomSelectFactory`/chart libs even starts). Without `DocShell.ready`, a page converted to `x-data` could silently no-op on first load if its `x-init` runs before its library is available. Every `Alpine.data()` factory written in Task 3 and Task 4 must gate its real work behind `DocShell.ready.then(...)`.

- [ ] **Step 1: Add `DocShell.ready`, remove the old router, keep the helper lookups**

In `docs/docs-shell.js`, delete these functions entirely (the hand-rolled router — same shape Barba had, now replaced by htmx): `swapContent`, `navigate`, `isInternalDocLink`, `bindRouter`. Also delete the GSAP curtain's old call sites inside `navigate()` (the functions `coverIn`/`revealOut`/`wipeEl`/`placeWipe` themselves are **kept**, just called from new sites below).

Keep `nsForUrl(url)` and `rootForPath(path)` — they're pure lookup helpers, still needed to compute which page just loaded.

Also keep the `routerBound`/`navigating` variables' *declarations* removed along with the functions that used them (they're dead once `navigate`/`bindRouter` are gone).

- [ ] **Step 2: Add the htmx swap-lifecycle wiring**

Add this new function near where `bindRouter` used to be defined:

```js
  /* ── htmx swap lifecycle (Barba- and hand-rolled-router-free) ────────────
     htmx owns navigation (hx-boost on #docs-split, set in DocShell.init).
     We hang chrome re-render + PAGE_INIT + the GSAP curtain off htmx's own
     documented swap/settle delay window instead of overriding htmx's
     internal swap/history handling (that interaction is undocumented and
     was deliberately avoided — see plan Task 2 header note). */
  var htmxNavBound = false;
  function bindHtmxNav() {
    if (htmxNavBound) return;
    htmxNavBound = true;

    document.body.addEventListener('htmx:beforeSwap', function (evt) {
      if (!evt.detail || !evt.detail.target || evt.detail.target.id !== 'docs-main') return;
      coverIn(document.getElementById('docs-main'));
    });

    document.body.addEventListener('htmx:afterSwap', function (evt) {
      if (!evt.detail || !evt.detail.target || evt.detail.target.id !== 'docs-main') return;
      var url = (evt.detail.xhr && evt.detail.xhr.responseURL) || location.href;
      var ns = nsForUrl(url);
      var root = rootForPath(url);
      renderChrome(ns, root);
      if (window.WUI && window.WUI.i18n) window.WUI.i18n.apply(document);
      runPageInit(ns);
      revealOut(document.getElementById('docs-main'));
    });
  }
```

Update the `hx-swap` attribute set in Task 1 to include swap/settle delay windows matching the existing curtain's timings (`coverIn` runs 0.5s, `revealOut` runs 0.55s + an 0.08s delay ≈ 0.63s total — reuse those exact numbers, don't invent new ones):

Find (from Task 1):
```js
        splitEl.setAttribute('hx-select', '#docs-main');
```

Add immediately after it:
```js
        splitEl.setAttribute('hx-swap', 'innerHTML swap:500ms settle:630ms');
```

- [ ] **Step 3: Call `bindHtmxNav()` and set up `DocShell.ready`**

In `window.DocShell.init`, find:

```js
      bindSearch();
      ensureI18nStore(root);

      ensureGlobalAssets(root).then(function () {
        entranceAnimate();
        runPageInit(ns);
      });
```

Replace with:

```js
      bindSearch();
      bindHtmxNav();
      ensureI18nStore(root);

      window.DocShell.ready = ensureGlobalAssets(root).then(function () {
        entranceAnimate();
        runPageInit(ns);
      });
```

- [ ] **Step 4: Add `htmx.process()` to `renderChrome` for freshly-injected header/sidebar links**

Find `renderChrome`'s body (it sets `hdr.innerHTML` and `sb.innerHTML`). Immediately after both innerHTML assignments, add:

```js
    if (window.htmx) {
      if (hdr) window.htmx.process(hdr);
      if (sb) window.htmx.process(sb);
    }
```

(htmx only auto-scans DOM it swapped itself; content injected via a plain `.innerHTML` write from our own `renderChrome` needs this explicit call so any boosted links inside the header/sidebar activate.)

- [ ] **Step 5: Verify live in browser**

Reload `docs/weoc-ui-docs.html`. In devtools console, watch for errors while clicking through at least 4 different sidebar pages in sequence, including one back-navigation via the browser Back button.

Expected for every click:
- GSAP curtain wipes in, content changes, curtain wipes out (visually matches the pre-change behavior).
- Sidebar's active (`is-active`) item updates to the new page.
- Page `<title>` updates.
- Browser Back button returns to the previous page correctly (URL and content both roll back — this confirms htmx's own history handling was untouched, which was the reason `shouldSwap` override was avoided).
- 0 console errors.
- A page with existing `PAGE_INIT` behavior (e.g. `dates.html`) still shows its flatpickr inputs working after navigating to it via a boosted click (confirms `runPageInit` + library-load ordering still functions during this transitional state, before Task 3/4 convert it).

If `evt.detail.xhr.responseURL` or `evt.detail.target` don't behave as expected (empty/undefined) when you `console.log(evt.detail)` inside the two listeners above, htmx's actual runtime event shape differs from what was confirmed against `https://htmx.org/events/` at plan-writing time — inspect the real object live and adjust the two listeners to use whatever field actually carries the request URL and swap target before proceeding.

- [ ] **Step 6: Commit**

```bash
git add docs/docs-shell.js
git commit -m "feat(docs): htmx swap lifecycle replaces hand-rolled router

Chrome re-render, i18n re-apply, PAGE_INIT re-run, and the GSAP
curtain now hang off htmx:beforeSwap/afterSwap instead of the old
fetch+innerHTML navigate()/swapContent()/bindRouter() chain, which
is deleted. History/back-button handling is htmx's own (untouched).
Adds window.DocShell.ready for page-level Alpine components to await
global asset loading."
```

---

### Task 3: Reference conversion — `dates.html` (`PAGE_INIT.dates` → `Alpine.data`)

**Files:**
- Modify: `docs/docs/dates.html`
- Modify: `docs/docs-shell.js` (remove `PAGE_INIT.dates`)

**Interfaces:**
- Consumes: `window.DocShell.ready` (Task 2).
- Produces: the canonical `Alpine.data()` conversion pattern that Task 4's ten pages copy exactly.

This is the smallest real `PAGE_INIT` entry (`FlatpickrFactory.init()` over the whole page + one readonly-input tweak), chosen specifically because it's simple enough to be the pattern everyone else follows without any page-specific complexity obscuring the mechanism.

**Current code being replaced** (`docs/docs-shell.js`, inside `PAGE_INIT`):

```js
    dates: function () {
      if (!window.FlatpickrFactory) return;
      FlatpickrFactory.init();
      var ro = document.getElementById('fp-readonly');
      if (ro && ro._flatpickr) {
        ro.classList.add('is-readonly');
        ro._flatpickr.set('clickOpens', false);
      }
    },
```

- [ ] **Step 1: Wrap the page's content in `x-data`**

In `docs/docs/dates.html`, find the opening of the content wrapper immediately inside `#docs-main`:

```html
    <div class="wui-split-main wui-scroll-area" id="docs-main" data-barba="container" data-barba-namespace="dates">
      <div class="docs-page">
```

Change the inner `<div class="docs-page">` line to:

```html
      <div class="docs-page" x-data="datesPage()" x-init="init()">
```

(Leave the `data-barba="container" data-barba-namespace="dates"` attributes on the outer `#docs-main` div alone for now — they're inert leftovers, cleaned up in Task 5, not this task.)

- [ ] **Step 2: Add the `Alpine.data()` registration, inside `#docs-main`**

Immediately after the `<div class="docs-page" x-data="datesPage()" x-init="init()">` line added in Step 1, add:

```html
        <script>
        (function () {
          function registerDatesPage() {
            Alpine.data('datesPage', function () {
              return {
                init: function () {
                  var self = this;
                  window.DocShell.ready.then(function () {
                    if (!window.FlatpickrFactory) return;
                    FlatpickrFactory.init();
                    var ro = document.getElementById('fp-readonly');
                    if (ro && ro._flatpickr) {
                      ro.classList.add('is-readonly');
                      ro._flatpickr.set('clickOpens', false);
                    }
                  });
                }
              };
            });
          }
          if (window.Alpine) registerDatesPage();
          else document.addEventListener('alpine:init', registerDatesPage);
        })();
        </script>
```

This covers both cases: first-ever page load (Alpine not started yet → the `alpine:init` listener catches it) and every later htmx-boosted visit to this page (Alpine already running globally → the immediate `if (window.Alpine)` branch runs). Re-registering the same `Alpine.data('datesPage', ...)` name on every visit is harmless — it's a plain overwrite of the same factory function.

- [ ] **Step 3: Remove the old trailing init call**

At the bottom of `docs/docs/dates.html`, find:

```html
  <script src="../docs-shell.js"></script>
  <script>DocShell.init('dates');</script>
```

Leave this exactly as-is — `DocShell.init('dates')` is still required (it does chrome render, theme, i18n, `bindHtmxNav`, etc. on first real page load). Only the *demo-specific* init logic moved into the `x-data` block; the site-shell bootstrap call stays.

- [ ] **Step 4: Remove `PAGE_INIT.dates` from `docs-shell.js`**

Delete the `dates: function () { ... },` block shown under "Current code being replaced" above, from `docs/docs-shell.js`'s `PAGE_INIT` object.

- [ ] **Step 5: Verify live in browser**

Load `docs/weoc-ui-docs.html`, click through to "Date & Time (Flatpickr)" via the sidebar (a boosted htmx navigation, exercising the real path). Expected:
- All flatpickr inputs on the page are visibly initialized (styled, clickable, opening a calendar popup) — same as before the conversion.
- The readonly demo input (`#fp-readonly`) shows a value but does not open a picker on click.
- 0 console errors.
- Navigate away to another page and **back** to Date & Time via the sidebar a second time (exercises the re-registration path, not just first load) — same result, no duplicate-init errors, no missing pickers.
- Direct-load test: load `docs/docs/dates.html` directly (not via a boosted click, i.e. typed/refreshed URL) — confirms the `alpine:init`-listener branch (Alpine not started yet at parse time) works, not just the already-started branch.

- [ ] **Step 6: Commit**

```bash
git add docs/docs/dates.html docs/docs-shell.js
git commit -m "refactor(docs): convert dates.html to Alpine.data, drop PAGE_INIT.dates

Reference conversion establishing the pattern Task 4 repeats across
the remaining PAGE_INIT pages: Alpine.data() registered + x-data
instantiated inside #docs-main, gated on window.DocShell.ready so it
never races FlatpickrFactory's lazy load."
```

---

### Task 4: Convert the remaining 10 `PAGE_INIT` pages (parallel fan-out)

**Files:** one `docs/docs/<page>.html` + the corresponding `PAGE_INIT.<key>` deletion from `docs/docs-shell.js` per sub-task below.

**Interfaces:**
- Consumes: the exact pattern from Task 3 (Steps 1-4) and `window.DocShell.ready` (Task 2).
- Produces: nothing further tasks depend on — this is the last content-touching task before cleanup.

**Execution note (per user request):** dispatch each of the 10 sub-tasks below as an independent subagent, run in parallel, model **sonnet or haiku** (not opus/fable). Each sub-task is self-contained: it names the exact page, the exact current `PAGE_INIT` key, and points at the Task 3 pattern (already committed to the repo by the time these run, so a fresh subagent can `git show`/read `docs/docs/dates.html` directly as the reference rather than needing it re-pasted). **Do not pre-write the converted output for each page in this plan** — the current `PAGE_INIT[key]` function bodies are real, substantial, page-specific (ranging from a 15-line slider-fill handler to a ~400-line calendar/chart demo), and copying all ten into this document verbatim would just duplicate what's already in the file; the actual conversion work (applying Task 3's mechanism to each page's specific logic) is each sub-task's job.

Each sub-task follows this identical procedure — stated once here, referenced by number below rather than repeated 10 times:

> **Procedure P4** (applies to every sub-task 4.1-4.10):
> 1. Read the current `PAGE_INIT.<key>` function in `docs/docs-shell.js` (locate by the key name — line numbers will have shifted since this plan was written, do not rely on any line number).
> 2. Read `docs/docs/dates.html` and Task 3's committed diff (`git show <task-3-commit>` or just read the file) as the canonical pattern reference.
> 3. Read `docs/docs/<page>.html` to find its content wrapper immediately inside `#docs-main`.
> 4. Apply the identical mechanism from Task 3: wrap the content container in `x-data="<key>Page()" x-init="init()"`, add an `Alpine.data('<key>Page', factory)` registration `<script>` inside `#docs-main` using the exact same `if (window.Alpine) register(); else document.addEventListener('alpine:init', register);` guard, move the **unmodified logic** of the current `PAGE_INIT.<key>` function body into the factory's `init()`, gated behind `window.DocShell.ready.then(...)`.
>    - Preserve behavior exactly. This is a mechanism swap, not a rewrite — do not "improve" or restructure the page's own demo logic while moving it.
>    - If the current function references `window` globals it creates itself (e.g. `window.docsFilterChild`, `window.docsLevelChange` in `combobox`), keep creating them the same way; other inline `onclick`/`onchange` attributes in the page's markup depend on them existing as globals.
>    - If the function does one-time setup that shouldn't repeat (e.g. constructing a stateful object like a calendar instance), preserve its current re-run behavior exactly as today (don't add new dedup/guard logic that doesn't exist in the source) — Step 6 below is where you check live whether that's actually a problem.
> 5. Delete the `PAGE_INIT.<key>: function () { ... },` block from `docs/docs-shell.js`.
> 6. Verify live in browser: navigate to the page via a boosted sidebar click, confirm the page's interactive elements behave identically to before conversion, 0 console errors; navigate away and back a second time (repeat-visit path); then a direct/typed-URL load (first-load, `alpine:init`-listener path). If repeat-visits reveal a genuine regression (e.g. a duplicated instance, a doubled event listener) that direct comparison against the pre-conversion behavior confirms is new — not simply "this pre-existing pattern re-runs every visit like it always did" — fix it as part of this sub-task and note the fix in the commit message. Do not speculatively add guards for problems you haven't confirmed exist.
> 7. Commit that single page's conversion + its `PAGE_INIT` deletion together.

**Sub-tasks (dispatch in parallel, one subagent each, sonnet/haiku):**

- [ ] **4.1 — `home.html` / `PAGE_INIT.home`.** Trivial: sets `#theme-display` text from `window.WUI.getTheme()`. Follow Procedure P4.
- [ ] **4.2 — `localization.html` / `PAGE_INIT.localization`.** Registers demo EN/AR translation strings via `WUI.i18n.register(...)`, populates a demo list and a `<template>`-cloned block, then calls `WUI.i18n.apply(document)`. Follow Procedure P4. Note: this function's *own* `W.i18n.apply(document)` call at the end is redundant with the one `bindHtmxNav`'s `htmx:afterSwap` listener (Task 2) already performs site-wide — keep it anyway for direct-load correctness (the site-wide one only fires after a boosted swap, not on first load before `DocShell.ready` resolves).
- [ ] **4.3 — `combobox.html` / `PAGE_INIT.combobox`.** Registers a TomSelect custom render template, defines two page-global helper functions (`window.docsFilterChild`, `window.docsLevelChange`) consumed by inline `onchange` handlers elsewhere in the page's markup, calls `TomSelectFactory.init()`, then adds a readonly-wrapper class. Follow Procedure P4 — pay particular attention to the "keep creating window globals the same way" note, since this page's own HTML markup calls them directly.
- [ ] **4.4 — `tinymce.html` / `PAGE_INIT.tinymce`.** Tears down any existing TinyMCE instance bound to `#demo-tinymce` (`tinymce.remove(sel)`), then re-initializes it with content CSS pointed at the active theme palette (via `agencyThemeFile(activePalette())`) and a custom theme-apply callback. This one **explicitly tears itself down before re-initializing** in the current code — preserve that teardown-then-rebuild behavior exactly inside `init()`; it's the one page where "re-run the same construction every visit" is already handled defensively in the source, so there's nothing to newly guard.
- [ ] **4.5 — `interactive.html` / `PAGE_INIT.interactive`.** Binds an `input` listener (plus one immediate `update()` call) to every `.wui-slider-input` on the page for live fill-percentage + value-readout. Follow Procedure P4.
- [ ] **4.6 — `calendar.html` / `PAGE_INIT.calendar`.** The largest interactive demo: calls `WUICalendar.init()` for auto-init examples, then builds a full demo calendar instance on `#cal-demo` with synthetic events anchored to the current week, wires 5 `wui:cal:*` custom-event listeners (guarded by a `host._logHooked` flag against double-binding) and a set of external view-switch buttons (guarded by a `_wired` flag per button). Follow Procedure P4 — this page already has its own double-bind guards (`_logHooked`, `_wired`) for the *listener* wiring; the un-guarded part is the `WUICalendar.create(host, ...)` call itself, which runs fresh every visit today. Preserve that as-is per Procedure P4's step 4 unless live verification (step 6) shows a real regression.
- [ ] **4.7 — `charts.html` / `PAGE_INIT.charts`.** Builds multiple `WUI.chart`/`WUI.pie`/`WUI.donut`/`WUI.gauge`/`WUI.barRow` demo instances across the page, including the neon-glow demo section referenced in this project's prior sessions. Follow Procedure P4. This page's `PAGE_INIT` entry is also referenced by name (`PAGE_INIT.charts`) in `docs-shell.js` comments about `wiring in docs-shell.js's PAGE_INIT.charts` for the neon demo — read the current function in full before converting, it's substantial.
- [ ] **4.8 — `lists.html` / `PAGE_INIT.lists`.** `EOCLists`-driven demos (registry/cascading/tree/flat-select data patterns per the page's nav keyword hints). Follow Procedure P4.
- [ ] **4.9 — `motion.html` / `PAGE_INIT.motion`.** `WUIAnim`-driven demos (progress ring/counter/bar animation triggers per the page's nav keyword hints) — unrelated to the site-navigation GSAP curtain from Task 2, this is page-content animation. Follow Procedure P4.
- [ ] **4.10 — `views.html` / `PAGE_INIT.views`.** The largest `PAGE_INIT` entry (~400 lines) — a WebEOC drill-down display-pattern demo (nested display/input/details/remove board-view scaffold navigation, per the page's nav keyword hints and the project's existing `reference_webeoc_drilldown_display_pattern` documentation). Follow Procedure P4. Given its size, read it fully before starting; if it turns out to bind its own internal click-based sub-navigation (separate from the docs site's own htmx routing), preserve that sub-navigation's current behavior exactly — it is not part of what this plan is replacing.

---

### Task 5: Cleanup — dead code, dead vendor file, full regression pass

**Files:**
- Modify: `docs/docs-shell.js` (remove now-empty `PAGE_INIT` object if empty, or confirm it's genuinely empty)
- Delete: `docs/vendor/barba.min.js`
- Modify (optional, low-risk): strip dead `data-barba="wrapper"` / `data-barba="container"` / `data-barba-namespace="..."` attributes across all 29 `docs/docs/*.html` + `docs/weoc-ui-docs.html`

**Interfaces:**
- Consumes: Tasks 1-4 fully merged (all 11 `PAGE_INIT` entries converted).

- [ ] **Step 1: Confirm `PAGE_INIT` is empty and remove it**

```bash
grep -n "PAGE_INIT" docs/docs-shell.js
```

Expected: only the declaration (`var PAGE_INIT = {};`), the `runPageInit` function's `if (PAGE_INIT[ns])` guard, and no more `<key>: function` entries. If the object is empty, simplify `runPageInit`:

```js
  function runPageInit(ns) {
    renderDemos(document);
    bindDemoCopy();
    highlightStatic(document);
  }
```

(Drop the now-always-false `PAGE_INIT[ns]` branch and the `PAGE_INIT` object declaration itself, along with the `ns` parameter if nothing else in the function body uses it — check before removing the parameter, since call sites pass it positionally.)

- [ ] **Step 2: Remove the dead Barba vendor file**

```bash
git rm docs/vendor/barba.min.js
```

- [ ] **Step 3: Strip dead `data-barba-*` attributes**

Across all `docs/docs/*.html` and `docs/weoc-ui-docs.html`, remove ` data-barba="wrapper"` from the `#docs-split` element and ` data-barba="container" data-barba-namespace="<key>"` from the `#docs-main` element. This is purely cosmetic (confirmed dead in Task 2 — the fallback code path that read `data-barba-namespace` was removed along with `bindRouter`/`navigate`), safe to script as a mechanical find-and-replace across all files in one pass rather than hand-editing each.

- [ ] **Step 4: Full regression pass, live in browser**

Click through **every** sidebar entry once, in order, from a single fresh page load (no reloads in between) — this specifically exercises the "many repeat htmx-boosted navigations in one session" path that the old Barba-descended router struggled with. For each page:
- 0 console errors.
- Page-specific interactivity works (the exact things each Task 4 sub-task verified individually).
- GSAP curtain plays.
- Sidebar active-item + document title update correctly.

Then: use the browser Back button to walk back through the full history stack, confirming each page renders correctly (not blank, not a stale swap).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(docs): remove PAGE_INIT registry, dead Barba vendor file/attrs

Final cleanup once all 11 pages are converted to Alpine.data
components. PAGE_INIT object and its now-dead runPageInit branch
removed; docs/vendor/barba.min.js and leftover data-barba-* markup
(unused since the router removal in the earlier commit) deleted."
```
