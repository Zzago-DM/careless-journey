/* Schermata di conferma per le scelte delicate (per esempio «Scollega questo dispositivo»).
   Uso: tcjConferma({titolo, testo, si, no, attesa}).then(function(ok){ if(ok){ ... } });
   - il pulsante di conferma (rosso) si attiva solo dopo qualche secondo, così un doppio tocco per sbaglio non basta;
   - «Annulla», il tasto Esc o un tocco fuori dalla finestra chiudono senza fare nulla. */
(function(){
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  window.tcjConferma = function(o){
    o = o || {};
    return new Promise(function(fatto){
      var vecchia = document.getElementById("tcj-conf"); if(vecchia) vecchia.remove();
      var attesa = o.attesa == null ? 3 : o.attesa, si = o.si || "Sì, procedi", ov = document.createElement("div");
      ov.id = "tcj-conf"; ov.className = "tcj-conf"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "tcj-conf-t");
      ov.innerHTML = '<div class="tcj-conf-box"><div class="tcj-conf-ic">⚠</div><div class="tcj-conf-t" id="tcj-conf-t">' + esc(o.titolo || "Sei sicuro?") + '</div>'
        + '<div class="tcj-conf-s">' + (o.testo || "") + '</div>'
        + '<div class="tcj-conf-b"><button type="button" class="tcj-conf-no">' + esc(o.no || "Annulla") + '</button>'
        + '<button type="button" class="tcj-conf-si" disabled></button></div></div>';
      document.body.appendChild(ov);
      var bSi = ov.querySelector(".tcj-conf-si"), bNo = ov.querySelector(".tcj-conf-no"), t = null, finito = false;
      function chiudi(ok){
        if(finito) return; finito = true; clearInterval(t); document.removeEventListener("keydown", tasto, true);
        ov.classList.remove("on"); setTimeout(function(){ ov.remove(); }, 220); fatto(!!ok);
      }
      function tasto(e){ if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); chiudi(false); } }
      function conta(){
        if(attesa > 0){ bSi.disabled = true; bSi.textContent = si + " (" + attesa + ")"; attesa--; }
        else { clearInterval(t); bSi.disabled = false; bSi.textContent = si; }
      }
      conta(); t = setInterval(conta, 1000);
      bNo.onclick = function(){ chiudi(false); };
      bSi.onclick = function(){ if(!bSi.disabled) chiudi(true); };
      ov.addEventListener("click", function(e){ if(e.target === ov) chiudi(false); });
      document.addEventListener("keydown", tasto, true);
      requestAnimationFrame(function(){ ov.classList.add("on"); bNo.focus(); });
      try{ sfxPlay("deny"); }catch(_){}
    });
  };
})();
