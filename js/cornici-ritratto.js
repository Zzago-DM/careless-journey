/* Cornici del ritratto nell'Area dello Slayer (.pa-phw), in base al continente d'origine scelto nella scheda.
   Ogni cornice è un disegno SVG sopra il ritratto (non lo copre: il centro è vuoto), con materiali e decorazioni
   dell'elemento: ghiaccio e brina, ferro rovente e fiamme, ottone e fulmini, legno intagliato e rampicanti,
   perla e oro con raggi di luce, ossidiana con rune e spine, bronzo e cima da nave per Ramsgate.
   La chiama paFrame() (js/area-giocatori.js) ogni volta che cambia il continente. */
(function(){
  "use strict";
  /* misure: il ritratto è 150 × 200; il disegno ha 16 di margine per lato, la fascia della cornice va da 4 a 16 */
  var W = 182, H = 232, A = 4, B = 16, IW = 150, IH = 200;
  var n = 0;
  function rnd(i){ var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function fascia(){ return "M" + A + "," + A + "H" + (W - A) + "V" + (H - A) + "H" + A + "Z M" + B + "," + B + "V" + (B + IH) + "H" + (B + IW) + "V" + B + "Z"; }
  function lin(id, stops, x2, y2){ return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 1 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join("") + '</linearGradient>'; }
  function rad(id, stops){ return '<radialGradient id="' + id + '" cx=".35" cy=".35" r=".75">' + stops.map(function(s){ return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join("") + '</radialGradient>'; }
  /* rilievo: luce in alto a sinistra, ombra in basso a destra, sui due bordi della fascia */
  function rilievo(luce, ombra){
    return '<path d="M' + A + ',' + (H - A) + 'V' + A + 'H' + (W - A) + '" fill="none" stroke="' + luce + '" stroke-width="1.2"/>'
      + '<path d="M' + (W - A) + ',' + A + 'V' + (H - A) + 'H' + A + '" fill="none" stroke="' + ombra + '" stroke-width="1.2"/>'
      + '<path d="M' + B + ',' + (B + IH) + 'H' + (B + IW) + 'V' + B + '" fill="none" stroke="' + luce + '" stroke-width="1"/>'
      + '<path d="M' + B + ',' + (B + IH) + 'V' + B + 'H' + (B + IW) + '" fill="none" stroke="' + ombra + '" stroke-width="1"/>';
  }
  var ANG = [[A + 6, A + 6, 1, 1], [W - A - 6, A + 6, -1, 1], [A + 6, H - A - 6, 1, -1], [W - A - 6, H - A - 6, -1, -1]];   /* angoli: x, y, verso x, verso y */
  /* punti lungo la fascia (al centro dello spessore), per decorazioni ripetute */
  function lungo(passo, fn){
    var m = (A + B) / 2, i = 0, x, y;
    for(x = B + passo / 2; x < W - B; x += passo){ fn(x, m, "o", i++); fn(x, H - m, "o", i++); }
    for(y = B + passo / 2; y < H - B; y += passo){ fn(m, y, "v", i++); fn(W - m, y, "v", i++); }
  }

  /* ---------- Glaciale: argento brinato, schegge di ghiaccio agli angoli, ghiaccioli, fiocco di neve in cima ---------- */
  function glaciale(p){
    var d = '<defs>' + lin(p + "b", [[0, "#f4fbff"], [.35, "#a9d6ee"], [.6, "#5b8fb2"], [1, "#e2f4ff"]])
      + lin(p + "s", [[0, "#ffffff", .95], [.5, "#bfe6fa", .75], [1, "#6fb0d6", .55]], 0, 1) + '</defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/>' + rilievo("rgba(255,255,255,.9)", "rgba(30,70,100,.7)");
    /* brina sulla fascia: piccoli cristalli bianchi */
    lungo(9, function(x, y, o, i){ var r = 1 + rnd(i) * 1.3, dx = (rnd(i + 50) - .5) * 6, dy = (rnd(i + 90) - .5) * 6; s += '<circle cx="' + (x + dx).toFixed(1) + '" cy="' + (y + dy).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="#fff" opacity="' + (.45 + rnd(i + 7) * .5).toFixed(2) + '"/>'; });
    /* ghiaccioli sotto la fascia bassa */
    for(var k = 0; k < 13; k++){ var x = 12 + k * 12.6 + rnd(k) * 4, h = 6 + rnd(k + 20) * 13; s += '<path class="cr-goccia" style="animation-delay:' + (rnd(k + 3) * 4).toFixed(1) + 's" d="M' + (x - 2.6).toFixed(1) + ',' + (H - A) + ' L' + x.toFixed(1) + ',' + (H - A + h).toFixed(1) + ' L' + (x + 2.6).toFixed(1) + ',' + (H - A) + 'Z" fill="url(#' + p + 's)" stroke="#e8f7ff" stroke-width=".5"/>'; }
    /* schegge di ghiaccio agli angoli */
    ANG.forEach(function(q, j){
      var g = '<g transform="translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ',' + q[3] + ')">';
      [[-4, -16, 6, 3], [-14, -6, 3, 6], [-12, -14, 2, 2], [6, -4, 14, 0], [-4, 6, 0, 14]].forEach(function(t){
        g += '<path d="M0,0 L' + t[0] + ',' + t[1] + ' L' + t[2] + ',' + t[3] + 'Z" fill="url(#' + p + 's)" stroke="#ffffff" stroke-width=".7" opacity=".95"/>';
      });
      s += g + '<circle r="3.2" fill="#ffffff" class="cr-brilla" style="animation-delay:' + j * .7 + 's"/></g>';
    });
    /* fiocco di neve in cima, su un medaglione */
    var cx = W / 2, cy = A + 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="11.5" fill="url(#' + p + 'b)" stroke="#ffffff" stroke-width="1.2"/>';
    var f = '<g class="cr-ruota" style="transform-origin:' + cx + 'px ' + cy + 'px">';
    for(var a = 0; a < 6; a++){ var an = a * 60; f += '<g transform="rotate(' + an + ' ' + cx + ' ' + cy + ')"><line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - 8.5) + '" stroke="#ffffff" stroke-width="1.4"/><path d="M' + (cx - 2.6) + ',' + (cy - 7) + ' L' + cx + ',' + (cy - 4.6) + ' L' + (cx + 2.6) + ',' + (cy - 7) + '" fill="none" stroke="#ffffff" stroke-width="1"/></g>'; }
    s += f + '</g>';
    return s;
  }

  /* ---------- Ardente: ferro battuto con crepe di brace, fiamme agli angoli, scintille ---------- */
  function ardente(p){
    var d = '<defs>' + lin(p + "b", [[0, "#5a3524"], [.3, "#2a1810"], [.65, "#4a2a1a"], [1, "#160b06"]])
      + lin(p + "f", [[0, "#fff3b0"], [.35, "#ffb030"], [.7, "#ff5a1a"], [1, "#b3260b", .2]], 0, 1)
      + '<filter id="' + p + 'g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/>' + rilievo("rgba(190,110,60,.7)", "rgba(0,0,0,.8)");
    /* martellature del ferro */
    lungo(7, function(x, y, o, i){ s += '<circle cx="' + (x + (rnd(i) - .5) * 5).toFixed(1) + '" cy="' + (y + (rnd(i + 30) - .5) * 5).toFixed(1) + '" r="' + (1 + rnd(i + 60)).toFixed(1) + '" fill="rgba(0,0,0,.35)"/>'; });
    /* crepe di brace che pulsano */
    var cr = "";
    [[20, A + 3, 1, 0], [100, A + 5, 1, 0], [40, H - A - 4, 1, 0], [120, H - A - 3, 1, 0], [A + 4, 60, 0, 1], [A + 3, 150, 0, 1], [W - A - 4, 40, 0, 1], [W - A - 3, 130, 0, 1]].forEach(function(c, i){
      var x = c[0], y = c[1], pts = [x + "," + y];
      for(var k = 1; k <= 6; k++){ x += c[2] * (5 + rnd(i * 9 + k) * 4); y += c[3] * (5 + rnd(i * 9 + k) * 4); var off = (rnd(i * 13 + k) - .5) * 5; pts.push((c[2] ? x : x + off).toFixed(1) + "," + (c[3] ? y : y + off).toFixed(1)); }
      cr += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#ff8a2e" stroke-width="1.3" stroke-linecap="round"/>';
    });
    s += '<g class="cr-brace" filter="url(#' + p + 'g)">' + cr + '</g>';
    /* fiamme agli angoli */
    ANG.forEach(function(q, j){
      var g = '<g transform="translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ',' + (q[3] > 0 ? 1 : 1) + ')">';
      g += '<g class="cr-fiamma" style="animation-delay:' + (j * .27) + 's">'
        + '<path d="M-6,4 C-10,-4 -6,-10 -2,-18 C-1,-10 4,-9 3,-15 C9,-8 9,0 5,5 Z" fill="url(#' + p + 'f)"/>'
        + '<path d="M-2,3 C-4,-2 -2,-6 0,-10 C1,-6 3,-5 3,-8 C6,-3 5,1 3,4 Z" fill="#fff3b0" opacity=".9"/></g>';
      s += g + '</g>';
    });
    /* scintille che salgono */
    for(var k = 0; k < 9; k++){ s += '<circle class="cr-scintilla" style="animation-delay:' + (rnd(k + 5) * 3).toFixed(2) + 's;animation-duration:' + (2.2 + rnd(k + 9) * 1.6).toFixed(2) + 's" cx="' + (10 + rnd(k) * (W - 20)).toFixed(1) + '" cy="' + (H - 6) + '" r="' + (.8 + rnd(k + 2) * .9).toFixed(1) + '" fill="#ffd27a"/>'; }
    /* sole di brace in cima */
    var cx = W / 2, cy = A + 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="10.5" fill="url(#' + p + 'b)" stroke="#ff8a2e" stroke-width="1.2"/>';
    var st = "";
    for(var a = 0; a < 8; a++){ var an = a * Math.PI / 4; st += '<path d="M' + (cx + Math.cos(an) * 3).toFixed(1) + ',' + (cy + Math.sin(an) * 3).toFixed(1) + ' L' + (cx + Math.cos(an + .2) * 8).toFixed(1) + ',' + (cy + Math.sin(an + .2) * 8).toFixed(1) + ' L' + (cx + Math.cos(an - .2) * 8).toFixed(1) + ',' + (cy + Math.sin(an - .2) * 8).toFixed(1) + 'Z" fill="#ffb030"/>'; }
    s += '<g class="cr-brace" filter="url(#' + p + 'g)">' + st + '<circle cx="' + cx + '" cy="' + cy + '" r="3.2" fill="#fff3b0"/></g>';
    return s;
  }

  /* ---------- Folgorante: ottone con rivetti, sfere di rame agli angoli, fulmini che corrono lungo la fascia ---------- */
  function folgorante(p){
    var d = '<defs>' + lin(p + "b", [[0, "#fff2a8"], [.3, "#c9a227"], [.55, "#6e5408"], [.8, "#e8cf5a"], [1, "#8a6a10"]])
      + rad(p + "r", [[0, "#ffe6b0"], [.45, "#d07a32"], [1, "#5a2a0a"]])
      + rad(p + "v", [[0, "#ffffff"], [.5, "#fff3a0"], [1, "#f0d020", 0]])
      + '<filter id="' + p + 'g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/>' + rilievo("rgba(255,250,210,.9)", "rgba(60,40,0,.8)");
    /* scanalatura centrale e rivetti */
    s += '<rect x="' + (A + 6) + '" y="' + (A + 6) + '" width="' + (W - 2 * A - 12) + '" height="' + (H - 2 * A - 12) + '" fill="none" stroke="rgba(70,50,0,.55)" stroke-width="1"/>';
    lungo(18, function(x, y){ s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.7" fill="#fff6c0" stroke="#5a4200" stroke-width=".6"/>'; });
    /* fulmini: quattro scariche che scattano a turno lungo i lati */
    function scarica(x1, y1, x2, y2, seme){
      var pts = [], N = 9;
      for(var k = 0; k <= N; k++){ var t = k / N, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t, j = (k === 0 || k === N) ? 0 : (rnd(seme + k) - .5) * 9; if(x1 === x2) x += j; else y += j; pts.push(x.toFixed(1) + "," + y.toFixed(1)); }
      return pts.join(" ");
    }
    [[B, (A + B) / 2, W - B, (A + B) / 2, 1], [W - (A + B) / 2, B, W - (A + B) / 2, H - B, 2], [W - B, H - (A + B) / 2, B, H - (A + B) / 2, 3], [(A + B) / 2, H - B, (A + B) / 2, B, 4]].forEach(function(f, i){
      s += '<g class="cr-lampo" style="animation-delay:' + (i * .9) + 's" filter="url(#' + p + 'g)"><polyline points="' + scarica(f[0], f[1], f[2], f[3], f[4] * 17) + '" fill="none" stroke="#fffbe0" stroke-width="1.6" stroke-linejoin="bevel"/>'
        + '<polyline points="' + scarica(f[0], f[1], f[2], f[3], f[4] * 31) + '" fill="none" stroke="#f0d020" stroke-width=".9" stroke-linejoin="bevel"/></g>';
    });
    /* sfere di rame con spire agli angoli */
    ANG.forEach(function(q, j){
      s += '<g transform="translate(' + (q[0] - q[2] * 2) + ',' + (q[1] - q[3] * 2) + ')"><circle r="9" fill="url(#' + p + 'v)" class="cr-brilla" style="animation-delay:' + (j * .5) + 's"/>'
        + '<circle r="6" fill="url(#' + p + 'r)" stroke="#3a1a04" stroke-width=".8"/><ellipse rx="6" ry="1.6" fill="none" stroke="#ffcf8a" stroke-width=".7"/><ellipse rx="6" ry="1.6" transform="rotate(60)" fill="none" stroke="#ffcf8a" stroke-width=".7"/><ellipse rx="6" ry="1.6" transform="rotate(-60)" fill="none" stroke="#ffcf8a" stroke-width=".7"/></g>';
    });
    /* fulmine in cima, dentro un rombo */
    var cx = W / 2, cy = A + 2;
    s += '<path d="M' + cx + ',' + (cy - 12) + ' L' + (cx + 11) + ',' + cy + ' L' + cx + ',' + (cy + 12) + ' L' + (cx - 11) + ',' + cy + 'Z" fill="url(#' + p + 'b)" stroke="#5a4200" stroke-width="1"/>'
      + '<path class="cr-lampo2" filter="url(#' + p + 'g)" d="M' + (cx + 2) + ',' + (cy - 8) + ' L' + (cx - 3.5) + ',' + (cy + 1) + ' L' + (cx + .5) + ',' + (cy + 1) + ' L' + (cx - 2) + ',' + (cy + 8) + ' L' + (cx + 4) + ',' + (cy - 1.5) + ' L' + (cx) + ',' + (cy - 1.5) + 'Z" fill="#fffbe0" stroke="#f0d020" stroke-width=".6"/>';
    return s;
  }

  /* ---------- Terrestre: legno intagliato con venature, rampicanti con foglie e fiori, muschio in basso ---------- */
  function terrestre(p){
    var d = '<defs>' + lin(p + "b", [[0, "#9a7444"], [.4, "#6b4f2a"], [.7, "#7e5d33"], [1, "#3e2a14"]])
      + lin(p + "l", [[0, "#9fd27a"], [.5, "#4a9640"], [1, "#2a5a24"]]) + '</defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/>' + rilievo("rgba(220,180,120,.6)", "rgba(20,10,0,.8)");
    /* venature del legno, lungo la fascia */
    for(var v = 0; v < 3; v++){
      var o = A + 3 + v * 3.2, ww = 0;
      s += '<path d="M' + (A + 1) + ',' + o + ' Q' + (W / 3) + ',' + (o + (rnd(v) - .5) * 3) + ' ' + (W / 2) + ',' + o + ' T' + (W - A - 1) + ',' + o + '" fill="none" stroke="rgba(40,22,8,.45)" stroke-width=".7"/>';
      s += '<path d="M' + (A + 1) + ',' + (H - o) + ' Q' + (W / 3) + ',' + (H - o + (rnd(v + 4) - .5) * 3) + ' ' + (W / 2) + ',' + (H - o) + ' T' + (W - A - 1) + ',' + (H - o) + '" fill="none" stroke="rgba(40,22,8,.45)" stroke-width=".7"/>';
      s += '<path d="M' + o + ',' + (A + 1) + ' Q' + (o + (rnd(v + 8) - .5) * 3) + ',' + (H / 3) + ' ' + o + ',' + (H / 2) + ' T' + o + ',' + (H - A - 1) + '" fill="none" stroke="rgba(40,22,8,.45)" stroke-width=".7"/>';
      s += '<path d="M' + (W - o) + ',' + (A + 1) + ' Q' + (W - o + (rnd(v + 12) - .5) * 3) + ',' + (H / 3) + ' ' + (W - o) + ',' + (H / 2) + ' T' + (W - o) + ',' + (H - A - 1) + '" fill="none" stroke="rgba(40,22,8,.45)" stroke-width=".7"/>';
    }
    /* un nodo del legno */
    s += '<ellipse cx="' + (W - A - 6) + '" cy="' + (H * .62) + '" rx="2.6" ry="4.2" fill="none" stroke="rgba(40,22,8,.6)" stroke-width=".8"/>';
    /* rampicante: due tralci che partono dagli angoli in basso e salgono lungo i lati, con foglie */
    function foglia(x, y, an, sc, i){ return '<g class="cr-foglia" style="animation-delay:' + (rnd(i) * 3).toFixed(2) + 's;transform-origin:' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px"><path transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + an.toFixed(0) + ') scale(' + sc.toFixed(2) + ')" d="M0,0 C3,-3 8,-3 11,0 C8,3 3,3 0,0 Z" fill="url(#' + p + 'l)" stroke="#1f4a1a" stroke-width=".5"/></g>'; }
    function tralcio(lato){
      var x0 = lato > 0 ? A + 2 : W - A - 2, pts = [], i;
      for(i = 0; i <= 14; i++){ var y = H - A - 2 - i * 14, x = x0 + lato * (Math.sin(i * 1.3) * 4 + 4); pts.push([x, y]); }
      var dd = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
      for(i = 1; i < pts.length; i++) dd += " Q" + (pts[i - 1][0] + lato * 5).toFixed(1) + "," + ((pts[i - 1][1] + pts[i][1]) / 2).toFixed(1) + " " + pts[i][0].toFixed(1) + "," + pts[i][1].toFixed(1);
      var t = '<path d="' + dd + '" fill="none" stroke="#3a6a2a" stroke-width="1.6" stroke-linecap="round"/>';
      for(i = 1; i < pts.length; i++){ var q = pts[i]; t += foglia(q[0], q[1], (i % 2 ? -40 : 220) + (lato < 0 ? 180 : 0), .7 + rnd(i + lato * 9) * .5, i * 3 + (lato > 0 ? 0 : 50)); }
      return t;
    }
    s += tralcio(1) + tralcio(-1);
    /* tralcio lungo il bordo in alto, dal centro verso i lati */
    var top = "";
    for(var k = 0; k < 10; k++){ var x = W / 2 + (k % 2 ? 1 : -1) * (12 + Math.floor(k / 2) * 15), y = A + 2 + (rnd(k) - .5) * 3; top += foglia(x, y, (k % 2 ? -20 : 200), .75, 100 + k); }
    s += '<path d="M' + (W / 2 - 80) + ',' + (A + 3) + ' Q' + (W / 2 - 40) + ',' + (A - 2) + ' ' + (W / 2) + ',' + (A + 2) + ' T' + (W / 2 + 80) + ',' + (A + 3) + '" fill="none" stroke="#3a6a2a" stroke-width="1.3"/>' + top;
    /* fiori */
    [[A + 7, 74], [W - A - 8, 120], [W / 2 + 34, A + 1], [W / 2 - 50, A + 2], [A + 9, 168]].forEach(function(f, i){
      var fl = '<g transform="translate(' + f[0] + ',' + f[1] + ')">';
      for(var a = 0; a < 5; a++) fl += '<ellipse rx="1.9" ry="3.1" transform="rotate(' + (a * 72) + ') translate(0,-2.6)" fill="' + (i % 2 ? "#fff6e0" : "#f3e08a") + '" stroke="rgba(120,90,20,.4)" stroke-width=".3"/>';
      s += fl + '<circle r="1.4" fill="#e0a020"/></g>';
    });
    /* muschio sulla fascia bassa */
    for(var m = 0; m < 26; m++){ s += '<circle cx="' + (A + 4 + rnd(m) * (W - 2 * A - 8)).toFixed(1) + '" cy="' + (H - A - 1 - rnd(m + 40) * 4).toFixed(1) + '" r="' + (1.4 + rnd(m + 80) * 2).toFixed(1) + '" fill="' + ["#4a7a2a", "#5a8a32", "#3a6a24"][m % 3] + '" opacity=".85"/>'; }
    /* ghianda d'ottone in cima */
    var cx = W / 2, cy = A + 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="9.5" fill="url(#' + p + 'b)" stroke="#c8a04a" stroke-width="1.2"/><ellipse cx="' + cx + '" cy="' + (cy + 1.6) + '" rx="3.6" ry="4.4" fill="#c8903a"/><path d="M' + (cx - 4.6) + ',' + (cy - .6) + ' Q' + cx + ',' + (cy - 6) + ' ' + (cx + 4.6) + ',' + (cy - .6) + 'Z" fill="#6a4526"/><line x1="' + cx + '" y1="' + (cy - 3.4) + '" x2="' + (cx + 1.6) + '" y2="' + (cy - 6.4) + '" stroke="#6a4526" stroke-width="1"/>';
    return s;
  }

  /* ---------- Radiante: madreperla e oro con filigrana, riflesso iridescente, raggi di luce in cima ---------- */
  function radiante(p){
    var d = '<defs>' + lin(p + "b", [[0, "#fffdf4"], [.3, "#f3dc8f"], [.5, "#ffffff"], [.75, "#e8c870"], [1, "#fff6dc"]])
      + '<linearGradient id="' + p + 'i" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ad5" stop-opacity=".35"/><stop offset=".25" stop-color="#ffe08a" stop-opacity=".1"/><stop offset=".5" stop-color="#b4ffb0" stop-opacity=".35"/><stop offset=".75" stop-color="#8fd6ff" stop-opacity=".1"/><stop offset="1" stop-color="#c9a6ff" stop-opacity=".35"/>'
      + (document.documentElement.hasAttribute("data-leggero") ? "" : '<animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;-1 0" dur="7s" repeatCount="indefinite"/>') + '</linearGradient>'
      + rad(p + "o", [[0, "#ffffff"], [.6, "#fff4d6"], [1, "#e8c870"]]) + '</defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/><path d="' + fascia() + '" fill="url(#' + p + 'i)" fill-rule="evenodd"/>' + rilievo("rgba(255,255,255,1)", "rgba(150,110,40,.7)");
    /* perline sulla fascia */
    lungo(10, function(x, y){ s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.5" fill="#ffffff" stroke="rgba(200,160,74,.8)" stroke-width=".5"/>'; });
    /* filigrana d'oro agli angoli: volute */
    ANG.forEach(function(q){
      s += '<g transform="translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ',' + q[3] + ')" fill="none" stroke="#c8a04a" stroke-width="1.1" stroke-linecap="round">'
        + '<path d="M-4,-4 C6,-6 16,-2 20,6 C22,12 16,14 13,10"/><path d="M-4,-4 C-6,6 -2,16 6,20 C12,22 14,16 10,13"/><circle cx="-4" cy="-4" r="3" fill="url(#' + p + 'o)" stroke="#c8a04a"/></g>';
    });
    /* stelline che brillano */
    [[A + 2, H * .4], [W - A - 2, H * .3], [W * .3, H - A - 1], [W * .78, H - A - 2], [W - A - 1, H * .72]].forEach(function(c, i){
      s += '<path class="cr-stella" style="animation-delay:' + (i * .55) + 's;transform-origin:' + c[0].toFixed(1) + 'px ' + c[1].toFixed(1) + 'px" d="M' + c[0] + ',' + (c[1] - 5) + ' L' + (c[0] + 1.2) + ',' + (c[1] - 1.2) + ' L' + (c[0] + 5) + ',' + c[1] + ' L' + (c[0] + 1.2) + ',' + (c[1] + 1.2) + ' L' + c[0] + ',' + (c[1] + 5) + ' L' + (c[0] - 1.2) + ',' + (c[1] + 1.2) + ' L' + (c[0] - 5) + ',' + c[1] + ' L' + (c[0] - 1.2) + ',' + (c[1] - 1.2) + 'Z" fill="#ffffff"/>';
    });
    /* raggi di luce in cima, attorno a una perla */
    var cx = W / 2, cy = A + 2, rg = '<g class="cr-ruota" style="transform-origin:' + cx + 'px ' + cy + 'px">';
    for(var a = 0; a < 16; a++){ var an = a * Math.PI / 8, L = a % 2 ? 13 : 20; rg += '<path d="M' + (cx + Math.cos(an - .07) * 6).toFixed(1) + ',' + (cy + Math.sin(an - .07) * 6).toFixed(1) + ' L' + (cx + Math.cos(an) * L).toFixed(1) + ',' + (cy + Math.sin(an) * L).toFixed(1) + ' L' + (cx + Math.cos(an + .07) * 6).toFixed(1) + ',' + (cy + Math.sin(an + .07) * 6).toFixed(1) + 'Z" fill="#ffe9a0" opacity="' + (a % 2 ? .55 : .85) + '"/>'; }
    s += rg + '</g><circle cx="' + cx + '" cy="' + cy + '" r="6.5" fill="url(#' + p + 'o)" stroke="#c8a04a" stroke-width="1"/>';
    return s;
  }

  /* ---------- Oscuro: ossidiana lucida, rune viola che pulsano, spine agli angoli, mezzaluna in cima ---------- */
  function oscuro(p){
    var d = '<defs>' + lin(p + "b", [[0, "#3a2a5a"], [.25, "#0c0812"], [.55, "#24123f"], [.8, "#08050c"], [1, "#1a0e2c"]])
      + rad(p + "m", [[0, "#efe6ff"], [.6, "#b9a2e8"], [1, "#5a3a9a"]])
      + '<filter id="' + p + 'g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      + '<filter id="' + p + 'f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/>' + rilievo("rgba(190,160,255,.55)", "rgba(0,0,0,.9)");
    /* riflesso lucido dell'ossidiana */
    s += '<path d="M' + (A + 2) + ',' + (A + 30) + ' L' + (A + 30) + ',' + (A + 2) + '" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"/>';
    /* rune */
    var R = ["M0,-4 L0,4 M0,-1 L3,-4 M0,1 L-3,4", "M-2,-4 L-2,4 M-2,0 L2,-3 M-2,0 L2,3", "M0,-4 L3,0 L0,4 L-3,0 Z", "M-3,-4 L0,-1 L3,-4 M0,-1 L0,4", "M-2,-4 L2,-4 M0,-4 L0,4 M-2,2 L2,4", "M0,-4 L0,4 M-3,-2 L0,0 L3,-2"], ru = "";
    lungo(17, function(x, y, o, i){ ru += '<path transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')" d="' + R[i % R.length] + '" fill="none" stroke="#b48cff" stroke-width="1" stroke-linecap="round"/>'; });
    s += '<g class="cr-rune" filter="url(#' + p + 'g)">' + ru + '</g>';
    /* fumo agli angoli */
    ANG.forEach(function(q, j){ s += '<ellipse class="cr-fumo" style="animation-delay:' + (j * .9) + 's" cx="' + q[0] + '" cy="' + q[1] + '" rx="11" ry="7" fill="#6a3ab0" opacity=".35" filter="url(#' + p + 'f)"/>'; });
    /* spine: tralci neri con aculei che avvolgono gli angoli */
    ANG.forEach(function(q){
      var g = '<g transform="translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ',' + q[3] + ')" fill="#120a1c" stroke="#5a3a8a" stroke-width=".6">';
      g += '<path d="M-6,-6 C4,-9 16,-4 24,4 C16,-1 6,-3 -2,-2 Z"/><path d="M-6,-6 C-9,4 -4,16 4,24 C-1,16 -3,6 -2,-2 Z"/>';
      [[6, -6.5, -40], [13, -4, -20], [19, 0, 10], [-6.5, 6, 220], [-4, 13, 200], [0, 19, 170]].forEach(function(t){ g += '<path transform="translate(' + t[0] + ',' + t[1] + ') rotate(' + t[2] + ')" d="M-1.6,0 L0,-5 L1.6,0 Z"/>'; });
      s += g + '</g>';
    });
    /* mezzaluna in cima */
    var cx = W / 2, cy = A + 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="10.5" fill="url(#' + p + 'b)" stroke="#8a68c8" stroke-width="1.2"/>'
      + '<g class="cr-rune" filter="url(#' + p + 'g)"><path d="M' + (cx + 2) + ',' + (cy - 7) + ' A7,7 0 1,0 ' + (cx + 2) + ',' + (cy + 7) + ' A9,9 0 0,1 ' + (cx + 2) + ',' + (cy - 7) + 'Z" fill="url(#' + p + 'm)"/></g>';
    return s;
  }

  /* ---------- Ramsgate: bronzo lucidato, cima da nave lungo il bordo interno, rosa dei venti in cima e ancora in basso ---------- */
  function ramsgate(p){
    var d = '<defs>' + lin(p + "b", [[0, "#f3dc8f"], [.35, "#b8862e"], [.6, "#7a5520"], [.85, "#d8b25a"], [1, "#8a6420"]]) + '</defs>';
    var s = d + '<path d="' + fascia() + '" fill="url(#' + p + 'b)" fill-rule="evenodd"/>' + rilievo("rgba(255,240,190,.9)", "rgba(50,30,0,.8)");
    /* cima intrecciata lungo il bordo interno */
    var ri = B - 2.6;
    s += '<rect x="' + ri + '" y="' + ri + '" width="' + (W - 2 * ri) + '" height="' + (H - 2 * ri) + '" fill="none" stroke="#c9a46a" stroke-width="3.4"/>'
      + '<rect x="' + ri + '" y="' + ri + '" width="' + (W - 2 * ri) + '" height="' + (H - 2 * ri) + '" fill="none" stroke="#6a4a20" stroke-width="3.4" stroke-dasharray="1.4 2.6" transform="translate(.5 .5)" opacity=".75"/>';
    /* chiodi d'ottone agli angoli */
    ANG.forEach(function(q){ s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3.2" fill="#fff0b8" stroke="#5a3a10" stroke-width="1"/><line x1="' + (q[0] - 2) + '" y1="' + q[1] + '" x2="' + (q[0] + 2) + '" y2="' + q[1] + '" stroke="#5a3a10" stroke-width=".8"/>'; });
    /* rosa dei venti in cima */
    var cx = W / 2, cy = A + 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="11.5" fill="url(#' + p + 'b)" stroke="#5a3a10" stroke-width="1"/><g class="cr-bussola" style="transform-origin:' + cx + 'px ' + cy + 'px">'
      + '<path d="M' + cx + ',' + (cy - 10) + ' L' + (cx + 2) + ',' + cy + ' L' + cx + ',' + (cy + 10) + ' L' + (cx - 2) + ',' + cy + 'Z" fill="#7a1f1a"/><path d="M' + (cx - 10) + ',' + cy + ' L' + cx + ',' + (cy - 2) + ' L' + (cx + 10) + ',' + cy + ' L' + cx + ',' + (cy + 2) + 'Z" fill="#2a1a0a"/></g><circle cx="' + cx + '" cy="' + cy + '" r="1.6" fill="#fff0b8"/>';
    /* ancora in basso */
    var ax = W / 2, ay = H - A - 1;
    s += '<circle cx="' + ax + '" cy="' + ay + '" r="10" fill="url(#' + p + 'b)" stroke="#5a3a10" stroke-width="1"/><g fill="none" stroke="#2a1a0a" stroke-width="1.4" stroke-linecap="round"><circle cx="' + ax + '" cy="' + (ay - 6) + '" r="1.6"/><line x1="' + ax + '" y1="' + (ay - 4.4) + '" x2="' + ax + '" y2="' + (ay + 6) + '"/><line x1="' + (ax - 3.5) + '" y1="' + (ay - 2.5) + '" x2="' + (ax + 3.5) + '" y2="' + (ay - 2.5) + '"/><path d="M' + (ax - 6) + ',' + (ay + 1.5) + ' Q' + (ax - 5) + ',' + (ay + 7) + ' ' + ax + ',' + (ay + 6) + ' Q' + (ax + 5) + ',' + (ay + 7) + ' ' + (ax + 6) + ',' + (ay + 1.5) + '"/></g>';
    return s;
  }

  var FN = { glaciale: glaciale, ardente: ardente, folgorante: folgorante, terrestre: terrestre, radiante: radiante, oscuro: oscuro, ramsgate: ramsgate };
  /* mette (o toglie) la cornice nel riquadro del ritratto dentro "root" (.pa-id) */
  window.paCornice = function(root, cont){
    if(!root) return;
    var w = root.querySelector(".pa-phw"); if(!w) return;
    var vecchia = w.querySelector(".pa-cornice"); if(vecchia) vecchia.remove();
    root.classList.remove("pa-fr-ok");
    if(!FN[cont]) return;
    var p = "cr" + (++n) + "-";
    var svg = '<svg class="pa-cornice" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + FN[cont](p) + '</svg>';
    w.insertAdjacentHTML("beforeend", svg);
    root.classList.add("pa-fr-ok");
  };
})();
