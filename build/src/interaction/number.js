import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     12) NUMBER  (auto-enhance native number inputs into the themed stepper)
     Every <input type="number"> that is not already wrapped and not opted out
     is upgraded IN PLACE into the .wui-number component: a presentational
     wrapper is inserted before the input, the SAME input node is moved into it
     (name/id/value/attributes/listeners all survive — nothing is cloned), and
     the two [data-wui-step] buttons are appended. The stepping itself lives in
     overlays.js (delegated [data-wui-step] → input.stepUp()/stepDown()); this
     module ONLY injects the markup so that handler has buttons to drive.

     Opt out with data-wui-no-step / data-wui-no-number on the input or any
     ancestor. Idempotent (input.__wuiNumber guard + "already child of
     .wui-number" check) so a second pass, WUI.ready, and the MutationObserver
     never double-wrap. Stepper aria-labels are localized via WUI.i18n
     (NumberStepUp / NumberStepDown) with data-wui-i18n-attr markers so they
     re-localize live on language switch. The buttons are aria-hidden mouse aids
     (tabindex=-1); the input stays keyboard-steppable and submits normally.

     API: WUI.enhanceNumbers(root) — boards call it after their own AJAX.
     Boot: immediate + WUI.ready + debounced MutationObserver on document.body.
     ═══════════════════════════════════════════════════════════════════════ */

  // en defaults — boards may override (and add ar) via WUI.i18n.register([...]).
  if (WUI.i18n && WUI.i18n.register) {
    WUI.i18n.register([
      { lang: 'en', id: 'NumberStepUp', value: 'Increase' },
      { lang: 'en', id: 'NumberStepDown', value: 'Decrease' }
    ]);
  }

  function wuiNumT(id, fallback) {
    return (WUI.i18n && WUI.i18n.t) ? WUI.i18n.t(id, fallback) : fallback;
  }

  var WUI_NO_NUMBER_SEL = '[data-wui-no-step],[data-wui-no-number]';

  function wuiNumberSkip(input) {
    if (!input || input.__wuiNumber) return true;
    // already the component's input (direct child of .wui-number)
    var parent = input.parentNode;
    if (parent && parent.nodeType === 1 &&
        parent.classList && parent.classList.contains('wui-number')) return true;
    // opted out on the input itself or any ancestor
    if (input.closest && input.closest(WUI_NO_NUMBER_SEL)) return true;
    return false;
  }

  function wuiNumberEnhanceOne(input) {
    if (wuiNumberSkip(input)) return;
    var parent = input.parentNode;
    if (!parent) return;                 // detached node — nothing to wrap into

    var wrap = document.createElement('div');
    wrap.className = 'wui-number';

    // Insert the wrapper where the input is, then MOVE the same input node into
    // it (appendChild relocates, it does not clone) so every attribute, the
    // current value, and all bound listeners are preserved.
    parent.insertBefore(wrap, input);
    wrap.appendChild(input);

    var btns = document.createElement('div');
    btns.className = 'wui-number-btns';
    btns.setAttribute('aria-hidden', 'true');
    btns.innerHTML =
      '<button type="button" class="wui-number-step" data-wui-step="up" tabindex="-1"' +
        ' aria-label="' + wuiNumT('NumberStepUp', 'Increase') + '"' +
        ' data-wui-i18n-attr="aria-label:NumberStepUp">' +
        '<span class="material-symbols-outlined">keyboard_arrow_up</span></button>' +
      '<button type="button" class="wui-number-step" data-wui-step="down" tabindex="-1"' +
        ' aria-label="' + wuiNumT('NumberStepDown', 'Decrease') + '"' +
        ' data-wui-i18n-attr="aria-label:NumberStepDown">' +
        '<span class="material-symbols-outlined">keyboard_arrow_down</span></button>';
    wrap.appendChild(btns);

    input.__wuiNumber = true;
  }

  WUI.enhanceNumbers = function (root) {
    root = root || document;
    var list = root.querySelectorAll ? root.querySelectorAll('input[type="number"]') : [];
    for (var i = 0; i < list.length; i++) wuiNumberEnhanceOne(list[i]);
    // root itself may be a bare number input handed in by a caller
    if (root.nodeType === 1 && root.matches && root.matches('input[type="number"]')) {
      wuiNumberEnhanceOne(root);
    }
  };

  function wuiBootNumbers() { WUI.enhanceNumbers(document); }

  // Run immediately (script typically executes after the inputs exist) and again
  // via WUI.ready for head-placed/deferred tags. enhanceNumbers is idempotent so
  // the redundant pass is a safe no-op.
  wuiBootNumbers();
  WUI.ready(wuiBootNumbers);

  // Watch for AJAX/repeat regions (WebEOC) adding number inputs after boot.
  // Conservative + cheap: bail unless an added element actually contains an
  // unwrapped number input, then debounce a full idempotent re-enhance.
  WUI.ready(function () {
    if (typeof MutationObserver === 'undefined' || !document.body) return;
    var rescan = WUI.debounce(function () { WUI.enhanceNumbers(document); }, 100);
    function hasNewNumberInput(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!n || n.nodeType !== 1) continue;
        if (n.matches && n.matches('input[type="number"]')) return true;
        if (n.querySelector && n.querySelector('input[type="number"]')) return true;
      }
      return false;
    }
    var obs = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (records[i].addedNodes && records[i].addedNodes.length &&
            hasNewNumberInput(records[i].addedNodes)) { rescan(); return; }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });
