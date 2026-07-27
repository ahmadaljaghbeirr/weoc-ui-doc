# Layout & Shell

[← Index](README.md)

The full-height app shell (`wui-body-shell`, `wui-page-shell`, `wui-main-div`, `wui-view-body`), the two-pane `wui-split`, scroll / fill primitives (`wui-scroll-area`, `wui-fill-area`), the tab shell (`wui-det-body`, `wui-det-inner`, `wui-tab-panel`), `wui-toolbar`, and the generic grid templates. Shell primitives fill their parent height; the demos below wrap them in a fixed-height frame so the structure is visible on the page.

## App shell — wui-body-shell · wui-page-shell · wui-main-div · wui-view-body

Every board nests the same full-height chain. `body.wui-body-shell` is `100vh · overflow:hidden · flex-column` (replaces the per-board body reset). Inside it, either `wui-main-div` (a padded flex column that fills the viewport) or `wui-page-shell` (a gapped, padded flex column used for input scaffolds) holds a shrink-to-content header plus a `flex:1` content region. `wui-view-body` is the scrollable content zone for display views — `flex:1; overflow-y:auto`, no padding of its own.

### Shell nesting (contained)

This is the real shell chain rendered at a contained height. In a live board the outer `body.wui-body-shell` fills the viewport.

```html
<!-- body.wui-body-shell — 100vh · overflow:hidden · flex column -->
<div class="wui-body-shell">
  <!-- wui-main-div — padded flex column, fills the shell -->
  <div class="wui-main-div">
    <!-- Header row (shrinks to content) -->
    <!-- Content region (flex:1, fills remaining height) -->
  </div>
</div>
```

### wui-view-body — scrollable display content

Wraps the scrolling card/grid area of a display view so the header + filter bar stay fixed while the body scrolls independently. Padding comes from the inner layout, not from `wui-view-body`.

```html
<!-- Fixed header + independently scrolling body -->
<div class="wui-main-div">
  <!-- Fixed header -->
  <!-- wui-view-body — flex:1; overflow-y:auto -->
  <div class="wui-view-body">
    <!-- Scrolling rows here -->
  </div>
</div>
```

## wui-split

Opt-in two-pane split (CSS grid, not flex — `fr` columns give exact, content-independent ratios). Wrap exactly two children: `wui-split-main` (primary pane) and `wui-split-panel` (secondary pane). Default is 50/50 with the panel on the right; ratio classes and `panel-start` change the geometry. Column changes animate over 320ms.

### Default — 50 / 50, panel right

```html
<!-- Default: no ratio class, panel on the right -->
<div class="wui-split">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Secondary panel --></div>
</div>
```

### Ratio variants (main : panel)

Ratios are token-driven (`--wui-split-main` / `--wui-split-panel`) and can also be set inline for arbitrary or animated values. Every ratio class in the CSS is shown below.

```html
<!-- ratio-3-2 — 3 : 2 balanced -->
<div class="wui-split ratio-3-2">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
<!-- ratio-2-1 — 2 : 1 (map) -->
<div class="wui-split ratio-2-1">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
<!-- ratio-3-1 — 3 : 1 -->
<div class="wui-split ratio-3-1">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
<!-- ratio-4-1 — 4 : 1 (thin rail) -->
<div class="wui-split ratio-4-1">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
<!-- ratio-2-3 — 2 : 3 (detail-heavy panel) -->
<div class="wui-split ratio-2-3">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
```

### panel-start — dock panel on the left

Swaps the column order (panel first) and moves the divider to the panel's right edge. Use for a filter rail or nav sidebar. Combines with any ratio class.

```html
<!-- panel-start + ratio-2-3 — narrow panel docked left -->
<div class="wui-split panel-start ratio-2-3">
  <div class="wui-split-panel"><!-- Panel (docked left) --></div>
  <div class="wui-split-main"><!-- Main pane --></div>
</div>
```

### is-collapsed — panel slid shut

Collapses the panel column to `0fr` so the main pane fills. Kept as a real 0fr column (not `display:none`) so the change animates. The static structure is below; the button next to it is a live, JS-driven collapse toggle.

```html
<!-- Static is-collapsed state — panel hidden, main fills -->
<div class="wui-split ratio-3-1 is-collapsed">
  <div class="wui-split-main"><!-- Main pane (panel collapsed) --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
```

### Declarative collapse toggle (data-wui-panel-close)

Interactivity is JS-driven and handled by `weoc-ui.js`. A `[data-wui-panel-close="#id"]` button toggles the target split's close class (default `is-collapsed`) and clears any linked active items — no page script needed. Live demo:

```html
<!-- Declarative: this button collapses/reopens the split below -->
<div class="wui-toolbar plain">
  <button class="wui-btn outline secondary wui-btn-sm" data-wui-panel-close="#demo-split-collapse">
    <span class="material-symbols-outlined">right_panel_close</span> Toggle panel
  </button>
</div>
<div class="wui-split ratio-2-1" id="demo-split-collapse">
  <div class="wui-split-main"><!-- Main pane --></div>
  <div class="wui-split-panel"><!-- Panel --></div>
</div>
```

Programmatic control (`WUI.open` / `WUI.close` / `WUI.toggle`) and the full attribute reference are on the [JS API](js-api.md) page. `panel-active` is a narrow-screen (max-width 900px) modifier that hands the single visible pane to the panel; it only takes effect below that breakpoint, so it is documented but not previewable at desktop width.

## wui-scroll-area

Independently scrollable record feed. `flex:1; overflow-y:auto` — fills the remaining height in a flex-column parent and scrolls while siblings stay put. Reserves a stable scrollbar gutter (no layout shift). Density modifiers change the gap; `is-grid` turns it into a responsive card gallery.

### Default feed (fills & scrolls)

```html
<!-- wui-scroll-area inside a fixed-height flex column -->
<div class="wui-fill-area">
  <div class="wui-scroll-area">
    <!-- Record cards here -->
  </div>
</div>
```

### Density — is-tight / is-roomy

```html
<!-- is-tight — smaller gap -->
<div class="wui-scroll-area is-tight">
  <!-- Record cards here -->
</div>
<!-- is-roomy — larger gap -->
<div class="wui-scroll-area is-roomy">
  <!-- Record cards here -->
</div>
```

### is-grid — responsive card gallery

Switches to a CSS grid of auto-filled columns. Override the min column width with `--wui-scroll-col` (default 280px).

```html
<!-- is-grid — auto-fill gallery -->
<div class="wui-scroll-area is-grid" style="--wui-scroll-col:150px">
  <!-- Card tiles here -->
</div>
```

## wui-fill-area

Non-scrolling counterpart to `wui-scroll-area`. Fills the remaining height in a flex-column parent (`flex:1; overflow:hidden`) but does not scroll — use it to wrap a grid or a fixed-height layout that manages its own overflow. Add a `wui-gap-*` utility if you need spacing between direct children.

```html
<!-- wui-fill-area — clips, does not scroll -->
<div class="wui-main-div">
  <!-- Fixed header -->
  <div class="wui-fill-area">
    <!-- Fills remaining height, no scroll -->
  </div>
</div>
```

## Tab shell — wui-det-body · wui-det-inner · wui-tab-panel

The details / input tab shell. `wui-det-body` is the `flex:1; overflow:hidden` region that holds the panels. `wui-det-inner` is a single `max-width:1100px` centering column placed once between header and footer, so every panel shares the header/footer alignment. `wui-tab-panel` is `display:none` until it gets `active`, then it becomes the scroll container.

### DOM nesting

```html
<!-- Nesting: det-inner → det-body → tab-panel.active -->
<div class="wui-det-inner">
  <div class="wui-det-body">
    <!-- Only the .active panel is visible -->
    <div class="wui-tab-panel active">
      <!-- Active panel content (scrolls) -->
    </div>
    <!-- Inactive panels: display:none -->
    <div class="wui-tab-panel">
      <!-- Hidden panel content -->
    </div>
  </div>
</div>
```

### Active vs inactive panels (contained)

Tab switching is JS-driven: script moves the `active` class between the header tab and its panel. See the tab/list toggle pattern below and the [JS API](js-api.md) page. The structure is static here — the first panel carries `active`.

```html
<!-- Static: panel 1 active, panels 2/3 hidden -->
<div class="wui-det-body">
  <!-- Details tab — active -->
  <div class="wui-tab-panel active">
    <!-- Active panel content -->
  </div>
  <!-- Info tab — inactive -->
  <div class="wui-tab-panel">
    <!-- Hidden panel content -->
  </div>
  <!-- Attachments tab — inactive -->
  <div class="wui-tab-panel">
    <!-- Hidden panel content -->
  </div>
</div>
```

### is-list-mode — stack all panels in one scroll

A JS toggle (`toggleViewMode()`) adds `is-list-mode` to `wui-det-body`: header tabs hide, every `wui-tab-panel` becomes `display:block; height:auto`, and the `det-body` itself becomes the scroll container. Below is the static list-mode structure — all panels visible and stacked.

```html
<!-- Static is-list-mode — all panels stacked, det-body scrolls -->
<div class="wui-det-body is-list-mode">
  <div class="wui-tab-panel">
    <!-- Details panel -->
  </div>
  <div class="wui-tab-panel">
    <!-- Info panel -->
  </div>
  <div class="wui-tab-panel">
    <!-- Attachments panel -->
  </div>
</div>
```

`wui-det-inner .wui-tab-panel` gets vertical breathing room automatically.

## wui-toolbar

Horizontal bar for grouping actions and controls. Base has surface chrome (background + border). Compose with `wui-toolbar-group` (a tight cluster), `wui-toolbar-sep` (a vertical divider), and `wui-toolbar-spacer` (pushes following items to the far end).

### Full toolbar — groups, separator, spacer

```html
<!-- Chromed bar with two left groups, a divider, a spacer, and a right group -->
<div class="wui-toolbar">
  <div class="wui-toolbar-group">
    <button class="wui-btn ghost secondary wui-btn-sm icon-only" title="List"><span class="material-symbols-outlined">list</span></button>
    <button class="wui-btn ghost secondary wui-btn-sm icon-only" title="Grid"><span class="material-symbols-outlined">grid_view</span></button>
  </div>
  <!-- Vertical divider between groups -->
  <div class="wui-toolbar-sep"></div>
  <div class="wui-toolbar-group">
    <button class="wui-btn ghost secondary wui-btn-sm"><span class="material-symbols-outlined">filter_list</span> Filter</button>
  </div>
  <!-- Spacer pushes the next group to the far end -->
  <div class="wui-toolbar-spacer"></div>
  <div class="wui-toolbar-group">
    <button class="wui-btn primary wui-btn-sm"><span class="material-symbols-outlined">add</span> New</button>
  </div>
</div>
```

### plain — no chrome

`.plain` drops the background, border, and padding, leaving just the flex layout. Useful for a borderless action row.

```html
<!-- Plain toolbar — flex layout only, no surface -->
<div class="wui-toolbar plain">
  <div class="wui-toolbar-group">
    <button class="wui-btn outline secondary wui-btn-sm"><span class="material-symbols-outlined">sort</span> Sort</button>
    <button class="wui-btn outline secondary wui-btn-sm"><span class="material-symbols-outlined">download</span> Export</button>
  </div>
  <div class="wui-toolbar-spacer"></div>
  <div class="wui-toolbar-group">
    <button class="wui-btn ghost secondary wui-btn-sm icon-only" title="More"><span class="material-symbols-outlined">more_horiz</span></button>
  </div>
</div>
```

## wui-list & wui-card-stack

Two vertical column primitives. `wui-list` is a self-scrolling card column (`overflow-y:auto`) — use it when the column owns its own scroll. `wui-card-stack` is a non-scrolling column that grows with its content — place it inside a `wui-det-body` / `wui-tab-panel` that handles the scroll. Both are flex columns with a gap.

### wui-list — self-scrolling column

```html
<!-- wui-list — scrolls internally -->
<div class="wui-list">
  <!-- List item cards here -->
</div>
```

### wui-card-stack — grows with content

```html
<!-- wui-card-stack — non-scrolling, grows; place in a scroll parent -->
<div class="wui-card-stack">
  <!-- Stacked cards here -->
</div>
```

## wui-grid-view & wui-details-panel

The classic master-detail grid (list / map or list / detail). `wui-grid-view` is a 2-column grid with named areas `list` and `right`. The left child (a `wui-list` card column or a table) fills `list`; `wui-details-panel` slides into `right` when a record is selected. Add `list-only` to collapse to a single column when the panel is hidden. `wui-split` supersedes this for boards that opt in, but `wui-grid-view` is kept for boards on the older grid.

### Two-column (record selected)

```html
<!-- wui-grid-view — list left, details-panel visible on the right -->
<div class="wui-grid-view">
  <div class="wui-list" style="grid-area:list">
    <!-- Record cards here -->
  </div>
  <!-- wui-details-panel.visible — slides into the "right" area -->
  <div class="wui-details-panel visible">
    <!-- wui-panel-close-btn — anchored top-left inside the panel -->
    <button class="wui-action-btn wui-panel-close-btn" title="Close"><span class="material-symbols-outlined">close</span></button>
    <!-- Selected record detail -->
  </div>
</div>
```

### list-only (no selection)

With `list-only` the grid collapses to a single full-height column; the details panel stays hidden. JS adds `visible` to the panel and removes `list-only` when a row is opened.

```html
<!-- wui-grid-view.list-only — single column, panel hidden -->
<div class="wui-grid-view list-only">
  <div class="wui-list">
    <!-- Record cards here -->
  </div>
  <!-- Panel present but hidden (no .visible) -->
  <div class="wui-details-panel"></div>
</div>
```

## wui-cards-grid

Responsive auto-fill card wall. Columns are `repeat(auto-fill, minmax(var(--wui-card-min, 260px), 1fr))` — set `--wui-card-min` to change the card breakpoint.

```html
<!-- wui-cards-grid — override min card width via --wui-card-min -->
<div class="wui-cards-grid" style="--wui-card-min:160px">
  <!-- Card cells here -->
</div>
```

## wui-two-col

Equal-width two-column grid for previews, config panels, and side-by-side content. Default `align-items:start`; add `align-stretch` to make both columns fill the row height.

### Default (align-items: start)

```html
<!-- wui-two-col — equal columns, top-aligned -->
<div class="wui-two-col">
  <!-- Left column -->
  <!-- Right column -->
</div>
```

### align-stretch (fill height)

```html
<!-- wui-two-col.align-stretch — both columns match the tallest -->
<div class="wui-two-col align-stretch">
  <!-- Left column (stretched) -->
  <!-- Right column -->
</div>
```

## wui-sidebar-layout

Fixed sidebar rail + fluid content. Columns are `var(--wui-sidebar-width, 300px) 1fr` — override the rail width with `--wui-sidebar-width`.

```html
<!-- wui-sidebar-layout — override rail via --wui-sidebar-width -->
<div class="wui-sidebar-layout" style="--wui-sidebar-width:140px">
  <!-- Sidebar rail -->
  <!-- Main content -->
</div>
```

## wui-split-pane

Asymmetric grid split for scope views (list left : detail right). Default ratio is `5fr : 7fr` via `--wui-split-left` / `--wui-split-right`; both columns use `minmax(0, …)` so they can shrink. Fills its flex parent (`flex:1; overflow:hidden`). Distinct from `wui-split` — this is a plain grid template with no collapse/animation behavior.

```html
<!-- wui-split-pane — override ratio via --wui-split-left / --wui-split-right -->
<div class="wui-split-pane">
  <!-- List column (5fr) -->
  <!-- Detail column (7fr) -->
</div>
```

## wui-field-row

Responsive grid for form field layout. Base is 2 columns; `full` / `col1` = single column, `col3` = three, `col4` = four. `wui-field-item` is a labelled field cell; `wui-field-label` is the uppercase caption; `wui-required` marks a required field in the danger color.

### 2-column (base) + full-width row

```html
<!-- Default 2-col row -->
<div class="wui-field-row">
  <div class="wui-field-item">
    <label class="wui-field-label">First Name <span class="wui-required">*</span></label>
    <input type="text" class="form-control" placeholder="First name">
  </div>
  <div class="wui-field-item">
    <label class="wui-field-label">Last Name</label>
    <input type="text" class="form-control" placeholder="Last name">
  </div>
</div>
<!-- full — single column spanning the row -->
<div class="wui-field-row full">
  <div class="wui-field-item">
    <label class="wui-field-label">Notes</label>
    <textarea class="form-control" placeholder="Notes…"></textarea>
  </div>
</div>
```

### col3 / col4 — three & four columns

```html
<!-- col3 — three columns -->
<div class="wui-field-row col3">
  <div class="wui-field-item"><label class="wui-field-label">City</label><input type="text" class="form-control"></div>
  <div class="wui-field-item"><label class="wui-field-label">State</label><input type="text" class="form-control"></div>
  <div class="wui-field-item"><label class="wui-field-label">ZIP</label><input type="text" class="form-control"></div>
</div>
<!-- col4 — four columns -->
<div class="wui-field-row col4">
  <div class="wui-field-item"><label class="wui-field-label">Q1</label><input type="text" class="form-control"></div>
  <div class="wui-field-item"><label class="wui-field-label">Q2</label><input type="text" class="form-control"></div>
  <div class="wui-field-item"><label class="wui-field-label">Q3</label><input type="text" class="form-control"></div>
  <div class="wui-field-item"><label class="wui-field-label">Q4</label><input type="text" class="form-control"></div>
</div>
```

## wui-table-view

Scrollable padded wrapper for a full-view table (`flex:1; overflow-y:auto; padding: space-3`). Use it as the content region of a display view whose body is a single table rather than a card feed. Table styling itself lives on the [Tables](tables.md) page; `wui-table-view` only provides the scroll container.

```html
<!-- wui-table-view — scroll container for a table body -->
<div class="wui-main-div">
  <!-- Fixed header -->
  <div class="wui-table-view">
    <!-- Table rows here -->
  </div>
</div>
```

## Dashboard grid (wui-widget)

The dashboard widget grid (`wui-widget`, `wui-widget-hdr`, `wui-widget-body`, drag handle, etc.) is **not** defined in `weoc-layout.css` — this stylesheet only carries a `TODO` placeholder for it. The real `wui-widget` component ships in `weoc-containers.css`, so it is documented on the [Cards & Containers](containers.md) page rather than here.
