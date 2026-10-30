/* Esplora la nave › Stiva Primaria (js/nave-esplora.js).
   A sinistra la Stiva Primaria vista dall'alto, solo decorativa: stesso perimetro della Stiva Modulare (un quadrato),
   con l'ascensore nello stesso punto. Ai lati sei piccoli magazzini per lato, stretti, ognuno con la porta sullo spazio
   centrale: armadietti, scaffali con scatole e vasi, casse e barili accatastati lungo le pareti, sacchi e rotoli di corda.
   Al centro un ampio spazio di carico libero, con gli anelli d'ancoraggio sul pavimento.
   A destra: la stiva condivisa (strumenti, parti di mostro, oggetti vari, dispensa), portata qui da js/stiva.js. */
(function(){
  "use strict";
  if(!window.NAVE || !window.STV) return;
  var S = window.STV;
  var L = 660, D = 110, R = 110, ASC_Y = 495;
  var WOOD = "#2a1d12", WALL = "#a87c3c";
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R_, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R_ + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function caso(i){ var h = Math.imul((i + 1) ^ 0x5bd1e995, 2654435761) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }

  /* ---------- l'arredo dei magazzini (coordinate del magazzino: parete esterna a x = 0, porta a x = D) ---------- */
  function cassa(x, y, s){ r(x, y, s, s, "#9a6a38", "#4a2c13", 1.5); l(x, y, x + s, y + s, "#4a2c13", 1.2); l(x + s, y, x, y + s, "#4a2c13", 1.2); }
  function barile(x, y, R_){ c(x, y, R_, "#704626", "#3a2614", 1.5); c(x, y, R_ - 3.5, "none", "#8d8d8d", 1); }
  function sacco(x, y){ r(x - 7, y - 8, 14, 16, "#a08a6a", "#5a4a32", 1.2, 6); l(x - 4, y - 5, x + 4, y - 5, "#5a4a32", 1); }
  function corda(x, y){ c(x, y, 9, "#8a7a5a", "#4a3a22", 1.2); c(x, y, 5.5, "none", "#4a3a22", 1); c(x, y, 2.5, "#4a3a22"); }
  /* armadietti contro la parete esterna, con le ante e le maniglie, e una panca davanti */
  function armadietti(){
    for(var k = 0; k < 4; k++){ var y = 7 + k * 24; r(4, y, 30, 22, "#4a3a2a", "#2a1e14", 1.5, 1.5); l(19, y + 2, 19, y + 20, "#2a1e14", 1); c(16, y + 11, 1.4, "#c8a04a"); c(22, y + 11, 1.4, "#c8a04a"); }
    r(44, 26, 12, 58, "#5a3d22", "#3a2614", 1.5, 2);
  }
  /* scaffali con scatole, vasi e bottiglie dai colori neutri */
  function scaffali(seme){
    var C = ["#8a7a5a", "#6a5a44", "#9a8a6a", "#5a4a3a", "#7a6a50"];
    for(var k = 0; k < 4; k++){
      var y = 7 + k * 24;
      r(6, y, 72, 20, "#3d2614", "#5a3d22", 1.5, 2);
      for(var j = 0, x = 10; x < 72; j++){
        var q = caso(seme * 31 + k * 7 + j), t = q % 3;
        if(t === 0){ r(x, y + 4, 12, 12, C[q % 5], "rgba(0,0,0,.4)", 1, 1); x += 15; }
        else if(t === 1){ c(x + 5, y + 10, 4.5, C[(q >> 3) % 5], "rgba(0,0,0,.4)", 1); x += 12; }
        else { c(x + 3, y + 10, 3, "#5a6a5a", "rgba(0,0,0,.4)", 1); x += 8; }
      }
    }
  }
  /* casse e barili accatastati lungo le pareti, con il passaggio libero davanti alla porta */
  function cataste(seme){
    for(var j = 0; j < 16; j++){
      var x = 8 + Math.floor(j / 4) * 18, y = 6 + (j % 4) * 19 + (j % 4 > 1 ? 20 : 0), q = caso(seme * 13 + j);
      if(Math.floor(j / 4) === 3 && q % 2) continue;                       /* la fila verso la porta è più rada */
      if(q % 5 < 3) barile(x + 8, y + 8, 8); else cassa(x, y, 16);
    }
  }
  /* sacchi e rotoli di corda, con una cassa grande */
  function sacchi(seme){
    for(var j = 0; j < 8; j++){ var x = 12 + (j % 4) * 16, y = 14 + Math.floor(j / 4) * 20; sacco(x, y); }
    corda(20, 72); corda(42, 86); cassa(54, 60, 26);
  }
  var ARREDO = [armadietti, scaffali, cataste, scaffali, cataste, sacchi,  cataste, armadietti, scaffali, cataste, sacchi, scaffali];

  /* ---------- la pianta ---------- */
  function pianta(){
    g = [];
    r(0, 0, L, L, WOOD); for(var i = 1; i < L / 22; i++) l(i * 22, 2, i * 22, L - 2, "rgba(0,0,0,.18)");
    /* spazio di carico centrale, con gli anelli d'ancoraggio */
    r(D, 0, L - 2 * D, L, "#2e2014");
    for(var k = 0; k < 3; k++) [D + 26, L - D - 26].forEach(function(x){ c(x, 60 + k * 150, 5, "none", "#8d8d8d", 2); });
    /* ascensore, dove arriva dalla Stiva Modulare */
    r(L / 2 - 34, ASC_Y - 34, 68, 68, "#0c0907", "#ecc77e", 2);
    var sopra = '<text x="' + (L / 2) + '" y="' + (ASC_Y + 9) + '" fill="#ecc77e" font-size="24" text-anchor="middle">⇅</text>';
    /* sei magazzini per lato */
    for(var m = 0; m < 12; m++){
      var lato = m >= 6 ? 1 : 0, x = lato ? L - D : 0, y = (m % 6) * R;
      r(x, y, D, R, WOOD);
      g.push('<g transform="translate(' + x + ',' + y + ')' + (lato ? ' translate(' + D + ',0) scale(-1,1)' : '') + '">');
      ARREDO[m](m + 1);
      g.push('</g>');
      r(x + 1.5, y + 1.5, D - 3, R - 3, "none", WALL, 3);
      var px = lato ? x : x + D; l(px, y + R / 2 - 16, px, y + R / 2 + 16, "#2e2014", 7);   /* porta sullo spazio centrale */
    }
    r(0, 0, L, L, "none", "#d2a85a", 5);
    return '<svg class="sm-svg nxst-svg" viewBox="-6 -6 ' + (L + 12) + ' ' + (L + 12) + '" role="img" aria-label="Stiva Primaria vista dall\'alto">' + g.join("") + sopra + '</svg>';
  }

  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<p class="stv-nota sm-intro">Sei magazzini stretti per lato, con armadietti, scaffali e le casse tenute lungo le pareti; al centro un ampio spazio di carico libero.</p>'
    + '<div class="nxst-stiva"></div>';
  S.nave = true;
  NAVE.zona("stiva_primaria", {
    sinistra: sx, destra: dx,
    apri: function(){ sx.innerHTML = pianta(); S.stanzaMonta(dx.querySelector(".nxst-stiva")); },
    chiudi: function(){ S.stanzaSmonta(); }
  });
})();
