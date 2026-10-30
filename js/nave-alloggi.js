/* Esplora la nave › Alloggi (js/nave-esplora.js).
   A sinistra gli alloggi visti dall'alto: un corridoio stretto (metà della navata della Stiva Modulare) e 3 cabine
   per lato, grandi come gli spazi della Stiva Modulare (x × ¾x). Babordo a sinistra, tribordo a destra, come AL_SLOTS.
   A destra il pannello degli alloggi di sempre (js/area-giocatori.js: alRender, alPick, alTry…): il suo contenitore
   #al-body viene spostato qui finché si è negli Alloggi e poi rimesso nella sua finestra. La pianta segue il pannello:
   la cabina aperta (o quella di cui si sta chiedendo la password) è evidenziata. */
(function(){
  "use strict";
  if(!window.NAVE || typeof AL_SLOTS === "undefined") return;
  var X = 220, P = 165, C = 110, W = 2 * X + C, H = 3 * P;
  var WOOD = "#2a1d12", WALL = "#a87c3c";
  var COL = { athena: "#7ec8e3", panlan: "#8860d0", asonnes: "#4a9640" };
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function pg(k){ return SC_CHARS.filter(function(c){ return c.k === k; })[0]; }
  function aperto(k){ try { return paIsOpen(k); } catch(e){ return false; } }
  function master(){ try { return paMaster(); } catch(e){ return false; } }
  function titolo(k){ var o = null; try { o = alLoad(k); } catch(e){} var c = pg(k); return (o && o.t) || ("Alloggio di " + (c ? c.n : k)); }

  /* ---------- disegno ---------- */
  var g;
  function r(x, y, w, h, f, s, sw, rx, ex){ g.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function c(x, y, R, f, s, sw, ex){ g.push('<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + f + '" stroke="' + (s || "none") + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function l(x1, y1, x2, y2, s, sw, ex){ g.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + s + '" stroke-width="' + (sw || 1) + '" ' + (ex || "") + '/>'); }
  function pavimento(x, y, w, h, col){ r(x, y, w, h, col); for(var i = 1; i < w / 22; i++) l(x + i * 22, y + 2, x + i * 22, y + h - 2, "rgba(0,0,0,.18)"); }
  /* una cabina con la porta a destra (x 0..X, y 0..P): alloggio comodo per chi passa mesi a bordo.
     Bagno chiuso in alto a sinistra (vasca ampia usata anche come doccia, lavabo, WC e bidet), letto da una piazza e mezza in basso a sinistra
     con comodino, armadio capiente e scrivania con cassetti lungo la parete di fondo, due poltrone con tavolino al centro.
     col = colore della coperta del personaggio; null = alloggio libero (letto con lenzuola grigie, niente luci accese) */
  function cabina(col){
    var vivo = !!col, coperta = col || "#8a8478";
    /* bagno */
    r(4, 4, 84, 92, "#cfc6b4", "#a87c3c", 2.5, 2);                                                         /* pavimento di piastrelle */
    for(var i = 1; i < 6; i++){ l(4, 4 + i * 15.3, 88, 4 + i * 15.3, "rgba(0,0,0,.08)"); l(4 + i * 14, 4, 4 + i * 14, 96, "rgba(0,0,0,.08)"); }
    l(88, 34, 88, 62, "#cfc6b4", 4);                                                                       /* porta del bagno: sul lato verso l'armadio, non davanti al letto */
    r(8, 8, 38, 66, "#f2efe8", "#8a8478", 1.5, 12); r(13, 13, 28, 56, "#a8d4e8", "", 0, 10, 'opacity=".8"');   /* vasca ampia, usata anche come doccia */
    c(27, 15, 4.5, "#c8c0b0", "#8a8478", 1); for(var s = -2; s <= 2; s++) l(27 + s * 2, 20, 27 + s * 4, 30, "rgba(255,255,255,.55)", 1);   /* soffione */
    l(46, 30, 46, 74, "rgba(200,235,250,.9)", 2.5);                                                       /* vetro della doccia */
    r(58, 8, 26, 16, "#f2efe8", "#8a8478", 1.5, 6); c(71, 16, 4, "#a8d4e8");                              /* lavabo */
    r(56, 36, 26, 22, "#8a5a3a", "", 0, 3, 'opacity=".6"');                                               /* tappetino */
    r(52, 72, 14, 18, "#f2efe8", "#8a8478", 1.5, 6); r(70, 72, 14, 18, "#f2efe8", "#8a8478", 1.5, 6);       /* WC e bidet */
    /* zona notte */
    r(6, 104, 82, 56, "#5a3d22", "#3a2614", 1.5, 3);                                                        /* letto da una piazza e mezza */
    r(9, 108, 14, 22, "#f2efe8", "", 0, 4); r(9, 132, 14, 22, "#f2efe8", "", 0, 4);                         /* cuscini */
    r(26, 107, 59, 50, coperta, "", 0, 3, 'opacity="' + (vivo ? ".9" : ".55") + '"'); l(30, 107, 30, 157, "rgba(255,255,255,.25)", 2);
    r(92, 140, 18, 18, "#6a4526", "#3a2614", 1.5); c(101, 149, 4, vivo ? "#ffd27a" : "#5a4a3a", "", 0, vivo ? 'class="nxa-lume"' : "");   /* comodino e lume */
    /* armadio e scrivania lungo la parete di fondo */
    r(96, 4, 58, 18, "#4a2c13", "#2a1a0a", 1.5); l(125, 4, 125, 22, "#2a1a0a", 1.5); c(121, 13, 1.5, "#c8a04a"); c(129, 13, 1.5, "#c8a04a");   /* armadio */
    r(160, 4, 54, 22, "#6a4526", "#3a2614", 1.5); for(var j = 0; j < 3; j++) l(166 + j * 16, 20, 174 + j * 16, 20, "#c8a04a", 1.5);          /* scrivania con cassetti */
    if(vivo){ r(168, 7, 16, 10, "#e6dccd"); c(204, 12, 3.5, "#ffd27a", "", 0, 'class="nxa-lume"'); }
    c(187, 34, 8, "#5a3d22", "#3a2614", 1.5);                                                               /* sedia */
    /* salottino */
    r(104, 56, 92, 74, vivo ? "#5a2a2a" : "#3a3028", vivo ? "#8a5a3a" : "#4a4038", 2, 4, 'opacity=".75"');   /* tappeto */
    r(136, 82, 30, 22, "#6a4526", "#3a2614", 1.5, 3);                                                      /* tavolino */
    if(vivo) c(151, 93, 3, col);
    r(108, 76, 22, 30, "#7a3a2a", "#4a1f15", 1.5, 6); r(108, 76, 6, 30, "#5a2a1e", "", 0, 3);                /* poltrona */
    r(172, 76, 22, 30, "#7a3a2a", "#4a1f15", 1.5, 6); r(188, 76, 6, 30, "#5a2a1e", "", 0, 3);                /* poltrona */
    c(206, 140, 8, "#3a5a2a", "#2a3a1a", 1.5); c(206, 140, 4, "#5aa04a");                                  /* pianta */
    r(118, 150, 60, 10, "#3d2614", "#5a3d22", 1);                                                           /* cassettiera bassa */
  }
  function etichetta(cx, y, testo, icona, w){
    var stima = testo.length * 6.9 + 22, lw = Math.min(w, stima), stretto = stima > w;
    return '<g class="sm-etq sm-etq-l"><rect x="' + (cx - lw / 2) + '" y="' + (y - 15) + '" width="' + lw + '" height="22" rx="11" fill="rgba(12,9,7,.82)" stroke="rgba(210,168,90,.45)"/>'
      + '<text x="' + cx + '" y="' + y + '" fill="#ecc77e" font-size="12" text-anchor="middle"' + (stretto ? ' textLength="' + (w - 18) + '" lengthAdjust="spacingAndGlyphs"' : '') + '>' + esc(testo) + '</text></g>'
      + '<g class="sm-etq sm-etq-i"><circle cx="' + cx + '" cy="' + (y - 14) + '" r="25" fill="rgba(12,9,7,.82)" stroke="rgba(210,168,90,.55)" stroke-width="2"/>'
      + '<text x="' + cx + '" y="' + (y - 4) + '" fill="#ecc77e" font-size="26" text-anchor="middle">' + icona + '</text></g>';
  }
  function pianta(){
    var scelta = (typeof alCur !== "undefined" && alCur) || (typeof alAsk !== "undefined" && alAsk) || null;
    var out = '<svg class="sm-svg nxa-svg" viewBox="-6 -24 ' + (W + 12) + ' ' + (H + 48) + '" role="img" aria-label="Alloggi visti dall\'alto">';
    out += '<text x="' + (X / 2) + '" y="-8" fill="#a39478" font-size="12" text-anchor="middle" letter-spacing="3">BABORDO</text>'
      + '<text x="' + (X + C + X / 2) + '" y="-8" fill="#a39478" font-size="12" text-anchor="middle" letter-spacing="3">TRIBORDO</text>';
    /* corridoio */
    g = []; pavimento(X, 0, C, H, "#2e2014");
    r(X + 22, 10, C - 44, H - 20, "#6a1f1f", "#c8a04a", 1.5, 2, 'opacity=".85"'); r(X + 28, 16, C - 56, H - 32, "none", "rgba(200,160,74,.55)", 1, 1);   /* passatoia */
    for(var j = 0; j < 3; j++){ c(X + 6, j * P + P / 2, 4, "#ffd27a", "", 0, 'class="nxa-lume"'); c(X + C - 6, j * P + P / 2, 4, "#ffd27a", "", 0, 'class="nxa-lume"'); }
    out += g.join("");
    var hit = "";
    AL_SLOTS.forEach(function(riga, i){
      riga.forEach(function(k, lato){
        var x = lato ? X + C : 0, y = i * P, col = k ? (COL[k] || "#7a4a3a") : null;
        g = []; pavimento(0, 0, X, P, WOOD); cabina(col);
        out += '<g transform="translate(' + x + ',' + y + ')' + (lato ? ' translate(' + X + ',0) scale(-1,1)' : '') + '">' + g.join("") + '</g>';
        var px = lato ? x : x + X;
        out += '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="' + (X - 3) + '" height="' + (P - 3) + '" fill="none" stroke="' + WALL + '" stroke-width="3"/>'
          + '<line x1="' + px + '" y1="' + (y + P / 2 - 20) + '" x2="' + px + '" y2="' + (y + P / 2 + 20) + '" stroke="#2e2014" stroke-width="7"/>';
        var c0 = k ? pg(k) : null, chiuso = k && !aperto(k) && !master();
        /* l'etichetta sta sul salottino, lontana dal letto */
        out += etichetta(x + (lato ? X - 150 : 150), y + P - 14, k ? (chiuso ? "🔒 " : "") + titolo(k) : "Alloggio libero", k ? c0.e : "🚪", 134);
        var on = k && k === scelta;
        hit += '<rect class="sm-hit' + (on ? " on" : "") + (k ? "" : " nxa-libero") + '" data-al="' + (k || "") + '" x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (X - 6) + '" height="' + (P - 6) + '" rx="4"'
          + (k ? ' tabindex="0" role="button" aria-label="' + esc(titolo(k)) + (chiuso ? ", serve la password" : "") + '"' : ' aria-hidden="true"') + '/>';
      });
    });
    out += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="#d2a85a" stroke-width="5"/>' + hit + '</svg>';
    return out;
  }

  /* ---------- le due metà ---------- */
  var sx = document.createElement("div"); sx.className = "sm-pianta";
  var dx = document.createElement("div"); dx.className = "nxa-destra";
  dx.innerHTML = '<p class="stv-nota sm-intro">Sei cabine, tre per lato del corridoio. Toccate la vostra per entrare: ognuno vede solo la propria.</p>';
  var dentro = false, oss = null;
  function disegna(){ if(dentro) sx.innerHTML = pianta(); }
  function scegli(k){ if(!k) return; try { alPick(k); } catch(e){ console.error(e); } disegna(); if(window.innerWidth <= 860) try { dx.scrollIntoView({ behavior: "smooth", block: "start" }); } catch(_){} }
  sx.addEventListener("click", function(e){ var h = e.target.closest(".sm-hit"); if(h) scegli(h.getAttribute("data-al")); });
  sx.addEventListener("keydown", function(e){ if((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("sm-hit")){ e.preventDefault(); scegli(e.target.getAttribute("data-al")); } });

  NAVE.zona("alloggi", {
    sinistra: sx, destra: dx,
    apri: function(){
      var body = document.getElementById("al-body"); if(!body) return;
      dentro = true; dx.appendChild(body);
      alCur = null; alAsk = null; alRender();
      if(window.MutationObserver){ oss = new MutationObserver(disegna); oss.observe(body, { childList: true }); }
      disegna();
    },
    chiudi: function(){
      if(oss){ oss.disconnect(); oss = null; }
      try { clearTimeout(alT); if(alCur) alSave(); } catch(e){}
      alCur = null; alAsk = null; dentro = false;
      var body = document.getElementById("al-body"), mod = document.querySelector("#al-ov .al-mod");
      if(body && mod) mod.appendChild(body);
    },
    esc: function(){ if(alCur || alAsk){ try { clearTimeout(alT); if(alCur) alSave(); } catch(e){} alCur = null; alAsk = null; alRender(); return true; } return false; }
  });
})();
