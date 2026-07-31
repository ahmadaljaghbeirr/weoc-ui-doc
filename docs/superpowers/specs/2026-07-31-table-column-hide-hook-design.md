# weoc-ui: table column-hide hook

**Date:** 2026-07-31
**Status:** Approved, ready for implementation
**Scope:** `weoc-ui` component library only (`CSS/weoc-ui/`, `docs/docs/tables.html`). No board files are touched.

## Background

Real boards need to hide low-priority table columns when the table's available width shrinks (a details/side panel opening, not necessarily a browser-window resize). Two boards have already hit this independently and each hand-rolled a one-off fix:

- `FacilitiesManagement/.../Display - Facilities.weoc` (the exact table in the reported screenshot: `#`, Facility, Status, Evacuation, Location, Created By, Created At) — a board-invented `fm-col-hide-sm` class, hidden via an inline `<style>` keyed on `#grid-view:not(.is-collapsed)` (a panel-open state selector, not a real breakpoint), with its own comment: *"Mirrors Task Management's tm-col-hide-sm. TODO: move to FacilitiesManagement/CSS/display.css."*
- `TaskManagement/CSS/display.css` — `tm-col-hide-sm`/`tm-col-hide-md`, same state-keyed approach, same problem.

Neither is shared, neither is documented, and both key off a board-specific panel-state class rather than the table's own actual available width — brittle and non-reusable.

`weoc-tables.css` itself has zero column-hiding mechanism today (confirmed: its only `@media` rule is `prefers-reduced-motion`). It DOES already put `.wui-table-wrap` in a `container-type: inline-size` containment context (`weoc-tables.css:20-24`), currently used only by the `.wui-table-cards` variant, with an explicit comment that the standard table variant "relies on horizontal scroll." That containment context is exactly the right foundation for a real fix — it reacts to the table's own rendered width, correctly handling the "a panel opened and squeezed me" case neither board's hack actually solves in general.

## Decision

A new CSS module, `weoc-tables-responsive.css`, adds a declarative `data-wui-hide-below="sm|md|lg|xl"` attribute hook for standard (non-cards) tables, implemented purely with `@container` queries against the existing `.wui-table-wrap` containment context. Named breakpoints reuse the exact same `sm/md/lg/xl` scale already used by `wui-col-sm`/`wui-col-md` and the grid system (`weoc-grid.css`: sm 576/md 768/lg 992/xl 1200), so authors don't learn a new vocabulary.

### Why not alternatives considered

- **Arbitrary pixel values** (`data-wui-hide-below="620"`): rejected — needs a JS helper to inject a custom-width `@container` rule per value (can't be pure CSS for arbitrary numbers), and breaks the sm/md/lg/xl vocabulary used everywhere else in the library.
- **Viewport `@media` queries**: rejected — this is precisely the failure mode both boards already hit. A `@media` query reacts to the browser window, not the table's actual available space; a details panel opening doesn't change window size, so it wouldn't fix the real problem.
- **Migrating the two boards' existing classes as part of this fix**: rejected for this pass — ship the shared hook + docs now; migrating `FacilitiesManagement`/`TaskManagement` to use it is a separate, board-specific follow-up (explicit user decision).

## Design

### Markup

```html
<table class="wui-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Facility</th>
      <th>Status</th>
      <th>Evacuation</th>
      <th>Location</th>
      <th data-wui-hide-below="md">Created By</th>
      <th data-wui-hide-below="sm">Created At</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>26-004</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td data-wui-hide-below="md">...</td>
      <td data-wui-hide-below="sm">...</td>
    </tr>
  </tbody>
</table>
```

The same `data-wui-hide-below` value goes on both the `<th>` and every `<td>` in that column — no JS pairs them up; each cell independently hides itself via its own attribute, matching the zero-JS, purely-declarative design goal.

### CSS (new file: `CSS/weoc-ui/weoc-tables-responsive.css`)

```css
/* Column-hide hook for standard (non-cards) wui-table variants.
   Reacts to the table's own rendered width via the container-type:
   inline-size already established on .wui-table-wrap (weoc-tables.css) --
   NOT viewport width -- so a details/split panel squeezing the table
   correctly triggers hiding even when the browser window itself hasn't
   resized. */
@container (max-width: 1200px) { .wui-table [data-wui-hide-below="xl"] { display: none; } }
@container (max-width: 992px)  { .wui-table [data-wui-hide-below="lg"] { display: none; } }
@container (max-width: 768px)  { .wui-table [data-wui-hide-below="md"] { display: none; } }
@container (max-width: 576px)  { .wui-table [data-wui-hide-below="sm"] { display: none; } }
```

Scoped to `.wui-table` (the standard table class) specifically, not `.wui-table-cards`, since the cards variant already has its own narrow-width behavior (shrinking `wui-col-primary/index/actions`) and this hook is additive to the "relies on horizontal scroll" standard-table case the background research confirmed has no other mechanism.

### Barrel wiring

Add `@import url("weoc-tables-responsive.css");` to `CSS/weoc-ui/weoc-ui-core.css`'s import list (after `weoc-tier-colors.css`, alongside the other feature-module imports — exact insertion point decided at implementation time to avoid a merge conflict with any other in-flight module addition).

### Documentation

`docs/docs/tables.html` currently documents column widths, cell utilities, density, `is-fluid`, and sticky headers but has zero mention of responsive behavior. Add a new section ("Responsive column hiding") following the page's existing pattern: a live example (a small table with a couple of columns marked `data-wui-hide-below`, demoed by resizing a container wrapper rather than the whole browser window, to make the container-query behavior visible), its markup panel, and prose explaining the `sm/md/lg/xl` scale and that it's per-column, per-`.wui-table-wrap` container width.

## Error handling

None needed — pure CSS, no failure modes. An unrecognized `data-wui-hide-below` value (typo, e.g. `"medium"`) simply matches no rule and the column stays visible always; not a crash, a silent no-op, acceptable for a declarative CSS hook.

## Testing

Manual live-browser verification (matches this project's established convention): build the `docs/docs/tables.html` demo table, resize its containing wrapper (not the whole window) across the four breakpoints, confirm columns hide/show at the right width thresholds and confirm the `.wui-table-cards` variant's existing behavior is unaffected. Also spot-check against the real `FacilitiesManagement`/`TaskManagement` column sets (Created By/Created At; Originator; Last Updated) to confirm the hook would in fact solve their real cases, without actually editing those board files.
