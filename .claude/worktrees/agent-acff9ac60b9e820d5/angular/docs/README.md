# weoc-ui-ng / weoc-ui-css — Documentation Blueprint

This is the planning skeleton for the Angular-side docs site. It is **not** the WebEOC `weoc-ui` docs
site (that lives at the repo root `docs/` and stays untouched by this port). This folder tracks what a
future docs site for the Angular packages should cover, plus placeholder pages per section so the
structure exists before the content does.

## Priority order (per 2026-07-21 reprioritization)

The primary real-world use case for this port is **restyling existing PrimeNG components** with
`weoc-ui-css` classes/tokens, not migrating apps to custom `weoc-ui-ng` components. Docs work should
follow that weighting:

1. **PrimeNG Bridge** (`primeng-bridge/`) — highest priority. One page per PrimeNG component with a
   published token-bridge stylesheet. Each page should show: the PrimeNG component, its relevant
   `--p-*` custom properties, the `weoc-ui-css` tokens they map to, and the resulting bridge CSS.
2. **Foundation** (`foundation/`) — tokens, grid/layout, utilities. Framework-agnostic, useful
   regardless of which UI layer (weoc-ui-ng or PrimeNG) consumes it.
3. **Components** (`components/`) — the custom `weoc-ui-ng` components (WuiButton, WuiFab, …). Kept
   up to date, but not the growth priority — only build new components here where no PrimeNG
   equivalent exists.

## Status

| Section | Page | Status |
|---|---|---|
| PrimeNG Bridge | **[GUIDE.md](primeng-bridge/GUIDE.md)** | **Done.** Consolidated reference covering all 8 bridged components (Popover, Dialog, Drawer, Button, ConfirmDialog, Toast, Tabs, Menu) — methodology, per-component token tables, gaps, quick-start checklist for a 9th component |
| PrimeNG Bridge | Select + DatePicker | Real implementation exists (Wave 1 Task 8, demo app); still only a placeholder stub — not folded into GUIDE.md yet |
| PrimeNG Bridge | (further components) | Candidates driven by actual consuming-app usage, not a fixed roadmap — see GUIDE.md §6 for the repeatable process |
| Foundation | Tokens | Ported (Wave 1 Task 3); page not yet written |
| Foundation | Grid / Layout / Utilities | Not yet ported from the WebEOC library |
| Components | WuiButton | Built (Wave 1 Task 5); page not yet written |
| Components | WuiFab | Built (Wave 1 Task 6); page not yet written |

## Conventions to carry over from the WebEOC docs site

Where they still apply to an Angular-hosted docs site (not all will — no Barba/Alpine SPA router needed
here, Angular has its own routing):

- Every showcased component/pattern shows **every variant**, not a representative subset.
- Code snippet shown to the reader must **exactly reproduce** the rendered example — no divergence
  between "what we show" and "what actually renders."
- Markup and JS/TS usage go in **separate** code blocks when both apply.

## Not yet decided

- Whether this becomes a real Angular app (its own `projects/docs` in the workspace, e.g. an Angular
  CLI app) or a static/markdown site. Deferred until there's enough content to justify the choice.
- Whether it merges into a single site with the existing WebEOC docs or stays fully separate (current
  lean: separate, since the audiences and tech stack differ).
