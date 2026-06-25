/* =============================================
   weoc-anim.js — Animation companion for weoc-ui
   Version: 0.1.0

   Self-loads gsap.min.js from the same directory — no separate CDN tag needed.
   Deploy both files to the same folder on the server:

     Shared/JS/gsap.min.js      ← downloaded from gsap.com
     Shared/JS/weoc-anim.js     ← this file

   Board <head> only needs:

     <script src="Shared/JS/weoc-ui.js" />
     <script src="Shared/JS/weoc-anim.js" />

   Namespace: window.WUIAnim

   If gsap.min.js fails to load, every method is a silent no-op so boards
   don't need guards. Stubs are set synchronously; real methods replace
   them once GSAP is ready.

   API surface:
     WUIAnim.ring(el, toPct, opts)             — tween a ring to a value
     WUIAnim.ringEntrance(el, opts)            — animate a freshly-injected ring in
     WUIAnim.sectionEntrance(container, opts)  — entrance for all rings in a reloaded section
     WUIAnim.completion(el, opts)              — 100% completion flourish
     WUIAnim.counter(el, from, to, opts)       — standalone numeric ticker
     WUIAnim.bar(el, toPct, opts)              — animate a wui-progress-bar-fill

   Exposed internals (for extension):
     WUIAnim.RING_CIRC       — 326.73 (2π × r52, matches stroke-dasharray)
     WUIAnim.DUR             — duration constants aligned with weoc-progress.css
     WUIAnim.EASE            — ease strings aligned with library CSS transitions
     WUIAnim.pctToOffset()   — convert 0–100 → stroke-dashoffset
     WUIAnim.reducedMotion() — live prefers-reduced-motion check

   Deploy: upload gsap.min.js + weoc-anim.js together to Shared/JS/ on cdn.atlascrisis.com
   ============================================= */

(function (global) {
  'use strict';

  // Capture synchronously — document.currentScript is only valid during IIFE evaluation.
  // We use it to derive the sibling path to gsap.min.js so the board only needs one
  // <script> tag (this file). gsap.min.js must live in the same directory as weoc-anim.js.
  var _selfSrc = document.currentScript && document.currentScript.src;
  var GSAP_URL = _selfSrc
    ? _selfSrc.replace(/\/[^/?#]+$/, '/gsap.min.js')
    : 'gsap.min.js';

  // ── Stubs ─────────────────────────────────────────────────────────────────
  // Set synchronously so any board code that calls WUIAnim before GSAP is ready
  // gets a harmless no-op rather than an error. Replaced by real methods in init().
  function installStubs() {
    global.WUIAnim = {
      ring: function () {},
      ringEntrance: function () {},
      sectionEntrance: function () {},
      completion: function () {},
      counter: function () {},
      bar: function () {},
      RING_CIRC: 326.73,
      reducedMotion: function () { return true; },
    };
  }

  // ── GSAP loader ───────────────────────────────────────────────────────────
  // If GSAP is already on the page skip the fetch. Otherwise inject a sibling
  // <script> tag pointing at gsap.min.js in the same directory as this file.
  function loadGSAP(onReady) {
    if (typeof gsap !== 'undefined') {
      onReady();
      return;
    }
    var s = document.createElement('script');
    s.src = GSAP_URL;
    s.onload  = onReady;
    s.onerror = function () {
      console.warn('[weoc-anim] Failed to load gsap.min.js from: ' + GSAP_URL +
        '\nEnsure gsap.min.js is in the same directory as weoc-anim.js on the server.');
    };
    document.head.appendChild(s);
  }

  // ── Init (runs once GSAP is confirmed present) ────────────────────────────
  function init() {

    // ── Motion preference ─────────────────────────────────────────────────
    var _motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function reducedMotion() { return _motionMq.matches; }

    // ── Constants ─────────────────────────────────────────────────────────
    // RING_CIRC: 2π × r(52) = 326.73, matches stroke-dasharray in weoc-progress.css.
    // Dashoffset formula: RING_CIRC × (1 − pct/100).
    //   0%   → 326.73  (full offset = empty ring)
    //   100% → 0       (zero offset = full ring)
    var RING_CIRC = 326.73;

    // Duration constants (seconds) aligned with weoc-progress.css and weoc-layout.css.
    var DUR = {
      fast: 0.18,   // quick swaps — badges, icon flips
      base: 0.30,   // standard UI — matches CSS 0.3s transitions
      ring: 0.85,   // matches "transition: stroke-dashoffset 0.85s" in weoc-progress.css
      slow: 1.10,   // entrance sequences, emphasis
    };

    // Ease strings. GSAP accepts CSS cubic-bezier() strings and its own named eases.
    // "standard" and "decelerate" are Material Design 3 curves, matching weoc-progress.css.
    var EASE = {
      standard:   'cubic-bezier(0.4, 0, 0.2, 1)',  // M3 standard — value-to-value
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',    // M3 decelerate — entrances
      spring:     'back.out(1.4)',                  // overshoot — completion moments
      elastic:    'elastic.out(1, 0.5)',            // bounce-back — scale settle
    };

    // ── Geometry helpers ───────────────────────────────────────────────────
    function pctToOffset(pct) {
      return RING_CIRC * (1 - (Math.max(0, Math.min(100, pct)) / 100));
    }

    function getFill(el) {
      if (!el) return null;
      if (el.classList && el.classList.contains('wui-progress-ring-fill')) return el;
      return el.querySelector('.wui-progress-ring-fill');
    }

    function getPctEl(el) {
      if (!el) return null;
      return el.querySelector('.wui-progress-ring-pct');
    }

    function getCurrentPct(el) {
      var fill = getFill(el);
      if (!fill) return 0;
      var offset = parseFloat(fill.style.strokeDashoffset);
      if (isNaN(offset)) return 0;
      return Math.round((1 - offset / RING_CIRC) * 100);
    }

    // ── WUIAnim ───────────────────────────────────────────────────────────
    var WUIAnim = {};

    // ── ring(el, toPct, opts) ─────────────────────────────────────────────
    // Tween a progress ring from its current rendered value to toPct.
    //
    // el:    .wui-progress-ring wrapper, or .wui-progress-ring-fill circle directly
    // toPct: target percentage 0–100
    // opts:
    //   from       {number}          override starting pct (default: read from DOM)
    //   duration   {number}          seconds (default: DUR.ring)
    //   ease       {string}          GSAP ease (default: EASE.standard)
    //   counter    {boolean|Element} animate .wui-progress-ring-pct alongside ring;
    //                                pass true (auto-find) or a DOM element; false to skip
    //   onComplete {function}
    //
    // Returns the GSAP timeline.
    WUIAnim.ring = function (el, toPct, opts) {
      opts = opts || {};
      var fill = getFill(el);
      if (!fill) return;

      var fromPct  = opts.from !== undefined ? opts.from : getCurrentPct(el);
      var toOffset = pctToOffset(toPct);
      var dur      = opts.duration !== undefined ? opts.duration : DUR.ring;
      var ease     = opts.ease || EASE.standard;

      if (reducedMotion()) {
        fill.style.strokeDashoffset = toOffset;
        var ctrElRM = opts.counter === false ? null
          : (opts.counter instanceof Element ? opts.counter : getPctEl(el));
        if (ctrElRM) ctrElRM.textContent = Math.round(toPct) + '%';
        if (opts.onComplete) opts.onComplete();
        return;
      }

      var tl = gsap.timeline({ onComplete: opts.onComplete });

      tl.to(fill, { strokeDashoffset: toOffset, duration: dur, ease: ease });

      // Counter animation runs in parallel with the ring tween ("<" position).
      var ctrEl = opts.counter === false ? null
        : (opts.counter instanceof Element ? opts.counter : getPctEl(el));

      if (ctrEl) {
        var proxy = { val: fromPct };
        tl.to(proxy, {
          val: toPct,
          duration: dur,
          ease: ease,
          onUpdate: function () { ctrEl.textContent = Math.round(proxy.val) + '%'; },
        }, '<');
      }

      return tl;
    };

    // ── ringEntrance(el, opts) ────────────────────────────────────────────
    // Animate a ring to its target value with full ring + counter animation.
    // Reads target from data-target-pct (preferred) or inline strokeDashoffset.
    // Use for single-ring injections; for bulk post-reload use sectionEntrance().
    //
    // opts:
    //   from       {number}   starting pct (default 0 for page-load; pass the
    //                         old value after a per-row reload to animate old→new)
    //   duration   {number}   seconds (default DUR.ring)
    //   ease       {string}   auto: EASE.decelerate for entrance (from=0),
    //                         EASE.standard for value changes (from>0)
    //   counter    {boolean}  animate .wui-progress-ring-pct text (default true)
    //   onComplete {function}
    WUIAnim.ringEntrance = function (el, opts) {
      opts = opts || {};
      var fill = getFill(el);
      if (!fill) return;

      // Prefer data-target-pct (set by XSL / buildProgressRingHtml).
      // Fallback: derive from the rendered inline stroke-dashoffset.
      var targetPct;
      var dataPct = el.dataset && el.dataset.targetPct;
      if (dataPct !== undefined && dataPct !== '') {
        targetPct = parseInt(dataPct, 10);
      } else {
        var renderedOffset = parseFloat(fill.style.strokeDashoffset);
        if (isNaN(renderedOffset)) return;
        targetPct = Math.round((1 - renderedOffset / RING_CIRC) * 100);
      }
      if (isNaN(targetPct)) return;

      var fromPct = opts.from !== undefined ? opts.from : 0;
      var ctrEl   = opts.counter !== false ? getPctEl(el) : null;

      if (reducedMotion()) {
        fill.style.strokeDashoffset = pctToOffset(targetPct);
        if (ctrEl) ctrEl.textContent = targetPct + '%';
        if (opts.onComplete) opts.onComplete();
        return;
      }

      // Set starting state — CSS transition won't conflict because XSL always
      // renders the fill as empty (326.73), so this set is effectively a no-op.
      gsap.set(fill, { strokeDashoffset: pctToOffset(fromPct) });
      if (ctrEl) ctrEl.textContent = fromPct + '%';

      return WUIAnim.ring(el, targetPct, Object.assign({}, opts, {
        from: fromPct,
        duration: opts.duration !== undefined ? opts.duration : DUR.ring,
        ease: opts.ease || (fromPct === 0 ? EASE.decelerate : EASE.standard),
        counter: opts.counter !== false,
      }));
    };

    // ── sectionEntrance(containerEl, opts) ───────────────────────────────
    // Call after reloadSection() or any innerHTML swap on a container.
    // Finds all .wui-progress-ring elements, reads each ring's target dashoffset
    // from its inline style, snaps them to empty, then tweens to target with stagger.
    //
    // Usage:
    //   await reloadSection("items-body");
    //   WUIAnim.sectionEntrance(document.getElementById("items-body"));
    //
    // opts:
    //   stagger    {number}   seconds between each ring start (default 0.06)
    //   delay      {number}   seconds before the first ring starts (default 0)
    //   duration   {number}   each ring tween duration (default DUR.ring)
    //   ease       {string}   GSAP ease (default EASE.decelerate)
    //   onComplete {function} fired after the last ring finishes
    WUIAnim.sectionEntrance = function (containerEl, opts) {
      opts = opts || {};
      if (reducedMotion()) return;

      var rings = Array.from(containerEl.querySelectorAll('.wui-progress-ring'));
      if (!rings.length) return;

      // Build item list — prefer data-target-pct, fall back to inline dashoffset.
      var items = [];
      rings.forEach(function (ring) {
        var fill = getFill(ring);
        if (!fill) return;
        var targetPct;
        var dataPct = ring.dataset && ring.dataset.targetPct;
        if (dataPct !== undefined && dataPct !== '') {
          targetPct = parseInt(dataPct, 10);
        } else {
          var renderedOffset = parseFloat(fill.style.strokeDashoffset);
          if (isNaN(renderedOffset)) return;
          targetPct = Math.round((1 - renderedOffset / RING_CIRC) * 100);
        }
        if (isNaN(targetPct)) return;
        items.push({
          fill: fill,
          targetOffset: pctToOffset(targetPct),
          targetPct: targetPct,
          ctr: getPctEl(ring),
        });
      });

      if (!items.length) return;

      var stagger = opts.stagger !== undefined ? opts.stagger : 0.06;
      var delay   = opts.delay || 0;
      var dur     = opts.duration !== undefined ? opts.duration : DUR.ring;
      var ease    = opts.ease || EASE.decelerate;

      // Snap fills to empty + counters to 0. XSL always renders the fill as empty
      // (stroke-dashoffset:326.73) so this set is a no-op for the fill — no CSS
      // transition fires before GSAP takes control.
      items.forEach(function (item) {
        gsap.set(item.fill, { strokeDashoffset: RING_CIRC });
        if (item.ctr) item.ctr.textContent = '0%';
      });

      // Tween fills in batch with stagger.
      gsap.to(items.map(function (it) { return it.fill; }), {
        strokeDashoffset: function (i) { return items[i].targetOffset; },
        duration: dur,
        ease: ease,
        stagger: { each: stagger },
        delay: delay,
        onComplete: opts.onComplete,
      });

      // Tween counters individually with matching per-item delays.
      items.forEach(function (item, i) {
        if (!item.ctr || item.targetPct === 0) return;
        var proxy = { val: 0 };
        gsap.to(proxy, {
          val: item.targetPct,
          duration: dur,
          ease: ease,
          delay: delay + i * stagger,
          onUpdate: function () { item.ctr.textContent = Math.round(proxy.val) + '%'; },
        });
      });
    };

    // ── completion(el, opts) ──────────────────────────────────────────────
    // Animate a ring to 100% with a completion flourish:
    //   1. Ring sweeps to full with spring ease (slight overshoot on the arc).
    //   2. Ring wrapper scales up briefly then settles with an elastic bounce.
    //
    // Reserved for moments that deserve emphasis — Apply at 100%, auto-Completed
    // status transitions, KPM modal at 100%. For regular value changes use ring().
    //
    // opts:
    //   duration   {number}   ring sweep duration (default DUR.ring)
    //   counter    {boolean}  animate counter text alongside (default true)
    //   onComplete {function}
    WUIAnim.completion = function (el, opts) {
      opts = opts || {};
      var fill = getFill(el);
      if (!fill) return;

      if (reducedMotion()) {
        fill.style.strokeDashoffset = 0;
        var ctrElRM = getPctEl(el);
        if (ctrElRM) ctrElRM.textContent = '100%';
        if (opts.onComplete) opts.onComplete();
        return;
      }

      var fromPct = getCurrentPct(el);
      var dur     = opts.duration !== undefined ? opts.duration : DUR.ring;

      var tl = gsap.timeline({ onComplete: opts.onComplete });

      // Step 1 — ring sweeps to 100% with spring overshoot
      tl.to(fill, { strokeDashoffset: 0, duration: dur, ease: EASE.spring });

      // Step 2 — wrapper scales up slightly (starts 0.12s before ring finishes)
      tl.to(el, { scale: 1.10, duration: 0.16, ease: 'power2.out' }, '-=0.12');

      // Step 3 — settle back with elastic bounce
      tl.to(el, { scale: 1, duration: 0.30, ease: EASE.elastic });

      // Counter runs in parallel with the ring sweep
      if (opts.counter !== false) {
        var ctrEl = getPctEl(el);
        if (ctrEl) {
          var proxy = { val: fromPct };
          tl.to(proxy, {
            val: 100,
            duration: dur,
            ease: EASE.spring,
            onUpdate: function () { ctrEl.textContent = Math.round(proxy.val) + '%'; },
          }, '<');
        }
      }

      return tl;
    };

    // ── counter(el, from, to, opts) ───────────────────────────────────────
    // Standalone numeric ticker for any text element.
    //
    // opts:
    //   duration   {number}   seconds (default DUR.base)
    //   ease       {string}   (default 'power1.out')
    //   suffix     {string}   appended after the number (default '')
    //   onComplete {function}
    WUIAnim.counter = function (el, from, to, opts) {
      opts = opts || {};
      var suffix = opts.suffix !== undefined ? opts.suffix : '';

      if (reducedMotion()) {
        el.textContent = Math.round(to) + suffix;
        if (opts.onComplete) opts.onComplete();
        return;
      }

      var proxy = { val: from };
      return gsap.to(proxy, {
        val: to,
        duration: opts.duration !== undefined ? opts.duration : DUR.base,
        ease: opts.ease || 'power1.out',
        onUpdate: function () { el.textContent = Math.round(proxy.val) + suffix; },
        onComplete: opts.onComplete,
      });
    };

    // ── bar(el, toPct, opts) ──────────────────────────────────────────────
    // Animate a .wui-progress-bar-fill width from its current value to toPct.
    //
    // el: .wui-progress-bar wrapper OR .wui-progress-bar-fill element directly
    // opts:
    //   duration   {number}   seconds (default DUR.ring — matches CSS transition)
    //   ease       {string}   (default EASE.standard)
    //   onComplete {function}
    WUIAnim.bar = function (el, toPct, opts) {
      opts = opts || {};
      var fill = (el.classList && el.classList.contains('wui-progress-bar-fill'))
        ? el : el.querySelector('.wui-progress-bar-fill');
      if (!fill) return;

      var target = Math.max(0, Math.min(100, toPct)) + '%';

      if (reducedMotion()) {
        fill.style.width = target;
        if (opts.onComplete) opts.onComplete();
        return;
      }

      return gsap.to(fill, {
        width: target,
        duration: opts.duration !== undefined ? opts.duration : DUR.ring,
        ease: opts.ease || EASE.standard,
        onComplete: opts.onComplete,
      });
    };

    // ── Expose ────────────────────────────────────────────────────────────
    WUIAnim.RING_CIRC     = RING_CIRC;
    WUIAnim.DUR           = DUR;
    WUIAnim.EASE          = EASE;
    WUIAnim.pctToOffset   = pctToOffset;
    WUIAnim.reducedMotion = reducedMotion;

    // Replace the stubs installed synchronously on page load
    global.WUIAnim = WUIAnim;

  } // end init()

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  // Stubs go on window immediately so synchronous WUIAnim calls before GSAP
  // loads are harmless no-ops rather than ReferenceErrors.
  installStubs();
  loadGSAP(init);

})(window);
