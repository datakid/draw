(function(){
'use strict';
if (typeof UI === 'undefined' || typeof window.DrawPro === 'undefined') return;
var Pro = window.DrawPro;
var W = window.DrawWorkbench = {};

var css = [
'.wb-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:16px;}',
'.wb-bar[hidden]{display:none;}',
'.wb-ctl{display:flex;align-items:center;gap:4px;padding:3px 4px 3px 12px;background:var(--glass-strong);border:1px solid var(--hairline);border-radius:999px;font-size:12px;color:var(--ink-2);}',
'.wb-ctl.is-active{border-color:var(--accent);background:var(--accent-quiet);}',
'.wb-ctl-btn{background:none;border:none;color:var(--ink);font:inherit;font-size:12px;font-weight:500;cursor:pointer;padding:5px 6px;border-radius:999px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
'.wb-ctl-btn:hover{color:var(--accent);}',
'.wb-range{width:92px;background:var(--bg-2);border:1px solid var(--hairline);border-radius:999px;padding:4px 8px;color:var(--ink);font:inherit;font-size:12px;}',
'.wb-range[type=date]{width:128px;}',
'.wb-range:focus{outline:none;border-color:var(--accent);}',
'.wb-x{background:none;border:none;color:var(--ink-3);cursor:pointer;font-size:15px;line-height:1;width:24px;height:24px;border-radius:50%;}',
'.wb-x:hover{color:var(--ink);background:var(--glass);}',
'.wb-pop{position:fixed;z-index:10000002;background:var(--bg-2);border:1px solid var(--hairline);border-radius:14px;box-shadow:0 24px 48px -20px rgba(0,0,0,.55);padding:8px;width:min(300px,calc(100vw - 16px));display:flex;flex-direction:column;gap:6px;animation:ddIn .14s var(--ease);}',
'.wb-pop-list{max-height:260px;overflow:auto;display:flex;flex-direction:column;scrollbar-width:thin;}',
'.wb-opt{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;font-size:13px;color:var(--ink);cursor:pointer;}',
'.wb-opt:hover{background:var(--glass);}',
'.wb-opt input{accent-color:var(--accent);margin:0;}',
'.wb-opt .c{margin-left:auto;color:var(--ink-3);font-size:11px;}',
'.wb-opt span:not(.c){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
'.wb-pop-row{display:flex;gap:6px;align-items:center;justify-content:space-between;}',
'.wb-link{background:none;border:none;color:var(--ink-2);font:inherit;font-size:12px;cursor:pointer;text-decoration:underline;text-underline-offset:2px;padding:2px 4px;}',
'.wb-link:hover{color:var(--ink);}',
'.wb-menu-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border:none;background:none;border-radius:8px;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;}',
'.wb-menu-item:hover,.wb-menu-item:focus-visible{background:var(--accent-quiet);color:var(--accent);outline:none;}',
'.wb-menu-item .c{color:var(--ink-3);font-size:11px;}',
'.wb-note{margin:-8px 6px 12px;font-size:13px;line-height:1.45;color:var(--ink-2);white-space:pre-wrap;}',
'.wb-text{width:100%;box-sizing:border-box;background:var(--glass-strong);border:1px solid var(--hairline);border-radius:var(--radius-control);padding:10px 12px;color:var(--ink);font:inherit;font-size:14px;}',
'.wb-text:focus{outline:none;border-color:var(--accent);}',
'textarea.wb-text{resize:vertical;min-height:64px;}',
'.wb-pad{padding:4px;overflow:auto;flex:1;min-height:0;}',
'.wb-section{border:1px solid var(--hairline);border-radius:var(--radius-control);padding:14px;margin-top:12px;}',
'.wb-section h3{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);margin:0 0 10px;}',
'.wb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;}',
'.wb-measure{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;}',
'.wb-measure .field-row{margin:0;}',
'.chart-card.wb-dragging{opacity:.45;}',
'.chart-card.wb-drop-target{box-shadow:0 0 0 2px var(--jade),0 24px 48px -24px rgba(0,0,0,.55);}',
'.icon-btn.wb-grip{cursor:grab;}',
'.chart-title{margin-right:240px !important;}',
'@media (max-width:640px){.chart-title{margin-right:0 !important;}}'
].join('');
var styleEl = document.createElement('style'); styleEl.textContent = css; document.head.appendChild(styleEl);

function ds(){ return Store.get().dataset; }
function q(s){ return escapeHtml(s == null ? '' : s); }
function maskAll(){
  var d = ds(); if (!d || !Filters.list.length) return null;
  var resolved = Filters.list.map(function(f){ return { filter: f, col: findColumn(d.columns, f.field), payloadSet: f.kind === 'in' ? new Set(f.payload) : null }; });
  var m = new Uint8Array(d.rowCount);
  for (var i = 0; i < d.rowCount; i++) m[i] = Filters.rowPasses(i, resolved) ? 1 : 0;
  return m;
}
function colRange(col){
  if (col._wbMM) return col._wbMM;
  var mn = Infinity, mx = -Infinity;
  for (var i = 0; i < col.values.length; i++){ var v = col.values[i]; if (isNaN(v)) continue; if (v < mn) mn = v; if (v > mx) mx = v; }
  col._wbMM = { min: isFinite(mn) ? mn : 0, max: isFinite(mx) ? mx : 0 };
  return col._wbMM;
}
function levelCounts(col){
  var counts = new Map();
  for (var i = 0; i < col.values.length; i++){ var l = catRawLabel(col, i); if (l === null) continue; counts.set(l, (counts.get(l) || 0) + 1); }
  return Array.from(counts.entries()).sort(function(a, b){ return b[1] - a[1]; });
}
function describeFilter(f){
  var d = ds(), col = d ? findColumn(d.columns, f.field) : null;
  var name = titleCase(f.field);
  if (f.kind === 'value') return name + ': ' + f.payload;
  if (f.kind === 'in') return name + ': ' + (f.payload.length <= 3 ? f.payload.join(', ') : f.payload.slice(0, 3).join(', ') + ' +' + (f.payload.length - 3));
  if (col && col.type === 'date') return name + ': ' + dayKey(f.payload[0]) + ' \u2013 ' + dayKey(f.payload[1]);
  return name + ': ' + Spec.formatCompact(f.payload[0]) + ' \u2013 ' + Spec.formatCompact(f.payload[1]);
}
W.describeFilter = describeFilter;

var origRegen = regenerateDashboardIds;
regenerateDashboardIds = function(rawPanels, rawFilters){
  var res = origRegen(rawPanels, rawFilters);
  var globals = (Array.isArray(rawFilters) ? rawFilters : []).filter(function(f){
    return f && f.panelId === 'global' && typeof f.field === 'string' && (f.kind === 'value' || f.kind === 'in' || f.kind === 'range');
  }).map(function(f){ return JSON.parse(JSON.stringify({ panelId: 'global', field: f.field, kind: f.kind, payload: f.payload })); });
  res.filters = res.filters.concat(globals);
  return res;
};

W.KEY = 'draw-wb-controls';
try { W.controls = JSON.parse(localStorage.getItem(W.KEY)) || []; } catch (e) { W.controls = []; }
if (!Array.isArray(W.controls)) W.controls = [];
function saveControls(){ try { localStorage.setItem(W.KEY, JSON.stringify(W.controls)); } catch (e) {} }

function globalFilter(field){ return Filters.list.filter(function(f){ return f.panelId === 'global' && f.field === field; })[0] || null; }
W.setGlobal = function(field, kind, payload){
  Filters.list = Filters.list.filter(function(f){ return !(f.panelId === 'global' && f.field === field); });
  if (kind) Filters.list.push({ panelId: 'global', field: field, kind: kind, payload: payload });
  UI.refreshAllPanels();
  UI.pushCommand();
};

var bar = document.createElement('div');
bar.className = 'wb-bar'; bar.id = 'wbFilterBar'; bar.hidden = true;
bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Dashboard filters');
var workspace = document.getElementById('workspace');
workspace.insertBefore(bar, workspace.firstChild);

function controlHtml(col){
  var f = globalFilter(col.name);
  var label = '<span>' + q(titleCase(col.name)) + '</span>';
  var x = '<button type="button" class="wb-x" data-remove aria-label="Remove ' + q(col.name) + ' control">\u00d7</button>';
  if (col.type === 'number' || col.type === 'date'){
    var mm = colRange(col), isDate = col.type === 'date';
    var show = function(v){ return isDate ? dayKey(v) : String(Number(v.toPrecision(10))); };
    var lo = f && f.kind === 'range' ? show(f.payload[0]) : '', hi = f && f.kind === 'range' ? show(f.payload[1]) : '';
    var t = isDate ? 'date' : 'number';
    return '<div class="wb-ctl' + (f ? ' is-active' : '') + '" data-field="' + q(col.name) + '">' + label +
      '<input class="wb-range" type="' + t + '" data-lo value="' + q(lo) + '" placeholder="' + q(show(mm.min)) + '" min="' + (isDate ? dayKey(mm.min) : '') + '" max="' + (isDate ? dayKey(mm.max) : '') + '" aria-label="' + q(col.name) + ' from">' +
      '<span aria-hidden="true">\u2013</span>' +
      '<input class="wb-range" type="' + t + '" data-hi value="' + q(hi) + '" placeholder="' + q(show(mm.max)) + '" min="' + (isDate ? dayKey(mm.min) : '') + '" max="' + (isDate ? dayKey(mm.max) : '') + '" aria-label="' + q(col.name) + ' to">' + x + '</div>';
  }
  var summary = 'All';
  if (f && f.kind === 'in') summary = f.payload.length === 1 ? f.payload[0] : (f.payload.length + ' selected');
  else if (f && f.kind === 'value') summary = f.payload;
  return '<div class="wb-ctl' + (f ? ' is-active' : '') + '" data-field="' + q(col.name) + '">' + label +
    '<button type="button" class="wb-ctl-btn" data-open aria-haspopup="dialog">' + q(summary) + '</button>' + x + '</div>';
}

W.renderBar = function(){
  var d = ds();
  if (!d || workspace.hidden) { bar.hidden = true; return; }
  var cols = W.controls.map(function(n){ return findColumn(d.columns, n); }).filter(Boolean);
  var hasGlobal = Filters.list.some(function(f){ return f.panelId === 'global'; });
  bar.hidden = false;
  bar.innerHTML = cols.map(controlHtml).join('') +
    '<button type="button" class="chip-btn" data-add aria-haspopup="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-filter"/></svg>' + (cols.length ? 'Add' : 'Add filter control') + '</button>' +
    (hasGlobal ? '<button type="button" class="wb-link" data-reset>Reset filters</button>' : '');
};
var barFrame = null;
function renderBarSoon(){
  if (barFrame) return;
  barFrame = requestAnimationFrame(function(){
    barFrame = null;
    var ae = document.activeElement;
    if (ae && bar.contains(ae) && ae.tagName === 'INPUT') return;
    W.renderBar();
  });
}
Store.subscribe(renderBarSoon);

var origPills = UI.renderFilterPills;
UI.renderFilterPills = function(){
  origPills.apply(this, arguments);
  var c = UI.els.filterPills;
  if (c && !c.hidden){
    Array.prototype.slice.call(c.querySelectorAll('.filter-pill')).forEach(function(p){
      var f = Filters.list[parseInt(p.getAttribute('data-filter-index'), 10)];
      if (f && f.panelId === 'global') p.parentNode.removeChild(p);
    });
    if (!c.querySelector('.filter-pill')) c.hidden = true;
  }
  renderBarSoon();
};
var origVisible = UI.setWorkspaceControlsVisible;
UI.setWorkspaceControlsVisible = function(v){ origVisible.apply(this, arguments); renderBarSoon(); };

W.pop = null;
function closePop(){ if (!W.pop) return; var p = W.pop; W.pop = null; if (p.el.parentNode) p.el.parentNode.removeChild(p.el); if (p.anchor && document.body.contains(p.anchor)) p.anchor.setAttribute('aria-expanded', 'false'); }
W.closePop = closePop;
function openPop(anchor, html, onMount){
  closePop();
  var p = document.createElement('div');
  p.className = 'wb-pop'; p.setAttribute('role', 'dialog');
  p.innerHTML = html;
  document.body.appendChild(p);
  var r = anchor.getBoundingClientRect(), m = p.getBoundingClientRect();
  var left = Math.max(8, Math.min(r.left, window.innerWidth - m.width - 8));
  var top = r.bottom + 6;
  if (top + m.height > window.innerHeight - 8) top = Math.max(8, r.top - m.height - 6);
  p.style.left = left + 'px'; p.style.top = top + 'px';
  anchor.setAttribute('aria-expanded', 'true');
  W.pop = { el: p, anchor: anchor };
  p.addEventListener('keydown', function(e){ if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePop(); anchor.focus(); } });
  p.addEventListener('click', function(e){ e.stopPropagation(); });
  if (onMount) onMount(p);
}
document.addEventListener('mousedown', function(e){ if (W.pop && !W.pop.el.contains(e.target) && e.target !== W.pop.anchor) closePop(); }, true);
window.addEventListener('resize', closePop);

function openCategoryPop(anchor, col){
  var entries = levelCounts(col), CAP = 500;
  var shown = entries.slice(0, CAP);
  var f = globalFilter(col.name);
  var sel = new Set(f ? (f.kind === 'in' ? f.payload : [f.payload]) : entries.map(function(e){ return e[0]; }));
  var html = '<input type="search" class="pro-input wb-pop-search" placeholder="Search ' + q(titleCase(col.name)) + '\u2026" aria-label="Search values">' +
    '<div class="wb-pop-row"><span class="pro-note">' + entries.length.toLocaleString() + ' values</span><span><button type="button" class="wb-link" data-all>All</button><button type="button" class="wb-link" data-none>None</button></span></div>' +
    '<div class="wb-pop-list">' + shown.map(function(e, i){
      return '<label class="wb-opt" data-label="' + q(String(e[0]).toLowerCase()) + '"><input type="checkbox" data-i="' + i + '"' + (sel.has(e[0]) ? ' checked' : '') + '><span>' + q(e[0]) + '</span><span class="c">' + e[1].toLocaleString() + '</span></label>';
    }).join('') + '</div>' +
    (entries.length > CAP ? '<p class="pro-note">Showing the ' + CAP + ' most common. Search to narrow.</p>' : '') +
    '<div class="wb-pop-row"><span></span><button type="button" class="btn-primary" data-apply style="padding:8px 16px">Apply</button></div>';
  openPop(anchor, html, function(p){
    var search = p.querySelector('input[type=search]');
    search.addEventListener('input', function(){
      var t = search.value.toLowerCase().trim();
      Array.prototype.forEach.call(p.querySelectorAll('.wb-opt'), function(o){ o.hidden = t && o.getAttribute('data-label').indexOf(t) < 0; });
    });
    function setVisible(on){ Array.prototype.forEach.call(p.querySelectorAll('.wb-opt'), function(o){ if (!o.hidden) o.querySelector('input').checked = on; }); }
    p.querySelector('[data-all]').addEventListener('click', function(){ setVisible(true); });
    p.querySelector('[data-none]').addEventListener('click', function(){ setVisible(false); });
    p.querySelector('[data-apply]').addEventListener('click', function(){
      var checked = [];
      Array.prototype.forEach.call(p.querySelectorAll('.wb-opt input'), function(i){ if (i.checked) checked.push(shown[+i.getAttribute('data-i')][0]); });
      closePop();
      if (checked.length === entries.length) W.setGlobal(col.name, null);
      else W.setGlobal(col.name, 'in', checked);
      anchor = bar.querySelector('[data-field="' + CSS.escape(col.name) + '"] [data-open]');
      if (anchor) anchor.focus();
    });
    search.focus();
  });
}

W.openAddMenu = function(anchor){
  var d = ds(); if (!d) return;
  anchor = anchor || bar.querySelector('[data-add]');
  if (!anchor) return;
  var cols = d.columns.filter(function(c){ return !c.idLike && W.controls.indexOf(c.name) < 0 && (c.levels || c.type === 'number' || c.type === 'date'); });
  if (!cols.length) { UI.toast('Every column already has a control.'); return; }
  var kind = function(c){ return c.type === 'date' ? 'date range' : c.type === 'number' ? 'number range' : 'pick values'; };
  openPop(anchor, '<p class="pro-note" style="padding:2px 6px">Add a filter that applies to every chart</p><div class="wb-pop-list" role="menu">' +
    cols.map(function(c){ return '<button type="button" class="wb-menu-item" role="menuitem" data-col="' + q(c.name) + '"><span>' + q(titleCase(c.name)) + '</span><span class="c">' + kind(c) + '</span></button>'; }).join('') + '</div>',
    function(p){
      p.addEventListener('click', function(e){
        var b = e.target.closest('[data-col]'); if (!b) return;
        var name = b.getAttribute('data-col');
        closePop();
        W.controls.push(name); saveControls(); W.renderBar();
        var ctl = bar.querySelector('[data-field="' + CSS.escape(name) + '"]');
        var target = ctl && (ctl.querySelector('[data-open]') || ctl.querySelector('input'));
        if (target) { target.focus(); if (target.hasAttribute('data-open')) openCategoryPop(target, findColumn(ds().columns, name)); }
      });
      var first = p.querySelector('.wb-menu-item'); if (first) first.focus();
    });
};

bar.addEventListener('click', function(e){
  e.stopPropagation();
  var d = ds(); if (!d) return;
  if (e.target.closest('[data-add]')) { if (W.pop && W.pop.anchor === e.target.closest('[data-add]')) closePop(); else W.openAddMenu(e.target.closest('[data-add]')); return; }
  if (e.target.closest('[data-reset]')) { Filters.list = Filters.list.filter(function(f){ return f.panelId !== 'global'; }); UI.refreshAllPanels(); UI.pushCommand(); return; }
  var ctl = e.target.closest('.wb-ctl'); if (!ctl) return;
  var name = ctl.getAttribute('data-field'), col = findColumn(d.columns, name);
  if (e.target.closest('[data-remove]')) {
    W.controls = W.controls.filter(function(n){ return n !== name; }); saveControls();
    if (globalFilter(name)) W.setGlobal(name, null); else W.renderBar();
    return;
  }
  var openBtn = e.target.closest('[data-open]');
  if (openBtn && col) { if (W.pop && W.pop.anchor === openBtn) closePop(); else openCategoryPop(openBtn, col); }
});
bar.addEventListener('change', function(e){
  var input = e.target; if (!input.classList.contains('wb-range')) return;
  var ctl = input.closest('.wb-ctl'), name = ctl.getAttribute('data-field');
  var col = findColumn(ds().columns, name); if (!col) return;
  var loS = ctl.querySelector('[data-lo]').value.trim(), hiS = ctl.querySelector('[data-hi]').value.trim();
  if (!loS && !hiS) { W.setGlobal(name, null); return; }
  var mm = colRange(col), isDate = col.type === 'date';
  var parse = function(s, end){
    if (!s) return null;
    if (isDate) { var t = Date.parse(s + 'T00:00:00Z'); return isNaN(t) ? null : t + (end ? 86399999 : 0); }
    var n = parseFloat(s); return isNaN(n) ? null : n;
  };
  var lo = parse(loS, false), hi = parse(hiS, true);
  if (lo === null) lo = mm.min;
  if (hi === null) hi = isDate ? mm.max + 86399999 : mm.max;
  if (lo > hi) { var t2 = lo; lo = hi; hi = t2; }
  W.setGlobal(name, 'range', [lo, hi]);
});
bar.addEventListener('keydown', function(e){ if (e.key === 'Enter' && e.target.classList.contains('wb-range')) e.target.blur(); });
bar.addEventListener('focusout', function(e){ if (e.target.classList && e.target.classList.contains('wb-range')) setTimeout(renderBarSoon, 0); });

var REF_TYPES = { line: 1, area: 1, bar: 1, scatter: 1, histogram: 1, combo: 1, boxplot: 1, strip: 1, violin: 1, candlestick: 1 };
var AVG_TYPES = { line: 1, area: 1, bar: 1, scatter: 1 };
function num(v){ if (v === null || v === undefined || v === '') return null; var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,%\s]/g, '')); return isFinite(n) ? n : null; }
function addRefs(opt, spec){
  if (!opt.xAxis || !opt.yAxis || Array.isArray(opt.xAxis) || Array.isArray(opt.yAxis) || !Array.isArray(opt.series)) return;
  var key = opt.yAxis.type === 'value' ? 'yAxis' : (opt.xAxis.type === 'value' ? 'xAxis' : null);
  if (!key) return;
  var lines = [];
  var accent = readCSSVar('--accent'), jade = readCSSVar('--jade');
  var ref = num(spec.refValue);
  if (ref !== null) {
    var lbl = String(spec.refLabel || '').trim() || 'Target';
    lines.push({ name: lbl, value: ref, color: accent });
  }
  if (spec.showAvg && AVG_TYPES[spec.type]) {
    var main = opt.series.filter(function(s){ return !s._auxiliary && (s.type === 'line' || s.type === 'bar' || s.type === 'scatter') && s.data && s.data.length; });
    if (main.length === 1 || (spec.type === 'scatter' && main.length)) {
      var sum = 0, n = 0, idx = key === 'yAxis' ? 1 : 0;
      main.forEach(function(s){ s.data.forEach(function(d){
        var v = d && typeof d === 'object' && !Array.isArray(d) ? d.value : d;
        if (Array.isArray(v)) v = v[idx];
        if (typeof v === 'number' && isFinite(v)) { sum += v; n++; }
      }); });
      if (n) lines.push({ name: 'Average', value: sum / n, color: jade });
    }
  }
  if (!lines.length) return;
  var marker = {
    type: opt.series.some(function(s){ return s.type === 'scatter'; }) && !opt.series.some(function(s){ return s.type === 'line' && !s._auxiliary; }) ? 'scatter' : 'line',
    data: [], silent: true, _auxiliary: true, tooltip: { show: false }, z: 10,
    markLine: {
      silent: true, symbol: 'none', animation: false,
      data: lines.map(function(l){
        var item = { name: l.name, lineStyle: { color: l.color, type: 'dashed', width: 1.5 },
          label: { show: true, position: 'insideEndTop', color: l.color, fontSize: 11, fontWeight: 600, formatter: l.name + ': ' + Spec.formatCompact(l.value) } };
        item[key] = l.value;
        return item;
      })
    }
  };
  opt.series.push(marker);
}
var origBuild = Render.buildOption;
Render.buildOption = function(spec){
  var opt = origBuild.apply(this, arguments);
  if (opt && spec && REF_TYPES[spec.type] && (num(spec.refValue) !== null || spec.showAvg)) {
    try { addRefs(opt, spec); } catch (e) {}
  }
  return opt;
};

var origInspector = UI.renderInspector;
UI.renderInspector = function(){
  origInspector.apply(this, arguments);
  var spec = UI.currentSpec, box = UI.els.inspectorStyle;
  if (!spec || !box || !Store.get().dataset) return;
  var html = '<h3 style="margin-top:16px">Annotations</h3>';
  if (REF_TYPES[spec.type]) {
    html += '<div class="field-row"><label for="wbRefValue">Reference line value</label><input class="wb-text" id="wbRefValue" type="text" inputmode="decimal" data-wb-role="refValue" value="' + q(spec.refValue || '') + '" placeholder="e.g. 25000"></div>' +
      '<div class="field-row"><label for="wbRefLabel">Reference line label</label><input class="wb-text" id="wbRefLabel" type="text" data-wb-role="refLabel" value="' + q(spec.refLabel || '') + '" placeholder="Target"></div>';
    if (AVG_TYPES[spec.type] && !(spec.type !== 'scatter' && spec.seriesField)) html += toggleRow('Show average line', 'wbAvg', !!spec.showAvg).replace('data-role="wbAvg"', 'data-wb-role="showAvg"');
  }
  html += '<div class="field-row"><label for="wbNote">Note under the title</label><textarea class="wb-text" id="wbNote" data-wb-role="note" rows="2" maxlength="400" placeholder="What should readers notice?">' + q(spec.note || '') + '</textarea></div>';
  box.insertAdjacentHTML('beforeend', html);
  Array.prototype.forEach.call(box.querySelectorAll('[data-wb-role]'), function(el){
    el.addEventListener('change', function(){
      var role = el.getAttribute('data-wb-role');
      var value = el.type === 'checkbox' ? el.checked : el.value.trim();
      if (role === 'refValue' && value !== '' && num(value) === null) { UI.toast('Reference line needs a number.'); el.focus(); return; }
      UI.updateSpecField(role, value);
    });
  });
};

W.syncNotes = function(){
  UI.panels.forEach(function(p){
    var card = p.el && p.el.closest('.chart-card'); if (!card) return;
    var titleEl = card.querySelector('.chart-title');
    if (titleEl && p.spec && document.activeElement !== titleEl && titleEl.textContent !== p.spec.title) titleEl.textContent = p.spec.title || 'Untitled chart';
    var text = p.spec && p.spec.note ? String(p.spec.note).trim() : '';
    var n = card.querySelector('.wb-note');
    if (!n) {
      if (!text) return;
      n = document.createElement('p'); n.className = 'wb-note';
      var t = card.querySelector('.chart-title'); t.parentNode.insertBefore(n, t.nextSibling);
    }
    n.textContent = text; n.hidden = !text;
  });
};
var origLayout = UI.updatePanelGridLayout;
UI.updatePanelGridLayout = function(){ origLayout.apply(this, arguments); W.syncNotes(); };

W.reorder = function(from, to){
  if (from === to || from < 0 || to < 0 || from >= UI.panels.length || to >= UI.panels.length) return;
  var snap = UI.captureSnapshot(); if (!snap) return;
  var arr = snap.panels.slice(); var moved = arr.splice(from, 1)[0]; arr.splice(to, 0, moved);
  snap.panels = arr; snap.activeIndex = to;
  if (UI.applyPanelsAndFiltersOnly(snap)) UI.pushCommand();
};
var origCard = UI.panelCardHtml;
UI.panelCardHtml = function(){
  return origCard().replace('<div class="chart-toolbar">', '<div class="chart-toolbar"><button type="button" class="icon-btn wb-grip" data-action="drag" title="Drag to reorder (or Alt+\u2190/\u2192)" aria-label="Reorder chart: drag, or press Alt+Left/Right"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg></button>');
};
var grid = document.getElementById('panelGrid'), dragFrom = -1;
function cardIndex(card){ return Array.prototype.indexOf.call(grid.children, card); }
grid.addEventListener('pointerdown', function(e){ var g = e.target.closest('[data-action="drag"]'); if (g) g.closest('.chart-card').draggable = true; });
grid.addEventListener('pointerup', function(e){ var g = e.target.closest('[data-action="drag"]'); if (g) g.closest('.chart-card').draggable = false; });
grid.addEventListener('click', function(e){ if (e.target.closest('[data-action="drag"]')) e.stopPropagation(); }, true);
grid.addEventListener('keydown', function(e){
  var g = e.target.closest && e.target.closest('[data-action="drag"]'); if (!g || !e.altKey) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  var i = cardIndex(g.closest('.chart-card')), j = i + ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1);
  W.reorder(i, j);
  var c = grid.children[j]; if (c) { var ng = c.querySelector('[data-action="drag"]'); if (ng) ng.focus(); }
});
grid.addEventListener('dragstart', function(e){
  var card = e.target.closest && e.target.closest('.chart-card');
  if (!card || !card.draggable) return;
  dragFrom = cardIndex(card);
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', 'draw-card'); } catch (err) {}
  card.classList.add('wb-dragging');
});
grid.addEventListener('dragover', function(e){
  if (dragFrom < 0) return;
  e.preventDefault(); e.stopPropagation();
  var card = e.target.closest('.chart-card');
  Array.prototype.forEach.call(grid.children, function(c){ c.classList.toggle('wb-drop-target', c === card && cardIndex(c) !== dragFrom); });
});
grid.addEventListener('drop', function(e){
  if (dragFrom < 0) return;
  e.preventDefault(); e.stopPropagation();
  var card = e.target.closest('.chart-card'), to = card ? cardIndex(card) : -1, from = dragFrom;
  endDrag();
  if (to >= 0) W.reorder(from, to);
});
function endDrag(){
  dragFrom = -1;
  Array.prototype.forEach.call(grid.children, function(c){ c.classList.remove('wb-dragging', 'wb-drop-target'); c.draggable = false; });
}
grid.addEventListener('dragend', endDrag);

Pro.TABS.push(['combine', 'Combine files'], ['group', 'Group & pivot']);

Pro.renderers.combine = function(box){
  box.innerHTML = '<div class="wb-pad"><p class="pro-note">Add rows from another file (append), or bring in its columns by matching a key column (join). Your charts and filters stay, and Undo reverses it.</p>' +
    '<div class="pro-row" style="margin-top:12px"><button type="button" class="btn-primary" id="wbPick">Choose second file\u2026</button><input type="file" id="wbFile" accept=".csv,.tsv,.txt,.xlsx,.xls,.parquet,.json" hidden><span class="pro-note" id="wbFileInfo" role="status"></span></div>' +
    '<div id="wbCombineOpts"></div></div>';
  var input = box.querySelector('#wbFile'), info = box.querySelector('#wbFileInfo');
  box.querySelector('#wbPick').addEventListener('click', function(){ input.click(); });
  input.addEventListener('change', function(){
    var file = input.files && input.files[0]; input.value = '';
    if (!file) return;
    info.textContent = 'Reading ' + file.name + '\u2026';
    Data.fromFile(file, function(res){
      if (!res.ok) { info.textContent = res.message; return; }
      if (res.needsSheetPick) { W.secondBook = { workbook: res.workbook, sheetNames: res.sheetNames, name: file.name }; useSheet(res.sheetNames[0]); return; }
      W.secondBook = null;
      setSecond(res.rows, res.fields, file.name, '');
    });
  });
  function setSecond(rows, fields, name, sheet){
    var sp = box.querySelector('#wbSheetRow'); if (sp) sp.remove();
    if (W.secondBook) {
      var row = document.createElement('div'); row.className = 'pro-row'; row.id = 'wbSheetRow';
      row.innerHTML = '<label class="pro-note" for="wbSheet">Sheet</label><select id="wbSheet" aria-label="Sheet to combine">' + W.secondBook.sheetNames.map(function(s){ return '<option value="' + q(s) + '"' + (s === sheet ? ' selected' : '') + '>' + q(s) + '</option>'; }).join('') + '</select>';
      box.querySelector('#wbCombineOpts').before(row);
      row.querySelector('#wbSheet').addEventListener('change', function(e){ useSheet(e.target.value); });
    }
    var opts = box.querySelector('#wbCombineOpts');
    if (!rows || !rows.length) { W.second = null; opts.innerHTML = ''; info.textContent = name + (sheet ? ' \u00b7 ' + sheet : '') + ' has no rows.'; return; }
    W.second = { rows: rows, fields: fields, name: name, sheet: sheet };
    info.textContent = name + (sheet ? ' \u00b7 sheet \u201c' + sheet + '\u201d' : '') + ' \u00b7 ' + rows.length.toLocaleString() + ' rows \u00b7 ' + fields.length + ' columns';
    renderCombineOpts(opts);
  }
  function useSheet(sheet){
    var b = W.secondBook; if (!b) return;
    var ex = Data.extractSheet(b.workbook, sheet);
    setSecond(ex.rows, ex.fields, b.name, sheet);
  }
  if (W.secondBook && W.second) { setSecond(W.second.rows, W.second.fields, W.second.name, W.second.sheet); return; }
  if (W.second) { info.textContent = W.second.name + ' \u00b7 ' + W.second.rows.length.toLocaleString() + ' rows'; renderCombineOpts(box.querySelector('#wbCombineOpts')); }
};
function keyOf(v){ return Data.stringifyCell(v).trim().toLowerCase(); }
function renderCombineOpts(el){
  var st = Store.get(), sec = W.second, left = st.rawFields, right = sec.fields;
  var common = right.filter(function(f){ return left.indexOf(f) >= 0; });
  var guessL = common[0] || left[0], guessR = common[0] || right[0];
  var opt = function(list, sel){ return list.map(function(f){ return '<option value="' + q(f) + '"' + (f === sel ? ' selected' : '') + '>' + q(f) + '</option>'; }).join(''); };
  el.innerHTML =
    '<section class="wb-section"><h3>Append rows</h3><p class="pro-note">' + common.length + ' of ' + right.length + ' columns match by name' + (right.length - common.length ? '. ' + (right.length - common.length) + ' new columns will be added and left blank for existing rows' : '') + '.</p>' +
    '<div class="toggle-row" style="margin-top:10px"><label for="wbSrcCol">Add a \u201cSource\u201d column naming each file</label><input type="checkbox" id="wbSrcCol" checked></div>' +
    '<div class="modal-actions"><span></span><button type="button" class="btn-primary" id="wbAppend">Append ' + sec.rows.length.toLocaleString() + ' rows</button></div></section>' +
    '<section class="wb-section"><h3>Join columns</h3><div class="wb-grid">' +
    '<div class="field-row"><label>Key in current data</label><select id="wbKeyL">' + opt(left, guessL) + '</select></div>' +
    '<div class="field-row"><label>Key in ' + q(sec.name) + '</label><select id="wbKeyR">' + opt(right, guessR) + '</select></div>' +
    '<div class="field-row"><label>Keep</label><select id="wbJoinType"><option value="left">All current rows</option><option value="inner">Only rows that match</option></select></div></div>' +
    '<p class="pro-note" id="wbJoinPreview" role="status"></p>' +
    '<div class="modal-actions"><span></span><button type="button" class="btn-primary" id="wbJoin">Join</button></div></section>';
  UI.enhanceSelects(el);
  function preview(){
    var kl = el.querySelector('#wbKeyL').value, kr = el.querySelector('#wbKeyR').value;
    var rmap = new Map(), dup = 0;
    sec.rows.forEach(function(r){ var k = keyOf(r[kr]); if (!k) return; if (rmap.has(k)) dup++; else rmap.set(k, 1); });
    var hit = 0; st.rawRows.forEach(function(r){ if (rmap.has(keyOf(r[kl]))) hit++; });
    el.querySelector('#wbJoinPreview').textContent = hit.toLocaleString() + ' of ' + st.rawRows.length.toLocaleString() + ' current rows find a match' + (dup ? ' \u00b7 ' + dup.toLocaleString() + ' duplicate keys in the second file (first match is used)' : '') + '.';
  }
  el.addEventListener('change', function(e){ if (e.target.id === 'wbKeyL' || e.target.id === 'wbKeyR') preview(); });
  preview();
  el.querySelector('#wbAppend').addEventListener('click', function(){ W.append(el.querySelector('#wbSrcCol').checked); });
  el.querySelector('#wbJoin').addEventListener('click', function(){ W.join(el.querySelector('#wbKeyL').value, el.querySelector('#wbKeyR').value, el.querySelector('#wbJoinType').value); });
}
function applyCombined(rows, fields, label, msg){
  var ok = UI.restoreDashboardState({ version: DRAW_SCHEMA, rows: rows, fields: fields, sourceName: label,
    panels: UI.panels.map(function(p){ return { id: p.id, spec: p.spec }; }), filters: Filters.list, activeIndex: UI.activeIndex }, label);
  if (!ok) return;
  UI.pushCommand(); Pro.close();
  UI.toast(msg, { label: 'Undo', onClick: function(){ UI.undo(); } });
}
W.append = function(addSource){
  var st = Store.get(), sec = W.second; if (!sec || !st.rawRows) return;
  var fields = st.rawFields.slice();
  sec.fields.forEach(function(f){ if (fields.indexOf(f) < 0) fields.push(f); });
  var srcName = null;
  if (addSource) { srcName = 'Source'; var k = 2; while (fields.indexOf(srcName) >= 0) srcName = 'Source ' + (k++); fields.push(srcName); }
  var leftName = st.sourceName || 'Current data';
  var mk = function(r, label){ var o = Data.makeRow(); fields.forEach(function(f){ o[f] = r[f] === undefined ? null : r[f]; }); if (srcName) o[srcName] = label; return o; };
  var rows = st.rawRows.map(function(r){ return mk(r, leftName); }).concat(sec.rows.map(function(r){ return mk(r, sec.name); }));
  applyCombined(rows, fields, leftName + ' + ' + sec.name, 'Appended ' + sec.rows.length.toLocaleString() + ' rows from ' + sec.name);
};
W.join = function(keyL, keyR, type){
  var st = Store.get(), sec = W.second; if (!sec || !st.rawRows) return;
  var addCols = sec.fields.filter(function(f){ return f !== keyR; });
  var all = Data.dedupeHeaderNames(st.rawFields.concat(addCols));
  var newNames = all.slice(st.rawFields.length);
  var rmap = new Map();
  sec.rows.forEach(function(r){ var k = keyOf(r[keyR]); if (k && !rmap.has(k)) rmap.set(k, r); });
  var rows = [], hit = 0;
  st.rawRows.forEach(function(r){
    var m = rmap.get(keyOf(r[keyL]));
    if (!m && type === 'inner') return;
    if (m) hit++;
    var o = Data.makeRow();
    st.rawFields.forEach(function(f){ o[f] = r[f]; });
    addCols.forEach(function(f, i){ o[newNames[i]] = m ? (m[f] === undefined ? null : m[f]) : null; });
    rows.push(o);
  });
  if (!rows.length) { UI.toast('No rows matched \u2014 nothing to join.'); return; }
  applyCombined(rows, all, (st.sourceName || 'Data') + ' \u22c8 ' + sec.name, 'Joined ' + addCols.length + ' columns \u00b7 ' + hit.toLocaleString() + ' rows matched');
};

var AGGS = [['sum', 'Sum'], ['avg', 'Average'], ['median', 'Median'], ['min', 'Min'], ['max', 'Max'], ['count', 'Count'], ['distinct', 'Distinct count']];
var AGG_LABEL = {}; AGGS.forEach(function(a){ AGG_LABEL[a[0]] = a[1]; });
W.gb = null;
function gbDefaults(){
  var d = ds(), bag = UI.colsBag();
  return { groups: bag.cat[0] ? [bag.cat[0].name] : [], measures: bag.num[0] ? [{ col: bag.num[0].name, agg: Spec.pickAggregation(bag.num[0].name) }] : [{ col: '', agg: 'count' }], pivot: '', grain: 'month', filtered: true, _src: d };
}
Pro.renderers.group = function(box){
  var d = ds();
  if (!W.gb || W.gb._src !== d) W.gb = gbDefaults();
  var s = W.gb;
  var groupable = d.columns.filter(function(c){ return c.levels || c.type === 'date' || (c.type === 'number' && c.allInt && c.uniqueCount <= 200); });
  var nums = d.columns.filter(function(c){ return c.type === 'number'; });
  var cats = d.columns.filter(function(c){ return c.levels && s.groups.indexOf(c.name) < 0; });
  var hasDate = s.groups.some(function(n){ var c = findColumn(d.columns, n); return c && c.type === 'date'; });
  var opt = function(list, sel, extra){ return (extra || '') + list.map(function(c){ return '<option value="' + q(c.name) + '"' + (c.name === sel ? ' selected' : '') + '>' + q(c.name) + '</option>'; }).join(''); };
  box.innerHTML = '<div class="wb-pad"><p class="pro-note">Summarise rows into groups. The result becomes a new dataset that you can chart. Undo brings back the original.</p>' +
    '<section class="wb-section"><h3>Group by</h3><div class="field-check-list">' + groupable.map(function(c){
      return '<label class="field-check"><input type="checkbox" data-gb-group="' + q(c.name) + '"' + (s.groups.indexOf(c.name) >= 0 ? ' checked' : '') + '>' + q(titleCase(c.name)) + '</label>';
    }).join('') + '</div>' +
    (hasDate ? '<div class="field-row" style="margin-top:12px;max-width:240px"><label>Group dates by</label><select data-gb="grain">' + [['day','Day'],['week','Week'],['month','Month'],['quarter','Quarter'],['year','Year']].map(function(g){ return '<option value="' + g[0] + '"' + (g[0] === s.grain ? ' selected' : '') + '>' + g[1] + '</option>'; }).join('') + '</select></div>' : '') +
    '</section><section class="wb-section"><h3>Measures</h3>' +
    s.measures.map(function(m, i){
      return '<div class="wb-measure"><div class="field-row"><label>Column</label><select data-gb-mcol="' + i + '">' + opt(nums, m.col, '<option value=""' + (m.col ? '' : ' selected') + '>(rows)</option>') + '</select></div>' +
        '<div class="field-row"><label>Calculation</label><select data-gb-magg="' + i + '">' + AGGS.filter(function(a){ return m.col || a[0] === 'count'; }).map(function(a){ return '<option value="' + a[0] + '"' + (a[0] === m.agg ? ' selected' : '') + '>' + a[1] + '</option>'; }).join('') + '</select></div>' +
        '<button type="button" class="icon-btn" data-gb-mdel="' + i + '" aria-label="Remove measure"' + (s.measures.length < 2 ? ' disabled' : '') + '>\u00d7</button></div>';
    }).join('') +
    '<button type="button" class="chip-btn" data-gb-madd>+ Measure</button></section>' +
    '<section class="wb-section"><h3>Pivot (optional)</h3><div class="field-row" style="max-width:320px"><label>Spread values of this column into columns</label><select data-gb="pivot">' + opt(cats, s.pivot, '<option value="">None</option>') + '</select></div></section>' +
    '<div class="toggle-row" style="margin-top:12px"><label for="wbGbFiltered">Only use rows that pass the dashboard filters' + (Filters.list.length ? '' : ' (no filters active)') + '</label><input type="checkbox" id="wbGbFiltered"' + (s.filtered ? ' checked' : '') + '></div>' +
    '<p class="pro-note" id="wbGbPreview" role="status" style="margin-top:8px"></p>' +
    '<div class="modal-actions"><span></span><button type="button" class="btn-primary" id="wbGbGo">Create grouped table</button></div></div>';
  UI.enhanceSelects(box);
  var rerender = function(){ Pro.render('group'); };
  box.addEventListener('change', function(e){
    var t = e.target;
    if (t.hasAttribute('data-gb-group')) { var n = t.getAttribute('data-gb-group'); s.groups = s.groups.filter(function(x){ return x !== n; }); if (t.checked) s.groups.push(n); if (s.pivot === n) s.pivot = ''; rerender(); }
    else if (t.hasAttribute('data-gb-mcol')) { var m = s.measures[+t.getAttribute('data-gb-mcol')]; m.col = t.value; if (!m.col) m.agg = 'count'; else if (m.agg === 'count') m.agg = Spec.pickAggregation(m.col); rerender(); }
    else if (t.hasAttribute('data-gb-magg')) { s.measures[+t.getAttribute('data-gb-magg')].agg = t.value; preview(); }
    else if (t.getAttribute('data-gb') === 'pivot') { s.pivot = t.value; preview(); }
    else if (t.getAttribute('data-gb') === 'grain') { s.grain = t.value; preview(); }
    else if (t.id === 'wbGbFiltered') { s.filtered = t.checked; preview(); }
  });
  box.addEventListener('click', function(e){
    if (e.target.closest('[data-gb-madd]')) { s.measures.push({ col: '', agg: 'count' }); rerender(); }
    var del = e.target.closest('[data-gb-mdel]'); if (del && s.measures.length > 1) { s.measures.splice(+del.getAttribute('data-gb-mdel'), 1); rerender(); }
  });
  function preview(){
    var r = W.groupBy(s, true), p = box.querySelector('#wbGbPreview');
    p.textContent = r.error ? r.error : (r.rowCount.toLocaleString() + ' groups \u00d7 ' + r.fields.length + ' columns: ' + r.fields.slice(0, 8).join(', ') + (r.fields.length > 8 ? ', \u2026' : ''));
    p.className = r.error ? 'pro-err' : 'pro-note';
  }
  preview();
  box.querySelector('#wbGbGo').addEventListener('click', function(){
    var r = W.groupBy(s, false);
    if (r.error) { UI.toast(r.error); return; }
    var label = (Store.get().sourceName || 'Data') + ' (grouped)';
    Pro.close();
    UI.applyRows(r.rows, r.fields, label, 'Grouped into ' + r.rows.length.toLocaleString() + ' rows');
  });
};

W.groupBy = function(s, dry){
  var d = ds(); if (!d) return { error: 'No data' };
  var mask = s.filtered ? maskAll() : null;
  var gcols = s.groups.map(function(n){ return findColumn(d.columns, n); }).filter(Boolean);
  var pcol = s.pivot ? findColumn(d.columns, s.pivot) : null;
  var ms = s.measures.map(function(m){
    var col = m.col ? findColumn(d.columns, m.col) : null;
    var agg = col ? m.agg : 'count';
    return { col: col, agg: agg, name: col ? (AGG_LABEL[agg] + ' of ' + col.name) : 'Count' };
  });
  if (!ms.length) return { error: 'Add at least one measure.' };
  var keyFns = { day: dayKey, week: weekKey, month: monthKey, quarter: quarterKey, year: function(t){ return String(new Date(t).getUTCFullYear()); } };
  var gkey = function(c, i){
    if (c.type === 'date') { var t = c.values[i]; return isNaN(t) ? '(blank)' : keyFns[s.grain](t); }
    var l = catRawLabel(c, i); return l === null ? '(blank)' : l;
  };
  var plevels = null, pset = null;
  if (pcol) {
    var pc = new Map();
    for (var a = 0; a < d.rowCount; a++){ if (mask && !mask[a]) continue; var pl = catRawLabel(pcol, a); if (pl === null) pl = '(blank)'; pc.set(pl, (pc.get(pl) || 0) + 1); }
    var sorted = Array.from(pc.entries()).sort(function(x, y){ return y[1] - x[1]; }).map(function(e){ return e[0]; });
    plevels = sorted.slice(0, 24); pset = new Set(plevels);
    if (sorted.length > 24) plevels.push('Other');
  }
  var groups = new Map(), order = [];
  for (var i = 0; i < d.rowCount; i++){
    if (mask && !mask[i]) continue;
    var parts = gcols.map(function(c){ return gkey(c, i); });
    var k = parts.join('\u0001');
    var g = groups.get(k);
    if (!g) { if (groups.size >= 200000) return { error: 'Too many groups (over 200,000). Pick fewer or coarser columns.' }; g = { parts: parts, cells: new Map() }; groups.set(k, g); order.push(k); }
    var pk = '';
    if (pcol) { var lab = catRawLabel(pcol, i); if (lab === null) lab = '(blank)'; pk = pset.has(lab) ? lab : 'Other'; }
    var cell = g.cells.get(pk);
    if (!cell) { cell = ms.map(function(m){ return { sum: 0, n: 0, min: Infinity, max: -Infinity, vals: m.agg === 'median' ? [] : null, set: m.agg === 'distinct' ? new Set() : null }; }); g.cells.set(pk, cell); }
    for (var mi = 0; mi < ms.length; mi++){
      var m = ms[mi], acc = cell[mi];
      if (!m.col) { acc.n++; continue; }
      var v = m.col.values[i];
      if (isNaN(v)) continue;
      acc.n++; acc.sum += v;
      if (v < acc.min) acc.min = v; if (v > acc.max) acc.max = v;
      if (acc.vals) acc.vals.push(v);
      if (acc.set) acc.set.add(v);
    }
  }
  var outCols = [];
  (plevels || ['']).forEach(function(pl){ ms.forEach(function(m, mi){ outCols.push({ pl: pl, mi: mi, name: pcol ? (ms.length > 1 ? pl + ' \u00b7 ' + m.name : pl) : m.name }); }); });
  var fields = Data.dedupeHeaderNames(gcols.map(function(c){ return c.name; }).concat(outCols.map(function(c){ return c.name; })));
  if (dry) return { rowCount: order.length, fields: fields };
  var finish = function(acc, agg){
    if (!acc) return agg === 'count' || agg === 'distinct' ? 0 : null;
    if (agg === 'count') return acc.n;
    if (agg === 'distinct') return acc.set.size;
    if (!acc.n) return null;
    if (agg === 'sum') return acc.sum;
    if (agg === 'avg') return acc.sum / acc.n;
    if (agg === 'min') return acc.min;
    if (agg === 'max') return acc.max;
    if (agg === 'median') { acc.vals.sort(function(x, y){ return x - y; }); return Stat.quantile(acc.vals, 0.5); }
    return null;
  };
  order.sort(function(x, y){ return x.localeCompare(y, undefined, { numeric: true }); });
  var rows = order.map(function(k){
    var g = groups.get(k), o = Data.makeRow(), fi = 0;
    g.parts.forEach(function(p){ o[fields[fi++]] = p; });
    outCols.forEach(function(oc){ var cell = g.cells.get(oc.pl); var v = finish(cell && cell[oc.mi], ms[oc.mi].agg); o[fields[fi++]] = (typeof v === 'number' && isFinite(v)) ? Math.round(v * 1e6) / 1e6 : v; });
    return o;
  });
  return { rows: rows, fields: fields, rowCount: rows.length };
};

function latin1(s){
  return String(s == null ? '' : s)
    .replace(/[\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
    .replace(/[\u2013\u2014\u2212]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...').replace(/\u00b7|\u2022/g, '-').replace(/\u25b2/g, '+').replace(/\u25bc/g, '-').replace(/\u22c8/g, 'x').replace(/\u00d7/g, 'x')
    .replace(/[^\x20-\x7e\xa0-\xff]/g, '?');
}
function pdfStr(s){ return '(' + latin1(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)') + ')'; }
function wrap(text, size, width){
  var max = Math.max(8, Math.floor(width / (size * 0.5)));
  var out = [];
  String(text || '').split(/\n/).forEach(function(para){
    var line = '';
    para.split(/\s+/).forEach(function(w){
      if (!w) return;
      if ((line + ' ' + w).trim().length > max) { if (line) out.push(line); line = w.length > max ? w.slice(0, max) : w; }
      else line = (line + ' ' + w).trim();
    });
    if (line) out.push(line);
  });
  return out;
}
function jpegSize(bin){
  var i = 2;
  while (i < bin.length) {
    if (bin.charCodeAt(i) !== 0xFF) { i++; continue; }
    var marker = bin.charCodeAt(i + 1);
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      return { h: (bin.charCodeAt(i + 5) << 8) | bin.charCodeAt(i + 6), w: (bin.charCodeAt(i + 7) << 8) | bin.charCodeAt(i + 8) };
    }
    i += 2 + ((bin.charCodeAt(i + 2) << 8) | bin.charCodeAt(i + 3));
  }
  return null;
}
W.buildPDF = function(){
  var panels = UI.panels.filter(function(p){ return p.chart && p.spec; });
  if (!panels.length) return null;
  var root = document.documentElement, wasLight = root.classList.contains('theme-light');
  var shots = [];
  if (!wasLight) { root.classList.add('theme-light'); refreshPalette(); }
  try {
    panels.forEach(function(p){
      var url = renderPanelDataURL(p, 800, 500, { type: 'jpeg', pixelRatio: 2, backgroundColor: '#FFFFFF' });
      if (!url || url.indexOf('data:image/jpeg') !== 0) return;
      var bin = atob(url.split(',')[1]), size = jpegSize(bin);
      if (size) shots.push({ bin: bin, w: size.w, h: size.h, note: p.spec.note || '' });
    });
  } finally {
    if (!wasLight) { root.classList.remove('theme-light'); refreshPalette(); }
  }
  if (!shots.length) return null;
  var PW = 842, PH = 595, M = 36, GAP = 18;
  var per = shots.length === 1 ? 1 : shots.length === 2 ? 2 : 4;
  var cols = per === 1 ? 1 : 2, rowsN = per === 4 ? 2 : 1;
  var pageCount = Math.ceil(shots.length / per);
  var title = Store.get().sourceName || 'Dashboard';
  var d = ds();
  var sub = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + '  -  ' + (d ? d.rowCount.toLocaleString() + ' rows' : '');
  var filterText = Filters.list.length ? 'Filters: ' + Filters.list.map(describeFilter).join(';  ') : '';
  var filterLines = filterText ? wrap(filterText, 8, PW - 2 * M).slice(0, 2) : [];
  var headH = 34 + filterLines.length * 10;
  var objs = [null, null];
  var add = function(s){ objs.push(s); return objs.length; };
  var fR = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  var fB = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  var kids = [];
  var f2 = function(n){ return (Math.round(n * 100) / 100).toString(); };
  var text = function(font, size, x, y, s, rgb){ return (rgb || '0.16 0.14 0.13') + ' rg BT /' + font + ' ' + size + ' Tf ' + f2(x) + ' ' + f2(y) + ' Td ' + pdfStr(s) + ' Tj ET\n'; };
  for (var pg = 0; pg < pageCount; pg++){
    var c = '';
    c += text('F2', 14, M, PH - M - 12, title);
    var pageLabel = 'Page ' + (pg + 1) + ' of ' + pageCount;
    c += text('F1', 9, PW - M - pageLabel.length * 4.6, PH - M - 12, pageLabel, '0.45 0.42 0.40');
    c += text('F1', 9, M, PH - M - 26, sub, '0.45 0.42 0.40');
    filterLines.forEach(function(l, li){ c += text('F1', 8, M, PH - M - 37 - li * 10, l, '0.45 0.42 0.40'); });
    c += '0.85 0.83 0.80 RG 0.5 w ' + M + ' ' + f2(PH - M - headH + 6) + ' m ' + (PW - M) + ' ' + f2(PH - M - headH + 6) + ' l S\n';
    var areaTop = PH - M - headH, areaH = areaTop - M;
    var cellW = (PW - 2 * M - (cols - 1) * GAP) / cols, cellH = (areaH - (rowsN - 1) * GAP) / rowsN;
    var xo = {};
    shots.slice(pg * per, pg * per + per).forEach(function(sh, k){
      var col = k % cols, row = Math.floor(k / cols);
      var noteLines = sh.note ? wrap(sh.note, 9, cellW).slice(0, 4) : [];
      var noteH = noteLines.length ? noteLines.length * 11 + 6 : 0;
      var ar = sh.w / sh.h;
      var iw = Math.min(cellW, (cellH - noteH) * ar), ih = iw / ar;
      var x = M + col * (cellW + GAP) + (cellW - iw) / 2;
      var top = areaTop - row * (cellH + GAP);
      var y = top - ih;
      var im = add('<< /Type /XObject /Subtype /Image /Width ' + sh.w + ' /Height ' + sh.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + sh.bin.length + ' >>\nstream\n' + sh.bin + '\nendstream');
      var nm = 'Im' + im; xo[nm] = im;
      c += 'q ' + f2(iw) + ' 0 0 ' + f2(ih) + ' ' + f2(x) + ' ' + f2(y) + ' cm /' + nm + ' Do Q\n';
      c += '0.88 0.86 0.83 RG 0.5 w ' + f2(x) + ' ' + f2(y) + ' ' + f2(iw) + ' ' + f2(ih) + ' re S\n';
      noteLines.forEach(function(l, li){ c += text('F1', 9, x, y - 12 - li * 11, l, '0.30 0.27 0.25'); });
    });
    var content = add('<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream');
    var xobjs = Object.keys(xo).map(function(k){ return '/' + k + ' ' + xo[k] + ' 0 R'; }).join(' ');
    kids.push(add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /Font << /F1 ' + fR + ' 0 R /F2 ' + fB + ' 0 R >> /XObject << ' + xobjs + ' >> >> /Contents ' + content + ' 0 R >>'));
  }
  objs[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[1] = '<< /Type /Pages /Kids [' + kids.map(function(k){ return k + ' 0 R'; }).join(' ') + '] /Count ' + kids.length + ' >>';
  var out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', offsets = [];
  objs.forEach(function(o, i){ offsets.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  var xref = out.length;
  out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + offsets.map(function(o){ return ('0000000000' + o).slice(-10) + ' 00000 n \n'; }).join('') +
    'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  var bytes = new Uint8Array(out.length);
  for (var b = 0; b < out.length; b++) bytes[b] = out.charCodeAt(b) & 0xFF;
  return { bytes: bytes, pages: pageCount, charts: shots.length };
};
W.exportPDF = function(){
  if (!UI.panels.some(function(p){ return p.chart; })) { UI.toast('No charts to export yet.'); return; }
  UI.setBusy(true, 'Building PDF\u2026');
  setTimeout(function(){
    var res = null;
    try { res = W.buildPDF(); } catch (e) { res = null; }
    UI.setBusy(false);
    if (!res) { UI.toast('Couldn\u2019t build the PDF.'); return; }
    var url = URL.createObjectURL(new Blob([res.bytes], { type: 'application/pdf' }));
    triggerDownload(url, dashboardFilename('pdf'));
    setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
    UI.toast('PDF downloaded \u2014 ' + res.charts + ' chart' + (res.charts === 1 ? '' : 's') + ' on ' + res.pages + ' page' + (res.pages === 1 ? '' : 's'));
  }, 30);
};
var menu = document.getElementById('topExportMenu');
var dashItem = menu.querySelector('[data-top-export="dashboard"]');
var pdfItem = document.createElement('button');
pdfItem.type = 'button'; pdfItem.setAttribute('role', 'menuitem'); pdfItem.setAttribute('data-wb-export', 'pdf');
pdfItem.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-dashboard"/></svg>Whole dashboard \u2014 PDF';
dashItem.parentNode.insertBefore(pdfItem, dashItem.nextSibling);
pdfItem.addEventListener('click', function(e){ e.stopPropagation(); UI.closeAllExportMenus(); W.exportPDF(); });

var origCommands = Pro.commands;
Pro.commands = function(){
  var c = origCommands();
  c.splice(4, 0,
    { k: 'Combine with another file (append / join)', run: function(){ Pro.open('combine'); } },
    { k: 'Group by / pivot', run: function(){ Pro.open('group'); } },
    { k: 'Add filter control', run: function(){ W.renderBar(); W.openAddMenu(); } },
    { k: 'Export dashboard PDF', run: W.exportPDF }
  );
  return c;
};

if (ds()) { W.renderBar(); W.syncNotes(); }
})();
