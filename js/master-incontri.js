/* Zona Master — editor degli «Incontri» (i personaggi conosciuti dai player).
   - L'elenco completo (anche chi è ancora nascosto) sta nel repository privato tcj-master:
       incontri/personaggi.json   i personaggi, con le note del Master e i segni «visibile ai giocatori»
       incontri/foto/             la galleria delle foto originali
   - «Pubblica sul sito» copia nel sito pubblico SOLO quello che è segnato come visibile:
       dati/incontri.json e le foto già ritagliate in img/incontri/, in un'unica modifica.
   Funziona solo dove la Zona Master è aperta con il token del Master. */
(function(){
  var box = document.getElementById("inc-ed");
  if(!box) return;
  var OWNER = "Zzago-DM", PRIV = OWNER + "/tcj-master", SITO = OWNER + "/careless-journey", RAMO = "main";
  var F_DATI = "incontri/personaggi.json", D_FOTO = "incontri/foto";
  var P_DATI = "dati/incontri.json", P_FOTO = "img/incontri";
  var LOC = "tcj-mincontri";
  var CONT = [
    ["ardente", "Continente Ardente", "#e05a20"], ["glaciale", "Continente Glaciale", "#7ec8e3"],
    ["folgorante", "Continente Folgorante", "#f0d020"], ["terrestre", "Continente Terrestre", "#4a9640"],
    ["radiante", "Continente Radiante", "#d4a8ff"], ["oscuro", "Continente Oscuro", "#8860d0"],
    ["ramsgate", "Ramsgate", "#c8a84b"], ["altrove", "Altrove", "#a8a8b8"]
  ];
  var STATI = [["vivo", "Vivo"], ["morto", "Morto"], ["sconosciuto", "Sconosciuto"]];
  var FAZ_BASE = ["Gilda degli Slayer", "Guardie di Ostia", "Custodi di Rovo", "Slayer Fatui", "Slayer Ombra", "Slayer di Frontiera",
    "Artigli Brucianti", "Reticenti", "Monaci del Pugno", "Occulti", "Pirati", "Casata Silver", "Casata Val'Riden", "Casata Monkuiced"];
  var VIS = [["foto", "Foto"], ["pres", "Presentazione"], ["stato", "Stato"], ["fazioni", "Fazioni"], ["tag", "Tag"]];
  var W = 640, H = 800;                       /* misura delle foto pubblicate (4:5) */

  /* ---------- utilità ---------- */
  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function b64e(str){ var by = new TextEncoder().encode(str); return b64bytes(by); }
  function b64bytes(by){ var bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function uid(){ return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function norm(s){ return String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
  function cont(k){ for(var i = 0; i < CONT.length; i++) if(CONT[i][0] === k) return CONT[i]; return CONT[CONT.length - 1]; }
  function suono(n){ try { sfxPlay(n); } catch(_){} }
  function avviso(t, err){
    var d = document.createElement("div"); d.className = "gh-toast on" + (err ? " err" : ""); d.setAttribute("role", "status"); d.textContent = t;
    document.body.appendChild(d); setTimeout(function(){ d.classList.remove("on"); setTimeout(function(){ d.remove(); }, 400); }, err ? 7000 : 3500);
  }
  function gh(repo, metodo, percorso, corpo, raw){
    var h = { "Authorization": "Bearer " + token(), "Accept": raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(corpo) h["Content-Type"] = "application/json";
    return fetch("https://api.github.com/repos/" + repo + percorso, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function ok(r){ if(!r.ok) throw r.status; return r; }
  function msgErr(e, dove){
    if(e === 401) return "Il token del Master non è valido o è stato revocato.";
    if(e === 403 || e === 404) return dove === "sito"
      ? "Il token del Master non può scrivere sul sito: aggiungi il repository careless-journey al token (Contents: Read and write)."
      : "Il token del Master non apre tcj-master.";
    if(e === 409 || e === 422) return "Qualcun altro ha appena modificato gli stessi file: riprova tra qualche secondo.";
    return "Non riesco a raggiungere GitHub: controlla la connessione e riprova.";
  }

  /* ---------- dati ---------- */
  var D = { v: 1, personaggi: [], fazioni: [], tag: [], pubblicato: null }, sha = null, sel = null, filtro = "";
  var sporco = false, timer = null, occupato = false;
  function nuovo(){
    return { id: uid(), nome: "", continente: "ramsgate", stato: "vivo", fazioni: [], tag: [], pres: "", note: "",
      foto: null, vis: { mostra: false, foto: false, pres: true, stato: false, fazioni: false, tag: false } };
  }
  function pulisci(p){
    var n = nuovo(); Object.keys(n).forEach(function(k){ if(p[k] === undefined) p[k] = n[k]; });
    p.vis = Object.assign(n.vis, p.vis || {});
    if(!Array.isArray(p.fazioni)) p.fazioni = []; if(!Array.isArray(p.tag)) p.tag = [];
    return p;
  }
  function trova(id){ for(var i = 0; i < D.personaggi.length; i++) if(D.personaggi[i].id === id) return D.personaggi[i]; return null; }
  function usati(campo){
    var m = {}, base = campo === "fazioni" ? FAZ_BASE.concat(D.fazioni || []) : (D.tag || []);
    base.forEach(function(x){ m[x] = 1; });
    D.personaggi.forEach(function(p){ (p[campo] || []).forEach(function(x){ m[x] = 1; }); });
    return Object.keys(m).sort(function(a, b){ return a.localeCompare(b, "it"); });
  }
  function salvaLocale(){ try { localStorage.setItem(LOC, JSON.stringify({ d: D, sha: sha })); } catch(e){} }
  function cambiato(){
    sporco = true; salvaLocale(); stato();
    clearTimeout(timer); timer = setTimeout(salva, 2500);
  }
  function carica(){
    stato("Scarico l'elenco…");
    return gh(PRIV, "GET", "/contents/" + F_DATI).then(function(r){
      if(r.status === 404) return null;
      return ok(r).json();
    }).then(function(j){
      if(j){ var d = JSON.parse(b64d(j.content || "")); D = Object.assign({ v: 1, personaggi: [], fazioni: [], tag: [], pubblicato: null }, d); sha = j.sha; }
      D.personaggi = D.personaggi.map(pulisci);
      sporco = false; salvaLocale(); disegna(); stato();
    }).catch(function(e){
      try { var c = JSON.parse(localStorage.getItem(LOC) || "null"); if(c && c.d){ D = c.d; sha = c.sha; D.personaggi = D.personaggi.map(pulisci); } } catch(_){}
      disegna(); stato(msgErr(e), true);
    });
  }
  function salva(){
    if(occupato || !sporco) return Promise.resolve();
    clearTimeout(timer); occupato = true; stato("Salvo…");
    var corpo = { message: "Incontri: elenco aggiornato", content: b64e(JSON.stringify(D, null, 1)) };
    if(sha) corpo.sha = sha;
    return gh(PRIV, "PUT", "/contents/" + F_DATI, corpo).then(ok).then(function(r){ return r.json(); }).then(function(j){
      sha = j.content && j.content.sha; sporco = false; occupato = false; salvaLocale(); stato();
    }).catch(function(e){
      occupato = false;
      if(e === 409 || e === 422){
        /* il file è cambiato altrove: tengo le mie modifiche, prendo solo la nuova impronta e riprovo */
        return gh(PRIV, "GET", "/contents/" + F_DATI).then(ok).then(function(r){ return r.json(); }).then(function(j){ sha = j.sha; return salva(); })
          .catch(function(e2){ stato(msgErr(e2), true); });
      }
      stato(msgErr(e), true);
    });
  }

  /* ---------- foto: galleria, caricamento, ritaglio ---------- */
  var galleria = null, immagini = {};
  function elencoFoto(){
    if(galleria) return Promise.resolve(galleria);
    return gh(PRIV, "GET", "/contents/" + D_FOTO).then(function(r){
      if(r.status === 404) return [];
      return ok(r).json();
    }).then(function(l){
      galleria = (l || []).filter(function(f){ return f.type === "file" && /\.(webp|png|jpe?g)$/i.test(f.name); })
        .map(function(f){ return f.name; }).sort(function(a, b){ return a.localeCompare(b, "it"); });
      return galleria;
    });
  }
  function immagine(nome){
    if(immagini[nome]) return immagini[nome];
    var pr = gh(PRIV, "GET", "/contents/" + D_FOTO + "/" + encodeURIComponent(nome), null, true).then(ok)
      .then(function(r){ return r.blob(); })
      .then(function(b){ return new Promise(function(ris, rif){ var im = new Image(); im.onload = function(){ ris(im); }; im.onerror = rif; im.src = URL.createObjectURL(b); }); });
    immagini[nome] = pr; pr.catch(function(){ delete immagini[nome]; });
    return pr;
  }
  /* disegna la foto ritagliata: z = ingrandimento (1 = riempie la cornice), ox/oy = spostamento (frazioni della cornice) */
  function limita(f, im, w, h){
    var s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * f.z;
    var mx = Math.max(0, (im.naturalWidth * s - w) / 2 / w), my = Math.max(0, (im.naturalHeight * s - h) / 2 / h);
    f.ox = Math.max(-mx, Math.min(mx, f.ox || 0)); f.oy = Math.max(-my, Math.min(my, f.oy || 0));
  }
  function disegnaFoto(cv, im, f){
    var w = cv.width, h = cv.height, c = cv.getContext("2d");
    c.clearRect(0, 0, w, h);
    var s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * (f.z || 1);
    var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    c.imageSmoothingQuality = "high";
    c.drawImage(im, (w - dw) / 2 + (f.ox || 0) * w, (h - dh) / 2 + (f.oy || 0) * h, dw, dh);
  }
  function caricaFoto(file){
    return createImageBitmap(file).then(function(bm){
      var k = Math.min(1, 1400 / Math.max(bm.width, bm.height)), cv = document.createElement("canvas");
      cv.width = Math.round(bm.width * k); cv.height = Math.round(bm.height * k);
      cv.getContext("2d").drawImage(bm, 0, 0, cv.width, cv.height);
      return new Promise(function(ris){ cv.toBlob(ris, "image/webp", 0.88); });
    }).then(function(blob){ return blob.arrayBuffer(); }).then(function(buf){
      return elencoFoto().then(function(l){
        var base = norm(file.name.replace(/\.[^.]+$/, "")).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "foto", nome = base + ".webp", i = 2;
        while(l.indexOf(nome) >= 0){ nome = base + "-" + i + ".webp"; i++; }
        return gh(PRIV, "PUT", "/contents/" + D_FOTO + "/" + nome, { message: "Incontri: nuova foto " + nome, content: b64bytes(new Uint8Array(buf)) })
          .then(ok).then(function(){ l.push(nome); l.sort(function(a, b){ return a.localeCompare(b, "it"); }); return nome; });
      });
    });
  }

  /* ---------- interfaccia ---------- */
  box.innerHTML =
    '<div class="ie-top"><span class="ie-st" id="ie-st" role="status"></span>'
    + '<button type="button" class="ie-btn ie-pub" id="ie-pub">📣 Pubblica sul sito</button></div>'
    + '<div class="ie-wrap"><aside class="ie-side">'
    + '<label class="ie-lbl" for="ie-q">Cerca</label><input type="search" id="ie-q" class="ie-in" placeholder="Nome, fazione, tag…" autocomplete="off">'
    + '<button type="button" class="ie-btn ie-new" id="ie-new">＋ Nuovo personaggio</button>'
    + '<div class="ie-conta" id="ie-conta"></div><div class="ie-lista" id="ie-lista" role="list"></div></aside>'
    + '<div class="ie-form" id="ie-form"></div></div>';
  var $ = function(id){ return document.getElementById(id); };

  function stato(t, err){
    var el = $("ie-st"); if(!el) return;
    if(t){ el.textContent = t; el.classList.toggle("err", !!err); return; }
    el.classList.remove("err");
    var pub = D.pubblicato ? "Ultima pubblicazione: " + new Date(D.pubblicato).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Mai pubblicato sul sito";
    el.textContent = (sporco ? "● Modifiche da salvare · " : "✓ Salvato · ") + pub;
  }
  function sole(cls){ return '<svg class="' + cls + '" viewBox="0 0 1739 3364" aria-hidden="true" focusable="false"><use href="#gsun"/></svg>'; }

  function disegnaLista(){
    var q = norm(filtro), l = D.personaggi.slice().sort(function(a, b){ return (a.nome || "").localeCompare(b.nome || "", "it"); });
    if(q) l = l.filter(function(p){ return norm([p.nome, cont(p.continente)[1], p.fazioni.join(" "), p.tag.join(" ")].join(" ")).indexOf(q) >= 0; });
    var vis = D.personaggi.filter(function(p){ return p.vis.mostra; }).length;
    $("ie-conta").textContent = D.personaggi.length + " personaggi · " + vis + " visibili ai giocatori";
    var h = "";
    l.forEach(function(p){
      var c = cont(p.continente);
      h += '<button type="button" role="listitem" class="ie-it' + (p.id === sel ? " on" : "") + '" data-id="' + p.id + '">'
        + '<span class="ie-av">' + (p.foto ? '<canvas width="64" height="80" data-f="' + esc(p.foto.file) + '"></canvas>' : sole("ie-sole")) + '</span>'
        + '<span class="ie-it-t"><span class="ie-it-n">' + esc(p.nome || "Senza nome") + '</span>'
        + '<span class="ie-it-c"><i style="background:' + c[2] + '"></i>' + esc(c[1]) + '</span></span>'
        + '<span class="ie-occhio' + (p.vis.mostra ? " on" : "") + '" title="' + (p.vis.mostra ? "Visibile ai giocatori" : "Nascosto ai giocatori") + '">' + (p.vis.mostra ? "👁" : "◌") + '</span></button>';
    });
    $("ie-lista").innerHTML = h || '<div class="ie-vuoto">' + (q ? "Nessun personaggio corrisponde." : "Ancora nessun personaggio: inizia con «＋ Nuovo personaggio».") + '</div>';
    $("ie-lista").querySelectorAll("canvas[data-f]").forEach(function(cv){
      var p = trova(cv.parentNode.parentNode.getAttribute("data-id"));
      immagine(cv.getAttribute("data-f")).then(function(im){ var f = Object.assign({}, p.foto); disegnaFoto(cv, im, f); }).catch(function(){});
    });
  }

  function chipCampo(p, campo, titolo, segnaposto){
    var h = '<div class="ie-campo"><div class="ie-lbl">' + titolo + '</div><div class="ie-chips">';
    p[campo].forEach(function(x, i){ h += '<span class="ie-chip">' + esc(x) + '<button type="button" data-rm="' + campo + '" data-i="' + i + '" aria-label="Togli ' + esc(x) + '">✕</button></span>'; });
    if(!p[campo].length) h += '<span class="ie-nessuno">Nessuna</span>';
    h += '</div><div class="ie-add"><input type="text" class="ie-in" data-nuovo="' + campo + '" list="ie-dl-' + campo + '" placeholder="' + segnaposto + '" autocomplete="off">'
      + '<button type="button" class="ie-btn" data-agg="' + campo + '">Aggiungi</button></div><datalist id="ie-dl-' + campo + '">';
    var u = usati(campo); u.forEach(function(x){ h += '<option value="' + esc(x) + '">'; });
    h += '</datalist>';
    var liberi = u.filter(function(x){ return p[campo].indexOf(x) < 0; });
    if(liberi.length){ h += '<div class="ie-usati"><span>Già usati:</span>'; liberi.forEach(function(x){ h += '<button type="button" class="ie-u" data-usa="' + campo + '" data-v="' + esc(x) + '">' + esc(x) + '</button>'; }); h += '</div>'; }
    return h + '</div>';
  }

  function disegnaForm(){
    var f = $("ie-form"), p = trova(sel);
    if(!p){ f.innerHTML = '<div class="ie-vuoto ie-vuoto-g">' + sole("ie-sole-g") + '<p>Scegli un personaggio dall\'elenco, o creane uno nuovo.</p></div>'; return; }
    var h = '<div class="ie-fgrid"><div class="ie-col-foto">'
      + '<div class="ie-cornice" id="ie-cornice">' + (p.foto ? '<canvas id="ie-cv" width="' + W / 2 + '" height="' + H / 2 + '" aria-label="Foto: trascina per spostarla"></canvas>' : sole("ie-sole-f")) + '</div>';
    if(p.foto) h += '<label class="ie-lbl" for="ie-zoom">Ingrandimento</label><input type="range" id="ie-zoom" min="1" max="4" step="0.01" value="' + (p.foto.z || 1) + '">'
      + '<div class="ie-nota">Trascina la foto per spostarla. Rotella o pizzico per ingrandire.</div>';
    h += '<div class="ie-fbtn"><button type="button" class="ie-btn" id="ie-gal">🖼 Scegli dalla galleria</button>'
      + '<label class="ie-btn ie-file">⬆ Carica una foto<input type="file" id="ie-up" accept="image/*" hidden></label>'
      + (p.foto ? '<button type="button" class="ie-btn ie-soft" id="ie-nofoto">Togli la foto</button>' : '') + '</div></div>'
      + '<div class="ie-col-dati">'
      + '<label class="ie-lbl" for="ie-nome">Nome</label><input type="text" id="ie-nome" class="ie-in ie-big" value="' + esc(p.nome) + '" placeholder="Nome del personaggio">'
      + '<div class="ie-riga"><div><label class="ie-lbl" for="ie-cont">Continente</label><select id="ie-cont" class="ie-in">';
    CONT.forEach(function(c){ h += '<option value="' + c[0] + '"' + (p.continente === c[0] ? " selected" : "") + '>' + c[1] + '</option>'; });
    h += '</select></div><div><div class="ie-lbl">Stato</div><div class="ie-pills" role="radiogroup" aria-label="Stato">';
    STATI.forEach(function(s){ h += '<button type="button" role="radio" aria-checked="' + (p.stato === s[0]) + '" class="ie-pill s-' + s[0] + (p.stato === s[0] ? " on" : "") + '" data-stato="' + s[0] + '">' + s[1] + '</button>'; });
    h += '</div></div></div>'
      + chipCampo(p, "fazioni", "Fazioni", "Scrivi una fazione…")
      + chipCampo(p, "tag", "Tag", "Scrivi un tag…")
      + '<label class="ie-lbl" for="ie-pres">Presentazione <span>(quello che sanno i giocatori)</span></label><textarea id="ie-pres" class="ie-in" rows="4">' + esc(p.pres) + '</textarea>'
      + '<label class="ie-lbl ie-lbl-m" for="ie-note">Note del Master <span>(non escono mai dalla Zona Master)</span></label><textarea id="ie-note" class="ie-in ie-note" rows="4">' + esc(p.note) + '</textarea>'
      + '<div class="ie-vis"><div class="ie-lbl">Visibile ai giocatori</div>'
      + '<label class="ie-sw ie-sw-main"><input type="checkbox" data-vis="mostra"' + (p.vis.mostra ? " checked" : "") + '><span></span>Mostra nella sezione Incontri <em>(nome e continente)</em></label><div class="ie-sws' + (p.vis.mostra ? "" : " off") + '">';
    VIS.forEach(function(v){ h += '<label class="ie-sw"><input type="checkbox" data-vis="' + v[0] + '"' + (p.vis[v[0]] ? " checked" : "") + (p.vis.mostra ? "" : " disabled") + '><span></span>' + v[1] + '</label>'; });
    h += '</div></div><div class="ie-fondo"><button type="button" class="ie-btn ie-del" id="ie-del">🗑 Elimina personaggio</button></div></div></div>';
    f.innerHTML = h;
    if(p.foto) preparaRitaglio(p);
  }

  function preparaRitaglio(p){
    var cv = $("ie-cv"), z = $("ie-zoom"), im = null;
    immagine(p.foto.file).then(function(i){ im = i; limita(p.foto, im, cv.width, cv.height); disegnaFoto(cv, im, p.foto); })
      .catch(function(){ var c = cv.getContext("2d"); c.fillStyle = "#4a2020"; c.fillRect(0, 0, cv.width, cv.height); stato("Non riesco ad aprire la foto " + p.foto.file, true); });
    function ridisegna(){ if(!im) return; limita(p.foto, im, cv.width, cv.height); disegnaFoto(cv, im, p.foto); }
    var tocchi = {}, inizio = null;
    cv.addEventListener("pointerdown", function(e){ cv.setPointerCapture(e.pointerId); tocchi[e.pointerId] = { x: e.clientX, y: e.clientY }; inizio = null; });
    cv.addEventListener("pointermove", function(e){
      if(!tocchi[e.pointerId] || !im) return;
      var ids = Object.keys(tocchi), r = cv.getBoundingClientRect();
      if(ids.length === 2){
        var a = tocchi[ids[0]], b = tocchi[ids[1]];
        tocchi[e.pointerId] = { x: e.clientX, y: e.clientY };
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if(inizio === null) inizio = { d: d, z: p.foto.z };
        p.foto.z = Math.max(1, Math.min(4, inizio.z * d / (inizio.d || 1)));
        if(z) z.value = p.foto.z;
      } else {
        var t = tocchi[e.pointerId];
        p.foto.ox += (e.clientX - t.x) / r.width; p.foto.oy += (e.clientY - t.y) / r.height;
        tocchi[e.pointerId] = { x: e.clientX, y: e.clientY };
      }
      ridisegna();
    });
    function fine(e){ if(tocchi[e.pointerId]){ delete tocchi[e.pointerId]; inizio = null; cambiato(); disegnaLista(); } }
    cv.addEventListener("pointerup", fine); cv.addEventListener("pointercancel", fine);
    cv.addEventListener("wheel", function(e){ e.preventDefault(); p.foto.z = Math.max(1, Math.min(4, p.foto.z * (e.deltaY < 0 ? 1.06 : 0.94))); if(z) z.value = p.foto.z; ridisegna(); clearTimeout(cv._t); cv._t = setTimeout(function(){ cambiato(); disegnaLista(); }, 400); }, { passive: false });
    if(z) z.addEventListener("input", function(){ p.foto.z = +z.value; ridisegna(); });
    if(z) z.addEventListener("change", function(){ cambiato(); disegnaLista(); });
  }

  function disegna(){ disegnaLista(); disegnaForm(); }

  /* galleria */
  var gOv = null;
  function apriGalleria(){
    var p = trova(sel); if(!p) return;
    if(!gOv){
      gOv = document.createElement("div"); gOv.className = "ie-gov"; gOv.setAttribute("role", "dialog"); gOv.setAttribute("aria-modal", "true"); gOv.setAttribute("aria-label", "Galleria delle foto");
      gOv.innerHTML = '<div class="ie-gbox"><div class="ie-gtop"><strong>Galleria delle foto</strong><input type="search" class="ie-in" id="ie-gq" placeholder="Cerca per nome del file…"><button type="button" class="ie-x" id="ie-gx" aria-label="Chiudi">✕</button></div><div class="ie-ggrid" id="ie-ggrid"></div></div>';
      document.body.appendChild(gOv);
      gOv.addEventListener("click", function(e){
        if(e.target === gOv || e.target.closest("#ie-gx")){ gOv.hidden = true; return; }
        var b = e.target.closest("[data-g]"); if(!b) return;
        var q = trova(sel); if(!q) return;
        q.foto = { file: b.getAttribute("data-g"), z: 1, ox: 0, oy: 0 };
        if(q.vis.mostra) q.vis.foto = true;
        gOv.hidden = true; cambiato(); disegna();
      });
      gOv.addEventListener("keydown", function(e){ if(e.key === "Escape") gOv.hidden = true; });
      $("ie-gq").addEventListener("input", riempiGalleria);
    }
    gOv.hidden = false; $("ie-gq").value = ""; riempiGalleria(); try { $("ie-gq").focus(); } catch(_){}
  }
  var gObs = null;
  function riempiGalleria(){
    var g = $("ie-ggrid"); g.innerHTML = '<div class="ie-vuoto">Apro la galleria…</div>';
    elencoFoto().then(function(l){
      var q = norm($("ie-gq").value);
      var v = l.filter(function(n){ return !q || norm(n).indexOf(q) >= 0; });
      if(!v.length){ g.innerHTML = '<div class="ie-vuoto">' + (l.length ? "Nessuna foto corrisponde." : "La galleria è vuota: carica una foto dalla scheda del personaggio.") + '</div>'; return; }
      g.innerHTML = v.map(function(n){ return '<button type="button" class="ie-gi" data-g="' + esc(n) + '"><span class="ie-gimg"><img alt="" data-src="' + esc(n) + '"></span><span class="ie-gn">' + esc(n.replace(/\.[^.]+$/, "")) + '</span></button>'; }).join("");
      if(gObs) gObs.disconnect();
      gObs = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var img = e.target; gObs.unobserve(img);
        immagine(img.getAttribute("data-src")).then(function(im){ img.src = im.src; }).catch(function(){}); }); }, { root: g });
      g.querySelectorAll("img[data-src]").forEach(function(i){ gObs.observe(i); });
    }).catch(function(e){ g.innerHTML = '<div class="ie-vuoto"></div>'; g.firstChild.textContent = msgErr(e); });
  }

  /* ---------- eventi ---------- */
  $("ie-q").addEventListener("input", function(){ filtro = this.value; disegnaLista(); });
  $("ie-new").addEventListener("click", function(){ var p = nuovo(); D.personaggi.push(p); sel = p.id; filtro = ""; $("ie-q").value = ""; cambiato(); disegna(); suono("paper"); try { $("ie-nome").focus(); } catch(_){} });
  $("ie-lista").addEventListener("click", function(e){ var b = e.target.closest("[data-id]"); if(!b) return; sel = b.getAttribute("data-id"); disegna(); suono("paper"); });
  $("ie-pub").addEventListener("click", pubblica);

  var form = $("ie-form");
  form.addEventListener("input", function(e){
    var p = trova(sel); if(!p) return;
    if(e.target.id === "ie-nome"){ p.nome = e.target.value; cambiato(); clearTimeout(form._t); form._t = setTimeout(disegnaLista, 300); }
    else if(e.target.id === "ie-pres"){ p.pres = e.target.value; cambiato(); }
    else if(e.target.id === "ie-note"){ p.note = e.target.value; cambiato(); }
  });
  form.addEventListener("change", function(e){
    var p = trova(sel); if(!p) return; var t = e.target;
    if(t.id === "ie-cont"){ p.continente = t.value; cambiato(); disegnaLista(); }
    else if(t.hasAttribute("data-vis")){ p.vis[t.getAttribute("data-vis")] = t.checked; cambiato(); disegna(); }
    else if(t.id === "ie-up" && t.files && t.files[0]){
      var fl = t.files[0]; stato("Carico la foto nella galleria…");
      caricaFoto(fl).then(function(nome){ var q = trova(sel); if(!q) return; q.foto = { file: nome, z: 1, ox: 0, oy: 0 }; if(q.vis.mostra) q.vis.foto = true; cambiato(); disegna(); avviso("Foto aggiunta alla galleria: " + nome); })
        .catch(function(err){ stato(msgErr(err), true); });
    }
  });
  function aggiungi(p, campo, v){
    v = String(v || "").replace(/\s+/g, " ").trim(); if(!v) return;
    var esiste = usati(campo).filter(function(x){ return norm(x) === norm(v); })[0]; if(esiste) v = esiste;
    if(p[campo].indexOf(v) < 0) p[campo].push(v);
    var lista = campo === "fazioni" ? "fazioni" : "tag"; D[lista] = D[lista] || [];
    if(D[lista].indexOf(v) < 0 && (campo !== "fazioni" || FAZ_BASE.indexOf(v) < 0)) D[lista].push(v);
    cambiato(); disegna();
    var inp = form.querySelector('[data-nuovo="' + campo + '"]'); if(inp) try { inp.focus(); } catch(_){}
  }
  form.addEventListener("keydown", function(e){
    if(e.key === "Enter" && e.target.hasAttribute("data-nuovo")){ e.preventDefault(); var p = trova(sel); if(p) aggiungi(p, e.target.getAttribute("data-nuovo"), e.target.value); }
  });
  form.addEventListener("click", function(e){
    var p = trova(sel); if(!p) return; var b;
    if((b = e.target.closest("[data-stato]"))){ p.stato = b.getAttribute("data-stato"); cambiato(); disegnaForm(); return; }
    if((b = e.target.closest("[data-agg]"))){ var c = b.getAttribute("data-agg"), inp = form.querySelector('[data-nuovo="' + c + '"]'); aggiungi(p, c, inp && inp.value); return; }
    if((b = e.target.closest("[data-usa]"))){ aggiungi(p, b.getAttribute("data-usa"), b.getAttribute("data-v")); return; }
    if((b = e.target.closest("[data-rm]"))){ p[b.getAttribute("data-rm")].splice(+b.getAttribute("data-i"), 1); cambiato(); disegnaForm(); return; }
    if(e.target.closest("#ie-gal")){ apriGalleria(); return; }
    if(e.target.closest("#ie-nofoto")){ p.foto = null; p.vis.foto = false; cambiato(); disegna(); return; }
    if(e.target.closest("#ie-del")){
      var chi = p.nome || "questo personaggio";
      var conferma = typeof tcjConferma === "function" ? tcjConferma({ titolo: "Eliminare " + chi + "?", testo: "Il personaggio sparisce dall'elenco. Se era visibile, sparirà dal sito alla prossima pubblicazione.<br><br>La sua foto resta nella galleria.", si: "Sì, elimina" }) : Promise.resolve(confirm("Eliminare " + chi + "?"));
      conferma.then(function(si){ if(!si) return; D.personaggi = D.personaggi.filter(function(x){ return x.id !== p.id; }); sel = null; cambiato(); disegna(); });
    }
  });

  /* ---------- pubblicazione: un'unica modifica sul sito ---------- */
  function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function fotoPubblica(p){
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    return immagine(p.foto.file).then(function(im){
      var f = Object.assign({}, p.foto); limita(f, im, W, H); disegnaFoto(cv, im, f);
      return new Promise(function(ris){ cv.toBlob(ris, "image/webp", 0.86); });
    }).then(function(b){ return b.arrayBuffer(); }).then(function(buf){ return b64bytes(new Uint8Array(buf)); });
  }
  function pubblica(){
    var bt = $("ie-pub"); if(bt.disabled) return;
    bt.disabled = true; stato("Preparo la pubblicazione…");
    var visibili = D.personaggi.filter(function(p){ return p.vis.mostra && (p.nome || "").trim(); });
    var dati = { aggiornato: new Date().toISOString(), personaggi: [] }, servono = {};
    visibili.forEach(function(p){
      var o = { id: p.id, nome: p.nome.trim(), continente: p.continente };
      if(p.vis.stato) o.stato = p.stato;
      if(p.vis.pres && p.pres.trim()) o.pres = p.pres.trim();
      if(p.vis.fazioni && p.fazioni.length) o.fazioni = p.fazioni.slice();
      if(p.vis.tag && p.tag.length) o.tag = p.tag.slice();
      if(p.vis.foto && p.foto){
        var nome = p.id + "-" + hash(JSON.stringify([p.foto.file, +(p.foto.z || 1).toFixed(3), +(p.foto.ox || 0).toFixed(4), +(p.foto.oy || 0).toFixed(4)])) + ".webp";
        o.foto = P_FOTO + "/" + nome; servono[nome] = p;
      }
      dati.personaggi.push(o);
    });
    dati.personaggi.sort(function(a, b){ return a.nome.localeCompare(b.nome, "it"); });

    var base, albero, esistenti = [];
    salva().then(function(){
      return gh(SITO, "GET", "/git/ref/heads/" + RAMO).then(ok).then(function(r){ return r.json(); });
    }).then(function(ref){
      base = ref.object.sha;
      return gh(SITO, "GET", "/git/commits/" + base).then(ok).then(function(r){ return r.json(); });
    }).then(function(c){
      albero = c.tree.sha;
      return gh(SITO, "GET", "/contents/" + P_FOTO + "?ref=" + RAMO).then(function(r){ return r.status === 404 ? [] : ok(r).json(); });
    }).then(function(l){
      esistenti = (l || []).filter(function(f){ return f.type === "file"; }).map(function(f){ return f.name; });
      var nuove = Object.keys(servono).filter(function(n){ return esistenti.indexOf(n) < 0; }), fatte = 0;
      stato("Preparo le foto… 0/" + nuove.length);
      return nuove.reduce(function(pr, n){
        return pr.then(function(acc){
          return fotoPubblica(servono[n]).then(function(b64){
            return gh(SITO, "POST", "/git/blobs", { content: b64, encoding: "base64" }).then(ok).then(function(r){ return r.json(); });
          }).then(function(bl){ fatte++; stato("Preparo le foto… " + fatte + "/" + nuove.length); acc.push({ path: P_FOTO + "/" + n, mode: "100644", type: "blob", sha: bl.sha }); return acc; });
        });
      }, Promise.resolve([]));
    }).then(function(voci){
      esistenti.forEach(function(n){ if(!servono[n]) voci.push({ path: P_FOTO + "/" + n, mode: "100644", type: "blob", sha: null }); });
      voci.push({ path: P_DATI, mode: "100644", type: "blob", content: JSON.stringify(dati, null, 1) + "\n" });
      stato("Pubblico sul sito…");
      return gh(SITO, "POST", "/git/trees", { base_tree: albero, tree: voci }).then(ok).then(function(r){ return r.json(); });
    }).then(function(t){
      return gh(SITO, "POST", "/git/commits", { message: "Incontri aggiornati (" + dati.personaggi.length + " personaggi)", tree: t.sha, parents: [base] }).then(ok).then(function(r){ return r.json(); });
    }).then(function(c){
      return gh(SITO, "PATCH", "/git/refs/heads/" + RAMO, { sha: c.sha }).then(ok);
    }).then(function(){
      D.pubblicato = dati.aggiornato; cambiato(); bt.disabled = false;
      suono("on"); avviso("Pubblicato: " + dati.personaggi.length + " personaggi visibili. Il sito si aggiorna entro un paio di minuti.");
    }).catch(function(e){ bt.disabled = false; suono("deny"); stato(msgErr(e, "sito"), true); avviso(msgErr(e, "sito"), true); });
  }

  window.addEventListener("beforeunload", function(e){ if(sporco){ salva(); e.preventDefault(); e.returnValue = ""; } });
  disegna();
  if(token()) carica(); else stato("Serve il token del Master.", true);
})();
