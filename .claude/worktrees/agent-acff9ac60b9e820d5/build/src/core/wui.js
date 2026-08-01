/* weoc-ui core — the shared WUI singleton every module attaches to, plus the
   selector constants shared across modules.

   import { WUI }          hang API off the one instance
   import { INTERACTIVE }  "genuine control" guard so clicks on real inputs don't
                           trigger a card/row activate or an inline row-expand
                           (used by activate.js and disclosure.js)

   Kept ES5 (var) to match the WebEOC browser authoring constraint. */
export var WUI = window.WUI || (window.WUI = {});
WUI.version = '0.1.0';

export var INTERACTIVE = 'button,a[href],input,select,textarea,label,[data-wui-no-activate]';
