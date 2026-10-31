/* Esplora la nave › Stanza delle Reliquie (js/nave-esplora.js).
   A sinistra la stanza vista dall'alto, solo decorativa: un cerchio tagliato da una parete dritta, che impedisce alla
   circonferenza di chiudersi; la parete dritta è quella rinforzata verso la Sala Macchine, con la scala a pioli.
   Pareti in metallo scuro rivestite di legno, pavimento in assi scure e al centro un grande tappeto di velluto.
   Lungo la parete curva le reliquie, in cassette sigillate disposte su due file, una sopra l'altra.
   A destra: il contenuto della stanza delle Reliquie (js/reliquie.js), cioè le reliquie e la bacheca del gruppo. */
(function(){
  "use strict";
  if(!window.NAVE || !window.relNave) return;
  var W = 600, H = 520, CX = 300, CY = 285, RM = 250, CORDA = 180;   /* la parete dritta sta CORDA sotto il centro */
  var A0 = Math.asin(CORDA / RM);                                     /* angolo dei due spigoli */
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function p(d, f, s, sw, ex){ g.push('<path d="' + d + '" fill="' + (f || "none") + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function pt(R, a){ return [CX + Math.cos(a) * R, CY + Math.sin(a) * R]; }
  function f(q){ return q[0].toFixed(1) + "," + q[1].toFixed(1); }
  /* la forma: dall'angolo in basso a sinistra, su per l'arco e giù fino all'angolo in basso a destra, poi la parete dritta */
  function forma(R){
    var y = CY + CORDA, dx = Math.sqrt(Math.max(0, R * R - CORDA * CORDA));
    return "M" + (CX - dx).toFixed(1) + "," + y + " A" + R + " " + R + " 0 1 1 " + (CX + dx).toFixed(1) + "," + y + " Z";
  }
  /* un settore di corona (per le cassette che seguono la parete curva) */
  function settore(R1, R2, a1, a2){
    return "M" + f(pt(R2, a1)) + " A" + R2 + " " + R2 + " 0 0 1 " + f(pt(R2, a2)) + " L" + f(pt(R1, a2)) + " A" + R1 + " " + R1 + " 0 0 0 " + f(pt(R1, a1)) + " Z";
  }
  /* una fila di cassette sigillate lungo l'arco, tra i raggi R1 e R2 */
  function fila(R1, R2, n, scura){
    var da = Math.PI - A0, a = Math.PI * 2 + A0, passo = (a - da) / n, gioco = passo * .1;
    for(var i = 0; i < n; i++){
      var a1 = da + i * passo + gioco, a2 = da + (i + 1) * passo - gioco, am = (a1 + a2) / 2;
      p(settore(R1, R2, a1, a2), scura ? "#22262c" : "#2c3138", "#5a6470", 1.5);                     /* telaio di metallo */
      p(settore(R1 + 4, R2 - 4, a1 + gioco * .9, a2 - gioco * .9), scura ? "#4a2e18" : "#5c3a1e", "#2a1a0a", 1); /* coperchio di legno */
      var s = pt((R1 + R2) / 2, am);
      c(s[0].toFixed(1), s[1].toFixed(1), 3.6, "#8a1c22", "#c8a04a", 1.2);                               /* sigillo */
    }
  }
  function pianta(){
    g = [];
    var defs = '<defs><clipPath id="nxr-forma"><path d="' + forma(RM) + '"/></clipPath>'
      + '<radialGradient id="nxr-velluto"><stop offset="0" stop-color="#6a1a2c"/><stop offset=".75" stop-color="#4a1020"/><stop offset="1" stop-color="#2e0a14"/></radialGradient>'
      + '<radialGradient id="nxr-luce"><stop offset="0" stop-color="#ffd27a" stop-opacity=".12"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>';
    /* pavimento in assi scure */
    g.push('<g clip-path="url(#nxr-forma)">');
    r(0, 0, W, H, "#221710"); for(var x = 0; x < W; x += 18) l(x, 0, x, H, "rgba(0,0,0,.3)", 1.2);
    for(var k = 0, y = 12; y < H; y += 62, k++) for(var x2 = (k % 3) * 18; x2 < W; x2 += 54) l(x2, y, x2 + 18, y, "rgba(0,0,0,.35)", 1.2);
    c(CX, CY, 240, "url(#nxr-luce)");
    g.push('</g>');
    /* tappeto di velluto con la frangia dorata */
    c(CX, CY + 10, 112, "url(#nxr-velluto)", "#c8a04a", 3);
    c(CX, CY + 10, 100, "none", "rgba(200,160,74,.45)", 1.5);
    c(CX, CY + 10, 116, "none", "rgba(200,160,74,.5)", 2, 'stroke-dasharray="2 4"');
    /* le cassette: la fila di sopra contro la parete, quella di sotto che sporge un po' di più */
    fila(186, 214, 22, true);
    fila(214, 240, 24, false);
    /* pareti: metallo scuro con il rivestimento di legno all'interno */
    p(forma(RM), "none", "#5a3a20", 6);
    p(forma(RM + 7), "none", "#3a424c", 9);
    var ry = CY + CORDA, rdx = Math.sqrt(RM * RM - CORDA * CORDA);
    for(var m = CX - rdx + 14; m < CX + rdx - 10; m += 22) c(m.toFixed(1), ry + 4, 1.8, "#8a96a2");                /* rivetti della parete rinforzata */
    for(var a = 0; a < 360; a += 10){ var an = a * Math.PI / 180, q = pt(RM + 7, an); if(q[1] < ry - 2) c(q[0].toFixed(1), q[1].toFixed(1), 1.8, "#8a96a2"); }
    /* scala a pioli contro la parete rinforzata */
    r(CX - 16, ry - 34, 32, 30, "#2c3138", "#5a6470", 1.5);
    l(CX - 12, ry - 34, CX - 12, ry - 4, "#9aa6b2", 2.5); l(CX + 12, ry - 34, CX + 12, ry - 4, "#9aa6b2", 2.5);
    for(var z = 1; z < 5; z++) l(CX - 12, ry - 34 + z * 6, CX + 12, ry - 34 + z * 6, "#9aa6b2", 1.8);
    var t = '<text x="' + CX + '" y="' + (ry + 38) + '" fill="#a39478" font-size="17" text-anchor="middle">▼ la parete rinforzata della Sala Macchine</text>';
    return '<svg class="sm-svg nxr-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Stanza delle Reliquie vista dall\'alto">' + defs + g.join("") + t + '</svg>';
  }
  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<p class="stv-nota sm-intro">Metallo scuro, legno e velluto. Lungo la parete curva le reliquie riposano in cassette sigillate, su due file, una sopra l\'altra.</p>'
    + '<div class="nxr-rel"></div>';
  relNave.registrata = true;
  NAVE.zona("zona_segreta", {
    sinistra: sx, destra: dx,
    apri: function(){ sx.innerHTML = pianta(); relNave.monta(dx.querySelector(".nxr-rel")); },
    chiudi: function(){ relNave.smonta(); }
  });
})();
