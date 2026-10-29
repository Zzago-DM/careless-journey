/* Zona Master — capitolo «Stiva della nave».
   Gli stessi numeri che i giocatori vedono nella Nave › Stiva Primaria (repository privato gruppo, file stiva.json):
   tonici, piloni, nuclei elementali e dispensa, con +1, −1 e «aggiungi o togli N».
   Le modifiche del Master non mandano avvisi ai giocatori: cambiano solo i numeri.
   Usa la stiva condivisa di js/stiva.js (window.STV). Il capitolo viene aggiunto qui, prima che i capitoli diventino
   libri della libreria (js/master-libreria.js), solo dove la Zona Master è aperta. */
(function(){
  "use strict";
  var ms = document.getElementById("ms");
  if(!ms || !ms.querySelector(".msec") || !window.STV) return;
  var S = window.STV, esc = S.disegno.esc;

  var sec = document.createElement("div");
  sec.className = "msec"; sec.id = "m-stiva"; sec.style.borderTop = "1px solid rgba(200,56,56,.1)";
  sec.innerHTML = '<div class="msecsub">Nave · Stiva Primaria</div><div class="msect">Stiva della nave</div><div class="msecl"></div>'
    + '<p class="mstv-intro">Le scorte del gruppo: gli stessi numeri che i giocatori vedono aprendo la stiva della nave e che scendono quando prendono qualcosa per i loro slot. '
    + 'Qui le cambi tu, <b>senza che a loro arrivi nessun avviso</b>: un furto, un regalo, un carico perso nella tempesta.</p>'
    + '<div class="mstv-bar"><span class="mstv-stato" id="mstv-stato"></span><button type="button" class="bk-btn" id="mstv-apri">🧰 Apri la stanza della stiva</button></div>'
    + '<div id="mstv"></div>';
  var tutte = ms.querySelectorAll(".msec"), ultima = tutte[tutte.length - 1];
  ultima.insertAdjacentElement("afterend", sec);
  var nav = ms.querySelector(".msnav");
  if(nav){ var a = document.createElement("a"); a.href = "#m-stiva"; a.textContent = "Stiva della nave"; nav.appendChild(a); }
  var box = document.getElementById("mstv");

  function riga(id, nome, segno){
    var q = S.q(id);
    return '<div class="mstv-r' + (q ? "" : " zero") + '"><div class="mstv-n">' + segno + '<span>' + esc(nome) + '</span></div>'
      + S.disegno.contatore("m1", id, q, nome)
      + '<div class="mstv-q"><input type="number" min="1" inputmode="numeric" placeholder="N" aria-label="Quanti per ' + esc(nome) + '" data-qn="' + esc(id) + '">'
      + '<button type="button" class="mstv-b" data-az="mN" data-id="' + esc(id) + '" data-s="1">Aggiungi</button>'
      + '<button type="button" class="mstv-b" data-az="mN" data-id="' + esc(id) + '" data-s="-1">Togli</button></div></div>';
  }
  function disegna(){
    var st = document.getElementById("mstv-stato");
    if(st){ var s = S.stato(); st.textContent = s === "ok" ? "In diretta" : S.messaggio(); st.setAttribute("data-s", s === "ok" ? "ok" : "ko"); }
    if(box.querySelector("input[data-qn]:focus")) return;   /* non cancellare un numero che si sta scrivendo */
    var h = S.GRUPPI.map(function(g){
      return '<div class="mstv-g">' + g[1] + '</div>' + S.IT.filter(function(x){ return x.g === g[0]; }).map(function(x){ return riga(x.id, x.n, '<i class="eq-dot" style="--c:' + x.c + '"></i>'); }).join("");
    }).join("");
    h += ["att", "def"].map(function(t){
      return '<div class="mstv-g">Nuclei di ' + S.NUC[t].n.toLowerCase() + '</div>' + S.EL.map(function(e){ return riga(S.nid(t, e.id), e.n, S.disegno.sfera(e, "sm")); }).join("");
    }).join("");
    var d = S.doc(), pz = 0; (d.parti || []).forEach(function(p){ pz += p.q; });
    h += '<div class="mstv-g">Dispensa</div><div class="mstv-r"><div class="mstv-n">🍞 <span>Giorni di viveri</span></div>' + S.disegno.contatore("mdisp", "disp", d.disp, "giorni di viveri") + '<div></div></div>';
    h += '<p class="mstv-nota">Parti di mostro in deposito: <b>' + pz + '</b>. Le gestisci dalla stanza della stiva, come i giocatori.</p>';
    box.innerHTML = h;
  }
  S.on(disegna);
  disegna();

  function cambia(id, d){
    var nome = S.nome(id);
    S.accoda("master", function(x){ x.str[id] = Math.max(0, (parseInt(x.str[id], 10) || 0) + d); }, (d > 0 ? "+" + d : "−" + (-d)) + " " + nome);
  }
  sec.addEventListener("click", function(e){
    if(e.target.closest("#mstv-apri")){ if(window.stvApri) stvApri(); return; }
    var b = e.target.closest("[data-az]"); if(!b) return;
    var az = b.getAttribute("data-az"), id = b.getAttribute("data-id");
    if(az === "m1") cambia(id, parseInt(b.getAttribute("data-d"), 10) || 0);
    else if(az === "mdisp"){ var d = parseInt(b.getAttribute("data-d"), 10) || 0; S.accoda("master", function(x){ x.disp = Math.max(0, (parseInt(x.disp, 10) || 0) + d); }, "dispensa " + (d > 0 ? "+1" : "−1")); }
    else if(az === "mN"){
      var inp = box.querySelector('input[data-qn="' + id + '"]'), n = Math.abs(parseInt(inp && inp.value, 10) || 0);
      if(!n){ if(inp) inp.focus(); return; }
      if(inp){ inp.value = ""; inp.blur(); }
      cambia(id, n * (parseInt(b.getAttribute("data-s"), 10) || 1));
    }
  });
  sec.addEventListener("keydown", function(e){
    if(e.key === "Enter" && e.target.matches && e.target.matches("input[data-qn]")){ e.preventDefault(); var b = e.target.parentNode.querySelector('[data-s="1"]'); if(b) b.click(); }
  });
  /* la stiva si rilegge in diretta solo mentre il capitolo è aperto sullo schermo */
  if(window.IntersectionObserver) new IntersectionObserver(function(en){ S.guarda("master", en[0].isIntersecting); }).observe(box);
})();
