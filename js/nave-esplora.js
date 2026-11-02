/* Esplora la nave — la pagina divisa di ogni zona della Careless (la nave; la campagna è «The Careless Journey»).
   A sinistra la stanza vista DALL'ALTO (disegno decorativo che segue i dati), a destra il pannello di UTILITÀ.
   In alto: piano e lato della nave e una piccola mappa della nave vista di lato (la stessa della sezione Nave)
   con la stanza attuale evidenziata: toccandola ci si sposta.
   Per spostarsi ci sono due modi:
   - l'ELENCO DI TUTTE LE STANZE, nella colonna più a sinistra (sul telefono una fila sopra il disegno): ci si
     «teletrasporta» in qualsiasi stanza;
   - le PORTE sul disegno: pulsanti messi su porte, scale e ascensore, che portano alla stanza a cui danno.

   Una zona si registra con NAVE.zona(chiave, { sinistra, destra, apri(), chiudi(), esc(), porte }):
   - sinistra / destra: gli elementi da mostrare nelle due metà (la cornice li sposta dentro e fuori);
   - apri() / chiudi(): chiamate quando si entra e si esce dalla zona;
   - esc(): facoltativa; se restituisce true, Esc è stato usato dalla zona (per esempio per tornare alla panoramica);
   - porte: facoltativa; [{ x, y, vai, piano }] nelle coordinate del disegno (piano: false toglie la freccia ↑/↓, per una
     porta che dà su una stanza di un altro piano allo stesso livello, come la Sala Macchine su due piani) (viewBox dell'svg .sm-svg). La cornice aggiunge
     i pulsanti al disegno, e li rimette se la zona ridisegna la pianta (per esempio la Stiva Modulare).
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
    stiva_primaria: { n: "Stiva Primaria",   e: "🧰", piano: 4, lato: "poppa",         card: "Stiva Primaria",     su: "stiva_modulare", prua: "sala_macchine" }
  };
  var ORDINE = ["alloggi", "ponte_comando", "mensa", "sala_mappe", "ponte_esterno", "stiva_modulare", "sala_macchine", "zona_segreta", "stiva_primaria"];
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
    + '<div class="nx-corpo" id="nx-corpo">'
    + '<div class="nx-lista" id="nx-lista" role="navigation" aria-label="Tutte le stanze della nave"></div>'
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
  /* l'elenco di tutte le stanze, divise per piano */
  function elenco(){
    var h = '<div class="nx-meta-t">Le stanze</div><div class="nx-lista-c">', piano = 0;
    ORDINE.forEach(function(k){
      var z = ZONE[k];
      if(z.piano !== piano){ if(piano) h += '</div>'; piano = z.piano; h += '<div class="nx-piano"><div class="nx-piano-t">' + piano + '° piano</div>'; }
      h += '<button type="button" class="nx-st' + (k === cur ? " on" : "") + '" data-vai="' + k + '"' + (k === cur ? ' aria-current="true"' : "") + '><span aria-hidden="true">' + z.e + '</span>' + esc(z.n) + '</button>';
    });
    $("nx-lista").innerHTML = h + '</div></div>';
    var on = $("nx-lista").querySelector(".nx-st.on");
    if(on && on.scrollIntoView && matchMedia("(max-width:860px)").matches){ try { on.scrollIntoView({ block: "nearest", inline: "center" }); } catch(_){} }
  }
  /* da dove si arriva: serve solo per l'animazione di entrata */
  function direzione(da, a){
    var z = ZONE[da]; if(!z) return "in";
    var d = ["su", "giu", "prua", "poppa"].filter(function(x){ return z[x] === a; })[0];
    if(d) return d;
    var za = ZONE[a];
    return za.piano < z.piano ? "su" : za.piano > z.piano ? "giu" : "in";
  }
  /* le porte sul disegno: pulsanti dentro l'svg, così seguono il disegno quando si ingrandisce o rimpicciolisce */
  /* pulsanti delle porte. Tre modi, scelti porta per porta nel file della stanza:
     - normale: il pulsante sta FUORI dal disegno, in una fascia sopra o sotto (dal lato della porta), con un filo tratteggiato
       fino alla porta vera; più porte verso la stessa stanza = un solo pulsante. La fascia si ottiene allargando il viewBox.
     - dentro: true → il pulsante sta dentro il disegno, nel punto x,y (senza filo), come nelle prime versioni;
     - bx, by → il pulsante sta dentro il disegno nel punto bx,by, con un filo verso ogni porta (x,y) che porta lì. */
  function porte(){
    var def = REG[cur], sx = $("nx-sx");
    if(!def || !def.porte || !def.porte.length || !sx) return;
    var svg = sx.querySelector("svg.sm-svg");
    if(!svg || svg.querySelector(".nx-porte")) return;
    var vb = svg.viewBox && svg.viewBox.baseVal; if(!vb || !vb.width) return;
    var tel = matchMedia("(max-width:860px)").matches;
    var k = (tel ? vb.width : Math.max(vb.width, vb.height)) / 560 * (tel ? 1.37 : 1), fs = 14 * k, ph = 26 * k, gap = 7 * k, h = "", linee = "";   /* sul telefono il disegno è largo quanto lo schermo: si misura sulla larghezza */
    var X0 = vb.x, X1 = vb.x + vb.width, Y0 = vb.y, Y1 = vb.y + vb.height, meta = Y0 + vb.height / 2, m4 = 4 * k;
    var gruppi = [], per = {};
    def.porte.forEach(function(q, i){
      if(!ZONE[q.vai]) return;
      var chiave = q.dentro ? "d" + i : q.bx != null ? "b" + q.vai : "f" + q.vai, g = per[chiave];
      if(!g){ g = per[chiave] = { vai: q.vai, piano: q.piano, pt: [], modo: q.dentro ? "dentro" : q.bx != null ? "punto" : "fuori", cx: q.dentro ? q.x : q.bx, cy: q.dentro ? q.y : q.by }; gruppi.push(g); }
      if(!q.dentro) g.pt.push([q.x, q.y]);
    });
    gruppi.forEach(function(g){
      var z = ZONE[g.vai], qui = ZONE[cur];
      var frec = g.piano === false ? "" : z.piano < qui.piano ? "↑ " : z.piano > qui.piano ? "↓ " : "";
      g.testo = frec + z.n; g.e = z.e; g.pw = (g.testo.length * 7.1 + 40) * k;
      if(g.modo === "fuori"){ var mx = 0, my = 0; g.pt.forEach(function(q){ mx += q[0]; my += q[1]; }); g.cx = mx / g.pt.length; g.su = my / g.pt.length < meta; }
    });
    /* una fascia: se i pulsanti ci stanno in una riga, li mette uno accanto all'altro il più vicino possibile alle loro porte */
    function fascia(lista){
      if(!lista.length) return 0;
      lista.sort(function(a, b){ return a.cx - b.cx; });
      var tot = lista.reduce(function(t, g){ return t + g.pw; }, 0) + gap * (lista.length - 1), spazio = vb.width - 2 * m4;
      if(tot > spazio && tot * .82 <= spazio){ var f = spazio / tot; lista.forEach(function(g){ g.s = f; g.pw *= f; }); tot = spazio; }   /* poco più larghi della fascia: si rimpiccioliscono appena, per stare in una riga */
      if(tot <= spazio){
        var x = -1e9;
        lista.forEach(function(g){ g.x = Math.max(g.cx - g.pw / 2, x); g.riga = 0; x = g.x + g.pw + gap; });
        var fuori = lista[lista.length - 1].x + lista[lista.length - 1].pw - (X1 - m4); if(fuori > 0) lista.forEach(function(g){ g.x -= fuori; });
        var dentro = (X0 + m4) - lista[0].x; if(dentro > 0) lista.forEach(function(g){ g.x += dentro; });
        return 1;
      }
      var R = [];
      lista.forEach(function(g){
        var x = Math.max(X0 + m4, Math.min(X1 - g.pw - m4, g.cx - g.pw / 2)), r;
        for(r = 0; r < R.length; r++){ if(x >= R[r] + gap) break; if(R[r] + gap + g.pw <= X1 - m4){ x = R[r] + gap; break; } }
        if(r === R.length) R.push(0);
        g.x = x; g.riga = r; R[r] = x + g.pw;
      });
      return R.length;
    }
    var nSu = fascia(gruppi.filter(function(g){ return g.modo === "fuori" && g.su; })), nGiu = fascia(gruppi.filter(function(g){ return g.modo === "fuori" && !g.su; }));
    var hSu = nSu ? nSu * (ph + gap) + gap : 0, hGiu = nGiu ? nGiu * (ph + gap) + gap : 0;
    if(hSu || hGiu) svg.setAttribute("viewBox", X0 + " " + (Y0 - hSu) + " " + vb.width + " " + (vb.height + hSu + hGiu));
    gruppi.forEach(function(g){
      var y;
      if(g.modo === "fuori") y = g.su ? Y0 - hSu + gap + (nSu - 1 - g.riga) * (ph + gap) : Y1 + gap + g.riga * (ph + gap);
      else { g.x = Math.max(X0 + m4, Math.min(X1 - g.pw - m4, g.cx - g.pw / 2)); y = Math.max(Y0 + m4, Math.min(Y1 - ph - m4, g.cy - ph / 2)); }
      g.pt.forEach(function(q){
        var bx = g.x + g.pw / 2, by = q[1] < y ? y : q[1] > y + ph ? y + ph : y + ph / 2;
        if(g.modo === "punto"){ bx = q[0] < g.x ? g.x + ph / 2 : q[0] > g.x + g.pw ? g.x + g.pw - ph / 2 : bx; }
        linee += '<line class="nx-filo" x1="' + bx.toFixed(1) + '" y1="' + by.toFixed(1) + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke-width="' + (1.3 * k).toFixed(2) + '" stroke-dasharray="' + (3 * k).toFixed(1) + ' ' + (4 * k).toFixed(1) + '"/>'
          + '<circle class="nx-filo-p" cx="' + q[0] + '" cy="' + q[1] + '" r="' + (3.4 * k).toFixed(1) + '"/>';
      });
      var sc = g.s || 1;
      h += '<g class="nx-porta" data-vai="' + g.vai + '" role="button" tabindex="0" aria-label="Vai a: ' + esc(ZONE[g.vai].n) + '" transform="translate(' + g.x.toFixed(1) + ' ' + y.toFixed(1) + ')' + (sc < 1 ? ' scale(' + sc.toFixed(3) + ')' : '') + '">'
        + '<rect width="' + (g.pw / sc).toFixed(1) + '" height="' + ph.toFixed(1) + '" rx="' + (ph / 2).toFixed(1) + '"/>'
        + '<text x="' + (13 * k).toFixed(1) + '" y="' + (ph / 2 + fs * .36).toFixed(1) + '" font-size="' + fs.toFixed(1) + '">' + g.e + '</text>'
        + '<text class="nx-porta-n" x="' + (33 * k).toFixed(1) + '" y="' + (ph / 2 + fs * .36).toFixed(1) + '" font-size="' + fs.toFixed(1) + '">' + esc(g.testo) + '</text></g>';
    });
    svg.insertAdjacentHTML("beforeend", '<g class="nx-porte">' + linee + h + '</g>');
  }
  var osserva = window.MutationObserver ? new MutationObserver(function(){ if(aperta) porte(); }) : null;
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
    $("nx-k").textContent = "Careless · " + z.piano + "° piano · " + z.lato;
    $("nx-t").textContent = z.e + " " + z.n;
    while(sx.firstChild) sx.removeChild(sx.firstChild);
    while(dx.firstChild) dx.removeChild(dx.firstChild);
    sx.appendChild(def.sinistra); dx.appendChild(def.destra);
    dx.scrollTop = 0;
    elenco(); mini();
    if(def.apri) try { def.apri(); } catch(e){ console.error(e); }
    porte();
    var corpo = $("nx-corpo");
    if(dir && !RIDOTTO){ corpo.classList.remove("nx-in-su", "nx-in-giu", "nx-in-prua", "nx-in-poppa", "nx-in-in"); void corpo.offsetWidth; corpo.classList.add("nx-in-" + dir); }
    try { localStorage.setItem("tcj-nx-ultima", k); } catch(e){}
  }
  function vai(k, dir){
    if(!ZONE[k] || k === cur) return;
    suono("paper"); monta(k, dir || direzione(cur, k));
  }

  function apri(k){
    k = ZONE[k] ? k : "stiva_modulare";
    try { if(typeof nvClose === "function") nvClose(); } catch(_){}
    ov.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    aperta = true; cur = null; monta(k, null); suono("gong");
    if(osserva) osserva.observe($("nx-sx"), { childList: true, subtree: true });
    setTimeout(function(){ try { $("nx-x").focus(); } catch(_){} }, 60);
  }
  function chiudi(){
    if(cur && REG[cur] && REG[cur].chiudi) try { REG[cur].chiudi(); } catch(e){ console.error(e); }
    aperta = false; cur = null;
    if(osserva) osserva.disconnect();
    ov.classList.remove("on"); setTimeout(function(){ if(!ov.classList.contains("on")) ov.hidden = true; }, 260);
    if(!document.querySelector(".inc-win.on,.cj-overlay.open,.rel-ov.on,.stv-ov.on:not(.nx-ov)")) document.body.style.overflow = "";
  }
  ov.addEventListener("click", function(e){
    if(e.target === ov){ chiudi(); return; }
    if(e.target.closest("#nx-x")){ chiudi(); return; }
  });
  /* elenco e porte: in cattura, così il clic non arriva anche al disegno sotto (per esempio la Stiva Modulare) */
  ov.addEventListener("click", function(e){
    var f = e.target.closest && e.target.closest(".nx-st,.nx-porta");
    if(f){ e.stopPropagation(); e.preventDefault(); vai(f.getAttribute("data-vai"), null); }
  }, true);
  document.addEventListener("keydown", function(e){
    if(!aperta) return;
    if(e.key === "Escape"){
      if(document.querySelector(".tcj-conf.on,.eq-ov.on")) return;
      if(REG[cur] && REG[cur].esc && REG[cur].esc()) return;
      chiudi(); return;
    }
    var f = e.target && e.target.closest && e.target.closest(".nx-porta");
    if(f && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); vai(f.getAttribute("data-vai"), null); }
  });

  window.NAVE = {
    ZONE: ZONE,
    zona: function(k, def){ REG[k] = def; if(aperta && cur === k) monta(k, null); },
    apri: apri, chiudi: chiudi,
    vai: function(k){ if(aperta) vai(k, null); else apri(k); },
    attuale: function(){ return aperta ? cur : null; }
  };
})();
