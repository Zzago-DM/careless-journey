/* ✎ Modifica area — ogni player sistema a modo suo i riquadri della propria Area dello Slayer.
   Il tasto «✎ Modifica area» (barra in cima all'area) apre una schermata con i riquadri in versione compatta:
   si trascinano dalla maniglia ⠿ per cambiare l'ordine, e con ◧ / ▭ si sceglie se un riquadro occupa
   mezza riga o tutta la riga. «Salva disposizione» la applica; «Ripristina originale» torna all'ordine del sito.

   La disposizione sta nella chiave del browser  tcj-lay-<pg>  e fa parte del pacchetto del personaggio
   (js/sync-giocatori.js), quindi con «☁ Salva online» segue il player su ogni dispositivo.
   I riquadri sono riconosciuti dall'attributo data-pz in sezioni/scheda.js: per aggiungerne uno nuovo
   basta dargli un data-pz e aggiungerlo all'elenco PZ qui sotto (finisce nella sua posizione originale). */
(function(){
  /* [chiave data-pz, icona, nome mostrato nella schermata di modifica] — nell'ordine originale del sito */
  var PZ = [
    ["licenza","🪪","Licenza dello Slayer"],
    ["livello","⭐","Livello, rango, Benny e Ispirazioni"],
    ["pv","❤","Punti Vita"],
    ["malus","📝","Altri malus e note"],
    ["stati","🌀","Stati alterati"],
    ["statistiche","📊","Statistiche"],
    ["competenze","🎯","Competenze"],
    ["arma1","⚔","Arma principale"],
    ["abilita","✨","Abilità dell'arma"],
    ["nuclei","🔮","Nuclei d'attacco e difesa"],
    ["arma2","🏹","Arma secondaria"],
    ["equip","🎒","Equipaggiamento"],
    ["inventario","📦","Inventario"],
    ["monete","💰","Monete"],
    ["celle","💎","Celle equipaggiate"],
    ["corone","👑","Corone Aetheriche"],
    ["note","📜","Note personali"],
    ["salvataggi","☁","Salvataggi"]
  ];
  var KEYS = PZ.map(function(p){ return p[0]; }), INFO = {}, DEF_W = {};
  PZ.forEach(function(p){ INFO[p[0]] = p; });

  function wrap(){ return document.querySelector("#pa-body .sc-wrap"); }
  function card(k){ var w = wrap(); return w ? w.querySelector('[data-pz="' + k + '"]') : null; }
  function chi(){ return (typeof scCur !== "undefined") ? scCur : ""; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  /* larghezze originali, lette dal sito così com'è (prima di qualsiasi modifica) */
  function leggiOriginali(){
    KEYS.forEach(function(k){ var c = card(k); if(c && !DEF_W[k]) DEF_W[k] = c.classList.contains("sc-full") ? "f" : "h"; });
  }
  function originale(){ var w = {}; KEYS.forEach(function(k){ w[k] = DEF_W[k] || "f"; }); return { o: KEYS.slice(), w: w }; }

  /* legge la disposizione salvata e la rende sempre valida: riquadri sconosciuti via, quelli nuovi al loro posto */
  function carica(ch){
    var def = originale(), raw = null;
    try { raw = JSON.parse(localStorage.getItem("tcj-lay-" + ch) || "null"); } catch(e){ raw = null; }
    if(!raw || !Array.isArray(raw.o)) return def;
    var o = raw.o.filter(function(k, i, a){ return INFO[k] && a.indexOf(k) === i; });
    KEYS.forEach(function(k, i){
      if(o.indexOf(k) >= 0) return;
      var prima = -1;                                  /* lo metto dopo il riquadro che lo precede nell'ordine originale */
      for(var j = i - 1; j >= 0; j--){ var p = o.indexOf(KEYS[j]); if(p >= 0){ prima = p; break; } }
      o.splice(prima + 1, 0, k);
    });
    var w = {}; KEYS.forEach(function(k){ var v = raw.w && raw.w[k]; w[k] = (v === "h" || v === "f") ? v : def.w[k]; });
    return { o: o, w: w };
  }
  function uguale(a, b){ return a.o.join() === b.o.join() && KEYS.every(function(k){ return a.w[k] === b.w[k]; }); }

  /* applica la disposizione del personaggio attuale ai riquadri veri (senza spostarli nella pagina: cambia solo l'ordine visivo) */
  function applica(){
    if(!wrap()) return;
    leggiOriginali();
    var L = carica(chi());
    L.o.forEach(function(k, i){
      var c = card(k); if(!c) return;
      var w = L.w[k], d = DEF_W[k];
      c.style.order = String(i);
      c.classList.toggle("sc-full", w === "f");
      c.classList.toggle("am-stretta", w === "h" && d === "f");   /* era larga, ora è a mezza riga: impaginazione compatta */
      c.classList.toggle("am-larga", w === "f" && d === "h");
    });
  }
  window.amApplica = applica;

  /* ogni volta che l'area viene ricostruita (cambio personaggio, scaricamento online…) rimetto la disposizione */
  if(typeof window.scBuild === "function"){
    var _scBuild = window.scBuild;
    window.scBuild = function(){ var r = _scBuild.apply(this, arguments); try { applica(); } catch(e){} return r; };
  }

  /* ================= schermata di modifica ================= */
  var ov = null, grid = null, stato = null, fermo = null;

  function nomeAttuale(){
    var c = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []).find(function(x){ return x.k === chi(); });
    return c ? (c.e + " " + ((typeof PA_FULL !== "undefined" && PA_FULL[c.k]) || c.n)) : "";
  }
  function tile(k, w){
    var p = INFO[k];
    return '<div class="am-t' + (w === "f" ? " am-f" : "") + '" data-k="' + k + '">' +
      '<button type="button" class="am-h" aria-label="Sposta: ' + esc(p[2]) + ' (frecce su e giù)" title="Trascina per spostare">⠿</button>' +
      '<span class="am-i" aria-hidden="true">' + p[1] + '</span><span class="am-n">' + esc(p[2]) + '</span>' +
      '<button type="button" class="am-w" aria-label="Larghezza di ' + esc(p[2]) + '">' + (w === "f" ? "▭ Intera" : "◧ Mezza") + '</button></div>';
  }
  function disegna(L){
    grid.innerHTML = L.o.map(function(k){ return tile(k, L.w[k]); }).join("");
  }
  function leggiGriglia(){
    var o = [], w = {};
    grid.querySelectorAll(".am-t").forEach(function(t){ var k = t.getAttribute("data-k"); o.push(k); w[k] = t.classList.contains("am-f") ? "f" : "h"; });
    return { o: o, w: w };
  }
  function aggiornaPiede(){
    var L = leggiGriglia(), r = ov.querySelector(".am-reset");
    r.disabled = uguale(L, originale());
    ov.querySelector(".am-salva").disabled = uguale(L, stato);
  }

  function crea(){
    if(ov) return;
    ov = document.createElement("div");
    ov.className = "am-ov"; ov.id = "am-ov"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "am-tit");
    ov.innerHTML =
      '<div class="am-box" id="am-box">' +
        '<div class="am-head"><div><div class="am-kick" id="am-chi"></div><h3 class="am-tit" id="am-tit">Sistema la tua area</h3>' +
        '<p class="am-p">Trascina i riquadri dalla maniglia <b>⠿</b> per cambiarne l\'ordine. Con <b>◧ Mezza</b> e <b>▭ Intera</b> scegli se un riquadro occupa mezza riga o tutta la riga.</p>' +
        '<p class="am-p am-tel">Sul telefono i riquadri stanno sempre uno sotto l\'altro: qui conta l\'ordine, la larghezza vale da PC e tablet.</p></div>' +
        '<button type="button" class="am-x" aria-label="Chiudi senza salvare">✕</button></div>' +
        '<div class="am-grid" id="am-grid"></div>' +
        '<div class="am-foot"><button type="button" class="bk-btn am-reset">↺ Ripristina originale</button><span class="am-sp"></span>' +
        '<button type="button" class="bk-btn am-annulla">Annulla</button><button type="button" class="bk-btn am-salva">✓ Salva disposizione</button></div>' +
      '</div>';
    document.body.appendChild(ov);
    grid = ov.querySelector("#am-grid");

    ov.querySelector(".am-x").addEventListener("click", chiudi);
    ov.querySelector(".am-annulla").addEventListener("click", chiudi);
    ov.querySelector(".am-salva").addEventListener("click", salva);
    ov.querySelector(".am-reset").addEventListener("click", function(){ flip(function(){ disegna(originale()); }); aggiornaPiede(); suono("paper"); });
    grid.addEventListener("click", function(e){
      var b = e.target.closest(".am-w"); if(!b) return;
      var t = b.closest(".am-t");
      flip(function(){ var f = !t.classList.contains("am-f"); t.classList.toggle("am-f", f); b.textContent = f ? "▭ Intera" : "◧ Mezza"; });
      aggiornaPiede();
    });
    grid.addEventListener("keydown", function(e){
      var h = e.target.closest(".am-h"); if(!h) return;
      var t = h.closest(".am-t"), d = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : 0);
      if(!d) return; e.preventDefault();
      var altro = d < 0 ? t.previousElementSibling : t.nextElementSibling; if(!altro) return;
      flip(function(){ if(d < 0) grid.insertBefore(t, altro); else grid.insertBefore(altro, t); });
      h.focus(); aggiornaPiede();
    });
    grid.addEventListener("pointerdown", inizia);
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && ov && !ov.hidden && !trasc) chiudi(); });
  }

  /* la schermata sta sopra tutta la pagina, quindi prende i colori del personaggio direttamente dall'area */
  var VARS = ["--gold-rgb","--bg","--bg2","--bg3","--gold","--gold2","--gold3","--border","--pa-glow","--text","--text2"];
  function colori(){
    var sez = document.getElementById("scheda"); if(!sez) return;
    var cs = getComputedStyle(sez);
    VARS.forEach(function(v){ var x = cs.getPropertyValue(v).trim(); if(x) ov.style.setProperty(v, x); else ov.style.removeProperty(v); });
  }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }

  window.amApri = function(){
    if(!wrap() || !chi()) return;
    crea(); leggiOriginali();
    stato = carica(chi());
    colori();
    ov.querySelector("#am-chi").textContent = "Area dello Slayer · " + nomeAttuale();
    disegna(stato); aggiornaPiede();
    ov.hidden = false; void ov.offsetWidth; ov.classList.add("on");
    fermo = document.documentElement.style.overflow; document.documentElement.style.overflow = "hidden";
    ov.querySelector("#am-box").scrollTop = 0;
    suono("paper");
    setTimeout(function(){ var h = grid.querySelector(".am-h"); if(h) h.focus({ preventScroll: true }); }, 60);
  };
  function chiudi(){
    if(!ov || ov.hidden) return;
    ov.classList.remove("on"); ov.hidden = true;
    document.documentElement.style.overflow = fermo || "";
    var b = document.getElementById("am-btn"); if(b) b.focus({ preventScroll: true });
  }
  function salva(){
    var L = leggiGriglia(), k = chi();
    try {
      if(uguale(L, originale())) localStorage.removeItem("tcj-lay-" + k);
      else localStorage.setItem("tcj-lay-" + k, JSON.stringify({ o: L.o, w: L.w }));
    } catch(e){}
    applica(); chiudi(); suono("on");
    var w = wrap(); if(w){ w.classList.remove("am-nuova"); void w.offsetWidth; w.classList.add("am-nuova"); }
    var st = document.getElementById("pa-status");
    if(st){ var prima = st.textContent; st.textContent = "✓ Disposizione salvata"; setTimeout(function(){ if(st.textContent === "✓ Disposizione salvata") st.textContent = prima; }, 2200); }
    var sez = document.getElementById("scheda"); if(sez) sez.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* animazione morbida quando i riquadri cambiano posto (FLIP) */
  function flip(cambia, salta){
    var tt = Array.prototype.slice.call(grid.querySelectorAll(".am-t")), prima = new Map();
    tt.forEach(function(t){ if(t !== salta) prima.set(t, t.getBoundingClientRect()); });
    cambia();
    prima.forEach(function(r, t){
      var n = t.getBoundingClientRect(), dx = r.left - n.left, dy = r.top - n.top;
      if(!dx && !dy) return;
      t.style.transition = "none"; t.style.transform = "translate(" + dx + "px," + dy + "px)";
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ t.style.transition = "transform .22s ease"; t.style.transform = ""; }); });
    });
  }

  /* ================= trascinamento (mouse e dita) ================= */
  var trasc = null;
  function inizia(e){
    if(e.button !== undefined && e.button !== 0) return;
    var h = e.target.closest(".am-h"), t = e.target.closest(".am-t");
    if(!t || e.target.closest(".am-w")) return;
    if(!h && e.pointerType !== "mouse") return;         /* col dito si trascina solo dalla maniglia, così la pagina scorre */
    e.preventDefault();
    var r = t.getBoundingClientRect();
    trasc = { t: t, id: e.pointerId, gx: e.clientX - r.left, gy: e.clientY - r.top, x: e.clientX, y: e.clientY, box: ov.querySelector("#am-box"), raf: 0, mosso: false };
    t.classList.add("am-drag"); grid.classList.add("am-dragging");
    t.style.transition = "none";
    try { (h || t).setPointerCapture(e.pointerId); } catch(_){}
    document.addEventListener("pointermove", muovi, { passive: false });
    document.addEventListener("pointerup", lascia);
    document.addEventListener("pointercancel", lascia);
    segui(); scorri();
  }
  function segui(){
    if(!trasc) return;
    var t = trasc.t;
    t.style.transform = "";
    var r = t.getBoundingClientRect();
    t.style.transform = "translate(" + (trasc.x - trasc.gx - r.left) + "px," + (trasc.y - trasc.gy - r.top) + "px) scale(1.02)";
  }
  function muovi(e){
    if(!trasc || e.pointerId !== trasc.id) return;
    e.preventDefault();
    trasc.x = e.clientX; trasc.y = e.clientY; trasc.mosso = true;
    riordina(); segui();
  }
  function riordina(){
    var t = trasc.t, x = trasc.x, y = trasc.y, sopra = null;
    grid.querySelectorAll(".am-t").forEach(function(o){
      if(o === t) return;
      var r = o.getBoundingClientRect();
      if(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) sopra = { o: o, r: r };
    });
    if(!sopra){                                          /* sotto l'ultimo riquadro: va in fondo */
      var ult = grid.lastElementChild;
      if(ult && ult !== t && y > ult.getBoundingClientRect().bottom) flip(function(){ grid.appendChild(t); }, t);
      return;
    }
    var o = sopra.o, r = sopra.r, prima;
    if(o.classList.contains("am-f") || grid.offsetWidth - r.width < 40) prima = y < r.top + r.height / 2;
    else prima = x < r.left + r.width / 2;
    var dove = prima ? o : o.nextElementSibling;
    if(dove === t || (prima && o.previousElementSibling === t) || (!prima && o.nextElementSibling === t)) return;
    flip(function(){ grid.insertBefore(t, dove); }, t);
  }
  function scorri(){                                     /* vicino ai bordi la schermata scorre da sola */
    if(!trasc) return;
    var b = trasc.box, r = b.getBoundingClientRect(), m = 70, v = 0;
    if(trasc.y < r.top + m) v = -Math.ceil((r.top + m - trasc.y) / 6);
    else if(trasc.y > r.bottom - m) v = Math.ceil((trasc.y - (r.bottom - m)) / 6);
    if(v){ var prima = b.scrollTop; b.scrollTop += v; if(b.scrollTop !== prima){ riordina(); segui(); } }
    trasc.raf = requestAnimationFrame(scorri);
  }
  function lascia(e){
    if(!trasc || (e && e.pointerId !== trasc.id)) return;
    var t = trasc.t, mosso = trasc.mosso;
    cancelAnimationFrame(trasc.raf);
    document.removeEventListener("pointermove", muovi);
    document.removeEventListener("pointerup", lascia);
    document.removeEventListener("pointercancel", lascia);
    trasc = null;
    t.style.transition = "transform .2s ease"; t.style.transform = "";
    t.classList.remove("am-drag"); grid.classList.remove("am-dragging");
    setTimeout(function(){ t.style.transition = ""; }, 220);
    if(mosso){ aggiornaPiede(); suono("paper"); }
  }

  /* le larghezze originali si leggono subito, prima che qualcuno le cambi */
  try { leggiOriginali(); } catch(e){}
  /* prima applicazione, appena la pagina è pronta */
  function avvio(){ try { applica(); } catch(e){} }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvio); else avvio();
})();
