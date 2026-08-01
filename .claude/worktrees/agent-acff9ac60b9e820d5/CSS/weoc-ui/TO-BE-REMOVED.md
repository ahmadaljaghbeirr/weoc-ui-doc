# weoc-ui — TO BE REMOVED (post-migration)

These rules are **legacy but still LIVE**: one or more `eoc-makeover` board views may
still reference them. They are kept ONLY until those views migrate to the modern
equivalent. **Do not delete an item until a grep of the `eoc-makeover` lane confirms
zero remaining references.** When an item is cleared, tick it and note the date.

Created 2026-07-01 (session c924a960) from the CSS re-partitioning audit.
Companion analysis: `93_TEMP/contexts/weoc-ui/helper_files/css-audit-and-partitioning.md`.

Deletion procedure per item:
1. `grep` the class name across `eoc-makeover` helper_files / board `.weoc` sources.
2. If any view uses it → migrate that view to the "Superseded by" class first.
3. When zero references remain → delete the rule + tick below + log in `99_META/log.md`.

---

## Legacy classes (Bucket C)

- [ ] **`.wui-grid-view` master-detail family** — `weoc-layout.css:268-356`
  → superseded by `.wui-split`. Whole grid-view + `.wui-details-panel` + list-only block.
- [ ] **`.tab-panel` / `.tab-panel.active`** (unprefixed) — `weoc-navigation.css:249-259`
  → superseded by `.wui-tab-panel` (weoc-layout.css). Nav copy is the pre-migration original.
- [ ] **`.modal-overlay` / `.modal-frame`** (unprefixed) — `weoc-overlays.css:287-310`
  → superseded by `.wui-modal`. (`.wui-close-record-modal*` is a distinct component — KEEP.)
- [ ] **`.field-row` / `.field-item` / `.field-label` / `.field-label .required`** (unprefixed) — `weoc-forms.css:205-249`
  → superseded by `.wui-field-*` (now consolidated in weoc-forms.css). Migration documented at old layout.css:630-643.
- [~] **`.form-footer` / `.form-footer .page-center`** — `.form-footer .page-center` REMOVED 2026-07-09
  (page-center pass). `.form-footer` base rule still LIVE, pending its own migration to `.wui-ftr-*`.
- [x] **`.page-center`** (non-namespaced) — REMOVED 2026-07-09. Migrated 11 eoc-makeover views
  (9 `Blank Page` loaders → `wui-det-inner` wrap; 2 Checklists `Remove` → `wui-det-inner`). Deleted rules from
  weoc-layout.css (base + `.wui-tab-panel .page-center` + `.is-form`), weoc-containers.css (`.page-center .wui-panel-wrap`),
  weoc-forms.css (`.form-footer .page-center`) + docs (layout.html demo, forms.html form-footer demo).
  NOTE: `.wui-tab-panel.is-form` is now a dead class — its only rule was the page-center padding override.
- [ ] **bare `map-*` / `location-*` classes** — `weoc-maps.css` (`.map-pop-badges`, `.map-wrapper`, `.location-map-wrap`, etc.)
  → superseded by the `wui-map-*` set. Includes the duplicate fullscreen block (`.location-map-wrap.is-fs` vs `.map-wrapper.is-fs` — keep whichever is emitted).
- [ ] **`.wui-scrollbar`** no-op alias — `weoc-layout.css:127-133`
  → global scrollbar (weoc-reset) covers it. Drop alias once no markup carries the class.
- [ ] **`.w-100` / `.h-100` / `.hidden`** (non-namespaced) — `weoc-reset.css:126-136`
  → superseded by `.wui-w-full` / `.wui-h-full` / `.wui-d-none`.
- [ ] **`.wui-btn-md`** explicit rules — `weoc-interactive.css`
  → `-md` equals the base `.wui-btn` size; the explicit `.wui-btn-md` rules are no-ops. Remove once no markup relies on the alias.
- [ ] **`body.no-scroll`** — `weoc-reset.css:70-72`
  → superseded by `.wui-scroll-locked` (library JS uses only that). Confirm no legacy board toggles `no-scroll`, then delete.
- [x] **`.wui-severity-icon` / `.wui-severity-icon-inner`** (+ color variants) — REMOVED 2026-07-09.
  Migrated `EventReporting/…/Projector - Event Reports.weoc` to `wui-icon-bubble solid <color>`
  (Tier4→danger, 3→warning, 2→primary, 1→success). Deleted library rule (weoc-containers.css) + local defs
  (`TaskManagement/CSS/display.css`, `EventReporting/CSS/projector.css`). `board.web` regenerates on deploy.
  NOTE: dropped the projector icon scale-up rule — projector icons now render at default `wui-icon-bubble` size.

---

## Notes
- Bucket A (dead/no-op) and Bucket B (exact duplicates) were removed in the re-partitioning
  pass itself (no board dependency) — they are NOT listed here.
- Bucket D (flatpickr hardcoded `#185fa5` → `--color-10`) was a token fix applied in the pass,
  not a migration-gated deletion.
