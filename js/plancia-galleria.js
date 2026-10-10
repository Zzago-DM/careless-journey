/* Plancia: galleria per scegliere i Behemoth */

/* Plancia: galleria per scegliere i Behemoth con icone, ricerca e filtri */
function plCatTag(n){if(typeof BD==="undefined")return "";var b=BD.filter(function(x){return x.n===n})[0];if(!b)return "";
  return '<span class="tag" style="color:'+(cC[b.c]||"inherit")+';border-color:'+(cC[b.c]||"#888")+'33">'+(cL[b.c]||b.c)+'</span>';}
var plPickFor=null,plPickBuilt=false,plPickF="all",plPickBack=null;
function plPickApply(){var q=document.getElementById("plp-q").value.trim().toLowerCase(),n=0;
  document.querySelectorAll("#plp-grid .plp-it").forEach(function(it){var ok=(plPickF==="all"||it.dataset.cat===plPickF||it.dataset.ae===plPickF)&&(!q||it.dataset.n.indexOf(q)>=0);it.classList.toggle("hidden",!ok);if(ok)n++;});
  document.getElementById("plp-none").hidden=n>0;}
function plPickBuild(){if(plPickBuilt)return;plPickBuilt=true;
  var byName={};if(typeof BD!=="undefined")BD.forEach(function(b){byName[b.n]=b;});
  document.getElementById("plp-grid").innerHTML=PL_BEHEMOTHS.map(function(b,i){var d=byName[b.nome]||{};
    return '<button type="button" class="plp-it" data-i="'+i+'" data-n="'+b.nome.toLowerCase()+'" data-cat="'+(d.c||"")+'" data-ae="'+(d.a||String(b.aether).toLowerCase())+'">'+behIco(b.nome)+'<span class="nm">'+b.nome+'</span><span class="tg">'+(d.a&&typeof aI!=="undefined"?(aI[d.a]||"")+" ":"")+b.aether+(d.c&&typeof cL!=="undefined"?" · "+(cL[d.c]||d.c):"")+'</span></button>';}).join("");
  var F=[["all","Tutti"]];if(typeof cL!=="undefined")Object.keys(cL).forEach(function(k){F.push([k,cL[k]]);});
  if(typeof aI!=="undefined")Object.keys(aI).forEach(function(k){F.push([k,aI[k]+" "+k.charAt(0).toUpperCase()+k.slice(1)]);});
  var fb=document.getElementById("plp-f");fb.innerHTML=F.map(function(f){return '<button type="button" data-f="'+f[0]+'"'+(f[0]==="all"?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>'+f[1]+'</button>';}).join("");
  fb.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;plPickF=b.dataset.f;fb.querySelectorAll("button").forEach(function(x){var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on?"true":"false");});plPickApply();});
  document.getElementById("plp-q").addEventListener("input",plPickApply);
  document.getElementById("plp-grid").addEventListener("click",function(e){var it=e.target.closest(".plp-it");if(it)plChoose(+it.dataset.i);});
  document.getElementById("plp-x").addEventListener("click",plClosePick);
  document.getElementById("plp-ov").addEventListener("click",function(e){if(e.target.id==="plp-ov")plClosePick();});
  document.addEventListener("keydown",function(e){if(document.getElementById("plp-ov").hidden)return;if(e.key==="Escape"){e.stopPropagation();plClosePick();}},true);}
function plOpenPick(id){plPickFor=id||null;plPickBack=document.activeElement;plPickBuild();
  document.getElementById("plp-t").textContent=id?"Cambia Behemoth":"Aggiungi un Behemoth alla plancia";
  var ov=document.getElementById("plp-ov");ov.hidden=false;document.body.style.overflow="hidden";
  try{sfxPlay("paper")}catch(_){}setTimeout(function(){document.getElementById("plp-q").focus();},30);}
function plClosePick(){document.getElementById("plp-ov").hidden=true;if(!document.querySelector(".cj-overlay.open,.bfs-ov,.mae-ov.on"))document.body.style.overflow="";if(plPickBack)try{plPickBack.focus()}catch(_){}}
function plChoose(idx){var id=plPickFor;if(!id||!plState[id]){plAdd();var k=Object.keys(plState);id=k[k.length-1];}
  plSetBeh(id,idx);try{sfxPlay("spawn")}catch(_){}plPickBack=null;plClosePick();
  setTimeout(function(){var c=document.querySelectorAll("#pl-list .pl-card"),ks=Object.keys(plState),p=ks.indexOf(id);if(c[p])c[p].scrollIntoView({behavior:"smooth",block:"center"});},60);}
