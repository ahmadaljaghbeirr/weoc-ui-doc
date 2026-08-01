# weoc-ui — LLM-Friendly Reference

Compact, fast-to-grep reference for AI agents (and humans in a hurry) working
with weoc-ui or building boards that consume it. This lives **in the repo**,
not in any private vault — anyone with a checkout, or the deployed URL below,
can use it with zero other context.

Human-friendly docs with live, interactive demos live at
[`/docs/`](../docs/index.html). A **1:1 Markdown mirror** of every one of
those pages — same completeness, same every-variant coverage, just
prose+code instead of prose+live-demo — lives at
[`/docs-md/`](../docs-md/README.md). This wiki (`llm-docs/`) is a third,
different thing: a *compact* cheat-sheet, not a replica — fast-to-grep
tables instead of full page-by-page content. Use `docs-md/` when you need
the complete picture of a component; use this when you just need a fact
checked fast.

**Hosted at:** this repo deploys as a Cloudflare Worker with
`assets.directory: "."` (see `wrangler.jsonc`) — the whole repo is served
as static files, so every page in this folder is reachable at
`https://<worker-domain>/llm-docs/<page>.md` once deployed, the same way
`/docs/` is.

## Pages

| Page | What's in it |
|---|---|
| [`source-layout.md`](source-layout.md) | Where the JS/CSS actually lives, the build pipeline, the test framework — read this first if you're about to touch source. |
| [`js-api.md`](js-api.md) | `WUI.*` function reference: signatures, gotchas, what's auto-resize-aware. |
| [`css-classes.md`](css-classes.md) | CSS class-family reference: what each component does, its variants, its gotchas. |
| [`conventions.md`](conventions.md) | The standing rules — no inline styles, `{viewType}.css` ordering, device tiers, component promotion, declarative-first. |
| [`CHANGELOG.md`](CHANGELOG.md) | Dated, append-only log of every meaningful CSS/JS edit. See the sync-discipline rule below. |

## Sync-discipline rule (standing, for every session touching weoc-ui CSS/JS)

Any meaningful CSS/JS edit to weoc-ui appends one dated line to
[`CHANGELOG.md`](CHANGELOG.md), in the same session as the edit — mirrors the
existing `CSS/weoc-ui/TO-BE-REMOVED.md` discipline already used in this repo.
Nothing here automates drift detection (a 2026-07-24 audit found 3-for-3
sampled human-docs pages had drifted from source), so this has to be an
actual session habit, not a "remember to." **Check this wiki at session
start, update it before session end.**

If you change a component's public behavior, also update the relevant row in
[`js-api.md`](js-api.md) or [`css-classes.md`](css-classes.md) — the
changelog records *that* something changed; the reference pages need to stay
correct in the present tense.
