(function(){
'use strict';
if (typeof UI === 'undefined' || typeof registerChart === 'undefined') return;

var css = [
'.pro-modal{max-width:1040px !important;}',
'.pro-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}',
'.pro-tab{padding:7px 14px;border-radius:999px;border:1px solid var(--hairline);background:var(--glass);color:var(--ink-2);font-size:13px;cursor:pointer;}',
'.pro-tab.is-on{border-color:var(--accent);color:var(--ink);background:var(--accent-quiet);}',
'.pro-body{overflow:auto;flex:1;min-height:0;border:1px solid var(--hairline);border-radius:var(--radius-control);}',
'.pro-table{border-collapse:collapse;width:100%;font-size:12px;}',
'.pro-table th,.pro-table td{padding:7px 10px;border-bottom:1px solid var(--hairline);text-align:left;white-space:nowrap;max-width:260px;overflow:hidden;text-overflow:ellipsis;}',
'.pro-table th{position:sticky;top:0;background:var(--bg-2);color:var(--ink);font-weight:600;cursor:pointer;z-index:1;}',
'.pro-table td.num{text-align:right;font-variant-numeric:tabular-nums;}',
'.pro-table tr:hover td{background:var(--glass);}',
'.pro-bar{height:6px;border-radius:3px;background:var(--accent);opacity:.7;}',
'.pro-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;background:var(--glass-strong);color:var(--ink-2);}',
'.pro-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;}',
'.pro-input{flex:1;min-width:160px;background:var(--glass-strong);border:1px solid var(--hairline);border-radius:var(--radius-control);padding:9px 12px;color:var(--ink);font:inherit;font-size:13px;}',
'.pro-input:focus{outline:none;border-color:var(--accent);}',
'.pro-note{font-size:12px;color:var(--ink-3);}',
'.pro-err{color:var(--error);font-size:12px;}',
'.pro-palette{position:fixed;left:50%;top:14vh;transform:translateX(-50%);width:min(560px,calc(100vw - 24px));background:var(--bg-2);border:1px solid var(--hairline);border-radius:18px;box-shadow:0 24px 64px -16px rgba(0,0,0,.6);z-index:30000000;padding:8px;}',
'.pro-palette input{width:100%;box-sizing:border-box;}',
'.pro-palette ul{list-style:none;margin:6px 0 0;padding:0;max-height:50vh;overflow:auto;}',
'.pro-palette li{padding:9px 12px;border-radius:10px;font-size:14px;color:var(--ink);cursor:pointer;display:flex;justify-content:space-between;gap:12px;}',
'.pro-palette li.is-on{background:var(--accent-quiet);color:var(--accent);}',
'.pro-palette kbd{font-family:inherit;font-size:11px;color:var(--ink-3);}',
'.pro-view{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--hairline);font-size:13px;}',
'.pro-view:last-child{border-bottom:none;}',
'.chart-title{margin-right:196px !important;}',
'@media (max-width:640px){.chart-title{margin-right:0 !important;margin-top:44px !important;}}'
].join('');
var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

function ds(){ return Store.get().dataset; }
function fmt(v){ return (v == null || isNaN(v)) ? '\u2014' : Spec.formatExact(v); }
function cellText(col, i){
  if (col.type === 'number') return isNaN(col.values[i]) ? '' : fmt(col.values[i]);
  if (col.type === 'date') return isNaN(col.values[i]) ? '' : dayKey(col.values[i]);
  var l = catRawLabel(col, i); return l == null ? '' : l;
}
function globalMask(){
  var d = ds(); if (!d || !Filters.list.length) return null;
  var resolved = Filters.list.map(function(f){ return { filter: f, col: findColumn(d.columns, f.field), payloadSet: f.kind === 'in' ? new Set(f.payload) : null }; });
  var m = new Uint8Array(d.rowCount);
  for (var i = 0; i < d.rowCount; i++) m[i] = Filters.rowPasses(i, resolved) ? 1 : 0;
  return m;
}
function download(text, name, type){
  var url = URL.createObjectURL(new Blob([text], { type: type }));
  triggerDownload(url, name); setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
}

registerChart({
  type: 'kpi', supportsFacet: false, label: 'KPI', group: 'core', needs: [],
  reason: 'Needs at least one column',
  available: function(c){ return c.usable.length > 0; },
  makeSpec: function(old, c){
    var y = (old && c.num.some(function(x){ return x.name === old.yField; })) ? old.yField : (c.num[0] ? c.num[0].name : null);
    var d = c.date[0] ? c.date[0].name : null;
    var s = { type: 'kpi', yField: y, xField: d, aggregation: y ? Spec.pickAggregation(y) : 'count', panelHeight: 'sm' };
    s.title = this.title(s); return s;
  },
  title: function(s){ return s.yField ? ((s.aggregation === 'avg' ? 'Average ' : s.aggregation === 'count' ? 'Count of ' : 'Total ') + titleCase(s.yField)) : 'Row Count'; },
  numericFields: function(s){ return s.yField ? [s.yField] : []; },
  fields: function(s, c, H){
    return H.fieldRowWithCount('Value field', 'yField', c.num, s.yField) +
      (s.yField ? H.aggRow(s.aggregation) : '') +
      H.fieldRowWithNone('Trend by date', 'xField', c.date, s.xField);
  },
  style: function(s, H){ return H.toggleRow('Compare with previous period', 'showDelta', s.showDelta !== false); },
  hasData: function(){ return true; },
  build: function(spec, columns, mask, sel, F){
    var yCol = spec.yField ? F.findColumn(columns, spec.yField) : null;
    var n = columns[0] ? columns[0].values.length : 0;
    var sum = 0, cnt = 0;
    for (var i = 0; i < n; i++){
      if (mask && !mask[i]) continue;
      if (yCol){ var v = yCol.values[i]; if (isNaN(v)) continue; sum += v; }
      cnt++;
    }
    var agg = yCol ? (spec.aggregation || 'sum') : 'count';
    var value = agg === 'count' ? cnt : agg === 'avg' ? (cnt ? sum / cnt : NaN) : sum;
    var series = [], xAxis = { type: 'category', show: false, data: [] }, deltaText = '';
    if (spec.xField && F.findColumn(columns, spec.xField)){
      var ts = Spec.groupByDate(columns, spec.xField, spec.yField, agg, mask, null, spec.grain);
      xAxis.data = ts.map(function(r){ return r.label; });
      series.push({ type: 'line', smooth: true, symbol: 'none', areaStyle: { opacity: 0.15 }, lineStyle: { width: 2 }, data: ts.map(function(r){ return r.value; }) });
      if (spec.showDelta !== false && ts.length >= 2){
        var a = ts[ts.length - 1].value, b = ts[ts.length - 2].value;
        if (b) { var pct = (a - b) / Math.abs(b) * 100; deltaText = (pct >= 0 ? '\u25b2 ' : '\u25bc ') + Math.abs(pct).toFixed(1) + '% vs ' + ts[ts.length - 2].label; }
      }
    } else series.push({ type: 'line', data: [isNaN(value) ? null : value], symbol: 'none', lineStyle: { opacity: 0 }, silent: true, tooltip: { show: false } });
    var accent = readCSSVar('--accent'), jade = readCSSVar('--jade');
    return {
      grid: { left: 0, right: 0, bottom: 0, height: '38%' },
      xAxis: xAxis, yAxis: { type: 'value', show: false, scale: true },
      tooltip: { trigger: 'axis', valueFormatter: F.fmtTooltip },
      graphic: [
        { type: 'text', left: 8, top: 8, style: { text: F.fmtTooltip(value), fill: PALETTE.ink, fontSize: 52, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' } },
        { type: 'text', left: 10, top: 76, style: { text: deltaText || (cnt.toLocaleString() + ' rows'), fill: deltaText ? (deltaText.charAt(0) === '\u25b2' ? jade : accent) : PALETTE.ink2, fontSize: 14 } }
      ],
      series: series
    };
  },
  csv: function(panel, opt){
    var t = opt.graphic && opt.graphic[0] && (opt.graphic[0].elements ? opt.graphic[0].elements[0] : opt.graphic[0]);
    return ['metric,value', csvSafeField(panel.spec.title) + ',' + csvSafeField(t && t.style ? t.style.text : '')];
  }
});
CHART_TYPES.push({ value: 'kpi', label: 'KPI' });

var Pro = { calc: [] };
window.DrawPro = Pro;

Pro.compile = function(expr, fields){
  if (!String(expr || '').trim()) throw new Error('Write a formula first');
  var refs = [];
  var bare = expr.replace(/\[([^\]]+)\]/g, function(_, n){
    if (fields.indexOf(n) < 0) throw new Error('Unknown column [' + n + ']');
    refs.push(n);
    return '$c(' + (refs.length - 1) + ')';
  });
  var stripped = bare.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  if (/[;{}`\[\]=]/.test(stripped.replace(/[=!]==?|[<>]=/g, '')) || /\b(function|window|document|globalThis|self|fetch|eval|import|constructor|prototype|new|this)\b|__proto__/.test(stripped)) throw new Error('That formula uses something not allowed');
  var helpers = 'var num=function(v){if(v==null||v==="")return null;if(typeof v==="number")return isFinite(v)?v:null;if(typeof v==="boolean"||typeof v==="object")return null;var s=String(v).trim().replace(/^\\((.*)\\)$/,"-$1").replace(/[$\u20ac\u00a3,%\\s]/g,"");if(s==="")return null;var n=Number(s);return isNaN(n)?null:n;};' +
    'var $c=function(i){var x=r[$refs[i]];var n=num(x);return n==null?x:n;};' +
    'var IF=function(c,a,b){return c?a:b;};var ROUND=function(v,d){var p=Math.pow(10,d||0);return Math.round(num(v)*p)/p;};' +
    'var ABS=function(v){return Math.abs(num(v));};var LOG=function(v){return Math.log(num(v));};var UPPER=function(v){return String(v==null?"":v).toUpperCase();};' +
    'var LOWER=function(v){return String(v==null?"":v).toLowerCase();};var YEAR=function(v){var d=new Date(v);return isNaN(d)?null:d.getUTCFullYear();};' +
    'var MONTH=function(v){var d=new Date(v);return isNaN(d)?null:d.getUTCMonth()+1;};var CONCAT=function(){return Array.prototype.join.call(arguments,"");};' +
    'var BUCKET=function(v,s){var n=num(v);if(n==null)return null;var b=Math.floor(n/s)*s;return b+"\u2013"+(b+s);};';
  var fn = new Function('r', '$refs', helpers + 'return (' + bare + ');');
  return function(r){ return fn(r, refs); };
};

Pro.addCalcColumn = function(name, expr){
  var st = Store.get();
  if (!st.rawRows) throw new Error('Load data first');
  name = String(name || '').trim();
  if (!name) throw new Error('Give the column a name');
  if (st.rawFields.indexOf(name) >= 0) throw new Error('A column with that name exists');
  var fn = Pro.compile(expr, st.rawFields);
  var rows = st.rawRows.map(function(r){
    var o = Data.makeRow(); st.rawFields.forEach(function(f){ o[f] = r[f]; });
    var v; try { v = fn(r); } catch (e) { v = null; }
    o[name] = (v === undefined || (typeof v === 'number' && !isFinite(v))) ? null : v;
    return o;
  });
  var fields = st.rawFields.concat([name]);
  Pro.calc.push({ name: name, expr: expr });
  UI.restoreDashboardState({ version: DRAW_SCHEMA, rows: rows, fields: fields, sourceName: st.sourceName,
    panels: UI.panels.map(function(p){ return { id: p.id, spec: p.spec }; }), filters: Filters.list, activeIndex: UI.activeIndex }, st.sourceName);
  UI.pushCommand();
};

Pro.modal = null;
Pro.open = function(tab){
  if (!ds()) { UI.toast('Load some data first.'); return; }
  if (!Pro.modal){
    var ov = document.createElement('div');
    ov.className = 'modal-overlay'; ov.hidden = true;
    ov.innerHTML = '<div class="modal pro-modal" role="dialog" aria-modal="true" aria-labelledby="proTitle" style="max-height:88vh">' +
      '<div class="modal-header"><h2 id="proTitle">Data</h2><button type="button" class="icon-btn" data-pro="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg></button></div>' +
      '<div class="pro-tabs" role="tablist">' +
      ['rows:Rows','profile:Profile','calc:Calculated column','views:Saved views'].map(function(t){ var p = t.split(':'); return '<button type="button" class="pro-tab" role="tab" data-tab="' + p[0] + '">' + p[1] + '</button>'; }).join('') +
      '</div><div id="proContent" style="display:flex;flex-direction:column;flex:1;min-height:0"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){
      if (e.target === ov || e.target.closest('[data-pro="close"]')) Pro.close();
      var t = e.target.closest('[data-tab]'); if (t) Pro.render(t.getAttribute('data-tab'));
    });
    ov.addEventListener('keydown', function(e){ if (e.key === 'Escape') { e.stopPropagation(); Pro.close(); } });
    trapFocus(ov, ov.querySelector('.modal'));
    Pro.modal = ov;
  }
  Pro._opener = document.activeElement;
  Pro.modal.hidden = false;
  Pro.render(tab || 'rows');
};
Pro.close = function(){ if (Pro.modal) Pro.modal.hidden = true; if (Pro._opener && Pro._opener.focus) Pro._opener.focus(); };

Pro.render = function(tab){
  Pro.tab = tab;
  Array.prototype.forEach.call(Pro.modal.querySelectorAll('.pro-tab'), function(b){ var on = b.getAttribute('data-tab') === tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
  var box = Pro.modal.querySelector('#proContent');
  ({ rows: Pro.renderRows, profile: Pro.renderProfile, calc: Pro.renderCalc, views: Pro.renderViews })[tab](box);
};

Pro.rowState = { q: '', sort: null, dir: 1, limit: 500 };
Pro.filteredIndices = function(){
  var d = ds(), m = globalMask(), q = Pro.rowState.q.toLowerCase(), idx = [];
  for (var i = 0; i < d.rowCount; i++){
    if (m && !m[i]) continue;
    if (q){
      var hit = false;
      for (var c = 0; c < d.columns.length && !hit; c++) if (cellText(d.columns[c], i).toLowerCase().indexOf(q) >= 0) hit = true;
      if (!hit) continue;
    }
    idx.push(i);
  }
  if (Pro.rowState.sort){
    var col = findColumn(d.columns, Pro.rowState.sort), dir = Pro.rowState.dir;
    if (col) idx.sort(function(a, b){
      if (col.type === 'number' || col.type === 'date'){ var x = col.values[a], y = col.values[b]; if (isNaN(x)) return 1; if (isNaN(y)) return -1; return (x - y) * dir; }
      return String(cellText(col, a)).localeCompare(String(cellText(col, b))) * dir;
    });
  }
  return idx;
};
Pro.renderRows = function(box){
  var d = ds();
  box.innerHTML = '<div class="pro-row"><input class="pro-input" id="proSearch" type="search" placeholder="Search all columns\u2026" aria-label="Search rows" value="' + escapeHtml(Pro.rowState.q) + '">' +
    '<button type="button" class="chip-btn" id="proExportRows">Download these rows (CSV)</button></div>' +
    '<p class="pro-note" id="proCount"></p><div class="pro-body" id="proTableWrap"></div>';
  function draw(){
    var idx = Pro.filteredIndices();
    var shown = idx.slice(0, Pro.rowState.limit);
    box.querySelector('#proCount').textContent = idx.length.toLocaleString() + ' of ' + d.rowCount.toLocaleString() + ' rows' + (Filters.list.length ? ' (dashboard filters applied)' : '') + (idx.length > shown.length ? ' \u2014 showing first ' + shown.length.toLocaleString() : '');
    var head = '<tr>' + d.columns.map(function(c){ var arrow = Pro.rowState.sort === c.name ? (Pro.rowState.dir > 0 ? ' \u2191' : ' \u2193') : ''; return '<th data-sort="' + escapeHtml(c.name) + '" title="Sort">' + escapeHtml(c.name) + arrow + '</th>'; }).join('') + '</tr>';
    var body = shown.map(function(i){ return '<tr>' + d.columns.map(function(c){ return '<td class="' + (c.type === 'number' ? 'num' : '') + '">' + escapeHtml(cellText(c, i)) + '</td>'; }).join('') + '</tr>'; }).join('');
    var more = idx.length > shown.length ? '<p style="padding:12px;text-align:center"><button type="button" class="chip-btn" id="proMore">Show 500 more</button></p>' : '';
    box.querySelector('#proTableWrap').innerHTML = '<table class="pro-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>' + more;
    Pro._lastIdx = idx;
  }
  draw();
  var t = null;
  box.querySelector('#proSearch').addEventListener('input', function(e){ clearTimeout(t); t = setTimeout(function(){ Pro.rowState.q = e.target.value; Pro.rowState.limit = 500; draw(); }, 180); });
  box.querySelector('#proTableWrap').addEventListener('click', function(e){
    var th = e.target.closest('[data-sort]');
    if (th){ var n = th.getAttribute('data-sort'); if (Pro.rowState.sort === n) Pro.rowState.dir *= -1; else { Pro.rowState.sort = n; Pro.rowState.dir = 1; } draw(); }
    if (e.target.id === 'proMore'){ Pro.rowState.limit += 500; draw(); }
  });
  box.querySelector('#proExportRows').addEventListener('click', function(){
    var st = Store.get(), idx = Pro._lastIdx || [];
    var lines = [st.rawFields.map(csvSafeField).join(',')];
    idx.forEach(function(i){ var r = st.rawRows[i]; lines.push(st.rawFields.map(function(f){ return csvSafeField(Data.stringifyCell(r[f])); }).join(',')); });
    download(lines.join('\n'), (slugify(st.sourceName) || 'data') + '-rows.csv', 'text/csv');
    UI.toast(idx.length.toLocaleString() + ' rows downloaded');
  });
  setTimeout(function(){ var s = box.querySelector('#proSearch'); if (s) s.focus(); }, 30);
};

Pro.renderProfile = function(box){
  var d = ds(), m = globalMask();
  var rows = d.columns.map(function(c){
    var n = 0, missing = 0, vals = [];
    for (var i = 0; i < d.rowCount; i++){
      if (m && !m[i]) continue; n++;
      var v = c.values[i];
      if ((c.type === 'number' || c.type === 'date') ? isNaN(v) : v < 0) { missing++; continue; }
      if (c.type === 'number' || c.type === 'date') vals.push(v);
    }
    var summary = '';
    if (c.type === 'number' && vals.length){
      vals.sort(function(a, b){ return a - b; });
      var mean = vals.reduce(function(a, b){ return a + b; }, 0) / vals.length;
      summary = 'min ' + fmt(vals[0]) + ' \u00b7 median ' + fmt(Stat.quantile(vals, 0.5)) + ' \u00b7 mean ' + fmt(mean) + ' \u00b7 max ' + fmt(vals[vals.length - 1]);
    } else if (c.type === 'date' && vals.length){
      var mn = Infinity, mx = -Infinity;
      for (var q = 0; q < vals.length; q++){ if (vals[q] < mn) mn = vals[q]; if (vals[q] > mx) mx = vals[q]; }
      summary = dayKey(mn) + ' \u2192 ' + dayKey(mx);
    } else if (c.levels){
      var counts = {};
      for (var j = 0; j < d.rowCount; j++){ if (m && !m[j]) continue; var k = c.values[j]; if (k >= 0) counts[k] = (counts[k] || 0) + 1; }
      summary = Object.keys(counts).sort(function(a, b){ return counts[b] - counts[a]; }).slice(0, 3).map(function(k){ return c.levels[k] + ' (' + counts[k] + ')'; }).join(', ');
    }
    var fill = n ? (1 - missing / n) : 0;
    return '<tr><td><strong>' + escapeHtml(c.name) + '</strong>' + (c.idLike ? ' <span class="pro-badge">ID</span>' : '') + '</td>' +
      '<td><span class="pro-badge">' + c.type + (c.unit ? ' ' + escapeHtml(c.unit) : '') + '</span></td>' +
      '<td class="num">' + c.uniqueCount.toLocaleString() + '</td>' +
      '<td style="min-width:120px"><div class="pro-bar" style="width:' + Math.round(fill * 100) + '%"></div><span class="pro-note">' + Math.round(fill * 100) + '% filled</span></td>' +
      '<td style="white-space:normal">' + escapeHtml(summary) + '</td>' +
      '<td><button type="button" class="chip-btn" data-chart="' + escapeHtml(c.name) + '">Chart it</button></td></tr>';
  }).join('');
  box.innerHTML = '<p class="pro-note" style="margin-bottom:8px">' + d.columns.length + ' columns \u00b7 ' + d.rowCount.toLocaleString() + ' rows' + (d.notes && d.notes.length ? ' \u00b7 ' + escapeHtml(d.notes.join(' ')) : '') + '</p>' +
    '<div class="pro-body"><table class="pro-table"><thead><tr><th>Column</th><th>Type</th><th>Distinct</th><th>Completeness</th><th>Summary</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  box.querySelector('.pro-body').addEventListener('click', function(e){
    var b = e.target.closest('[data-chart]'); if (!b) return;
    var col = findColumn(ds().columns, b.getAttribute('data-chart'));
    var spec = col.type === 'number' ? Spec.buildHistogram(col) : col.type === 'date' ? Spec.buildTimeSeriesCount(col) : Spec.buildCategoryCount(col);
    Pro.close(); Pro.addSpec(spec);
  });
};

Pro.renderCalc = function(box){
  var f = Store.get().rawFields || [];
  box.innerHTML = '<div style="padding:4px">' +
    '<p class="pro-note" style="margin-bottom:10px">Write a formula with column names in square brackets. Number cells are cleaned automatically ($, commas and %).</p>' +
    '<div class="pro-row"><input class="pro-input" id="proCalcName" placeholder="New column name, e.g. Price per unit" aria-label="New column name"></div>' +
    '<div class="pro-row"><input class="pro-input" id="proCalcExpr" placeholder="[Revenue] / [Units]" aria-label="Formula" style="font-family:ui-monospace,monospace"></div>' +
    '<p class="pro-note">Functions: IF(cond,a,b) \u00b7 ROUND(v,d) \u00b7 ABS \u00b7 LOG \u00b7 UPPER \u00b7 LOWER \u00b7 YEAR \u00b7 MONTH \u00b7 CONCAT(a,b,\u2026) \u00b7 BUCKET(v,size). Operators: + - * / % &gt; &lt; == &amp;&amp; || ? :</p>' +
    '<p class="pro-note" style="margin:10px 0 4px">Columns (click to insert):</p><div class="field-check-list" id="proCalcCols">' +
    f.map(function(n){ return '<button type="button" class="field-check" data-ins="' + escapeHtml(n) + '">' + escapeHtml(n) + '</button>'; }).join('') + '</div>' +
    '<p class="pro-note" id="proCalcPreview" style="margin-top:12px"></p>' +
    '<div class="modal-actions"><span></span><button type="button" class="btn-primary" id="proCalcGo">Add column</button></div>' +
    (Pro.calc.length ? '<p class="pro-note" style="margin-top:12px">Added this session: ' + Pro.calc.map(function(c){ return escapeHtml(c.name) + ' = ' + escapeHtml(c.expr); }).join(' \u00b7 ') + '</p>' : '') + '</div>';
  var ex = box.querySelector('#proCalcExpr'), pv = box.querySelector('#proCalcPreview');
  function preview(){
    if (!ex.value.trim()) { pv.textContent = ''; return; }
    try {
      var fn = Pro.compile(ex.value, f), rr = Store.get().rawRows.slice(0, 5);
      pv.className = 'pro-note'; pv.textContent = 'Preview: ' + rr.map(function(r){ var v; try { v = fn(r); } catch (e) { v = 'error'; } return v == null ? '\u2014' : String(v); }).join(' \u00b7 ');
    } catch (e) { pv.className = 'pro-err'; pv.textContent = e.message; }
  }
  ex.addEventListener('input', preview);
  box.querySelector('#proCalcCols').addEventListener('click', function(e){
    var b = e.target.closest('[data-ins]'); if (!b) return;
    var s = ex.selectionStart || ex.value.length, ins = '[' + b.getAttribute('data-ins') + ']';
    ex.value = ex.value.slice(0, s) + ins + ex.value.slice(ex.selectionEnd || s); ex.focus(); preview();
  });
  box.querySelector('#proCalcGo').addEventListener('click', function(){
    try { var nm = box.querySelector('#proCalcName').value; Pro.addCalcColumn(nm, ex.value); UI.toast('Added column \u201c' + nm.trim() + '\u201d'); Pro.render('profile'); }
    catch (e) { pv.className = 'pro-err'; pv.textContent = e.message; }
  });
};

Pro.VIEWS_KEY = 'draw-pro-views';
Pro.loadViews = function(){ try { return JSON.parse(localStorage.getItem(Pro.VIEWS_KEY)) || []; } catch (e) { return []; } };
Pro.saveViews = function(v){ try { localStorage.setItem(Pro.VIEWS_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } };
Pro.renderViews = function(box){
  var views = Pro.loadViews(), fields = Store.get().rawFields || [];
  box.innerHTML = '<div class="pro-row"><input class="pro-input" id="proViewName" placeholder="Name this view, e.g. Q4 regional review" aria-label="View name"><button type="button" class="btn-primary" id="proViewSave">Save current view</button></div>' +
    '<p class="pro-note" style="margin-bottom:8px">A view stores the charts, layout and filters (not the data). You can apply it to any file that has the same columns.</p>' +
    '<div class="pro-body">' + (views.length ? views.map(function(v, i){
      var fits = UI.layoutFitsFields(v.layout, fields);
      return '<div class="pro-view"><div><strong>' + escapeHtml(v.name) + '</strong><div class="pro-note">' + v.layout.p.length + ' charts \u00b7 ' + escapeHtml(v.source || '') + ' \u00b7 ' + new Date(v.at).toLocaleString() + '</div></div>' +
        '<div style="display:flex;gap:6px"><button type="button" class="chip-btn" data-apply="' + i + '"' + (fits ? '' : ' disabled title="This data is missing columns the view needs"') + '>Apply</button><button type="button" class="chip-btn" data-del="' + i + '">Delete</button></div></div>';
    }).join('') : '<p class="pro-note" style="padding:16px">No saved views yet.</p>') + '</div>';
  box.querySelector('#proViewSave').addEventListener('click', function(){
    var name = box.querySelector('#proViewName').value.trim() || ('View ' + (views.length + 1));
    var st = Store.get();
    var used = {};
    UI.panels.forEach(function(p){ Object.keys(p.spec || {}).forEach(function(k){ var v = p.spec[k]; if (typeof v === 'string' && st.rawFields.indexOf(v) >= 0) used[v] = 1; (Array.isArray(v) ? v : []).forEach(function(x){ if (st.rawFields.indexOf(x) >= 0) used[x] = 1; }); }); });
    Filters.list.forEach(function(f){ used[f.field] = 1; });
    views.unshift({ name: name, at: Date.now(), source: st.sourceName, layout: { v: DRAW_SCHEMA, f: Object.keys(used), p: UI.panels.map(function(p){ return { id: p.id, spec: p.spec }; }), fl: JSON.parse(JSON.stringify(Filters.list)), a: UI.activeIndex } });
    if (Pro.saveViews(views.slice(0, 40))) UI.toast('Saved view \u201c' + name + '\u201d'); else UI.toast('Couldn\u2019t save \u2014 browser storage is full.');
    Pro.render('views');
  });
  box.querySelector('.pro-body').addEventListener('click', function(e){
    var a = e.target.closest('[data-apply]'), d = e.target.closest('[data-del]');
    if (a){
      var v = views[+a.getAttribute('data-apply')].layout, st = Store.get();
      if (UI.restoreDashboardState({ version: v.v, rows: st.rawRows, fields: st.rawFields, sourceName: st.sourceName, panels: v.p, filters: v.fl, activeIndex: v.a }, st.sourceName, { skipDatasetSave: true })) { UI.pushCommand(); Pro.close(); UI.toast('View applied'); }
    }
    if (d){ views.splice(+d.getAttribute('data-del'), 1); Pro.saveViews(views); Pro.render('views'); }
  });
};

Pro.addSpec = function(spec){
  var d = ds(); if (!d || !spec) return;
  if (UI.panels.length >= UI.MAX_PANELS) { UI.toast('Dashboards hold up to ' + UI.MAX_PANELS + ' charts.'); return; }
  var p = { id: 'panel-' + (UI._nextPanelId++), spec: spec, chart: null, el: null };
  UI.panels.push(p); UI.mountPanel(p); UI.updatePanelGridLayout();
  UI.focusPanel(UI.panels.length - 1);
  UI.renderChart(spec, d.columns); UI.syncTitleElement(); UI.pushCommand(); Persistence.saveDashboard();
  requestAnimationFrame(function(){ UI.panels.forEach(function(x){ if (x.chart) x.chart.resize(); }); });
};
UI.MAX_PANELS = 12;

Pro.duplicateActive = function(){
  var p = UI.panels[UI.activeIndex]; if (!p || !p.spec) return;
  var s = JSON.parse(JSON.stringify(p.spec)); s.title = s.title + ' (copy)'; s.titleCustom = true;
  Pro.addSpec(s);
};
Pro.moveActive = function(dir){
  var i = UI.activeIndex, j = i + dir;
  if (j < 0 || j >= UI.panels.length) return;
  var snap = UI.captureSnapshot(); if (!snap) return;
  var arr = snap.panels.slice(), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  snap.panels = arr; snap.activeIndex = j;
  UI.applyPanelsAndFiltersOnly(snap); UI.pushCommand();
};
Pro.present = function(){
  var el = document.getElementById('workspace');
  if (!document.fullscreenElement && el.requestFullscreen) {
    document.body.classList.add('pro-present');
    el.requestFullscreen().catch(function(){ UI.toast('Full screen isn\u2019t available here.'); });
  } else if (document.exitFullscreen) document.exitFullscreen();
};
document.addEventListener('fullscreenchange', function(){
  if (!document.fullscreenElement) document.body.classList.remove('pro-present');
  setTimeout(function(){ UI.panels.forEach(function(p){ if (p.chart) p.chart.resize(); }); }, 200);
});
st.textContent += '#workspace:fullscreen{background:var(--bg);overflow:auto;padding:24px;}#workspace:fullscreen .workspace-hint,#workspace:fullscreen .inspector{display:none !important;}';

Pro.commands = function(){
  var c = [
    { k: 'Show data rows', s: 'D', run: function(){ Pro.open('rows'); } },
    { k: 'Column profile', run: function(){ Pro.open('profile'); } },
    { k: 'Add calculated column', run: function(){ Pro.open('calc'); } },
    { k: 'Saved views', run: function(){ Pro.open('views'); } },
    { k: 'Add suggested chart', s: 'N', run: UI.addChart },
    { k: 'Add KPI card', run: function(){ Pro.addSpec(PLUGINS.kpi.makeSpec(null, UI.colsBag())); } },
    { k: 'Duplicate active chart', run: Pro.duplicateActive },
    { k: 'Move active chart earlier', run: function(){ Pro.moveActive(-1); } },
    { k: 'Move active chart later', run: function(){ Pro.moveActive(1); } },
    { k: 'Edit active chart', s: 'E', run: UI.toggleInspector },
    { k: 'Clear all filters', run: function(){ Filters.clearAll(); UI.refreshAllPanels(); UI.pushCommand(); } },
    { k: 'Present full screen', s: 'P', run: Pro.present },
    { k: 'Export dashboard PNG', run: UI.exportDashboardPNG },
    { k: 'Save .draw.json file', run: UI.exportDrawJSON },
    { k: 'Copy share link', run: UI.shareLink },
    { k: 'Toggle light / dark theme', run: UI.toggleTheme },
    { k: 'Open a file\u2026', run: function(){ UI.els.fileInput.click(); } }
  ];
  if (ds()) Spec.candidates(ds().columns).slice(0, 8).forEach(function(cd){ c.push({ k: 'Chart: ' + cd.spec.title, run: function(){ Pro.addSpec(cd.spec); } }); });
  return c;
};
Pro.palette = function(){
  if (Pro._pal) return;
  var box = document.createElement('div'); box.className = 'pro-palette'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Command palette');
  box.innerHTML = '<input class="pro-input" placeholder="Type a command\u2026" aria-label="Command"><ul role="listbox"></ul>';
  document.body.appendChild(box); Pro._pal = box;
  var input = box.querySelector('input'), ul = box.querySelector('ul'), all = Pro.commands(), list = all, sel = 0;
  function draw(){
    var q = input.value.toLowerCase().trim();
    list = all.filter(function(c){ return !q || q.split(/\s+/).every(function(w){ return c.k.toLowerCase().indexOf(w) >= 0; }); });
    sel = Math.min(sel, Math.max(0, list.length - 1));
    ul.innerHTML = list.map(function(c, i){ return '<li role="option" data-i="' + i + '" class="' + (i === sel ? 'is-on' : '') + '"><span>' + escapeHtml(c.k) + '</span>' + (c.s ? '<kbd>' + c.s + '</kbd>' : '') + '</li>'; }).join('') || '<li>No matches</li>';
  }
  function close(){ box.remove(); Pro._pal = null; document.removeEventListener('mousedown', outside, true); }
  function go(c){ close(); if (c) { if (!ds() && !/file|theme/i.test(c.k)) { UI.toast('Load some data first.'); return; } c.run(); } }
  function outside(e){ if (!box.contains(e.target)) close(); }
  input.addEventListener('input', function(){ sel = 0; draw(); });
  input.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, list.length); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + list.length) % Math.max(1, list.length); draw(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(list[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  });
  ul.addEventListener('click', function(e){ var li = e.target.closest('[data-i]'); if (li) go(list[+li.getAttribute('data-i')]); });
  document.addEventListener('mousedown', outside, true);
  draw(); input.focus();
};

window.addEventListener('keydown', function(e){
  var mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); Pro.palette(); return; }
  var ae = document.activeElement;
  if (mod || e.altKey || (ae && (ae.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(ae.tagName)))) return;
  if (!ds() || (Pro.modal && !Pro.modal.hidden) || Pro._pal) return;
  var k = e.key.toLowerCase();
  if (k === 'd') { e.preventDefault(); Pro.open('rows'); }
  else if (k === 'n') { e.preventDefault(); UI.addChart(); }
  else if (k === 'e') { e.preventDefault(); UI.toggleInspector(); }
  else if (k === 'p') { e.preventDefault(); Pro.present(); }
  else if (k === '?') { e.preventDefault(); Pro.palette(); }
});

function iconBtn(id, title, svg, onClick){
  var b = document.createElement('button'); b.type = 'button'; b.className = 'icon-btn'; b.id = id; b.title = title; b.setAttribute('aria-label', title); b.hidden = true;
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + svg + '</svg>';
  b.addEventListener('click', function(e){ e.stopPropagation(); onClick(); });
  return b;
}
var dataBtn = iconBtn('proDataBtn', 'Data, profile & formulas (D)', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M9.5 9.5v10M3.5 14.5h17"/>', function(){ Pro.open('rows'); });
var cmdBtn = iconBtn('proCmdBtn', 'Command palette (Ctrl/Cmd+K)', '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>', Pro.palette);
var presentBtn = iconBtn('proPresentBtn', 'Present full screen (P)', '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', Pro.present);
var add = document.getElementById('addChartBtn');
add.parentNode.insertBefore(dataBtn, add);
add.parentNode.insertBefore(cmdBtn, add);
var theme = document.getElementById('themeToggleBtn');
theme.parentNode.insertBefore(presentBtn, theme);
var orig = UI.setWorkspaceControlsVisible;
UI.setWorkspaceControlsVisible = function(v){ orig(v); dataBtn.hidden = cmdBtn.hidden = presentBtn.hidden = !v; };
if (ds()) UI.setWorkspaceControlsVisible(true);

var origCard = UI.panelCardHtml;
UI.panelCardHtml = function(){
  return origCard().replace('<button type="button" class="icon-btn is-danger" data-action="delete"',
    '<button type="button" class="icon-btn" data-action="duplicate" title="Duplicate chart" aria-label="Duplicate chart"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-copy"/></svg></button><button type="button" class="icon-btn is-danger" data-action="delete"');
};
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-action="duplicate"]'); if (!b) return;
  e.stopPropagation();
  var card = b.closest('.chart-card'), i = Array.prototype.indexOf.call(UI.els.panelGrid.children, card);
  if (i >= 0) { UI.focusPanel(i); Pro.duplicateActive(); }
}, true);

var hint = document.querySelector('.workspace-hint');
if (hint) hint.textContent = 'Ctrl/Cmd+K for commands \u00b7 D data \u00b7 N new chart \u00b7 E edit \u00b7 P present \u00b7 Ctrl/Cmd+Z undo. Drop or paste a file anywhere to replace the data.';
})();
