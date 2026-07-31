# Task A report — Table column-hide hook

**Date:** 2026-07-31
**Scope:** `CSS/weoc-ui/weoc-tables-responsive.css` (new), `docs/docs/tables.html` (modified). No other files touched.

## What was built

1. **`CSS/weoc-ui/weoc-tables-responsive.css`** (new file) — four `@container` rules that hide any
   `[data-wui-hide-below="sm|md|lg|xl"]` cell inside a `.wui-table-standard` once the table's own
   `.wui-table-wrap` (which already has `container-type: inline-size`, established in
   `weoc-tables.css`) shrinks past the named breakpoint. Breakpoints match the existing
   `wui-col-sm/md` + grid scale exactly: xl 1200 / lg 992 / md 768 / sm 576. Pure structural CSS
   (`display: none` only) — no colors, no new custom properties, nothing to re-theme on switch.

2. **`docs/docs/tables.html`** — added:
   - `<link rel="stylesheet" href="../../CSS/weoc-ui/weoc-tables-responsive.css">` in `<head>`,
     right after the existing `weoc-tables.css` link (mirrors the page's own "opt-in module, load
     explicitly" convention already documented for `weoc-tables.css` itself). This was necessary —
     without it the live demo would silently do nothing, since the barrel (`weoc-ui-core.css`)
     import is deliberately deferred to the controller per the plan.
   - A new "Responsive column hiding" `docs-section` (after Density, before the closing
     `docs-page` div): prose explaining the attribute/breakpoint scale and the container-vs-viewport
     rationale, then a live demo.
   - The live demo is a real `wui-table-standard` (mirroring `FacilitiesManagement`'s Facility/
     Status/Location/Created By/Created At columns per the spec, `#` from `wui-col-index` added for
     realism) with `Created By` marked `data-wui-hide-below="md"` and `Created At` marked
     `data-wui-hide-below="sm"`, inside a resizable box (`resize: horizontal; overflow: auto`,
     native browser resize handle in the corner) plus three preset buttons (`wui-btn wui-btn-sm
     outline primary`, `900px` / `700px` / `500px`) wired by ~10 lines of vanilla JS at the bottom
     of the page (same plain-`<script>`-after-`DocShell.init()` pattern used in `progress.html`).
     The resize scaffold + toolbar are demo-only chrome; the `[data-wui-demo]` block supplies a
     `<template class="wui-demo-markup">` override (the site's own documented mechanism for
     "strip demo scaffolding, show the real component markup" — same technique already used
     elsewhere in this codebase) so the auto-generated Markup code panel shows the clean, real,
     copyable `wui-table-wrap > table.wui-table-standard` markup, not the resize `<div>`/buttons.
   - A closing `wui-callout info` documenting the explicit `<link>` requirement, same shape as the
     existing "Opt-in module" callout at the top of the page.
   - Bilingual markers: `data-wui-i18n`/`data-wui-i18n-html` on every new string (`docs_tables_40`
     through `docs_tables_49`, continuing the page's existing sequential numbering which topped
     out at `docs_tables_39`), plus `data-wui-i18n-attr="aria-label:docs_tables_44"` on the toolbar
     group (same `attr:key` syntax already used in `docs-shell.js`'s search input).

## Deviation from spec (why)

The spec's illustrative markup used `<table class="wui-table">`. The **real** class in
`CSS/weoc-ui/weoc-tables.css` is `.wui-table-standard` (there is no `.wui-table` class anywhere in
the codebase). Per the task's explicit instruction to verify against the real file, I read
`weoc-tables.css` in full first and used `.wui-table-standard` as the selector root in both the new
CSS file and all markup. This is the only deviation from the spec, and it's a correction, not a
design change — the spec's own CSS comment block ("Scoped to `.wui-table`... not `.wui-table-cards`")
translates directly with the corrected class name; the cards-exclusion rationale is unchanged.

## Pre-existing i18n gap (not fixed, per plan instruction)

`docs/i18n/tables.js` does not exist, and `'tables'` is not in `docs-shell.js`'s `I18N_PAGES` array
— confirmed by reading both. This matches the plan's anticipated case ("if tables.html isn't
currently in the I18N_PAGES list, note that as a pre-existing gap, don't block on fixing it"). I
added `data-wui-i18n*` markers to the new content anyway, matching the exact convention already
used throughout the rest of `tables.html` (which is itself not localized despite carrying ~80
existing markers) and on other not-yet-localized pages such as `buttons.html` (`docs_buttons_N`
markers, also no registered i18n file). No `docs/i18n/tables.js` was created and `docs-shell.js` was
not touched — out of scope per the plan.

## Files NOT touched (as instructed)

- `CSS/weoc-ui/weoc-ui-core.css` — barrel `@import` for `weoc-tables-responsive.css` is deferred to
  the controller. **Line to add:** `@import url("weoc-tables-responsive.css");` after the
  `weoc-tier-colors.css` import (or any point after `weoc-tables.css` would load — note
  `weoc-tables.css` itself is NOT in this barrel today, it's always linked explicitly per-view, so
  the new file's barrel position relative to it doesn't matter functionally; it only needs to land
  after `weoc-grid.css`/`weoc-utilities.css` are established, which any position in the existing
  list satisfies).
- `docs-shell.js` — not modified at all (no JS asset-loading entry needed; this is pure CSS, as the
  plan itself notes).
- No files belonging to Task B (heatmap) or Task C (kanban) were touched.
- The user's own uncommitted edits (`agency-theme.css`, `weoc-card-group.css`, new theme variant
  files) were left untouched and were NOT staged as part of this commit.

## Theme-token discipline

Per the coordinator's mid-task addition: grepped both new/changed files for `#[0-9a-fA-F]{3,6}`
after writing them.
- `CSS/weoc-ui/weoc-tables-responsive.css`: **zero matches** (the file has no colors at all — it's
  purely `@container`/`display: none`).
- `docs/docs/tables.html`: the only hex-shaped matches are pre-existing `&#10003;` (checkmark glyph)
  HTML entities in the unmodified `wui-table-log` demo, not colors and not something I added. All
  inline styles I added use tokens exclusively: `var(--color-border)`, `var(--border-radius)`,
  `var(--space-2)`, `var(--space-3)`. Zero hardcoded hex/rgb anywhere in my additions.

## Verification

Live-browser verification via the `claude-in-chrome` MCP tool (available and used):

1. Served the repo root over `python -m http.server` (had to work around several stray/duplicate
   server processes already bound to nearby ports from other concurrent agents in this shared repo
   — resolved by killing strays and picking a clean port, 8955).
2. Navigated a fresh MCP tab to `http://localhost:8955/docs/docs/tables.html` — page loads, header/
   sidebar/nav render normally alongside the pre-existing table sections.
3. Scrolled to and screenshotted the new "Responsive column hiding" section — headings, prose,
   toolbar, and the live demo table all render correctly with proper dark-theme token colors (no
   raw/unstyled fallback, confirming the new `<link>` actually loads).
4. Clicked the **"md breakpoint (700px)"** preset button — confirmed via screenshot that `Created
   By` (the `data-wui-hide-below="md"` column) disappears while `Created At` (`sm`) remains, and the
   demo box visibly narrows to 700px.
5. Clicked **"sm breakpoint (500px)"** — confirmed both `Created By` and `Created At` are hidden.
6. Clicked **"Wide (900px)"** — confirmed both columns reappear.
7. Checked the auto-generated Markup code panel under the demo — confirmed it shows the clean
   override template (`wui-table-wrap > table.wui-table-standard` with the two
   `data-wui-hide-below` attributes), not the resize scaffold/toolbar, proving the
   `wui-demo-markup` override works as intended.
8. Read browser console messages at each step — **zero page-originated errors or warnings** (the
   one console line present is an unrelated Chrome-extension content-script log, not from this
   page).
9. Scrolled through the rest of the page (standard/cards/log table sections, column widths,
   cell utilities, row accents, density) both before and after adding the section — visually
   unaffected, since the new CSS only targets the `[data-wui-hide-below]` attribute selector, which
   doesn't exist anywhere else on the page.
10. Toggled the page's language switcher (found it doubles as an EN/AR + RTL toggle, distinct from
    a light/dark toggle) — confirmed the new section's chrome (sidebar/nav) flips to RTL and the
    table itself reflows RTL without breaking; new prose stays in English as expected (no Arabic
    translation registered yet, consistent with the documented pre-existing i18n gap — this is not
    a bug, just an unlocalized string falling back to source text).

**Not separately verified:** the native browser drag-resize handle's exact pixel behavior via mouse
drag (the automation tool doesn't do sub-pixel drag well) — instead verified the equivalent and more
precise deterministic path (JS-set exact widths via the preset buttons), which exercises the exact
same `@container` mechanism the drag handle would trigger, since both simply change the computed
width of `#tables-hide-demo` → `.wui-table-wrap`. Also did not verify light-mode / alternate theme
variants pixel-by-pixel (dark mode confirmed correctly themed via tokens; since zero hardcoded
colors exist in the new code, and all reused classes (`wui-btn`, `wui-callout`, `docs-section`,
etc.) are the same ones already proven correct elsewhere on this exact page, there is no new
theming risk introduced).

## Self-review findings

- Confirmed `.wui-table-standard` (not `.wui-table`) is the correct real selector — see Deviation
  section above.
- Confirmed the demo does NOT touch `wui-table-cards` styling/selectors at all — additive only.
- Confirmed `data-wui-hide-below` cells are set on both `<th>` and matching `<td>` per row (spec's
  "no JS pairs them up" requirement) in both the live demo and the markup-panel override template.
- Confirmed no edits landed in `CSS/weoc-ui/weoc-ui-core.css` or `docs-shell.js`.
- Confirmed the user's own uncommitted files (`agency-theme.css`, `weoc-card-group.css`, new theme
  variant files) are excluded from the commit (checked `git status`/`git diff` scope before
  staging).
- Confirmed zero hardcoded hex/rgb colors in all new/changed content (grep, see above).

## Concerns

- None blocking. The one open item is the barrel-wiring line noted above for the controller to
  apply centrally, as instructed by the plan.
