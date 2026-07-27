# Feedback

[← Index](README.md)

Components that tell the user what is happening: contextual notices `wui-callout`, page-level `wui-banner`, transient `wui-toast` and `wui-snackbar` (driven by `WUI.toast` / `WUI.snackbar`), the pulsing `wui-alarm`, shimmer placeholders `wui-skeleton`, empty placeholders `wui-empty-state`, and the `.spin` loader. Every variant, size, and state is shown below with its exact markup.

## wui-callout

Inline contextual notice for form panels and content regions (4-sided, unlike the page-level banner). Required structure: `.wui-callout` > a direct-child `span.material-symbols-outlined` icon + `.wui-callout-body` containing an optional `.wui-callout-title` followed by body text (prose, lists, and links are all supported). Add one color class: `primary`, `secondary`, `success`, `warning`, `danger`, or `info`.

### All 6 colors — required structure

```html
<!-- Primary -->
<div class="wui-callout primary">
  <span class="material-symbols-outlined">info</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Primary</div>
    General contextual information tied to the current panel.
  </div>
</div>
<!-- Secondary -->
<div class="wui-callout secondary">
  <span class="material-symbols-outlined">notes</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Secondary</div>
    A low-emphasis note that supports the surrounding content.
  </div>
</div>
<!-- Success -->
<div class="wui-callout success">
  <span class="material-symbols-outlined">check_circle</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Success</div>
    The record was saved and the workflow can continue.
  </div>
</div>
<!-- Warning -->
<div class="wui-callout warning">
  <span class="material-symbols-outlined">warning</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Warning</div>
    Review the highlighted fields before submitting.
  </div>
</div>
<!-- Danger -->
<div class="wui-callout danger">
  <span class="material-symbols-outlined">error</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Danger</div>
    This action cannot be undone once confirmed.
  </div>
</div>
<!-- Info -->
<div class="wui-callout info">
  <span class="material-symbols-outlined">lightbulb</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Info</div>
    Tip: you can attach files after the report is created.
  </div>
</div>
```

### With a list in the body

```html
<!-- Callout containing a list -->
<div class="wui-callout warning">
  <span class="material-symbols-outlined">rule</span>
  <div class="wui-callout-body">
    <div class="wui-callout-title">Before you submit</div>
    <ul>
      <li>Confirm the incident location.</li>
      <li>Assign a responsible officer.</li>
      <li>Attach the initial situation report.</li>
    </ul>
  </div>
</div>
```

### Title omitted (body only)

```html
<!-- No .wui-callout-title -->
<div class="wui-callout info">
  <span class="material-symbols-outlined">info</span>
  <div class="wui-callout-body">
    Draft auto-saves every 30 seconds while you edit.
  </div>
</div>
```

## wui-banner

Page-level inline alert, sibling to `wui-callout`. Structure: `wui-banner` → leading `material-symbols-outlined` icon + `wui-banner-body` (`wui-banner-text` headline, optional `wui-banner-sub` secondary line). One of six colour variants; icon + text inherit the accent.

### All 6 color variants (text + sub structure)

```html
<!-- Primary -->
<div class="wui-banner primary" style="width:100%">
  <span class="material-symbols-outlined">info</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">System update scheduled</div>
    <div class="wui-banner-sub">Maintenance window begins at 02:00 UTC.</div>
  </div>
</div>
<!-- Secondary -->
<div class="wui-banner secondary" style="width:100%">
  <span class="material-symbols-outlined">bookmark</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">Draft saved</div>
    <div class="wui-banner-sub">Your report is stored locally and not yet submitted.</div>
  </div>
</div>
<!-- Success -->
<div class="wui-banner success" style="width:100%">
  <span class="material-symbols-outlined">check_circle</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">Report submitted</div>
    <div class="wui-banner-sub">Incident #4471 was logged successfully.</div>
  </div>
</div>
<!-- Warning -->
<div class="wui-banner warning" style="width:100%">
  <span class="material-symbols-outlined">warning</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">Resource capacity low</div>
    <div class="wui-banner-sub">Shelter occupancy is at 92% of rated capacity.</div>
  </div>
</div>
<!-- Danger -->
<div class="wui-banner danger" style="width:100%">
  <span class="material-symbols-outlined">error</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">EOC activated — Level 4 Critical</div>
    <div class="wui-banner-sub">All response teams report to their assigned sectors.</div>
  </div>
</div>
<!-- Info -->
<div class="wui-banner info" style="width:100%">
  <span class="material-symbols-outlined">lightbulb</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">New situation report available</div>
    <div class="wui-banner-sub">SITREP 14:00 has been published by the planning section.</div>
  </div>
</div>
```

### Headline only (no wui-banner-sub)

```html
<!-- Single-line banner: omit wui-banner-sub -->
<div class="wui-banner info" style="width:100%">
  <span class="material-symbols-outlined">info</span>
  <div class="wui-banner-body">
    <div class="wui-banner-text">This board is read-only for your role.</div>
  </div>
</div>
```

## wui-toast

Transient corner notification, created imperatively from JavaScript — there is no static markup to author. Call `WUI.toast(message, opts)`; the library builds the DOM, animates it in, auto-dismisses after `opts.duration` ms (default 4000; `0` = sticky), and tears it down after the exit transition. Returns a handle `{ el, dismiss }`. Auto-dismiss pauses while the pointer is over the toast. Each demo button below runs the exact call shown in its Markup box.

### Severity variants

```html
<!-- Neutral (no variant) -->
<button class="wui-btn outline secondary" onclick="WUI.toast('Draft auto-saved')">Neutral</button>
<!-- Primary -->
<button class="wui-btn primary" onclick="WUI.toast('Report queued for review', { variant: 'primary' })">Primary</button>
<!-- Info -->
<button class="wui-btn info" onclick="WUI.toast('New SITREP available', { variant: 'info' })">Info</button>
<!-- Success -->
<button class="wui-btn success" onclick="WUI.toast('Incident #4471 submitted', { variant: 'success' })">Success</button>
<!-- Warning -->
<button class="wui-btn warning" onclick="WUI.toast('Shelter at 92% capacity', { variant: 'warning' })">Warning</button>
<!-- Danger -->
<button class="wui-btn danger" onclick="WUI.toast('Failed to save record', { variant: 'danger' })">Danger</button>
```

### With a title

```html
<!-- opts.title renders a bold heading above the message -->
<button class="wui-btn primary" onclick="WUI.toast('All response teams report to their sectors.', { variant: 'danger', title: 'EOC activated — Level 4' })">Titled toast</button>
```

### Positions

```html
<!-- Default is top-right; six positions are supported -->
<button class="wui-btn outline primary" onclick="WUI.toast('top-right (default)')">top-right</button>
<button class="wui-btn outline primary" onclick="WUI.toast('top-left', { position: 'top-left' })">top-left</button>
<button class="wui-btn outline primary" onclick="WUI.toast('top-center', { position: 'top-center' })">top-center</button>
<button class="wui-btn outline primary" onclick="WUI.toast('bottom-right', { position: 'bottom-right' })">bottom-right</button>
<button class="wui-btn outline primary" onclick="WUI.toast('bottom-left', { position: 'bottom-left' })">bottom-left</button>
<button class="wui-btn outline primary" onclick="WUI.toast('bottom-center', { position: 'bottom-center' })">bottom-center</button>
```

### Sticky + action button

`duration: 0` keeps the toast until dismissed. `action` takes a string label, or `{ label, onClick(handle) }` — the callback fires `wui:toast:action` and then dismisses the toast.

```html
<!-- Sticky toast with an Undo action -->
<button class="wui-btn warning" onclick="WUI.toast('Record moved to archive', { variant: 'warning', duration: 0, action: { label: 'Undo', onClick: function () { WUI.toast('Restore complete', { variant: 'success' }); } } })">Sticky + action</button>
```

### Dismiss all

```html
<!-- Stack a few, then clear them all -->
<button class="wui-btn outline info" onclick="WUI.toast('One'); WUI.toast('Two', { variant: 'info' }); WUI.toast('Three', { variant: 'success' })">Stack three</button>
<button class="wui-btn outline danger" onclick="WUI.dismissToasts()">Dismiss all</button>
```

## wui-snackbar

A bottom-center, single-at-a-time notification with an optional inline action — the Material-style sibling of the toast. `WUI.snackbar(message, opts)` is a preset over the same engine: position is always bottom-center, a new snackbar replaces the open one, the surface is the inverted neutral skin, and the default duration is 6000 ms. Same `opts` as toast (`variant`, `title`, `duration`, `dismissible`, `action`).

### Default

```html
<!-- Plain confirmation -->
<button class="wui-btn primary" onclick="WUI.snackbar('Changes saved')">Show snackbar</button>
```

### With an action

```html
<!-- Undo pattern -->
<button class="wui-btn primary" onclick="WUI.snackbar('Item deleted', { action: { label: 'Undo', onClick: function () { WUI.snackbar('Item restored'); } } })">Delete with Undo</button>
```

### Single-at-a-time

Triggering a snackbar while one is open replaces it — only one shows at a time. Click twice in quick succession to see the swap.

```html
<!-- Second call replaces the first -->
<button class="wui-btn info" onclick="WUI.snackbar('Uploading… ' + new Date().toLocaleTimeString(), { variant: 'info' })">Fire snackbar</button>
```

## wui-alarm

A danger-colored icon button for active system alerts. It sits dimmed (`opacity: 0.48`) until you add `active`, which brightens it, adds a glow ring, pulses the icon core, and emits an animated sonar ripple. Size modifiers: `sm`, base (md), `lg`, `xl`.

### Base (idle) vs. active

```html
<!-- Base (idle, dimmed) -->
<button class="wui-alarm"><span class="material-symbols-outlined">notifications</span></button>
<!-- Active (glow + core pulse + sonar) -->
<button class="wui-alarm active"><span class="material-symbols-outlined">notifications</span></button>
```

### Sizes — sm → xl (base = md)

```html
<!-- sm -->
<button class="wui-alarm sm"><span class="material-symbols-outlined">notifications</span></button>
<!-- md (base, no size class) -->
<button class="wui-alarm"><span class="material-symbols-outlined">notifications</span></button>
<!-- lg -->
<button class="wui-alarm lg"><span class="material-symbols-outlined">notifications</span></button>
<!-- xl -->
<button class="wui-alarm xl"><span class="material-symbols-outlined">notifications</span></button>
```

### Sizes — active (sonar at each size)

```html
<!-- sm active -->
<button class="wui-alarm sm active"><span class="material-symbols-outlined">notifications</span></button>
<!-- md active -->
<button class="wui-alarm active"><span class="material-symbols-outlined">notifications</span></button>
<!-- lg active -->
<button class="wui-alarm lg active"><span class="material-symbols-outlined">notifications</span></button>
<!-- xl active -->
<button class="wui-alarm xl active"><span class="material-symbols-outlined">notifications</span></button>
```

## wui-skeleton

Shimmer placeholder for loading states. Swap any content element 1-for-1 (same wrapper, same size, text removed). Compose one *shape* (default block, or `pill`/`circle`/`inline`), one *height* (`h-2xs`…`h-2xl` mirroring the text scale, or the UI presets `h-btn`/`h-input`/`h-icon`/`h-fab`/`h-tab`/`h-avatar`/`h-avatar-lg`), and a *width* (`w-full`/`w-3-4`/`w-2-3`/`w-1-2`/`w-1-3`/`w-1-4`, or an inline width).

### Shapes — block / pill / circle / inline

```html
<!-- Block (default) -->
<span class="wui-skeleton h-base w-1-2"></span>
<!-- Pill -->
<span class="wui-skeleton pill h-base w-1-2"></span>
<!-- Circle -->
<span class="wui-skeleton circle h-avatar"></span>
<!-- Inline (flows with text) -->
<div>Loading <span class="wui-skeleton inline h-sm" style="width:80px"></span> inline.</div>
```

### Heights — text scale (h-2xs → h-2xl)

```html
<!-- h-2xs -->
<span class="wui-skeleton h-2xs w-1-2"></span>
<!-- h-xs -->
<span class="wui-skeleton h-xs w-1-2"></span>
<!-- h-sm -->
<span class="wui-skeleton h-sm w-1-2"></span>
<!-- h-base -->
<span class="wui-skeleton h-base w-1-2"></span>
<!-- h-lg -->
<span class="wui-skeleton h-lg w-1-2"></span>
<!-- h-xl -->
<span class="wui-skeleton h-xl w-1-2"></span>
<!-- h-2xl -->
<span class="wui-skeleton h-2xl w-1-2"></span>
```

### Heights — UI element presets

```html
<!-- h-btn (fixed 32px height) -->
<span class="wui-skeleton h-btn" style="width:96px"></span>
<!-- h-input (fixed 36px height) -->
<span class="wui-skeleton h-input" style="width:180px"></span>
<!-- h-icon (20x20) -->
<span class="wui-skeleton h-icon"></span>
<!-- h-fab (32x32) -->
<span class="wui-skeleton circle h-fab"></span>
<!-- h-tab (20px) -->
<span class="wui-skeleton h-tab" style="width:64px"></span>
<!-- h-avatar (32x32 round) -->
<span class="wui-skeleton h-avatar"></span>
<!-- h-avatar-lg (52x52 round) -->
<span class="wui-skeleton h-avatar-lg"></span>
```

### Widths — w-full → w-1-4

```html
<!-- w-full -->
<span class="wui-skeleton h-base w-full"></span>
<!-- w-3-4 -->
<span class="wui-skeleton h-base w-3-4"></span>
<!-- w-2-3 -->
<span class="wui-skeleton h-base w-2-3"></span>
<!-- w-1-2 -->
<span class="wui-skeleton h-base w-1-2"></span>
<!-- w-1-3 -->
<span class="wui-skeleton h-base w-1-3"></span>
<!-- w-1-4 -->
<span class="wui-skeleton h-base w-1-4"></span>
```

### Composed — a loading list row

```html
<!-- Avatar + two text lines -->
<div style="display:flex;align-items:center;gap:var(--space-3);width:100%">
  <span class="wui-skeleton h-avatar"></span>
  <div style="flex:1;display:flex;flex-direction:column;gap:var(--space-2)">
    <span class="wui-skeleton h-sm w-1-2"></span>
    <span class="wui-skeleton h-xs w-3-4"></span>
  </div>
</div>
```

## wui-empty-state

Centered column placeholder for a list, panel, or section with no items: an icon plus a `.wui-empty-label`. Modifiers: `compact` (tighter, for small widget bodies) and `dashed` (bordered, holds layout space in structured columns). Add a `.wui-empty-sub` for a secondary hint line. For an inline text-only row, use `.wui-empty-section` (no icon).

### Base

```html
<!-- Base empty state -->
<div class="wui-empty-state">
  <span class="material-symbols-outlined">inbox</span>
  <span class="wui-empty-label">No items found</span>
</div>
```

### Compact

```html
<!-- Compact -->
<div class="wui-empty-state compact">
  <span class="material-symbols-outlined">folder_off</span>
  <span class="wui-empty-label">Nothing here yet</span>
</div>
```

### Dashed — with .wui-empty-sub

```html
<!-- Dashed + .wui-empty-sub -->
<div class="wui-empty-state dashed">
  <span class="material-symbols-outlined">lan</span>
  <span class="wui-empty-label">No chain defined</span>
  <span class="wui-empty-sub">Add rules above to see a preview</span>
</div>
```

### wui-empty-section — inline text-only

```html
<!-- .wui-empty-section (no icon) -->
<div class="wui-empty-section">No classifications defined yet.</div>
```

## Loader

For a live spinner, add the utility class `.spin` (from weoc-utilities.css, loaded via the core barrel) to any icon. It applies a continuous 1s linear rotation. Pair it with a Material Symbol such as `progress_activity`.

### Spinner

```html
<!-- Standalone spinning icon -->
<span class="material-symbols-outlined spin">progress_activity</span>
<!-- Inside a loading button -->
<button class="wui-btn primary" disabled><span class="material-symbols-outlined spin">progress_activity</span>Loading…</button>
```
