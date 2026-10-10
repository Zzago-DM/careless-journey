/* Icone di Behemoth e Maestri nelle schede della Zona Master */

/* Icone di Behemoth e Maestri nelle schede master, con formati di riserva */
function icoErr(el){var c=(el.getAttribute("data-c")||"").split("|").filter(Boolean);if(c.length){el.setAttribute("data-c",c.slice(1).join("|"));el.src=c[0];}else el.remove();}
function behIco(n){var b=String(n).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  var al={"drask_tuonante":"drask_tonante"}[b],c=["png","jpg"].map(function(e){return "beh/"+b+"."+e});if(al)c=["beh/"+al+".webp","beh/"+al+".png"].concat(c);
  return '<img class="mico" src="beh/'+b+'.webp" data-c="'+c.join("|")+'" onerror="icoErr(this)" alt="" loading="lazy" decoding="async">';}
function maeIco(n){var m={"Ozz l'Onesto":"ernest-ozz-honest"}[n];var b=m||String(n).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/['’“”"]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  var c=["img/maestri/"+b+".webp","img/"+b+".png","img/"+b+".jpg"];
  return '<span class="mico mae"><img src="img/'+b+'.webp" data-c="'+c.join("|")+'" onerror="icoErr(this)" alt="" loading="lazy" decoding="async"></span>';}
/* Zona master: ogni sezione mostra solo il titolo e si apre al clic */
(function(){
  var ms=document.getElementById("ms");if(!ms)return;
  ms.querySelectorAll(".msec").forEach(function(sec,i){
    var sub=sec.querySelector(":scope > .msecsub"),tit=sec.querySelector(":scope > .msect"),ln=sec.querySelector(":scope > .msecl");if(!tit)return;
    var head=document.createElement("div");head.className="msec-head";head.setAttribute("role","button");head.tabIndex=0;head.setAttribute("aria-expanded","false");
    var body=document.createElement("div");body.className="msec-body";body.id="msb-"+(sec.id||i);head.setAttribute("aria-controls",body.id);
    sec.insertBefore(head,sec.firstChild);[sub,tit,ln].forEach(function(e){if(e)head.appendChild(e);});
    var ch=document.createElement("span");ch.className="msec-chev";ch.setAttribute("aria-hidden","true");ch.textContent="▸";head.appendChild(ch);
    while(head.nextSibling)body.appendChild(head.nextSibling);sec.appendChild(body);
    function tog(open){sec.classList.toggle("open",open);head.setAttribute("aria-expanded",open?"true":"false");try{sfxPlay(open?"paper":"swish")}catch(_){}}
    head.addEventListener("click",function(){tog(!sec.classList.contains("open"));});
    head.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();tog(!sec.classList.contains("open"));}});
    sec._open=function(){if(!sec.classList.contains("open"))tog(true);};
  });
  ms.querySelectorAll('.msnav a[href^="#m-"]').forEach(function(a){a.addEventListener("click",function(){var t=document.getElementById(a.getAttribute("href").slice(1));if(t&&t._open)t._open();});});
})();
