# Navigation

[← Index](README.md)

Structural chrome for a board: the sticky header bar `wui-hdr-wrap`, the inline text link `wui-link`, and the status strip `wui-band-wrap`. Every variant and modifier is shown with its exact markup. For the header's tab strip (`wui-hdr-tabs`), see the [Tabs](tabs.md) page.

## wui-hdr-wrap

Sticky board header. Structure: `wui-hdr-wrap` → `wui-hdr-inner` → `wui-hdr-top` (the row holding `wui-hdr-left` = icon + title block, and `wui-hdr-right` = actions/status). An optional `wui-hdr-tabs-wrap` sits below `wui-hdr-top` inside the same inner. The `.centered` variant turns `wui-hdr-inner` into a max-width (1100px) card.

### Realistic EOC board header — icon, title block, stats, actions

```html
<!-- Full header: inner > top > (left: icon + title-row + subtitle) + (right: stats + actions) -->
<div class="wui-hdr-wrap" style="width:100%">
  <div class="wui-hdr-inner">
    <div class="wui-hdr-top">
      <div class="wui-hdr-left">
        <!-- wui-hdr-icon: rounded tinted square holding a material symbol -->
        <div class="wui-hdr-icon"><span class="material-symbols-outlined">emergency</span></div>
        <div>
          <!-- wui-hdr-title-row: title + one inline status badge -->
          <div class="wui-hdr-title-row">
            <div class="wui-hdr-title">Operations Center</div>
            <span class="wui-badge danger">Level 3</span>
          </div>
          <!-- wui-hdr-subtitle -->
          <div class="wui-hdr-subtitle">Active incident response · Sector 4</div>
        </div>
      </div>
      <div class="wui-hdr-right">
        <!-- wui-hdr-actions: a primary action + an icon-only settings button -->
        <div class="wui-hdr-actions">
          <button class="wui-btn primary wui-btn-sm"><span class="material-symbols-outlined">add</span>New report</button>
          <button class="wui-btn ghost secondary wui-btn-sm icon-only" title="Settings"><span class="material-symbols-outlined">settings</span></button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Header stats (wui-hdr-stats)

A compact readout row for the header-right. Keep the header itself uncluttered — use one or two stats at most, or move counts into a `wui-band-wrap` strip below the header.

```html
<div class="wui-hdr-stats">
  <!-- open count -->
  <div class="wui-hdr-stat"><span class="material-symbols-outlined">warning</span>47 open</div>
  <!-- deployed count -->
  <div class="wui-hdr-stat"><span class="material-symbols-outlined">local_shipping</span>312 deployed</div>
</div>
```

### Centered variant (.centered) — inner becomes a max-width card

```html
<!-- .centered: transparent chrome, inner is a 1100px centered card -->
<div class="wui-hdr-wrap centered" style="width:100%">
  <div class="wui-hdr-inner">
    <div class="wui-hdr-top">
      <div class="wui-hdr-left">
        <div class="wui-hdr-icon"><span class="material-symbols-outlined">hub</span></div>
        <div>
          <div class="wui-hdr-title">Atlas Crisis Suite</div>
          <div class="wui-hdr-subtitle">Unified emergency operations</div>
        </div>
      </div>
      <div class="wui-hdr-right">
        <div class="wui-hdr-actions">
          <button class="wui-btn ghost secondary wui-btn-sm">Docs</button>
          <button class="wui-btn primary wui-btn-sm">Launch</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## wui-link

Inline text link that looks and behaves like an `<a>`. Works on both `<a>` and `<button>` (button chrome is reset). It flows inline with surrounding text; colour comes from a modifier. Underline appears on hover by default.

### Base + all color variants

```html
<!-- Base (primary) -->
<a class="wui-link" href="#">Primary link</a>
<!-- Secondary -->
<a class="wui-link secondary" href="#">Secondary</a>
<!-- Success -->
<a class="wui-link success" href="#">Success</a>
<!-- Warning -->
<a class="wui-link warning" href="#">Warning</a>
<!-- Danger -->
<a class="wui-link danger" href="#">Danger</a>
<!-- Info -->
<a class="wui-link info" href="#">Info</a>
<!-- Muted (lighter weight) -->
<a class="wui-link muted" href="#">Muted</a>
```

### With icon (inline material symbol)

```html
<!-- Leading icon -->
<a class="wui-link" href="#"><span class="material-symbols-outlined">open_in_new</span>Open dashboard</a>
<!-- Trailing icon -->
<a class="wui-link info" href="#">Download report<span class="material-symbols-outlined">download</span></a>
```

### Modifiers — underlined, plain, sm, xs

```html
<!-- underlined (always underlined) -->
<a class="wui-link underlined" href="#">Underlined</a>
<!-- plain (no underline even on hover) -->
<a class="wui-link plain" href="#">Plain (no hover underline)</a>
<!-- sm size -->
<a class="wui-link sm" href="#">Small (sm)</a>
<!-- xs size -->
<a class="wui-link xs" href="#">Extra small (xs)</a>
```

### Disabled — attribute and .disabled class

```html
<!-- Disabled via .disabled class on an anchor -->
<a class="wui-link disabled" href="#">Disabled link</a>
<!-- Disabled via native attribute on a button -->
<button class="wui-link" disabled>Disabled button link</button>
```

### In flowing text

```html
<!-- Inline within a paragraph -->
<p style="margin:0;font-size:var(--text-sm);color:var(--color-text-secondary)">The EOC has been <a class="wui-link danger underlined" href="#">activated at Level 3</a>. Review the <a class="wui-link" href="#">incident log</a> or <a class="wui-link muted" href="#">dismiss this notice</a>.</p>
```

## wui-band-wrap

Horizontal status strip for EOC counts and KPIs. Structure: `wui-band-wrap` → one or more `wui-band-row` → `wui-band-seg` segments (each a `wui-band-label` + `wui-band-value`), separated by `wui-band-divider`, with `wui-band-spacer` pushing a trailing `wui-band-actions` slot to the end. Stacked segments use `wui-band-seg-stack` (label over value). Add `.stripe.{color}` for a diagonal-striped left edge + colored bottom border.

### Basic band — segments, dividers, spacer, actions

```html
<div class="wui-band-wrap" style="width:100%">
  <div class="wui-band-row">
    <!-- Segment: label + value -->
    <div class="wui-band-seg">
      <div class="wui-band-label">Activation Level</div>
      <div class="wui-band-value">Level 3 — Partial</div>
    </div>
    <!-- Divider -->
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg">
      <div class="wui-band-label">Incidents Open</div>
      <div class="wui-band-value">47</div>
    </div>
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg">
      <div class="wui-band-label">Resources</div>
      <!-- Value can hold an inline icon -->
      <div class="wui-band-value"><span class="material-symbols-outlined">local_shipping</span>312</div>
    </div>
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg">
      <div class="wui-band-label">Shelters Active</div>
      <div class="wui-band-value">8 / 12</div>
    </div>
    <!-- Spacer pushes actions to the far end -->
    <div class="wui-band-spacer"></div>
    <!-- Actions slot -->
    <div class="wui-band-actions">
      <button class="wui-btn ghost secondary wui-btn-sm">Refresh</button>
    </div>
  </div>
</div>
```

### Stacked segment (wui-band-seg-stack) — label over value

```html
<div class="wui-band-wrap" style="width:100%">
  <div class="wui-band-row">
    <!-- wui-band-seg-stack: column layout, label above value -->
    <div class="wui-band-seg wui-band-seg-stack">
      <div class="wui-band-label">EOC Director</div>
      <div class="wui-band-value">John Davis</div>
    </div>
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg wui-band-seg-stack">
      <div class="wui-band-label">Opened At</div>
      <div class="wui-band-value">2024-01-15 · 14:00</div>
    </div>
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg wui-band-seg-stack">
      <div class="wui-band-label">Duration</div>
      <div class="wui-band-value"><span class="material-symbols-outlined">timer</span>04:32:11</div>
    </div>
  </div>
</div>
```

### Multiple rows (wui-band-row + wui-band-row)

```html
<!-- A second wui-band-row gets a top border automatically -->
<div class="wui-band-wrap" style="width:100%">
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Sector</div>
      <div class="wui-band-value">North</div>
    </div>
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg">
      <div class="wui-band-label">Teams</div>
      <div class="wui-band-value">12</div>
    </div>
  </div>
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Sector</div>
      <div class="wui-band-value">South</div>
    </div>
    <div class="wui-band-divider"></div>
    <div class="wui-band-seg">
      <div class="wui-band-label">Teams</div>
      <div class="wui-band-value">9</div>
    </div>
  </div>
</div>
```

### Stripe variants — all 5 colors (.stripe.{color})

```html
<!-- Primary -->
<div class="wui-band-wrap stripe primary" style="width:100%">
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Status</div>
      <div class="wui-band-value">Standby — Ready</div>
    </div>
  </div>
</div>
<!-- Danger -->
<div class="wui-band-wrap stripe danger" style="width:100%">
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Status</div>
      <div class="wui-band-value">EOC Activated — Level 4 Critical</div>
    </div>
  </div>
</div>
<!-- Warning -->
<div class="wui-band-wrap stripe warning" style="width:100%">
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Status</div>
      <div class="wui-band-value">Elevated — Monitoring</div>
    </div>
  </div>
</div>
<!-- Success -->
<div class="wui-band-wrap stripe success" style="width:100%">
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Status</div>
      <div class="wui-band-value">Normal Operations</div>
    </div>
  </div>
</div>
<!-- Info -->
<div class="wui-band-wrap stripe info" style="width:100%">
  <div class="wui-band-row">
    <div class="wui-band-seg">
      <div class="wui-band-label">Status</div>
      <div class="wui-band-value">Advisory Issued</div>
    </div>
  </div>
</div>
```
