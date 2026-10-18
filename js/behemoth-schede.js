/* Schede dei Behemoth: icona e parti rompibili */

/* Schede dei Behemoth: icona da beh/<nome>.webp (o .png/.jpg), parti rompibili dal bestiario */
(function(){
var ov=document.getElementById("beh-ov"),img=document.getElementById("beh-img"),ph=document.getElementById("beh-ph"),grid=document.getElementById("bgrid");
if(!ov||!grid||typeof BD==="undefined")return;
var ALIAS={"Drask Tuonante":["drask_tonante"],"Yondrake Tuonante":["yondrake_tonante"]};
var list=[],cur=0,back=null;
function slug(n){return n.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML;}
var box=ov.querySelector(".mae-box");
/* scorrimento col dito: verso sinistra la scheda dopo, verso destra quella prima */
function scorri(box,vai){var x0=0,y0=0,t0=0,ok=false;
  box.addEventListener("touchstart",function(e){ok=e.touches.length===1&&!e.target.closest("textarea,input,select");if(ok){x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now();}},{passive:true});
  box.addEventListener("touchend",function(e){if(!ok)return;ok=false;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6&&Date.now()-t0<900)vai(dx<0?1:-1,e.target);},{passive:true});}
/* scheda nuova: si riparte dall'alto (la foto deve essere in vista mentre si carica) e un piccolo scivolamento */
function entra(box,d){box.scrollTop=0;if(!d)return;try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)box.animate([{opacity:.35,transform:"translateX("+(d*28)+"px)"},{opacity:1,transform:"none"}],{duration:220,easing:"ease-out"});}catch(_){}}
/* Safari su iPhone a volte disegna solo il pezzo di foto visibile in quel momento: la si fa ridisegnare */
function ridisegna(im){requestAnimationFrame(function(){im.style.transform="translateZ(0)";requestAnimationFrame(function(){im.style.transform="";});});}
function photo(b){var base=slug(b.n),names=[base,base.replace(/_/g,"-")].concat(ALIAS[b.n]||[]),c=[],k=0;
  ["webp","png","jpg"].forEach(function(e){names.forEach(function(n){c.push("beh/"+n+"."+e);});});
  ph.classList.remove("has");img.classList.remove("ok");img.removeAttribute("src");img.alt="Icona di "+b.n;
  img.onload=function(){ph.classList.add("has");img.classList.add("ok");ridisegna(img);};
  img.onerror=function(){k++;if(k<c.length)img.src=c[k];else img.removeAttribute("src");};
  img.src=c[0];}
function passa(d){fill(cur+d);entra(box,d);}
function fill(p){cur=(p+list.length)%list.length;var b=BD[list[cur]];
  document.getElementById("beh-r").textContent=(typeof cL!=="undefined"&&cL[b.c]?cL[b.c]:b.c)+" · aether "+b.a;
  document.getElementById("beh-n").textContent=b.n;
  document.getElementById("beh-t").innerHTML='<span class="tag '+(aTC[b.a]||"")+'">'+(aI[b.a]||"")+" "+esc(b.a)+'</span><span class="tag" style="color:'+(cC[b.c]||"inherit")+';border-color:'+(cC[b.c]||"#888")+'33">'+esc(cL[b.c]||b.c)+'</span>';
  document.getElementById("beh-ini").textContent=b.n.replace(/[^A-Za-zÀ-ÿ ]/g,"").split(/\s+/).map(function(w){return w[0]||""}).join("").slice(0,2).toUpperCase();
  var d=(typeof PL_DROPS!=="undefined"&&PL_DROPS[b.n])||null,h="";
  if(d&&d.p&&d.p.length){h+='<div class="mae-sec"><h4>Parti rompibili</h4><ul class="beh-parts">'+d.p.map(function(x){return '<li><span class="pn">'+esc(x.l)+(x.q>1?'<span class="pq">×'+x.q+'</span>':'')+'</span><span class="pm">'+esc(x.m)+'</span></li>';}).join("")+'</ul></div>';}
  var kc=d&&d.k?d.k.filter(function(x){return x.r==="Comune";}):[];
  if(kc.length)h+='<div class="mae-sec"><h4>Abbattendolo si ottiene</h4><p>'+kc.map(function(x){return esc(x.m)}).join(", ")+'</p></div>';
  document.getElementById("beh-body").innerHTML=h;
  document.getElementById("beh-pos").textContent=(cur+1)+" / "+list.length;
  box.scrollTop=0;photo(b);}
function open(i,from){list=[].map.call(grid.querySelectorAll(".bcard:not(.hidden)"),function(c){return +c.getAttribute("data-i")});
  var p=list.indexOf(i);if(p<0){list=[i];p=0;}back=from||null;fill(p);ov.hidden=false;document.body.style.overflow="hidden";
  requestAnimationFrame(function(){ov.classList.add("on");});try{sfxPlay("paper")}catch(_){}
  document.getElementById("beh-x").focus();}
function close(){ov.classList.remove("on");setTimeout(function(){ov.hidden=true;},200);
  if(!document.querySelector(".cj-overlay.open,.bfs-ov"))document.body.style.overflow="";
  if(back)try{back.focus()}catch(_){}}
grid.addEventListener("click",function(e){var c=e.target.closest(".bcard");if(c)open(+c.getAttribute("data-i"),c);});
grid.addEventListener("keydown",function(e){var c=e.target.closest(".bcard");if(c&&(e.key==="Enter"||e.key===" ")){e.preventDefault();open(+c.getAttribute("data-i"),c);}});
document.getElementById("beh-x").addEventListener("click",close);
document.getElementById("beh-prev").addEventListener("click",function(){passa(-1);});
document.getElementById("beh-next").addEventListener("click",function(){passa(1);});
scorri(box,function(d){passa(d);});
ov.addEventListener("click",function(e){if(e.target===ov)close();});
document.addEventListener("keydown",function(e){if(ov.hidden)return;
  if(e.key==="Escape"){e.stopPropagation();close();}
  else if(e.key==="ArrowRight")passa(1);else if(e.key==="ArrowLeft")passa(-1);
  else if(e.key==="Tab"){var f=ov.querySelectorAll("button"),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}},true);
})();
