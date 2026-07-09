import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     4) DISMISSIBLE OVERLAY LIFECYCLE  (drawers, modals, popovers, menus)
     Owns: open class, aria-hidden, scroll-lock, focus trap + restore, and a
     stack so Esc / outside-click only affect the top-most open panel.
     ═══════════════════════════════════════════════════════════════════════ */

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),' +
                  '[tabindex]:not([tabindex="-1"])';
  var stack = [];  // open panels, top-most last

  function openClassOf(panel) { return panel.getAttribute('data-wui-open-class') || 'is-open'; }
  function isOpen(panel) { return panel.classList.contains(openClassOf(panel)); }

  WUI.open = function (panel, trigger) {
    if (!panel || isOpen(panel)) return;
    panel.classList.add(openClassOf(panel));
    panel.setAttribute('aria-hidden', 'false');

    var backdrop = panel.hasAttribute('data-wui-backdrop');
    var entry = {
      panel: panel,
      trigger: trigger || null,
      returnFocus: document.activeElement,
      lock: backdrop || panel.hasAttribute('data-wui-lock'),
      trap: backdrop || panel.hasAttribute('data-wui-trap')
    };
    stack.push(entry);

    if (entry.lock) WUI.lockScroll();
    if (entry.trap) {
      var first = panel.querySelector(FOCUSABLE);
      if (first && first.focus) first.focus();
      else if (panel.focus) panel.focus();
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (trigger && panel.hasAttribute('data-wui-anchor')) {
      var anchorSpec = (panel.getAttribute('data-wui-anchor') || 'bottom-start').split('-');
      var anchorOpts = { side: anchorSpec[0] || 'bottom', align: anchorSpec[1] || 'start' };
      var anchorGap    = panel.getAttribute('data-wui-anchor-gap');
      var anchorMargin = panel.getAttribute('data-wui-anchor-margin');
      if (anchorGap    != null) anchorOpts.gap    = parseInt(anchorGap,    10);
      if (anchorMargin != null) anchorOpts.margin = parseInt(anchorMargin, 10);
      WUI.anchor(panel, trigger, anchorOpts);
    }
    panel.dispatchEvent(new CustomEvent('wui:open', { bubbles: true }));
  };

  WUI.close = function (panel) {
    if (!panel || !isOpen(panel)) return;
    panel.classList.remove(openClassOf(panel));
    panel.setAttribute('aria-hidden', 'true');

    var idx = -1;
    for (var i = stack.length - 1; i >= 0; i--) { if (stack[i].panel === panel) { idx = i; break; } }
    var entry = idx > -1 ? stack.splice(idx, 1)[0] : null;
    if (entry) {
      if (entry.lock) WUI.unlockScroll();
      if (entry.trigger) entry.trigger.setAttribute('aria-expanded', 'false');
      if (entry.trap && entry.returnFocus && entry.returnFocus.focus) entry.returnFocus.focus();
    }
    panel.dispatchEvent(new CustomEvent('wui:close', { bubbles: true }));
  };

  WUI.toggle = function (panel, trigger) {
    if (!panel) return;
    if (isOpen(panel)) WUI.close(panel); else WUI.open(panel, trigger);
  };

  /* close on outside / backdrop click — CAPTURE phase, so the very click that
     opens a panel (handled later in bubble) can't immediately close it. */
  document.addEventListener('click', function (e) {
    if (!stack.length) return;
    var entry = stack[stack.length - 1];
    var panel = entry.panel;
    if (panel.hasAttribute('data-wui-no-outside')) return;
    if (entry.trigger && entry.trigger.contains(e.target)) return;   // the toggle itself

    var backdrop = panel.hasAttribute('data-wui-backdrop');
    var outside = backdrop ? (e.target === panel)          // clicked the full-screen wrapper
                           : !panel.contains(e.target);    // clicked outside a floating panel
    if (outside) WUI.close(panel);
  }, true);

  /* Esc closes the top-most; Tab is trapped within a trapping panel. */
  document.addEventListener('keydown', function (e) {
    if (!stack.length) return;
    var entry = stack[stack.length - 1];
    var panel = entry.panel;

    if (e.key === 'Escape' && !panel.hasAttribute('data-wui-no-esc')) {
      WUI.close(panel);
      return;
    }
    if (e.key === 'Tab' && entry.trap) {
      var f = panel.querySelectorAll(FOCUSABLE);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* declarative: [data-wui-toggle] / [data-wui-dismiss] (bubble phase) */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-wui-toggle]');
    if (toggle) {
      var sel = toggle.getAttribute('data-wui-toggle');
      var panel = sel && document.querySelector(sel);
      if (panel) { e.preventDefault(); WUI.toggle(panel, toggle); }
      return;
    }
    var dismiss = e.target.closest('[data-wui-dismiss]');
    if (dismiss) {
      for (var i = stack.length - 1; i >= 0; i--) {
        if (stack[i].panel.contains(dismiss)) { e.preventDefault(); WUI.close(stack[i].panel); break; }
      }
    }
  });

  /* declarative: [data-wui-step="up|down"] — themed number stepper.
     Native <input type=number> spinners can't be re-themed, so .wui-number
     hides them (CSS) and supplies +/- buttons. Here we drive the input with
     the native stepUp()/stepDown() (which respect min/max/step) and fire
     input + change so validators / listeners react as if the user typed. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wui-step]');
    if (!btn) return;
    var wrap = btn.closest('.wui-number');
    var input = wrap && wrap.querySelector('input[type="number"]');
    if (!input || input.disabled || input.readOnly) return;
    e.preventDefault();
    try {
      if (btn.getAttribute('data-wui-step') === 'down') { input.stepDown(); }
      else { input.stepUp(); }
    } catch (err) { return; }   /* stepUp/Down throws on a malformed value */
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
