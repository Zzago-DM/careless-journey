/* Esplora la nave › Sala Mappe (js/nave-esplora.js).
   A sinistra la Sala Mappe vista dall'alto: una forma a cono allungata, stretta verso prua e larga verso poppa, con i lati curvi
   come il Ponte di Comando. Verso la metà un grande tavolo circolare da dodici posti con un buco al centro, dove gira
   un globo azzurro con i dettagli in oro.
   A destra, per ora: la descrizione della Sala Mappe. */
(function(){
  "use strict";
  if(!window.NAVE) return;
  var W = 560, H = 682, CX = 280, CY = 315, SCALA = .7;
  var FORMA = "M252,44 Q280,22 308,44 Q505,285 524,650 L36,650 Q55,285 252,44 Z";
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function p(d, f, s, sw, ex){ g.push('<path d="' + d + '" fill="' + (f || "none") + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  var ORO = "rgba(214,172,84,", ORO_P = "#d6ac54";
  function rosa(x, y, R){
    c(x, y, R, "none", ORO + ".5)", 1.5); c(x, y, R * .7, "none", ORO + ".3)", 1);
    p("M" + x + "," + (y - R) + " L" + (x + R * .14) + "," + y + " L" + x + "," + (y + R) + " L" + (x - R * .14) + "," + y + " Z", ORO + ".55)");
    p("M" + (x - R) + "," + y + " L" + x + "," + (y - R * .14) + " L" + (x + R) + "," + y + " L" + x + "," + (y + R * .14) + " Z", ORO + ".4)");
    var d = R * .6;
    p("M" + (x - d) + "," + (y - d) + " L" + (x + R * .08) + "," + (y - R * .08) + " L" + (x + d) + "," + (y + d) + " L" + (x - R * .08) + "," + (y + R * .08) + " Z", ORO + ".25)");
    p("M" + (x + d) + "," + (y - d) + " L" + (x + R * .08) + "," + (y + R * .08) + " L" + (x - d) + "," + (y + d) + " L" + (x - R * .08) + "," + (y - R * .08) + " Z", ORO + ".25)");
  }
  function costellazione(punti){
    for(var i = 1; i < punti.length; i++) l(punti[i - 1][0], punti[i - 1][1], punti[i][0], punti[i][1], ORO + ".35)", 1, 'stroke-dasharray="3 4"');
    punti.forEach(function(q, i){ c(q[0], q[1], i % 2 ? 2 : 3, ORO + ".75)"); });
  }
  function seduta(x, y, rot){
    g.push('<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">');
    r(-11, -10, 22, 20, "#5a3d22", "#3a2614", 1.5, 5); r(-11, 7, 22, 6, "#4a2c13", "", 0, 3);
    g.push('</g>');
  }
  function pianta(){
    g = [];
    var defs = '<defs><clipPath id="nxs-forma"><path d="' + FORMA + '"/></clipPath>'
      + '<radialGradient id="nxs-globo" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#bfe8ff"/><stop offset=".45" stop-color="#3f8fd0"/><stop offset="1" stop-color="#12345a"/></radialGradient></defs>';
    g.push('<g clip-path="url(#nxs-forma)">');
    r(0, 0, W, H, "#2f2013"); for(var i = 0; i < W; i += 20) l(i, 0, i, H, "rgba(0,0,0,.2)", 1);
    g.push('</g>');
    /* tavolo, sedute e globo, rimpiccioliti tutti insieme attorno al centro del tavolo */
    g.push('<g transform="translate(' + CX + ',' + CY + ') scale(' + SCALA + ') translate(' + (-CX) + ',' + (-CY) + ')">');
    /* dodici sedute attorno al tavolo */
    for(var s = 0; s < 12; s++){ var an = s * Math.PI / 6 + Math.PI / 12; seduta(CX + Math.cos(an) * 134, CY + Math.sin(an) * 134, an * 180 / Math.PI + 90); }
    /* tavolo circolare con il buco al centro */
    /* corona del tavolo: stesso bordo esterno, spessore ridotto del 30% (il buco centrale è più largo) */
    c(CX, CY, 112, "#5a3a20", "#2a1a0a", 3);
    c(CX, CY, 104, "none", ORO_P, 1.5, 'opacity=".7"');
    c(CX, CY, 71, "#0c0907", "#2a1a0a", 3);
    c(CX, CY, 77, "none", ORO_P, 1.5, 'opacity=".7"');
    /* due strumenti di navigazione sul tavolo */
    [150, 318].forEach(function(gr){ var an = gr * Math.PI / 180, x = CX + Math.cos(an) * 91, y = CY + Math.sin(an) * 91; c(x, y, 7, "none", "#c8a04a", 2); l(x - 7, y, x + 7, y, "#c8a04a", 1); l(x, y - 7, x, y + 7, "#c8a04a", 1); });
    /* il globo azzurro con i dettagli in oro (ridotto del 30%) */
    g.push('<g transform="translate(' + CX + ',' + CY + ') scale(.7) translate(' + (-CX) + ',' + (-CY) + ')">');
    c(CX, CY, 48, "none", ORO_P, 3);
    c(CX, CY, 40, "url(#nxs-globo)", "#0c2440", 1.5);
    g.push('<g class="nxs-meridiani">');
    [10, 22, 32].forEach(function(rx){ g.push('<ellipse cx="' + CX + '" cy="' + CY + '" rx="' + rx + '" ry="40" fill="none" stroke="' + ORO_P + '" stroke-width="1.2" opacity=".85"/>'); });
    g.push('</g>');
    l(CX - 40, CY, CX + 40, CY, ORO_P, 1.5);
    g.push('<ellipse cx="' + CX + '" cy="' + (CY - 20) + '" rx="34" ry="5" fill="none" stroke="' + ORO_P + '" stroke-width="1" opacity=".7"/><ellipse cx="' + CX + '" cy="' + (CY + 20) + '" rx="34" ry="5" fill="none" stroke="' + ORO_P + '" stroke-width="1" opacity=".7"/>');
    p("M" + (CX - 14) + "," + (CY - 16) + " q8,-6 14,2 q4,8 -4,12 q-10,2 -10,-14 Z", "rgba(120,190,110,.7)"); p("M" + (CX + 8) + "," + (CY + 4) + " q10,-4 14,6 q-2,10 -12,6 Z", "rgba(120,190,110,.7)");
    c(CX - 13, CY - 14, 7, "rgba(255,255,255,.35)");
    [[0, -48], [48, 0], [0, 48], [-48, 0]].forEach(function(q){ c(CX + q[0], CY + q[1], 3.5, ORO_P, "#6a4a20", 1); });
    g.push('</g>');
    g.push('</g>');
    /* passaggi: verso il Ponte Esterno (punta), verso la Mensa (in fondo), la scala del Ponte di Comando e il boccaporto per la Sala Macchine */
    r(452, 600, 50, 40, "#2a1a0a", "#7a5a3a", 1.5); for(var z = 1; z < 5; z++) l(454, 600 + z * 8, 500, 600 + z * 8, "#8a6a3a", 2);
    r(60, 606, 42, 34, "#1a120a", "#7a5a3a", 2, 3); l(60, 623, 102, 623, "#7a5a3a", 1.5); c(81, 614, 3, "#c8a04a");
    p(FORMA, "none", "#d2a85a", 5);
    l(266, 30, 294, 30, "#2f2013", 7); l(250, 650, 310, 650, "#2f2013", 8);
    var t = '<text x="280" y="18" fill="#a39478" font-size="22" text-anchor="middle">▲ verso il Ponte Esterno</text>'
      + '<text x="280" y="676" fill="#a39478" font-size="22" text-anchor="middle">▼ verso la Mensa</text>';
    return '<svg class="sm-svg nxs-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sala Mappe vista dall\'alto">' + defs + g.join("") + t + '</svg>';
  }
  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<div class="sm-h">🗺️ Sala Mappe</div>'
    + '<p class="sm-d">Il cuore operativo della nave, sotto il Ponte di Comando. Al centro un grande tavolo circolare da dodici posti; nel buco al centro del tavolo gira un globo azzurro con i dettagli in oro.</p>'
    + '<p class="sm-d">In punta si esce verso il Ponte Esterno, in fondo si va verso la Mensa; una scala sale al Ponte di Comando e un boccaporto scende alla Sala Macchine.</p>'
    + '<p class="stv-nota" style="margin-top:1rem">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
  NAVE.zona("sala_mappe", { sinistra: sx, destra: dx, apri: function(){ sx.innerHTML = pianta(); } });
})();
