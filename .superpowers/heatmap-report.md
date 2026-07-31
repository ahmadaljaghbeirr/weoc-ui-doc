# Task B — Risk-grid heatmap (`WUI.heatmap`) — Report

## What was built

- **`JS/wui-heatmap.js`** — `WUI.heatmap(el, opts)` factory. `{ update, resize, destroy }` handle. Follows `wui-charts.js`'s established shape:
  - `_tokenMap()` reads `--color-success` / `--color-warning` / `--color-danger` live via `getComputedStyle` on every render (create/update/resize/theme-change) — never cached.
  - Own `_toRgbChannels` / `_mixColor` color helpers (private copies, since `wui-charts.js`'s equivalents live inside that file's closure and aren't exposed on `WUI`, per the plan's step 1 instruction).
  - `_colorForValue(value, tokens)`: two-stage linear mix, success→warning for value 0–0.5, warning→danger for 0.5–1, so intermediate values get smooth intermediate colors (not a 3-swatch snap).
  - `cells` shape decided at implementation time (spec left this open): array of `{ row, col, value, label, tooltip }`, addressed by their own `row`/`col` rather than required to be exhaustive/row-major. Any (row,col) missing from the array renders as an empty cell — this is what makes "missing/malformed cells → empty grid, no crash" fall out naturally rather than needing special-case code.
  - Container element itself becomes the `.wui-heatmap` grid root (mirrors `WUI.barRow()`'s "container is the render target" pattern, not the canvas-wrapping chart types).
  - `opts.type` defaults `'matrix'`; `'calendar'`/`'table'` are reserved and, like any other unrecognized value, `console.warn` + return `null` — never throws.
  - Subscribes to `wui:themechange` once at module level (own registry, separate from `wui-charts.js`'s) and re-renders every registered heatmap inside one `requestAnimationFrame`, matching the chart family's theme-awareness convention. This was added proactively (not explicitly required by the spec's error-handling section) because the color scale is token-driven and would otherwise go stale on theme switch.
  - ES5 throughout (`var`, function declarations, no arrow/template/destructuring), per the plan's Global Constraints.

- **`CSS/weoc-ui/weoc-heatmap.css`** — grid layout (`--wui-heatmap-cols` JS-driven custom property, mirrors `.wui-bento`'s `--wui-bento-cols` convention), corner/row/col label styling, cell styling (`--wui-heatmap-cell-color` inline var, `--color-on-accent` for cell text), `:focus-visible` ring, and the tooltip.

- **`docs/docs/heatmap.html`** — new doc page: hero, "real DOM not canvas" callout, overview, full API reference table, a real 5×5 Likelihood×Severity risk matrix (25 hand-authored EOC scenarios, e.g. "Almost Certain × Severe: confirmed Category 4 hurricane on a direct landfall track"), a 3×4 "Shift Coverage" demo (shelters × time blocks, staffing-gap coloring — deliberately a *different* domain, not just a smaller risk matrix, to make the configurability proof more convincing), a reserved-types/error-handling section with a live "try it" button, and a theme-awareness section. Tabbed Markup/JavaScript code panels via the existing `wui-demo`/`tabbedCode()` convention (auto-captured live markup + an authored `<template class="wui-demo-js">`, same as `charts.html`).

- **`docs/i18n/heatmap.js`** — EN/AR pairs for all 24 `docs_heatmap_N` markers (hero, callout, overview, API table headers/prose, both example sections, error-handling section, theme-awareness section). `data-wui-i18n` (textContent) markers use literal Unicode characters (e.g. `×`), not HTML entities; `data-wui-i18n-html` (innerHTML) markers use entities — verified against `weoc-ui.js`'s `apply()` implementation (`textContent` vs `innerHTML` branches) to avoid a literal `&times;` leaking onto the page.

- **`docs/docs-shell.js`**: added `'heatmap'` to `I18N_PAGES` (the plan-authorized direct edit). Note: this array was being edited concurrently by the Kanban agent's own `'kanban'` addition mid-task — re-read the file before editing and merged cleanly (`..., 'kpi-recipes', 'kanban', 'heatmap'];`). No other part of `docs-shell.js` was touched.

## Design decisions made at implementation time (spec left open)

1. **`cells` shape**: array of `{row, col, value, label, tooltip}` objects (not a flat row-major array). Chosen because it's exactly the spec's own illustrative example, it's order-independent/sparse-friendly, and it makes "missing (row,col) → empty cell" the natural default rather than requiring special handling.
2. **Tooltip surface/text tokens**: the spec's illustrative CSS used `var(--color-surface-inverse, #1a1a1a)` / `var(--color-text-inverse, #fff)`, but grep confirmed neither `--color-surface-inverse` nor `--color-text-inverse` exists anywhere in `agency-theme.css` or any of the 7 theme variant files. Per the mid-task addition (zero hardcoded hex, real tokens only), the tooltip uses `background: var(--color-text-primary)` / `color: var(--color-bg)` — a deliberate **swap** of the page's own text/background pair. Because `--color-text-primary` is already the token guaranteed to contrast against `--color-bg` in every theme (that's its whole job), using it as the tooltip's background and the page background as the tooltip's text produces a real, theme-correct "inverse chip" with zero new tokens and zero hardcoded values. Verified in the browser: light theme → dark chip with light text; dark theme (`data-theme="light"` toggled and back — see verification) → still contrasts correctly since it's driven by the resolved theme, not a static rule.
3. **`resize()`** is a real re-render (from current opts + freshly-read tokens), not a no-op — since the grid is fluid CSS, there's no pixel canvas to resize, but making it functionally equivalent to `update()`-with-same-data means it's a genuinely useful hook (e.g. after an external layout change) rather than a dead API surface.
4. **No escaping of `label`/`tooltip`/labels in the innerHTML build** (except quote-escaping the `data-tooltip` attribute value) — matches the existing precedent in `wui-charts.js` where `WUI.pie`/`WUI.donut`/`WUI.barRow` also insert `label`/`value` into `innerHTML` unescaped (board-authored trusted strings, not user input). Documented inline in the JS file.

## Verification performed (live browser, `claude-in-chrome`)

Served via the existing `127.0.0.1:5500` static server already running against the vault root; loaded `http://127.0.0.1:5500/93_TEMP/contexts/weoc-ui/helper_files/weoc-ui-doc/docs/docs/heatmap.html`.

- **5×5 risk matrix**: renders with correct color gradation, green (Rare/Negligible) through yellow/amber (Moderate) to orange/red (High/Critical) — confirmed visually via screenshot.
- **3×4 shift-coverage demo**: renders correctly with a genuinely different row/col count and axis meaning — confirmed visually.
- **Hover tooltip**: confirmed via screenshot — hovering a cell shows the dark chip with the correct scenario text.
- **Keyboard-focus tooltip**: confirmed independently of the mouse — `element.focus()` via JS on a cell while the cursor was elsewhere still triggered the tooltip (`:focus-visible` rule working, not hover-dependent).
- **`handle.destroy()`**: clicked the "Destroy" button on the 5×5 demo — grid removed from DOM, status text updated, confirmed via screenshot.
- **Error path**: clicked the live "Try type: 'calendar'" button — status text read `WUI.heatmap({ type: "calendar" }) returned null — check the console for the warning.`; `read_console_messages` confirmed the exact `[wui-heatmap] WUI.heatmap(): type "calendar" is reserved for a future release...` warning, no thrown exception.
- **Theme-switch live re-color**: toggled `data-theme` light↔dark via the header control. Verified via JS that `--color-success/-warning/-danger` changed to the light-theme hex values (`#16a34a`/`#ea7c14`/`#dc2626`) and, critically, that a live cell's `--wui-heatmap-cell-color` / computed `background-color` updated to `rgb(64,155,63)` — which is the exact mathematically-correct interpolation of the *new* light-theme tokens at that cell's `value: 0.10` (verified by hand: `22+(234-22)*0.2=64.4`, `163+(124-163)*0.2=155.2`, `74+(20-74)*0.2=63.2`). Confirms the color pipeline is genuinely live-token-driven, not cached at creation.
- **RTL/Arabic i18n**: toggled the language switcher — page flipped to RTL, sidebar moved, all `docs_heatmap_N` prose translated correctly (spot-checked the 3×4 section heading and body), heatmap grid itself still rendered correctly under RTL, no console errors. Toggled back to English/LTR afterward.
- **Console**: `read_console_messages` with `onlyErrors: true` checked after initial load, after both demos rendered, after the destroy click, after the error-path click, after both theme toggles, and after the language toggle — zero errors/exceptions at every checkpoint.
- **Final grep**: `grep -nE '#[0-9a-fA-F]{3,8}|rgb\(\s*[0-9]' JS/wui-heatmap.js` and the same against `CSS/weoc-ui/weoc-heatmap.css` — both zero matches (exit 1 / no matches). No hardcoded hex or literal rgb() anywhere in either file.

Not independently verified: the 7 named themes' exact swatch-by-swatch appearance (only the light/dark `data-theme` axis was toggled, since that's what the token values actually branch on for `--color-success/-warning/-danger`/`--color-text-primary`/`--color-bg` — the accent-color swatches in the header change `--color-10` etc., which this component doesn't use). Confirmed via direct file read that all 4 dedicated theme-variant files (`agency-theme-{crimson,emerald,sand,slate}.css`) redefine `--color-text-primary`/`--color-bg` as matching near-neutral contrast pairs, same as the base file — but did not click through each one live.

## Self-review findings

- No hardcoded colors (confirmed by grep).
- No modification to `weoc-ui-core.css`'s `@import` list or `docs-shell.js`'s `ensureGlobalAssets()` asset-loading list, per the plan's Task B step 5 — see barrel-wiring notes below.
- `heatmap.html` links `weoc-heatmap.css` and `wui-heatmap.js` directly in its own `<head>` (same defensive per-page pattern `charts.html` already uses for `wui-charts.js`) so the page is fully functional standalone before the controller wires the barrels.
- Did not touch any file belonging to Task A (table column-hide) or Task C (kanban) — confirmed by `git status` before commit (see below) and by the clean concurrent-edit merge on `docs-shell.js`'s `I18N_PAGES` line.

## Exact barrel-file lines for the controller

**1. `CSS/weoc-ui/weoc-ui-core.css`** — add after the existing `@import url("weoc-charts.css");` line (currently the last `@import`, line 62):

```css
@import url("weoc-heatmap.css");
```

Also bump the header comment's module list (currently ends at item 21 `weoc-charts`) with a new item 22 line, e.g.:
```
    22. weoc-heatmap    wui-heatmap risk-grid (rows x cols, CSS grid) for WUI.heatmap() — JS engine: JS/wui-heatmap.js
```

**2. `docs/docs-shell.js`** — `ensureGlobalAssets()`'s `jobs2` array, immediately after the existing `wui-charts.js` line (around line 490 as of this writing — re-check, since Tasks A/C may have shifted line numbers by the time this lands):

```js
if (!window.WUI || !window.WUI.heatmap) jobs2.push(loadScript(shared + 'JS/wui-heatmap.js'));
```

Insert it right after:
```js
if (!window.WUI || !window.WUI.chart) jobs2.push(loadScript(shared + 'JS/wui-charts.js'));
```

(This mirrors the exact pattern `wui-charts.js` uses for its own global load — confirmed by reading `ensureGlobalAssets()` in full: `wui-charts.js` is loaded both directly in `charts.html`'s/`kpi-recipes.html`'s own `<head>` AND globally here; `wui-heatmap.js` should get the same double coverage once wired.)

**3. `docs-shell.js`'s `NAV` array** — not mine to add per the plan (controller's job, step 4 of "Controller follow-up"), but for reference: a `Data Display` group already exists (containing `containers`, `interactive`, `indicators`, `tables`) — the plan explicitly suggests putting `heatmap` there "alongside Charts" (Charts is actually its own group, but `Data Display` is the closer semantic fit given `charts.html`'s existing "Charts" group is chart-specific). Suggested entry:
```js
{ key: 'heatmap', label: 'Heatmap', file: 'heatmap.html', kw: 'heatmap risk matrix grid cell severity tooltip' }
```

## Concerns

None blocking. One judgment call worth flagging explicitly: the `--color-surface-inverse`/`--color-text-inverse` tokens named in the spec's illustrative CSS do not exist in this codebase (confirmed by grep across all of `CSS/weoc-ui/`). I used the `--color-text-primary`/`--color-bg` swap instead (see Design Decisions §2) rather than either inventing new tokens or leaving a literal hex fallback — this was verified live in-browser across both `data-theme` states and reads correctly in both.

## Files changed

- `JS/wui-heatmap.js` (new)
- `CSS/weoc-ui/weoc-heatmap.css` (new)
- `docs/docs/heatmap.html` (new)
- `docs/i18n/heatmap.js` (new)
- `docs/docs-shell.js` (modified — one-line additive `I18N_PAGES` entry only)
