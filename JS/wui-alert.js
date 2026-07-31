/* =============================================================================
   wui-alert.js  —  weoc-ui alert/confirm adapter

   Thin wrapper around SweetAlert2, matching this library's WUI.<name>(opts)
   factory convention (see wui-charts.js's WUI.chart/WUI.pie/WUI.donut —
   opts-driven, token-read-at-call-time, console.warn + graceful fallback
   instead of throwing). Board code never calls Swal.fire() directly — only
   WUI.alert()/WUI.confirm() — so every theming/override detail lives in one
   place instead of leaking SweetAlert2-specific knowledge to every call site.

   Unlike WUI.chart(el, opts)/WUI.heatmap(el, opts)/WUI.kanban(el, opts),
   these two factories take NO host element — a SweetAlert2 popup is a
   global, self-positioning overlay, not something mounted inside a
   caller-supplied container, so there is nothing for an `el` argument to
   do. This is a deliberate, spec-driven exception to the (el, opts) shape,
   not an oversight.

   ── Engine ───────────────────────────────────────────────────────────────
   SweetAlert2 v11.x (self-contained "all" UMD bundle — CSS is separate).
   Must be loaded BEFORE this file:
     <link  rel="stylesheet" href="path/to/sweetalert2.min.css">
     <link  rel="stylesheet" href="path/to/sweetalert2-weoc-theme.css">
     <script src="path/to/sweetalert2.all.min.js"></script>

   ── API index ────────────────────────────────────────────────────────────
   WUI.alert(opts)              Fire an informational popup (single OK
                                 button). Returns SweetAlert2's own
                                 Promise<SweetAlertResult> unchanged — an
                                 alert has only one real outcome, nothing to
                                 normalize.
     opts.title                 string
     opts.text                  string (plain text body)
     opts.html                  string (rich body — passed straight to
                                 SweetAlert2's own `html` option; caller
                                 owns sanitization, same trust boundary as
                                 every other *-html i18n marker in this
                                 library)
     opts.icon                  'success' | 'error' | 'warning' | 'info' |
                                 'question' (omit for a plain popup, no icon)
     ...any other real SweetAlert2 option — passed through verbatim.

   WUI.confirm(opts)            Fire a confirm/cancel popup (two buttons).
                                 Resolves a PLAIN BOOLEAN — true only when
                                 the user pressed Confirm; false for Cancel,
                                 backdrop click, Esc, or the close button.
                                 Deliberately NARROWED vs SweetAlert2's own
                                 richer { isConfirmed, isDismissed,
                                 dismiss, ... } result shape, matching what
                                 callers like WUI.kanban()'s
                                 opts.onBeforeMove(card, from, to) already
                                 expect (return/resolve a boolean).
     opts.confirmText            Alias for SweetAlert2's confirmButtonText.
     opts.cancelText              Alias for SweetAlert2's cancelButtonText.
     ...same title/text/html/icon/etc as WUI.alert, passed through verbatim.

   ── Fallback ─────────────────────────────────────────────────────────────
   If window.Swal is undefined when called (SweetAlert2 failed to load —
   same class of failure as any other missing script dependency in this
   codebase, e.g. WUI.chart() when window.uPlot is missing): console.warn
   once, then fall back to native window.alert()/window.confirm() so the
   caller's flow never silently breaks or hangs. Matches the "graceful
   degradation, never a silent no-op, never a crash" pattern already
   established for the docs search feature's index-fetch-failure case.

   ── IE11-adjacent compatibility ─────────────────────────────────────────
   var, function declarations, no arrow functions, no template literals, no
   destructuring — matches wui-charts.js's stated constraint (WebEOC's
   embedded browser requires it).
   ============================================================================= */

(function (root) {
  'use strict';

  /* ── Ensure WUI namespace ─────────────────────────────────────────────── */
  if (!root.WUI) { root.WUI = {}; }

  /*
   * _copyOpts(opts)
   * Shallow-copies the caller's opts so mutating it below (stripping the
   * confirmText/cancelText aliases, adding showCancelButton) never touches
   * the object the caller still holds a reference to.
   */
  function _copyOpts(opts) {
    var out = {};
    for (var k in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, k)) { out[k] = opts[k]; }
    }
    return out;
  }

  /*
   * _fallbackMessage(opts)
   * Best-effort flattening of {title, text} into a single string for the
   * native alert()/confirm() fallback path — those APIs take one string,
   * not SweetAlert2's structured opts.
   */
  function _fallbackMessage(opts) {
    var msg = opts.title || '';
    if (opts.text) { msg = msg ? (msg + '\n\n' + opts.text) : opts.text; }
    return msg;
  }

  function _warnMissing(fnName, nativeName) {
    if (root.console && root.console.warn) {
      console.warn(
        '[wui-alert] WUI.' + fnName + '() called but window.Swal is not defined. ' +
        'Load SweetAlert2 before wui-alert.js:\n' +
        '  <script src="path/to/sweetalert2.all.min.js"><\/script>\n' +
        'Falling back to native window.' + nativeName + '().'
      );
    }
  }

  /*
   * WUI.alert(opts)
   * ────────────────
   * See header for the full option list. Returns SweetAlert2's own
   * Promise<SweetAlertResult>, or a Promise resolving a stand-in
   * { isConfirmed: true, isDenied: false, isDismissed: false } shape when
   * falling back to native window.alert() (kept Promise-shaped so callers
   * don't need an `if (window.Swal)` branch of their own).
   */
  function alert(opts) {
    opts = opts || {};

    if (typeof root.Swal === 'undefined') {
      _warnMissing('alert', 'alert');
      root.alert(_fallbackMessage(opts));
      return Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false });
    }

    var fireOpts = _copyOpts(opts);
    return root.Swal.fire(fireOpts);
  }

  /*
   * WUI.confirm(opts)
   * ──────────────────
   * See header for the full option list. Resolves a plain boolean, never
   * SweetAlert2's own result object — true for Confirm, false for
   * anything else (Cancel, backdrop click, Esc, close button). Falls back
   * to native window.confirm() (synchronous, but still wrapped in a
   * Promise for a uniform call shape) if SweetAlert2 isn't loaded.
   */
  function confirm(opts) {
    opts = opts || {};

    if (typeof root.Swal === 'undefined') {
      _warnMissing('confirm', 'confirm');
      return Promise.resolve(root.confirm(_fallbackMessage(opts)));
    }

    var fireOpts = _copyOpts(opts);
    fireOpts.showCancelButton = true;
    if (opts.confirmText) { fireOpts.confirmButtonText = opts.confirmText; }
    if (opts.cancelText)  { fireOpts.cancelButtonText  = opts.cancelText; }
    delete fireOpts.confirmText;
    delete fireOpts.cancelText;

    return root.Swal.fire(fireOpts).then(function (result) {
      return !!(result && result.isConfirmed);
    });
  }

  /* ── Attach to WUI namespace ──────────────────────────────────────────── */
  root.WUI.alert   = alert;
  root.WUI.confirm = confirm;

}(window));
