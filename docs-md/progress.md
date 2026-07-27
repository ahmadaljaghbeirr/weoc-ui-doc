# Progress

[← Index](README.md)

SVG radial rings and CSS horizontal bars for capacity, completion, and resource tracking: `wui-progress-ring`, `wui-progress-bar`, and the shared `wui-progress-legend`. Every fill below is a **static** value baked into the markup so the demos render without JavaScript.

## wui-progress-ring

SVG radial progress. `viewBox="0 0 120 120"`, `cx="60" cy="60" r="52"`, circumference `326.73` (2π × 52). The fill is drawn by `stroke-dashoffset` on `.wui-progress-ring-fill`: offset = `326.73 × (1 − pct/100)`. Set it as an inline `style` (CSS beats the SVG presentation attribute). These demos hardcode the offset; live animation is handled by `WUIAnim` and documented on the Animation page. Compose one *color* (`primary` … `info`) and an optional *size* (`xs`/`sm`/`md`/base/`lg`/`xl`).

### Color variants (base size, 136px)

```html
<!-- Primary · 75% → offset 326.73 × 0.25 = 81.68 -->
<div class="wui-progress-ring primary">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:81.68" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">75%</div>
    <div class="wui-progress-ring-label">Primary</div>
  </div>
</div>
<!-- Secondary · 50% → offset 163.37 -->
<div class="wui-progress-ring secondary">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:163.37" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">50%</div>
    <div class="wui-progress-ring-label">Secondary</div>
  </div>
</div>
<!-- Success · 60% → offset 130.69 -->
<div class="wui-progress-ring success">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:130.69" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">60%</div>
    <div class="wui-progress-ring-label">Success</div>
  </div>
</div>
<!-- Warning · 30% → offset 228.71 -->
<div class="wui-progress-ring warning">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:228.71" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">30%</div>
    <div class="wui-progress-ring-label">Warning</div>
  </div>
</div>
<!-- Danger · 10% → offset 294.06 -->
<div class="wui-progress-ring danger">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:294.06" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">10%</div>
    <div class="wui-progress-ring-label">Danger</div>
  </div>
</div>
<!-- Info · 100% → offset 0 -->
<div class="wui-progress-ring info">
  <svg viewBox="0 0 120 120" width="90" height="90">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:0" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">100%</div>
    <div class="wui-progress-ring-label">Info</div>
  </div>
</div>
```

### Sizes — xs → xl (base = 136px)

`xs` (36px) and `sm` (56px) hide the `.wui-progress-ring-label` automatically. `xl` (220px) drops the stroke-width to 8 so the arc does not look heavy. All at 65% (offset 114.36).

```html
<!-- xs · 36px · label hidden by CSS · omit center for a pure indicator -->
<div class="wui-progress-ring xs primary">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
  </svg>
</div>
<!-- sm · 56px · pct shown, label hidden by CSS -->
<div class="wui-progress-ring sm primary">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">65%</div>
    <div class="wui-progress-ring-label">Capacity</div>
  </div>
</div>
<!-- md · 96px · pct + label -->
<div class="wui-progress-ring md primary">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">65%</div>
    <div class="wui-progress-ring-label">Capacity</div>
  </div>
</div>
<!-- base · 136px · no size class -->
<div class="wui-progress-ring primary">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">65%</div>
    <div class="wui-progress-ring-label">Capacity</div>
  </div>
</div>
<!-- lg · 176px -->
<div class="wui-progress-ring lg primary">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">65%</div>
    <div class="wui-progress-ring-label">Capacity</div>
  </div>
</div>
<!-- xl · 220px · CSS applies stroke-width 8 to track + fill -->
<div class="wui-progress-ring xl primary">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">65%</div>
    <div class="wui-progress-ring-label">Capacity</div>
  </div>
</div>
```

### Center parts — pct + label

`.wui-progress-ring-center` is an absolutely positioned overlay holding `.wui-progress-ring-pct` (the big number) and `.wui-progress-ring-label` (the caption). Include the label for a titled metric, or drop it (and drop the whole center) for a bare indicator.

```html
<!-- pct + label -->
<div class="wui-progress-ring md success">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:81.68" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">75%</div>
    <div class="wui-progress-ring-label">Resources</div>
  </div>
</div>
<!-- pct only -->
<div class="wui-progress-ring md info">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:130.69" transform="rotate(-90 60 60)"/>
  </svg>
  <div class="wui-progress-ring-center">
    <div class="wui-progress-ring-pct">60%</div>
  </div>
</div>
<!-- no center — pure visual indicator -->
<div class="wui-progress-ring md warning">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
      stroke-dasharray="326.73" style="stroke-dashoffset:228.71" transform="rotate(-90 60 60)"/>
  </svg>
</div>
```

### Segmented ring — wui-progress-ring-segment

Stack multiple `.wui-progress-ring-segment` arcs on one track to show a breakdown. Each arc is a full `<circle>` drawn by `stroke-dasharray="ARC CIRC"` and rotated to start where the previous ended: arc = `326.73 × (pct/100)`, start = `-90 + (cumulative prior pct × 3.6)`. `stroke-linecap: butt` is applied automatically for clean joins. Pair with a `wui-progress-legend` as the color key.

```html
<!-- Task breakdown: 42 / 35 / 23 -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3)">
  <div class="wui-progress-ring">
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <!-- Done 42%: arc 137.23 · start -90 -->
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
        class="wui-progress-ring-segment success"
        stroke-dasharray="137.23 326.73" transform="rotate(-90 60 60)"/>
      <!-- In Progress 35%: arc 114.36 · start 61.2 (-90 + 42×3.6) -->
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
        class="wui-progress-ring-segment warning"
        stroke-dasharray="114.36 326.73" transform="rotate(61.2 60 60)"/>
      <!-- Not Started 23%: arc 75.15 · start 187.2 (-90 + 77×3.6) -->
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
        class="wui-progress-ring-segment secondary"
        stroke-dasharray="75.15 326.73" transform="rotate(187.2 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">42%</div>
      <div class="wui-progress-ring-label">Complete</div>
    </div>
  </div>
  <div class="wui-progress-legend">
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot success"></span>
      <span class="wui-progress-legend-label">Done</span>
      <span class="wui-progress-legend-value">42</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot warning"></span>
      <span class="wui-progress-legend-label">In Progress</span>
      <span class="wui-progress-legend-value">35</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot secondary"></span>
      <span class="wui-progress-legend-label">Not Started</span>
      <span class="wui-progress-legend-value">23</span>
    </div>
  </div>
</div>
<!-- Incident breakdown: 15 / 55 / 30 -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3)">
  <div class="wui-progress-ring">
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
      <!-- Critical 15%: arc 49.01 · start -90 -->
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
        class="wui-progress-ring-segment danger"
        stroke-dasharray="49.01 326.73" transform="rotate(-90 60 60)"/>
      <!-- Active 55%: arc 179.70 · start -36 (-90 + 15×3.6) -->
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
        class="wui-progress-ring-segment primary"
        stroke-dasharray="179.70 326.73" transform="rotate(-36 60 60)"/>
      <!-- Resolved 30%: arc 98.02 · start 162 (-90 + 70×3.6) -->
      <circle cx="60" cy="60" r="52" fill="none" stroke-width="10"
        class="wui-progress-ring-segment success"
        stroke-dasharray="98.02 326.73" transform="rotate(162 60 60)"/>
    </svg>
    <div class="wui-progress-ring-center">
      <div class="wui-progress-ring-pct">100</div>
      <div class="wui-progress-ring-label">Incidents</div>
    </div>
  </div>
  <div class="wui-progress-legend">
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot danger"></span>
      <span class="wui-progress-legend-label">Critical</span>
      <span class="wui-progress-legend-value">15</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot primary"></span>
      <span class="wui-progress-legend-label">Active</span>
      <span class="wui-progress-legend-value">55</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot success"></span>
      <span class="wui-progress-legend-label">Resolved</span>
      <span class="wui-progress-legend-value">30</span>
    </div>
  </div>
</div>
```

## wui-progress-bar

Horizontal CSS bar. The fill is a child `.wui-progress-bar-fill` whose `width` (as a %) is the value; these demos hardcode `style="width:X%"`. An optional `.wui-progress-bar-info` row carries `.wui-progress-bar-label` and `.wui-progress-bar-pct`. Compose one *color* and an optional *size* (`xs`/`sm`/base/`lg`/`xl`).

### Color variants (with info row)

```html
<!-- Primary · 78% -->
<div class="wui-progress-bar primary">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Shelter Capacity</div>
    <div class="wui-progress-bar-pct">78%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:78%"></div>
  </div>
</div>
<!-- Secondary · 30% (no info row) -->
<div class="wui-progress-bar secondary">
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:30%"></div>
  </div>
</div>
<!-- Success · 92% -->
<div class="wui-progress-bar success">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Resources Available</div>
    <div class="wui-progress-bar-pct">92%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:92%"></div>
  </div>
</div>
<!-- Warning · 65% -->
<div class="wui-progress-bar warning">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Hospital Beds Used</div>
    <div class="wui-progress-bar-pct">65%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:65%"></div>
  </div>
</div>
<!-- Danger · 43% -->
<div class="wui-progress-bar danger">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Road Closures</div>
    <div class="wui-progress-bar-pct">43%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:43%"></div>
  </div>
</div>
<!-- Info · 55% -->
<div class="wui-progress-bar info">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Training Completion</div>
    <div class="wui-progress-bar-pct">55%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:55%"></div>
  </div>
</div>
```

### Sizes — xs → xl (base = 8px track)

Five track heights: `xs` (3px), `sm` (5px), base (8px), `lg` (12px), `xl` (16px). Only the track height changes; the info row is independent and optional at any size. All at 65%.

```html
<!-- xs · 3px -->
<div class="wui-progress-bar xs primary">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">xs · 3px track</div>
    <div class="wui-progress-bar-pct">65%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:65%"></div>
  </div>
</div>
<!-- sm · 5px -->
<div class="wui-progress-bar sm primary">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">sm · 5px track</div>
    <div class="wui-progress-bar-pct">65%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:65%"></div>
  </div>
</div>
<!-- base · 8px -->
<div class="wui-progress-bar primary">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">base · 8px track</div>
    <div class="wui-progress-bar-pct">65%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:65%"></div>
  </div>
</div>
<!-- lg · 12px -->
<div class="wui-progress-bar lg primary">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">lg · 12px track</div>
    <div class="wui-progress-bar-pct">65%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:65%"></div>
  </div>
</div>
<!-- xl · 16px -->
<div class="wui-progress-bar xl primary">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">xl · 16px track</div>
    <div class="wui-progress-bar-pct">65%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:65%"></div>
  </div>
</div>
```

### Info row parts — label + pct

`.wui-progress-bar-info` is a flex row that space-betweens `.wui-progress-bar-label` (uppercase caption, left) and `.wui-progress-bar-pct` (bold value, right). Either child is optional.

```html
<!-- label + pct -->
<div class="wui-progress-bar success">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Label + pct</div>
    <div class="wui-progress-bar-pct">80%</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:80%"></div>
  </div>
</div>
<!-- label only -->
<div class="wui-progress-bar warning">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Label only</div>
  </div>
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:55%"></div>
  </div>
</div>
<!-- track only, no info row -->
<div class="wui-progress-bar info">
  <div class="wui-progress-bar-track">
    <div class="wui-progress-bar-fill" style="width:35%"></div>
  </div>
</div>
```

### Segmented bar — track.multi

Add `.multi` to `.wui-progress-bar-track` and give each `.wui-progress-bar-fill` its own color class and width. Widths are plain percentages summing to ≤ 100 — any remainder shows the track background. All size modifiers apply as-is. Pair with a `wui-progress-legend`.

```html
<!-- Task breakdown: 42 / 35 / 23 = 100 -->
<div class="wui-progress-bar">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Task Completion</div>
    <div class="wui-progress-bar-pct">42% done</div>
  </div>
  <div class="wui-progress-bar-track multi">
    <div class="wui-progress-bar-fill success" style="width:42%"></div>
    <div class="wui-progress-bar-fill warning" style="width:35%"></div>
    <div class="wui-progress-bar-fill secondary" style="width:23%"></div>
  </div>
  <div class="wui-progress-legend">
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot success"></span>
      <span class="wui-progress-legend-label">Done</span>
      <span class="wui-progress-legend-value">42</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot warning"></span>
      <span class="wui-progress-legend-label">In Progress</span>
      <span class="wui-progress-legend-value">35</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot secondary"></span>
      <span class="wui-progress-legend-label">Not Started</span>
      <span class="wui-progress-legend-value">23</span>
    </div>
  </div>
</div>
<!-- Partial fill: 38 / 27 / 18 = 83 · remaining 17% shows track background · lg size -->
<div class="wui-progress-bar lg">
  <div class="wui-progress-bar-info">
    <div class="wui-progress-bar-label">Shelter Capacity by Zone</div>
    <div class="wui-progress-bar-pct">83% allocated</div>
  </div>
  <div class="wui-progress-bar-track multi">
    <div class="wui-progress-bar-fill primary" style="width:38%"></div>
    <div class="wui-progress-bar-fill warning" style="width:27%"></div>
    <div class="wui-progress-bar-fill danger" style="width:18%"></div>
  </div>
  <div class="wui-progress-legend">
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot primary"></span>
      <span class="wui-progress-legend-label">Zone A · 38%</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot warning"></span>
      <span class="wui-progress-legend-label">Zone B · 27%</span>
    </div>
    <div class="wui-progress-legend-item">
      <span class="wui-progress-legend-dot danger"></span>
      <span class="wui-progress-legend-label">Zone C · 18%</span>
    </div>
  </div>
</div>
```

## wui-progress-legend

A wrapping color key used beside a segmented ring or bar. Each `.wui-progress-legend-item` holds a colored `.wui-progress-legend-dot` (same color classes as the components), a `.wui-progress-legend-label`, and an optional bold `.wui-progress-legend-value`. It stands alone — no ring or bar required.

### All dot colors (label + value)

```html
<div class="wui-progress-legend">
  <!-- Primary -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot primary"></span>
    <span class="wui-progress-legend-label">Primary</span>
    <span class="wui-progress-legend-value">55</span>
  </div>
  <!-- Secondary -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot secondary"></span>
    <span class="wui-progress-legend-label">Secondary</span>
    <span class="wui-progress-legend-value">23</span>
  </div>
  <!-- Success -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot success"></span>
    <span class="wui-progress-legend-label">Success</span>
    <span class="wui-progress-legend-value">42</span>
  </div>
  <!-- Warning -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot warning"></span>
    <span class="wui-progress-legend-label">Warning</span>
    <span class="wui-progress-legend-value">35</span>
  </div>
  <!-- Danger -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot danger"></span>
    <span class="wui-progress-legend-label">Danger</span>
    <span class="wui-progress-legend-value">15</span>
  </div>
  <!-- Info -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot info"></span>
    <span class="wui-progress-legend-label">Info</span>
    <span class="wui-progress-legend-value">30</span>
  </div>
</div>
```

### Label only (no value)

```html
<div class="wui-progress-legend">
  <!-- Zone A -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot primary"></span>
    <span class="wui-progress-legend-label">Zone A · 38%</span>
  </div>
  <!-- Zone B -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot warning"></span>
    <span class="wui-progress-legend-label">Zone B · 27%</span>
  </div>
  <!-- Zone C -->
  <div class="wui-progress-legend-item">
    <span class="wui-progress-legend-dot danger"></span>
    <span class="wui-progress-legend-label">Zone C · 18%</span>
  </div>
</div>
```

## Usage in a table

An `.xs` ring (36px, no center content) fits a standard table row, and an `.xs` bar works as a compact progress column without an info row. Fills are static, as everywhere on this page.

```html
<div class="wui-table-wrap">
  <table>
    <thead>
      <tr>
        <th class="wui-col-primary">Resource</th>
        <th style="width:56px">Ring</th>
        <th>Bar</th>
        <th class="wui-col-sm">Used</th>
      </tr>
    </thead>
    <tbody>
      <!-- 72% ring → offset 326.73 × 0.28 = 91.48 -->
      <tr>
        <td class="wui-cell-truncate">Emergency Shelters</td>
        <td>
          <div class="wui-progress-ring xs success">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
                stroke-dasharray="326.73" style="stroke-dashoffset:91.48" transform="rotate(-90 60 60)"/>
            </svg>
          </div>
        </td>
        <td><div class="wui-progress-bar xs success"><div class="wui-progress-bar-track"><div class="wui-progress-bar-fill" style="width:72%"></div></div></div></td>
        <td class="wui-cell-num">72%</td>
      </tr>
      <!-- 45% ring → offset 179.70 -->
      <tr>
        <td class="wui-cell-truncate">Medical Teams Deployed</td>
        <td>
          <div class="wui-progress-ring xs warning">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
                stroke-dasharray="326.73" style="stroke-dashoffset:179.70" transform="rotate(-90 60 60)"/>
            </svg>
          </div>
        </td>
        <td><div class="wui-progress-bar xs warning"><div class="wui-progress-bar-track"><div class="wui-progress-bar-fill" style="width:45%"></div></div></div></td>
        <td class="wui-cell-num">45%</td>
      </tr>
      <!-- 88% ring → offset 39.21 -->
      <tr>
        <td class="wui-cell-truncate">Fuel Reserve</td>
        <td>
          <div class="wui-progress-ring xs danger">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
                stroke-dasharray="326.73" style="stroke-dashoffset:39.21" transform="rotate(-90 60 60)"/>
            </svg>
          </div>
        </td>
        <td><div class="wui-progress-bar xs danger"><div class="wui-progress-bar-track"><div class="wui-progress-bar-fill" style="width:88%"></div></div></div></td>
        <td class="wui-cell-num">88%</td>
      </tr>
      <!-- 65% ring → offset 114.36 -->
      <tr>
        <td class="wui-cell-truncate">Communication Lines</td>
        <td>
          <div class="wui-progress-ring xs primary">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-track"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="wui-progress-ring-fill"
                stroke-dasharray="326.73" style="stroke-dashoffset:114.36" transform="rotate(-90 60 60)"/>
            </svg>
          </div>
        </td>
        <td><div class="wui-progress-bar xs primary"><div class="wui-progress-bar-track"><div class="wui-progress-bar-fill" style="width:65%"></div></div></div></td>
        <td class="wui-cell-num">65%</td>
      </tr>
    </tbody>
  </table>
</div>
```

## weoc-progress stepper

`.weoc-progress` is a responsive horizontal stepper. Use an ordered list, apply exactly one state class to each step, and add `aria-current="step"` to the current item. The connector belongs to the step before it, so omit it from the final item. Markup works without JavaScript; `WUIAnim.stepper()` progressively enhances state changes with GSAP and pulses the current indicator.

### Completed, current, and upcoming steps

```html
<nav id="request-progress" class="weoc-progress" aria-label="Form progress" style="--weoc-progress-current:45%">
  <ol class="weoc-progress-list">
    <li class="weoc-progress-step completed">
      <div class="weoc-progress-track">
        <span class="weoc-progress-indicator" aria-hidden="true"><span class="weoc-progress-icon material-symbols-outlined">check</span></span>
        <span class="weoc-progress-connector" aria-hidden="true"></span>
      </div>
      <div class="weoc-progress-content">
        <span class="weoc-progress-eyebrow">Step 1</span>
        <span class="weoc-progress-title">Card Details</span>
        <span class="weoc-progress-status">Completed</span>
      </div>
    </li>
    <li class="weoc-progress-step current" aria-current="step">
      <div class="weoc-progress-track">
        <span class="weoc-progress-indicator" aria-hidden="true"></span>
        <span class="weoc-progress-connector" aria-hidden="true"></span>
      </div>
      <div class="weoc-progress-content">
        <span class="weoc-progress-eyebrow">Step 2</span>
        <span class="weoc-progress-title">Form Review</span>
        <span class="weoc-progress-status">In Progress</span>
      </div>
    </li>
    <li class="weoc-progress-step upcoming">
      <div class="weoc-progress-track">
        <span class="weoc-progress-indicator" aria-hidden="true"></span>
        <span class="weoc-progress-connector" aria-hidden="true"></span>
      </div>
      <div class="weoc-progress-content">
        <span class="weoc-progress-eyebrow">Step 3</span>
        <span class="weoc-progress-title">Authentication</span>
        <span class="weoc-progress-status">Pending</span>
      </div>
    </li>
    <li class="weoc-progress-step upcoming">
      <div class="weoc-progress-track">
        <span class="weoc-progress-indicator" aria-hidden="true"></span>
      </div>
      <div class="weoc-progress-content">
        <span class="weoc-progress-eyebrow">Step 4</span>
        <span class="weoc-progress-title">Create Code</span>
        <span class="weoc-progress-status">Pending</span>
      </div>
    </li>
  </ol>
</nav>
```

The page wires the live stepper enhancement on load:

```js
WUIAnim.ready(function (animation) {
  window.requestProgress = animation.stepper('#request-progress', { currentProgress: 45 });
  // Browser-console test: move to Authentication (zero-based index).
  // window.requestProgress.setCurrent(2);
});
```

### Optional disabled state

The existing weoc-ui `.disabled` convention is supported. Pair it with `aria-disabled="true"`; the block icon and visible `Disabled` status ensure the state is not communicated by color alone.
