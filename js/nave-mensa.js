/* Esplora la nave › Mensa (js/nave-esplora.js).
   A sinistra la Mensa vista dall'alto: una sala lunga il doppio della sua larghezza. In basso l'ingresso dalla Sala Mappe;
   in fondo la cucina (un quarto della lunghezza) con il piano a U: un tratto sul fondo a sinistra con i fornelli a induzione
   e il lavello, un tratto sulla parete sinistra con due frigoriferi grandi e la penisola davanti, parallela al fondo.
   La dispensa è una fila di armadietti sulla parete destra della cucina. Al centro del lato in fondo la porta della scala
   a chiocciola (su agli Alloggi, giù alla Stiva Modulare). Nella sala tre tavoli rotondi da sei sedie.
   A destra, per ora: la descrizione della Mensa e i giorni di viveri della dispensa (dalla stiva condivisa, js/stiva.js). */
(function(){
  "use strict";
  if(!window.NAVE) return;
  var W = 440, H = 880, K = 220;
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function pianta(){
    g = [];
    r(0, 0, W, H, "#2a1d12"); for(var i = 1; i < W / 22; i++) l(i * 22, 2, i * 22, H - 2, "rgba(0,0,0,.18)");
    /* pavimento della cucina */
    r(0, 0, W, K, "#3a2e24");
    for(var a = 0; a < W / 20; a++) for(var b = 0; b < K / 20; b++) r(a * 20 + (b % 2) * 10 - 10, b * 20, 20, 20, "none", "rgba(0,0,0,.12)");
    l(0, K, W, K, "rgba(210,168,90,.35)", 1.5, 'stroke-dasharray="6 6"');
    /* piano a U */
    var PIANO = "#8a8478", BORDO = "#4a4640";
    r(0, 0, 210, 30, PIANO, BORDO, 2); r(0, 30, 30, 182, PIANO, BORDO, 2); r(30, 180, 180, 32, PIANO, BORDO, 2);
    [[50, 15], [90, 15], [130, 15], [70, 196], [110, 196], [150, 196]].forEach(function(q){
      r(q[0] - 15, q[1] - 11, 30, 22, "#1a1a1a", "#555", 1, 2); c(q[0] - 6, q[1] - 3, 4, "none", "#c84848", 1, 'class="nxm-fuoco"'); c(q[0] + 6, q[1] + 4, 4, "none", "#c84848", 1, 'class="nxm-fuoco"');
    });
    r(174, 6, 26, 18, "#c8c0b0", "#555", 1, 3); c(187, 15, 4, "#7ec8e3");                                         /* lavello */
    r(2, 46, 26, 52, "#d8d8d8", "#6a6a6a", 2, 2); l(15, 50, 15, 94, "#9a9a9a", 1);                                /* frigorifero */
    r(2, 104, 26, 52, "#d8d8d8", "#6a6a6a", 2, 2); l(15, 108, 15, 152, "#9a9a9a", 1);                             /* frigorifero */
    /* dispensa: armadietti sulla parete destra */
    r(410, 6, 28, 206, "#4a2c13", "#2a1a0a", 2);
    for(var k = 1; k < 6; k++) l(410, 6 + k * 34.3, 438, 6 + k * 34.3, "#2a1a0a", 1.5);
    for(var m = 0; m < 6; m++) c(414, 23 + m * 34.3, 1.6, "#c8a04a");
    /* porta della scala a chiocciola, al centro del lato in fondo */
    l(212, 0, 258, 0, "#2a1d12", 8);
    /* tre tavoli rotondi da sei sedie */
    [[130, 360], [310, 550], [130, 740]].forEach(function(q){
      for(var s = 0; s < 6; s++){ var an = s * Math.PI / 3; c(q[0] + Math.cos(an) * 62, q[1] + Math.sin(an) * 62, 11, "#5a3d22", "#3a2614", 1.5); }
      c(q[0], q[1], 44, "#7a5230", "#3a2614", 2.5); c(q[0], q[1], 34, "none", "rgba(255,220,160,.15)", 1); c(q[0], q[1], 5, "#ffd27a", "", 0, 'class="nxa-lume"');
    });
    /* ingresso dalla Sala Mappe */
    l(196, H, 244, H, "#2a1d12", 9);
    r(0, 0, W, H, "none", "#d2a85a", 5);
    var t = '<text x="235" y="-10" fill="#a39478" font-size="19" text-anchor="middle">↑ scala a chiocciola</text>'
      + '<text x="220" y="' + (H + 28) + '" fill="#a39478" font-size="19" text-anchor="middle">↓ verso la Sala Mappe</text>';
    return '<svg class="sm-svg nxm-svg" viewBox="-6 -32 ' + (W + 12) + ' ' + (H + 70) + '" role="img" aria-label="Mensa vista dall\'alto">' + g.join("") + t + '</svg>';
  }

  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  var dentro = false;
  function destra(){
    if(!dentro) return;
    var giorni = window.STV ? STV.doc().disp : null;
    dx.innerHTML = '<div class="sm-h">🍲 Mensa</div>'
      + '<p class="sm-d">Sotto gli alloggi: tre tavoli rotondi da sei posti e, in fondo, una cucina vera, con fornelli a induzione, due frigoriferi grandi, la penisola e gli armadietti della dispensa. Dalla porta in fondo si prende la scala a chiocciola.</p>'
      + (giorni != null ? '<div class="stv-lbl">Dispensa</div><p class="sm-d"><b>' + giorni + '</b> ' + (giorni === 1 ? "giorno" : "giorni") + ' di viveri per tutto il gruppo.</p>'
        + '<button type="button" class="eq-btn" data-nxm="disp">Apri la dispensa in stiva</button>' : '')
      + '<p class="stv-nota" style="margin-top:1rem">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
  }
  dx.addEventListener("click", function(e){ if(e.target.closest('[data-nxm="disp"]') && window.stvApri) stvApri("dis"); });
  if(window.STV) STV.on(destra);
  NAVE.zona("mensa", {
    sinistra: sx, destra: dx,
    apri: function(){ dentro = true; sx.innerHTML = pianta(); destra(); },
    chiudi: function(){ dentro = false; }
  });
})();
