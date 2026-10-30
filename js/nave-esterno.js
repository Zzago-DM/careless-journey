/* Esplora la nave › Ponte Esterno (js/nave-esplora.js).
   A sinistra il Ponte Esterno visto dall'alto: un grande cono, della stessa forma della Sala Mappe ma più lungo di oltre
   la metà. La Sala Mappe sta dentro di esso, verso poppa, come una "zona mancante": davanti alla sua punta il ponte si apre
   in una piattaforma che si stringe fino alla prua, e ai suoi lati restano due corridoi stretti che portano alle porte laterali.
   Tutto attorno corre il parapetto.
   A destra, per ora: la descrizione del Ponte Esterno. */
(function(){
  "use strict";
  if(!window.NAVE) return;
  var W = 600, H = 1046;
  var DX = 20, DY = 355;                                   /* dove sta la Sala Mappe dentro il ponte */
  var GIU = 251;                                           /* la Sala Mappe è spostata verso poppa del 40% della sua lunghezza: la parte in fondo esce dal ponte */
  function Y(y){ return y + DY + GIU; }
  /* il cono esterno: la stessa forma della Sala Mappe, allargata dei due corridoi e allungata verso prua */
  var T0 = [333, 58], TC = [562, 424], TB = [584, 1005];
  var FUORI = "M267,58 Q300,32 333,58 Q562,424 584,1005 L16,1005 Q38,424 267,58 Z";
  /* la Sala Mappe (stessa forma di js/nave-mappe.js, spostata) */
  var M0 = [308 + DX, Y(44)], MC = [505 + DX, Y(285)], MB = [524 + DX, Y(650)];
  var DENTRO = "M" + (252 + DX) + "," + Y(44) + " Q" + (280 + DX) + "," + Y(22) + " " + M0
    + " Q" + MC + " " + MB + " L" + (36 + DX) + "," + Y(650) + " Q" + (55 + DX) + "," + Y(285) + " " + (252 + DX) + "," + Y(44) + " Z";
  var g;
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function p(d, f, s, sw, ex){ g.push('<path d="' + d + '" fill="' + (f || "none") + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  /* punto su una curva (P0, C, P2), specchiato a sinistra se lato < 0 */
  function bez(P0, C, P2, u, lato){
    var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, cc = u * u;
    var x = a * P0[0] + b * C[0] + cc * P2[0], y = a * P0[1] + b * C[1] + cc * P2[1];
    return [lato < 0 ? W - x : x, y];
  }
  function tratto(P0, C, P2, ua, ub, lato){
    var s = [];
    for(var i = 0; i <= 8; i++){ var q = bez(P0, C, P2, ua + (ub - ua) * i / 8, lato); s.push(q[0].toFixed(1) + "," + q[1].toFixed(1)); }
    return "M" + s.join(" L");
  }
  /* porta: un varco nella parete della Sala Mappe con i montanti in ottone */
  function porta(d, a, b){ p(d, "none", "#5e4329", 8); c(a[0].toFixed(1), a[1].toFixed(1), 4.5, "#c8a04a"); c(b[0].toFixed(1), b[1].toFixed(1), 4.5, "#c8a04a"); }

  function pianta(){
    g = [];
    var defs = '<defs><clipPath id="nxe-forma"><path d="' + FUORI + '"/></clipPath></defs>';
    /* tavolato del ponte, con le assi per il lungo */
    g.push('<g clip-path="url(#nxe-forma)">');
    g.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#5e4329"/>');
    for(var x = 4; x < W; x += 18) l(x, 0, x, H, "rgba(0,0,0,.28)", 1.5);
    for(var k = 0, y = 30; y < H; y += 74, k++) for(var x2 = 4 + (k % 4) * 18; x2 < W; x2 += 72) l(x2, y, x2 + 18, y, "rgba(0,0,0,.3)", 1.5);
    g.push('</g>');
    /* la Sala Mappe: la zona mancante del ponte */
    g.push('<g clip-path="url(#nxe-forma)">');
    p(DENTRO, "#1a130c", "#d2a85a", 5);
    g.push('</g>');
    g.push('<text x="300" y="' + Y(330) + '" fill="rgba(210,168,90,.45)" font-size="26" text-anchor="middle" letter-spacing="3">SALA MAPPE</text>');
    /* la porta in punta della Sala Mappe */
    porta("M" + (266 + DX) + "," + Y(33) + " L" + (294 + DX) + "," + Y(33), [266 + DX, Y(33)], [294 + DX, Y(33)]);
    /* parapetto: corrimano in legno con i montanti in ottone, lungo tutto il bordo del cono */
    p("M267,58 Q300,32 333,58 Q562,424 584,1005 M16,1005 Q38,424 267,58", "none", "#3a2412", 9);
    p("M267,58 Q300,32 333,58 Q562,424 584,1005 M16,1005 Q38,424 267,58", "none", "#9a6a34", 5);
    [1, -1].forEach(function(lato){
      for(var i = 0; i <= 22; i++){ var q = bez(T0, TC, TB, i / 22, lato); c(q[0].toFixed(1), q[1].toFixed(1), 4.5, "#c8a04a", "#5a3a18", 1); }
    });
    /* in fondo ai corridoi, la parete verso la Mensa */
    l(16, 1005, 584, 1005, "#d2a85a", 5);
    var t = '<text x="300" y="20" fill="#a39478" font-size="22" text-anchor="middle">▲ prua</text>'
      + '<text x="300" y="1036" fill="#a39478" font-size="22" text-anchor="middle">▼ poppa</text>';
    return '<svg class="sm-svg nxe-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ponte Esterno visto dall\'alto">' + defs + g.join("") + t + '</svg>';
  }
  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<div class="sm-h">⛵ Ponte Esterno</div>'
    + '<p class="sm-d">Il ponte all\'aperto sulla prua, con la vista libera sul cielo e sulle isole. Avvolge la Sala Mappe: davanti alla sua punta si apre in una piattaforma che si stringe fino alla prua, e ai suoi lati due corridoi stretti portano alle porte laterali. Tutto attorno corre il parapetto.</p>'
    + '<p class="stv-nota" style="margin-top:1rem">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
  NAVE.zona("ponte_esterno", { sinistra: sx, destra: dx, apri: function(){ sx.innerHTML = pianta(); } });
})();
