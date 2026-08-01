# Overlays

[← Index](README.md)

Floating and dismissible surfaces: `wui-popover`, `wui-dropdown`, `wui-modal`, and `wui-drawer`. Every trigger below is wired with the exact declarative `data-wui-*` attributes that `weoc-ui.js` delegates from the head, so the demos open for real with no page script.

> **WebEOC XML constraint:** Boolean `data-wui-*` attributes must carry a value: `data-wui-backdrop="true"`, `data-wui-dismiss=""`. Bare boolean attributes break WebEOC's XML parser. The demos below use the value form throughout.

## wui-popover

Floating contextual panel anchored to a trigger. It is `display:none` until `weoc-ui.js` adds the reveal class named by `data-wui-open-class="show"`. No backdrop, so a click anywhere outside the panel closes it. Wrap items in `wui-pop-actions`; each row is a `wui-pop-btn`.

### Action menu — click to open

```html
<!-- Trigger -->
<button class="wui-btn outline secondary wui-btn-sm" data-wui-toggle="#demo-pop">
  <span class="material-symbols-outlined">more_vert</span> Actions
</button>
<!-- Popover target: open-class + anchor drive positioning; dismiss on any item click -->
<div id="demo-pop" class="wui-popover" data-wui-open-class="show" data-wui-anchor="bottom-end">
  <div class="wui-pop-actions" data-wui-dismiss="">
    <button class="wui-pop-btn"><span class="material-symbols-outlined">edit</span> Edit Record</button>
    <button class="wui-pop-btn"><span class="material-symbols-outlined">visibility</span> View Details</button>
    <button class="wui-pop-btn warning"><span class="material-symbols-outlined">flag</span> Flag</button>
    <button class="wui-pop-btn danger"><span class="material-symbols-outlined">delete</span> Delete</button>
  </div>
</div>
```

### wui-pop-btn — all color variants

The item color tints its label and icon. Available: default (neutral), `primary`, `secondary`, `success`, `warning`, `info`, `danger`. Shown here inside a statically-revealed popover (`show` class hard-coded) so all rows are visible at once.

```html
<div class="wui-popover show" style="position:relative;z-index:auto;min-width:200px">
  <div class="wui-pop-actions">
    <!-- Default (neutral) -->
    <button class="wui-pop-btn"><span class="material-symbols-outlined">edit</span> Default</button>
    <!-- Primary -->
    <button class="wui-pop-btn primary"><span class="material-symbols-outlined">star</span> Primary</button>
    <!-- Secondary -->
    <button class="wui-pop-btn secondary"><span class="material-symbols-outlined">more_horiz</span> Secondary</button>
    <!-- Success -->
    <button class="wui-pop-btn success"><span class="material-symbols-outlined">check</span> Success</button>
    <!-- Warning -->
    <button class="wui-pop-btn warning"><span class="material-symbols-outlined">flag</span> Warning</button>
    <!-- Info -->
    <button class="wui-pop-btn info"><span class="material-symbols-outlined">info</span> Info</button>
    <!-- Danger -->
    <button class="wui-pop-btn danger"><span class="material-symbols-outlined">delete</span> Danger</button>
  </div>
</div>
```

## wui-dropdown

Select-like menu that lives inside a `wui-dropdown-wrap` so trigger and menu stay grouped. Same three target attributes as the popover: `data-wui-open-class="show"`, `data-wui-anchor="bottom-end"`, and `data-wui-dismiss=""` (picking an item closes it). Rows are `wui-dropdown-item`; an optional `wui-dropdown-item-icon` leads each row. An optional `wui-dropdown-arrow` points back at the trigger.

### Filter menu — click to open

```html
<div class="wui-dropdown-wrap" style="width:220px">
  <!-- Trigger -->
  <button class="wui-btn outline secondary" style="width:100%;justify-content:space-between" data-wui-toggle="#demo-dropdown">
    Select a filter…
    <span class="material-symbols-outlined">expand_more</span>
  </button>
  <!-- Menu target -->
  <div id="demo-dropdown" class="wui-dropdown" data-wui-open-class="show" data-wui-anchor="bottom-end" data-wui-dismiss="">
    <div class="wui-dropdown-arrow"></div>
    <div class="wui-dropdown-item">
      <span class="wui-dropdown-item-icon material-symbols-outlined">check_circle</span>
      All incidents
    </div>
    <div class="wui-dropdown-item danger">
      <span class="wui-dropdown-item-icon material-symbols-outlined">warning</span>
      Critical only
    </div>
    <div class="wui-dropdown-item warning">
      <span class="wui-dropdown-item-icon material-symbols-outlined">priority_high</span>
      High priority
    </div>
    <div class="wui-dropdown-item success">
      <span class="wui-dropdown-item-icon material-symbols-outlined">done_all</span>
      Resolved
    </div>
  </div>
</div>
```

### wui-dropdown-item — all color variants

Item colors tint the label and icon and give a matching hover background: default (neutral), `primary`, `secondary`, `success`, `warning`, `info`, `danger`. Shown inside a statically-revealed menu (`show` hard-coded) so every variant is visible; hover any row to see its state.

```html
<div class="wui-dropdown-wrap" style="width:240px;min-height:340px">
  <div class="wui-dropdown show" style="position:relative;top:0;box-shadow:none">
    <!-- Default (neutral) -->
    <div class="wui-dropdown-item">
      <span class="wui-dropdown-item-icon material-symbols-outlined">list</span>
      Default item
    </div>
    <!-- Primary -->
    <div class="wui-dropdown-item primary">
      <span class="wui-dropdown-item-icon material-symbols-outlined">star</span>
      Primary item
    </div>
    <!-- Secondary -->
    <div class="wui-dropdown-item secondary">
      <span class="wui-dropdown-item-icon material-symbols-outlined">more_horiz</span>
      Secondary item
    </div>
    <!-- Success -->
    <div class="wui-dropdown-item success">
      <span class="wui-dropdown-item-icon material-symbols-outlined">check_circle</span>
      Success item
    </div>
    <!-- Warning -->
    <div class="wui-dropdown-item warning">
      <span class="wui-dropdown-item-icon material-symbols-outlined">priority_high</span>
      Warning item
    </div>
    <!-- Info -->
    <div class="wui-dropdown-item info">
      <span class="wui-dropdown-item-icon material-symbols-outlined">info</span>
      Info item
    </div>
    <!-- Danger -->
    <div class="wui-dropdown-item danger">
      <span class="wui-dropdown-item-icon material-symbols-outlined">warning</span>
      Danger item
    </div>
  </div>
</div>
```

## wui-modal

Centered dialog that scales and fades in on open. Structure: `wui-modal` > `wui-modal-dialog` > `wui-modal-header` (with `wui-modal-title` + `wui-modal-close`), `wui-modal-body`, and an optional `wui-modal-footer`. Mark the `wui-modal` with `data-wui-backdrop="true"` to dim the page, lock scroll, and trap focus. Open with `data-wui-toggle="#id"`; close with any `data-wui-dismiss=""`, a backdrop click, or Esc.

### Default (md, 32rem) — click to open

```html
<!-- Trigger -->
<button class="wui-btn primary" data-wui-toggle="#demo-modal">Open Modal</button>
<!-- Modal -->
<div id="demo-modal" class="wui-modal" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">verified</span> Confirm Action</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body">
      <p style="font-size:var(--text-sm);color:var(--color-text-secondary)">Default 32rem dialog. Scales and fades in. The backdrop dims the page, locks scroll, and traps focus. Press Esc, click the backdrop, or use a dismiss button to close.</p>
    </div>
    <div class="wui-modal-footer">
      <button class="wui-btn ghost secondary" data-wui-dismiss="">Cancel</button>
      <button class="wui-btn primary" data-wui-dismiss="">Confirm</button>
    </div>
  </div>
</div>
```

### Sizes — sm · md · lg · xl

Width axis on the `wui-modal`: `.sm` (24rem), default md (32rem), `.lg` (44rem), `.xl` (60rem).

```html
<!-- sm -->
<button class="wui-btn outline primary" data-wui-toggle="#demo-modal-sm">Small (.sm)</button>
<!-- md (default) -->
<button class="wui-btn outline primary" data-wui-toggle="#demo-modal-md">Medium (default)</button>
<!-- lg -->
<button class="wui-btn outline primary" data-wui-toggle="#demo-modal-lg">Large (.lg)</button>
<!-- xl -->
<button class="wui-btn outline primary" data-wui-toggle="#demo-modal-xl">XL (.xl)</button>

<!-- sm modal -->
<div id="demo-modal-sm" class="wui-modal sm" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">warning</span> Small (.sm = 24rem)</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">Compact confirm dialogs.</p></div>
    <div class="wui-modal-footer">
      <button class="wui-btn ghost secondary" data-wui-dismiss="">Cancel</button>
      <button class="wui-btn danger" data-wui-dismiss="">Delete</button>
    </div>
  </div>
</div>
<!-- md modal -->
<div id="demo-modal-md" class="wui-modal" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">open_in_new</span> Medium (default = 32rem)</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">The default size when no size class is present.</p></div>
  </div>
</div>
<!-- lg modal -->
<div id="demo-modal-lg" class="wui-modal lg" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">description</span> Large (.lg = 44rem)</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">Larger form dialogs or detail views.</p></div>
    <div class="wui-modal-footer">
      <button class="wui-btn ghost secondary" data-wui-dismiss="">Cancel</button>
      <button class="wui-btn primary" data-wui-dismiss="">Save</button>
    </div>
  </div>
</div>
<!-- xl modal -->
<div id="demo-modal-xl" class="wui-modal xl" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">grid_view</span> XL (.xl = 60rem)</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">Widest dialog. Good for embedded forms or side-by-side content.</p></div>
    <div class="wui-modal-footer">
      <button class="wui-btn ghost secondary" data-wui-dismiss="">Close</button>
    </div>
  </div>
</div>
```

### Header + body only (no footer)

The `wui-modal-footer` region is optional; omit it for a lightweight notice.

```html
<!-- Trigger -->
<button class="wui-btn outline info" data-wui-toggle="#demo-modal-nofoot">Open (no footer)</button>
<!-- Modal without footer -->
<div id="demo-modal-nofoot" class="wui-modal" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">info</span> Notice</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">A dialog with just a header and body. Close with the X, the backdrop, or Esc.</p></div>
  </div>
</div>
```

## wui-drawer

Side panel that slides in from an edge. The wrapper `wui-drawer` carries every axis; children stay bare. Structure: `wui-drawer` > `wui-drawer-panel` > `wui-drawer-header` (with `wui-drawer-title` + `wui-drawer-close`), `wui-drawer-body`, and an optional `wui-drawer-footer`. Side: default right or `.start` (left). Size: `.sm` (20rem), default md (25rem), `.lg` (32rem), `.xl` (40rem). Add `.has-overlay` plus `data-wui-backdrop="true"` to dim and block the page; without them the drawer floats and the page stays usable. Open with `data-wui-toggle="#id"`; close with `data-wui-dismiss=""`, backdrop click, or Esc.

### Side — right (default) and left (.start)

```html
<!-- Right (default) -->
<button class="wui-btn primary" data-wui-toggle="#demo-drawer-right">Open Right Drawer</button>
<!-- Left (.start) -->
<button class="wui-btn outline primary" data-wui-toggle="#demo-drawer-left">Open Left Drawer</button>

<!-- Right drawer (default side, default md size, has-overlay) -->
<div id="demo-drawer-right" class="wui-drawer has-overlay" data-wui-backdrop="true">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">Right Drawer (default)</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body">
      <p style="font-size:var(--text-sm);color:var(--color-text-secondary)">Slides in from the right at 25rem. Content scrolls inside the body.</p>
    </div>
    <div class="wui-drawer-footer">
      <button class="wui-btn ghost secondary" data-wui-dismiss="">Close</button>
      <button class="wui-btn primary">Save</button>
    </div>
  </div>
</div>
<!-- Left drawer (.start) -->
<div id="demo-drawer-left" class="wui-drawer start has-overlay" data-wui-backdrop="true">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">Left Drawer (.start)</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">Slides in from the left via the <code>.start</code> modifier.</p></div>
  </div>
</div>
```

### Sizes — sm · md · lg · xl

```html
<!-- sm -->
<button class="wui-btn outline secondary" data-wui-toggle="#demo-drawer-sm">Small (.sm)</button>
<!-- md (default) -->
<button class="wui-btn outline secondary" data-wui-toggle="#demo-drawer-md">Medium (default)</button>
<!-- lg -->
<button class="wui-btn outline secondary" data-wui-toggle="#demo-drawer-lg">Large (.lg)</button>
<!-- xl -->
<button class="wui-btn outline secondary" data-wui-toggle="#demo-drawer-xl">XL (.xl)</button>

<!-- sm drawer -->
<div id="demo-drawer-sm" class="wui-drawer sm has-overlay" data-wui-backdrop="true">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">Small Drawer (.sm = 20rem)</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">20rem wide.</p></div>
  </div>
</div>
<!-- md drawer -->
<div id="demo-drawer-md" class="wui-drawer has-overlay" data-wui-backdrop="true">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">Medium Drawer (default = 25rem)</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">25rem wide. The default when no size class is present.</p></div>
  </div>
</div>
<!-- lg drawer -->
<div id="demo-drawer-lg" class="wui-drawer lg has-overlay" data-wui-backdrop="true">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">Large Drawer (.lg = 32rem)</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">32rem wide.</p></div>
  </div>
</div>
<!-- xl drawer -->
<div id="demo-drawer-xl" class="wui-drawer xl has-overlay" data-wui-backdrop="true">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">XL Drawer (.xl = 40rem)</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">40rem wide.</p></div>
  </div>
</div>
```

### Floating (no overlay)

Omit `.has-overlay` and `data-wui-backdrop` so the drawer floats over the page without dimming it, leaving the page usable underneath.

```html
<!-- Trigger -->
<button class="wui-btn outline info" data-wui-toggle="#demo-drawer-float">Open Floating Drawer</button>
<!-- Floating drawer: no .has-overlay, no data-wui-backdrop -->
<div id="demo-drawer-float" class="wui-drawer">
  <div class="wui-drawer-panel">
    <div class="wui-drawer-header">
      <div class="wui-drawer-title">Floating Drawer</div>
      <button class="wui-drawer-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-drawer-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">No backdrop. The page behind stays interactive. Close with the X, an outside click, or Esc.</p></div>
  </div>
</div>
```

## Legacy overlays

Two older overlay families remain in `weoc-overlays.css`. Prefer `wui-modal` and `wui-drawer` for new work; these are documented for maintenance of existing boards.

### .modal-overlay / .modal-frame

A bare fixed backdrop (`modal-overlay`, shown with the `.visible` class) centering a fixed 720×510 `modal-frame`. It carries no built-in header, body, or dismiss wiring, so it is toggled by hand rather than by `data-wui-*`. Rendered statically below; the live overlay would cover the viewport.

```html
<!-- Static preview (position relativized so it sits in-flow) -->
<div class="modal-overlay visible" style="position:relative;inset:auto;padding:var(--space-4)">
  <div class="modal-frame" style="width:100%;max-width:480px;height:200px;display:flex;align-items:center;justify-content:center;color:var(--color-text-secondary);font-size:var(--text-sm)">
    720×510 modal-frame (scaled down for preview)
  </div>
</div>
```

### .wui-close-record-modal

A specialized confirm dialog for closing event records: a fixed 480×560 dialog whose body typically hosts a WebEOC `embedview`. Its overlay (`wui-close-record-modal-overlay`) is hidden until the `.visible` class is set. Regions: `-header` (with `-title-wrap`, `-title`, `-close-btn`) and `-body`. Shown static below.

```html
<div class="wui-close-record-modal" style="position:relative;height:auto">
  <div class="wui-close-record-modal-header">
    <div class="wui-close-record-modal-title-wrap">
      <span class="material-symbols-outlined">warning</span>
      <span class="wui-close-record-modal-title">Close Record?</span>
    </div>
    <button class="wui-close-record-modal-close-btn" data-wui-dismiss="true"><span class="material-symbols-outlined">close</span></button>
  </div>
  <div class="wui-close-record-modal-body" style="padding:var(--space-5);height:auto;font-size:var(--text-sm);color:var(--color-text-secondary)">
    Embedded close-record form (<code>embedview</code>) renders here.
  </div>
</div>
```

## Overlay JS API

Everything above is declarative and needs no page script. For programmatic control, `weoc-ui.js` exposes the same primitives that the `data-wui-*` handlers call internally.

```html
<button class="wui-btn primary" id="api-open-btn">Open via WUI.open()</button>
<div id="api-modal" class="wui-modal" data-wui-backdrop="true">
  <div class="wui-modal-dialog">
    <div class="wui-modal-header">
      <span class="wui-modal-title"><span class="material-symbols-outlined">terminal</span> Opened by script</span>
      <button class="wui-modal-close" data-wui-dismiss=""><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="wui-modal-body"><p style="font-size:var(--text-sm);color:var(--color-text-secondary)">This dialog was opened with <code>WUI.open()</code> and listens for <code>wui:open</code> / <code>wui:close</code>. Dismiss buttons, the backdrop, and Esc still work.</p></div>
    <div class="wui-modal-footer">
      <button class="wui-btn primary" data-wui-dismiss="">Done</button>
    </div>
  </div>
</div>
```
