# weoc-ui: Kanban board (`WUI.kanban`)

**Date:** 2026-07-31
**Status:** Approved, ready for implementation
**Scope:** `weoc-ui` component library only (`JS/wui-kanban.js`, `CSS/weoc-ui/weoc-kanban.css`, a new `docs/docs/kanban.html` doc page). Standalone component — explicitly NOT wired into any real board (`TaskManagement` or otherwise) as part of this work.

## Background

`eoc-makeover`'s `TaskManagement` board is the reference (per explicit user instruction). Confirmed real structure (`TaskManagement/out/board.web`):

- Data model per task: `TaskTitle`, `TaskDescription`, `Priority`, `TaskStatus`, `AssignedTo`, `DueDate`, `Notes`, `AreaRegion`, `LocationDetails`, `FacilityName`, `TaskProgress` (money field, drives a progress ring), plus standard audit fields.
- Exactly 4 status columns: `Open`, `In Progress`, `Completed`, `Rejected` (`colStatusMap`, `distributeCards()`). Default status on task creation is `Open`.
- No swimlanes anywhere — single-axis grouping by `TaskStatus` only. `AssignedTo` shows as a per-card meta field (person icon), never used for grouping.
- Real drag-and-drop: native HTML5 DnD (no library), `draggable="true"` cards, `dragstart`/`dragend`/`dragover`/`dragleave`/`drop` handlers. On drop, the card DOM node moves immediately, but the actual status commit goes through `openKanbanStatusModal("drag", newStatus, currentStatus, draggedId, draggedCard)` — a confirmation modal (with a progress slider for In Progress/Completed) — not an instant silent commit.

## Decision

`WUI.kanban(el, opts)` — full native HTML5 drag-and-drop from v1 (explicit user choice), a configurable column set (not hardcoded to exactly the 4 `TaskManagement` statuses, since this is a reusable library component other future boards will configure differently), no swimlane support (matches the reference board; not requested), and a **callback-based commit hook** rather than a baked-in confirmation-modal UI — the library component provides the drag mechanics and fires an event/callback on drop with enough information for the CONSUMING board to decide what happens next (commit immediately, show its own confirmation modal, reject the move), matching the "standalone component, not wired into any board" scope: `weoc-ui` shouldn't own board-specific UX like `TaskManagement`'s particular modal copy or its progress-slider behavior.

### Why not alternatives considered

- **Static/read-only display for v1**: rejected — user explicitly chose full drag-and-drop from the start.
- **Baking `TaskManagement`'s exact confirmation-modal UX into the component**: rejected — that's board-specific product behavior (specific copy, a progress slider only relevant to money-typed progress fields), not a generic library concern. The component fires a `beforeDrop`-style hook a consumer can use to implement its own confirmation flow (or skip it and commit immediately), keeping the library generic.
- **Hardcoding the 4-status column set**: rejected — the reference board's exact statuses are real, useful DEFAULT sample data for the docs page, but the component itself takes `opts.columns` so a different future board isn't locked into `Open/In Progress/Completed/Rejected`.
- **Swimlanes**: not built — the reference board has none and none were requested; not a YAGNI violation to omit, would be scope creep to add speculatively.

## Design

### API

```js
var handle = WUI.kanban('#task-board', {
  columns: [
    { key: 'open', label: 'Open' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' }
  ],
  cards: [
    { id: '101', columnKey: 'open', title: 'Inspect Facility 26-004', meta: { assignee: 'Ahmad Naser', priority: 'high', dueDate: '2026-08-02' } }
    // ...
  ],
  // Fired on drop, BEFORE the card visually commits to the new column.
  // Return false (or a Promise resolving false) to reject the move and
  // snap the card back -- this is the hook a consuming board uses to
  // implement its own confirmation modal / persistence call, matching
  // TaskManagement's real openKanbanStatusModal() pattern without this
  // library baking in that specific UX.
  onBeforeMove: function (card, fromColumnKey, toColumnKey) { /* return true/false/Promise */ }
});
// handle.update(newCards) / handle.addCard(card) / handle.removeCard(id) / handle.destroy()
```

### Markup shape (rendered output)

```html
<div class="wui-kanban">
  <div class="wui-kanban-col" data-column-key="open">
    <div class="wui-kanban-col-hdr">Open<span class="wui-kanban-col-count">3</span></div>
    <div class="wui-kanban-col-body">
      <div class="wui-kanban-card" draggable="true" data-card-id="101">
        <div class="wui-kanban-card-title">Inspect Facility 26-004</div>
        <div class="wui-kanban-card-meta">
          <span class="wui-kanban-card-assignee">Ahmad Naser</span>
          <span class="wui-badge warning">high</span>
        </div>
      </div>
    </div>
  </div>
  <!-- ...remaining columns... -->
</div>
```

Card meta row reuses existing `weoc-ui` primitives (`.wui-badge` for priority, matching the existing severity-token convention) rather than inventing new visual language.

### Drag-and-drop mechanics

Native HTML5 DnD, mirroring the reference board's proven approach (no new dependency):

- `dragstart` on `.wui-kanban-card`: `dataTransfer.setData('text/plain', cardId)`, add a dragging visual class.
- `dragover`/`dragleave` on `.wui-kanban-col-body`: toggle a `.is-drag-over` class for visual drop-target feedback.
- `drop`: read the dragged card id, resolve `fromColumnKey`/`toColumnKey`, call `opts.onBeforeMove(card, fromColumnKey, toColumnKey)` if provided. If it returns (or resolves to) `false`, the card DOM stays in its original column (no move). Otherwise, move the card's DOM node into the target column's body and update internal state.

### Barrel wiring

New file `JS/wui-kanban.js`, loaded the same way `wui-charts.js` is (added to `docs-shell.js`'s `ensureGlobalAssets()` list, or the equivalent loading mechanism confirmed at implementation time), exporting `window.WUI.kanban = kanban;`. New `CSS/weoc-ui/weoc-kanban.css` added to `weoc-ui-core.css`'s `@import` list.

## Error handling

- `opts.columns` missing/empty: `console.warn`, factory returns `null` (matching the chart family's established no-crash convention).
- A card's `columnKey` not matching any defined column: card is silently omitted from render (not a crash), logged as a `console.warn` naming the bad card id.
- `onBeforeMove` omitted entirely: treated as always-`true` (unconditional commit) — a board not needing a confirmation step shouldn't be forced to pass a trivial callback.

## Testing

Manual live-browser verification: build `docs/docs/kanban.html` with a realistic demo mirroring `TaskManagement`'s real 4-column shape and sample task data (following the established "real board-derived recipe" convention from `kpi-recipes.html`), confirm drag-and-drop works across all column pairs, confirm an `onBeforeMove` callback returning `false` correctly snaps the card back without committing the move, confirm `handle.update()`/`addCard()`/`removeCard()` work, confirm a board configured with a DIFFERENT column set (not the 4 `TaskManagement` statuses) renders and drags correctly — proving the component is genuinely reusable, not secretly hardcoded to the reference board's exact shape.
