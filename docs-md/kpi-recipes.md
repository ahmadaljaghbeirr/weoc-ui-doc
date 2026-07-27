# Dashboard KPI & Tile Recipes

[← Index](README.md)

Ready-made, copy-paste starting points for the KPI/tile shapes a dashboard needs most often. Each recipe is a real, working example — the `{{double-curly}}` spots are the only places you change anything.

> **How to read a recipe:** Every recipe below has two parts. First, a **live example** with real sample data — proof it works, and something to visually compare your own result against. Second, a **copy-paste template** right underneath it, using `{{name}}` placeholders for every spot that should change per KPI. Everything outside `{{...}}` in the template is real, working code — copy it verbatim and only fill in the placeholders.

## 1. The Tile Shell (`wui-tile`)

Every recipe below drops into the `.wui-tile-body` of this shell. Header and footer are both optional — omit either div for a body-only tile. See [conventions.md](conventions.md) for the `.flush` border toggle and `.is-scrollable`.

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

```html
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

```html
<div class="wui-content-wrap">
  <div class="wui-text-xs wui-text-secondary">{{Label}}</div>
  <div class="dash-kpi-value{{ ' danger' / ' warning' / ' success' or omit for neutral}}">{{123}}</div>
</div>
```

```css
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

## 3. Gauge

Semi-circle threshold gauge. Auto-resizes and redraws crisply on any container change (bento tile resize, sidebar collapse, theme toggle) — no board-side wiring needed.

```html
<div id="demo-kpi-gauge"></div>

<script>
WUI.gauge('#demo-kpi-gauge', {
  value: 78,
  status: 'Partially Ready',
  height: 140
});
</script>
```

**Copy-paste template:**

```html
<div id="{{unique-element-id}}"></div>

<script>
WUI.gauge('#{{unique-element-id}}', {
  value: {{0-100}},
  status: '{{pre-localized status text, e.g. Ready / At Risk}}',
  height: {{px, default 140}},
  zones: {{optional — [{ to: 40, color: 'danger' }, { to: 70, color: 'warning' }, { to: 100, color: 'success' }] is the default}}
});
</script>
```

## 4. Donut / Pie (category split)

Raw Canvas 2D, no dependency. Use for a categorical breakdown (events by classification, resources by type). `WUI.pie()` is the same call with `cutout` omitted.

```html
<div id="demo-kpi-donut"></div>

<script>
WUI.donut('#demo-kpi-donut', {
  height: 160,
  data: [
    { label: 'Fire & Safety', value: 8, color: 'danger' },
    { label: 'Security', value: 5, color: 'warning' },
    { label: 'Operational', value: 12, color: 'primary' }
  ]
});
</script>
```

**Copy-paste template:**

```html
<div id="{{unique-element-id}}"></div>

<script>
WUI.donut('#{{unique-element-id}}', {
  height: {{px, default 240}},
  data: [
    { label: '{{Category A}}', value: {{count}}, color: '{{primary/success/warning/danger/info/secondary}}' },
    { label: '{{Category B}}', value: {{count}}, color: '{{color}}' }
    {{ … one row per category }}
  ]
});
</script>
```

## 5. Bar-Row (stacked/segmented progress)

Pure CSS/DOM, no canvas — already reflows for free with its container, including a built-in density reduction inside narrow bento tiles. Use for available/assigned/unavailable-style stacked breakdowns, one row per group.

```html
<div id="demo-kpi-barrow"></div>

<script>
WUI.barRow('#demo-kpi-barrow', {
  rows: [
    { label: 'Vehicles', value: 100, segments: [
      { pct: 62, color: 'success' },
      { pct: 23, color: 'warning' },
      { pct: 15, color: 'danger' }
    ]},
    { label: 'Chemicals', value: 100, segments: [
      { pct: 71, color: 'success' },
      { pct: 12, color: 'primary' },
      { pct: 17, color: 'danger' }
    ]}
  ]
});
</script>
```

**Copy-paste template:**

```html
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

## 6. Sparkline / Line Chart

uPlot-backed time series. Use a short `height` (40-60px) for an inline sparkline inside a KPI-number tile, or a taller one as its own tile. `data[0]` must be real ascending Unix-**second** timestamps — small sequential integers render nothing.

```html
<div id="demo-kpi-chart" style="height:140px"></div>

<script>
var now = Math.floor(Date.now() / 1000);
var ts = [];
for (var i = 0; i < 7; i++) { ts.push(now - (6 - i) * 86400); }
WUI.chart('#demo-kpi-chart', {
  type: 'line',
  height: 120,
  series: [{ label: 'Events', color: 'primary' }],
  data: [ts, [12, 15, 11, 18, 14, 20, 17]]
});
</script>
```

**Copy-paste template:**

```html
<div id="{{unique-element-id}}"></div>

<script>
WUI.chart('#{{unique-element-id}}', {
  type: '{{line/area/bar/stepped}}',
  height: {{px — 40-60 for a sparkline, 120-220 for a full chart}},
  series: [{ label: '{{Series name}}', color: '{{primary/success/warning/danger/info/secondary}}' }],
  data: [
    {{ [ts1, ts2, ts3, ...] — real ascending Unix-SECOND timestamps }},
    {{ [v1, v2, v3, ...] — one value per timestamp, same length }}
  ]
});
</script>
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

```html
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

For an animated fill-in-on-load effect instead of a static value, use `data-target-pct="{{75}}"` on the `.wui-progress-ring-fill` circle and call `WUIAnim.ringEntrance(el)` — see [motion.md](motion.md).

---

> **Not seeing the visualization you need?** Heatmaps, box plots, funnels, and maps-with-markers aren't weoc-ui components yet. Don't build a one-off — flag it as a porting candidate per the [component-promotion convention](conventions.md) so it gets added here for everyone.
