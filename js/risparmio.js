/* Risparmio: il sito lavora solo dove lo state guardando.
   Le animazioni restano tutte uguali, ma si fermano quando nessuno le può vedere:

   - le animazioni delle sezioni lontane dallo schermo (bagliori, stelle del calendario, gemme, ecc.)
     restano in pausa e ripartono da dove erano appena la sezione torna vicina allo schermo;
   - lo stesso vale per i disegni animati delle mappe (vortici, onde, luci sulla Mappa del Mondo);
   - mentre c'è l'animazione d'apertura o una mappa a tutto schermo, la pagina sotto (che non si vede) è ferma;
   - le particelle di sfondo (js/particelle-sfondo.js) chiedono a questo file se fermarsi.

   Si fermano solo le animazioni che girano all'infinito: quelle che compaiono una volta sola finiscono come prima.
   Non tocca nulla di quello che si vede: niente animazioni tolte, niente effetti diversi.
   Classe usata: .tcj-fuori sulle sezioni lontane, html.tcj-coperto quando la pagina è coperta
   (allora si ferma tutto quello che sta sotto, tranne l'apertura, le novità e la mappa aperta). */
(function(){
  if(!("IntersectionObserver" in window)) { window.tcjCoperto = function(){ return false; }; return; }
  var h = document.documentElement;

  /* sotto la copertura: tutto tranne l'animazione d'apertura, le schermate delle novità e le mappe a tutto schermo */
  var SOTTO = ":not(#intro):not(#nov-ov):not(.cj-overlay)";
  var st = document.createElement("style");
  st.id = "tcj-risparmio";
  st.textContent =
    ".tcj-fuori,.tcj-fuori *,.tcj-fuori *::before,.tcj-fuori *::after," +
    "html.tcj-coperto body>" + SOTTO + ",html.tcj-coperto body>" + SOTTO + " *,html.tcj-coperto body>" + SOTTO + " *::before,html.tcj-coperto body>" + SOTTO + " *::after" +
    ",html.tcj-coperto body::before,html.tcj-coperto body::after" +
    "{animation-play-state:paused!important}" +
    /* l'apertura è opaca e copre tutto: sotto non serve nemmeno disegnare (riappare quando l'apertura sfuma) */
    "html.tcj-intro body>" + SOTTO + ",html.tcj-intro body::before,html.tcj-intro body::after{visibility:hidden!important}";
  document.head.appendChild(st);

  /* disegni animati (SVG con <animate>) dentro un elemento: li metto in pausa o li faccio ripartire */
  function svgAnimati(el){
    var out = [];
    el.querySelectorAll("animate,animateTransform,animateMotion,set").forEach(function(a){
      var s = a.ownerSVGElement; while(s && s.ownerSVGElement) s = s.ownerSVGElement;
      if(s && out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }
  function svgFerma(el, ferma){
    if(window.TCJ_LEGGERO) return;   /* nella versione leggera restano sempre fermi (js/novita.js) */
    svgAnimati(el).forEach(function(s){
      try { if(ferma){ if(!s.animationsPaused()) s.pauseAnimations(); } else if(s.animationsPaused()) s.unpauseAnimations(); } catch(e){}
    });
  }

  /* le animazioni "una volta sola" (comparse, entrate) non si fermano mai: finiscono come prima, anche se non si vedono.
     Il CSS qui sopra mette in pausa tutto; qui faccio ripartire subito quelle che non girano all'infinito. */
  function liberaFinite(root){
    requestAnimationFrame(function(){
      var lista = [];
      try { lista = root === document ? document.getAnimations() : root.getAnimations({ subtree: true }); } catch(e){ return; }
      lista.forEach(function(a){
        try { var t = a.effect && a.effect.getTiming(); if(t && t.iterations !== Infinity && a.playState === "paused") a.play(); } catch(e){}
      });
    });
  }

  /* ---- sezioni vicine o lontane dallo schermo ---- */
  var vicine = new WeakMap();
  function applica(sez){
    var ferma = !vicine.get(sez) || h.classList.contains("tcj-coperto");
    sez.classList.toggle("tcj-fuori", !vicine.get(sez));
    svgFerma(sez, ferma);
    if(ferma && sez.getAnimations) liberaFinite(sez);
  }
  var io = new IntersectionObserver(function(voci){
    voci.forEach(function(v){ vicine.set(v.target, v.isIntersecting); applica(v.target); });
  }, { rootMargin: "300px 0px" });   /* ripartono un attimo prima di entrare nello schermo */
  var osservate = [];
  function cerca(){
    document.querySelectorAll("body>section").forEach(function(s){
      if(osservate.indexOf(s) < 0){ osservate.push(s); vicine.set(s, true); io.observe(s); }
    });
  }
  cerca();
  new MutationObserver(cerca).observe(document.body, { childList: true });

  /* ---- pagina coperta: animazione d'apertura o mappa a tutto schermo ---- */
  function coperta(){
    var intro = document.getElementById("intro");
    if(intro && !intro.classList.contains("hide")) return true;
    return !!document.querySelector(".cj-overlay.open");
  }
  window.tcjCoperto = function(){ return h.classList.contains("tcj-coperto"); };
  var prima = null;
  function controlla(){
    var intro = document.getElementById("intro");
    h.classList.toggle("tcj-intro", !!intro && !intro.classList.contains("hide"));
    var c = coperta();
    if(c === prima) return;
    prima = c;
    h.classList.toggle("tcj-coperto", c);
    osservate.forEach(applica);
    /* disegni animati fuori dalle sezioni (sfondi dei temi): fermi solo mentre la pagina è coperta */
    [].slice.call(document.body.children).forEach(function(el){
      if(el.tagName !== "SECTION" && el.id !== "intro" && !(el.classList && el.classList.contains("cj-overlay"))) svgFerma(el, c);
    });
    if(c && document.getAnimations) liberaFinite(document);
  }
  controlla();
  window.addEventListener("load", function(){ if(prima) liberaFinite(document); });
  new MutationObserver(controlla).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
})();
