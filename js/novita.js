/* Schermate iniziali: le novità del sito e la scelta del dispositivo.

   1. NOVITÀ — una schermata per ogni aggiornamento, una alla volta («Novità · 1 di 6», «Ho capito →», «← Indietro»).
      Ogni novità si vede una volta sola per dispositivo: quelle già lette stanno in tcj-novita-viste.
      Per annunciarne una nuova basta aggiungerla in fondo all'elenco NOVITA con un id mai usato.
      ATTENZIONE: qui va solo ciò che i giocatori possono sapere. Mai Zona Master, segreti, lore nascosta
      o sorprese (per esempio le animazioni di sblocco delle zone).
   2. DISPOSITIVO — «Telefono · versione leggera» oppure «Computer · versione completa», chiesto una volta sola
      per dispositivo (chiave tcj-dispositivo), con già segnata quella adatta. Si cambia quando si vuole dal menu
      ⚔ Slayer → «Dispositivo».
   Le schermate compaiono prima di tutto il resto: l'animazione d'apertura (js/intro.js) aspetta che siano chiuse.
   Nella versione leggera l'animazione d'apertura non c'è proprio. */
(function(){
  var NOVITA = [
    { id: "2026-10-viaggi", i: "⛵", t: "Viaggi sulla Mappa del Mondo", p: [
      "Sulla Mappa del Mondo c'è un nuovo pannello, <b>«⛵ Viaggi»</b>, che vi serve a pianificare le traversate della Careless Journey.",
      "Scegliete il continente di partenza e quello d'arrivo (anche Ramsgate) e le condizioni del cielo: <b>Cielo sereno</b>, <b>Venti contrari</b>, <b>Burrasca</b> o <b>Tempesta aetherica</b>. Il pannello vi dice quanti giorni di navigazione servono e disegna la rotta sulla mappa, che gira sempre attorno al Maelstrom, mai attraverso.",
      "Il brutto tempo non cambia la rotta, rallenta solo la nave, quindi la stessa traversata con la Burrasca dura di più.",
      "Ognuno di voi gestisce la propria nave: dove si trova e il viaggio in corso restano salvati nella vostra Area dello Slayer e vi seguono su ogni dispositivo quando salvate online."
    ]},
    { id: "2026-10-area", i: "✎", t: "La vostra Area dello Slayer, a modo vostro", p: [
      "Nell'Area dello Slayer c'è il pulsante <b>«✎ Modifica area»</b>. Trascinate le sezioni dove volete; con la maniglia nell'angolo scegliete se una sezione occupa mezza riga o la riga intera, e quanto è grande: <b>Intera</b>, <b>Media</b>, <b>Compatta</b> o <b>Chiusa</b>. Quando avete finito premete <b>«Conferma →»</b>: vedete l'area <b>prima</b> e <b>dopo</b>, e decidete se salvarla, continuare a modificarla o lasciar perdere.",
      "Sopra la scheda c'è anche la barra <b>«Aspetto dell'area»</b>. La scheda classica, quella di sempre, resta la scelta di base; in alternativa l'area può diventare una libreria di <b>libri</b>, uno scaffale di <b>ampolle</b>, una <b>cassettiera</b>, un <b>tavolo pirata</b>, una parete di <b>attrezzi</b>, dei <b>capitoli</b> o una <b>bacheca</b>.",
      "Toccate un oggetto per aprire la sezione che contiene; <b>«↻ Mescola»</b> cambia la disposizione. Le ampolle si personalizzano una per una, nella forma e nel colore. La scelta si salva online con il vostro personaggio.",
      "<small>Gli aspetti dell'area ci sono solo nella versione completa del sito.</small>"
    ]},
    { id: "2026-10-temi", i: "🎨", t: "I temi del sito", p: [
      "Dal menu in alto a destra, <b>⚔ Slayer ▾ → «Tema del sito»</b>, potete cambiare l'aspetto di tutto il sito:",
      "<span class=\"nov-el\"><b>Attuale</b> — quello di sempre.<br><b>Cieli Tersi</b> — un cielo azzurro con isole sospese, menu blu e oro.<br><b>Manuale classico</b> — pergamena e calligrafia.<br><b>Cacciatore</b> — una valle al tramonto, con draghi, una fenice e un accampamento.<br><b>Gastrocomiche</b> — un'osteria, con i titoli scritti col gesso sulla lavagna.<br><b>Reami Dimenticati</b> — un tempio sotterraneo illuminato dal fuoco.</span>",
      "Ogni tema ha i suoi caratteri e segue il colore del vostro Aether. La scelta si salva con il personaggio, così vi segue su ogni dispositivo.",
      "<small>I temi ci sono solo nella versione completa del sito.</small>"
    ]},
    { id: "2026-10-schede", i: "👆", t: "Schede più comode", p: [
      "Nelle schede dei <b>Maestri</b>, dei <b>Behemoth</b> e degli <b>Incontri</b> potete scorrere con il dito verso destra o verso sinistra per passare alla scheda precedente o a quella successiva.",
      "Negli Incontri lo stesso gesto sfoglia anche le foto di gruppo.",
      "Le foto ora si vedono sempre intere, anche su iPhone."
    ]},
    { id: "2026-10-pv", i: "❤", t: "Danni e cure su misura", p: [
      "Nella scheda, sotto i <b>Punti Vita</b>, oltre ai pulsanti −5, −1, +1 e +5 c'è una casella in cui scrivere qualunque numero: premete <b>«− Danno»</b> per toglierlo o <b>«+ Cura»</b> per aggiungerlo.",
      "Così anche un colpo da 23 si segna con un tocco solo, e il Gruppo riceve un unico aggiornamento invece di tanti di fila."
    ]},
    { id: "2026-10-cassa", i: "💰", t: "La cassa di squadra", p: [
      "Nella sezione <b>Il Gruppo</b> c'è la nuova <b>«💰 Cassa di squadra»</b>: le monete del gruppo, uguali per tutti e aggiornate in diretta, come i Punti Vita.",
      "In alto c'è il <b>totale del gruppo</b>, che si calcola da solo; sotto, le monete divise per <b>valuta</b>. Per spendere o incassare scegliete la valuta (oppure toccatela nell'elenco), scrivete quante monete e premete <b>«− Togli»</b> o <b>«+ Aggiungi»</b>.",
      "Con <b>«+ Nuova valuta»</b> chiunque può aggiungerne una; una valuta si elimina con la × solo quando è a zero.",
      "Ogni movimento compare subito a tutti con un avviso (per esempio «Athena ha tolto 40 …») e resta negli <b>ultimi 10 movimenti</b>, sotto la cassa."
    ]},
    { id: "2026-10-reami-pietra", i: "🏛", t: "Reami Dimenticati in pietra", p: [
      "Nel tema <b>Reami Dimenticati</b> i riquadri di testo non sono più di pergamena: sono <b>muri di pietra scura</b>, a blocchi, con le scritte incise e illuminate dalla luce delle torce del tempio.",
      "Il tema si sceglie dal menu <b>⚔ Slayer ▾ → «Tema del sito»</b> (solo nella versione completa)."
    ]},
    { id: "2026-10-tema-arena", i: "🚀", t: "Nuovo tema: Arena", p: [
      "C'è un nuovo tema del sito, <b>Arena</b>, ispirato ai menu dei vecchi giochi di fantascienza per PS2.",
      "Sullo sfondo una <b>stazione spaziale</b> con due grandi anelli che girano in versi opposti, luci che lampeggiano e navicelle che passano. I riquadri sono pannelli di metallo con la cornice d'acciaio, i titoli stanno in una targa arancione semitrasparente con un leggero disturbo da vecchio televisore.",
      "Si sceglie dal menu <b>⚔ Slayer ▾ → «Tema del sito»</b> (solo nella versione completa). Sul telefono la stazione resta ferma, per non appesantire il sito."
    ]},
    { id: "2026-10-leggera", i: "📱", t: "Versione leggera per il telefono", p: [
      "Da oggi il sito ha due versioni.",
      "La <b>versione completa</b>, pensata per il computer, ha tutto: l'animazione d'apertura, i temi, gli aspetti dell'area, gli effetti laterali, le particelle e i suoni.",
      "La <b>versione leggera</b>, pensata per il telefono, toglie animazioni, temi, effetti e suoni: il sito è più veloce e consuma meno batteria. Tutti i contenuti e tutte le funzioni restano: scheda, Gruppo, mappe, viaggi, incontri. Anche il colore del vostro Aether resta.",
      "Nella prossima schermata scegliete quale usare su questo dispositivo. Potete cambiarla quando volete dal menu <b>⚔ Slayer → «Dispositivo»</b>."
    ]}
  ];
  var KV = "tcj-novita-viste", KD = "tcj-dispositivo";
  var L = null; try { L = window.localStorage; L.setItem("tcj-prova", "1"); L.removeItem("tcj-prova"); } catch(e){ L = null; }
  function leggi(k){ try { return L ? L.getItem(k) : null; } catch(e){ return null; } }
  function scrivi(k, v){ try { if(L) L.setItem(k, v); } catch(e){} }
  function viste(){ try { var a = JSON.parse(leggi(KV) || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } }
  function segna(id){ var a = viste(); if(a.indexOf(id) < 0){ a.push(id); scrivi(KV, JSON.stringify(a)); } }

  var leggero = !!window.TCJ_LEGGERO, tel = !!window.TCJ_TEL;
  window.tcjDispositivo = function(){ var d = leggi(KD); return d === "telefono" || d === "computer" ? d : (tel ? "telefono" : "computer"); };
  /* salva la scelta; se cambia versione la pagina si ricarica (stesso punto della pagina) */
  window.tcjDispositivoSet = function(v){
    if(v !== "telefono" && v !== "computer") return;
    scrivi(KD, v);
    if((v === "telefono") !== leggero){ try { sessionStorage.setItem("tcj-scroll", String(window.scrollY || 0)); sessionStorage.setItem("tcj-no-intro", "1"); } catch(e){} location.reload(); return true; }
    return false;
  };
  /* riga del menu ⚔ Slayer (la inserisce slRender in js/area-giocatori.js) */
  window.tcjDispositivoRiga = function(){
    var v = tcjDispositivo();
    return '<div class="sl-row sl-mq"><div><span>Dispositivo</span><small>' + (leggero ? "Versione leggera, senza animazioni né effetti" : "Versione completa, con animazioni, temi ed effetti") + '</small></div>' +
      '<select class="sl-mqsel" aria-label="Dispositivo" onchange="tcjDispositivoSet(this.value)">' +
      '<option value="telefono"' + (v === "telefono" ? " selected" : "") + '>📱 Telefono</option>' +
      '<option value="computer"' + (v === "computer" ? " selected" : "") + '>💻 Computer</option></select></div>';
  };
  /* dopo il ricaricamento per il cambio di versione torno dove si era */
  try { var y = sessionStorage.getItem("tcj-scroll"); if(y !== null){ sessionStorage.removeItem("tcj-scroll"); window.addEventListener("load", function(){ setTimeout(function(){ window.scrollTo(0, parseInt(y, 10) || 0); }, 50); }); } } catch(e){}

  /* nella versione leggera niente animazione d'apertura (e nemmeno dopo un cambio di versione dal menu) */
  var noIntro = false; try { noIntro = sessionStorage.getItem("tcj-no-intro") === "1"; sessionStorage.removeItem("tcj-no-intro"); } catch(e){}
  if(leggero || noIntro){ var it = document.getElementById("intro"); if(it) it.remove(); }
  /* …e i disegni SVG animati (bagliori sulla mappa, nuvole, rotta della nave) restano fermi:
     fermo il loro orologio appena compaiono, anche quelli aggiunti dopo (l'isola del Maelstrom non è SVG animato, resta com'è) */
  if(leggero){
    var ferma = function(r){
      if(!r || !r.querySelectorAll) return;
      var s = r.tagName && r.tagName.toLowerCase() === "svg" ? [r] : [];
      Array.prototype.push.apply(s, r.querySelectorAll("svg"));
      s.forEach(function(x){ if(!x.ownerSVGElement && x.pauseAnimations && x.querySelector("animate,animateTransform,animateMotion,set")){ try { x.pauseAnimations(); } catch(e){} } });
    };
    var tutti = function(){ ferma(document.body); };
    document.addEventListener("DOMContentLoaded", tutti); window.addEventListener("load", tutti);
    try {
      new MutationObserver(function(ls){
        ls.forEach(function(m){ for(var i = 0; i < m.addedNodes.length; i++){ var n = m.addedNodes[i]; if(n.nodeType !== 1) continue;
          var t = n.tagName.toLowerCase();
          if(/^(animate|animatetransform|animatemotion|set)$/.test(t) || n.ownerSVGElement) ferma(n.ownerSVGElement ? (function(x){ while(x.ownerSVGElement) x = x.ownerSVGElement; return x; })(n) : n);
          else if(t === "svg" || n.querySelector("svg")) ferma(n); } });
      }).observe(document.documentElement, { childList: true, subtree: true });
    } catch(e){}
  }

  /* ---------- schermate ---------- */
  var attese = [], finito = false;
  window.tcjPrimaIntro = function(cb){ if(finito) cb(); else attese.push(cb); };
  function fine(){ if(finito) return; finito = true; var a = attese; attese = []; a.forEach(function(cb){ try { cb(); } catch(e){} }); }

  var gia = viste(), daMostrare = L ? NOVITA.filter(function(n){ return gia.indexOf(n.id) < 0; }) : [];
  var chiediDisp = !!L && !leggi(KD);
  if(!daMostrare.length && !chiediDisp){ fine(); return; }

  var ov = document.createElement("div");
  ov.id = "nov-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "nov-tit");
  ov.innerHTML = '<div class="nov-box"><div class="nov-cap" id="nov-cap"></div><div class="nov-corpo" id="nov-corpo"></div><div class="nov-pie" id="nov-pie"></div></div>';
  document.body.appendChild(ov);
  var prima = document.body.style.overflow; document.body.style.overflow = "hidden";
  var pos = 0, totale = daMostrare.length, scelta = tcjDispositivo();
  function $(id){ return document.getElementById(id); }

  function mostraNovita(){
    var n = daMostrare[pos];
    $("nov-cap").innerHTML = '<span>Novità · ' + (pos + 1) + ' di ' + totale + '</span>' + (totale > 1 ? '<span class="nov-pt">' + daMostrare.map(function(_, j){ return '<i' + (j === pos ? ' class="on"' : '') + '></i>'; }).join("") + '</span>' : '');
    $("nov-corpo").innerHTML = '<div class="nov-ic" aria-hidden="true">' + n.i + '</div><h2 class="nov-t" id="nov-tit">' + n.t + '</h2>' + n.p.map(function(x){ return '<p>' + x + '</p>'; }).join("");
    $("nov-pie").innerHTML = (pos > 0 ? '<button type="button" class="nov-b nov-ind" data-a="ind">← Indietro</button>' : '<span></span>') +
      '<button type="button" class="nov-b nov-ok" data-a="ok">Ho capito →</button>';
    $("nov-corpo").scrollTop = 0; fuoco();
  }
  function mostraDisp(){
    function opz(v, ic, nm, ds){
      return '<button type="button" class="nov-op' + (scelta === v ? ' on' : '') + '" data-v="' + v + '" aria-pressed="' + (scelta === v) + '">' +
        '<span class="nov-opi" aria-hidden="true">' + ic + '</span><span class="nov-opt"><b>' + nm + '</b><small>' + ds + '</small>' +
        ((v === "telefono") === tel ? '<em>Consigliata per questo dispositivo</em>' : '') + '</span></button>';
    }
    $("nov-cap").innerHTML = "<span>Un'ultima cosa</span>";
    $("nov-corpo").innerHTML = '<h2 class="nov-t" id="nov-tit">Da dove aprite il sito?</h2><p>Scegliete la versione da usare su questo dispositivo.</p>' +
      '<div class="nov-ops">' +
      opz("telefono", "📱", "Telefono — versione leggera", "Senza animazioni, temi, effetti e suoni: più veloce. Tutti i contenuti restano.") +
      opz("computer", "💻", "Computer — versione completa", "Con l'animazione d'apertura, i temi del sito, gli effetti e i suoni.") +
      '</div><p><small>Potete cambiarla quando volete dal menu ⚔ Slayer → «Dispositivo».</small></p>';
    $("nov-pie").innerHTML = (totale ? '<button type="button" class="nov-b nov-ind" data-a="ind">← Indietro</button>' : '<span></span>') +
      '<button type="button" class="nov-b nov-ok" data-a="entra">Entra →</button>';
    $("nov-corpo").scrollTop = 0; fuoco();
  }
  function fuoco(){ setTimeout(function(){ var b = ov.querySelector(".nov-ok"); if(b) try { b.focus({ preventScroll: true }); } catch(e){ b.focus(); } }, 30); }
  function chiudi(){
    ov.remove(); document.body.style.overflow = prima;
    fine();
  }
  function avanti(){
    if(pos < totale){ segna(daMostrare[pos].id); pos++; }
    if(pos < totale) mostraNovita();
    else if(chiediDisp) mostraDisp();
    else chiudi();
  }
  ov.addEventListener("click", function(e){
    var op = e.target.closest(".nov-op");
    if(op){ scelta = op.getAttribute("data-v"); ov.querySelectorAll(".nov-op").forEach(function(b){ var on = b === op; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); }); return; }
    var b = e.target.closest("button[data-a]"); if(!b) return;
    var a = b.getAttribute("data-a");
    if(a === "ok") avanti();
    else if(a === "ind"){ if(pos > 0){ pos--; mostraNovita(); } }
    else if(a === "entra"){ if(tcjDispositivoSet(scelta)) return; chiudi(); }
  });
  ov.addEventListener("keydown", function(e){ if(e.key === "Escape"){ e.preventDefault(); } });
  if(totale) mostraNovita(); else mostraDisp();
})();
