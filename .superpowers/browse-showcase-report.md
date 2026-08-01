# Browse Components showcase — implementation report

**Date:** 2026-07-31
**Spec:** `docs/superpowers/specs/2026-07-31-browse-components-showcase-design.md`

## What was built

`docs/docs/browse.html` — a curated `.wui-bento` showcase, 13 tiles:

| Tile | Size | Kind | Links to |
|---|---|---|---|
| Hero ("weoc-ui — see it in action") | 4x2 | static (non-link div) | — |
| Charts | 2x2 | live `WUI.chart()`, area, neon glow | `charts.html` |
| Kanban | 2x2 | live `WUI.kanban()`, real drag | `kanban.html` |
| Heatmap | 2x2 | live `WUI.heatmap()`, 4x4 | `heatmap.html` |
| Calendar | 2x2 | live `WUICalendar.create()`, month view | `calendar.html` |
| Gauge | 1x1 | live `WUI.gauge()` | `charts.html` |
| Donut | 1x1 | live `WUI.donut()` | `charts.html` |
| Progress | 1x1 | static `wui-progress-ring` (75%) | `progress.html` |
| Date Picker | 1x1 | live Flatpickr (`FlatpickrFactory`) | `dates.html` |
| Cards & Containers | 1x1 | static `wui-card` | `containers.html` |
| Badges & Chips | 1x1 | static `wui-badge`/`wui-chip` | `interactive.html` |
| Buttons | 1x1 | static (span-based `.wui-btn` visuals) | `buttons.html` |
| Tables | 1x1 | static `wui-table-standard` | `tables.html` |

This matches the spec's starting table almost exactly (Gauge/Donut both point at `charts.html` since that's where they're actually documented — there's no standalone gauge/donut page).

`docs/i18n/browse.js` — 14 `WUI.i18n.register()` entries (`docs_browse_1`..`14`): hero title/subtitle + all 12 tile labels, EN+AR, matching the exact format of every other `docs/i18n/*.js` file. Live/static tile *content* (chart data, kanban card titles, badge/button sample text) is intentionally left untranslated — same convention every other docs page already uses for its own demo markup.

`docs/index.html:51` — the only edit outside the two new files: `href="./docs/interactive.html"` → `href="./docs/browse.html"`.

## Key implementation decisions (beyond the spec's literal wording)

1. **`docs/i18n/browse.js` is loaded directly from `browse.html`'s own `<head>`** (right after `weoc-ui.js`, which defines `WUI.i18n` synchronously), NOT through `docs-shell.js`'s `I18N_PAGES` lazy-loader array. `docs-shell.js` currently ONLY loads a page's per-page i18n file if its key is in that hardcoded array — adding `'browse'` to it would have required editing `docs-shell.js`, which is off-limits per the task's hard constraint. `WUI.i18n.register()` just appends to a shared store regardless of *how* it's called, so a direct `<script>` tag works identically. Verified live: the header's language-toggle button correctly flips the whole page (hero + all 12 tile labels + RTL mirroring of the grid), with zero `docs-shell.js` involvement.

2. **`charts.html`/`kanban.html`/`heatmap.html`'s own direct-`<head>`-load convention was followed for their JS/CSS** (uPlot, `wui-charts.js`, `weoc-kanban.css`, `wui-kanban.js`, `weoc-heatmap.css`, `wui-heatmap.js`, `weoc-tables.css`) rather than relying solely on `docs-shell.js`'s global asset loader — this matches how every reference page keeps itself "fully functional on a standalone/direct load," and sidesteps any need to touch `docs-shell.js`'s `ensureGlobalAssets()`. (Confirmed by reading it: `wui-charts.js`/`wui-heatmap.js`/`wui-kanban.js` are in fact already global jobs there too — the direct load is redundant-but-harmless, guarded by `if (!window.WUI || !window.WUI.kanban)` etc.) `WUICalendar` and `FlatpickrFactory` are pure global assets already (confirmed `calendar.html`/`dates.html` don't load them directly either), so `browse.html` doesn't either.

3. **Click-through vs. live interactivity conflict — found and fixed via live testing.** Wrapping Kanban/Calendar/Date-picker in a real `<a href>` (as the spec requires for all tiles) means a click on the calendar's own "next month" button, a kanban card, or the date input would otherwise also fire the anchor's native navigation. First attempt used `e.stopPropagation()` on a `.browse-tile-preview-interactive` guard — **this did not work** (verified live: clicking the calendar's "›" button navigated to `calendar.html` anyway). Root cause: the browser's "follow this link" default action fires based on the click event's path reaching an `<a>`, independent of `stopPropagation()` — only `preventDefault()` cancels it. Fixed to `e.preventDefault(); e.stopPropagation();`. Re-verified live: the calendar's next-month button now advances the calendar (July → August 2026) **and** stays on `browse.html`; the date picker opens and a date selection works without navigating away; kanban drag doesn't navigate away either. Non-interactive tiles (chart, heatmap, gauge, donut, static tiles) and the label row of the interactive tiles still navigate normally on click. Native middle-click/ctrl-click-to-new-tab is unaffected either way (that's `auxclick`, not `click`).

4. **Buttons tile uses `<span class="wui-btn ...">` instead of `<button>`** for its static preview — nesting a real `<button>` inside an `<a>` is invalid HTML content-model-wise; since `.wui-btn` styling is purely class-driven, a `<span>` looks pixel-identical without the invalid nesting. (Kanban's real cards use `draggable` `<div>`s, not `<button>`, so no issue there. Calendar's own internal toolbar/action buttons ARE real `<button>` elements nested inside the wrapping `<a>` — that part of the invalid-nesting concern is inherent to the spec's own design of embedding a real interactive widget inside an anchor; the `preventDefault()` guard above neutralizes the practical symptom, and it's confirmed working correctly in Chrome.)

5. **Added `docs-section` as an extra class on the bento wrapper.** `docs-shell.js`'s `entranceAnimate()` unconditionally runs `gsap.from('.docs-hero, .docs-section', ...)` on every page. Without either class present, it logged two harmless "GSAP target ... not found" console warnings on load. `.docs-section` only adds `margin-bottom` (no title/desc styling used), so adding it as an extra class costs nothing and gives the page the same staggered fade-up entrance every other docs page gets, with zero warnings. Confirmed via console read: warnings gone after the fix.

6. **Hero tile is a plain `<div>`, not an `<a href="#">`** (the spec's markup snippet showed `href="#"` as a placeholder). Since the hero doesn't represent any specific component's doc page, a self-referencing `href="#"` link seemed more likely to read as a bug in review than a non-interactive tile. This is the one deliberate small deviation from the spec's literal markup shape; flagged here for visibility.

## Known minor cosmetic side effect (accepted, inherent to "no NAV entry")

`docs-shell.js`'s `renderChrome()` sets `document.title` from `labelFor(activeKey)`, which falls back to the generic `'weoc-ui — Component Library'` for any key not in the `NAV` array (confirmed by reading the source — `'browse'` deliberately isn't in `NAV`, per spec). So the browser tab title briefly shows `browse.html`'s own `<title>weoc-ui — Browse Components</title>` and then gets overwritten to the generic title once `DocShell.init('browse')` runs. This is a direct, accepted consequence of the spec's explicit "no NAV entry" design (verified: sidebar correctly shows no active/highlighted item, no console error, no crash) — not a functional bug, not something fixable without touching `docs-shell.js`.

## Verification performed (live browser, Chrome via claude-in-chrome)

Served the repo root with `python -m http.server` and drove a real Chrome tab:

- `index.html` → click "Browse Components" → lands on `browse.html` (confirmed via tab URL, not the old `interactive.html` placeholder).
- Every live tile renders on both a hard reload and after the htmx-boosted nav-swap: Charts (neon area chart draws), Kanban (3 columns + cards render, drag doesn't crash/navigate), Heatmap (4x4 colored grid), Calendar (month view + toolbar), Gauge (semicircle + status chip), Donut (3-segment ring + center label), Date Picker (flatpickr calendar opens, a date is selectable and populates the input).
- Every tile is real navigation: tested Heatmap → `heatmap.html`, Calendar label → `calendar.html`, Buttons → `buttons.html` — each landed correctly and each source tab is a genuine `<a href>` (works with middle-click by construction, not tested with an actual middle-click since the automation tool doesn't expose one directly, but nothing in the implementation depends on JS to make navigation work).
- Interactive-tile click guard: verified BEFORE fix that it was broken (calendar's own "next month" button navigated away), verified AFTER the `preventDefault()` fix that (a) the calendar's own button still advances the month and (b) the page stays on `browse.html`. Same fix covers kanban and the date-picker input.
- Hover state: confirmed visually (border highlights blue, background tints, tile lifts) — the exact `kpi-recipes.html` `.dash-tile:hover` recipe, reused verbatim in `.browse-tile:hover`.
- Console: 0 errors and, after the `docs-section` fix, 0 warnings originating from this page (one unrelated browser-extension log line is present regardless of page, ignored).
- Bilingual toggle: clicked the header's language-toggle button — hero title/subtitle and all 12 tile labels correctly switch to Arabic, RTL-mirrors the whole grid (tile order visually reverses), sidebar nav translates too (pre-existing chrome behavior, unaffected by this page). Toggled back to English, confirmed round-trip is clean.
- `git diff --stat docs/docs-shell.js` → **empty output** — confirmed zero edits to that file, as required.

## Files changed

- `docs/docs/browse.html` (new)
- `docs/i18n/browse.js` (new)
- `docs/index.html` (one line: hero "Browse Components" button href)

`docs-shell.js` is untouched, confirmed via `git diff --stat`.
