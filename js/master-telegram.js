/* Zona Master — capitolo «Mostra su Telegram»: un tocco su una foto e il bot la manda nel gruppo della campagna.
   PERSONAGGI
   - tutti i personaggi degli Incontri (anche quelli non ancora pubblicati), letti da tcj-master/incontri/personaggi.json
     con il token del Master; la foto è ritagliata come nell'editor degli Incontri.
   - il nome sotto la foto è facoltativo: per chi non è ancora pubblicato parte spento, così non si rovinano sorprese.
   CARTELLA
   - il sito apre una cartella del computer (per esempio «Careless Journey» sul Desktop) e mostra sottocartelle e immagini.
     Le foto non vengono caricate su GitHub né sul sito: dal browser vanno direttamente a Telegram.
   - Chrome, Edge, Opera (anche GX): il browser si ricorda la cartella (al massimo chiede un clic per riaprirla).
     Brave: va accesa la funzione in brave://flags/#file-system-access-api. Negli altri browser la cartella
     si sceglie ogni volta che si apre il sito.
   L'invio passa dal bot collegato nel capitolo «Sessione di gioco» (window.TCJTG, js/master-sessioni.js). */
(function(){
  "use strict";
  var ms = document.getElementById("ms");
  if(!ms || !ms.querySelector(".msec")) return;
  var OWNER = "Zzago-DM", PRIV = OWNER + "/tcj-master";
  var F_DATI = "incontri/personaggi.json", D_FOTO = "incontri/foto", D_ORIG = "incontri/originali";
  var LOC = "tcj-mtg";

  /* ---------- il capitolo ---------- */
  var sec = document.createElement("div");
  sec.className = "msec"; sec.id = "m-telegram"; sec.style.borderTop = "1px solid rgba(200,56,56,.1)";
  sec.innerHTML = '<div class="msecsub">Al tavolo</div><div class="msect">Mostra su Telegram</div><div class="msecl"></div><div id="mtg"></div>';
  var dopo = document.getElementById("m-sessione"), tutte = ms.querySelectorAll(".msec");
  (dopo || tutte[tutte.length - 1]).insertAdjacentElement("afterend", sec);
  var nav = ms.querySelector(".msnav");
  if(nav){ var a = document.createElement("a"); a.href = "#m-telegram"; a.textContent = "Mostra su Telegram"; nav.appendChild(a); }
  var box = document.getElementById("mtg");

  /* ---------- utilità ---------- */
  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function norm(s){ return String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
  function ord(a, b){ return a.localeCompare(b, "it", { numeric: true, sensitivity: "base" }); }
  function suono(n){ try { sfxPlay(n); } catch(_){} }
  function avviso(t, err){
    var d = document.createElement("div"); d.className = "gh-toast on" + (err ? " err" : ""); d.setAttribute("role", "status"); d.textContent = t;
    document.body.appendChild(d); setTimeout(function(){ d.classList.remove("on"); setTimeout(function(){ d.remove(); }, 400); }, err ? 7000 : 3500);
  }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(percorso, raw){
    return fetch("https://api.github.com/repos/" + PRIV + percorso + (percorso.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36), {
      headers: { "Authorization": "Bearer " + token(), "Accept": raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store"
    }).then(function(r){ if(!r.ok) throw r.status; return r; });
  }
  function pref(){ try { return JSON.parse(localStorage.getItem(LOC) || "null") || {}; } catch(e){ return {}; } }
  function salvaPref(o){ try { localStorage.setItem(LOC, JSON.stringify(Object.assign(pref(), o))); } catch(e){} }
  function bot(){ return window.TCJTG && TCJTG.pronto(); }
  var IMG = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
  /* non più di 4 immagini lette alla volta, così la pagina resta leggera */
  var coda = [], attivi = 0;
  function inCoda(f){ return new Promise(function(ris, rif){ coda.push(function(){ return f().then(ris, rif); }); gira(); }); }
  function gira(){ while(attivi < 4 && coda.length){ attivi++; coda.shift()().then(fine, fine); } function fine(){ attivi--; gira(); } }
  /* le miniature si preparano solo quando arrivano sullo schermo */
  var vista = "IntersectionObserver" in window ? new IntersectionObserver(function(L){
    L.forEach(function(x){ if(x.isIntersecting){ vista.unobserve(x.target); var f = x.target._carica; x.target._carica = null; if(f) f(); } });
  }, { rootMargin: "300px" }) : null;
  function quandoVisibile(el, f){ if(vista){ el._carica = f; vista.observe(el); } else f(); }

  /* ---------- stato del capitolo ---------- */
  var scheda = pref().scheda === "cartella" ? "cartella" : "pers";
  var P = null, pErr = "", pCarico = false, filtroP = "";
  var radice = null, percorso = [], filtroC = "", indice = null, urls = [];

  function disegna(){
    var html = '<p class="mtg-intro">Tocca una foto e il bot la manda subito nel gruppo, senza aprire Telegram né cercare nei file.</p><div id="mtg-stato">' + statoBot() + '</div>';
    html += '<div class="mtg-tabs" role="tablist"><button type="button" role="tab" data-tab="pers" aria-selected="' + (scheda === "pers") + '">👤 Personaggi</button>'
      + '<button type="button" role="tab" data-tab="cartella" aria-selected="' + (scheda === "cartella") + '">📁 Cartella</button></div><div class="mtg-corpo" id="mtg-corpo"></div>';
    box.innerHTML = html;
    if(scheda === "pers") disegnaPers(); else disegnaCartella();
  }
  function statoBot(){
    if(!window.TCJTG) return '<p class="mtg-err">Manca il capitolo «Sessione di gioco»: ricarica la pagina.</p>';
    if(!bot()) return '<p class="mtg-err">Il bot non è ancora collegato su questo dispositivo: collegalo nel capitolo <b>«Sessione di gioco»</b> (token di @BotFather e «Trova il gruppo»).</p>';
    return '<p class="mtg-st">🤖 Le foto vanno nel gruppo <b>«' + esc(TCJTG.gruppo() || "della campagna") + '»</b>.</p>';
  }
  function corpo(){ return document.getElementById("mtg-corpo"); }
  function liberaUrl(){ urls.forEach(function(u){ try { URL.revokeObjectURL(u); } catch(_){} }); urls = []; }

  /* =================== PERSONAGGI =================== */
  var RAPP = { "3:4": [600, 800], "4:3": [800, 600], "9:16": [540, 960], "16:9": [960, 540] };
  function misura(fo){ return RAPP[fo && fo.r] || [640, 800]; }
  var immagini = {};
  function immagine(fo){
    var sito = /^sito:/.test(fo.file), chiave = (sito ? "" : fo.sfondo ? "s:" : "f:") + fo.file;
    if(immagini[chiave]) return immagini[chiave];
    var pr = inCoda(function(){
      var b = sito ? fetch(fo.file.replace(/^sito:/, "")).then(function(r){ if(!r.ok) throw r.status; return r.blob(); })
        : gh("/contents/" + (fo.sfondo ? D_ORIG : D_FOTO) + "/" + encodeURIComponent(fo.file), true).then(function(r){ return r.blob(); });
      return b.then(function(bl){ return new Promise(function(ris, rif){ var im = new Image(), u = URL.createObjectURL(bl); im.onload = function(){ ris(im); }; im.onerror = rif; im.src = u; }); });
    });
    immagini[chiave] = pr; pr.catch(function(){ delete immagini[chiave]; });
    return pr;
  }
  function intatta(fo){ return /^sito:/.test(fo.file) && !fo.r && !fo.sfondo && Math.abs((fo.z || 1) - 1) < 0.001 && !fo.ox && !fo.oy; }
  /* stesso ritaglio dell'editor degli Incontri (js/master-incontri.js) */
  function ritaglio(im, fo, k){
    if(intatta(fo)){ var c0 = document.createElement("canvas"), s0 = Math.min(1, (k || 1) * 800 / Math.max(im.naturalWidth, im.naturalHeight));
      c0.width = Math.round(im.naturalWidth * s0); c0.height = Math.round(im.naturalHeight * s0); c0.getContext("2d").drawImage(im, 0, 0, c0.width, c0.height); return c0; }
    var m = misura(fo), cv = document.createElement("canvas"); cv.width = Math.round(m[0] * (k || 1)); cv.height = Math.round(m[1] * (k || 1));
    var w = cv.width, h = cv.height, zMin = (function(){ var a = w / im.naturalWidth, b = h / im.naturalHeight; return Math.min(a, b) / Math.max(a, b); })();
    var z = Math.max(zMin, Math.min(4, fo.z || 1)), s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * z;
    var dw = im.naturalWidth * s, dh = im.naturalHeight * s, mx = Math.abs(dw - w) / 2 / w, my = Math.abs(dh - h) / 2 / h;
    var ox = Math.max(-mx, Math.min(mx, fo.ox || 0)), oy = Math.max(-my, Math.min(my, fo.oy || 0));
    var c = cv.getContext("2d"); c.imageSmoothingQuality = "high";
    c.drawImage(im, (w - dw) / 2 + ox * w, (h - dh) / 2 + oy * h, dw, dh);
    return cv;
  }
  function caricaPers(){
    if(pCarico) return; pCarico = true; pErr = "";
    if(!token()){ pErr = "Serve il token GitHub del Master su questo dispositivo."; pCarico = false; disegnaPers(); return; }
    gh("/contents/" + F_DATI).then(function(r){ return r.json(); }).then(function(j){
      var d = JSON.parse(b64d(j.content || ""));
      P = (d.personaggi || []).filter(function(p){ return p && p.nome; }).map(function(p){
        var foti = (p.foti || (p.foto ? [p.foto] : [])).filter(function(f){ return f && f.file; });
        return { id: p.id, nome: p.nome, foti: foti, pub: !!(p.vis && p.vis.mostra) };
      }).sort(function(a, b){ return ord(a.nome, b.nome); });
    }).catch(function(e){
      pErr = e === 401 ? "Il token del Master non è più valido." : (e === 403 || e === 404) ? "Il token del Master non apre tcj-master." : "Non riesco a raggiungere GitHub: controlla la connessione e riprova.";
    }).then(function(){ pCarico = false; if(scheda === "pers") disegnaPers(); });
  }
  function disegnaPers(){
    var c = corpo(); if(!c) return;
    if(!P){
      c.innerHTML = pErr ? '<p class="mtg-err">' + esc(pErr) + '</p><button type="button" class="bk-btn" data-az="ricaricaP">↻ Riprova</button>' : '<p class="mtg-n">Scarico i personaggi…</p>';
      if(!pErr) caricaPers();
      return;
    }
    var L = P.filter(function(p){ return !filtroP || norm(p.nome).indexOf(norm(filtroP)) >= 0; });
    c.innerHTML = '<div class="mtg-barra"><input type="search" id="mtg-cp" placeholder="Cerca un personaggio…" value="' + esc(filtroP) + '" aria-label="Cerca un personaggio">'
      + '<button type="button" class="bk-btn mtg-sec" data-az="ricaricaP" title="Rileggi l\'elenco">↻</button></div>'
      + (L.length ? '<div class="mtg-griglia">' + L.map(function(p){
        return '<button type="button" class="mtg-t" data-pid="' + esc(p.id) + '"' + (p.foti.length ? "" : " disabled") + '>'
          + '<span class="mtg-m">' + (p.foti.length ? '<canvas width="150" height="190"></canvas>' : '<span class="mtg-nf">senza foto</span>') + '</span>'
          + '<span class="mtg-nome">' + esc(p.nome) + '</span>'
          + (p.pub ? "" : '<span class="mtg-bdg" title="I giocatori non lo vedono ancora nella sezione Incontri">non pubblicato</span>')
          + (p.foti.length > 1 ? '<span class="mtg-piu">' + p.foti.length + ' foto</span>' : "") + '</button>';
      }).join("") + '</div>' : '<p class="mtg-n">' + (P.length ? "Nessun personaggio con questo nome." : "Nella sezione Incontri non c'è ancora nessuno.") + '</p>');
    c.querySelectorAll(".mtg-t[data-pid]").forEach(function(el){
      var p = trovaP(el.getAttribute("data-pid")); if(!p || !p.foti.length) return;
      var cv = el.querySelector("canvas");
      quandoVisibile(el, function(){ immagine(p.foti[0]).then(function(im){ copri(cv, ritaglio(im, p.foti[0], 0.5)); }).catch(function(){ cv.replaceWith(Object.assign(document.createElement("span"), { className: "mtg-nf", textContent: "foto non trovata" })); }); });
    });
  }
  function trovaP(id){ for(var i = 0; i < (P || []).length; i++) if(P[i].id === id) return P[i]; return null; }
  function copri(cv, src){
    var x = cv.getContext("2d"), k = Math.min(cv.width / src.width, cv.height / src.height);
    x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingQuality = "high";
    x.drawImage(src, (cv.width - src.width * k) / 2, (cv.height - src.height * k) / 2, src.width * k, src.height * k);
  }
  function apriPers(p){
    var i = 0;
    finestra({
      titolo: p.nome, nota: p.pub ? "" : "Non è ancora pubblicato: i giocatori non lo trovano nella sezione Incontri.",
      foti: p.foti.length > 1 ? p.foti : null,
      anteprima: function(img, k){ i = k == null ? i : k; return immagine(p.foti[i]).then(function(im){ img.src = ritaglio(im, p.foti[i], 1).toDataURL("image/png"); }); },
      opzioni: '<label class="mtg-ck"><input type="checkbox" id="mtg-nm"' + (p.pub ? " checked" : "") + '> Scrivi il nome sotto la foto</label>',
      manda: function(ov){
        var col = ov.querySelector("#mtg-nm").checked;
        return immagine(p.foti[i]).then(function(im){ return TCJTG.foto(ritaglio(im, p.foti[i], 1.5), col ? p.nome : ""); });
      }
    });
  }

  /* =================== CARTELLA =================== */
  var FS = "showDirectoryPicker" in window;
  /* la cartella collegata resta ricordata nel browser (IndexedDB), mai sul sito */
  function db(){ return new Promise(function(ris, rif){ var r = indexedDB.open("tcj-mtg", 1); r.onupgradeneeded = function(){ r.result.createObjectStore("h"); }; r.onsuccess = function(){ ris(r.result); }; r.onerror = function(){ rif(r.error); }; }); }
  function dbGet(k){ return db().then(function(d){ return new Promise(function(ris){ var q = d.transaction("h").objectStore("h").get(k); q.onsuccess = function(){ ris(q.result || null); }; q.onerror = function(){ ris(null); }; }); }).catch(function(){ return null; }); }
  function dbSet(k, v){ return db().then(function(d){ return new Promise(function(ris){ var t = d.transaction("h", "readwrite"); t.objectStore("h").put(v, k); t.oncomplete = ris; t.onerror = ris; }); }).catch(function(){}); }
  var maniglia = null, permesso = "", controllato = false;
  function controlla(){
    if(controllato || !FS) return Promise.resolve();
    controllato = true;
    return dbGet("cartella").then(function(h){
      if(!h) return;
      maniglia = h;
      return h.queryPermission({ mode: "read" }).then(function(s){ permesso = s; if(s === "granted") apri(nodoFS(h, h.name)); }).catch(function(){ permesso = "prompt"; });
    });
  }
  /* un nodo è una cartella: elenca() dà sottocartelle e immagini, in ordine */
  function nodoFS(h, nome){
    return { nome: nome, elenca: function(){
      var cart = [], file = [], it = h.values();
      function passo(){ return it.next().then(function(x){
        if(x.done) return;
        var e = x.value;
        if(e.kind === "directory"){ if(e.name.charAt(0) !== ".") cart.push(nodoFS(e, e.name)); }
        else if(IMG.test(e.name)) file.push({ nome: e.name, prendi: function(){ return e.getFile(); } });
        return passo();
      }); }
      return passo().then(function(){ cart.sort(function(a, b){ return ord(a.nome, b.nome); }); file.sort(function(a, b){ return ord(a.nome, b.nome); }); return { cart: cart, file: file }; });
    } };
  }
  /* senza permesso di ricordare: la cartella scelta con la finestra di Windows, costruita dall'elenco dei file */
  function nodoLista(files){
    var rad = null;
    function nuovo(nome){ return { nome: nome, sub: {}, file: [], elenca: function(){ var me = this;
      var cart = Object.keys(me.sub).map(function(k){ return me.sub[k]; }).sort(function(a, b){ return ord(a.nome, b.nome); });
      return Promise.resolve({ cart: cart, file: me.file.slice().sort(function(a, b){ return ord(a.nome, b.nome); }) }); } }; }
    [].forEach.call(files, function(f){
      var parti = (f.webkitRelativePath || f.name).split("/");
      if(!rad) rad = nuovo(parti.length > 1 ? parti[0] : "Cartella");
      if(!IMG.test(f.name) || parti.some(function(x){ return x.charAt(0) === "."; })) return;
      var n = rad; for(var i = 1; i < parti.length - 1; i++){ n = n.sub[parti[i]] || (n.sub[parti[i]] = nuovo(parti[i])); }
      n.file.push({ nome: f.name, prendi: function(){ return Promise.resolve(f); } });
    });
    return rad || nuovo("Cartella");
  }
  function apri(n){
    radice = n; indice = null; filtroC = "";
    var vecchio = (pref().percorso || []).slice(); percorso = [n];
    /* riapre l'ultima sottocartella guardata, se c'è ancora */
    (function giu(){
      if(!vecchio.length) return Promise.resolve();
      var nome = vecchio.shift();
      return percorso[percorso.length - 1].elenca().then(function(r){ var s = r.cart.filter(function(c){ return c.nome === nome; })[0]; if(s){ percorso.push(s); return giu(); } });
    })().catch(function(){}).then(function(){ if(scheda === "cartella") disegnaCartella(); });
  }
  function scegli(){
    if(FS){
      return window.showDirectoryPicker({ id: "tcj-cartella", mode: "read" }).then(function(h){
        maniglia = h; permesso = "granted"; salvaPref({ percorso: [] }); dbSet("cartella", h); apri(nodoFS(h, h.name));
      }).catch(function(e){ if(e && e.name !== "AbortError") avviso("Non riesco ad aprire la cartella: " + (e.message || e.name), true); });
    }
    var inp = document.createElement("input"); inp.type = "file"; inp.multiple = true; inp.setAttribute("webkitdirectory", ""); inp.style.display = "none";
    inp.addEventListener("change", function(){ if(inp.files && inp.files.length){ salvaPref({ percorso: [] }); apri(nodoLista(inp.files)); } inp.remove(); });
    document.body.appendChild(inp); inp.click();
  }
  function riapri(){
    if(!maniglia) return scegli();
    maniglia.requestPermission({ mode: "read" }).then(function(s){ permesso = s; if(s === "granted") apri(nodoFS(maniglia, maniglia.name)); else disegnaCartella(); })
      .catch(function(){ scegli(); });
  }
  function disegnaCartella(){
    var c = corpo(); if(!c) return;
    liberaUrl();
    if(!radice){
      if(FS && !controllato){ c.innerHTML = '<p class="mtg-n">Controllo la cartella collegata…</p>'; controlla().then(function(){ if(!radice && scheda === "cartella") disegnaCartella(); }); return; }
      var h = '<p class="mtg-n">Collega la cartella dove tieni le immagini della campagna (per esempio <b>«Careless Journey»</b> sul Desktop). Il sito la legge e basta: non carica niente su GitHub.</p>';
      if(maniglia && permesso !== "granted") h += '<div class="mtg-riga"><button type="button" class="bk-btn mtg-big" data-az="riapri">🔓 Riapri «' + esc(maniglia.name) + '»</button><button type="button" class="bk-btn mtg-sec" data-az="scegli">Scegli un\'altra cartella</button></div>';
      else h += '<div class="mtg-riga"><button type="button" class="bk-btn mtg-big" data-az="scegli">📁 Collega la cartella</button></div>';
      if(!FS) h += '<p class="mtg-n mtg-pic">' + (/Brave/i.test(navigator.userAgent) || navigator.brave
        ? 'Su Brave il sito non può ricordarsi la cartella finché non accendi la funzione: scrivi <code>brave://flags/#file-system-access-api</code> nella barra degli indirizzi, metti <b>Enabled</b> e riavvia Brave.'
        : 'Questo browser non permette di ricordare la cartella: andrà scelta ogni volta che riapri il sito. Con Chrome, Edge oppure Opera GX se la ricorda.') + '</p>';
      c.innerHTML = h; return;
    }
    var qui = percorso[percorso.length - 1];
    var briciole = percorso.map(function(n, i){ return i === percorso.length - 1 ? '<span>' + esc(n.nome) + '</span>' : '<button type="button" data-su="' + i + '">' + esc(n.nome) + '</button>'; }).join('<i>›</i>');
    c.innerHTML = '<div class="mtg-barra"><input type="search" id="mtg-cc" placeholder="Cerca in tutta la cartella…" value="' + esc(filtroC) + '" aria-label="Cerca un\'immagine per nome">'
      + '<button type="button" class="bk-btn mtg-sec" data-az="aggiorna" title="Rileggi la cartella (dopo aver aggiunto o modificato file)">↻</button>'
      + '<button type="button" class="bk-btn mtg-sec" data-az="scegli">Cambia cartella</button></div>'
      + '<nav class="mtg-bric" aria-label="Percorso">' + briciole + '</nav><div id="mtg-el"><p class="mtg-n">Leggo la cartella…</p></div>';
    if(filtroC.length >= 2) return cerca();
    qui.elenca().then(function(r){
      var el = document.getElementById("mtg-el"); if(!el || percorso[percorso.length - 1] !== qui || filtroC.length >= 2) return;
      el.innerHTML = (r.cart.length ? '<div class="mtg-cart">' + r.cart.map(function(n, i){ return '<button type="button" class="mtg-c" data-cart="' + i + '">📁 ' + esc(n.nome) + '</button>'; }).join("") + '</div>' : "")
        + (r.file.length ? '<div class="mtg-griglia">' + r.file.map(function(f, i){ return tessera(f, i, ""); }).join("") + '</div>'
          : '<p class="mtg-n">' + (r.cart.length ? "Qui ci sono solo cartelle." : "In questa cartella non ci sono immagini.") + '</p>');
      el._r = r; collegaTessere(el, r.file);
    }).catch(function(){ var el = document.getElementById("mtg-el"); if(el) el.innerHTML = '<p class="mtg-err">Non riesco più a leggere questa cartella: forse è stata spostata o rinominata. Premi «Cambia cartella».</p>'; });
  }
  function tessera(f, i, dove){
    return '<button type="button" class="mtg-t" data-f="' + i + '" title="' + esc((dove ? dove + " › " : "") + f.nome) + '"><span class="mtg-m"><img alt=""></span>'
      + '<span class="mtg-nome">' + esc(f.nome.replace(/\.[^.]+$/, "")) + '</span>' + (dove ? '<span class="mtg-dove">' + esc(dove) + '</span>' : "") + '</button>';
  }
  function collegaTessere(el, file){
    el._file = file;
    el.querySelectorAll(".mtg-t[data-f]").forEach(function(t){
      var f = file[+t.getAttribute("data-f")], img = t.querySelector("img");
      quandoVisibile(t, function(){ inCoda(function(){ return f.prendi().then(miniatura).then(function(u){ urls.push(u); img.src = u; }); }).catch(function(){ img.replaceWith(Object.assign(document.createElement("span"), { className: "mtg-nf", textContent: "non leggibile" })); }); });
    });
  }
  /* miniatura piccola: le immagini grandi (mappe) non restano intere in memoria */
  function miniatura(file){
    if(!window.createImageBitmap) return Promise.resolve(URL.createObjectURL(file));
    return createImageBitmap(file).then(function(bm){
      var k = Math.min(1, 320 / Math.max(bm.width, bm.height)), cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(bm.width * k)); cv.height = Math.max(1, Math.round(bm.height * k));
      cv.getContext("2d").drawImage(bm, 0, 0, cv.width, cv.height); if(bm.close) bm.close();
      return new Promise(function(ris){ cv.toBlob(function(b){ ris(URL.createObjectURL(b || file)); }, "image/webp", 0.8); });
    }).catch(function(){ return URL.createObjectURL(file); });
  }
  /* ricerca: la prima volta si legge tutta la cartella (fino a 20.000 immagini), poi resta in memoria */
  function costruisciIndice(){
    if(indice) return indice;
    var L = [];
    indice = (function giro(n, dove){
      if(L.length > 20000) return Promise.resolve();
      return n.elenca().then(function(r){
        r.file.forEach(function(f){ L.push({ f: f, dove: dove, k: norm(f.nome) }); });
        return r.cart.reduce(function(p, c){ return p.then(function(){ return giro(c, dove ? dove + " › " + c.nome : c.nome); }); }, Promise.resolve());
      }).catch(function(){});
    })(radice, "").then(function(){ return L; });
    return indice;
  }
  function cerca(){
    var q = norm(filtroC), el = document.getElementById("mtg-el"); if(!el) return;
    el.innerHTML = '<p class="mtg-n">Cerco…</p>';
    costruisciIndice().then(function(L){
      if(norm(filtroC) !== q) return;
      var el2 = document.getElementById("mtg-el"); if(!el2) return;
      var parole = q.split(/\s+/), R = L.filter(function(x){ var t = x.k + " " + norm(x.dove); return parole.every(function(w){ return t.indexOf(w) >= 0; }); });
      var tanti = R.length > 120; R = R.slice(0, 120);
      liberaUrl();
      el2.innerHTML = R.length ? (tanti ? '<p class="mtg-n">Mostro le prime 120: scrivi qualcosa in più per restringere.</p>' : "")
        + '<div class="mtg-griglia">' + R.map(function(x, i){ return tessera(x.f, i, x.dove); }).join("") + '</div>' : '<p class="mtg-n">Nessuna immagine con questo nome.</p>';
      collegaTessere(el2, R.map(function(x){ return x.f; }));
    });
  }
  function apriFile(f){
    var file = null;
    finestra({
      titolo: f.nome.replace(/\.[^.]+$/, ""),
      anteprima: function(img){ return f.prendi().then(function(fl){ file = fl; var u = URL.createObjectURL(fl); img.onload = function(){ setTimeout(function(){ URL.revokeObjectURL(u); }, 1000); }; img.src = u; }); },
      opzioni: '<label class="mtg-l">Scritta sotto la foto (facoltativa)<input type="text" id="mtg-did" maxlength="200" placeholder="Es. Il porto di Ramsgate"></label>'
        + '<label class="mtg-ck"><input type="checkbox" id="mtg-file"' + (/\.gif$/i.test(f.nome) ? " checked" : "") + '> Qualità piena (come file: per le mappe grandi, le GIF animate)</label>',
      manda: function(ov){
        var did = ov.querySelector("#mtg-did").value.trim(), pieno = ov.querySelector("#mtg-file").checked;
        return (file ? Promise.resolve(file) : f.prendi()).then(function(fl){
          if(pieno){ if(fl.size > 50e6) throw { description: "il file supera i 50 MB che Telegram accetta dai bot" }; return TCJTG.file(fl, f.nome, did); }
          return TCJTG.foto(fl, did);
        });
      }
    });
  }

  /* =================== finestra di conferma con anteprima =================== */
  function finestra(o){
    var ov = document.createElement("div"); ov.className = "mtg-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Mandare su Telegram?");
    ov.innerHTML = '<div class="mtg-box"><div class="mtg-ft">' + esc(o.titolo) + '</div>' + (o.nota ? '<p class="mtg-nota">' + esc(o.nota) + '</p>' : "")
      + '<div class="mtg-prev"><img alt="Anteprima"><span class="mtg-n">Preparo l\'anteprima…</span></div>'
      + (o.foti ? '<div class="mtg-scelte">' + o.foti.map(function(_, k){ return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === 0) + '">Foto ' + (k + 1) + '</button>'; }).join("") + '</div>' : "")
      + (o.opzioni || "")
      + (bot() ? "" : '<p class="mtg-err">Il bot non è collegato: collegalo nel capitolo «Sessione di gioco».</p>')
      + '<div class="mtg-riga"><button type="button" class="bk-btn mtg-big" data-az="manda"' + (bot() ? "" : " disabled") + '>📤 Manda nel gruppo</button><button type="button" class="bk-btn mtg-sec" data-az="annulla">Annulla</button></div></div>';
    document.body.appendChild(ov); document.documentElement.classList.add("mtg-aperta");
    var img = ov.querySelector(".mtg-prev img"), att = ov.querySelector(".mtg-prev .mtg-n"), inviando = false;
    function prev(k){ att.hidden = false; img.hidden = true; o.anteprima(img, k).then(function(){ att.hidden = true; img.hidden = false; }).catch(function(){ att.textContent = "Non riesco a leggere l'immagine."; }); }
    prev(0);
    function chiudi(){ ov.remove(); document.documentElement.classList.remove("mtg-aperta"); document.removeEventListener("keydown", tasto, true); }
    function tasto(e){ if(e.key === "Escape" && !inviando){ e.stopPropagation(); chiudi(); } }
    document.addEventListener("keydown", tasto, true);
    ov.addEventListener("click", function(e){
      if(e.target === ov && !inviando) return chiudi();
      var k = e.target.closest("[data-k]");
      if(k){ ov.querySelectorAll("[data-k]").forEach(function(b){ b.setAttribute("aria-pressed", String(b === k)); }); prev(+k.getAttribute("data-k")); return; }
      var b = e.target.closest("[data-az]"); if(!b) return;
      if(b.getAttribute("data-az") === "annulla"){ if(!inviando) chiudi(); return; }
      if(inviando) return; inviando = true; b.disabled = true; b.textContent = "Invio…";
      o.manda(ov).then(function(){ chiudi(); suono("bell"); avviso("📤 Mandata su Telegram"); })
        .catch(function(e){ inviando = false; b.disabled = false; b.textContent = "📤 Riprova"; avviso("Telegram non l'ha presa" + (e && e.description ? ": " + e.description : ". Controlla la connessione e riprova."), true); });
    });
    setTimeout(function(){ try { ov.querySelector("[data-az=manda]").focus({ preventScroll: true }); } catch(_){} }, 30);
  }

  /* =================== eventi =================== */
  box.addEventListener("click", function(e){
    var t = e.target.closest("[data-tab]");
    if(t){ scheda = t.getAttribute("data-tab"); salvaPref({ scheda: scheda }); disegna(); return; }
    var b = e.target.closest("[data-az]"), az = b && b.getAttribute("data-az");
    if(az === "ricaricaP"){ P = null; pErr = ""; immagini = {}; disegnaPers(); return; }
    if(az === "scegli"){ scegli(); return; }
    if(az === "riapri"){ riapri(); return; }
    if(az === "aggiorna"){ indice = null; if(radice) disegnaCartella(); return; }
    var su = e.target.closest("[data-su]");
    if(su){ percorso = percorso.slice(0, +su.getAttribute("data-su") + 1); filtroC = ""; salvaPref({ percorso: percorso.slice(1).map(function(n){ return n.nome; }) }); disegnaCartella(); return; }
    var cr = e.target.closest("[data-cart]"), el = document.getElementById("mtg-el");
    if(cr && el && el._r){ percorso.push(el._r.cart[+cr.getAttribute("data-cart")]); salvaPref({ percorso: percorso.slice(1).map(function(n){ return n.nome; }) }); disegnaCartella(); return; }
    var tf = e.target.closest(".mtg-t[data-f]");
    if(tf){ var host = tf.closest("#mtg-el"); if(host && host._file) apriFile(host._file[+tf.getAttribute("data-f")]); return; }
    var tp = e.target.closest(".mtg-t[data-pid]");
    if(tp){ var p = trovaP(tp.getAttribute("data-pid")); if(p && p.foti.length) apriPers(p); }
  });
  var tRic = null;
  box.addEventListener("input", function(e){
    if(e.target.id === "mtg-cp"){
      filtroP = e.target.value; clearTimeout(tRic);
      tRic = setTimeout(function(){ disegnaPers(); var i = document.getElementById("mtg-cp"); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 200);
    }
    if(e.target.id === "mtg-cc"){
      filtroC = e.target.value; clearTimeout(tRic);
      tRic = setTimeout(function(){ if(filtroC.length >= 2) cerca(); else disegnaCartella(); var i = document.getElementById("mtg-cc"); if(i && document.activeElement !== i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 300);
    }
  });

  /* il capitolo si prepara solo quando viene aperto */
  var pronto = false;
  function avvia(){ if(pronto) return; pronto = true; disegna(); }
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(L){ if(L.some(function(x){ return x.isIntersecting; })){ io.disconnect(); avvia(); } });
    io.observe(box);
  } else avvia();
  /* il bot si collega in un altro capitolo: la riga di stato si aggiorna da sola */
  setInterval(function(){ if(!pronto || document.hidden) return; var st = document.getElementById("mtg-stato"), h = statoBot(); if(st && st.innerHTML !== h) st.innerHTML = h; }, 3000);
})();
