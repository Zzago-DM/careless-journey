/* Caricamento leggero.
   Le parti pesanti che non servono nei primi secondi (le mappe ingrandite dei continenti, il Maelstrom,
   l'isola sconosciuta e i ritratti delle armi dei personaggi) non bloccano più l'apertura del sito:
   arrivano in sottofondo appena la pagina è aperta, nello stesso ordine e allo stesso posto di prima.
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
    var g = gruppi[nome] = { file: file, posto: document.currentScript, pronto: false, promessa: null };
    if(aperta) setTimeout(function(){ avvia(g); }, 0);
    return g;
  };
  window.tcjCarica = function(nome){
    var g = gruppi[nome];
    return g ? avvia(g) : Promise.resolve();
  };
  window.tcjPronto = function(nome){ var g = gruppi[nome]; return !g || g.pronto; };

  /* appena la pagina è aperta: prima le mappe, poi il resto */
  window.addEventListener("load", function(){
    aperta = true;
    var ordine = Object.keys(gruppi).sort(function(a, b){ return (a === "mappe" ? 0 : 1) - (b === "mappe" ? 0 : 1); });
    var catena = Promise.resolve();
    ordine.forEach(function(n){ catena = catena.then(function(){ return avvia(gruppi[n]); }); });
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
