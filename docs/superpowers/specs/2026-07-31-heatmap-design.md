# weoc-ui: risk-grid heatmap (`WUI.heatmap`)

**Date:** 2026-07-31
**Status:** Approved, ready for implementation
**Scope:** `weoc-ui` component library only (`JS/wui-heatmap.js`, `CSS/weoc-ui/weoc-heatmap.css`, a new `docs/docs/heatmap.html` doc page). No board files are touched.

## Background

`weoc-ui` has no heatmap component of any kind — this is greenfield, unlike most recent library work this session (which ported real board markup). The closest precedent is the chart family (`WUI.chart`/`WUI.pie`/`WUI.donut`/`WUI.gauge` in `wui-charts.js`): same factory-function API shape, same theme-token-driven coloring, same `{ update, resize, destroy }` handle contract.

## Decision

`WUI.heatmap(el, opts)` — a configurable rows×cols grid, rendered as real DOM (CSS grid), each cell colored by interpolating across the library's existing semantic severity tokens (`--color-success` → `--color-warning` → `--color-danger`) rather than a new dedicated token family, so it stays automatically consistent across all 7 existing themes with zero new tokens to define or keep in sync.

`opts.type` defaults to `'matrix'` — the only mode implemented in v1. `'calendar'` and `'table'` are reserved, validated option values (documented, produce a console warning and no-op if passed, not a crash) so the public API doesn't need a breaking change when those variants get built later — this satisfies "other variants as a baseline extension point" without expanding v1's actual scope.

### Why not alternatives considered

- **Fixed 5×5 grid**: rejected — user explicitly chose configurable `rows`×`cols` over the classic-fixed-matrix convenience.
- **New dedicated risk-scale token family** (e.g. `--risk-1..5-color`): rejected — reusing existing severity tokens keeps the component automatically theme-consistent; a new token family would need defining and keeping in sync across all 7 themes for a benefit (more precise color control) not asked for.
- **Canvas rendering** (matching the chart family): rejected — this is discrete, individually-addressable cells needing real hover/focus state and accessible text content, which is what CSS grid + real DOM elements are for. Canvas fits the chart family's continuous/animated-line-drawing needs, a mismatch here.
- **Color only, no cell text**: rejected — user explicitly wants value/label text in each cell; color alone isn't precise enough for a risk-assessment tool (two adjacent risk levels can look nearly identical).

## Design

### API

```js
var handle = WUI.heatmap('#risk-grid', {
  type: 'matrix',        // default; 'calendar'/'table' reserved for future variants
  rows: 5,                // configurable, not fixed
  cols: 5,
  rowLabels: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'],
  colLabels: ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'],
  cells: [
    // one entry per (row, col), or a flat row-major array -- exact shape
    // finalized at implementation time following opts.data conventions
    // already established by WUI.chart/WUI.barRow in this same codebase
    { row: 0, col: 0, value: 0.1, label: 'Low', tooltip: 'Rare x Negligible: minimal impact' },
    { row: 4, col: 4, value: 0.95, label: 'Critical', tooltip: 'Almost Certain x Severe: immediate escalation' }
    // ...
  ]
});
// handle.update(newCells) / handle.resize() / handle.destroy()
```

`value` is a normalized 0-1 float; the component interpolates the cell's background color across success→warning→danger at draw time (same `_lightenColor`-style helper pattern `wui-charts.js` already uses for the neon-glow work — mix toward the next token by `value`'s position in the 0-1 range, not a literal 3-color lookup table, so intermediate values get smooth intermediate colors).

### Markup shape (rendered output)

```html
<div class="wui-heatmap" style="--wui-heatmap-cols: 5">
  <div class="wui-heatmap-corner"></div>
  <div class="wui-heatmap-col-label">Negligible</div>
  <!-- ...col labels... -->
  <div class="wui-heatmap-row-label">Rare</div>
  <div class="wui-heatmap-cell" style="--wui-heatmap-cell-color: #16a34a" data-tooltip="Rare x Negligible: minimal impact">Low</div>
  <!-- ...cells... -->
</div>
```

CSS grid with `grid-template-columns` driven by the `--wui-heatmap-cols` custom property (set inline by the JS factory, matching the existing `--wui-bento-row`-style convention already used elsewhere in the library for JS-driven grid sizing).

### Hover tooltip

No dedicated tooltip component exists in `weoc-ui` today (only a code comment suggesting native `title=""`, which renders the browser's own unstyled tooltip — not what "a nice hovering tooltip" asks for). Scoped, CSS-only implementation local to this component:

```css
.wui-heatmap-cell[data-tooltip] { position: relative; }
.wui-heatmap-cell[data-tooltip]:hover::after,
.wui-heatmap-cell[data-tooltip]:focus-visible::after {
  content: attr(data-tooltip);
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
  background: var(--color-surface-inverse, #1a1a1a); color: var(--color-text-inverse, #fff);
  padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);
  font-size: var(--text-xs); white-space: nowrap; pointer-events: none; z-index: 20;
}
```

(exact token names for the inverse-surface/text pair confirmed against `agency-theme.css` at implementation time — using its real dark-surface tokens, not inventing new ones, following the same "reuse existing tokens" principle as the color scale above). Cells get `tabindex="0"` so the tooltip is keyboard-focusable too, not hover-only.

### Barrel wiring

`WUI.heatmap = heatmap;` added to `wui-charts.js`'s existing export block (`wui-charts.js:1324-1327`, alongside `WUI.chart`/`WUI.donut`/`WUI.gauge`) if the implementation lives in that file, OR a new `JS/wui-heatmap.js` loaded the same way `wui-charts.js` is (checked against `docs-shell.js`'s `ensureGlobalAssets()` loading list) if kept as its own module — decided at implementation time based on whether the shared `_lightenColor`/token-reading helpers in `wui-charts.js` are private to that file's closure (in which case a new file would need its own copies or the helpers need exporting) or already reusable.

## Error handling

- `opts.type` outside `'matrix'`/`'calendar'`/`'table'`: `console.warn`, factory returns `null` (matching `WUI.chart`'s existing "no crash, returns null, logs a warning" convention for its own `window.uPlot` missing-dependency case).
- `opts.type` set to the reserved-but-unimplemented `'calendar'`/`'table'`: same `console.warn` + `null` return, not a silent no-op and not a crash.
- Missing/malformed `cells` data: render an empty grid with row/col labels only, no crash.

## Testing

Manual live-browser verification: build the `docs/docs/heatmap.html` demo with a real 5×5 risk-matrix example (reusing the same kind of realistic sample data convention established by `kpi-recipes.html`), confirm color interpolation looks correct across the full 0-1 range (spot-check low/mid/high values), confirm hover AND keyboard-focus both trigger the tooltip, confirm `handle.resize()`/`handle.destroy()` work, confirm a non-5×5 `rows`/`cols` config renders correctly (proving the "configurable, not fixed" requirement), confirm passing `type: 'calendar'` logs the expected warning and returns `null` without crashing the page.
