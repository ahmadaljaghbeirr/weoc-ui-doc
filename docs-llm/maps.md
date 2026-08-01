# Maps

[← Index](README.md)

Chrome for map views: the canvas wrapper `wui-map-wrap`, an overlay control rail (`wui-map-controls` + `wui-map-btn`), the collapsible basemap switcher (`wui-basemap-group`), and the point popover (`wui-map-point-popover`). The map engine itself (Leaflet / ESRI) is yours to drop into `wui-map-view`.

> **Add-on module — load weoc-maps.css after the core barrel:** Maps are not in `weoc-ui-core.css`. In every demo below the map view is a static placeholder box; in production it holds your map engine's canvas.

## wui-map-wrap & wui-map-view

`wui-map-wrap` is the positioned root (fills its parent, `position:relative`). `wui-map-view` fills the wrap and holds the map engine canvas. Because both are `width/height:100%`, the wrap needs a sized parent — here a fixed-height box supplies it. The control overlay and any popover are absolutely-positioned children of the wrap.

```html
<!-- Sized parent gives the 100%/100% wrap its dimensions -->
<div style="height:280px;border:1px solid var(--color-border);border-radius:var(--border-radius);overflow:hidden">
  <div class="wui-map-wrap">
    <div class="wui-map-view" style="display:flex;align-items:center;justify-content:center;background:var(--color-60);color:var(--color-text-secondary);font-size:var(--text-sm)">
      map canvas (Leaflet / ESRI) mounts in .wui-map-view
    </div>
  </div>
</div>
```

## wui-map-controls & wui-map-btn

`wui-map-controls-overlay` pins its children to the bottom-left of the wrap (`position:absolute`). Inside, `wui-map-controls` stacks `wui-map-btn` vertically. Each `wui-map-btn` is a 36×37 square; add `active` for the selected state. Buttons hold either a Material icon or a short text label. Wire actions with `data-wui-action`.

### Overlay in context — zoom rail pinned to the wrap

```html
<div style="height:280px;border:1px solid var(--color-border);border-radius:var(--border-radius);overflow:hidden">
  <div class="wui-map-wrap">
    <div class="wui-map-view" style="display:flex;align-items:center;justify-content:center;background:var(--color-60);color:var(--color-text-secondary);font-size:var(--text-sm)">map canvas</div>
    <!-- Overlay: absolutely pinned bottom-left of the wrap -->
    <div class="wui-map-controls-overlay">
      <div class="wui-map-controls">
        <!-- Zoom in -->
        <button class="wui-map-btn" data-wui-action="zoom-in" title="Zoom in"><span class="material-symbols-outlined">add</span></button>
        <!-- Zoom out -->
        <button class="wui-map-btn" data-wui-action="zoom-out" title="Zoom out"><span class="material-symbols-outlined">remove</span></button>
      </div>
    </div>
  </div>
</div>
```

### wui-map-btn — default and active

```html
<!-- Default (icon) -->
<button class="wui-map-btn" data-wui-action="zoom-in" title="Zoom in"><span class="material-symbols-outlined">add</span></button>
<!-- Default (icon) -->
<button class="wui-map-btn" data-wui-action="zoom-out" title="Zoom out"><span class="material-symbols-outlined">remove</span></button>
<!-- Active (selected) -->
<button class="wui-map-btn active" data-wui-action="toggle-basemap" title="Basemap"><span class="material-symbols-outlined">layers</span></button>
<!-- Text label -->
<button class="wui-map-btn">Streets</button>
<!-- Text label, active -->
<button class="wui-map-btn active">Satellite</button>
```

## wui-basemap-group & wui-basemap-tools

`wui-basemap-group` lays a toggle `wui-map-btn` beside a collapsible `wui-basemap-tools` rail. The rail is collapsed by default (`max-width:0; opacity:0`); adding `open` expands it (and add `active` to the toggle). Both states are shown below so the collapsed and expanded chrome are visible side by side.

### Collapsed (default) — no open

```html
<div class="wui-basemap-group">
  <!-- Toggle only; tools rail collapsed to zero width -->
  <button class="wui-map-btn" data-wui-action="toggle-basemap" title="Basemap"><span class="material-symbols-outlined">layers</span></button>
  <div class="wui-basemap-tools">
    <button class="wui-map-btn">Streets</button>
    <button class="wui-map-btn">Satellite</button>
    <button class="wui-map-btn">Terrain</button>
  </div>
</div>
```

### Open — active toggle + open tools

```html
<div class="wui-basemap-group">
  <!-- Toggle in active state -->
  <button class="wui-map-btn active" data-wui-action="toggle-basemap" title="Basemap"><span class="material-symbols-outlined">layers</span></button>
  <!-- Tools rail revealed -->
  <div class="wui-basemap-tools open">
    <button class="wui-map-btn active">Streets</button>
    <button class="wui-map-btn">Satellite</button>
    <button class="wui-map-btn">Terrain</button>
  </div>
</div>
```

> **Toggling open in production:** JS flips `open` on `wui-basemap-tools` (and `active` on the toggle) in response to `data-wui-action="toggle-basemap"`. The rail animates its `max-width`, so no height jump.

## wui-map-point-popover

Floating card shown when a map point is clicked. Structure top to bottom: accent bar (`wui-map-pop-accent`) → header (`wui-map-pop-header`: icon wrap + titles + close) → divider → body rows (`wui-map-pop-row`) → footer (badges left, actions right). It is `display:none` and `position:absolute` by default; JS positions it over the point and reveals it. Demos below force `position:relative;display:block` so the card renders inline.

### Full popover — accent colour set inline on wui-map-pop-accent

```html
<!-- Forced visible for docs: position:relative;display:block -->
<div class="wui-map-point-popover" style="position:relative;display:block">
  <!-- Accent bar — colour via inline style -->
  <div class="wui-map-pop-accent" style="background:var(--tier-3-color)"></div>
  <!-- Header: icon wrap + titles + close -->
  <div class="wui-map-pop-header">
    <div class="wui-map-pop-icon-wrap"><span class="material-symbols-outlined">local_fire_department</span></div>
    <div class="wui-map-pop-titles">
      <div class="wui-map-pop-title">Structural Fire — Tower B</div>
      <div class="wui-map-pop-id">#26-0000063</div>
    </div>
    <button class="wui-map-pop-close" data-wui-action="close" title="Close"><span class="material-symbols-outlined">close</span></button>
  </div>
  <!-- Divider -->
  <div class="wui-map-pop-divider"></div>
  <!-- Body rows -->
  <div class="wui-map-pop-body">
    <div class="wui-map-pop-row"><span class="material-symbols-outlined">pin_drop</span><span>24.4539° N, 54.3773° E</span></div>
    <div class="wui-map-pop-row"><span class="material-symbols-outlined">schedule</span><span>Reported 18d 21h ago</span></div>
  </div>
  <!-- Footer: badges left, actions right -->
  <div class="wui-map-pop-footer">
    <div class="wui-map-pop-footer-left">
      <span class="wui-badge tier-3">T3</span>
    </div>
    <div class="wui-map-pop-footer-right">
      <button class="wui-map-pop-btn wui-map-pop-btn-details">Details</button>
      <button class="wui-map-pop-btn wui-map-pop-btn-icon" data-wui-action="share" title="Share"><span class="material-symbols-outlined">share</span></button>
    </div>
  </div>
</div>
```

### Accent colours — any token on wui-map-pop-accent

The accent bar carries no colour of its own; set `background` inline to match the point's tier or severity. Same card, four accents.

```html
<!-- Tier 1 accent -->
<div class="wui-map-point-popover" style="position:relative;display:block;width:210px">
  <div class="wui-map-pop-accent" style="background:var(--tier-1-color)"></div>
  <div class="wui-map-pop-header">
    <div class="wui-map-pop-icon-wrap"><span class="material-symbols-outlined">warning</span></div>
    <div class="wui-map-pop-titles"><div class="wui-map-pop-title">Tier 1 point</div><div class="wui-map-pop-id">#T1</div></div>
  </div>
</div>
<!-- Danger accent -->
<div class="wui-map-point-popover" style="position:relative;display:block;width:210px">
  <div class="wui-map-pop-accent" style="background:var(--color-danger)"></div>
  <div class="wui-map-pop-header">
    <div class="wui-map-pop-icon-wrap"><span class="material-symbols-outlined">dangerous</span></div>
    <div class="wui-map-pop-titles"><div class="wui-map-pop-title">Danger point</div><div class="wui-map-pop-id">#D1</div></div>
  </div>
</div>
<!-- Success accent -->
<div class="wui-map-point-popover" style="position:relative;display:block;width:210px">
  <div class="wui-map-pop-accent" style="background:var(--color-success)"></div>
  <div class="wui-map-pop-header">
    <div class="wui-map-pop-icon-wrap"><span class="material-symbols-outlined">check_circle</span></div>
    <div class="wui-map-pop-titles"><div class="wui-map-pop-title">Resolved point</div><div class="wui-map-pop-id">#S1</div></div>
  </div>
</div>
<!-- Info accent -->
<div class="wui-map-point-popover" style="position:relative;display:block;width:210px">
  <div class="wui-map-pop-accent" style="background:var(--color-info)"></div>
  <div class="wui-map-pop-header">
    <div class="wui-map-pop-icon-wrap"><span class="material-symbols-outlined">info</span></div>
    <div class="wui-map-pop-titles"><div class="wui-map-pop-title">Info point</div><div class="wui-map-pop-id">#I1</div></div>
  </div>
</div>
```

### Footer buttons — wui-map-pop-btn variants

`wui-map-pop-btn` is the base; `wui-map-pop-btn-details` is the flex-filling accent action, `wui-map-pop-btn-icon` is the fixed 32-square icon action.

```html
<div class="wui-map-pop-footer-right">
  <!-- Details (accent, flex fill) -->
  <button class="wui-map-pop-btn wui-map-pop-btn-details">Details</button>
  <!-- Icon action -->
  <button class="wui-map-pop-btn wui-map-pop-btn-icon" data-wui-action="share" title="Share"><span class="material-symbols-outlined">share</span></button>
  <!-- Icon action (second) -->
  <button class="wui-map-pop-btn wui-map-pop-btn-icon" data-wui-action="directions" title="Directions"><span class="material-symbols-outlined">directions</span></button>
</div>
```

### map-pop-badges — footer badge cluster

`map-pop-badges` is a wrapping flex row for multiple badges in the popover footer-left, when a point carries more than one tag.

```html
<div class="map-pop-badges">
  <!-- Multiple badges wrap -->
  <span class="wui-badge tier-3">T3</span>
  <span class="wui-badge danger">Active</span>
  <span class="wui-badge info">Zone 4</span>
</div>
```

> **data-wui-action values use the string form in WebEOC XML:** Control and popover buttons wire through `data-wui-action="zoom-in|zoom-out|toggle-basemap|close|share"`. The popover ships `display:none`; your JS sets its `top/left`, flips it to `display:block`, and closes it on the `close` action.

## Layout & fullscreen states

These classes govern placement inside a larger app shell and the fullscreen toggle. They only make sense against a real grid or a fullscreen action, so they are documented rather than rendered inline (a live demo would either need a parent grid or cover the whole docs page).

> **Reference classes (no inline demo):** grid_view`wui-map-panel` — places the map in the `right` grid area of a split shell (`grid-area:right`, full height).
