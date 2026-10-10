/* Zona Master: anello runico, braci, sezione corrente */

/* Zona master: anello runico, braci, ingresso delle sezioni, sezione corrente e twist nascosti */
(function(){
var ms=document.getElementById("ms");if(!ms)return;
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
/* anello runico dietro il titolo */
var hdr=ms.querySelector(".mshdr");
if(hdr){var NS="http://www.w3.org/2000/svg",sv=document.createElementNS(NS,"svg");sv.setAttribute("viewBox","0 0 400 400");sv.setAttribute("class","ms-ring");sv.setAttribute("aria-hidden","true");
  var h='<defs><radialGradient id="msRg"><stop offset="0" stop-color="#ff5050" stop-opacity=".35"/><stop offset="1" stop-color="#ff5050" stop-opacity="0"/></radialGradient></defs>';
  h+='<circle class="core" cx="200" cy="200" r="120" fill="url(#msRg)"/>';
  h+='<g class="r1" fill="none" stroke="#c84848" stroke-opacity=".55"><circle cx="200" cy="200" r="188" stroke-width="1"/><circle cx="200" cy="200" r="178" stroke-width="6" stroke-dasharray="2 9"/>';
  for(var i=0;i<24;i++){var a=i/24*Math.PI*2;h+='<line x1="'+(200+Math.cos(a)*160).toFixed(1)+'" y1="'+(200+Math.sin(a)*160).toFixed(1)+'" x2="'+(200+Math.cos(a)*(i%3?168:172)).toFixed(1)+'" y2="'+(200+Math.sin(a)*(i%3?168:172)).toFixed(1)+'" stroke-width="1.4"/>';}
  h+='</g><g class="r2" fill="none" stroke="#ff6060" stroke-opacity=".4"><circle cx="200" cy="200" r="142" stroke-width="1" stroke-dasharray="40 14 4 14"/>';
  for(var j=0;j<6;j++){var b=j/6*Math.PI*2,x=200+Math.cos(b)*142,y=200+Math.sin(b)*142;h+='<path d="M'+x.toFixed(1)+' '+(y-7).toFixed(1)+'L'+(x+6).toFixed(1)+' '+(y+4).toFixed(1)+'L'+(x-6).toFixed(1)+' '+(y+4).toFixed(1)+'Z" fill="#ff6060" fill-opacity=".35"/>';}
  h+='</g><g class="r3" fill="none" stroke="#c84848" stroke-opacity=".35"><circle cx="200" cy="200" r="112" stroke-width="1"/><polygon points="200,92 293,254 107,254" stroke-width="1"/><polygon points="200,308 107,146 293,146" stroke-width="1"/></g>';
  sv.innerHTML=h;hdr.insertBefore(sv,hdr.firstChild);}
/* braci che salgono, attive solo quando la zona master è visibile */
if(!RM){var em=document.createElement("div");em.className="ms-embers";em.setAttribute("aria-hidden","true");
  var n=window.innerWidth<700?16:30,t="";for(var k=0;k<n;k++){var sz=(2+Math.random()*4).toFixed(1),d=(10+Math.random()*14).toFixed(1);
    t+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;width:'+sz+'px;height:'+sz+'px;--dx:'+((Math.random()-.5)*160).toFixed(0)+'px;--o:'+(.3+Math.random()*.55).toFixed(2)+';animation-duration:'+d+'s;animation-delay:-'+(Math.random()*d).toFixed(1)+'s"></i>';}
  em.innerHTML=t;ms.insertBefore(em,ms.firstChild);
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){es.forEach(function(e){em.classList.toggle("on",e.isIntersecting);});}).observe(ms);else em.classList.add("on");}
/* ingresso delle sezioni mentre si scorre */
var heads=[].slice.call(ms.querySelectorAll(".msec-head"));
if(RM||!("IntersectionObserver" in window))heads.forEach(function(h){h.classList.add("in");});
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var hh=e.target;setTimeout(function(){hh.classList.add("in");},(+hh.dataset.d||0));io.unobserve(hh);}});},{threshold:.15});
  heads.forEach(function(h,i){h.dataset.d=(i%4)*90;io.observe(h);});}
/* collegamento della sezione che si sta leggendo */
var links={};ms.querySelectorAll('.msnav a[href^="#m-"]').forEach(function(a){links[a.getAttribute("href").slice(1)]=a;});
if("IntersectionObserver" in window){var cur=null;
  var spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var a=links[e.target.id];if(a&&a!==cur){if(cur)cur.classList.remove("cur");a.classList.add("cur");cur=a;}}});},{rootMargin:"-40% 0px -55% 0px"});
  ms.querySelectorAll(".msec[id]").forEach(function(sec){spy.observe(sec);});}
/* twist: testo sfocato finché non si passa sopra o si tocca */
ms.querySelectorAll(".sc.tw").forEach(function(c){c.tabIndex=0;c.setAttribute("aria-label","Twist nascosto: tocca per leggerlo");
  c.addEventListener("click",function(){c.classList.toggle("rev");});
  c.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();c.classList.toggle("rev");}});});
var tw=ms.querySelector(".tw-head");if(tw){var p=document.createElement("div");p.className="tw-hint";p.textContent="Il testo resta sfocato: passaci sopra o toccalo per leggerlo.";var mq=tw.nextElementSibling;(mq&&mq.classList.contains("mq")?mq:tw).insertAdjacentElement("afterend",p);}
})();
