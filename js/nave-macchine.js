/* Esplora la nave › Sala Macchine (js/nave-esplora.js).
   A sinistra la Sala Macchine vista dall'alto: tutta in metallo scuro, su due livelli.
   - Al centro il NUCLEO AETHERICO, una colonna di energia che attraversa entrambi i piani: dall'alto si vede il suo
     cerchio luminoso con gli anelli di contenimento, e i condotti che partono verso le pareti.
   - Al piano di sopra una galleria ad anello attorno al nucleo, con il parapetto, e una passerella verso la porta.
   - Al piano di sotto, attorno al nucleo, quattro pannelli curvi rivolti verso il motore; lungo le pareti altri pannelli
     rivolti verso il muro.
   - Due scale, una di fronte all'altra, attraversano la galleria e scendono verso il nucleo: una all'arrivo della passerella
     dalla porta di poppa (verso la Stiva Modulare), l'altra dal lato opposto.
   - Dal lato opposto all'ingresso, nella parete rinforzata, la porta blindata della Stanza delle Reliquie.
   Il disegno è costruito con la porta di poppa a destra e poi ruotato di 90° verso destra: l'ingresso dalla Stiva Modulare
   finisce in basso e la porta blindata delle Reliquie in alto.
   A destra, per ora: la descrizione della Sala Macchine. */
(function(){
  "use strict";
  if(!window.NAVE) return;
  var W = 560, H = 460, CX = 280, CY = 230;
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function p(d, f, s, sw, ex){ g.push('<path d="' + d + '" fill="' + (f || "none") + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function arco(R1, R2, a1, a2){
    var r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180, big = (a2 - a1) > 180 ? 1 : 0;
    function pt(R, a){ return (CX + Math.cos(a) * R).toFixed(1) + " " + (CY + Math.sin(a) * R).toFixed(1); }
    return "M" + pt(R2, r1) + " A" + R2 + " " + R2 + " 0 " + big + " 1 " + pt(R2, r2) + " L" + pt(R1, r2) + " A" + R1 + " " + R1 + " 0 " + big + " 0 " + pt(R1, r1) + " Z";
  }
  function scala(x, y, w, h, vert){
    r(x, y, w, h, "#30363e", "#5a6470", 1.5);
    var n = 7;
    for(var i = 1; i < n; i++){ if(vert) l(x + 2, y + i * h / n, x + w - 2, y + i * h / n, "#7a8694", 1.5); else l(x + i * w / n, y + 2, x + i * w / n, y + h - 2, "#7a8694", 1.5); }
    if(vert){ l(x, y, x, y + h, "#9aa6b2", 2); l(x + w, y, x + w, y + h, "#9aa6b2", 2); } else { l(x, y, x + w, y, "#9aa6b2", 2); l(x, y + h, x + w, y + h, "#9aa6b2", 2); }
  }
  function pannello(x, y, w, h, schermo, lato){   /* lato: dove guarda lo schermo (dove sta chi lo usa) */
    r(x, y, w, h, "#1c2128", "#4a5560", 1.5, 2);
    var sx = x + 3, sy = y + 3, sw = w - 6, sh = h - 6;
    if(lato === "su") sh = Math.min(sh, 7); else if(lato === "giu"){ sy = y + h - 10; sh = 7; } else if(lato === "sx") sw = Math.min(sw, 7); else if(lato === "dx"){ sx = x + w - 10; sw = 7; }
    r(sx, sy, sw, sh, schermo, "", 0, 1, 'class="nxk-schermo"');
  }

  function pianta(){
    g = [];
    /* pavimento a lastre di metallo con i rivetti */
    r(0, 0, W, H, "#23282e");
    for(var a = 0; a < W; a += 40) for(var b = 0; b < H; b += 40){
      r(a + 1, b + 1, 38, 38, "none", "rgba(0,0,0,.35)", 1);
      c(a + 5, b + 5, 1.3, "#4a5560"); c(a + 35, b + 5, 1.3, "#4a5560"); c(a + 5, b + 35, 1.3, "#4a5560"); c(a + 35, b + 35, 1.3, "#4a5560");
    }
    /* condotti dal nucleo alle pareti (sotto la galleria) */
    [[CX, 0], [CX, H], [0, CY], [W, CY]].forEach(function(q){
      l(CX, CY, q[0], q[1], "#3a4450", 16); l(CX, CY, q[0], q[1], "rgba(120,200,255,.35)", 3, 'class="nxk-flusso"');
    });
    /* pannelli lungo le pareti, rivolti verso il muro */
    [[40, 8], [110, 8], [370, 8], [440, 8]].forEach(function(q){ pannello(q[0], q[1], 56, 24, "#3fa9d6", "su"); });
    [[40, H - 32], [110, H - 32], [370, H - 32], [440, H - 32]].forEach(function(q){ pannello(q[0], q[1], 56, 24, "#5fd0a0", "giu"); });
    pannello(8, 60, 24, 56, "#d6a33f", "sx"); pannello(8, H - 116, 24, 56, "#3fa9d6", "sx");
    /* piano di sotto: pannelli curvi attorno al nucleo, rivolti verso il motore */
    [[200, 240], [290, 330], [20, 70], [110, 160]].forEach(function(q){
      p(arco(78, 98, q[0], q[1]), "#1c2128", "#4a5560", 1.5);
      p(arco(78, 82, q[0] + 4, q[1] - 4), "#3fa9d6", "", 0, 'class="nxk-schermo"');
    });
    /* galleria ad anello del piano di sopra (grigliato) e parapetto */
    p(arco(128, 172, 0, 359.9), "#2c333b", "#5a6470", 2);
    for(var k = 0; k < 360; k += 6){ var an = k * Math.PI / 180; l(CX + Math.cos(an) * 130, CY + Math.sin(an) * 130, CX + Math.cos(an) * 170, CY + Math.sin(an) * 170, "rgba(0,0,0,.35)", 1); }
    c(CX, CY, 128, "none", "#9aa6b2", 2.5); c(CX, CY, 172, "none", "#6a7682", 1.5);
    for(var m = 0; m < 360; m += 15){ var am = m * Math.PI / 180; c(CX + Math.cos(am) * 128, CY + Math.sin(am) * 128, 2, "#c0ccd8"); }
    /* passerella del piano di sopra verso la porta di poppa (a destra) */
    r(CX + 168, CY - 22, W - CX - 168, 44, "#2c333b", "#5a6470", 2);
    for(var z = CX + 172; z < W; z += 8) l(z, CY - 20, z, CY + 20, "rgba(0,0,0,.35)", 1);
    l(CX + 168, CY - 22, W, CY - 22, "#9aa6b2", 2); l(CX + 168, CY + 22, W, CY + 22, "#9aa6b2", 2);
    /* scale tra i due piani */
    /* scale: una appena dentro l'ingresso, che scende dalla passerella; l'altra simmetrica, dal lato opposto della galleria */
    r(CX - 214, CY - 22, 46, 44, "#2c333b", "#5a6470", 2);                       /* pianerottolo dal lato opposto */
    for(var y2 = CX - 210; y2 < CX - 168; y2 += 8) l(y2, CY - 20, y2, CY + 20, "rgba(0,0,0,.35)", 1);
    /* scale: attraversano la galleria, dal bordo esterno (piano di sopra) giù verso il nucleo (piano di sotto) */
    scala(CX + 124, CY - 24, 52, 48, false);
    scala(CX - 176, CY - 24, 52, 48, false);
    /* nucleo aetherico, visto dall'alto */
    c(CX, CY, 70, "#15191e", "#6a7682", 3);
    c(CX, CY, 60, "none", "#4a5560", 6, 'stroke-dasharray="14 8"');
    for(var s = 0; s < 8; s++){ var as = s * Math.PI / 4; r(CX + Math.cos(as) * 63 - 5, CY + Math.sin(as) * 63 - 5, 10, 10, "#8a96a2", "#3a4450", 1, 1); }
    c(CX, CY, 46, "url(#nxk-alone)", "", 0, 'class="nxk-nucleo"');
    c(CX, CY, 34, "none", "rgba(200,240,255,.75)", 2.5, 'class="nxk-anello"');
    c(CX, CY, 22, "none", "rgba(190,150,255,.8)", 2, 'class="nxk-anello nxk-anello2"');
    c(CX, CY, 11, "#f2fbff", "", 0, 'class="nxk-cuore"');
    /* porta di poppa (verso la Stiva Modulare) */
    l(W, CY - 20, W, CY + 20, "#2c333b", 9);
    r(0, 0, W, H, "none", "#7a8694", 5);
    /* porta blindata verso la Stanza delle Reliquie, nella parete rinforzata dal lato opposto */
    r(-2, CY - 36, 14, 10, "#2c333b", "#6a7682", 1.5, 1); r(-2, CY + 26, 14, 10, "#2c333b", "#6a7682", 1.5, 1);   /* stipiti */
    r(0, CY - 26, 12, 52, "#3a424c", "#9aa6b2", 2, 2);                                                                  /* battente */
    for(var bb = 1; bb < 5; bb++) l(2, CY - 26 + bb * 52 / 5, 10, CY - 26 + bb * 52 / 5, "rgba(0,0,0,.4)", 1.5);
    [CY - 18, CY - 8, CY + 6, CY + 16].forEach(function(yb){ r(9, yb, 6, 3, "#c0ccd8", "", 0, 1); });                  /* chiavistelli */
    l(17, CY - 10, 17, CY + 10, "#c8a04a", 3); c(17, CY, 3, "#c8a04a", "#5a3a18", 1);                                  /* maniglia a leva */
    var defs = '<defs><radialGradient id="nxk-alone"><stop offset="0" stop-color="#e8f8ff"/><stop offset=".35" stop-color="#7fd4ff"/><stop offset=".7" stop-color="#6a5ae0" stop-opacity=".85"/><stop offset="1" stop-color="#2a2060" stop-opacity="0"/></radialGradient></defs>';
    /* ruotata di 90° verso destra: il punto (x, y) finisce in (H − y, x) */
    defs = defs.replace("</defs>", '<clipPath id="nxk-taglio"><rect x="0" y="0" width="' + H + '" height="' + W + '"/></clipPath></defs>');
    return '<svg class="sm-svg nxk-svg" viewBox="-6 -6 ' + (H + 12) + ' ' + (W + 12) + '" role="img" aria-label="Sala Macchine vista dall\'alto">' + defs + '<g clip-path="url(#nxk-taglio)"><g transform="translate(' + H + ' 0) rotate(90)">' + g.join("") + '</g></g></svg>';
  }

  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div");
  dx.innerHTML = '<div class="sm-h">⚙️ Sala Macchine</div>'
    + '<p class="sm-d">Il cuore energetico della nave, tutta in metallo e su due piani. Al centro il nucleo aetherico, una colonna di energia che attraversa entrambi i livelli; attorno, al piano di sopra, una galleria ad anello con il parapetto. Al piano di sotto i pannelli di controllo guardano il motore, mentre altri sono rivolti alle pareti. Due scale collegano i livelli.</p>'
    + '<p class="sm-d">I muri sono rinforzati. Di fronte all\'ingresso dalla Stiva Modulare, una porta blindata dà sulla Stanza delle Reliquie.</p>'
    + '<p class="stv-nota" style="margin-top:1rem">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
  NAVE.zona("sala_macchine", {
    sinistra: sx, destra: dx,
    apri: function(){ sx.innerHTML = pianta(); },
    porte: [{ x: 230, y: 66, vai: "zona_segreta" }, { x: 230, y: 538, vai: "stiva_modulare" }]
  });
})();
