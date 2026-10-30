/* Esplora la nave › Ponte di Comando (js/nave-esplora.js).
   A sinistra il Ponte visto dall'alto: un trapezio isoscele con i due lati obliqui curvi verso l'esterno.
   Sul lato minore, in alto, le vetrate e la zona di pilotaggio: il timone al centro con la seduta del timoniere,
   le postazioni con i computer a sinistra e a destra, ognuna con la sua seduta. Sul lato maggiore, in basso,
   la scala che scende alla Sala Mappe. Al centro del pavimento una rosa dei venti in ottone.
   A destra, per ora: la descrizione del Ponte. */
(function(){
  "use strict";
  if(!window.NAVE) return;
  var W = 560, H = 440;
  var TL = [140, 30], TR = [420, 30], BR = [530, 410], BL = [30, 410];
  var FORMA = "M" + TL + " L" + TR + " Q548,200 " + BR + " L" + BL + " Q12,200 " + TL + " Z";
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
  function postazione(x, y, rot){
    g.push('<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">');
    p("M-46,-14 Q0,-30 46,-14 L40,10 Q0,-4 -40,10 Z", "#2a2f36", "#7a6a4a", 1.5);
    r(-34, -18, 20, 10, "#3fa9d6", "", 0, 1, 'class="nxk-schermo" transform="rotate(-10 -24 -13)"'); r(-9, -22, 18, 10, "#5fd0a0", "", 0, 1, 'class="nxk-schermo"'); r(14, -18, 20, 10, "#d6a33f", "", 0, 1, 'class="nxk-schermo" transform="rotate(10 24 -13)"');
    for(var i = -2; i <= 2; i++) c(i * 12, 0, 2, i % 2 ? "#c84848" : "#7fd4ff");
    g.push('</g>');
  }
  function pianta(){
    g = [];
    var defs = '<defs><clipPath id="nxp-forma"><path d="' + FORMA + '"/></clipPath></defs>';
    g.push('<g clip-path="url(#nxp-forma)">');
    r(0, 0, W, H, "#3a2615"); for(var i = 0; i < W; i += 20) l(i, 0, i, H, "rgba(0,0,0,.2)", 1);
    for(var j = 0; j < H; j += 90) for(var k = 0; k < W; k += 40) l(k + (j / 90 % 2) * 20, j, k + (j / 90 % 2) * 20, j + 2, "rgba(0,0,0,.25)", 2);
    /* rosa dei venti in ottone */
    c(280, 300, 58, "none", "rgba(200,160,74,.55)", 2); c(280, 300, 44, "none", "rgba(200,160,74,.35)", 1);
    p("M280,236 L289,300 L280,364 L271,300 Z", "rgba(200,160,74,.55)"); p("M216,300 L280,291 L344,300 L280,309 Z", "rgba(200,160,74,.4)");
    /* tappeto della zona di pilotaggio */
    p("M175,62 L385,62 Q420,140 405,200 L155,200 Q140,140 175,62 Z", "#5a1f1a", "#c8a04a", 1.5, 'opacity=".7"');
    g.push('</g>');
    /* vetrate sul lato minore e sulla parte alta dei lati curvi */
    p("M" + TL + " L" + TR, "none", "#9fd8e8", 9, 'opacity=".75"');
    /* il primo tratto dei lati curvi (stessa curva della parete) */
    p("M420,30 Q471.2,98 499,172.4", "none", "#9fd8e8", 9, 'opacity=".55"'); p("M140,30 Q88.8,98 61,172.4", "none", "#9fd8e8", 9, 'opacity=".55"');
    for(var m = 0; m <= 7; m++){ var mx = 140 + m * 40; l(mx, 24, mx, 36, "#c8a04a", 3); }
    /* timone con la seduta del timoniere */
    r(272, 96, 16, 18, "#4a2c13", "#2a1a0a", 1.5, 2);
    c(280, 92, 26, "none", "#a86c2a", 5); c(280, 92, 9, "#c8903a", "#6a4020", 2);
    for(var s = 0; s < 8; s++){ var a = s * Math.PI / 4; l(280 + Math.cos(a) * 9, 92 + Math.sin(a) * 9, 280 + Math.cos(a) * 36, 92 + Math.sin(a) * 36, "#a86c2a", 3.5); c(280 + Math.cos(a) * 36, 92 + Math.sin(a) * 36, 3.5, "#c8903a"); }
    seduta(280, 150, 0, "#7a2a22");
    /* postazioni con i computer, a sinistra e a destra, ognuna con la sua seduta */
    postazione(150, 120, -58); seduta(185, 165, -35);
    postazione(410, 120, 58); seduta(375, 165, 35);
    /* computer lungo i lati, più in basso */
    [[70, 250, -78], [490, 250, 78]].forEach(function(q){ g.push('<g transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')">'); r(-30, -10, 60, 20, "#2a2f36", "#7a6a4a", 1.5, 3); r(-24, -7, 20, 8, "#3fa9d6", "", 0, 1, 'class="nxk-schermo"'); r(4, -7, 20, 8, "#5fd0a0", "", 0, 1, 'class="nxk-schermo"'); g.push('</g>'); });
    /* scala che scende alla Sala Mappe */
    r(250, 360, 60, 50, "#2a1a0a", "#7a5a3a", 1.5); for(var z = 1; z < 6; z++) l(252, 360 + z * 8.3, 308, 360 + z * 8.3, "#8a6a3a", 2);
    p(FORMA, "none", "#d2a85a", 5);
    l(250, 410, 310, 410, "#2a1a0a", 7);
    var t = '<text x="280" y="16" fill="#a39478" font-size="15" text-anchor="middle">▲ prua</text>'
      + '<text x="280" y="432" fill="#a39478" font-size="15" text-anchor="middle">▼ verso la Sala Mappe</text>';
    return '<svg class="sm-svg nxp-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ponte di Comando visto dall\'alto">' + defs + g.join("") + t + '</svg>';
  }
  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<div class="sm-h">🧭 Ponte di Comando</div>'
    + '<p class="sm-d">Rialzato sopra la Sala Mappe, con le vetrate che guardano verso prua. Al centro il timone e la seduta del timoniere; a sinistra e a destra le postazioni con i computer di bordo, ognuna con la sua seduta. Una scala scende alla Sala Mappe.</p>'
    + '<p class="stv-nota" style="margin-top:1rem">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
  NAVE.zona("ponte_comando", { sinistra: sx, destra: dx, apri: function(){ sx.innerHTML = pianta(); } });
})();
