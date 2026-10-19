/* Reliquie — «Oggetti del gruppo»: la bacheca dentro la Stanza delle Reliquie (Nave › Zona Segreta).
   Sotto i piedistalli del Master c'è una zona che scrivono i giocatori: un elenco di artefatti e oggetti, solo testo
   (nome e descrizione), che vedono tutti. Accanto a ogni voce c'è chi l'ha messa via, oppure «una mano ignota»
   se il giocatore ha scelto di nascondere il proprio nome (il Master lo vede comunque).

   Dove stanno i dati: nel repository privato Zzago-DM/gruppo (lo stesso del quadro «Il Gruppo»), file oggetti.json.
   - Leggere e scrivere usa i token che il sito ha già: quello del personaggio, altrimenti quello del Master.
     Non serve preparare niente: tutti i token includono già «gruppo».
   - Ogni oggetto ricorda chi l'ha aggiunto. Può modificarlo o toglierlo solo chi l'ha scritto
     (con la sua Area dello Slayer aperta) oppure il Master.
   - Mentre la stanza è aperta la bacheca si rilegge ogni pochi secondi; se nulla è cambiato GitHub risponde «uguale».
   - Senza token si vede l'ultima copia salvata su questo dispositivo. */
(function(){
  "use strict";
  var OWNER = "Zzago-DM", REPO = OWNER + "/gruppo", FILE = "oggetti.json";
  var API = "https://api.github.com/repos/";
  var MAX_NOME = 80, MAX_DESCR = 800;
  var PG = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []);
  var CH = PG.map(function(c){ return c.k; });
  var EMO = {}; PG.forEach(function(c){ EMO[c.k] = c.e; });

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function testo(t){ return esc(t).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>"); }
  function leggiJ(key){ try { return JSON.parse(localStorage.getItem(key) || "null") || {}; } catch(e){ return {}; } }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function nomeDi(k){ if(k === "master") return "il Master"; return (typeof PA_FULL !== "undefined" && PA_FULL[k]) || k; }
  function breve(k){ if(k === "master") return "Master"; var p = PG.filter(function(c){ return c.k === k; })[0]; return p ? p.n : k; }
  function quando(iso){
    var d = new Date(iso); if(!iso || isNaN(d)) return "";
    var s = (Date.now() - d.getTime()) / 1000, hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if(s < 45) return "adesso";
    if(s < 3600) return Math.max(1, Math.round(s / 60)) + " min fa";
    if(s < 20 * 3600) return "oggi alle " + hm;
    return d.getDate() + "/" + (d.getMonth() + 1) + " alle " + hm;
  }
  var TIPI = { artefatto: { n: "Artefatto", i: "✦" }, oggetto: { n: "Oggetto", i: "◆" } };
  function tipoDi(o){ return TIPI[o && o.tipo] ? o.tipo : "oggetto"; }
  /* chi ha messo via l'oggetto, come lo vede chi guarda da questo dispositivo */
  function firma(o){
    if(!o.anon) return { t: "Messo via da " + breve(o.chi), e: EMO[o.chi] || "" };
    var t = "Messo via da una mano ignota";
    if(master()) t += " (" + breve(o.chi) + ")";
    else if(o.chi !== "master" && aperto(o.chi)) t += " (sei tu: il tuo nome è nascosto)";
    return { t: t, e: "" };
  }
  function nelLog(o, chi){ return o.anon ? "qualcuno" : breve(chi); }
  function nuovoId(){ return "o" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- chi può scrivere su questo dispositivo ---------- */
  function master(){ try { return typeof paMaster === "function" && paMaster(); } catch(e){ return false; } }
  function aperto(k){ try { return typeof paIsOpen === "function" && paIsOpen(k); } catch(e){ return false; } }
  function autori(){ var a = CH.filter(aperto); if(master()) a.push("master"); return a; }
  function puoCambiare(o){ return master() || (o && o.chi !== "master" && aperto(o.chi)); }

  /* ---------- GitHub (come js/gruppo.js) ---------- */
  function tokMaster(){ return leggiJ("tcjgh_master").token || ""; }
  function tokPg(k){ var s = leggiJ("tcjgh_" + k); return (s.token && s.repo) ? s.token : ""; }
  function tokLettura(){ var m = tokMaster(); if(m) return m; for(var i = 0; i < CH.length; i++){ var t = tokPg(CH[i]); if(t) return t; } return ""; }
  function tokScrittura(k){ return (k && k !== "master" ? tokPg(k) : "") || tokMaster() || tokLettura(); }
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(tok, metodo, perc, corpo, extra){
    var h = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(tok) h.Authorization = "Bearer " + tok;
    if(corpo) h["Content-Type"] = "application/json";
    if(extra) Object.keys(extra).forEach(function(x){ h[x] = extra[x]; });
    if(metodo === "GET") perc += (perc.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return fetch(API + REPO + perc, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function aspetta(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  /* ---------- stato ---------- */
  var doc = leggiJ("tcjob_cache"); if(!Array.isArray(doc.oggetti)) doc = { oggetti: [] };
  var etag = null, stato = tokLettura() ? "attesa" : "notoken", box = null, aperta = false, timer = null, leggendo = false;
  var bozza = { nome: "", descr: "", chi: "", tipo: "oggetto", anon: false }, modTipo = "oggetto", inModifica = null, lavoro = false;
  function oggetti(){ return (doc.oggetti || []).filter(function(o){ return o && o.id && o.nome; }); }
  function ricevi(d){
    if(!d || typeof d !== "object") return;
    d.oggetti = Array.isArray(d.oggetti) ? d.oggetti : [];
    doc = d; try { localStorage.setItem("tcjob_cache", JSON.stringify(doc)); } catch(e){}
    lista();
  }

  function leggi(){
    if(leggendo) return Promise.resolve(); leggendo = true;
    var tok = tokLettura();
    if(!tok){ leggendo = false; segnala("notoken"); return Promise.resolve(); }
    var ex = { "Accept": "application/vnd.github.raw+json" }; if(etag) ex["If-None-Match"] = etag;
    return gh(tok, "GET", "/contents/" + FILE, null, ex).then(function(r){
      if(r.status === 304){ segnala("ok"); return; }
      if(r.ok){ etag = r.headers.get("ETag"); return r.text().then(function(t){ var j = null; try { j = JSON.parse(t); } catch(e){} if(j) ricevi(j); segnala("ok"); }); }
      if(r.status === 404) return gh(tok, "GET", "").then(function(r2){ if(r2.ok){ ricevi({ oggetti: [] }); segnala("ok"); } else segnala("noaccesso"); });
      if(r.status === 401) return segnala("tokenko");
      segnala(r.status === 403 || r.status === 429 ? "limite" : "errore");
    }).catch(function(){ segnala("rete"); }).then(function(){ leggendo = false; });
  }
  function prossimo(){
    clearTimeout(timer);
    if(!aperta || document.hidden || !tokLettura()) return;
    timer = setTimeout(function(){ leggi().then(prossimo); }, (stato === "noaccesso" || stato === "tokenko") ? 20000 : 5000);
  }
  document.addEventListener("visibilitychange", function(){ if(!document.hidden && aperta) leggi().then(prossimo); else clearTimeout(timer); });

  /* legge oggetti.json, lo cambia con fn(d) e lo salva; se intanto qualcun altro l'ha salvato, riprova */
  function modifica(tok, fn, tent){
    tent = tent || 0;
    return gh(tok, "GET", "/contents/" + FILE).then(function(r){
      if(r.status === 404) return { d: { app: "the-careless-journey", tipo: "oggetti-del-gruppo", v: 1, oggetti: [] }, sha: null };
      if(!r.ok) throw r;
      return r.json().then(function(j){
        var c = j.content ? Promise.resolve(j.content) : gh(tok, "GET", "/git/blobs/" + j.sha).then(function(x){ return x.json(); }).then(function(b){ return b.content; });
        return c.then(function(b64){ var d = {}; try { d = JSON.parse(b64d(b64)); } catch(e){} return { d: d, sha: j.sha }; });
      });
    }).then(function(o){
      var d = o.d && typeof o.d === "object" ? o.d : {}; d.oggetti = Array.isArray(d.oggetti) ? d.oggetti : [];
      var msg = fn(d);
      if(!msg){ ricevi(d); return; }
      d.agg = new Date().toISOString();
      var corpo = { message: msg, content: b64e(JSON.stringify(d, null, 1)) };
      if(o.sha) corpo.sha = o.sha;
      return gh(tok, "PUT", "/contents/" + FILE, corpo).then(function(r){
        if((r.status === 409 || r.status === 422) && tent < 5) return aspetta(300 + tent * 450).then(function(){ return modifica(tok, fn, tent + 1); });
        if(!r.ok) throw r;
        etag = null; ricevi(d);
      });
    });
  }
  function esegui(chi, fn, okMsg){
    var tok = tokScrittura(chi);
    if(!tok){ esito("ko", "Per scrivere sulla bacheca collega il salvataggio online nella tua Area dello Slayer."); return Promise.resolve(false); }
    lavoro = true; esito("att", "Invio alla bacheca…");
    return modifica(tok, fn).then(function(){ lavoro = false; esito("ok", okMsg); segnala("ok"); return true; }).catch(function(e){
      lavoro = false; var st = e && e.status;
      esito("ko", st === 404 ? "Non inviato: il token non vede il repository «gruppo»." : st === 401 ? "Non inviato: il token non è più valido, chiedine uno nuovo al Master." : st === 403 ? "Non inviato: il token non ha il permesso di scrivere su «gruppo»." : "Non inviato: controlla la connessione e riprova.");
      return false;
    });
  }

  /* ---------- disegno ---------- */
  var MSG = {
    notoken: "Collega il salvataggio online nella tua Area dello Slayer per vedere la bacheca aggiornata. Qui sotto c'è l'ultima copia salvata su questo dispositivo.",
    noaccesso: "La bacheca non è raggiungibile: il token di questo dispositivo non include il repository «gruppo».",
    tokenko: "Il token di questo dispositivo non è più valido: chiedine uno nuovo al Master.",
    limite: "GitHub chiede di rallentare: la bacheca si aggiorna tra poco.",
    rete: "Connessione assente: qui sotto c'è l'ultima copia salvata.",
    errore: "Non riesco a leggere la bacheca adesso. Riprovo tra poco."
  };
  function segnala(s){
    stato = s; if(!box) return;
    var w = $("rel-bac-stato"); if(!w) return;
    w.textContent = s === "ok" ? "In diretta · la vedono tutti" : s === "attesa" ? "Apro la bacheca…" : (MSG[s] || "");
    w.setAttribute("data-s", s === "ok" ? "ok" : s === "attesa" ? "att" : "ko");
  }
  function esito(cls, t){ var e = $("rel-bac-esito"); if(!e) return; e.textContent = t || ""; e.setAttribute("data-s", cls || ""); }

  function scheletro(){
    box.innerHTML = '<div class="rel-bac-testa"><div><div class="rel-bac-k">Scritta dai giocatori</div>'
      + '<h3 class="rel-bac-t" id="rel-bac-t">Artefatti e oggetti del gruppo</h3></div>'
      + '<div class="rel-bac-stato" id="rel-bac-stato" aria-live="polite"></div></div>'
      + '<p class="rel-bac-intro">Annotate qui gli artefatti e gli oggetti che il gruppo mette via: il loro nome e cosa sapete. Tutti vedono la bacheca; ognuno può cambiare o togliere solo ciò che ha scritto, e può scegliere se firmarlo col proprio nome.</p>'
      + '<div class="rel-bac-lista" id="rel-bac-lista" role="list"></div>'
      + '<div class="rel-bac-form" id="rel-bac-form"></div>';
    segnala(stato); lista(); modulo();
  }

  function lista(){
    if(!box) return; var el = $("rel-bac-lista"); if(!el) return;
    if(inModifica && el.querySelector(".rel-bac-mod")) return;   /* non cancellare ciò che si sta scrivendo */
    var L = oggetti();
    if(!L.length){ el.innerHTML = '<p class="rel-bac-vuota">La bacheca è ancora vuota.</p>'; return; }
    el.innerHTML = L.map(function(o){
      var mio = puoCambiare(o);
      var tp = tipoDi(o), f = firma(o);
      return '<article class="rel-bac-ogg rel-bac-' + tp + '" role="listitem" data-id="' + esc(o.id) + '">'
        + '<div class="rel-bac-tipo">' + TIPI[tp].i + ' ' + TIPI[tp].n + '</div>'
        + '<h4 class="rel-bac-n">' + esc(o.nome) + '</h4>'
        + (o.descr ? '<div class="rel-bac-d"><p>' + testo(o.descr) + '</p></div>' : '')
        + '<div class="rel-bac-piede"><span class="rel-bac-chi' + (o.anon ? " anon" : "") + '">' + (f.e ? f.e + " " : "") + esc(f.t)
        + (o.t ? ' · ' + esc(quando(o.mod || o.t)) + (o.mod ? " (modificato)" : "") : "") + '</span>'
        + (mio ? '<span class="rel-bac-azioni"><button type="button" class="rel-bac-b" data-az="mod">✎ Modifica</button><button type="button" class="rel-bac-b rel-bac-via" data-az="via">✕ Togli</button></span>' : '')
        + '</div></article>';
    }).join("");
  }

  function modulo(){
    if(!box) return; var el = $("rel-bac-form"); if(!el) return;
    var A = autori();
    if(!A.length){
      el.innerHTML = '<p class="rel-bac-poco">Per mettere via un artefatto o un oggetto apri la tua <b>Area dello Slayer</b>.</p>'
        + '<button type="button" class="bk-btn" id="rel-bac-vai">⚔ Vai alla mia Area</button>';
      return;
    }
    if(A.indexOf(bozza.chi) < 0) bozza.chi = A[0];
    var h = '<h4 class="rel-bac-ft">Metti via un artefatto o un oggetto</h4>' + sceltaTipo("rel-bac-tipo", bozza.tipo);
    if(A.length > 1){
      h += '<div class="inc-chi" role="radiogroup" aria-label="Chi aggiunge l\'oggetto">';
      A.forEach(function(k){ var on = k === bozza.chi; h += '<button type="button" role="radio" class="inc-chi-b' + (on ? " on" : "") + '" aria-checked="' + on + '" data-chi="' + k + '">' + esc((EMO[k] ? EMO[k] + " " : "") + breve(k)) + '</button>'; });
      h += '</div>';
    }
    h += '<label class="inc-lbl" for="rel-bac-nome">Nome dell\'oggetto</label>'
      + '<input type="text" id="rel-bac-nome" class="rel-bac-in" maxlength="' + MAX_NOME + '" autocomplete="off" placeholder="Per esempio: Bussola d\'ottone">'
      + '<label class="inc-lbl" for="rel-bac-descr">Descrizione</label>'
      + '<textarea id="rel-bac-descr" class="inc-ta" rows="3" maxlength="' + MAX_DESCR + '" placeholder="Dove l\'avete trovato, a cosa serve, chi lo porta…"></textarea>'
      + sceltaFirma("rel-bac-anon", bozza.anon)
      + '<div class="rel-bac-riga"><button type="button" class="rel-bac-add" id="rel-bac-add">＋ Aggiungi alla bacheca</button>'
      + '<span class="rel-bac-esito" id="rel-bac-esito" aria-live="polite"></span></div>';
    el.innerHTML = h;
    $("rel-bac-nome").value = bozza.nome; $("rel-bac-descr").value = bozza.descr;
  }

  function sceltaTipo(nome, v){
    return '<div class="rel-bac-tipi" role="radiogroup" aria-label="Che cos\'è">'
      + Object.keys(TIPI).map(function(k){ var on = k === v; return '<button type="button" role="radio" class="inc-chi-b' + (on ? " on" : "") + '" aria-checked="' + on + '" data-tipo="' + k + '" data-per="' + nome + '">' + TIPI[k].i + ' ' + TIPI[k].n + '</button>'; }).join("")
      + '</div>';
  }
  function sceltaFirma(id, anon){
    return '<label class="rel-bac-firma"><input type="checkbox" id="' + id + '"' + (anon ? "" : " checked") + '> <span>Mostra il mio nome accanto all\'oggetto</span></label>';
  }

  /* ---------- azioni ---------- */
  function aggiungi(){
    if(lavoro) return;
    var nome = bozza.nome.trim().slice(0, MAX_NOME), descr = bozza.descr.trim().slice(0, MAX_DESCR), chi = bozza.chi;
    if(!nome){ esito("ko", "Scrivi almeno il nome dell'oggetto."); try { $("rel-bac-nome").focus(); } catch(e){} return; }
    if(autori().indexOf(chi) < 0){ modulo(); return; }
    var o = { id: nuovoId(), tipo: bozza.tipo, nome: nome, descr: descr, chi: chi, t: new Date().toISOString() };
    if(bozza.anon) o.anon = true;
    esegui(chi, function(d){ d.oggetti.push(o); return "Bacheca · " + nelLog(o, chi) + " mette via «" + nome + "»"; }, "✓ Aggiunto: lo vedono tutti").then(function(ok){
      if(!ok) return;
      bozza.nome = ""; bozza.descr = ""; bozza.tipo = "oggetto"; modulo(); esito("ok", "✓ Aggiunto: lo vedono tutti"); suono("paper");
      var c = box && box.querySelector('.rel-bac-ogg[data-id="' + o.id + '"]'); if(c){ c.classList.add("nuovo"); try { c.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch(e){} }
    });
  }
  function apriModifica(art){
    var id = art.getAttribute("data-id"), o = oggetti().filter(function(x){ return x.id === id; })[0]; if(!o || !puoCambiare(o)) return;
    inModifica = id; modTipo = tipoDi(o);
    art.innerHTML = '<div class="rel-bac-mod">' + sceltaTipo("rel-bac-mtipo", modTipo) + '<label class="inc-lbl" for="rel-bac-mn">Nome</label>'
      + '<input type="text" id="rel-bac-mn" class="rel-bac-in" maxlength="' + MAX_NOME + '" autocomplete="off">'
      + '<label class="inc-lbl" for="rel-bac-md">Descrizione</label>'
      + '<textarea id="rel-bac-md" class="inc-ta" rows="3" maxlength="' + MAX_DESCR + '"></textarea>'
      + (((o.chi === "master" && master()) || (o.chi !== "master" && aperto(o.chi))) ? sceltaFirma("rel-bac-manon", !!o.anon) : '')
      + '<div class="rel-bac-riga"><button type="button" class="rel-bac-add" data-az="salva">✓ Salva</button><button type="button" class="rel-bac-b" data-az="annulla">Annulla</button></div></div>';
    $("rel-bac-mn").value = o.nome; $("rel-bac-md").value = o.descr || "";
    try { $("rel-bac-mn").focus(); } catch(e){}
  }
  function salvaModifica(){
    if(lavoro) return;
    var id = inModifica, nome = ($("rel-bac-mn").value || "").trim().slice(0, MAX_NOME), descr = ($("rel-bac-md").value || "").trim().slice(0, MAX_DESCR);
    if(!nome){ esito("ko", "Il nome non può restare vuoto."); return; }
    var o = oggetti().filter(function(x){ return x.id === id; })[0]; if(!o) { inModifica = null; lista(); return; }
    var chi = master() ? "master" : o.chi, firmaBox = $("rel-bac-manon");
    esegui(chi, function(d){
      var x = d.oggetti.filter(function(y){ return y && y.id === id; })[0]; if(!x) return false;
      x.nome = nome; x.descr = descr; x.tipo = modTipo; x.mod = new Date().toISOString();
      if(firmaBox){ if(firmaBox.checked) delete x.anon; else x.anon = true; }
      return "Bacheca · " + nelLog(x, chi) + " modifica «" + nome + "»";
    }, "✓ Modifica salvata").then(function(ok){ if(ok){ inModifica = null; lista(); } });
  }
  function togli(art){
    var id = art.getAttribute("data-id"), o = oggetti().filter(function(x){ return x.id === id; })[0]; if(!o || !puoCambiare(o)) return;
    var chiedi = typeof tcjConferma === "function" ? tcjConferma({ titolo: "Togliere «" + o.nome + "»?", testo: "L'oggetto sparisce dalla bacheca per tutti.", si: "Sì, toglilo", attesa: 1 }) : Promise.resolve(confirm("Togliere «" + o.nome + "» dalla bacheca?"));
    chiedi.then(function(ok){
      if(!ok) return;
      var chi = master() ? "master" : o.chi;
      esegui(chi, function(d){
        var n = d.oggetti.length; d.oggetti = d.oggetti.filter(function(y){ return !(y && y.id === id); });
        return d.oggetti.length < n ? "Bacheca · " + nelLog(o, chi) + " toglie «" + o.nome + "»" : false;
      }, "✓ Tolto dalla bacheca");
    });
  }

  function suClick(e){
    var t = e.target;
    var c = t.closest(".inc-chi-b[data-chi]"); if(c){ bozza.chi = c.getAttribute("data-chi"); modulo(); return; }
    var tb = t.closest(".inc-chi-b[data-tipo]");
    if(tb){
      var v = tb.getAttribute("data-tipo");
      if(tb.getAttribute("data-per") === "rel-bac-mtipo") modTipo = v; else bozza.tipo = v;
      tb.parentNode.querySelectorAll(".inc-chi-b").forEach(function(x){ var on = x === tb; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      return;
    }
    if(t.closest("#rel-bac-add")){ aggiungi(); return; }
    if(t.closest("#rel-bac-vai")){ try { var x = $("rel-x"); if(x) x.click(); } catch(_){} var s = $("scheda"); if(s) s.scrollIntoView({ behavior: "smooth" }); return; }
    var b = t.closest("[data-az]"); if(!b) return;
    var art = b.closest(".rel-bac-ogg"), az = b.getAttribute("data-az");
    if(az === "mod" && art) apriModifica(art);
    else if(az === "via" && art) togli(art);
    else if(az === "salva") salvaModifica();
    else if(az === "annulla"){ inModifica = null; lista(); }
  }
  function suInput(e){
    if(e.target.id === "rel-bac-nome") bozza.nome = e.target.value;
    else if(e.target.id === "rel-bac-descr") bozza.descr = e.target.value;
    else if(e.target.id === "rel-bac-anon") bozza.anon = !e.target.checked;
  }
  function suTasto(e){
    if(e.key === "Enter" && e.target.id === "rel-bac-nome"){ e.preventDefault(); aggiungi(); }
    else if(e.key === "Enter" && e.target.id === "rel-bac-mn"){ e.preventDefault(); salvaModifica(); }
    else if(e.key === "Escape" && inModifica && e.target.closest(".rel-bac-mod")){ e.preventDefault(); e.stopPropagation(); inModifica = null; lista(); }
  }

  /* ---------- collegamento con la stanza (js/reliquie.js) ---------- */
  window.relBac = {
    /* chiamato ogni volta che la stanza ridisegna gli scaffali */
    monta: function(el){
      if(!el) return;
      if(box !== el){ el.addEventListener("click", suClick); el.addEventListener("input", suInput); el.addEventListener("change", suInput); el.addEventListener("keydown", suTasto); }
      box = el; inModifica = null; scheletro();
    },
    apri: function(){ aperta = true; leggi().then(prossimo); },
    chiudi: function(){ aperta = false; clearTimeout(timer); }
  };
})();
