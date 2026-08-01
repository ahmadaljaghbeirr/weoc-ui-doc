# Charts

[← Index](README.md)

Token-driven time-series charts for wall displays and EOC dashboards. Adapter layer over `uPlot` — board code only ever sees `WUI.chart()`.

> **Engine-agnostic by design:** Board code never imports or references uPlot. `WUI.chart()` is the only surface. Swapping the rendering engine in the future = change `wui-charts.js` only. Zero board changes.

## Overview

`wui-charts.js` is an adapter layer. It wraps **uPlot** (a canvas-based, ~50 kb time-series library) behind the `WUI.chart()` API. Your boards never touch uPlot directly; they call `WUI.chart()` and get back a simple `{ update, resize, destroy }` handle.

All colors, fonts, and grid lines are read from CSS custom properties at creation time and on every theme change. A `wui:themechange` event (fired by `weoc-ui.js`) causes every registered chart to re-read tokens and recreate itself within one `requestAnimationFrame` — boards do not need any theme-aware code.

## Setup

Load uPlot (engine + CSS), then `wui-charts.js`. Order matters: the adapter expects `window.uPlot` to exist when it runs.

```html
<!-- 1. uPlot engine — must load before wui-charts.js -->
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.31/dist/uPlot.iife.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.31/dist/uPlot.min.css">

<!-- 2. WUI charts adapter -->
<script src="path/to/wui-charts.js"></script>

<!-- 3. weoc-ui.js (for theme switching and wui:themechange event) -->
<script src="path/to/weoc-ui.js"></script>
```

> **uPlot must load first:** If `window.uPlot` is undefined when `WUI.chart()` is called, it logs a warning and returns `null`. No crash, but no chart.

## WUI.chart(el, opts)

Create a chart inside a container element. Returns an instance handle, or `null` if uPlot is unavailable or the element cannot be resolved.

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element \| string` | — | Container element or CSS selector. The chart canvas is appended inside it. |
| `opts.type` | `string` | `'line'` | `'line'` \| `'area'` \| `'bar'` \| `'stepped'`. Bar uses `uPlot.paths.bars()` (bundled in the IIFE). Stepped uses `uPlot.paths.stepped()` — current value holds until next data point, ideal for discrete state changes. |
| `opts.series` | `Array` | `[]` | Array of `{ label, color }`. `color` is a semantic name (`'primary'`, `'danger'`, `'warning'`, `'success'`, `'secondary'`) or a literal CSS color string. Omitting `color` cycles the default palette. |
| `opts.data` | `Array` | `[[], []]` | Columnar array: `[[timestamps], [series1values], [series2values], …]`. Timestamps are Unix seconds (integers). |
| `opts.height` | `number` | `200` | Canvas height in px. |
| `opts.width` | `number` | `el.offsetWidth \|\| 400` | Canvas width in px. If omitted, the container's current `offsetWidth` is used. Call `handle.resize(w, h)` after layout changes. |
| `opts.cursor` | `boolean` | `true` | Show crosshair cursor on hover. |
| `opts.legend` | `boolean` | `false` | Show uPlot's built-in legend below the chart. Typically disabled on space-constrained wall displays; use a custom HTML legend instead. |

**Return value — instance handle**

| Method | Description |
|---|---|
| `handle.update(data)` | Feed new columnar data. Calls uPlot's `setData()` internally. Also updates the registry so re-theme recreations use the most recent data. |
| `handle.resize(w, h)` | Resize the canvas to `w` × `h` px. Calls `instance.setSize()`. |
| `handle.destroy()` | Destroy the uPlot instance, remove the registry entry, and remove the id stamp from the container. Does not remove the container element itself. |

**WUI.chart.readTokens()**

Returns the resolved CSS token map for the current theme. Useful for debugging or for applying chart colors to a custom HTML legend. Does not create a chart.

```js
var tokens = WUI.chart.readTokens();
console.log(tokens.primary);   // e.g. '#185fa5' in light mode, '#3a80e0' in dark
console.log(tokens.border);    // e.g. '#ebebeb'
```

## Example — Line Chart

Two series tracking resource availability and deployment over a 24-hour incident window. Click "Update data" to simulate a live feed pushing new values.

```html
<div class="demo-chart-wrap">
  <!-- Line chart host -->
  <div id="demo-line-chart"></div>
  <!-- Live-update trigger -->
  <button class="wui-btn primary demo-update-btn" id="demo-line-update">Update data</button>
</div>
```

```js
// Seed data: Unix timestamps (seconds) + two value arrays
var now = Math.floor(Date.now() / 1000);
var times = [], available = [], deployed = [];
for (var i = 0; i < 24; i++) {
  times.push(now - (23 - i) * 3600);
  available.push(Math.round(60 + Math.random() * 30));
  deployed.push(Math.round(40 + Math.random() * 40));
}

var lineChart = WUI.chart('#demo-line-chart', {
  type:   'line',
  height: 220,
  cursor: true,
  legend: true,
  series: [
    { label: 'Resources Available', color: 'primary' },
    { label: 'Resources Deployed',  color: 'warning' }
  ],
  data: [times, available, deployed]
});

// Simulate a live update — feed fresh values on click
document.getElementById('demo-line-update').addEventListener('click', function () {
  var newA = [], newB = [];
  for (var j = 0; j < 24; j++) {
    newA.push(Math.round(50 + Math.random() * 40));
    newB.push(Math.round(30 + Math.random() * 50));
  }
  lineChart.update([times, newA, newB]);
});
```

## Example — Area Chart

Same data contract as line; set `type: 'area'`. The fill is a semi-transparent version of each series stroke color, derived automatically.

```html
<div class="demo-chart-wrap">
  <!-- Area chart host -->
  <div id="demo-area-chart"></div>
</div>
```

```js
WUI.chart('#demo-area-chart', {
  type:   'area',
  height: 220,
  cursor: true,
  legend: true,
  series: [
    { label: 'Incident Reports', color: 'danger' },
    { label: 'Resolved',         color: 'success' }
  ],
  data: [timestamps, incidentReports, resolved]
});
```

## Example — Bar Chart

Set `type: 'bar'`. Uses `uPlot.paths.bars()`, which ships in the uPlot IIFE bundle — no extra file needed. Multi-series bars share the same x-slot and render semi-transparent so both are visible.

```html
<div class="demo-chart-wrap">
  <!-- Bar chart host -->
  <div id="demo-bar-chart"></div>
</div>
```

```js
WUI.chart('#demo-bar-chart', {
  type:   'bar',
  height: 220,
  cursor: true,
  legend: true,
  series: [
    { label: 'Incidents Opened', color: 'danger' },
    { label: 'Incidents Closed', color: 'success' }
  ],
  data: [timestamps, opened, closed]
});
```

> **Multi-series overlap:** All series render at the same x-position (60% slot width, centered). The adapter applies semi-transparency when more than one series is present so relative magnitudes read clearly. For true side-by-side grouped bars, set different `align` and `size` values per series via a custom `paths` entry directly on the uPlot config — that is beyond the adapter's scope.

## Example — Stepped Chart

Set `type: 'stepped'`. The current value holds as a flat horizontal segment until the next data point — ideal for discrete state changes: activation tiers, resource status, alert levels. Uses `uPlot.paths.stepped({ align: 1 })`.

```html
<div class="demo-chart-wrap">
  <!-- Stepped chart host -->
  <div id="demo-stepped-chart"></div>
</div>
```

```js
WUI.chart('#demo-stepped-chart', {
  type:   'stepped',
  height: 180,
  cursor: true,
  legend: false,
  series: [
    { label: 'Activation Level', color: 'warning' }
  ],
  data: [timestamps, activationLevels]
});
```

The `align: 1` stepping means the value at timestamp *T* applies from *T* rightward until the next data point — matching how activation levels work in practice (the tier holds until officially changed).

## WUI.pie(el, opts) & WUI.donut(el, opts)

Raw-canvas pie and donut charts. **No uPlot dependency** — uses the browser's Canvas 2D API directly. Token-driven and theme-aware like `WUI.chart()`: both re-draw automatically on `wui:themechange` without destroying the canvas element.

**Data contract** — an array of slice objects (not columnar):

```js
var data = [
  { label: 'Active',    value: 42, color: 'danger' },
  { label: 'Standby',   value: 28, color: 'warning' },
  { label: 'Released',  value: 30, color: 'success' }
];
```

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element \| string` | — | Container element or CSS selector. A `<canvas>` is appended inside it. |
| `opts.data` | `Array` | `[]` | Array of `{ label, value, color }`. `color` is a semantic name or literal CSS color. Omitting `color` cycles the default palette. |
| `opts.height` | `number` | `240` | Canvas height in px. Width fills the container. |
| `opts.legend` | `boolean` | `true` | Render an HTML legend below the canvas showing slice labels and percentages. |
| `opts.cutout` | `number` | `0.62` (donut only) | Inner radius as a fraction of outer radius. `0` = full pie, `0.62` = typical donut. Only meaningful on `WUI.donut()` — pie always uses 0. |
| `opts.center` | `object` | — | `{ label, sub }` — text overlaid in the donut hole. `label` is large bold; `sub` is smaller muted. Donut only. |

**Return value**

| Method | Description |
|---|---|
| `handle.update(data)` | Feed a new slice array. Redraws the canvas and re-renders the legend in place. |
| `handle.destroy()` | Remove the canvas and legend from the DOM, unregister from theme listener. |

## Example — Pie Chart

Resource distribution snapshot — static categories, not time-series. The legend is rendered as HTML below the canvas and re-generates on theme switch.

```html
<div class="demo-chart-wrap">
  <!-- Pie chart host -->
  <div id="demo-pie-chart"></div>
</div>
```

```js
WUI.pie('#demo-pie-chart', {
  height: 240,
  data: [
    { label: 'Active',    value: 42, color: 'danger' },
    { label: 'Standby',   value: 28, color: 'warning' },
    { label: 'Released',  value: 30, color: 'success' }
  ]
});
```

## Example — Donut Chart

Same data contract as pie. Set `opts.center` to overlay a summary value in the hole — useful for total resource counts or overall completion percentage on a dashboard widget.

```html
<div class="demo-chart-wrap">
  <!-- Donut chart host -->
  <div id="demo-donut-chart"></div>
</div>
```

```js
WUI.donut('#demo-donut-chart', {
  height: 240,
  data: [
    { label: 'Personnel',  value: 65, color: 'primary' },
    { label: 'Equipment',  value: 48, color: 'warning' },
    { label: 'Facilities', value: 22, color: 'success' }
  ],
  center: { label: '135', sub: 'Resources' }
});
```

> **No uPlot required:** `WUI.pie()` and `WUI.donut()` create a `<canvas>` element and draw directly using the Canvas 2D API. They share the same theme registry as `WUI.chart()`, so a single `wui:themechange` event re-renders all chart types simultaneously.

## Example — With observeSection

In a WebEOC board, a chart inside a section that auto-refreshes should update its data each time the section DOM is replaced. Wire `WUI.observeSection` against the `updatesection` wrapper; inside the callback, read your `<value-of>` outputs from the new DOM and call `handle.update()`.

```js
// Create the chart once on page load
var resourceChart = WUI.chart('#resource-chart', {
  type:   'line',
  height: 200,
  series: [
    { label: 'Available Units', color: 'primary' },
    { label: 'Deployed Units',  color: 'warning' }
  ],
  data: buildChartData()   // reads current DOM state immediately
});

// Re-feed data whenever WebEOC refreshes the section
WUI.observeSection('#data-section', function () {
  // buildChartData() reads <value-of> outputs or data-ts/data-value attributes
  // from the newly replaced DOM — see "Data Contract" below
  resourceChart.update(buildChartData());
});
```

The callback is idempotent by design: calling `handle.update()` with the same data has no visible effect, so double-fires from the MutationObserver are harmless.

## Theme Switching

No board code is needed for theme support. Charts re-theme automatically.

What happens internally when `WUI.toggleTheme()` is called:

1. `weoc-ui.js` updates `data-theme` on `<html>` and fires `wui:themechange` on `document.documentElement`.
2. `wui-charts.js` receives the event (subscribed once at module load) and schedules a `requestAnimationFrame`.
3. Inside the rAF callback, all registered chart instances are destroyed and recreated with re-read CSS tokens and their most-recent data.
4. One repaint. No flash. Board code does nothing.

```js
// Board code does NOT need this — it is handled by wui-charts.js automatically.
// Shown here for understanding only:
document.documentElement.addEventListener('wui:themechange', function (e) {
  console.log('Theme is now', e.detail.dark ? 'dark' : 'light');
  // wui-charts.js already re-themed all charts in one rAF by this point
});
```

> **Why destroy and recreate?** uPlot does not support live configuration changes (stroke colors, grid colors, fonts) after construction. The adapter destroys each instance and creates a new one with updated tokens and the same data. This is transparent to board code — the handle's `update()` and `resize()` methods continue to work on the new instance.

## Data Contract

`WUI.chart()` uses uPlot's native columnar format: a single array whose first element is the timestamps array, followed by one value array per series. All arrays must be the same length.

```js
// WUI data format — columnar array
//   data[0]  = timestamps (Unix seconds, ascending, integers)
//   data[1]  = values for series 0
//   data[2]  = values for series 1
//   …

var data = [
  [1700000000, 1700003600, 1700007200, 1700010800],  // timestamps
  [85,         90,         78,          92],           // Personnel %
  [60,         65,         70,          68]            // Equipment %
];

WUI.chart('#my-chart', { series: [...], data: data });
```

**WebEOC DOM adapter pattern**

WebEOC boards surface data through `<value-of>` outputs or repeat regions. A typical adapter reads DOM nodes and builds the columnar array:

```js
// Board-specific adapter — reads data stamped onto DOM nodes by XSL
// Each row rendered by WebEOC: <span data-ts="1700000000" data-value="85"></span>
function buildChartData() {
  var timestamps = [];
  var values     = [];

  document.querySelectorAll('[data-ts]').forEach(function (el) {
    timestamps.push(parseInt(el.dataset.ts, 10));
    values.push(parseFloat(el.dataset.value));
  });

  return [timestamps, values];
}

myChart.update(buildChartData());

// Multi-series variant:
function buildMultiSeriesData() {
  var timestamps = [];
  var series1    = [];
  var series2    = [];

  document.querySelectorAll('[data-chart-row]').forEach(function (el) {
    timestamps.push(parseInt(el.dataset.ts, 10));
    series1.push(parseFloat(el.dataset.personnel));
    series2.push(parseFloat(el.dataset.equipment));
  });

  return [timestamps, series1, series2];
}
```

## Series Colors

Set `series[n].color` to a semantic name or a literal CSS color string.

| Semantic name | CSS token | Light value | Dark value |
|---|---|---|---|
| `'primary'` | `--color-10` | `#185fa5` | `#3a80e0` |
| `'danger'` | `--color-danger` | `#dc2626` | `#e83040` |
| `'warning'` | `--color-warning` | `#ea7c14` | `#f07030` |
| `'success'` | `--color-success` | `#16a34a` | `#28d980` |
| `'secondary'` | `--color-secondary` | `#64748b` | `#94a3b8` |

**Tier colors** — for additional series beyond the 5-name palette, the default cycle continues through the tier scale:

| CSS token | Light value | Use case |
|---|---|---|
| `--tier-1-color` | `#6ab143` | Tier 1 events / lowest severity |
| `--tier-2-color` | `#db9739` | Tier 2 events |
| `--tier-3-color` | `#f95639` | Tier 3 events |
| `--tier-4-color` | `#cf1717` | Tier 4 events / highest severity |

**Literal color override** — pass any CSS color string when the semantic palette does not fit:

```js
WUI.chart('#signal-chart', {
  series: [
    { label: 'Channel A', color: '#8b5cf6' },        // literal hex
    { label: 'Channel B', color: 'rgb(14,165,233)' } // literal rgb
  ],
  data: data
});
```

## Resize

`handle.resize(w, h)` calls uPlot's `setSize()`. Use it after any layout change that alters the container's dimensions.

Common trigger: a split-panel opening or closing. Wire `wui:panelopen` / `wui:panelclose` on the split element:

```js
var split = document.getElementById('main-split');
var chart = WUI.chart('#my-chart', { ... });

split.addEventListener('wui:panelopen', function () {
  // Panel opened — the main area shrank; let the chart know
  var wrap = document.getElementById('chart-container');
  chart.resize(wrap.offsetWidth, 220);
});

split.addEventListener('wui:panelclose', function () {
  var wrap = document.getElementById('chart-container');
  chart.resize(wrap.offsetWidth, 220);
});

// Also debounce on window resize for responsive layouts
window.addEventListener('resize', WUI.debounce(function () {
  var wrap = document.getElementById('chart-container');
  chart.resize(wrap.offsetWidth, 220);
}, 200));
```

## WUI.gauge(el, opts)

Semi-circle threshold gauge. Raw Canvas 2D, no dependency. Theme-aware and resize-aware like every other chart type — auto-redraws on `wui:themechange` and on container resize.

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element \| string` | — | Container element or CSS selector. |
| `opts.value` | `number` | 0 | 0-100, clamped. |
| `opts.zones` | `Array<{to, color}>` | `<40 danger, <70 warning, else success` | Threshold color bands. |
| `opts.status` | `string` | — | Pre-localized status text — the engine never calls `WUI.i18n` itself, same convention as `WUI.donut`'s `center` option. |
| `opts.height` | `number` | 140 | Pixels. |

**Return value**

| Method | Description |
|---|---|
| `handle.update(opts)` | Feed new value/zones/status. Redraws in place. |
| `handle.destroy()` | Remove the canvas, disconnect the resize observer, unregister from theme listener. |

## Example — Gauge

```html
<div id="demo-gauge-chart"></div>
```

```js
WUI.gauge('#demo-gauge-chart', {
  value: 62,
  status: 'Elevated'
});
```

## WUI.barRow(el, opts)

Segmented horizontal bar rows. Pure CSS/DOM — no canvas, no resize wiring needed; it already reflows for free with its container, including a built-in density reduction inside narrow `wui-tile` containers.

**Data contract**

```js
var rows = [
  { label: 'Row 1', value: 70, segments: [{ pct: 70, color: 'success' }] },
  { label: 'Row 2', value: 40, segments: [{ pct: 40, color: 'warning' }] }
];
```

| Method | Description |
|---|---|
| `handle.update(rows)` | Feed a new rows array. Re-renders in place. |
| `handle.destroy()` | Clear the container's contents. |

## Example — Bar Row

```html
<div id="demo-barrow-chart"></div>
```

```js
WUI.barRow('#demo-barrow-chart', {
  rows: [
    { label: 'Row 1', value: 70, segments: [{ pct: 70, color: 'success' }] },
    { label: 'Row 2', value: 40, segments: [{ pct: 40, color: 'warning' }] }
  ]
});
```

## destroy()

Call `handle.destroy()` when the chart's container is removed from the DOM. This prevents the module-level theme listener from iterating over stale instances.

On WebEOC boards the most common teardown moment is when a view panel is hidden or a split panel closes and the chart container is replaced by an `updatesection` refresh. Destroy before the refresh, recreate in the observer callback:

```js
var statusChart = null;

function initChart() {
  // Re-read container width in case layout changed
  var container = document.getElementById('status-chart');
  if (statusChart) { statusChart.destroy(); }

  statusChart = WUI.chart(container, {
    type:   'area',
    height: 180,
    series: [{ label: 'Active', color: 'danger' }],
    data:   buildChartData()
  });
}

// Wire observer — idempotent because we destroy before recreating
WUI.observeSection('#status-section', function () {
  initChart();
});

// Initial render
WUI.ready(initChart);
```

> **Theme listener stays alive after destroy:** `handle.destroy()` removes the chart from the registry and tears down its uPlot instance, but the module-level `wui:themechange` listener on `document.documentElement` is never removed (other charts may still be registered). This is intentional — the listener is lightweight and no-ops when the registry is empty.
