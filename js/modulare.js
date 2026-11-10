/* Navigazione a moduli — una scelta in più nel menu ⚔ Slayer › Aspetto del sito.

   Di base il sito è una pagina unica che scorre dall'alto in basso. Con «A moduli» si vede una sezione alla volta:
   i pulsanti in alto (e i pulsanti «◀ / ▶» in fondo a ogni sezione) passano da una sezione all'altra con una sola
   animazione breve da sinistra a destra, come una diapositiva. Una sezione lunga si scorre normalmente, ma finisce lì.

   - La scelta sta in localStorage «tcj-modulare» («1» = a moduli) ed è di questo dispositivo.
     Lo script in testa a index.html mette subito la classe html.tcj-mod, così la pagina non "salta" all'apertura.
   - I moduli sono le sezioni principali (section[id] figlie di body) più la Zona Master (#ms), nell'ordine della pagina.
     Una sezione nascosta dal sito stesso (per esempio #mondo) resta fuori.
   - Ogni link interno (#qualcosa), e ogni scrollIntoView del sito verso un punto di un'altra sezione,
     prima apre quella sezione e poi ci arriva: così funzionano senza modifiche i pulsanti che portano alla mappa,
     alla Zona Master, all'Area Slayer, ecc.
   - L'indirizzo resta #sezione: ricaricando si torna sulla stessa sezione. */
(function(){
  "use strict";
  var h = document.documentElement, KEY = "tcj-modulare";
  function leggi(){ try { return localStorage.getItem(KEY) === "1"; } catch(e){ return false; } }
  var attivo = leggi(), cur = null;
  var RIDOTTO = false; try { RIDOTTO = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(e){}

  function moduli(){
    var out = [];
    [].forEach.call(document.body.children, function(el){
      if(!el.id) return;
      var sez = el.tagName === "SECTION", ms = el.id === "ms";
      if(!sez && !ms) return;
      if(el.style.display === "none") return;          /* nascosta dal sito: non è un modulo */
      out.push(el);
    });
    return out;
  }
  function moduloDi(el){
    while(el && el.parentElement !== document.body) el = el.parentElement;
    if(!el) return null;
    return moduli().indexOf(el) >= 0 ? el : null;
  }
  var NOMI = { hero: "Inizio", ms: "Zona Master" };
  function nome(m){
    if(NOMI[m.id]) return NOMI[m.id];
    var a = document.querySelector('.nav-links a[href="#' + m.id + '"]');
    if(a) return a.textContent.trim();
    var t = m.querySelector(".st, h2"); return t ? t.textContent.trim() : m.id;
  }

  /* pulsanti «◀ precedente · successiva ▶» in fondo al modulo (prima del piè di pagina) */
  var barra = document.createElement("div"); barra.id = "mod-barra"; barra.setAttribute("aria-label", "Sezioni");
  function disegnaBarra(){
    var L = moduli(), i = L.indexOf(cur), pr = L[i - 1], nx = L[i + 1];
    barra.innerHTML = (pr ? '<button type="button" class="mod-b" data-mod="' + pr.id + '">◀ ' + nome(pr) + '</button>' : '<span></span>')
      + '<span class="mod-pos">' + (i + 1) + ' / ' + L.length + '</span>'
      + (nx ? '<button type="button" class="mod-b" data-mod="' + nx.id + '">' + nome(nx) + ' ▶</button>' : '<span></span>');
    var f = document.querySelector("body > footer");
    if(f && barra.nextElementSibling !== f) document.body.insertBefore(barra, f);
  }
  barra.addEventListener("click", function(e){ var b = e.target.closest("[data-mod]"); if(b) vai(document.getElementById(b.getAttribute("data-mod"))); });

  function evidenzia(){
    [].forEach.call(document.querySelectorAll(".nav-links a"), function(a){ a.classList.toggle("active", !!cur && a.getAttribute("href") === "#" + cur.id); });
    /* sul telefono i pulsanti in alto scorrono di lato: porto in vista quello della sezione aperta */
    var on = document.querySelector(".nav-links a.active"), ul = on && on.closest(".nav-links");
    if(ul && ul.scrollWidth > ul.clientWidth + 2){ var li = on.parentElement; try { ul.scrollTo({ left: li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2, behavior: RIDOTTO ? "auto" : "smooth" }); } catch(e){} }
  }
  /* mostra il modulo m; se c'è un punto preciso (dove), ci arriva dopo l'animazione */
  function vai(m, dove, opz){
    if(!m) return;
    var stesso = m === cur;
    if(!stesso){
      if(cur) cur.classList.remove("mod-cur", "mod-in");
      cur = m; m.classList.add("mod-cur");
      if(!RIDOTTO && !(opz && opz.subito)){
        m.classList.remove("mod-in"); void m.offsetWidth; m.classList.add("mod-in");
      }
      h.style.scrollBehavior = "auto"; window.scrollTo(0, 0); h.style.scrollBehavior = "";
      disegnaBarra(); evidenzia();
      try { history.replaceState(null, "", "#" + m.id); } catch(e){}
      try { window.dispatchEvent(new Event("scroll")); window.dispatchEvent(new Event("resize")); } catch(e){}
    }
    if(dove && dove !== m) setTimeout(function(){ try { ORIG.call(dove, { behavior: "smooth", block: "start" }); } catch(e){} }, stesso ? 0 : 60);
    else if(stesso && !dove) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  /* l'animazione lascia il modulo senza trasformazioni alla fine (le parti fisse dentro le sezioni restano al loro posto) */
  document.addEventListener("animationend", function(e){ if(e.target.classList && e.target.classList.contains("mod-in") && e.animationName === "tcjModIn") e.target.classList.remove("mod-in"); });

  /* link interni: aprono il modulo giusto */
  document.addEventListener("click", function(e){
    if(!attivo || e.defaultPrevented) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if(!a) return;
    var id = a.getAttribute("href").slice(1); if(!id) return;
    var el = document.getElementById(id); if(!el) return;
    var m = moduloDi(el); if(!m) return;
    e.preventDefault();
    vai(m, el === m ? null : el);
  }, true);

  /* scrollIntoView del sito verso un'altra sezione: prima apro il modulo */
  var ORIG = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(){
    if(attivo){ var m = moduloDi(this); if(m && m !== cur){ vai(m, this === m ? null : this); return; } }
    return ORIG.apply(this, arguments);
  };
  /* il colore del pulsante attivo nel menu in alto segue il modulo, non lo scorrimento */
  function aggancia(){
    if(typeof window.updNav !== "function" || window.updNav.__mod) return;
    var orig = window.updNav;
    window.updNav = function(){ if(attivo) return evidenzia(); return orig.apply(this, arguments); };
    window.updNav.__mod = true;
    try { window.removeEventListener("scroll", orig); window.addEventListener("scroll", window.updNav, { passive: true }); } catch(e){}
  }

  function accendi(daMenu){
    h.classList.add("tcj-mod"); aggancia();
    var L = moduli(); if(!L.length) return;
    var da = null, id = (location.hash || "").slice(1);
    if(id){ var el = document.getElementById(id); da = el ? moduloDi(el) : null; }
    if(!da && cur && L.indexOf(cur) >= 0) da = cur;
    if(!da && daMenu === true){   /* passando da «a scorrimento» resto sulla sezione che si stava guardando */
      var y = window.scrollY + 90; L.forEach(function(s){ if(s.offsetTop <= y) da = s; });
    }
    cur = null; vai(da || L[0], null, { subito: true });
  }
  function spegni(){
    var m = cur;
    h.classList.remove("tcj-mod");
    moduli().forEach(function(s){ s.classList.remove("mod-cur", "mod-in"); });
    if(barra.parentNode) barra.parentNode.removeChild(barra);
    if(m){ h.style.scrollBehavior = "auto"; ORIG.call(m, { block: "start" }); h.style.scrollBehavior = ""; }
    if(typeof window.updNav === "function") window.updNav();
  }
  window.tcjModulare = function(){ return attivo; };
  window.tcjModulareSet = function(v){
    attivo = v === "moduli" || v === true;
    try { if(attivo) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch(e){}
    if(attivo) accendi(true); else spegni();
    try { if(typeof slRender === "function") slRender(); } catch(e){}
  };
  /* riga del menu (la inserisce slRender in js/area-giocatori.js, nel riquadro «Aspetto del sito») */
  window.tcjModulareRiga = function(){
    return '<div class="sl-row sl-mq"><div><span>Navigazione</span><small>' + (attivo ? "Una sezione alla volta, si cambia con i pulsanti in alto" : "Tutto il sito in una pagina che scorre") + '</small></div>' +
      '<select class="sl-mqsel" aria-label="Navigazione del sito" onchange="tcjModulareSet(this.value)">' +
      '<option value="scorrimento"' + (attivo ? "" : " selected") + '>↕ A scorrimento</option>' +
      '<option value="moduli"' + (attivo ? " selected" : "") + '>▭ A moduli</option></select></div>';
  };
  /* la Zona Master compare dopo l'accesso: se si è a moduli, ci si arriva da sola (lo fa già il sito con scrollIntoView) */
  if(attivo){ if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ accendi(); }); else accendi(); }
  window.addEventListener("hashchange", function(){ if(!attivo) return; var el = document.getElementById(location.hash.slice(1)); var m = el && moduloDi(el); if(m && m !== cur) vai(m, el === m ? null : el); });
})();
