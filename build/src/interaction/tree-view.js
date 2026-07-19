import { WUI, INTERACTIVE } from '../core/wui.js';

  /* ═══════════════════════════════════════════════════════════════════════
     TREE VIEW  (structure-only: hierarchy, expand/collapse, single selection)
     No rendering, no data model — the consumer builds/rebuilds node markup
     (cloneTemplate loops, same as any other JS-built list in this codebase);
     this module only reacts to clicks via document-level delegation, so it
     needs no init call and is automatically correct after any rebuild.

       <div data-wui-tree role="tree">
         <div class="wui-tree-node" data-wui-tree-node role="treeitem"
              aria-expanded="false" data-value="...">
           <div class="wui-tree-node-row">
             <span class="wui-tree-node-toggle" data-wui-tree-toggle>
               <span class="material-symbols-outlined wui-tree-chevron">chevron_right</span>
             </span>
             <span class="wui-tree-node-content"><!-- consumer content --></span>
           </div>
           <div class="wui-tree-children" role="group"><!-- recursive nodes --></div>
         </div>
       </div>

     Leaf nodes simply omit the toggle span + .wui-tree-children — the
     component never inspects node content to decide branch vs leaf.
     Consumer sets initial aria-expanded/is-open/is-selected/aria-selected
     when it builds each node; this module has no load-time seeding pass
     (unlike disclosure.js) because tree markup doesn't exist at parse time.
     ═══════════════════════════════════════════════════════════════════════ */

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-wui-tree-toggle]');
    if (!toggle) return;
    var node = toggle.closest('[data-wui-tree-node]');
    if (!node) return;
    e.stopPropagation();
    var open = node.classList.toggle('is-open');
    node.setAttribute('aria-expanded', open ? 'true' : 'false');
    node.dispatchEvent(new CustomEvent('wui:treetoggle', { bubbles: true, detail: { node: node, open: open } }));
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-wui-tree-toggle]')) return;
    if (e.target.closest(INTERACTIVE)) return;
    var row = e.target.closest('.wui-tree-node-row');
    if (!row) return;
    var node = row.closest('[data-wui-tree-node]');
    if (!node) return;
    var root = node.closest('[data-wui-tree]');
    if (!root) return;
    var items = root.querySelectorAll('[data-wui-tree-node]');
    WUI.selectOne(items, node, 'is-selected');
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-selected', items[i] === node ? 'true' : 'false');
    }
    node.dispatchEvent(new CustomEvent('wui:treeselect', { bubbles: true, detail: { node: node, value: node.getAttribute('data-value') } }));
  });
