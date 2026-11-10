/* Caricamento leggero.
   Le parti pesanti che non servono nei primi secondi (le mappe ingrandite dei continenti, il Maelstrom,
   l'isola sconosciuta e i ritratti delle armi dei personaggi) non bloccano più l'apertura del sito:
   arrivano quando servono (vedi in fondo), nello stesso ordine e allo stesso posto di prima.
   Se qualcuno tocca una mappa prima che sia arrivata, il sito la scarica subito e poi la apre da solo.

   Nell'index.html si usa così:
     tcjGruppo("nome", ["file1.js", "file2.js"])   → il gruppo arriva dopo l'apertura della pagina,
                                                     inserito nel punto in cui sta questa riga
     tcjCarica("nome")                              → "mi serve adesso": parte subito (se non è già partito)
                                                     e restituisce una promessa che si risolve quando è pronto */
(function(){
  var gruppi = {}, aperta = false;

  function avvia(g){
    if(g.promessa) return g.promessa;
    g.promessa = new Promise(function(fatto){
      var resto = g.file.length;
      if(!resto){ g.pronto = true; fatto(); return; }
      g.file.forEach(function(src){
        var s = document.createElement("script");
        s.src = src;
        s.async = false;                                  /* eseguiti nell'ordine dell'elenco */
        s.onload = s.onerror = function(){ if(--resto === 0){ g.pronto = true; fatto(); } };
        var posto = g.posto;
        if(posto && posto.parentNode) posto.parentNode.insertBefore(s, posto);
        else document.body.appendChild(s);
      });
    });
    return g.promessa;
  }

  window.tcjGruppo = function(nome, file){
    if(window.TCJ_LEGGERO && nome === "ritratti") file = [];   /* versione leggera: niente animazione di sblocco, i ritratti non servono */
    var g = gruppi[nome] = { file: file, posto: document.currentScript, pronto: false, promessa: null };
    if(aperta) setTimeout(function(){ avvia(g); }, 0);
    return g;
  };
  window.tcjCarica = function(nome){
    var g = gruppi[nome];
    return g ? avvia(g) : Promise.resolve();
  };
  window.tcjPronto = function(nome){ var g = gruppi[nome]; return !g || g.pronto; };

  /* Quando arrivano i gruppi (per alleggerire l'apertura del sito):
     - «mappe»: appena il mouse o il dito arriva sulla Mappa del Mondo (o al primo tocco su una terra, vedi sotto).
       Sul computer, dopo qualche secondo di calma, i file vengono già scaricati (senza costruire nulla), così poi
       la mappa si apre subito;
     - «ritratti»: solo quando servono (animazione di sblocco di un personaggio, js/area-giocatori.js);
     - gli altri gruppi: appena la pagina è aperta, come prima. */
  var SU_RICHIESTA = { ritratti: true, mappe: true };
  function prescarica(g){   /* solo download nella cache del browser: niente viene eseguito o costruito */
    if(!g || g.promessa) return;
    g.file.forEach(function(src){ var l = document.createElement("link"); l.rel = "prefetch"; l.as = "script"; l.href = src; document.head.appendChild(l); });
  }
  window.addEventListener("load", function(){
    aperta = true;
    var catena = Promise.resolve();
    Object.keys(gruppi).forEach(function(n){ if(!SU_RICHIESTA[n]) catena = catena.then(function(){ return avvia(gruppi[n]); }); });
    if(gruppi.mappe){
      /* le mappe ingrandite si aprono solo da un tocco sulla Mappa del Mondo: le preparo appena la mano ci arriva sopra */
      var m = document.getElementById("mappa"), fatto = false;
      var via = function(){ if(fatto) return; fatto = true; ["pointerover", "touchstart", "focusin"].forEach(function(t){ m.removeEventListener(t, via, true); }); avvia(gruppi.mappe); };
      if(m) ["pointerover", "touchstart", "focusin"].forEach(function(t){ m.addEventListener(t, via, { capture: true, passive: true }); });
      else avvia(gruppi.mappe);
      if(!window.TCJ_LEGGERO) setTimeout(function(){ prescarica(gruppi.mappe); }, 6000);
    }
  });

  /* un tocco su una terra o sul Maelstrom prima che le mappe siano arrivate:
     lo trattengo, scarico le mappe e poi ripeto il tocco */
  var BERSAGLI = '[id^="isl-"],[id^="lbl-"],#maelstrom,#pulsar-vortices';
  document.addEventListener("click", function(e){
    if(tcjPronto("mappe") || !e.target || !e.target.closest) return;
    var el = e.target.closest(BERSAGLI); if(!el) return;
    e.preventDefault(); e.stopPropagation();
    document.documentElement.classList.add("tcj-attesa");
    tcjCarica("mappe").then(function(){
      document.documentElement.classList.remove("tcj-attesa");
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
  }, true);
})();
