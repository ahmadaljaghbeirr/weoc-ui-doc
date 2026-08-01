# weoc-ui Docs — Markdown Mirror

This is a 1:1 Markdown replica of every page on the [`/docs/`](../docs/index.html) site — same content, same structure, same completeness (every variant/color/size demoed on the HTML page is transcribed here too), just prose+code-block instead of prose+live-interactive-demo. Grouped and ordered the same way as the live site's sidebar.

Hosted the same way as the rest of this repo: Cloudflare Worker with `assets.directory: "."` (`wrangler.jsonc`) serves every file here as a static asset — each page below is reachable at `/docs-md/<page>.md` once deployed.

For a *compact*, fast-to-grep cheat-sheet instead of the full replica (API signatures, gotchas, conventions in a handful of dense tables) see [`../llm-docs/README.md`](../llm-docs/README.md).

## Get Started

- [Introduction](../docs/index.html) *(landing page — no markdown mirror, it's install/overview only)*
- [Animation](motion.md)
- [JS API](js-api.md)
- [EOC Lists](lists.md)
- [Localization](localization.md)

## Theming

- [Design Tokens](tokens.md)
- [Tier Colors](tier-colors.md)

## Layout

- [Layout & Shell](layout.md)
- [Grid & Flex](grid.md)

## Inputs

- [Text Inputs & Fields](forms.md)
- [Controls](cards.md)

## Combobox

- [Select (TomSelect)](combobox.md)

## Buttons

- [Buttons](buttons.md)

## Navigation

- [Navigation](navigation.md)

## Feedback

- [Feedback](feedback.md)
- [Progress](progress.md)

## Overlays

- [Overlays](overlays.md)

## Data Display

- [Cards & Containers](containers.md)
- [Badges & Chips](interactive.md)
- [Indicators](indicators.md)
- [Tables](tables.md)

## Dates

- [Date & Time (Flatpickr)](dates.md)

## Charts

- [Charts](charts.md)

## Schedule

- [Calendar](calendar.md)

## Typography

- [Typography](typography.md)
- [Rich Text](tinymce.md)

## Patterns

- [Board Views](views.md)
- [Maps](maps.md)

## Conventions

- [Conventions & Rules](conventions.md)
- [KPI & Tile Recipes](kpi-recipes.md)
