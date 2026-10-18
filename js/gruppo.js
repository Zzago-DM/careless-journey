/* Il Gruppo: Punti Vita e stati alterati di tutti gli Slayer, visibili a tutti e aggiornati in diretta.

   Dove stanno i dati: nel repository privato Zzago-DM/gruppo, file stato.json (uno per tutto il gruppo).
   - Ogni volta che un giocatore cambia PV o stati nella propria scheda, il sito invia la sua riga a stato.json
     (dopo un paio di secondi, così più tocchi di fila diventano un solo invio).
   - Ogni dispositivo con un token (di un giocatore o del Master) rilegge stato.json ogni pochi secondi
     mentre la pagina è aperta: se nulla è cambiato GitHub risponde «uguale» e non costa niente.
   - Per scrivere si usa il token del personaggio; se manca, quello del Master; se manca anche quello,
     un altro token presente sul dispositivo. Tutti i token devono includere gruppo.

   Nella scheda: PV attuali / massimi con barra e pulsanti ±, e la scelta degli stati alterati
   (salvati nella scheda come «pvmax» e «stati», quindi seguono anche il salvataggio online dell'area). */
(function(){
  "use strict";
  var OWNER = "Zzago-DM", REPO = OWNER + "/gruppo", FILE = "stato.json";
  var API = "https://api.github.com/repos/";
  if(typeof SC_CHARS === "undefined") return;
  var CH = SC_CHARS.map(function(c){ return c.k; });
  var EMO = {}; SC_CHARS.forEach(function(c){ EMO[c.k] = c.e; });
  var NOME = {}; CH.forEach(function(k){ NOME[k] = (typeof PA_FULL !== "undefined" && PA_FULL[k]) || k; });
  var EL_C = { glaciale:"#7ec8e3", ardente:"#e05a20", folgorante:"#f0d020", terrestre:"#5fae50", radiante:"#d4a8ff", oscuro:"#9a72e0", neutro:"#a8a8b8" };
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- stati alterati (dal Manuale dello Slayer) ---------- */
  var AE = [
    { f:"fuoco",    n:"Fuoco",       i:"🔥", c:"#ff6a2a", forme:[{id:"scottato", n:"Scottato", fx:"−2 PV a turno", t:3, dot:2}, {id:"bruciato", n:"Bruciato", fx:"−5 PV a turno", t:3, dot:5}] },
    { f:"ghiaccio", n:"Ghiaccio",    i:"❄️", c:"#7ec8e3", forme:[{id:"ghiacciato", n:"Ghiacciato", fx:"−3 DES", t:3}, {id:"ibernato", n:"Ibernato", fx:"−5 DES", t:3}] },
    { f:"fulmine",  n:"Elettricità", i:"⚡", c:"#f0d020", forme:[{id:"elettrificato", n:"Elettrificato", fx:"−1 PV a turno · niente azioni bonus", t:3, dot:1}, {id:"fulminato", n:"Fulminato", fx:"−3 PV a turno · niente azioni bonus", t:3, dot:3}] },
    { f:"terra",    n:"Terra",       i:"🌍", c:"#5fae50", forme:[{id:"interrato", n:"Interrato", fx:"Movimento dimezzato", t:3}, {id:"drenato", n:"Drenato", fx:"Non puoi muoverti", t:3}] },
    { f:"oscurita", n:"Oscurità",    i:"🌑", c:"#a57cf0", forme:[{id:"corrotto", n:"Corrotto", fx:"−5 PV a turno · svantaggio ai tiri di COST", t:5, dot:5}] },
    { f:"luce",     n:"Luce",        i:"✨", c:"#e2c2ff", forme:[{id:"abbagliato", n:"Abbagliato", fx:"−5 PV a turno · svantaggio ai tiri di DES", t:5, dot:5}] }
  ];
  var DI = [
    { f:"sanguinante", n:"Sanguinante", i:"🩸", c:"#e0533f", forme:[{id:"sanguinante", n:"Sanguinante", fx:"−2 PV quando ti muovi o agisci · si toglie rinunciando al turno", t:3}] },
    { f:"emorragia",   n:"Emorragia",   i:"🩸", c:"#b3203a", forme:[{id:"emorragia", n:"Emorragia", fx:"−5 PV quando ti muovi o agisci · si toglie rinunciando al turno", t:5}] },
    { f:"stordito",    n:"Stordito",    i:"💫", c:"#e8c870", forme:[{id:"stordito", n:"Stordito", fx:"Perdi il primo turno; nel secondo non puoi muoverti", t:2}] },
    { f:"frenesia",    n:"Frenesia",    i:"💢", c:"#ff7a4a", forme:[{id:"frenesia", n:"Frenesia", fx:"+8 FOR · nel turno dopo non puoi agire", t:1}] }
  ];
  var FAM = AE.concat(DI), FORMA = {}, FAMI = {};
  FAM.forEach(function(fa){ FAMI[fa.f] = fa; fa.forme.forEach(function(fo, i){ FORMA[fo.id] = { fa: fa, fo: fo, grave: i > 0 }; }); });

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function leggiJ(key){ try { return JSON.parse(localStorage.getItem(key) || "null") || {}; } catch(e){ return {}; } }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function num(v){ var m = String(v == null ? "" : v).match(/-?\d+/); return m ? parseInt(m[0], 10) : null; }
  function pvDi(pv, max){
    var cur = num(pv), mx = num(max);
    if(mx === null){ var m = String(pv || "").match(/\/\s*(\d+)/); if(m) mx = parseInt(m[1], 10); }
    if(mx !== null && mx <= 0) mx = null;
    return { pv: cur, max: mx };
  }
  function statiDi(v){
    var a; try { a = typeof v === "string" ? JSON.parse(v || "[]") : v; } catch(e){ a = []; }
    if(!Array.isArray(a)) return [];
    var visti = {};
    return a.filter(function(x){
      if(!x || !FORMA[x.id]) return false;
      var f = FORMA[x.id].fa.f; if(visti[f]) return false; visti[f] = 1; return true;
    }).map(function(x){ var t = num(x.t); return { id: x.id, t: t === null ? FORMA[x.id].fo.t : Math.max(0, Math.min(99, t)) }; });
  }
  window.grStatiTesto = function(v){
    return statiDi(v).map(function(x){ return FORMA[x.id].fo.n + (x.t ? " (" + x.t + (x.t === 1 ? " turno" : " turni") + ")" : ""); }).join(", ");
  };
  function elDi(k){ try { if(typeof paPref === "function") return paPref(k).c; } catch(e){} return (typeof PA_DEF !== "undefined" && PA_DEF[k]) || "neutro"; }
  function colore(pct){ return "hsl(" + Math.round(4 + pct * 122) + ",72%," + Math.round(50 + pct * 4) + "%)"; }
  function fa(iso){
    if(!iso) return "";
    var d = new Date(iso), s = (Date.now() - d.getTime()) / 1000;
    if(isNaN(s)) return "";
    if(s < 45) return "adesso";
    if(s < 3600) return Math.max(1, Math.round(s / 60)) + " min fa";
    var hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if(s < 20 * 3600) return "alle " + hm;
    return d.getDate() + "/" + (d.getMonth() + 1) + " alle " + hm;
  }

  /* ---------- dati locali della scheda ---------- */
  function scheda(k){
    try { var s = localStorage.getItem("tcj-sc4-" + k); if(s === null && k === CH[0]) s = localStorage.getItem("tcj-sc4"); return s ? JSON.parse(s) : null; } catch(e){ return null; }
  }
  function daScheda(k){
    var d = scheda(k); if(!d) return null;
    var p = pvDi(d.pv, d.pvmax);
    return { pv: p.pv, max: p.max, st: statiDi(d.stati), el: elDi(k), rit: (d.id && d.id.ritratto) || "" };
  }
  function daDom(){
    var p = pvDi(($("sc-pv") || {}).value, ($("sc-pvmax") || {}).value);
    return { pv: p.pv, max: p.max, st: statiDi(($("sc-stati") || {}).value), el: elDi(scCur), rit: null };
  }
  function firma(r){ if(!r) return ""; var s = r.rit || ""; return JSON.stringify([r.pv, r.max, r.st, r.el, s ? s.length + ":" + s.slice(-48) : ""]); }

  /* ---------- miniatura del ritratto (piccola, per stato.json) ---------- */
  var mini = {};
  function miniatura(src){
    if(!src) return Promise.resolve("");
    var key = src.length + ":" + src.slice(-64);
    if(mini[key] !== undefined) return Promise.resolve(mini[key]);
    return new Promise(function(fine){
      var im = new Image();
      im.onload = function(){
        try {
          var S = 120, c = document.createElement("canvas"); c.width = c.height = S;
          var g = c.getContext("2d"), w = im.naturalWidth, h = im.naturalHeight, m = Math.min(w, h);
          g.drawImage(im, (w - m) / 2, Math.max(0, (h - m) * 0.18), m, m, 0, 0, S, S);
          mini[key] = c.toDataURL("image/jpeg", 0.74);
        } catch(e){ mini[key] = ""; }
        fine(mini[key]);
      };
      im.onerror = function(){ mini[key] = ""; fine(""); };
      im.src = src;
    });
  }

  /* ---------- GitHub ---------- */
  function tokMaster(){ return leggiJ("tcjgh_master").token || ""; }
  function tokPg(k){ var s = leggiJ("tcjgh_" + k); return (s.token && s.repo) ? s.token : ""; }
  function tokLettura(){ var m = tokMaster(); if(m) return m; for(var i = 0; i < CH.length; i++){ var t = tokPg(CH[i]); if(t) return t; } return ""; }
  function tokScrittura(k){ return tokPg(k) || tokMaster() || tokLettura(); }
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(tok, metodo, perc, corpo, extra){
    var h = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(tok) h.Authorization = "Bearer " + tok;
    if(corpo) h["Content-Type"] = "application/json";
    if(extra) Object.keys(extra).forEach(function(x){ h[x] = extra[x]; });
    /* GitHub tiene in memoria le risposte fino a 60 secondi: un parametro sempre diverso obbliga a leggere la versione appena salvata */
    if(metodo === "GET") perc += (perc.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return fetch(API + REPO + perc, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function aspetta(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  /* ---------- stato condiviso ---------- */
  var doc = leggiJ("tcjgr_cache"); if(!doc.pg) doc = { pg: {} };
  var etag = null, accesso = "?", locali = {}, base = {};
  function salvaCache(){ try { localStorage.setItem("tcjgr_cache", JSON.stringify(doc)); } catch(e){} }
  function ricevi(d){
    if(!d || typeof d !== "object") return;
    d.pg = d.pg && typeof d.pg === "object" ? d.pg : {};
    doc = d; salvaCache();
    try { controllaTurno(); } catch(e){ console.error(e); }
    rendiBoard();
  }

  /* ---------- lettura periodica ---------- */
  var leggendo = false, timer = null, inVista = false, ultimoOk = 0;
  function leggi(){
    if(leggendo) return Promise.resolve(); leggendo = true;
    var tok = tokLettura(), ex = { "Accept": "application/vnd.github.raw+json" };
    if(etag) ex["If-None-Match"] = etag;
    return gh(tok, "GET", "/contents/" + FILE, null, ex).then(function(r){
      if(r.status === 304){ segnala("ok"); return; }
      if(r.ok){ etag = r.headers.get("ETag"); return r.text().then(function(t){ var j = null; try { j = JSON.parse(t); } catch(e){} if(j) ricevi(j); segnala("ok"); }); }
      if(r.status === 404) return gh(tok, "GET", "").then(function(r2){ if(r2.ok){ segnala("ok"); } else segnala(tok ? "noaccesso" : "notoken"); });
      if(r.status === 401) return segnala("tokenko");
      if(r.status === 403 || r.status === 429) return segnala(tok ? "limite" : "notoken");
      segnala("errore");
    }).catch(function(){ segnala("rete"); }).then(function(){ leggendo = false; });
  }
  function prossimo(){
    clearTimeout(timer);
    if(document.hidden) return;
    var ms = !tokLettura() ? 120000 : (accesso === "noaccesso" || accesso === "tokenko") ? 20000 : inVista ? 3000 : 12000;
    timer = setTimeout(function(){ leggi().then(prossimo); }, ms);
  }
  document.addEventListener("visibilitychange", function(){ if(!document.hidden){ leggi().then(prossimo); } else clearTimeout(timer); });
  window.addEventListener("online", function(){ leggi().then(prossimo); });

  /* ---------- invio ---------- */
  var coda = {}, invioT = null, inviando = false;
  function accoda(k){ coda[k] = 1; clearTimeout(invioT); invioT = setTimeout(invia, 500); condivisione("attesa"); }
  function applicato(k){ var v = parseInt(localStorage.getItem("tcjgr_tb_" + k) || "", 10); return isNaN(v) ? -1 : v; }
  function segnaApplicato(k, n){ try { localStorage.setItem("tcjgr_tb_" + k, String(n)); } catch(e){} }
  function turnoN(d){ return (d && d.turno && d.turno.n) || 0; }
  function voce(k){
    var r = daScheda(k); if(!r) return Promise.resolve(null);
    return miniatura(r.rit).then(function(img){
      return { n: NOME[k], pv: r.pv, max: r.max, st: r.st, el: r.el, img: img, t: new Date().toISOString(), tb: applicato(k) };
    });
  }
  /* legge stato.json, lo cambia con fn(d) e lo salva; se nel frattempo qualcun altro l'ha salvato, riprova */
  function modifica(tok, fn, tent){
    tent = tent || 0;
    return gh(tok, "GET", "/contents/" + FILE).then(function(r){
      if(r.status === 404) return { d: { app: "the-careless-journey", tipo: "stato-del-gruppo", v: 1, pg: {} }, sha: null };
      if(!r.ok) throw r;
      return r.json().then(function(j){
        var c = j.content ? Promise.resolve(j.content) : gh(tok, "GET", "/git/blobs/" + j.sha).then(function(x){ return x.json(); }).then(function(b){ return b.content; });
        return c.then(function(b64){ var d = {}; try { d = JSON.parse(b64d(b64)); } catch(e){} return { d: d, sha: j.sha }; });
      });
    }).then(function(o){
      var d = o.d && typeof o.d === "object" ? o.d : {}; d.pg = d.pg && typeof d.pg === "object" ? d.pg : {};
      var msg = fn(d);
      if(!msg){ ricevi(d); return; }
      d.agg = new Date().toISOString();
      var corpo = { message: msg, content: b64e(JSON.stringify(d)) };
      if(o.sha) corpo.sha = o.sha;
      return gh(tok, "PUT", "/contents/" + FILE, corpo).then(function(r){
        if((r.status === 409 || r.status === 422) && tent < 5) return aspetta(300 + tent * 450).then(function(){ return modifica(tok, fn, tent + 1); });
        if(!r.ok) throw r;
        etag = null; ricevi(d);
      });
    });
  }
  function scrivi(tok, voci){
    return modifica(tok, function(d){
      var nomi = [];
      Object.keys(voci).forEach(function(k){
        var v = voci[k];
        if(turnoN(d) > Math.max(v.tb, 0)) return;     /* il Master ha appena chiuso un turno: prima si prendono i suoi valori, poi si riscrive */
        var vecchia = d.pg[k] || {};
        delete v.tb;
        d.pg[k] = Object.assign({}, vecchia, v);
        nomi.push(NOME[k].split(" ")[0] + " " + (v.pv == null ? "—" : v.pv) + (v.max ? "/" + v.max : "") + " PV");
      });
      return nomi.length ? "Gruppo · " + nomi.join(" · ") : false;
    });
  }
  function invia(){
    if(inviando){ invioT = setTimeout(invia, 900); return; }
    var ks = Object.keys(coda); if(!ks.length) return; coda = {};
    var gruppi = {}, senza = [];
    ks.forEach(function(k){ var t = tokScrittura(k); if(t) (gruppi[t] = gruppi[t] || []).push(k); else senza.push(k); });
    if(senza.length && !Object.keys(gruppi).length){ condivisione("notoken"); return; }
    inviando = true; condivisione("invio");
    var catena = Promise.resolve(), errore = null;
    Object.keys(gruppi).forEach(function(tok){
      catena = catena.then(function(){
        return Promise.all(gruppi[tok].map(voce)).then(function(vs){
          var voci = {}; gruppi[tok].forEach(function(k, i){ if(vs[i]) voci[k] = vs[i]; });
          if(!Object.keys(voci).length) return;
          return scrivi(tok, voci, 0);
        }).catch(function(e){ errore = e; gruppi[tok].forEach(function(k){ coda[k] = 1; }); });
      });
    });
    catena.then(function(){
      inviando = false;
      if(!errore){ condivisione("ok"); segnala("ok"); return; }
      var st = errore && errore.status;
      condivisione(st === 404 ? "noaccesso" : st === 401 ? "tokenko" : st === 403 ? "permesso" : "rete");
      if(st !== 404 && st !== 401 && st !== 403){ clearTimeout(invioT); invioT = setTimeout(invia, 5000); }   /* riprova da solo se era solo la rete */
      else coda = {};
    });
  }

  /* prima volta: se il quadro non ha ancora la riga di un personaggio di cui questo dispositivo ha il token, la manda */
  var avviati = {};
  function primoInvio(){
    CH.forEach(function(k){
      if(avviati[k] || !tokPg(k) || (doc.pg && doc.pg[k])) return;
      var r = daScheda(k); if(!r || (r.pv === null && !r.st.length)) return;
      avviati[k] = 1; accoda(k);
    });
  }

  /* ---------- messaggi ---------- */
  var MSG = {
    ok: "In diretta",
    notoken: "Collega il salvataggio online nella tua Area dello Slayer per vedere il gruppo in diretta. Qui sotto c'è solo ciò che è salvato su questo dispositivo.",
    noaccesso: "Il quadro del gruppo non è ancora attivo: manca il repository «gruppo», oppure il token non lo include ancora.",
    tokenko: "Il token di questo dispositivo non è più valido: chiedine uno nuovo al Master.",
    limite: "GitHub ha chiesto una pausa: il quadro riprende tra poco.",
    rete: "Connessione assente: il quadro riprende appena torna internet.",
    errore: "GitHub non risponde: riprovo tra poco."
  };
  function segnala(s){
    accesso = s; if(s === "ok"){ ultimoOk = Date.now(); primoInvio(); }
    var w = $("gr-live"), t = $("gr-live-t"); if(!w || !t) return;
    w.setAttribute("data-s", s === "ok" ? "ok" : (s === "notoken" ? "loc" : "ko"));
    t.textContent = MSG[s] || MSG.errore;
    if(s === "noaccesso" && (!shareStato || shareStato === "ok")) condivisione("noaccesso");
    var bt = $("gr-diag-b");
    if((s === "noaccesso" || s === "tokenko") && !bt){
      bt = document.createElement("button"); bt.type = "button"; bt.id = "gr-diag-b"; bt.className = "gr-sbtn gr-diag-b"; bt.textContent = "🔍 Controlla i token";
      bt.onclick = diagnosi; w.appendChild(bt);
    }
    if(bt) bt.hidden = !(s === "noaccesso" || s === "tokenko");
    if(s === "ok"){ var dg = $("gr-diag"); if(dg) dg.remove(); }
    rendiBoard();
  }

  /* ---------- controllo dei token di questo dispositivo ---------- */
  function prova(tok, repo){
    return fetch(API + repo + "?_=" + Date.now().toString(36), { headers: { "Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" })
      .then(function(r){ return r.status; }).catch(function(){ return 0; });
  }
  function diagnosi(){
    var box = $("gr-diag");
    if(!box){ box = document.createElement("div"); box.id = "gr-diag"; box.className = "gr-diag"; var w = $("gr-live"); w.parentNode.insertBefore(box, w.nextSibling); }
    var elenco = [];
    var m = tokMaster(); if(m) elenco.push({ nm: "Token del Master", tok: m, suo: OWNER + "/tcj-" + CH[0] });
    CH.forEach(function(k){ var st = leggiJ("tcjgh_" + k); if(st.token && st.repo) elenco.push({ nm: "Token di " + NOME[k].split(" ")[0], tok: st.token, suo: st.repo }); });
    if(!elenco.length){ box.innerHTML = "<p>Su questo dispositivo non c'è nessun token: collegalo dall'Area dello Slayer («☁ Collega salvataggio online»).</p>"; return; }
    box.innerHTML = "<p>Controllo in corso…</p>";
    var usato = tokLettura();
    Promise.all(elenco.map(function(e){ return Promise.all([prova(e.tok, REPO), prova(e.tok, e.suo)]); })).then(function(ris){
      var vede = 0, validi = 0, h = "<ul>";
      elenco.forEach(function(e, i){
        var g = ris[i][0], s = ris[i][1], esito, cls;
        if(g === 200){ esito = "✓ vede «gruppo»"; cls = "si"; vede++; validi++; }
        else if(g === 401 || s === 401){ esito = "✗ non è più valido (revocato o sostituito): va incollato quello nuovo"; cls = "no"; }
        else if(g === 0){ esito = "? nessuna risposta da GitHub (connessione)"; cls = "forse"; }
        else if(s === 200){ esito = "✗ funziona, ma <b>non vede «gruppo»</b>"; cls = "no"; validi++; }
        else { esito = "✗ non vede né «gruppo» né il suo repository (" + g + ")"; cls = "no"; }
        h += '<li class="' + cls + '"><b>' + esc(e.nm) + "</b>" + (e.tok === usato ? " <small>(quello che usa il quadro)</small>" : "") + ": " + esito + "</li>";
      });
      h += "</ul>";
      if(!vede && validi) h += "<p>Nessun token vede «gruppo». Di solito vuol dire che il repository <b>ha un nome diverso</b> (deve essere esattamente <b>gruppo</b>, sotto <b>" + OWNER + "</b>), oppure che nella pagina del token non è stato premuto <b>Update</b> dopo averlo aggiunto.</p>";
      else if(vede < elenco.length) h += "<p>Ai token segnati con ✗ va aggiunto «gruppo» (GitHub → Settings → Developer settings → Fine-grained tokens → il token → Edit → Repository access → Update).</p>";
      else h += "<p>Tutti i token vedono «gruppo»: il quadro si accende tra un istante.</p>";
      box.innerHTML = h;
      if(vede){ etag = null; leggi().then(prossimo); }
    });
  }
  var SHARE = {
    attesa: ["att", "Modifica in arrivo al gruppo…"],
    invio: ["att", "Invio al gruppo…"],
    ok: ["ok", "✓ Il gruppo vede questi PV e stati"],
    notoken: ["loc", "Solo su questo dispositivo: collega il salvataggio online qui sotto per mostrarli al gruppo."],
    noaccesso: ["ko", "Non inviato: manca il repository «gruppo» o il token non lo include."],
    tokenko: ["ko", "Non inviato: il token non è più valido."],
    permesso: ["ko", "Non inviato: il token può solo leggere «gruppo» (serve «Contents: Read and write»)."],
    rete: ["ko", "Non inviato per ora: riprovo appena torna la connessione."]
  };
  var shareStato = null;
  function condivisione(s){
    shareStato = s; var e = $("gr-share"); if(!e) return;
    if(!s){ e.textContent = ""; e.removeAttribute("data-s"); return; }
    var m = SHARE[s] || SHARE.rete; e.setAttribute("data-s", m[0]); e.textContent = m[1];
  }

  /* =================== Quadro del gruppo =================== */
  function datiDi(k){
    var r = doc.pg && doc.pg[k] ? doc.pg[k] : null, l = locali[k];
    if(l && (!r || !r.t || l.t > r.t)){
      var va = !!tokScrittura(k) && accesso !== "noaccesso" && accesso !== "tokenko";
      return { pv: l.pv, max: l.max, st: l.st, el: l.el, img: r ? r.img : "", t: l.t, attesa: va, solo: !va };
    }
    if(r) return r;
    if(accesso !== "ok"){ var s = daScheda(k); if(s && (s.pv !== null || s.st.length)) return { pv: s.pv, max: s.max, st: s.st, el: s.el, img: "", t: null, solo: true }; }
    return null;
  }
  function creaCard(k){
    var a = document.createElement("article");
    a.className = "gr-card"; a.setAttribute("data-k", k);
    a.innerHTML = '<div class="gr-glow" aria-hidden="true"></div>'
      + '<div class="gr-head"><div class="gr-av"><img alt="" decoding="async"><span class="gr-av-e" aria-hidden="true">' + EMO[k] + '</span></div>'
      + '<div class="gr-who"><div class="gr-nm">' + esc(NOME[k]) + '</div><div class="gr-meta"></div></div>'
      + '<div class="gr-num"><b class="gr-pv">—</b><span class="gr-max"></span><small>PV</small></div></div>'
      + '<div class="gr-fatto" aria-hidden="true">✓ Azione conclusa</div>'
      + '<div class="gr-bar" aria-hidden="true"><i class="gr-ghost"></i><i class="gr-fill"></i><span class="gr-shine"></span></div>'
      + '<div class="gr-chips"></div><div class="gr-ko" aria-hidden="true">Atterrato</div>';
    a.addEventListener("click", function(){
      try {
        if(typeof paIsOpen !== "function" || !paIsOpen(k)) return;
        if(k !== scCur && typeof scSwitch === "function") scSwitch(k);
        var c = $("gr-stcard"); if(c) setTimeout(function(){ c.scrollIntoView({ behavior: RIDOTTO ? "auto" : "smooth", block: "center" }); }, 60);
      } catch(e){}
    });
    return a;
  }
  function contaA(el, da, a){
    if(RIDOTTO || da === null || a === null || da === a){ el.textContent = a === null ? "—" : a; return; }
    var t0 = performance.now(), dur = 520;
    cancelAnimationFrame(el._raf);
    (function passo(t){ var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(da + (a - da) * e); if(p < 1) el._raf = requestAnimationFrame(passo); })(t0);
  }
  function barra(b, pv, max, prima){
    var pct = (pv !== null && max) ? Math.max(0, Math.min(1, pv / max)) : (pv !== null ? 1 : 0);
    var su = prima !== undefined && prima !== null && pct > prima;
    b.classList.toggle("cura", !!su);
    b.classList.toggle("nomax", pv !== null && !max);
    b.classList.toggle("basso", !!max && pv !== null && pct <= 0.25 && pct > 0);
    b.style.setProperty("--hp", colore(pct));
    b.querySelector(".gr-fill").style.width = (pct * 100) + "%";
    b.querySelector(".gr-ghost").style.width = (pct * 100) + "%";
    return pct;
  }
  function flottante(card, delta){
    if(RIDOTTO || !delta) return;
    var f = document.createElement("span");
    f.className = "gr-float " + (delta < 0 ? "dan" : "cur");
    f.textContent = (delta > 0 ? "+" : "−") + Math.abs(delta);
    f.style.left = (38 + Math.random() * 24) + "%";
    card.appendChild(f);
    setTimeout(function(){ f.remove(); }, 1500);
  }
  function scatta(card, cls){ card.classList.remove(cls); void card.offsetWidth; card.classList.add(cls); clearTimeout(card["_" + cls]); card["_" + cls] = setTimeout(function(){ card.classList.remove(cls); }, 900); }
  function chips(box, st){
    var ora = {}; st.forEach(function(x){ ora[FORMA[x.id].fa.f] = x; });
    [].slice.call(box.querySelectorAll(".gr-chip")).forEach(function(c){
      var f = c.getAttribute("data-f");
      if(!ora[f] && !c.classList.contains("via")){ c.classList.add("via"); setTimeout(function(){ c.remove(); vuoto(box); }, RIDOTTO ? 0 : 420); }
    });
    st.forEach(function(x){
      var F = FORMA[x.id], f = F.fa.f, c = box.querySelector('.gr-chip[data-f="' + f + '"]:not(.via)');
      if(!c){
        c = document.createElement("span"); c.className = "gr-chip nuovo"; c.setAttribute("data-f", f); c.style.setProperty("--c", F.fa.c);
        box.appendChild(c); setTimeout(function(){ c.classList.remove("nuovo"); }, 700);
      } else if(c.getAttribute("data-id") !== x.id){ c.classList.remove("cambia"); void c.offsetWidth; c.classList.add("cambia"); }
      c.setAttribute("data-id", x.id);
      c.classList.toggle("grave", F.grave);
      c.title = F.fo.n + ": " + F.fo.fx;
      c.innerHTML = '<span class="gr-ci" aria-hidden="true">' + F.fa.i + '</span>' + esc(F.fo.n) + (x.t ? '<small title="Turni rimasti">' + x.t + '</small>' : "");
    });
    vuoto(box);
  }
  function vuoto(box){
    var n = box.querySelectorAll(".gr-chip:not(.via)").length, e = box.querySelector(".gr-none");
    if(!n && !e){ e = document.createElement("span"); e.className = "gr-none"; e.textContent = "Nessuno stato alterato"; box.appendChild(e); }
    if(n && e) e.remove();
  }
  function aggiornaCard(card, k, d){
    var vuota = !d;
    card.classList.toggle("vuota", vuota);
    card.style.setProperty("--c", EL_C[(d && d.el) || elDi(k)] || EL_C.neutro);
    var img = card.querySelector(".gr-av img"), src = d && d.img ? d.img : "";
    if(img.getAttribute("src") !== src){ if(src) img.setAttribute("src", src); else img.removeAttribute("src"); }
    card.querySelector(".gr-av").classList.toggle("conimg", !!src);
    var meta = card.querySelector(".gr-meta");
    meta.textContent = vuota ? "In attesa del primo aggiornamento" : d.solo ? "Salvato su questo dispositivo" : d.attesa ? "Sta aggiornando…" : ("Aggiornato " + fa(d.t));
    var pv = d ? (d.pv === undefined ? null : d.pv) : null, max = d ? (d.max || null) : null;
    var pvEl = card.querySelector(".gr-pv"), prima = card._pv === undefined ? null : card._pv;
    contaA(pvEl, prima, pv);
    card.querySelector(".gr-max").textContent = max ? "/ " + max : "";
    var pct = barra(card.querySelector(".gr-bar"), pv, max, card._pct);
    if(prima !== null && pv !== null && pv !== prima && card._pronta){ scatta(card, pv < prima ? "colpo" : "cura"); flottante(card, pv - prima); }
    card._pv = pv; card._pct = pct; card._pronta = true;
    card.classList.toggle("ko", pv !== null && pv <= 0 && !vuota);
    chips(card.querySelector(".gr-chips"), d && d.st ? statiDi(d.st) : []);
    var st = d && d.st ? statiDi(d.st).map(function(x){ return FORMA[x.id].fo.n; }).join(", ") : "";
    card.setAttribute("aria-label", NOME[k] + ": " + (pv === null ? "PV sconosciuti" : pv + (max ? " su " + max : "") + " PV") + (st ? ". Stati: " + st : ". Nessuno stato alterato"));
    var apribile = false; try { apribile = typeof paIsOpen === "function" && paIsOpen(k); } catch(e){}
    card.classList.toggle("apri", apribile);
    var fatto = !vuota && eFatto(k);
    if(fatto && !card.classList.contains("fatto") && card._pronta2){ card.classList.remove("fatto-in"); void card.offsetWidth; card.classList.add("fatto-in"); }
    card.classList.toggle("fatto", fatto); card._pronta2 = true;
    card.title = apribile ? "Apri la scheda" : "";
  }
  function rendiBoard(){
    rendiTurno(); rendiFatto();
    var b = $("gr-board"); if(!b) return;
    CH.forEach(function(k){
      var c = b.querySelector('.gr-card[data-k="' + k + '"]');
      if(!c){ c = creaCard(k); b.appendChild(c); }
      aggiornaCard(c, k, datiDi(k));
    });
  }
  setInterval(function(){ if(!document.hidden) rendiBoard(); }, 30000);


  /* =================== Turni: «Ho concluso l'azione» e «Fine turno» del Master =================== */
  var fattoLoc = {}, visto = null;
  function eFatto(k){ if(fattoLoc[k]) return fattoLoc[k].v; return !!(doc.pg && doc.pg[k] && doc.pg[k].fatto); }
  function recente(iso){ var t = Date.parse(iso || ""); return !isNaN(t) && Date.now() - t < 45000; }
  function sonoMaster(){ return !!tokMaster(); }
  var toastEl = null;
  function avvisa(msg, err){
    if(!toastEl){ toastEl = document.createElement("div"); toastEl.className = "gh-toast gr-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.innerHTML = msg; toastEl.classList.toggle("err", !!err);
    toastEl.classList.remove("on"); void toastEl.offsetWidth; toastEl.classList.add("on");
    clearTimeout(avvisa._t); avvisa._t = setTimeout(function(){ toastEl.classList.remove("on"); }, err ? 6000 : 4200);
  }
  function errMsg(e){ var st = e && e.status; return st === 404 ? "manca il repository «gruppo» o il token non lo include" : st === 401 ? "il token non è più valido" : st === 403 ? "il token non può scrivere" : "connessione assente"; }

  /* cosa fa la fine del turno a un personaggio: danni degli stati attivi, poi un turno in meno a ogni stato */
  function calcolaTurno(r){
    var st = statiDi(r.st), danni = 0, voci = [], eff = [], resta = [];
    st.forEach(function(x){
      var F = FORMA[x.id]; eff.push(F.fa.f);
      if(F.fo.dot){ danni += F.fo.dot; voci.push(F.fo.n + " −" + F.fo.dot); }
      if((x.t || 0) - 1 > 0) resta.push({ id: x.id, t: x.t - 1 });
    });
    var pv = (r.pv === null || r.pv === undefined) ? null : Math.max(0, r.pv - danni);
    return { danni: pv === null ? 0 : danni, voci: voci, eff: eff, st: resta, pv: pv };
  }
  window.grFineTurnoMaster = function(){
    if(!sonoMaster()){ avvisa("Solo il Master può chiudere il turno."); return; }
    if(accesso !== "ok"){ avvisa("Il quadro non è collegato: " + (MSG[accesso] || ""), true); return; }
    var righe = [], manca = [];
    CH.forEach(function(k){
      var r = doc.pg[k]; if(!r) return;
      var c = calcolaTurno(r), nm = esc(NOME[k].split(" ")[0]);
      righe.push("<b>" + nm + "</b>: " + (c.danni ? "−" + c.danni + " PV <small>(" + esc(c.voci.join(", ")) + ")</small>" : "nessun danno") + (statiDi(r.st).some(function(x){ return /sanguinante|emorragia/.test(x.id); }) ? " <small>· sanguina: i PV si tolgono quando si muove o agisce</small>" : ""));
      if(!r.fatto) manca.push(nm);
    });
    if(!righe.length){ avvisa("Nessun personaggio sul quadro."); return; }
    var testo = righe.join("<br>") + (manca.length ? "<br><br>⚠ Non hanno ancora concluso l'azione: <b>" + manca.join(", ") + "</b>" : "");
    var vai = function(){
      var b = $("gr-fine"); if(b) b.disabled = true;
      modifica(tokMaster(), function(d){
        var n = turnoN(d) + 1, ora = new Date().toISOString(), nomi = [];
        CH.forEach(function(k){
          var r = d.pg[k]; if(!r) return;
          var c = calcolaTurno(r);
          r.pv = c.pv === null ? r.pv : c.pv; r.st = c.st; r.fatto = false; r.t = ora;
          r.ultimo = { n: n, danni: c.danni, eff: c.eff };
          if(c.danni) nomi.push(NOME[k].split(" ")[0] + " −" + c.danni);
        });
        d.turno = { n: n, s: (d.turno && d.turno.s) || 0, t: ora };
        return "Fine del turno " + (n - ((d.turno.s) || 0)) + (nomi.length ? " · " + nomi.join(" · ") : "");
      }).then(function(){ var b2 = $("gr-fine"); if(b2) b2.disabled = false; })
        .catch(function(e){ var b2 = $("gr-fine"); if(b2) b2.disabled = false; avvisa("Turno non chiuso: " + errMsg(e) + ". Riprova.", true); });
    };
    if(typeof tcjConferma === "function") tcjConferma({ titolo: "Chiudere il turno " + turnoMostrato() + "?", testo: testo, si: "⏭ Sì, chiudi il turno", attesa: 1 }).then(function(ok){ if(ok) vai(); });
    else vai();
  };
  window.grAzzera = function(){
    if(!sonoMaster()) return;
    var vai = function(){
      modifica(tokMaster(), function(d){
        var n = turnoN(d); d.turno = { n: n, s: n, t: (d.turno && d.turno.t) || null };
        CH.forEach(function(k){ if(d.pg[k]) d.pg[k].fatto = false; });
        return "Nuovo scontro: i turni ripartono da 1";
      }).catch(function(e){ avvisa("Non riuscito: " + errMsg(e) + ".", true); });
    };
    if(typeof tcjConferma === "function") tcjConferma({ titolo: "Nuovo scontro?", testo: "Il contatore dei turni riparte da 1 e le azioni concluse si azzerano. PV e stati restano come sono.", si: "Sì, ricomincia", attesa: 1 }).then(function(ok){ if(ok) vai(); });
    else vai();
  };
  function turnoMostrato(){ var T = doc.turno || {}; return (T.n || 0) - (T.s || 0) + 1; }
  function rendiTurno(){
    var nEl = $("gr-turno"); if(!nEl) return;
    var nuovo = String(turnoMostrato());
    if(nEl.textContent !== nuovo){ if(nEl.textContent && nEl.textContent !== "—"){ nEl.classList.remove("cambia"); void nEl.offsetWidth; nEl.classList.add("cambia"); } nEl.textContent = nuovo; }
    var righe = CH.filter(function(k){ return doc.pg && doc.pg[k]; }), fatti = righe.filter(eFatto);
    var dn = $("gr-tb-done");
    if(dn) dn.innerHTML = '<span class="gr-tb-pips">' + righe.map(function(k){ return '<i class="' + (eFatto(k) ? "on" : "") + '" title="' + esc(NOME[k]) + (eFatto(k) ? ": azione conclusa" : ": sta ancora agendo") + '">' + EMO[k] + '</i>'; }).join("") + '</span>Azioni concluse <b>' + fatti.length + " / " + righe.length + "</b>";
    var m = sonoMaster(), b = $("gr-fine"), h = $("gr-tb-h"), az = $("gr-azzera"), bar = $("gr-turnbar");
    if(bar) bar.classList.toggle("tutti", righe.length > 0 && fatti.length === righe.length);
    if(b){ b.classList.toggle("bloccato", !m); b.setAttribute("aria-disabled", m ? "false" : "true"); b.title = m ? "Chiude il turno per tutti: danni degli stati, un turno in meno a ogni stato" : "Solo il Master può chiudere il turno"; b.innerHTML = (m ? "" : '<span aria-hidden="true">🔒 </span>') + "⏭ Fine turno"; }
    if(h) h.textContent = m ? (fatti.length === righe.length && righe.length ? "Tutti hanno concluso: puoi chiudere il turno" : "Quando sei pronto, chiudi il turno per tutti") : "Solo il Master può chiudere il turno";
    if(az) az.hidden = !m;
  }

  /* giocatore: «Ho concluso l'azione» / «Riprendi l'azione» */
  function segnaFatto(k, v){
    var tok = tokScrittura(k);
    if(!tok){ avvisa("Collega il salvataggio online qui sotto: senza token il gruppo non può vederlo.", true); return; }
    fattoLoc[k] = { v: v }; rendiBoard(); suono(v ? "seal" : "flip");
    try { if(typeof paFlush === "function") paFlush(); } catch(e){}
    modifica(tok, function(d){
      var r = d.pg[k] || (d.pg[k] = { n: NOME[k] });
      if(!!r.fatto === v) return false;
      r.fatto = v;
      return NOME[k].split(" ")[0] + (v ? " ha concluso l'azione" : " riprende l'azione");
    }).then(function(){ delete fattoLoc[k]; rendiBoard(); })
      .catch(function(e){ delete fattoLoc[k]; rendiBoard(); avvisa("Non inviato: " + errMsg(e) + ". Riprova.", true); });
  }
  window.grConcludi = function(){
    var k = scCur;
    if(eFatto(k)){ segnaFatto(k, false); return; }
    var vai = function(){ segnaFatto(k, true); };
    if(typeof tcjConferma === "function") tcjConferma({ titolo: "Hai concluso l'azione?", testo: "Il Master e il gruppo vedranno che hai finito. Finché il Master non chiude il turno potrai tornare indietro con «↩ Riprendi l'azione».", si: "✓ Sì, ho concluso", no: "No, sto ancora agendo", attesa: 0 }).then(function(ok){ if(ok) vai(); });
    else vai();
  };
  function rendiFatto(){
    var b = $("gr-concludi"), banner = $("gr-attesa"); if(!b) return;
    var f = eFatto(scCur);
    b.textContent = f ? "↩ Riprendi l'azione" : "✓ Ho concluso l'azione";
    b.classList.toggle("fatto", f);
    if(banner){ banner.hidden = !f; banner.textContent = "Azione conclusa · in attesa che il Master chiuda il turno"; }
  }

  /* un turno nuovo arrivato da stato.json */
  function controllaTurno(){
    var T = doc.turno || {}, n = T.n || 0;
    CH.forEach(function(k){
      var app = applicato(k);
      if(n <= app) return;
      var r = doc.pg[k];
      if(r && r.ultimo && r.ultimo.n === n && daScheda(k)) adotta(k, r, recente(T.t));
      segnaApplicato(k, n);
    });
    if(visto === null){ visto = n; return; }
    if(n > visto){
      visto = n;
      suono("gong");
      var tuoi = [];
      CH.forEach(function(k){
        var r = doc.pg[k]; if(!r || !r.ultimo || r.ultimo.n !== n) return;
        setTimeout(function(){ var c = document.querySelector('.gr-card[data-k="' + k + '"]'); if(c) effetto(c, r.ultimo, false); }, 80);
        if(tokPg(k)) tuoi.push(k);
      });
      var x = tuoi.length === 1 ? doc.pg[tuoi[0]].ultimo : null;
      avvisa("⏭ Il Master ha chiuso il turno · inizia il <b>turno " + turnoMostrato() + "</b>" + (x && x.danni ? " · <b>−" + x.danni + " PV</b>" : ""));
    }
  }
  /* porta nella scheda di questo dispositivo i PV e gli stati decisi dalla fine del turno */
  function adotta(k, r, conEffetto){
    var key = localStorage.getItem("tcj-sc4-" + k) !== null ? "tcj-sc4-" + k : (k === CH[0] && localStorage.getItem("tcj-sc4") !== null ? "tcj-sc4" : null);
    if(!key) return;
    var d = scheda(k); if(!d) return;
    var st = statiDi(r.st);
    d.pv = r.pv === null || r.pv === undefined ? (d.pv || "") : String(r.pv);
    if(r.max) d.pvmax = String(r.max);
    d.stati = st.length ? JSON.stringify(st) : "";
    try { localStorage.setItem(key, JSON.stringify(d)); } catch(e){}
    delete locali[k];
    var aperta = false; try { aperta = k === scCur && paIsOpen(k) && !!$("sc-pv"); } catch(e){}
    if(aperta){
      $("sc-pv").value = d.pv; if($("sc-pvmax") && d.pvmax) $("sc-pvmax").value = d.pvmax; $("sc-stati").value = d.stati;
      rendiPv(); rendiTiles();
      if(conEffetto) effetto(null, r.ultimo, true);
    }
    base[k] = firma(daScheda(k));
  }

  /* ---------- effetti visivi della fine del turno ---------- */
  var FX = { fuoco:{n:22, s:"🔥"}, ghiaccio:{n:16, s:"❄"}, fulmine:{n:0}, terra:{n:18}, oscurita:{n:9}, luce:{n:10}, sanguinante:{n:12}, emorragia:{n:16}, stordito:{n:6, s:"✦"}, frenesia:{n:0} };
  function effetto(card, u, schermo){
    if(!u) return;
    var eff = (u.eff || []).filter(function(f, i, a){ return a.indexOf(f) === i && FX[f]; }).slice(0, 4);
    var bersaglio = schermo ? document.querySelector("#pa-body .sc-wrap") : card;
    if(schermo){
      var sc = $("scheda"); if(!sc) return;
      var rc = sc.getBoundingClientRect(); if(rc.bottom < 0 || rc.top > innerHeight) return;   /* la scheda non è sullo schermo: basta la card */
    }
    var box = document.createElement("div");
    box.className = "gr-fx" + (schermo ? " schermo" : "") + (RIDOTTO ? " calmo" : "");
    if(!eff.length) box.innerHTML = '<div class="gr-fx-l" data-f="nessuno"><span class="gr-fx-sweep"></span></div>';
    eff.forEach(function(f, j){
      var l = document.createElement("div"); l.className = "gr-fx-l"; l.setAttribute("data-f", f); l.style.setProperty("--c", FAMI[f].c); l.style.animationDelay = (j * 0.18) + "s";
      var h = '<span class="gr-fx-vig"></span>';
      if(!RIDOTTO){
        if(f === "fulmine") h += '<span class="gr-fx-flash"></span><svg class="gr-fx-bolt" viewBox="0 0 40 100" preserveAspectRatio="none" style="left:' + (15 + Math.random() * 55) + '%"><path d="M24 0 L8 46 L20 46 L12 100 L34 38 L21 38 L30 0 Z"/></svg>';
        if(f === "luce") h += '<span class="gr-fx-bloom"></span>';
        if(f === "frenesia") h += '<span class="gr-fx-pulse"></span>';
        var nn = FX[f].n * (schermo ? 1 : 0.6);
        for(var i = 0; i < nn; i++){
          var x = Math.random() * 100, dl = (Math.random() * 0.7 + j * 0.18).toFixed(2), sz = (0.6 + Math.random() * 0.9).toFixed(2);
          h += '<i class="gr-fx-p" style="left:' + x.toFixed(1) + '%;animation-delay:' + dl + 's;--s:' + sz + ';--r:' + Math.round(Math.random() * 360) + 'deg;--x:' + Math.round(Math.random() * 60 - 30) + 'px">' + (FX[f].s || "") + '</i>';
        }
      }
      l.innerHTML = h; box.appendChild(l);
    });
    if(schermo && u.danni){ var t = document.createElement("div"); t.className = "gr-fx-dan"; t.innerHTML = "<small>Fine del turno</small>−" + u.danni + " PV"; box.appendChild(t); }
    else if(schermo){ var t2 = document.createElement("div"); t2.className = "gr-fx-dan zero"; t2.innerHTML = "<small>Fine del turno</small>Turno " + turnoMostrato(); box.appendChild(t2); }
    (schermo ? document.body : card).appendChild(box);
    if(bersaglio && !RIDOTTO){
      var cls = eff.indexOf("terra") >= 0 || u.danni ? "gr-scossa" : eff.indexOf("stordito") >= 0 ? "gr-barcolla" : "";
      if(cls){ bersaglio.classList.remove(cls); void bersaglio.offsetWidth; bersaglio.classList.add(cls); setTimeout(function(){ bersaglio.classList.remove(cls); }, 900); }
    }
    setTimeout(function(){ box.classList.add("via"); }, 2100);
    setTimeout(function(){ box.remove(); }, 2700);
  }

  /* =================== Scheda: PV e stati =================== */
  function tocca(el){ if(!el) return; el.dispatchEvent(new Event("input", { bubbles: true })); }
  function leggiStati(){ return statiDi(($("sc-stati") || {}).value); }
  function scriviStati(a){ var h = $("sc-stati"); if(!h) return; h.value = a.length ? JSON.stringify(a) : ""; tocca(h); rendiTiles(); }
  function tile(fa){
    var d = document.createElement("div");
    d.className = "gr-tile"; d.setAttribute("role", "button"); d.tabIndex = 0;
    d.setAttribute("data-f", fa.f); d.style.setProperty("--c", fa.c);
    d.innerHTML = '<span class="gr-tring" aria-hidden="true"></span><span class="gr-ti" aria-hidden="true">' + fa.i + '</span><span class="gr-tn"></span><span class="gr-tfx"></span>'
      + '<span class="gr-tt"><button type="button" data-a="-1" aria-label="Un turno in meno">−</button><b></b><button type="button" data-a="1" aria-label="Un turno in più">+</button></span>';
    d.addEventListener("click", function(e){
      var btn = e.target.closest("button[data-a]");
      if(btn){ e.stopPropagation(); turni(fa.f, parseInt(btn.getAttribute("data-a"), 10)); return; }
      ciclo(fa.f);
    });
    d.addEventListener("keydown", function(e){ if((e.key === "Enter" || e.key === " ") && e.target === d){ e.preventDefault(); ciclo(fa.f); } });
    return d;
  }
  function ciclo(f){
    var a = leggiStati(), fa = FAMI[f], i = -1, pos = -1;
    a.forEach(function(x, j){ if(FORMA[x.id].fa.f === f){ pos = j; i = fa.forme.indexOf(FORMA[x.id].fo); } });
    var nx = i + 1;
    if(nx >= fa.forme.length){ a.splice(pos, 1); suono("off"); }
    else {
      var v = { id: fa.forme[nx].id, t: fa.forme[nx].t };
      if(pos >= 0) a[pos] = v; else a.push(v);
      suono(nx > 0 ? "crack" : "charge");
      var el = document.querySelector('#gr-stcard .gr-tile[data-f="' + f + '"]');
      if(el){ el.classList.remove("burst"); void el.offsetWidth; el.classList.add("burst"); }
    }
    scriviStati(a);
  }
  function turni(f, d){
    var a = leggiStati();
    for(var j = 0; j < a.length; j++){
      if(FORMA[a[j].id].fa.f !== f) continue;
      a[j].t = Math.max(0, Math.min(99, (a[j].t || 0) + d));
      if(a[j].t === 0){ a.splice(j, 1); suono("off"); } else suono("tick");
      break;
    }
    scriviStati(a);
  }
  window.grPulisci = function(){
    if(!leggiStati().length) return;
    var fai = function(){ suono("mend"); scriviStati([]); };
    if(typeof tcjConferma === "function") tcjConferma({ titolo: "Togliere tutti gli stati?", testo: "Spariranno dalla scheda e dal quadro del gruppo.", si: "Sì, togli tutti" }).then(function(ok){ if(ok) fai(); });
    else fai();
  };
  window.grPv = function(d){
    var p = $("sc-pv"), m = $("sc-pvmax"); if(!p) return;
    var v = pvDi(p.value, m ? m.value : ""), cur = v.pv === null ? (v.max || 0) : v.pv;
    var nv = Math.max(0, cur + d); if(v.max) nv = Math.min(v.max, nv);
    if(m && !m.value && v.max) m.value = v.max;
    p.value = nv; tocca(p);
    suono(d < 0 ? "crack" : "mend");
    var c = p.closest(".sc-card"); if(c){ var cls = d < 0 ? "colpo" : "cura"; c.classList.remove("colpo", "cura"); void c.offsetWidth; c.classList.add(cls); }
  };
  function rendiTiles(){
    var ae = $("gr-ae"), di = $("gr-di"); if(!ae || !di) return;
    if(!ae.children.length){ AE.forEach(function(fa){ ae.appendChild(tile(fa)); }); DI.forEach(function(fa){ di.appendChild(tile(fa)); }); }
    var a = leggiStati(), per = {};
    a.forEach(function(x){ per[FORMA[x.id].fa.f] = x; });
    FAM.forEach(function(fa){
      var el = document.querySelector('#gr-stcard .gr-tile[data-f="' + fa.f + '"]'); if(!el) return;
      var x = per[fa.f], F = x ? FORMA[x.id] : null;
      el.classList.toggle("on", !!x); el.classList.toggle("grave", !!(F && F.grave));
      el.setAttribute("aria-pressed", x ? "true" : "false");
      el.querySelector(".gr-tn").textContent = F ? F.fo.n : fa.n;
      el.querySelector(".gr-tfx").textContent = F ? F.fo.fx : (fa.forme.length > 1 ? fa.forme.map(function(fo){ return fo.n; }).join(" → ") : fa.forme[0].fx);
      el.querySelector(".gr-tt b").textContent = x ? (x.t + (x.t === 1 ? " turno" : " turni")) : "";
      el.setAttribute("aria-label", (F ? F.fo.n + " attivo, " + x.t + " turni. Tocca per " + (F.grave || fa.forme.length === 1 ? "toglierlo" : "passare alla forma grave") : fa.n + ": tocca per attivare " + fa.forme[0].n));
    });
  }
  function rendiPv(){
    var p = $("sc-pv"), m = $("sc-pvmax"), b = $("sc-pvbar"); if(!p || !b) return;
    if(m && !m.value && /\//.test(p.value)){ var v0 = pvDi(p.value, ""); if(v0.max){ m.value = v0.max; p.value = v0.pv === null ? "" : v0.pv; } }
    var v = pvDi(p.value, m ? m.value : "");
    b._pct = barra(b, v.pv, v.max, b._pct);
    var c = p.closest(".sc-card"); if(c) c.classList.toggle("ko", v.pv !== null && v.pv <= 0);
  }
  function rendiScheda(){
    rendiPv(); rendiTiles(); rendiFatto();
    var s = shareStato;
    if(!s || s === "notoken" || s === "ok") s = !tokScrittura(scCur) ? "notoken" : (accesso === "noaccesso" ? "noaccesso" : (s === "ok" ? "ok" : null));
    condivisione(s);
  }

  /* modifica in corso nella scheda → il quadro si aggiorna subito, l'invio parte dopo il salvataggio */
  var ritLoc = null;
  document.addEventListener("input", function(e){
    var id = e.target && e.target.id;
    if(id !== "sc-pv" && id !== "sc-pvmax" && id !== "sc-stati") return;
    if(id !== "sc-stati") rendiPv();
    try { if(!paIsOpen(scCur)) return; } catch(err){ return; }
    var r = daDom(); r.t = new Date().toISOString(); locali[scCur] = r;
    clearTimeout(ritLoc); ritLoc = setTimeout(rendiBoard, 60);
  });

  /* ---------- aggancio a scheda (costruzione e salvataggio) ---------- */
  if(typeof scBuild === "function"){
    var _build = scBuild;
    scBuild = function(){
      var out = _build.apply(this, arguments);
      try { base[scCur] = firma(daScheda(scCur)); delete locali[scCur]; rendiScheda(); rendiBoard(); } catch(e){ console.error(e); }
      return out;
    };
  }
  if(typeof scSave === "function"){
    var _save = scSave;
    scSave = function(){
      var k = scCur, out = _save.apply(this, arguments);
      try {
        var f = firma(daScheda(k));
        if(f && f !== base[k]){ base[k] = f; accoda(k); }
      } catch(e){ console.error(e); }
      return out;
    };
  }

  /* ---------- avvio ---------- */
  CH.forEach(function(k){ base[k] = firma(daScheda(k)); });
  function avvia(){
    rendiScheda(); rendiBoard();
    var sez = [$("gruppo"), $("scheda")].filter(Boolean);
    if("IntersectionObserver" in window && sez.length){
      var vis = {};
      var io = new IntersectionObserver(function(en){
        en.forEach(function(x){ vis[x.target.id] = x.isIntersecting; });
        var prima = inVista; inVista = Object.keys(vis).some(function(k){ return vis[k]; });
        if(inVista && !prima && Date.now() - ultimoOk > 5000) leggi().then(prossimo); else if(inVista !== prima) prossimo();
      }, { rootMargin: "200px 0px" });
      sez.forEach(function(s){ io.observe(s); });
    }
    leggi().then(prossimo);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia); else avvia();
})();
