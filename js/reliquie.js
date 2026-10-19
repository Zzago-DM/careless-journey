/* Reliquie — la stanza segreta della nave (Nave › Zona Segreta) con gli artefatti che il gruppo custodisce.
   - L'elenco viene da dati/reliquie.json: lo pubblica il Master dal capitolo «Reliquie della nave» della Zona Master,
     e contiene SOLO gli artefatti che ha deciso di mostrare (nome, descrizione, immagine).
   - Ogni artefatto sta su un piedistallo; toccandolo si apre la sua scheda con la descrizione del Master
     e «Le mie note» del giocatore, salvate nel suo pacchetto (chiave tcj-rel-<personaggio>), quindi seguono
     il suo salvataggio online come la scheda e le note sugli Incontri. */
(function(){
  "use strict";
  var R = [], cur = -1, scelto = null, caricato = false;
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function suono(n){ try { sfxPlay(n); } catch(_){} }
  function testo(t){ return esc(t).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>"); }

  /* ---------- note dei giocatori ---------- */
  var PG = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []);
  function aperti(){ return PG.filter(function(c){ try { return typeof paIsOpen === "function" && paIsOpen(c.k); } catch(e){ return false; } }); }
  function note(k){ try { return JSON.parse(localStorage.getItem("tcj-rel-" + k) || "{}") || {}; } catch(e){ return {}; } }
  function scriviNota(k, id, t){
    var n = note(k); if(t && t.trim()) n[id] = t; else delete n[id];
    try { if(Object.keys(n).length) localStorage.setItem("tcj-rel-" + k, JSON.stringify(n)); else localStorage.removeItem("tcj-rel-" + k); } catch(e){}
  }
  function chiScrive(){
    var a = aperti(); if(!a.length) return null;
    var c = scelto || ((typeof scCur !== "undefined") ? scCur : null);
    return a.some(function(x){ return x.k === c; }) ? c : a[0].k;
  }

  /* ---------- finestra della stanza ---------- */
  var ov = document.createElement("div");
  ov.className = "rel-ov"; ov.hidden = true;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "rel-t");
  ov.innerHTML = '<div class="rel-sala">'
    + '<div class="rel-polvere" aria-hidden="true"></div>'
    + '<div class="rel-top"><div><div class="rel-k">Careless Journey · dietro i muri della Sala Macchine</div><h3 class="rel-t" id="rel-t">Stanza delle Reliquie</h3></div>'
    + '<button type="button" class="mae-x rel-x" id="rel-x" aria-label="Esci dalla stanza">✕</button></div>'
    + '<div class="rel-sub" id="rel-sub" aria-live="polite"></div>'
    + '<div class="rel-scaffale" id="rel-scaffale" role="list"></div>'
    + '</div>'
    + '<div class="rel-det" id="rel-det" hidden role="dialog" aria-modal="true" aria-labelledby="rel-n"><div class="rel-dbox">'
    + '<button type="button" class="mae-x rel-dx" id="rel-dx" aria-label="Torna alla stanza">✕</button>'
    + '<div class="rel-dimg" id="rel-dimg"></div>'
    + '<div class="rel-dinfo"><div class="rel-dk">Reliquia custodita</div><h3 class="rel-n" id="rel-n"></h3>'
    + '<div id="rel-descr"></div><div class="inc-note rel-note" id="rel-note"></div>'
    + '<div class="mae-nav"><button type="button" id="rel-prev">‹ Precedente</button><span id="rel-pos"></span><button type="button" id="rel-next">Successiva ›</button></div>'
    + '</div></div></div>';
  document.body.appendChild(ov);
  var sala = ov.querySelector(".rel-sala"), det = $("rel-det");

  function polvere(){
    var p = ov.querySelector(".rel-polvere"); if(p.children.length || RIDOTTO) return;
    var h = "";
    for(var i = 0; i < 26; i++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:-' + (Math.random() * 14).toFixed(1) + 's;animation-duration:' + (10 + Math.random() * 10).toFixed(1) + 's;--d:' + (Math.random() * 40 - 20).toFixed(0) + 'px"></i>';
    p.innerHTML = h;
  }

  function scaffale(){
    var s = $("rel-scaffale"), sub = $("rel-sub");
    if(!caricato){ s.innerHTML = '<div class="rel-vuota">Accendo le lanterne…</div>'; sub.textContent = ""; return; }
    if(!R.length){
      sub.textContent = "";
      s.innerHTML = '<div class="rel-ped rel-ped-vuoto" role="listitem"><div class="rel-art"><span class="rel-nulla" aria-hidden="true">✦</span></div>'
        + '<div class="rel-colonna" aria-hidden="true"><i class="rel-cap"></i><i class="rel-fusto"></i><i class="rel-base"></i></div>'
        + '<div class="rel-targa">Nessuna reliquia</div></div>'
        + '<p class="rel-vuota">La stanza è ancora vuota: qui verranno custoditi gli artefatti che il gruppo recupererà.</p>';
      return;
    }
    sub.textContent = R.length === 1 ? "Una reliquia custodita" : R.length + " reliquie custodite";
    var k = chiScrive(), n = k ? note(k) : {};
    s.innerHTML = R.map(function(r, i){
      return '<div class="rel-ped" role="listitem" style="--i:' + i + '">'
        + '<button type="button" class="rel-art" data-i="' + i + '" aria-haspopup="dialog" aria-label="' + esc(r.nome) + ': apri la scheda">'
        + '<span class="rel-alone" aria-hidden="true"></span>'
        + (r.foto ? '<img src="' + esc(r.foto) + '" alt="" decoding="async">' : '<span class="rel-nulla" aria-hidden="true">✦</span>')
        + (n[r.id] ? '<span class="rel-segno" title="Hai delle note su questa reliquia">✎</span>' : '') + '</button>'
        + '<div class="rel-raggio" aria-hidden="true"></div>'
        + '<div class="rel-colonna" aria-hidden="true"><i class="rel-cap"><b></b></i><i class="rel-fusto"></i><i class="rel-base"></i></div>'
        + '<div class="rel-targa">' + esc(r.nome) + '</div></div>';
    }).join("");
  }

  function apriStanza(){
    ov.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    polvere(); scaffale(); suono("gong");
    setTimeout(function(){ try { $("rel-x").focus(); } catch(_){} }, 60);
  }
  function chiudiStanza(){
    if(!det.hidden) chiudiDet(true);
    ov.classList.remove("on"); setTimeout(function(){ if(!ov.classList.contains("on")) ov.hidden = true; }, 260);
    if(!document.querySelector(".inc-win.on,.cj-overlay.open")) document.body.style.overflow = "";
  }
  window.relApri = function(){ try { if(typeof nvClose === "function") nvClose(); } catch(_){} apriStanza(); };

  /* ---------- scheda della reliquia ---------- */
  function riempi(i){
    cur = i; var r = R[i]; if(!r) return;
    $("rel-dimg").innerHTML = r.foto ? '<span class="rel-alone" aria-hidden="true"></span><img src="' + esc(r.foto) + '" alt="' + esc(r.nome) + '">' : '<span class="rel-nulla" aria-hidden="true">✦</span>';
    $("rel-n").textContent = r.nome;
    $("rel-descr").innerHTML = r.descr
      ? '<div class="mae-sec"><h4>Cosa sapete</h4><p>' + testo(r.descr) + '</p></div>'
      : '<div class="mae-sec"><p class="inc-poco">Di questa reliquia non sapete ancora nulla.</p></div>';
    disegnaNote(r);
    $("rel-pos").textContent = (i + 1) + " / " + R.length;
    det.querySelector(".rel-dbox").scrollTop = 0;
  }
  function disegnaNote(r){
    var box = $("rel-note"), a = aperti();
    if(!a.length){
      box.innerHTML = '<h4>Le mie note</h4><p class="inc-poco">Apri la tua <b>Area dello Slayer</b> per scrivere le tue note su questa reliquia.</p>'
        + '<button type="button" class="bk-btn" id="rel-vai">⚔ Vai alla mia Area</button>';
      return;
    }
    var k = chiScrive(), h = '<h4>Le mie note</h4>';
    if(a.length > 1){
      h += '<div class="inc-chi" role="tablist" aria-label="Di chi sono le note">';
      a.forEach(function(c){ h += '<button type="button" role="tab" class="inc-chi-b' + (c.k === k ? " on" : "") + '" aria-selected="' + (c.k === k) + '" data-pg="' + c.k + '">' + esc(c.e + " " + c.n) + '</button>'; });
      h += '</div>';
    }
    var nome = (typeof PA_FULL !== "undefined" && PA_FULL[k]) || k;
    h += '<label class="inc-lbl" for="rel-ta">Note di ' + esc(nome) + ' — le vedi solo tu</label>'
      + '<textarea id="rel-ta" class="inc-ta" rows="4" placeholder="Dove l\'avete trovata, cosa avete notato, cosa sospettate…"></textarea>'
      + '<div class="inc-salvata" id="rel-salvata" aria-live="polite"></div>';
    box.innerHTML = h;
    var ta = $("rel-ta"); ta.value = note(k)[r.id] || ""; ta.setAttribute("data-pg", k);
  }
  function apriDet(i){
    riempi(i); det.hidden = false;
    requestAnimationFrame(function(){ det.classList.add("on"); });
    suono("paper"); try { $("rel-dx").focus(); } catch(_){}
  }
  function chiudiDet(muto){
    det.classList.remove("on"); setTimeout(function(){ if(!det.classList.contains("on")) det.hidden = true; }, 220);
    if(!muto){ scaffale(); var b = ov.querySelector('.rel-art[data-i="' + cur + '"]'); if(b) try { b.focus(); } catch(_){} }
  }
  function passa(d){ if(!R.length) return; riempi((cur + d + R.length) % R.length); suono("swish"); }

  ov.addEventListener("click", function(e){
    if(e.target === ov || e.target.closest("#rel-x")){ chiudiStanza(); return; }
    if(e.target === det || e.target.closest("#rel-dx")){ chiudiDet(); return; }
    if(e.target.closest("#rel-prev")){ passa(-1); return; }
    if(e.target.closest("#rel-next")){ passa(1); return; }
    var a = e.target.closest(".rel-art[data-i]"); if(a){ apriDet(+a.getAttribute("data-i")); return; }
    var b = e.target.closest(".inc-chi-b[data-pg]"); if(b){ scelto = b.getAttribute("data-pg"); disegnaNote(R[cur]); return; }
    if(e.target.closest("#rel-vai")){ chiudiStanza(); var s = $("scheda"); if(s) s.scrollIntoView({ behavior: "smooth" }); }
  });
  var tN = null;
  ov.addEventListener("input", function(e){
    if(e.target.id !== "rel-ta") return;
    var ta = e.target, k = ta.getAttribute("data-pg"), id = R[cur] && R[cur].id;
    clearTimeout(tN); $("rel-salvata").textContent = "…";
    tN = setTimeout(function(){ scriviNota(k, id, ta.value); $("rel-salvata").textContent = "✓ Salvata nella tua area"; }, 500);
  });
  document.addEventListener("keydown", function(e){
    if(ov.hidden) return;
    if(e.key === "Escape"){ e.stopPropagation(); if(!det.hidden) chiudiDet(); else chiudiStanza(); }
    else if(!det.hidden && e.target.id !== "rel-ta" && e.key === "ArrowRight") passa(1);
    else if(!det.hidden && e.target.id !== "rel-ta" && e.key === "ArrowLeft") passa(-1);
  }, true);
  /* col dito, nella scheda: verso sinistra la reliquia dopo */
  (function(){ var x0 = 0, y0 = 0, ok = false, box = det.querySelector(".rel-dbox");
    box.addEventListener("touchstart", function(e){ ok = e.touches.length === 1 && !e.target.closest("textarea"); if(ok){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, { passive: true });
    box.addEventListener("touchend", function(e){ if(!ok) return; ok = false; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) passa(dx < 0 ? 1 : -1); }, { passive: true });
  })();

  /* ---------- dati ---------- */
  function carica(){
    return fetch("dati/reliquie.json?t=" + Date.now(), { cache: "no-store" })
      .then(function(r){ if(r.status === 404) return { reliquie: [] }; if(!r.ok) throw r.status; return r.json(); })
      .then(function(d){ R = (d.reliquie || []).filter(function(r){ return r && r.nome; }); caricato = true; if(!ov.hidden) scaffale(); })
      .catch(function(){ caricato = true; R = []; if(!ov.hidden){ $("rel-scaffale").innerHTML = '<p class="rel-vuota">Non riesco ad aprire la stanza adesso. Riprova tra poco.</p>'; } });
  }
  /* la stanza si rilegge a ogni apertura dopo qualche minuto, così le nuove reliquie arrivano senza ricaricare */
  var ultimo = 0;
  var _apri = apriStanza;
  apriStanza = function(){ if(Date.now() - ultimo > 120000){ ultimo = Date.now(); caricato = false; carica(); } _apri(); };
})();
