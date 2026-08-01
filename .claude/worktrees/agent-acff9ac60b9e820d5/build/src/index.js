/* =============================================================================
   weoc-ui — build entry (barrel)

   SOURCE entry point. Imports every behaviour module in dependency + side-effect
   order; the bundler (Rollup + Babel) concatenates them into ONE ES5 IIFE
   published as JS/weoc-ui.js. Boards reference that built artifact only — never
   this file, never the individual modules.

   ── Macro categories (see src/README.md) ────────────────────────────────────
     core/          foundation: WUI singleton, theme, utils, DOM helpers
     interaction/   things the user clicks: overlays, activate, disclosure, tabs
     integration/   WebEOC updatesection sync
     tables/        sticky cards <thead> state
     feedback/      toast / snackbar

   ── Principles (unchanged) ──────────────────────────────────────────────────
   • Framework-agnostic; the core depends on nothing (refreshSection is the one
     jQuery-dependent helper). Coexists with the page's jQuery.
   • Behaviours bind only off data-wui-* attributes, never board/component
     classes. Delegated on `document`, so content added later (WebEOC repeat
     regions, AJAX refreshes) is covered with no re-binding.
   • Accessibility (focus trap/restore, Esc, aria) owned centrally.
   ============================================================================= */

/* core/ — foundation. wui first (establishes WUI); theme second because it
   applies <html data-theme> synchronously on load, before first paint (no FOUC);
   utils before the modules that call WUI.ready() at load (disclosure, sticky). */
import './core/wui.js';
import './core/theme.js';
import './core/i18n.js';
import './core/utils.js';
import './core/responsive.js';
import './core/dom.js';

/* interaction/ — user-facing behaviours. Relative order not load-bearing: they
   attach handlers and only touch each other's WUI.* methods at interaction time. */
import './interaction/overlays.js';
import './interaction/activate.js';
import './interaction/disclosure.js';
import './interaction/sidebar.js';
import './interaction/segment-view.js';
import './interaction/tree-view.js';
import './interaction/tab-scroll.js';
import './interaction/view-mode.js';
import './interaction/timer.js';
import './interaction/confirm.js';
import './interaction/dirty-tracker.js';
import './interaction/dropzone.js';
import './interaction/loader.js';
import './interaction/number.js';
import './interaction/timeline.js';

/* integration/ + tables/ + feedback/ */
import './integration/sections.js';
import './tables/sticky-headers.js';
import './feedback/toast.js';
