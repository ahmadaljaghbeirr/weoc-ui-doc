# Kanban

[← Index](README.md)

Board-agnostic drag-and-drop kanban board. Native HTML5 DnD, no library dependency, configurable columns — `WUI.kanban()` owns the mechanics, your board owns what happens on drop.

> **Mechanics, not modal UX:** The reference implementation this component is modeled on (`eoc-makeover`'s TaskManagement board) opens a board-specific confirmation modal on every drop. `WUI.kanban()` deliberately does not bake that in — it fires `opts.onBeforeMove(card, fromColumnKey, toColumnKey)` before committing and lets YOUR board decide: commit immediately, show your own modal, call a REST endpoint, or reject the move outright.

## Overview

`wui-kanban.js` renders a column-grouped board from plain `columns`/`cards` data and wires native HTML5 drag-and-drop between columns. There is no swimlane support and no baked-in persistence — a board owns saving the new status, this component only owns moving the card and asking first.

Card markup reuses the existing `.wui-badge` component for priority (same severity-token convention documented on the [Badges & Chips](interactive.md) page) rather than inventing a new visual language.

## Setup

Load the kanban stylesheet and engine after weoc-ui.css / weoc-ui.js.

```js
<link rel="stylesheet" href="path/to/weoc-ui.css">
<link rel="stylesheet" href="path/to/weoc-kanban.css">

<script src="path/to/weoc-ui.js"></script>
<script src="path/to/wui-kanban.js"></script>
```

The Task Board demo below also uses `WUI.confirm()` for its reject-confirmation gate — a themed wrapper (`wui-alert.js`) around the vendored SweetAlert2 library. That needs its own stylesheet pair and scripts loaded first, in this order:

```js
<link rel="stylesheet" href="path/to/sweetalert2.min.css">
<link rel="stylesheet" href="path/to/sweetalert2-weoc-theme.css">

<script src="path/to/sweetalert2.all.min.js"></script>
<script src="path/to/wui-alert.js"></script>
```

## WUI.kanban(el, opts)

Create a kanban board inside a container element. Returns an instance handle, or `null` if `opts.columns` is missing/empty or the element cannot be resolved.

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `el` | `Element \| string` | — | Container element or CSS selector. The whole board (all columns) is rendered inside it. |
| `opts.columns` | `Array` | required | Array of `{ key, label }`. Defines the board's columns, in display order. Missing/empty → `console.warn`, factory returns `null`. |
| `opts.cards` | `Array` | `[]` | Array of `{ id, columnKey, title, meta, accent }`, where `meta` may carry `{ assignee, priority, dueDate }`. A card whose `columnKey` doesn't match any defined column is silently omitted from render (`console.warn` naming the bad card id), not a crash. `accent` is documented separately below. |
| `opts.onBeforeMove` | `function` | — | `function(card, fromColumnKey, toColumnKey)`, fired on drop BEFORE the move commits. Return (or resolve, via a returned `Promise`) `false` to reject the move — the card snaps back to its origin column, nothing commits. Any other return value (including omitting the option entirely) commits the move unconditionally. |

**Return value — instance handle**

| Method | Description |
|---|---|
| `handle.update(newCards)` | Replace the full card set and re-render. Same `columnKey` validation as construction. |
| `handle.addCard(card)` | Append one card. Unknown `columnKey` → `console.warn`, not added. |
| `handle.removeCard(id)` | Remove one card by id and re-render. |
| `handle.destroy()` | Unbind drag-and-drop listeners, clear the container's contents, unregister the instance. |

## Rendered Markup

What WUI.kanban() renders inside your container element — useful when writing CSS overrides or reading the DOM from board-level code.

```js
<div class="wui-kanban">
  <div class="wui-kanban-col" data-column-key="open">
    <div class="wui-kanban-col-hdr">
      <span class="wui-kanban-col-title">Open</span>
      <span class="wui-kanban-col-count">3</span>
    </div>
    <div class="wui-kanban-col-body">
      <!-- accent present (opts.cards[].accent: 'warning') -> has-accent + accent-warning,
           renders the left-edge stripe. Omitted entirely on a card -> neither class,
           no stripe (see "Card Accents" below). -->
      <div class="wui-kanban-card has-accent accent-warning" draggable="true" data-card-id="101">
        <div class="wui-kanban-card-title">Inspect Facility 26-004</div>
        <div class="wui-kanban-card-meta">
          <span class="wui-kanban-card-assignee">Ahmad Naser</span>
          <span class="wui-badge warning">high</span>
        </div>
        <div class="wui-kanban-card-due">2026-08-02</div>
      </div>
      <!-- ...remaining cards... -->
    </div>
  </div>
  <!-- ...remaining columns... -->
</div>
```

## Card Accents

An optional colored left-edge stripe per card — set `card.accent` to one of the same names `.wui-badge` already accepts (see the [Badges & Chips](interactive.md) page), not a new color vocabulary. Omitted (or an unrecognized value) → no stripe, the card renders exactly as it did before this option existed.

```js
{ id: '101', columnKey: 'open', title: 'Inspect Facility 26-004', accent: 'warning', meta: { /* ... */ } }
{ id: '103', columnKey: 'open', title: 'Update road closure signage — Sector 4', meta: { /* ... */ } } // no accent -> no stripe
```

Accepted values — same tokens the badge/severity system already uses everywhere in this library:

| Value | CSS token |
|---|---|
| `'primary'` | `--color-10` |
| `'secondary'` | `--color-secondary` |
| `'success'` | `--color-success` |
| `'warning'` | `--color-warning` |
| `'danger'` | `--color-danger` |
| `'info'` | `--color-info` |
| `'tier-1'` | `--tier-1-color` |
| `'tier-2'` | `--tier-2-color` |
| `'tier-3'` | `--tier-3-color` |
| `'tier-4'` | `--tier-4-color` |

> **Visible in the demos below:** The Task Board demo color-codes accents to priority (`warning`/`danger`/`primary`/`secondary`) and deliberately leaves two cards without one. The different-column-set demo uses tier accents (`tier-1`/`tier-2`/`tier-4`) instead, keyed to work-stream rather than priority — the same option, read however a board finds meaningful.

## Example — Task Board

Mirrors `TaskManagement`'s real 4-status shape. Drag any card between columns. Dropping onto **Rejected** asks for confirmation first — Cancel snaps the card back to its origin column; Confirm commits the move. Watch the log line below the board.

```html
<div class="demo-kanban-wrap">
  <!-- Kanban board host -->
  <div id="demo-kanban-tasks"></div>
  <div class="demo-kanban-actions">
    <button class="wui-btn primary wui-btn-sm" id="demo-kanban-add">
      <span class="material-symbols-outlined">add</span>
      <span data-wui-i18n="docs_kanban_19">Add sample card</span>
    </button>
    <button class="wui-btn secondary ghost wui-btn-sm" id="demo-kanban-remove">
      <span class="material-symbols-outlined">remove</span>
      <span data-wui-i18n="docs_kanban_20">Remove a card</span>
    </button>
    <button class="wui-btn danger ghost wui-btn-sm" id="demo-kanban-destroy">
      <span class="material-symbols-outlined">delete</span>
      <span data-wui-i18n="docs_kanban_21">Destroy board</span>
    </button>
  </div>
  <div class="demo-kanban-log" id="demo-kanban-tasks-log"></div>
</div>
```

## The Reject Path

On drop, `wui-kanban.js` moves the card's DOM node into the target column FIRST (mirroring the reference board's own "move visually first, cancel reverts" approach), THEN calls `opts.onBeforeMove`. If the result — or the value a returned `Promise` resolves to — is exactly `false`, the card animates back to its original position in its original column and gets a brief rejection cue. Anything else commits the move.

> **This library never shows its own modal:** The demo above calls `WUI.confirm()` — the vendored, weoc-ui-themed SweetAlert2 wrapper (see `wui-alert.js`) — instead of a raw browser `confirm()`. A real board can go further still and swap in its own dedicated modal or a REST call inside `onBeforeMove`, returning a `Promise` that resolves once the board knows whether the move should stick — exactly matching `TaskManagement`'s real `openKanbanStatusModal()` pattern, without this library baking in that board-specific UX.

## Example — A Different Column Set

Same component, a completely different `opts.columns` — a plain 3-column To Do / Doing / Done board, proving `WUI.kanban()` is not secretly hardcoded to `TaskManagement`'s exact 4 statuses. No `onBeforeMove` here — omitted means every move commits unconditionally.

```html
<div class="demo-kanban-wrap">
  <!-- Kanban board host (different column set) -->
  <div id="demo-kanban-simple"></div>
</div>
```

## Error Handling

Matches the chart family's no-crash convention: bad configuration logs a warning and returns null (or silently skips the one bad item), it never throws.

| Condition | Behavior |
|---|---|
| `opts.columns` missing or empty | `console.warn`; `WUI.kanban()` returns `null`. |
| A card's `columnKey` doesn't match any defined column | That card is silently omitted from render (board keeps working); `console.warn` names the bad card id. |
| `opts.onBeforeMove` omitted | Treated as always-`true` — every drop commits unconditionally. A board that doesn't need a confirmation step isn't forced to pass a trivial callback. |

## destroy()

Call `handle.destroy()` when the board's container is removed from the DOM (a split panel closing, an `updatesection` refresh replacing the whole board region on a WebEOC view, etc). It unbinds the drag-and-drop listeners bound on the container and clears its contents — the container element itself is left in place, ready for a fresh `WUI.kanban()` call if needed.
