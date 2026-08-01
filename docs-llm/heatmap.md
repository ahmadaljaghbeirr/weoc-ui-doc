# Heatmap

[← Index](README.md)

Configurable rows × cols risk-grid, rendered as real DOM (CSS grid) so every cell is individually addressable with accessible text, hover, and keyboard focus. Cell color is interpolated across the library's existing severity tokens — no new token family, no canvas.

> **Real DOM, not canvas:** Unlike the chart family (`WUI.chart` / `WUI.pie` / `WUI.donut` / `WUI.gauge`), `WUI.heatmap()` renders plain `&lt;div&gt;` cells on a CSS grid. That is a deliberate choice: discrete, individually-addressable cells with real hover/focus state and screen-reader-visible text is what CSS grid is for, and the chart family's canvas approach fits continuous/animated line-drawing, not this.

## Overview

`wui-heatmap.js` follows the same factory-function shape as the chart family: call `WUI.heatmap(el, opts)`, get back a `{ update, resize, destroy }` handle. `rows` and `cols` are fully configurable — there is no fixed 5×5 assumption anywhere in the component.

Each cell's background color is interpolated across `--color-success` → `--color-warning` → `--color-danger` by that cell's `value` (a 0-1 float): the lower half of the range mixes success toward warning, the upper half mixes warning toward danger, so intermediate values get smooth intermediate colors rather than snapping between three fixed swatches. Because those three tokens are read live at every render (creation, update, and on every theme change), the grid re-colors correctly and automatically across every theme in the library — no board code required.

## WUI.heatmap(el, opts)

Create a heatmap grid inside a container element (the element itself becomes the `.wui-heatmap` grid root — matching `WUI.barRow()`'s "plain DOM, container is the render target" pattern rather than the canvas-based chart types). Returns an instance handle, or `null` if `opts.type` isn't implemented or the element cannot be resolved.

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element \| string` | — | Container element or CSS selector. This element itself becomes the rendered grid. |
| `opts.type` | `string` | `'matrix'` | The only mode implemented in v1. `'calendar'` and `'table'` are reserved, validated values for future variants — passing them logs a warning and returns `null` rather than crashing or silently doing nothing. |
| `opts.rows` | `number` | — | Grid row count. Fully configurable, not fixed to any particular size. |
| `opts.cols` | `number` | — | Grid column count. |
| `opts.rowLabels` | `Array<string>` | — | Optional. One label per row, rendered in a left-hand label column. Omit to render a plain grid with no row-label column at all. |
| `opts.colLabels` | `Array<string>` | — | Optional. One label per column, rendered in a header row. Omit to render a plain grid with no header row. |
| `opts.cells` | `Array<{row, col, value, label, tooltip}>` | `[]` | One entry per populated cell, each addressed by its own `row`/`col` — not required to be exhaustive or in any particular order. Any (row, col) missing from this array renders as an empty cell instead of crashing. `value` is a 0-1 float driving the color; `label` is the short text shown in the cell; `tooltip` is optional hover/focus text (a cell with no `tooltip` renders with no popup). |

**Return value — instance handle**

| Method | Description |
|---|---|
| `handle.update(newCells)` | Feed a new `cells` array. `rows`/`cols`/labels stay whatever they were set to at creation; re-renders in place. |
| `handle.resize()` | Re-renders from the current options and freshly-read tokens. The grid is fluid CSS (percentage columns), so there is no pixel-based canvas to resize — this exists for handle-shape parity with the rest of the library and as a hook after external layout changes. |
| `handle.destroy()` | Removes the rendered grid from the DOM and unregisters the instance from the theme listener. |

## Example — 5×5 Risk Matrix

Likelihood (rows) × Severity (cols), the standard risk-assessment axes. Hover or tab-focus a cell to see its full scenario. Click "Destroy" to confirm the grid tears down cleanly.

```html
<div class="demo-heatmap-wrap">
  <!-- Heatmap host -->
  <div id="demo-heatmap-risk"></div>
  <div class="demo-heatmap-actions">
    <button class="wui-btn secondary" type="button" id="demo-heatmap-destroy" data-wui-i18n="docs_heatmap_15">Destroy</button>
    <span class="demo-heatmap-status" id="demo-heatmap-destroy-status"></span>
  </div>
</div>
```

## Example — 3×4 Shift Coverage

Same component, a completely different shape and a different axis meaning entirely: shelters (rows) × four-hour shift blocks (cols), colored by staffing gap instead of risk. Proves `rows`/`cols` are genuinely configurable, not a disguised fixed 5×5.

```html
<div class="demo-heatmap-wrap">
  <!-- Heatmap host -->
  <div id="demo-heatmap-coverage"></div>
</div>
```

## Reserved Types & Error Handling

`opts.type` defaults to `'matrix'`, the only mode this version implements. `'calendar'` and `'table'` are already reserved, documented values for future variants: passing either one today does not crash and does not silently no-op — it logs a `console.warn` and returns `null`, the same contract `WUI.chart()` uses when `window.uPlot` is missing. Any other unrecognized string gets the same treatment.

```js
var handle = WUI.heatmap('#risk-grid', { type: 'calendar', rows: 3, cols: 3 });
// console: [wui-heatmap] WUI.heatmap(): type "calendar" is reserved for a
//          future release and not implemented in this version. No heatmap
//          was created. Use type: "matrix" (the default) for now.
// handle === null
```

> **Missing or malformed cells:** An omitted, empty, or partially-populated `opts.cells` array never crashes. Any (row, col) with no matching entry simply renders as an empty cell — row/col labels (if provided) still render normally.

## Theme Awareness

No board code is needed for theme support. Like the chart family, `wui-heatmap.js` subscribes to `wui:themechange` once at module load; every registered heatmap re-reads `--color-success` / `--color-warning` / `--color-danger` and re-renders inside one `requestAnimationFrame` whenever the theme switches. Try the theme switcher in the header while looking at the grids above.
