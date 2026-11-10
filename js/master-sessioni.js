/* Zona Master — capitolo «Sessione di gioco»: Inizia sessione, Fine sessione, bot Telegram, Diario e Messaggi.
   La parte che gira sui dispositivi dei giocatori (scena nel nero, Diario di bordo, chat) è in js/sessioni.js.

   INIZIA SESSIONE
   - scrivi (o incolli) il riassunto della sessione precedente: diventa il riassunto della sua cassetta nel Diario;
   - il sito fotografa la situazione di partenza: stiva (gruppo/stiva.json), cassa di squadra (gruppo/stato.json)
     ed equipaggiamento dei tre Slayer (diretta.json, oppure dati.json, nel repository di ognuno);
   - sullo schermo di chi ha il sito aperto: dissolvenza nel nero e il riassunto che sale dal basso;
   - su Telegram (se collegato) solo «la sessione sta per iniziare»: il riassunto resta sul sito.
   FINE SESSIONE
   - il sito rifà la foto e la confronta con quella di partenza: parti di mostro ottenute, monete guadagnate e spese,
     tonici, piloni, nuclei e viveri comprati o usati. Prima di mandarlo lo vedi e ci aggiungi le tue righe;
   - poi: scena di fine sessione per tutti, nuova cassetta nel Diario, e il riepilogo su Telegram in messaggi brevi.
   TELEGRAM
   - il token del bot resta SOLO in questo browser (localStorage «tcjtg»), non va mai nel codice del sito né su GitHub;
   - i messaggi partono da qui direttamente verso api.telegram.org. «Trova il gruppo» legge il /start scritto nel gruppo.
   - a fine sessione il bot scrive solo che la sessione è finita: il riepilogo lo chiedono i giocatori con i comandi
     /parti, /monete, /risorse, /riepilogo e /help. Non c'è un server: risponde questa pagina, finché è aperta
     (Zona Master su questo dispositivo, scheda del browser aperta). Rilegge Telegram ogni pochi secondi; i comandi più
     vecchi di 15 minuti li lascia perdere. I comandi compaiono anche nel menu «/» di Telegram (setMyCommands). */
(function(){
  "use strict";
  var ms = document.getElementById("ms");
  if(!ms || !ms.querySelector(".msec") || !window.SESS) return;
  var S = window.SESS, esc = S.esc, int = S.int, CH = S.CH;

  var sec = document.createElement("div");
  sec.className = "msec"; sec.id = "m-sessione"; sec.style.borderTop = "1px solid rgba(200,56,56,.1)";
  sec.innerHTML = '<div class="msecsub">Al tavolo</div><div class="msect">Sessione di gioco</div><div class="msecl"></div><div id="mses"></div>';
  var tutte = ms.querySelectorAll(".msec"), ultima = tutte[tutte.length - 1];
  ultima.insertAdjacentElement("afterend", sec);
  var nav = ms.querySelector(".msnav");
  if(nav){ var a = document.createElement("a"); a.href = "#m-sessione"; a.textContent = "Sessione di gioco"; nav.appendChild(a); }
  var box = document.getElementById("mses");

  /* ---------- Telegram ---------- */
  function tg(){ try { return JSON.parse(localStorage.getItem("tcjtg") || "null") || {}; } catch(e){ return {}; } }
  function salvaTg(o){ try { localStorage.setItem("tcjtg", JSON.stringify(o)); } catch(e){} }
  function tgApi(metodo, param){
    var t = tg(); if(!t.token) return Promise.reject(new Error("token"));
    var corpo = new URLSearchParams(); Object.keys(param || {}).forEach(function(k){ corpo.append(k, param[k]); });
    return fetch("https://api.telegram.org/bot" + t.token + "/" + metodo, { method: "POST", body: corpo }).then(function(r){ return r.json(); }).then(function(j){ if(!j.ok) throw j; return j.result; });
  }
  function tgInvia(testo){ var t = tg(); if(!t.token || !t.chat) return Promise.resolve(false); return tgApi("sendMessage", { chat_id: t.chat, text: testo, parse_mode: "HTML", disable_web_page_preview: "true" }).then(function(){ return true; }); }
  function tgInviaTutti(L){ return L.reduce(function(p, x){ return p.then(function(){ return tgInvia(x); }); }, Promise.resolve()); }
  function h(s){ return esc(s); }

  /* ---------- comandi dei giocatori (/parti, /monete, /risorse, /riepilogo, /help) ---------- */
  var COMANDI = [["parti", "Parti di mostro ottenute nell'ultima sessione"], ["monete", "Monete guadagnate e spese nell'ultima sessione"],
    ["risorse", "Risorse comprate e usate nell'ultima sessione"], ["riepilogo", "Tutto il riepilogo dell'ultima sessione"], ["help", "I comandi che potete usare"]];
  var cmdStato = "", inAscolto = false, tCmd = null;
  function ultimaChiusa(){ var L = S.doc().diario.filter(function(c){ return c.fine && c.fine.blocchi; }); return L.length ? L[L.length - 1] : null; }
  function bloccoTesto(b){ return "<b>" + h(b.i + " " + b.t) + "</b>\n" + (b.righe && b.righe.length ? b.righe.map(function(r){ return "• " + h(r); }).join("\n") : h(b.vuoto || "Niente da segnalare.")); }
  function risposta(cmd){
    if(cmd === "help" || cmd === "start" || cmd === "aiuto")
      return "🧭 <b>Comandi del bot della Careless</b>\n" + COMANDI.map(function(c){ return "/" + c[0] + " · " + h(c[1]); }).join("\n");
    var map = { parti: /parti/i, monete: /monete/i, risorse: /risorse/i };
    if(!map[cmd] && cmd !== "riepilogo") return null;
    var c = ultimaChiusa();
    if(!c) return "Non c'è ancora una sessione chiusa: il riepilogo arriva dopo la prima «Fine sessione».";
    var testa = "📼 <b>Sessione " + int(c.n) + "</b>" + (c.titolo ? " · " + h(c.titolo) : "") + "\n\n";
    var bl = c.fine.blocchi.filter(function(b){ return cmd === "riepilogo" || map[cmd].test(b.t); });
    if(!bl.length) return testa + "Niente da segnalare.";
    return testa + bl.map(bloccoTesto).join("\n\n") + (cmd === "riepilogo" && c.fine.note ? "\n\n📜 " + h(c.fine.note) : "");
  }
  function scriviStatoCmd(t){ cmdStato = t; var p = document.getElementById("mses-cmdst"); if(p) p.textContent = t; }
  function ascolta(){
    clearTimeout(tCmd);
    var t = tg();
    if(!t.token || !t.chat || t.cmd === false){ scriviStatoCmd(""); return; }
    if(inAscolto) return; inAscolto = true;
    tgApi("getUpdates", { offset: String(int(t.off) || 0), timeout: "0", allowed_updates: '["message"]' }).then(function(L){
      var t2 = tg(), ora = Date.now() / 1000, coda = [];
      (L || []).forEach(function(u){
        t2.off = Math.max(int(t2.off), u.update_id + 1);
        var m = u.message; if(!m || !m.text || String(m.chat && m.chat.id) !== String(t2.chat) || ora - m.date > 900) return;
        var mm = /^\/([a-zA-Z]+)(?:@(\w+))?/.exec(m.text.trim()); if(!mm) return;
        if(mm[2] && t2.bot && mm[2].toLowerCase() !== String(t2.bot).toLowerCase()) return;   /* comando per un altro bot (per esempio quello dei dadi) */
        var r = risposta(mm[1].toLowerCase()); if(r) coda.push({ testo: r, a: m.message_id });
      });
      salvaTg(t2);
      return coda.reduce(function(p, x){ return p.then(function(){ return tgApi("sendMessage", { chat_id: t2.chat, text: x.testo, parse_mode: "HTML", reply_to_message_id: String(x.a), allow_sending_without_reply: "true" }); }); }, Promise.resolve())
        .then(function(){ scriviStatoCmd("In ascolto: rispondo ai comandi finché questa pagina resta aperta" + (coda.length ? " · ultima risposta alle " + S.oraIt(Date.now()) : "") + "."); });
    }).catch(function(e){ scriviStatoCmd("Non riesco a leggere i comandi da Telegram" + (e && e.description ? " (" + e.description + ")" : "") + ". Riprovo tra poco."); })
      .then(function(){ inAscolto = false; tCmd = setTimeout(ascolta, document.hidden ? 15000 : 4000); });
  }
  /* i comandi nel menu «/» di Telegram: una volta per token */
  function registraComandi(){
    var t = tg(); if(!t.token || t.reg === t.token.slice(-6)) return;
    tgApi("setMyCommands", { commands: JSON.stringify(COMANDI.map(function(c){ return { command: c[0], description: c[1] }; })) }).then(function(){ var t2 = tg(); t2.reg = t2.token.slice(-6); salvaTg(t2); }).catch(function(){});
  }
  setTimeout(function(){ registraComandi(); ascolta(); }, 2500);

  /* ---------- la foto della situazione ---------- */
  var IT = (window.STV && STV.IT) || [], EL = (window.STV && STV.EL) || [];
  function nomeIt(id){ var x = IT.filter(function(i){ return i.id === id; })[0]; if(x) return x.n; var m = /^n-(.+)$/.exec(id); if(m){ var e = EL.filter(function(z){ return z.id === m[1]; })[0]; return "Nucleo " + (e ? e.n : m[1]); } return id; }
  function eqDi(k){
    var tok = S.tokMaster(), repo = S.OWNER + "/tcj-" + k;
    return S.leggiFile(tok, repo, "diretta.json").then(function(r){
      if(r.j && r.j.sc) return r.j.sc.eq2 || null;
      return S.leggiFile(tok, repo, "dati.json").then(function(r2){
        var d = r2.j && r2.j.data, v = d && (d["tcj-sc4-" + k] || (k === CH[0] ? d["tcj-sc4"] : null));
        try { v = typeof v === "string" ? JSON.parse(v) : v; } catch(e){ v = null; }
        return v ? v.eq2 || null : null;
      });
    }).catch(function(){ return null; });
  }
  function foto(){
    var tok = S.tokMaster();
    var stiva = S.leggiFile(tok, S.GRUPPO, "stiva.json").then(function(r){ return r.j || {}; });
    var stato = S.leggiFile(tok, S.GRUPPO, "stato.json").then(function(r){ return r.j || {}; });
    return Promise.all([stiva, stato].concat(CH.map(eqDi))).then(function(R){
      var st = R[0], ca = R[1], f = { t: Date.now(), str: {}, parti: {}, disp: int(st.disp), cassa: {}, eq: {} };
      Object.keys(st.str || {}).forEach(function(k){ f.str[k] = int(st.str[k]); });
      (st.parti || []).forEach(function(p){ if(!p || !p.m) return; var k = [p.b || "", p.m, p.r || "Comune"].join("|"); f.parti[k] = (f.parti[k] || 0) + int(p.q); });
      ((ca.cassa && ca.cassa.val) || []).forEach(function(v){ if(v && v.n) f.cassa[v.n] = (f.cassa[v.n] || 0) + int(v.q); });
      CH.forEach(function(k, i){
        var e = R[2 + i], o = { sal: 0, it: {}, nuc: {} };
        if(e){
          o.sal = int(e.sal != null ? e.sal : 5);
          (e.slots || []).forEach(function(s){ if(s && s.id) o.it[s.id] = (o.it[s.id] || 0) + int(s.q); });
          var ric = Array.isArray(e.ric) ? e.ric : [].concat((e.ric && e.ric.att) || [], (e.ric && e.ric.def) || []);
          ric.forEach(function(r){ if(r && r.e) o.nuc[r.e] = (o.nuc[r.e] || 0) + 1; });
          o.ok = true;
        }
        f.eq[k] = o;
      });
      return f;
    });
  }
  /* quanti ne ha il gruppo in tutto (stiva + equipaggiamento): spostare dalla stiva allo zaino non conta come «usato» */
  function totali(f){
    var t = {};
    Object.keys(f.str || {}).forEach(function(k){ t[k] = (t[k] || 0) + int(f.str[k]); });
    Object.keys(f.eq || {}).forEach(function(pg){ var o = f.eq[pg] || {};
      Object.keys(o.it || {}).forEach(function(id){ t[id] = (t[id] || 0) + int(o.it[id]); });
      Object.keys(o.nuc || {}).forEach(function(e){ var k = "n-" + e; t[k] = (t[k] || 0) + int(o.nuc[e]); });
    });
    return t;
  }
  function riepilogo(a, b){
    var bl = [];
    /* bottino */
    var ott = [], via = [];
    Object.keys(Object.assign({}, a.parti, b.parti)).forEach(function(k){
      var d = int(b.parti[k]) - int(a.parti[k]); if(!d) return; var p = k.split("|"), n = p[1] + (p[0] ? " di " + p[0] : "") + (p[2] && p[2] !== "Comune" ? " (" + p[2] + ")" : "");
      (d > 0 ? ott : via).push(n + " ×" + Math.abs(d));
    });
    bl.push({ i: "🦴", t: "Parti di mostro ottenute", righe: ott, vuoto: "Nessuna parte nuova in stiva." });
    if(via.length) bl.push({ i: "⚒", t: "Parti usate o vendute", righe: via });
    /* monete */
    var mon = [];
    Object.keys(Object.assign({}, a.cassa, b.cassa)).forEach(function(n){ var d = int(b.cassa[n]) - int(a.cassa[n]); if(d) mon.push((d > 0 ? "Guadagnate " : "Spese ") + Math.abs(d).toLocaleString("it-IT") + " " + n); });
    var tot = 0; Object.keys(b.cassa).forEach(function(n){ tot += int(b.cassa[n]); });
    if(mon.length || Object.keys(b.cassa).length) mon.push("In cassa adesso: " + Object.keys(b.cassa).filter(function(n){ return int(b.cassa[n]); }).map(function(n){ return int(b.cassa[n]).toLocaleString("it-IT") + " " + n; }).join(" · ") || "vuota");
    bl.push({ i: "🪙", t: "Monete", righe: mon, vuoto: "Nessun movimento nella cassa di squadra." });
    /* risorse */
    var ta = totali(a), tb = totali(b), ris = [];
    Object.keys(Object.assign({}, ta, tb)).forEach(function(k){ var d = int(tb[k]) - int(ta[k]); if(d) ris.push((d > 0 ? "Comprati/ottenuti: " : "Usati: ") + nomeIt(k) + " ×" + Math.abs(d)); });
    var sa = 0, sb = 0; CH.forEach(function(k){ sa += int((a.eq[k] || {}).sal); sb += int((b.eq[k] || {}).sal); });
    if(sb < sa) ris.push("Usati: Tonico di Salute (gratuito) ×" + (sa - sb));
    var dd = int(b.disp) - int(a.disp); if(dd) ris.push((dd > 0 ? "Viveri aggiunti: " : "Viveri consumati: ") + Math.abs(dd) + (Math.abs(dd) === 1 ? " giorno" : " giorni") + " (in dispensa: " + int(b.disp) + ")");
    bl.push({ i: "🧪", t: "Risorse comprate e usate", righe: ris, vuoto: "Nessuna risorsa comprata o usata." });
    return bl;
  }

  /* ---------- disegno del capitolo ---------- */
  var bozza = null, lavoro = "";
  function tgBox(){
    var t = tg();
    var stato = !t.token ? "Non collegato" : !t.chat ? "Bot collegato · manca il gruppo" : "Collegato a «" + esc(t.nome || "gruppo") + "»";
    return '<div class="mses-tg"><div class="mses-g">🤖 Bot Telegram <span class="mses-st' + (t.token && t.chat ? " ok" : "") + '">' + stato + '</span></div>'
      + (!t.token ? '<p class="mses-n">Incolla qui il token che ti ha dato @BotFather. Resta salvato <b>solo in questo browser</b>: non finisce sul sito e non va su GitHub.</p>'
        + '<div class="mses-riga"><input type="password" id="mses-tok" placeholder="123456789:ABC…" autocomplete="off" aria-label="Token del bot"><button type="button" class="bk-btn" data-az="tok">Collega</button></div>'
        : (!t.chat ? '<p class="mses-n">Scrivi <b>/start</b> nel gruppo della campagna (con il bot già dentro), poi premi «Trova il gruppo».</p>' : '')
          + '<div class="mses-riga"><button type="button" class="bk-btn" data-az="trova">🔎 Trova il gruppo</button>' + (t.chat ? '<button type="button" class="bk-btn" data-az="prova">✉ Messaggio di prova</button>' : "")
          + '<button type="button" class="bk-btn mses-sec" data-az="scollega">Dimentica il token</button></div><div id="mses-gruppi"></div>'
          + (t.chat ? '<label class="mses-ck"><input type="checkbox" id="mses-cmd"' + (t.cmd !== false ? " checked" : "") + '> Rispondi ai comandi dei giocatori (/parti, /monete, /risorse, /riepilogo, /help) finché questa pagina è aperta</label>'
            + '<p class="mses-n" id="mses-cmdst">' + esc(cmdStato) + '</p>' : ""))
      + '</div>';
  }
  function disegna(){
    var d = S.doc(), c = d.corrente, ul = d.diario.length ? d.diario[d.diario.length - 1] : null;
    var prossimo = Math.max(c ? int(c.n) : 0, ul ? int(ul.n) : 0) + (c ? 0 : 1);
    var html = '<p class="mses-intro">Due pulsanti per la serata: <b>Inizia sessione</b> mostra a tutti il riassunto della volta scorsa, <b>Fine sessione</b> fa il conto di bottino, monete e risorse. '
      + 'Ogni sessione chiusa diventa una cassetta del <b>Diario di bordo</b> nell\'Area dello Slayer.</p>';
    if(!S.tokMaster()) html += '<p class="mses-err">Per usare le sessioni serve il token GitHub del Master su questo dispositivo (capitolo «Aree dei giocatori online»).</p>';
    if(c){
      html += '<div class="mses-on"><span class="mses-pallino"></span>Sessione ' + int(c.n) + ' in corso dalle ' + esc(S.oraIt(c.inizio)) + ' del ' + esc(S.dataIt(c.inizio)) + '</div>';
      if(bozza){
        html += '<div class="mses-card"><div class="mses-g">Riepilogo della sessione ' + int(c.n) + '</div><div class="mses-anteprima">' + bozza.blocchi.map(function(b){
          return '<div class="mses-bl"><b>' + esc(b.i + " " + b.t) + '</b>' + (b.righe.length ? '<ul>' + b.righe.map(function(r){ return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" : '<p>' + esc(b.vuoto || "") + '</p>') + '</div>';
        }).join("") + '</div>'
          + '<label class="mses-l">Titolo della cassetta (facoltativo)<input type="text" id="mses-ftit" maxlength="80" placeholder="Es. La caduta di Kharabak" value="' + esc(bozza.titolo || "") + '"></label>'
          + '<label class="mses-l">Le tue righe (facoltative)<textarea id="mses-fnote" rows="3" placeholder="Cosa è successo, in due righe">' + esc(bozza.note || "") + '</textarea></label>'
          + '<label class="mses-ck"><input type="checkbox" id="mses-ftg"' + (tg().chat ? " checked" : " disabled") + '> Avvisa su Telegram che la sessione è finita (il riepilogo lo chiedono con /parti, /monete, /risorse)</label>'
          + '<div class="mses-riga"><button type="button" class="bk-btn mses-big" data-az="chiudi">⏹ Mostra ai giocatori e chiudi la sessione</button><button type="button" class="bk-btn mses-sec" data-az="annullaBozza">Indietro</button></div></div>';
      } else {
        html += '<div class="mses-riga"><button type="button" class="bk-btn mses-big" data-az="fine">⏹ Fine sessione</button><button type="button" class="bk-btn mses-sec" data-az="annulla">Annulla la sessione in corso</button></div>';
      }
    } else {
      var prec = d.diario.filter(function(x){ return int(x.n) === prossimo - 1; })[0];
      html += '<div class="mses-card"><div class="mses-g">Prossima sessione</div>'
        + '<div class="mses-riga"><label class="mses-l mses-num">Numero<input type="number" id="mses-n" min="1" value="' + prossimo + '"></label>'
        + '<label class="mses-l mses-grow">Titolo della sessione precedente (facoltativo)<input type="text" id="mses-tit" maxlength="80" placeholder="Es. Il cielo sopra Ramsgate" value="' + esc(prec && prec.titolo || "") + '"></label></div>'
        + '<label class="mses-l">Riassunto della sessione precedente<textarea id="mses-ria" rows="6" placeholder="Lo scriviamo insieme in chat e lo incolli qui. Lascia una riga vuota tra un paragrafo e l\'altro.">' + esc(prec && prec.riassunto || "") + '</textarea></label>'
        + '<label class="mses-ck"><input type="checkbox" id="mses-itg"' + (tg().chat ? " checked" : " disabled") + '> Avvisa su Telegram che la sessione sta per iniziare</label>'
        + '<div class="mses-riga"><button type="button" class="bk-btn mses-big" data-az="inizia">▶ Inizia sessione</button><button type="button" class="bk-btn mses-sec" data-az="anteprima">👁 Prova la scena solo qui</button></div></div>';
    }
    html += lavoro ? '<p class="mses-lav">' + esc(lavoro) + '</p>' : "";
    html += '<div class="mses-riga mses-alt"><button type="button" class="bk-btn" data-az="diario">📼 Apri il Diario di bordo</button><button type="button" class="bk-btn" data-az="msg">✉ Messaggi agli Slayer</button>'
      + (d.scena ? '<button type="button" class="bk-btn" data-az="rivedi">↺ Rivedi l\'ultima scena qui</button>' : "") + '</div>';
    html += tgBox();
    var att = document.activeElement, idA = att && att.id, val = {};
    ["mses-tit", "mses-ria", "mses-n", "mses-ftit", "mses-fnote", "mses-tok"].forEach(function(i){ var x = document.getElementById(i); if(x) val[i] = x.value; });
    box.innerHTML = html;
    Object.keys(val).forEach(function(i){ var x = document.getElementById(i); if(x) x.value = val[i]; });
    if(idA && document.getElementById(idA)) try { document.getElementById(idA).focus({ preventScroll: true }); } catch(e){}
  }
  S.on(function(){ if(!box.contains(document.activeElement) || document.activeElement.tagName === "BUTTON") disegna(); });
  disegna(); S.leggi();
  function stato(t){ lavoro = t || ""; var p = box.querySelector(".mses-lav"); if(p){ p.textContent = lavoro; p.hidden = !lavoro; } else disegna(); }
  function errore(e){ console.error(e); stato("Qualcosa non è andato: " + (e && e.status === 401 ? "il token GitHub del Master non è valido." : e && e.description ? "Telegram dice: " + e.description : "controlla la connessione e riprova.")); }
  function rid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function linkSito(){ return location.origin + location.pathname; }

  box.addEventListener("change", function(e){ if(e.target.id === "mses-cmd"){ var t = tg(); t.cmd = e.target.checked; salvaTg(t); if(t.cmd) ascolta(); else { clearTimeout(tCmd); scriviStatoCmd("Comandi spenti: il bot non risponde."); } } });
  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-az]"); if(!b) return;
    var az = b.getAttribute("data-az"), d = S.doc();
    if(az === "diario"){ if(window.sesDiario) sesDiario(); return; }
    if(az === "msg"){ S.apriMessaggi(); return; }
    if(az === "rivedi"){ if(d.scena) S.mostra(d.scena); return; }
    if(az === "anteprima"){
      S.mostra({ id: "prova-" + rid(), tipo: "inizio", n: int(($("mses-n") || {}).value) || 1, titolo: (($("mses-tit") || {}).value || "").trim(), testo: (($("mses-ria") || {}).value || "").trim(), t: Date.now() });
      return;
    }
    if(az === "inizia"){
      var n = int($("mses-n").value) || 1, tit = $("mses-tit").value.trim(), ria = $("mses-ria").value.trim(), avvisa = $("mses-itg").checked;
      b.disabled = true; stato("Fotografo la situazione di partenza (stiva, cassa, equipaggiamento)…");
      foto().then(function(f){
        stato("Salvo e mostro la scena ai giocatori…");
        var scena = { id: rid(), tipo: "inizio", n: n, titolo: tit, testo: ria, t: Date.now() };
        return S.modifica(function(x){
          x.corrente = { n: n, inizio: new Date().toISOString(), foto: f };
          if(n > 1 && (ria || tit)){
            var c = x.diario.filter(function(z){ return int(z.n) === n - 1; })[0];
            if(!c){ c = { n: n - 1 }; x.diario.push(c); }
            if(ria) c.riassunto = ria; if(tit) c.titolo = tit;
          }
          x.scena = scena;
        }, "Sessione " + n + " · inizio").then(function(){
          S.mostra(scena);
          if(avvisa) return tgInvia("🎬 <b>The Careless Journey</b>\nLa sessione " + n + " sta per iniziare!\n\n" + h(linkSito())).catch(function(e){ stato("Sessione iniziata, ma Telegram non ha ricevuto il messaggio" + (e && e.description ? ": " + e.description : ".")); throw "tg"; });
        });
      }).then(function(){ stato("Sessione " + n + " iniziata."); }).catch(function(e){ if(e !== "tg") errore(e); }).then(function(){ b.disabled = false; disegna(); });
      return;
    }
    if(az === "fine"){
      if(!d.corrente || !d.corrente.foto){ stato("Non trovo la foto di inizio sessione: premi «Annulla la sessione in corso» e poi «Inizia sessione»."); return; }
      b.disabled = true; stato("Confronto la situazione di adesso con quella di inizio sessione…");
      foto().then(function(f){ bozza = { blocchi: riepilogo(d.corrente.foto, f), foto: f, note: "", titolo: "" }; stato(""); disegna(); }).catch(function(e){ errore(e); b.disabled = false; });
      return;
    }
    if(az === "annullaBozza"){ bozza = null; disegna(); return; }
    if(az === "chiudi"){
      if(!bozza || !d.corrente) return;
      var c0 = d.corrente, note = $("mses-fnote").value.trim(), titf = $("mses-ftit").value.trim(), manda = $("mses-ftg").checked, bl = bozza.blocchi;
      b.disabled = true; stato("Chiudo la sessione e la mostro ai giocatori…");
      var scena = { id: rid(), tipo: "fine", n: int(c0.n), titolo: titf, blocchi: bl, note: note, t: Date.now() };
      S.modifica(function(x){
        var c = x.diario.filter(function(z){ return int(z.n) === int(c0.n); })[0];
        if(!c){ c = { n: int(c0.n) }; x.diario.push(c); }
        c.data = c0.inizio; if(titf) c.titolo = titf;
        c.fine = { blocchi: bl, note: note, data: new Date().toISOString() };
        x.corrente = null; x.scena = scena;
      }, "Sessione " + int(c0.n) + " · fine").then(function(){
        S.mostra(scena); bozza = null;
        if(!manda) return;
        var testi = ["🏁 <b>Fine della sessione " + int(c0.n) + "</b>" + (titf ? " · " + h(titf) : "") + "\n\nIl riepilogo lo chiedete a me: /parti · /monete · /risorse · /riepilogo\n/help per tutti i comandi"];
        return tgInviaTutti(testi).catch(function(e){ stato("Sessione chiusa, ma Telegram non ha ricevuto il riepilogo" + (e && e.description ? ": " + e.description : ".")); throw "tg"; });
      }).then(function(){ stato("Sessione " + int(c0.n) + " chiusa: la cassetta è nel Diario di bordo."); }).catch(function(e){ if(e !== "tg") errore(e); }).then(function(){ disegna(); });
      return;
    }
    if(az === "annulla"){
      (typeof tcjConferma === "function" ? tcjConferma({ titolo: "Annullare la sessione in corso?", testo: "La sessione " + int(d.corrente.n) + " torna «non iniziata». Il riassunto già mostrato resta nel Diario; il riepilogo di fine sessione non verrà fatto.", si: "Sì, annulla", attesa: 1 }) : Promise.resolve(true))
        .then(function(ok){ if(!ok) return; bozza = null; S.modifica(function(x){ x.corrente = null; }, "Sessione annullata").then(function(){ stato("Sessione annullata."); }).catch(errore); });
      return;
    }
    /* Telegram */
    if(az === "tok"){
      var v = ($("mses-tok").value || "").trim();
      if(!/^\d+:[\w-]{20,}$/.test(v)){ stato("Questo non sembra un token di Telegram: è fatto come 123456789:ABC… e lo trovi nel messaggio di @BotFather."); return; }
      salvaTg({ token: v }); stato("Controllo il token…");
      tgApi("getMe").then(function(me){ var t = tg(); t.bot = me.username; salvaTg(t); stato("Bot @" + me.username + " collegato. Ora scrivi /start nel gruppo e premi «Trova il gruppo»."); disegna(); })
        .catch(function(e){ salvaTg({}); stato("Telegram non riconosce questo token" + (e && e.description ? " (" + e.description + ")" : "") + "."); disegna(); });
      return;
    }
    if(az === "trova"){
      stato("Cerco i gruppi in cui hai scritto /start…");
      tgApi("getUpdates", { allowed_updates: '["message","my_chat_member"]' }).then(function(L){
        var visti = {}, G = [];
        (L || []).forEach(function(u){ var m = u.message || u.my_chat_member, c = m && m.chat; if(c && (c.type === "group" || c.type === "supergroup") && !visti[c.id]){ visti[c.id] = 1; G.push(c); } });
        var g = $("mses-gruppi");
        if(!G.length){ stato("Non trovo nessun gruppo: controlla che il bot sia nel gruppo e scrivi /start (meglio /start@" + (tg().bot || "nomedelbot") + "), poi riprova."); if(g) g.innerHTML = ""; return; }
        stato(G.length === 1 ? "Trovato! Premi il gruppo per sceglierlo." : "Scegli il gruppo della campagna:");
        if(g) g.innerHTML = G.map(function(c){ return '<button type="button" class="bk-btn" data-az="sceglie" data-id="' + esc(c.id) + '" data-nome="' + esc(c.title || "gruppo") + '">👥 ' + esc(c.title || c.id) + '</button>'; }).join("");
      }).catch(errore);
      return;
    }
    if(az === "sceglie"){ var t = tg(); t.chat = b.getAttribute("data-id"); t.nome = b.getAttribute("data-nome"); salvaTg(t); stato("Gruppo «" + t.nome + "» scelto."); disegna(); registraComandi(); ascolta(); return; }
    if(az === "prova"){ stato("Mando un messaggio di prova…"); tgInvia("🧭 Il bot della Careless è collegato. Qui arriveranno gli avvisi di inizio sessione e il bottino di fine sessione.").then(function(){ stato("Messaggio di prova mandato: controlla il gruppo."); }).catch(errore); return; }
    if(az === "scollega"){
      (typeof tcjConferma === "function" ? tcjConferma({ titolo: "Dimenticare il token del bot?", testo: "Questo browser non potrà più scrivere nel gruppo finché non incolli di nuovo il token. Il bot resta su Telegram.", si: "Sì, dimentica", attesa: 1 }) : Promise.resolve(true))
        .then(function(ok){ if(ok){ salvaTg({}); stato("Token dimenticato."); disegna(); } });
      return;
    }
  });
  function $(id){ return document.getElementById(id); }
})();
