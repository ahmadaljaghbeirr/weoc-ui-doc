# Charts

[← Index](README.md)

Token-driven time-series charts for wall displays and EOC dashboards. Adapter layer over `uPlot` — board code only ever sees `WUI.chart()`.

> **Engine-agnostic by design:** Board code never imports or references uPlot. `WUI.chart()` is the only surface. Swapping the rendering engine in the future = change `wui-charts.js` only. Zero board changes.

## Overview

`wui-charts.js` is an adapter layer. It wraps **uPlot** (a canvas-based, ~50 kb time-series library) behind the `WUI.chart()` API. Your boards never touch uPlot directly; they call `WUI.chart()` and get back a simple `{ update, resize, destroy }` handle.

All colors, fonts, and grid lines are read from CSS custom properties at creation time and on every theme change. A `wui:themechange` event (fired by `weoc-ui.js`) causes every registered chart to re-read tokens and recreate itself within one `requestAnimationFrame` — boards do not need any theme-aware code.

## Setup

Load uPlot (engine + CSS), then `wui-charts.js`. Order matters: the adapter expects `window.uPlot` to exist when it runs.

```js
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

## Example — Area Chart

Same data contract as line; set `type: 'area'`. The fill is a semi-transparent version of each series stroke color, derived automatically.

```html
<div class="demo-chart-wrap">
  <!-- Area chart host -->
  <div id="demo-area-chart"></div>
</div>
```

## Example — Bar Chart

Set `type: 'bar'`. Uses `uPlot.paths.bars()`, which ships in the uPlot IIFE bundle — no extra file needed. Multi-series bars share the same x-slot and render semi-transparent so both are visible.

```html
<div class="demo-chart-wrap">
  <!-- Bar chart host -->
  <div id="demo-bar-chart"></div>
</div>
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

## Example — Donut Chart

Same data contract as pie. Set `opts.center` to overlay a summary value in the hole — useful for total resource counts or overall completion percentage on a dashboard widget.

```html
<div class="demo-chart-wrap">
  <!-- Donut chart host -->
  <div id="demo-donut-chart"></div>
</div>
```

> **No uPlot required:** `WUI.pie()` and `WUI.donut()` create a `&lt;canvas&gt;` element and draw directly using the Canvas 2D API. They share the same theme registry as `WUI.chart()`, so a single `wui:themechange` event re-renders all chart types simultaneously.

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

```js
// Board code does NOT need this — it is handled by wui-charts.js automatically.
// Shown here for understanding only:
document.documentElement.addEventListener('wui:themechange', function (e) {
  console.log('Theme is now', e.detail.dark ? 'dark' : 'light');
  // wui-charts.js already re-themed all charts in one rAF by this point
});
```

> **Why destroy and recreate?:** uPlot does not support live configuration changes (stroke colors, grid colors, fonts) after construction. The adapter destroys each instance and creates a new one with updated tokens and the same data. This is transparent to board code — the handle's `update()` and `resize()` methods continue to work on the new instance.

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

## Neon Glow

Every chart type in this adapter supports an opt-in `opts.neon` glow, matching the `.neon-outline` convention already used on buttons and fabs (see `weoc-interactive.css`). It is off by default — no chart's appearance changes unless a caller explicitly asks for it.

**opts.neon**

| Value | Effect |
|---|---|
| `false` / omitted | No glow (default). |
| `true` | Glow using the `'primary'` severity (`--color-10-glow`). |
| `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | Glow tinted with that severity's `--color-{name}-glow` token — the same six severities the `.neon-outline` button/fab variants use. |

**WUI.chart()** applies a `filter: drop-shadow(...)` rule to the host container's uPlot canvas — uPlot renders its own internal canvas, so the adapter cannot reach into individual stroke calls and instead toggles the glow from the outside.

**WUI.pie() / WUI.donut() / WUI.gauge()** draw straight to Canvas 2D, so the glow is a real `ctx.shadowBlur` / `ctx.shadowColor` set immediately before each colored fill or stroke and reset right after — the same pattern already used by the KPI sparkline recipe's `drawSparkline()`.

**WUI.barRow()** renders plain DOM, not canvas — like `WUI.chart()`, it applies a `filter: drop-shadow(...)` rule to the host container, scoped in CSS to every `.fill` segment span so the row's label and value text stay unaffected.

```html
<div class="demo-chart-wrap">
  <!-- Neon line chart host -->
  <div id="demo-neon-line-chart"></div>
</div>
```

```html
<div class="demo-chart-wrap">
  <!-- Neon pie chart host -->
  <div id="demo-neon-pie-chart"></div>
</div>
```

```html
<div class="demo-chart-wrap">
  <!-- Neon donut chart host -->
  <div id="demo-neon-donut-chart"></div>
</div>
```

```html
<div class="demo-chart-wrap">
  <!-- Neon gauge host -->
  <div id="demo-neon-gauge-chart"></div>
</div>
```

```html
<div class="demo-chart-wrap">
  <!-- Neon bar-row host -->
  <div id="demo-neon-barrow-chart"></div>
</div>
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
<div class="demo-chart-wrap">
  <div id="demo-gauge-chart"></div>
</div>
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
<div class="demo-chart-wrap">
  <div id="demo-barrow-chart"></div>
</div>
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

> **How to read a recipe:** Every recipe below has two parts. First, a **live example** with real sample data — proof it works, and something to visually compare your own result against. Second, a **copy-paste template** right underneath it, using `{{name}}` placeholders for every spot that should change per KPI. Everything outside `{{...}}` in the template is real, working code — copy it verbatim and only fill in the placeholders.

## Dashboard Overview

Tile-for-tile layout of the real Operation Home Page board (`HomePage/out/board.web`), same `wui-w-{cols}x{rows}` spans. Click any solid tile to jump to its recipe below. Dashed tiles (Map, Live Activity Feed, Tasks Overview) are board-specific layout, not weoc-ui component recipes — not covered on this page.

## 1. The Tile Shell (wui-tile)

Every recipe below drops into the `.wui-tile-body` of this shell. Header and footer are both optional — omit either div for a body-only tile. See [Conventions](conventions.md) for the `.flush` border toggle and `.is-scrollable`.

```html
<div class="wui-bento-tile wui-w-1x1" style="height:200px">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title"><span class="material-symbols-outlined">speed</span>Overall Readiness</h3>
      </div>
    </div>
    <div class="wui-tile-body">
      <div class="wui-content-wrap">KPI content goes here</div>
    </div>
    <div class="wui-tile-footer justify-end">
      <button class="wui-btn ghost primary wui-btn-sm">View details</button>
    </div>
  </div>
</div>
```

**Copy-paste template:**

```js
<div class="wui-bento-tile {{grid-span, e.g. wui-w-1x1}}">
  <div class="wui-tile">
    <!-- omit this whole hdr div for a body-only tile -->
    <div class="wui-tile-hdr{{ ' flush' to drop the divider}}">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">
          <span class="material-symbols-outlined">{{icon name}}</span>{{Tile Title}}
        </h3>
      </div>
    </div>

    <div class="wui-tile-body">
      <!-- one KPI recipe from sections 2-7 goes here -->
    </div>

    <!-- omit this whole footer div if there's no action/caption -->
    <div class="wui-tile-footer{{ ' flush' to drop the divider}}{{ ' justify-end' / ' justify-between' to align actions}}">
      {{footer content — a button, a caption span, or both}}
    </div>
  </div>
</div>
```

## 2. KPI Number

Pure CSS/DOM — no JS. Use for any single count or metric. Color the value with a status token when the number itself is good/bad/neutral news.

```html
<div class="wui-content-wrap">
  <div class="wui-text-xs wui-text-secondary">Active Events</div>
  <div class="dash-kpi-value danger">4</div>
</div>
```

**Copy-paste template** (add the `.dash-kpi-value` rule from the CSS snippet below once per project — it isn't shipped in the core barrel, it's a 5-line convention, not a component):

```js
<div class="wui-content-wrap">
  <div class="wui-text-xs wui-text-secondary">{{Label}}</div>
  <div class="dash-kpi-value{{ ' danger' / ' warning' / ' success' or omit for neutral}}">{{123}}</div>
</div>
```

```js
.dash-kpi-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  color: var(--color-text-primary);
  line-height: 1.1;
}
.dash-kpi-value.danger  { color: var(--color-danger); }
.dash-kpi-value.warning { color: var(--color-warning); }
.dash-kpi-value.success { color: var(--color-success); }
```

**With icon, trend arrow & sparkline** (real board recipe — a richer variant for when the KPI needs a 7-day trend, not just a bare number):

**Real card, from the Operation Home Page board (`HomePage/out/board.web`), CSS from `HomePage/CSS/kpi-card.css`.** Recreated 1:1 in `weoc-ui-doc/tests/responsive/kpi-sparkline-tile.html` as a standalone, verified-in-browser recipe. All 5 KPI cards on the real board (Total/Active/Closed Events, Avg. Resolution/Response Time) share this exact shape.

```js
<div class="wui-bento-tile wui-w-2x2">
  <div class="kpi-card">
    <div class="kpi-header">
      <div class="kpi-icon"><span class="material-symbols-outlined">event</span></div>
      <div class="kpi-title">TOTAL EVENTS</div>
    </div>
    <div class="kpi-body wui-h-full wui-w-full">
      <div class="kpi-main">
        <div class="kpi-value"><value-of select="//@total_events_expr" /></div>
        <div class="kpi-trend">
          <span class="material-symbols-outlined kpi-arrow">arrow_upward</span>
          <span class="kpi-percent"><value-of select="//@events_trend_percentage_expr" />%</span>
          <span class="kpi-text">vs last 7 days</span>
        </div>
      </div>
      <div class="kpi-chart">
        <span id="eventsTrendStatus" style="display: none"><value-of select="//@events_trend_status_expr" /></span>
        <span id="sparkTotalData" style="display: none"><value-of select="//@events_daily_last_7_days_expr" /></span>
        <canvas class="sparkline" id="sparkTotal"></canvas>
      </div>
    </div>
  </div>
</div>
```

```js
<externalexpression name="total_events_expr" board="Event Reporting V2.0" table="Event Reports Table" filter="isDeleted != 1">
  count(*)
</externalexpression>
<externalexpression name="events_trend_status_expr" board="Event Reporting V2.0" table="Event Reports Table">
  -- "Up" or "Down" vs the prior 7-day window
</externalexpression>
<externalexpression name="events_trend_percentage_expr" board="Event Reporting V2.0" table="Event Reports Table">
  -- percentage change vs the prior 7-day window
</externalexpression>
<externalexpression name="events_daily_last_7_days_expr" board="Event Reporting V2.0" table="Event Reports Table">
  -- '[' + one CAST(COUNT(...) AS varchar) term per day, same DATEADD/CASE shape as
  -- event_timeline_values_expr in section 6 + ']'
</externalexpression>
```

```js
// kpi-sparklines.js — canvas-only, no chart-engine dependency. Shared by all 5 KPI cards.
function drawSparkline(selector, data, color) {
  var canvas = document.querySelector(selector);
  if (!canvas || !data || !data.length) { return; }

  var ctx = canvas.getContext("2d");
  var width = canvas.offsetWidth;
  var height = canvas.offsetHeight;
  var ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  var padding = 4;
  var max = Math.max(...data);
  var min = Math.min(...data);
  var range = max - min || 1;
  var stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  var points = data.map(function (value, index) {
    var x = padding + index * stepX;
    var y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  // ...smooth quadraticCurveTo path + gradient fill + stroke, see kpi-sparkline-tile.html for the full function...
}

function getSparklineData(elementId) {
  var dataText = $("#" + elementId).text().trim();
  try { return JSON.parse(dataText); } catch (e) { return [0, 0, 0, 0, 0, 0, 0]; }
}

function getTrendColor(statusElementId) {
  var status = $("#" + statusElementId).text().trim();
  return status === "Down" ? "danger" : "success";
}

$(document).ready(function () {
  var sparkTotalData = getSparklineData("sparkTotalData");
  var sparkTotalColor = getTrendColor("eventsTrendStatus");
  drawSparkline("#sparkTotal", sparkTotalData, sparkTotalColor);
});
```

## 3. Gauge

Semi-circle threshold gauge. Auto-resizes and redraws crisply on any container change (bento tile resize, sidebar collapse, theme toggle) — no board-side wiring needed.

**Real card, from the Operation Home Page board (`HomePage/out/board.web`).** Recreated 1:1 in `weoc-ui-doc/tests/responsive/event-closure-gauge-tile.html` as a standalone, verified-in-browser recipe.

Markup drops into the `.wui-tile-body` from section 1 (no legend dock needed, `WUI.gauge` draws its own status chip). The WebEOC expression is the hidden-span wiring the draw function reads from. Both are real, from `board.web`:

```js
<div class="wui-bento-tile wui-w-2x5">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">Event Closure Performance</h3>
        <div class="wui-tile-sub">Percentage of events closed out of total reported events in the last 7 days</div>
      </div>
      <div class="wui-tile-icon blue"><span class="material-symbols-outlined">speed</span></div>
    </div>

    <div class="wui-tile-body wui-flex wui-flex-col wui-items-center wui-gap-2">
      <div id="eventClosureGauge"></div>
    </div>
  </div>
</div>
```

```js
<span id="eventClosureRateValue" style="display: none">
  <value-of select="//@event_closure_rate_expr" />
</span>
```

```js
var eventClosureGaugeHandle = null;

function drawEventClosureGauge() {
  var host = document.getElementById("eventClosureGauge");
  if (!host) { return; }

  var percentage = parseInt($("#eventClosureRateValue").text().trim(), 10) || 0;
  percentage = Math.max(0, Math.min(percentage, 100));

  var status = wuiT("GoodClosure", "Good closure");
  if (percentage < 40) {
    status = wuiT("NeedsAttention", "Needs attention");
  } else if (percentage < 70) {
    status = wuiT("InProgress", "In Progress");
  }

  var gaugeOpts = { value: percentage, status: status, height: 128 };

  if (eventClosureGaugeHandle) {
    eventClosureGaugeHandle.update(gaugeOpts);
  } else if (window.WUI && WUI.gauge) {
    eventClosureGaugeHandle = WUI.gauge(host, gaugeOpts);
  }
}
```

## 4. Donut / Pie (category split)

Raw Canvas 2D, no dependency. Use for a categorical breakdown (events by classification, resources by type). `WUI.pie()` is the same call with `cutout` omitted.

**Real card, from the Operation Home Page board (`HomePage/out/board.web`).** Recreated 1:1 in `weoc-ui-doc/tests/responsive/classification-donut-tile.html` as a standalone, verified-in-browser recipe.

The `.wui-tile-legend` dock catches `WUI.donut`'s own auto-generated legend, relocated there once after creation. All six category counts come from their own `externalexpression`, shown in full below:

```js
<div class="wui-bento-tile wui-w-2x5">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">Events by Classification</h3>
        <div class="wui-tile-sub">Distribution of reported events</div>
      </div>
      <div class="wui-tile-icon blue"><span class="material-symbols-outlined">donut_large</span></div>
    </div>

    <div class="wui-tile-body wui-flex wui-flex-col wui-items-center wui-gap-2">
      <div id="classificationDonut"></div>
      <div class="wui-tile-legend" id="classificationLegendDock"></div>
    </div>
  </div>
</div>
```

```js
<externalexpression name="classification_hse_expr" board="Event Reporting V2.0"
  table="Event Reports Table" filter="isDeleted != 1 AND Classification = 'HSE'">
  count(*)
</externalexpression>
<externalexpression name="classification_fire_safety_expr" board="Event Reporting V2.0"
  table="Event Reports Table" filter="isDeleted != 1 AND Classification = 'Fire and Safety'">
  count(*)
</externalexpression>
<externalexpression name="classification_environmental_expr" board="Event Reporting V2.0"
  table="Event Reports Table" filter="isDeleted != 1 AND Classification = 'Environmental'">
  count(*)
</externalexpression>
<externalexpression name="classification_compliance_expr" board="Event Reporting V2.0"
  table="Event Reports Table" filter="isDeleted != 1 AND Classification = 'Compliance'">
  count(*)
</externalexpression>
<externalexpression name="classification_security_expr" board="Event Reporting V2.0"
  table="Event Reports Table" filter="isDeleted != 1 AND Classification = 'Security'">
  count(*)
</externalexpression>
<externalexpression name="classification_operations_expr" board="Event Reporting V2.0"
  table="Event Reports Table" filter="isDeleted != 1 AND Classification = 'Operations'">
  count(*)
</externalexpression>
```

```js
var classificationDonutHandle = null;

function getClassificationNumberValue(elementId) {
  var value = $("#" + elementId).text().trim();
  return parseInt(value, 10) || 0;
}

function getClassificationData() {
  return [
    { label: "HSE", value: getClassificationNumberValue("classificationHSE"), color: "#185fa5" },
    { label: "Fire and Safety", value: getClassificationNumberValue("classificationFireSafety"), color: "#dc2626" },
    { label: "Environmental", value: getClassificationNumberValue("classificationEnvironmental"), color: "#16a34a" },
    { label: "Compliance", value: getClassificationNumberValue("classificationCompliance"), color: "#6d5bd0" },
    { label: "Security", value: getClassificationNumberValue("classificationSecurity"), color: "#0284c7" },
    { label: "Operations", value: getClassificationNumberValue("classificationOperations"), color: "#ea7c14" }
  ];
}

function drawClassificationDonut() {
  var host = document.getElementById("classificationDonut");
  if (!host) { return; }

  var data = getClassificationData();
  var total = data.reduce(function (sum, item) { return sum + item.value; }, 0);
  var donutOpts = { height: 124, legend: false, center: { label: String(total), sub: "Events" }, data: data };

  if (classificationDonutHandle) {
    classificationDonutHandle.update(donutOpts.data);
  } else if (window.WUI && WUI.donut) {
    classificationDonutHandle = WUI.donut(host, donutOpts);
  }
}
```

## 5. Bar-Row (stacked/segmented progress)

Pure CSS/DOM, no canvas — already reflows for free with its container, including a built-in density reduction inside narrow bento tiles. Use for available/assigned/unavailable-style stacked breakdowns, one row per group.

```html
<div id="demo-kpi-barrow"></div>
```

**Copy-paste template:**

```js
<div id="{{unique-element-id}}"></div>

<script>
WUI.barRow('#{{unique-element-id}}', {
  rows: [
    { label: '{{Row label}}', value: 100, segments: [
      { pct: {{0-100}}, color: '{{success/warning/danger/primary/secondary}}' }
      {{ … one entry per segment, percentages should sum to <= 100 }}
    ]}
    {{ … one row object per group }}
  ]
});
</script>
```

**Two real board recipes** use this exact component — a static ranked list and an expression-driven segmented breakdown:

**Real card, from the Operation Home Page board.** Recreated 1:1 in `weoc-ui-doc/tests/responsive/events-location-tile.html`. Note this one is **not** expression-driven — the real board hardcodes this list.

```js
<div class="wui-bento-tile wui-w-2x5">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">Events By Location</h3>
        <div class="wui-tile-sub">Top 5 event areas</div>
      </div>
      <div class="wui-tile-icon blue"><span class="material-symbols-outlined">location_on</span></div>
    </div>

    <div class="wui-tile-body">
      <div id="eventsLocationList"></div>
    </div>

    <div class="wui-tile-footer justify-end">
      <button type="button" class="wui-btn ghost primary wui-btn-sm">
        View All Events<span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  </div>
</div>
```

```js
function initEventsLocationWidget() {
  var host = document.getElementById("eventsLocationList");
  if (!host || !window.WUI || !WUI.barRow) { return; }

  var items = [
    { label: "Downtown Area", value: "320" },
    { label: "West Park Area", value: "245" },
    { label: "Riverside Drive", value: "186" },
    { label: "Industrial Zone", value: "142" },
    { label: "Sunset Boulevard", value: "98" }
  ];

  var maxValue = Math.max.apply(null, items.map(function (item) { return parseInt(item.value, 10) || 0; }));
  var rows = items.map(function (item) {
    var pct = maxValue > 0 ? ((parseInt(item.value, 10) || 0) / maxValue) * 100 : 0;
    return { label: item.label, value: item.value, segments: [{ pct: pct, color: "primary" }] };
  });

  WUI.barRow(host, { rows: rows });
}
```

**Real card, from the Operation Home Page board.** Recreated 1:1 in `weoc-ui-doc/tests/responsive/emergency-level-tile.html` — six classifications, each broken into 4 tier segments, colored from the shared `--tier-N-glow` tokens.

```js
<div class="wui-bento-tile wui-w-2x5">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">Events By Emergency Level</h3>
        <div class="wui-tile-sub">Tier distribution by classification</div>
      </div>
      <div class="wui-tile-icon orange"><span class="material-symbols-outlined">emergency</span></div>
    </div>

    <div class="wui-tile-body wui-flex wui-flex-col wui-gap-3">
      <div id="emergencyLevelList"></div>
      <div class="emergency-level-legend">
        <span class="emergency-level-legend-item"><span class="emergency-level-dot tier-1"></span>Tier 1</span>
        <span class="emergency-level-legend-item"><span class="emergency-level-dot tier-2"></span>Tier 2</span>
        <span class="emergency-level-legend-item"><span class="emergency-level-dot tier-3"></span>Tier 3</span>
        <span class="emergency-level-legend-item"><span class="emergency-level-dot tier-4"></span>Tier 4</span>
      </div>
    </div>
  </div>
</div>
```

```js
<span id="emergencyHSEData" style="display: none"><value-of select="//@emergency_hse_tiers_expr" /></span>
<span id="emergencyFireSafetyData" style="display: none"><value-of select="//@emergency_fire_safety_tiers_expr" /></span>
<span id="emergencyEnvironmentalData" style="display: none"><value-of select="//@emergency_environmental_tiers_expr" /></span>
<span id="emergencyComplianceData" style="display: none"><value-of select="//@emergency_compliance_tiers_expr" /></span>
<span id="emergencySecurityData" style="display: none"><value-of select="//@emergency_security_tiers_expr" /></span>
<span id="emergencyOperationsData" style="display: none"><value-of select="//@emergency_operations_tiers_expr" /></span>
<!-- each expression returns a JSON 4-element array, e.g. "[4,2,1,0]" for [tier1,tier2,tier3,tier4] counts -->
```

```js
function getEmergencyTierData(elementId) {
  var dataText = $("#" + elementId).text().trim();
  try {
    var data = JSON.parse(dataText);
    return [parseInt(data[0], 10) || 0, parseInt(data[1], 10) || 0, parseInt(data[2], 10) || 0, parseInt(data[3], 10) || 0];
  } catch (e) {
    return [0, 0, 0, 0];
  }
}

var TIER_COLORS = ["var(--tier-1-glow)", "var(--tier-2-glow)", "var(--tier-3-glow)", "var(--tier-4-glow)"];

var EMERGENCY_SOURCES = [
  { id: "emergencyHSEData", label: "HSE" },
  { id: "emergencyFireSafetyData", label: "Fire and Safety" },
  { id: "emergencyEnvironmentalData", label: "Environmental" },
  { id: "emergencyComplianceData", label: "Compliance" },
  { id: "emergencySecurityData", label: "Security" },
  { id: "emergencyOperationsData", label: "Operations" }
];

function initEmergencyLevelWidget() {
  var host = document.getElementById("emergencyLevelList");
  if (!host || !window.WUI || !WUI.barRow) { return; }

  var rows = EMERGENCY_SOURCES.map(function (source) {
    var tiers = getEmergencyTierData(source.id);
    var total = tiers[0] + tiers[1] + tiers[2] + tiers[3];
    var segments = total === 0
      ? [{ pct: 100, color: "var(--color-secondary-muted)" }]
      : tiers.map(function (tierValue, tierIndex) { return { pct: (tierValue / total) * 100, color: TIER_COLORS[tierIndex] }; });

    return { label: source.label, value: String(total), segments: segments };
  });

  WUI.barRow(host, { rows: rows });
}
```

## 6. Sparkline / Line Chart

uPlot-backed time series. Use a short `height` (40-60px) for an inline sparkline inside a KPI-number tile, or a taller one as its own tile. `data[0]` must be real ascending Unix-**second** timestamps — small sequential integers render nothing.

**Real card, from the Operation Home Page board (`HomePage/out/board.web`).** Recreated 1:1 in `weoc-ui-doc/tests/responsive/event-timeline-chart-tile.html` as a standalone, verified-in-browser recipe. Type is `area` here — `line`/`bar`/`stepped` use the identical shape, just a different `type`.

Markup needs the tile body to have a real height, since `WUI.chart` sizes off `host.offsetHeight`. The expression below (full, unabbreviated SQL) is the 7-day series source:

```js
<div class="wui-bento-tile wui-w-4x5">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">Event Timeline</h3>
        <div class="wui-tile-sub">Weekly event trend</div>
      </div>
      <div class="wui-tile-icon blue"><span class="material-symbols-outlined">timeline</span></div>
    </div>

    <div class="wui-tile-body" style="height:220px">
      <div id="eventTimelineChart" style="height:100%"></div>
    </div>
  </div>
</div>
```

```js
<externalexpression name="event_timeline_values_expr" board="Event Reporting V2.0" table="Event Reports Table"
  filter="isDeleted != 1">
  '[' + CAST(COUNT(CASE WHEN RecordInsertDateTime >= DATEADD(day, -6,
  CAST(GETDATE() AS date)) AND RecordInsertDateTime < DATEADD(day, -5,
  CAST(GETDATE() AS date)) THEN 1 END) AS varchar(10)) + ',' +
  CAST(COUNT(CASE WHEN RecordInsertDateTime >= DATEADD(day, -5,
  CAST(GETDATE() AS date)) AND RecordInsertDateTime < DATEADD(day, -4,
  CAST(GETDATE() AS date)) THEN 1 END) AS varchar(10)) + ',' +
  CAST(COUNT(CASE WHEN RecordInsertDateTime >= DATEADD(day, -4,
  CAST(GETDATE() AS date)) AND RecordInsertDateTime < DATEADD(day, -3,
  CAST(GETDATE() AS date)) THEN 1 END) AS varchar(10)) + ',' +
  CAST(COUNT(CASE WHEN RecordInsertDateTime >= DATEADD(day, -3,
  CAST(GETDATE() AS date)) AND RecordInsertDateTime < DATEADD(day, -2,
  CAST(GETDATE() AS date)) THEN 1 END) AS varchar(10)) + ',' +
  CAST(COUNT(CASE WHEN RecordInsertDateTime >= DATEADD(day, -2,
  CAST(GETDATE() AS date)) AND RecordInsertDateTime < DATEADD(day, -1,
  CAST(GETDATE() AS date)) THEN 1 END) AS varchar(10)) + ',' +
  CAST(COUNT(CASE WHEN RecordInsertDateTime >= DATEADD(day, -1,
  CAST(GETDATE() AS date)) AND RecordInsertDateTime < CAST(GETDATE() AS
  date) THEN 1 END) AS varchar(10)) + ',' + CAST(COUNT(CASE WHEN
  RecordInsertDateTime >= CAST(GETDATE() AS date) AND
  RecordInsertDateTime < DATEADD(day, 1, CAST(GETDATE() AS date)) THEN
  1 END) AS varchar(10)) + ']'
</externalexpression>

<span id="eventTimelineValues" style="display: none"><value-of select="//@event_timeline_values_expr" /></span>
```

```js
var eventTimelineHandle = null;

function getEventTimelineValues() {
  var dataText = $("#eventTimelineValues").text().trim();
  try {
    return JSON.parse(dataText);
  } catch (e) {
    return [0, 0, 0, 0, 0, 0, 0];
  }
}

function drawEventTimelineChart() {
  var host = document.getElementById("eventTimelineChart");
  if (!host) { return; }

  var values = getEventTimelineValues();
  if (!values.length) { return; }

  var timestamps = [];
  var now = Math.floor(Date.now() / 1000);
  var dayInSeconds = 86400;
  for (var i = values.length - 1; i >= 0; i--) {
    timestamps.unshift(now - i * dayInSeconds);
  }

  var chartOpts = {
    type: "area",
    series: [{ label: wuiT("Events", "Events"), color: "primary" }],
    data: [timestamps, values],
    height: Math.max(140, (host.offsetHeight || 220) - 24),
    legend: false
  };

  if (eventTimelineHandle) {
    eventTimelineHandle.update(chartOpts.data);
  } else if (window.uPlot) {
    eventTimelineHandle = WUI.chart(host, chartOpts);
  }
}
```

## 7. Progress Ring

CSS-only, no JS. Fluid by default — scales with its container. Use for a single completion/readiness percentage where a gauge's threshold zones aren't needed.

```html
<div class="wui-progress-ring primary" style="width:140px;height:140px">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:81.68" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">75%</div>
    <div class="wui-progress-ring-label">Readiness</div>
  </div>
</div>
```

**Copy-paste template** (stroke-dashoffset formula: `326.73 × (1 − pct/100)` — e.g. 75% → 81.68):

```js
<div class="wui-progress-ring {{primary/success/warning/danger/info/secondary}}">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:{{326.73 * (1 - pct/100)}}" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">{{75}}%</div>
    <div class="wui-progress-ring-label">{{Readiness}}</div>
  </div>
</div>
```

For an animated fill-in-on-load effect instead of a static value, use `data-target-pct="{{75}}"` on the `.wui-progress-ring-fill` circle and call `WUIAnim.ringEntrance(el)` — see [Motion](motion.md).

## 8. Quick Action Grid

Pure CSS/DOM buttons, one delegated click handler. Use for a row of shortcut actions (add record, notify, jump to module) inside a tile.

**Real card, from the Operation Home Page board.** Recreated 1:1 in `weoc-ui-doc/tests/responsive/quick-actions-tile.html`. The real board wires `data-action` to a navigation lookup in its own `quick-actions.js`; the handler shape below is what to copy regardless of what each action ends up doing.

```js
<div class="wui-bento-tile wui-w-10x2">
  <div class="wui-tile">
    <div class="wui-tile-hdr">
      <div class="wui-tile-title-wrap">
        <h3 class="wui-tile-title">Quick Actions</h3>
        <div class="wui-tile-sub">Quick actions to modules</div>
      </div>
      <div class="wui-tile-icon blue"><span class="material-symbols-outlined">arrow_split</span></div>
    </div>

    <div class="wui-tile-body">
      <div class="wui-grid wui-grid-6 compact wui-gap-2">
        <button type="button" class="js-quick-action-btn wui-btn vertical square xs outline primary" data-action="add-event" title="Add Event">
          <span class="material-symbols-outlined">add_circle</span>
        </button>
        <!-- ... 5 more buttons, same shape, one wui-btn color per action group ... -->
      </div>
    </div>
  </div>
</div>
```

```js
// One delegated handler per action group — don't wire per-button onclick.
document.addEventListener("click", function (e) {
  var btn = e.target.closest(".js-quick-action-btn");
  if (!btn) { return; }

  var action = btn.getAttribute("data-action");
  // real board.web routes action -> { board, view } via quick-actions.js, then
  // opens that view the same way a  would
});
```

> **Not seeing the visualization you need?:** Heatmaps, box plots, funnels, and maps-with-markers aren't weoc-ui components yet. Don't build a one-off — flag it as a porting candidate per the [component-promotion convention](conventions.md) so it gets added here for everyone.
