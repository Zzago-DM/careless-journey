/* Schede in diretta — il Master vede le schede dei tre Slayer affiancate, aggiornate a ogni modifica.

   Come funziona:
   1. Sul dispositivo del giocatore (Area dello Slayer aperta e salvataggio online collegato con il SUO token):
      ogni volta che la scheda cambia, dopo un paio di secondi il sito scrive una copia della scheda nel file
      diretta.json del repository privato del personaggio (es. Zzago-DM/tcj-athena). Non tocca dati.json:
      il «☁ Salva online» del giocatore resta com'era. Più modifiche di fila diventano un solo invio, e tra due
      invii passano almeno 12 secondi, per restare lontani dai limiti di GitHub.
   2. Nella Zona Master, capitolo «Aree dei giocatori online»: sotto lo stato del salvataggio di ogni Slayer c'è
      la sua scheda in sola lettura. Mentre il capitolo è aperto, il sito rilegge i tre diretta.json ogni 3 secondi
      (se nulla è cambiato GitHub risponde «uguale» e non costa niente). Ciò che è appena cambiato si illumina e
      finisce nell'elenco «Ultime modifiche». «⛶ Schermo intero» mette le tre schede a tutto schermo.

   Gli altri giocatori non possono leggere diretta.json: sta nel repository del singolo personaggio, che apre
   solo il suo token e quello del Master. Il ritratto viaggia come miniatura, per tenere il file leggero. */
(function(){
  "use strict";
  if(typeof SC_CHARS === "undefined") return;
  var OWNER = "Zzago-DM", API = "https://api.github.com/repos/", FILE = "diretta.json";
  var CH = SC_CHARS.map(function(c){ return c.k; });
  var NOME = {}; CH.forEach(function(k){ NOME[k] = (typeof PA_FULL !== "undefined" && PA_FULL[k]) || k; });
  var EMO = {}; SC_CHARS.forEach(function(c){ EMO[c.k] = c.e; });
  var DEF_EL = { athena: "glaciale", panlan: "oscuro", asonnes: "terrestre" };
  var EL_C = { glaciale:"#7ec8e3", ardente:"#e8894a", folgorante:"#f0d020", terrestre:"#7cc26a", radiante:"#d4a8ff", oscuro:"#a57cf0", master:"#ff6a5a", oro:"#f2bf3c" };
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function leggiJ(key){ try { return JSON.parse(localStorage.getItem(key) || "null") || {}; } catch(e){ return {}; } }
  function scrivi(key, v){ try { localStorage.setItem(key, v); } catch(e){} }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function txt(v){ if(v === undefined || v === null) return ""; if(typeof v === "boolean") return v ? "Sì" : ""; return String(v).trim(); }
  function num(v){ var m = String(v == null ? "" : v).match(/-?\d+/); return m ? parseInt(m[0], 10) : null; }
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g, "")), by = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(tok, repo, metodo, perc, corpo, extra){
    var h = { "Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(corpo) h["Content-Type"] = "application/json";
    if(extra) Object.keys(extra).forEach(function(x){ h[x] = extra[x]; });
    /* GitHub tiene in memoria le risposte per un po': un parametro sempre diverso obbliga a leggere l'ultima versione */
    if(metodo === "GET") perc += (perc.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return fetch(API + repo + perc, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }
  function schedaLocale(k){
    try { var s = localStorage.getItem("tcj-sc4-" + k); if(s === null && k === CH[0]) s = localStorage.getItem("tcj-sc4"); return s ? JSON.parse(s) : null; } catch(e){ return null; }
  }
  function elDi(k){ try { if(typeof paPref === "function") return paPref(k).c; } catch(e){} return DEF_EL[k] || "glaciale"; }

  /* miniatura del ritratto, per non spedire l'immagine intera a ogni modifica */
  var mini = {};
  function miniatura(src){
    if(!src) return Promise.resolve("");
    if(src.length < 24000) return Promise.resolve(src);
    var key = src.length + ":" + src.slice(-64);
    if(mini[key] !== undefined) return Promise.resolve(mini[key]);
    return new Promise(function(fine){
      var im = new Image();
      im.onload = function(){
        try {
          var S = 180, c = document.createElement("canvas"); c.width = c.height = S;
          var g = c.getContext("2d"), w = im.naturalWidth, h = im.naturalHeight, m = Math.min(w, h);
          g.drawImage(im, (w - m) / 2, Math.max(0, (h - m) * 0.18), m, m, 0, 0, S, S);
          mini[key] = c.toDataURL("image/jpeg", 0.78);
        } catch(e){ mini[key] = ""; }
        fine(mini[key]);
      };
      im.onerror = function(){ mini[key] = ""; fine(""); };
      im.src = src;
    });
  }

  /* =====================================================================
     1. INVIO — dal dispositivo del giocatore
     ===================================================================== */
  var ATTESA = 2500, DISTANZA = 12000;
  var timer = {}, ultimo = {}, inCorso = {}, pausaFino = 0;
  function credGiocatore(k){
    var c = null; try { c = window.ghSync && ghSync.credenziali ? ghSync.credenziali(k) : null; } catch(e){}
    return c && c.chi === "giocatore" ? c : null;
  }
  function areaAperta(k){ try { return typeof paOpenList === "function" && paOpenList().indexOf(k) >= 0; } catch(e){ return false; } }
  function puoInviare(k){ return !!credGiocatore(k) && areaAperta(k); }

  function preparaInvio(k){
    var sc = schedaLocale(k); if(!sc) return Promise.resolve(null);
    var copia = JSON.parse(JSON.stringify(sc)); delete copia.seal;
    var rit = (copia.id && copia.id.ritratto) || "";
    var s = {}; try { s = ghSync.stato(k) || {}; } catch(e){}
    return miniatura(rit).then(function(img){
      if(copia.id) copia.id.ritratto = img;
      return { app: "the-careless-journey", tipo: "scheda-in-diretta", v: 1, personaggio: k, el: elDi(k),
               sync: { at: s.at || null, dirty: !!s.dirty }, sc: copia };
    });
  }
  function programma(k, presto){
    if(!puoInviare(k)) return;
    clearTimeout(timer[k]);
    var tra = Math.max(presto ? 300 : ATTESA, (ultimo[k] || 0) + DISTANZA - Date.now(), pausaFino - Date.now());
    timer[k] = setTimeout(function(){ timer[k] = null; invia(k); }, tra);
  }
  function invia(k, tentativo){
    if(!puoInviare(k)) return;
    if(inCorso[k]){ programma(k); return; }
    var c = credGiocatore(k);
    inCorso[k] = 1;
    preparaInvio(k).then(function(p){
      if(!p){ inCorso[k] = 0; return; }
      var firma = JSON.stringify(p);
      if(firma === localStorage.getItem("tcjdv_firma_" + k) && !tentativo){ inCorso[k] = 0; return; }   /* niente di nuovo da mandare */
      p.agg = new Date().toISOString();
      var hm = new Date(); hm = String(hm.getHours()).padStart(2, "0") + ":" + String(hm.getMinutes()).padStart(2, "0");
      var corpo = { message: "Diretta · " + NOME[k] + " · " + hm, content: b64e(JSON.stringify(p)) };
      var sha = localStorage.getItem("tcjdv_sha_" + k); if(sha) corpo.sha = sha;
      ultimo[k] = Date.now();
      return gh(c.token, c.repo, "PUT", "/contents/" + FILE, corpo).then(function(r){
        if((r.status === 409 || r.status === 422) && !tentativo){
          /* questo dispositivo non conosce l'ultima versione (l'ha scritta un altro): prende la sua impronta e riprova */
          return gh(c.token, c.repo, "GET", "/contents/" + FILE).then(function(r2){ return r2.ok ? r2.json() : null; }).then(function(j){
            if(j && j.sha) scrivi("tcjdv_sha_" + k, j.sha); else { try { localStorage.removeItem("tcjdv_sha_" + k); } catch(e){} }
            inCorso[k] = 0; invia(k, 1);
          });
        }
        if(r.status === 403 || r.status === 429){ pausaFino = Date.now() + 90000; inCorso[k] = 0; programma(k); return; }   /* troppi invii: si ferma un attimo */
        if(!r.ok){ inCorso[k] = 0; return; }
        return r.json().then(function(j){
          if(j && j.content && j.content.sha) scrivi("tcjdv_sha_" + k, j.content.sha);
          scrivi("tcjdv_firma_" + k, firma);
          inCorso[k] = 0;
        });
      });
    }).catch(function(){ inCorso[k] = 0; setTimeout(function(){ programma(k); }, 8000); });
  }
  document.addEventListener("tcj-area", function(e){ var d = e.detail || {}; if(d.k) programma(d.k, d.motivo !== "modifica"); });
  setTimeout(function(){ CH.forEach(function(k){ programma(k, true); }); }, 5000);   /* all'apertura: se la diretta è indietro, la allinea */
  document.addEventListener("visibilitychange", function(){
    if(!document.hidden) return;
    CH.forEach(function(k){ if(timer[k] && Date.now() >= pausaFino){ clearTimeout(timer[k]); timer[k] = null; invia(k); } });   /* chi chiude l'app non lascia modifiche in sospeso */
  });

  /* =====================================================================
     2. VISTA DEL MASTER — Zona Master › Aree dei giocatori online
     ===================================================================== */
  var mb = document.getElementById("mgh-body");
  if(!mb) return;
  function tokMaster(){ return leggiJ("tcjgh_master").token || ""; }

  var ST = {}; CH.forEach(function(k){ ST[k] = { d: null, fonte: "", agg: null, etag: null, mappa: null, log: [], prova: false, err: "" }; });
  var quando = function(iso){ try { return new Date(iso).toLocaleString("it-IT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }); } catch(e){ return iso || ""; } };
  function fa(iso){
    if(!iso) return "";
    var d = new Date(iso), s = (Date.now() - d.getTime()) / 1000;
    if(isNaN(s)) return "";
    if(s < 30) return "adesso";
    if(s < 3600) return Math.max(1, Math.round(s / 60)) + " min fa";
    var hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if(s < 20 * 3600) return "alle " + hm;
    return d.getDate() + "/" + (d.getMonth() + 1) + " alle " + hm;
  }
  function ora(){ var d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

  /* ---------- dalla scheda ai campi da mostrare ---------- */
  var LIC = [["titolo","Soprannome"],["eta","Età"],["giorno","Nascita"],["triade","Triade"],["aether","Aether"],["continente","Continente"],["terra","Terra natale"],["casata","Casata"],["segni","Segni particolari"],["motto","Motto"]];
  var RANGO = { novizio:"Novizio", cacciatore:"Cacciatore", discepolo:"Discepolo", maestro:"Maestro", fenice:"Fenice" };
  function campi(sc){
    /* elenco piatto: chiave → { et: etichetta per «Ultime modifiche», v: testo } */
    var M = {}, id = sc.id || {};
    function c(f, et, v){ M[f] = { et: et, v: txt(v) }; }
    c("nome", "Nome", id.nome);
    LIC.forEach(function(x){ c("id." + x[0], x[1], id[x[0]]); });
    c("lvl", "Livello", sc.lvl); c("rango", "Rango", RANGO[sc.rango] || sc.rango);
    c("pv", "PV", sc.pv); c("pvmax", "PV massimi", sc.pvmax);
    c("stati", "Stati alterati", typeof grStatiTesto === "function" ? grStatiTesto(sc.stati) : "");
    c("benny", "Benny", sc.benny); c("ispirazione", "Ispirazione", sc.ispirazione);
    c("cariche", "Cariche aetheriche", (Array.isArray(sc.charges) ? sc.charges.filter(Boolean).length : 0) + " / 6");
    c("malus", "Altri malus e note", sc.malus);
    (typeof SC_STATS !== "undefined" ? SC_STATS : []).forEach(function(s){ var o = (sc.stats || {})[s.id] || {}; c("st." + s.id, s.nm, o.v); c("stm." + s.id, s.nm + " (mod.)", o.m); });
    c("comp_bonus", "Bonus competenze", sc.comp_bonus);
    (typeof SC_COMPS !== "undefined" ? SC_COMPS : []).forEach(function(cp){ c("cp." + cp.id, cp.nm, (sc.comps || {})[cp.id] ? "attiva" : ""); c("cpm." + cp.id, cp.nm + " (mod.)", (sc.comp_mods || {})[cp.id]); });
    c("wcat", "Categoria dell'arma", sc.wcat); c("arma", "Arma principale", sc.arma); c("abil", "Abilità dell'arma", sc.abil);
    c("natt", "Nucleo d'attacco", sc.natt && typeof SC_NC !== "undefined" && SC_NC[sc.natt] ? SC_NC[sc.natt].tx : sc.natt);
    c("ndef", "Nucleo di difesa", sc.ndef && typeof SC_NC !== "undefined" && SC_NC[sc.ndef] ? SC_NC[sc.ndef].tx : sc.ndef);
    c("arma2", "Arma secondaria", sc.arma2); c("arma2t", "Tipo dell'arma secondaria", sc.arma2t === "arco" ? "Arco aetherico" : (sc.arma2 ? "Pistola" : ""));
    c("proiettili", "Proiettili", sc.proiettili);
    for(var i = 0; i < 4; i++){ var et = txt((sc.eq_txt || [])[i]), n = txt((sc.eq_cnt || [])[i]); c("eq." + i, "Equipaggiamento " + (i + 1), et ? et + (n && n !== "0" ? " ×" + n : "") : ""); }
    c("equip", "Inventario", sc.equip);
    for(var j = 0; j < 6; j++) c("cella." + j, "Cella " + (j + 1), (sc.celle || [])[j]);
    c("coin_team", "Fondo di squadra", sc.coin_team); c("coin_personal", "Monete personali", sc.coin_personal);
    (sc.coins || []).forEach(function(x, i){ c("coin." + i, "Valuta " + (i + 1), txt(x.a) + (txt(x.c) ? " " + txt(x.c) : "")); });
    var cr = (typeof CROWNS !== "undefined" ? CROWNS : []).filter(function(_, i){ return (sc.crowns || [])[i]; }).map(function(x){ return x.n; });
    c("corone", "Corone", cr.join(", "));
    (sc.notes || []).forEach(function(n, i){ c("nota." + i, "Nota «" + (txt(n.t) || ("Sezione " + (i + 1))) + "»", txt(n.t) + "\n" + txt(n.b)); });
    c("ritratto", "Ritratto", id.ritratto ? String(id.ritratto).length + ":" + String(id.ritratto).slice(-32) : "");
    return M;
  }

  /* ---------- disegno di una scheda in sola lettura ---------- */
  function val(M, f, vuoto){ var x = M[f]; return x && x.v ? esc(x.v) : '<i class="dv-vuoto">' + (vuoto || "—") + '</i>'; }
  function riga(M, f, et, vuoto){ return '<div class="dv-r" data-f="' + f + '"><span class="dv-et">' + et + '</span><span class="dv-v">' + val(M, f, vuoto) + '</span></div>'; }
  function blocco(icona, tit, corpo, cls){ return '<div class="dv-b' + (cls ? " " + cls : "") + '"><div class="dv-bt"><span aria-hidden="true">' + icona + '</span>' + tit + '</div>' + corpo + '</div>'; }
  function schedaHTML(k, sc, M){
    var id = sc.id || {}, h = "";
    /* PV e stati */
    var pv = num(sc.pv), mx = num(sc.pvmax), pct = pv !== null && mx ? Math.max(0, Math.min(1, pv / mx)) : null;
    var hue = pct === null ? 0 : Math.round(4 + pct * 122);
    h += '<div class="dv-pv" data-f="pv"><div class="dv-pvn"><b data-f="pv">' + (pv === null ? "—" : pv) + '</b><span data-f="pvmax">/ ' + (mx || "—") + '</span><small>PV</small></div>'
      + '<div class="dv-pvbar"><i style="width:' + (pct === null ? 0 : (pct * 100).toFixed(1)) + '%;--h:' + hue + '"></i></div></div>';
    var st = M.stati.v ? M.stati.v.split(/,\s(?=[A-ZÀ-Ú])/) : [];
    h += '<div class="dv-stati" data-f="stati">' + (st.length ? st.map(function(x){ return '<span>' + esc(x) + '</span>'; }).join("") : '<i class="dv-vuoto">Nessuno stato alterato</i>') + '</div>';
    /* livello */
    h += '<div class="dv-g4">'
      + '<div class="dv-n" data-f="lvl"><small>Livello</small><b>' + val(M, "lvl") + '</b></div>'
      + '<div class="dv-n" data-f="rango"><small>Rango</small><b>' + val(M, "rango") + '</b></div>'
      + '<div class="dv-n" data-f="benny"><small>Benny</small><b>' + val(M, "benny", "0") + '</b></div>'
      + '<div class="dv-n" data-f="ispirazione"><small>Ispiraz.</small><b>' + val(M, "ispirazione", "0") + '</b></div></div>';
    var nc = Array.isArray(sc.charges) ? sc.charges.filter(Boolean).length : 0, pal = "";
    for(var i = 0; i < 6; i++) pal += '<i class="' + (i < nc ? "on" : "") + '"></i>';
    h += '<div class="dv-cariche" data-f="cariche"><span class="dv-et">Cariche aetheriche</span><span class="dv-pal">' + pal + '</span><b>' + nc + ' / 6</b></div>';
    if(M.malus.v) h += blocco("📝", "Altri malus e note", '<div class="dv-txt" data-f="malus">' + val(M, "malus") + '</div>');
    /* statistiche */
    var sg = "";
    (typeof SC_STATS !== "undefined" ? SC_STATS : []).forEach(function(s){
      sg += '<div class="dv-st" data-f="st.' + s.id + '"><small>' + s.id + '</small><b>' + val(M, "st." + s.id) + '</b><span data-f="stm.' + s.id + '">' + (M["stm." + s.id].v ? esc(M["stm." + s.id].v) : "") + '</span></div>';
    });
    h += blocco("📊", "Statistiche", '<div class="dv-stg">' + sg + '</div>');
    /* competenze */
    var cg = "";
    (typeof SC_COMPS !== "undefined" ? SC_COMPS : []).forEach(function(cp){
      var on = !!(sc.comps || {})[cp.id];
      cg += '<div class="dv-cp' + (on ? " on" : "") + '" data-f="cp.' + cp.id + '"><i></i><span>' + esc(cp.nm) + '</span><b data-f="cpm.' + cp.id + '">' + esc(txt((sc.comp_mods || {})[cp.id])) + '</b></div>';
    });
    h += blocco("🎯", "Competenze <small data-f=\"comp_bonus\">bonus " + (M.comp_bonus.v ? esc(M.comp_bonus.v) : "+2") + "</small>", '<div class="dv-cpg">' + cg + '</div>');
    /* armi */
    h += blocco("⚔", "Armi", riga(M, "wcat", "Categoria") + riga(M, "arma", "Arma principale") + riga(M, "abil", "Abilità")
      + riga(M, "natt", "Nucleo d'attacco") + riga(M, "ndef", "Nucleo di difesa")
      + riga(M, "arma2", "Arma secondaria") + riga(M, "arma2t", "Tipo") + riga(M, "proiettili", "Proiettili"));
    /* equipaggiamento e inventario */
    var eq = "";
    for(var e = 0; e < 4; e++) if(M["eq." + e].v) eq += '<li data-f="eq.' + e + '">' + esc(M["eq." + e].v) + '</li>';
    var ce = "";
    for(var c = 0; c < 6; c++) if(M["cella." + c].v) ce += '<li data-f="cella.' + c + '">' + esc(M["cella." + c].v) + '</li>';
    h += blocco("🎒", "Equipaggiamento", (eq ? '<ul class="dv-ul">' + eq + '</ul>' : '<i class="dv-vuoto">Niente equipaggiato</i>')
      + (M.equip.v ? '<div class="dv-sub">Inventario</div><div class="dv-txt" data-f="equip">' + esc(M.equip.v) + '</div>' : '')
      + (ce ? '<div class="dv-sub">Celle</div><ul class="dv-ul dv-celle">' + ce + '</ul>' : ''));
    /* monete e corone */
    var mo = riga(M, "coin_team", "Fondo di squadra", "0") + riga(M, "coin_personal", "Monete personali", "0");
    (sc.coins || []).forEach(function(_, i){ if(M["coin." + i] && M["coin." + i].v) mo += riga(M, "coin." + i, "Valuta " + (i + 1)); });
    h += blocco("💰", "Monete", mo);
    h += blocco("👑", "Corone", '<div class="dv-txt" data-f="corone">' + val(M, "corone", "Nessuna") + '</div>');
    /* licenza */
    var li = "";
    LIC.forEach(function(x){ if(M["id." + x[0]].v) li += riga(M, "id." + x[0], x[1]); });
    h += blocco("🪪", "Licenza", li || '<i class="dv-vuoto">Ancora da compilare</i>', "dv-lic");
    /* note personali */
    var no = "";
    (sc.notes || []).forEach(function(n, i){ if(txt(n.t) || txt(n.b)) no += '<div class="dv-nota" data-f="nota.' + i + '"><b>' + esc(txt(n.t) || "Sezione " + (i + 1)) + '</b><div class="dv-txt">' + esc(txt(n.b)) + '</div></div>'; });
    if(no) h += blocco("📜", "Note personali", no);
    return h;
  }

  /* ---------- colonna ---------- */
  function slot(k){ return document.querySelector('.dv-slot[data-dv="' + k + '"]'); }
  function testata(k){
    var s = ST[k], d = s.d || {}, sc = d.sc || {}, id = sc.id || {}, el = d.el || elDi(k);
    var vivo = s.fonte === "diretta" && s.agg && (Date.now() - new Date(s.agg).getTime()) < 120000;
    var stato = s.fonte === "diretta" ? '<span class="dv-live' + (vivo ? " on" : "") + '"><i></i>' + (vivo ? "In diretta · " : "Ultima modifica ") + fa(s.agg) + '</span>'
      : s.fonte === "salvataggio" ? '<span class="dv-live off"><i></i>Diretta non ancora attiva · ultimo salvataggio ' + quando(s.agg) + '</span>'
      : '<span class="dv-live off"><i></i>' + (s.err || (!tokMaster() ? "Serve il token del Master" : s.d ? "Copia di questo dispositivo · cerco la diretta…" : "Cerco la diretta…")) + '</span>';
    var sync = d.sync ? (d.sync.dirty ? '<span class="dv-sync warn">● Il giocatore ha modifiche non salvate online</span>' : d.sync.at ? '<span class="dv-sync ok">☁ Salvata online dal giocatore · ' + quando(d.sync.at) + '</span>' : '') : '';
    var nome = txt(id.nome) || NOME[k], tit = txt(id.titolo);
    return '<div class="dv-head" style="--dc:' + (EL_C[el] || "#c8a84b") + '">'
      + '<div class="dv-rit" data-f="ritratto">' + (id.ritratto ? '<img alt="" src="' + esc(id.ritratto) + '">' : '<span>' + (EMO[k] || "⚔") + '</span>') + '</div>'
      + '<div class="dv-id"><div class="dv-nome" data-f="nome">' + esc(nome) + '</div>' + (tit ? '<div class="dv-tit">' + esc(tit) + '</div>' : '') + stato + sync + '</div></div>';
  }
  function logHTML(k){
    var L = ST[k].log; if(!L.length) return "";
    return '<details class="dv-log"' + (ST[k].logAperto ? " open" : "") + '><summary>Ultime modifiche <b>' + L.length + '</b></summary><ol>'
      + L.map(function(x){ return '<li><time>' + x.t + '</time><span>' + esc(x.et) + '</span>' + (x.da !== null ? '<s>' + esc(corto(x.da)) + '</s>→' : '') + '<em>' + esc(corto(x.a)) + '</em></li>'; }).join("")
      + '</ol></details>';
  }
  function corto(s){ s = String(s || "—").replace(/\s+/g, " "); return s.length > 60 ? s.slice(0, 58) + "…" : s; }
  function disegnaColonna(k, nuovi){
    var el = slot(k); if(!el) return;
    var s = ST[k], d = s.d, scorri = el.scrollTop;
    var lg = el.querySelector(".dv-log"); if(lg) s.logAperto = lg.open;
    if(!d || !d.sc){ el.innerHTML = testata(k) + '<div class="dv-attesa">' + (tokMaster() ? "La scheda comparirà qui appena " + esc(NOME[k].split(" ")[0]) + " la modifica con l'area aperta, oppure dopo il suo prossimo «Salva online»." : "") + '</div>'; return; }
    el.style.setProperty("--dc", EL_C[d.el || elDi(k)] || "#c8a84b");
    el.innerHTML = testata(k) + logHTML(k) + '<div class="dv-corpo">' + schedaHTML(k, d.sc, s.mappa) + '</div>';
    el.scrollTop = scorri;
    if(nuovi && nuovi.length){
      nuovi.forEach(function(f){
        el.querySelectorAll('[data-f="' + f + '"]').forEach(function(x){ x.classList.add("dv-nuovo"); });
      });
      var cl = el.closest(".mgh-col"); if(cl && !RIDOTTO){ cl.classList.remove("dv-pulsa"); void cl.offsetWidth; cl.classList.add("dv-pulsa"); }
    }
  }
  function aggiorna(k, d, fonte, agg){
    var s = ST[k]; if(!d || !d.sc) return;
    var M = campi(d.sc), nuovi = [];
    if(s.mappa && s.fonte === "diretta" && fonte === "diretta"){
      Object.keys(M).forEach(function(f){
        var a = s.mappa[f] ? s.mappa[f].v : "", b = M[f].v;
        if(a === b) return;
        nuovi.push(f);
        if(f !== "ritratto") s.log.unshift({ t: ora(), et: M[f].et, da: a || "—", a: b || "—" });
        else s.log.unshift({ t: ora(), et: "Ritratto", da: null, a: "cambiato" });
      });
      Object.keys(s.mappa).forEach(function(f){ if(!M[f]){ nuovi.push(f); s.log.unshift({ t: ora(), et: s.mappa[f].et, da: s.mappa[f].v || "—", a: "tolto" }); } });
      s.log = s.log.slice(0, 12);
    }
    s.d = d; s.fonte = fonte; s.agg = agg || d.agg || null; s.mappa = M; s.err = "";
    disegnaColonna(k, nuovi);
    disegnaTop();
  }

  /* ---------- lettura da GitHub ---------- */
  function leggi(k){
    var tok = tokMaster(); if(!tok) return Promise.resolve();
    var s = ST[k], ex = { "Accept": "application/vnd.github.raw+json" };
    if(s.etag) ex["If-None-Match"] = s.etag;
    return gh(tok, OWNER + "/tcj-" + k, "GET", "/contents/" + FILE, null, ex).then(function(r){
      if(r.status === 304) return;
      if(r.ok){ s.etag = r.headers.get("ETag"); return r.json().then(function(d){ if(d && d.sc) aggiorna(k, d, "diretta", d.agg); }); }
      if(r.status === 404){
        if(s.prova) return; s.prova = true;      /* la diretta non c'è ancora: mostra l'ultimo salvataggio online del giocatore */
        return gh(tok, OWNER + "/tcj-" + k, "GET", "/contents/dati.json", null, { "Accept": "application/vnd.github.raw+json" }).then(function(r2){
          if(!r2.ok){ if(!s.d){ s.err = r2.status === 404 ? "Nessun salvataggio online ancora" : "Il token del Master non apre tcj-" + k; disegnaColonna(k); disegnaTop(); } return; }
          return r2.json().then(function(p){
            var raw = p && p.data && (p.data["tcj-sc4-" + k] || (k === CH[0] ? p.data["tcj-sc4"] : null)); var sc = null; try { sc = raw ? JSON.parse(raw) : null; } catch(e){}
            var bg = {}; try { bg = JSON.parse((p.data || {})["tcj_bg_" + k] || "{}") || {}; } catch(e){}
            if(sc && s.fonte !== "diretta") aggiorna(k, { sc: sc, el: bg.c || DEF_EL[k], sync: { at: p.salvato, dirty: false } }, "salvataggio", p.salvato);
          });
        });
      }
      if(r.status === 401){ s.err = "Il token del Master non è valido"; disegnaColonna(k); disegnaTop(); return; }
      if(r.status === 403 || r.status === 429){ s.err = "GitHub chiede una pausa: riprovo tra poco"; disegnaTop(); return; }
    }).catch(function(){ s.err = "Connessione assente"; disegnaTop(); });
  }
  var ciclo = null, inVista = false, leggendo = false;
  function giro(){
    clearTimeout(ciclo);
    if(document.hidden || !(inVista || pieno) || !tokMaster()) return;
    if(leggendo){ ciclo = setTimeout(giro, 1000); return; }
    leggendo = true;
    Promise.all(CH.map(leggi)).then(function(){ leggendo = false; ciclo = setTimeout(giro, 3000); }, function(){ leggendo = false; ciclo = setTimeout(giro, 6000); });
  }

  /* ---------- barra in cima: i tre Slayer e lo schermo intero ---------- */
  function disegnaTop(){
    var t = document.getElementById("mgh-top"); if(!t) return;
    var h = '<div class="dv-tit-b"><span class="dv-occhio" aria-hidden="true">◉</span><div><b>Schede in diretta</b><small>Sola lettura · si aggiornano da sole mentre questo capitolo è aperto</small></div></div><div class="dv-chips" role="tablist">';
    CH.forEach(function(k){
      var s = ST[k], vivo = s.fonte === "diretta" && s.agg && (Date.now() - new Date(s.agg).getTime()) < 120000;
      h += '<button type="button" class="dv-chip' + (vivo ? " on" : "") + '" data-dvk="' + k + '" style="--dc:' + (EL_C[(s.d && s.d.el) || elDi(k)] || "#c8a84b") + '"><i></i>' + esc(NOME[k].split(" ")[0]) + '<small>' + (s.fonte === "diretta" ? fa(s.agg) : s.fonte ? "salvataggio" : "…") + '</small></button>';
    });
    h += '</div><button type="button" class="bk-btn dv-pieno-b" data-dvp="1">' + (pieno ? "✕ Chiudi schermo intero" : "⛶ Schermo intero") + '</button>';
    t.innerHTML = h;
  }

  /* ---------- schermo intero: le tre colonne si spostano in una finestra sopra il sito ---------- */
  var pieno = false, ov = null, segnaposto = null;
  function apriPieno(){
    var top = document.getElementById("mgh-top"), cols = document.getElementById("mgh-cols"); if(!top || !cols) return;
    if(!ov){ ov = document.createElement("div"); ov.className = "dv-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Schede in diretta"); document.body.appendChild(ov);
      ov.addEventListener("click", clicTop); }
    segnaposto = document.createComment("mgh");
    top.parentNode.insertBefore(segnaposto, top);
    ov.appendChild(top); ov.appendChild(cols); ov.hidden = false; pieno = true;
    document.documentElement.style.overflow = "hidden";
    disegnaTop(); giro();
    try { sfxPlay("paper"); } catch(e){}
    var b = ov.querySelector(".dv-pieno-b"); if(b) try { b.focus(); } catch(e){}
  }
  function chiudiPieno(){
    if(!pieno) return;
    var top = document.getElementById("mgh-top"), cols = document.getElementById("mgh-cols");
    if(segnaposto && segnaposto.parentNode){ segnaposto.parentNode.insertBefore(top, segnaposto); segnaposto.parentNode.insertBefore(cols, segnaposto); segnaposto.remove(); }
    ov.hidden = true; pieno = false; document.documentElement.style.overflow = "";
    disegnaTop();
    try { sfxPlay("swish"); } catch(e){}
  }
  function clicTop(e){
    if(e.target.closest("[data-dvp]")){ pieno ? chiudiPieno() : apriPieno(); return; }
    var c = e.target.closest("[data-dvk]");
    if(c){
      var col = document.querySelector('.mgh-col[data-k="' + c.getAttribute("data-dvk") + '"]'), box = document.getElementById("mgh-cols");
      if(col && box) box.scrollTo({ left: col.offsetLeft - box.offsetLeft - 8, behavior: RIDOTTO ? "auto" : "smooth" });
      if(col){ col.classList.remove("dv-pulsa"); void col.offsetWidth; col.classList.add("dv-pulsa"); }
    }
  }
  mb.addEventListener("click", clicTop);
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && pieno){ e.preventDefault(); chiudiPieno(); } });
  /* tocco su un valore illuminato: si spegne */
  document.addEventListener("pointerdown", function(e){ var n = e.target.closest && e.target.closest(".dv-slot .dv-nuovo"); if(n) n.classList.remove("dv-nuovo"); });

  /* ---------- avvio ---------- */
  var montato = false;
  function monta(){
    if(montato || !document.getElementById("mgh-cols")) return;
    montato = true;
    var intro = mb.parentNode && mb.parentNode.querySelector(".mq");
    if(intro && !intro.dataset.dv){ intro.dataset.dv = "1"; intro.insertAdjacentHTML("beforeend", " Qui sotto trovi anche le tre schede <b>in diretta</b>, affiancate e in sola lettura: si aggiornano a ogni modifica dei giocatori."); }
    CH.forEach(function(k){
      var sc = schedaLocale(k);
      if(sc) aggiorna(k, { sc: sc, el: elDi(k), sync: null }, "locale", null);
      else disegnaColonna(k);
      ST[k].fonte = ST[k].fonte === "locale" ? "" : ST[k].fonte;   /* la copia locale è solo un'anteprima finché arriva la diretta */
    });
    disegnaTop();
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(es){ es.forEach(function(x){ var era = inVista; inVista = x.isIntersecting; if(inVista && !era) giro(); }); }).observe(document.getElementById("mgh-cols"));
    } else { inVista = true; giro(); }
  }
  document.addEventListener("tcj-mgh-pronto", function(){ montato = false; monta(); });
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) giro(); });
  window.addEventListener("online", giro);
  setInterval(function(){ if(!document.hidden && (inVista || pieno)){ disegnaTop(); CH.forEach(function(k){ var el = slot(k), h = el && el.querySelector(".dv-head"); if(h && ST[k].d) h.outerHTML = testata(k); }); } }, 15000);
  monta();
})();
