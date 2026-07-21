# PrimeNG Bridge — Index

Highest-priority docs section (see `../README.md`). Each page documents one PrimeNG component
restyled with `weoc-ui-css` tokens: which PrimeNG `--p-*` custom properties it exposes, which
`weoc-ui-css` tokens they map to, and the bridge CSS itself.

## Pages

**[GUIDE.md](GUIDE.md)** — the real, ground-truth reference. Covers the methodology (how to find
real PrimeNG `--p-*` tokens, map them to real weoc-ui-css values, handle vocabulary mismatches and
true gaps, the `!important` rationale, and the rare "beyond tokens" escape hatch) plus a full
per-component token table for all 8 components bridged so far: **Popover, Dialog, Drawer, Button,
ConfirmDialog, Toast, Tabs, Menu**. Includes a quick-start checklist for bridging a 9th component.

| Component | Status |
|---|---|
| Popover, Dialog, Drawer, Button, ConfirmDialog, Toast, Tabs, Menu | **Done** — see [GUIDE.md](GUIDE.md) §4 |
| [Select + DatePicker](select-datepicker.md) | Implemented in the demo app (Wave 1 Task 8) — separate placeholder stub, not yet folded into GUIDE.md |
| Input / InputText, Table, Checkbox / RadioButton / ToggleSwitch | Not started |

Candidate list grows as real usage in consuming apps identifies which PrimeNG component needs a
bridge next — this is not a fixed roadmap, prioritize by actual demand. Follow GUIDE.md §3/§6 for
the repeatable process when adding one.
