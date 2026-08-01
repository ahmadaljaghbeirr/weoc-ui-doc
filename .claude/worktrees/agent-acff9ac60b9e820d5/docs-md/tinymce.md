# Rich Text (TinyMCE)

[← Index](README.md)

TinyMCE dressed in the agency theme: the toolbar chrome follows the page theme automatically, and the editor content re-themes live in lock-step through weoc-ui.js.

> **Two stylesheets, two documents:** The **chrome** (toolbar, menus, dialogs) lives on the page, so `tinymce-theme.css` loads as a normal `<link>` and follows `<html data-theme>` via agency tokens. The **content** is inside an `<iframe>` (a separate document), so `content_css` loads `agency-theme.css` (the tokens) *plus* `tinymce-content-tokens.css` (which consumes them) into the iframe. weoc-ui.js bridges the theme across the iframe boundary.

## Live editor

A fully themed editor. Toggle light/dark from the header, top-right — the toolbar, menus, and the typed content all switch together. Try the `Format` menu, tables, lists, and the `</>` source view; every surface is agency-tokened. The **JavaScript** box below the editor is the board-side init that drives it (load order plus the `tinymce.init` theme bridge) — shown for reference, not re-run here.

```html
<textarea id="demo-tinymce"><h2>Situation Report — Sector 4</h2>
<p>The <strong>Emergency Operations Centre</strong> is staffed and operating at <a href="#">Tier 3</a>. Damage assessment is underway across the eastern grid.</p>
<blockquote>All field teams report to the staging area by 0900.</blockquote>
<h3>Immediate actions</h3>
<ul>
  <li>Confirm shelter capacity across the three reception centres</li>
  <li>Establish comms with the mutual-aid convoy</li>
  <li>Draft the public information statement for review</li>
</ul>
<table>
  <thead><tr><th>Resource</th><th>Status</th></tr></thead>
  <tbody>
    <tr><td>Ambulances</td><td>6 available</td></tr>
    <tr><td>Shelter cots</td><td>420 deployed</td></tr>
  </tbody>
</table>
<p>Inline <code>code</code> and a short code block:</p>
<pre>status: ACTIVE
tier: 3</pre></textarea>
```

```js
// 1 · agency tokens are already on the page (weoc-ui-core.css @imports agency-theme.css)
// 2 · engine  <script src="vendor/tinymce-8.6.0/tinymce.min.js"></script>
// 3 · chrome  <link rel="stylesheet" href="CSS/tinymce-theme.css">
// 4 · bridge  <script src="JS/weoc-ui.js"></script>

tinymce.init({
  selector: '#demo-tinymce',
  license_key: 'gpl',                              // self-hosted GPL build
  content_css: [                                   // → both injected into the editor iframe
    'CSS/weoc-ui/agency-theme.css',                //   agency tokens + Cairo + light/dark
    'CSS/tinymce-content-tokens.css'               //   content styling (consumes those tokens)
  ],
  plugins: 'lists link table code help wordcount autolink',
  toolbar: 'undo redo | blocks | bold italic underline | forecolor | ' +
           'bullist numlist | link table | blockquote | removeformat | code',
  branding: false,
  promotion: false,
  // bridge the page theme into the content iframe (fires after content_css applies);
  // WUI.setTheme emits wui:themechange, and weoc-ui.js re-themes every open editor
  init_instance_callback: function (ed) { WUI.applyTinyMCETheme(ed); }
});
```

## Load order

Load TinyMCE, then the chrome skin on the page. Pass the content stylesheet through `content_css` so it lands inside the editor iframe.

```html
<!-- 1 · agency tokens must already be on the page (weoc-ui-core.css @imports agency-theme.css) -->
<link rel="stylesheet" href="CSS/weoc-ui/weoc-ui-core.css">

<!-- 2 · the engine (self-hosted; skins/themes/models/icons/plugins resolve from this folder) -->
<script src="vendor/tinymce-8.6.0/tinymce.min.js"></script>

<!-- 3 · the CHROME skin (toolbar/menus/dialogs) — a page-level stylesheet -->
<link rel="stylesheet" href="CSS/tinymce-theme.css">

<!-- 4 · weoc-ui.js provides the theme bridge -->
<script src="JS/weoc-ui.js"></script>
```

## Initialise + theme bridge

One line in `init_instance_callback` syncs the iframe to the current theme once the editor is fully ready. Live toggles are handled for you: `WUI.setTheme` fires `wui:themechange`, and weoc-ui.js re-themes every open editor. The **Live editor** section above shows this exact init as its JavaScript box.

### Theme API (weoc-ui.js)

`WUI.applyTinyMCETheme(editor)` sets the current theme on one editor's iframe. `WUI.syncTinyMCETheme()` re-syncs every live editor (this is what runs on `wui:themechange`). If TinyMCE is present before weoc-ui.js binds, editors are auto-synced on init and you can drop the `setup` line entirely.

## How the sync works

The editor content is an `<iframe>`, a separate document that does not inherit the page's `data-theme`. So `content_css` loads `agency-theme.css` into the iframe (the real tokens, Cairo, and the `[data-theme="dark"]` block) with `tinymce-content-tokens.css` on top consuming them, and weoc-ui.js writes `data-theme` onto the iframe's own `<html>`. Flip the page theme and both documents move together. Load `agency-theme.css` here, not `weoc-ui-core.css` — the core reset's `body` rules would break the editor's content body.

> **Self-hosted layout:** The engine is vendored at `vendor/tinymce-8.6.0/tinymce.min.js` with its `skins/`, `themes/`, `models/`, `icons/`, and `plugins/` beside it. TinyMCE derives `base_url` from the script's own location, so those runtime assets load from the same folder with no CDN and no extra config. Set `license_key: 'gpl'` to silence the API-key notice on the GPL build.
