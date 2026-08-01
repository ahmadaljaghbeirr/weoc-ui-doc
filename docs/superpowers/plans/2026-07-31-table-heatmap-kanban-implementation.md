# Table Column-Hide Hook, Heatmap, Kanban — Implementation Plan

**Goal:** Ship three independent, standalone weoc-ui components/fixes: a declarative table column-hide hook, a `WUI.heatmap` risk-grid component, and a `WUI.kanban` drag-and-drop component.

**Architecture:** Three fully independent units — no shared files between them except the two barrel files (`CSS/weoc-ui/weoc-ui-core.css`'s `@import` list, and wherever `docs-shell.js`'s `ensureGlobalAssets()`/global-load list lives for new JS modules), which the controller wires centrally after all three land, to avoid parallel-edit conflicts on those two shared files.

**Tech Stack:** Vanilla JS (ES5, matching `wui-charts.js`'s existing style), CSS custom properties + `@container`/CSS grid, no new dependencies.

## Global Constraints

- Follow this codebase's established `WUI.<name>(el, opts)` factory pattern (see `wui-charts.js`'s `WUI.chart`/`WUI.donut`/`WUI.gauge`) — return `{ update, resize?, destroy }` handles, `console.warn` + return `null` on bad config (never throw).
- Reuse existing design tokens (severity/tier colors) — do not invent new CSS custom-property families unless the spec explicitly calls for it.
- Follow the `data-wui-*` declarative-attribute convention already established across the library for any markup-level configuration.
- This lane defaults to EN/AR localization — any new doc page or component-generated user-facing text needs `data-wui-i18n`/`data-wui-i18n-html` markers per the `webeoc-localization` skill conventions already used on every other doc page.
- Verification is manual live-browser (no automated test framework for this static site's runtime code, matching this project's established convention all session) — build the docs demo page, actually load it, actually interact with it, check the console.
- Each task is a self-contained addition of NEW files (plus one shared-barrel-file edit reserved for the controller) — do not modify any other existing component's files.

---

## Task A: Table column-hide hook

**Spec:** `docs/superpowers/specs/2026-07-31-table-column-hide-hook-design.md` (read this in full — it has the exact CSS, markup shape, and rationale).

**Files:**
- Create: `CSS/weoc-ui/weoc-tables-responsive.css`
- Modify: `docs/docs/tables.html` (add a new "Responsive column hiding" section following the page's existing pattern — live example + markup panel + prose)

**Steps:**
1. Write `weoc-tables-responsive.css` exactly per the spec's CSS block (the four `@container` rules).
2. Add the new documentation section to `tables.html`: a small live demo table (reuse a realistic column set, e.g. mirroring the real `Facility Status` table's Facility/Status/Location/Created By/Created At columns) with 2 columns marked `data-wui-hide-below`, wrapped in a resizable demo container (NOT the whole page — the point is demonstrating container-query behavior on the table's own wrapper, so give the demo its own explicitly-resizable/narrower wrapper div, e.g. with a visible resize handle or a small width-toggle button, so the behavior is actually observable without resizing the browser window).
3. Bilingual per this lane's convention: any new prose/labels get `data-wui-i18n`/`data-wui-i18n-html` markers registered in `docs/i18n/tables.js` (check if that file already exists; if `tables.html` isn't currently in `docs-shell.js`'s `I18N_PAGES` list, note that as a pre-existing gap, don't block on fixing it — add the markers anyway so they're ready whenever the page IS localized, matching the existing convention seen on other not-yet-localized pages).
4. **Do not edit `CSS/weoc-ui/weoc-ui-core.css`** — the controller wires the `@import` centrally after all three tasks land.

**Verification:** Load `docs/docs/tables.html` locally, resize the demo's own wrapper (not the browser window) across the sm/md/lg/xl thresholds, confirm the two marked columns hide/show at the correct widths, confirm the rest of the page (other table examples) is unaffected, 0 console errors.

**Report:** Write to `.superpowers/table-hook-report.md` at repo root (create this file) — what was built, verification steps + results, any deviations from spec with reasoning. Commit your work with a clear message.

---

## Task B: Risk-grid heatmap (`WUI.heatmap`)

**Spec:** `docs/superpowers/specs/2026-07-31-heatmap-design.md` (read this in full — it has the exact API shape, color-interpolation approach, tooltip CSS, and error-handling rules).

**Files:**
- Create: `JS/wui-heatmap.js`
- Create: `CSS/weoc-ui/weoc-heatmap.css`
- Create: `docs/docs/heatmap.html` (new doc page, follow the structure/conventions of an existing similar page like `docs/docs/charts.html` or `docs/docs/progress.html` — hero, overview callout, API reference table, live examples with tabbed markup/JS code panels)

**Steps:**
1. Before writing `wui-heatmap.js`, read `JS/wui-charts.js` in full to find its `_lightenColor`/`_tokenMap`/`_resolveColor`-style helpers (exact names may differ — locate them) — determine whether they're private to that file's closure or already exposed in a reusable way. If private, this new file needs its own small equivalent color-interpolation helper (don't try to reach into `wui-charts.js`'s closure) — write one, following the same technique (mix between two hex/token colors by a 0-1 ratio).
2. Implement `WUI.heatmap(el, opts)` per the spec: configurable `rows`/`cols`, `cells` data, CSS-grid render, color interpolated across `--color-success`/`--color-warning`/`--color-danger` by each cell's `value` (0-1), cell text = `label`, hover+focus tooltip via `data-tooltip` + `::after` (per the spec's exact CSS). `opts.type` defaults `'matrix'`; any other value (including the reserved `'calendar'`/`'table'`) → `console.warn` + return `null`.
3. Return `{ update(newCells), resize(), destroy() }`.
4. Build `docs/docs/heatmap.html`: a real 5×5 risk-matrix demo (Likelihood × Severity axis labels, realistic risk-assessment sample data — invent plausible EOC-relevant risk scenarios per cell, following the "real-feeling sample data" convention established by `kpi-recipes.html`), tabbed markup/JS code panel (reuse the existing `tabbedCode()`/`wui-demo-tabbed` pattern already used on other component doc pages), and a second smaller demo proving a non-5×5 config works (e.g. 3×4) to demonstrate the "configurable, not fixed" requirement.
5. **Do not edit `CSS/weoc-ui/weoc-ui-core.css` or `docs-shell.js`'s asset-loading list** — the controller wires both centrally after all three tasks land. Note in your report exactly what line(s) need to be added to each (file path + exact import/load-script line) so the controller can apply it precisely.
6. Bilingual per this lane's convention (`data-wui-i18n`/`-html` markers on the new doc page's prose, registered in a new `docs/i18n/heatmap.js` file, and add `'heatmap'` to `docs-shell.js`'s `I18N_PAGES` array — this IS a change to `docs-shell.js`, but a different, additive-only part of it than the asset-loading list; a single-line array addition is low collision risk, make it directly rather than deferring to the controller).

**Verification:** Load `docs/docs/heatmap.html` locally, confirm the 5×5 demo renders with correct color gradation low→high, hover a few cells to confirm the tooltip appears with correct text, tab-focus a cell (keyboard, not mouse) to confirm the tooltip also appears on focus, confirm the 3×4 demo renders correctly, confirm `handle.destroy()` actually removes the grid, 0 console errors. Test the error path too: temporarily call `WUI.heatmap(el, {type:'calendar', ...})` in the browser console, confirm it logs a warning and returns `null` without throwing.

**Report:** Write to `.superpowers/heatmap-report.md` at repo root — what was built, verification steps + results, the exact barrel-file line(s) the controller needs to add, any deviations from spec with reasoning. Commit your work with a clear message.

---

## Task C: Kanban board (`WUI.kanban`)

**Spec:** `docs/superpowers/specs/2026-07-31-kanban-design.md` (read this in full — it has the exact API shape, drag-and-drop mechanics, and error-handling rules).

**Files:**
- Create: `JS/wui-kanban.js`
- Create: `CSS/weoc-ui/weoc-kanban.css`
- Create: `docs/docs/kanban.html` (new doc page, same conventions as Task B's `heatmap.html`)

**Steps:**
1. Implement `WUI.kanban(el, opts)` per the spec: configurable `columns`, `cards` data, native HTML5 drag-and-drop (`draggable="true"`, `dragstart`/`dragend`/`dragover`/`dragleave`/`drop` handlers — mirror the real mechanics already proven in `eoc-makeover/TaskManagement/out/board.web` around line 1733-1786 for the exact event sequence and `dataTransfer` usage, adapted to be board-agnostic), `opts.onBeforeMove(card, fromColumnKey, toColumnKey)` hook that can reject a move (return/resolve `false` → snap back, no commit).
2. Card markup reuses `.wui-badge` for priority/meta display (existing severity-token convention), not a new visual language.
3. Return `{ update(newCards), addCard(card), removeCard(id), destroy() }`.
4. Build `docs/docs/kanban.html`: a real demo mirroring `TaskManagement`'s actual 4-column shape (Open/In Progress/Completed/Rejected) with realistic sample task data (title, assignee, priority — following the same "real-feeling sample data" convention), tabbed markup/JS code panel, and a second smaller demo with a DIFFERENT column configuration (e.g. a 3-column "To Do / Doing / Done" board) proving the component isn't secretly hardcoded to the reference board's exact 4 statuses. Demo an `onBeforeMove` returning `false` on at least one column pair (e.g. document/show that dropping onto "Rejected" prompts a confirm before committing) so the reject-path is visibly exercised, not just implemented.
5. **Do not edit `CSS/weoc-ui/weoc-ui-core.css`** — controller wires the `@import` centrally. Note the exact line to add in your report.
6. Bilingual per this lane's convention, same as Task B (new `docs/i18n/kanban.js`, add `'kanban'` to `I18N_PAGES` — same reasoning: additive array entry, low collision risk, do it directly).

**Verification:** Load `docs/docs/kanban.html` locally, drag a card between every pair of columns in the 4-column demo, confirm the card moves and the column counts update, confirm the `onBeforeMove`-rejects demo actually snaps the card back visibly (not just silently staying — the drag interaction should show the card animate/snap back to its origin column), confirm the second (different-column-set) demo also drags correctly, confirm `handle.addCard()`/`removeCard()`/`destroy()` work, 0 console errors.

**Report:** Write to `.superpowers/kanban-report.md` at repo root — what was built, verification steps + results, the exact barrel-file line the controller needs to add, any deviations from spec with reasoning. Commit your work with a clear message.

---

## Task D: SweetAlert2 vendored + themed, wrapped as WUI.alert/WUI.confirm

**Spec:** `docs/superpowers/specs/2026-07-31-sweetalert-design.md` (read in full — exact API, file placement, error-handling rules).

**Files:**
- Create: `JS/sweetalert2.all.min.js` (vendored, real download, verified genuine — not hand-written)
- Create: `CSS/sweetalert2.min.css` (vendored, unmodified)
- Create: `CSS/sweetalert2-weoc-theme.css` (the full theme override — flat under `CSS/`, NOT nested in `CSS/weoc-ui/`, per explicit user placement instruction)
- Create: `JS/wui-alert.js` (the `WUI.alert`/`WUI.confirm` wrapper — flat in `JS/`, matching `wui-charts.js`/`wui-heatmap.js`/`wui-kanban.js`)
- Modify: `docs/docs/kanban.html` (Task C's file, already built by the time this task starts — swap its reject-confirmation demo from native `confirm()` to `WUI.confirm(...)`)

**Steps:**
1. Download the real SweetAlert2 UMD build (`https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js` or current latest — verify the exact current version/URL, don't assume) to `JS/sweetalert2.all.min.js`. Verify genuine: `window.Swal` exists, `typeof Swal.fire === 'function'`, byte size sane (SweetAlert2's all-bundle is normally 60-80KB minified, not a tiny error-page-sized file).
2. Download the matching `sweetalert2.min.css` to `CSS/sweetalert2.min.css`.
3. Read the real vendored `sweetalert2.min.css` to find its actual class names (`.swal2-popup`, `.swal2-title`, etc. — don't guess, confirm against the real file), then write `CSS/sweetalert2-weoc-theme.css` overriding every color/spacing/radius/font value with real `weoc-ui` tokens (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--font-*)` — confirm real token names against `CSS/weoc-ui/agency-theme.css`, don't invent names).
4. Write `JS/wui-alert.js`: `WUI.alert(opts)`/`WUI.confirm(opts)` per the spec's API — internally call `Swal.fire({...opts, ...themeDefaults})`, `WUI.confirm` resolves a plain boolean (`result.isConfirmed`), not SweetAlert2's richer result object. If `window.Swal` is undefined when called, `console.warn` + fall back to native `window.alert`/`window.confirm`.
5. Update `docs/docs/kanban.html`'s reject-confirmation demo to call `WUI.confirm(...)` instead of native `confirm()`.
6. Do NOT edit `CSS/weoc-ui/weoc-ui-core.css` or any global asset-loading list — leave both for the controller, note the exact lines needed in your report.
7. Serve locally, verify live in a real browser if available: `WUI.alert()`/`WUI.confirm()` render fully themed (not default SweetAlert2 look) in at least 2 different themes, confirm re-theming works correctly after a theme switch, confirm `WUI.confirm()` resolves `true`/`false` correctly, confirm the Kanban demo's reject-gate now shows the themed popup.
8. Commit your work.

**Report:** Write to `.superpowers/sweetalert-report.md` at repo root — what was built, verification results, exact barrel-file lines the controller needs to add, any deviations with reasoning.

---

## Controller follow-up (after all four tasks report DONE)

1. Read all four reports.
2. Apply the deferred barrel-file edits centrally in one commit: `@import` lines in `weoc-ui-core.css` for `weoc-tables-responsive.css`/`weoc-heatmap.css`/`weoc-kanban.css`/`sweetalert2-weoc-theme.css`, and the JS/CSS asset-loading list entries for `wui-heatmap.js`/`wui-kanban.js`/`wui-alert.js`/`sweetalert2.all.min.js`/`sweetalert2.min.css` (checking `docs-shell.js`'s `ensureGlobalAssets()` — table-hook Task A needs no JS entry, it's pure CSS).
3. Live-verify all four doc pages ONE more time after the barrel wiring lands (confirming the newly-wired global CSS/JS actually loads correctly from a fresh page load, not just from each task's own isolated dev testing).
4. Add nav entries for the new doc pages (`heatmap.html`, `kanban.html`) to `docs-shell.js`'s `NAV` array, in a sensible existing group (Data Display for heatmap alongside Charts; Patterns for Kanban, alongside Board Views, since it's a layout pattern not a chart). SweetAlert2/`WUI.alert`/`WUI.confirm` doesn't need its own dedicated doc page in this pass unless a natural home is obvious (e.g. folded into an existing "Overlays" or "Feedback" page as a new section) — decide at that time based on what exists.
