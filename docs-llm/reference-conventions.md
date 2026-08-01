# Conventions

[← Index](README.md) · Human version with rationale: [`/docs/docs/conventions.html`](../docs/docs/conventions.html)

1. **No inline `style="..."` / `<style>` blocks** in `.weoc` views — except
   `style="--wui-x: value"` custom-property overrides (established pattern:
   `--wui-card-min`, `--wui-sidebar-width`, `--wui-drawer-w`, `--wui-skeleton-w`).
   A custom-property override is configuring a documented knob the component's
   own CSS defines; a literal `style="width:120px"` is writing new styling.

2. **`{viewType}.css` per view**: `agency-theme.css` (or
   `agency-theme-obsidian.css` for dashboards specifically) → weoc-ui core
   barrel → any special component CSS not in the core barrel → your
   overrides — in that exact order.

3. **Device tiers**: `sm`/`md`/`lg`/`xl` = 576/768/992/1200px
   (Bootstrap-compatible, mobile-first, centralized in `weoc-grid.css`/
   `weoc-layout.css`). One confirmed-intentional outlier:
   `weoc-layout.css`'s `max-width:900px` `.wui-split` single-pane collapse —
   has its own purpose comment, not drift, don't "fix" it to 992px.
   TV/projector is a separate opt-in *scale* mode
   (`weoc-display-tv.css`/`[data-wui-display="tv"]`), not a width breakpoint.

4. **Component promotion** (standing rule, not a one-time task): when you
   build or notice a board-local widget that's generic and reusable — not
   board-specific business logic — flag it as a porting candidate. One line
   in that session's context/notes: what it is, why it's generic. Don't
   leave it silently board-local, and don't build a one-off for something
   the library should own (see the callout at the bottom of the
   [KPI & Tile Recipes](../docs/docs/charts.html#1-the-tile-shell-wui-tile)
   section of `charts.html` — heatmaps, box plots, funnels, maps-with-markers
   are known current gaps).

5. **Declarative-first / CSS-JS minimalism**: prefer an existing `wui-*`
   class or `data-wui-*` attribute over new CSS or new JS. JS components
   that render HTML must themselves emit `wui-*`-classed markup, not
   one-off styled fragments. Board-side JS should be attribute-driven
   auto-init (`data-wui-dz-manual`, `data-wui-map`,
   `data-wui-sidebar-breakpoint`, `[data-wui-theme-toggle]`,
   `WUI.i18n.mark`/`apply`) — extend that pattern for new components rather
   than hand-writing imperative per-board wiring. Only write bespoke code
   when the library genuinely has no primitive for the case, and when that
   happens, flag it per rule 4.
