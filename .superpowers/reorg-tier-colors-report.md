# Reorg: Tier Colors -> Design Tokens

## Status
Complete. Content migrated, standalone page removed, all references updated, verified live via headless-served browser (structure, i18n, search, navigation all pass). One environment-wide rendering caveat noted below (not caused by this change).

## What moved
- All 8 component demos (`wui-badge`, `wui-chip`, `wui-status-dot`, `wui-icon-bubble`, `wui-callout`, `wui-banner`, `wui-card`, `wui-lvl`) copied verbatim from `docs/docs/tier-colors.html` into a new `<div class="docs-section" id="tier-color-variants">` in `docs/docs/tokens.html`, placed right after the existing "EOC Tier Colors" (token-swatch) section. Component names demoted from `docs-section-title` to `docs-subsection-title` (no icon) to match the page's existing nested-subsection convention (like "Brand Palette").
- `docs/docs/tier-colors.html` deleted.
- i18n: `docs_tier-colors_1..33` removed from `docs/docs-i18n.js` (including `docs_nav_tier-colors`); 32 renumbered entries (`docs_tokens_51..82`) added to `docs/i18n/tokens.js`. EN+AR both present and verified live.
- `docs/index.html` homepage "Tier Colors" feature card kept, href repointed to `./docs/tokens.html#tier-color-variants` (deep-link verified working on direct navigation).
- `docs-md/tier-colors.md` merged into `docs-md/tokens.md` (new "Tier Color Variants" H2), `docs-md/README.md` link list updated — kept the separate Markdown mirror in sync since its own README claims 1:1 parity with the HTML site.
- Repo-wide grep for `tier-colors.html` confirms zero remaining references.

## NAV changes (docs/docs-shell.js)
- Removed the standalone `{ key: 'tier-colors', ... }` entry from the `Theming` group; `Design Tokens` is now the only entry in that group (matches the "one NAV entry regardless of section count" convention already used by every other multi-section page).
- Merged tier-colors' search keywords (`tier activation 1 2 3 4 emergency accent` + component names) into the `tokens` entry's `kw` field, since this codebase's sidebar search is a plain NAV-keyword matcher (no MiniSearch/search-index infra present in this worktree — see concern below), and would otherwise have gone dark for "tier"/"emergency" queries.
- Verified live: sidebar shows only "Design Tokens" under Theming (EN and AR), search for "tier" surfaces Design Tokens.

## Verification performed
- `node --check` on all 3 touched JS files: pass.
- div open/close count on tokens.html: 523/523 balanced.
- Served the worktree over a local HTTP server and drove it with claude-in-chrome: page loads with 0 console errors, new section renders with correct markup/order, EN/AR toggle correctly localizes every new string (verified `docs_tokens_51..82` render in Arabic), hash deep-link `tokens.html#tier-color-variants` scrolls to the right section on direct navigation.
- All colored swatches/badges render visually flat/colorless in this session's screenshots — confirmed via `getComputedStyle` that this affects completely untouched, pre-existing elements too (header's `docs-version` badge, an unmodified `wui-callout.info` from the original Brand Palette section), so it's a pre-existing environment/browser-session rendering condition (many parallel agent tabs sharing one browser instance), not something this change introduced.

## Commit
2ea44cf — "docs: fold Tier Colors into Design Tokens as a section"

## Concerns
- This worktree's branch (`worktree-agent-a78785e407b3d4a08`) is checked out from the merge-base of `bao-weoc-ui-updates`, i.e. it predates `bao-weoc-ui-updates`'s later commits — including the entire build-time search indexer + `tools/git-hooks/pre-commit` infra the task description referenced. That hook does not exist in this worktree, so `docs/search-index.json` was not regenerated and the "sanity check the hook ran" step could not be performed here. This should self-resolve when this branch integrates back into `bao-weoc-ui-updates` (which already has the indexer), but flagging since the pre-commit hook did not fire on this commit.
- Automation-click-to-navigate on homepage feature cards (via the SPA fetch/swap router) didn't fire in this browser session for either my edited card or an untouched sibling card — confirmed pre-existing/environmental (not my change), real click-through and direct URL navigation both verified working.
