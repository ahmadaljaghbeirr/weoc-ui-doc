# Cards & Containers

[← Index](README.md)

Structured content shells for the EOC: the three-layer `wui-card`, the flat `wui-plane` surface, the framed `wui-panel` and `wui-embed`, the `wui-person` / `wui-person-card` identity blocks, the read-only `wui-info-grid`, the dashboard `wui-widget`, and the declarative `wui-collapsible` family. Every variant, atom, and state is shown below with its exact markup.

## wui-card

A three-layer system. **Layer 1** is the surface (`wui-card`) with states, density, accent, and side-column modifiers. **Layer 2** is a template that shapes the layout: `is-metric`, `is-record`, `is-item`. **Layer 3** is the atoms (`wui-card-hdr`, `wui-card-body`, `wui-card-value`, etc.) you drop inside. Density is set with `is-compact` / `is-comfortable`; the surface publishes `--wui-surface` for descendants such as sticky headers.

### Base surface + atoms (hdr / body / footer)

```html
<!-- Base card with header (bordered), body, and footer -->
<div class="wui-card" style="width:320px">
  <div class="wui-card-hdr has-border">
    <div class="wui-card-hdr-left">
      <span class="material-symbols-outlined">description</span>
      <span class="wui-card-title-row">Incident Summary</span>
    </div>
    <div class="wui-card-hdr-right">
      <span class="wui-card-id">INC-2024-0471</span>
    </div>
  </div>
  <div class="wui-card-body">
    <div>Structure fire reported at the north warehouse. Command post established; three engine companies on scene.</div>
    <div class="wui-card-divider"></div>
    <div class="wui-card-meta">
      <span class="wui-badge danger wui-badge-sm">Critical</span>
      <span class="wui-card-id">Reported 14:32</span>
    </div>
  </div>
  <div class="wui-card-footer justify-end">
    <button class="wui-btn ghost secondary wui-btn-sm">Dismiss</button>
    <button class="wui-btn primary wui-btn-sm">Open</button>
  </div>
</div>
```

### Footer alignment — justify-end / justify-between

```html
<!-- justify-end — actions pushed to the right (default pairing) -->
<div class="wui-card" style="width:320px">
  <div class="wui-card-body">Footer with <code>justify-end</code>.</div>
  <div class="wui-card-footer justify-end">
    <button class="wui-btn ghost secondary wui-btn-sm">Dismiss</button>
    <button class="wui-btn primary wui-btn-sm">Open</button>
  </div>
</div>
<!-- justify-between — meta on the left, actions on the right -->
<div class="wui-card" style="width:320px">
  <div class="wui-card-body">Footer with <code>justify-between</code>.</div>
  <div class="wui-card-footer justify-between">
    <span class="wui-card-id">Updated 15:47</span>
    <button class="wui-btn primary wui-btn-sm">Open</button>
  </div>
</div>
```

### States — interactive / selected / disabled

```html
<!-- Interactive (hover for gradient border) -->
<div class="wui-card is-interactive" style="width:220px">
  <div class="wui-card-body"><strong>is-interactive</strong><div style="color:var(--color-text-secondary);font-size:var(--text-xs)">Hover for the gradient border.</div></div>
</div>
<!-- Selected -->
<div class="wui-card is-selected" style="width:220px">
  <div class="wui-card-body"><strong>is-selected</strong><div style="color:var(--color-text-secondary);font-size:var(--text-xs)">Persistent gradient border.</div></div>
</div>
<!-- Disabled -->
<div class="wui-card is-disabled" style="width:220px">
  <div class="wui-card-body"><strong>is-disabled</strong><div style="color:var(--color-text-secondary);font-size:var(--text-xs)">Dimmed, non-interactive.</div></div>
</div>
```

### Density — compact / base / comfortable

```html
<!-- Compact -->
<div class="wui-card is-compact" style="width:200px">
  <div class="wui-card-hdr has-border"><div class="wui-card-hdr-left">is-compact</div></div>
  <div class="wui-card-body">Tighter padding + gap.</div>
</div>
<!-- Base (no density class) -->
<div class="wui-card" style="width:200px">
  <div class="wui-card-hdr has-border"><div class="wui-card-hdr-left">Base (md)</div></div>
  <div class="wui-card-body">Default padding + gap.</div>
</div>
<!-- Comfortable -->
<div class="wui-card is-comfortable" style="width:200px">
  <div class="wui-card-hdr has-border"><div class="wui-card-hdr-left">is-comfortable</div></div>
  <div class="wui-card-body">Roomier padding + gap.</div>
</div>
```

### Accent bar — has-accent + color

```html
<!-- Primary -->
<div class="wui-card has-accent primary" style="width:180px"><div class="wui-card-body">primary</div></div>
<!-- Success -->
<div class="wui-card has-accent success" style="width:180px"><div class="wui-card-body">success</div></div>
<!-- Warning -->
<div class="wui-card has-accent warning" style="width:180px"><div class="wui-card-body">warning</div></div>
<!-- Danger -->
<div class="wui-card has-accent danger" style="width:180px"><div class="wui-card-body">danger</div></div>
<!-- Info -->
<div class="wui-card has-accent info" style="width:180px"><div class="wui-card-body">info</div></div>
<!-- Secondary -->
<div class="wui-card has-accent secondary" style="width:180px"><div class="wui-card-body">secondary</div></div>
```

### Side column (has-side)

The side column pairs naturally with a `wui-icon-bubble` (see the Indicators page) to flag severity.

```html
<!-- Danger side with an icon bubble -->
<div class="wui-card has-side" style="width:340px">
  <div class="wui-card-side danger">
    <div class="wui-icon-bubble solid danger"><span class="material-symbols-outlined">priority_high</span></div>
  </div>
  <div class="wui-card-body">
    <strong>HAZMAT Release</strong>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">Chlorine leak, Sector 4. Evacuation in progress.</div>
  </div>
</div>
<!-- Warning side with an icon bubble -->
<div class="wui-card has-side" style="width:340px">
  <div class="wui-card-side warning">
    <div class="wui-icon-bubble solid warning"><span class="material-symbols-outlined">warning</span></div>
  </div>
  <div class="wui-card-body">
    <strong>Flood Advisory</strong>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">River gauge rising near Bridge Road.</div>
  </div>
</div>
<!-- Success side with an icon bubble -->
<div class="wui-card has-side" style="width:340px">
  <div class="wui-card-side success">
    <div class="wui-icon-bubble solid success"><span class="material-symbols-outlined">check_circle</span></div>
  </div>
  <div class="wui-card-body">
    <strong>All Clear — Sector 2</strong>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">Evacuation zone reopened to residents.</div>
  </div>
</div>
<!-- Primary side with an icon bubble -->
<div class="wui-card has-side" style="width:340px">
  <div class="wui-card-side primary">
    <div class="wui-icon-bubble solid primary"><span class="material-symbols-outlined">assignment</span></div>
  </div>
  <div class="wui-card-body">
    <strong>New Mission Assigned</strong>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">Damage assessment — Task Force Bravo.</div>
  </div>
</div>
<!-- Info side with an icon bubble -->
<div class="wui-card has-side" style="width:340px">
  <div class="wui-card-side info">
    <div class="wui-icon-bubble solid info"><span class="material-symbols-outlined">campaign</span></div>
  </div>
  <div class="wui-card-body">
    <strong>Public Information Update</strong>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">Press briefing scheduled for 16:00.</div>
  </div>
</div>
<!-- Secondary side with an icon bubble -->
<div class="wui-card has-side" style="width:340px">
  <div class="wui-card-side secondary">
    <div class="wui-icon-bubble solid secondary"><span class="material-symbols-outlined">draft</span></div>
  </div>
  <div class="wui-card-body">
    <strong>Draft SITREP #14</strong>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">Awaiting review before distribution.</div>
  </div>
</div>
```

### Template: is-metric (KPI cell)

```html
<!-- Metric with header + value + delta -->
<div class="wui-card is-metric" style="width:200px">
  <div class="wui-card-hdr">
    <span class="wui-card-label">Active Incidents</span>
    <span class="material-symbols-outlined">local_fire_department</span>
  </div>
  <div class="wui-card-value">27</div>
  <div class="wui-card-delta up">
    <span class="material-symbols-outlined">trending_up</span>+4
    <span class="wui-card-delta-lbl">since 06:00</span>
  </div>
</div>
<!-- Metric, value sizes + down delta -->
<div class="wui-card is-metric" style="width:200px">
  <div class="wui-card-hdr">
    <span class="wui-card-label">Open Resources</span>
    <span class="material-symbols-outlined">inventory_2</span>
  </div>
  <div class="wui-card-value sm">142</div>
  <div class="wui-card-delta down">
    <span class="material-symbols-outlined">trending_down</span>-8
    <span class="wui-card-delta-lbl">last hour</span>
  </div>
</div>
<!-- Headless metric — no header, body fills -->
<div class="wui-card is-metric is-headless" style="width:200px">
  <div class="wui-card-hdr"><span class="wui-card-label">Hidden</span></div>
  <div class="wui-card-body" style="align-items:center;justify-content:center;text-align:center">
    <div class="wui-card-value xs">99.4%</div>
    <div class="wui-card-label">Uptime (is-headless)</div>
  </div>
</div>
```

### Template: is-metric — stats row

```html
<!-- Boxed stats (default) with color variants -->
<div class="wui-card is-metric" style="width:420px">
  <div class="wui-card-hdr"><span class="wui-card-label">Shelter Occupancy</span></div>
  <div class="wui-card-stats">
    <div class="wui-card-stat success">
      <span class="wui-card-stat-value">312</span>
      <span class="wui-card-stat-label">Sheltered</span>
    </div>
    <div class="wui-card-stat warning">
      <span class="wui-card-stat-value">48</span>
      <span class="wui-card-stat-label">Pending</span>
    </div>
    <div class="wui-card-stat danger">
      <span class="wui-card-stat-value">6</span>
      <span class="wui-card-stat-label">At capacity</span>
    </div>
  </div>
</div>
<!-- Inline stats (divider-separated) with primary + secondary -->
<div class="wui-card is-metric" style="width:420px">
  <div class="wui-card-hdr"><span class="wui-card-label">Response Summary</span></div>
  <div class="wui-card-stats is-inline">
    <div class="wui-card-stat primary">
      <span class="wui-card-stat-value">8</span>
      <span class="wui-card-stat-label">Engines</span>
    </div>
    <div class="wui-card-stat secondary">
      <span class="wui-card-stat-value">3</span>
      <span class="wui-card-stat-label">Ladders</span>
    </div>
    <div class="wui-card-stat">
      <span class="wui-card-stat-value">14</span>
      <span class="wui-card-stat-label">Personnel</span>
    </div>
  </div>
  <div class="wui-card-sub" style="font-size:var(--text-xs);color:var(--color-text-secondary)">wui-card-sub pins to the bottom.</div>
</div>
```

### Template: is-record (log / event row)

```html
<!-- Record: lead · primary/content · meta · status · end -->
<div class="wui-card is-record" style="width:520px">
  <div class="wui-card-lead">
    <span class="material-symbols-outlined">flood</span>
  </div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>Levee overtopping — District 5</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">Water crews dispatched; sandbag operation underway.</div>
  </div>
  <div class="wui-card-meta">
    <span class="wui-card-id">14:12</span>
    <span class="wui-card-id">Ops</span>
  </div>
  <div class="wui-card-status">
    <span class="wui-badge warning wui-badge-sm">Active</span>
  </div>
  <div class="wui-card-end">
    <button class="wui-action-btn"><span class="material-symbols-outlined">chevron_right</span></button>
  </div>
</div>
```

### Template: is-record + has-lead-fill (colored lead strip)

```html
<!-- Danger lead fill -->
<div class="wui-card is-record has-lead-fill" style="width:520px">
  <div class="wui-card-lead danger">
    <span class="material-symbols-outlined">priority_high</span>
  </div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>Tier 3 Escalation</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">EOC fully activated. Unified command established.</div>
  </div>
  <div class="wui-card-status"><span class="wui-badge danger wui-badge-sm">Tier 3</span></div>
</div>
<!-- Success lead fill -->
<div class="wui-card is-record has-lead-fill" style="width:520px">
  <div class="wui-card-lead success">
    <span class="material-symbols-outlined">check_circle</span>
  </div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>All Clear — Sector 2</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">Evacuation zone reopened to residents.</div>
  </div>
  <div class="wui-card-status"><span class="wui-badge success wui-badge-sm">Resolved</span></div>
</div>
<!-- Info lead fill -->
<div class="wui-card is-record has-lead-fill" style="width:520px">
  <div class="wui-card-lead info"><span class="material-symbols-outlined">campaign</span></div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>Public Information Update</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">Press briefing scheduled for 16:00.</div>
  </div>
  <div class="wui-card-status"><span class="wui-badge info wui-badge-sm">Notice</span></div>
</div>
<!-- Warning lead fill -->
<div class="wui-card is-record has-lead-fill" style="width:520px">
  <div class="wui-card-lead warning"><span class="material-symbols-outlined">bolt</span></div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>Power Grid Instability</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">Rolling brownouts anticipated in the west district.</div>
  </div>
  <div class="wui-card-status"><span class="wui-badge warning wui-badge-sm">Watch</span></div>
</div>
<!-- Primary lead fill -->
<div class="wui-card is-record has-lead-fill" style="width:520px">
  <div class="wui-card-lead primary"><span class="material-symbols-outlined">assignment</span></div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>New Mission Assigned</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">Damage assessment — Task Force Bravo.</div>
  </div>
  <div class="wui-card-status"><span class="wui-badge primary wui-badge-sm">Assigned</span></div>
</div>
<!-- Secondary lead fill -->
<div class="wui-card is-record has-lead-fill" style="width:520px">
  <div class="wui-card-lead secondary"><span class="material-symbols-outlined">draft</span></div>
  <div class="wui-card-primary">
    <div class="wui-card-content"><strong>Draft SITREP #14</strong></div>
    <div class="wui-card-content" style="font-size:var(--text-xs);color:var(--color-text-secondary)">Awaiting review before distribution.</div>
  </div>
  <div class="wui-card-status"><span class="wui-badge secondary wui-badge-sm">Draft</span></div>
</div>
```

### Template: is-record without a description column — spacing options

Real log rows (Event Reports, Information Sharing) put the description in its own `wui-card-content` column beside `wui-card-primary`. Drop that column and `wui-card-primary` — which is `flex: 1` — grows to fill the entire row, so the name stretches across most of the card. Add `no-desc`: the base caps the name (tune with `--wui-record-name-w`), then a `spread-*` modifier decides how the freed space is distributed. Three candidates are shown below — the **CSS** tab holds each one's rule. **Pick one to keep.**

#### Option A — Proportional fill (`spread-fill`) · recommended

Name pinned left, status pinned right; the middle columns (reporter, date/time) grow equally to absorb the free space. Scales cleanly at any width.

```html
<!-- Long name -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead tier-3"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-3"><span class="material-symbols-outlined">warning</span></span></div>
  <div class="wui-card-primary">
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>Chemical spill — Berth 4</strong></span><span class="wui-badge tier-3 wui-badge-sm">Tier 3</span></div>
    <span class="wui-card-id">#EVT-2043 · Port Zone</span>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">AM</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">A. Mansoori</span><span class="wui-person-sub">Duty Officer</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 14:12</div></div>
  <div class="wui-card-status"><span class="wui-badge danger wui-badge-sm">Open</span></div>
</div>
<!-- Short name — columns stay aligned with the row above -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead success"><span class="wui-icon-bubble solid-reverse sm ripple circle success"><span class="material-symbols-outlined">check_circle</span></span></div>
  <div class="wui-card-primary">
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>All clear — Sector 2</strong></span><span class="wui-badge success wui-badge-sm">Resolved</span></div>
    <span class="wui-card-id">#EVT-2044 · Sector 2</span>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">RK</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">R. Khan</span><span class="wui-person-sub">Ops Lead</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 15:40</div></div>
  <div class="wui-card-status"><span class="wui-badge success wui-badge-sm">Closed</span></div>
</div>
```

```css
/* Option A — Proportional fill. Base no-desc caps the name; the middle
   columns (everything except lead / name / status) grow equally to fill. */
.wui-card.is-record.no-desc.spread-fill > :not(.wui-card-lead):not(.wui-card-primary):not(.wui-card-status) {
  flex: 1 1 0;
  min-width: 0;
}
```

#### Option B — Even gaps (`spread-even`)

Equal gap between every column (first flush-left, last flush-right). Balanced on medium rows; on very wide panels the items drift far apart and the lead detaches from the name.

```html
<div class="wui-card is-record no-desc spread-even" style="width:100%">
  <div class="wui-card-lead tier-3"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-3"><span class="material-symbols-outlined">warning</span></span></div>
  <div class="wui-card-primary">
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>Chemical spill — Berth 4</strong></span><span class="wui-badge tier-3 wui-badge-sm">Tier 3</span></div>
    <span class="wui-card-id">#EVT-2043 · Port Zone</span>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">AM</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">A. Mansoori</span><span class="wui-person-sub">Duty Officer</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 14:12</div></div>
  <div class="wui-card-status"><span class="wui-badge danger wui-badge-sm">Open</span></div>
</div>
<div class="wui-card is-record no-desc spread-even" style="width:100%">
  <div class="wui-card-lead success"><span class="wui-icon-bubble solid-reverse sm ripple circle success"><span class="material-symbols-outlined">check_circle</span></span></div>
  <div class="wui-card-primary">
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>All clear — Sector 2</strong></span><span class="wui-badge success wui-badge-sm">Resolved</span></div>
    <span class="wui-card-id">#EVT-2044 · Sector 2</span>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">RK</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">R. Khan</span><span class="wui-person-sub">Ops Lead</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 15:40</div></div>
  <div class="wui-card-status"><span class="wui-badge success wui-badge-sm">Closed</span></div>
</div>
```

```css
/* Option B — Even gaps. Space distributed equally between all columns. */
.wui-card.is-record.no-desc.spread-even {
  justify-content: space-between;
}
```

#### Option C — Equal columns (`spread-cols`)

Every non-lead column gets an equal share (table-like). Most rigidly aligned across rows, but wastes width on short columns like status and squeezes the name.

```html
<div class="wui-card is-record no-desc spread-cols" style="width:100%">
  <div class="wui-card-lead tier-3"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-3"><span class="material-symbols-outlined">warning</span></span></div>
  <div class="wui-card-primary">
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>Chemical spill — Berth 4</strong></span><span class="wui-badge tier-3 wui-badge-sm">Tier 3</span></div>
    <span class="wui-card-id">#EVT-2043 · Port Zone</span>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">AM</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">A. Mansoori</span><span class="wui-person-sub">Duty Officer</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 14:12</div></div>
  <div class="wui-card-status"><span class="wui-badge danger wui-badge-sm">Open</span></div>
</div>
<div class="wui-card is-record no-desc spread-cols" style="width:100%">
  <div class="wui-card-lead success"><span class="wui-icon-bubble solid-reverse sm ripple circle success"><span class="material-symbols-outlined">check_circle</span></span></div>
  <div class="wui-card-primary">
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>All clear — Sector 2</strong></span><span class="wui-badge success wui-badge-sm">Resolved</span></div>
    <span class="wui-card-id">#EVT-2044 · Sector 2</span>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">RK</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">R. Khan</span><span class="wui-person-sub">Ops Lead</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 15:40</div></div>
  <div class="wui-card-status"><span class="wui-badge success wui-badge-sm">Closed</span></div>
</div>
```

```css
/* Option C — Equal columns. Every non-lead column shares width equally. */
.wui-card.is-record.no-desc.spread-cols > :not(.wui-card-lead) {
  flex: 1 1 0;
  min-width: 0;
}
```

### Record leads — proper wui-icon-bubble usage

The lead holds a `wui-icon-bubble`. Event Reports uses `solid-reverse sm ripple circle` plus a tier/semantic color, on a `wui-card-lead` that carries the same color for context. All four tiers and the six semantic colors work identically.

```html
<!-- Tier 1 -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead tier-1"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-1"><span class="material-symbols-outlined">info</span></span></div>
  <div class="wui-card-primary"><div class="wui-card-title-row"><span class="wui-truncate"><strong>Advisory issued</strong></span><span class="wui-badge tier-1 wui-badge-sm">Tier 1</span></div></div>
  <div class="wui-card-status"><span class="wui-badge secondary wui-badge-sm">Monitoring</span></div>
</div>
<!-- Tier 2 -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead tier-2"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-2"><span class="material-symbols-outlined">notifications_active</span></span></div>
  <div class="wui-card-primary"><div class="wui-card-title-row"><span class="wui-truncate"><strong>Localised incident</strong></span><span class="wui-badge tier-2 wui-badge-sm">Tier 2</span></div></div>
  <div class="wui-card-status"><span class="wui-badge warning wui-badge-sm">Watch</span></div>
</div>
<!-- Tier 3 -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead tier-3"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-3"><span class="material-symbols-outlined">warning</span></span></div>
  <div class="wui-card-primary"><div class="wui-card-title-row"><span class="wui-truncate"><strong>Major escalation</strong></span><span class="wui-badge tier-3 wui-badge-sm">Tier 3</span></div></div>
  <div class="wui-card-status"><span class="wui-badge danger wui-badge-sm">Open</span></div>
</div>
<!-- Tier 4 -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead tier-4"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-4"><span class="material-symbols-outlined">crisis_alert</span></span></div>
  <div class="wui-card-primary"><div class="wui-card-title-row"><span class="wui-truncate"><strong>Full activation</strong></span><span class="wui-badge tier-4 wui-badge-sm">Tier 4</span></div></div>
  <div class="wui-card-status"><span class="wui-badge animate danger wui-badge-sm">Activated</span></div>
</div>
<!-- Semantic example: info -->
<div class="wui-card is-record no-desc spread-fill" style="width:100%">
  <div class="wui-card-lead info"><span class="wui-icon-bubble solid-reverse sm ripple circle info"><span class="material-symbols-outlined">campaign</span></span></div>
  <div class="wui-card-primary"><div class="wui-card-title-row"><span class="wui-truncate"><strong>Public information update</strong></span><span class="wui-badge info wui-badge-sm">Notice</span></div></div>
  <div class="wui-card-status"><span class="wui-badge info wui-badge-sm">Sent</span></div>
</div>
```

### Full record row — as used in Event Reports / Information Sharing

The complete row **with** the description column: severity lead, the stacked `wui-card-primary` (elapsed, title + tier badge, classification / record no. / location lines), the `wui-card-content` description block (the flex filler), the `wui-person` reporter, the `wui-card-meta` dates, and the `wui-card-status` badges. This is the record log the `no-desc` variants above are derived from — here nothing is removed, so no spacing modifier is needed. The **CSS** tab shows the one override boards apply: letting the description column grow.

```html
<div class="wui-card is-record has-lead-fill tier-3 record-full" style="width:100%">
  <div class="wui-card-lead tier-3"><span class="wui-icon-bubble solid-reverse sm ripple circle tier-3"><span class="material-symbols-outlined">warning</span></span></div>
  <div class="wui-card-primary">
    <span class="wui-elapsed danger"><span class="material-symbols-outlined">history</span> 2h ago</span>
    <div class="wui-card-title-row"><span class="wui-truncate"><strong>Chemical spill — Berth 4</strong></span><span class="wui-badge tier-3 wui-badge-sm">Tier 3</span></div>
    <span class="wui-card-id"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">category</span> Hazmat</span>
    <span class="wui-card-id"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">fork_right</span> Chemical release</span>
    <span class="wui-card-id wui-text-brand"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">tag</span> EVT-2043</span>
    <span class="wui-card-id"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">location_on</span> Port Zone</span>
  </div>
  <div class="wui-card-content">
    <div class="wui-update-entry">
      <div class="wui-card-id">Description</div>
      <div class="wui-update-desc">Vapour cloud reported near Berth 4; hazmat team dispatched and a 200 m cordon established. Air monitoring in progress.</div>
      <div class="wui-card-id">A. Mansoori as Duty Officer on 01/07/2026 14:12</div>
      <button class="wui-link" type="button">Show history</button>
    </div>
  </div>
  <div class="wui-person"><div class="wui-avatar primary">AM</div><div class="wui-person-info"><span class="wui-person-label">Created by</span><span class="wui-person-name">A. Mansoori</span><span class="wui-person-sub">Duty Officer</span><span class="wui-person-sub">01/07/2026 14:12</span></div></div>
  <div class="wui-card-meta"><div class="wui-card-id">Event Date / Time</div><div class="wui-card-id">01/07/2026 14:12</div></div>
  <div class="wui-card-status"><span class="wui-badge danger wui-badge-sm">Open</span><span class="wui-badge animate danger wui-badge-sm">Activated</span></div>
</div>
```

```css
/* The description is the flex filler that shares the row with the name.
   wui-card-content is content-sized by default, so let the description column
   grow (direct child, so nested content inside wui-card-primary is unaffected): */
.wui-card.is-record > .wui-card-content {
  flex: 1;
  min-width: 0;
}
```

### Template: is-item (gallery tile) — band + fields

```html
<!-- Item tile with colored band + field grid -->
<div class="wui-card is-item" style="width:260px">
  <div class="wui-card-band primary">
    <span>Engine 7</span>
    <span class="material-symbols-outlined">fire_truck</span>
  </div>
  <div class="wui-card-body">
    <div class="wui-card-fields cols-2">
      <div class="wui-card-field"><span class="wui-card-field-label">Status:</span> Available</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Crew:</span> 4</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Station:</span> 3</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Fuel:</span> 82%</div>
      <div class="wui-card-field span-full is-stacked">
        <span class="wui-card-field-label">Last Assignment</span>
        Structure fire, Warehouse District
      </div>
    </div>
  </div>
</div>
<!-- Item tile — success band + stacked fields -->
<div class="wui-card is-item" style="width:260px">
  <div class="wui-card-band success">
    <span>Shelter Alpha</span>
    <span class="material-symbols-outlined">home</span>
  </div>
  <div class="wui-card-body">
    <div class="wui-card-fields">
      <div class="wui-card-field is-stacked"><span class="wui-card-field-label">Occupancy</span>312 / 500</div>
      <div class="wui-card-field is-stacked span-2"><span class="wui-card-field-label">Manager</span>R. Osei</div>
    </div>
  </div>
</div>
```

### Card band — all colors

```html
<!-- Primary --> <div class="wui-card is-item" style="width:150px"><div class="wui-card-band primary"><span>Primary</span></div><div class="wui-card-body" style="font-size:var(--text-xs)">band</div></div>
<!-- Info --> <div class="wui-card is-item" style="width:150px"><div class="wui-card-band info"><span>Info</span></div><div class="wui-card-body" style="font-size:var(--text-xs)">band</div></div>
<!-- Success --> <div class="wui-card is-item" style="width:150px"><div class="wui-card-band success"><span>Success</span></div><div class="wui-card-body" style="font-size:var(--text-xs)">band</div></div>
<!-- Warning --> <div class="wui-card is-item" style="width:150px"><div class="wui-card-band warning"><span>Warning</span></div><div class="wui-card-body" style="font-size:var(--text-xs)">band</div></div>
<!-- Danger --> <div class="wui-card is-item" style="width:150px"><div class="wui-card-band danger"><span>Danger</span></div><div class="wui-card-body" style="font-size:var(--text-xs)">band</div></div>
<!-- Secondary --> <div class="wui-card is-item" style="width:150px"><div class="wui-card-band secondary"><span>Secondary</span></div><div class="wui-card-body" style="font-size:var(--text-xs)">band</div></div>
```

### Field grid — column counts + span

```html
<!-- cols-3 with a span-2 and a span-full field -->
<div class="wui-card" style="width:100%">
  <div class="wui-card-body">
    <div class="wui-card-fields cols-3">
      <div class="wui-card-field"><span class="wui-card-field-label">Unit:</span> ICP-1</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Sector:</span> North</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Radio:</span> TAC-3</div>
      <div class="wui-card-field span-2"><span class="wui-card-field-label">Objective:</span> Establish perimeter and staging area</div>
      <div class="wui-card-field"><span class="wui-card-field-label">ETA:</span> 12m</div>
      <div class="wui-card-field span-full is-stacked"><span class="wui-card-field-label">Notes</span> Access road partially blocked; reroute via Gate B.</div>
    </div>
  </div>
</div>
<!-- cols-4 with a span-2 and a span-full field -->
<div class="wui-card" style="width:100%">
  <div class="wui-card-body">
    <div class="wui-card-fields cols-4">
      <div class="wui-card-field"><span class="wui-card-field-label">Engines:</span> 8</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Ladders:</span> 3</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Medics:</span> 12</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Chiefs:</span> 2</div>
      <div class="wui-card-field span-2"><span class="wui-card-field-label">Staging:</span> Municipal Lot C</div>
      <div class="wui-card-field"><span class="wui-card-field-label">Radio:</span> TAC-3</div>
      <div class="wui-card-field"><span class="wui-card-field-label">ETA:</span> 12m</div>
      <div class="wui-card-field span-full is-stacked"><span class="wui-card-field-label">Notes</span> Four-column grid for dense resource summaries.</div>
    </div>
  </div>
</div>
```

## wui-plane

A flat surface container with border and radius, driven by a local `--_bg` / `--_border` token pair so each color variant is a one-word modifier. Default (no modifier) equals `.color-60`. Neutrals: `color-60`, `color-30`. Semantic tints (`-light` fill + `-muted` border): `primary`, `success`, `warning`, `danger`, `info`, `secondary`.

### Surface neutrals

```html
<!-- Default = color-60 -->
<div class="wui-plane" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">Default / .color-60</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Off-white in light mode, near-black in dark mode.</div>
</div>
<!-- color-30 -->
<div class="wui-plane color-30" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.color-30</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Pure white in light, elevated dark surface in dark.</div>
</div>
```

### Semantic tinted variants

```html
<!-- Primary -->
<div class="wui-plane primary" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.primary</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tinted blue — active operational context.</div>
</div>
<!-- Success -->
<div class="wui-plane success" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.success</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tinted green — resolved, all-clear states.</div>
</div>
<!-- Warning -->
<div class="wui-plane warning" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.warning</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tinted amber — advisories, watch conditions.</div>
</div>
<!-- Danger -->
<div class="wui-plane danger" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.danger</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tinted red — critical alerts, active hazards.</div>
</div>
<!-- Info -->
<div class="wui-plane info" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.info</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tinted cyan — informational callouts.</div>
</div>
<!-- Secondary -->
<div class="wui-plane secondary" style="width:100%">
  <div style="font-weight:600;margin-bottom:var(--space-1)">.secondary</div>
  <div style="font-size:var(--text-sm);color:var(--color-text-secondary)">Tinted slate — muted, supplementary content.</div>
</div>
```

## wui-panel

Framed content shell with header, body, footer, and actions regions. Default is `flex: 0 0 auto` (sizes to content). Add `.is-scrollable` so the panel fills its container and the body scrolls. The header carries a title (`wui-panel-title` with optional leading icon), a subtitle (`wui-panel-sub`), and an actions cluster (`wui-panel-hdr-actions`).

### Header · body · footer · actions

```html
<!-- Full panel -->
<div class="wui-panel" style="width:360px">
  <div class="wui-panel-hdr">
    <div class="wui-panel-title-wrap">
      <div class="wui-panel-title"><span class="material-symbols-outlined">description</span>Incident Details</div>
      <div class="wui-panel-sub">INC-2024-0471</div>
    </div>
    <div class="wui-panel-hdr-actions">
      <button class="wui-action-btn"><span class="material-symbols-outlined">edit</span></button>
      <button class="wui-action-btn"><span class="material-symbols-outlined">more_vert</span></button>
    </div>
  </div>
  <div class="wui-panel-body">
    <p style="margin:0;font-size:var(--text-sm);color:var(--color-text-secondary)">
      Panel body holds arbitrary content: info grids, field rows, tables, or any component.
    </p>
  </div>
  <div class="wui-panel-footer">
    <div class="wui-panel-actions">
      <button class="wui-btn ghost secondary wui-btn-sm">Cancel</button>
      <button class="wui-btn primary wui-btn-sm">Save</button>
    </div>
  </div>
</div>
```

### Scrollable body (is-scrollable)

```html
<!-- is-scrollable: fixed height, body scrolls -->
<div class="wui-panel is-scrollable" style="width:360px;height:180px">
  <div class="wui-panel-hdr">
    <div class="wui-panel-title-wrap">
      <div class="wui-panel-title">Activity Log</div>
      <div class="wui-panel-sub">Body scrolls; header/footer pinned</div>
    </div>
  </div>
  <div class="wui-panel-body">
    <p style="margin:0 0 var(--space-2)">14:32 — Command post established.</p>
    <p style="margin:0 0 var(--space-2)">14:41 — Engine 7 on scene.</p>
    <p style="margin:0 0 var(--space-2)">14:52 — Ladder 4 requested.</p>
    <p style="margin:0 0 var(--space-2)">15:03 — Water supply secured.</p>
    <p style="margin:0 0 var(--space-2)">15:18 — Second alarm struck.</p>
    <p style="margin:0 0 var(--space-2)">15:30 — Overhaul in progress.</p>
    <p style="margin:0">15:47 — Fire under control.</p>
  </div>
  <div class="wui-panel-footer">
    <div class="wui-panel-actions"><button class="wui-btn ghost primary wui-btn-sm">View all</button></div>
  </div>
</div>
```

## wui-embed

Shell for embedding iframes, maps, or external content with a consistent header/body/footer. The outer `wui-embed-wrap` supplies the border and clipping; the inner `wui-embed` is the flex column. The body scrolls by default; add `.no-scroll` to let it grow. Wrap padded body content in `wui-embed-body-wrap`.

```html
<!-- Embed: header (title row + sub + actions), body, footer -->
<div class="wui-embed-wrap" style="width:100%;max-width:480px;height:220px">
  <div class="wui-embed">
    <div class="wui-embed-hdr">
      <div class="wui-embed-hdr-title-row">
        <div>
          <div class="wui-embed-hdr-title"><span class="material-symbols-outlined">map</span>Situational Map</div>
          <div class="wui-embed-hdr-sub">Live feed · GIS layer</div>
        </div>
      </div>
      <div class="wui-embed-hdr-actions">
        <button class="wui-action-btn" title="Refresh"><span class="material-symbols-outlined">refresh</span></button>
        <button class="wui-action-btn" title="Full screen"><span class="material-symbols-outlined">open_in_full</span></button>
      </div>
    </div>
    <div class="wui-embed-body" style="display:flex;align-items:center;justify-content:center;background:var(--color-60);color:var(--color-text-secondary);font-size:var(--text-sm)">
      [ iframe / map canvas ]
    </div>
    <div class="wui-embed-footer" style="font-size:var(--text-xs);color:var(--color-text-secondary)">
      Last updated: 15:47
    </div>
  </div>
</div>
```

## wui-person

Compact identity block: avatar + stacked info (optional label, name, sub). Size axis: default (md) or `.sm`. Parts: `wui-person-info`, `wui-person-label`, `wui-person-name`, `wui-person-sub`.

```html
<!-- Default (md) with label + name + sub -->
<div class="wui-person">
  <div class="wui-avatar">JD</div>
  <div class="wui-person-info">
    <div class="wui-person-label">Reported by</div>
    <div class="wui-person-name">John Davis</div>
    <div class="wui-person-sub">EOC Director</div>
  </div>
</div>
<!-- Small (.sm) -->
<div class="wui-person sm">
  <div class="wui-avatar wui-avatar-sm">AK</div>
  <div class="wui-person-info">
    <div class="wui-person-name">Alice Kim</div>
    <div class="wui-person-sub">Logistics Lead</div>
  </div>
</div>
```

## wui-person-card

Bordered contact card: circular icon avatar + body with name, a dot-separated meta row (`wui-person-card-role` / `wui-person-card-unit`), a highlighted contact line, and an optional date. Meta children auto-insert a bullet separator between items.

```html
<!-- Full person card: avatar + name + meta + contact + date -->
<div class="wui-person-card" style="width:320px">
  <div class="wui-person-card-avatar"><span class="material-symbols-outlined">person</span></div>
  <div class="wui-person-card-body">
    <div class="wui-person-card-name">Maria Rodriguez</div>
    <div class="wui-person-card-meta">
      <span class="wui-person-card-role">Fire Chief</span>
      <span class="wui-person-card-unit">Station 3</span>
    </div>
    <div class="wui-person-card-contact">m.rodriguez@eoc.gov</div>
    <div class="wui-person-card-date">On duty since 06:00</div>
  </div>
</div>
<!-- Minimal: avatar + name + single meta -->
<div class="wui-person-card" style="width:320px">
  <div class="wui-person-card-avatar"><span class="material-symbols-outlined">engineering</span></div>
  <div class="wui-person-card-body">
    <div class="wui-person-card-name">Samuel Osei</div>
    <div class="wui-person-card-meta">
      <span class="wui-person-card-role">Logistics Section Chief</span>
    </div>
  </div>
</div>
```

## wui-info-grid

Read-only label/value grid for detail views and panels. Default is 2 columns; column modifiers: `.col1`, `.col3`, `.col4` (all collapse to one column under 576px). Item modifiers: `.span-all`, `.spaced`. Value modifiers: `.muted`, `.prose`, `.is-empty` (renders a "No data available" placeholder).

### Default 2-column + item/value modifiers

```html
<div class="wui-info-grid" style="width:100%">
  <!-- Standard item -->
  <div class="wui-info-item">
    <div class="wui-info-label"><span class="material-symbols-outlined">local_fire_department</span>Incident Type</div>
    <div class="wui-info-value">Structure Fire</div>
  </div>
  <!-- Value with a badge -->
  <div class="wui-info-item">
    <div class="wui-info-label">Priority</div>
    <div class="wui-info-value"><span class="wui-badge danger">Critical</span></div>
  </div>
  <!-- Standard -->
  <div class="wui-info-item">
    <div class="wui-info-label">Reported At</div>
    <div class="wui-info-value">2024-01-15 · 14:32</div>
  </div>
  <!-- Standard -->
  <div class="wui-info-item">
    <div class="wui-info-label">Assigned Units</div>
    <div class="wui-info-value">Engine 7, Ladder 4</div>
  </div>
  <!-- span-all + prose value -->
  <div class="wui-info-item span-all">
    <div class="wui-info-label">Description</div>
    <div class="wui-info-value prose">Command post established at the north entrance gate. Multiple agencies responding under unified command.</div>
  </div>
  <!-- muted value -->
  <div class="wui-info-item">
    <div class="wui-info-label">Status</div>
    <div class="wui-info-value muted">Under review</div>
  </div>
  <!-- is-empty value (auto placeholder) -->
  <div class="wui-info-item">
    <div class="wui-info-label">Closed At</div>
    <div class="wui-info-value is-empty"></div>
  </div>
</div>
```

### Column variants — col1 / col3 / col4

```html
<!-- col1 -->
<div class="wui-info-grid col1" style="width:100%">
  <div class="wui-info-item"><div class="wui-info-label">.col1 — single column</div><div class="wui-info-value">Full-width stacked pairs</div></div>
  <div class="wui-info-item"><div class="wui-info-label">Location</div><div class="wui-info-value">North Warehouse, Bay 3</div></div>
</div>
<!-- col3 -->
<div class="wui-info-grid col3" style="width:100%">
  <div class="wui-info-item"><div class="wui-info-label">.col3</div><div class="wui-info-value">Three across</div></div>
  <div class="wui-info-item"><div class="wui-info-label">Sector</div><div class="wui-info-value">North</div></div>
  <div class="wui-info-item"><div class="wui-info-label">Radio</div><div class="wui-info-value">TAC-3</div></div>
</div>
<!-- col4 + spaced item -->
<div class="wui-info-grid col4" style="width:100%">
  <div class="wui-info-item"><div class="wui-info-label">.col4</div><div class="wui-info-value">Four across</div></div>
  <div class="wui-info-item"><div class="wui-info-label">Engines</div><div class="wui-info-value">8</div></div>
  <div class="wui-info-item"><div class="wui-info-label">Ladders</div><div class="wui-info-value">3</div></div>
  <div class="wui-info-item spaced"><div class="wui-info-label">.spaced</div><div class="wui-info-value">Extra bottom margin</div></div>
</div>
```

## wui-widget

Dashboard widget shell for GridStack layouts. The header (`wui-widget-hdr`) and drag handle (`wui-widget-drag`) are hidden until the grid container enters edit mode (board CSS toggles them); `wui-widget-body` flexes to fill. The demo below forces both visible via inline overrides so you can see every part.

```html
<!-- Widget: header forced visible + drag handle + title + body -->
<div class="wui-widget" style="width:100%;max-width:420px;border:1px solid var(--color-border)">
  <div class="wui-widget-hdr" style="display:flex">
    <div class="wui-widget-drag" style="opacity:1"><span class="material-symbols-outlined">drag_indicator</span></div>
    <span class="wui-widget-title">Active Incidents</span>
  </div>
  <div class="wui-widget-body" style="padding:var(--space-4)">
    <div style="font-size:var(--text-2xl);font-weight:var(--font-bold)">27</div>
    <div style="font-size:var(--text-xs);color:var(--color-text-secondary)">Widget body content flexes to fill.</div>
  </div>
</div>
```

## wui-update-entry

A single timestamped row in an update feed: a description (`wui-update-desc`) over muted meta (`wui-update-meta`). Stack several inside a panel body to form an activity stream.

```html
<!-- Entry -->
<div class="wui-update-entry">
  <div class="wui-update-desc">Backup generators brought online for Tower B.</div>
  <div class="wui-update-meta">J. Rivera · 12 min ago</div>
</div>
<!-- Entry -->
<div class="wui-update-entry">
  <div class="wui-update-desc">Incident escalated to Tier 3.</div>
  <div class="wui-update-meta">Watch Officer · 41 min ago</div>
</div>
```

## wui-collapsible

Boxed minimal accordion. Container carries `data-wui-collapsible`; the header button carries `data-wui-collapse`. weoc-ui.js toggles `.is-open` on click (delegated document handler, loaded in head). Start open by adding `.is-open`. The body animates via a `0fr → 1fr` grid row, so keep padding on your own content, not on `wui-collapsible-content`.

> All three collapsibles share ONE declarative mechanism from weoc-ui.js (loaded in `<head>`): a document-delegated click on `[data-wui-collapse]` toggles `.is-open` on the nearest `[data-wui-collapsible]`. No page init, no `data-wui-demo-run`. Body = `.wui-collapsible-body` > `.wui-collapsible-content`. Chevron = `.wui-collapsible-chevron` (rotates via `[data-wui-collapsible].is-open`).

```html
<!-- Open by default (.is-open) -->
<div class="wui-collapsible is-open" data-wui-collapsible style="width:100%">
  <button class="wui-collapsible-header" data-wui-collapse>
    <span class="wui-collapsible-title">
      <span class="material-symbols-outlined">inventory_2</span> Activated Resources
      <span class="wui-badge primary">12</span>
    </span>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Starts open. Click the header to collapse.</div>
    </div>
  </div>
</div>
<!-- Collapsed by default -->
<div class="wui-collapsible" data-wui-collapsible style="width:100%">
  <button class="wui-collapsible-header" data-wui-collapse>
    <span class="wui-collapsible-title">Shelters</span>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Collapsed by default. Click to open.</div>
    </div>
  </div>
</div>
```

## wui-section-collapse

Ghost inline section header — no box, blends into the page. Good for grouping fields inside a panel or card body. The header (`wui-section-collapse-hdr`) is a full-width labeled separator; its bottom border fades when open. Same `data-wui-collapsible` / `data-wui-collapse` mechanism.

```html
<!-- Wrapped in a plane so the ghost header has a surface to sit on -->
<div class="wui-plane color-30" style="width:100%">
  <!-- Open by default -->
  <div class="wui-section-collapse is-open" data-wui-collapsible>
    <button class="wui-section-collapse-hdr" data-wui-collapse>
      <span class="wui-section-collapse-title">Location Details</span>
      <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
    </button>
    <div class="wui-collapsible-body">
      <div class="wui-collapsible-content">
        <div style="padding:var(--space-3) 0;font-size:var(--text-sm);color:var(--color-text-secondary)">North Warehouse, Bay 3 · Grid 12-B.</div>
      </div>
    </div>
  </div>
  <!-- Collapsed by default -->
  <div class="wui-section-collapse" data-wui-collapsible>
    <button class="wui-section-collapse-hdr" data-wui-collapse>
      <span class="wui-section-collapse-title">Contacts</span>
      <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
    </button>
    <div class="wui-collapsible-body">
      <div class="wui-collapsible-content">
        <div style="padding:var(--space-3) 0;font-size:var(--text-sm);color:var(--color-text-secondary)">Primary: J. Davis · Secondary: A. Kim.</div>
      </div>
    </div>
  </div>
</div>
```

## wui-collapse-panel

Card-shaped collapsible with an optional top accent stripe via color variant: `.primary`, `.success`, `.warning`, `.danger`, `.secondary`. Header holds an optional leading icon (`wui-collapse-panel-icon`, tinted by variant) plus a stacked title/subtitle (`wui-collapse-panel-titles` → `-title` / `-sub`). Same `data-wui-collapsible` / `data-wui-collapse` mechanism.

### No accent

```html
<!-- Plain, open by default -->
<div class="wui-collapse-panel is-open" data-wui-collapsible style="width:100%">
  <button class="wui-collapse-panel-hdr" data-wui-collapse>
    <div class="wui-collapse-panel-titles">
      <div class="wui-collapse-panel-title">Situation Report</div>
      <div class="wui-collapse-panel-sub">Last updated 14:32</div>
    </div>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Fire contained to the original structure. No injuries reported.</div>
    </div>
  </div>
</div>
```

### Color variants + leading icon

```html
<!-- Primary (open) -->
<div class="wui-collapse-panel primary is-open" data-wui-collapsible style="width:100%">
  <button class="wui-collapse-panel-hdr" data-wui-collapse>
    <span class="wui-collapse-panel-icon material-symbols-outlined">people</span>
    <div class="wui-collapse-panel-titles">
      <div class="wui-collapse-panel-title">Resources</div>
      <div class="wui-collapse-panel-sub">12 activated</div>
    </div>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Engine 7, Ladder 4, Rescue 1, Medic 12 …</div>
    </div>
  </div>
</div>
<!-- Success -->
<div class="wui-collapse-panel success" data-wui-collapsible style="width:100%">
  <button class="wui-collapse-panel-hdr" data-wui-collapse>
    <span class="wui-collapse-panel-icon material-symbols-outlined">check_circle</span>
    <div class="wui-collapse-panel-titles">
      <div class="wui-collapse-panel-title">Resolved Actions</div>
      <div class="wui-collapse-panel-sub">8 of 8 complete</div>
    </div>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">All assigned tasks closed out.</div>
    </div>
  </div>
</div>
<!-- Warning -->
<div class="wui-collapse-panel warning" data-wui-collapsible style="width:100%">
  <button class="wui-collapse-panel-hdr" data-wui-collapse>
    <span class="wui-collapse-panel-icon material-symbols-outlined">warning</span>
    <div class="wui-collapse-panel-titles">
      <div class="wui-collapse-panel-title">Open Actions</div>
      <div class="wui-collapse-panel-sub">3 pending</div>
    </div>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Awaiting resource assignment.</div>
    </div>
  </div>
</div>
<!-- Danger -->
<div class="wui-collapse-panel danger" data-wui-collapsible style="width:100%">
  <button class="wui-collapse-panel-hdr" data-wui-collapse>
    <span class="wui-collapse-panel-icon material-symbols-outlined">priority_high</span>
    <div class="wui-collapse-panel-titles">
      <div class="wui-collapse-panel-title">Critical Issues</div>
      <div class="wui-collapse-panel-sub">2 unacknowledged</div>
    </div>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Water supply pressure below threshold.</div>
    </div>
  </div>
</div>
<!-- Secondary -->
<div class="wui-collapse-panel secondary" data-wui-collapsible style="width:100%">
  <button class="wui-collapse-panel-hdr" data-wui-collapse>
    <span class="wui-collapse-panel-icon material-symbols-outlined">draft</span>
    <div class="wui-collapse-panel-titles">
      <div class="wui-collapse-panel-title">Draft Notes</div>
      <div class="wui-collapse-panel-sub">Not yet published</div>
    </div>
    <span class="material-symbols-outlined wui-collapsible-chevron">expand_more</span>
  </button>
  <div class="wui-collapsible-body">
    <div class="wui-collapsible-content">
      <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text-secondary)">Internal working notes.</div>
    </div>
  </div>
</div>
```
