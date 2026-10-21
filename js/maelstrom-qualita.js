/* Animazione del Maelstrom: qualità Alta / Media / Bassa, scelta nel menu in alto a destra (⚔ Slayer ▾).
   Alta  = la scena attuale a clessidra (sezioni/mappe/maelstrom-scena.html), la più pesante.
   Media = la stessa scena alleggerita (meno scie, nubi e rocce, 30 fotogrammi al secondo, risoluzione normale).
   Bassa = la vista originale del Maelstrom in SVG (sezioni/mappe/maelstrom-scena-originale.html), la più leggera.
   La scelta resta in questo browser (chiave tcj_mael). Se nessuno ha scelto: Media su telefoni e tablet, Alta sul computer. */
(function(){
  var LIVELLI = [["alta","Alta"],["media","Media"],["bassa","Bassa"]];
  function predefinita(){
    var tocco = false, poca = false;
    try { tocco = matchMedia("(pointer: coarse)").matches || Math.min(screen.width, screen.height) < 820; } catch(e){}
    try { poca = navigator.deviceMemory && navigator.deviceMemory <= 4; } catch(e){}
    return (tocco || poca) ? "media" : "alta";
  }
  window.maelQ = function(){
    var v = null; try { v = localStorage.getItem("tcj_mael"); } catch(e){}
    return (v === "alta" || v === "media" || v === "bassa") ? v : predefinita();
  };
  /* l'indirizzo della scena da caricare nella vista del Maelstrom */
  window.maelScena = function(f){
    var q = maelQ();
    if(q === "bassa") return f.getAttribute("data-bassa") || f.getAttribute("data-src");
    var s = f.getAttribute("data-src");
    return q === "media" ? s + (s.indexOf("?") >= 0 ? "&" : "?") + "q=media" : s;
  };
  window.maelQSet = function(v){
    try { localStorage.setItem("tcj_mael", v); } catch(e){}
    var o = document.getElementById("cj-maelstrom"), f = o && o.querySelector("iframe[data-src]");
    if(f && f.getAttribute("src")){                      /* già caricata: la cambio subito se la vista è aperta, altrimenti alla prossima apertura */
      if(o.classList.contains("open")) f.setAttribute("src", maelScena(f)); else f.removeAttribute("src");
    }
    try { if(typeof slRender === "function") slRender(); } catch(e){}
  };
  /* riga del menu (la inserisce slRender in js/area-giocatori.js) */
  window.maelQRiga = function(){
    var q = maelQ();
    return '<div class="sl-row sl-mq"><div><span>Animazione del Maelstrom</span><small>Alta è la più ricca, Bassa la più leggera</small></div>' +
      '<select class="sl-mqsel" aria-label="Qualità dell\'animazione del Maelstrom" onchange="maelQSet(this.value)">' +
      LIVELLI.map(function(l){ return '<option value="' + l[0] + '"' + (l[0] === q ? ' selected' : '') + '>' + l[1] + '</option>'; }).join("") + '</select></div>';
  };
})();
