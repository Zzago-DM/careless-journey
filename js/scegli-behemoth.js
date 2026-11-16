/* Scelta di un Behemoth con il token accanto al nome, divisi per elemento (Glaciale, Ardente…).
   tcjScegliBehemoth({ titolo, scelto }) apre la finestra e restituisce una Promise con il nome scelto (null se si chiude).
   tcjBehToken(nome) dà l'<img> del token (beh/<nome>.webp, con png/jpg di riserva). Vale per tutti, giocatori compresi:
   lo usa la Stiva («Behemoth affrontato»). I dati vengono da PL_BEHEMOTHS (dati/plancia.js) e BD (dati/behemoth.js). */
(function(){
  "use strict";
  var ORDINE = ["Glaciale", "Ardente", "Folgorante", "Terrestre", "Radiante", "Oscuro", "Neutro"];
  var EMO = { glaciale: "❄", ardente: "🔥", folgorante: "⚡", terrestre: "🌍", radiante: "✨", oscuro: "🌑", neutro: "◆" };
  var CAT = { classico: "Classico", variante: "Variante", anomalo: "Anomalo", leggendario: "Leggendario", evoluto: "Evoluto", nuovo: "Nuova aggiunta" };
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function slug(n){ var b = String(n).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); return { drask_tuonante: "drask_tonante" }[b] || b; }
  window.tcjBehTokErr = function(el){ var c = (el.getAttribute("data-c") || "").split("|").filter(Boolean); if(c.length){ el.setAttribute("data-c", c.slice(1).join("|")); el.src = c[0]; } else el.style.visibility = "hidden"; };
  window.tcjBehToken = function(n, cls){
    var b = slug(n);
    return '<img class="' + (cls || "sb-tok") + '" src="beh/' + b + '.webp" data-c="beh/' + b + '.png|beh/' + b + '.jpg" onerror="tcjBehTokErr(this)" alt="" loading="lazy" decoding="async">';
  };
  function elenco(){
    var B = typeof PL_BEHEMOTHS !== "undefined" ? PL_BEHEMOTHS : [], cat = {};
    if(typeof BD !== "undefined") BD.forEach(function(b){ cat[b.n] = b.c; });
    var gr = {};
    B.forEach(function(b){ var a = b.aether || "Neutro"; (gr[a] = gr[a] || []).push({ n: b.nome, c: cat[b.nome] || "" }); });
    var chiavi = Object.keys(gr).sort(function(x, y){ var i = ORDINE.indexOf(x), j = ORDINE.indexOf(y); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) || x.localeCompare(y, "it"); });
    return chiavi.map(function(a){ return { a: a, L: gr[a].sort(function(x, y){ return x.n.localeCompare(y.n, "it"); }) }; });
  }
  window.tcjScegliBehemoth = function(o){
    o = o || {};
    return new Promise(function(fine){
      var G = elenco(), indietro = document.activeElement;
      var ov = document.createElement("div"); ov.className = "sb-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", o.titolo || "Scegli il Behemoth");
      ov.innerHTML = '<div class="sb-box"><div class="sb-top"><span class="sb-t">' + esc(o.titolo || "Scegli il Behemoth") + '</span><button type="button" class="sb-x" aria-label="Chiudi">✕</button></div>'
        + '<input type="search" class="sb-q" placeholder="Cerca per nome…" aria-label="Cerca un Behemoth">'
        + '<div class="sb-el" role="group" aria-label="Elemento"><button type="button" data-a="" aria-pressed="true">Tutti</button>' + G.map(function(g){ return '<button type="button" data-a="' + esc(g.a) + '" aria-pressed="false">' + (EMO[g.a.toLowerCase()] || "") + " " + esc(g.a) + '</button>'; }).join("") + '</div>'
        + '<div class="sb-lista">' + G.map(function(g){
          return '<div class="sb-gr" data-a="' + esc(g.a) + '"><div class="sb-gt">' + (EMO[g.a.toLowerCase()] || "") + " " + esc(g.a) + '</div><div class="sb-griglia">'
            + g.L.map(function(b){ return '<button type="button" class="sb-it' + (b.n === o.scelto ? " on" : "") + '" data-n="' + esc(b.n) + '">' + tcjBehToken(b.n) + '<span class="sb-nm">' + esc(b.n) + '</span>' + (b.c && CAT[b.c] ? '<span class="sb-cat">' + CAT[b.c] + '</span>' : "") + '</button>'; }).join("")
            + '</div></div>';
        }).join("") + '<p class="sb-none" hidden>Nessun Behemoth con questo nome.</p></div></div>';
      document.body.appendChild(ov); document.documentElement.classList.add("sb-aperta");
      try { sfxPlay("paper"); } catch(_){}
      var q = ov.querySelector(".sb-q"), el = "";
      function filtra(){
        var t = q.value.trim().toLowerCase(), tot = 0;
        ov.querySelectorAll(".sb-gr").forEach(function(g){
          var n = 0, okA = !el || g.getAttribute("data-a") === el;
          g.querySelectorAll(".sb-it").forEach(function(it){ var ok = okA && (!t || it.getAttribute("data-n").toLowerCase().indexOf(t) >= 0); it.hidden = !ok; if(ok) n++; });
          g.hidden = !n; tot += n;
        });
        ov.querySelector(".sb-none").hidden = tot > 0;
      }
      function chiudi(v){ ov.remove(); document.documentElement.classList.remove("sb-aperta"); document.removeEventListener("keydown", tasto, true); try { if(indietro) indietro.focus(); } catch(_){} fine(v || null); }
      function tasto(e){ if(e.key === "Escape"){ e.stopPropagation(); chiudi(null); } }
      document.addEventListener("keydown", tasto, true);
      q.addEventListener("input", filtra);
      ov.addEventListener("click", function(e){
        if(e.target === ov || e.target.closest(".sb-x")) return chiudi(null);
        var f = e.target.closest(".sb-el button");
        if(f){ el = f.getAttribute("data-a"); ov.querySelectorAll(".sb-el button").forEach(function(b){ b.setAttribute("aria-pressed", String(b === f)); }); filtra(); return; }
        var it = e.target.closest(".sb-it"); if(it){ try { sfxPlay("spawn"); } catch(_){} chiudi(it.getAttribute("data-n")); }
      });
      var on = ov.querySelector(".sb-it.on");
      setTimeout(function(){ if(on) on.scrollIntoView({ block: "center" }); if(window.matchMedia && matchMedia("(pointer:fine)").matches) q.focus(); }, 30);
    });
  };
})();
