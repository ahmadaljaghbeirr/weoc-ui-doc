# Tables

[← Index](README.md)

Three table families for WebEOC record views: the flat bordered grid `wui-table-standard`, the spaced card-row layout `wui-table-cards`, and the dense operator log `wui-table-log`. Plus shared column widths, cell utilities, row accents, row action buttons, and density modifiers. Every variant and state is shown below with its exact markup.

> **Opt-in module — load weoc-tables.css after the core barrel:** Tables are not in `weoc-ui-core.css`. Add `&lt;link rel="stylesheet" href="../../CSS/weoc-ui/weoc-tables.css"&gt;` *after* the core stylesheet on any table view. The docs shell also injects it site-wide, but include it explicitly so views render on direct load.

## wui-table-standard

Flat, bordered table with fixed column layout (`table-layout: fixed`) and a sticky header. Wrap in `wui-table-wrap` for horizontal scroll and container queries. Compose column widths on the `<th>`, cell utilities and row-state classes on the `<tr>`/`<td>`.

### Base table — wrapper, header, actions column

```html
<!-- wui-table-wrap: scroll + container-query context -->
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <th class="wui-col-primary">Incident</th>
        <th class="wui-col-md">Status</th>
        <th class="wui-col-sm wui-cell-num">Acks</th>
        <th class="wui-col-actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Power Outage — Tower B</td>
        <td><span class="wui-badge primary">Open</span></td>
        <td class="wui-cell-num">7</td>
        <td class="wui-col-actions">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
      <tr>
        <td>Water Leak — Level 3</td>
        <td><span class="wui-badge success">Closed</span></td>
        <td class="wui-cell-num">12</td>
        <td class="wui-col-actions">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
      <tr>
        <td>Comms Degraded — Sector 7</td>
        <td><span class="wui-badge warning">Monitoring</span></td>
        <td class="wui-cell-num">3</td>
        <td class="wui-col-actions">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
      <tr>
        <td>Gas Leak — Loading Bay</td>
        <td><span class="wui-badge danger">Escalated</span></td>
        <td class="wui-cell-num">21</td>
        <td class="wui-col-actions">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
      <tr>
        <td>Evacuation Drill — Annex</td>
        <td><span class="wui-badge info">Scheduled</span></td>
        <td class="wui-cell-num">0</td>
        <td class="wui-col-actions">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Sortable header — is-sortable / is-sort-asc / is-sort-desc

Add `is-sortable` to a header `<th>` for the pointer + hover treatment. The active sort column carries `is-sort-asc` (▲) or `is-sort-desc` (▼); the arrow glyph is drawn by the CSS `::after`. State classes are toggled by your view's sort logic.

```html
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <!-- Sortable, ascending active -->
        <th class="wui-col-primary is-sortable is-sort-asc">Incident</th>
        <!-- Sortable, descending active -->
        <th class="wui-col-md is-sortable is-sort-desc">Status</th>
        <!-- Sortable, no active direction -->
        <th class="wui-col-sm wui-cell-num is-sortable">Acks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Aftershock Report — Grid 4</td>
        <td><span class="wui-badge primary">Open</span></td>
        <td class="wui-cell-num">5</td>
      </tr>
      <tr>
        <td>Bridge Inspection — River Rd</td>
        <td><span class="wui-badge success">Closed</span></td>
        <td class="wui-cell-num">9</td>
      </tr>
      <tr>
        <td>Chemical Spill — Lab 2</td>
        <td><span class="wui-badge danger">Escalated</span></td>
        <td class="wui-cell-num">17</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Interaction states — hover / selected / highlighted / error / disabled / dragover / dragging

Row-level state classes on the `<tr>`. `is-selected` = primary fill · `is-highlighted` = warning fill · `is-error` = danger fill · `is-disabled` mutes + blocks pointer · `is-dragging` fades the row · `is-dragover` shows a top drop-line. Hover the plain row to see the automatic hover fill. Use the `drag-handle` element as the reorder grip.

```html
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <th class="wui-col-sm"></th>
        <th class="wui-col-primary">Incident</th>
        <th>State class</th>
      </tr>
    </thead>
    <tbody>
      <!-- Default (hover me) -->
      <tr>
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Power Outage — Tower B</td>
        <td><code>(hover)</code></td>
      </tr>
      <!-- Selected -->
      <tr class="is-selected">
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Water Leak — Level 3</td>
        <td><code>is-selected</code></td>
      </tr>
      <!-- Highlighted -->
      <tr class="is-highlighted">
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Comms Degraded — Sector 7</td>
        <td><code>is-highlighted</code></td>
      </tr>
      <!-- Error -->
      <tr class="is-error">
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Gas Leak — Loading Bay</td>
        <td><code>is-error</code></td>
      </tr>
      <!-- Dragover (drop target) -->
      <tr class="is-dragover">
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Evacuation Drill — Annex</td>
        <td><code>is-dragover</code></td>
      </tr>
      <!-- Dragging (source, faded) -->
      <tr class="is-dragging">
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Perimeter Breach — Gate 9</td>
        <td><code>is-dragging</code></td>
      </tr>
      <!-- Disabled -->
      <tr class="is-disabled">
        <td><span class="material-symbols-outlined drag-handle">drag_indicator</span></td>
        <td>Archived — 2024 Flood</td>
        <td><code>is-disabled</code></td>
      </tr>
    </tbody>
  </table>
</div>
```

## wui-table-cards

Card-row variant: each `<tr>` reads as a spaced, rounded card floating on the page backdrop. Same column-width, cell-utility, and row-state classes as standard. Row surface defaults to `--color-30`; add `color-60` for the darker neutral (mirrors the `wui-plane` API). An empty last `<th>` is auto-treated as an actions column; a `wui-cell-center` last column gets its own sizing.

### Default surface — color-30

```html
<!-- color-30 row surface (default) -->
<div class="wui-table-wrap">
  <table class="wui-table-cards color-30">
    <thead>
      <tr>
        <th class="wui-col-primary">Incident</th>
        <th class="wui-col-md">Severity</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="wui-col-primary">Power Outage — Tower B</td>
        <td><span class="wui-badge danger">Critical</span></td>
        <td class="wui-cell-center"><button class="wui-table-action-btn primary" title="View"><span class="material-symbols-outlined">open_in_new</span></button></td>
      </tr>
      <tr>
        <td class="wui-col-primary">Water Leak — Level 3</td>
        <td><span class="wui-badge warning">High</span></td>
        <td class="wui-cell-center"><button class="wui-table-action-btn primary" title="View"><span class="material-symbols-outlined">open_in_new</span></button></td>
      </tr>
      <tr>
        <td class="wui-col-primary">Comms Degraded — Sector 7</td>
        <td><span class="wui-badge info">Medium</span></td>
        <td class="wui-cell-center"><button class="wui-table-action-btn primary" title="View"><span class="material-symbols-outlined">open_in_new</span></button></td>
      </tr>
      <tr>
        <td class="wui-col-primary">Evacuation Drill — Annex</td>
        <td><span class="wui-badge secondary">Low</span></td>
        <td class="wui-cell-center"><button class="wui-table-action-btn primary" title="View"><span class="material-symbols-outlined">open_in_new</span></button></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Darker surface — color-60

```html
<!-- color-60 row surface -->
<div class="wui-table-wrap">
  <table class="wui-table-cards color-60">
    <thead>
      <tr>
        <th class="wui-col-primary">Incident</th>
        <th class="wui-col-md">Severity</th>
        <th class="wui-cell-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="wui-col-primary">Gas Leak — Loading Bay</td>
        <td><span class="wui-badge danger">Critical</span></td>
        <td class="wui-cell-center">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
      <tr>
        <td class="wui-col-primary">Perimeter Breach — Gate 9</td>
        <td><span class="wui-badge warning">High</span></td>
        <td class="wui-cell-center">
          <div class="wui-table-actions">
            <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
            <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Card row states — selected / highlighted / error / disabled / empty

The same row-state classes as standard, plus `is-empty` for a dashed "no records" placeholder row (span all columns). On cards, states also recolor the row border.

```html
<div class="wui-table-wrap">
  <table class="wui-table-cards">
    <thead>
      <tr>
        <th class="wui-col-primary">Incident</th>
        <th>State class</th>
      </tr>
    </thead>
    <tbody>
      <!-- Selected -->
      <tr class="is-selected">
        <td class="wui-col-primary">Water Leak — Level 3</td>
        <td><code>is-selected</code></td>
      </tr>
      <!-- Highlighted -->
      <tr class="is-highlighted">
        <td class="wui-col-primary">Comms Degraded — Sector 7</td>
        <td><code>is-highlighted</code></td>
      </tr>
      <!-- Error -->
      <tr class="is-error">
        <td class="wui-col-primary">Gas Leak — Loading Bay</td>
        <td><code>is-error</code></td>
      </tr>
      <!-- Disabled -->
      <tr class="is-disabled">
        <td class="wui-col-primary">Archived — 2024 Flood</td>
        <td><code>is-disabled</code></td>
      </tr>
      <!-- Empty placeholder (spans all columns) -->
      <tr class="is-empty">
        <td colspan="2">No incidents match the current filter.</td>
      </tr>
    </tbody>
  </table>
</div>
```

> **Sticky-managed header (JS):** `weoc-ui.js` auto-binds every `wui-table-cards` and adds `wui-sticky-managed` to its `&lt;thead&gt;` so the header is transparent at rest and swaps to an opaque surface (via `is-stuck`) only while pinned to the top of a scroll container. No per-view attribute is needed; the CSS ships an opaque fallback for the no-JS case. The header only pins inside a real scroll area (e.g. `wui-scroll-area`), so it stays inline in this static demo.

## wui-table-log

Dense, operator-grade incident list with click-to-expand rows. Each record is a **pair**: a data row `wui-log-row` (carrying `data-wui-row="true"`) followed by a `wui-log-detail-row`. The detail reveals when the data row has `is-open`. Zebra striping is automatic. Child cells use the short `wui-log-*` prefix: `wui-log-expand`, `wui-log-elapsed`, `wui-log-title-row`/`-title`/`-id`, `wui-log-class`, `wui-log-acks`, and inside the detail `wui-log-detail`/`-desc`/`-meta`/`-actions`. The color accent goes on the data row only; the detail inherits via the adjacent-sibling rule. Add `is-closed` to mute a resolved record.

```html
<table class="wui-table-log">
  <thead>
    <tr>
      <th></th>
      <th>Elapsed</th>
      <th>Incident</th>
      <th>Classification</th>
      <th>Status</th>
      <th>Acks</th>
    </tr>
  </thead>
  <tbody>
    <!-- Danger record — open by default -->
    <tr class="wui-log-row is-danger is-open" data-wui-row="true">
      <td><span class="material-symbols-outlined wui-log-expand">expand_more</span></td>
      <td class="wui-log-elapsed">18d 21h</td>
      <td>
        <div class="wui-log-title-row">
          <span class="wui-log-title">Power Outage</span>
          <span class="wui-log-id">#26-0000063</span>
          <span class="wui-badge danger">Critical</span>
        </div>
      </td>
      <td class="wui-log-class">Fire & Safety / Structural fire</td>
      <td><span class="wui-badge primary">Open</span></td>
      <td class="wui-log-acks">✓ 7</td>
    </tr>
    <tr class="wui-log-detail-row">
      <td colspan="6">
        <div class="wui-log-detail">
          <div class="wui-log-desc">Transformer fault on the north feed. Backup generators online; ETA to grid restore 4h.</div>
          <div class="wui-log-meta">Logged by J. Rivera · updated 12 min ago</div>
          <div class="wui-log-actions">
            <button class="wui-btn wui-btn-sm secondary outline">Acknowledge</button>
            <button class="wui-btn wui-btn-sm primary">Open record</button>
          </div>
        </div>
      </td>
    </tr>
    <!-- Warning record -->
    <tr class="wui-log-row is-warning" data-wui-row="true">
      <td><span class="material-symbols-outlined wui-log-expand">expand_more</span></td>
      <td class="wui-log-elapsed">6h 42m</td>
      <td>
        <div class="wui-log-title-row">
          <span class="wui-log-title">Comms Degraded</span>
          <span class="wui-log-id">#26-0000068</span>
        </div>
      </td>
      <td class="wui-log-class">Infrastructure / Telecom</td>
      <td><span class="wui-badge warning">Monitoring</span></td>
      <td class="wui-log-acks">✓ 3</td>
    </tr>
    <tr class="wui-log-detail-row">
      <td colspan="6">
        <div class="wui-log-detail">
          <div class="wui-log-desc">Intermittent packet loss on Sector 7 radios. Field team dispatched.</div>
          <div class="wui-log-actions">
            <button class="wui-btn wui-btn-sm secondary outline">Acknowledge</button>
          </div>
        </div>
      </td>
    </tr>
    <!-- Info record -->
    <tr class="wui-log-row is-info" data-wui-row="true">
      <td><span class="material-symbols-outlined wui-log-expand">expand_more</span></td>
      <td class="wui-log-elapsed">3h 11m</td>
      <td>
        <div class="wui-log-title-row">
          <span class="wui-log-title">Evacuation Drill</span>
          <span class="wui-log-id">#26-0000070</span>
        </div>
      </td>
      <td class="wui-log-class">Operations / Planned exercise</td>
      <td><span class="wui-badge info">Scheduled</span></td>
      <td class="wui-log-acks">✓ 5</td>
    </tr>
    <tr class="wui-log-detail-row">
      <td colspan="6">
        <div class="wui-log-detail">
          <div class="wui-log-desc">Quarterly annex evacuation. Muster point: north lot.</div>
        </div>
      </td>
    </tr>
    <!-- Success record, closed -->
    <tr class="wui-log-row is-success is-closed" data-wui-row="true">
      <td><span class="material-symbols-outlined wui-log-expand">expand_more</span></td>
      <td class="wui-log-elapsed">2h 05m</td>
      <td>
        <div class="wui-log-title-row">
          <span class="wui-log-title">Routine Check</span>
          <span class="wui-log-id">#26-0000071</span>
        </div>
      </td>
      <td class="wui-log-class">Operations / Status report</td>
      <td><span class="wui-badge success">Closed</span></td>
      <td class="wui-log-acks">✓ 4</td>
    </tr>
    <tr class="wui-log-detail-row is-closed">
      <td colspan="6">
        <div class="wui-log-detail">
          <div class="wui-log-desc">All systems nominal at shift handover.</div>
        </div>
      </td>
    </tr>
  </tbody>
</table>
```

> **data-wui-row="true" — value form required in WebEOC XML:** The expand/collapse wiring reads `data-wui-row`. WebEOC's XML parser rejects bare boolean attributes, so always write `="true"`. Keep the detail row OUTSIDE the data row (as a sibling `&lt;tr&gt;`) so clicks inside the detail do not re-toggle.

## Column widths

Put a width class on the `<th>`; under `table-layout: fixed` the matching `<td>` inherits it. Fixed px: `wui-col-sm` (80px) · `wui-col-index` (150px) · `wui-col-md` (180px). Proportional: `wui-col-primary` (40%) · `wui-col-secondary` (25%). `wui-col-actions` (80px, centered) for the icon-button column.

```html
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <!-- 150px index column -->
        <th class="wui-col-index">Ref #</th>
        <!-- 40% primary column -->
        <th class="wui-col-primary">Incident</th>
        <!-- 25% secondary column -->
        <th class="wui-col-secondary">Owner</th>
        <!-- 180px medium column -->
        <th class="wui-col-md">Status</th>
        <!-- 80px actions column -->
        <th class="wui-col-actions"></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="wui-cell-num">#26-0063</td>
        <td>Power Outage — Tower B</td>
        <td>J. Rivera</td>
        <td><span class="wui-badge primary">Open</span></td>
        <td class="wui-col-actions"><button class="wui-table-action-btn primary" title="View"><span class="material-symbols-outlined">open_in_new</span></button></td>
      </tr>
      <tr>
        <td class="wui-cell-num">#26-0068</td>
        <td>Comms Degraded — Sector 7</td>
        <td>A. Chen</td>
        <td><span class="wui-badge warning">Monitoring</span></td>
        <td class="wui-col-actions"><button class="wui-table-action-btn primary" title="View"><span class="material-symbols-outlined">open_in_new</span></button></td>
      </tr>
    </tbody>
  </table>
</div>
```

### is-fluid — flexible data columns

Add `is-fluid` to a table living in a narrow or resizable shell (side panel, split-view dialog, details pane). The flexible data columns (`wui-col-md` / `wui-col-index` / `wui-col-secondary`) collapse to `auto` and share the space left after the genuinely-narrow fixed columns (`wui-col-sm` / `wui-col-actions`), so the table is always exactly the container width and cells wrap/ellipsize instead of overflowing.

```html
<div class="wui-table-wrap" style="max-width:360px">
  <!-- is-fluid: data columns go auto inside a narrow shell -->
  <table class="wui-table-standard is-fluid">
    <thead>
      <tr>
        <th class="wui-col-sm wui-cell-num">#</th>
        <th class="wui-col-md">Incident</th>
        <th class="wui-col-secondary">Owner</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="wui-cell-num">63</td>
        <td class="wui-cell-truncate"><span>Power Outage — Tower B North Feed</span></td>
        <td>J. Rivera</td>
      </tr>
      <tr>
        <td class="wui-cell-num">68</td>
        <td class="wui-cell-truncate"><span>Comms Degraded — Sector 7 Radios</span></td>
        <td>A. Chen</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Cell utilities

Attach to a `<td>` (or `<th>`) on any variant. `wui-cell-num` right-aligns tabular numerals · `wui-cell-center` centers · `wui-cell-muted` is smaller secondary text · `wui-cell-truncate` single-line ellipsis (wrap the text in a `<span>`) · `wui-cell-chips` is a flex-wrap row for multiple badges.

```html
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <th class="wui-col-primary">Incident</th>
        <th class="wui-col-sm wui-cell-num">Acks</th>
        <th class="wui-cell-center wui-col-sm">Prio</th>
        <th class="wui-col-md">Tags</th>
        <th class="wui-col-secondary">Note</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Power Outage — Tower B</td>
        <!-- wui-cell-num -->
        <td class="wui-cell-num">7</td>
        <!-- wui-cell-center -->
        <td class="wui-cell-center">P1</td>
        <!-- wui-cell-chips -->
        <td class="wui-cell-chips">
          <span class="wui-badge danger">Fire</span>
          <span class="wui-badge warning">Power</span>
        </td>
        <!-- wui-cell-muted -->
        <td class="wui-cell-muted">Updated 12 min ago</td>
      </tr>
      <tr>
        <td>Comms Degraded — Sector 7</td>
        <td class="wui-cell-num">3</td>
        <td class="wui-cell-center">P3</td>
        <td class="wui-cell-chips">
          <span class="wui-badge info">Telecom</span>
        </td>
        <td class="wui-cell-muted">Updated 1h ago</td>
      </tr>
      <tr>
        <!-- wui-cell-truncate: wrap text in a span -->
        <td class="wui-cell-truncate"><span>Evacuation Drill — Annex quarterly muster and headcount reconciliation</span></td>
        <td class="wui-cell-num">5</td>
        <td class="wui-cell-center">P4</td>
        <td class="wui-cell-chips">
          <span class="wui-badge secondary">Planned</span>
        </td>
        <td class="wui-cell-muted">Updated 3h ago</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Row color accents

A left-border accent: add one color class to any `<tr>`. On `wui-table-standard` and `wui-table-cards` it draws a 3px left border (cards also inherit the color into the hover borders via `--_row-accent`). On `wui-table-log` the same class drives `--_tier`, so the 4px border and the elapsed-time text color both update. Colors: `is-primary` · `is-success` · `is-info` · `is-warning` · `is-danger` · `is-secondary`.

```html
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <th class="wui-col-index">Row class</th>
        <th class="wui-col-primary">Use case</th>
      </tr>
    </thead>
    <tbody>
      <!-- is-primary -->
      <tr class="is-primary">
        <td><code>is-primary</code></td>
        <td>Active / selected focus</td>
      </tr>
      <!-- is-success -->
      <tr class="is-success">
        <td><code>is-success</code></td>
        <td>Resolved / closed / confirmed</td>
      </tr>
      <!-- is-info -->
      <tr class="is-info">
        <td><code>is-info</code></td>
        <td>Informational / monitoring</td>
      </tr>
      <!-- is-warning -->
      <tr class="is-warning">
        <td><code>is-warning</code></td>
        <td>Caution / needs attention</td>
      </tr>
      <!-- is-danger -->
      <tr class="is-danger">
        <td><code>is-danger</code></td>
        <td>Danger / escalated / critical</td>
      </tr>
      <!-- is-secondary -->
      <tr class="is-secondary">
        <td><code>is-secondary</code></td>
        <td>Muted / archived / low priority</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Same accents on cards

```html
<div class="wui-table-wrap">
  <table class="wui-table-cards">
    <thead>
      <tr>
        <th class="wui-col-index">Row class</th>
        <th class="wui-col-primary">Incident</th>
      </tr>
    </thead>
    <tbody>
      <tr class="is-primary"><td><code>is-primary</code></td><td class="wui-col-primary">Power Outage — Tower B</td></tr>
      <tr class="is-success"><td><code>is-success</code></td><td class="wui-col-primary">Water Leak — Level 3</td></tr>
      <tr class="is-danger"><td><code>is-danger</code></td><td class="wui-col-primary">Gas Leak — Loading Bay</td></tr>
      <tr class="is-secondary"><td><code>is-secondary</code></td><td class="wui-col-primary">Archived — 2024 Flood</td></tr>
    </tbody>
  </table>
</div>
```

## Row action buttons

Wrap a set of icon buttons in `wui-table-actions` (centered flex group). Each button is a `wui-table-action-btn`; a color class tints it and its hover fill. Add `disabled` (or `is-disabled`) to block a single action. Drop the group into a `wui-col-actions` cell.

```html
<div class="wui-table-actions">
  <!-- Neutral (base) -->
  <button class="wui-table-action-btn" title="View"><span class="material-symbols-outlined">visibility</span></button>
  <!-- Primary -->
  <button class="wui-table-action-btn primary" title="Edit"><span class="material-symbols-outlined">edit</span></button>
  <!-- Success -->
  <button class="wui-table-action-btn success" title="Approve"><span class="material-symbols-outlined">check</span></button>
  <!-- Warning -->
  <button class="wui-table-action-btn warning" title="Flag"><span class="material-symbols-outlined">flag</span></button>
  <!-- Danger -->
  <button class="wui-table-action-btn danger" title="Delete"><span class="material-symbols-outlined">delete</span></button>
  <!-- Secondary -->
  <button class="wui-table-action-btn secondary" title="More"><span class="material-symbols-outlined">more_horiz</span></button>
  <!-- Disabled -->
  <button class="wui-table-action-btn primary" title="Locked" disabled><span class="material-symbols-outlined">lock</span></button>
</div>
```

## Density

Tune vertical rhythm on the `<table>`: `is-compact` tightens padding (and the card row gap), `is-comfortable` loosens it. Base density (no class) sits between. Both modifiers work on `wui-table-standard` and `wui-table-cards`.

### Standard — compact vs base vs comfortable

```html
<!-- is-compact -->
<div class="wui-table-wrap">
  <table class="wui-table-standard is-compact">
    <thead><tr><th class="wui-col-primary">Compact</th><th class="wui-col-md">Status</th></tr></thead>
    <tbody>
      <tr><td>Power Outage — Tower B</td><td><span class="wui-badge primary">Open</span></td></tr>
      <tr><td>Water Leak — Level 3</td><td><span class="wui-badge success">Closed</span></td></tr>
    </tbody>
  </table>
</div>
<!-- base (no density class) -->
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead><tr><th class="wui-col-primary">Base</th><th class="wui-col-md">Status</th></tr></thead>
    <tbody>
      <tr><td>Power Outage — Tower B</td><td><span class="wui-badge primary">Open</span></td></tr>
      <tr><td>Water Leak — Level 3</td><td><span class="wui-badge success">Closed</span></td></tr>
    </tbody>
  </table>
</div>
<!-- is-comfortable -->
<div class="wui-table-wrap">
  <table class="wui-table-standard is-comfortable">
    <thead><tr><th class="wui-col-primary">Comfortable</th><th class="wui-col-md">Status</th></tr></thead>
    <tbody>
      <tr><td>Power Outage — Tower B</td><td><span class="wui-badge primary">Open</span></td></tr>
      <tr><td>Water Leak — Level 3</td><td><span class="wui-badge success">Closed</span></td></tr>
    </tbody>
  </table>
</div>
```

### Cards — compact vs comfortable

```html
<!-- is-compact -->
<div class="wui-table-wrap">
  <table class="wui-table-cards is-compact">
    <thead><tr><th class="wui-col-primary">Compact</th><th>Severity</th></tr></thead>
    <tbody>
      <tr><td class="wui-col-primary">Power Outage — Tower B</td><td><span class="wui-badge danger">Critical</span></td></tr>
      <tr><td class="wui-col-primary">Water Leak — Level 3</td><td><span class="wui-badge warning">High</span></td></tr>
    </tbody>
  </table>
</div>
<!-- is-comfortable -->
<div class="wui-table-wrap">
  <table class="wui-table-cards is-comfortable">
    <thead><tr><th class="wui-col-primary">Comfortable</th><th>Severity</th></tr></thead>
    <tbody>
      <tr><td class="wui-col-primary">Power Outage — Tower B</td><td><span class="wui-badge danger">Critical</span></td></tr>
      <tr><td class="wui-col-primary">Water Leak — Level 3</td><td><span class="wui-badge warning">High</span></td></tr>
    </tbody>
  </table>
</div>
```

## Responsive column hiding

Mark a `<th>`/`<td>` pair `data-wui-hide-below="sm|md|lg|xl"` and the column hides once the table's own `wui-table-wrap` shrinks past that breakpoint — a real container query against the table's rendered width, not the browser viewport. That is the whole point: a details panel or split view squeezing the table triggers the hide even when the window itself never resizes, which a `@media` query cannot see. Same `sm/md/lg/xl` scale as `wui-col-sm`/`wui-col-md` and the grid system (576/768/992/1200) — no new vocabulary. Zero JS: each cell hides itself off its own attribute, nothing pairs the header to its column. Requires loading `weoc-tables-responsive.css` after `weoc-tables.css`. Standard table (`wui-table-standard`) only — `wui-table-cards` already has its own narrow-width behavior.

### Live example — resize the wrapper, not the window

Two columns below are marked `data-wui-hide-below`: `Created By` hides under the `md` breakpoint (768px), `Created At` hides under `sm` (576px). Drag the handle in the demo box's bottom-right corner, or use the width presets, to see each threshold cross independently of the browser window.

```html
<div class="wui-table-wrap">
  <table class="wui-table-standard">
    <thead>
      <tr>
        <th class="wui-col-index">#</th>
        <th class="wui-col-primary">Facility</th>
        <th class="wui-col-md">Status</th>
        <th class="wui-col-md">Location</th>
        <th class="wui-col-md" data-wui-hide-below="md">Created By</th>
        <th class="wui-col-md" data-wui-hide-below="sm">Created At</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="wui-cell-num">26-004</td>
        <td>Central Warehouse</td>
        <td><span class="wui-badge success">Operational</span></td>
        <td>Bldg 4, Zone C</td>
        <td data-wui-hide-below="md">J. Rivera</td>
        <td data-wui-hide-below="sm">07/28/2026 14:02</td>
      </tr>
      <!-- …more rows… -->
    </tbody>
  </table>
</div>
```

> **Opt-in module — load weoc-tables-responsive.css after weoc-tables.css:** The hide hook ships in its own file. Add `&lt;link rel="stylesheet" href="../../CSS/weoc-ui/weoc-tables-responsive.css"&gt;` *after* `weoc-tables.css` on any table view. It reuses the `container-type: inline-size` context `weoc-tables.css` already establishes on `wui-table-wrap` — no extra markup beyond the wrapper you already use.
