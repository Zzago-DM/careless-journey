/* Zona Master — capitolo «Reliquie della nave»: decide quali artefatti stanno sui piedistalli della
   Stanza delle Reliquie (Nave › Zona Segreta) e cosa ne sanno i giocatori.
   - L'elenco completo (anche le reliquie ancora nascoste e le note del Master) sta nel repository privato tcj-master:
       reliquie/reliquie.json   le reliquie, in ordine
       reliquie/foto/           le immagini originali
   - «Pubblica sul sito» copia nel sito pubblico SOLO le reliquie segnate «Mostra ai giocatori»:
       dati/reliquie.json (nome, descrizione, immagine) e le immagini in img/reliquie/, in un'unica modifica.
     Le note del Master non lasciano mai tcj-master.
   Il capitolo viene aggiunto qui alla Zona Master (prima che diventi «bolle»), solo dove c'è il token del Master. */
(function(){
  "use strict";
  var ms = document.getElementById("ms");
  if(!ms || !ms.querySelector(".msec")) return;
  var OWNER = "Zzago-DM", PRIV = OWNER + "/tcj-master", SITO = OWNER + "/careless-journey", RAMO = "main";
  var F_DATI = "reliquie/reliquie.json", D_FOTO = "reliquie/foto";
  var P_DATI = "dati/reliquie.json", P_FOTO = "img/reliquie";
  var LOC = "tcj-mreliquie";

  /* ---------- il capitolo nella Zona Master ---------- */
  var sec = document.createElement("div");
  sec.className = "msec"; sec.id = "m-reliquie"; sec.style.borderTop = "1px solid rgba(200,56,56,.1)";
  sec.innerHTML = '<div class="msecsub">Nave · Zona Segreta</div><div class="msect">Reliquie della nave</div><div class="msecl"></div>'
    + '<p class="rel-ed-intro">Gli artefatti che il gruppo custodisce nella stanza segreta. Solo quelli con <b>«Mostra ai giocatori»</b> compaiono sui piedistalli, dopo <b>«📣 Pubblica sul sito»</b>. Ogni giocatore può scriverci le sue note personali.</p>'
    + '<div id="rel-ed"></div>';
  var tutte = ms.querySelectorAll(".msec"), ultima = tutte[tutte.length - 1];
  ultima.insertAdjacentElement("afterend", sec);
  var nav = ms.querySelector(".msnav");
  if(nav){ var a = document.createElement("a"); a.href = "#m-reliquie"; a.textContent = "Reliquie della nave"; nav.appendChild(a); }
  var box = document.getElementById("rel-ed");

  /* ---------- utilità ---------- */
  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function b64bytes(by){ var bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64e(str){ return b64bytes(new TextEncoder().encode(str)); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function uid(){ return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function norm(s){ return String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
  function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function suono(n){ try { sfxPlay(n); } catch(_){} }
  function avviso(t, err){
    var d = document.createElement("div"); d.className = "gh-toast on" + (err ? " err" : ""); d.setAttribute("role", "status"); d.textContent = t;
    document.body.appendChild(d); setTimeout(function(){ d.classList.remove("on"); setTimeout(function(){ d.remove(); }, 400); }, err ? 7000 : 3500);
  }
  function gh(repo, metodo, percorso, corpo, raw){
    var h = { "Authorization": "Bearer " + token(), "Accept": raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(corpo) h["Content-Type"] = "application/json";
    if(metodo === "GET") percorso += (percorso.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36);
    return fetch("https://api.github.com/repos/" + repo + percorso, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function ok(r){ if(!r.ok) throw r.status; return r; }
  function msgErr(e, dove){
    if(e === 401) return "Il token del Master non è più valido.";
    if(e === 403 || e === 404) return dove === "sito"
      ? "Il token del Master non può scrivere sul sito: aggiungi il repository careless-journey al token (Contents: Read and write)."
      : "Il token del Master non apre tcj-master.";
    if(e === 409 || e === 422) return "Qualcun altro ha appena modificato gli stessi file: riprova tra qualche secondo.";
    return "Non riesco a raggiungere GitHub: controlla la connessione e riprova.";
  }
  function sole(cls){ return '<svg class="' + cls + '" viewBox="0 0 1739 3364" aria-hidden="true" focusable="false"><use href="#gsun"/></svg>'; }

  /* ---------- dati ---------- */
  var D = { v: 1, reliquie: [], pubblicato: null }, sha = null, sel = null, sporco = false, timer = null, occupato = false;
  function nuova(nome, foto){ return { id: uid(), nome: nome || "", descr: "", note: "", foto: foto || "", mostra: false }; }
  function pulisci(r){ var n = nuova(); Object.keys(n).forEach(function(k){ if(r[k] === undefined) r[k] = n[k]; }); r.mostra = !!r.mostra; return r; }
  function trova(id){ for(var i = 0; i < D.reliquie.length; i++) if(D.reliquie[i].id === id) return D.reliquie[i]; return null; }
  function salvaLocale(){ try { localStorage.setItem(LOC, JSON.stringify({ d: D, sha: sha })); } catch(e){} }
  function cambiato(){ sporco = true; salvaLocale(); stato(); clearTimeout(timer); timer = setTimeout(salva, 2000); }
  function carica(){
    stato("Scarico l'elenco…");
    return gh(PRIV, "GET", "/contents/" + F_DATI).then(function(r){ if(r.status === 404) return null; return ok(r).json(); })
      .then(function(j){
        if(j){ D = Object.assign({ v: 1, reliquie: [], pubblicato: null }, JSON.parse(b64d(j.content || ""))); sha = j.sha; }
        D.reliquie = (D.reliquie || []).map(pulisci);
        sporco = false; salvaLocale(); disegna(); stato();
      }).catch(function(e){
        try { var c = JSON.parse(localStorage.getItem(LOC) || "null"); if(c && c.d){ D = c.d; sha = c.sha; D.reliquie = (D.reliquie || []).map(pulisci); } } catch(_){}
        disegna(); stato(msgErr(e), true);
      });
  }
  function salva(){
    if(occupato || !sporco) return Promise.resolve();
    clearTimeout(timer); occupato = true; stato("Salvo…");
    var corpo = { message: "Reliquie: elenco aggiornato", content: b64e(JSON.stringify(D, null, 1)) };
    if(sha) corpo.sha = sha;
    return gh(PRIV, "PUT", "/contents/" + F_DATI, corpo).then(ok).then(function(r){ return r.json(); }).then(function(j){
      sha = j.content && j.content.sha; sporco = false; occupato = false; salvaLocale(); stato();
    }).catch(function(e){
      occupato = false;
      if(e === 409 || e === 422){
        return gh(PRIV, "GET", "/contents/" + F_DATI).then(ok).then(function(r){ return r.json(); }).then(function(j){ sha = j.sha; return salva(); })
          .catch(function(e2){ stato(msgErr(e2), true); });
      }
      stato(msgErr(e), true);
    });
  }

  /* ---------- immagini (in tcj-master, si scaricano con il token) ---------- */
  var imm = {};
  function immagine(nome){
    if(!nome) return Promise.reject("nessuna");
    if(imm[nome]) return imm[nome];
    var pr = gh(PRIV, "GET", "/contents/" + D_FOTO + "/" + encodeURIComponent(nome), null, true).then(ok).then(function(r){ return r.blob(); })
      .then(function(b){ return URL.createObjectURL(b); });
    imm[nome] = pr; pr.catch(function(){ delete imm[nome]; });
    return pr;
  }
  function bytesFoto(nome){
    return gh(PRIV, "GET", "/contents/" + D_FOTO + "/" + encodeURIComponent(nome), null, true).then(ok).then(function(r){ return r.arrayBuffer(); });
  }
  var elenco = null;
  function elencoFoto(){
    if(elenco) return Promise.resolve(elenco);
    return gh(PRIV, "GET", "/contents/" + D_FOTO).then(function(r){ return r.status === 404 ? [] : ok(r).json(); })
      .then(function(l){ elenco = (l || []).filter(function(f){ return f.type === "file"; }).map(function(f){ return f.name; }); return elenco; });
  }
  /* carica un'immagine: ridotta (max 900 px), trasparenza conservata, in WebP */
  function caricaFoto(file){
    return createImageBitmap(file).then(function(bm){
      var k = Math.min(1, 900 / Math.max(bm.width, bm.height)), cv = document.createElement("canvas");
      cv.width = Math.round(bm.width * k); cv.height = Math.round(bm.height * k);
      cv.getContext("2d").drawImage(bm, 0, 0, cv.width, cv.height);
      return new Promise(function(ris){ cv.toBlob(ris, "image/webp", 0.9); });
    }).then(function(blob){ return blob.arrayBuffer(); }).then(function(buf){
      return elencoFoto().then(function(l){
        var base = norm(file.name.replace(/\.[^.]+$/, "")).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "reliquia", nome = base + ".webp", i = 2;
        while(l.indexOf(nome) >= 0){ nome = base + "-" + i + ".webp"; i++; }
        return gh(PRIV, "PUT", "/contents/" + D_FOTO + "/" + nome, { message: "Reliquie: nuova immagine " + nome, content: b64bytes(new Uint8Array(buf)) })
          .then(ok).then(function(){ l.push(nome); return nome; });
      });
    });
  }


  /* ---------- interfaccia ---------- */
  box.innerHTML =
    '<div class="ie-top"><span class="ie-st" id="re-st" role="status"></span>'
    + '<button type="button" class="ie-btn ie-pub" id="re-pub">📣 Pubblica sul sito</button></div>'
    + '<div class="ie-wrap"><aside class="ie-side">'
    + '<label class="ie-lbl" for="re-q">Cerca</label><input type="search" id="re-q" class="ie-in" placeholder="Nome della reliquia…" autocomplete="off">'
    + '<button type="button" class="ie-btn ie-new" id="re-new">＋ Nuova reliquia</button>'
    + '<div class="ie-conta" id="re-conta"></div><div class="ie-lista" id="re-lista" role="list"></div></aside>'
    + '<div class="ie-form" id="re-form"></div></div>';
  var $ = function(id){ return document.getElementById(id); };

  function stato(t, err){
    var el = $("re-st"); if(!el) return;
    if(t){ el.textContent = t; el.classList.toggle("err", !!err); return; }
    el.classList.remove("err");
    var pub = D.pubblicato ? "Ultima pubblicazione: " + new Date(D.pubblicato).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Mai pubblicato sul sito";
    el.textContent = (sporco ? "● Modifiche da salvare · " : "✓ Salvato · ") + pub;
  }
  function miniature(root){
    root.querySelectorAll("img[data-f]").forEach(function(im){
      immagine(im.getAttribute("data-f")).then(function(u){ im.src = u; im.classList.add("ok"); }).catch(function(){});
    });
  }
  var filtro = "";
  function disegnaLista(){
    var vis = D.reliquie.filter(function(r){ return r.mostra; }).length, q = norm(filtro);
    $("re-conta").textContent = D.reliquie.length + (D.reliquie.length === 1 ? " reliquia · " : " reliquie · ") + vis + " sui piedistalli";
    $("re-lista").innerHTML = D.reliquie.filter(function(r){ return !q || norm(r.nome).indexOf(q) >= 0; }).map(function(r){
      return '<button type="button" role="listitem" class="ie-it' + (r.id === sel ? " on" : "") + '" data-id="' + r.id + '">'
        + '<span class="ie-av re-av">' + (r.foto ? '<img alt="" data-f="' + esc(r.foto) + '">' : sole("ie-sole")) + '</span>'
        + '<span class="ie-it-t"><span class="ie-it-n">' + esc(r.nome || "Senza nome") + '</span><span class="ie-it-c">' + (r.mostra ? "Sul piedistallo" : "Nascosta") + '</span></span>'
        + '<span class="ie-occhio' + (r.mostra ? " on" : "") + '" title="' + (r.mostra ? "Visibile ai giocatori" : "Nascosta ai giocatori") + '">' + (r.mostra ? "👁" : "◌") + '</span></button>';
    }).join("") || ('<div class="ie-vuoto">' + (q ? "Nessuna reliquia corrisponde." : "Ancora nessuna reliquia: crea la prima con «＋ Nuova reliquia» e scegli la sua immagine dalla galleria.") + '</div>');
    miniature($("re-lista"));
  }
  function disegnaForm(){
    var f = $("re-form"), r = trova(sel);
    if(!r){ f.innerHTML = '<div class="ie-vuoto ie-vuoto-g">' + sole("ie-sole-g") + '<p>Scegli una reliquia dall\'elenco, o creane una nuova.</p></div>'; return; }
    var i = D.reliquie.indexOf(r);
    f.innerHTML = '<div class="re-fgrid"><div class="re-col-img">'
      + '<button type="button" class="re-img" id="re-img" aria-label="' + (r.foto ? "Cambia immagine dalla galleria" : "Scegli un\'immagine dalla galleria") + '">'
      + (r.foto ? '<img alt="" data-f="' + esc(r.foto) + '">' : sole("ie-sole-f")) + '<span>' + (r.foto ? "Cambia immagine" : "Tocca per scegliere un'immagine") + '</span></button>'
      + (r.foto ? '<button type="button" class="ie-btn re-togli" id="re-togli">Togli immagine</button>' : '')
      + '<div class="re-ordine"><button type="button" class="ie-btn" id="re-su"' + (i <= 0 ? " disabled" : "") + '>↑ Prima</button><button type="button" class="ie-btn" id="re-giu"' + (i >= D.reliquie.length - 1 ? " disabled" : "") + '>↓ Dopo</button></div>'
      + '<div class="ie-nota">L\'ordine è quello dei piedistalli nella stanza.</div></div>'
      + '<div class="re-col-txt">'
      + '<label class="ie-lbl" for="re-nome">Nome</label><input id="re-nome" class="ie-in" autocomplete="off" placeholder="Come la chiamano i giocatori">'
      + '<label class="ie-lbl" for="re-descr">Descrizione <span>— la leggono i giocatori</span></label><textarea id="re-descr" class="ie-in re-ta" rows="6" placeholder="Cosa sanno di questa reliquia: aspetto, dove l\'hanno trovata, cosa fa…"></textarea>'
      + '<label class="ie-lbl ie-lbl-m" for="re-note">Note del Master <span>— private, restano in tcj-master</span></label><textarea id="re-note" class="ie-in re-ta" rows="4" placeholder="Cosa è davvero, segreti, collegamenti…"></textarea>'
      + '<div class="re-mostra"><label class="ie-sw ie-sw-main"><input type="checkbox" id="re-mostra"' + (r.mostra ? " checked" : "") + '><span></span>Mostra ai giocatori <em>(sul piedistallo, dopo «Pubblica»)</em></label></div>'
      + '<div class="ie-fondo"><button type="button" class="ie-btn ie-del" id="re-del">🗑 Elimina reliquia</button></div>'
      + '</div></div>';
    $("re-nome").value = r.nome; $("re-descr").value = r.descr; $("re-note").value = r.note;
    miniature(f);
  }
  function disegna(){ disegnaLista(); disegnaForm(); stato(); }

  /* ---------- eventi ---------- */
  $("re-lista").addEventListener("click", function(e){ var b = e.target.closest(".ie-it[data-id]"); if(!b) return; sel = b.getAttribute("data-id"); disegna(); suono("paper"); });
  $("re-new").addEventListener("click", function(){ var r = nuova("Nuova reliquia"); D.reliquie.push(r); sel = r.id; cambiato(); disegna(); setTimeout(function(){ var n = $("re-nome"); if(n){ n.focus(); n.select(); } }, 30); });
  $("re-q").addEventListener("input", function(){ filtro = this.value; disegnaLista(); });
  $("re-form").addEventListener("input", function(e){
    var r = trova(sel); if(!r) return;
    if(e.target.id === "re-nome"){ r.nome = e.target.value; disegnaLista(); }
    else if(e.target.id === "re-descr") r.descr = e.target.value;
    else if(e.target.id === "re-note") r.note = e.target.value;
    else return;
    cambiato();
  });
  $("re-form").addEventListener("change", function(e){
    var r = trova(sel); if(!r || e.target.id !== "re-mostra") return;
    r.mostra = e.target.checked; cambiato(); disegnaLista(); suono(r.mostra ? "on" : "off");
  });
  $("re-form").addEventListener("click", function(e){
    var r = trova(sel); if(!r) return;
    var i = D.reliquie.indexOf(r);
    if(e.target.closest("#re-img")){ apriGalleria(); return; }
    if(e.target.closest("#re-togli")){ r.foto = ""; cambiato(); disegna(); return; }
    if(e.target.closest("#re-su") && i > 0){ D.reliquie.splice(i, 1); D.reliquie.splice(i - 1, 0, r); cambiato(); disegna(); return; }
    if(e.target.closest("#re-giu") && i < D.reliquie.length - 1){ D.reliquie.splice(i, 1); D.reliquie.splice(i + 1, 0, r); cambiato(); disegna(); return; }
    if(e.target.closest("#re-del")){
      var vai = function(){ D.reliquie.splice(i, 1); sel = null; cambiato(); disegna(); suono("drop"); };
      if(typeof tcjConferma === "function") tcjConferma({ titolo: "Eliminare la reliquia?", testo: "<b>«" + esc(r.nome || "Senza nome") + "»</b> verrà tolta dall'elenco. L'immagine resta in tcj-master. Se era visibile, sparirà dalla stanza alla prossima pubblicazione.", si: "Sì, elimina" }).then(function(okk){ if(okk) vai(); });
      else vai();
    }
  });
  /* ---------- galleria (reliquie/foto in tcj-master), come quella degli Incontri ---------- */
  var gOv = null, gSolo = "tutte", gObs = null;
  function chiLaUsa(nome){ return D.reliquie.filter(function(x){ return x.foto === nome; }); }
  function apriGalleria(){
    var r = trova(sel); if(!r) return;
    if(!gOv){
      gOv = document.createElement("div"); gOv.className = "ie-gov re-gov"; gOv.setAttribute("role", "dialog"); gOv.setAttribute("aria-modal", "true"); gOv.setAttribute("aria-labelledby", "re-gt");
      gOv.innerHTML = '<div class="ie-gbox"><div class="ie-gtop"><strong id="re-gt">Galleria</strong>'
        + '<input type="search" class="ie-in" id="re-gq" placeholder="Cerca per nome del file…" aria-label="Cerca nella galleria">'
        + '<div class="ie-gfil" role="radiogroup" aria-label="Quali immagini mostrare"><button type="button" role="radio" data-gs="tutte">Tutte</button><button type="button" role="radio" data-gs="libere">Solo libere</button></div>'
        + '<label class="ie-btn ie-gup">⬆ Carica immagini<input type="file" id="re-gup" accept="image/*" multiple hidden></label>'
        + '<button type="button" class="ie-x" id="re-gx" aria-label="Chiudi la galleria">✕</button></div>'
        + '<div class="ie-gsub" id="re-gsub" aria-live="polite"></div><div class="ie-ggrid re-ggrid" id="re-ggrid"></div></div>';
      document.body.appendChild(gOv);
      gOv.addEventListener("click", function(e){
        if(e.target === gOv || e.target.closest("#re-gx")){ chiudiGalleria(); return; }
        var f = e.target.closest("[data-gs]"); if(f){ gSolo = f.getAttribute("data-gs"); riempiGalleria(); return; }
        var b = e.target.closest("[data-g]"); if(!b) return;
        var q = trova(sel); if(!q) return;
        var nome = b.getAttribute("data-g"), altri = chiLaUsa(nome).filter(function(x){ return x.id !== q.id; });
        var scegli = function(){
          q.foto = nome;
          if(!q.nome || q.nome === "Nuova reliquia"){ var t = nome.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "); q.nome = t.charAt(0).toUpperCase() + t.slice(1); }
          chiudiGalleria(); cambiato(); disegna(); suono("paper");
        };
        if(q.foto === nome){ chiudiGalleria(); return; }
        if(!altri.length){ scegli(); return; }
        var chi = altri.map(function(x){ return "<b>" + esc(x.nome || "Senza nome") + "</b>"; }).join(", ");
        (typeof tcjConferma === "function"
          ? tcjConferma({ titolo: "Immagine già in uso", testo: "Questa immagine è già usata da " + chi + ".<br><br>Vuoi usarla anche per <b>" + esc(q.nome || "questa reliquia") + "</b>?", si: "Sì, usala" })
          : Promise.resolve(confirm("Immagine già in uso. Usarla anche qui?"))).then(function(si){ if(si) scegli(); });
      });
      gOv.addEventListener("keydown", function(e){ if(e.key === "Escape"){ e.stopPropagation(); chiudiGalleria(); } });
      $("re-gq").addEventListener("input", function(){ riempiGalleria(); });
      $("re-gup").addEventListener("change", function(){ var fl = [].slice.call(this.files || []); this.value = ""; if(fl.length) caricaTante(fl); });
    }
    gOv.hidden = false; document.documentElement.style.overflow = "hidden";
    $("re-gt").textContent = "Galleria — immagine per " + (r.nome || "la nuova reliquia");
    $("re-gq").value = ""; riempiGalleria(); try { $("re-gq").focus(); } catch(_){}
  }
  function chiudiGalleria(){ gOv.hidden = true; document.documentElement.style.overflow = ""; var b = $("re-img"); if(b) try { b.focus(); } catch(_){} }
  function caricaTante(fl){
    var fatte = 0, ultimi = [];
    $("re-gsub").textContent = "Carico 0 di " + fl.length + "…";
    fl.reduce(function(pr, f){
      return pr.then(function(){ return caricaFoto(f).then(function(n){ ultimi.push(n); fatte++; $("re-gsub").textContent = "Carico " + fatte + " di " + fl.length + "…"; }); });
    }, Promise.resolve()).then(function(){
      $("re-gsub").textContent = fl.length === 1 ? "Immagine aggiunta: toccala per sceglierla." : fl.length + " immagini aggiunte alla galleria.";
      riempiGalleria(ultimi);
    }).catch(function(e){ $("re-gsub").textContent = msgErr(e); riempiGalleria(ultimi); });
  }
  function riempiGalleria(nuove){
    nuove = Array.isArray(nuove) ? nuove : [];
    var g = $("re-ggrid"), r = trova(sel);
    gOv.querySelectorAll("[data-gs]").forEach(function(b){ var on = b.getAttribute("data-gs") === gSolo; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
    if(!g.children.length) g.innerHTML = '<div class="ie-vuoto">Apro la galleria…</div>';
    elencoFoto().then(function(l){
      l = l.slice().sort(function(a, b){ return a.localeCompare(b, "it", { numeric: true }); });
      var q = norm($("re-gq").value);
      var v = l.filter(function(n){
        if(q && norm(n).indexOf(q) < 0) return false;
        if(gSolo === "libere"){ var u = chiLaUsa(n); return !u.length || (r && u.length === 1 && u[0].id === r.id); }
        return true;
      });
      var usate = l.filter(function(n){ return chiLaUsa(n).length; }).length;
      if(!nuove.length) $("re-gsub").textContent = l.length + " immagini · " + (l.length - usate) + " libere · " + usate + " già usate";
      if(!v.length){ g.innerHTML = '<div class="ie-vuoto">' + (l.length ? (gSolo === "libere" ? "Nessuna immagine libera." : "Nessuna immagine corrisponde.") : "La galleria è vuota: carica le prime immagini con «⬆ Carica immagini».") + '</div>'; return; }
      g.innerHTML = v.map(function(n){
        var u = chiLaUsa(n), mia = r && r.foto === n, altri = u.filter(function(x){ return !r || x.id !== r.id; });
        var cls = "ie-gi" + (mia ? " mia" : "") + (altri.length ? " usata" : "") + (nuove.indexOf(n) >= 0 ? " nuova" : "");
        var badge = mia ? '<span class="ie-gbadge mia">✓ Già sua</span>' : (altri.length ? '<span class="ie-gbadge">In uso: ' + esc(altri.map(function(x){ return x.nome || "Senza nome"; }).join(", ")) + '</span>' : (nuove.indexOf(n) >= 0 ? '<span class="ie-gbadge nuova">Nuova</span>' : ""));
        return '<button type="button" class="' + cls + '" data-g="' + esc(n) + '" aria-label="' + esc(n) + '">'
          + '<span class="ie-gimg"><img alt="" data-src="' + esc(n) + '">' + badge + '</span><span class="ie-gn">' + esc(n.replace(/\.[^.]+$/, "")) + '</span></button>';
      }).join("");
      if(gObs) gObs.disconnect();
      gObs = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var img = e.target; gObs.unobserve(img);
        immagine(img.getAttribute("data-src")).then(function(u){ img.src = u; img.classList.add("ok"); }).catch(function(){}); }); }, { root: g, rootMargin: "200px" });
      g.querySelectorAll("img[data-src]").forEach(function(i){ gObs.observe(i); });
    }).catch(function(e){ g.innerHTML = '<div class="ie-vuoto"></div>'; g.firstChild.textContent = msgErr(e); });
  }

  /* ---------- pubblicazione ---------- */
  function gitJson(metodo, perc, corpo){ return gh(SITO, metodo, perc, corpo).then(ok).then(function(r){ return r.json(); }); }
  $("re-pub").addEventListener("click", function(){
    var bt = this; if(bt.disabled) return;
    bt.disabled = true; stato("Preparo la pubblicazione…");
    var visibili = D.reliquie.filter(function(r){ return r.mostra && (r.nome || "").trim(); });
    var dati = { aggiornato: new Date().toISOString(), reliquie: [] }, servono = {};
    visibili.forEach(function(r){
      var o = { id: r.id, nome: r.nome.trim() };
      if(r.descr.trim()) o.descr = r.descr.trim();
      if(r.foto){ var n = r.id + "-" + hash(r.foto) + ".webp"; servono[n] = r.foto; o.foto = P_FOTO + "/" + n; }
      dati.reliquie.push(o);
    });
    var base, albero, esistenti = [];
    salva().then(function(){ return gitJson("GET", "/git/ref/heads/" + RAMO); })
    .then(function(ref){ base = ref.object.sha; return gitJson("GET", "/git/commits/" + base); })
    .then(function(c){ albero = c.tree.sha; return gh(SITO, "GET", "/contents/" + P_FOTO + "?ref=" + RAMO).then(function(r){ return r.status === 404 ? [] : ok(r).json(); }); })
    .then(function(l){
      esistenti = (l || []).filter(function(f){ return f.type === "file"; }).map(function(f){ return f.name; });
      var nuove = Object.keys(servono).filter(function(n){ return esistenti.indexOf(n) < 0; }), fatte = 0;
      stato("Preparo le immagini… 0/" + nuove.length);
      return nuove.reduce(function(pr, n){
        return pr.then(function(acc){
          return bytesFoto(servono[n]).then(function(buf){ return gitJson("POST", "/git/blobs", { content: b64bytes(new Uint8Array(buf)), encoding: "base64" }); })
            .then(function(bl){ fatte++; stato("Preparo le immagini… " + fatte + "/" + nuove.length); acc.push({ path: P_FOTO + "/" + n, mode: "100644", type: "blob", sha: bl.sha }); return acc; });
        });
      }, Promise.resolve([]));
    }).then(function(voci){
      esistenti.forEach(function(n){ if(!servono[n]) voci.push({ path: P_FOTO + "/" + n, mode: "100644", type: "blob", sha: null }); });
      voci.push({ path: P_DATI, mode: "100644", type: "blob", content: JSON.stringify(dati, null, 1) + "\n" });
      stato("Pubblico sul sito…");
      return gitJson("POST", "/git/trees", { base_tree: albero, tree: voci });
    }).then(function(t){ return gitJson("POST", "/git/commits", { message: "Reliquie aggiornate (" + dati.reliquie.length + " sui piedistalli)", tree: t.sha, parents: [base] }); })
    .then(function(c){ return gh(SITO, "PATCH", "/git/refs/heads/" + RAMO, { sha: c.sha }).then(ok); })
    .then(function(){
      D.pubblicato = dati.aggiornato; cambiato(); bt.disabled = false; suono("on");
      avviso("Pubblicato: " + dati.reliquie.length + (dati.reliquie.length === 1 ? " reliquia" : " reliquie") + " sui piedistalli. Il sito si aggiorna entro un paio di minuti.");
    }).catch(function(e){ bt.disabled = false; suono("deny"); stato(msgErr(e, "sito"), true); avviso(msgErr(e, "sito"), true); });
  });

  window.addEventListener("beforeunload", function(e){ if(sporco){ salva(); e.preventDefault(); e.returnValue = ""; } });
  disegna();
  if(token()) carica(); else stato("Serve il token del Master.", true);
})();
