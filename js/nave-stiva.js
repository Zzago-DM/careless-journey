/* Esplora la nave › Stiva Primaria (js/nave-esplora.js).
   A sinistra la Stiva Primaria vista dall'alto: stesso perimetro della Stiva Modulare (un quadrato), con l'ascensore nello
   stesso punto. Ai lati sei piccoli magazzini per lato, stretti, ognuno con la porta sullo spazio centrale; al centro un
   ampio spazio di carico, con gli anelli d'ancoraggio sul pavimento. Niente simboli: solo oggetti.
   - I 3 magazzini per lato verso prua (in alto) sono l'EQUIPAGGIAMENTO degli Slayer: rastrelliere d'armi, armature,
     parti di mostro, scaffali, armadietti, cataste. Sono sempre pieni.
   - I 3 magazzini per lato vicini all'ascensore sono i VIVERI: seguono la dispensa della stiva condivisa (js/stiva.js),
     un pezzo (cassa, barile o sacco) per ogni giorno, 8 per magazzino, 48 in tutto. Si riempiono partendo dai due
     accanto all'ascensore, alternando i lati, un magazzino alla volta. A dispensa vuota sono vuoti.
   - Dal 49° al 60° giorno i viveri non entrano più nei magazzini e si ammucchiano ai lati dello spazio centrale.
   - Oltre i 60 giorni finiscono nelle Stive aggiuntive della Stiva Modulare (js/stiva-modulare.js); i giorni «di troppo»
     non si disegnano.
   A destra: la stiva condivisa (strumenti, parti di mostro, oggetti vari, dispensa), portata qui da js/stiva.js. */
(function(){
  "use strict";
  if(!window.NAVE || !window.STV) return;
  var S = window.STV;
  var L = 660, D = 110, R = 110, ASC_Y = 495;
  var WOOD = "#2a1d12", WALL = "#a87c3c";
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function p(d){ g.push(d); }
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
  /* rastrelliera d'armi: spade, lance e asce appese alla parete, e un banco */
  function armi(){
    r(5, 6, 8, 98, "#3d2614", "#5a3d22", 1.5, 1);
    [[14, "#b8c0c8", 34], [26, "#9aa6b2", 44], [38, "#c0ccd8", 30], [50, "#a8b4c0", 40]].forEach(function(q, i){
      var y = 10 + i * 24; l(14, y + 6, 14 + q[2], y + 6, q[1], 3); r(10, y + 2, 6, 8, "#5a3d22", "", 0, 1);      /* lama e impugnatura */
    });
    l(64, 12, 64, 98, "#6a4526", 3); c(64, 12, 4, "#c0ccd8");                                                         /* lancia */
    r(72, 70, 28, 30, "#5a3d22", "#3a2614", 1.5, 2); c(86, 85, 5, "#9aa6b2");
  }
  /* armature sui manichini, viste dall'alto: spallacci, elmo, e un baule */
  function armature(){
    [[24, 26], [24, 76]].forEach(function(q){
      p('<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="16" ry="11" fill="#4a5058" stroke="#9aa6b2" stroke-width="1.5"/>');
      c(q[0], q[1], 7, "#6a7682", "#c0ccd8", 1.2);
    });
    r(52, 10, 22, 40, "#4a3a2a", "#2a1e14", 1.5, 2); l(52, 30, 74, 30, "#c8a04a", 1.5);
    r(52, 62, 40, 30, "#5a3d22", "#3a2614", 1.5, 2); l(52, 70, 92, 70, "#3a2614", 1.5);
  }
  /* parti di mostro: corna, zanne, piastre di corazza e pelli arrotolate */
  function partiMostro(seme){
    p('<path d="M8 14 q22 -6 34 14 q-14 -6 -30 2 z" fill="#d8ccb0" stroke="#6a5a3a" stroke-width="1.2"/>');
    p('<path d="M8 40 q26 2 30 24 q-12 -12 -28 -12 z" fill="#c8b890" stroke="#6a5a3a" stroke-width="1.2"/>');
    for(var j = 0; j < 3; j++){ var q = caso(seme * 17 + j); p('<polygon points="' + (52 + j * 16) + ',12 ' + (64 + j * 16) + ',16 ' + (60 + j * 16) + ',30 ' + (48 + j * 16) + ',26" fill="' + ["#4a5a6a", "#6a3a3a", "#3a5a4a"][q % 3] + '" stroke="rgba(0,0,0,.45)" stroke-width="1"/>'); }
    r(10, 74, 46, 14, "#7a5a3a", "#3a2614", 1.2, 7); r(10, 90, 46, 14, "#6a4a30", "#3a2614", 1.2, 7);
    p('<path d="M66 60 l14 -6 l10 10 l-4 16 l-16 4 z" fill="#5a4a6a" stroke="#2a1e2a" stroke-width="1.2"/>');
  }
  /* i magazzini dell'equipaggiamento, sempre pieni (righe 0–2: 0–2 a sinistra, 6–8 a destra) */
  var EQUIP = { 0: armi, 1: scaffali, 2: partiMostro, 6: armadietti, 7: armature, 8: cataste };

  /* ---------- i viveri ---------- */
  var ORDINE = [4, 10, 5, 11, 3, 9];          /* magazzini dei viveri, dal più vicino all'ascensore */
  var PER_MAG = 8, IN_MAG = ORDINE.length * PER_MAG, BASE = 60;
  var POSTI_MAG = [[16, 18], [42, 18], [16, 43], [42, 43], [16, 68], [42, 68], [16, 93], [42, 93]];   /* lontano dalla porta */
  /* ai lati dello spazio centrale, lontano dalle porte dei magazzini: 6 per lato */
  var POSTI_CENTRO = [];
  [338, 432, 548].forEach(function(y){ [0, 1].forEach(function(col){ [0, 1].forEach(function(lato){ POSTI_CENTRO.push([lato ? L - D - 18 - col * 25 : D + 18 + col * 25, y]); }); }); });
  function pezzo(x, y, i, nuovo){
    var q = caso(i * 7 + 3) % 6;
    g.push('<g class="nxst-v' + (nuovo ? " nuovo" : "") + '" style="--d:' + (nuovo ? Math.min(600, nuovo * 60) : 0) + 'ms">');
    if(q < 3) cassa(x - 10, y - 10, 20); else if(q < 5) barile(x, y, 10); else { r(x - 9, y - 10, 18, 20, "#c8b48a", "#6a5a3a", 1.2, 7); l(x - 5, y - 6, x + 5, y - 6, "#6a5a3a", 1.2); }
    g.push('</g>');
  }
  var giaVisti = null;
  function quanti(){
    var d = S.doc(), n = parseInt(d.disp, 10) || 0, cap = S.capienza ? S.capienza(d).tot : BASE;
    return Math.max(0, Math.min(n, cap, BASE));
  }
  /* ---------- la pianta ---------- */
  function pianta(){
    g = [];
    r(0, 0, L, L, WOOD); for(var i = 1; i < L / 22; i++) l(i * 22, 2, i * 22, L - 2, "rgba(0,0,0,.18)");
    /* spazio di carico centrale, con gli anelli d'ancoraggio */
    r(D, 0, L - 2 * D, L, "#2e2014");
    for(var k = 0; k < 3; k++) [D + 26, L - D - 26].forEach(function(x){ c(x, 50 + k * 120, 5, "none", "#8d8d8d", 2); });
    /* ascensore, dove arriva dalla Stiva Modulare */
    r(L / 2 - 34, ASC_Y - 34, 68, 68, "#0c0907", "#ecc77e", 2);
    var sopra = '<text x="' + (L / 2) + '" y="' + (ASC_Y + 9) + '" fill="#ecc77e" font-size="24" text-anchor="middle">⇅</text>';
    /* sei magazzini per lato: arredo dell'equipaggiamento (sempre pieno) o viveri */
    var n = quanti(), prima = giaVisti == null ? n : giaVisti; giaVisti = n;
    for(var m = 0; m < 12; m++){
      var lato = m >= 6 ? 1 : 0, x = lato ? L - D : 0, y = (m % 6) * R;
      r(x, y, D, R, WOOD);
      g.push('<g transform="translate(' + x + ',' + y + ')' + (lato ? ' translate(' + D + ',0) scale(-1,1)' : '') + '">');
      if(EQUIP[m]) EQUIP[m](m + 1);
      else {
        var o = ORDINE.indexOf(m);
        for(var j = 0; j < PER_MAG; j++){ var i = o * PER_MAG + j; if(i < n) pezzo(POSTI_MAG[j][0], POSTI_MAG[j][1], i, i >= prima ? i - prima + 1 : 0); }
      }
      g.push('</g>');
      r(x + 1.5, y + 1.5, D - 3, R - 3, "none", WALL, 3);
      var px = lato ? x : x + D; l(px, y + R / 2 - 16, px, y + R / 2 + 16, "#2e2014", 7);   /* porta sullo spazio centrale */
    }
    /* dal 49° giorno: ai lati dello spazio centrale */
    for(var e = IN_MAG; e < n; e++){ var q = POSTI_CENTRO[e - IN_MAG]; pezzo(q[0], q[1], e, e >= prima ? e - prima + 1 : 0); }
    r(0, 0, L, L, "none", "#d2a85a", 5);
    /* porta davanti (verso prua): il piano di sotto della Sala Macchine */
    l(L / 2 - 30, 0, L / 2 + 30, 0, "#2e2014", 8); c(L / 2 - 30, 0, 4, "#c8a04a"); c(L / 2 + 30, 0, 4, "#c8a04a");
    /* sotto l'ascensore, la scala a chiocciola che sale verso la Stiva Modulare e, più su, fino agli Alloggi */
    var SC = ASC_Y + 92;
    c(L / 2, SC, 30, "#1c140c", "#7a5a3a", 2);
    for(var gr = 0; gr < 360; gr += 30){ var an = gr * Math.PI / 180; l((L / 2 + Math.cos(an) * 6).toFixed(1), (SC + Math.sin(an) * 6).toFixed(1), (L / 2 + Math.cos(an + .35) * 29).toFixed(1), (SC + Math.sin(an + .35) * 29).toFixed(1), "rgba(200,160,100,.7)", 2); }
    c(L / 2, SC, 6, "#5a3d22", "#c8a04a", 1.5);
    p('<path d="M' + (L / 2 + 30) + ' ' + SC + ' A30 30 0 1 1 ' + (L / 2) + ' ' + (SC - 30) + '" fill="none" stroke="#c8a04a" stroke-width="2"/>');   /* corrimano */
    return '<svg class="sm-svg nxst-svg" viewBox="-6 -6 ' + (L + 12) + ' ' + (L + 12) + '" role="img" aria-label="Stiva Primaria vista dall\'alto">' + g.join("") + sopra + '</svg>';
  }

  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<p class="stv-nota sm-intro">Sei magazzini stretti per lato. Verso prua c\'è l\'equipaggiamento degli Slayer; vicino all\'ascensore i viveri, che crescono con la dispensa. Al centro un ampio spazio di carico.</p>'
    + '<div class="nxst-stiva"></div>';
  S.nave = true;
  var dentro = false;
  /* quando la dispensa cambia (anche da un altro giocatore), si ridisegna: i pezzi nuovi arrivano con una piccola caduta */
  S.on(function(){ if(dentro && quanti() !== giaVisti) sx.innerHTML = pianta(); });
  NAVE.zona("stiva_primaria", {
    sinistra: sx, destra: dx,
    apri: function(){ dentro = true; giaVisti = null; sx.innerHTML = pianta(); S.stanzaMonta(dx.querySelector(".nxst-stiva")); },
    chiudi: function(){ dentro = false; S.stanzaSmonta(); },
    porte: [{ x: 330, y: 440, vai: "stiva_modulare" }, { x: 330, y: 32, vai: "sala_macchine", piano: false }, { x: 330, y: 638, vai: "alloggi" }]
  });
})();
