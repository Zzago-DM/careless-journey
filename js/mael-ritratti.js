/* I Mael — le raffigurazioni nelle schede della sezione «I Mael» (sezioni/mael.js).
   Ogni Mael ha la sua raffigurazione mitologica, un telo medievale (media/mael/<nome>-mito.webp).
   Chi è già stato incontrato ha anche la raffigurazione di oggi (media/mael/<nome>-oggi.webp): sotto l'immagine
   compaiono i due pulsanti «Mitologica» e «Oggi». Per aggiungere un Mael incontrato basta mettere la sua immagine
   in media/mael/ e scrivere il suo nome in OGGI qui sotto.
   Toccando l'immagine si apre in grande. La scelta Mitologica/Oggi resta salvata in questo browser. */
(function(){
  "use strict";
  var wrap = document.getElementById("ml-cards"); if(!wrap) return;
  var MAEL = ["estarossa", "symael", "azrael", "raphael", "gabrael", "mykael"];
  var OGGI = {};   /* es. { estarossa: "Estarossa oggi, governatrice di Ramsgate" } */
  function scelta(k){ try { return localStorage.getItem("tcj-mael-vis-" + k) === "oggi" && OGGI[k] ? "oggi" : "mito"; } catch(e){ return "mito"; } }
  function src(k, v){ return "media/mael/" + k + "-" + v + ".webp"; }
  function nome(card){ var t = card.querySelector(".ct"); return t ? t.textContent.trim() : ""; }
  function didascalia(k, v, n){ return v === "oggi" ? (typeof OGGI[k] === "string" && OGGI[k] ? OGGI[k] : n + " oggi") : n + " nel mito"; }
  MAEL.forEach(function(k){
    var card = wrap.querySelector('.card[data-mk="' + k + '"]'); if(!card) return;
    var n = nome(card), v = scelta(k);
    var fig = document.createElement("figure"); fig.className = "ml-fig";
    fig.innerHTML = '<button type="button" class="ml-fig-b" aria-label="Apri in grande la raffigurazione di ' + n + '"><img src="' + src(k, v) + '" alt="Raffigurazione di ' + n + '" loading="lazy" decoding="async" width="720" height="960"></button>'
      + '<figcaption>' + didascalia(k, v, n) + '</figcaption>'
      + (OGGI[k] ? '<div class="ml-vis" role="group" aria-label="Quale raffigurazione"><button type="button" data-v="mito" aria-pressed="' + (v === "mito") + '">Mitologica</button><button type="button" data-v="oggi" aria-pressed="' + (v === "oggi") + '">Oggi</button></div>' : "");
    var corpo = document.createElement("div"); corpo.className = "ml-corpo";
    while(card.firstChild) corpo.appendChild(card.firstChild);
    card.appendChild(fig); card.appendChild(corpo); card.classList.add("ml-con-fig");
    fig.addEventListener("click", function(e){
      var b = e.target.closest("[data-v]");
      if(b){
        var nv = b.getAttribute("data-v"); try { localStorage.setItem("tcj-mael-vis-" + k, nv); } catch(_){}
        fig.querySelector("img").src = src(k, nv); fig.querySelector("figcaption").textContent = didascalia(k, nv, n);
        [].forEach.call(fig.querySelectorAll("[data-v]"), function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        try { if(typeof sfxPlay === "function") sfxPlay("flip"); } catch(_){}
        return;
      }
      if(e.target.closest(".ml-fig-b")) grande(fig.querySelector("img").src, didascalia(k, scelta(k), n));
    });
  });
  function grande(s, t){
    var o = document.createElement("div"); o.className = "ml-lb"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", t);
    o.innerHTML = '<figure><img src="' + s + '" alt="' + t + '"><figcaption>' + t + '</figcaption></figure><button type="button" class="ml-lb-x" aria-label="Chiudi">✕</button>';
    document.body.appendChild(o);
    function via(){ if(o.parentNode) o.parentNode.removeChild(o); document.removeEventListener("keydown", tasto); }
    function tasto(e){ if(e.key === "Escape") via(); }
    o.addEventListener("click", via); document.addEventListener("keydown", tasto);
    try { o.querySelector(".ml-lb-x").focus({ preventScroll: true }); } catch(_){}
    try { if(typeof sfxPlay === "function") sfxPlay("paper"); } catch(_){}
  }
})();
