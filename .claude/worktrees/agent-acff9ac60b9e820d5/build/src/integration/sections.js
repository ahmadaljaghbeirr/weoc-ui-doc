import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     9) SECTION OBSERVER & PROGRAMMATIC REFRESH
     Utilities for WebEOC updatesection integration:

     WUI.observeSection(target, callback)
       Passive watcher. Fires callback() whenever WebEOC replaces the
       element's innerHTML (on section refresh) OR the element itself
       (full-element replacement by updatesection). Uses MutationObserver
       with childList:true (NOT subtree) on both the element and its parent —
       the same pattern proven in Display - Kanban Tasks. Safe to call N
       times per view for N independent sections. Callback must be
       idempotent: WebEOC can fire more than one mutation per refresh cycle.

     WUI.refreshSection(target, opts)
       Active trigger. jQuery AJAX GET to the current view URL (or opts.url),
       parses the response with DOMParser, extracts the matching element by id,
       swaps innerHTML. Fires wui:sectionrefresh after swap. The MutationObserver
       registered via observeSection also fires — make callbacks idempotent.
       Requires jQuery ($ must be available). opts: { url, data, before, done, error }.
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Watch a WebEOC updatesection element for DOM refreshes.
   * Fires callback() after each WebEOC-triggered or programmatic replacement.
   *
   * @param  {Element|string} target   - updatesection element or CSS selector
   * @param  {function}       callback - called after each DOM refresh (no args)
   * @returns {{ disconnect: function }}
   */
  WUI.observeSection = function (target, callback) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || typeof callback !== 'function') return { disconnect: function () {} };

    var observer = new MutationObserver(function () {
      callback();
    });

    /* childList only — catches innerHTML swap and full element replacement.
       NOT subtree: JS-driven grandchild mutations (card moves, class toggles,
       TomSelect inits) never re-trigger. Same guarantee as Kanban pattern. */
    observer.observe(el, { childList: true });
    if (el.parentElement) {
      observer.observe(el.parentElement, { childList: true });
    }

    return { disconnect: function () { observer.disconnect(); } };
  };

  /**
   * Programmatically refresh a single WebEOC updatesection element via jQuery AJAX.
   * Fetches the view URL, extracts the matching section from the response by id,
   * swaps innerHTML, fires wui:sectionrefresh, then calls opts.done.
   * The MutationObserver from observeSection also fires — make callbacks idempotent.
   * Requires jQuery ($ global).
   *
   * @param {Element|string} target           - updatesection element or CSS selector (must have id)
   * @param {object}         [opts]
   * @param {string}         [opts.url]       - fetch URL (default: window.location.href)
   * @param {object}         [opts.data]      - query params passed to $.ajax
   * @param {function}       [opts.before]    - called before fetch, receives section element
   * @param {function}       [opts.done]      - called after DOM swap, receives section element
   * @param {function}       [opts.error]     - called on AJAX failure, receives jqXHR, status
   */
  WUI.refreshSection = function (target, opts) {
    if (typeof $ === 'undefined') {
      console.warn('WUI.refreshSection: jQuery ($) is required but not found');
      return;
    }
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || !el.id) {
      console.warn('WUI.refreshSection: target must resolve to an element with an id');
      return;
    }

    opts = $.extend({ url: window.location.href, data: {}, before: null, done: null, error: null }, opts);

    if (typeof opts.before === 'function') opts.before(el);

    $.ajax({
      url:    opts.url,
      method: 'GET',
      data:   opts.data,
      success: function (html) {
        /* DOMParser handles full HTML documents safely.
           jQuery $(html) strips <html>/<head> and may execute scripts. */
        var doc     = new DOMParser().parseFromString(html, 'text/html');
        var freshEl = doc.getElementById(el.id);

        if (!freshEl) {
          console.warn('WUI.refreshSection: #' + el.id + ' not found in response');
          return;
        }

        /* innerHTML swap keeps element identity intact for any live observer.
           outerHTML replace would stale the el reference and confuse the
           parent-watching observer. */
        el.innerHTML = freshEl.innerHTML;

        el.dispatchEvent(new CustomEvent('wui:sectionrefresh', {
          bubbles: true, detail: { el: el }
        }));

        if (typeof opts.done === 'function') opts.done(el);
      },
      error: function (xhr, status) {
        if (typeof opts.error === 'function') opts.error(xhr, status);
      },
    });
  };
