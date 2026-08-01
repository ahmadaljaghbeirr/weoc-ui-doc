import { WUI } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     12) CONFIRM DIALOG  (promise-based confirmation on the wui-modal engine)
     WUI.confirm(opts) -> Promise<boolean> (true = confirmed, false = cancelled/
     dismissed). Builds a singleton `wui-modal` reused across calls and wires it
     through the overlays engine (WUI.open/WUI.close) — backdrop, focus-trap,
     scroll-lock, Esc, and focus-restore all come free from overlays.js; this
     module only owns text/tone population and promise resolution.

     opts: { messageKey, titleKey, confirmKey, cancelKey, tone, message, title }
       *Key are WUI.i18n lookup keys (never literal text); message/title are
       optional literal fallbacks when no key applies. tone (e.g. 'danger')
       becomes a class on the confirm button.

     Declarative: a trigger carrying [data-wui-confirm="<message-key>"] auto-
     wires. Its default action (submit / navigation / click) is intercepted;
     the dialog opens; the original action is re-dispatched ONLY on confirm.
     Replaces legacy destructive confirm() calls (remove-file, delete-record).

     Optional trigger attributes:
       data-wui-confirm-title    i18n key for the dialog title
       data-wui-confirm-ok       i18n key for the confirm button label
       data-wui-confirm-cancel   i18n key for the cancel button label
       data-wui-confirm-tone     class added to the confirm button (e.g. danger)
       data-wui-confirm-submit   force form submission even if type != submit
     ═══════════════════════════════════════════════════════════════════════ */

  if (WUI.i18n && WUI.i18n.register) {
    WUI.i18n.register([
      { lang: 'en', id: 'ConfirmTitle',  value: 'Please confirm' },
      { lang: 'en', id: 'ConfirmOk',     value: 'Confirm' },
      { lang: 'en', id: 'ConfirmCancel', value: 'Cancel' }
    ]);
  }

  var confirmModal = null;
  var confirmPending = null;   // { resolve } while a confirm() promise is outstanding

  /* Always-keyed fields (title/ok/cancel): key wins, else literal, else the
     given fallback i18n key so the dialog is never blank/unlocalized. */
  function confirmSetKeyed(el, key, literal, fallbackKey) {
    if (key) { WUI.i18n.mark(el, key); return; }
    el.removeAttribute('data-wui-i18n');
    if (literal != null) { el.textContent = literal; return; }
    WUI.i18n.mark(el, fallbackKey);
  }

  function confirmSettle(result) {
    if (!confirmPending) return;
    var resolve = confirmPending.resolve;
    confirmPending = null;
    WUI.close(confirmModal);
    resolve(result);
  }

  function buildConfirmModal() {
    if (confirmModal) return confirmModal;

    confirmModal = document.createElement('div');
    confirmModal.id = 'wui-confirm-modal';
    confirmModal.className = 'wui-modal sm';
    confirmModal.setAttribute('data-wui-backdrop', 'true');
    confirmModal.innerHTML =
      '<div class="wui-modal-dialog">' +
        '<div class="wui-modal-header">' +
          '<span class="wui-modal-title" data-wui-confirm-title-el></span>' +
          '<button type="button" class="wui-modal-close" data-wui-confirm-x-el aria-label="Close">' +
            '<span class="material-symbols-outlined">close</span>' +
          '</button>' +
        '</div>' +
        '<div class="wui-modal-body"><p data-wui-confirm-msg-el></p></div>' +
        '<div class="wui-modal-footer">' +
          '<button type="button" class="wui-btn ghost secondary" data-wui-confirm-cancel-el></button>' +
          '<button type="button" class="wui-btn primary" data-wui-confirm-ok-el></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(confirmModal);

    confirmModal.querySelector('[data-wui-confirm-ok-el]').addEventListener('click', function () { confirmSettle(true); });
    confirmModal.querySelector('[data-wui-confirm-cancel-el]').addEventListener('click', function () { confirmSettle(false); });
    confirmModal.querySelector('[data-wui-confirm-x-el]').addEventListener('click', function () { confirmSettle(false); });

    /* Esc / backdrop click close via the overlays engine directly (not through
       an OK/Cancel handler above) — settle as cancelled. A no-op if an OK/Cancel
       click already settled and closed the modal in the same tick. */
    confirmModal.addEventListener('wui:close', function () { confirmSettle(false); });

    return confirmModal;
  }

  WUI.confirm = function (opts) {
    opts = opts || {};
    buildConfirmModal();

    if (confirmPending) confirmSettle(false);   // a prior confirm() is still open — cancel it

    var titleEl  = confirmModal.querySelector('[data-wui-confirm-title-el]');
    var msgEl    = confirmModal.querySelector('[data-wui-confirm-msg-el]');
    var okEl     = confirmModal.querySelector('[data-wui-confirm-ok-el]');
    var cancelEl = confirmModal.querySelector('[data-wui-confirm-cancel-el]');

    confirmSetKeyed(titleEl, opts.titleKey, opts.title, 'ConfirmTitle');
    confirmSetKeyed(okEl, opts.confirmKey, null, 'ConfirmOk');
    confirmSetKeyed(cancelEl, opts.cancelKey, null, 'ConfirmCancel');

    if (opts.messageKey) { WUI.i18n.mark(msgEl, opts.messageKey); }
    else { msgEl.removeAttribute('data-wui-i18n'); msgEl.textContent = opts.message != null ? opts.message : ''; }

    okEl.className = 'wui-btn ' + (opts.tone || 'primary');

    return new Promise(function (resolve) {
      confirmPending = { resolve: resolve };
      WUI.open(confirmModal);
    });
  };

  /* declarative wiring: [data-wui-confirm="<message-key>"] ------------------ */

  function confirmProceed(trigger) {
    trigger.__wuiConfirmBypass = true;   // let the re-dispatched click/submit through untouched
    var form = trigger.form || trigger.closest('form');
    var wantsSubmit = form && (trigger.hasAttribute('data-wui-confirm-submit') || trigger.type === 'submit');
    if (wantsSubmit) {
      if (form.requestSubmit) form.requestSubmit(trigger); else form.submit();
    } else if (trigger.tagName === 'A' && trigger.getAttribute('href')) {
      window.location.href = trigger.getAttribute('href');
    } else {
      trigger.click();
    }
  }

  function wuiBootConfirm() {
    if (WUI.__confirmWired) return;   // idempotent: bind the delegated listener once
    WUI.__confirmWired = true;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-wui-confirm]');
      if (!trigger) return;

      if (trigger.__wuiConfirmBypass) { trigger.__wuiConfirmBypass = false; return; }   // our own re-dispatch
      e.preventDefault();
      e.stopImmediatePropagation();

      WUI.confirm({
        messageKey: trigger.getAttribute('data-wui-confirm'),
        titleKey:   trigger.getAttribute('data-wui-confirm-title')  || undefined,
        confirmKey: trigger.getAttribute('data-wui-confirm-ok')     || undefined,
        cancelKey:  trigger.getAttribute('data-wui-confirm-cancel') || undefined,
        tone:       trigger.getAttribute('data-wui-confirm-tone')   || undefined
      }).then(function (ok) { if (ok) confirmProceed(trigger); });
    }, true);   // capture: intercept before the trigger's own default action / handlers fire
  }
  // Run immediately for the (typical) case where this script executes after
  // triggers already exist in the DOM, and also via WUI.ready as a fallback for
  // head-placed/deferred script tags. wuiBootConfirm is guarded above, so the
  // redundant second pass (and any accidental double-load) is a safe no-op.
  wuiBootConfirm();
  WUI.ready(wuiBootConfirm);
