import { WUI } from '../core/wui.js';

  /* ── §11. Toast / Snackbar ─────────────────────────────────────────────────
     Transient notifications. Imperative API; DOM is created on demand and torn
     down after the exit transition. Skinned by weoc-feedback.css §5. No GSAP
     dependency (CSS transitions + WUI.afterTransition). Position regions are
     fixed and self-managing (created on first use, removed when emptied).

       WUI.toast(message[, opts])     corner toast; returns a handle { el, dismiss }
       WUI.snackbar(message[, opts])  bottom-center, single-at-a-time, inline action
       WUI.dismissToast(handle|el)    dismiss one
       WUI.dismissToasts()            dismiss all live toasts/snackbars

     opts: { variant, position, duration, icon, title, dismissible, action }
       variant     '' | primary | info | success | warning | danger  (drives rail + icon)
       position    top-right (default) | top-left | top-center | bottom-right |
                   bottom-left | bottom-center   (ignored for snackbar → bottom-center)
       duration    ms before auto-dismiss; 0 = sticky. Default 4000 (toast) / 6000 (snackbar).
                   Paused while the pointer is over the toast.
       icon        material-symbol name; auto per variant, null to omit
       title       optional bold heading above the message
       dismissible show a close button (default true)
       action      string label, or { label, onClick(handle) }. Fires wui:toast:action.

     Events (bubble on the toast element): wui:toast:show / wui:toast:dismiss /
     wui:toast:action. detail.toast = the element.
     ──────────────────────────────────────────────────────────────────────── */
  var TOAST_ICONS = {
    primary: 'info', info: 'info', success: 'check_circle',
    warning: 'warning', danger: 'error', neutral: 'notifications'
  };
  var TOAST_DEFAULT_MS = 4000;
  var SNACKBAR_DEFAULT_MS = 6000;
  var TOAST_STACK_CAP = 5;
  var toastRegions = {};   /* position -> region element */

  function toastRegion(position) {
    var pos = position || 'top-right';
    if (toastRegions[pos] && document.body.contains(toastRegions[pos])) return toastRegions[pos];
    var region = document.createElement('div');
    region.className = 'wui-toast-region ' + pos;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(region);
    toastRegions[pos] = region;
    return region;
  }

  function toastEmit(el, name) {
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { toast: el } }));
  }

  function showToast(message, opts, isSnackbar) {
    opts = opts || {};
    var position = isSnackbar ? 'bottom-center' : (opts.position || 'top-right');
    var region = toastRegion(position);
    var variant = opts.variant || '';

    var el = document.createElement('div');
    el.className = (isSnackbar ? 'wui-toast wui-snackbar' : 'wui-toast') + (variant ? ' ' + variant : '');
    el.setAttribute('role', variant === 'danger' ? 'alert' : 'status');

    /* icon — snackbars are icon-less unless a variant or explicit icon is given */
    var iconName = opts.icon != null ? opts.icon
                 : (variant ? TOAST_ICONS[variant] : (isSnackbar ? null : TOAST_ICONS.neutral));
    if (iconName) {
      var icon = document.createElement('span');
      icon.className = 'wui-toast-icon material-symbols-outlined';
      icon.textContent = iconName;
      el.appendChild(icon);
    }

    var body = document.createElement('div');
    body.className = 'wui-toast-body';
    if (opts.title) {
      var title = document.createElement('div');
      title.className = 'wui-toast-title';
      title.textContent = opts.title;
      body.appendChild(title);
    }
    var msg = document.createElement('div');
    msg.className = 'wui-toast-msg';
    msg.textContent = message == null ? '' : String(message);
    body.appendChild(msg);
    el.appendChild(body);

    var handle = { el: el, dismiss: function () {} };
    var timer = null, dismissed = false;
    var duration = opts.duration != null ? opts.duration
                 : (isSnackbar ? SNACKBAR_DEFAULT_MS : TOAST_DEFAULT_MS);

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function startTimer() { clearTimer(); if (duration > 0) timer = setTimeout(dismiss, duration); }
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      clearTimer();
      el.classList.add('is-leaving');
      el.classList.remove('is-visible');
      toastEmit(el, 'wui:toast:dismiss');
      WUI.afterTransition(el, function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        var reg = toastRegions[position];
        if (reg && !reg.children.length && reg.parentNode) {
          reg.parentNode.removeChild(reg);
          delete toastRegions[position];
        }
      }, 400);
    }
    handle.dismiss = dismiss;

    /* action button */
    if (opts.action) {
      var actLabel = typeof opts.action === 'string' ? opts.action : (opts.action.label || 'Action');
      var actFn = (opts.action && typeof opts.action === 'object') ? opts.action.onClick : null;
      var actBtn = document.createElement('button');
      actBtn.type = 'button';
      actBtn.className = 'wui-toast-action';
      actBtn.textContent = actLabel;
      actBtn.addEventListener('click', function () {
        toastEmit(el, 'wui:toast:action');
        if (typeof actFn === 'function') { try { actFn(handle); } catch (e) {} }
        dismiss();
      });
      /* snackbar keeps the action inline on the row; toast stacks it under the body */
      if (isSnackbar) el.appendChild(actBtn); else body.appendChild(actBtn);
    }

    /* close button */
    if (opts.dismissible !== false) {
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'wui-toast-close';
      closeBtn.setAttribute('aria-label', 'Dismiss');
      closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
      closeBtn.addEventListener('click', dismiss);
      el.appendChild(closeBtn);
    }

    /* snackbar is single-at-a-time — dismiss any open snackbar first */
    if (isSnackbar) {
      var open = region.querySelectorAll('.wui-snackbar');
      for (var s = 0; s < open.length; s++) {
        if (open[s].__wuiToast) open[s].__wuiToast.dismiss();
      }
    }

    el.__wuiToast = handle;
    region.appendChild(el);

    /* stack cap — dismiss the oldest live toasts beyond the cap */
    var live = region.querySelectorAll('.wui-toast:not(.is-leaving)');
    if (live.length > TOAST_STACK_CAP) {
      for (var k = 0; k < live.length - TOAST_STACK_CAP; k++) {
        if (live[k].__wuiToast) live[k].__wuiToast.dismiss();
      }
    }

    /* force reflow, then flip to visible so the enter transition runs */
    el.offsetWidth;                 /* eslint-disable-line no-unused-expressions */
    el.classList.add('is-visible');
    toastEmit(el, 'wui:toast:show');

    /* pause auto-dismiss while hovered */
    el.addEventListener('mouseenter', clearTimer);
    el.addEventListener('mouseleave', startTimer);
    startTimer();

    return handle;
  }

  WUI.toast = function (message, opts) { return showToast(message, opts, false); };
  WUI.snackbar = function (message, opts) { return showToast(message, opts, true); };
  WUI.dismissToast = function (ref) {
    if (!ref) return;
    if (typeof ref.dismiss === 'function') ref.dismiss();
    else if (ref.nodeType === 1 && ref.__wuiToast) ref.__wuiToast.dismiss();
  };
  WUI.dismissToasts = function () {
    for (var pos in toastRegions) {
      if (!toastRegions.hasOwnProperty(pos)) continue;
      var items = toastRegions[pos].querySelectorAll('.wui-toast:not(.is-leaving)');
      for (var i = 0; i < items.length; i++) {
        if (items[i].__wuiToast) items[i].__wuiToast.dismiss();
      }
    }
  };
