/* Esplora la nave › Stiva Primaria (js/nave-esplora.js).
   A sinistra la Stiva Primaria vista dall'alto: stesso perimetro della Stiva Modulare (un quadrato), con l'ascensore
   nello stesso punto. Niente stanze vere ai lati: sei piccoli magazzini per lato, stretti, con armadietti e scaffali,
   e al centro un ampio spazio di carico libero (un veicolo, un carico ingombrante, qualsiasi cosa).
   I magazzini seguono la stiva condivisa (js/stiva.js):
   - babordo: tonici base, tonici avanzati, piloni, nuclei d'attacco, nuclei di difesa (una boccetta, un pilone o una
     sfera per ogni pezzo in stiva) e gli oggetti vari (un oggetto per ogni riga scritta);
   - tribordo: quattro magazzini della dispensa (una cassa o un barile per ogni giorno di viveri) e due per le parti
     di mostro (un fagotto per ogni parte nel deposito, del colore della sua rarità).
   Se è segnato dell'equipaggiamento grande, nello spazio di carico compare un carico coperto da un telo.
   Toccando un magazzino si apre la sua sezione a destra.
   A destra: la stiva condivisa (strumenti, parti di mostro, oggetti vari, dispensa), portata qui da js/stiva.js. */
(function(){
  "use strict";
  if(!window.NAVE || !window.STV) return;
  var S = window.STV, esc = S.disegno.esc;
  var L = 660, D = 110, R = 110, ASC_Y = 495;
  var WOOD = "#2a1d12", WALL = "#a87c3c";
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R_, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R_ + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function caso(i){ var h = Math.imul((i + 1) ^ 0x5bd1e995, 2654435761) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }

  /* i dodici magazzini: lato (0 babordo, 1 tribordo), posizione dall'alto, cosa contengono, sezione della stiva a destra */
  var MAG = [
    { lato: 0, i: 0, t: "base",  n: "Tonici base",      e: "🧪", s: "str" },
    { lato: 0, i: 1, t: "avanzati", n: "Tonici avanzati", e: "⚗️", s: "str" },
    { lato: 0, i: 2, t: "piloni", n: "Piloni",           e: "🗼", s: "str" },
    { lato: 0, i: 3, t: "att",   n: "Nuclei d'attacco", e: "⚔️", s: "str" },
    { lato: 0, i: 4, t: "def",   n: "Nuclei di difesa", e: "🛡️", s: "str" },
    { lato: 0, i: 5, t: "vari",  n: "Oggetti vari",     e: "📦", s: "var" },
    { lato: 1, i: 0, t: "disp", k: 0, n: "Dispensa",    e: "🍞", s: "dis" },
    { lato: 1, i: 1, t: "disp", k: 1, n: "Dispensa",    e: "🍞", s: "dis" },
    { lato: 1, i: 2, t: "disp", k: 2, n: "Dispensa",    e: "🍞", s: "dis" },
    { lato: 1, i: 3, t: "disp", k: 3, n: "Dispensa",    e: "🍞", s: "dis" },
    { lato: 1, i: 4, t: "parti", k: 0, n: "Parti di mostro", e: "🦴", s: "par" },
    { lato: 1, i: 5, t: "parti", k: 1, n: "Parti di mostro", e: "🦴", s: "par" }
  ];
  var POSTI = 20;                                         /* casse, barili o fagotti per magazzino: 4 file da 5, lasciando libero il passaggio verso la porta */

  /* ---------- quello che c'è dentro (coordinate del magazzino: parete esterna a x = 0, porta a x = D) ---------- */
  function scaffali(righe){                               /* righe: [{ n: quanti, f: function(x, y) }] */
    var h = (R - 14) / righe.length;
    righe.forEach(function(q, k){
      var y = 7 + k * h;
      r(6, y + 2, 74, h - 4, "#3d2614", "#5a3d22", 1.5, 2);
      for(var j = 0; j < Math.min(q.n, 7); j++) q.f(14 + j * 10, y + h / 2);
    });
  }
  function boccetta(col){ return function(x, y){ c(x, y, 4.2, col, "rgba(0,0,0,.45)", 1); c(x - 1.3, y - 1.3, 1.3, "rgba(255,255,255,.55)"); }; }
  function pilone(col){ return function(x, y){ r(x - 4.5, y - 4.5, 9, 9, "#2a2f36", "#7a6a4a", 1, 1.5); c(x, y, 2.4, col); }; }
  function sfera(col){ return function(x, y){ c(x, y, 5.5, col, "", 0, 'opacity=".25"'); c(x, y, 3.8, col, "rgba(255,255,255,.4)", .8); }; }
  function cassa(x, y, s){ r(x, y, s, s, "#9a6a38", "#4a2c13", 1.5); l(x, y, x + s, y + s, "#4a2c13", 1.2); l(x + s, y, x, y + s, "#4a2c13", 1.2); }
  function barile(x, y, R_){ c(x, y, R_, "#704626", "#3a2614", 1.5); c(x, y, R_ - 3.5, "none", "#8d8d8d", 1); }
  function posto(j){ return [8 + Math.floor(j / 5) * 18, 8 + (j % 5) * 19]; }     /* file parallele alla parete esterna */
  function dispensa(quanti, base){
    for(var j = 0; j < quanti; j++){ var p = posto(j), k = caso(base + j); if(k % 5 < 3) barile(p[0] + 8, p[1] + 8, 8); else cassa(p[0], p[1], 16); }
  }
  var RAR = { Comune: "#b8a888", Raro: "#6aa8e8", Epico: "#b888ec" };
  function parti(lista){
    lista.forEach(function(col, j){
      var p = posto(j), x = p[0] + 8, y = p[1] + 8;
      if(caso(j + 77) % 3){ r(x - 7, y - 6, 14, 12, "#5a4228", "#2a1a0a", 1.2, 5); c(x, y, 3, col); l(x - 7, y - 2, x + 7, y - 2, "#2a1a0a", 1); }   /* fagotto legato */
      else { l(x - 6, y - 5, x + 6, y + 5, col, 3); c(x - 6, y - 5, 2.6, col); c(x + 6, y + 5, 2.6, col); }                                   /* osso */
    });
  }
  var VARI = [
    function(x, y){ c(x, y, 7, "#8a7a5a", "#4a3a22", 1.2); c(x, y, 3.5, "none", "#4a3a22", 1); },                                 /* rotolo di corda */
    function(x, y){ r(x - 5, y - 5, 10, 10, "#3a3026", "#8a6a3a", 1.2, 2); c(x, y, 2.6, "#ffd27a"); },                              /* lanterna */
    function(x, y){ r(x - 8, y - 5, 16, 10, "#7a3a2a", "#3a1a12", 1.2, 1.5); l(x - 3, y - 5, x + 3, y - 5, "#c8a04a", 2); },        /* cassetta degli attrezzi */
    function(x, y){ r(x - 8, y - 6, 16, 12, "#5a3d22", "#2a1a0a", 1.2, 2); l(x - 8, y, x + 8, y, "#c8a04a", 1.5); },                /* bauletto */
    function(x, y){ r(x - 6, y - 7, 12, 14, "#a08a6a", "#5a4a32", 1.2, 5); l(x - 4, y - 4, x + 4, y - 4, "#5a4a32", 1); }           /* sacco */
  ];
  function vari(n){
    r(6, 6, 72, 12, "#3d2614", "#5a3d22", 1.5, 2); r(6, R - 18, 72, 12, "#3d2614", "#5a3d22", 1.5, 2);    /* due mensole */
    for(var j = 0; j < Math.min(n, 12); j++){ var x = 16 + (j % 4) * 19, y = 32 + Math.floor(j / 4) * 22; VARI[caso(j + 31) % VARI.length](x, y); }
  }
  function arreda(m, d){
    if(m.t === "base" || m.t === "avanzati" || m.t === "piloni"){
      var gr = m.t === "piloni" ? "piloni" : m.t;
      scaffali(S.IT.filter(function(x){ return x.g === gr; }).map(function(x){ return { n: S.q(x.id), f: x.k === "p" ? pilone(x.c) : boccetta(x.c) }; }));
    } else if(m.t === "att" || m.t === "def"){
      scaffali(S.EL.map(function(e){ return { n: S.q(S.nid(m.t, e.id)), f: sfera(e.c) }; }));
    } else if(m.t === "vari"){
      vari(String(d.vari || "").split("\n").filter(function(x){ return x.trim(); }).length);
    } else if(m.t === "disp"){
      var tot = Math.max(0, d.disp | 0), qui = Math.max(0, Math.min(POSTI, tot - m.k * POSTI));
      dispensa(qui, m.k * POSTI);
    } else if(m.t === "parti"){
      var tutte = [];
      (d.parti || []).forEach(function(p){ for(var q = 0; q < (p.q | 0); q++) tutte.push(RAR[p.r] || RAR.Comune); });
      parti(tutte.slice(m.k * POSTI, (m.k + 1) * POSTI));
    }
  }
  function oltre(m, d){                                   /* quanti pezzi non ci stanno più nell'ultimo magazzino del tipo */
    if(m.t === "disp" && m.k === 3) return Math.max(0, (d.disp | 0) - 4 * POSTI);
    if(m.t === "parti" && m.k === 1){ var n = 0; (d.parti || []).forEach(function(p){ n += p.q | 0; }); return Math.max(0, n - 2 * POSTI); }
    return 0;
  }

  /* ---------- la pianta ---------- */
  var sel = null;
  function pianta(){
    var d = S.doc() || {};
    g = [];
    r(0, 0, L, L, WOOD); for(var i = 1; i < L / 22; i++) l(i * 22, 2, i * 22, L - 2, "rgba(0,0,0,.18)");
    /* spazio di carico centrale */
    r(D, 0, L - 2 * D, L, "#2e2014");
    r(D + 34, 34, L - 2 * D - 68, 360, "none", "rgba(210,168,90,.28)", 2, 6, 'stroke-dasharray="10 8"');
    [[D + 22, 22], [L - D - 22, 22], [D + 22, 406], [L - D - 22, 406]].forEach(function(q){ c(q[0], q[1], 5, "none", "#8d8d8d", 2); });   /* anelli d'ancoraggio */
    if(String(d.grande || "").trim()){
      var cx = L / 2, cy = 214;
      r(cx - 120, cy - 90, 240, 180, "#6b5a3e", "#3a2c18", 2.5, 18);
      r(cx - 108, cy - 78, 216, 156, "none", "rgba(0,0,0,.18)", 2, 14);
      l(cx - 120, cy - 40, cx + 120, cy - 40, "#c8b088", 3); l(cx - 120, cy + 40, cx + 120, cy + 40, "#c8b088", 3);
      l(cx - 40, cy - 90, cx - 40, cy + 90, "#c8b088", 3); l(cx + 40, cy - 90, cx + 40, cy + 90, "#c8b088", 3);
      [[D + 22, 22], [L - D - 22, 22], [D + 22, 406], [L - D - 22, 406]].forEach(function(q){ l(q[0], q[1], cx + (q[0] < cx ? -112 : 112), cy + (q[1] < cy ? -82 : 82), "#c8b088", 1.5); });
    }
    /* ascensore, dove arriva dalla Stiva Modulare */
    r(L / 2 - 34, ASC_Y - 34, 68, 68, "#0c0907", "#ecc77e", 2);
    var sopra = '<text x="' + (L / 2) + '" y="' + (ASC_Y + 9) + '" fill="#ecc77e" font-size="24" text-anchor="middle">⇅</text>';
    /* magazzini */
    MAG.forEach(function(m){
      var x = m.lato ? L - D : 0, y = m.i * R;
      r(x, y, D, R, WOOD);
      g.push('<g transform="translate(' + x + ',' + y + ')' + (m.lato ? ' translate(' + D + ',0) scale(-1,1)' : '') + '">');
      arreda(m, d);
      g.push('</g>');
      r(x + 1.5, y + 1.5, D - 3, R - 3, "none", WALL, 3);
      var px = m.lato ? x : x + D; l(px, y + R / 2 - 16, px, y + R / 2 + 16, "#2e2014", 7);   /* porta sullo spazio centrale */
      var ex = m.lato ? x + 16 : x + D - 16, ey = y + 16, piu = oltre(m, d);
      sopra += '<g class="sm-etq"><circle cx="' + ex + '" cy="' + ey + '" r="12" fill="rgba(12,9,7,.82)" stroke="rgba(210,168,90,.55)" stroke-width="1.5"/>'
        + '<text x="' + ex + '" y="' + (ey + 5) + '" font-size="13" text-anchor="middle">' + m.e + '</text></g>'
        + (piu ? '<text x="' + (x + D / 2) + '" y="' + (y + R - 8) + '" fill="#ecc77e" font-size="13" text-anchor="middle" font-weight="bold">+' + piu + '</text>' : '');
    });
    r(0, 0, L, L, "none", "#d2a85a", 5);
    /* zone da toccare */
    var z = MAG.map(function(m, k){
      var x = m.lato ? L - D : 0, y = m.i * R;
      return '<rect class="sm-hit' + (sel === k ? " on" : "") + '" data-m="' + k + '" x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (D - 6) + '" height="' + (R - 6) + '" rx="4" tabindex="0" role="button" aria-label="' + esc(m.n) + '"><title>' + esc(m.n) + '</title></rect>';
    }).join("");
    return '<svg class="sm-svg nxst-svg" viewBox="-6 -6 ' + (L + 12) + ' ' + (L + 12) + '" role="img" aria-label="Stiva Primaria vista dall\'alto">' + g.join("") + sopra + z + '</svg>';
  }

  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<p class="stv-nota sm-intro">Sei magazzini per lato, con armadietti, scaffali e le casse tenute lungo le pareti; al centro un ampio spazio di carico libero. Toccate un magazzino per aprire la sua parte della stiva.</p>'
    + '<div class="nxst-stiva"></div>';
  var dentro = false;
  function disegna(){ if(dentro) sx.innerHTML = pianta(); }
  function scegli(k){
    var m = MAG[k]; if(!m) return;
    sel = k; disegna(); S.sezione(m.s);
    if(window.matchMedia && matchMedia("(max-width:860px)").matches) try { dx.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(e){}
  }
  sx.addEventListener("click", function(e){ var h = e.target.closest("[data-m]"); if(h) scegli(+h.getAttribute("data-m")); });
  sx.addEventListener("keydown", function(e){ if((e.key === "Enter" || e.key === " ") && e.target.getAttribute && e.target.hasAttribute("data-m")){ e.preventDefault(); scegli(+e.target.getAttribute("data-m")); } });
  S.on(disegna);
  S.nave = true;
  NAVE.zona("stiva_primaria", {
    sinistra: sx, destra: dx,
    apri: function(){ dentro = true; sel = null; disegna(); S.stanzaMonta(dx.querySelector(".nxst-stiva")); },
    chiudi: function(){ dentro = false; S.stanzaSmonta(); }
  });
})();
