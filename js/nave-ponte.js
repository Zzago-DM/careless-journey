/* Esplora la nave › Ponte di Comando (js/nave-esplora.js).
   A sinistra il Ponte visto dall'alto: un trapezio isoscele con i due lati obliqui curvi verso l'esterno.
   Sul lato minore, in alto, le vetrate e la zona di pilotaggio: una console unica e curva davanti, il timone visto dall'alto
   (la ruota di taglio sul piedistallo) con la seduta del timoniere, e due sedute ai lati della console. Sul lato maggiore, in basso,
   la scala che scende alla Sala Mappe. Al centro del pavimento una rosa dei venti in ottone.
   A destra, per ora: la descrizione del Ponte. */
(function(){
  "use strict";
  if(!window.NAVE) return;
  var W = 560, H = 330;
  var TL = [140, 30], TR = [420, 30], BR = [530, 300], BL = [30, 300];
  var FORMA = "M" + TL + " L" + TR + " Q548,150 " + BR + " L" + BL + " Q12,150 " + TL + " Z";
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function p(d, f, s, sw, ex){ g.push('<path d="' + d + '" fill="' + (f || "none") + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function seduta(x, y, rot, col){
    g.push('<g transform="translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')">');
    r(-15, -13, 30, 28, col || "#6a2a22", "#3a140f", 1.5, 6); r(-15, 9, 30, 8, "#4a1c16", "", 0, 3); r(-19, -9, 6, 20, "#4a2c13", "", 0, 3); r(13, -9, 6, 20, "#4a2c13", "", 0, 3);
    g.push('</g>');
  }
  /* una console unica, curva, che corre davanti sotto le vetrate */
  function console_(){
    p("M168,48 Q280,26 392,48 L384,76 Q280,56 176,76 Z", "#2a2f36", "#7a6a4a", 1.5);
    var schermi = [["#3fa9d6", -9], ["#5fd0a0", -5], ["#d6a33f", -2], ["#3fa9d6", 2], ["#5fd0a0", 5], ["#d6a33f", 9]];
    schermi.forEach(function(q, i){ var x = 186 + i * 32; r(x, 44 - Math.abs(i - 2.5) * -1.4 - (i === 2 || i === 3 ? 3 : 0), 24, 9, q[0], "", 0, 1, 'class="nxk-schermo" transform="rotate(' + q[1] + ' ' + (x + 12) + ' 48)"'); });
    for(var k = 0; k < 11; k++) c(190 + k * 18, 64 - (k > 2 && k < 8 ? 3 : 0), 1.8, k % 3 ? "#7fd4ff" : "#c84848");
  }
  /* timone visto dall'alto: la ruota è in piedi, quindi se ne vede solo il bordo, con le maniglie che sporgono, l'asse e il piedistallo */
  function timone(){
    r(270, 100, 20, 22, "#4a2c13", "#2a1a0a", 1.5, 3);              /* piedistallo */
    l(280, 100, 280, 92, "#8a6a3a", 4);                              /* asse */
    r(250, 88, 60, 7, "#a86c2a", "#5a3a18", 1.5, 3);                 /* la ruota, di taglio */
    r(274, 87, 12, 9, "#c8903a", "#6a4020", 1, 2);                   /* mozzo */
    [242, 246, 314, 318].forEach(function(x, i){ if(i % 3 === 0) r(x - 4, 89.5, 8, 4, "#c8903a", "", 0, 2); });
    [[242, 91.5], [318, 91.5]].forEach(function(q){ c(q[0], q[1], 3.5, "#c8903a", "#6a4020", 1); });
    for(var k = 0; k < 5; k++) l(256 + k * 12, 88, 256 + k * 12, 95, "rgba(0,0,0,.3)", 1);
  }
  function pianta(){
    g = [];
    var defs = '<defs><clipPath id="nxp-forma"><path d="' + FORMA + '"/></clipPath></defs>';
    g.push('<g clip-path="url(#nxp-forma)">');
    r(0, 0, W, H, "#3a2615"); for(var i = 0; i < W; i += 20) l(i, 0, i, H, "rgba(0,0,0,.2)", 1);
    for(var j = 0; j < H; j += 90) for(var k = 0; k < W; k += 40) l(k + (j / 90 % 2) * 20, j, k + (j / 90 % 2) * 20, j + 2, "rgba(0,0,0,.25)", 2);
    /* rosa dei venti in ottone */
    c(280, 212, 40, "none", "rgba(200,160,74,.55)", 2); c(280, 212, 30, "none", "rgba(200,160,74,.35)", 1);
    p("M280,168 L287,212 L280,256 L273,212 Z", "rgba(200,160,74,.55)"); p("M236,212 L280,205 L324,212 L280,219 Z", "rgba(200,160,74,.4)");
    /* tappeto della zona di pilotaggio */
    p("M180,50 L380,50 Q404,110 395,160 L165,160 Q156,110 180,50 Z", "#5a1f1a", "#c8a04a", 1.5, 'opacity=".7"');
    g.push('</g>');
    /* vetrate sul lato minore e sul primo tratto dei lati curvi (stessa curva della parete) */
    p("M" + TL + " L" + TR, "none", "#9fd8e8", 9, 'opacity=".75"');
    p("M420,30 Q471.2,78 499,130.8", "none", "#9fd8e8", 9, 'opacity=".55"'); p("M140,30 Q88.8,78 61,130.8", "none", "#9fd8e8", 9, 'opacity=".55"');
    for(var m = 0; m <= 7; m++){ var mx = 140 + m * 40; l(mx, 24, mx, 36, "#c8a04a", 3); }
    /* console unica davanti, il timone e le tre sedute: centrale per il timoniere, due ai lati della console */
    console_();
    timone();
    seduta(280, 140, 0, "#7a2a22");
    seduta(205, 104, -20); seduta(355, 104, 20);
    /* computer lungo i lati, più in basso */
    [[70, 190, -76], [490, 190, 76]].forEach(function(q){ g.push('<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')">'); r(-30, -10, 60, 20, "#2a2f36", "#7a6a4a", 1.5, 3); r(-24, -7, 20, 8, "#3fa9d6", "", 0, 1, 'class="nxk-schermo"'); r(4, -7, 20, 8, "#5fd0a0", "", 0, 1, 'class="nxk-schermo"'); g.push('</g>'); });
    /* scala che scende alla Sala Mappe */
    r(250, 256, 60, 44, "#2a1a0a", "#7a5a3a", 1.5); for(var z = 1; z < 6; z++) l(252, 256 + z * 7.3, 308, 256 + z * 7.3, "#8a6a3a", 2);
    p(FORMA, "none", "#d2a85a", 5);
    l(250, 300, 310, 300, "#2a1a0a", 7);
    var t = '<text x="280" y="16" fill="#a39478" font-size="15" text-anchor="middle">▲ prua</text>'
      + '<text x="280" y="322" fill="#a39478" font-size="15" text-anchor="middle">▼ verso la Sala Mappe</text>';
    return '<svg class="sm-svg nxp-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ponte di Comando visto dall\'alto">' + defs + g.join("") + t + '</svg>';
  }
  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<div class="sm-h">🧭 Ponte di Comando</div>'
    + '<p class="sm-d">Rialzato sopra la Sala Mappe, con le vetrate che guardano verso prua. Davanti, sotto le vetrate, una lunga console con i computer di bordo; dietro di essa il timone con la seduta del timoniere, e due sedute ai lati della console. Una scala scende alla Sala Mappe.</p>'
    + '<p class="stv-nota" style="margin-top:1rem">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
  NAVE.zona("ponte_comando", { sinistra: sx, destra: dx, apri: function(){ sx.innerHTML = pianta(); } });
})();
