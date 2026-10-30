/* Stiva della nave — il magazzino comune del gruppo, l'Equipaggiamento della scheda e la riserva della Nave.

   DOVE STANNO I DATI
   - Nel repository privato Zzago-DM/gruppo (lo stesso del quadro «Il Gruppo»), file stiva.json:
       str    { chiave: quantità }  tonici, piloni e nuclei elementali (chiavi dei nuclei: n-att-<elemento>, n-def-<elemento>)
       parti  [ { b: Behemoth, m: materiale, r: rarità, q: quantità } ]
       vari   testo libero «Oggetti vari», comune ai tre
       grande testo libero «Equipaggiamento grande trasportato» (riquadro sotto la mappa della Nave)
       disp   giorni di viveri per tutto il gruppo (i mezzi giorni si arrotondano per difetto)
   - Leggere e scrivere usa i token che il sito ha già: quello del personaggio con l'area aperta, altrimenti quello del Master.
     Tutti e quattro i token includono già «gruppo»: non serve preparare niente.
   - Ogni cambio rilegge il file, applica la modifica e lo salva; se intanto qualcun altro l'ha salvato, riprova.
     I clic veloci su + e − si raccolgono e partono insieme dopo un attimo (una sola modifica su GitHub).
   - Mentre la stanza, la scheda o il capitolo del Master sono sullo schermo, la stiva si rilegge ogni pochi secondi.

   COSA C'È IN QUESTO FILE
   1. la stiva condivisa (window.STV), usata anche dal capitolo del Master (js/master-stiva.js);
   2. la stanza della Stiva (Nave › Stiva Primaria › «Apri la stiva»): Strumenti, Parti di mostro, Oggetti vari, Dispensa;
   3. il riquadro sotto la mappa della Nave (Equipaggiamento grande e Dispensa), ora comune a tutti;
   4. l'Equipaggiamento della scheda: slot fisso con 5 tonici di Salute, 3 slot (5 tonici o 2 piloni di un solo tipo)
      e fino a 3 nuclei di ricambio. Ogni oggetto arriva «Dalla stiva» (il numero in stiva scende) o «Negozio» (gratis,
      non tocca la stiva). Lo stato sta nella scheda del personaggio (campo eq2), quindi segue il suo salvataggio online. */
(function(){
  "use strict";
  var OWNER = "Zzago-DM", REPO = OWNER + "/gruppo", FILE = "stiva.json", API = "https://api.github.com/repos/";
  var PG = (typeof SC_CHARS !== "undefined" ? SC_CHARS : []);
  var CH = PG.map(function(c){ return c.k; });

  /* ---------- catalogo ---------- */
  var IT = [
    { id: "salute",      n: "Tonico di Salute",      b: "Salute",      g: "base", k: "t", c: "#d04848", e: "Recuperi 1D6 PV. Dura 1 turno." },
    { id: "resistenza",  n: "Tonico di Resistenza",  b: "Resistenza",  g: "base", k: "t", c: "#c89040", e: "+2 COST per 1 turno." },
    { id: "stamina",     n: "Tonico di Stamina",     b: "Stamina",     g: "base", k: "t", c: "#4fae74", e: "+2 DES per 1 turno." },
    { id: "assalto",     n: "Tonico d'Assalto",      b: "Assalto",     g: "base", k: "t", c: "#e07030", e: "+2 FOR per 1 turno." },
    { id: "aether",      n: "Tonico d'Aether",       b: "Aether",      g: "avanzati", k: "t", c: "#9a68e0", e: "+1 token elementale e +2 DES. Dura 3 turni." },
    { id: "frenesia",    n: "Tonico di Frenesia",    b: "Frenesia",    g: "avanzati", k: "t", c: "#f0502e", e: "+4 FOR; quando finisce, nel turno successivo non puoi agire. Dura 3 turni." },
    { id: "antidoto",    n: "Antidoto",              b: "Antidoto",    g: "avanzati", k: "t", c: "#4fb8a8", e: "+2 COST; se hai uno stato aetherico lo fa finire o lo riduce. Dura 3 turni." },
    { id: "rubavita",    n: "Tonico Rubavita",       b: "Rubavita",    g: "avanzati", k: "t", c: "#b0283f", e: "Perdi 1 PV a turno, ma recuperi 5 PV ogni volta che attacchi il mostro. Dura 3 turni." },
    { id: "ripulente",   n: "Pilone Ripulente",      b: "Ripulente",   g: "piloni", k: "p", c: "#5ab4d8", e: "Nell'area 5×5 i malus aetherici smettono di peggiorare. Dura 3 turni." },
    { id: "inamovibile", n: "Pilone Inamovibile",    b: "Inamovibile", g: "piloni", k: "p", c: "#b89a68", e: "Immunità a sbalzi e stordimento; se vieni atterrato puoi attaccare ancora una volta. Dura 3 turni." },
    { id: "ispirazione", n: "Pilone d'Ispirazione",  b: "Ispirazione", g: "piloni", k: "p", c: "#e0c050", e: "Chi è atterrato nell'area, o sta per cadere, torna in assetto prima del colpo fatale. Dura 3 turni." },
    { id: "accogliente", n: "Pilone Accogliente",    b: "Accogliente", g: "piloni", k: "p", c: "#4fc878", e: "Cura 4 PV a turno a chiunque sia nell'area 5×5. Dura 3 turni." }
  ];
  var GRUPPI = [["base", "Tonici base", "durano 1 turno"], ["avanzati", "Tonici avanzati", "durano 3 turni"], ["piloni", "Piloni", "area 5×5 · durano 3 turni"]];
  var EL = [
    { id: "glaciale", n: "Glaciale", c: "#7ec8e3" }, { id: "ardente", n: "Ardente", c: "#e05a20" }, { id: "folgorante", n: "Folgorante", c: "#e8c820" },
    { id: "terrestre", n: "Terrestre", c: "#4a9640" }, { id: "radiante", n: "Radiante", c: "#d4a8ff" }, { id: "oscuro", n: "Oscuro", c: "#8860d0" }
  ];
  var NUC = {
    att: { n: "Attacco", sel: "sc-natt-s", e: "+2 danni contro l'elemento opposto e può applicare il suo malus." },
    def: { n: "Difesa",  sel: "sc-ndef-s", e: "Riduce di ¼ i danni del suo elemento e aumenta di ¼ quelli dell'elemento opposto." }
  };
  var RIC_MAX = 3;
  function it(id){ for(var i = 0; i < IT.length; i++) if(IT[i].id === id) return IT[i]; return null; }
  function el(id){ for(var i = 0; i < EL.length; i++) if(EL[i].id === id) return EL[i]; return null; }
  function nid(t, e){ return "n-" + t + "-" + e; }
  function cap(x){ return x && x.k === "p" ? 2 : 5; }
  function chiavi(){ var k = IT.map(function(x){ return x.id; }); ["att", "def"].forEach(function(t){ EL.forEach(function(e){ k.push(nid(t, e.id)); }); }); return k; }
  function nomeChiave(id){
    var x = it(id); if(x) return x.n;
    var m = /^n-(att|def)-(\w+)$/.exec(id || ""); if(m && el(m[2])) return "Nucleo di " + NUC[m[1]].n.toLowerCase() + " " + el(m[2]).n;
    return id;
  }

  /* ---------- utilità ---------- */
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function leggiJ(key){ try { return JSON.parse(localStorage.getItem(key) || "null") || {}; } catch(e){ return {}; } }
  function suono(n){ try { if(typeof sfxPlay === "function") sfxPlay(n); } catch(e){} }
  function avviso(t, err){
    var d = document.createElement("div"); d.className = "gh-toast on" + (err ? " err" : ""); d.setAttribute("role", "status"); d.textContent = t;
    document.body.appendChild(d); setTimeout(function(){ d.classList.remove("on"); setTimeout(function(){ d.remove(); }, 400); }, err ? 6000 : 2800);
  }
  function int(v){ v = parseInt(v, 10); return isNaN(v) || v < 0 ? 0 : v; }
  function breve(k){ if(k === "master") return "il Master"; for(var i = 0; i < PG.length; i++) if(PG[i].k === k) return PG[i].n; return k || "qualcuno"; }
  function aperto(k){ try { return typeof paIsOpen === "function" && paIsOpen(k); } catch(e){ return false; } }
  /* chi sta usando questo dispositivo: il personaggio con l'area aperta, altrimenti il Master se c'è il suo token */
  function chiAgisce(){
    var cur = (typeof scCur !== "undefined") ? scCur : null;
    if(cur && aperto(cur) && tokPg(cur)) return cur;
    for(var i = 0; i < CH.length; i++) if(aperto(CH[i]) && tokPg(CH[i])) return CH[i];
    if(tokMaster()) return "master";
    if(cur && aperto(cur)) return cur;
    return null;
  }

  /* ---------- GitHub (come js/gruppo.js e js/reliquie-bacheca.js) ---------- */
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

  /* ---------- il documento ---------- */
  function norm(d){
    d = d && typeof d === "object" ? d : {};
    var s = d.str && typeof d.str === "object" ? d.str : {}, o = {};
    chiavi().forEach(function(k){ o[k] = int(s[k]); });
    Object.keys(s).forEach(function(k){ if(!(k in o)) o[k] = int(s[k]); });   /* oggetti che il sito non conosce ancora: si tengono */
    d.str = o;
    d.parti = (Array.isArray(d.parti) ? d.parti : []).filter(function(p){ return p && p.m && int(p.q) > 0; }).map(function(p){ return { b: String(p.b || ""), m: String(p.m), r: String(p.r || "Comune"), q: int(p.q) }; });
    d.vari = typeof d.vari === "string" ? d.vari : "";
    d.grande = typeof d.grande === "string" ? d.grande : "";
    d.disp = int(d.disp);
    return d;
  }
  /* la prima volta che la stiva viene creata porta con sé ciò che questo dispositivo aveva nel vecchio riquadro della Nave */
  function seme(){
    var v = leggiJ("tcj-nave");
    return norm({ app: "the-careless-journey", tipo: "stiva", v: 1, grande: typeof v.equip === "string" ? v.equip : "", disp: int(v.disp) });
  }
  var doc = norm(leggiJ("tcjstv_cache"));
  if(!leggiJ("tcjstv_cache").str) doc = seme();
  var etag = null, stato = tokLettura() ? "attesa" : "notoken", leggendo = false, timer = null, guardie = {};
  var ASC = [];
  function avvisaTutti(){ ASC.forEach(function(f){ try { f(doc); } catch(e){ console.error(e); } }); }
  function ricevi(d, salvato){
    doc = norm(d);
    /* le modifiche in coda o in viaggio (clic veloci) restano visibili finché GitHub non le ha salvate */
    (salvato ? coda : volo.concat(coda)).forEach(function(op){ try { op.fn(doc); } catch(e){} });
    try { localStorage.setItem("tcjstv_cache", JSON.stringify(doc)); } catch(e){}
    avvisaTutti();
  }
  function segnala(s){ stato = s; avvisaTutti(); }

  function leggi(){
    if(leggendo) return Promise.resolve(); leggendo = true;
    var tok = tokLettura();
    if(!tok){ leggendo = false; segnala("notoken"); return Promise.resolve(); }
    var ex = { "Accept": "application/vnd.github.raw+json" }; if(etag) ex["If-None-Match"] = etag;
    return gh(tok, "GET", "/contents/" + FILE, null, ex).then(function(r){
      if(r.status === 304){ if(stato !== "ok") segnala("ok"); return; }
      if(r.ok){ etag = r.headers.get("ETag"); return r.text().then(function(t){ var j = null; try { j = JSON.parse(t); } catch(e){} if(j){ stato = "ok"; ricevi(j); } else segnala("ok"); }); }
      if(r.status === 404) return gh(tok, "GET", "").then(function(r2){ if(r2.ok){ stato = "ok"; ricevi(seme()); } else segnala("noaccesso"); });
      if(r.status === 401) return segnala("tokenko");
      segnala(r.status === 403 || r.status === 429 ? "limite" : "errore");
    }).catch(function(){ segnala("rete"); }).then(function(){ leggendo = false; });
  }
  function qualcunoGuarda(){ for(var k in guardie) if(guardie[k]) return true; return false; }
  function prossimo(){
    clearTimeout(timer);
    if(!qualcunoGuarda() || document.hidden || !tokLettura()) return;
    timer = setTimeout(function(){ leggi().then(prossimo); }, (stato === "noaccesso" || stato === "tokenko") ? 20000 : (guardie.stanza ? 4000 : 6000));
  }
  function guarda(chi, on){
    var prima = qualcunoGuarda(); guardie[chi] = !!on;
    if(on && !prima) leggi().then(prossimo);
    else if(!qualcunoGuarda()) clearTimeout(timer);
  }
  document.addEventListener("visibilitychange", function(){ if(!document.hidden && qualcunoGuarda()) leggi().then(prossimo); else clearTimeout(timer); });

  /* legge stiva.json, lo cambia con fn(d) e lo salva; fn restituisce il messaggio della modifica, oppure false per non salvare */
  function modifica(tok, fn, tent){
    tent = tent || 0;
    return gh(tok, "GET", "/contents/" + FILE).then(function(r){
      if(r.status === 404) return { d: seme(), sha: null };
      if(!r.ok) throw r;
      return r.json().then(function(j){
        var c = j.content ? Promise.resolve(j.content) : gh(tok, "GET", "/git/blobs/" + j.sha).then(function(x){ return x.json(); }).then(function(b){ return b.content; });
        return c.then(function(b64){ var d = {}; try { d = JSON.parse(b64d(b64)); } catch(e){} return { d: d, sha: j.sha }; });
      });
    }).then(function(o){
      var d = norm(o.d);
      var msg = fn(d);
      if(!msg){ ricevi(d, true); return { ok: false, d: d }; }
      d.app = "the-careless-journey"; d.tipo = "stiva"; d.v = 1; d.agg = new Date().toISOString();
      var corpo = { message: msg, content: b64e(JSON.stringify(d, null, 1)) };
      if(o.sha) corpo.sha = o.sha;
      return gh(tok, "PUT", "/contents/" + FILE, corpo).then(function(r){
        if((r.status === 409 || r.status === 422) && tent < 5) return aspetta(300 + tent * 450).then(function(){ return modifica(tok, fn, tent + 1); });
        if(!r.ok) throw r;
        etag = null; stato = "ok"; ricevi(d, true); return { ok: true, d: d };
      });
    });
  }
  function msgErrore(e){
    var st = e && e.status;
    return st === 404 ? "Stiva non aggiornata: il token non vede il repository «gruppo»."
      : st === 401 ? "Stiva non aggiornata: il token non è più valido, chiedine uno nuovo al Master."
      : st === 403 ? "Stiva non aggiornata: il token non ha il permesso di scrivere su «gruppo»."
      : "Stiva non aggiornata: controlla la connessione e riprova.";
  }
  var SENZA_TOKEN = "Per cambiare la stiva collega il salvataggio online nella tua Area dello Slayer.";
  /* un cambio subito, che aspetta la risposta (prendere dalla stiva, riporre) */
  function cambia(chi, fn){
    var tok = tokScrittura(chi);
    if(!tok){ avviso(SENZA_TOKEN, true); return Promise.resolve({ ok: false }); }
    return svuota().then(function(){ return modifica(tok, fn); }).catch(function(e){ avviso(msgErrore(e), true); leggi(); return { ok: false, err: true }; });
  }
  /* i clic veloci (+ e −, testi): si vedono subito e partono insieme dopo un attimo */
  var coda = [], volo = [], tCoda = null, inVolo = null;
  function accoda(chi, fn, msg){
    if(!tokScrittura(chi)){ avviso(SENZA_TOKEN, true); return false; }
    coda.push({ chi: chi, fn: fn, msg: msg });
    fn(doc); avvisaTutti();
    clearTimeout(tCoda); tCoda = setTimeout(svuota, 800);
    return true;
  }
  function svuota(){
    clearTimeout(tCoda); tCoda = null;
    if(inVolo) return inVolo.then(svuota);
    if(!coda.length) return Promise.resolve();
    var ops = coda.splice(0), tok = tokScrittura(ops[0].chi);
    var msgs = []; ops.forEach(function(o){ if(o.msg && msgs.indexOf(o.msg) < 0) msgs.push(o.msg); });
    var testo = "Stiva · " + breve(ops[0].chi) + ": " + (msgs.length > 4 ? msgs.slice(0, 4).join(", ") + "…" : msgs.join(", "));
    volo = ops;
    inVolo = modifica(tok, function(d){ ops.forEach(function(o){ o.fn(d); }); return testo; })
      .catch(function(e){ volo = []; avviso(msgErrore(e), true); etag = null; return leggi(); })
      .then(function(){ volo = []; inVolo = null; });
    return inVolo;
  }
  window.addEventListener("pagehide", function(){ if(coda.length) svuota(); });

  window.STV = {
    IT: IT, EL: EL, NUC: NUC, GRUPPI: GRUPPI, it: it, el: el, nid: nid, nome: nomeChiave, chiavi: chiavi,
    doc: function(){ return doc; }, q: function(id){ return int(doc.str[id]); },
    stato: function(){ return stato; }, leggi: leggi, guarda: guarda, chi: chiAgisce,
    on: function(f){ ASC.push(f); }, cambia: cambia, accoda: accoda, puoScrivere: function(){ return !!tokScrittura(chiAgisce()); },
    breve: breve, avviso: avviso
  };

  var MSG = {
    ok: "In diretta · la vedono tutti",
    attesa: "Apro la stiva…",
    notoken: "Collega il salvataggio online nella tua Area dello Slayer per vedere la stiva aggiornata e cambiarla. Qui c'è l'ultima copia salvata su questo dispositivo.",
    noaccesso: "La stiva non è raggiungibile: il token di questo dispositivo non include il repository «gruppo».",
    tokenko: "Il token di questo dispositivo non è più valido: chiedine uno nuovo al Master.",
    limite: "GitHub chiede di rallentare: la stiva si aggiorna tra poco.",
    rete: "Connessione assente: qui c'è l'ultima copia salvata.",
    errore: "Non riesco a leggere la stiva adesso. Riprovo tra poco."
  };
  window.STV.messaggio = function(){ return MSG[stato] || ""; };

  /* ---------- disegni comuni ---------- */
  function boccetta(x, liv){ return '<span class="stv-jar" style="--c:' + x.c + ';--lv:' + (liv == null ? .75 : liv) + '" aria-hidden="true"></span>'; }
  function pilone(x){ return '<span class="stv-pyl" style="--c:' + x.c + '" aria-hidden="true"></span>'; }
  function sfera(e, cls){ return '<span class="stv-orb' + (cls ? " " + cls : "") + '" style="--c:' + e.c + '" aria-hidden="true"></span>'; }
  function figura(x, liv){ return x.k === "p" ? pilone(x) : boccetta(x, liv); }
  function contatore(az, id, v, et){
    return '<span class="stv-cnt"><button type="button" data-az="' + az + '" data-id="' + esc(id) + '" data-d="-1" aria-label="Togli uno: ' + esc(et) + '">−</button>'
      + '<b>' + v + '</b><button type="button" data-az="' + az + '" data-id="' + esc(id) + '" data-d="1" aria-label="Aggiungi uno: ' + esc(et) + '">+</button></span>';
  }
  window.STV.disegno = { boccetta: boccetta, pilone: pilone, sfera: sfera, figura: figura, contatore: contatore, esc: esc };

  /* =====================================================================
     2. LA STANZA DELLA STIVA (Nave › Stiva Primaria)
     ===================================================================== */
  var ov = document.createElement("div");
  ov.className = "stv-ov"; ov.hidden = true;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "stv-t");
  ov.innerHTML = '<div class="stv-sala"><div class="stv-lume" aria-hidden="true"></div>'
    + '<div class="stv-top"><div><div class="stv-k">Careless Journey · 4° piano di poppa</div><h3 class="stv-t" id="stv-t">Stiva Primaria</h3></div>'
    + '<button type="button" class="mae-x stv-x" id="stv-x" aria-label="Esci dalla stiva">✕</button></div>'
    + '<p class="stv-sub">Odore di catrame, di erbe secche e di legno umido. Le casse scricchiolano a ogni beccheggio della nave.</p>'
    + '<div class="stv-box" id="stv-box"><div class="stv-stato" id="stv-stato" aria-live="polite"></div>'
    + '<div class="stv-pills" role="tablist">'
    + '<button type="button" class="stv-pill on" role="tab" aria-selected="true" data-s="str">🧪 Strumenti</button>'
    + '<button type="button" class="stv-pill" role="tab" aria-selected="false" data-s="par">🦴 Parti di mostro</button>'
    + '<button type="button" class="stv-pill" role="tab" aria-selected="false" data-s="var">📦 Oggetti vari</button>'
    + '<button type="button" class="stv-pill" role="tab" aria-selected="false" data-s="dis">🍞 Dispensa</button></div>'
    + '<div class="stv-corpo" id="stv-corpo">'
    + '<div class="stv-sp on" id="stv-s-str"></div>'
    + '<div class="stv-sp" id="stv-s-par"><label class="stv-lbl" for="stv-beh">Behemoth affrontato</label><select class="stv-sel" id="stv-beh"></select>'
    + '<p class="stv-nota">Toccate ＋ sulle parti che avete ottenuto: finiscono nel deposito qui sotto. Quando le vendete o le regalate, toglietele con − o ✕.</p>'
    + '<div class="stv-parts" id="stv-parts"></div><div class="stv-dep"><div class="stv-lbl">Nel deposito</div><div id="stv-dep"></div></div></div>'
    + '<div class="stv-sp" id="stv-s-var"><label class="stv-lbl" for="stv-vari">Oggetti vari · comune a tutto il gruppo</label>'
    + '<textarea class="stv-vari" id="stv-vari" maxlength="6000" placeholder="Corde, lanterne, attrezzi, lettere, ricordi… tutto quello che il gruppo tiene in stiva."></textarea></div>'
    + '<div class="stv-sp" id="stv-s-dis"><div class="stv-disp"><div class="stv-pila" id="stv-pila" aria-hidden="true"></div><div class="stv-disp-x">'
    + '<div class="stv-disp-n" id="stv-disp-n">0</div><div class="stv-disp-l">giorni di viveri<br>per tutto il gruppo</div>'
    + '<div class="stv-disp-c" id="stv-disp-c"></div></div></div>'
    + '<p class="stv-nota" style="text-align:center">Ogni giorno di viaggio la dispensa scende di 1. I mezzi giorni si arrotondano per difetto: il gruppo ha razionato.</p></div>'
    + '</div></div></div>';
  document.body.appendChild(ov);
  var sezione = "str", behScelto = null;
  var box = ov.querySelector("#stv-box"), inNave = false;   /* il contenuto della stanza: nella finestra o nella pagina della nave (js/nave-stiva.js) */

  function statoStanza(){
    var w = $("stv-stato"); if(!w) return;
    w.textContent = MSG[stato] || ""; w.setAttribute("data-s", stato === "ok" ? "ok" : stato === "attesa" ? "att" : "ko");
  }
  function strumenti(){
    var s = $("stv-s-str"); if(!s) return;
    var h = GRUPPI.map(function(g){
      return '<div class="stv-ripiano"><div class="stv-rt">' + g[1] + ' <small>' + g[2] + '</small></div><div class="stv-fila">'
        + IT.filter(function(x){ return x.g === g[0]; }).map(function(x){
          var q = int(doc.str[x.id]);
          return '<div class="stv-it' + (q ? "" : " zero") + '">' + figura(x, Math.min(q, 8) / 8)
            + '<div class="stv-it-i"><div class="stv-it-n">' + esc(x.b) + (q ? "" : '<span class="stv-esaurito">esaurito</span>') + '</div>'
            + '<div class="stv-it-e">' + esc(x.e) + '</div>' + contatore("str", x.id, q, x.n) + '</div></div>';
        }).join("") + '</div><div class="stv-asse" aria-hidden="true"></div></div>';
    }).join("");
    h += ["att", "def"].map(function(t){
      return '<div class="stv-ripiano"><div class="stv-rt">Nuclei di ' + NUC[t].n.toLowerCase() + ' <small>' + esc(NUC[t].e) + '</small></div><div class="stv-fila stv-fila-n">'
        + EL.map(function(e){
          var k = nid(t, e.id), q = int(doc.str[k]);
          return '<div class="stv-it' + (q ? "" : " zero") + '">' + sfera(e) + '<div class="stv-it-i"><div class="stv-it-n">' + e.n + (q ? "" : '<span class="stv-esaurito">esaurito</span>') + '</div>'
            + contatore("str", k, q, "Nucleo di " + NUC[t].n.toLowerCase() + " " + e.n) + '</div></div>';
        }).join("") + '</div><div class="stv-asse" aria-hidden="true"></div></div>';
    }).join("");
    s.innerHTML = h;
  }
  function behemoth(){
    var sel = $("stv-beh"); if(!sel || sel.options.length) return;
    var B = (typeof PL_BEHEMOTHS !== "undefined" ? PL_BEHEMOTHS : []), gr = {}, ord = [];
    B.forEach(function(b){ if(!gr[b.aether]){ gr[b.aether] = []; ord.push(b.aether); } gr[b.aether].push(b.nome); });
    sel.innerHTML = '<option value="">— Scegli il Behemoth —</option>' + ord.map(function(a){
      return '<optgroup label="' + esc(a) + '">' + gr[a].map(function(n){ return '<option>' + esc(n) + '</option>'; }).join("") + '</optgroup>';
    }).join("");
    if(behScelto) sel.value = behScelto;
  }
  function parti(){
    var box = $("stv-parts"); if(!box) return;
    var n = behScelto, D = (typeof PL_DROPS !== "undefined" ? PL_DROPS : {}), d = n && D[n];
    if(!d){ box.innerHTML = ""; return; }
    var R = (d.p || []).map(function(p){ return { l: p.l, m: p.m, r: p.r }; }).concat((d.k || []).map(function(k){ return { l: "Uccisione", m: k.m, r: k.r }; }));
    box.innerHTML = R.map(function(p){
      return '<div class="stv-pt"><div><div class="stv-pt-l">' + esc(p.l) + '</div><div class="stv-pt-m">' + esc(p.m) + '<span class="stv-r stv-r-' + esc(p.r) + '">' + esc(p.r) + '</span></div></div>'
        + '<button type="button" class="stv-add" data-az="parte+" data-m="' + esc(p.m) + '" data-r="' + esc(p.r) + '" aria-label="Aggiungi ' + esc(p.m) + ' al deposito">＋</button></div>';
    }).join("");
  }
  function deposito(){
    var box = $("stv-dep"); if(!box) return;
    var P = doc.parti || [];
    box.innerHTML = P.length ? P.map(function(p, i){
      return '<div class="stv-dr"><div class="stv-dr-i"><div class="stv-pt-m">' + esc(p.m) + '<span class="stv-r stv-r-' + esc(p.r) + '">' + esc(p.r) + '</span></div><div class="stv-pt-l">da ' + esc(p.b) + '</div></div>'
        + contatore("parte", i, p.q, p.m)
        + '<button type="button" class="stv-via" data-az="parte-via" data-id="' + i + '" title="Venduta o regalata" aria-label="Togli ' + esc(p.m) + ' dal deposito">✕</button></div>';
    }).join("") : '<p class="stv-nota">Il deposito è vuoto.</p>';
  }
  var variScrivendo = false;
  function vari(){ var t = $("stv-vari"); if(t && !variScrivendo && document.activeElement !== t && t.value !== doc.vari) t.value = doc.vari; }
  /* la pila della dispensa: un barile o una cassa per ogni giorno di viveri, fino a 99 visibili.
     Il tipo e la posa di ogni pezzo dipendono solo dalla sua posizione, quindi la pila è sempre la stessa per tutti;
     quando il numero sale i pezzi nuovi cadono dall'alto, quando scende gli ultimi spariscono. */
  var PILA_MAX = 99;
  function caso(i){ var h = Math.imul((i + 1) ^ 0x5bd1e995, 2654435761) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }
  function pezzo(i, nuovo, ritardo){
    var r = caso(i), tipo = r % 5 < 3 ? "b" : (r % 5 === 3 ? "c" : "c c2");
    return '<i class="stv-pz ' + tipo + (nuovo ? " nuovo" : "") + '" style="--r:' + (((r >>> 5) % 9) - 4) + 'deg;--y:' + (((r >>> 9) % 4) - 1) + 'px;--d:' + ritardo + 'ms"></i>';
  }
  function pila(box, n){
    if(!box) return;
    var vis = Math.min(n, PILA_MAX), prima = box._n;
    if(prima === vis && box._tot === n) return;
    clearTimeout(box._t);
    if(prima != null && vis < prima){
      var ch = box.querySelectorAll(".stv-pz");
      for(var j = vis; j < ch.length; j++) ch[j].classList.add("via");
      box._n = vis; box._tot = n;
      box._t = setTimeout(function(){ disegnaPila(box, n, vis); }, 280);
      return;
    }
    var da = prima == null ? vis : prima;
    box._n = vis; box._tot = n;
    disegnaPila(box, n, da);
  }
  function disegnaPila(box, n, da){
    var vis = Math.min(n, PILA_MAX), h = "";
    for(var i = 0; i < vis; i++) h += pezzo(i, i >= da, Math.min(900, (i - da) * 70));
    if(n > PILA_MAX) h += '<span class="stv-pila-piu">+' + (n - PILA_MAX) + '</span>';
    if(!n) h = '<span class="stv-pila-vuota">Nessun barile: la dispensa è vuota</span>';
    box.innerHTML = h;
  }
  function dispensa(){
    pila($("stv-pila"), doc.disp);
    var n = $("stv-disp-n"); if(n) n.textContent = doc.disp;
    var c = $("stv-disp-c"); if(c) c.innerHTML = contatore("disp", "disp", doc.disp, "giorni di viveri");
  }
  function stanza(){ if(ov.hidden && !inNave) return; statoStanza(); strumenti(); deposito(); vari(); dispensa(); }
  STV.on(stanza);

  function vaiSezione(s, muto){
    sezione = s;
    box.querySelectorAll(".stv-pill").forEach(function(b){ var on = b.getAttribute("data-s") === s; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
    box.querySelectorAll(".stv-sp").forEach(function(p){ p.classList.toggle("on", p.id === "stv-s-" + s); });
    if(s === "par"){ behemoth(); parti(); }
    if(!muto) suono("paper");
  }
  function apri(){
    ov.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    stanza(); vaiSezione(sezione); suono("gong");
    guarda("stanza", true);
    setTimeout(function(){ try { $("stv-x").focus(); } catch(_){} }, 60);
  }
  function chiudi(){
    guarda("stanza", false); svuota();
    ov.classList.remove("on"); setTimeout(function(){ if(!ov.classList.contains("on")) ov.hidden = true; }, 260);
    if(!document.querySelector(".inc-win.on,.cj-overlay.open,.rel-ov.on,.nx-ov.on")) document.body.style.overflow = "";
  }
  window.stvApri = function(s){
    try { if(typeof nvClose === "function") nvClose(); } catch(_){}
    if(s && $("stv-s-" + s)) sezione = s;
    if(STV.nave && window.NAVE){ if(inNave) vaiSezione(sezione); else NAVE.vai("stiva_primaria"); return; }   /* la Stiva Primaria della pagina della nave */
    apri();
  };
  /* la pagina della nave (js/nave-stiva.js) porta il contenuto della stanza nel suo pannello di destra, e lo riporta qui all'uscita */
  STV.stanzaMonta = function(dest){ if(ov.classList.contains("on")) chiudi(); dest.appendChild(box); inNave = true; stanza(); vaiSezione(sezione, true); guarda("stanza", true); };
  STV.stanzaSmonta = function(){ if(!inNave) return; guarda("stanza", false); svuota(); inNave = false; ov.querySelector(".stv-sala").appendChild(box); };
  STV.sezione = function(s){ if(s && $("stv-s-" + s)) vaiSezione(s); };

  /* cambi dalla stanza e dal riquadro della Nave */
  function cambiaStr(id, d){
    var chi = chiAgisce(), nome = nomeChiave(id);
    accoda(chi, function(x){ x.str[id] = Math.max(0, int(x.str[id]) + d); }, (d > 0 ? "+" : "−") + " " + nome);
  }
  function cambiaDisp(d){
    accoda(chiAgisce(), function(x){ x.disp = Math.max(0, int(x.disp) + d); }, "dispensa " + (d > 0 ? "+1" : "−1"));
  }
  function aggiungiParte(m, r){
    var b = behScelto;
    if(accoda(chiAgisce(), function(x){
      var f = null; x.parti.forEach(function(p){ if(p.b === b && p.m === m) f = p; });
      if(f) f.q = int(f.q) + 1; else x.parti.push({ b: b, m: m, r: r, q: 1 });
    }, "+ " + m)){ suono("paper"); avviso(m + " è nel deposito"); }
  }
  function cambiaParte(i, d){
    var p = (doc.parti || [])[i]; if(!p) return;
    var b = p.b, m = p.m;
    accoda(chiAgisce(), function(x){
      x.parti.forEach(function(y){ if(y.b === b && y.m === m) y.q = Math.max(0, int(y.q) + d); });
      x.parti = x.parti.filter(function(y){ return int(y.q) > 0; });
    }, (d > 0 ? "+ " : "− ") + m);
  }
  var tVari = null;
  function scriviVari(v){
    clearTimeout(tVari); variScrivendo = true;
    tVari = setTimeout(function(){ variScrivendo = false; accoda(chiAgisce(), function(x){ x.vari = v; }, "oggetti vari"); }, 1200);
  }
  ov.addEventListener("click", function(e){
    if(e.target === ov){ chiudi(); return; }
    if(e.target.closest("#stv-x")){ chiudi(); return; }
  });
  box.addEventListener("click", function(e){
    var t = e.target;
    var p = t.closest(".stv-pill"); if(p){ vaiSezione(p.getAttribute("data-s")); return; }
    var b = t.closest("[data-az]"); if(!b) return;
    var az = b.getAttribute("data-az"), id = b.getAttribute("data-id"), d = parseInt(b.getAttribute("data-d"), 10) || 0;
    if(az === "str") cambiaStr(id, d);
    else if(az === "disp") cambiaDisp(d);
    else if(az === "parte+") aggiungiParte(b.getAttribute("data-m"), b.getAttribute("data-r"));
    else if(az === "parte") cambiaParte(parseInt(id, 10), d);
    else if(az === "parte-via") cambiaParte(parseInt(id, 10), -9999);
  });
  box.addEventListener("change", function(e){ if(e.target.id === "stv-beh"){ behScelto = e.target.value || null; parti(); } });
  box.addEventListener("input", function(e){ if(e.target.id === "stv-vari") scriviVari(e.target.value); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !ov.hidden && !eqOv.classList.contains("on")) chiudi(); });

  /* =====================================================================
     3. IL RIQUADRO SOTTO LA MAPPA DELLA NAVE (Equipaggiamento grande e Dispensa)
     ===================================================================== */
  var grandeScrivendo = false, tGrande = null;
  function riquadroNave(){
    var g = $("nv-equip-grande");
    if(g && !grandeScrivendo && document.activeElement !== g && g.value !== doc.grande) g.value = doc.grande;
    var dsp = $("nv-res-disp"); if(dsp) dsp.textContent = doc.disp;
    pila($("nv-pila"), doc.disp);
    var n = 0; Object.keys(doc.str).forEach(function(k){ n += int(doc.str[k]); });
    var pz = 0; (doc.parti || []).forEach(function(p){ pz += int(p.q); });
    var r = $("nv-stv-ries"); if(r) r.textContent = n + (n === 1 ? " strumento" : " strumenti") + " · " + pz + (pz === 1 ? " parte di mostro" : " parti di mostro");
    var s = $("nv-stv-stato"); if(s){ s.textContent = stato === "ok" ? "In diretta · comune a tutto il gruppo" : (MSG[stato] || ""); s.setAttribute("data-s", stato === "ok" ? "ok" : "ko"); }
  }
  STV.on(riquadroNave);
  window.nvReserve = function(k, d){ if(k === "disp") cambiaDisp(d); };
  window.nvSave = function(){
    var g = $("nv-equip-grande"); if(!g) return;
    clearTimeout(tGrande); grandeScrivendo = true;
    var v = g.value;
    tGrande = setTimeout(function(){ grandeScrivendo = false; accoda(chiAgisce(), function(x){ x.grande = v; }, "equipaggiamento grande"); }, 1200);
  };
  /* la Nave si guarda in diretta solo quando il riquadro è sullo schermo */
  (function(){
    var box = $("nv-reserve-box") || $("nv-equip-grande"); if(!box) return;
    if(window.IntersectionObserver) new IntersectionObserver(function(en){ guarda("nave", en[0].isIntersecting); }).observe(box);
    riquadroNave();
  })();

  /* =====================================================================
     4. L'EQUIPAGGIAMENTO DELLA SCHEDA
     ===================================================================== */
  function eqVuoto(){ return { sal: 5, slots: [null, null, null], ric: [null, null, null] }; }
  function eqNorm(o){
    o = o && typeof o === "object" ? o : eqVuoto();
    var n = eqVuoto();
    n.sal = Math.min(5, int(o.sal != null ? o.sal : 5));
    for(var i = 0; i < 3; i++){
      var s = (o.slots || [])[i];
      if(s && it(s.id) && int(s.q) > 0){ var q = Math.min(cap(it(s.id)), int(s.q)), st = Math.min(q, int(s.st)); n.slots[i] = { id: s.id, q: q, st: st, ng: q - st }; }
      var r = (o.ric || [])[i];
      if(r && NUC[r.t] && el(r.e)) n.ric[i] = { t: r.t, e: r.e, src: r.src === "st" ? "st" : "ng" };
    }
    if(Array.isArray(o.vecchio)) n.vecchio = o.vecchio.filter(function(v){ return v && v.t; });
    return n;
  }
  /* testo dell'equipaggiamento per la vista in diretta del Master e per il confronto dei salvataggi */
  window.eqTesto = function(sc){
    var o = sc && sc.eq2 ? eqNorm(sc.eq2) : null, R = [];
    if(!o){
      (sc && sc.eq_txt || []).forEach(function(t, i){ t = String(t || "").trim(); var n = String((sc.eq_cnt || [])[i] || "").trim(); if(t) R.push(t + (n && n !== "0" ? " ×" + n : "")); });
      return R;
    }
    R.push("Tonici di Salute (gratis) " + o.sal + "/5");
    o.slots.forEach(function(s, i){
      if(!s) return;
      var src = [];
      if(s.st) src.push(s.st + " dalla stiva"); if(s.ng) src.push(s.ng + " dal negozio");
      R.push("Slot " + (i + 1) + ": " + it(s.id).n + " ×" + s.q + (src.length ? " (" + src.join(", ") + ")" : ""));
    });
    o.ric.forEach(function(r){ if(r) R.push("Ricambio: nucleo di " + NUC[r.t].n.toLowerCase() + " " + el(r.e).n + (r.src === "st" ? " (dalla stiva)" : " (dal negozio)")); });
    (o.vecchio || []).forEach(function(v){ R.push("Scritto a mano: " + v.t + (v.n && v.n !== "0" ? " ×" + v.n : "")); });
    return R;
  };

  var EQ = eqVuoto();
  function eqCampo(){ return $("sc-eq2"); }
  function eqKey(){ return (typeof scCur !== "undefined") ? scCur : null; }
  /* chiamato da scBuild (js/area-giocatori.js) dopo aver scritto il campo nascosto sc-eq2 */
  window.eqRender = function(){
    var f = eqCampo(); if(!f) return;
    var o = null; try { o = JSON.parse(f.value || "null"); } catch(e){}
    EQ = eqNorm(o);
    disegnaEq();
  };
  function eqSalva(){
    var f = eqCampo(); if(!f) return;
    f.value = JSON.stringify(EQ);
    try { if(typeof paAuto === "function") paAuto(); else if(typeof scSave === "function") scSave(true); } catch(e){}
    disegnaEq();
  }
  function montato(t){ var s = $(NUC[t].sel); return s ? s.value : ""; }
  function pallini(n, max, c){ var h = ""; for(var i = 0; i < max; i++) h += '<i class="' + (i < n ? "on" : "") + '"></i>'; return '<span class="eq-pips" style="--c:' + c + '" aria-label="' + n + ' su ' + max + '">' + h + '</span>'; }
  function disegnaEq(){
    var box = $("eq-box"); if(!box) return;
    var sal = it("salute"), h = '<div class="eq-slots">';
    h += '<div class="eq-slot eq-fisso"><div class="eq-h">' + boccetta(sal, EQ.sal / 5) + '<div class="eq-i"><div class="eq-n">Tonici di Salute</div><div class="eq-e">' + esc(sal.e) + '</div></div><div class="eq-num">' + EQ.sal + ' / 5</div></div>'
      + pallini(EQ.sal, 5, sal.c) + '<div class="eq-src"><span class="eq-chip eq-free">✦ Gratis a ogni spedizione</span></div>'
      + '<div class="eq-b"><button type="button" class="eq-btn" data-eq="sal-usa"' + (EQ.sal ? "" : " disabled") + '>Usa −1</button>'
      + '<button type="button" class="eq-btn eq-ghost" data-eq="sal-reset"' + (EQ.sal >= 5 ? " disabled" : "") + '>↺ Nuova spedizione</button></div></div>';
    EQ.slots.forEach(function(s, i){
      if(!s){
        h += '<div class="eq-slot eq-vuoto"><div class="eq-piu" aria-hidden="true">＋</div><div>Slot ' + (i + 1) + ' libero</div><div class="eq-e">5 tonici oppure 2 piloni, di un solo tipo</div>'
          + '<button type="button" class="eq-btn" data-eq="apri" data-i="' + i + '">Equipaggia</button></div>';
        return;
      }
      var x = it(s.id), c = cap(x);
      h += '<div class="eq-slot"><div class="eq-h">' + figura(x, s.q / c) + '<div class="eq-i"><div class="eq-n">' + esc(x.n) + '</div><div class="eq-e">' + esc(x.e) + '</div></div><div class="eq-num">' + s.q + ' / ' + c + '</div></div>'
        + pallini(s.q, c, x.c)
        + '<div class="eq-src">' + (s.st ? '<span class="eq-chip eq-st">📦 ' + s.st + ' dalla stiva</span>' : '') + (s.ng ? '<span class="eq-chip eq-ng">🛒 ' + s.ng + ' dal negozio</span>' : '') + '</div>'
        + '<div class="eq-b"><button type="button" class="eq-btn" data-eq="usa" data-i="' + i + '">Usa −1</button>'
        + '<button type="button" class="eq-btn eq-ghost" data-eq="apri" data-i="' + i + '"' + (s.q >= c ? " disabled" : "") + '>＋ Aggiungi</button>'
        + '<button type="button" class="eq-btn eq-ghost" data-eq="riponi" data-i="' + i + '">Riponi in stiva</button></div></div>';
    });
    h += '</div>';
    var ma = el(montato("att")), md = el(montato("def"));
    h += '<div class="eq-ric-h"><span class="sc-lbl" style="margin:0">Nuclei di ricambio · ' + EQ.ric.filter(Boolean).length + ' / ' + RIC_MAX + '</span>'
      + '<span class="eq-mont"><span>⚔ ' + (ma ? sfera(ma, "sm") + ma.n : "nessuno") + '</span><span>🛡 ' + (md ? sfera(md, "sm") + md.n : "nessuno") + '</span></span></div>';
    h += '<div class="eq-sock">' + EQ.ric.map(function(r, i){
      if(!r) return '<button type="button" class="eq-so eq-so-vuoto" data-eq="nuc" data-i="' + i + '"><span class="eq-piu" aria-hidden="true">＋</span><span>Aggiungi nucleo</span></button>';
      var e = el(r.e);
      return '<div class="eq-so">' + sfera(e) + '<div class="eq-so-i"><div class="eq-n">' + NUC[r.t].n + ' · ' + e.n + '</div>'
        + '<div class="eq-src">' + (r.src === "st" ? '<span class="eq-chip eq-st">📦 Dalla stiva</span>' : '<span class="eq-chip eq-ng">🛒 Dal negozio</span>') + '</div></div>'
        + '<div class="eq-b"><button type="button" class="eq-btn" data-eq="monta" data-i="' + i + '">Monta</button><button type="button" class="eq-btn eq-ghost" data-eq="nuc-riponi" data-i="' + i + '">Riponi</button></div></div>';
    }).join("") + '</div>';
    h += '<p class="eq-nota">Montando un ricambio, il nucleo che avevi prima si consuma e sparisce. «Riponi» rimette nella stiva quello che non usi, anche se l\'avevi preso al negozio.</p>';
    if(EQ.vecchio && EQ.vecchio.length){
      h += '<div class="eq-vecchio"><div class="sc-lbl">Scritto a mano prima del cambio</div><ul>' + EQ.vecchio.map(function(v){ return '<li>' + esc(v.t) + (v.n && v.n !== "0" ? " ×" + esc(v.n) : "") + '</li>'; }).join("")
        + '</ul><p class="eq-nota">Rimettete questi oggetti negli slot qui sopra, poi toccate il pulsante.</p><button type="button" class="eq-btn eq-ghost" data-eq="vecchio-via">✓ Fatto, togli questo elenco</button></div>';
    }
    box.innerHTML = h;
  }

  /* ---------- finestra di scelta ---------- */
  var eqOv = document.createElement("div");
  eqOv.className = "eq-ov"; eqOv.setAttribute("role", "dialog"); eqOv.setAttribute("aria-modal", "true"); eqOv.setAttribute("aria-labelledby", "eq-dt");
  eqOv.innerHTML = '<div class="eq-dlg" id="eq-dlg"></div>';
  document.body.appendChild(eqOv);
  var D = null, lavoro = false;
  function apriDlg(o){ D = o; disegnaDlg(); eqOv.classList.add("on"); guarda("scelta", true); suono("paper"); setTimeout(function(){ var b = eqOv.querySelector(".eq-opt,.eq-btn"); try { if(b) b.focus(); } catch(_){} }, 40); }
  function chiudiDlg(){ eqOv.classList.remove("on"); D = null; guarda("scelta", false); }
  STV.on(function(){ if(D && !lavoro) disegnaDlg(); });
  function opzioneSrc(src, on, abil, sotto){
    return '<button type="button" class="eq-opt' + (on ? " on" : "") + '" data-src="' + src + '"' + (abil ? "" : " disabled") + '>'
      + (src === "st" ? "📦 Dalla stiva" : "🛒 Negozio") + ' <small>' + sotto + '</small></button>';
  }
  function disegnaDlg(){
    if(!D) return;
    var box = $("eq-dlg"), h = "", scrive = !!tokScrittura(eqKey());
    if(D.tipo === "slot"){
      var s = EQ.slots[D.i], x = D.id ? it(D.id) : null, ha = s ? s.q : 0;
      var dispo = x ? int(doc.str[x.id]) : 0, posto = x ? cap(x) - ha : 0;
      if(D.src === "st" && (!dispo || !scrive)) D.src = null;
      var max = x && D.src ? Math.max(0, D.src === "st" ? Math.min(posto, dispo) : posto) : 0;
      D.q = Math.max(1, Math.min(D.q || 1, Math.max(1, max)));
      h += '<h3 class="eq-dt" id="eq-dt">' + (s ? "Aggiungi: " + esc(x.n) : "Equipaggia lo slot " + (D.i + 1)) + '</h3>';
      if(!s) h += GRUPPI.map(function(g){
        return '<div class="eq-grp"><div class="sc-lbl">' + g[1] + '</div><div class="eq-opts">' + IT.filter(function(y){ return y.g === g[0]; }).map(function(y){
          return '<button type="button" class="eq-opt' + (D.id === y.id ? " on" : "") + '" data-id="' + y.id + '"><i class="eq-dot" style="--c:' + y.c + '"></i>' + esc(y.b) + '</button>';
        }).join("") + '</div></div>';
      }).join("");
      h += '<div class="eq-eff">' + (x ? esc(x.e) + (x.k === "p" ? " In uno slot entrano al massimo 2 piloni." : " In uno slot entrano al massimo 5 tonici.") : "Scegli un oggetto per leggerne l'effetto.") + '</div>';
      h += '<div class="eq-grp"><div class="sc-lbl">Da dove arriva</div><div class="eq-opts">'
        + opzioneSrc("st", D.src === "st", x && dispo && scrive, !scrive ? "serve il salvataggio online" : x ? (dispo ? "in stiva: " + dispo : "esaurito in stiva") : "")
        + opzioneSrc("ng", D.src === "ng", !!x, "non tocca la stiva") + '</div></div>';
      h += '<div class="eq-df"><div><div class="sc-lbl">Quantità' + (x ? " · posto libero " + posto : "") + '</div><span class="stv-cnt"><button type="button" data-dq="-1" aria-label="Uno in meno">−</button><b>' + (x && D.src ? D.q : "–") + '</b><button type="button" data-dq="1" aria-label="Uno in più">+</button></span></div>'
        + '<div class="eq-b"><button type="button" class="eq-btn eq-ghost" data-dlg="annulla">Annulla</button><button type="button" class="eq-btn" data-dlg="ok"' + (x && D.src && max && !lavoro ? "" : " disabled") + '>' + (lavoro ? "Prendo…" : "Equipaggia") + '</button></div></div>';
    } else {
      var k = D.e ? nid(D.t, D.e) : null, dn = k ? int(doc.str[k]) : 0;
      if(D.src === "st" && (!dn || !scrive)) D.src = null;
      h += '<h3 class="eq-dt" id="eq-dt">Nucleo di ricambio</h3>'
        + '<div class="eq-grp"><div class="sc-lbl">Tipo</div><div class="eq-opts">' + ["att", "def"].map(function(t){ return '<button type="button" class="eq-opt' + (D.t === t ? " on" : "") + '" data-t="' + t + '">' + (t === "att" ? "⚔ " : "🛡 ") + NUC[t].n + '</button>'; }).join("") + '</div></div>'
        + '<div class="eq-grp"><div class="sc-lbl">Elemento</div><div class="eq-opts">' + EL.map(function(e){ return '<button type="button" class="eq-opt' + (D.e === e.id ? " on" : "") + '" data-e="' + e.id + '"><i class="eq-dot" style="--c:' + e.c + '"></i>' + e.n + ' <small>' + int(doc.str[nid(D.t, e.id)]) + ' in stiva</small></button>'; }).join("") + '</div></div>'
        + '<div class="eq-eff">' + esc(NUC[D.t].e) + '</div>'
        + '<div class="eq-grp"><div class="sc-lbl">Da dove arriva</div><div class="eq-opts">'
        + opzioneSrc("st", D.src === "st", D.e && dn && scrive, !scrive ? "serve il salvataggio online" : D.e ? (dn ? "in stiva: " + dn : "esaurito in stiva") : "")
        + opzioneSrc("ng", D.src === "ng", !!D.e, "non tocca la stiva") + '</div></div>'
        + '<div class="eq-df"><span class="eq-nota">Ne porti ' + EQ.ric.filter(Boolean).length + ' su ' + RIC_MAX + '.</span><div class="eq-b"><button type="button" class="eq-btn eq-ghost" data-dlg="annulla">Annulla</button>'
        + '<button type="button" class="eq-btn" data-dlg="ok"' + (D.e && D.src && !lavoro ? "" : " disabled") + '>' + (lavoro ? "Prendo…" : "Aggiungi") + '</button></div></div>';
    }
    box.innerHTML = h;
  }
  /* prende n pezzi dalla stiva solo se ci sono davvero (controllato sul file appena letto) */
  function prendi(id, n){
    var chi = eqKey();
    return cambia(chi, function(d){
      var q = int(d.str[id]);
      if(q < n){ avviso(q ? "In stiva ne sono rimasti solo " + q + ": " + nomeChiave(id) + "." : nomeChiave(id) + ": in stiva non ce ne sono più.", true); return false; }
      d.str[id] = q - n; return "Stiva · " + breve(chi) + " prende " + n + " × " + nomeChiave(id);
    });
  }
  function riponi(id, n){
    var chi = eqKey();
    return cambia(chi, function(d){ d.str[id] = int(d.str[id]) + n; return "Stiva · " + breve(chi) + " ripone " + n + " × " + nomeChiave(id); });
  }
  function confermaDlg(){
    if(!D || lavoro) return;
    var o = D;
    if(o.tipo === "slot"){
      var x = it(o.id); if(!x || !o.src) return;
      var fatto = function(){
        var s = EQ.slots[o.i] || { id: o.id, q: 0, st: 0, ng: 0 };
        s.q += o.q; s[o.src] += o.q; EQ.slots[o.i] = s;
        chiudiDlg(); eqSalva(); suono("charge");
        avviso(o.q + " × " + x.n + (o.src === "st" ? " presi dalla stiva" : " dal negozio"));
      };
      if(o.src === "ng"){ fatto(); return; }
      lavoro = true; disegnaDlg();
      prendi(o.id, o.q).then(function(r){ lavoro = false; if(r && r.ok) fatto(); else disegnaDlg(); });
    } else {
      if(!o.e || !o.src) return;
      var mettiNelSocket = function(){ EQ.ric[o.i] = { t: o.t, e: o.e, src: o.src }; chiudiDlg(); eqSalva(); suono("charge"); };
      if(o.src === "ng"){ mettiNelSocket(); return; }
      lavoro = true; disegnaDlg();
      prendi(nid(o.t, o.e), 1).then(function(r){ lavoro = false; if(r && r.ok) mettiNelSocket(); else disegnaDlg(); });
    }
  }
  eqOv.addEventListener("click", function(e){
    if(e.target === eqOv){ chiudiDlg(); return; }
    if(!D) return;
    var t = e.target, b;
    if((b = t.closest("[data-id]")) && D.tipo === "slot" && !EQ.slots[D.i]){ D.id = b.getAttribute("data-id"); D.src = null; D.q = 1; disegnaDlg(); return; }
    if((b = t.closest("[data-t]"))){ D.t = b.getAttribute("data-t"); D.src = null; disegnaDlg(); return; }
    if((b = t.closest("[data-e]"))){ D.e = b.getAttribute("data-e"); D.src = null; disegnaDlg(); return; }
    if((b = t.closest("[data-src]"))){ D.src = b.getAttribute("data-src"); D.q = D.q || 1; disegnaDlg(); return; }
    if((b = t.closest("[data-dq]"))){ D.q = (D.q || 1) + parseInt(b.getAttribute("data-dq"), 10); disegnaDlg(); return; }
    if((b = t.closest("[data-dlg]"))){ if(b.getAttribute("data-dlg") === "ok") confermaDlg(); else chiudiDlg(); }
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && eqOv.classList.contains("on")){ e.stopPropagation(); chiudiDlg(); } }, true);

  /* ---------- azioni sulla scheda ---------- */
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("#eq-box [data-eq]"); if(!b) return;
    var az = b.getAttribute("data-eq"), i = parseInt(b.getAttribute("data-i"), 10);
    if(az === "sal-usa"){ if(EQ.sal > 0){ EQ.sal--; eqSalva(); suono("paper"); } return; }
    if(az === "sal-reset"){ EQ.sal = 5; eqSalva(); avviso("Nuova spedizione: 5 tonici di Salute"); return; }
    if(az === "apri"){ var s = EQ.slots[i]; apriDlg({ tipo: "slot", i: i, id: s ? s.id : null, src: null, q: 1 }); return; }
    if(az === "usa"){
      var x = EQ.slots[i]; if(!x) return;
      x.q--; if(x.ng > 0) x.ng--; else x.st = Math.max(0, x.st - 1);
      if(x.q <= 0){ avviso(it(x.id).n + ": finiti, lo slot " + (i + 1) + " è libero"); EQ.slots[i] = null; }
      eqSalva(); suono("paper"); return;
    }
    if(az === "riponi"){
      var y = EQ.slots[i]; if(!y || lavoro) return;
      lavoro = true; b.disabled = true; b.textContent = "Ripongo…";
      riponi(y.id, y.q).then(function(r){
        lavoro = false;
        if(r && r.ok){ EQ.slots[i] = null; eqSalva(); avviso(y.q + " × " + it(y.id).n + " riposti nella stiva"); } else disegnaEq();
      });
      return;
    }
    if(az === "nuc"){ if(EQ.ric.filter(Boolean).length >= RIC_MAX) return; apriDlg({ tipo: "nuc", i: i, t: "def", e: null, src: null }); return; }
    if(az === "monta"){
      var r = EQ.ric[i]; if(!r) return;
      var sel = $(NUC[r.t].sel), vecchio = el(sel ? sel.value : ""), nuovo = el(r.e);
      var testo = vecchio ? "Il nucleo " + vecchio.n + " che hai montato adesso si consuma e sparisce." : "Adesso non hai nessun nucleo di " + NUC[r.t].n.toLowerCase() + " montato.";
      var chiedi = typeof tcjConferma === "function" ? tcjConferma({ titolo: "Montare il nucleo di " + NUC[r.t].n.toLowerCase() + " " + nuovo.n + "?", testo: testo, si: "Sì, montalo", attesa: 1 }) : Promise.resolve(confirm(testo));
      chiedi.then(function(ok){
        if(!ok) return;
        if(sel){ sel.value = r.e; try { scNucleo(r.t); } catch(_){} try { orbSet(r.t, r.e); } catch(_){} }
        EQ.ric[i] = null; eqSalva(); suono("charge");
        avviso("Montato il nucleo di " + NUC[r.t].n.toLowerCase() + " " + nuovo.n + (vecchio ? ". Il nucleo " + vecchio.n + " si è consumato." : "."));
      });
      return;
    }
    if(az === "nuc-riponi"){
      var z = EQ.ric[i]; if(!z || lavoro) return;
      lavoro = true; b.disabled = true; b.textContent = "Ripongo…";
      riponi(nid(z.t, z.e), 1).then(function(rr){
        lavoro = false;
        if(rr && rr.ok){ EQ.ric[i] = null; eqSalva(); avviso("Nucleo riposto nella stiva"); } else disegnaEq();
      });
      return;
    }
    if(az === "vecchio-via"){ delete EQ.vecchio; eqSalva(); }
  });
  /* se cambiano i nuclei montati a mano, il riepilogo sopra i ricambi si aggiorna */
  document.addEventListener("change", function(e){ if(e.target && (e.target.id === "sc-natt-s" || e.target.id === "sc-ndef-s")) disegnaEq(); });
  /* mentre l'Equipaggiamento è sullo schermo la stiva si rilegge ogni tanto (per i numeri nella finestra di scelta) */
  (function(){
    var box = $("eq-box"); if(!box || !window.IntersectionObserver) return;
    new IntersectionObserver(function(en){ guarda("scheda", en[0].isIntersecting); }).observe(box);
  })();

  window.eqRender();
})();
