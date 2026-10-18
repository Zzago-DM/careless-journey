/* Incontri — i personaggi conosciuti dal gruppo, con le note di ogni giocatore.
   - L'elenco viene da dati/incontri.json (lo pubblica il Master dalla Zona Master): qui c'è solo ciò che i giocatori sanno.
   - «Le mie note» si salvano nel pacchetto del giocatore (chiave tcj-inc-<personaggio>), quindi seguono
     il suo salvataggio online come scheda e appunti. Si scrivono solo con la propria Area dello Slayer aperta. */
(function(){
  var lista = document.getElementById("inc-lista");
  if(!lista) return;
  var CONT = [
    ["ardente", "Continente Ardente", "var(--fire)"], ["glaciale", "Continente Glaciale", "var(--ice)"],
    ["folgorante", "Continente Folgorante", "var(--lightning)"], ["terrestre", "Continente Terrestre", "var(--earth)"],
    ["radiante", "Continente Radiante", "var(--radiant)"], ["oscuro", "Continente Oscuro", "var(--dark)"],
    ["ramsgate", "Ramsgate", "#c8a84b"], ["altrove", "Altrove", "var(--neutral)"]
  ];
  var STATI = { vivo: "Vivo", morto: "Morto", sconosciuto: "Sorte sconosciuta" };
  var P = [], ord = "az", q = "", cur = -1, back = null, scelto = null, fk = 0;   /* fk = foto mostrata nella scheda aperta */
  try { if(localStorage.getItem("tcj-inc-ord") === "cont") ord = "cont"; } catch(e){}

  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function norm(s){ return String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
  function cont(k){ for(var i = 0; i < CONT.length; i++) if(CONT[i][0] === k) return CONT[i]; return CONT[CONT.length - 1]; }
  function sole(cls){ return '<svg class="' + cls + '" viewBox="0 0 1739 3364" aria-hidden="true" focusable="false"><use href="#gsun"/></svg>'; }
  function suono(n){ try { sfxPlay(n); } catch(_){} }

  /* ---------- note dei giocatori ---------- */
  var PG = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []);
  function aperti(){ return PG.filter(function(c){ try { return typeof paIsOpen === "function" && paIsOpen(c.k); } catch(e){ return false; } }); }
  function note(k){ try { return JSON.parse(localStorage.getItem("tcj-inc-" + k) || "{}") || {}; } catch(e){ return {}; } }
  function scriviNota(k, id, t){
    var n = note(k); if(t && t.trim()) n[id] = t; else delete n[id];
    try { if(Object.keys(n).length) localStorage.setItem("tcj-inc-" + k, JSON.stringify(n)); else localStorage.removeItem("tcj-inc-" + k); } catch(e){}
  }
  function chiScrive(){
    var a = aperti(); if(!a.length) return null;
    var c = scelto || ((typeof scCur !== "undefined") ? scCur : null);
    return a.some(function(x){ return x.k === c; }) ? c : a[0].k;
  }

  /* ---------- elenco ---------- */
  function scheda(p, i){
    var c = cont(p.continente), k = chiScrive(), haNota = k && note(k)[p.id];
    return '<button type="button" class="card inc-card" data-i="' + i + '" aria-haspopup="dialog">'
      + '<span class="inc-av">' + (p.foto ? '<img src="' + esc(p.foto) + '" alt="" loading="lazy" decoding="async">' : sole("inc-sole")) + '</span>'
      + '<span class="inc-t"><span class="ct">' + esc(p.nome) + '</span>'
      + '<span class="inc-c"><i style="background:' + c[2] + '"></i>' + esc(c[1]) + (p.stato === "morto" ? ' · <b class="inc-morto">✝ Morto</b>' : '') + '</span></span>'
      + (haNota ? '<span class="inc-nota-seg" title="Hai delle note su questo personaggio">✎</span>' : '') + '</button>';
  }
  function disegna(){
    var nq = norm(q);
    var v = P.map(function(p, i){ return { p: p, i: i }; }).filter(function(x){
      if(!nq) return true;
      var p = x.p; return norm([p.nome, cont(p.continente)[1], (p.fazioni || []).join(" "), (p.tag || []).join(" ")].join(" ")).indexOf(nq) >= 0;
    });
    document.getElementById("inc-conta").textContent = P.length ? (nq ? v.length + " su " + P.length : P.length + (P.length === 1 ? " personaggio" : " personaggi")) : "";
    if(!P.length){ lista.innerHTML = '<div class="inc-vuoto">' + sole("inc-sole-g") + '<p>Il registro è ancora vuoto: nessun incontro annotato.</p></div>'; return; }
    if(!v.length){ lista.innerHTML = '<div class="inc-vuoto"><p>Nessuno con questo nome tra gli incontri: forse non l\'avete ancora conosciuto.</p></div>'; return; }
    var gruppi = [];
    if(ord === "cont"){
      CONT.forEach(function(c){ var g = v.filter(function(x){ return cont(x.p.continente)[0] === c[0]; }); if(g.length) gruppi.push({ t: c[1], col: c[2], l: g }); });
    } else {
      var per = {};
      v.forEach(function(x){ var L = norm(x.p.nome).charAt(0).toUpperCase(); if(!/[A-Z]/.test(L)) L = "#"; (per[L] = per[L] || []).push(x); });
      Object.keys(per).sort().forEach(function(L){ gruppi.push({ t: L, l: per[L], lettera: 1 }); });
    }
    lista.innerHTML = gruppi.map(function(g){
      return '<div class="inc-gruppo"><div class="ndiv inc-ndiv' + (g.lettera ? " inc-lettera" : "") + '"' + (g.col ? ' style="--ic:' + g.col + '"' : '') + '>' + esc(g.t) + '</div>'
        + '<div class="inc-griglia">' + g.l.map(function(x){ return scheda(x.p, x.i); }).join("") + '</div></div>';
    }).join("");
    try { skIdx = null; } catch(e){}   /* la ricerca generale del sito rilegge le voci nuove */
  }

  /* ---------- scheda aperta ---------- */
  var ov = document.createElement("div");
  ov.className = "inc-ov"; ov.hidden = true;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "inc-n");
  ov.innerHTML = '<div class="inc-box"><button type="button" class="mae-x inc-x" id="inc-x" aria-label="Chiudi">✕</button>'
    + '<div class="inc-ph" id="inc-ph"></div><div class="inc-info">'
    + '<div class="inc-r" id="inc-r"></div><h3 class="inc-n" id="inc-n"></h3><div class="inc-chips" id="inc-chips"></div>'
    + '<div id="inc-body"></div><div class="inc-note" id="inc-note"></div>'
    + '<div class="mae-nav"><button type="button" id="inc-prev">‹ Precedente</button><span id="inc-pos"></span><button type="button" id="inc-next">Successivo ›</button></div>'
    + '</div></div>';
  document.body.appendChild(ov);
  var box = ov.querySelector(".inc-box");
/* scorrimento col dito: verso sinistra la scheda dopo, verso destra quella prima */
  function scorri(box,vai){var x0=0,y0=0,t0=0,ok=false;
  box.addEventListener("touchstart",function(e){ok=e.touches.length===1&&!e.target.closest("textarea,input,select");if(ok){x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now();}},{passive:true});
  box.addEventListener("touchend",function(e){if(!ok)return;ok=false;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6&&Date.now()-t0<900)vai(dx<0?1:-1,e.target);},{passive:true});}
/* scheda nuova: si riparte dall'alto (la foto deve essere in vista mentre si carica) e un piccolo scivolamento */
  function entra(box,d){box.scrollTop=0;if(!d)return;try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)box.animate([{opacity:.35,transform:"translateX("+(d*28)+"px)"},{opacity:1,transform:"none"}],{duration:220,easing:"ease-out"});}catch(_){}}
/* Safari su iPhone a volte disegna solo il pezzo di foto visibile in quel momento: la si fa ridisegnare */
  function ridisegna(im){requestAnimationFrame(function(){im.style.transform="translateZ(0)";requestAnimationFrame(function(){im.style.transform="";});});}
  function ordinati(){ return Array.prototype.map.call(lista.querySelectorAll(".inc-card"), function(b){ return +b.getAttribute("data-i"); }); }
  /* tutte le foto del personaggio: più foto quando è un gruppo (es. una squadra di Slayer) */
  function album(p){ return (p.foti && p.foti.length) ? p.foti : (p.foto ? [p.foto] : []); }
  function mostraFoto(k){
    var p = P[cur]; if(!p) return; var a = album(p), ph = document.getElementById("inc-ph");
    if(!a.length){ ph.innerHTML = '<div class="inc-ph-vuota">' + sole("inc-sole-xl") + '<span>Nessun ritratto</span></div>'; return; }
    fk = (k + a.length) % a.length;
    /* la cornice segue la foto: quelle orizzontali vanno sopra, a tutta larghezza */
    var fr = String((p.formati || [])[fk] || "4:5").split(":"), largo = +fr[0] > +fr[1];
    ph.style.aspectRatio = fr[0] + " / " + fr[1];
    document.querySelector(".inc-box").classList.toggle("inc-largo", largo);
    var h = '<img src="' + esc(a[fk]) + '" alt="Ritratto di ' + esc(p.nome) + (a.length > 1 ? ", foto " + (fk + 1) + " di " + a.length : "") + '">';
    if(a.length > 1){
      h += '<button type="button" class="inc-ph-b inc-ph-p" data-fk="' + (fk - 1) + '" aria-label="Foto precedente">‹</button>'
        + '<button type="button" class="inc-ph-b inc-ph-n" data-fk="' + (fk + 1) + '" aria-label="Foto successiva">›</button><div class="inc-ph-dots">';
      a.forEach(function(_, j){ h += '<button type="button" class="inc-ph-dot' + (j === fk ? " on" : "") + '" data-fk="' + j + '" aria-label="Foto ' + (j + 1) + ' di ' + a.length + '"' + (j === fk ? ' aria-current="true"' : '') + '></button>'; });
      h += '</div>';
      a.forEach(function(u, j){ if(j !== fk){ var im = new Image(); im.src = u; } });   /* le altre arrivano subito */
    }
    ph.innerHTML = h;
    var im0 = ph.querySelector("img");
    if(im0){ if(im0.complete) ridisegna(im0); else im0.addEventListener("load", function(){ ridisegna(im0); }); }
  }
  function riempi(i){
    cur = i; var p = P[i]; if(!p) return; var c = cont(p.continente);
    box.scrollTop = 0;
    mostraFoto(0);
    document.getElementById("inc-r").innerHTML = '<i style="background:' + c[2] + '"></i>' + esc(c[1]) + (p.stato ? ' · <span class="inc-st s-' + esc(p.stato) + '">' + esc(STATI[p.stato] || p.stato) + '</span>' : '');
    document.getElementById("inc-n").textContent = p.nome;
    var ch = "";
    (p.fazioni || []).forEach(function(f){ ch += '<span class="inc-chip inc-faz">⚑ ' + esc(f) + '</span>'; });
    (p.tag || []).forEach(function(t){ ch += '<span class="inc-chip">#' + esc(t) + '</span>'; });
    document.getElementById("inc-chips").innerHTML = ch;
    document.getElementById("inc-body").innerHTML = p.pres
      ? '<div class="mae-sec"><h4>Cosa sapete</h4><p>' + esc(p.pres).replace(/\n/g, "<br>") + '</p></div>'
      : '<div class="mae-sec"><p class="inc-poco">Di questo personaggio sapete solo il nome.</p></div>';
    disegnaNote(p);
    var o = ordinati(), k = o.indexOf(i);
    document.getElementById("inc-pos").textContent = (k + 1) + " / " + o.length;
  }
  function disegnaNote(p){
    var box = document.getElementById("inc-note"), a = aperti();
    if(!a.length){
      box.innerHTML = '<h4>Le mie note</h4><p class="inc-poco">Apri la tua <b>Area dello Slayer</b> per scrivere le tue note su questo personaggio.</p>'
        + '<button type="button" class="bk-btn" id="inc-vai">⚔ Vai alla mia Area</button>';
      return;
    }
    var k = chiScrive(), h = '<h4>Le mie note</h4>';
    if(a.length > 1){
      h += '<div class="inc-chi" role="tablist" aria-label="Di chi sono le note">';
      a.forEach(function(c){ h += '<button type="button" role="tab" class="inc-chi-b' + (c.k === k ? " on" : "") + '" aria-selected="' + (c.k === k) + '" data-pg="' + c.k + '">' + esc(c.e + " " + c.n) + '</button>'; });
      h += '</div>';
    }
    var nome = (typeof PA_FULL !== "undefined" && PA_FULL[k]) || k;
    h += '<label class="inc-lbl" for="inc-ta">Note di ' + esc(nome) + ' — le vedi solo tu</label>'
      + '<textarea id="inc-ta" class="inc-ta" rows="4" placeholder="Cosa ricordi di questo personaggio? Dove l\'avete visto, cosa vi ha detto…"></textarea>'
      + '<div class="inc-salvata" id="inc-salvata" aria-live="polite"></div>';
    box.innerHTML = h;
    var ta = document.getElementById("inc-ta"); ta.value = note(k)[p.id] || ""; ta.setAttribute("data-pg", k);
  }
  function apri(i, da){
    back = da || null; riempi(i); ov.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    suono("paper"); try { document.getElementById("inc-x").focus(); } catch(_){}
  }
  function chiudi(){
    ov.classList.remove("on"); setTimeout(function(){ ov.hidden = true; }, 200);
    if(!document.querySelector(".cj-overlay.open,.bfs-ov")) document.body.style.overflow = "";
    disegna();
    if(back) try { var b = lista.querySelector('.inc-card[data-i="' + back + '"]'); if(b) b.focus(); } catch(_){}
  }
  function passa(d){ var o = ordinati(), k = o.indexOf(cur); if(!o.length) return; riempi(o[(k + d + o.length) % o.length]); entra(box, d); }
  /* col dito: sulla foto di un gruppo si sfogliano le sue foto, altrove si passa al personaggio vicino */
  scorri(box, function(d, dove){
    var p = P[cur];
    if(dove.closest(".inc-ph") && p && album(p).length > 1){ mostraFoto(fk + d); suono("swish"); return; }
    passa(d); suono("paper");
  });

  lista.addEventListener("click", function(e){ var b = e.target.closest(".inc-card"); if(b) apri(+b.getAttribute("data-i"), b.getAttribute("data-i")); });
  document.getElementById("inc-x").addEventListener("click", chiudi);
  document.getElementById("inc-prev").addEventListener("click", function(){ passa(-1); });
  document.getElementById("inc-next").addEventListener("click", function(){ passa(1); });
  ov.addEventListener("click", function(e){
    if(e.target === ov){ chiudi(); return; }
    var f = e.target.closest("[data-fk]");
    if(f){
      var tipo = f.classList.contains("inc-ph-p") ? ".inc-ph-p" : f.classList.contains("inc-ph-n") ? ".inc-ph-n" : null;
      mostraFoto(+f.getAttribute("data-fk")); suono("swish");
      var t = document.querySelector(tipo ? ".inc-ph " + tipo : '.inc-ph-dot[data-fk="' + fk + '"]'); if(t) t.focus();   /* il fuoco resta dov'era */
      return;
    }
    var b = e.target.closest("[data-pg]");
    if(b && b.classList.contains("inc-chi-b")){ scelto = b.getAttribute("data-pg"); disegnaNote(P[cur]); return; }
    if(e.target.closest("#inc-vai")){ chiudi(); var s = document.getElementById("scheda"); if(s) s.scrollIntoView({ behavior: "smooth" }); }
  });
  var tN = null;
  ov.addEventListener("input", function(e){
    if(e.target.id !== "inc-ta") return;
    var ta = e.target, k = ta.getAttribute("data-pg"), id = P[cur] && P[cur].id;
    clearTimeout(tN); document.getElementById("inc-salvata").textContent = "…";
    tN = setTimeout(function(){ scriviNota(k, id, ta.value); document.getElementById("inc-salvata").textContent = "✓ Salvata nella tua area"; }, 500);
  });
  document.addEventListener("keydown", function(e){
    if(ov.hidden) return;
    if(e.key === "Escape"){ e.stopPropagation(); chiudi(); }
    else if(e.target.id !== "inc-ta" && e.key === "ArrowRight") passa(1);
    else if(e.target.id !== "inc-ta" && e.key === "ArrowLeft") passa(-1);
    else if(e.key === "Tab"){ var f = ov.querySelectorAll("button,textarea"), a = f[0], z = f[f.length - 1];
      if(e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); } }
  }, true);

  /* ---------- barra ---------- */
  document.getElementById("inc-q").addEventListener("input", function(){ q = this.value; disegna(); });
  document.querySelectorAll(".inc-ord").forEach(function(b){
    b.classList.toggle("on", b.getAttribute("data-ord") === ord); b.setAttribute("aria-checked", b.getAttribute("data-ord") === ord);
    b.addEventListener("click", function(){
      ord = b.getAttribute("data-ord"); try { localStorage.setItem("tcj-inc-ord", ord); } catch(e){}
      document.querySelectorAll(".inc-ord").forEach(function(x){ var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      suono("swish"); disegna();
    });
  });

  /* ---------- dati ---------- */
  fetch("dati/incontri.json?t=" + Date.now(), { cache: "no-store" })
    .then(function(r){ if(r.status === 404) return { personaggi: [] }; if(!r.ok) throw r.status; return r.json(); })
    .then(function(d){
      P = (d.personaggi || []).filter(function(p){ return p && p.nome; });
      P.sort(function(a, b){ return a.nome.localeCompare(b.nome, "it"); });
      disegna();
    })
    .catch(function(){ lista.innerHTML = '<div class="inc-vuoto"><p>Non riesco ad aprire il registro degli incontri. Ricarica la pagina tra poco.</p></div>'; });
  /* quando un giocatore apre o chiude la sua area, il segno delle note si aggiorna */
  document.addEventListener("visibilitychange", function(){ if(!document.hidden && P.length) disegna(); });
})();
