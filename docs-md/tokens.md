# Design Tokens

[← Index](README.md)

Every visual value is a CSS custom property defined in `agency-theme.css`. Components consume tokens, never hardcoded values, so overriding one token in that file rethemes the whole library. Each group below is a live sample; the auto Markup box shows the exact `var(--token)` usage.

## Brand Palette

The surface and accent triad plus text/border tokens. `--color-10` is the primary accent; `--color-30`/`--color-60` are the surface and background. Each carries `-light`/`-muted`/`-glow` sub-tokens for tints and focus rings.

### Surface & accent

| Token | Swatch name |
|---|---|
| `--color-10` | Primary accent |
| `--color-30` | Surface |
| `--color-60` | Background |
| `--color-on-accent` | On accent (always white) |

```html
<!-- --color-10 (primary accent) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-10)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Primary accent</span><span class="docs-swatch-var">--color-10</span></div></div>
<!-- --color-30 (surface) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-30)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Surface</span><span class="docs-swatch-var">--color-30</span></div></div>
<!-- --color-60 (background) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-60)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Background</span><span class="docs-swatch-var">--color-60</span></div></div>
<!-- --color-on-accent (always white) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-on-accent)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">On accent</span><span class="docs-swatch-var">--color-on-accent</span></div></div>
```

### Primary sub-tokens (--color-10-*)

| Token | Usage |
|---|---|
| `--color-10-light` | Soft tint |
| `--color-10-muted` | Subtle |
| `--color-10-glow` | Focus ring |

```html
<!-- --color-10-light (soft tint) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-10-light)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Light tint</span><span class="docs-swatch-var">--color-10-light</span></div></div>
<!-- --color-10-muted (subtle) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-10-muted)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Muted</span><span class="docs-swatch-var">--color-10-muted</span></div></div>
<!-- --color-10-glow (focus ring) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-10-glow)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Glow</span><span class="docs-swatch-var">--color-10-glow</span></div></div>
```

### Text & border

| Token | Swatch name |
|---|---|
| `--color-text-primary` | Text primary |
| `--color-text-ui` | Text UI |
| `--color-text-secondary` | Text secondary |
| `--color-border` | Border |

```html
<!-- --color-text-primary -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-text-primary)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Text primary</span><span class="docs-swatch-var">--color-text-primary</span></div></div>
<!-- --color-text-ui -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-text-ui)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Text UI</span><span class="docs-swatch-var">--color-text-ui</span></div></div>
<!-- --color-text-secondary -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-text-secondary)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Text secondary</span><span class="docs-swatch-var">--color-text-secondary</span></div></div>
<!-- --color-border -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-border)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Border</span><span class="docs-swatch-var">--color-border</span></div></div>
```

> **--color-on-accent is always white:** It does NOT follow `--color-30` in dark mode. Use it for text/icons on solid accent fills (primary, danger, success, info).

## Semantic Colors

Six intent colors, each with a solid value plus `-glow`, `-light`, `-muted`, and `-text` sub-tokens. All values re-resolve automatically in dark mode.

### Solid values

| Token | Intent |
|---|---|
| `--color-success` | Success |
| `--color-warning` | Warning |
| `--color-danger` | Danger |
| `--color-info` | Info |
| `--color-secondary` | Secondary |
| `--color-primary` | Primary (alias of `--color-10`) |

```html
<!-- --color-success -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-success)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Success</span><span class="docs-swatch-var">--color-success</span></div></div>
<!-- --color-warning -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-warning)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Warning</span><span class="docs-swatch-var">--color-warning</span></div></div>
<!-- --color-danger -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-danger)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Danger</span><span class="docs-swatch-var">--color-danger</span></div></div>
<!-- --color-info -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-info)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Info</span><span class="docs-swatch-var">--color-info</span></div></div>
<!-- --color-secondary -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-secondary)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Secondary</span><span class="docs-swatch-var">--color-secondary</span></div></div>
<!-- --color-primary (alias of --color-10) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-primary)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Primary</span><span class="docs-swatch-var">--color-primary</span></div></div>
```

### Sub-tokens — success example (-glow / -light / -muted / -text)

| Token | Sub-token |
|---|---|
| `--color-success-glow` | Glow |
| `--color-success-light` | Light |
| `--color-success-muted` | Muted |
| `--color-success-text` | Text |

```html
<!-- --color-success-glow -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-success-glow)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Glow</span><span class="docs-swatch-var">--color-success-glow</span></div></div>
<!-- --color-success-light -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-success-light)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Light</span><span class="docs-swatch-var">--color-success-light</span></div></div>
<!-- --color-success-muted -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-success-muted)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Muted</span><span class="docs-swatch-var">--color-success-muted</span></div></div>
<!-- --color-success-text -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-success-text)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Text</span><span class="docs-swatch-var">--color-success-text</span></div></div>
```

Warning, danger, info and primary follow the identical pattern: `--color-{intent}-glow`, `-light`, `-muted`, `-text`. Secondary omits `-text` (uses `--color-text-secondary` instead).

## EOC Tier Colors

Events-Reporting activation tiers. Each tier follows the same 5-token pattern as semantic colors: `--tier-N-color`, `-glow`, `-light`, `-muted`, `-text`.

### Tier solids

| Token | Tier |
|---|---|
| `--tier-1-color` | Tier 1 — Normal |
| `--tier-2-color` | Tier 2 — Elevated |
| `--tier-3-color` | Tier 3 — High |
| `--tier-4-color` | Tier 4 — Critical |

```html
<!-- --tier-1-color (Normal) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-1-color)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Tier 1 — Normal</span><span class="docs-swatch-var">--tier-1-color</span></div></div>
<!-- --tier-2-color (Elevated) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-2-color)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Tier 2 — Elevated</span><span class="docs-swatch-var">--tier-2-color</span></div></div>
<!-- --tier-3-color (High) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-3-color)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Tier 3 — High</span><span class="docs-swatch-var">--tier-3-color</span></div></div>
<!-- --tier-4-color (Critical) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-4-color)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Tier 4 — Critical</span><span class="docs-swatch-var">--tier-4-color</span></div></div>
```

### Tier 4 sub-tokens (pattern applies to all tiers)

| Token | Sub-token |
|---|---|
| `--tier-4-glow` | Glow |
| `--tier-4-light` | Light |
| `--tier-4-muted` | Muted |
| `--tier-4-text` | Text |

```html
<!-- --tier-4-glow -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-4-glow)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Glow</span><span class="docs-swatch-var">--tier-4-glow</span></div></div>
<!-- --tier-4-light -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-4-light)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Light</span><span class="docs-swatch-var">--tier-4-light</span></div></div>
<!-- --tier-4-muted -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-4-muted)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Muted</span><span class="docs-swatch-var">--tier-4-muted</span></div></div>
<!-- --tier-4-text -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--tier-4-text)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Text</span><span class="docs-swatch-var">--tier-4-text</span></div></div>
```

## Tier Color Variants

Agency activation-tier variants (`tier-1` … `tier-4`) layered onto components owned elsewhere: `wui-badge`, `wui-chip`, `wui-status-dot`, `wui-icon-bubble`, `wui-callout`, `wui-banner`, `wui-card`, and `wui-lvl`. Tier 1 = standby (green), Tier 2 = partial (amber), Tier 3 = full (red-orange), Tier 4 = MACC (critical red). Add the tier class alongside the component's own classes.

### wui-badge

Tier variants for badges. Soft (default) uses the tier tint; add `solid` for a filled high-visibility pill; add `animate` for a pulsing live-activation badge. Owned by `weoc-labels.css`; tiers added by `weoc-tier-colors.css`.

#### Soft (default) — tier-1 → tier-4

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

#### Solid — tier-1 → tier-4

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

#### Animated (pulsing live state) — tier-1 → tier-4

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

### wui-chip

Tier variants for chips. Each tier drives the chip's `--wui-chip-bg`, `--wui-chip-border`, and `--wui-chip-text` custom properties, so the tint, border, and text color all shift together. Owned by `weoc-labels.css`.

#### tier-1 → tier-4

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

### wui-status-dot

Tier variants for status dots. The base tier class fills the dot with the tier color; add `live` for a tier-tinted pulsing ring. Owned by `weoc-indicators.css`.

#### Solid — tier-1 → tier-4

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

#### Live (pulsing) — tier-1 → tier-4

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

### wui-icon-bubble

Tier variants for icon bubbles across all three fills: soft (default tint), `solid` (filled), and `bordered` (tier-colored ring). Owned by `weoc-indicators.css`.

#### Soft (default) — tier-1 → tier-4

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

#### Solid — tier-1 → tier-4

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

#### Bordered — tier-1 → tier-4

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

### wui-callout

Tier variants for callouts. Each tier sets the tint background, border color, and the internal `--_accent` (icon + title color). Structure: leading icon, then a `wui-callout-body` with a `wui-callout-title` and body text. Owned by `weoc-feedback.css`.

#### tier-1 → tier-4

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

### wui-banner

Tier variants for banners. Each tier sets the tint background, a solid tier-colored border, and the internal `--_accent`. Structure: a `wui-banner-body` holding a leading icon and the `wui-banner-text` (with optional `wui-banner-sub`). Owned by `weoc-feedback.css`.

#### tier-1 → tier-4

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

### wui-card

Tier variants for cards, on both the accent bar (`has-accent` + `tier-N`, tints the top edge via `::before`) and the side column (`has-side` with a `wui-card-side` + `tier-N`). Owned by `weoc-containers.css`.

#### Accent bar (.has-accent) — tier-1 → tier-4

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

#### Side column (.has-side .wui-card-side) — tier-1 → tier-4

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

### wui-lvl

Tier variants for the level bar. The tier class colors every lit segment (`wui-lvl-seg.on`) with the tier glow, animates the current segment (`.on.current`), and tints the `wui-lvl-count`. Owned by `weoc-indicators.css`. Here each level is shown filled to match its tier number.

#### tier-1 → tier-4

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

## Surface & Widget Tokens

Semantic surface aliases used by page chrome, widgets and edit-mode banners. They resolve to the brand palette so a single retheme cascades everywhere.

### Surfaces

| Token | Swatch name |
|---|---|
| `--color-bg` | Page bg |
| `--color-surface` | Surface (cards / cells) |
| `--widget-bg` | Widget bg |
| `--widget-header-bg` | Widget header |

```html
<!-- --color-bg (page background) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-bg)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Page bg</span><span class="docs-swatch-var">--color-bg</span></div></div>
<!-- --color-surface (cards / cells) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-surface)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Surface</span><span class="docs-swatch-var">--color-surface</span></div></div>
<!-- --widget-bg -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--widget-bg)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Widget bg</span><span class="docs-swatch-var">--widget-bg</span></div></div>
<!-- --widget-header-bg -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--widget-header-bg)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Widget header</span><span class="docs-swatch-var">--widget-header-bg</span></div></div>
```

### Edit-mode banner

```html
<!-- Banner using --edit-banner-bg / -border / -text -->
<div style="background:var(--edit-banner-bg);border:var(--border-2xs) solid var(--edit-banner-border);color:var(--edit-banner-text);border-radius:var(--border-radius);padding:var(--space-3) var(--space-4);font-weight:var(--font-medium)">Edit mode active — unsaved changes</div>
```

## Spacing Scale

Numeric steps `--space-0` to `--space-12` span 0 to 8rem. Bar width equals the token value so the ramp is literal.

### Numeric scale (--space-0 … --space-12)

| Token | Value |
|---|---|
| `--space-0` | 0 |
| `--space-1` | 0.25rem |
| `--space-2` | 0.5rem |
| `--space-3` | 0.75rem |
| `--space-4` | 1rem |
| `--space-5` | 1.5rem |
| `--space-6` | 2rem |
| `--space-7` | 2.5rem |
| `--space-8` | 3rem |
| `--space-9` | 4rem |
| `--space-10` | 5rem |
| `--space-11` | 6rem |
| `--space-12` | 8rem |

```html
<!-- --space-0 -->
<div class="docs-space-row"><span class="docs-space-label">--space-0</span><div class="docs-space-bar" style="width:var(--space-0)"></div><span class="docs-space-value">0</span></div>
<!-- --space-1 -->
<div class="docs-space-row"><span class="docs-space-label">--space-1</span><div class="docs-space-bar" style="width:var(--space-1)"></div><span class="docs-space-value">0.25rem</span></div>
<!-- --space-2 -->
<div class="docs-space-row"><span class="docs-space-label">--space-2</span><div class="docs-space-bar" style="width:var(--space-2)"></div><span class="docs-space-value">0.5rem</span></div>
<!-- --space-3 -->
<div class="docs-space-row"><span class="docs-space-label">--space-3</span><div class="docs-space-bar" style="width:var(--space-3)"></div><span class="docs-space-value">0.75rem</span></div>
<!-- --space-4 -->
<div class="docs-space-row"><span class="docs-space-label">--space-4</span><div class="docs-space-bar" style="width:var(--space-4)"></div><span class="docs-space-value">1rem</span></div>
<!-- --space-5 -->
<div class="docs-space-row"><span class="docs-space-label">--space-5</span><div class="docs-space-bar" style="width:var(--space-5)"></div><span class="docs-space-value">1.5rem</span></div>
<!-- --space-6 -->
<div class="docs-space-row"><span class="docs-space-label">--space-6</span><div class="docs-space-bar" style="width:var(--space-6)"></div><span class="docs-space-value">2rem</span></div>
<!-- --space-7 -->
<div class="docs-space-row"><span class="docs-space-label">--space-7</span><div class="docs-space-bar" style="width:var(--space-7)"></div><span class="docs-space-value">2.5rem</span></div>
<!-- --space-8 -->
<div class="docs-space-row"><span class="docs-space-label">--space-8</span><div class="docs-space-bar" style="width:var(--space-8)"></div><span class="docs-space-value">3rem</span></div>
<!-- --space-9 -->
<div class="docs-space-row"><span class="docs-space-label">--space-9</span><div class="docs-space-bar" style="width:var(--space-9)"></div><span class="docs-space-value">4rem</span></div>
<!-- --space-10 -->
<div class="docs-space-row"><span class="docs-space-label">--space-10</span><div class="docs-space-bar" style="width:var(--space-10)"></div><span class="docs-space-value">5rem</span></div>
<!-- --space-11 -->
<div class="docs-space-row"><span class="docs-space-label">--space-11</span><div class="docs-space-bar" style="width:var(--space-11)"></div><span class="docs-space-value">6rem</span></div>
<!-- --space-12 -->
<div class="docs-space-row"><span class="docs-space-label">--space-12</span><div class="docs-space-bar" style="width:var(--space-12)"></div><span class="docs-space-value">8rem</span></div>
```

### Semantic aliases

| Token | Aliases | Value |
|---|---|---|
| `--space-xs` | → `--space-1` | 0.25rem |
| `--space-sm` | → `--space-2` | 0.5rem |
| `--space-md` | → `--space-4` | 1rem |
| `--space-lg` | → `--space-6` | 2rem |
| `--space-xl` | → `--space-8` | 3rem |
| `--space-2xl` | → `--space-10` | 5rem |
| `--space-3xl` | → `--space-12` | 8rem |

```html
<!-- --space-xs → --space-1 -->
<div class="docs-space-row"><span class="docs-space-label">--space-xs</span><div class="docs-space-bar" style="width:var(--space-xs)"></div><span class="docs-space-value">0.25rem</span></div>
<!-- --space-sm → --space-2 -->
<div class="docs-space-row"><span class="docs-space-label">--space-sm</span><div class="docs-space-bar" style="width:var(--space-sm)"></div><span class="docs-space-value">0.5rem</span></div>
<!-- --space-md → --space-4 -->
<div class="docs-space-row"><span class="docs-space-label">--space-md</span><div class="docs-space-bar" style="width:var(--space-md)"></div><span class="docs-space-value">1rem</span></div>
<!-- --space-lg → --space-6 -->
<div class="docs-space-row"><span class="docs-space-label">--space-lg</span><div class="docs-space-bar" style="width:var(--space-lg)"></div><span class="docs-space-value">2rem</span></div>
<!-- --space-xl → --space-8 -->
<div class="docs-space-row"><span class="docs-space-label">--space-xl</span><div class="docs-space-bar" style="width:var(--space-xl)"></div><span class="docs-space-value">3rem</span></div>
<!-- --space-2xl → --space-10 -->
<div class="docs-space-row"><span class="docs-space-label">--space-2xl</span><div class="docs-space-bar" style="width:var(--space-2xl)"></div><span class="docs-space-value">5rem</span></div>
<!-- --space-3xl → --space-12 -->
<div class="docs-space-row"><span class="docs-space-label">--space-3xl</span><div class="docs-space-bar" style="width:var(--space-3xl)"></div><span class="docs-space-value">8rem</span></div>
```

## Typography

### Font families (--font-*)

| Token | Family |
|---|---|
| `--font-body` / `--font-cairo` | Default UI + body |
| `--font-display` | Display |
| `--font-serif` | Serif |
| `--font-mono` | Mono |

```html
<!-- --font-body / --font-cairo (default UI + body) -->
<div style="font-family:var(--font-body);font-size:var(--text-lg)">--font-body / --font-cairo — The quick brown fox jumps</div>
<!-- --font-display -->
<div style="font-family:var(--font-display);font-size:var(--text-lg)">--font-display — The quick brown fox jumps</div>
<!-- --font-serif -->
<div style="font-family:var(--font-serif);font-size:var(--text-lg)">--font-serif — The quick brown fox jumps</div>
<!-- --font-mono -->
<div style="font-family:var(--font-mono);font-size:var(--text-lg)">--font-mono — The quick brown fox jumps</div>
```

### Font sizes (--text-2xs … --text-6xl)

| Token | Value | Pixel equivalent |
|---|---|---|
| `--text-2xs` | 0.625rem | 10px |
| `--text-xs` | 0.75rem | 12px |
| `--text-sm` | 0.875rem | 14px |
| `--text-base` | 1rem | 16px |
| `--text-md` | 1.125rem | 18px |
| `--text-lg` | 1.25rem | 20px |
| `--text-xl` | 1.5rem | 24px |
| `--text-2xl` | 1.875rem | 30px |
| `--text-3xl` | 2.25rem | 36px |
| `--text-4xl` | 3rem | 48px |
| `--text-5xl` | 3.75rem | 60px |
| `--text-6xl` | 4.5rem | 72px |

```html
<!-- --text-2xs (10px) -->
<div style="font-size:var(--text-2xs)">--text-2xs · 0.625rem — The quick brown fox</div>
<!-- --text-xs (12px) -->
<div style="font-size:var(--text-xs)">--text-xs · 0.75rem — The quick brown fox</div>
<!-- --text-sm (14px) -->
<div style="font-size:var(--text-sm)">--text-sm · 0.875rem — The quick brown fox</div>
<!-- --text-base (16px) -->
<div style="font-size:var(--text-base)">--text-base · 1rem — The quick brown fox</div>
<!-- --text-md (18px) -->
<div style="font-size:var(--text-md)">--text-md · 1.125rem — The quick brown fox</div>
<!-- --text-lg (20px) -->
<div style="font-size:var(--text-lg)">--text-lg · 1.25rem — The quick brown fox</div>
<!-- --text-xl (24px) -->
<div style="font-size:var(--text-xl)">--text-xl · 1.5rem — The quick brown fox</div>
<!-- --text-2xl (30px) -->
<div style="font-size:var(--text-2xl)">--text-2xl · 1.875rem — Heading</div>
<!-- --text-3xl (36px) -->
<div style="font-size:var(--text-3xl)">--text-3xl · 2.25rem — Heading</div>
<!-- --text-4xl (48px) -->
<div style="font-size:var(--text-4xl)">--text-4xl · 3rem — Hero</div>
<!-- --text-5xl (60px) -->
<div style="font-size:var(--text-5xl)">--text-5xl · 3.75rem — XL</div>
<!-- --text-6xl (72px) -->
<div style="font-size:var(--text-6xl)">--text-6xl · 4.5rem — XL</div>
```

### Font weights (--font-extralight … --font-black)

| Token | Value |
|---|---|
| `--font-extralight` | 200 |
| `--font-light` | 300 |
| `--font-regular` | 400 |
| `--font-medium` | 500 |
| `--font-semibold` | 600 |
| `--font-bold` | 700 |
| `--font-extrabold` | 800 |
| `--font-black` | 900 |

```html
<!-- --font-extralight (200) -->
<div style="font-weight:var(--font-extralight);font-size:var(--text-lg)">--font-extralight · 200 — Extra Light</div>
<!-- --font-light (300) -->
<div style="font-weight:var(--font-light);font-size:var(--text-lg)">--font-light · 300 — Light</div>
<!-- --font-regular (400) -->
<div style="font-weight:var(--font-regular);font-size:var(--text-lg)">--font-regular · 400 — Regular</div>
<!-- --font-medium (500) -->
<div style="font-weight:var(--font-medium);font-size:var(--text-lg)">--font-medium · 500 — Medium</div>
<!-- --font-semibold (600) -->
<div style="font-weight:var(--font-semibold);font-size:var(--text-lg)">--font-semibold · 600 — Semibold</div>
<!-- --font-bold (700) -->
<div style="font-weight:var(--font-bold);font-size:var(--text-lg)">--font-bold · 700 — Bold</div>
<!-- --font-extrabold (800) -->
<div style="font-weight:var(--font-extrabold);font-size:var(--text-lg)">--font-extrabold · 800 — Extra Bold</div>
<!-- --font-black (900) -->
<div style="font-weight:var(--font-black);font-size:var(--text-lg)">--font-black · 900 — Black</div>
```

### Line heights (--leading-none … --leading-loose)

| Token | Value |
|---|---|
| `--leading-none` | 1 |
| `--leading-tight` | 1.25 |
| `--leading-snug` | 1.375 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.625 |
| `--leading-loose` | 2 |

```html
<!-- --leading-none (1) -->
<div style="line-height:var(--leading-none);max-width:32rem">--leading-none · 1 — This paragraph shows the line height so wrapped lines sit at the given multiple of the font size for comparison.</div>
<!-- --leading-tight (1.25) -->
<div style="line-height:var(--leading-tight);max-width:32rem">--leading-tight · 1.25 — This paragraph shows the line height so wrapped lines sit at the given multiple of the font size for comparison.</div>
<!-- --leading-snug (1.375) -->
<div style="line-height:var(--leading-snug);max-width:32rem">--leading-snug · 1.375 — This paragraph shows the line height so wrapped lines sit at the given multiple of the font size for comparison.</div>
<!-- --leading-normal (1.5) -->
<div style="line-height:var(--leading-normal);max-width:32rem">--leading-normal · 1.5 — This paragraph shows the line height so wrapped lines sit at the given multiple of the font size for comparison.</div>
<!-- --leading-relaxed (1.625) -->
<div style="line-height:var(--leading-relaxed);max-width:32rem">--leading-relaxed · 1.625 — This paragraph shows the line height so wrapped lines sit at the given multiple of the font size for comparison.</div>
<!-- --leading-loose (2) -->
<div style="line-height:var(--leading-loose);max-width:32rem">--leading-loose · 2 — This paragraph shows the line height so wrapped lines sit at the given multiple of the font size for comparison.</div>
```

### Letter spacing (--tracking-tight … --tracking-widest)

| Token | Value |
|---|---|
| `--tracking-tight` | -0.025em |
| `--tracking-normal` | 0 |
| `--tracking-wide` | 0.025em |
| `--tracking-wider` | 0.05em |
| `--tracking-widest` | 0.1em |

```html
<!-- --tracking-tight (-0.025em) -->
<div style="letter-spacing:var(--tracking-tight);font-size:var(--text-lg)">--tracking-tight · -0.025em — SITUATION REPORT</div>
<!-- --tracking-normal (0) -->
<div style="letter-spacing:var(--tracking-normal);font-size:var(--text-lg)">--tracking-normal · 0 — SITUATION REPORT</div>
<!-- --tracking-wide (0.025em) -->
<div style="letter-spacing:var(--tracking-wide);font-size:var(--text-lg)">--tracking-wide · 0.025em — SITUATION REPORT</div>
<!-- --tracking-wider (0.05em) -->
<div style="letter-spacing:var(--tracking-wider);font-size:var(--text-lg)">--tracking-wider · 0.05em — SITUATION REPORT</div>
<!-- --tracking-widest (0.1em) -->
<div style="letter-spacing:var(--tracking-widest);font-size:var(--text-lg)">--tracking-widest · 0.1em — SITUATION REPORT</div>
```

### Icon sizes (--icon-xs … --icon-xl)

Use these for `font-size` on `.material-symbols-outlined` so icon sizing tunes independently of text.

| Token | Value |
|---|---|
| `--icon-xs` | 16px |
| `--icon-sm` | 18px |
| `--icon-md` | 20px |
| `--icon-lg` | 24px |
| `--icon-xl` | 32px |

```html
<!-- --icon-xs (16px) -->
<span class="material-symbols-outlined" style="font-size:var(--icon-xs)">info</span>
<!-- --icon-sm (18px) -->
<span class="material-symbols-outlined" style="font-size:var(--icon-sm)">info</span>
<!-- --icon-md (20px) -->
<span class="material-symbols-outlined" style="font-size:var(--icon-md)">info</span>
<!-- --icon-lg (24px) -->
<span class="material-symbols-outlined" style="font-size:var(--icon-lg)">info</span>
<!-- --icon-xl (32px) -->
<span class="material-symbols-outlined" style="font-size:var(--icon-xl)">info</span>
```

## Border Radius

`--border-radius` (0.5rem) is the base corner; `--radius-md` aliases it. Change `--border-radius` to retheme every standard corner at once.

| Token | Value |
|---|---|
| `--radius-none` | 0 |
| `--radius-2xs` | 0.125rem |
| `--radius-xs` | 0.25rem |
| `--radius-sm` | 0.375rem |
| `--border-radius` (base) / `--radius-md` | 0.5rem |
| `--radius-lg` | 0.75rem |
| `--radius-xl` | 1rem |
| `--radius-2xl` | 1.5rem |
| `--radius-pill` | 9999px |

```html
<!-- --radius-none -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-none)"></div><span class="docs-radius-label">--radius-none<br>0</span></div>
<!-- --radius-2xs -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-2xs)"></div><span class="docs-radius-label">--radius-2xs<br>0.125rem</span></div>
<!-- --radius-xs -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-xs)"></div><span class="docs-radius-label">--radius-xs<br>0.25rem</span></div>
<!-- --radius-sm -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-sm)"></div><span class="docs-radius-label">--radius-sm<br>0.375rem</span></div>
<!-- --border-radius (base) / --radius-md -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--border-radius)"></div><span class="docs-radius-label">--border-radius<br>0.5rem (base)</span></div>
<!-- --radius-lg -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-lg)"></div><span class="docs-radius-label">--radius-lg<br>0.75rem</span></div>
<!-- --radius-xl -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-xl)"></div><span class="docs-radius-label">--radius-xl<br>1rem</span></div>
<!-- --radius-2xl -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-2xl)"></div><span class="docs-radius-label">--radius-2xl<br>1.5rem</span></div>
<!-- --radius-pill -->
<div class="docs-radius-item"><div class="docs-radius-box" style="border-radius:var(--radius-pill)"></div><span class="docs-radius-label">--radius-pill<br>9999px</span></div>
```

## Border Thickness

Border-width tokens in rem — use instead of raw `px` on borders, outlines and scrollbar widths. Each bar's height is the token value.

| Token | Value |
|---|---|
| `--border-2xs` | 1px |
| `--border-xs` | 2px |
| `--border-sm` | 3px |
| `--border-md` | 4px |
| `--border-lg` | 6px |
| `--border-xl` | 8px |
| `--border-2xl` | 12px |

```html
<!-- --border-2xs (1px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-2xs</span><div style="height:var(--border-2xs);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">1px</span></div>
<!-- --border-xs (2px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-xs</span><div style="height:var(--border-xs);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">2px</span></div>
<!-- --border-sm (3px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-sm</span><div style="height:var(--border-sm);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">3px</span></div>
<!-- --border-md (4px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-md</span><div style="height:var(--border-md);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">4px</span></div>
<!-- --border-lg (6px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-lg</span><div style="height:var(--border-lg);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">6px</span></div>
<!-- --border-xl (8px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-xl</span><div style="height:var(--border-xl);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">8px</span></div>
<!-- --border-2xl (12px) -->
<div style="display:flex;align-items:center;gap:var(--space-4)"><span class="docs-space-label">--border-2xl</span><div style="height:var(--border-2xl);width:160px;background:var(--color-10);border-radius:var(--radius-pill)"></div><span class="docs-space-value">12px</span></div>
```

## Shadow Scale

Shadow tokens resolve to stronger values in dark mode automatically, so components need no manual `[data-theme="dark"]` overrides.

| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle lift |
| `--shadow-sm` | Cards, panels |
| `--shadow-md` | Dropdowns, FABs |
| `--shadow-lg` | Popovers, map pins |
| `--shadow-xl` | Modals, drawers |
| `--widget-shadow` | Widget alias (→ `--shadow-sm`) |

```html
<!-- --shadow-xs (subtle lift) -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)"><div style="width:96px;height:64px;border-radius:var(--border-radius);background:var(--color-30);box-shadow:var(--shadow-xs)"></div><span class="docs-radius-label" style="text-align:center">--shadow-xs<br><span style="opacity:0.6;font-size:var(--text-2xs)">Subtle lift</span></span></div>
<!-- --shadow-sm (cards, panels) -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)"><div style="width:96px;height:64px;border-radius:var(--border-radius);background:var(--color-30);box-shadow:var(--shadow-sm)"></div><span class="docs-radius-label" style="text-align:center">--shadow-sm<br><span style="opacity:0.6;font-size:var(--text-2xs)">Cards, panels</span></span></div>
<!-- --shadow-md (dropdowns, FABs) -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)"><div style="width:96px;height:64px;border-radius:var(--border-radius);background:var(--color-30);box-shadow:var(--shadow-md)"></div><span class="docs-radius-label" style="text-align:center">--shadow-md<br><span style="opacity:0.6;font-size:var(--text-2xs)">Dropdowns, FABs</span></span></div>
<!-- --shadow-lg (popovers, map pins) -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)"><div style="width:96px;height:64px;border-radius:var(--border-radius);background:var(--color-30);box-shadow:var(--shadow-lg)"></div><span class="docs-radius-label" style="text-align:center">--shadow-lg<br><span style="opacity:0.6;font-size:var(--text-2xs)">Popovers, pins</span></span></div>
<!-- --shadow-xl (modals, drawers) -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)"><div style="width:96px;height:64px;border-radius:var(--border-radius);background:var(--color-30);box-shadow:var(--shadow-xl)"></div><span class="docs-radius-label" style="text-align:center">--shadow-xl<br><span style="opacity:0.6;font-size:var(--text-2xs)">Modals, drawers</span></span></div>
<!-- --widget-shadow (semantic alias → --shadow-sm) -->
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)"><div style="width:96px;height:64px;border-radius:var(--border-radius);background:var(--color-30);box-shadow:var(--widget-shadow)"></div><span class="docs-radius-label" style="text-align:center">--widget-shadow<br><span style="opacity:0.6;font-size:var(--text-2xs)">Widget alias</span></span></div>
```

## Interaction Tokens

Overlay and hover surfaces used across interactive components. `--color-hover` is a translucent wash layered over any surface; `--color-overlay` is the modal/drawer backdrop; `--color-switch-thumb` fills toggle knobs.

| Token | Usage |
|---|---|
| `--color-hover` | Hover wash (over surface) |
| `--color-overlay` | Overlay (modal/drawer backdrop) |
| `--color-switch-thumb` | Switch thumb |

```html
<!-- --color-hover (over surface) -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-30)"><div style="width:100%;height:100%;background:var(--color-hover)"></div></div><div class="docs-swatch-info"><span class="docs-swatch-name">Hover wash</span><span class="docs-swatch-var">--color-hover</span></div></div>
<!-- --color-overlay -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-overlay)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Overlay</span><span class="docs-swatch-var">--color-overlay</span></div></div>
<!-- --color-switch-thumb -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--color-switch-thumb)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Switch thumb</span><span class="docs-swatch-var">--color-switch-thumb</span></div></div>
```

## Scrollbar Tokens

One source of truth for every overflow surface. `--scrollbar-size` is the track width (4px, aliasing `--border-md`); thumb colours reference theme tokens so they follow light/dark automatically. The box below applies them directly.

```html
<!-- Live overflow surface driven by scrollbar tokens -->
<div class="wui-scroll-area" style="height:120px;width:100%;border:var(--border-2xs) solid var(--color-border);border-radius:var(--border-radius);padding:var(--space-3);scrollbar-color:var(--scrollbar-thumb) var(--scrollbar-track)">
  <div style="height:340px;background:linear-gradient(var(--color-10-light),var(--color-30));border-radius:var(--scrollbar-radius)">Scroll me — the thumb uses --scrollbar-thumb / --scrollbar-thumb-hover, sized by --scrollbar-size, rounded by --scrollbar-radius, over --scrollbar-track.</div>
</div>
```

> **Token set:** `--scrollbar-size`, `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`, `--scrollbar-radius`. Applied globally via the `weoc-reset.css` scrollbar rule.

## Bootstrap Overrides

The theme remaps Bootstrap and Tom Select variables onto agency tokens so legacy WebEOC chrome inherits the palette. These are pass-through aliases, not new values.

| Token | Aliases |
|---|---|
| `--bs-primary` | → `--color-10` |
| `--bs-success` | → `--color-success` |
| `--bs-warning` | → `--color-warning` |
| `--bs-danger` | → `--color-danger` |

```html
<!-- --bs-primary → --color-10 -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--bs-primary)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Bootstrap primary</span><span class="docs-swatch-var">--bs-primary</span></div></div>
<!-- --bs-success → --color-success -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--bs-success)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Bootstrap success</span><span class="docs-swatch-var">--bs-success</span></div></div>
<!-- --bs-warning → --color-warning -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--bs-warning)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Bootstrap warning</span><span class="docs-swatch-var">--bs-warning</span></div></div>
<!-- --bs-danger → --color-danger -->
<div class="docs-swatch"><div class="docs-swatch-color" style="background:var(--bs-danger)"></div><div class="docs-swatch-info"><span class="docs-swatch-name">Bootstrap danger</span><span class="docs-swatch-var">--bs-danger</span></div></div>
```

Also remapped: `--bs-body-*` (font, size, weight, colour, bg), `--bs-border-color`, the full `--bs-border-radius-*` ramp, and `--ts-border` for Tom Select. All resolve to the agency tokens shown above.
