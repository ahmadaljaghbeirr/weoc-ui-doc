import { WUI } from './wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     2) CLASS HELPERS
     ═══════════════════════════════════════════════════════════════════════ */

  /* Set one class from a mutually-exclusive group (e.g. ratio-3-2 vs ratio-2-1
     on the split). Pass value = '' / null to clear them all. */
  WUI.setVariant = function (el, value, group) {
    if (!el) return;
    (group || []).forEach(function (c) { el.classList.remove(c); });
    if (value) el.classList.add(value);
  };

  /* Roving "active": mark target within a group and clear the siblings.
     items: selector string | NodeList | Array.  cls: string | string[]. */
  WUI.selectOne = function (items, target, cls) {
    var classes = Array.isArray(cls) ? cls : [cls || 'is-active'];
    var list = typeof items === 'string' ? document.querySelectorAll(items) : items;
    Array.prototype.forEach.call(list, function (el) {
      var on = el === target;
      classes.forEach(function (c) { el.classList.toggle(c, on); });
    });
  };

  /* ═══════════════════════════════════════════════════════════════════════
     3) POSITIONING
     ═══════════════════════════════════════════════════════════════════════ */

  /* Position a FIXED floating element next to a trigger, flipping vertically and
     clamping horizontally to stay on-screen. Covers the popover / map-pin
     placement views hand-roll.
     opts: { side:'bottom'|'top', align:'start'|'center'|'end', gap, margin }. */
  WUI.anchor = function (floating, trigger, opts) {
    opts = opts || {};
    var gap = opts.gap == null ? 6 : opts.gap;
    var margin = opts.margin == null ? 8 : opts.margin;
    var vw = window.innerWidth, vh = window.innerHeight;
    var t = trigger.getBoundingClientRect();
    var fw = floating.offsetWidth, fh = floating.offsetHeight;
    var top;

    if (opts.side === 'top') {
      top = t.top - fh - gap;
      if (top < margin) top = t.bottom + gap;                 // flip down if no room
    } else {
      top = t.bottom + gap;
      if (top + fh > vh - margin) top = t.top - fh - gap;     // flip up if no room
      if (top < margin) top = margin;
    }

    /* Resolve logical align (start/end) to a physical edge honoring direction:
       under RTL 'start' is the RIGHT edge and 'end' is the LEFT edge, so a
       bottom-end popover anchors to the trigger's LEFT in Arabic. */
    var rtl;
    try { rtl = window.getComputedStyle(floating).direction === 'rtl'; }
    catch (e) { rtl = document.documentElement.getAttribute('dir') === 'rtl'; }
    var startEdge = rtl ? (t.right - fw) : t.left;   // logical-start aligned
    var endEdge   = rtl ? t.left : (t.right - fw);   // logical-end aligned
    var align = opts.align || 'end';
    var left = align === 'start'  ? startEdge
             : align === 'center' ? t.left + (t.width - fw) / 2
             :                      endEdge;
    left = Math.max(margin, Math.min(left, vw - fw - margin)); // clamp on-screen

    floating.style.position = 'fixed';
    floating.style.top = Math.round(top) + 'px';
    floating.style.left = Math.round(left) + 'px';
    floating.style.right = 'auto';
  };
