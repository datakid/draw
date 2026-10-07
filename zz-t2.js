var f = document.getElementById('f');
f.onload = function(){ setTimeout(function(){
  var w = f.contentWindow, P = w.DrawPro, UI = w.UI;
  w.localStorage.removeItem('draw-pro-calc'); P.calc = [];
  var rows = [];
  for (var i = 0; i < 30; i++){ var r = w.Data.makeRow(); r.Region = ['N','S','E'][i%3]; r.Revenue = 100 + i; r.Units = 1 + i%4; rows.push(r); }
  UI.applyRows(rows, ['Region','Revenue','Units'], 'test.csv');
  P.addCalcColumn('Price', 'DIVIDE([Revenue],[Units])');
  P.open('calc');
  w.document.querySelector('#proContent details').open = true;
  w.document.querySelector('[data-edit="Price"]').click();
  w.document.querySelector('#proContent details').open = true;
  var x = document.createElement('i'); x.id = 'done'; document.body.appendChild(x);
}, 1500); };
