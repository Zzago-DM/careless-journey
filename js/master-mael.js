/* Zona Master › I Mael — un solo capitolo al posto di tre (Posizioni, Schede, Stat).
   Ogni carta è l'anteprima: dove si trova oggi, statistiche, arma e artefatto.
   Toccando la carta si apre la scheda illustrata completa (finestra delle Schede dei Mael, in master-libreria.js).
   I dati arrivano da schede.json (MD, con id e pos) nel repository privato tcj-master;
   ritratti, armi e artefatti da tcj-master/mael/img, scaricati con il token del Master. */
(function(){
  var API = "https://api.github.com/repos/Zzago-DM/tcj-master/contents/mael/img/";
  var ORDINE = ["symael", "raphael", "mykael", "azrael", "estarossa", "gabrael"];
  var IMG = {
    symael:    ["symael.webp", "alatreon.webp", "collana.webp"],
    raphael:   ["raphael.webp", "carmilla.webp", "braccio.webp"],
    mykael:    ["mykael.webp", "valstrax.webp", "armatura.webp"],
    azrael:    ["azrael.webp", "vita-mortale.webp", "flauto.webp"],
    estarossa: ["estarossa.webp", "fondamenta.webp", "corona.webp"],
    gabrael:   ["gabrael.webp", "pugnale.webp", "manto.webp"]
  };
  function token(){ try { return (JSON.parse(localStorage.getItem("tcjgh_master") || "null") || {}).token || ""; } catch(e){ return ""; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]; }); }
  function md(v){ var m = Math.floor((v - 10) / 2); return (m >= 0 ? "+" : "") + m; }
  function idDi(d){ return d.id || String(d.nm || "").toLowerCase().split(/\s/)[0]; }
  function dividi(s){ var m = /^(.*?)\s*\((.*)\)\s*$/.exec(s || ""); return m ? [m[1], m[2]] : [s || "", ""]; }

  /* immagini private: una richiesta per file, tenuta in memoria per tutta la visita */
  var cache = {};
  function immagine(f){
    if(cache[f]) return cache[f];
    var tent = 0;
    function prova(){
      return fetch(API + f, { headers: { "Authorization": "Bearer " + token(), "Accept": "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" }, cache: "force-cache" })
        .then(function(r){ if(!r.ok) throw r.status; return r.blob(); })
        .then(function(b){ return URL.createObjectURL(b); })
        .catch(function(e){ if(++tent < 3 && e !== 401 && e !== 404) return new Promise(function(ok){ setTimeout(ok, 700 * tent); }).then(prova); throw e; });
    }
    return (cache[f] = prova().catch(function(e){ delete cache[f]; throw e; }));
  }
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(voci){
    voci.forEach(function(v){ if(v.isIntersecting){ io.unobserve(v.target); carica(v.target); } });
  }, { rootMargin: "200px" }) : null;
  function carica(img){
    var f = img.getAttribute("data-f"); if(!f) return;
    img.removeAttribute("data-f");
    immagine(f).then(function(u){ img.src = u; img.classList.add("ok"); }).catch(function(){ img.classList.add("ko"); });
  }

  function carta(d){
    var id = idDi(d), im = IMG[id] || [], p = d.pos || null;
    var arma = dividi(d.wf || d.wp), c = d.ac || "#c83838";
    var stat = Object.keys(d.s || {}).map(function(k){
      var v = d.s[k], pct = Math.max(4, Math.min(100, Math.round(v / 50 * 100)));
      return '<div class="ml-s"><span>' + esc(k) + '</span><b>' + v + ' <i>' + md(v) + '</i></b><em><u style="width:' + pct + '%"></u></em></div>';
    }).join("");
    var pos = p ? '<div class="ml-pos"><span class="ml-pos-ico" aria-hidden="true">' + esc(p.ico || "📍") + '</span><div><b>' + esc(p.luogo) + '</b><p>' + esc(p.stato) + '</p></div></div>' : "";
    function ogg(etich, f, nome, sotto){
      return '<div class="ml-o">' + (f ? '<span class="ml-o-img"><img alt="" data-f="' + esc(f) + '"></span>' : "") +
        '<div><small>' + etich + '</small><b>' + esc(nome) + '</b>' + (sotto ? '<span>' + esc(sotto) + '</span>' : "") + '</div></div>';
    }
    return '<article class="ml-card' + (d.villain ? " villain" : "") + '" style="--c:' + esc(c) + '" data-mael="' + esc(id) + '" tabindex="0" role="button" aria-label="Apri la scheda completa di ' + esc(d.nm) + '">' +
      '<div class="ml-ritratto">' + (im[0] ? '<img alt="" data-f="' + esc(im[0]) + '">' : "") + '<span class="ml-sigla" aria-hidden="true">' + esc((d.nm || "?").charAt(0)) + '</span></div>' +
      '<div class="ml-info">' +
        '<div class="ml-testa"><div><div class="ml-ae">Aether ' + esc(d.ae) + (d.villain ? ' <span class="ml-villain">villain</span>' : "") + '</div>' +
          '<div class="ml-nome">' + esc(d.nm) + '</div><div class="ml-ruolo">' + esc(d.rl) + '</div></div>' +
          '<div class="ml-hp"><small>HP</small><b>' + esc(d.hp) + '</b></div></div>' +
        pos +
        '<div class="ml-stat">' + stat + '</div>' +
        '<div class="ml-ogg">' + ogg("Arma", im[1], arma[0], arma[1]) + ogg("Artefatto", im[2], d.ar, p && p.art) + '</div>' +
        '<div class="ml-apri">Apri la scheda completa <span aria-hidden="true">›</span></div>' +
      '</div></article>';
  }

  window.buildMaelPreview = function(data){
    var el = document.getElementById("grid-mael");
    if(!el) return;
    el.classList.add("ml-grid");
    el.removeAttribute("style");
    var lista = (data || []).slice().sort(function(a, b){
      var i = ORDINE.indexOf(idDi(a)), j = ORDINE.indexOf(idDi(b));
      return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
    });
    el.innerHTML = lista.map(carta).join("");
    el.querySelectorAll("img[data-f]").forEach(function(img){ if(io) io.observe(img); else carica(img); });
    if(!el._tasti){
      el._tasti = true;
      el.addEventListener("keydown", function(e){
        if(e.key !== "Enter" && e.key !== " ") return;
        var c = e.target.closest(".ml-card"); if(!c) return;
        e.preventDefault();
        if(window.tcjSchedeMael) window.tcjSchedeMael(c.getAttribute("data-mael"));
      });
    }
  };
})();
