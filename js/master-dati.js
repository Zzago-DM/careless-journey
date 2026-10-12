/* Zona Master: note libere, Plancia Behemoth e dossier umanoidi salvati.
   - Si salvano subito in questo browser e, dopo un paio di secondi, nel repository privato tcj-master
     (note.json, plancia.json) con il token del Master.
   - All'apertura del sito scaricano l'ultima versione: li ritrovi uguali su ogni dispositivo con il token.
   - Se lo stesso file è stato cambiato su due dispositivi, chiede quale versione tenere. */
(function(){
  if(typeof TCJ_MASTER === "undefined" || !TCJ_MASTER) return;      // solo dove la Zona Master è presente
  var API = "https://api.github.com/repos/Zzago-DM/tcj-master/contents/";
  var FILE = { note: "note.json", plancia: "plancia.json" }, LOC = { note: "tcj-mnote", plancia: "tcj-mplancia" };
  var NOMI = { note: "Note del Master", plancia: "Plancia e dossier" };
  var NOTES = [], muto = false, timer = {}, occupato = {}, pronto = false;   /* pronto: prima del caricamento completo (es. la Behemoth vuota di partenza) non si salva nulla */
  window.addEventListener("load", function(){ setTimeout(function(){ pronto = true; }, 0); });

  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function meta(f){ try { return JSON.parse(localStorage.getItem("tcjgh_msync_"+f) || "null") || {}; } catch(e){ return {}; } }
  function salvaMeta(f, m){ try { localStorage.setItem("tcjgh_msync_"+f, JSON.stringify(m)); } catch(e){} }
  function quando(iso){ try { return new Date(iso).toLocaleString("it-IT", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"}); } catch(e){ return iso; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function b64e(str){ var by = new TextEncoder().encode(str), bin = ""; for(var i=0;i<by.length;i+=0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i+0x8000)); return btoa(bin); }
  function b64d(b){ var bin = atob(String(b).replace(/\s/g,"")), by = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i] = bin.charCodeAt(i); return new TextDecoder().decode(by); }
  function gh(metodo, nome, corpo){
    var h = { "Authorization": "Bearer " + token(), "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if(corpo) h["Content-Type"] = "application/json";
    return fetch(API + nome, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined, cache: "no-store" });
  }

  /* ---------- dati <-> pagina ---------- */
  function raccogli(f){
    if(f === "note") return NOTES;
    return { pl: { state: (typeof plState !== "undefined" ? plState : {}), counter: (typeof plCounter !== "undefined" ? plCounter : 0) }, npc: (typeof NPC_DOSS !== "undefined" ? NPC_DOSS : []) };
  }
  function metti(f, d){
    muto = true;
    try {
      if(f === "note"){ NOTES = Array.isArray(d) ? d : []; disegnaNote(); }
      else {
        d = d || {}; var pl = d.pl || {};
        plState = pl.state || {}; plCounter = pl.counter || Object.keys(plState).length;
        NPC_DOSS = Array.isArray(d.npc) ? d.npc : [];
        try { plRender(); } catch(e){}
        try { npcRender(); } catch(e){}
      }
    } finally { muto = false; }
  }
  function locale(f){ try { return JSON.parse(localStorage.getItem(LOC[f]) || "null"); } catch(e){ return null; } }
  function cambio(f){
    if(muto || !pronto) return;
    var ora = new Date().toISOString();
    try { localStorage.setItem(LOC[f], JSON.stringify({ salvato: ora, data: raccogli(f) })); } catch(e){}
    var m = meta(f); m.dirty = true; m.loc = ora; salvaMeta(f, m); stato(f);
    clearTimeout(timer[f]); timer[f] = setTimeout(function(){ invia(f); }, 2500);
  }
  window.tcjMasterCambio = cambio;

  /* ---------- online ---------- */
  function leggi(f){
    return gh("GET", FILE[f]).then(function(r){
      if(r.status === 404) return { vuoto: true };
      if(!r.ok) throw r.status;
      return r.json().then(function(j){ return { dati: JSON.parse(b64d(j.content || "")), sha: j.sha }; });
    });
  }
  function invia(f, forza){
    if(!token() || occupato[f]) return;
    var loc = locale(f); if(!loc) return;
    var m = meta(f), corpo = { message: NOMI[f] + " — " + quando(loc.salvato), content: b64e(JSON.stringify(loc)) };
    if(m.sha) corpo.sha = m.sha;
    occupato[f] = 1; stato(f);
    var prima = forza ? leggi(f).then(function(r){ if(r.sha) corpo.sha = r.sha; }) : Promise.resolve();
    prima.then(function(){ return gh("PUT", FILE[f], corpo); }).then(function(r){
      occupato[f] = 0;
      if(r.status === 409 || r.status === 422){ return leggi(f).then(function(res){ if(res.dati) scegli(f, res.dati, res.sha); }); }
      if(!r.ok) throw r.status;
      return r.json().then(function(j){ var m2 = meta(f); m2.sha = j.content && j.content.sha; m2.at = loc.salvato; if(m2.loc === loc.salvato) m2.dirty = false; salvaMeta(f, m2); stato(f); if(meta(f).dirty) cambio(f); });
    }).catch(function(){ occupato[f] = 0; var m3 = meta(f); m3.err = 1; salvaMeta(f, m3); stato(f); });
  }
  function scarica(f){
    if(!token()) return;
    occupato[f] = 1; stato(f);
    leggi(f).then(function(res){
      occupato[f] = 0;
      var m = meta(f);
      if(res.vuoto){ if(locale(f)) invia(f); stato(f); return; }
      var rem = res.dati;
      if(rem.salvato === m.at){ m.sha = res.sha; salvaMeta(f, m); stato(f); return; }
      if(!m.dirty || !locale(f)){ applicaOnline(f, rem, res.sha); return; }
      scegli(f, rem, res.sha);
    }).catch(function(){ occupato[f] = 0; stato(f); });
  }
  function applicaOnline(f, rem, sha){
    try { localStorage.setItem(LOC[f], JSON.stringify(rem)); } catch(e){}
    metti(f, rem.data);
    var m = meta(f); m.sha = sha; m.at = rem.salvato; m.dirty = false; m.loc = rem.salvato; m.err = 0; salvaMeta(f, m); stato(f);
  }

  /* ---------- scelta tra due versioni ---------- */
  var ov = document.createElement("div"); ov.className = "gh-ov"; ov.hidden = true; ov.setAttribute("role","dialog"); ov.setAttribute("aria-modal","true"); document.body.appendChild(ov);
  function scegli(f, rem, sha){
    var m = meta(f);
    ov.innerHTML = '<div class="gh-box2"><div class="gh-t">' + NOMI[f] + ': due versioni</div>'
      + '<p class="gh-p">Su un altro dispositivo è stata salvata una versione il <b>' + quando(rem.salvato) + '</b>, ma anche qui ci sono modifiche' + (m.loc ? ' del <b>' + quando(m.loc) + '</b>' : '') + ' non ancora salvate online. Quale tieni?</p>'
      + '<div class="gh-row gh-col"><button type="button" class="bk-btn gh-save" data-s="qui">Tieni quella di questo dispositivo</button>'
      + '<button type="button" class="bk-btn" data-s="online">Tieni quella online</button></div></div>';
    ov.hidden = false;
    ov.querySelectorAll("[data-s]").forEach(function(b){ b.onclick = function(){
      ov.hidden = true;
      if(b.getAttribute("data-s") === "online") applicaOnline(f, rem, sha);
      else { var m2 = meta(f); m2.sha = sha; salvaMeta(f, m2); invia(f, true); }
    }; });
  }

  /* ---------- indicatore di salvataggio ---------- */
  function stato(f){
    var el = document.getElementById("mdat-st-" + f); if(!el) return;
    var m = meta(f), t = !token() ? "Salvato su questo dispositivo"
      : occupato[f] ? "⟳ Sincronizzo…"
      : m.err && m.dirty ? "⚠ Non salvato online: riprovo alla prossima modifica"
      : m.dirty ? "● Salvataggio…"
      : m.at ? "☁ Salvato su tutti i tuoi dispositivi · " + quando(m.at) : "☁ Pronto";
    el.textContent = t; el.className = "mdat-st" + (m.dirty ? " warn" : (m.at ? " ok" : ""));
  }
  function aggiungiStato(f, dove){
    if(!dove || document.getElementById("mdat-st-" + f)) return;
    var s = document.createElement("div"); s.id = "mdat-st-" + f; s.className = "mdat-st"; dove.appendChild(s); stato(f);
  }

  /* ---------- note libere ---------- */
  var nb = document.getElementById("mnote-body");
  function disegnaNote(){
    if(!nb) return;
    var h = '<div class="mn-list">';
    NOTES.forEach(function(n, i){
      h += '<div class="mn-item" data-i="' + i + '"><div class="mn-head">'
        + '<input class="mn-t" value="' + esc(n.t) + '" placeholder="Titolo della nota" aria-label="Titolo della nota">'
        + '<button type="button" class="mn-b" data-a="su" title="Sposta su" aria-label="Sposta su"' + (i === 0 ? ' disabled' : '') + '>↑</button>'
        + '<button type="button" class="mn-b" data-a="giu" title="Sposta giù" aria-label="Sposta giù"' + (i === NOTES.length - 1 ? ' disabled' : '') + '>↓</button>'
        + '<button type="button" class="mn-b mn-del" data-a="del" title="Elimina la nota" aria-label="Elimina la nota">✕</button></div>'
        + '<textarea class="mn-x" placeholder="Scrivi qui…" aria-label="Testo della nota">' + esc(n.b) + '</textarea></div>';
    });
    if(!NOTES.length) h += '<div class="mn-vuoto">Nessuna nota: aggiungine una.</div>';
    h += '</div><button type="button" class="pl-add-btn mn-add" data-a="add">+ Aggiungi nota</button>';
    nb.innerHTML = h;
    nb.querySelectorAll(".mn-x").forEach(cresci);
    aggiungiStato("note", nb);
  }
  function cresci(ta){ ta.style.height = "auto"; ta.style.height = Math.max(110, ta.scrollHeight + 2) + "px"; }
  if(nb){
    nb.addEventListener("input", function(e){
      var it = e.target.closest(".mn-item"); if(!it) return; var i = +it.getAttribute("data-i");
      if(e.target.classList.contains("mn-t")) NOTES[i].t = e.target.value;
      else if(e.target.classList.contains("mn-x")){ NOTES[i].b = e.target.value; cresci(e.target); }
      cambio("note");
    });
    nb.addEventListener("click", function(e){
      var b = e.target.closest("[data-a]"); if(!b || b.disabled) return;
      var a = b.getAttribute("data-a"), it = b.closest(".mn-item"), i = it ? +it.getAttribute("data-i") : -1;
      if(a === "add"){ NOTES.push({ t: "Nuova nota", b: "" }); disegnaNote(); var ts = nb.querySelectorAll(".mn-t"); var u = ts[ts.length - 1]; if(u){ u.focus(); u.select(); } try{ sfxPlay("paper"); }catch(_){} }
      else if(a === "del"){ if(!confirm("Eliminare la nota «" + (NOTES[i].t || "senza titolo") + "»?")) return; NOTES.splice(i, 1); disegnaNote(); try{ sfxPlay("drop"); }catch(_){} }
      else if(a === "su" && i > 0){ var x = NOTES.splice(i, 1)[0]; NOTES.splice(i - 1, 0, x); disegnaNote(); }
      else if(a === "giu" && i < NOTES.length - 1){ var y = NOTES.splice(i, 1)[0]; NOTES.splice(i + 1, 0, y); disegnaNote(); }
      else return;
      cambio("note");
    });
  }

  /* ---------- Plancia: ogni modifica viene salvata ---------- */
  if(typeof plRender === "function"){ var _pr = plRender; plRender = function(){ var r = _pr.apply(this, arguments); cambio("plancia"); return r; }; }
  if(typeof plSetPvCur === "function"){ var _pv = plSetPvCur; plSetPvCur = function(){ var r = _pv.apply(this, arguments); cambio("plancia"); return r; }; }
  if(typeof plSetVar === "function"){ var _sv = plSetVar; plSetVar = function(){ var r = _sv.apply(this, arguments); cambio("plancia"); return r; }; }

  /* ---------- avvio: prima la copia di questo browser, poi quella online ---------- */
  var ln = locale("note");
  if(ln) metti("note", ln.data);
  else {   /* prima volta: riprende le vecchie note a schede */
    var vecchie = [["generale","📋 Generale"],["sessione","🗓 Prossima sessione"],["trame","🕸 Trame in corso"],["npc","🎭 NPC & Fazioni"]].map(function(v){ var b = ""; try { b = localStorage.getItem("tcj-mn-" + v[0]) || ""; } catch(e){} return { t: v[1], b: b }; });
    metti("note", vecchie);
    if(vecchie.some(function(n){ return n.b; })) window.addEventListener("load", function(){ setTimeout(function(){ cambio("note"); }, 10); });
  }
  var lp = locale("plancia"); if(lp) metti("plancia", lp.data);
  var pq = document.getElementById("pl-list"); if(pq) aggiungiStato("plancia", pq.parentNode);
  if(token()){ scarica("note"); scarica("plancia"); }
  document.addEventListener("visibilitychange", function(){ if(!document.hidden && token()){ ["note","plancia"].forEach(function(f){ if(!meta(f).dirty) scarica(f); }); } });
  window.addEventListener("pagehide", function(){ ["note","plancia"].forEach(function(f){ if(meta(f).dirty){ clearTimeout(timer[f]); invia(f); } }); });
})();
