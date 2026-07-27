# Tier Colors

[← Index](README.md)

Agency activation-tier variants (`tier-1` … `tier-4`) layered onto components owned elsewhere: `wui-badge`, `wui-chip`, `wui-status-dot`, `wui-icon-bubble`, `wui-callout`, `wui-banner`, `wui-card`, and `wui-lvl`. Tier 1 = standby (green), Tier 2 = partial (amber), Tier 3 = full (red-orange), Tier 4 = MACC (critical red). Add the tier class alongside the component's own classes.

## wui-badge

Tier variants for badges. Soft (default) uses the tier tint; add `solid` for a filled high-visibility pill; add `animate` for a pulsing live-activation badge. Owned by `weoc-labels.css`; tiers added by `weoc-tier-colors.css`.

### Soft (default) — tier-1 → tier-4

```html
<!-- tier-1 -->
<span class="wui-badge tier-1">Tier 1 · Standby</span>
<!-- tier-2 -->
<span class="wui-badge tier-2">Tier 2 · Partial</span>
<!-- tier-3 -->
<span class="wui-badge tier-3">Tier 3 · Full</span>
<!-- tier-4 -->
<span class="wui-badge tier-4">Tier 4 · MACC</span>
```

### Solid — tier-1 → tier-4

```html
<!-- tier-1 -->
<span class="wui-badge solid tier-1">Tier 1 · Standby</span>
<!-- tier-2 -->
<span class="wui-badge solid tier-2">Tier 2 · Partial</span>
<!-- tier-3 -->
<span class="wui-badge solid tier-3">Tier 3 · Full</span>
<!-- tier-4 -->
<span class="wui-badge solid tier-4">Tier 4 · MACC</span>
```

### Animated (pulsing live state) — tier-1 → tier-4

```html
<!-- tier-1 -->
<span class="wui-badge tier-1 animate">Tier 1 · Live</span>
<!-- tier-2 -->
<span class="wui-badge tier-2 animate">Tier 2 · Live</span>
<!-- tier-3 -->
<span class="wui-badge tier-3 animate">Tier 3 · Live</span>
<!-- tier-4 -->
<span class="wui-badge tier-4 animate">Tier 4 · Live</span>
```

## wui-chip

Tier variants for chips. Each tier drives the chip's `--wui-chip-bg`, `--wui-chip-border`, and `--wui-chip-text` custom properties, so the tint, border, and text color all shift together. Owned by `weoc-labels.css`.

### tier-1 → tier-4

```html
<!-- tier-1 -->
<span class="wui-chip tier-1">Tier 1 · Standby</span>
<!-- tier-2 -->
<span class="wui-chip tier-2">Tier 2 · Partial</span>
<!-- tier-3 -->
<span class="wui-chip tier-3">Tier 3 · Full</span>
<!-- tier-4 -->
<span class="wui-chip tier-4">Tier 4 · MACC</span>
```

## wui-status-dot

Tier variants for status dots. The base tier class fills the dot with the tier color; add `live` for a tier-tinted pulsing ring. Owned by `weoc-indicators.css`.

### Solid — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-status-dot tier-1"></div>
<!-- tier-2 -->
<div class="wui-status-dot tier-2"></div>
<!-- tier-3 -->
<div class="wui-status-dot tier-3"></div>
<!-- tier-4 -->
<div class="wui-status-dot tier-4"></div>
```

### Live (pulsing) — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-status-dot live tier-1"></div>
<!-- tier-2 -->
<div class="wui-status-dot live tier-2"></div>
<!-- tier-3 -->
<div class="wui-status-dot live tier-3"></div>
<!-- tier-4 -->
<div class="wui-status-dot live tier-4"></div>
```

## wui-icon-bubble

Tier variants for icon bubbles across all three fills: soft (default tint), `solid` (filled), and `bordered` (tier-colored ring). Owned by `weoc-indicators.css`.

### Soft (default) — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-icon-bubble tier-1"><span class="material-symbols-outlined">shield</span></div>
<!-- tier-2 -->
<div class="wui-icon-bubble tier-2"><span class="material-symbols-outlined">warning</span></div>
<!-- tier-3 -->
<div class="wui-icon-bubble tier-3"><span class="material-symbols-outlined">local_fire_department</span></div>
<!-- tier-4 -->
<div class="wui-icon-bubble tier-4"><span class="material-symbols-outlined">crisis_alert</span></div>
```

### Solid — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-icon-bubble solid tier-1"><span class="material-symbols-outlined">shield</span></div>
<!-- tier-2 -->
<div class="wui-icon-bubble solid tier-2"><span class="material-symbols-outlined">warning</span></div>
<!-- tier-3 -->
<div class="wui-icon-bubble solid tier-3"><span class="material-symbols-outlined">local_fire_department</span></div>
<!-- tier-4 -->
<div class="wui-icon-bubble solid tier-4"><span class="material-symbols-outlined">crisis_alert</span></div>
```

### Bordered — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-icon-bubble bordered tier-1"><span class="material-symbols-outlined">shield</span></div>
<!-- tier-2 -->
<div class="wui-icon-bubble bordered tier-2"><span class="material-symbols-outlined">warning</span></div>
<!-- tier-3 -->
<div class="wui-icon-bubble bordered tier-3"><span class="material-symbols-outlined">local_fire_department</span></div>
<!-- tier-4 -->
<div class="wui-icon-bubble bordered tier-4"><span class="material-symbols-outlined">crisis_alert</span></div>
```

## wui-callout

Tier variants for callouts. Each tier sets the tint background, border color, and the internal `--_accent` (icon + title color). Structure: leading icon, then a `wui-callout-body` with a `wui-callout-title` and body text. Owned by `weoc-feedback.css`.

### tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-callout tier-1">
  <span class="material-symbols-outlined">shield</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Tier 1 — Standby</div>
    Normal operations. Monitoring only, no activation required.
  </div>
</div>
<!-- tier-2 -->
<div class="wui-callout tier-2">
  <span class="material-symbols-outlined">warning</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Tier 2 — Partial Activation</div>
    Selected functions activated. Duty officers on standby for escalation.
  </div>
</div>
<!-- tier-3 -->
<div class="wui-callout tier-3">
  <span class="material-symbols-outlined">local_fire_department</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Tier 3 — Full Activation</div>
    EOC fully staffed. All command functions operational.
  </div>
</div>
<!-- tier-4 -->
<div class="wui-callout tier-4">
  <span class="material-symbols-outlined">crisis_alert</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Tier 4 — MACC Activated</div>
    Multi-Agency Command Centre engaged. All available resources mobilized.
  </div>
</div>
```

## wui-banner

Tier variants for banners. Each tier sets the tint background, a solid tier-colored border, and the internal `--_accent`. Structure: a `wui-banner-body` holding a leading icon and the `wui-banner-text` (with optional `wui-banner-sub`). Owned by `weoc-feedback.css`.

### tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-banner tier-1">
  <div class="wui-banner-body">
    <span class="material-symbols-outlined">shield</span>
    <div>
      <div class="wui-banner-text">Tier 1 — Standby / Normal Ops</div>
      <div class="wui-banner-sub">Routine monitoring in effect. No activation is currently required.</div>
    </div>
  </div>
</div>
<!-- tier-2 -->
<div class="wui-banner tier-2">
  <div class="wui-banner-body">
    <span class="material-symbols-outlined">warning</span>
    <div>
      <div class="wui-banner-text">Tier 2 — Partial Activation</div>
      <div class="wui-banner-sub">Selected EOC functions have been activated. Duty officers on standby.</div>
    </div>
  </div>
</div>
<!-- tier-3 -->
<div class="wui-banner tier-3">
  <div class="wui-banner-body">
    <span class="material-symbols-outlined">local_fire_department</span>
    <div>
      <div class="wui-banner-text">Tier 3 — Full Activation</div>
      <div class="wui-banner-sub">EOC fully staffed. All command and coordination functions operational.</div>
    </div>
  </div>
</div>
<!-- tier-4 -->
<div class="wui-banner tier-4">
  <div class="wui-banner-body">
    <span class="material-symbols-outlined">crisis_alert</span>
    <div>
      <div class="wui-banner-text">Tier 4 — MACC Activated</div>
      <div class="wui-banner-sub">Multi-Agency Command Centre engaged. All available resources mobilized.</div>
    </div>
  </div>
</div>
```

## wui-card

Tier variants for cards, on both the accent bar (`has-accent` + `tier-N`, tints the top edge via `::before`) and the side column (`has-side` with a `wui-card-side` + `tier-N`). Owned by `weoc-containers.css`.

### Accent bar (.has-accent) — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-card has-accent tier-1" style="width:180px"><div class="wui-card-body"><div class="wui-card-label">Tier 1</div><div class="wui-card-sub">Standby</div></div></div>
<!-- tier-2 -->
<div class="wui-card has-accent tier-2" style="width:180px"><div class="wui-card-body"><div class="wui-card-label">Tier 2</div><div class="wui-card-sub">Partial</div></div></div>
<!-- tier-3 -->
<div class="wui-card has-accent tier-3" style="width:180px"><div class="wui-card-body"><div class="wui-card-label">Tier 3</div><div class="wui-card-sub">Full</div></div></div>
<!-- tier-4 -->
<div class="wui-card has-accent tier-4" style="width:180px"><div class="wui-card-body"><div class="wui-card-label">Tier 4</div><div class="wui-card-sub">MACC</div></div></div>
```

### Side column (.has-side .wui-card-side) — tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-card has-side" style="max-width:400px">
  <div class="wui-card-side tier-1"></div>
  <div class="wui-card-body"><div class="wui-card-label">Tier 1 — Standby</div><div class="wui-card-sub">Normal operations, monitoring only.</div></div>
</div>
<!-- tier-2 -->
<div class="wui-card has-side" style="max-width:400px">
  <div class="wui-card-side tier-2"></div>
  <div class="wui-card-body"><div class="wui-card-label">Tier 2 — Partial</div><div class="wui-card-sub">Selected functions activated.</div></div>
</div>
<!-- tier-3 -->
<div class="wui-card has-side" style="max-width:400px">
  <div class="wui-card-side tier-3"></div>
  <div class="wui-card-body"><div class="wui-card-label">Tier 3 — Full</div><div class="wui-card-sub">EOC fully staffed and operational.</div></div>
</div>
<!-- tier-4 -->
<div class="wui-card has-side" style="max-width:400px">
  <div class="wui-card-side tier-4"></div>
  <div class="wui-card-body"><div class="wui-card-label">Tier 4 — MACC</div><div class="wui-card-sub">Multi-Agency Command Centre engaged.</div></div>
</div>
```

## wui-lvl

Tier variants for the level bar. The tier class colors every lit segment (`wui-lvl-seg.on`) with the tier glow, animates the current segment (`.on.current`), and tints the `wui-lvl-count`. Owned by `weoc-indicators.css`. Here each level is shown filled to match its tier number.

### tier-1 → tier-4

```html
<!-- tier-1 -->
<div class="wui-lvl tier-1">
  <div class="wui-lvl-inner">
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on current"></div></div>
    <div class="wui-lvl-bar"></div>
    <div class="wui-lvl-bar"></div>
    <div class="wui-lvl-bar"></div>
  </div>
  <div class="wui-lvl-count">1</div>
</div>
<!-- tier-2 -->
<div class="wui-lvl tier-2">
  <div class="wui-lvl-inner">
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on"></div></div>
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on current"></div></div>
    <div class="wui-lvl-bar"></div>
    <div class="wui-lvl-bar"></div>
  </div>
  <div class="wui-lvl-count">2</div>
</div>
<!-- tier-3 -->
<div class="wui-lvl tier-3">
  <div class="wui-lvl-inner">
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on"></div></div>
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on"></div></div>
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on current"></div></div>
    <div class="wui-lvl-bar"></div>
  </div>
  <div class="wui-lvl-count">3</div>
</div>
<!-- tier-4 -->
<div class="wui-lvl tier-4">
  <div class="wui-lvl-inner">
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on"></div></div>
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on"></div></div>
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on"></div></div>
    <div class="wui-lvl-bar"><div class="wui-lvl-seg on current"></div></div>
  </div>
  <div class="wui-lvl-count">4</div>
</div>
```
