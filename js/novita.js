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
    { id: "2026-10-nave-interattiva", i: "⛵", t: "Nave interattiva", p: [
      "Adesso potete entrare in ogni stanza della <b>Careless</b>. Nella sezione <b>Nave</b> toccate una stanza sulla mappa: a sinistra la vedete dall'alto, a destra trovate cosa ci potete fare.",
      "Per spostarvi c'è l'<b>elenco di tutte le stanze</b>, nella colonna di sinistra (sul telefono in una fila sopra il disegno): toccatene una e ci siete. Oppure muovetevi «a piedi» con i pulsanti sopra <b>porte</b>, <b>scale</b> e <b>ascensore</b> del disegno. La piccola nave in alto vi mostra dove siete.",
      "La <b>Stiva Primaria</b> è pronta per preparare le missioni: dentro c'è la stiva comune del gruppo (strumenti, parti di mostro, oggetti vari e dispensa), e i magazzini dei viveri si riempiono man mano che caricate la dispensa. C'è posto per <b>60 giorni</b> di viveri: per portarne di più allestite una <b>Stiva aggiuntiva</b> nella <b>Stiva Modulare</b> (piccola +10, media +20, grande +40). A stiva piena il + si ferma.",
      "Nella <b>Stiva Modulare</b> allestite gli spazi come vi servono, e nella <b>Sala Mappe</b> toccate il globo sul tavolo per aprire la Mappa del Mondo.",
      "<small>Per cambiare la stiva serve il salvataggio online collegato nella vostra Area dello Slayer.</small>"
    ]},
    { id: "2026-10-nuclei", i: "🔮", t: "Nuclei d'attacco e di difesa", p: [
      "Nell'Area dello Slayer è cambiato l'<b>Equipaggiamento</b>. C'è uno slot fisso con i <b>5 tonici di Salute</b>, gratis a ogni spedizione, e poi <b>3 slot</b>: in ognuno 5 tonici oppure 2 piloni, di un solo tipo. Toccate <b>«Equipaggia»</b>, scegliete l'oggetto e da dove arriva: <b>Dalla stiva</b> lo prende dalla nave (e lì ne resta uno in meno), <b>Negozio</b> lo aggiunge senza toccare la stiva.",
      "Nella scheda restano il <b>Nucleo d'attacco</b> e il <b>Nucleo di difesa</b> che avete montati. Sotto gli slot, in più, ci sono i <b>nuclei di ricambio</b>: potete portarne fino a <b>3</b>, d'attacco o di difesa, di qualsiasi elemento.",
      "I ricambi sono usa e getta: quando ne montate uno, il nucleo che avevate prima si consuma e sparisce. Il sito ve lo chiede prima di farlo. «Riponi» rimette nella stiva quello che non usate.",
      "Prima di partire scegliete bene quali elementi portarvi: contro il Behemoth sbagliato, un nucleo di ricambio può fare la differenza.",
      "<small>Quello che avevate scritto a mano nelle vecchie righe dell'Equipaggiamento lo ritrovate in fondo, sotto «Scritto a mano prima del cambio».</small>"
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
