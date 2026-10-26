/* ✎ Modifica area — ogni player sistema a modo suo i riquadri della propria Area dello Slayer.

   Il tasto «✎ Modifica area» apre una schermata a widget, come la home di un telefono:
   - i widget si trascinano per cambiare l'ordine (col mouse da tutto il widget, col dito dalla maniglia ⠿);
   - la maniglia ⤡ nell'angolo li allarga/stringe (mezza riga ↔ riga intera) e li allunga/accorcia
     (Intera → Media → Compatta → Chiusa); toccando un widget si apre lo stesso menu a pulsanti;
   - «Conferma» mostra la scheda PRIMA e DOPO, con «Continua a modificare», «Annulla» e «Salva» (attivo dopo 3 secondi).

   Altezza: Intera = tutto il contenuto; Media e Compatta = altezza fissa con scorrimento interno (solo per le sezioni
   che possono diventare lunghe, elenco PZ qui sotto); Chiusa = solo il titolo, si apre col tocco.

   La disposizione sta nella chiave tcj-lay-<pg>, dentro il pacchetto online del personaggio (js/sync-giocatori.js):
   dopo «Salva» viene caricata online subito, se il player ha il token collegato, e lo segue su ogni dispositivo.
   I riquadri sono riconosciuti dall'attributo data-pz in sezioni/scheda.js: per aggiungerne uno nuovo basta dargli
   un data-pz e aggiungerlo a PZ (comparirà nella sua posizione originale anche per chi ha già una disposizione). */
(function(){
  /* [chiave data-pz, icona, nome, si può accorciare (Media/Compatta)?] — nell'ordine originale del sito */
  var PZ = [
    ["licenza","🪪","Licenza dello Slayer",true],
    ["livello","⭐","Livello, rango, Benny e Ispirazioni",false],
    ["pv","❤","Punti Vita",false],
    ["malus","📝","Altri malus e note",false],
    ["stati","🌀","Stati alterati",true],
    ["statistiche","📊","Statistiche",true],
    ["competenze","🎯","Competenze",true],
    ["arma1","⚔","Arma principale",false],
    ["abilita","✨","Abilità dell'arma",false],
    ["nuclei","🔮","Nuclei d'attacco e difesa",false],
    ["arma2","🏹","Arma secondaria",false],
    ["equip","🎒","Equipaggiamento",true],
    ["inventario","📦","Inventario",true],
    ["celle","💎","Celle equipaggiate",true],
    ["corone","👑","Corone Aetheriche",true],
    ["note","📜","Note personali",true],
    ["salvataggi","☁","Salvataggi",false]
  ];
  var ALT_PX = { m: 360, c: 210 };   /* altezza massima nella scheda vera per Media e Compatta */
  var KEYS = PZ.map(function(p){ return p[0]; }), INFO = {}, DEF_W = {};
  PZ.forEach(function(p){ INFO[p[0]] = p; });
  var NOMI_ALT = { i: "Intera", m: "Media", c: "Compatta" };

  function wrap(){ return document.querySelector("#pa-body .sc-wrap:not(.am-clone)"); }
  function chi(){ return (typeof scCur !== "undefined") ? scCur : ""; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function unaColonna(){ return window.matchMedia ? matchMedia("(max-width:640px)").matches : innerWidth <= 640; }

  /* ---------------- disposizione: lettura, scrittura, confronto ---------------- */
  function leggiOriginali(){
    var w = wrap(); if(!w) return;
    KEYS.forEach(function(k){ var c = w.querySelector('[data-pz="' + k + '"]'); if(c && !DEF_W[k]) DEF_W[k] = c.classList.contains("sc-full") ? "f" : "h"; });
  }
  function originale(){ var L = { o: KEYS.slice(), w: {}, a: {}, x: {} }; KEYS.forEach(function(k){ L.w[k] = DEF_W[k] || "f"; L.a[k] = "i"; L.x[k] = false; }); return L; }
  function copia(L){ return JSON.parse(JSON.stringify(L)); }
  /* legge la disposizione salvata e la rende sempre valida: riquadri sconosciuti via, quelli nuovi al loro posto */
  function carica(ch){
    var def = originale(), raw = null;
    try { raw = JSON.parse(localStorage.getItem("tcj-lay-" + ch) || "null"); } catch(e){ raw = null; }
    if(!raw || !Array.isArray(raw.o)) return def;
    var o = raw.o.filter(function(k, i, a){ return INFO[k] && a.indexOf(k) === i; });
    KEYS.forEach(function(k, i){
      if(o.indexOf(k) >= 0) return;
      var prima = -1;
      for(var j = i - 1; j >= 0; j--){ var p = o.indexOf(KEYS[j]); if(p >= 0){ prima = p; break; } }
      o.splice(prima + 1, 0, k);
    });
    var L = { o: o, w: {}, a: {}, x: {} };
    KEYS.forEach(function(k){
      var w = raw.w && raw.w[k], a = raw.a && raw.a[k];
      L.w[k] = (w === "h" || w === "f") ? w : def.w[k];
      L.a[k] = (INFO[k][3] && (a === "m" || a === "c")) ? a : "i";
      L.x[k] = !!(raw.x && raw.x[k]);
    });
    return L;
  }
  function uguale(a, b){ return a.o.join() === b.o.join() && KEYS.every(function(k){ return a.w[k] === b.w[k] && a.a[k] === b.a[k] && !!a.x[k] === !!b.x[k]; }); }
  function scrivi(ch, L){
    try {
      if(uguale(L, originale())) localStorage.removeItem("tcj-lay-" + ch);
      else {   /* salvo solo ciò che serve */
        var a = {}, x = {}; KEYS.forEach(function(k){ if(L.a[k] !== "i") a[k] = L.a[k]; if(L.x[k]) x[k] = 1; });
        localStorage.setItem("tcj-lay-" + ch, JSON.stringify({ o: L.o, w: L.w, a: a, x: x }));
      }
    } catch(e){}
  }

  /* ---------------- applica una disposizione a una scheda (vera o miniatura) ---------------- */
  function applicaA(w, L){
    L.o.forEach(function(k, i){
      var c = w.querySelector('[data-pz="' + k + '"]'); if(!c) return;
      var wd = L.w[k], d = DEF_W[k], al = L.a[k], ch = !!L.x[k];
      c.style.order = String(i);
      c.classList.toggle("sc-full", wd === "f");
      c.classList.toggle("am-stretta", wd === "h" && d === "f");   /* nato largo, ora a mezza riga: impaginazione compatta */
      c.classList.toggle("am-larga", wd === "f" && d === "h");
      c.classList.toggle("am-alt-m", al === "m");
      c.classList.toggle("am-alt-c", al === "c");
      c.style.maxHeight = al === "i" ? "" : ALT_PX[al] + "px";
      c.classList.toggle("am-chiuso", ch);
      var cap = c.querySelector(":scope > .am-cap");
      if(ch && !cap){
        cap = document.createElement("button"); cap.type = "button"; cap.className = "am-cap";
        cap.innerHTML = '<span class="am-cap-i" aria-hidden="true">' + INFO[k][1] + '</span><span class="am-cap-n">' + esc(INFO[k][2]) + '</span><span class="am-cap-f" aria-hidden="true">▸</span>';
        c.insertBefore(cap, c.firstChild);
      }
      if(!ch){ if(cap) cap.remove(); c.classList.remove("am-aperto"); }
      if(cap) cap.setAttribute("aria-expanded", String(c.classList.contains("am-aperto")));
    });
  }
  function applica(){ var w = wrap(); if(!w) return; leggiOriginali(); applicaA(w, carica(chi())); }
  window.amApplica = applica;

  /* i riquadri chiusi si aprono e chiudono col tocco sul titolo (solo per questa visita: la disposizione non cambia) */
  document.addEventListener("click", function(e){
    var cap = e.target.closest && e.target.closest(".sc-wrap:not(.am-clone) .am-cap"); if(!cap) return;
    var c = cap.parentElement, on = !c.classList.contains("am-aperto");
    c.classList.toggle("am-aperto", on); cap.setAttribute("aria-expanded", String(on)); suono("paper");
  });

  /* ogni volta che l'area viene ricostruita (cambio personaggio, scaricamento online…) rimetto la disposizione */
  if(typeof window.scBuild === "function"){
    var _scBuild = window.scBuild;
    window.scBuild = function(){ var r = _scBuild.apply(this, arguments); try { applica(); } catch(e){} return r; };
  }

  /* ================= schermata di modifica ================= */
  var ov = null, grid = null, prima = null, ora = null, nat = {}, natW = {}, vista = "widget", contoT = null;

  function nomeAttuale(){
    var c = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []).find(function(x){ return x.k === chi(); });
    return c ? (c.e + " " + ((typeof PA_FULL !== "undefined" && PA_FULL[c.k]) || c.n)) : "";
  }
  /* altezza naturale di ogni riquadro (senza scorrimento né chiusura), per dare ai widget la grandezza giusta */
  function misura(){
    var w = wrap(); if(!w) return;
    KEYS.forEach(function(k){
      var c = w.querySelector('[data-pz="' + k + '"]'); if(!c) return;
      var cl = ["am-alt-m","am-alt-c","am-chiuso"].filter(function(x){ return c.classList.contains(x); }), mh = c.style.maxHeight;
      cl.forEach(function(x){ c.classList.remove(x); }); c.style.maxHeight = "";
      nat[k] = c.offsetHeight || 200; natW[k] = c.classList.contains("sc-full") ? "f" : "h";
      cl.forEach(function(x){ c.classList.add(x); }); c.style.maxHeight = mh;
    });
  }
  function altezzaVera(k, L){                       /* quanto occuperebbe nella scheda vera */
    if(L.x[k]) return 50;
    var h = nat[k] || 200, uno = unaColonna();
    if(!uno && natW[k] === "h" && L.w[k] === "f") h *= 0.62;
    if(!uno && natW[k] === "f" && L.w[k] === "h") h *= 1.6;
    return L.a[k] === "i" ? h : Math.min(h, ALT_PX[L.a[k]]);
  }
  function altezzaWidget(k, L){ var uno = unaColonna(); return L.x[k] ? 46 : Math.round(Math.max(58, Math.min(uno ? 200 : 260, altezzaVera(k, L) * (uno ? 0.2 : 0.3)))); }
  function etichetta(k, L){
    var t = [];
    if(!unaColonna()) t.push(L.w[k] === "f" ? "Riga intera" : "Mezza riga");
    t.push(L.x[k] ? "Chiusa" : NOMI_ALT[L.a[k]]);
    return t.join(" · ");
  }
  function tile(k, L){
    var p = INFO[k];
    return '<div class="am-t' + (L.w[k] === "f" ? " am-f" : "") + (L.x[k] ? " am-tx" : "") + (L.a[k] !== "i" && !L.x[k] ? " am-tsc" : "") + '" data-k="' + k + '" style="height:' + altezzaWidget(k, L) + 'px">' +
      '<button type="button" class="am-h" aria-label="Sposta: ' + esc(p[2]) + ' (frecce)" title="Trascina per spostare">⠿</button>' +
      '<button type="button" class="am-corpo" aria-label="Grandezza di ' + esc(p[2]) + ': ' + etichetta(k, L) + '"><span class="am-i" aria-hidden="true">' + p[1] + '</span>' +
      '<span class="am-tx2"><span class="am-n">' + esc(p[2]) + '</span><span class="am-sz">' + etichetta(k, L) + '</span></span></button>' +
      (L.a[k] !== "i" && !L.x[k] ? '<span class="am-scroll" aria-hidden="true">⇕</span>' : '') +
      '<span class="am-r" aria-hidden="true" title="Trascina per cambiare la grandezza">⤡</span></div>';
  }
  function disegna(){ grid.innerHTML = ora.o.map(function(k){ return tile(k, ora); }).join(""); aggiornaPiede(); }
  function aggiornaTile(k){
    var t = grid.querySelector('.am-t[data-k="' + k + '"]'); if(!t) return;
    var n = document.createElement("div"); n.innerHTML = tile(k, ora); t.replaceWith(n.firstChild);
  }
  function leggiOrdine(){ ora.o = Array.prototype.map.call(grid.querySelectorAll(".am-t"), function(t){ return t.getAttribute("data-k"); }); }
  function aggiornaPiede(){
    ov.querySelector(".am-reset").disabled = uguale(ora, originale());
    var b = ov.querySelector(".am-conferma"); b.disabled = uguale(ora, prima);
    b.textContent = b.disabled ? "Nessuna modifica" : "Conferma →";
  }

  function crea(){
    if(ov) return;
    ov = document.createElement("div");
    ov.className = "am-ov"; ov.id = "am-ov"; ov.hidden = true;
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "am-tit");
    ov.innerHTML =
      '<div class="am-box" id="am-box">' +
        '<div class="am-head"><div class="am-hd"><div class="am-kick" id="am-chi"></div><h3 class="am-tit" id="am-tit">Sistema la tua area</h3></div>' +
        '<button type="button" class="am-x" aria-label="Chiudi senza salvare">✕</button></div>' +
        /* --- vista 1: widget --- */
        '<div class="am-v am-vw">' +
          '<p class="am-p">Trascina i widget per spostarli. Con <b>⤡</b> nell\'angolo li allarghi, li accorci o li chiudi; toccandoli scegli la grandezza dal menu.</p>' +
          '<div class="am-schermo"><div class="am-grid" id="am-grid"></div></div>' +
          '<div class="am-sheet" id="am-sheet" hidden></div>' +
        '</div>' +
        /* --- vista 2: confronto --- */
        '<div class="am-v am-vc" hidden>' +
          '<p class="am-p">Ecco come cambia la tua area. Puoi tornare ai widget, annullare tutto o salvare.</p>' +
          '<div class="am-cmp" id="am-cmp"><div class="am-col"><div class="am-ct">Prima</div><div class="am-mini" id="am-mini-a"></div></div>' +
          '<div class="am-col"><div class="am-ct am-ct2">Dopo</div><div class="am-mini" id="am-mini-b"></div></div></div>' +
        '</div>' +
        '<div class="am-foot am-fw"><button type="button" class="bk-btn am-reset">↺ Originale</button><span class="am-sp"></span>' +
          '<button type="button" class="bk-btn am-annulla">Annulla</button><button type="button" class="bk-btn am-prim am-conferma">Conferma →</button></div>' +
        '<div class="am-foot am-fc" hidden><button type="button" class="bk-btn am-indietro">← Continua a modificare</button><span class="am-sp"></span>' +
          '<button type="button" class="bk-btn am-annulla">Annulla</button><button type="button" class="bk-btn am-prim am-salva" disabled>✓ Salva</button></div>' +
      '</div>';
    document.body.appendChild(ov);
    grid = ov.querySelector("#am-grid");

    ov.querySelector(".am-x").addEventListener("click", chiudi);
    ov.querySelectorAll(".am-annulla").forEach(function(b){ b.addEventListener("click", chiudi); });
    ov.querySelector(".am-reset").addEventListener("click", function(){ var o = originale(); flip(function(){ ora = o; disegna(); }); suono("paper"); });
    ov.querySelector(".am-conferma").addEventListener("click", confronto);
    ov.querySelector(".am-indietro").addEventListener("click", function(){ mostraVista("widget"); suono("paper"); });
    ov.querySelector(".am-salva").addEventListener("click", salva);
    grid.addEventListener("keydown", function(e){
      var h = e.target.closest(".am-h"); if(!h) return;
      var t = h.closest(".am-t"), d = (e.key === "ArrowUp" || e.key === "ArrowLeft") ? -1 : ((e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : 0);
      if(!d) return; e.preventDefault();
      var altro = d < 0 ? t.previousElementSibling : t.nextElementSibling; if(!altro) return;
      flip(function(){ if(d < 0) grid.insertBefore(t, altro); else grid.insertBefore(altro, t); });
      leggiOrdine(); h.focus(); aggiornaPiede();
    });
    grid.addEventListener("click", function(e){
      if(Date.now() - ultimoTrascino < 350) return;
      var b = e.target.closest(".am-corpo"); if(b) apriMenu(b.closest(".am-t").getAttribute("data-k"));
    });
    grid.addEventListener("pointerdown", inizia);
    ov.querySelector("#am-sheet").addEventListener("click", sceltaMenu);
    document.addEventListener("keydown", function(e){
      if(e.key !== "Escape" || !ov || ov.hidden || trasc) return;
      var sh = ov.querySelector("#am-sheet"); if(!sh.hidden){ chiudiMenu(); return; }
      if(vista === "confronto") mostraVista("widget"); else chiudi();
    });
    window.addEventListener("resize", function(){ if(ov && !ov.hidden && vista === "widget") disegna(); });
  }

  /* la schermata sta sopra tutta la pagina, quindi prende i colori del personaggio direttamente dall'area */
  var VARS = ["--gold-rgb","--bg","--bg2","--bg3","--gold","--gold2","--gold3","--border","--pa-glow","--text","--text2"];
  function colori(){
    var sez = document.getElementById("scheda"); if(!sez) return;
    var cs = getComputedStyle(sez);
    VARS.forEach(function(v){ var x = cs.getPropertyValue(v).trim(); if(x) ov.style.setProperty(v, x); else ov.style.removeProperty(v); });
  }
  var fermo = null;
  window.amApri = function(){
    if(!wrap() || !chi()) return;
    crea(); leggiOriginali(); colori(); misura();
    prima = carica(chi()); ora = copia(prima);
    ov.querySelector("#am-chi").textContent = "Area dello Slayer · " + nomeAttuale();
    mostraVista("widget"); disegna();
    ov.hidden = false; void ov.offsetWidth; ov.classList.add("on");
    fermo = document.documentElement.style.overflow; document.documentElement.style.overflow = "hidden";
    suono("paper");
    setTimeout(function(){ var h = grid.querySelector(".am-h"); if(h) h.focus({ preventScroll: true }); }, 60);
  };
  function chiudi(){
    if(!ov || ov.hidden) return;
    clearInterval(contoT); chiudiMenu();
    ov.classList.remove("on"); ov.hidden = true;
    ov.querySelector("#am-mini-a").innerHTML = ""; ov.querySelector("#am-mini-b").innerHTML = "";
    document.documentElement.style.overflow = fermo || "";
    var b = document.getElementById("am-btn"); if(b) b.focus({ preventScroll: true });
  }
  function mostraVista(v){
    vista = v; clearInterval(contoT);
    ov.querySelector(".am-vw").hidden = v !== "widget"; ov.querySelector(".am-fw").hidden = v !== "widget";
    ov.querySelector(".am-vc").hidden = v !== "confronto"; ov.querySelector(".am-fc").hidden = v !== "confronto";
    ov.querySelector("#am-tit").textContent = v === "widget" ? "Sistema la tua area" : "Prima e dopo";
    ov.querySelector("#am-box").scrollTop = 0;
    if(v === "widget"){ ov.querySelector("#am-mini-a").innerHTML = ""; ov.querySelector("#am-mini-b").innerHTML = ""; }
  }

  /* ---------------- menu a pulsanti di un widget ---------------- */
  var menuK = null;
  function apriMenu(k){
    menuK = k; var p = INFO[k], sh = ov.querySelector("#am-sheet"), L = ora, uno = unaColonna();
    var bt = function(gr, v, txt, on, dis){ return '<button type="button" class="am-op' + (on ? ' on' : '') + '" data-g="' + gr + '" data-v="' + v + '"' + (dis ? ' disabled' : '') + ' aria-pressed="' + on + '">' + txt + '</button>'; };
    sh.innerHTML = '<div class="am-sh-in" role="group" aria-label="Grandezza di ' + esc(p[2]) + '"><div class="am-sh-t"><span>' + p[1] + '</span> ' + esc(p[2]) + '</div>' +
      '<div class="am-sh-l">Larghezza' + (uno ? ' <small>· vale da PC e tablet</small>' : '') + '</div><div class="am-sh-r">' + bt("w","h","◧ Mezza riga",L.w[k] === "h") + bt("w","f","▭ Riga intera",L.w[k] === "f") + '</div>' +
      '<div class="am-sh-l">Altezza</div>' + (p[3]
        ? '<div class="am-sh-r am-sh-3">' + bt("a","i","Intera",L.a[k] === "i") + bt("a","m","Media",L.a[k] === "m") + bt("a","c","Compatta",L.a[k] === "c") + '</div><small class="am-sh-n">Media e Compatta: se il contenuto è più lungo, si scorre dentro il riquadro.</small>'
        : '<small class="am-sh-n">Questa sezione è già corta: resta sempre intera.</small>') +
      '<div class="am-sh-r am-sh-x">' + bt("x","1",(L.x[k] ? "✓ " : "") + "Chiusa: solo il titolo, si apre col tocco",L.x[k]) + '</div>' +
      '<button type="button" class="bk-btn am-prim am-sh-ok" data-g="ok">Fatto</button></div>';
    sh.hidden = false; void sh.offsetWidth; sh.classList.add("on");
    var t = grid.querySelector('.am-t[data-k="' + k + '"]'); if(t) t.classList.add("am-sel");
    setTimeout(function(){ var f = sh.querySelector(".am-op.on") || sh.querySelector(".am-op"); if(f) f.focus(); }, 30);
    suono("paper");
  }
  function chiudiMenu(){
    if(!ov) return; var sh = ov.querySelector("#am-sheet"); if(sh.hidden) return;
    sh.classList.remove("on"); sh.hidden = true;
    var t = grid.querySelector(".am-sel"); if(t){ t.classList.remove("am-sel"); var c = t.querySelector(".am-corpo"); if(c) c.focus({ preventScroll: true }); }
    menuK = null;
  }
  function sceltaMenu(e){
    var b = e.target.closest("button"); if(!b || !menuK){ if(e.target.id === "am-sheet") chiudiMenu(); return; }
    var g = b.getAttribute("data-g"), v = b.getAttribute("data-v"), k = menuK;
    if(g === "ok"){ chiudiMenu(); return; }
    flip(function(){
      if(g === "w") ora.w[k] = v;
      if(g === "a"){ ora.a[k] = v; ora.x[k] = false; }
      if(g === "x") ora.x[k] = !ora.x[k];
      aggiornaTile(k);
    });
    var t = grid.querySelector('.am-t[data-k="' + k + '"]'); if(t) t.classList.add("am-sel");
    aggiornaPiede(); apriMenu(k);
  }

  /* animazione morbida quando i widget cambiano posto o grandezza (FLIP) */
  function flip(cambia, salta){
    var tt = Array.prototype.slice.call(grid.querySelectorAll(".am-t")), pos = new Map();
    tt.forEach(function(t){ if(t !== salta) pos.set(t.getAttribute("data-k"), t.getBoundingClientRect()); });
    cambia();
    grid.querySelectorAll(".am-t").forEach(function(t){
      if(t === salta) return; var r = pos.get(t.getAttribute("data-k")); if(!r) return;
      var n = t.getBoundingClientRect(), dx = r.left - n.left, dy = r.top - n.top;
      if(!dx && !dy) return;
      t.style.transition = "none"; t.style.transform = "translate(" + dx + "px," + dy + "px)";
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ t.style.transition = "transform .22s ease"; t.style.transform = ""; }); });
    });
  }

  /* ================= trascinamento: spostare e ridimensionare (mouse e dita) ================= */
  var trasc = null, ultimoTrascino = 0;
  function inizia(e){
    if(e.button !== undefined && e.button !== 0) return;
    var t = e.target.closest(".am-t"); if(!t) return;
    var r = e.target.closest(".am-r"), h = e.target.closest(".am-h");
    if(r){ iniziaRidim(e, t); return; }
    if(!h && e.pointerType !== "mouse") return;            /* col dito si sposta solo dalla maniglia, così la schermata scorre */
    var rc = t.getBoundingClientRect();
    trasc = { tipo: "sposta", t: t, id: e.pointerId, gx: e.clientX - rc.left, gy: e.clientY - rc.top, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, box: ov.querySelector("#am-box"), raf: 0, mosso: false };
    if(h){ e.preventDefault(); try { h.setPointerCapture(e.pointerId); } catch(_){} }   /* col mouse sul widget catturo solo quando parte il trascinamento, così un clic apre il menu */
    ascolta();
  }
  function iniziaRidim(e, t){
    e.preventDefault();
    var k = t.getAttribute("data-k"), rc = t.getBoundingClientRect();
    trasc = { tipo: "ridim", t: t, k: k, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, w0: rc.width, h0: rc.height, box: ov.querySelector("#am-box"), raf: 0, mosso: true,
      colW: (grid.clientWidth - 10) / 2 };
    t.classList.add("am-ridim"); grid.classList.add("am-dragging");
    try { e.target.setPointerCapture(e.pointerId); } catch(_){}
    ascolta();
  }
  function ascolta(){
    document.addEventListener("pointermove", muovi, { passive: false });
    document.addEventListener("pointerup", lascia);
    document.addEventListener("pointercancel", lascia);
  }
  function muovi(e){
    if(!trasc || e.pointerId !== trasc.id) return;
    trasc.x = e.clientX; trasc.y = e.clientY;
    if(trasc.tipo === "ridim"){ e.preventDefault(); ridimensiona(); return; }
    if(!trasc.mosso){
      if(Math.hypot(trasc.x - trasc.x0, trasc.y - trasc.y0) < 6) return;      /* è un clic, non ancora un trascinamento */
      trasc.mosso = true; try { trasc.t.setPointerCapture(trasc.id); } catch(_){} trasc.t.classList.add("am-drag"); grid.classList.add("am-dragging"); trasc.t.style.transition = "none"; scorri();
    }
    e.preventDefault(); riordina(); segui();
  }
  function segui(){
    var t = trasc.t; t.style.transform = "";
    var r = t.getBoundingClientRect();
    t.style.transform = "translate(" + (trasc.x - trasc.gx - r.left) + "px," + (trasc.y - trasc.gy - r.top) + "px) scale(1.03)";
  }
  function riordina(){
    var t = trasc.t, x = trasc.x, y = trasc.y, sopra = null;
    grid.querySelectorAll(".am-t").forEach(function(o){
      if(o === t) return; var r = o.getBoundingClientRect();
      if(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) sopra = { o: o, r: r };
    });
    if(!sopra){
      var ult = grid.lastElementChild;
      if(ult && ult !== t && y > ult.getBoundingClientRect().bottom) flip(function(){ grid.appendChild(t); }, t);
      return;
    }
    var o = sopra.o, r = sopra.r, primo;
    if(o.classList.contains("am-f") || grid.offsetWidth - r.width < 40) primo = y < r.top + r.height / 2;
    else primo = x < r.left + r.width / 2;
    var dove = primo ? o : o.nextElementSibling;
    if(dove === t || (primo && o.previousElementSibling === t) || (!primo && o.nextElementSibling === t)) return;
    flip(function(){ grid.insertBefore(t, dove); }, t);
  }
  /* ridimensionamento: a destra/sinistra cambia la larghezza, in su/giù l'altezza (fino a chiudere il widget) */
  function ridimensiona(){
    var k = trasc.k, dx = trasc.x - trasc.x0, dy = trasc.y - trasc.y0, cambio = false;
    if(!unaColonna()){
      var w = (trasc.w0 + dx) > trasc.colW * 1.45 ? "f" : "h";
      if(w !== ora.w[k]){ ora.w[k] = w; cambio = true; }
    }
    var scelte = [{ x: true, a: ora.a[k] }].concat((INFO[k][3] ? ["c","m","i"] : ["i"]).map(function(a){ return { x: false, a: a }; }));
    var voluta = trasc.h0 + dy, migliore = null, dist = 1e9;
    scelte.forEach(function(s){
      var L = { w: ora.w, a: {}, x: {} }; L.a[k] = s.a; L.x[k] = s.x;
      var d = Math.abs(altezzaWidget(k, L) - voluta); if(d < dist - 2){ dist = d; migliore = s; }
    });
    if(migliore && (migliore.x !== !!ora.x[k] || (!migliore.x && migliore.a !== ora.a[k]))){ ora.x[k] = migliore.x; if(!migliore.x) ora.a[k] = migliore.a; cambio = true; }
    if(cambio){
      flip(function(){ aggiornaTile(k); });
      trasc.t = grid.querySelector('.am-t[data-k="' + k + '"]'); trasc.t.classList.add("am-ridim");
      aggiornaPiede();
    }
  }
  function scorri(){
    if(!trasc) return;
    var b = trasc.box, r = b.getBoundingClientRect(), m = 70, v = 0;
    if(trasc.y < r.top + m) v = -Math.ceil((r.top + m - trasc.y) / 6);
    else if(trasc.y > r.bottom - m) v = Math.ceil((trasc.y - (r.bottom - m)) / 6);
    if(v){ var p = b.scrollTop; b.scrollTop += v; if(b.scrollTop !== p && trasc.tipo === "sposta"){ riordina(); segui(); } }
    trasc.raf = requestAnimationFrame(scorri);
  }
  function lascia(e){
    if(!trasc || (e && e.pointerId !== trasc.id)) return;
    var t = trasc.t, mosso = trasc.mosso, tipo = trasc.tipo;
    cancelAnimationFrame(trasc.raf);
    document.removeEventListener("pointermove", muovi);
    document.removeEventListener("pointerup", lascia);
    document.removeEventListener("pointercancel", lascia);
    trasc = null;
    grid.classList.remove("am-dragging");
    if(t){ t.classList.remove("am-ridim"); if(mosso && tipo === "sposta"){ t.style.transition = "transform .2s ease"; t.style.transform = ""; t.classList.remove("am-drag"); setTimeout(function(){ t.style.transition = ""; }, 220); } }
    if(mosso){ ultimoTrascino = Date.now(); leggiOrdine(); aggiornaPiede(); suono("paper"); }
  }

  /* ================= confronto prima / dopo ================= */
  function clona(){
    var w = wrap(), c = w.cloneNode(true), orig = w.querySelectorAll("input,textarea,select"), cop = c.querySelectorAll("input,textarea,select");
    c.classList.add("am-clone"); c.classList.remove("am-nuova"); c.setAttribute("inert", ""); c.setAttribute("aria-hidden", "true");
    c.querySelectorAll("[name]").forEach(function(x){ x.removeAttribute("name"); });     /* niente gruppi in comune con la scheda vera */
    for(var i = 0; i < cop.length && i < orig.length; i++){
      var o = orig[i], d = cop[i];
      if(o.type === "checkbox" || o.type === "radio") d.checked = o.checked;
      else if(o.type !== "file") d.value = o.value;
    }
    var ocv = w.querySelectorAll("canvas"), ccv = c.querySelectorAll("canvas");
    for(var j = 0; j < ccv.length && j < ocv.length; j++){ try { ccv[j].getContext("2d").drawImage(ocv[j], 0, 0); } catch(_){} }
    c.querySelectorAll("[id]").forEach(function(x){ x.removeAttribute("id"); });
    c.querySelectorAll("[for]").forEach(function(x){ x.removeAttribute("for"); });
    c.querySelectorAll(".am-aperto").forEach(function(x){ x.classList.remove("am-aperto"); });
    c.style.width = w.clientWidth + "px"; c.style.maxWidth = "none"; c.style.margin = "0";
    return c;
  }
  function miniatura(dove, L){
    var c = clona(), scena = document.createElement("div"), W = wrap().clientWidth;
    scena.className = "am-mini-in"; scena.appendChild(c); dove.innerHTML = ""; dove.appendChild(scena);
    applicaA(c, L);
    var s = Math.min(1, dove.clientWidth / W);
    scena.style.width = W + "px"; scena.style.transform = "scale(" + s + ")";
    dove.style.height = Math.ceil(c.offsetHeight * s) + "px";
  }
  function confronto(){
    if(uguale(ora, prima)) return;
    chiudiMenu(); mostraVista("confronto");
    var a = ov.querySelector("#am-mini-a"), b = ov.querySelector("#am-mini-b");
    requestAnimationFrame(function(){ miniatura(a, prima); miniatura(b, ora); });
    var bs = ov.querySelector(".am-salva"), n = 3;
    bs.disabled = true; bs.textContent = "✓ Salva (" + n + ")";
    contoT = setInterval(function(){ n--; if(n > 0) bs.textContent = "✓ Salva (" + n + ")"; else { clearInterval(contoT); bs.disabled = false; bs.textContent = "✓ Salva"; } }, 1000);
    suono("paper");
  }

  /* ================= salvataggio ================= */
  function stato(t){
    var st = document.getElementById("pa-status"); if(!st) return;
    var p = st.getAttribute("data-am") === "1" ? st.getAttribute("data-prima") : st.textContent;
    st.setAttribute("data-prima", p); st.setAttribute("data-am", "1"); st.textContent = t;
    clearTimeout(stato.t); stato.t = setTimeout(function(){ if(st.getAttribute("data-am") === "1"){ st.textContent = st.getAttribute("data-prima"); st.removeAttribute("data-am"); } }, 4000);
  }
  function salva(){
    if(ov.querySelector(".am-salva").disabled) return;
    var k = chi(), L = copia(ora);
    scrivi(k, L); applica(); chiudi(); suono("on");
    var w = wrap(); if(w){ w.classList.remove("am-nuova"); void w.offsetWidth; w.classList.add("am-nuova"); }
    var sez = document.getElementById("scheda"); if(sez) sez.scrollIntoView({ behavior: "smooth", block: "start" });
    var g = window.ghSync;
    if(g && g.salvaSeLibero && g.collegato && g.collegato(k)){
      stato("✓ Disposizione salvata · ☁ la carico online…");
      g.salvaSeLibero(k).then(function(r){
        if(r === "ok"){ var n = 0, t = setInterval(function(){ var s = g.stato(k) || {}; n++; if(!s.dirty){ clearInterval(t); stato("✓ Disposizione salvata anche online ☁"); } else if(n > 40) clearInterval(t); }, 250); }
        else if(r === "occupato") stato("✓ Disposizione salvata · premi «☁ Salva online» quando ha finito di sincronizzare");
        else if(r === "errore") stato("✓ Disposizione salvata su questo dispositivo · online non è riuscito");
      });
    } else stato("✓ Disposizione salvata su questo dispositivo");
  }

  /* le larghezze originali si leggono subito, prima che qualcuno le cambi */
  try { leggiOriginali(); } catch(e){}
  function avvio(){ try { applica(); } catch(e){} }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvio); else avvio();
})();
