/* Esplora la nave — la pagina divisa di ogni zona della Careless Journey.
   A sinistra la stanza vista DALL'ALTO (disegno decorativo che segue i dati), a destra il pannello di UTILITÀ.
   In alto: piano e lato della nave, una piccola mappa della nave vista di lato (la stessa della sezione Nave)
   con la stanza attuale evidenziata, e le frecce per spostarsi: ▲▼ cambiano piano, ◀ va verso prua, ▶ verso poppa.
   Anche le frecce della tastiera spostano tra le stanze (quando non si sta scrivendo).

   Una zona si registra con NAVE.zona(chiave, { sinistra: elemento, destra: elemento, apri(), chiudi(), esc() }):
   - sinistra / destra: gli elementi da mostrare nelle due metà (la cornice li sposta dentro e fuori);
   - apri() / chiudi(): chiamate quando si entra e si esce dalla zona;
   - esc(): facoltativa; se restituisce true, Esc è stato usato dalla zona (per esempio per tornare alla panoramica).
   Le zone non ancora registrate mostrano «In allestimento» e la descrizione della scheda della sezione Nave.
   Per aprire: NAVE.apri("stiva_modulare"). */
(function(){
  "use strict";
  var ZONE = {
    alloggi:        { n: "Alloggi",          e: "🛏️", piano: 1, lato: "poppa",         card: "Alloggi Principali", giu: "mensa",          prua: "ponte_comando" },
    ponte_comando:  { n: "Ponte di Comando", e: "🧭", piano: 1, lato: "prua",          card: "Ponte di Comando",   giu: "sala_mappe",     poppa: "alloggi" },
    mensa:          { n: "Mensa",            e: "🍲", piano: 2, lato: "poppa",         card: "Mensa",              su: "alloggi",         giu: "stiva_modulare", prua: "sala_mappe" },
    sala_mappe:     { n: "Sala Mappe",       e: "🗺️", piano: 2, lato: "prua",          card: "Sala Mappe",         su: "ponte_comando",   giu: "sala_macchine",  prua: "ponte_esterno", poppa: "mensa" },
    ponte_esterno:  { n: "Ponte Esterno",    e: "⛵", piano: 2, lato: "prua esterna",  card: "Ponte Esterno",      poppa: "sala_mappe" },
    stiva_modulare: { n: "Stiva Modulare",   e: "🧩", piano: 3, lato: "poppa",         card: "Stiva Modulare",     su: "mensa",           giu: "stiva_primaria", prua: "sala_macchine" },
    sala_macchine:  { n: "Sala Macchine",    e: "⚙️", piano: 3, lato: "prua",          card: "Sala Macchine",      su: "sala_mappe",      prua: "zona_segreta",  poppa: "stiva_modulare" },
    zona_segreta:   { n: "Stanza delle Reliquie", e: "🗝️", piano: 3, lato: "prua · dietro la Sala Macchine", card: null, poppa: "sala_macchine" },
    stiva_primaria: { n: "Stiva Primaria",   e: "🧰", piano: 4, lato: "poppa",         card: "Stiva Primaria",     su: "stiva_modulare" }
  };
  var DIR = [
    { k: "su", f: "▲", t: "Piano di sopra", tasto: "ArrowUp" },
    { k: "prua", f: "◀", t: "Verso prua", tasto: "ArrowLeft" },
    { k: "poppa", f: "▶", t: "Verso poppa", tasto: "ArrowRight" },
    { k: "giu", f: "▼", t: "Piano di sotto", tasto: "ArrowDown" }
  ];
  var REG = {}, cur = null, aperta = false;
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- la finestra ---------- */
  var ov = document.createElement("div");
  ov.className = "stv-ov nx-ov"; ov.hidden = true;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "nx-t");
  ov.innerHTML = '<div class="stv-sala nx-sala"><div class="stv-lume" aria-hidden="true"></div>'
    + '<div class="nx-top">'
    + '<div class="nx-tit"><div class="stv-k" id="nx-k"></div><h3 class="stv-t" id="nx-t"></h3></div>'
    + '<div class="nx-mini" id="nx-mini" aria-label="Mappa della nave: tocca una stanza per andarci"></div>'
    + '<button type="button" class="mae-x stv-x" id="nx-x" aria-label="Esci">✕</button></div>'
    + '<div class="nx-nav" id="nx-nav" role="navigation" aria-label="Spostati nella nave"></div>'
    + '<div class="nx-corpo" id="nx-corpo">'
    + '<div class="nx-meta nx-sx" role="region" aria-label="Vista dall\'alto"><div class="nx-meta-t">Vista dall\'alto</div><div class="nx-meta-c" id="nx-sx"></div></div>'
    + '<div class="nx-meta nx-dx" role="region" aria-label="Cosa potete fare"><div class="nx-meta-t">Cosa potete fare</div><div class="nx-meta-c" id="nx-dx"></div></div>'
    + '</div></div>';
  document.body.appendChild(ov);

  /* mappa della nave vista di lato: la stessa della sezione Nave, rimpicciolita */
  function mini(){
    var box = $("nx-mini"); if(!box) return;
    if(!box.firstChild){
      var src = document.querySelector("#nave svg.nv-map"); if(!src) return;
      var c = src.cloneNode(true);
      c.removeAttribute("class"); c.setAttribute("class", "nx-mini-svg"); c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("[id]").forEach(function(x){ x.removeAttribute("id"); });
      c.querySelectorAll("text").forEach(function(x){ x.remove(); });
      box.appendChild(c);
      box.addEventListener("click", function(e){ var a = e.target.closest("[data-k]"); if(a && ZONE[a.getAttribute("data-k")]) vai(a.getAttribute("data-k"), null); });
    }
    box.querySelectorAll("[data-k]").forEach(function(a){
      var k = a.getAttribute("data-k");
      a.classList.toggle("nx-qui", k === cur);
      a.classList.toggle("nx-va", !!ZONE[k] && k !== cur);
    });
  }
  function navigazione(){
    var z = ZONE[cur], h = "";
    DIR.forEach(function(d){
      var dest = z[d.k], dz = dest && ZONE[dest];
      h += '<button type="button" class="nx-freccia nx-' + d.k + '" data-vai="' + (dest || "") + '" data-dir="' + d.k + '"' + (dz ? "" : " disabled") + ' title="' + d.t + '" aria-label="' + d.t + (dz ? ": " + esc(dz.n) : ": niente") + '">'
        + '<b aria-hidden="true">' + d.f + '</b><span>' + (dz ? esc(dz.e + " " + dz.n) : "—") + '</span></button>';
    });
    $("nx-nav").innerHTML = h;
  }
  function segnaposto(k){
    var z = ZONE[k], sx = document.createElement("div"), dx = document.createElement("div"), testo = "";
    if(z.card){ var c = [].slice.call(document.querySelectorAll("#nv-cards > .card")).filter(function(x){ var t = x.querySelector(".ct"); return t && t.textContent.trim() === z.card; })[0]; if(c){ var b = c.querySelector(".cb"); testo = b ? b.innerHTML : ""; } }
    sx.className = "nx-vuota"; sx.innerHTML = '<div class="nx-vuota-e" aria-hidden="true">' + z.e + '</div><div class="nx-vuota-t">In allestimento</div><p>La vista dall\'alto di questa stanza arriverà presto.</p>';
    dx.innerHTML = '<div class="sm-h">' + z.e + ' ' + esc(z.n) + '</div>' + (testo ? '<div class="sm-d nx-card">' + testo + '</div>' : '') + '<p class="stv-nota">Cosa si potrà fare qui lo stiamo ancora decidendo.</p>';
    return { sinistra: sx, destra: dx };
  }
  function monta(k, dir){
    var z = ZONE[k], def = REG[k] || segnaposto(k), sx = $("nx-sx"), dx = $("nx-dx");
    if(cur && REG[cur] && REG[cur].chiudi && cur !== k) try { REG[cur].chiudi(); } catch(e){ console.error(e); }
    cur = k;
    $("nx-k").textContent = "Careless Journey · " + z.piano + "° piano · " + z.lato;
    $("nx-t").textContent = z.e + " " + z.n;
    while(sx.firstChild) sx.removeChild(sx.firstChild);
    while(dx.firstChild) dx.removeChild(dx.firstChild);
    sx.appendChild(def.sinistra); dx.appendChild(def.destra);
    dx.scrollTop = 0;
    navigazione(); mini();
    if(def.apri) try { def.apri(); } catch(e){ console.error(e); }
    var corpo = $("nx-corpo");
    if(dir && !RIDOTTO){ corpo.classList.remove("nx-in-su", "nx-in-giu", "nx-in-prua", "nx-in-poppa", "nx-in"); void corpo.offsetWidth; corpo.classList.add("nx-in-" + dir); }
    try { localStorage.setItem("tcj-nx-ultima", k); } catch(e){}
  }
  function vai(k, dir){
    if(!ZONE[k] || k === cur) return;
    suono("paper"); monta(k, dir);
  }

  function apri(k){
    k = ZONE[k] ? k : "stiva_modulare";
    try { if(typeof nvClose === "function") nvClose(); } catch(_){}
    ov.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    aperta = true; cur = null; monta(k, null); suono("gong");
    setTimeout(function(){ try { $("nx-x").focus(); } catch(_){} }, 60);
  }
  function chiudi(){
    if(cur && REG[cur] && REG[cur].chiudi) try { REG[cur].chiudi(); } catch(e){ console.error(e); }
    aperta = false; cur = null;
    ov.classList.remove("on"); setTimeout(function(){ if(!ov.classList.contains("on")) ov.hidden = true; }, 260);
    if(!document.querySelector(".inc-win.on,.cj-overlay.open,.rel-ov.on,.stv-ov.on:not(.nx-ov)")) document.body.style.overflow = "";
  }
  ov.addEventListener("click", function(e){
    if(e.target === ov){ chiudi(); return; }
    if(e.target.closest("#nx-x")){ chiudi(); return; }
    var f = e.target.closest(".nx-freccia"); if(f && !f.disabled) vai(f.getAttribute("data-vai"), f.getAttribute("data-dir"));
  });
  document.addEventListener("keydown", function(e){
    if(!aperta) return;
    if(e.key === "Escape"){
      if(document.querySelector(".tcj-conf.on,.eq-ov.on")) return;
      if(REG[cur] && REG[cur].esc && REG[cur].esc()) return;
      chiudi(); return;
    }
    var t = e.target, scrive = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if(scrive || e.altKey || e.ctrlKey || e.metaKey) return;
    DIR.forEach(function(d){ if(e.key === d.tasto && ZONE[cur][d.k]){ e.preventDefault(); vai(ZONE[cur][d.k], d.k); } });
  });

  window.NAVE = {
    ZONE: ZONE,
    zona: function(k, def){ REG[k] = def; if(aperta && cur === k) monta(k, null); },
    apri: apri, chiudi: chiudi,
    vai: function(k){ if(aperta) vai(k, null); else apri(k); },
    attuale: function(){ return aperta ? cur : null; }
  };
})();
