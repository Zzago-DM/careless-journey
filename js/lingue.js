/* Lingue degli Slayer — un testo scritto in italiano, mostrato a ogni giocatore nella sua lingua madre.
     Athena  → rune anglosassoni (Futhorc), lettera per lettera come i convertitori online (Hello → ᚻᛖᛚᛚᚩ)
     Asonnes → gallifreyano circolare, con le regole di Loren Sherman (lo stesso sistema da cui parte il traduttore
               ufficiale della BBC): ogni parola è un cerchio, le lettere girano in senso antiorario partendo dal basso.
               Al suo posto si può mettere un'immagine fatta con il traduttore ufficiale (vedi js/sessioni.js).
     Pan Lan → lingua degli Occulti (Unseen), lettera per lettera come il traduttore LingoJam «Dauntless Unseen»:
               la s in fondo alla parola diventa ς, come nel traduttore.
   Uso: LINGUE.html(testo, pg) → HTML già pronto (rune, disegno SVG o testo normale); LINGUE.nome(pg) → nome della lingua.
   Il testo italiano resta sempre quello originale: il pulsante «Traduci» lo mostra (lo gestisce chi usa questo file). */
(function(){
  "use strict";
  var LINGUA = { athena: "rune", asonnes: "gallifreyano", panlan: "occulti" };
  var NOMI = { rune: "Rune anglosassoni", gallifreyano: "Gallifreyano", occulti: "Lingua degli Occulti" };
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function senzaAccenti(t){ return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* ---------------- rune anglosassoni (Futhorc) ---------------- */
  var RUNE = { a: "ᚪ", b: "ᛒ", c: "ᚳ", d: "ᛞ", e: "ᛖ", f: "ᚠ", g: "ᚷ", h: "ᚻ", i: "ᛁ", j: "ᛄ", k: "ᛣ", l: "ᛚ", m: "ᛗ", n: "ᚾ", o: "ᚩ",
    p: "ᛈ", q: "ᛢ", r: "ᚱ", s: "ᛋ", t: "ᛏ", u: "ᚢ", v: "ᚠ", w: "ᚹ", x: "ᛉ", y: "ᚣ", z: "ᛋ" };
  var RUNE2 = { th: "ᚦ", ng: "ᛝ", ea: "ᛠ", st: "ᛥ", ae: "ᚫ", oe: "ᛟ" };
  function rune(t){
    var s = senzaAccenti(t).toLowerCase(), o = "";
    for(var i = 0; i < s.length; i++){
      var d = s.substr(i, 2);
      if(RUNE2[d]){ o += RUNE2[d]; i++; continue; }
      var c = s[i];
      o += RUNE[c] || (c === "'" || c === "’" ? "×" : c === "." || c === ":" ? "᛫" : c);
    }
    return o;
  }
  var fontRune = false;
  function caricaFontRune(){
    if(fontRune) return; fontRune = true;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Runic&display=swap"; document.head.appendChild(l);
  }

  /* ---------------- lingua degli Occulti ---------------- */
  var OCC = { a: "ㅏ", b: "б", c: "c", d: "δ", e: "э", f: "φ", g: "γ", h: "ㅎ", i: "и", j: "ㅈ", k: "ㅋ", l: "λ", m: "ㅁ", n: "n", o: "ω",
    p: "π", q: "ξ", r: "ㄹ", s: "σ", t: "t", u: "u", v: "v", w: "w", x: "x", y: "y", z: "з" };
  function occulti(t){
    var s = senzaAccenti(t).toLowerCase(), o = "";
    for(var i = 0; i < s.length; i++){
      var c = s[i];
      if(c === "s" && !/[a-z]/.test(s[i + 1] || "") && /[a-z]/.test(s[i - 1] || "")){ o += "ς"; continue; }   /* «s» da sola resta σ, come nel traduttore */
      o += OCC[c] || c;
    }
    return o;
  }

  /* ---------------- gallifreyano circolare (Sherman) ----------------
     Consonanti, quattro forme sul cerchio della parola:
       «mezzaluna»  B CH D G H F    cerchio che morde la linea dall'interno (la linea si interrompe)
       «interno»    J PH K L N P M  cerchio pieno dentro la parola, staccato dalla linea
       «semicerchio» T SH R V W S   cerchio centrato sulla linea: si disegna solo la metà interna (la linea si interrompe)
       «sulla linea» TH Y Z QU X NG cerchio pieno centrato sulla linea, che resta intera
     I segni distinguono le lettere della stessa forma: puntini (1–3) o trattini (1–3).
     Vocali, piccoli cerchi: A fuori dalla linea, E sulla linea, I sulla linea con un trattino verso il centro,
     O dentro, U sulla linea con un trattino verso fuori. Dopo una consonante la vocale si appoggia a lei. */
  var CONS = {
    b: ["mz", 0, 0], ch: ["mz", 2, 0], d: ["mz", 3, 0], g: ["mz", 0, 1], h: ["mz", 0, 2], f: ["mz", 0, 3],
    j: ["in", 0, 0], ph: ["in", 1, 0], k: ["in", 2, 0], l: ["in", 3, 0], n: ["in", 0, 1], p: ["in", 0, 2], m: ["in", 0, 3],
    t: ["se", 0, 0], sh: ["se", 2, 0], r: ["se", 3, 0], v: ["se", 0, 1], w: ["se", 0, 2], s: ["se", 0, 3],
    th: ["sl", 0, 0], y: ["sl", 2, 0], z: ["sl", 3, 0], qu: ["sl", 0, 1], x: ["sl", 0, 2], ng: ["sl", 0, 3]
  };
  var VOC = { a: 1, e: 1, i: 1, o: 1, u: 1 };
  function lettere(parola){
    var s = senzaAccenti(parola).toLowerCase().replace(/[^a-z]/g, ""), out = [];
    for(var i = 0; i < s.length; i++){
      var d = s.substr(i, 2);
      if(d === "ch" || d === "sh" || d === "th" || d === "ph" || d === "ng" || d === "qu"){ out.push(d); i++; continue; }
      var c = s[i];
      if(c === "c"){ out.push(/[eiy]/.test(s[i + 1] || "") ? "s" : "k"); continue; }   /* come nel sistema di Sherman: c → k o s */
      if(c === "q"){ out.push("k"); continue; }
      out.push(c);
    }
    /* sillabe: una consonante con la vocale che la segue */
    var sil = [];
    out.forEach(function(l){
      var u = sil[sil.length - 1];
      if(VOC[l] && u && u.c && !u.v) u.v = l; else sil.push(VOC[l] ? { v: l } : { c: l });
    });
    return sil;
  }
  function f(n){ return Math.round(n * 100) / 100; }
  function arco(cx, cy, r, a0, a1){   /* da a0 a a1 (radianti, a1 > a0), sempre il verso positivo */
    var g = a1 - a0, x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    if(g >= Math.PI * 2 - 1e-4) return "M" + f(cx + r) + "," + f(cy) + " A" + f(r) + "," + f(r) + " 0 1,1 " + f(cx - r) + "," + f(cy) + " A" + f(r) + "," + f(r) + " 0 1,1 " + f(cx + r) + "," + f(cy);
    return "M" + f(x0) + "," + f(y0) + " A" + f(r) + "," + f(r) + " 0 " + (g > Math.PI ? 1 : 0) + ",1 " + f(x1) + "," + f(y1);
  }
  function cerchio(cx, cy, r, extra){ return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '"' + (extra || "") + '/>'; }
  function linea(x0, y0, x1, y1){ return '<line x1="' + f(x0) + '" y1="' + f(y0) + '" x2="' + f(x1) + '" y2="' + f(y1) + '"/>'; }
  /* una parola: restituisce { svg (gruppo centrato in 0,0), r: raggio d'ingombro } */
  function parola(p){
    var S = lettere(p); if(!S.length) return null;
    var n = S.length, R = Math.max(26, n * 11), step = Math.PI * 2 / n;
    var rc = Math.min(R * .36, R * Math.sin(step / 2) * .82), rv = Math.max(3, rc * .3);
    var g = [], tagli = [];
    S.forEach(function(s, i){
      var th = Math.PI / 2 - i * step;                  /* dal basso, in senso antiorario */
      var ux = Math.cos(th), uy = Math.sin(th);         /* verso l'esterno */
      var lc = null;
      if(s.c){
        var C = CONS[s.c] || CONS.t, tipo = C[0], d;
        if(tipo === "mz") d = R - rc * .55; else if(tipo === "in") d = R - rc * 1.35; else d = R;
        var cx = ux * d, cy = uy * d; lc = { x: cx, y: cy, tipo: tipo };
        if(tipo === "mz" || tipo === "se"){
          /* punti in cui il cerchio della lettera taglia la parola */
          var cosA = (R * R + d * d - rc * rc) / (2 * R * d); cosA = Math.max(-1, Math.min(1, cosA));
          var dA = Math.acos(cosA); tagli.push([th - dA, th + dA]);
          var cosB = (rc * rc + d * d - R * R) / (2 * rc * d); cosB = Math.max(-1, Math.min(1, cosB));
          var dB = Math.acos(cosB);                       /* parte del cerchio della lettera che resta dentro la parola */
          g.push('<path d="' + arco(cx, cy, rc, th + dB, th + Math.PI * 2 - dB) + '"/>');
        } else g.push(cerchio(cx, cy, rc));
        /* puntini e trattini verso il centro della parola */
        var dentro = th + Math.PI, k;
        for(k = 0; k < C[1]; k++){ var a = dentro + (k - (C[1] - 1) / 2) * .5; g.push(cerchio(cx + Math.cos(a) * rc * .62, cy + Math.sin(a) * rc * .62, Math.max(1.4, rc * .11), ' class="gf-p"')); }
        for(k = 0; k < C[2]; k++){ var b = dentro + (k - (C[2] - 1) / 2) * .42; g.push(linea(cx + Math.cos(b) * rc, cy + Math.sin(b) * rc, cx + Math.cos(b) * (rc + R * .32), cy + Math.sin(b) * (rc + R * .32))); }
      }
      if(s.v){
        var vx, vy, v = s.v;
        if(lc){
          if(v === "a"){ vx = ux * (R + rv * 1.8); vy = uy * (R + rv * 1.8); }
          else if(v === "o"){ vx = lc.x - ux * rc * .95; vy = lc.y - uy * rc * .95; }
          else { vx = lc.x; vy = lc.y; if(lc.tipo === "se"){ vx = ux * (R - rc * .5); vy = uy * (R - rc * .5); } }
        } else {
          var dv = v === "a" ? R + rv * 1.8 : v === "o" ? R - rv * 1.8 : R;
          vx = ux * dv; vy = uy * dv;
          if(dv === R) tagli.push([th - rv / R, th + rv / R]);
        }
        g.push(cerchio(vx, vy, rv));
        if(v === "i") g.push(linea(vx - ux * rv, vy - uy * rv, vx - ux * (rv + R * .38), vy - uy * (rv + R * .38)));
        if(v === "u") g.push(linea(vx + ux * rv, vy + uy * rv, vx + ux * (rv + R * .3), vy + uy * (rv + R * .3)));
      }
    });
    /* il cerchio della parola, interrotto dove le lettere lo tagliano */
    var T = tagli.map(function(t){ var a = t[0], b = t[1]; while(a < 0){ a += Math.PI * 2; b += Math.PI * 2; } return [a, b]; }).sort(function(x, y){ return x[0] - y[0]; });
    if(!T.length) g.unshift(cerchio(0, 0, R));
    else {
      for(var j = 0; j < T.length; j++){
        var fine = T[j][1], inizio = T[(j + 1) % T.length][0] + (j + 1 === T.length ? Math.PI * 2 : 0);
        if(inizio > fine + 1e-3) g.unshift('<path d="' + arco(0, 0, R, fine, inizio) + '"/>');
      }
    }
    return { svg: g.join(""), r: R + rv * 3.2 + R * .05 };
  }
  /* una frase: le parole in cerchio dentro un cerchio grande (una parola sola: solo il suo cerchio, doppio) */
  function frase(t){
    var P = t.split(/\s+/).map(parola).filter(Boolean); if(!P.length) return "";
    var g = [], RR;
    if(P.length === 1){ RR = P[0].r + 8; g.push(P[0].svg); }
    else if(P.length === 2){   /* due parole: una sotto e una sopra */
      var d2 = (P[0].r + P[1].r) / 2 + 3; RR = d2 + Math.max(P[0].r, P[1].r) + 8;
      g.push('<g transform="translate(0,' + f(d2) + ')">' + P[0].svg + '</g>', '<g transform="translate(0,' + f(-d2) + ')">' + P[1].svg + '</g>');
    }
    else {
      var maxr = Math.max.apply(null, P.map(function(p){ return p.r; })), somma = P.reduce(function(a, p){ return a + p.r * 2.15; }, 0);
      var ring = Math.max(somma / (Math.PI * 2), maxr * 1.15); RR = ring + maxr + 8;
      var acc = 0;
      P.forEach(function(p){
        var a = Math.PI / 2 - (acc + p.r * 1.075) / ring; acc += p.r * 2.15;
        g.push('<g transform="translate(' + f(Math.cos(a) * ring) + ',' + f(Math.sin(a) * ring) + ')">' + p.svg + '</g>');
      });
    }
    var L = RR + 6;
    return '<svg class="gf" viewBox="' + f(-L) + ' ' + f(-L) + ' ' + f(L * 2) + ' ' + f(L * 2) + '" role="img" aria-label="Testo in gallifreyano">'
      + '<g fill="none" stroke="currentColor" stroke-width="' + f(Math.max(1.4, L / 150)) + '" stroke-linecap="round">' + cerchio(0, 0, RR) + cerchio(0, 0, RR + 4, ' stroke-width="' + f(Math.max(.8, L / 300)) + '"') + g.join("") + '</g></svg>';
  }
  function gallifreyano(t){
    var frasi = senzaAccenti(t).split(/[.!?;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean);
    return '<div class="gf-blocco">' + frasi.map(frase).join("") + '</div>';
  }

  /* ---------------- l'uscita ---------------- */
  function html(t, pg, opz){
    var l = LINGUA[pg]; opz = opz || {};
    if(l === "rune"){ caricaFontRune(); return '<div class="lg-rune" lang="ang">' + t.split(/\n{2,}/).map(function(p){ return "<p>" + esc(rune(p)).replace(/\n/g, "<br>") + "</p>"; }).join("") + '</div>'; }
    if(l === "occulti") return '<div class="lg-occ">' + t.split(/\n{2,}/).map(function(p){ return "<p>" + esc(occulti(p)).replace(/\n/g, "<br>") + "</p>"; }).join("") + '</div>';
    if(l === "gallifreyano"){ if(opz.img) return '<div class="gf-blocco"><img class="gf-img" src="' + opz.img + '" alt="Testo in gallifreyano"></div>'; return gallifreyano(t); }
    return null;   /* nessuna lingua (o non ancora pronta): chi chiama mostra l'italiano */
  }
  window.LINGUE = {
    html: html, rune: rune, occulti: occulti, gallifreyano: gallifreyano,
    di: function(pg){ return LINGUA[pg] || ""; },
    nome: function(pg){ return NOMI[LINGUA[pg]] || ""; },
    pronta: function(pg){ return !!LINGUA[pg]; }
  };
})();
