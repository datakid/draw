(function(){
'use strict';
if (typeof UI === 'undefined' || typeof registerChart === 'undefined') return;

var css = [
'.pro-dock{position:fixed;left:0;right:0;bottom:0;height:var(--dock-h,42vh);z-index:90;display:flex;flex-direction:column;background:var(--bg-2);color:var(--ink);border-top:1px solid var(--hairline);border-radius:18px 18px 0 0;box-shadow:0 -20px 48px -24px rgba(0,0,0,.45);}',
'.pro-dock[hidden]{display:none;}',
'.pro-dock.is-full{top:64px;height:auto;border-radius:0;}',
'.pro-grip{height:16px;flex:none;cursor:ns-resize;touch-action:none;display:flex;align-items:center;justify-content:center;outline:none;}',
'.pro-grip::before{content:"";width:48px;height:4px;border-radius:2px;background:var(--ink-3);opacity:.45;transition:opacity .15s,background .15s;}',
'.pro-grip:hover::before,.pro-grip:focus-visible::before{background:var(--accent);opacity:1;}',
'.pro-dock.is-full .pro-grip{cursor:default;}',
'.pro-dock-head{display:flex;align-items:center;gap:14px;padding:0 16px 10px;flex:none;}',
'.pro-dock-head h2{font-family:var(--font-display);font-style:italic;font-size:21px;font-weight:400;color:var(--ink);margin:0;flex:none;}',
'.pro-dock-actions{display:flex;gap:4px;flex:none;margin-left:auto;}',
'.pro-dock-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:auto;padding:2px 16px 14px;}',
'body.pro-docked{padding-bottom:var(--dock-h,42vh);}',
'body.pro-docked .inspector{max-height:max(260px,calc(100dvh - 124px - var(--dock-h,42vh)));}',
'body.pro-docked .toast{bottom:calc(var(--dock-h,42vh) + 16px);}',
'body.pro-dock-full .toast{bottom:28px;z-index:95;}',
'.pro-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}',
'.pro-dock .pro-tabs{margin:0;flex:0 1 auto;min-width:0;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;}',
'.pro-dock .pro-tabs::-webkit-scrollbar{display:none;}',
'.pro-tab{padding:7px 14px;border-radius:999px;border:1px solid var(--hairline);background:transparent;color:var(--ink-2);font:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;flex:none;}',
'.pro-tab:hover{color:var(--ink);background:var(--glass-strong);}',
'.pro-tab:focus-visible{outline:none;box-shadow:0 0 0 3px var(--accent-quiet);border-color:var(--accent);}',
'.pro-tab.is-on{border-color:var(--accent);color:var(--accent);background:var(--accent-quiet);}',
'.pro-body{overflow:auto;flex:1;min-height:0;border:1px solid var(--hairline);border-radius:var(--radius-control);background:var(--bg-2);}',
'.pro-table{border-collapse:separate;border-spacing:0;width:100%;font-size:13px;color:var(--ink);}',
'.pro-table th,.pro-table td{padding:8px 12px;border-bottom:1px solid var(--hairline);text-align:left;white-space:nowrap;max-width:280px;overflow:hidden;text-overflow:ellipsis;}',
'.pro-table th{position:sticky;top:0;background:var(--bg-2);color:var(--ink-2);font-size:12px;font-weight:600;cursor:pointer;z-index:1;user-select:none;}',
'.pro-table th:hover,.pro-table th.is-sorted{color:var(--accent);}',
'.pro-table tbody tr:nth-child(even) td{background:var(--glass);}',
'.pro-table tbody tr:hover td{background:var(--accent-quiet);}',
'.pro-table tbody tr:last-child td{border-bottom:none;}',
'.pro-table td.num,.pro-table th.num{text-align:right;font-variant-numeric:tabular-nums;}',
'.pro-table .rn{color:var(--ink-3);text-align:right;font-variant-numeric:tabular-nums;width:1%;padding-right:6px;}',
'.pro-table td.empty{color:var(--ink-3);}',
'.pro-count{font-size:12px;color:var(--ink-2);white-space:nowrap;}',
'.pro-link{background:none;border:none;padding:0;margin-left:6px;color:var(--accent);font:inherit;font-size:12px;cursor:pointer;text-decoration:underline;text-underline-offset:2px;}',
'@media (max-width:640px){.pro-dock-head{padding:0 10px 8px;gap:6px;}.pro-dock-head h2{display:none;}.pro-dock-body{padding:2px 10px 10px;}.pro-table th,.pro-table td{padding:7px 10px;}.pro-count{white-space:normal;flex-basis:100%;order:3;}}',
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
Pro.CALC_KEY = 'draw-pro-calc';
try { var savedCalc = JSON.parse(localStorage.getItem(Pro.CALC_KEY)); if (Array.isArray(savedCalc)) Pro.calc = savedCalc.filter(function(c){ return c && typeof c.name === 'string' && typeof c.expr === 'string'; }); } catch (e) {}
Pro.persistCalc = function(){ try { localStorage.setItem(Pro.CALC_KEY, JSON.stringify(Pro.calc.slice(-40))); } catch (e) {} };
Pro.activeCalcs = function(){
  var st = Store.get(), f = st.rawFields || [], rows = st.rawRows || [];
  if (Pro._acRows === rows && Pro._acSig === JSON.stringify(Pro.calc)) return Pro._ac;
  var n = Math.min(rows.length, 40), seen = [];
  var res = Pro.calc.filter(function(c){
    if (f.indexOf(c.name) < 0) return false;
    var base = f.filter(function(x){ return x !== c.name && (seen.indexOf(x) >= 0 || !Pro.calc.some(function(k){ return k.name === x; })); });
    var fn; try { fn = Pro.compile(c.expr, base); } catch (e) { return false; }
    for (var i = 0; i < n; i++){
      var v; try { v = fn(rows[i]); } catch (e) { v = null; }
      if (v === undefined || (typeof v === 'number' && !isFinite(v))) v = null;
      var s = rows[i][c.name];
      if (!(v == null && (s == null || s === '')) && String(v) !== String(s)) return false;
    }
    seen.push(c.name); return true;
  });
  Pro._acRows = rows; Pro._acSig = JSON.stringify(Pro.calc); Pro._ac = res;
  return res;
};
Pro.idleCalcs = function(){
  var f = Store.get().rawFields || [];
  var idle = Pro.calc.filter(function(c){ return f.indexOf(c.name) < 0; });
  var ok = Pro.calcFieldsFor(f, idle);
  return idle.filter(function(c){ return ok.indexOf(c.name) >= 0; });
};
Pro.specUses = function(spec, name){
  return Object.keys(spec || {}).some(function(k){ var v = spec[k]; return v === name || (Array.isArray(v) && v.indexOf(name) >= 0); });
};
Pro.rebuildCalcs = function(list, dropField, rename){
  var st = Store.get(), active = Pro.activeCalcs().map(function(c){ return c.name; });
  var base = st.rawFields.filter(function(f){ return active.indexOf(f) < 0; });
  var out = Pro.applyCalcs(st.rawRows, base, list);
  var rows = out.added.length ? out.rows : st.rawRows.map(function(r){ var o = Data.makeRow(); base.forEach(function(f){ o[f] = r[f]; }); return o; });
  var panels = UI.panels.filter(function(p){ return !dropField || !Pro.specUses(p.spec, dropField); }).map(function(p){
    var spec = p.spec;
    if (rename && spec) {
      var used = Pro.specUses(spec, rename.from);
      spec = Pro.renameIn(spec, rename.from, rename.to);
      if (used && typeof spec.title === 'string') spec.title = spec.title.split(rename.from).join(rename.to).split(titleCase(rename.from)).join(titleCase(rename.to));
    }
    return { id: p.id, spec: spec };
  });
  var filters = Filters.list.filter(function(f){ return !dropField || f.field !== dropField; }).map(function(f){ return rename && f.field === rename.from ? Object.assign({}, f, { field: rename.to }) : f; });
  var keep = Pro.calc.filter(function(c){ return active.indexOf(c.name) < 0 && !out.added.some(function(a){ return a.name === c.name; }); });
  if (!UI.restoreDashboardState({ version: DRAW_SCHEMA, rows: rows, fields: out.fields, sourceName: st.sourceName, panels: panels, filters: filters, activeIndex: Math.min(UI.activeIndex, Math.max(0, panels.length - 1)) }, st.sourceName)) return false;
  Pro.calc = keep.concat(out.added); Pro.persistCalc();
  UI.pushCommand();
  return out;
};
Pro.deleteCalc = function(name){
  var active = Pro.activeCalcs();
  var dep = active.filter(function(c){ return c.name !== name && c.expr.indexOf('[' + name + ']') >= 0; });
  if (dep.length) throw new Error('\u201c' + dep[0].name + '\u201d uses this column. Delete or edit that formula first.');
  var used = UI.panels.filter(function(p){ return Pro.specUses(p.spec, name); }).length;
  if (used && !confirm(used + ' chart' + (used > 1 ? 's use' : ' uses') + ' \u201c' + name + '\u201d and will be removed. Continue?')) return false;
  return Pro.rebuildCalcs(active.filter(function(c){ return c.name !== name; }), name);
};
Pro.renameIn = function(v, from, to){
  if (v === from) return to;
  if (Array.isArray(v)) return v.map(function(x){ return Pro.renameIn(x, from, to); });
  if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function(k){ o[k] = Pro.renameIn(v[k], from, to); }); return o; }
  return v;
};
Pro.editCalc = function(name, expr, newName){
  var st = Store.get(), active = Pro.activeCalcs(), names = active.map(function(c){ return c.name; });
  var idx = names.indexOf(name); if (idx < 0) throw new Error('That column is no longer in the data');
  newName = String(newName == null ? name : newName).trim();
  if (!newName) throw new Error('Give the column a name');
  if (/[\[\]]/.test(newName)) throw new Error('Column names can\u2019t contain [ or ]');
  if (newName !== name && st.rawFields.indexOf(newName) >= 0) throw new Error('A column with that name exists');
  var allowed = st.rawFields.filter(function(f){ return names.indexOf(f) < 0; }).concat(names.slice(0, idx));
  Pro.compile(expr, allowed);
  var ref = '[' + name + ']', nref = '[' + newName + ']';
  var list = active.map(function(c){ return c.name === name ? { name: newName, expr: expr } : (newName !== name ? { name: c.name, expr: c.expr.split(ref).join(nref) } : c); });
  var out = Pro.rebuildCalcs(list, null, newName !== name ? { from: name, to: newName } : null);
  if (out && out.added.length < list.length) UI.toast('Some dependent formulas could not be recalculated');
  return out;
};
Pro.calcAllowed = function(name){
  var st = Store.get(), names = Pro.activeCalcs().map(function(c){ return c.name; }), idx = names.indexOf(name);
  return st.rawFields.filter(function(f){ return names.indexOf(f) < 0; }).concat(names.slice(0, idx));
};

Pro.compile = function(expr, fields){
  if (!String(expr || '').trim()) throw new Error('Write a formula first');
  var refs = [];
  var bare = expr.replace(/\[([^\]]+)\]/g, function(_, n){
    if (fields.indexOf(n) < 0) throw new Error('Unknown column [' + n + ']');
    refs.push(n);
    return '$c(' + (refs.length - 1) + ')';
  });
  var stripped = bare.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  if (/[;{}`\[\]=\\]/.test(stripped.replace(/[=!]==?|[<>]=/g, '')) || /\b(function|window|document|globalThis|self|fetch|eval|import|constructor|prototype|new|this)\b|__proto__/.test(stripped)) throw new Error('That formula uses something not allowed');
  var helpers = 'var num=function(v){if(v==null||v==="")return null;if(typeof v==="number")return isFinite(v)?v:null;if(typeof v==="boolean"||typeof v==="object")return null;var s=String(v).trim().replace(/^\\((.*)\\)$/,"-$1").replace(/[$\u20ac\u00a3,%\\s]/g,"");if(s==="")return null;var n=Number(s);return isNaN(n)?null:n;};' +
    'var $c=function(i){var x=r[$refs[i]];var n=num(x);return n==null?x:n;};' +
    'var IF=function(c,a,b){return c?a:b;};var ROUND=function(v,d){var p=Math.pow(10,d||0);return Math.round(num(v)*p)/p;};' +
    'var ABS=function(v){return Math.abs(num(v));};var LOG=function(v){return Math.log(num(v));};var UPPER=function(v){return String(v==null?"":v).toUpperCase();};' +
    'var LOWER=function(v){return String(v==null?"":v).toLowerCase();};var YEAR=function(v){var d=new Date(v);return isNaN(d)?null:d.getUTCFullYear();};' +
    'var MONTH=function(v){var d=new Date(v);return isNaN(d)?null:d.getUTCMonth()+1;};var CONCAT=function(){return Array.prototype.join.call(arguments,"");};' +
    'var BUCKET=function(v,s){var n=num(v);if(n==null)return null;var b=Math.floor(n/s)*s;return b+"\u2013"+(b+s);};' +
    'var nums=function(a){return Array.prototype.map.call(a,num).filter(function(x){return x!=null;});};var str=function(v){return v==null?"":String(v);};' +
    'var dt=function(v){if(v==null||v==="")return null;var d=new Date(typeof v==="number"&&v<1e11?v*1000:v);return isNaN(d)?null:d;};' +
    'var MIN=function(){var a=nums(arguments);return a.length?Math.min.apply(null,a):null;};var MAX=function(){var a=nums(arguments);return a.length?Math.max.apply(null,a):null;};' +
    'var FLOOR=function(v){var n=num(v);return n==null?null:Math.floor(n);};var CEIL=function(v){var n=num(v);return n==null?null:Math.ceil(n);};' +
    'var SQRT=function(v){var n=num(v);return n==null||n<0?null:Math.sqrt(n);};var POWER=function(v,p){var n=num(v);return n==null?null:Math.pow(n,num(p));};' +
    'var DIVIDE=function(a,b){var x=num(a),y=num(b);return x==null||!y?null:x/y;};var COALESCE=function(){for(var i=0;i<arguments.length;i++){var v=arguments[i];if(v!=null&&v!==""&&!(typeof v==="number"&&isNaN(v)))return v;}return null;};' +
    'var LEN=function(v){return str(v).length;};var TRIM=function(v){return str(v).trim();};var LEFT=function(v,n){return str(v).slice(0,Math.max(0,num(n)||0));};var RIGHT=function(v,n){var k=Math.max(0,num(n)||0);return k?str(v).slice(-k):"";};' +
    'var CONTAINS=function(v,s){return str(v).toLowerCase().indexOf(str(s).toLowerCase())>=0;};var REPLACE=function(v,a,b){return str(v).split(str(a)).join(str(b));};' +
    'var DAY=function(v){var d=dt(v);return d?d.getUTCDate():null;};var WEEKDAY=function(v){var d=dt(v);return d?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getUTCDay()]:null;};' +
    'var QUARTER=function(v){var d=dt(v);return d?"Q"+(Math.floor(d.getUTCMonth()/3)+1):null;};var DAYS=function(a,b){var x=dt(a),y=dt(b);return x&&y?Math.round((x-y)/864e5):null;};';
  var fn = new Function('r', '$refs', helpers + 'return (' + bare + ');');
  return function(r){ return fn(r, refs); };
};

Pro.addCalcColumn = function(name, expr){
  var st = Store.get();
  if (!st.rawRows) throw new Error('Load data first');
  name = String(name || '').trim();
  if (!name) throw new Error('Give the column a name');
  if (/[\[\]]/.test(name)) throw new Error('Column names can\u2019t contain [ or ]');
  if (st.rawFields.indexOf(name) >= 0) throw new Error('A column with that name exists');
  Pro.compile(expr, st.rawFields);
  var out = Pro.applyCalcs(st.rawRows, st.rawFields, [{ name: name, expr: expr }]);
  var rows = out.rows, fields = out.fields;
  Pro.calc = Pro.calc.filter(function(c){ return c.name !== name; });
  Pro.calc.push({ name: name, expr: expr });
  Pro.persistCalc();
  UI.restoreDashboardState({ version: DRAW_SCHEMA, rows: rows, fields: fields, sourceName: st.sourceName,
    panels: UI.panels.map(function(p){ return { id: p.id, spec: p.spec }; }), filters: Filters.list, activeIndex: UI.activeIndex }, st.sourceName);
  UI.pushCommand();
};

Pro.applyCalcs = function(srcRows, srcFields, calcs){
  var fields = srcFields.slice(), fns = [], added = [];
  (calcs || []).forEach(function(c){
    if (!c || !c.name || fields.indexOf(c.name) >= 0) return;
    var fn; try { fn = Pro.compile(c.expr, fields); } catch (e) { return; }
    fns.push({ name: c.name, fn: fn }); fields.push(c.name); added.push({ name: c.name, expr: c.expr });
  });
  if (!fns.length) return { rows: srcRows, fields: srcFields, added: added };
  var rows = srcRows.map(function(r){
    var o = Data.makeRow(); srcFields.forEach(function(f){ o[f] = r[f]; });
    fns.forEach(function(x){
      var v; try { v = x.fn(o); } catch (e) { v = null; }
      o[x.name] = (v === undefined || (typeof v === 'number' && !isFinite(v))) ? null : v;
    });
    return o;
  });
  return { rows: rows, fields: fields, added: added };
};
Pro.calcFieldsFor = function(fields, calcs){
  var f = fields.slice();
  (calcs || []).forEach(function(c){
    if (!c || f.indexOf(c.name) >= 0) return;
    try { Pro.compile(c.expr, f); f.push(c.name); } catch (e) {}
  });
  return f;
};

Pro.modal = null;
Pro.DOCK_KEY = 'draw-pro-dock';
Pro.dockPrefs = (function(){ try { return JSON.parse(localStorage.getItem(Pro.DOCK_KEY)) || {}; } catch (e) { return {}; } })();
Pro.saveDock = function(){ try { localStorage.setItem(Pro.DOCK_KEY, JSON.stringify(Pro.dockPrefs)); } catch (e) {} };
Pro.clampH = function(h){ return Math.round(Math.max(170, Math.min(h, window.innerHeight - 140))); };
Pro.setDockH = function(h, save){
  h = Pro.clampH(h);
  document.documentElement.style.setProperty('--dock-h', h + 'px');
  if (Pro.modal) { var g = Pro.modal.querySelector('.pro-grip'); g.setAttribute('aria-valuenow', h); g.setAttribute('aria-valuemax', Math.max(170, window.innerHeight - 140)); }
  if (save) { Pro.dockPrefs.h = h; Pro.saveDock(); }
};
Pro.svg = function(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
Pro.ICON_FULL = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>';
Pro.ICON_DOCK = '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>';
Pro.setFull = function(on){
  Pro.dockPrefs.full = !!on; Pro.saveDock();
  Pro.modal.classList.toggle('is-full', !!on);
  document.body.classList.toggle('pro-dock-full', !!on);
  var b = Pro.modal.querySelector('[data-pro="full"]');
  b.innerHTML = Pro.svg(on ? Pro.ICON_DOCK : Pro.ICON_FULL);
  b.title = on ? 'Dock below charts' : 'Expand to full screen';
  b.setAttribute('aria-label', b.title); b.setAttribute('aria-pressed', !!on);
};
Pro.build = function(){
  var dk = document.createElement('section');
  dk.className = 'pro-dock'; dk.hidden = true; dk.id = 'dataDock';
  dk.setAttribute('role', 'region'); dk.setAttribute('aria-labelledby', 'proTitle');
  dk.innerHTML = '<div class="pro-grip" role="separator" aria-orientation="horizontal" aria-label="Resize data panel" aria-valuemin="170" tabindex="0" title="Drag to resize \u00b7 double-click to reset"></div>' +
    '<header class="pro-dock-head"><h2 id="proTitle">Data</h2><div class="pro-tabs" role="tablist" aria-label="Data tools">' +
    Pro.TABS.map(function(t){ return '<button type="button" class="pro-tab" role="tab" id="proTab-' + t[0] + '" aria-controls="proContent" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') +
    '</div><div class="pro-dock-actions"><button type="button" class="icon-btn" data-pro="full"></button>' +
    '<button type="button" class="icon-btn" data-pro="close" title="Close data panel (Esc)" aria-label="Close data panel">' + Pro.svg('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>') + '</button></div></header>' +
    '<div class="pro-dock-body" id="proContent" role="tabpanel"></div>';
  document.body.appendChild(dk);
  Pro.modal = dk;
  dk.addEventListener('click', function(e){
    if (e.target.closest('[data-pro="close"]')) { Pro.close(); return; }
    if (e.target.closest('[data-pro="full"]')) { Pro.setFull(!dk.classList.contains('is-full')); return; }
    var t = e.target.closest('[data-tab]'); if (t) Pro.render(t.getAttribute('data-tab'));
  });
  dk.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !e.defaultPrevented) { e.stopPropagation(); Pro.close(); return; }
    var t = e.target.closest('.pro-tab');
    if (t && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      var tabs = Array.prototype.slice.call(dk.querySelectorAll('.pro-tab')), i = tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1);
      var n = tabs[(i + tabs.length) % tabs.length]; e.preventDefault(); Pro.render(n.getAttribute('data-tab'), true); n.focus();
    }
  });
  var grip = dk.querySelector('.pro-grip'), startY = 0, startH = 0, dragging = false;
  grip.addEventListener('pointerdown', function(e){
    if (dk.classList.contains('is-full')) return;
    dragging = true; startY = e.clientY; startH = dk.getBoundingClientRect().height;
    grip.setPointerCapture(e.pointerId); document.body.style.userSelect = 'none'; e.preventDefault();
  });
  grip.addEventListener('pointermove', function(e){ if (dragging) Pro.setDockH(startH + (startY - e.clientY)); });
  function end(){ if (!dragging) return; dragging = false; document.body.style.userSelect = ''; Pro.setDockH(dk.getBoundingClientRect().height, true); }
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  grip.addEventListener('dblclick', function(){ if (!dk.classList.contains('is-full')) Pro.setDockH(window.innerHeight * 0.42, true); });
  grip.addEventListener('keydown', function(e){
    if (dk.classList.contains('is-full')) return;
    var h = dk.getBoundingClientRect().height, s = e.shiftKey ? 80 : 24;
    if (e.key === 'ArrowUp') { e.preventDefault(); Pro.setDockH(h + s, true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); Pro.setDockH(h - s, true); }
  });
  window.addEventListener('resize', function(){ if (!dk.hidden) Pro.setDockH(dk.classList.contains('is-full') ? Pro.dockPrefs.h || window.innerHeight * 0.42 : dk.getBoundingClientRect().height); });
};
Pro.isOpen = function(){ return !!(Pro.modal && !Pro.modal.hidden); };
Pro.open = function(tab){
  if (!ds()) { UI.toast('Load some data first.'); return; }
  if (!Pro.modal) Pro.build();
  if (!Pro.isOpen()) Pro._opener = document.activeElement;
  Pro.setDockH(Pro.dockPrefs.h || window.innerHeight * (window.innerWidth < 640 ? 0.5 : 0.42));
  Pro.setFull(!!Pro.dockPrefs.full);
  Pro.modal.hidden = false;
  document.body.classList.add('pro-docked');
  Pro.render(tab || Pro.tab || 'rows');
  var b = document.getElementById('proDataBtn'); if (b) b.setAttribute('aria-expanded', 'true');
};
Pro.close = function(){
  if (!Pro.isOpen()) return;
  var inside = Pro.modal.contains(document.activeElement);
  Pro.modal.hidden = true;
  document.body.classList.remove('pro-docked', 'pro-dock-full');
  var b = document.getElementById('proDataBtn'); if (b) b.setAttribute('aria-expanded', 'false');
  if (inside && Pro._opener && Pro._opener.focus && document.contains(Pro._opener)) Pro._opener.focus();
};
Pro.showResult = function(){ if (!ds()) return; Pro.rowState.q = ''; Pro.rowState.sort = null; Pro.rowState.limit = 500; if (Pro.modal && Pro.modal.classList.contains('is-full')) Pro.setFull(false); Pro.open('rows'); };
Pro.toggle = function(tab){ if (Pro.isOpen() && (!tab || tab === Pro.tab)) Pro.close(); else Pro.open(tab); };

Pro.render = function(tab, quiet){
  if (!Pro.renderers[tab]) tab = 'rows';
  Pro.tab = tab; Pro._quiet = !!quiet;
  Array.prototype.forEach.call(Pro.modal.querySelectorAll('.pro-tab'), function(b){ var on = b.getAttribute('data-tab') === tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  var box = Pro.modal.querySelector('#proContent');
  var fresh = box.cloneNode(false); box.parentNode.replaceChild(fresh, box); box = fresh;
  box.setAttribute('aria-labelledby', 'proTab-' + tab);
  Pro.renderers[tab](box);
  Pro._quiet = false;
};
Pro.refreshLive = function(){
  if (!Pro.isOpen()) return;
  if (!ds()) { Pro.close(); return; }
  if (Pro.tab !== 'rows' && Pro.tab !== 'profile') return;
  if (Pro._raf) return;
  Pro._raf = requestAnimationFrame(function(){
    Pro._raf = 0;
    if (!Pro.isOpen() || !ds()) return;
    var wrap = Pro.modal.querySelector('.pro-body'), top = wrap ? wrap.scrollTop : 0, ae = document.activeElement, sid = ae && Pro.modal.contains(ae) ? ae.id : '';
    Pro.render(Pro.tab, true);
    var w2 = Pro.modal.querySelector('.pro-body'); if (w2) w2.scrollTop = top;
    if (sid) { var el = document.getElementById(sid); if (el) el.focus(); }
  });
};
(function(){
  var orig = UI.refreshAllPanels;
  UI.refreshAllPanels = function(){ var r = orig.apply(this, arguments); Pro.refreshLive(); return r; };
  ['applyRows', 'restoreDashboardState'].forEach(function(k){
    var o = UI[k]; if (typeof o !== 'function') return;
    UI[k] = function(){ var r = o.apply(this, arguments); Pro.refreshLive(); return r; };
  });
})();
Pro.TABS = [['rows','Rows'],['profile','Profile'],['calc','Calculated column'],['views','Saved views']];
Pro.renderers = {};

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
    '<span class="pro-count" id="proCount" aria-live="polite"></span>' +
    '<button type="button" class="chip-btn" id="proExportRows">Download CSV</button></div>' +
    '<div class="pro-body" id="proTableWrap" tabindex="0" aria-label="Data rows"></div>';
  function draw(){
    var idx = Pro.filteredIndices();
    var shown = idx.slice(0, Pro.rowState.limit);
    var cnt = box.querySelector('#proCount');
    cnt.innerHTML = '<strong>' + idx.length.toLocaleString() + '</strong> of ' + d.rowCount.toLocaleString() + ' rows' + (idx.length > shown.length ? ' \u00b7 first ' + shown.length.toLocaleString() + ' shown' : '') +
      (Filters.list.length ? ' \u00b7 ' + Filters.list.length + ' filter' + (Filters.list.length > 1 ? 's' : '') + '<button type="button" class="pro-link" id="proClearF">Clear</button>' : '');
    var head = '<tr><th class="rn" aria-label="Row number">#</th>' + d.columns.map(function(c){
      var on = Pro.rowState.sort === c.name, arrow = on ? (Pro.rowState.dir > 0 ? ' \u2191' : ' \u2193') : '';
      return '<th data-sort="' + escapeHtml(c.name) + '" class="' + (c.type === 'number' ? 'num ' : '') + (on ? 'is-sorted' : '') + '" title="Sort by ' + escapeHtml(c.name) + '" aria-sort="' + (on ? (Pro.rowState.dir > 0 ? 'ascending' : 'descending') : 'none') + '">' + escapeHtml(c.name) + arrow + '</th>';
    }).join('') + '</tr>';
    var body = shown.map(function(i){ return '<tr><td class="rn">' + (i + 1) + '</td>' + d.columns.map(function(c){ var v = cellText(c, i); return v === '' ? '<td class="empty">\u2014</td>' : '<td class="' + (c.type === 'number' ? 'num' : '') + '" title="' + escapeHtml(v) + '">' + escapeHtml(v) + '</td>'; }).join('') + '</tr>'; }).join('');
    var more = idx.length > shown.length ? '<p style="padding:12px;text-align:center"><button type="button" class="chip-btn" id="proMore">Show 500 more</button></p>' : '';
    var empty = idx.length ? '' : '<p class="pro-note" style="padding:24px;text-align:center">No rows match' + (Pro.rowState.q ? ' \u201c' + escapeHtml(Pro.rowState.q) + '\u201d' : ' the current filters') + '.</p>';
    box.querySelector('#proTableWrap').innerHTML = '<table class="pro-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>' + empty + more;
    Pro._lastIdx = idx;
  }
  draw();
  var t = null;
  box.querySelector('#proSearch').addEventListener('input', function(e){ clearTimeout(t); t = setTimeout(function(){ Pro.rowState.q = e.target.value; Pro.rowState.limit = 500; draw(); }, 180); });
  box.querySelector('#proCount').addEventListener('click', function(e){ if (e.target.id === 'proClearF') { Filters.clearAll(); UI.refreshAllPanels(); UI.pushCommand(); } });
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
  if (!Pro._quiet) setTimeout(function(){ var s = box.querySelector('#proSearch'); if (s && window.innerWidth > 640) s.focus(); }, 30);
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
    if (Pro.modal.classList.contains('is-full')) Pro.setFull(false);
    Pro.addSpec(spec);
  });
};

Pro.renderCalc = function(box){
  var editing = Pro._editCalc && Pro.activeCalcs().some(function(c){ return c.name === Pro._editCalc.name; }) ? Pro._editCalc : null;
  Pro._editCalc = null;
  var f = editing ? Pro.calcAllowed(editing.name) : (Store.get().rawFields || []);
  var active = Pro.activeCalcs(), idle = Pro.idleCalcs();
  var list = active.length ? '<p class="pro-note" style="margin:16px 0 6px">Formula columns in this data:</p><div class="pro-body" style="flex:none">' + active.map(function(c){
    return '<div class="pro-view"><div style="min-width:0"><strong>' + escapeHtml(c.name) + '</strong><div class="pro-note" style="font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(c.expr) + '</div></div>' +
      '<div style="display:flex;gap:6px;flex:none"><button type="button" class="chip-btn" data-edit="' + escapeHtml(c.name) + '">Edit</button><button type="button" class="chip-btn" data-delcalc="' + escapeHtml(c.name) + '">Delete</button></div></div>';
  }).join('') + '</div>' : '';
  var reapply = idle.length ? '<div class="pro-row" style="margin-top:14px"><span class="pro-note" style="flex:1">' + idle.length + ' saved formula' + (idle.length > 1 ? 's fit' : ' fits') + ' this data: ' + idle.map(function(c){ return escapeHtml(c.name); }).join(', ') + '</span><button type="button" class="chip-btn" id="proCalcReapply">Add ' + (idle.length > 1 ? 'them' : 'it') + '</button></div>' : '';
  box.innerHTML = '<div style="padding:4px;overflow:auto">' +
    '<p class="pro-note" style="margin-bottom:10px">Write a formula with column names in square brackets. Number cells are cleaned automatically ($, commas and %).</p>' +
    '<div class="pro-row"><input class="pro-input" id="proCalcName" placeholder="New column name, e.g. Price per unit" aria-label="New column name"' + (editing ? ' value="' + escapeHtml(editing.name) + '"' : '') + '></div>' +
    '<div class="pro-row"><input class="pro-input" id="proCalcExpr" placeholder="[Revenue] / [Units]" aria-label="Formula" style="font-family:ui-monospace,monospace"' + (editing ? ' value="' + escapeHtml(editing.expr) + '"' : '') + '></div>' +
    '<details class="pro-note" style="margin-bottom:4px"><summary style="cursor:pointer">Functions and operators</summary><div style="margin-top:6px;line-height:1.7">' +
    '<strong>Logic</strong> IF(cond,a,b) \u00b7 COALESCE(a,b,\u2026)<br><strong>Math</strong> ROUND(v,d) \u00b7 FLOOR \u00b7 CEIL \u00b7 ABS \u00b7 SQRT \u00b7 LOG \u00b7 POWER(v,p) \u00b7 MIN(a,b,\u2026) \u00b7 MAX(a,b,\u2026) \u00b7 DIVIDE(a,b) (blank when dividing by zero) \u00b7 BUCKET(v,size)<br>' +
    '<strong>Text</strong> UPPER \u00b7 LOWER \u00b7 TRIM \u00b7 LEN \u00b7 LEFT(v,n) \u00b7 RIGHT(v,n) \u00b7 CONTAINS(v,text) \u00b7 REPLACE(v,find,with) \u00b7 CONCAT(a,b,\u2026)<br><strong>Dates</strong> YEAR \u00b7 QUARTER \u00b7 MONTH \u00b7 DAY \u00b7 WEEKDAY \u00b7 DAYS(end,start)<br>' +
    '<strong>Operators</strong> + - * / % &gt; &lt; &gt;= &lt;= == != &amp;&amp; || ! ? :</div></details>' +
    '<p class="pro-note" style="margin:10px 0 4px">Columns (click to insert):</p><div class="field-check-list" id="proCalcCols">' +
    f.map(function(n){ return '<button type="button" class="field-check" data-ins="' + escapeHtml(n) + '">' + escapeHtml(n) + '</button>'; }).join('') + '</div>' +
    '<p class="pro-note" id="proCalcPreview" style="margin-top:12px"></p>' +
    '<div class="modal-actions">' + (editing ? '<button type="button" class="chip-btn" id="proCalcCancel">Cancel</button>' : '<span></span>') + '<button type="button" class="btn-primary" id="proCalcGo">' + (editing ? 'Save formula' : 'Add column') + '</button></div>' +
    reapply + list + '</div>';
  var ex = box.querySelector('#proCalcExpr'), pv = box.querySelector('#proCalcPreview'), nmIn = box.querySelector('#proCalcName');
  function goBtn(){ return box.querySelector('#proCalcGo'); }
  [nmIn, ex].forEach(function(el){ el.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); goBtn().click(); } }); });
  box.addEventListener('click', function(e){
    var ed = e.target.closest('[data-edit]'), dl = e.target.closest('[data-delcalc]');
    if (ed){ var n = ed.getAttribute('data-edit'); Pro._editCalc = Pro.activeCalcs().filter(function(c){ return c.name === n; })[0]; Pro.render('calc'); }
    if (dl){ var dn = dl.getAttribute('data-delcalc'); try { if (Pro.deleteCalc(dn)) { UI.toast('Deleted column \u201c' + dn + '\u201d'); Pro.render('calc'); } } catch (err) { pv.className = 'pro-err'; pv.textContent = err.message; } }
    if (e.target.id === 'proCalcCancel') Pro.render('calc');
    if (e.target.id === 'proCalcReapply'){
      var st = Store.get(), out = Pro.applyCalcs(st.rawRows, st.rawFields, idle);
      if (!out.added.length) return;
      if (UI.restoreDashboardState({ version: DRAW_SCHEMA, rows: out.rows, fields: out.fields, sourceName: st.sourceName, panels: UI.panels.map(function(p){ return { id: p.id, spec: p.spec }; }), filters: Filters.list, activeIndex: UI.activeIndex }, st.sourceName)) {
        UI.pushCommand(); UI.toast(out.added.length + ' formula column' + (out.added.length > 1 ? 's' : '') + ' added'); Pro.render('calc');
      }
    }
  });
  if (editing) setTimeout(function(){ ex.focus(); ex.setSelectionRange(ex.value.length, ex.value.length); }, 30);
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
  if (editing) preview();
  goBtn().addEventListener('click', function(){
    try {
      if (editing) { var nn = nmIn.value.trim(); if (Pro.editCalc(editing.name, ex.value, nn)) { UI.toast(nn && nn !== editing.name ? 'Renamed to \u201c' + nn + '\u201d and updated' : 'Updated \u201c' + editing.name + '\u201d'); Pro.render('calc'); } return; }
      var nm = nmIn.value; Pro.addCalcColumn(nm, ex.value); UI.toast('Added column \u201c' + nm.trim() + '\u201d'); Pro.render('calc');
    }
    catch (e) { pv.className = 'pro-err'; pv.textContent = e.message; }
  });
};

Pro.renderers.rows = function(b){ Pro.renderRows(b); };
Pro.renderers.profile = function(b){ Pro.renderProfile(b); };
Pro.renderers.calc = function(b){ Pro.renderCalc(b); };
Pro.renderers.views = function(b){ Pro.renderViews(b); };
Pro.VIEWS_KEY = 'draw-pro-views';
Pro.loadViews = function(){
  try {
    var v = JSON.parse(localStorage.getItem(Pro.VIEWS_KEY));
    return Array.isArray(v) ? v.filter(function(x){ return x && typeof x.name === 'string' && x.layout && Array.isArray(x.layout.p); }) : [];
  } catch (e) { return []; }
};
Pro.saveViews = function(v){ try { localStorage.setItem(Pro.VIEWS_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } };
Pro.renderViews = function(box){
  var views = Pro.loadViews(), fields = Store.get().rawFields || [];
  box.innerHTML = '<div class="pro-row"><input class="pro-input" id="proViewName" placeholder="Name this view, e.g. Q4 regional review" aria-label="View name"><button type="button" class="btn-primary" id="proViewSave">Save current view</button></div>' +
    '<p class="pro-note" style="margin-bottom:8px">A view stores the charts, layout and filters (not the data). You can apply it to any file that has the same columns.</p>' +
    '<div class="pro-body">' + (views.length ? views.map(function(v, i){
      var fits = UI.layoutFitsFields(v.layout, Pro.calcFieldsFor(fields, v.calc));
      var nCalc = (v.calc || []).length;
      return '<div class="pro-view"><div><strong>' + escapeHtml(v.name) + '</strong><div class="pro-note">' + v.layout.p.length + ' charts' + (nCalc ? ' \u00b7 ' + nCalc + ' formula' + (nCalc > 1 ? 's' : '') : '') + ' \u00b7 ' + escapeHtml(v.source || '') + ' \u00b7 ' + new Date(v.at).toLocaleString() + '</div></div>' +
        '<div style="display:flex;gap:6px"><button type="button" class="chip-btn" data-apply="' + i + '"' + (fits ? '' : ' disabled title="This data is missing columns the view needs"') + '>Apply</button><button type="button" class="chip-btn" data-del="' + i + '">Delete</button></div></div>';
    }).join('') : '<p class="pro-note" style="padding:16px">No saved views yet.</p>') + '</div>';
  box.querySelector('#proViewSave').addEventListener('click', function(){
    var name = box.querySelector('#proViewName').value.trim() || ('View ' + (views.length + 1));
    var st = Store.get();
    var used = {};
    UI.panels.forEach(function(p){ Object.keys(p.spec || {}).forEach(function(k){ var v = p.spec[k]; if (typeof v === 'string' && st.rawFields.indexOf(v) >= 0) used[v] = 1; (Array.isArray(v) ? v : []).forEach(function(x){ if (st.rawFields.indexOf(x) >= 0) used[x] = 1; }); }); });
    Filters.list.forEach(function(f){ used[f.field] = 1; });
    var calc = Pro.calc.filter(function(c){ return st.rawFields.indexOf(c.name) >= 0; }).map(function(c){ return { name: c.name, expr: c.expr }; });
    views.unshift({ name: name, at: Date.now(), source: st.sourceName, calc: calc, layout: { v: DRAW_SCHEMA, f: Object.keys(used), p: UI.panels.map(function(p){ return { id: p.id, spec: p.spec }; }), fl: JSON.parse(JSON.stringify(Filters.list)), a: UI.activeIndex } });
    if (Pro.saveViews(views.slice(0, 40))) UI.toast('Saved view \u201c' + name + '\u201d'); else UI.toast('Couldn\u2019t save \u2014 browser storage is full.');
    Pro.render('views');
  });
  box.querySelector('.pro-body').addEventListener('click', function(e){
    var a = e.target.closest('[data-apply]'), d = e.target.closest('[data-del]');
    if (a){
      var view = views[+a.getAttribute('data-apply')], v = view.layout, st = Store.get();
      var out = Pro.applyCalcs(st.rawRows, st.rawFields, view.calc);
      out.added.forEach(function(c){ Pro.calc = Pro.calc.filter(function(x){ return x.name !== c.name; }); Pro.calc.push(c); });
      if (out.added.length) Pro.persistCalc();
      if (UI.restoreDashboardState({ version: v.v, rows: out.rows, fields: out.fields, sourceName: st.sourceName, panels: v.p, filters: v.fl, activeIndex: v.a }, st.sourceName, out.added.length ? undefined : { skipDatasetSave: true })) { UI.pushCommand(); Pro.close(); UI.toast(out.added.length ? 'View applied \u00b7 ' + out.added.length + ' formula column' + (out.added.length > 1 ? 's' : '') + ' recreated' : 'View applied'); }
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
  if (!ds() || Pro._pal) return;
  var k = e.key.toLowerCase();
  if (document.querySelector('.modal-overlay:not([hidden])')) return;
  if (k === 'd') { e.preventDefault(); Pro.toggle(); }
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
var dataBtn = iconBtn('proDataBtn', 'Data, profile & formulas (D)', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M9.5 9.5v10M3.5 14.5h17"/>', function(){ Pro.toggle(); });
dataBtn.setAttribute('aria-expanded', 'false'); dataBtn.setAttribute('aria-controls', 'dataDock');
var cmdBtn = iconBtn('proCmdBtn', 'Command palette (Ctrl/Cmd+K)', '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>', Pro.palette);
var presentBtn = iconBtn('proPresentBtn', 'Present full screen (P)', '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', Pro.present);
var add = document.getElementById('addChartBtn');
add.parentNode.insertBefore(dataBtn, add);
add.parentNode.insertBefore(cmdBtn, add);
var theme = document.getElementById('themeToggleBtn');
theme.parentNode.insertBefore(presentBtn, theme);
var orig = UI.setWorkspaceControlsVisible;
UI.setWorkspaceControlsVisible = function(v){ orig(v); dataBtn.hidden = cmdBtn.hidden = presentBtn.hidden = !v; if (!v) Pro.close(); };
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
