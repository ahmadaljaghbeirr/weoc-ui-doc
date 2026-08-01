# Board Views

[← Index](README.md)

Abstract layout skeletons and paste-ready structure for the four WebEOC board view types — Display, Input, Details, and Remove.

## Display Views

Display views render a filterable, sortable list of board records. The `wui-split` is the full-page shell — it spans the entire viewport height from the very top. The header, KPI row, filter bar, and table all live *inside* `wui-split-main` (left column), not above the split. This gives the right panel the full page height. Three structural variants exist based on whether the right panel is present and what it contains.

### Variants at a glance

| Variant | Name | Description |
|---|---|---|
| Type A | Standard list | `wui-split` shell. KPI row + filter bar + table on the left. Collapsible detail panel on the right. |
| Type B | Map list | Type A + a map panel that shares the right column with the detail panel. A toggle in the header switches between the two. |
| Type C | Flat list | No `wui-split`. Full-width table. Used for simpler or read-only boards that don't need a detail panel. |

### Type A — Standard list

The dominant pattern. A `wui-split ratio-3-2` divides the board into a main column (header, KPI row, filter bar, table) and a collapsible right panel (detail embed). Panel starts collapsed; a row click opens it and loads the detail view via BoardScript.

**Zone diagram** — outer shell `.wui-main-div`, containing a full-height split row. Left column (`.wui-split ratio-3-2 → .wui-split-main`, 60%):

| Zone | Class(es) | Note |
|---|---|---|
| HEADER *(optional: tabs row)* | `.wui-hdr-wrap → .wui-hdr-top [ .wui-hdr-left · .wui-hdr-right ]` | title + subtitle · action buttons · optional tab row below |
| KPI ROW *(optional)* | `.wui-kpi-row → .wui-card.is-metric × N` | metric cards: icon-bubble + label + value |
| FILTER BAR | `.wui-filter-row → search · selects · sort · actions` | — |
| TABLE | `.wui-scroll-area → .wui-table-wrap → table.wui-table-cards` | flex:1 · scrolls independently · sticky thead |

Right column (`.wui-det-body`, 40%, full page height):

| Zone | Note |
|---|---|
| DETAIL PANEL | full page height · collapsed by default (is-collapsed on split) · detail embed loads on row activate |

#### Abstract skeleton — Type A

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

#### Zone reference

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

**Zone diagram** — same `.wui-main-div` shell. Left column (`.wui-split ratio-3-2 → .wui-split-main`):

| Zone | Class(es) | Note |
|---|---|---|
| HEADER | `.wui-hdr-wrap` | + map/list toggle btn · localStorage restores panel mode on load |
| KPI ROW *(optional)* | `.wui-kpi-row` | — |
| FILTER BAR | `.wui-filter-row` | — |
| TABLE | `.wui-scroll-area → .wui-table-wrap → table.wui-table-cards` | — |

Right column — two states, toggled by JS:

| Zone (state) | Class(es) | Note |
|---|---|---|
| DETAIL state | `.wui-det-body` | visible when mode = 'list' or on row activate |
| MAP state | `.wui-map-panel` | visible when mode = 'map' · ArcGIS viewDiv inside |

> **What changes vs Type A:** The right column hosts two swappable states instead of one. The header gains a `wui-view-toggle-btn` (map ↔ list). Panel default state comes from `localStorage` rather than a hardcoded `.is-collapsed`. The map state has its own init/destroy lifecycle tied to the toggle.

### Type C — Flat list

No `wui-split` — the content is a single flex column the full page width. Header, KPI row, filter bar, and table stack vertically without any right panel. Used for read-only boards, audit logs, or views where opening a record navigates to a separate board rather than embedding inline. No panel state management needed.

> **Spacing alignment:** In Types A and B, the vertical gap between header, KPI row, filter bar, and table comes from `.wui-split-main { gap: var(--space-3) }`. Type C has no split, so `.wui-main-div` defaults to `gap: 0`. Add `.wui-gap-3` to keep the section spacing identical.

**Zone diagram** — `.wui-main-div.wui-gap-3` — single flex column, full width:

| Zone | Class(es) | Note |
|---|---|---|
| HEADER | `.wui-hdr-wrap → .wui-hdr-top [ .wui-hdr-left · .wui-hdr-right ]` | minimal — no Add button, no panel toggle, no map toggle |
| KPI ROW *(often omitted)* | `.wui-kpi-row` | — |
| FILTER BAR | `.wui-filter-row` | — |
| TABLE — full width | `.wui-scroll-area → .wui-table-wrap → table.wui-table-cards` | no data-wui-activate · row click navigates or is inert |

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

| Variant | Name | Description |
|---|---|---|
| Variant 1 | Single panel | One `wui-det-body` with stacked `wui-panel-wrap` sections. No tabs. Best for short forms (one or two sections). |
| Variant 2 | Multi-tab | A `wui-hdr-tabs` row; each tab is a `wui-tab-panel`, `switchTab()` navigates. Optional **Tab / List toggle** flattens every tab into one scroll. |

### Variant 1 — Single panel

No tabs. The form body is one `wui-det-body` holding stacked `wui-panel-wrap` sections, centered by `wui-det-inner`. The body scrolls; header and footer stay fixed.

**Zone diagram** — `.wui-page-shell` — full-page flex column:

| Zone | Class(es) | Note |
|---|---|---|
| HEADER | `.wui-hdr-wrap.centered → .wui-hdr-inner → .wui-hdr-top` | title (New / Edit via `<choose>`) + subtitle |
| FORM BODY | `form.input-form → .wui-det-inner → .wui-det-body` | stacked .wui-panel-wrap → .wui-panel · fields = field-row → field-item · flex:1 · scrolls |
| FOOTER | `.wui-ftr-wrap.centered → .wui-ftr-inner → .wui-ftr-body` | Cancel (returnlink) + Save · outside the form |

#### Abstract skeleton — Variant 1

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

**Zone diagram** — `.wui-page-shell` — full-page flex column:

| Zone | Class(es) | Note |
|---|---|---|
| HEADER *(+ optional Tab / List toggle, right)* | `.wui-hdr-wrap.centered → .wui-hdr-top [ .wui-hdr-left · .wui-hdr-right ]` | — |
| TAB STRIP | `.wui-hdr-tabs → .wui-hdr-tab × N (onclick switchTab)` | — |
| FORM BODY | `form.input-form[data-tab-panel] → .wui-det-inner → .wui-det-body` | .wui-tab-panel.active shown (tab mode) · all panels stacked when .is-list-mode |
| FOOTER | `.wui-ftr-wrap.centered` | — |

#### Abstract skeleton — Variant 2 (deltas from Variant 1)

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

#### Tab / List toggle — JavaScript

Tab mode shows one `wui-tab-panel.active` at a time. List mode adds `.is-list-mode` to `wui-det-body` (defined in `weoc-layout.css`), which forces every panel to `display:block; height:auto` and makes the body itself scroll; the tab strip is hidden. State persists per board in `localStorage`.

```js
let currentTab = 'details';
let isListMode = false;
const VIEW_MODE_KEY = 'myBoardViewMode';   // unique key per board

function switchTab(tab) {
  currentTab = tab;
  if (isListMode) return;                  // list mode shows all panels
  $('.wui-hdr-tab').removeClass('active');
  $('.wui-tab-panel').removeClass('active');
  $('#tab-' + tab).addClass('active');
  $('#panel-' + tab).addClass('active');
}

function toggleViewMode() {
  isListMode = !isListMode;
  applyViewMode();
  localStorage.setItem(VIEW_MODE_KEY, isListMode ? 'list' : 'tabs');
}

function applyViewMode() {
  if (isListMode) {
    $('.wui-hdr-tabs').hide();
    $('.wui-tab-panel').addClass('active');
    $('.wui-det-body').addClass('is-list-mode');
    $('#view-toggle-icon').text('tab');
    $('#view-toggle-label').text('Tab Form');
  } else {
    $('.wui-hdr-tabs').show();
    $('.wui-tab-panel').removeClass('active');
    $('.wui-det-body').removeClass('is-list-mode');
    $('#panel-' + currentTab).addClass('active');
    $('#tab-' + currentTab).addClass('active');
    $('#view-toggle-icon').text('view_agenda');
    $('#view-toggle-label').text('List Form');
  }
}

// Restore saved mode on load
$(function () {
  if (localStorage.getItem(VIEW_MODE_KEY) === 'list') { isListMode = true; applyViewMode(); }
});
```

#### Zone reference

| Zone | Class(es) | Notes |
|---|---|---|
| **Shell** | `.wui-page-shell` | Full-page flex column. Holds header, form, and footer in order. |
| **Header** | `.wui-hdr-wrap.centered` | Title (New / Edit via `<choose>`) + subtitle. Multi-tab adds a `.wui-hdr-tabs` row and, optionally, a Tab / List toggle in `.wui-hdr-right`. |
| **Form** | `form.input-form` | Flex:1 column (rules from `weoc-forms.css`). Carries `insertfields` / `updatefields` / hidden inputs / `savebutton`. Add `data-tab-panel="true"` for multi-tab so hidden-tab fields still validate. |
| **Content frame** | `.wui-det-inner → .wui-det-body` | `wui-det-inner` centers at max-width 1100px (aligned with header/footer). Single-panel: stacked `wui-panel-wrap`. Multi-tab: one `wui-tab-panel` per tab. |
| **Fields** | `.field-row → .field-item` | Editable field grid (from `weoc-forms.css`). `.field-item-full` spans the row; `.field-row.full` is a single full-width column. |
| **Footer** | `.wui-ftr-wrap.centered` | Save / Cancel bar. Lives *outside* the form, directly in the shell. `#bSave` validates then clicks the hidden `#bOriginalSave`. |

> **CSS required:** Input views load `weoc-ui-core.css` **and** `weoc-forms.css` (the form flex rules + footer padding flush). The display/details views do not need `weoc-forms.css`.

## Details Views

Read-only record views. Same `wui-page-shell` skeleton as an input view but with **no `<form>` and no footer save bar**. The header carries the record title, number, and a status badge; the body presents fields with the read-only `wui-info-grid` (not `field-row` / `field-item`). A details view either renders standalone or is embedded into the **Display Type A** right panel (`.wui-det-body`) via BoardScript. Two structural variants — single-panel and multi-tab.

### Variants at a glance

| Variant | Name | Description |
|---|---|---|
| Variant 1 | Single panel | Stacked `wui-panel-wrap` sections of `wui-info-grid`. No tabs. Common for short records embedded in the Display panel. |
| Variant 2 | Multi-tab | Scrollable `wui-hdr-tabs-wrap` strip with arrow FABs + edge shadows. One `wui-tab-panel` per tab; `switchTab()` navigates. |

### Variant 1 — Single panel

No tabs. The body is one `wui-det-body` with stacked `wui-panel-wrap` sections, each a `wui-info-grid` of read-only label/value pairs.

**Zone diagram** — `.wui-page-shell` — full-page flex column:

| Zone | Class(es) | Note |
|---|---|---|
| HEADER *(+ optional Back, embed only)* | `.wui-hdr-wrap.centered → .wui-hdr-top [ .wui-hdr-left · .wui-hdr-right ]` | title + #record number + status badge · Back in .wui-hdr-actions |
| BODY | `.wui-det-inner → .wui-det-body` | stacked .wui-panel-wrap → .wui-panel → .wui-info-grid (read-only) · no form, no footer |

#### Abstract skeleton — Variant 1

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

**Zone diagram** — `.wui-page-shell` — full-page flex column:

| Zone | Class(es) | Note |
|---|---|---|
| HEADER | `.wui-hdr-wrap.centered → title + #record + status badge` | — |
| TAB STRIP *(scrollable)* | `.wui-hdr-tabs-wrap [ .wui-fab.tabs-scroll-left · .wui-hdr-tabs · .wui-fab.tabs-scroll-right ]` | arrow FABs + edge shadows (.has-left / .has-right) · wheel scrolls |
| BODY | `.wui-det-inner → .wui-det-body → .wui-tab-panel.active` | .wui-panel → .wui-info-grid (read-only) |

#### Abstract skeleton — Variant 2 (tab strip + body)

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

#### JavaScript

```js
// Switch header tabs (multi-tab only)
function switchTab(tab) {
  $('.wui-hdr-tab').removeClass('active');
  $('.wui-tab-panel').removeClass('active');
  $('#tab-' + tab).addClass('active');
  $('#panel-' + tab).addClass('active');
}

// Mark blank read-only values so CSS shows an em-dash placeholder
function applyEmptyStates() {
  $('.wui-info-value').each(function () {
    if (!$(this).text().trim()) $(this).addClass('is-empty');
  });
}

// Edge shadows + arrow buttons + wheel scroll for the tab strip (multi-tab only)
function setupTabsScrollShadow() {
  var $tabs = $('#det-tabs'), $wrap = $('#det-tabs-scroll-wrap');
  function updateShadows() {
    var el = $tabs[0];
    $wrap.toggleClass('has-left',  el.scrollLeft > 0);
    $wrap.toggleClass('has-right', el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }
  $tabs.on('scroll', updateShadows);
  $('#tabs-scroll-left').on('click',  function () { $tabs[0].scrollBy({ left: -160, behavior: 'smooth' }); });
  $('#tabs-scroll-right').on('click', function () { $tabs[0].scrollBy({ left:  160, behavior: 'smooth' }); });
  $tabs.on('wheel', function (e) {
    if (e.originalEvent.deltaY !== 0) { e.preventDefault(); $tabs[0].scrollLeft += e.originalEvent.deltaY; }
  });
  updateShadows();
}

$(function () {
  applyEmptyStates();
  setupTabsScrollShadow();   // omit for the single-panel variant
});
```

#### Zone reference

| Zone | Class(es) | Notes |
|---|---|---|
| **Header** | `.wui-hdr-wrap.centered` | Title + `#` record number + status badge (class via `<choose>`). Optional Back button in `.wui-hdr-actions`, shown only for embed/dialog views. |
| **Tab strip** *(multi-tab)* | `.wui-hdr-tabs-wrap` | Scrollable: `.wui-fab.tabs-scroll-left` / `-right` arrow buttons + edge shadows toggled by `.has-left` / `.has-right`. Mouse wheel scrolls the strip. |
| **Content frame** | `.wui-det-inner → .wui-det-body` | Same centering as input. Single-panel: stacked `wui-panel-wrap`. Multi-tab: one `wui-tab-panel` per tab. |
| **Fields** | `.wui-info-grid → .wui-info-item` | Read-only label/value grid. `.wui-info-label` (icon + text) + `.wui-info-value`. `.col3` / `.col4` set column count. `applyEmptyStates()` adds `.is-empty` to blank values. |

> **Input vs Details — what changes:** No `<form>` and no footer (display is read-only). Fields use `wui-info-grid` instead of `field-row` / `field-item`. Tabs use the scrollable `wui-hdr-tabs-wrap` strip instead of the plain `wui-hdr-tabs`. CSS = `weoc-ui-core.css` only (no `weoc-forms.css`).

## Remove Views

Confirmation dialogs for record deletion — always opened as a modal or embed from a row action.

*Coming soon — layout sketch pending.*
