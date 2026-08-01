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

## Board Views

Abstract layout skeletons and paste-ready structure for the four WebEOC board view types — Display, Input, Details, and Remove.

## Display Views

Display views render a filterable, sortable list of board records. The `wui-split` is the full-page shell — it spans the entire viewport height from the very top. The header, KPI row, filter bar, and table all live *inside* `wui-split-main` (left column), not above the split. This gives the right panel the full page height. Three structural variants exist based on whether the right panel is present and what it contains.

### Variants at a glance

### Type A — Standard list

The dominant pattern. A `wui-split ratio-3-2` divides the board into a main column (header, KPI row, filter bar, table) and a collapsible right panel (detail embed). Panel starts collapsed; a row click opens it and loads the detail view via BoardScript.

### Abstract skeleton — Type A

```html
<div class="wui-main-div">

  <!-- ── SPLIT is the full-page shell ─────────────────────────── -->
  <div class="wui-split ratio-3-2 is-collapsed" id="main-split">

    <!-- ── LEFT: header + content ────────────────────────────── -->
    <div class="wui-split-main">

      <!-- HEADER -->
      <div class="wui-hdr-wrap">
        <div class="wui-hdr-top">
          <div class="wui-hdr-left">
            <span class="wui-hdr-title">Board Title</span>
            <span class="wui-hdr-subtitle">Context · record count</span>
          </div>
          <div class="wui-hdr-right">
            <!-- conditional: only show Add when incident is open -->
            <button class="wui-btn wui-btn-xs primary">
              <span class="material-symbols-outlined">add</span> Add
            </button>
            <button class="wui-btn wui-btn-xs outline secondary icon-only" title="Settings">
              <span class="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
        <!-- optional second row: wui-hdr-tabs for view switching -->
      </div>

      <!-- KPI ROW (optional) -->
      <div class="wui-kpi-row">
        <div class="wui-card is-metric">
          <div class="wui-card-hdr">
            <span class="wui-icon-bubble sm primary">
              <span class="material-symbols-outlined">inbox</span>
            </span>
            <span class="wui-card-label">Total</span>
          </div>
          <div class="wui-card-value">—</div>
        </div>
        <!-- repeat wui-card.is-metric for each metric -->
      </div>

      <!-- FILTER BAR -->
      <div class="wui-filter-row">
        <div class="wui-search-wrap">
          <input class="wui-search" type="search" id="search-input" placeholder="Search…">
        </div>
        <!-- TomSelect-enhanced selects -->
        <select class="tomselect" id="filter-status" data-placeholder="Status">
          <option value="">All</option>
        </select>
        <!-- sort dropdown, advanced filter toggle -->
      </div>

      <!-- TABLE -->
      <div class="wui-scroll-area">
        <div class="wui-table-wrap">
          <table class="wui-table-cards" id="records-table">
            <thead>
              <tr>
                <th class="wui-col-sm wui-cell-center">#</th>
                <th class="wui-col-primary">Title</th>
                <th class="wui-col-md">Status</th>
                <th class="wui-col-md">Date</th>
                <th class="wui-col-sm"></th><!-- actions -->
              </tr>
            </thead>
            <tbody id="items-body">
              <!-- XSL: for-each record -->
              <tr data-wui-activate="true"
                  data-wui-group="#items-body tr"
                  data-wui-active="is-selected"
                  data-wui-panel="#main-split">
                <td class="wui-cell-num"><!-- record # --></td>
                <td class="wui-cell-truncate"><!-- title --></td>
                <td><!-- status badge --></td>
                <td><!-- date --></td>
                <td><!-- row actions popover --></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div><!-- /wui-scroll-area -->

    </div><!-- /wui-split-main -->

    <!-- ── RIGHT: detail panel — full page height ─────────── -->
    <div class="wui-det-body" id="details-panel">
      <div class="wui-det-hdr">
        <button class="wui-btn wui-btn-xs ghost secondary icon-only"
                data-wui-panel-close="#main-split"
                title="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="wui-det-content" id="details-embed">
        <!-- BoardScript.OpenView loads detail/input view here -->
      </div>
    </div><!-- /wui-det-body -->

  </div><!-- /wui-split -->

</div><!-- /wui-main-div -->
```

### Zone reference

| Zone | Class(es) | Notes |
|---|---|---|
| **Outer shell** | `.wui-main-div` | Outermost wrapper — padded flex column, fills the viewport. Holds the split directly, nothing else. |
| **Full-page split** | `.wui-split.ratio-3-2` | Spans the full viewport height from top. The header lives *inside* the left column — not above the split. Start with `.is-collapsed` unless map view requires localStorage persistence. |
| **Header** | `.wui-hdr-wrap` | Inside `.wui-split-main`. Sticky within the left column. `.wui-hdr-top` holds title + actions. Optional `.wui-hdr-tabs` row below. |
| **KPI row** | `.wui-kpi-row` | Optional. One `.wui-card.is-metric` per summary stat. Lives below the header, above the filter bar. Omit entirely when no summary is needed. |
| **Filter bar** | `.wui-filter-row` | Search + TomSelect-enhanced selects + sort. Advanced-filter toggle optional. Fixed height, does not scroll. |
| **Table** | `.wui-scroll-area → .wui-table-wrap → table.wui-table-cards` | Takes all remaining flex height in the left column, scrolls independently. Rows use `data-wui-activate` to open the detail panel. |
| **Detail panel** | `.wui-det-body` | Right column of the split. Full page height. Collapsed by default (`.is-collapsed` on the split). Receives the embedded view via `BoardScript.OpenView`. |

### Type B — Map list

Type A extended with a map panel. The right column of the split hosts two states: the detail embed (default) and a map view. A toggle button in the header switches between them. View state persists to `localStorage` so the user's preferred mode survives page refreshes.

> **What changes vs Type A The right column hosts two swappable states instead of one. The header gains a `wui-view-toggle-btn` (map ↔ list). Panel default state comes from `localStorage` rather than a hardcoded `.is-collapsed`. The map state has its own init/destroy lifecycle tied to the toggle.**

``

> **````````**

### Type C — Flat list No wui-split — the content is a single flex column the full page width. Header, KPI row, filter bar, and table stack vertically without any right panel. Used for read-only boards, audit logs, or views where opening a record navigates to a separate board rather than embedding inline. No panel state management needed. Spacing alignment In Types A and B, the vertical gap between header, KPI row, filter bar, and table comes from .wui-split-main { gap: var(--space-3) }. Type C has no split, so .wui-main-div defaults to gap: 0. Add .wui-gap-3 to keep the section spacing identical. .wui-main-div.wui-gap-3 — single flex column, full width HEADER .wui-hdr-wrap → .wui-hdr-top [ .wui-hdr-left · .wui-hdr-right ] minimal — no Add button, no panel toggle, no map toggle

```html
<!-- wui-gap-3 matches the gap: var(--space-3) on .wui-split-main -->
<div class="wui-main-div wui-gap-3">

  <!-- HEADER -->
  <div class="wui-hdr-wrap">
    <div class="wui-hdr-top">
      <div class="wui-hdr-left">
        <span class="wui-hdr-title">Board Title</span>
      </div>
      <div class="wui-hdr-right">
        <!-- minimal actions -->
      </div>
    </div>
  </div>

  <!-- KPI ROW (optional) -->
  <div class="wui-kpi-row"><!-- ... --></div>

  <!-- FILTER BAR -->
  <div class="wui-filter-row"><!-- ... --></div>

  <!-- TABLE — full width, no split -->
  <div class="wui-scroll-area">
    <div class="wui-table-wrap">
      <table class="wui-table-cards" id="records-table">
        <thead><tr><!-- headers --></tr></thead>
        <tbody id="items-body">
          <!-- XSL: for-each record — no data-wui-activate -->
        </tbody>
      </table>
    </div>
  </div>

</div><!-- /wui-main-div -->
```

## Input Views

Full-page forms for creating and editing records. The `wui-page-shell` is the full-page flex column: a sticky **header** (title + optional tab row), a scrolling **form body** centered by `wui-det-inner`, and a sticky **footer** with Save / Cancel. The `<form class="input-form">` wraps the body and carries the WebEOC `insertfields` / `updatefields` / hidden inputs. Two structural variants exist based on whether the form is split into tabs.

### Variants at a glance

### Variant 1 — Single panel

No tabs. The form body is one `wui-det-body` holding stacked `wui-panel-wrap` sections, centered by `wui-det-inner`. The body scrolls; header and footer stay fixed.

### Abstract skeleton — Variant 1

```html
<div class="wui-page-shell">

  <!-- ── HEADER ───────────────────────────────────────────────── -->
  <div class="wui-hdr-wrap centered">
    <div class="wui-hdr-inner">
      <div class="wui-hdr-top">
        <div class="wui-hdr-left">
          <h1 class="wui-hdr-title">
            <choose>
              <when test="/data/@dataid = '0'">New Record</when>
              <otherwise>Edit Record</otherwise>
            </choose>
          </h1>
          <div class="wui-hdr-subtitle">Context line</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── FORM ─────────────────────────────────────────────────── -->
  <form class="input-form" data-validate-hidden="true">
    <insertfields><!-- system insert fields --></insertfields>
    <updatefields><!-- system update fields --></updatefields>
    <autonumber name="RecordNumber" digits="7">{YY}-{autonumber}</autonumber>
    <!-- hidden system inputs + module hidden block -->

    <div class="wui-det-inner">
      <div class="wui-det-body">

        <div class="wui-panel-wrap">
          <div class="wui-panel">
            <div class="wui-panel-hdr">
              <div class="wui-panel-title-wrap">
                <p class="wui-panel-title wui-text-sm wui-bold wui-text-primary">
                  <span class="material-symbols-outlined">info</span> Section Title
                </p>
              </div>
            </div>
            <div class="wui-panel-body no-scroll">
              <div class="wui-content-wrap">
                <div class="field-row">
                  <div class="field-item">
                    <label class="field-label">
                      <span class="material-symbols-outlined">title</span> Field
                      <span class="required"/>
                    </label>
                    <input type="text" name="Field" class="form-control" required="true"/>
                    <div class="field-error"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- repeat wui-panel-wrap for each section -->

      </div>
    </div>

    <div style="display:none"><savebutton id="bOriginalSave"/></div>
  </form>

  <!-- ── FOOTER ───────────────────────────────────────────────── -->
  <div class="wui-ftr-wrap centered">
    <div class="wui-ftr-inner">
      <div class="wui-ftr-body" style="justify-content:flex-end">
        <div class="wui-ftr-right">
          <returnlink>
            <button class="wui-btn outline danger" type="button">
              <span class="material-symbols-outlined">close</span> Cancel
            </button>
          </returnlink>
          <button id="bSave" class="wui-btn primary" type="button">
            <span class="material-symbols-outlined">save</span> Save
          </button>
        </div>
      </div>
    </div>
  </div>

</div><!-- /wui-page-shell -->
```

### Variant 2 — Multi-tab

The header gains a `wui-hdr-tabs` row; the body holds one `wui-tab-panel` per tab (first gets `.active`). The form needs `data-tab-panel="true"` so hidden-tab validation still fires. An optional **Tab / List toggle** in `wui-hdr-right` lets the user collapse all tabs into one continuous scroll.

### Abstract skeleton — Variant 2 (deltas from Variant 1)

```html
<div class="wui-hdr-inner">
  <div class="wui-hdr-top">
    <div class="wui-hdr-left"><h1 class="wui-hdr-title">New / Edit Record</h1></div>

    <!-- optional Tab / List toggle -->
    <div class="wui-hdr-right">
      <button type="button" id="btn-view-toggle" class="wui-btn outline wui-btn-sm"
              onclick="toggleViewMode()" title="Switch view mode">
        <span class="material-symbols-outlined" id="view-toggle-icon">view_agenda</span>
        <span id="view-toggle-label">List Form</span>
      </button>
    </div>
  </div>

  <!-- TAB STRIP -->
  <div class="wui-hdr-tabs">
    <div class="wui-hdr-tab active" id="tab-details" onclick="switchTab('details')">
      <span class="material-symbols-outlined">info</span> Details
    </div>
    <div class="wui-hdr-tab" id="tab-location" onclick="switchTab('location')">
      <span class="material-symbols-outlined">location_on</span> Location
    </div>
  </div>
</div>

<!-- FORM — note data-tab-panel="true" -->
<form class="input-form" data-validate-hidden="true" data-tab-panel="true">
  <!-- insertfields / updatefields / hidden inputs -->
  <div class="wui-det-inner">
    <div class="wui-det-body">
      <div class="wui-tab-panel active" id="panel-details">
        <div class="wui-panel-wrap"><div class="wui-panel"><!-- field-rows --></div></div>
      </div>
      <div class="wui-tab-panel" id="panel-location">
        <div class="wui-panel-wrap"><div class="wui-panel"><!-- field-rows --></div></div>
      </div>
    </div>
  </div>
  <div style="display:none"><savebutton id="bOriginalSave"/></div>
</form>
```

### Tab / List toggle — JavaScript

Tab mode shows one `wui-tab-panel.active` at a time. List mode adds `.is-list-mode` to `wui-det-body` (defined in `weoc-layout.css`), which forces every panel to `display:block; height:auto` and makes the body itself scroll; the tab strip is hidden. State persists per board in `localStorage`.

### Zone reference

| Zone | Class(es) | Notes |
|---|---|---|
| **Shell** | `.wui-page-shell` | Full-page flex column. Holds header, form, and footer in order. |
| **Header** | `.wui-hdr-wrap.centered` | Title (New / Edit via `<choose>`) + subtitle. Multi-tab adds a `.wui-hdr-tabs` row and, optionally, a Tab / List toggle in `.wui-hdr-right`. |
| **Form** | `form.input-form` | Flex:1 column (rules from `weoc-forms.css`). Carries `insertfields` / `updatefields` / hidden inputs / `savebutton`. Add `data-tab-panel="true"` for multi-tab so hidden-tab fields still validate. |
| **Content frame** | `.wui-det-inner → .wui-det-body` | `wui-det-inner` centers at max-width 1100px (aligned with header/footer). Single-panel: stacked `wui-panel-wrap`. Multi-tab: one `wui-tab-panel` per tab. |
| **Fields** | `.field-row → .field-item` | Editable field grid (from `weoc-forms.css`). `.field-item-full` spans the row; `.field-row.full` is a single full-width column. |
| **Footer** | `.wui-ftr-wrap.centered` | Save / Cancel bar. Lives *outside* the form, directly in the shell. `#bSave` validates then clicks the hidden `#bOriginalSave`. |

> **CSS required Input views load `weoc-ui-core.css` **and** `weoc-forms.css` (the form flex rules + footer padding flush). The display/details views do not need `weoc-forms.css`.**

## Details Views

Read-only record views. Same `wui-page-shell` skeleton as an input view but with **no `<form>` and no footer save bar**. The header carries the record title, number, and a status badge; the body presents fields with the read-only `wui-info-grid` (not `field-row` / `field-item`). A details view either renders standalone or is embedded into the **Display Type A** right panel (`.wui-det-body`) via BoardScript. Two structural variants — single-panel and multi-tab.

### Variants at a glance

### Variant 1 — Single panel

No tabs. The body is one `wui-det-body` with stacked `wui-panel-wrap` sections, each a `wui-info-grid` of read-only label/value pairs.

### Abstract skeleton — Variant 1

```html
<div class="wui-page-shell">

  <!-- ── HEADER ───────────────────────────────────────────────── -->
  <div class="wui-hdr-wrap centered">
    <div class="wui-hdr-inner">
      <div class="wui-hdr-top">
        <div class="wui-hdr-left">
          <div class="wui-hdr-title-row">
            <span class="wui-hdr-title"><eocfield name="Title"/></span>
            <span style="color: var(--color-border)">|</span>
            <span class="wui-text-sm wui-text-brand wui-bold">#<eocfield name="RecordNumber"/></span>
            <!-- status badge: class chosen from a field via <choose> -->
            <span class="wui-badge primary"><eocfield name="Status"/></span>
          </div>
          <div class="wui-hdr-subtitle"><eocfield name="Category"/></div>
        </div>
        <div class="wui-hdr-right">
          <div class="wui-hdr-actions">
            <!-- Back only when opened as an embedded / dialog view -->
            <if test="/data/ViewParameter[@name='isEmbedView'] = '1'">
              <returnlink><button class="wui-btn secondary outline" type="button">Back</button></returnlink>
            </if>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── BODY (no form, no footer) ────────────────────────────── -->
  <div class="wui-det-inner">
    <div class="wui-det-body">
      <div class="wui-panel-wrap">
        <div class="wui-panel">
          <div class="wui-panel-hdr"><div class="wui-panel-title-wrap"><!-- section title --></div></div>
          <div class="wui-panel-body">
            <div class="wui-content-wrap">
              <div class="wui-info-grid">
                <div class="wui-info-item">
                  <div class="wui-info-label"><span class="material-symbols-outlined">label</span> Field</div>
                  <div class="wui-info-value"><eocfield name="Field"/></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- repeat wui-panel-wrap for each section -->
    </div>
  </div>

</div><!-- /wui-page-shell -->
```

### Variant 2 — Multi-tab (scrollable strip)

Details views carry their tab strip in `wui-hdr-tabs-wrap` with two arrow FABs — the strip scrolls horizontally and reveals edge shadows (`has-left` / `has-right`) when it overflows. Each tab maps id `tab-X` to panel `panel-X` via `switchTab('X')`.

### Abstract skeleton — Variant 2 (tab strip + body)

```html
<!-- header tab strip -->
<div class="wui-hdr-tabs-wrap" id="det-tabs-scroll-wrap">
  <button type="button" class="wui-fab secondary neon-outline tabs-scroll-left" id="tabs-scroll-left">
    <span class="material-symbols-outlined">chevron_left</span>
  </button>
  <div class="wui-hdr-tabs" id="det-tabs">
    <div class="wui-hdr-tab active" id="tab-details" onclick="switchTab('details')">
      <span class="material-symbols-outlined">info</span> Details
    </div>
    <div class="wui-hdr-tab" id="tab-location" onclick="switchTab('location')">
      <span class="material-symbols-outlined">location_on</span> Location
    </div>
  </div>
  <button type="button" class="wui-fab secondary neon-outline tabs-scroll-right" id="tabs-scroll-right">
    <span class="material-symbols-outlined">chevron_right</span>
  </button>
</div>

<!-- body: one wui-tab-panel per tab, first gets .active -->
<div class="wui-det-inner">
  <div class="wui-det-body">
    <div class="wui-tab-panel active" id="panel-details">
      <div class="wui-panel-wrap"><div class="wui-panel"><!-- wui-info-grid --></div></div>
    </div>
    <div class="wui-tab-panel" id="panel-location">
      <div class="wui-panel-wrap"><div class="wui-panel"><!-- ... --></div></div>
    </div>
  </div>
</div>
```

### JavaScript

### Zone reference

| Zone | Class(es) | Notes |
|---|---|---|
| **Header** | `.wui-hdr-wrap.centered` | Title + `#` record number + status badge (class via `<choose>`). Optional Back button in `.wui-hdr-actions`, shown only for embed/dialog views. |
| **Tab strip** (multi-tab) | `.wui-hdr-tabs-wrap` | Scrollable: `.wui-fab.tabs-scroll-left` / `-right` arrow buttons + edge shadows toggled by `.has-left` / `.has-right`. Mouse wheel scrolls the strip. |
| **Content frame** | `.wui-det-inner → .wui-det-body` | Same centering as input. Single-panel: stacked `wui-panel-wrap`. Multi-tab: one `wui-tab-panel` per tab. |
| **Fields** | `.wui-info-grid → .wui-info-item` | Read-only label/value grid. `.wui-info-label` (icon + text) + `.wui-info-value`. `.col3` / `.col4` set column count. `applyEmptyStates()` adds `.is-empty` to blank values. |

> **Input vs Details — what changes No `&lt;form&gt;` and no footer (display is read-only). Fields use `wui-info-grid` instead of `field-row` / `field-item`. Tabs use the scrollable `wui-hdr-tabs-wrap` strip instead of the plain `wui-hdr-tabs`. CSS = `weoc-ui-core.css` only (no `weoc-forms.css`).**

## Remove Views

Confirmation dialogs for record deletion — always opened as a modal or embed from a row action.
