# Conventions

[← Index](README.md)

## No inline styles

Never use `style="..."` attributes or `<style>` blocks inside a `.weoc` view. The one sanctioned exception is a CSS **custom-property** override — `style="--wui-skeleton-w: 120px"`, `style="--wui-card-min: 320px"`, `style="--wui-sidebar-width: 260px"` — because the component's own CSS defines what that variable controls; you're configuring a documented knob, not writing new styling. A literal `style="width: 120px"` is not.

## {viewType}.css pattern

Every view type (`display`, `details`, `input`, `remove`) gets its own `{viewType}.css` file: import the agency theme first (`agency-theme.css` normally; `agency-theme-obsidian.css` for dashboards specifically), then the weoc-ui core barrel, then any special component CSS not in the core barrel, then your overrides — in that order.

## Device tiers

weoc-ui's breakpoints are Bootstrap-compatible and mobile-first: `sm` 576px, `md` 768px, `lg` 992px, `xl` 1200px. TV/projector displays are a separate opt-in *scale* mode, not a width breakpoint — add `weoc-display-tv.css`'s link tag only on the specific view(s) that target a wall display, and set `data-wui-display="tv"` to activate it.

## Component promotion

If you build or notice a board-local widget that's generic and reusable (not board-specific business logic), flag it as a porting candidate: one line in that session's `current_context.md` — what it is, why it's generic — rather than leaving it silently board-local.

## CSS/JS minimalism — declarative first

Prefer a `wui-*` class or `data-wui-*` attribute over new CSS or new JS. JS components that render HTML must themselves emit `wui-*`-classed markup, not one-off styled fragments. Board-side JS should be declarative and attribute-driven (`data-wui-dz-manual`, `data-wui-map`, `data-wui-sidebar-breakpoint`, `WUI.i18n.mark`/`apply`) — extend that pattern for new components rather than hand-writing imperative per-board wiring. Only write bespoke code when the library genuinely has no primitive for the case, and when that happens, flag it per the component-promotion rule above.

## Tile chrome — header/footer border toggle

Dashboard tiles use `.wui-tile` > `.wui-tile-hdr` / `.wui-tile-body` / `.wui-tile-footer` (optional header and footer — a body-only tile just omits them). The footer always sits at the bottom regardless of what else is present. Add `.flush` to a header or footer independently to drop its divider border — the same modifier also works on `.wui-panel-hdr`/`-footer`, `.wui-collapse-panel`, and `.wui-card-footer`. Add `.is-scrollable` to `.wui-tile` itself to scroll the body instead of clipping it. See [kpi-recipes.md](kpi-recipes.md) for full copy-paste examples.
