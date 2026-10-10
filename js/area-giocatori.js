/* Logica dell'area giocatori: scheda, Corone, ricerca, area personale, sigillo e ritratti, nave, temi, suoni dell'interfaccia, timeline, calendario, celle, armi, munizioni */

const SC_STATS=[{id:"FOR",nm:"Forza"},{id:"DES",nm:"Destrezza"},{id:"COST",nm:"Costituzione"},{id:"INT",nm:"Intelligenza"},{id:"SAG",nm:"Saggezza"},{id:"CAR",nm:"Carisma"}];
const SC_NC={glaciale:{bg:"rgba(126,200,227,.18)",br:"#5aaac0",tx:"Glaciale"},ardente:{bg:"rgba(224,90,32,.18)",br:"#c04010",tx:"Ardente"},folgorante:{bg:"rgba(240,208,32,.2)",br:"#a09000",tx:"Folgorante"},terrestre:{bg:"rgba(60,150,60,.18)",br:"#3a8030",tx:"Terrestre"},radiante:{bg:"rgba(212,168,255,.2)",br:"#9070c0",tx:"Radiante"},oscuro:{bg:"rgba(100,60,180,.2)",br:"#7050b0",tx:"Oscuro"},neutro:{bg:"rgba(160,160,160,.18)",br:"#888",tx:"Neutro"}};
const SC_COMPS=[{id:"acro",nm:"Acrobatica",st:"DES"},{id:"amm",nm:"Ammaestrare creature",st:"SAG"},{id:"beh",nm:"Behemothologia",st:"INT"},{id:"atl",nm:"Atletica",st:"FOR"},{id:"ing",nm:"Inganno",st:"CAR"},{id:"stor",nm:"Storia",st:"INT"},{id:"intu",nm:"Intuizione",st:"SAG"},{id:"intim",nm:"Intimidire",st:"CAR"},{id:"inv2",nm:"Investigare",st:"INT"},{id:"poz",nm:"Pozioni",st:"INT"},{id:"nat",nm:"Natura",st:"SAG"},{id:"perc",nm:"Percezione",st:"SAG"},{id:"intr",nm:"Intrattenere",st:"CAR"},{id:"pers",nm:"Persuasione",st:"CAR"},{id:"trad",nm:"Tradizioni",st:"INT"},{id:"rap",nm:"Rapidità di mano",st:"DES"},{id:"furt",nm:"Furtività",st:"DES"},{id:"soprav",nm:"Sopravvivenza",st:"SAG"}];

function scBennyCnt(d){const e=document.getElementById("sc-benny");e.value=Math.max(0,(parseInt(e.value)||0)+d);}
function scInspCnt(d){const e=document.getElementById("sc-ispirazione");e.value=Math.max(0,(parseInt(e.value)||0)+d);}
function scTogDot(id){const el=document.getElementById("scd-"+id);const on=el.classList.contains("on");el.classList.toggle("on",!on);el.classList.toggle("off",on);el.textContent=on?"○":"●";sfxPlay(on?"off":"on");scRecalc();}
function scEqCnt(i,delta){const el=document.getElementById("sc-eq-cnt-"+i);el.value=Math.max(0,(parseInt(el.value)||0)+delta);}
function scCoinRow(amount,currency){const div=document.createElement("div");div.className="sc-coin-row";div.innerHTML='<input class="sc-in sc-coin-amt" type="text" inputmode="numeric" placeholder="Somma..." style="flex:1"><input class="sc-in sc-coin-cur" type="text" placeholder="Valuta" style="width:96px"><button class="sc-coin-del" type="button" title="Rimuovi valuta" onclick="scCoinDel(this)">×</button>';div.querySelector(".sc-coin-amt").value=amount||"";div.querySelector(".sc-coin-cur").value=currency||"";return div;}
function scCoinAdd(amount,currency){const c=document.getElementById("sc-coin-rows");if(c)c.appendChild(scCoinRow(amount,currency));}
function scCoinDel(btn){const r=btn.closest(".sc-coin-row");if(r){sfxPlay("drop");r.remove();}}
function scBuildComps(saved,mods){const grid=document.getElementById("sc-comps-grid");if(!grid)return;grid.innerHTML=SC_COMPS.map(cp=>{const on=saved&&saved[cp.id];const mv=mods&&mods[cp.id]!==undefined?mods[cp.id]:"";return`<div class="sc-comp-row"><span class="sc-dot ${on?"on":"off"}" id="scd-${cp.id}" onclick="scTogDot('${cp.id}')" style="cursor:pointer">${on?"●":"○"}</span><span style="font-size:.82rem;color:var(--text);flex:1;cursor:pointer" onclick="scTogDot('${cp.id}')">${cp.nm}</span><span style="font-family:'Cinzel',serif;font-size:.5rem;letter-spacing:.06em;color:var(--text2);border:1px solid var(--border);padding:.04rem .22rem;margin-right:.3rem">${cp.st}</span><input type="text" id="scmod-${cp.id}" class="sc-calc" readonly tabindex="-1" value="" placeholder="+0" title="Modificatore caratteristica + Bonus Competenza (se competente)" style="width:38px;background:var(--bg);border:1px solid var(--border);color:var(--gold2);font-family:'Cinzel',serif;font-size:.68rem;text-align:center;padding:.1rem;outline:none"></div>`;}).join("");}

const CR_PH="data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23908878' stroke-width='2.4' opacity='.4'%3E%3Cpath d='M50 13 L79 40 L65 84 L35 84 L21 40 Z'/%3E%3Cpath d='M50 31 L65 43 L58 68 L42 68 L35 43 Z' opacity='.55'/%3E%3C/g%3E%3Ctext x='50' y='63' font-family='Georgia,serif' font-size='27' fill='%23908878' opacity='.45' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E";
/* CR_IMG: spostato in dati/corone-immagini.js */
const CROWNS=[{"n": "Corona dell'Allegria", "d": "", "i": 1}, {"n": "Corona Amicizia", "d": "", "i": 2}, {"n": "Corona Campione", "d": "", "i": 3}, {"n": "Corona Easter", "d": "", "i": 4}, {"n": "Corona Fenice", "d": "", "i": 5}, {"n": "Corona Frostfall", "d": "", "i": 6}, {"n": "Corona Impegno", "d": "", "i": 7, "dk": 1}, {"n": "Corona Raccolto", "d": "", "i": 8}, {"n": "Corona Ramgraziamento", "d": "", "i": 9}, {"n": "Corona Riforgiato", "d": "", "i": 10}, {"n": "Corona Unione", "d": "", "i": 11}, {"n": "Corona Vittoria", "d": "", "i": 12}];
let crCur=-1;
function crSrc(c){return c.i&&CR_IMG[c.i]?CR_IMG[c.i]:CR_PH;}
function crEsc(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
function crBuild(owned){const g=document.getElementById("cr-grid");if(!g)return;const o=owned||[];
 g.innerHTML=CROWNS.map((c,i)=>`<div class="cr-box${o[i]?" has":""}${c.dk?" dk":""}" id="cr-box-${i}" onclick="crOpen(${i})" title="${crEsc(c.n)}"><img src="${crSrc(c)}" alt="${crEsc(c.n)}"><span class="cr-num">${i+1}</span><button class="cr-tog" type="button" title="Segna come conquistata" onclick="event.stopPropagation();crTog(${i})">\u2713</button></div>`).join("");
 crCount();}
function crCount(){let n=0;for(let i=0;i<CROWNS.length;i++){const b=document.getElementById("cr-box-"+i);if(b&&b.classList.contains("has"))n++;}
 const c=document.getElementById("cr-count"),m=document.getElementById("cr-mult");
 if(c)c.textContent=n;if(m)m.textContent=n?"1D20 \u00d7"+(n*2):"\u2014";}
function crTog(i){const b=document.getElementById("cr-box-"+i);if(!b)return;b.classList.toggle("has");crCount();if(crCur===i)crBtn();if(b.classList.contains("has"))crAwake(b,i);else{b.classList.remove("awake");b.classList.add("sleep");setTimeout(function(){b.classList.remove("sleep")},700);}}
function crAwake(b,i){b.classList.remove("awake","sleep");void b.offsetWidth;b.classList.add("awake");setTimeout(function(){b.classList.remove("awake")},1600);sfxPlay("crown");
 const mi=document.getElementById("cr-mimg");if(mi&&crCur===i){mi.classList.remove("awake");void mi.offsetWidth;mi.classList.add("awake");setTimeout(function(){mi.classList.remove("awake")},1600);}
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const src=(mi&&crCur===i&&document.getElementById("cr-ov").classList.contains("open"))?mi:b;const r=src.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 for(let k=0;k<16;k++){const sp=document.createElement("span");sp.className="cr-spark";const a=Math.random()*6.283,d=r.width*(.55+Math.random()*.9);
  sp.style.left=cx+"px";sp.style.top=cy+"px";sp.style.setProperty("--dx",(Math.cos(a)*d).toFixed(1)+"px");sp.style.setProperty("--dy",(Math.sin(a)*d).toFixed(1)+"px");sp.style.animationDelay=(Math.random()*.15).toFixed(2)+"s";
  document.body.appendChild(sp);setTimeout(function(){sp.remove()},1300);}}
function crBtn(){const b=document.getElementById("cr-mbtn"),bx=document.getElementById("cr-box-"+crCur);if(!b||!bx)return;
 const on=bx.classList.contains("has");b.classList.toggle("on",on);b.textContent=on?"\u2713 Conquistata":"Segna come conquistata";}
function crOpen(i){sfxPlay("paper");const c=CROWNS[i];if(!c)return;crCur=i;
 const _mi=document.getElementById("cr-mimg");_mi.src=crSrc(c);_mi.classList.toggle("dk",!!c.dk);
 document.getElementById("cr-mnm").textContent=c.n;
 document.getElementById("cr-mds").textContent=c.d||"Nessuna descrizione ancora annotata.";
 crBtn();document.getElementById("cr-ov").classList.add("open");}
function crClose(){const o=document.getElementById("cr-ov");if(o)o.classList.remove("open");crCur=-1;}
function crTogCur(){if(crCur>=0)crTog(crCur);}
document.addEventListener("keydown",e=>{if(e.key==="Escape")crClose();});



let skIdx=null, skRes=[], skSel=0;
function skNorm(t){return (t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function skBuild(){
  const seen=new Set(), idx=[];
  const add=(el,cat)=>{if(!el||seen.has(el))return;const t=(el.textContent||"").replace(/\s+/g," ").trim();
    if(!t||t.length>72)return;seen.add(el);idx.push({e:el,t:t,l:skNorm(t),c:cat});};
  document.querySelectorAll("#bgrid .bn").forEach(e=>add(e,"Behemoth"));
  document.querySelectorAll("#wgrid .card > div:first-child").forEach(e=>add(e,"Arma"));
  document.querySelectorAll("#cgrid .cn").forEach(e=>add(e,"Cella"));
  document.querySelectorAll("#ogrid .ct").forEach(e=>add(e,"Omnicella"));
  document.querySelectorAll("#ampbody tr td:first-child").forEach(e=>add(e,"AMP"));
  document.querySelectorAll("#trgrid .trn").forEach(e=>add(e,"Timeline"));
  document.querySelectorAll("section .ct").forEach(e=>{const sec=e.closest("section"),st=sec&&sec.querySelector(".st");add(e,st?st.textContent.trim():"Voce");});
  document.querySelectorAll("section .st").forEach(e=>add(e,"Sezione"));
  skIdx=idx;
}
function skOpen(){
  if(!skIdx)skBuild();
  const o=document.getElementById("sk-ov");if(!o)return;
  o.classList.add("open");
  const i=document.getElementById("sk-inp");i.value="";i.focus();
  skRes=[];skSel=0;skRender("");
}
function skClose(){const o=document.getElementById("sk-ov");if(o)o.classList.remove("open");}
function skEsc(t){return t.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function skMark(t,words){
  let h=skEsc(t);
  words.forEach(w=>{if(!w)return;
    const n=skNorm(h);const at=n.indexOf(w);
    if(at<0)return;
    h=h.slice(0,at)+"<mark>"+h.slice(at,at+w.length)+"</mark>"+h.slice(at+w.length);
  });
  return h;
}
function skHits(words){
  const out=[];
  for(const it of skIdx){
    const inName=words.every(w=>it.l.indexOf(w)>=0);
    const cl=skNorm(it.c);
    const inCat=!inName&&words.every(w=>cl.indexOf(w)>=0);
    if(!inName&&!inCat)continue;
    let sc=inCat?3:2;
    if(inName){
      if(it.l.indexOf(words[0])===0)sc=0;
      else if(new RegExp("(^|[ '\u2019(\\-])"+words[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(it.l))sc=1;
    }
    out.push({it:it,sc:sc});
  }
  return out;
}
function skRender(q){
  const list=document.getElementById("sk-list");if(!list)return;
  const nq=skNorm(q).trim();
  if(!nq){skRes=[];list.innerHTML='<div class="sk-none">Scrivi per cercare tra Behemoth, armi, celle, omnicelle, AMP, NPC e sezioni.</div>';return;}
  const words0=nq.split(/\s+/).filter(Boolean);
  // in italiano singolare/plurale cambiano la coda: se non trovo nulla, accorcio le parole
  let words=words0, hits=[];
  for(let cut=0;cut<=2;cut++){
    words=words0.map(w=>w.length-cut>=3?w.slice(0,w.length-cut):w);
    hits=skHits(words);
    if(hits.length)break;
  }
  hits.sort((a,b)=>a.sc-b.sc||a.it.t.length-b.it.t.length||a.it.t.localeCompare(b.it.t));
  skRes=hits.slice(0,14).map(h=>h.it);skSel=0;
  if(!skRes.length){list.innerHTML='<div class="sk-none">Nessun risultato per \u201c'+skEsc(q)+'\u201d.</div>';return;}
  list.innerHTML=skRes.map((r,i)=>'<div class="sk-it'+(i===0?" on":"")+'" onclick="skGo('+i+')" onmouseenter="skHover('+i+')"><span class="nm">'+skMark(r.t,words)+'</span><span class="cat">'+skEsc(r.c)+'</span></div>').join("");
}
function skHover(i){skSel=i;[...document.querySelectorAll(".sk-it")].forEach((e,j)=>e.classList.toggle("on",j===i));}
function skMove(d){
  if(!skRes.length)return;
  skSel=(skSel+d+skRes.length)%skRes.length;
  const els=[...document.querySelectorAll(".sk-it")];
  els.forEach((e,j)=>e.classList.toggle("on",j===skSel));
  if(els[skSel])els[skSel].scrollIntoView({block:"nearest"});
}
function skGo(i){
  const it=skRes[(i===undefined?skSel:i)];if(!it)return;
  skClose();
  const card=it.e.closest(".bcard,.ccrd,.card,tr")||it.e;
  if(card.classList.contains("hidden"))card.classList.remove("hidden");
  const sec=it.e.closest("section");
  if(sec&&sec.style.display==="none")sec.style.display="";
  setTimeout(()=>{
    card.scrollIntoView({behavior:"smooth",block:"center"});
    card.classList.remove("sk-hit");void card.offsetWidth;card.classList.add("sk-hit");
    setTimeout(()=>card.classList.remove("sk-hit"),2600);
  },60);
}
document.addEventListener("keydown",function(e){
  const o=document.getElementById("sk-ov");const open=o&&o.classList.contains("open");
  if(!open){
    const tag=(e.target.tagName||"").toLowerCase();
    const typing=tag==="input"||tag==="textarea"||tag==="select"||e.target.isContentEditable;
    if((e.key==="k"||e.key==="K")&&(e.ctrlKey||e.metaKey)){e.preventDefault();skOpen();return;}
    if(e.key==="/"&&!typing&&!e.ctrlKey&&!e.metaKey){e.preventDefault();skOpen();return;}
    return;
  }
  if(e.key==="Escape"){e.preventDefault();skClose();}
  else if(e.key==="ArrowDown"){e.preventDefault();skMove(1);}
  else if(e.key==="ArrowUp"){e.preventDefault();skMove(-1);}
  else if(e.key==="Enter"){e.preventDefault();skGo();}
});


const ML_HYP=["symael","azrael","raphael","mykael"];
let mlTmr={};
function mlSave(k){
  try{localStorage.setItem("tcj-mael-"+k,document.getElementById("ml-"+k).value);}catch(e){}
  const s=document.getElementById("ml-sv-"+k);if(!s)return;
  s.textContent="\u2713 salvato";s.classList.add("on");
  clearTimeout(mlTmr[k]);mlTmr[k]=setTimeout(function(){s.classList.remove("on")},1800);
}
function mlLoad(){ML_HYP.forEach(function(k){try{const v=localStorage.getItem("tcj-mael-"+k),e=document.getElementById("ml-"+k);if(e&&v!==null)e.value=v;}catch(e){}});}

function bkKeys(){const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.indexOf("tcj-")===0||k.indexOf("tcj_bg_")===0)&&["tcj-pa-open","tcj-pa-seen","tcj-pa-theme"].indexOf(k)<0)o.push(k);}}catch(e){}return o.sort();}
function bkMsg(h){const m=document.getElementById("bk-msg");if(m)m.innerHTML=h;}
function bkExport(){
  const ks=bkKeys();
  if(!ks.length){bkMsg("Non c'\u00e8 ancora nulla da salvare: compila la scheda e premi <b>Salva Scheda</b>, poi riprova.");return;}
  const data={};ks.forEach(k=>{data[k]=localStorage.getItem(k)});
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  const stamp=now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate());
  const blob=new Blob([JSON.stringify({app:"the-careless-journey",v:1,salvato:now.toISOString(),data:data},null,1)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tcj-backup-"+stamp+".json";
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  bkMsg("Backup scaricato: <b>"+ks.length+"</b> voci salvate in <b>tcj-backup-"+stamp+".json</b>. Conservalo fuori dal browser \u2014 in una cartella, su una chiavetta o allegato a te stesso.");
}
let bkPending=null;
function bkPick(inp){
  const f=inp.files&&inp.files[0];inp.value="";if(!f)return;
  const r=new FileReader();
  r.onload=function(){
    let j;
    try{j=JSON.parse(r.result)}catch(e){bkMsg("Questo file non \u00e8 un backup valido: non riesco a leggerlo.");return;}
    if(!j||!j.data||typeof j.data!=="object"){bkMsg("Questo file non sembra un backup del sito.");return;}
    const n=Object.keys(j.data).filter(k=>k.indexOf("tcj-")===0&&k!=="tcj-pa-open").length;const chi=SC_CHARS.filter(c=>j.data["tcj-sc4-"+c.k]).map(c=>c.e+" "+c.n);
    if(!n){bkMsg("Il file \u00e8 leggibile ma non contiene dati del sito.");return;}
    bkPending=j.data;
    const q=j.salvato?new Date(j.salvato):null;
    const quando=q&&!isNaN(q)?q.toLocaleDateString("it-IT",{day:"numeric",month:"long",year:"numeric"}):"data sconosciuta";
    bkMsg("Trovato un backup del <b>"+quando+"</b> con <b>"+n+"</b> voci"+(chi.length?" (aree: <b>"+chi.join(", ")+"</b>)":"")+". Ripristinarlo <b>aggiorna solo i dati contenuti nel file</b>: tutto il resto salvato in questo browser rimane com'\u00e8."+
      "<div class='bk-row' style='margin-top:.7rem'><button class='bk-btn go' type='button' onclick='bkApply()'>S\u00ec, ripristina</button>"+
      "<button class='bk-btn no' type='button' onclick='bkCancel()'>Annulla</button></div>");
  };
  r.onerror=function(){bkMsg("Non sono riuscito a leggere il file.")};
  r.readAsText(f);
}
function bkCancel(){bkPending=null;bkMsg("Ripristino annullato: non ho toccato nulla.");}
function bkApply(){
  if(!bkPending)return;
  try{
    Object.keys(bkPending).forEach(k=>{if((k.indexOf("tcj-")===0||k.indexOf("tcj_bg_")===0)&&["tcj-pa-open","tcj-pa-seen","tcj-pa-theme"].indexOf(k)<0)localStorage.setItem(k,bkPending[k])});
  }catch(e){bkMsg("Ripristino non riuscito: il browser ha rifiutato la scrittura.");return;}
  clearTimeout(paT);window.paNoSave=true;
  bkPending=null;
  bkMsg("Ripristinato. Ricarico la pagina\u2026");
  setTimeout(()=>location.reload(),700);
}

/* ==== Area dello Slayer ==== */
/* Codici d'accesso: cambiali qui (maiuscole/minuscole non contano) */
const PA_CODES={athena:"OrsoPolare",panlan:"eclissi",asonnes:"DoccinoSenpai"};
const PA_FULL={athena:"Athena de la Roche",panlan:"Pan Lan Batuk",asonnes:"Asonnes Eninbaal"};
const PA_SIGLA={athena:"ATH",panlan:"PNL",asonnes:"ASN"};
const PA_IDF=["nome","titolo","eta","giorno","triade","aether","continente","terra","casata","segni","motto"];
let paT=null;
function paMaster(){try{return typeof mOpen!=="undefined"&&mOpen}catch(e){return false}}
const PA_TTL=3*24*3600*1000; /* l'area si richiude dopo 3 giorni senza visite */
function paExpire(){try{const now=Date.now(),last=parseInt(localStorage.getItem("tcj-pa-seen")||"0",10);let gone=false;
 if(last&&now-last>PA_TTL&&localStorage.getItem("tcj-pa-open")){localStorage.removeItem("tcj-pa-open");localStorage.removeItem("tcj-pa-theme");gone=true;}
 localStorage.setItem("tcj-pa-seen",String(now));return gone;}catch(e){return false}}
paExpire();
setInterval(function(){if(!document.hidden){try{localStorage.setItem("tcj-pa-seen",String(Date.now()))}catch(e){}}},60000);
document.addEventListener("visibilitychange",function(){if(document.hidden)return;if(paExpire()){try{paThemeOn=false;scBuild();slRender();}catch(e){}}});
function paOpenList(){try{const l=JSON.parse(localStorage.getItem("tcj-pa-open")||"[]");return Array.isArray(l)?l:[]}catch(e){return[]}}
function paIsOpen(k){return paMaster()||paOpenList().indexOf(k)>=0}
function paSetOpen(k,on){let l=paOpenList().filter(x=>x!==k);if(on)l.push(k);try{localStorage.setItem("tcj-pa-open",JSON.stringify(l))}catch(e){}}
function paChar(){return SC_CHARS.find(c=>c.k===scCur)||SC_CHARS[0]}
function paPrep(){const sec=document.getElementById("scheda"),c=paChar(),open=paIsOpen(scCur);
 if(sec)sec.setAttribute("data-pg",scCur);paTheme();
 const t=document.getElementById("pa-title");if(t)t.textContent=PA_FULL[scCur]||c.n;
 const g=document.getElementById("pa-gate"),b=document.getElementById("pa-body");
 if(g)g.style.display=open?"none":"";if(b)b.style.display=open?"":"none";
 if(!open){const nm=document.getElementById("pa-gate-nm");if(nm)nm.textContent=c.n;const se=document.getElementById("pa-gate-seal");if(se)se.textContent=c.e;const inp=document.getElementById("pa-code");if(inp)inp.value="";const er=document.getElementById("pa-gate-err");if(er)er.classList.remove("on");scTabs();return false;}
 const lb=document.getElementById("pa-lockbtn");if(lb)lb.style.display=paOpenList().indexOf(scCur)>=0?"":"none";
 paStatus(paMaster()&&paOpenList().indexOf(scCur)<0?"Aperta con l'accesso Master":"Salvataggio automatico attivo");
 return true;}
function paTry(){const inp=document.getElementById("pa-code"),v=(inp?inp.value:"").trim().toLowerCase();
 if(v&&v===String(PA_CODES[scCur]||"").toLowerCase()){paSetOpen(scCur,true);paThemeOn=true;scBuild();pgPlay(scCur);const b=document.getElementById("pa-body");if(b){b.classList.remove("pa-in");void b.offsetWidth;b.classList.add("pa-in");}if(window.__sfxBurst){try{window.__sfxBurst()}catch(e){}}return;}
 sfxPlay("deny");const er=document.getElementById("pa-gate-err"),g=document.getElementById("pa-gate");if(er)er.classList.add("on");if(g){g.classList.remove("pa-shake");void g.offsetWidth;g.classList.add("pa-shake");}if(inp){inp.select();}}
function paLock(){clearTimeout(paT);scSave(true);paSetOpen(scCur,false);scBuild();}
function paRefresh(){if(document.getElementById("pa-body").style.display==="none")scBuild();else scTabs();}
function paStatus(txt,ok){const e=document.getElementById("pa-status");if(!e)return;e.textContent=txt;e.classList.toggle("ok",!!ok);}
function paFlush(){try{if(paT){clearTimeout(paT);paT=null;scSave(true);}}catch(e){}try{if(typeof alT!=="undefined"&&alT){clearTimeout(alT);alT=null;alSave();}}catch(e){}}
window.addEventListener("pagehide",paFlush);window.addEventListener("beforeunload",paFlush);document.addEventListener("visibilitychange",function(){if(document.hidden)paFlush();});
function paAuto(){clearTimeout(paT);paT=setTimeout(function(){paT=null;scSave(true);paStatus("✓ Salvato",true);clearTimeout(paStatus._t);paStatus._t=setTimeout(function(){paStatus("Salvataggio automatico attivo")},1600);},700);}
/* SEAL_P: spostato in dati/sigillo-e-ranghi.js */
/* Loghi dei ranghi: tracciati dalle immagini fornite */
/* RANK_LOGO: spostato in dati/sigillo-e-ranghi.js */
/* ==== Sigillo di ceralacca del rango ==== */
const SEAL_DEF={novizio:{w:"#d9d1bf",l:"#6f6450",n:"Novizio"},cacciatore:{w:"#7b4a28",l:"#efc98e",n:"Cacciatore"},discepolo:{w:"#23508f",l:"#cfe0ff",n:"Discepolo"},maestro:{w:"#c99a2e",l:"#5a3c0b",n:"Maestro"},fenice:{w:"#9e1519",l:"#ffd27a",n:"Fenice"}};
function sealHex(v,d){return /^#[0-9a-f]{6}$/i.test(v||"")?v:d}
function sealShade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;
 if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}
 return "#"+[r,g,b].map(function(x){return Math.round(Math.max(0,Math.min(255,x))).toString(16).padStart(2,"0")}).join("")}
function sealSVG(rank,w,l){const lg=(typeof RANK_LOGO!=="undefined")&&RANK_LOGO[rank],u="sl"+rank;
 const wd=sealShade(w,-.38),wl=sealShade(w,.32),ld=sealShade(l,-.45);
 let logo="";
 if(lg){const b=lg.bb,sz=Math.max(b[2],b[3]),k=88/sz,ox=100-(b[0]+b[2]/2)*k,oy=100-(b[1]+b[3]/2)*k;
  logo='<g transform="translate('+ox.toFixed(2)+','+oy.toFixed(2)+') scale('+k.toFixed(5)+')"><g transform="'+lg.tr+'"><path d="'+lg.d+'" fill="'+l+'" filter="url(#'+u+'-emb)"/></g></g>';}
 else logo='<text x="100" y="114" text-anchor="middle" font-family="Cinzel Decorative,serif" font-size="44" fill="'+l+'" filter="url(#'+u+'-emb)">✦</text>';
 return '<svg viewBox="0 0 200 200" class="seal-svg" aria-hidden="true"><defs>'+
  '<radialGradient id="'+u+'-g" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="'+wl+'"/><stop offset=".55" stop-color="'+w+'"/><stop offset="1" stop-color="'+wd+'"/></radialGradient>'+
  '<radialGradient id="'+u+'-i" cx="60%" cy="65%" r="70%"><stop offset="0" stop-color="'+w+'"/><stop offset="1" stop-color="'+sealShade(w,-.18)+'"/></radialGradient>'+
  '<filter id="'+u+'-emb" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="-1.1" dy="-1.1" stdDeviation=".5" flood-color="'+ld+'" flood-opacity=".9"/><feDropShadow dx="1" dy="1" stdDeviation=".6" flood-color="#fff" flood-opacity=".35"/></filter>'+
  '<filter id="'+u+'-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="4" stdDeviation="3.5" flood-color="#000" flood-opacity=".55"/></filter></defs>'+
  '<path d="'+SEAL_P.outer+'" fill="url(#'+u+'-g)" filter="url(#'+u+'-sh)"/>'+
  '<path d="'+SEAL_P.inner+'" fill="url(#'+u+'-i)" stroke="'+wd+'" stroke-width="3" stroke-opacity=".7"/>'+
  '<path d="'+SEAL_P.inner+'" fill="none" stroke="'+wl+'" stroke-width="1.6" stroke-opacity=".6" transform="translate(1.6,1.8)"/>'+
  logo+
  '<ellipse cx="74" cy="56" rx="26" ry="11" transform="rotate(-32 74 56)" fill="#fff" opacity=".22"/>'+
  '<ellipse cx="64" cy="50" rx="7" ry="3" transform="rotate(-32 64 50)" fill="#fff" opacity=".45"/></svg>';}
function sealGet(){const r=scGv("sc-rango"),df=SEAL_DEF[r];if(!df)return null;const o=(window.SEAL_CUR||{})[r]||{};return {r:r,w:sealHex(o.w,df.w),l:sealHex(o.l,df.l),df:df};}
function sealRender(){const box=document.getElementById("pa-seal");if(!box)return;const s=sealGet();
 if(!s){box.style.display="none";return;}box.style.display="";
 const vis=document.getElementById("pa-seal-vis");const ctl=document.getElementById("pa-seal-ctl");
 if(vis){vis.innerHTML=sealSVG(s.r,s.w,s.l);if(window.SEAL_LAST&&window.SEAL_LAST!==s.r){vis.classList.remove("stamp");void vis.offsetWidth;vis.classList.add("stamp");sfxPlay("seal");}window.SEAL_LAST=s.r;vis.setAttribute("title","Sigillo del rango: "+s.df.n);}
 if(ctl){const cw=document.getElementById("pa-seal-w"),cl=document.getElementById("pa-seal-l");if(cw)cw.value=s.w;if(cl)cl.value=s.l;
  const rb=document.getElementById("pa-seal-reset");if(rb)rb.style.visibility=(s.w!==s.df.w||s.l!==s.df.l)?"visible":"hidden";
  const nm=document.getElementById("pa-seal-nm");if(nm)nm.textContent=s.df.n;}}
function sealSet(k,v){const r=scGv("sc-rango");if(!SEAL_DEF[r])return;window.SEAL_CUR=window.SEAL_CUR||{};const o=window.SEAL_CUR[r]=window.SEAL_CUR[r]||{};o[k]=v;sealRender();paAuto();}
function sealReset(){const r=scGv("sc-rango");if(window.SEAL_CUR)delete window.SEAL_CUR[r];sealRender();paAuto();}
function sealToggle(){const c=document.getElementById("pa-seal-ctl");if(c)c.hidden=!c.hidden;}
document.addEventListener("change",function(e){if(e.target&&e.target.id==="sc-rango")sealRender();});
const PA_FR={glaciale:"\u2744\uFE0E",ardente:"\u2739",folgorante:"\u03DF",terrestre:"\u2766",radiante:"\u2726",oscuro:"\u263E",ramsgate:"\u2693\uFE0E"};
function paFrame(){const c=document.querySelector(".pa-id"),v=scGv("pa-id-continente");if(!c)return;if(PA_FR[v]){c.setAttribute("data-cont",v);c.querySelectorAll(".pa-co").forEach(function(s){s.textContent=PA_FR[v]});}else{c.removeAttribute("data-cont");c.querySelectorAll(".pa-co").forEach(function(s){s.textContent=""});}}
document.addEventListener("change",function(e){if(e.target&&e.target.id==="pa-id-continente")paFrame();});
function paBuild(d){window.SEAL_CUR=(d.seal&&typeof d.seal==="object")?d.seal:{};window.SEAL_LAST=null;const id=d.id||{};PA_IDF.forEach(f=>{const e=document.getElementById("pa-id-"+f);if(e)e.value=id[f]!==undefined?id[f]:"";});
 if(id.nome===undefined){const e=document.getElementById("pa-id-nome");if(e)e.value=PA_FULL[scCur]||"";}
 paSetPortrait(id.ritratto||"");paFrame();
 const se=document.getElementById("pa-id-seal");if(se)se.textContent=paChar().e;
 const nu=document.getElementById("pa-id-num");if(nu)nu.textContent="TCJ · "+(PA_SIGLA[scCur]||scCur.toUpperCase())+" · "+String((scCur.length*37+SC_CHARS.findIndex(c=>c.k===scCur)*113+101)%900+100);
 let notes=d.notes;if(!Array.isArray(notes)){notes=[];let old=null;try{old=localStorage.getItem("tcj-n-"+scCur)}catch(e){}if(old)notes.push({t:"Appunti",b:old});else notes.push({t:"Diario",b:""});}
 const box=document.getElementById("pa-notes");if(box){box.innerHTML="";notes.forEach(n=>box.appendChild(paNoteEl(n.t,n.b)));paNotesEmpty();}}
function paGetId(){const o={};PA_IDF.forEach(f=>{o[f]=scGv("pa-id-"+f)});const im=document.getElementById("pa-portrait");o.ritratto=im&&im.dataset.src?im.dataset.src:"";return o;}
function paSetPortrait(src){const im=document.getElementById("pa-portrait"),ph=document.getElementById("pa-ph"),del=document.getElementById("pa-ph-del");if(!im)return;im.dataset.src=src||"";if(src){im.src=src;}else{im.removeAttribute("src");}if(ph)ph.classList.toggle("has",!!src);if(del)del.style.display=src?"":"none";}
function paPortrait(inp){const f=inp.files&&inp.files[0];inp.value="";if(!f)return;const r=new FileReader();r.onload=function(){const img=new Image();img.onload=function(){pcOpen(img)};img.src=r.result;};r.readAsDataURL(f);}
/* --- ritaglio del ritratto (3:4) --- */
let PC=null;
function pcOpen(img){sfxPlay("paper");const ov=document.getElementById("pcrop"),el=document.getElementById("pc-img"),z=document.getElementById("pc-zoom");ov.classList.add("open");el.src=img.src;
 const st=document.getElementById("pc-stage").getBoundingClientRect();const W=st.width,H=st.height,iw=img.naturalWidth,ih=img.naturalHeight,min=Math.max(W/iw,H/ih);
 PC={img:img,iw:iw,ih:ih,W:W,H:H,min:min,s:min,x:(W-iw*min)/2,y:(H-ih*min)/2,ptr:{}};el.style.width=iw+"px";el.style.height=ih+"px";z.value=0;pcApply();}
function pcApply(){const P=PC;if(!P)return;const w=P.iw*P.s,h=P.ih*P.s;P.x=Math.min(0,Math.max(P.W-w,P.x));P.y=Math.min(0,Math.max(P.H-h,P.y));
 document.getElementById("pc-img").style.transform="translate("+P.x+"px,"+P.y+"px) scale("+P.s+")";}
function pcZoomTo(ns,cx,cy){const P=PC;if(!P)return;ns=Math.max(P.min,Math.min(P.min*4,ns));if(cx===undefined){cx=P.W/2;cy=P.H/2;}P.x=cx-(cx-P.x)*ns/P.s;P.y=cy-(cy-P.y)*ns/P.s;P.s=ns;
 document.getElementById("pc-zoom").value=Math.round((ns/P.min-1)/3*100);pcApply();}
function pcSlide(v){if(PC)pcZoomTo(PC.min*(1+3*v/100));}
function pcClose(){document.getElementById("pcrop").classList.remove("open");PC=null;}
function pcOk(){const P=PC;if(!P)return;const OW=360,OH=480,k=OW/P.W;const cv=document.createElement("canvas");cv.width=OW;cv.height=OH;const c=cv.getContext("2d");c.imageSmoothingQuality="high";
 c.drawImage(P.img,P.x*k,P.y*k,P.iw*P.s*k,P.ih*P.s*k);let url;try{url=cv.toDataURL("image/jpeg",.86)}catch(e){pcClose();return}pcClose();paSetPortrait(url);paAuto();}
(function(){function init(){const st=document.getElementById("pc-stage");if(!st)return;
 st.addEventListener("pointerdown",function(e){if(!PC)return;st.setPointerCapture(e.pointerId);PC.ptr[e.pointerId]={x:e.clientX,y:e.clientY};e.preventDefault();});
 st.addEventListener("pointermove",function(e){if(!PC||!PC.ptr[e.pointerId])return;const ids=Object.keys(PC.ptr),prev=PC.ptr[e.pointerId];
  if(ids.length===1){PC.x+=e.clientX-prev.x;PC.y+=e.clientY-prev.y;PC.ptr[e.pointerId]={x:e.clientX,y:e.clientY};pcApply();}
  else if(ids.length===2){const o=PC.ptr[ids[0]==String(e.pointerId)?ids[1]:ids[0]],d0=Math.hypot(prev.x-o.x,prev.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y);PC.ptr[e.pointerId]={x:e.clientX,y:e.clientY};
   const r=st.getBoundingClientRect();if(d0>0)pcZoomTo(PC.s*d1/d0,(e.clientX+o.x)/2-r.left,(e.clientY+o.y)/2-r.top);}});
 const up=function(e){if(PC)delete PC.ptr[e.pointerId];};st.addEventListener("pointerup",up);st.addEventListener("pointercancel",up);
 st.addEventListener("wheel",function(e){if(!PC)return;e.preventDefault();const r=st.getBoundingClientRect();pcZoomTo(PC.s*(e.deltaY<0?1.08:1/1.08),e.clientX-r.left,e.clientY-r.top);},{passive:false});}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();})();
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&PC)pcClose();});
function paPortraitDel(){paSetPortrait("");paAuto();}
function paGrow(t){t.style.height="auto";t.style.height=Math.max(90,t.scrollHeight)+"px";}
function paNoteEl(title,body){const w=document.createElement("div");w.className="pa-note";
 w.innerHTML='<div class="pa-note-top"><input class="pa-note-t" placeholder="Titolo della sezione" aria-label="Titolo della sezione"><div class="pa-note-ctl"><button type="button" title="Sposta su" onclick="paNoteMove(this,-1)">▲</button><button type="button" title="Sposta giù" onclick="paNoteMove(this,1)">▼</button><button type="button" class="del" title="Elimina sezione" onclick="paNoteDel(this)">✕</button></div></div><textarea class="pa-note-b" placeholder="Scrivi qui…" oninput="paGrow(this)"></textarea>';
 w.querySelector(".pa-note-t").value=title||"";const ta=w.querySelector(".pa-note-b");ta.value=body||"";setTimeout(function(){paGrow(ta)},0);return w;}
function paGetNotes(){return[].slice.call(document.querySelectorAll("#pa-notes .pa-note")).map(n=>({t:n.querySelector(".pa-note-t").value,b:n.querySelector(".pa-note-b").value}));}
function paNotesEmpty(){const box=document.getElementById("pa-notes");if(!box)return;const has=box.querySelector(".pa-note");let em=box.querySelector(".pa-note-empty");if(!has&&!em){em=document.createElement("div");em.className="pa-note-empty";em.textContent="Nessuna sezione. Aggiungine una qui sotto.";box.appendChild(em);}else if(has&&em){em.remove();}}
function paNoteAdd(){const box=document.getElementById("pa-notes");if(!box)return;const el=paNoteEl("Nuova sezione","");box.appendChild(el);paNotesEmpty();const t=el.querySelector(".pa-note-t");t.focus();t.select();paAuto();}
function paNoteMove(btn,dir){const n=btn.closest(".pa-note");if(!n)return;if(dir<0&&n.previousElementSibling)n.parentNode.insertBefore(n,n.previousElementSibling);else if(dir>0&&n.nextElementSibling)n.parentNode.insertBefore(n.nextElementSibling,n);paAuto();}
function paNoteDel(btn){if(!btn.classList.contains("arm")){btn.classList.add("arm");btn.textContent="Elimina?";clearTimeout(btn._t);btn._t=setTimeout(function(){btn.classList.remove("arm");btn.textContent="✕";},3000);return;}const n=btn.closest(".pa-note");if(n)n.remove();paNotesEmpty();paAuto();}
document.addEventListener("input",function(e){if(e.target&&e.target.closest&&e.target.closest("#pa-body")&&e.target.id!=="bk-file")paAuto();});
document.addEventListener("change",function(e){if(e.target&&e.target.closest&&e.target.closest("#pa-body")&&e.target.id!=="bk-file"&&e.target.id!=="pa-portrait-file")paAuto();});
document.addEventListener("click",function(e){const t=e.target;if(!t||!t.closest)return;if(t.closest(".bk-btn")||t.closest(".pa-note-ctl"))return;if((t.closest("#pa-body")&&t.closest("button,.sc-dot,.sc-comp-row,.cr-box"))||t.closest("#cr-ov button"))paAuto();});
/* Armi degli Slayer: disegno vettoriale in oro (ricavato dalle immagini fornite) */
/* PG_WP: spostato in dati/ritratti-giocatori.js */
/* ==== Animazione di sblocco del personaggio (8 s, saltabile) ==== */
let PG=null;
function pgWeaponHTML(k){const w=(typeof PG_WP!=="undefined")&&PG_WP[k];
 if(!w){const c=SC_CHARS.find(x=>x.k===k);return '<div class="pgun-ph">'+(c?c.e:"✦")+'</div>';}
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+w.vb+'" aria-hidden="true"><g transform="'+w.tr+'">'+w.L.map(l=>'<path fill="'+l[0]+'" d="'+l[1]+'"/>').join("")+'</g></svg>';}
function pgEase(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function pgR(a,b){return a+Math.random()*(b-a)}
function pgPlay(k){
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const ov=document.getElementById("pgun"),cv=document.getElementById("pgun-cv"),wp=document.getElementById("pgun-wp");if(!ov||!cv||!wp)return;
 if(PG)pgEnd();
 wp.innerHTML=pgWeaponHTML(k);wp.style.opacity="0";
 ov.className="show pg-"+k;ov.style.opacity="0";
 PG={k:k,ov:ov,wp:wp,cv:cv,t0:performance.now(),skipT:0,op:0,boom:false};pgSize();
 PG.rs=function(){if(PG)pgSize();};window.addEventListener("resize",PG.rs);
 PG.key=function(e){if(e.key==="Escape"||e.key===" "||e.key==="Enter"){e.preventDefault();pgSkip();}};
 const G0=PG;setTimeout(function(){if(PG===G0)document.addEventListener("keydown",G0.key);},350);
 PG.raf=requestAnimationFrame(pgLoop);}
function pgSize(){const G=PG;if(!G)return;const r=G.ov.getBoundingClientRect(),W=Math.max(1,Math.round(r.width)),H=Math.max(1,Math.round(r.height)),dpr=Math.min(window.devicePixelRatio||1,1.25);
 G.cv.width=Math.round(W*dpr);G.cv.height=Math.round(H*dpr);G.ctx=G.cv.getContext("2d");G.ctx.setTransform(dpr,0,0,dpr,0,0);G.W=W;G.H=H;G.geo=pgGeo(G.k,W,H);}
function pgSkip(){if(PG&&!PG.skipT)PG.skipT=performance.now();}
function pgEnd(){if(!PG)return;cancelAnimationFrame(PG.raf);document.removeEventListener("keydown",PG.key);window.removeEventListener("resize",PG.rs);PG.ov.className="";PG.ov.style.opacity="0";PG.wp.innerHTML="";PG=null;}
function pgLoop(now){const G=PG;if(!G)return;const t=(now-G.t0)/1000;
 if(G.skipT){const s=(now-G.skipT)/450;G.ov.style.opacity=String(Math.max(0,G.op*(1-s)));if(s>=1){pgEnd();return;}G.raf=requestAnimationFrame(pgLoop);return;}
 const op=t<.8?t/.8:t<7.2?1:Math.max(0,1-(t-7.2)/.8);G.op=op;G.ov.style.opacity=String(op);
 const p=t<.8?0:t<3.2?pgEase((t-.8)/2.4):t<5?1:t<6.8?1-pgEase((t-5)/1.8):0;
 const a=t<3?0:t<4?pgEase(t-3):t<6.4?1:Math.max(0,1-(t-6.4)/.9);
 const sc=.62+.38*pgEase((t-3)/1.3)+(t>6.4?(t-6.4)*.07:0);
 G.wp.style.opacity=String(a);G.wp.style.transform="translate(-50%,-50%) scale("+sc.toFixed(4)+")";
 if(!G.boom&&t>=3){G.boom=true;if(window.__sfxBurst){try{window.__sfxBurst()}catch(e){}}}
 const sk=document.getElementById("pgun-skip");if(sk)sk.style.opacity=(t>1&&t<6.8)?"1":"0";
 pgDraw(G,p,t);
 if(t>=8){pgEnd();return;}
 G.raf=requestAnimationFrame(pgLoop);}
/* --- geometria precalcolata: la ritirata è la crescita al contrario --- */
function pgGeo(k,W,H){const cx=W/2,cy=H/2,M=Math.min(W,H),dens=Math.max(.8,Math.min(1,W*H/(1366*850)));
 const per=[];const step=(k==="asonnes"?80:72)*Math.max(.55,Math.min(1,M/850));for(let x=step/2;x<W;x+=step){per.push([x,0]);per.push([x,H]);}for(let y=step/2;y<H;y+=step){per.push([0,y]);per.push([W,y]);}
 if(k==="athena"){const segs=[];let maxD=0;
  const fern=function(x,y,ang,len,w,d0,dep){const st=13,n=Math.max(2,Math.round(len/st));let a=ang,d=d0,side=1;
   for(let i=0;i<n;i++){a+=pgR(-.08,.08);const x2=x+Math.cos(a)*st,y2=y+Math.sin(a)*st;segs.push([x,y,x2,y2,d,d+st,w*(1-i/n*.6)]);
    if(dep>0&&i>0&&i%2===0){const rem=(n-i)/n,bl=len*.34*rem+8;fern(x2,y2,a+side*pgR(.95,1.15),bl,w*.55,d+st,dep-1);fern(x2,y2,a-side*pgR(.95,1.15),bl*.8,w*.55,d+st,dep-1);side=-side;}
    x=x2;y=y2;d+=st;}
   if(d>maxD)maxD=d;};
  per.forEach(function(q){if(Math.random()>dens*.72)return;const ang=Math.atan2(cy-q[1],cx-q[0])+pgR(-.5,.5);const dist=Math.hypot(cx-q[0],cy-q[1]);fern(q[0],q[1],ang,dist*pgR(.4,.75),pgR(1.4,2.2),pgR(0,50),1);});
  const sp=[];for(let i=0;i<260*dens;i++)sp.push([Math.random()*W,Math.random()*H,Math.random(),pgR(.6,1.8)]);
  return {segs:segs,maxD:maxD,sp:sp};}
 if(k==="panlan"){const dr=[];const n=Math.round(14+12*dens);for(let i=0;i<n;i++)dr.push([Math.random()*W,pgR(18,46),pgR(.12,.42)*H,pgR(0,6.28)]);
  const bub=[];for(let i=0;i<50*dens;i++)bub.push([Math.random()*W,Math.random(),pgR(1.5,5),pgR(.3,1)]);
  return {dr:dr,bub:bub};}
 /* asonnes: viticci */
 const vines=[];const add=function(x,y,ang,len,w,d0,dep){const pts=[[x,y]];let a=ang,cur=pgR(-.02,.02);const n=Math.max(4,Math.round(len/9));
  for(let i=0;i<n;i++){cur+=pgR(-.012,.012);cur=Math.max(-.05,Math.min(.05,cur));a+=cur+Math.sin(i*.25+d0)*.02;x+=Math.cos(a)*9;y+=Math.sin(a)*9;pts.push([x,y]);}
  const leaves=[];for(let i=4;i<pts.length-2;i+=Math.round(pgR(4,7)))leaves.push([i,(leaves.length%2?1:-1),pgR(8,16)]);
  const curl=[];const cs=Math.sign(cur)||1;let ca=a,cx2=x,cy2=y,cr=7;for(let i=0;i<14;i++){ca+=cs*.45;cr*=.9;cx2+=Math.cos(ca)*cr;cy2+=Math.sin(ca)*cr;curl.push([cx2,cy2]);}
  vines.push({pts:pts.concat(curl),body:pts.length,w:w,d0:d0,leaves:leaves});
  if(dep>0)for(let j=0;j<2;j++){const i=Math.round(pts.length*pgR(.25,.7));const q=pts[i];add(q[0],q[1],a+(j?1:-1)*pgR(.5,1.1),len*pgR(.3,.5),w*.55,d0+i*9,dep-1);}};
 per.forEach(function(q){if(Math.random()>dens*1.05)return;const ang=Math.atan2(cy-q[1],cx-q[0])+pgR(-.5,.5);const dist=Math.hypot(cx-q[0],cy-q[1]);add(q[0],q[1],ang,dist*pgR(.6,1.1),pgR(6,11),pgR(0,60),1);});
 let maxD=0;vines.forEach(function(v){v.len=v.pts.length*9;maxD=Math.max(maxD,v.d0+v.len);});
 return {vines:vines,maxD:maxD};}
function pgDraw(G,p,t){const c=G.ctx,W=G.W,H=G.H,g=G.geo,cx=W/2,cy=H/2,R=Math.hypot(cx,cy);
 c.clearRect(0,0,W,H);if(p<=0)return;
 const vign=function(rgb,a){const r0=R*(1.08-p),gr=c.createRadialGradient(cx,cy,Math.max(0,r0),cx,cy,r0+R*.45);gr.addColorStop(0,"rgba("+rgb+",0)");gr.addColorStop(1,"rgba("+rgb+","+a+")");c.fillStyle=gr;c.fillRect(0,0,W,H);};
 if(G.k==="athena"){c.fillStyle="rgba(8,24,40,"+(p*.85)+")";c.fillRect(0,0,W,H);vign("150,205,235",.42);
  const P=p*g.maxD*1.02;c.lineCap="round";
  [[4,"rgba(150,205,240,.14)"],[1.6,"rgba(200,235,255,.45)"],[.8,"rgba(240,252,255,.9)"]].forEach(function(st){c.strokeStyle=st[1];c.beginPath();
   g.segs.forEach(function(s){if(s[4]>=P)return;const f=Math.min(1,(P-s[4])/(s[5]-s[4]));c.moveTo(s[0],s[1]);c.lineTo(s[0]+(s[2]-s[0])*f,s[1]+(s[3]-s[1])*f);});
   c.lineWidth=st[0];c.stroke();});
  g.sp.forEach(function(s){if(s[2]>p)return;c.fillStyle="rgba(235,250,255,"+(.35+.4*Math.sin(t*3+s[2]*20))+")";c.fillRect(s[0],s[1],s[3],s[3]);});}
 else if(G.k==="panlan"){const base=p*H*1.12;
  const yAt=function(x){let y=base+Math.sin(x*.012+t*1.4)*9+Math.sin(x*.031-t)*5;g.dr.forEach(function(d){const dx=(x-d[0])/d[1];y+=d[2]*p*Math.exp(-dx*dx)*(1-p*.3);});return y;};
  const gr=c.createLinearGradient(0,0,0,Math.max(1,base+H*.3));gr.addColorStop(0,"#12061f");gr.addColorStop(.65,"#3a1764");gr.addColorStop(1,"#6b34a8");
  c.beginPath();c.moveTo(0,0);c.lineTo(W,0);for(let x=W;x>=-8;x-=8)c.lineTo(x,yAt(x));c.closePath();c.fillStyle=gr;c.fill();
  c.beginPath();for(let x=0;x<=W;x+=8){const y=yAt(x);if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle="rgba(205,165,255,.55)";c.lineWidth=2;c.stroke();
  g.dr.forEach(function(d){const ty=yAt(d[0]);if(ty<H){const fy=ty+((t*140+d[3]*40)%120);c.fillStyle="rgba(120,70,190,.75)";c.beginPath();c.arc(d[0],fy,3.2,0,6.283);c.fill();}});
  g.bub.forEach(function(b){const y=(1-((b[1]+t*.08*b[3])%1))*base;if(y<base-6){c.strokeStyle="rgba(200,160,255,"+(.18*b[3])+")";c.lineWidth=1;c.beginPath();c.arc(b[0],y,b[2],0,6.283);c.stroke();}});}
 else{c.fillStyle="rgba(6,16,6,"+(p*.88)+")";c.fillRect(0,0,W,H);vign("60,95,40",.5);
  const P=p*g.maxD*1.02;c.lineCap="round";c.lineJoin="round";
  g.vines.forEach(function(v){if(v.d0>=P)return;const n=Math.min(v.pts.length,Math.floor((P-v.d0)/9)+1);if(n<2)return;
   const parts=3;for(let s=0;s<parts;s++){const i0=Math.floor((n-1)*s/parts),i1=Math.floor((n-1)*(s+1)/parts);if(i1<=i0)continue;c.beginPath();c.moveTo(v.pts[i0][0],v.pts[i0][1]);for(let i=i0+1;i<=i1;i++)c.lineTo(v.pts[i][0],v.pts[i][1]);
    c.strokeStyle=s===0?"#4a3a22":"#3f6a2c";c.lineWidth=Math.max(1,v.w*(1-s/parts*.75));c.stroke();}
   c.beginPath();for(let i=1;i<n;i+=3){const q=v.pts[i];c.moveTo(q[0],q[1]);c.lineTo(v.pts[Math.min(n-1,i+1)][0],v.pts[Math.min(n-1,i+1)][1]);}c.strokeStyle="rgba(150,200,110,.35)";c.lineWidth=1;c.stroke();
   v.leaves.forEach(function(l){if(l[0]>=n-1)return;const q=v.pts[l[0]],q2=v.pts[l[0]+1];const an=Math.atan2(q2[1]-q[1],q2[0]-q[0])+l[1]*1.0;const grow=Math.min(1,(n-1-l[0])/6),L=l[2]*grow;
    c.save();c.translate(q[0],q[1]);c.rotate(an);c.fillStyle="rgba(110,170,80,.92)";c.beginPath();c.ellipse(L*.55,0,L*.6,L*.27,0,0,6.283);c.fill();c.strokeStyle="rgba(40,70,30,.8)";c.lineWidth=.8;c.beginPath();c.moveTo(0,0);c.lineTo(L,0);c.stroke();c.restore();});});}}

/* --- effetti laterali: elementi aggiuntivi (Ardente, Folgorante, Radiante) --- */
function fxDeco2(c,k,bw,H,si){const mob=FX.mob;
 if(k==="ardente"){fxEdge(c,bw,H,"120,30,10",mob?.4:.3);fxEdge(c,bw,H,"255,120,40",mob?.14:.1);const gb=c.createLinearGradient(0,H*.55,0,H);gb.addColorStop(0,"rgba(200,60,10,0)");gb.addColorStop(1,"rgba(230,90,20,.28)");c.fillStyle=gb;c.fillRect(0,H*.55,bw,H*.45);}
 else if(k==="folgorante"){fxEdge(c,bw,H,"120,100,20",mob?.3:.22);fxEdge(c,bw,H,"245,225,120",mob?.12:.08);}
 else if(k==="radiante"){fxEdge(c,bw,H,"240,235,255",mob?.12:.08);for(let i=0;i<(mob?14:40);i++){c.fillStyle="rgba(255,255,255,"+fxRnd(.15,.45)+")";c.fillRect(Math.pow(Math.random(),2)*bw*.5,Math.random()*H,1,1);}}}
function fxParts2(k,bw,H){const mob=FX.mob,a=[];const n=function(d,m){return mob?m:d};
 if(k==="ardente"){for(let i=0;i<n(26,6);i++)a.push({t:"ember",x:Math.random()*bw*.4,y:Math.random()*H,r:fxRnd(.8,mob?1.6:2.4),vy:-fxRnd(18,42),vx:fxRnd(4,mob?3:14),a:fxRnd(.5,1),ph:fxRnd(0,6.28),fl:fxRnd(6,14)});
  for(let i=0;i<n(8,2);i++)a.push({t:"spark",x:Math.random()*bw*.3,y:Math.random()*H,vy:-fxRnd(60,110),vx:fxRnd(10,mob?6:30),a:fxRnd(.5,.9)});}
 else if(k==="folgorante"){for(let i=0;i<n(10,3);i++)a.push({t:"zap",x0:Math.random()*bw*.8,y:Math.random()*H,vy:fxRnd(-4,4),amp:0,ph:fxRnd(0,6.28),s:fxRnd(3,mob?4:7),a:fxRnd(.6,1)});}
 else if(k==="radiante"){for(let i=0;i<n(18,5);i++)a.push({t:"glint",x0:Math.pow(Math.random(),1.2)*bw*.85,y:Math.random()*H,vy:-fxRnd(2,7),amp:fxRnd(2,6),ph:fxRnd(0,6.28),s:fxRnd(1.2,2.6),r:fxRnd(1.5,mob?2.5:4)});}
 return a;}
function fxPre(c,S,t,bw,H){if(FX.k==="master"){mfxPre(c,S,t,bw,H);return;}if(FX.k!=="radiante")return;const g=c.createLinearGradient(0,0,0,H);for(let i=0;i<=6;i++)g.addColorStop(i/6,"hsla("+((i*60+t*25)%360)+",95%,72%,"+(FX.mob?.24:.2)+")");
 c.save();c.fillStyle=g;c.fillRect(0,0,bw,H);c.globalCompositeOperation="destination-in";const f=c.createLinearGradient(0,0,bw,0);f.addColorStop(0,"rgba(0,0,0,1)");f.addColorStop(.75,"rgba(0,0,0,0)");c.fillStyle=f;c.fillRect(0,0,bw,H);c.restore();}
function fxPost(c,S,t,dt,bw,H){if(FX.k==="master"){mfxPost(c,S,t,dt,bw,H);return;}if(FX.k!=="folgorante")return;S.bolts=S.bolts||[];
 if(Math.random()<dt*(FX.mob?.7:1.1)){const pts=[];let x=0,y=fxRnd(0,H),ang=fxRnd(-.5,.5);const L=bw*fxRnd(.6,1.05);let d=0;pts.push([x,y]);while(d<L){const st=fxRnd(6,13);ang+=fxRnd(-.7,.7);ang=Math.max(-1.1,Math.min(1.1,ang));x+=Math.cos(ang)*st;y+=Math.sin(ang)*st+fxRnd(-4,4);d+=st;pts.push([x,y]);}S.bolts.push({pts:pts,life:1});}
 S.bolts=S.bolts.filter(function(b){b.life-=dt*5.5;return b.life>0;});
 S.bolts.forEach(function(b){const a=b.life*(.6+.4*Math.random());[[4,"rgba(245,225,120,"+(a*.25)+")"],[1.3,"rgba(255,252,220,"+a+")"]].forEach(function(st){c.strokeStyle=st[1];c.lineWidth=st[0];c.beginPath();b.pts.forEach(function(q,i){if(i===0)c.moveTo(q[0],q[1]);else c.lineTo(q[0],q[1]);});c.stroke();});});}
function fxDrawP(c,p,x,fade,t){if(mfxDrawP(c,p,x,fade,t))return;
 if(p.t==="ember"){const fl=.6+.4*Math.sin(t*p.fl+p.ph);const g=c.createRadialGradient(x,p.y,0,x,p.y,p.r*4);g.addColorStop(0,"rgba(255,170,60,"+(p.a*fl*fade*.5)+")");g.addColorStop(1,"rgba(255,90,20,0)");c.fillStyle=g;c.beginPath();c.arc(x,p.y,p.r*4,0,6.283);c.fill();c.fillStyle="rgba(255,225,150,"+(p.a*fl*fade)+")";c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();}
 else if(p.t==="spark"){c.strokeStyle="rgba(255,210,120,"+(p.a*fade)+")";c.lineWidth=1;c.beginPath();c.moveTo(x,p.y);c.lineTo(x-p.vx*.05,p.y-p.vy*.05);c.stroke();}
 else if(p.t==="zap"){if(Math.sin(t*9+p.ph*5)<.55)return;const s=p.s;c.strokeStyle="rgba(255,248,190,"+(p.a*fade)+")";c.lineWidth=1;c.beginPath();c.moveTo(x,p.y);c.lineTo(x+s*.6,p.y+s*.5);c.lineTo(x+s*.2,p.y+s*.9);c.lineTo(x+s,p.y+s*1.5);c.stroke();}
 else if(p.t==="glint"){const a=Math.max(0,Math.sin(t*p.s+p.ph));if(a<.05)return;const L=p.r*a;c.strokeStyle="rgba(255,255,255,"+(a*fade)+")";c.lineWidth=.8;c.beginPath();c.moveTo(x-L,p.y);c.lineTo(x+L,p.y);c.moveTo(x,p.y-L);c.lineTo(x,p.y+L);c.stroke();c.fillStyle="hsla("+((p.ph*57+t*80)%360)+",90%,82%,"+(a*.6*fade)+")";c.beginPath();c.arc(x,p.y,L*.45,0,6.283);c.fill();}}
/* ==== Sfere dei Nuclei: liquido dell'elemento con effetto dedicato ==== */
const ORB_C={glaciale:["#d2f1ff","#3f98c4","#1d5f82"],ardente:["#ffc070","#e0571c","#7a1d06"],folgorante:["#fff59a","#e2be16","#7d6400"],terrestre:["#a7cf6e","#5f8a37","#4a3a1e"],radiante:["#ffffff","#efe4ff","#b9a0e8"],oscuro:["#b597f0","#5b33a6","#1c0b3a"]};
const ORB={att:{el:"",lvl:0,tgt:0,pend:null,vis:true,fx:[]},def:{el:"",lvl:0,tgt:0,pend:null,vis:true,fx:[]},raf:0,last:0,t:0};
function orbStill(){return !!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)}
function orbSet(w,el,instant){if(!instant&&el&&ORB_C[el])sfxPlay("orb",el);const o=ORB[w];if(!o)return;el=ORB_C[el]?el:"";
 if(instant||orbStill()){o.el=el;o.lvl=o.tgt=el?1:0;o.pend=null;o.fx=[];orbDraw(w);orbKick();return;}
 if(el&&o.el&&o.el!==el&&o.lvl>.02){o.pend=el;o.tgt=0;}
 else if(el){o.el=el;o.tgt=1;o.pend=null;}
 else{o.tgt=0;o.pend=null;}
 orbKick();}
function orbKick(){if(!ORB.raf){ORB.last=performance.now();ORB.raf=requestAnimationFrame(orbLoop);}}
function orbLoop(now){const dt=Math.min(.05,(now-ORB.last)/1000);ORB.last=now;ORB.t+=dt;let busy=false;
 ["att","def"].forEach(function(w){const o=ORB[w];
  if(o.lvl!==o.tgt){const sp=.75*dt;o.lvl=o.tgt>o.lvl?Math.min(o.tgt,o.lvl+sp):Math.max(o.tgt,o.lvl-sp);}
  if(o.lvl<=0&&o.tgt===0){if(o.pend){o.el=o.pend;o.pend=null;o.tgt=1;o.fx=[];}else if(o.el){o.el="";o.fx=[];orbDraw(w);}}
  if(o.el||o.lvl>0){if(o.vis&&!document.hidden&&!orbStill())orbDraw(w);busy=busy||(o.vis&&!orbStill())||o.lvl!==o.tgt;}});
 ORB.raf=busy?requestAnimationFrame(orbLoop):0;}
function orbDraw(w){const cv=document.getElementById("orb-"+w);if(!cv)return;const o=ORB[w],c=cv.getContext("2d"),S=cv.width,dpr=S/44;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,44,44);const cx=22,cy=22,r=19,t=ORB.t;
 c.save();c.beginPath();c.arc(cx,cy,r,0,6.283);c.clip();
 c.fillStyle="rgba(255,255,255,.035)";c.fillRect(0,0,44,44);
 const lv=o.lvl<.5?2*o.lvl*o.lvl:1-Math.pow(-2*o.lvl+2,2)/2;
 if(o.el&&lv>0){const col=ORB_C[o.el],top=cy+r-2*r*lv*.94;
  const surf=function(x){return top+Math.sin(x*.32+t*3.2)*(1.1+(1-lv)*1.2)+Math.sin(x*.15-t*2)*.6;};
  c.save();c.beginPath();c.moveTo(0,44);for(let x=0;x<=44;x+=2)c.lineTo(x,surf(x));c.lineTo(44,44);c.closePath();
  const g=c.createLinearGradient(0,top,0,cy+r);g.addColorStop(0,col[1]);g.addColorStop(1,col[2]);c.fillStyle=g;c.fill();c.clip();
  orbFx(c,o,t,top,cx,cy,r,col);c.restore();
  c.beginPath();for(let x=0;x<=44;x+=2){const y=surf(x);if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle=col[0];c.globalAlpha=.75;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  if(o.el==="ardente")orbFlames(c,t,surf,lv);}
 c.restore();
 const rim=o.el?ORB_C[o.el][1]:"rgba(200,168,75,.5)";
 c.beginPath();c.arc(cx,cy,r,0,6.283);c.strokeStyle="rgba(255,255,255,.28)";c.lineWidth=1.2;c.stroke();
 if(o.el&&lv>0){c.save();c.globalAlpha=.35*lv;c.shadowColor=rim;c.shadowBlur=8;c.beginPath();c.arc(cx,cy,r,0,6.283);c.strokeStyle=rim;c.lineWidth=1;c.stroke();c.restore();}
 c.beginPath();c.arc(cx,cy,r-3.5,3.55,4.6);c.strokeStyle="rgba(255,255,255,.45)";c.lineWidth=1.6;c.lineCap="round";c.stroke();
 c.beginPath();c.arc(cx-8,cy-9,1.3,0,6.283);c.fillStyle="rgba(255,255,255,.6)";c.fill();}
function orbR(a,b){return a+Math.random()*(b-a)}
function orbFx(c,o,t,top,cx,cy,r,col){const el=o.el,F=o.fx;
 if(el==="glaciale"){if(!F.length)for(let i=0;i<9;i++){const a=orbR(0,6.283);F.push({a:a,l:orbR(3,6.5),b:orbR(.5,.9),s:orbR(0,6)});}
  c.strokeStyle="rgba(240,252,255,.8)";c.lineWidth=.7;c.beginPath();
  F.forEach(function(f){const g=Math.min(1,(t*.35+f.s*.05)%1.6);const L=f.l*Math.min(1,g*1.4);const x0=cx+Math.cos(f.a)*r,y0=cy+Math.sin(f.a)*r,ia=f.a+Math.PI;const x1=x0+Math.cos(ia)*L,y1=y0+Math.sin(ia)*L;c.moveTo(x0,y0);c.lineTo(x1,y1);
   for(let k=1;k<=2;k++){const fx=x0+(x1-x0)*k/3,fy=y0+(y1-y0)*k/3,bl=L*.35;c.moveTo(fx,fy);c.lineTo(fx+Math.cos(ia-f.b)*bl,fy+Math.sin(ia-f.b)*bl);c.moveTo(fx,fy);c.lineTo(fx+Math.cos(ia+f.b)*bl,fy+Math.sin(ia+f.b)*bl);}});c.stroke();
  for(let i=0;i<5;i++){const a=t*.7+i*1.3,x=cx+Math.cos(a*1.7)*r*.55,y=cy+Math.sin(a)*r*.5+4;c.fillStyle="rgba(255,255,255,"+(.35+.35*Math.sin(t*4+i))+")";c.fillRect(x,y,1,1);}}
 else if(el==="ardente"){for(let i=0;i<4;i++){const x=cx+Math.sin(t*1.3+i*1.6)*r*.6,y=cy+r*.45-((t*9+i*11)%(r*1.4));const g=c.createRadialGradient(x,y,0,x,y,6);g.addColorStop(0,"rgba(255,220,120,.45)");g.addColorStop(1,"rgba(255,120,40,0)");c.fillStyle=g;c.fillRect(x-6,y-6,12,12);}
  for(let i=0;i<6;i++){const x=cx+Math.sin(i*2.1+t*.8)*r*.7,y=cy+r-((t*14+i*7)%(r*2));c.fillStyle="rgba(255,230,150,"+(.5+.4*Math.sin(t*12+i))+")";c.fillRect(x,y,1,1);}}
 else if(el==="oscuro"){if(!F.length)for(let i=0;i<8;i++)F.push({x:orbR(cx-r*.7,cx+r*.7),p:Math.random(),r:orbR(.8,2.2),v:orbR(.12,.3)});
  F.forEach(function(b){const y=top+((b.p+t*b.v)%1)*(cy+r-top);const x=b.x+Math.sin(t*2+b.p*9)*1.2;c.strokeStyle="rgba(215,195,255,.55)";c.lineWidth=.7;c.beginPath();c.arc(x,y,b.r,0,6.283);c.stroke();c.fillStyle="rgba(255,255,255,.35)";c.fillRect(x-b.r*.4,y-b.r*.4,.8,.8);});}
 else if(el==="terrestre"){[[1,cy+5,.34,0],[-1,cy+11,.28,2]].forEach(function(v){const off=v[0]*t*10;c.strokeStyle="rgba(200,235,140,.75)";c.lineWidth=.9;c.beginPath();for(let x=0;x<=44;x+=1.5){const y=v[1]+Math.sin((x-off)*v[2]+v[3])*2.2;if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
  c.fillStyle="rgba(175,220,110,.85)";for(let k=0;k<6;k++){let x=((k*9+off)%54+54)%54-5;const y=v[1]+Math.sin((x-off)*v[2]+v[3])*2.2;c.beginPath();c.ellipse(x,y-1.6*(k%2?1:-1),1.6,.8,.6*(k%2?1:-1),0,6.283);c.fill();}});}
 else if(el==="radiante"){if(!F.length)for(let i=0;i<10;i++)F.push({x:orbR(cx-r*.75,cx+r*.75),y:orbR(.1,1),p:orbR(0,6.283),s:orbR(1.6,3.2)});
  F.forEach(function(s){const y=top+s.y*(cy+r-top);const a=Math.max(0,Math.sin(t*s.s+s.p));if(a<.05)return;const L=2.6*a;c.strokeStyle="rgba(255,255,255,"+a+")";c.lineWidth=.7;c.beginPath();c.moveTo(s.x-L,y);c.lineTo(s.x+L,y);c.moveTo(s.x,y-L);c.lineTo(s.x,y+L);c.stroke();
   c.fillStyle="hsla("+((s.p*60+t*90)%360)+",90%,80%,"+(a*.5)+")";c.beginPath();c.arc(s.x,y,1.4,0,6.283);c.fill();});}
 else if(el==="folgorante"){if(!F.length||F[0].life<=0&&Math.random()<.08){const y0=orbR(top+2,cy+r-4),pts=[[cx-r,y0]];let x=cx-r,y=y0;while(x<cx+r){x+=orbR(3,6);y+=orbR(-3.5,3.5);pts.push([x,y]);}F[0]={pts:pts,life:1};}
  const B=F[0];if(B&&B.life>0){B.life-=.09;c.save();c.shadowColor="#fff59a";c.shadowBlur=4;c.strokeStyle="rgba(255,255,220,"+B.life+")";c.lineWidth=1;c.beginPath();B.pts.forEach(function(q,i){if(i===0)c.moveTo(q[0],q[1]);else c.lineTo(q[0],q[1]);});c.stroke();c.restore();}
  for(let i=0;i<3;i++){if(Math.random()<.12){const x=orbR(cx-r*.6,cx+r*.6),y=orbR(top+2,cy+r-3);c.strokeStyle="rgba(255,250,200,.85)";c.lineWidth=.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y+1.5);c.lineTo(x+1,y+3);c.lineTo(x+3,y+4.5);c.stroke();}}}}
function orbFlames(c,t,surf,lv){for(let i=0;i<5;i++){const x=6+i*8+Math.sin(t*2+i)*1.5,y=surf(x),h=(4+2.6*Math.sin(t*9+i*1.7)+1.4*Math.sin(t*15+i*3.1))*Math.min(1,lv*2);
 const g=c.createLinearGradient(0,y-h,0,y);g.addColorStop(0,"rgba(255,240,170,0)");g.addColorStop(.4,"rgba(255,190,80,.85)");g.addColorStop(1,"rgba(240,90,30,.9)");c.fillStyle=g;
 c.beginPath();c.moveTo(x-2.6,y+.5);c.quadraticCurveTo(x-1.6,y-h*.55,x+Math.sin(t*7+i)*1.2,y-h);c.quadraticCurveTo(x+1.6,y-h*.55,x+2.6,y+.5);c.closePath();c.fill();}}
function orbInit(){["att","def"].forEach(function(w){const cv=document.getElementById("orb-"+w);if(!cv)return;const d=Math.min(window.devicePixelRatio||1,2.5);cv.width=Math.round(44*d);cv.height=Math.round(44*d);orbDraw(w);
 if(window.IntersectionObserver){new IntersectionObserver(function(en){ORB[w].vis=en[0].isIntersecting;if(ORB[w].vis)orbKick();}).observe(cv);}});}
document.addEventListener("visibilitychange",function(){if(!document.hidden)orbKick();});

/* ==== Mappa interattiva della nave ==== */
const NV_INFO={
 ponte_esterno:{card:"Ponte Esterno"},sala_mappe:{card:"Sala Mappe"},ponte_comando:{card:"Ponte di Comando"},alloggi:{card:"Alloggi Principali",alloggi:true},
 mensa:{card:"Mensa"},stiva_modulare:{card:"Stiva Modulare"},stiva_primaria:{card:"Stiva Primaria"},sala_macchine:{card:"Sala Macchine"},
 zona_segreta:{e:"🗝️",t:"Zona Segreta — Reliquie",s:"3° Piano Prua · dietro i muri della Sala Macchine",b:"Una stanza nascosta dietro uno dei muri rinforzati della Sala Macchine, dove vengono custoditi <strong>reliquie e artefatti</strong>. Vi si accede da una scala a pioli."},
 scale:{e:"🪜",t:"Scale principali",s:"Collegamento tra i ponti",b:"La scalinata che collega i ponti della nave: dal <strong>Ponte di Comando</strong> scende alla Sala Mappe, poi alla Stiva Modulare e fino al fondo della nave."},
 scala_pioli:{e:"🌀",t:"Scala a chiocciola",s:"Parete di poppa · servizio",b:"Passaggio di servizio lungo la parete di poppa, dagli <strong>Alloggi</strong> fino al fondo della nave."},
 ascensore:{e:"🛗",t:"Ascensore centrale",s:"Stiva Modulare ↔ Stiva Primaria",b:"Collega la <strong>Stiva Modulare</strong> e la <strong>Stiva Primaria</strong>, per spostare carichi e attrezzature tra i due livelli."}};
function nvPick(k){const info=NV_INFO[k],p=document.getElementById("nv-pop");if(!info||!p)return;if(info.alloggi){document.querySelectorAll("#nave .nv-a").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-k")===k)});alOpen();return;}
 document.querySelectorAll("#nave .nv-a").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-k")===k)});
 let html="";
 if(info.card){const c=[].slice.call(document.querySelectorAll("#nv-cards > .card")).find(function(x){const t=x.querySelector(".ct");return t&&t.textContent.trim()===info.card});if(c)html=c.innerHTML;}
 if(!html)html='<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem"><div style="font-size:1.6rem">'+info.e+'</div><div><div class="ct">'+info.t+'</div><div class="cs">'+info.s+'</div></div></div><div class="cb"><p>'+info.b+'</p></div>';
 if(info.alloggi)html+='<button type="button" class="nv-go" onclick="alOpen()">🚪 Entra negli alloggi</button>';
 sfxPlay("paper");p.innerHTML='<div class="nv-popin">'+html+'</div>';document.getElementById("nv-ov").classList.add("open");}
function nvClose(){const o=document.getElementById("nv-ov");if(o)o.classList.remove("open");document.querySelectorAll("#nave .nv-a.on").forEach(function(a){a.classList.remove("on")});}
function nvToggleAll(force){const g=document.getElementById("nv-cards"),b=document.getElementById("nv-tog");if(!g||!b)return;const on=typeof force==="boolean"?force:!g.classList.contains("show");
 g.classList.toggle("show",on);b.setAttribute("aria-expanded",String(on));b.textContent=on?"📜 Nascondi le descrizioni":"📜 Mostra tutte le descrizioni";try{localStorage.setItem("tcj_nv_all",on?"1":"0")}catch(e){}}
document.addEventListener("keydown",function(e){if(e.key==="Escape"){const o=document.getElementById("nv-ov");if(o&&o.classList.contains("open"))nvClose();}});
function nvInit(){document.querySelectorAll("#nave .nv-a").forEach(function(a){a.setAttribute("tabindex","0");a.setAttribute("role","button");
 a.addEventListener("click",function(){nvPick(a.getAttribute("data-k"))});a.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();nvPick(a.getAttribute("data-k"))}});});}

/* --- Alloggi: 6 cabine, 3 per lato --- */
/* Disposizione: [babordo, tribordo] per ogni riga; null = alloggio libero */
const AL_SLOTS=[["athena","panlan"],["asonnes",null],[null,null]];
let alCur=null,alAsk=null,alT=null;
function alKey(k){return "tcj-al-"+k}
function alLoad(k){try{const o=JSON.parse(localStorage.getItem(alKey(k))||"null");return o&&typeof o==="object"?o:null}catch(e){return null}}
function alSave(){if(!alCur)return;const box=document.getElementById("al-body");if(!box)return;const o={t:(document.getElementById("al-name")||{}).value||"",notes:[].slice.call(box.querySelectorAll(".pa-note")).map(function(n){return{t:n.querySelector(".pa-note-t").value,b:n.querySelector(".pa-note-b").value}})};
 try{localStorage.setItem(alKey(alCur),JSON.stringify(o))}catch(e){}const st=document.getElementById("al-status");if(st){st.textContent="✓ Salvato";clearTimeout(st._t);st._t=setTimeout(function(){st.textContent="Salvataggio automatico"},1400);}}
function alAuto(){clearTimeout(alT);alT=setTimeout(function(){alT=null;alSave()},600);}
function alOpen(){sfxPlay("paper");alCur=null;alAsk=null;alRender();document.getElementById("al-ov").classList.add("open");}
function alClose(){clearTimeout(alT);if(alCur)alSave();alCur=null;document.getElementById("al-ov").classList.remove("open");}
function alRender(){const m=document.getElementById("al-body");if(!m)return;
 if(alCur){const c=SC_CHARS.find(function(x){return x.k===alCur});const o=alLoad(alCur)||{t:"Alloggio di "+c.n,notes:[{t:"Arredamento",b:""},{t:"Oggetti custoditi",b:""}]};
  m.innerHTML='<button type="button" class="al-back" onclick="alCur=null;alRender()">← Tutti gli alloggi</button><input class="al-name" id="al-name" aria-label="Nome dell\'alloggio"><div id="al-notes"></div><button class="sc-coin-add" type="button" onclick="alNoteAdd()">+ Aggiungi sezione</button><div class="al-status" id="al-status">Salvataggio automatico</div>';
  document.getElementById("al-name").value=o.t||("Alloggio di "+c.n);
  const nb=document.getElementById("al-notes");(o.notes||[]).forEach(function(n){nb.appendChild(alNoteEl(n.t,n.b))});return;}
 let h='<div class="al-sides"><div class="al-side">Babordo</div><div class="al-side">Tribordo</div></div><div class="al-grid">';
 AL_SLOTS.forEach(function(row){row.forEach(function(k){
  if(!k){h+='<button type="button" class="al-door" disabled><span class="al-e">🚪</span><span class="al-n">Alloggio libero</span><span class="al-s">Non ancora assegnato</span></button>';return;}
  const c=SC_CHARS.find(function(x){return x.k===k}),open=paIsOpen(k),o=alLoad(k);
  h+='<button type="button" class="al-door" onclick="alPick(\''+k+'\')"><span class="al-e">'+c.e+'</span><span class="al-n">'+((o&&o.t)||("Alloggio di "+c.n))+'</span><span class="al-s">'+(open?"Entra":"🔒 Serve la password di "+c.n)+'</span></button>';});});
 h+='</div>';
 if(alAsk){const c=SC_CHARS.find(function(x){return x.k===alAsk});h+='<div class="al-code"><input type="password" id="al-code-in" placeholder="Password di '+c.n+'" autocomplete="off" onkeydown="if(event.key===\'Enter\')alTry()"><button type="button" onclick="alTry()">Apri</button></div><div class="al-err" id="al-err">Password errata. Riprova.</div>';}
 m.innerHTML=h;if(alAsk){const i=document.getElementById("al-code-in");if(i)setTimeout(function(){i.focus()},0);}}
function alPick(k){if(paIsOpen(k)){alCur=k;alAsk=null;alRender();return;}alAsk=k;alRender();}
function alTry(){const k=alAsk,i=document.getElementById("al-code-in");if(!k||!i)return;const v=i.value.trim().toLowerCase();
 if(v&&v===String(PA_CODES[k]||"").toLowerCase()){paSetOpen(k,true);alAsk=null;alCur=k;alRender();try{slGo(k);slRender();pgPlay(k);}catch(e){}return;}
 const er=document.getElementById("al-err");if(er)er.style.display="block";i.select();}
function alNoteEl(t,b){const w=paNoteEl(t,b);w.querySelectorAll(".pa-note-ctl button").forEach(function(btn){const tl=btn.getAttribute("title")||"";btn.removeAttribute("onclick");
 btn.addEventListener("click",function(){if(tl.indexOf("su")>=0){if(w.previousElementSibling)w.parentNode.insertBefore(w,w.previousElementSibling);alAuto();}
  else if(tl.indexOf("giù")>=0){if(w.nextElementSibling)w.parentNode.insertBefore(w.nextElementSibling,w);alAuto();}
  else{if(!btn.classList.contains("arm")){btn.classList.add("arm");btn.textContent="Elimina?";clearTimeout(btn._t);btn._t=setTimeout(function(){btn.classList.remove("arm");btn.textContent="✕"},3000);return;}w.remove();alAuto();}});});return w;}
function alNoteAdd(){const nb=document.getElementById("al-notes");if(!nb)return;const el=alNoteEl("Nuova sezione","");nb.appendChild(el);const t=el.querySelector(".pa-note-t");t.focus();t.select();alAuto();}
document.addEventListener("input",function(e){if(e.target&&e.target.closest&&e.target.closest("#al-body")&&alCur)alAuto();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){const o=document.getElementById("al-ov");if(o&&o.classList.contains("open"))alClose();}});
/* ==== Tema globale, tendina Slayer, effetti laterali ==== */
let paThemeOn=(function(){try{const k=localStorage.getItem("tcj-pa-theme");return !!k&&k===localStorage.getItem("tcj-sc-cur")&&paOpenList().indexOf(k)>=0}catch(e){return false}})();
function paActive(){return paThemeOn&&paIsOpen(scCur)?scCur:""}
function paNeutral(){paThemeOn=false;paTheme();slRender();}
const PA_DEF={athena:"glaciale",panlan:"oscuro",asonnes:"terrestre"};
const PA_ELS=[["glaciale","❄ Glaciale"],["ardente","🔥 Ardente"],["folgorante","⚡ Folgorante"],["terrestre","🌍 Terrestre"],["radiante","✨ Radiante"],["oscuro","🌑 Oscuro"]];
function paPrefRaw(k){try{const o=JSON.parse(localStorage.getItem("tcj_bg_"+k)||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}}
function paPref(k){const o=paPrefRaw(k),d=PA_DEF[k]||"glaciale",ok=function(v){return PA_ELS.some(function(e){return e[0]===v})};return {c:ok(o.c)?o.c:d,fx:ok(o.fx)?o.fx:d,custom:ok(o.c)||ok(o.fx)};}
function paSetPref(key,v){const k=paActive();if(!k)return;const o=paPrefRaw(k);o[key]=v;try{localStorage.setItem("tcj_bg_"+k,JSON.stringify(o))}catch(e){}paTheme();slRender();}
function paResetPref(){const k=paActive();if(!k)return;try{localStorage.removeItem("tcj_bg_"+k)}catch(e){}paTheme();slRender();}
function paFxEl(){if(typeof mThemeActive==="function"&&mThemeActive())return mPref().fx;const k=paActive();return k?paPref(k).fx:"";}
/* --- effetto laterale esclusivo del Master: "Sigillo Cremisi" --- */
const MFX_RUNES=(function(){const out=[];let s=7;const r=function(){s=(s*9301+49297)%233280;return s/233280};
 for(let i=0;i<24;i++){const L=[[0,-1,0,1]];const n=1+Math.floor(r()*3);
  for(let j=0;j<n;j++){const y0=-1+r()*1.4,side=r()<.5?-1:1,len=.4+r()*.5;const kind=r();
   if(kind<.45)L.push([0,y0,side*.55,y0+len*.6]);else if(kind<.75)L.push([0,y0,side*.55,y0-len*.5]);else L.push([side*.55,y0,side*.55,y0+len]);}
  out.push(L);}return out;})();
function mfxRune(c,i,x,y,sz,rot){const R=MFX_RUNES[i%MFX_RUNES.length];c.save();c.translate(x,y);if(rot)c.rotate(rot);c.beginPath();
 R.forEach(function(l){c.moveTo(l[0]*sz,l[1]*sz);c.lineTo(l[2]*sz,l[3]*sz)});c.stroke();c.restore();}
function mfxDeco(c,bw,H){const mob=FX.mob;fxEdge(c,bw,H,"60,0,6",mob?.55:.45);fxEdge(c,bw,H,"200,30,30",mob?.16:.1);}
function mfxParts(bw,H){const mob=FX.mob,a=[];
 for(let i=0;i<(mob?7:26);i++)a.push({t:"cember",x:Math.random()*bw*.6,y:Math.random()*H,r:fxRnd(.8,mob?1.6:2.4),vy:-fxRnd(14,34),vx:fxRnd(-2,mob?3:10),a:fxRnd(.5,1),ph:fxRnd(0,6.28),fl:fxRnd(5,12)});
 if(!mob)for(let i=0;i<9;i++)a.push({t:"rune",x0:fxRnd(bw*.15,bw*.75),y:Math.random()*H,vy:-fxRnd(10,22),amp:fxRnd(2,7),ph:fxRnd(0,6.28),i:Math.floor(Math.random()*24),sz:fxRnd(4,7),a:fxRnd(.45,.85),rs:fxRnd(-.6,.6)});
 return a;}
function mfxPre(c,S,t,bw,H){const mob=FX.mob;
 /* respiro cremisi del bordo */
 const pulse=.5+.5*Math.sin(t*1.6);const g=c.createLinearGradient(0,0,bw,0);g.addColorStop(0,"rgba(255,40,30,"+(.16+.12*pulse)+")");g.addColorStop(1,"rgba(255,40,30,0)");c.fillStyle=g;c.fillRect(0,0,bw,H);
 /* frattura d'energia lungo il bordo */
 S.rift=S.rift||[];const step=14,n=Math.ceil(H/step)+1;if(S.rift.length!==n){S.rift=[];for(let i=0;i<n;i++)S.rift.push(Math.random()*6.28);}
 const rx=mob?bw*.25:bw*.1;c.save();c.lineJoin="round";
 [[mob?5:9,"rgba(255,30,30,.12)"],[mob?2.5:4,"rgba(255,70,50,.35)"],[1.1,"rgba(255,220,200,"+(.55+.35*pulse)+")"]].forEach(function(st){c.strokeStyle=st[1];c.lineWidth=st[0];c.beginPath();
  for(let i=0;i<n;i++){const y=i*step,x=rx+Math.sin(S.rift[i]+t*2.2)*(mob?1.5:3.5)+Math.sin(i*.7+t*.8)*(mob?1:2.5);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();});c.restore();
 if(mob)return;
 /* cerchi arcani rotanti, per metà oltre il bordo */
 [[.27,1],[.73,-1]].forEach(function(cfg,ci){const cx=-bw*.14,cy=H*cfg[0],R=bw*.78,dir=cfg[1];c.save();c.translate(cx,cy);
  c.shadowColor="rgba(255,40,30,.9)";c.shadowBlur=8;c.strokeStyle="rgba(255,85,70,"+(.45+.2*pulse)+")";
  c.lineWidth=1.4;c.beginPath();c.arc(0,0,R,0,6.283);c.stroke();c.lineWidth=.8;c.beginPath();c.arc(0,0,R*.86,0,6.283);c.stroke();c.beginPath();c.arc(0,0,R*.52,0,6.283);c.stroke();
  /* tacche */
  c.save();c.rotate(t*.12*dir);c.beginPath();for(let k=0;k<48;k++){const a=k/48*6.283,l=k%4===0?R*.07:R*.035;c.moveTo(Math.cos(a)*R*.86,Math.sin(a)*R*.86);c.lineTo(Math.cos(a)*(R*.86-l),Math.sin(a)*(R*.86-l));}c.stroke();c.restore();
  /* rune lungo l'anello */
  c.save();c.rotate(-t*.18*dir);c.lineWidth=1.1;c.strokeStyle="rgba(255,150,130,"+(.6+.25*pulse)+")";for(let k=0;k<12;k++){const a=k/12*6.283,rr=R*.69;mfxRune(c,k+ci*7,Math.cos(a)*rr,Math.sin(a)*rr,R*.075,a+1.5708);}c.restore();
  /* stella a sette punte interna */
  c.save();c.rotate(t*.25*dir);c.lineWidth=.9;c.strokeStyle="rgba(255,90,70,.5)";c.beginPath();for(let k=0;k<=7;k++){const a=(k*3%7)/7*6.283;const x=Math.cos(a)*R*.5,y=Math.sin(a)*R*.5;if(k===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();c.restore();
  c.restore();});}
function mfxPost(c,S,t,dt,bw,H){if(FX.mob)return;S.mb=S.mb||[];
 if(Math.random()<dt*.9){const y0=Math.random()*H,pts=[[bw*.1,y0]];let x=bw*.1,y=y0;const L=bw*fxRnd(.5,.95);while(x<L){x+=fxRnd(5,11);y+=fxRnd(-7,7);pts.push([x,y]);}S.mb.push({pts:pts,life:1});}
 S.mb=S.mb.filter(function(b){b.life-=dt*4.5;return b.life>0});
 S.mb.forEach(function(b){const a=b.life*(.6+.4*Math.random());[[5,"rgba(255,30,30,"+(a*.22)+")"],[1.4,"rgba(255,215,200,"+a+")"]].forEach(function(st){c.strokeStyle=st[1];c.lineWidth=st[0];c.beginPath();b.pts.forEach(function(q,i){if(i===0)c.moveTo(q[0],q[1]);else c.lineTo(q[0],q[1])});c.stroke();});});}
function mfxDrawP(c,p,x,fade,t){
 if(p.t==="cember"){const fl=.6+.4*Math.sin(t*p.fl+p.ph);const g=c.createRadialGradient(x,p.y,0,x,p.y,p.r*4);g.addColorStop(0,"rgba(255,60,40,"+(p.a*fl*fade*.55)+")");g.addColorStop(1,"rgba(160,0,0,0)");c.fillStyle=g;c.beginPath();c.arc(x,p.y,p.r*4,0,6.283);c.fill();c.fillStyle="rgba(255,200,180,"+(p.a*fl*fade)+")";c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();return true;}
 if(p.t==="rune"){const life=(p.y/FX.H);c.save();c.strokeStyle="rgba(255,120,100,"+(p.a*fade*Math.min(1,life*2))+")";c.shadowColor="rgba(255,30,30,.9)";c.shadowBlur=6;c.lineWidth=1.2;mfxRune(c,p.i,x,p.y,p.sz,t*p.rs);c.restore();return true;}
 return false;}

/* --- sfondo e tema del Master --- */
const M_ELS=[["master","🩸 Cremisi del Master"]].concat(typeof PA_ELS!=="undefined"?PA_ELS:[]);
function mPref(){let o={};try{o=JSON.parse(localStorage.getItem("tcj_bg_master")||"{}")||{}}catch(e){}const ok=function(v){return M_ELS.some(function(e){return e[0]===v})};
 return {on:o.on!==false,c:ok(o.c)?o.c:"master",fx:ok(o.fx)?o.fx:"master",custom:ok(o.c)&&o.c!=="master"||ok(o.fx)&&o.fx!=="master"};}
function mSetPref(k,v){if(k==="on"&&v)sfxPlay("gong");let o={};try{o=JSON.parse(localStorage.getItem("tcj_bg_master")||"{}")||{}}catch(e){}o[k]=v;try{localStorage.setItem("tcj_bg_master",JSON.stringify(o))}catch(e){}paTheme();slRender();}
function mResetPref(){let o={};try{o=JSON.parse(localStorage.getItem("tcj_bg_master")||"{}")||{}}catch(e){}delete o.c;delete o.fx;try{localStorage.setItem("tcj_bg_master",JSON.stringify(o))}catch(e){}paTheme();slRender();}
function mThemeActive(){return paMaster()&&mPref().on;}
/* ==== Suoni: interruttore ==== */
function sfxOn(){try{return localStorage.getItem("tcj_sfx")!=="0"}catch(e){return true}}
function sfxToggle(){try{localStorage.setItem("tcj_sfx",sfxOn()?"0":"1")}catch(e){}slRender();if(sfxOn())sfxPlay("on");}
function sfxPlay(n,a){try{if(window.__sfx&&window.__sfx[n])window.__sfx[n](a)}catch(e){}}

/* ==== Timeline orizzontale ==== */
const HTL_COL=["#c9a6ff","#e8c870","#e05a5a","#8fbf6a","#7ec8e3","#e8894a","#b89ce6"];
let HTL=null;
function htlShort(html){const d=document.createElement("div");d.innerHTML=html;let t=(d.textContent||"").trim();const i=t.search(/[.:—]\s/);if(i>12&&i<70)t=t.slice(0,i);if(t.length>64)t=t.slice(0,61).replace(/\s+\S*$/,"")+"…";return t;}
function htlBuild(){const src=document.querySelector("#timeline .timeline");if(!src||document.getElementById("htl"))return;
 const eras=[].slice.call(src.querySelectorAll(".tle")).map(function(e){const t=e.querySelector(".tlet");return {t:t?t.innerHTML:"",ev:[].slice.call(e.querySelectorAll(".tlev")).map(function(v){return {d:(v.querySelector(".tld")||{}).innerHTML||"",x:(v.querySelector(".tlt")||{}).innerHTML||""}})}});
 const mob=window.innerWidth<640,STEP=mob?190:240,GAP=mob?50:80,PAD=mob?110:150;const evs=[];let x=PAD;const bands=[];
 eras.forEach(function(er,ei){const x0=x;er.ev.forEach(function(ev,j){evs.push({x:x,era:ei,d:ev.d,t:ev.x,s:htlShort(ev.x)});x+=STEP;});const x1=x-STEP;bands.push({x0:x0,x1:x1,t:er.t,c:HTL_COL[ei%HTL_COL.length]});x+=GAP;});
 const W=x-STEP-GAP+PAD;
 let h='<div class="htl" id="htl"><button type="button" class="htl-ar l" aria-label="Indietro" onclick="htlBy(-1)">‹</button><div class="htl-sc" id="htl-sc"><div class="htl-tr" style="width:'+W+'px">';
 bands.forEach(function(b,i){const w=Math.max(150,b.x1-b.x0+150);h+='<div class="htl-era" style="left:'+(b.x0+(b.x1-b.x0)/2-w/2)+'px;width:'+w+'px;--ec:'+b.c+';transition-delay:'+(.2+i*.25)+'s"><span>'+b.t+'</span></div>';});
 h+='<div class="htl-line"></div>';
 bands.forEach(function(b,i){h+='<div class="htl-seg" style="left:'+(b.x0-40)+'px;width:'+(b.x1-b.x0+80)+'px;--ec:'+b.c+';transition-delay:'+(.3+i*.25)+'s"></div>';});
 evs.forEach(function(e,i){const up=i%2===0,c=bands[e.era].c;h+='<button type="button" class="htl-n '+(up?"up":"dn")+'" data-i="'+i+'" style="left:'+e.x+'px;--ec:'+c+';transition-delay:'+(.5+i*.14)+'s" onclick="htlPick('+i+',true)"><span class="htl-dot"></span><span class="htl-lb"><b>'+e.d+'</b><i>'+e.s+'</i></span></button>';});
 h+='</div></div><button type="button" class="htl-ar r" aria-label="Avanti" onclick="htlBy(1)">›</button></div><div class="htl-card" id="htl-card" aria-live="polite"></div><div class="htl-hint">Trascina, usa le frecce o tocca un evento per leggerlo</div>';
 src.insertAdjacentHTML("afterend",h);src.style.display="none";HTL={evs:evs,bands:bands,cur:-1};
 const sc=document.getElementById("htl-sc");let dr=null;
 sc.addEventListener("pointerdown",function(e){if(e.pointerType==="touch")return;dr={x:e.clientX,s:sc.scrollLeft,m:false};});
 window.addEventListener("pointermove",function(e){if(!dr)return;const dx=e.clientX-dr.x;if(Math.abs(dx)>4)dr.m=true;if(dr.m){sc.scrollLeft=dr.s-dx;sc.classList.add("drag");}});
 window.addEventListener("pointerup",function(){if(dr&&dr.m){sc._noclick=true;setTimeout(function(){sc._noclick=false},50);}dr=null;sc.classList.remove("drag");});
 sc.addEventListener("click",function(e){if(sc._noclick){e.stopPropagation();e.preventDefault();}},true);
 sc.addEventListener("wheel",function(e){if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;const max=sc.scrollWidth-sc.clientWidth;if((e.deltaY>0&&sc.scrollLeft<max-1)||(e.deltaY<0&&sc.scrollLeft>0)){e.preventDefault();sc.scrollLeft+=e.deltaY;}},{passive:false});
 sc.addEventListener("scroll",htlArrows,{passive:true});
 document.getElementById("htl").addEventListener("keydown",function(e){if(!HTL)return;if(e.key==="ArrowRight"){e.preventDefault();htlPick(Math.min(HTL.evs.length-1,HTL.cur+1),true);}if(e.key==="ArrowLeft"){e.preventDefault();htlPick(Math.max(0,HTL.cur-1),true);}});
 const go=function(){document.getElementById("htl").classList.add("in");};
 if(window.IntersectionObserver){const io=new IntersectionObserver(function(en){if(en[0].isIntersecting){go();io.disconnect();}},{threshold:.25});io.observe(document.getElementById("htl"));}else go();
 htlPick(0,false);htlArrows();}
function htlArrows(){const sc=document.getElementById("htl-sc");if(!sc)return;const max=sc.scrollWidth-sc.clientWidth;document.querySelector(".htl-ar.l").classList.toggle("off",sc.scrollLeft<=2);document.querySelector(".htl-ar.r").classList.toggle("off",sc.scrollLeft>=max-2);}
function htlBy(d){const sc=document.getElementById("htl-sc");if(sc)sc.scrollBy({left:d*Math.max(240,sc.clientWidth*.7),behavior:"smooth"});}
function htlPick(i,user){if(!HTL||!HTL.evs[i])return;HTL.cur=i;const e=HTL.evs[i],b=HTL.bands[e.era];
 document.querySelectorAll("#htl .htl-n").forEach(function(n){n.classList.toggle("on",+n.getAttribute("data-i")===i)});
 const c=document.getElementById("htl-card");c.style.setProperty("--ec",b.c);
 c.innerHTML='<div class="htl-ce">'+b.t+'</div><div class="htl-cd">'+e.d+'</div><div class="htl-ct">'+e.t+'</div><div class="htl-cn"><button type="button" onclick="htlPick('+(i-1)+',true)"'+(i===0?' disabled':'')+'>‹ Precedente</button><span>'+(i+1)+' / '+HTL.evs.length+'</span><button type="button" onclick="htlPick('+(i+1)+',true)"'+(i===HTL.evs.length-1?' disabled':'')+'>Successivo ›</button></div>';
 c.classList.remove("pop");void c.offsetWidth;c.classList.add("pop");
 if(user){sfxPlay("paper");const sc=document.getElementById("htl-sc");const n=document.querySelector('#htl .htl-n[data-i="'+i+'"]');if(sc&&n){const tx=n.offsetLeft-sc.clientWidth/2;sc.scrollTo({left:tx,behavior:"smooth"});}}}

/* ==== Mappa viva: nuvole, rotta della nave ==== */
const NV_ROTTA=null; /* rotta visibile a tutti: es. "glaciale". Il Master può impostarne una dal menu (solo nel proprio browser) */
const WM_CAP={ardente:[358,345],radiante:[1142,273],folgorante:[1761,579],ramsgate:[759,699],terrestre:[397,904],oscuro:[832,1177],glaciale:[1754,1289]};
const WM_NAME={ardente:"Continente Ardente",radiante:"Continente Radiante",folgorante:"Continente Folgorante",terrestre:"Continente Terrestre",oscuro:"Continente Oscuro",glaciale:"Continente Glaciale"};
function wmRouteDest(){let v=null;try{v=localStorage.getItem("tcj_rotta")}catch(e){}if(v==="none")return null;return (v&&WM_CAP[v])?v:(NV_ROTTA&&WM_CAP[NV_ROTTA]?NV_ROTTA:null);}
function wmSetRoute(v){if(v)sfxPlay("wave");try{if(v)localStorage.setItem("tcj_rotta",v);else localStorage.removeItem("tcj_rotta")}catch(e){}wmRoute();slRender();}
function wmRoute(hov){const g=document.getElementById("wm-route"),lb=document.getElementById("wm-route-lbl");if(!g)return;const d=hov||wmRouteDest();
 if(!d){g.innerHTML="";if(lb)lb.innerHTML="";return;}
 const a=WM_CAP.ramsgate,b=WM_CAP[d],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),k=.22;const cx=mx-dy/L*L*k,cy=my+dx/L*L*k;
 const P="M"+a[0]+","+a[1]+" Q"+cx.toFixed(0)+","+cy.toFixed(0)+" "+b[0]+","+b[1];
 g.innerHTML='<path d="'+P+'" class="wm-rt-glow"/><path id="wm-rt-path" d="'+P+'" class="wm-rt"/><circle cx="'+b[0]+'" cy="'+b[1]+'" r="34" class="wm-rt-dest"><animate attributeName="r" values="30;46;30" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.2;.9" dur="2.4s" repeatCount="indefinite"/></circle>'+
  '<g class="wm-ship"><g transform="scale('+(b[0]<a[0]?-1.6:1.6)+',1.6)"><path d="M-14,2 L14,2 L9,9 L-9,9 Z" fill="#c8a84b" stroke="#2a1c08" stroke-width="1"/><path d="M-1,1 L-1,-16 L11,-1 Z" fill="#f4ead2" stroke="#2a1c08" stroke-width=".8"/><path d="M-3,1 L-3,-12 L-12,0 Z" fill="#e8dcc0" stroke="#2a1c08" stroke-width=".8"/></g><animateMotion id="wm-am" begin="indefinite" dur="'+(hov?"4.5s":"16s")+'" repeatCount="'+(hov?"1":"indefinite")+'" fill="freeze" rotate="0" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .35 1"><mpath href="#wm-rt-path"/></animateMotion></g>';
 g.classList.toggle('hov',!!hov);g.classList.remove('draw');void g.getBoundingClientRect();g.classList.add('draw');try{document.getElementById('wm-am').beginElement()}catch(e){}
 if(lb)lb.innerHTML=hov?'⛵ Da <b>Ramsgate</b> al <b>'+WM_NAME[d]+'</b>':'⛵ La nave è in rotta da <b>Ramsgate</b> verso il <b>'+WM_NAME[d]+'</b>';}
function wmHoverInit(){Object.keys(WM_NAME).forEach(function(k){const el=document.getElementById('isl-'+k);if(!el)return;let t=null;
 el.addEventListener('pointerenter',function(e){if(e.pointerType==='touch')return;clearTimeout(t);if(WM_HOV!==k){WM_HOV=k;wmRoute(k);}});
 el.addEventListener('pointerleave',function(e){if(e.pointerType==='touch')return;t=setTimeout(function(){if(WM_HOV===k){WM_HOV=null;wmRoute();}},250);});
 el.addEventListener('click',function(){if(WM_HOV!==k){WM_HOV=k;wmRoute(k);}});});}
let WM_HOV=null;

/* ==== Simbolo dei Mael ==== */
const ML_EL={gabrael:"radiante",symael:"glaciale",mykael:"folgorante",estarossa:"terrestre",raphael:"ardente",azrael:"oscuro",maelstrom:"radiante"};
let mlCur=null;
function mlShow(k,user){const w=document.getElementById("ml-wrap");if(!w)return;mlCur=k;
 w.querySelectorAll(".ml-gem").forEach(function(g){g.classList.toggle("on",g.getAttribute("data-k")===k)});
 w.querySelectorAll(".ml-cards > .card").forEach(function(c){c.classList.toggle("on",c.getAttribute("data-mk")===k)});
 const h=w.querySelector(".ml-hint");if(h)h.style.display="none";
 if(user)sfxPlay("orb",ML_EL[k]);}
function mlAll(force){const w=document.getElementById("ml-wrap"),b=document.getElementById("ml-tog");if(!w||!b)return;const on=typeof force==="boolean"?force:!w.classList.contains("all");
 w.classList.toggle("all",on);b.textContent=on?"💎 Torna al simbolo":"💎 Mostra tutti i Mael";try{localStorage.setItem("tcj_ml_all",on?"1":"0")}catch(e){}}
function mlInit(){const w=document.getElementById("ml-wrap");if(!w)return;
 w.querySelectorAll(".ml-gem").forEach(function(g){const k=g.getAttribute("data-k");
  g.addEventListener("pointerenter",function(e){if(e.pointerType!=="touch")mlShow(k,false)});g.addEventListener("focus",function(){mlShow(k,false)});
  g.addEventListener("click",function(){mlShow(k,true)});});
 try{mlAll(localStorage.getItem("tcj_ml_all")==="1")}catch(e){}
 setInterval(function(){if(document.hidden||!w.getBoundingClientRect().height)return;const gs=[].slice.call(w.querySelectorAll(".ml-gem:not(.on)"));if(!gs.length)return;const g=gs[Math.floor(Math.random()*gs.length)];g.classList.remove("tw");void g.offsetWidth;g.classList.add("tw");},2200);}

/* ==== Calendario vivo: segue la Triade selezionata ==== */
const TR_EL={1:"radiante",2:"folgorante",3:"ardente",4:"terrestre",5:"glaciale",6:"oscuro",7:"radiante",8:"folgorante",9:"ardente",10:"terrestre",11:"glaciale",12:"oscuro"};
const TR_COL={radiante:"#e6ccff",folgorante:"#ffe04a",ardente:"#ff7a3a",terrestre:"#7fd06a",glaciale:"#9ee0ff",oscuro:"#a77cff"};
let CAL_SEL=(function(){try{const v=parseInt(localStorage.getItem("tcj_cal_sel"),10);return v>=1&&v<=12?v:1}catch(e){return 1}})(),CAL_RAF=0;
function calPhasePath(cx,cy,R,p){p=((p%1)+1)%1;const rx=Math.abs(Math.cos(2*Math.PI*p))*R;
 if(p<.5){const sw=p<.25?0:1;return "M"+cx+","+(cy-R)+" A"+R+","+R+" 0 0 1 "+cx+","+(cy+R)+" A"+rx.toFixed(2)+","+R+" 0 0 "+sw+" "+cx+","+(cy-R)+"Z";}
 const sw=p>.75?1:0;return "M"+cx+","+(cy-R)+" A"+R+","+R+" 0 0 0 "+cx+","+(cy+R)+" A"+rx.toFixed(2)+","+R+" 0 0 "+sw+" "+cx+","+(cy-R)+"Z";}
function calMoon(id,white,p,big){const R=46,c=60;const lit=white?"url(#cm-lyra)":"url(#cm-korn)";
 const cr=[[44,46,7],[70,40,5],[62,70,9],[40,74,4],[78,62,4],[52,30,3]].map(function(q){return '<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+q[2]+'" fill="'+(white?"rgba(150,140,180,.28)":"rgba(170,130,255,.16)")+'"/>'}).join("");
 return '<svg viewBox="0 0 120 120" class="cm-svg'+(big?" big":"")+'" aria-hidden="true"><defs>'+
  '<radialGradient id="cm-lyra" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e9e2f7"/><stop offset="1" stop-color="#b9add6"/></radialGradient>'+
  '<radialGradient id="cm-korn" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#3a2a5c"/><stop offset=".7" stop-color="#1a1030"/><stop offset="1" stop-color="#0a0614"/></radialGradient>'+
  '<clipPath id="'+id+'-cp"><path id="'+id+'-ph" d="'+calPhasePath(c,c,R,p)+'"/></clipPath></defs>'+
  '<circle cx="'+c+'" cy="'+c+'" r="'+R+'" fill="'+(white?"#1c1a26":"#06040b")+'" stroke="'+(white?"rgba(230,220,255,.18)":"rgba(160,110,255,.45)")+'" stroke-width="1.2"/>'+
  '<g clip-path="url(#'+id+'-cp)"><circle cx="'+c+'" cy="'+c+'" r="'+R+'" fill="'+lit+'"/><g class="cm-rot">'+cr+'</g></g>'+
  (white?'':'<circle cx="'+c+'" cy="'+c+'" r="'+(R+1.5)+'" fill="none" stroke="#a77cff" stroke-width="2" opacity=".55" class="cm-rim"/>')+'</svg>';}
function calSelect(n,user){if(!(n>=1&&n<=12))return;const prev=CAL_SEL;CAL_SEL=n;try{localStorage.setItem("tcj_cal_sel",String(n))}catch(e){}
 calRender(user&&prev!==n,prev);if(user){const el=TR_EL[n];sfxPlay("orb",el);}}
function calRender(anim,prev){const box=document.getElementById("cal-sky");if(!box)return;const n=CAL_SEL,tr=TR.find(function(x){return x.n===n});if(!tr)return;
 const lyra=n<=6,el=TR_EL[n],col=TR_COL[el],swap=anim&&prev&&((prev<=6)!==lyra);
 const pos=lyra?n:n-6; /* posizione nel ciclo della luna: 1..6 */
 const target=.12+(pos-1)/5*.38; /* da falce crescente (Triade 1/7) a luna piena (6/12) */
 box.style.setProperty("--tc",col);
 const big=lyra?calMoon("cmB",true,anim?0:target,true):calMoon("cmB",false,anim?0:target,true),small=lyra?calMoon("cmS",false,.5,false):calMoon("cmS",true,.5,false);
 box.innerHTML='<div class="cal-stars"></div><div class="cal-moons'+(swap?" swap":"")+'"><div class="cal-mb">'+big+'</div><div class="cal-ms">'+small+'</div></div>'+
  '<div class="cal-info'+(anim?" in":"")+'"><div class="cal-k">'+(lyra?"🌕 Domina Lyra — Luna Bianca":"🌑 Domina Kornos — Luna Nera")+' · Triade '+n+' di 12</div>'+
  '<div class="cal-d"><b>'+tr.nm+'</b></div><div class="cal-t">'+tr.t+'</div>'+
  '<div class="cal-dots">'+[1,2,3,4,5,6].map(function(i){const k=lyra?i:i+6;return '<button type="button" class="'+(k===n?"on":"")+'" style="--dc:'+TR_COL[TR_EL[k]]+'" onclick="calSelect('+k+',true)" aria-label="Triade '+k+'"></button>'}).join("")+'</div>'+
  '<div class="cal-nav"><button type="button" onclick="calSelect('+(n===1?12:n-1)+',true)">‹ Precedente</button><button type="button" onclick="calSelect('+(n===12?1:n+1)+',true)">Successiva ›</button></div></div>';
 const st=box.querySelector(".cal-stars");let h="";for(let i=0;i<40;i++)h+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;animation-delay:'+(Math.random()*4).toFixed(2)+'s;animation-duration:'+(2.5+Math.random()*3).toFixed(2)+'s"></i>';st.innerHTML=h;
 cancelAnimationFrame(CAL_RAF);
 if(anim&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){const ph=document.getElementById("cmB-ph"),t0=performance.now(),D=1400;
  const step=function(now){const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);if(ph)ph.setAttribute("d",calPhasePath(60,60,46,e*target));if(k<1)CAL_RAF=requestAnimationFrame(step);};CAL_RAF=requestAnimationFrame(step);}
 else{const ph=document.getElementById("cmB-ph");if(ph)ph.setAttribute("d",calPhasePath(60,60,46,target));}
 document.querySelectorAll("#trgrid .trc").forEach(function(c){const num=parseInt((c.querySelector(".trn")||{}).textContent,10);const e=TR_EL[num];c.style.setProperty("--tc",TR_COL[e]);c.setAttribute("data-el",e);c.classList.toggle("now",num===n);
  if(!c._cal){c._cal=1;c.setAttribute("tabindex","0");c.setAttribute("role","button");c.addEventListener("click",function(){calSelect(num,true)});c.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();calSelect(num,true)}});}});
 document.querySelectorAll("#trgrid .tbanner").forEach(function(b){if(!b.querySelector(".tb-ecl")){const e=document.createElement("span");e.className="tb-ecl";e.innerHTML='<i class="w"></i><i class="k"></i>';b.insertBefore(e,b.firstChild);}});}

/* ==== Celle equipaggiate: tendine con regole di unicità e potenziamento ==== */
const CELL_CAT={"Celle di Forza — Offensiva":{k:"forza",t:"Forza"},"Celle di Vigore — Sopravvivenza":{k:"vigore",t:"Vigore"},"Celle di Tecnica — Stile di gioco":{k:"tecnica",t:"Tecnica"}};
function cellNorm(t){return String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
function cellAll(){const out=[];for(const[cat,items] of Object.entries(CD)){const c=CELL_CAT[cat]||{k:"x",t:cat};items.forEach(function(it){out.push({n:it.n,p3:it.p3,p6:it.p6,cat:cat,ck:c.k,ct:c.t})});}return out;}
function cellParse(v){v=String(v||"").trim();if(!v)return null;const m=v.match(/^(.*?)\s*\+\s*([36])\s*$/);const name=m?m[1]:v,lv=m?+m[2]:(/\b6\b/.test(v)?6:3);
 const nn=cellNorm(name.replace(/\b[36]\b/g,""));const c=cellAll().find(function(x){return cellNorm(x.n)===nn})||cellAll().find(function(x){const k=cellNorm(x.n);return nn&&(nn.indexOf(k)===0||k.indexOf(nn)===0)});
 return c?{c:c,lv:lv,v:c.n+" +"+lv}:{custom:v};}
function cellEsc(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
function cellBuild(vals){const g=document.getElementById("sc-celle");if(!g)return;
 g.innerHTML=Array(6).fill(0).map(function(_,i){return '<div class="sc-cslot" id="sc-cslot-'+i+'"><select class="sc-cella" id="sc-cella-'+i+'" aria-label="Slot cella '+(i+1)+'" onchange="cellRefresh('+i+')"></select><div class="sc-ceff" id="sc-ceff-'+i+'"></div></div>'}).join("");
 (vals||[]).forEach(function(v,i){const s=document.getElementById("sc-cella-"+i);if(!s)return;const p=cellParse(v);s.dataset.v=p?(p.v||p.custom):"";});
 cellRefresh();}
function cellRefresh(changed){const sels=[0,1,2,3,4,5].map(function(i){return document.getElementById("sc-cella-"+i)}).filter(Boolean);if(!sels.length)return;
 if(changed!==undefined){const s=sels[changed];const old=cellParse(s.dataset.v),nw=cellParse(s.value);s.dataset.v=s.value;if(nw&&nw.c&&nw.lv===6&&!(old&&old.c&&old.lv===6))sfxPlay("charge");else if(nw&&nw.c)sfxPlay("tick");}
 const cur=sels.map(function(s){return cellParse(s.dataset.v)});
 const used={};cur.forEach(function(p,i){if(p&&p.c)used[p.c.n]=i;});
 const all=cellAll();
 sels.forEach(function(s,i){const mine=cur[i];let h='<option value="">— slot '+(i+1)+' vuoto —</option>';
  if(mine&&mine.custom)h+='<option value="'+cellEsc(mine.custom)+'">✎ '+cellEsc(mine.custom)+'</option>';
  for(const cat of Object.keys(CELL_CAT)){const ct=CELL_CAT[cat];let gh="";
   all.filter(function(c){return c.cat===cat}).forEach(function(c){const own=mine&&mine.c&&mine.c.n===c.n;if(used[c.n]!==undefined&&!own)return;
    gh+='<option class="o3" value="'+cellEsc(c.n)+' +3">'+cellEsc(c.n)+' +3</option>';
    if(own)gh+='<option class="o6" value="'+cellEsc(c.n)+' +6">'+cellEsc(c.n)+' +6 ⬆</option>';});
   if(gh)h+='<optgroup label="'+ct.t+'">'+gh+'</optgroup>';}
  s.innerHTML=h;s.value=mine?(mine.v||mine.custom):"";
  const slot=document.getElementById("sc-cslot-"+i),eff=document.getElementById("sc-ceff-"+i);
  slot.classList.remove("lv3","lv6","cu","forza","vigore","tecnica");
  if(mine&&mine.c){slot.classList.add("lv"+mine.lv,mine.c.ck);eff.innerHTML='<span class="cat">'+mine.c.ct+' · +'+mine.lv+'</span>'+cellEsc(mine.lv===6?mine.c.p6:mine.c.p3);
   if(changed===i){slot.classList.remove("pop");void slot.offsetWidth;slot.classList.add("pop");}}
  else if(mine&&mine.custom){slot.classList.add("cu");eff.innerHTML='<span class="cat">Cella personalizzata</span>';}
  else eff.innerHTML="";});}

/* ==== Arma principale: categoria e abilità ==== */
const WPN_RK=["novizio","cacciatore","discepolo","maestro","fenice"],WPN_RL=["Lv 1–5","Lv 6–10","Lv 11–15","Lv 16–20","Lv 21–30"];
function wpnEsc(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function wpnRender(anim){const sel=document.getElementById("sc-wcat"),box=document.getElementById("sc-winfo");if(!sel||!box)return;
 if(sel.options.length<2){sel.innerHTML='<option value="">— scegli la categoria —</option>'+WD.map(function(w){return '<option value="'+w.n+'">'+w.n+'</option>'}).join("");sel.value=sel.dataset.v||"";}
 const w=WD.find(function(x){return x.n===sel.value});
 if(!w){box.innerHTML='<div class="sc-wempty">Scegli la categoria dell’arma principale per vederne qui abilità, danni e cariche.</div>';return;}
 const ri=WPN_RK.indexOf(scGv("sc-rango"));
 box.innerHTML='<div class="sc-wh"><b>'+w.n+'</b><span>'+wpnEsc(w.t)+'</span></div>'+
  '<div class="sc-wtr">'+w.tr.map(function(d,i){return '<div class="'+(i===ri?"on":"")+'"><small>'+WPN_RL[i]+'</small>'+d+'</div>'}).join("")+'</div>'+
  '<div class="sc-wch">Cariche: '+wpnEsc(w.ch)+'</div>'+
  (w.bm?'<div class="sc-wsp bm"><b>Bonus-move</b>'+wpnEsc(w.bm)+'</div>':'')+
  w.sp.map(function(s){return '<div class="sc-wsp"><b>'+wpnEsc(s.n)+'</b>'+wpnEsc(s.d)+'</div>'}).join("");
 if(anim){box.classList.remove("in");void box.offsetWidth;box.classList.add("in");}}
document.addEventListener("change",function(e){if(!e.target)return;if(e.target.id==="sc-wcat"){e.target.dataset.v=e.target.value;wpnRender(true);sfxPlay("clang");}if(e.target.id==="sc-rango")wpnRender();});

/* ==== Arma secondaria: pistola / arco e munizioni elementali ==== */
const AMMO_MAX=6;
const AMMO_FX=[
 {k:"terrestre",n:"Terrestre",e:"🌍",c:"#7fd06a",d:"<b>Su alleato/sé:</b> vortice di pietre, +3 COST. <b>Su nemico:</b> riduce DES e movimenti (svantaggio DES)."},
 {k:"ardente",n:"Fiammeggiante",e:"🔥",c:"#ff7a3a",d:"Palla di fuoco: 1D4 extra in area 3×3, infuoca il bersaglio e (tiro salvezza COST CD 13 + bonus) i vicini."},
 {k:"glaciale",n:"Congelante",e:"❄",c:"#9ee0ff",d:"Zona 5×5 di ghiaccio: vantaggio ai tiri contro gli avversari nell’area, mobilità ridotta per loro."},
 {k:"radiante",n:"Radiante",e:"✨",c:"#f3e2ff",d:"Zona 5×5: alleati +4 DES e +2 PV rigenerati per ogni turno trascorso nell’area."},
 {k:"oscuro",n:"Oscuro",e:"🌑",c:"#a77cff",d:"Portale che teletrasporta il bersaglio nell’area del colpo. <b>Su nemico:</b> 1D20 + Bonus DES contro CD 8; se riesce, il nemico viene teletrasportato. <b>Su alleato/sé:</b> teletrasporto automatico (fuga, schivata o sfuggire a prese), ma il bersaglio subisce comunque il danno."},
 {k:"folgorante",n:"Fulmineo",e:"⚡",c:"#ffe04a",d:"Fulmine sulla linea di tiro: paralizza il primo avversario colpito, che perde il turno."}];
let AMMO_PICK=null;
function ammoType(){return scGv("sc-arma2t")==="arco"?"arco":"pistola";}
function ammoWord(pl){return ammoType()==="arco"?(pl?"Frecce":"Freccia"):(pl?"Proiettili":"Proiettile");}
function ammoCount(){const v=parseInt(scGv("sc-proiettili"),10);return isNaN(v)?0:Math.max(0,Math.min(AMMO_MAX,v));}
function ammoSetCount(n){const el=document.getElementById("sc-proiettili");if(!el)return;el.value=Math.max(0,Math.min(AMMO_MAX,n));ammoRender();paAuto();}
function scCnt(delta){ammoSetCount(ammoCount()+delta);}
function ammoIcon(arco){return arco?'<svg viewBox="0 0 24 64" aria-hidden="true"><path d="M12 2 L18 14 L13.5 13 L13.5 50 L12 52 L10.5 50 L10.5 13 L6 14 Z" class="tip"/><path d="M10.5 48 L6 62 L10.5 58 Z M13.5 48 L18 62 L13.5 58 Z M11 50 L12 63 L13 50 Z" class="fl"/></svg>'
 :'<svg viewBox="0 0 24 64" aria-hidden="true"><path d="M12 4 C17 9 18 16 18 22 L6 22 C6 16 7 9 12 4 Z" class="tip"/><rect x="6" y="22" width="12" height="34" rx="1.5" class="cs"/><rect x="5" y="54" width="14" height="6" rx="1" class="fl"/><rect x="6" y="30" width="12" height="2" class="fl"/></svg>';}
function ammoRender(){const box=document.getElementById("sc-ammo");if(!box)return;const arco=ammoType()==="arco",n=ammoCount();
 const lb=document.getElementById("sc-ammo-lbl");if(lb)lb.textContent=ammoWord(true)+" · "+n+" / "+AMMO_MAX;
 const el=document.getElementById("sc-proiettili");if(el&&String(el.value)!==String(n))el.value=n;
 box.classList.toggle("arco",arco);
 box.innerHTML=Array(AMMO_MAX).fill(0).map(function(_,i){const ok=i<n;return '<button type="button" class="sc-am'+(ok?"":" off")+'" data-i="'+i+'" '+(ok?'onclick="ammoOpen()"':'disabled')+' aria-label="'+(ok?"Usa "+ammoWord(false).toLowerCase():ammoWord(false)+" esaurito")+'">'+ammoIcon(arco)+'</button>'}).join("");
 const last=document.getElementById("sc-ammo-last"),lv=scGv("sc-ammo-log");if(last){const f=AMMO_FX.find(function(x){return x.k===lv});last.innerHTML=f?'Ultimo colpo: <b style="color:'+f.c+'">'+f.e+" "+f.n+'</b>':"";}}
function ammoOpen(){if(ammoCount()<=0)return;AMMO_PICK=null;const ov=document.getElementById("am-ov");ammoPop();ov.classList.add("open");sfxPlay("paper");}
function ammoClose(){document.getElementById("am-ov").classList.remove("open");AMMO_PICK=null;}
function ammoPop(){const p=document.getElementById("am-pop");if(!p)return;const w=ammoWord(false).toLowerCase(),f=AMMO_FX.find(function(x){return x.k===AMMO_PICK});
 p.innerHTML='<div class="al-tit">Scegli l’effetto</div><div class="al-sub">'+(ammoType()==="arco"?"Freccia aetherica":"Proiettile aetherico")+' · ne restano '+ammoCount()+' · durata massima 3 turni</div>'+
  '<div class="am-grid">'+AMMO_FX.map(function(x){return '<button type="button" class="am-fx'+(x.k===AMMO_PICK?" on":"")+'" style="--ac:'+x.c+'" onclick="AMMO_PICK=\''+x.k+'\';ammoPop();sfxPlay(\'orb\',\''+x.k+'\')"><span>'+x.e+'</span>'+x.n+'</button>'}).join("")+'</div>'+
  '<div class="am-desc"'+(f?' style="--ac:'+f.c+'"':'')+'>'+(f?'<b>'+f.e+' '+f.n+'</b>'+f.d:'Tocca un effetto per leggerne la descrizione.')+'</div>'+
  '<div class="pc-btns"><button type="button" class="al-back" onclick="ammoClose()">Annulla</button><button type="button" class="nv-go" '+(f?'':'disabled ')+'onclick="ammoFire()">'+(f?'✓ Usa '+w+' '+f.n.toLowerCase():'Scegli un effetto')+'</button></div>';}
function ammoFire(){const f=AMMO_FX.find(function(x){return x.k===AMMO_PICK});if(!f||ammoCount()<=0)return;ammoClose();
 const n=ammoCount(),btn=document.querySelector('#sc-ammo .sc-am[data-i="'+(n-1)+'"]');
 const lg=document.getElementById("sc-ammo-log");if(lg)lg.value=f.k;
 if(btn&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){const r=btn.getBoundingClientRect();btn.style.setProperty("--ac",f.c);btn.classList.add("fire");
  for(let k=0;k<14;k++){const sp=document.createElement("span");sp.className="am-spark";const a=-Math.PI/2+(Math.random()-.5)*2.2,d=40+Math.random()*70;sp.style.left=(r.left+r.width/2)+"px";sp.style.top=(r.top+r.height*.25)+"px";sp.style.background=f.c;sp.style.boxShadow="0 0 10px "+f.c;sp.style.setProperty("--dx",(Math.cos(a)*d).toFixed(1)+"px");sp.style.setProperty("--dy",(Math.sin(a)*d).toFixed(1)+"px");document.body.appendChild(sp);setTimeout(function(){sp.remove()},900);}
  const ring=document.createElement("span");ring.className="am-ring";ring.style.left=(r.left+r.width/2)+"px";ring.style.top=(r.top+r.height/2)+"px";ring.style.borderColor=f.c;ring.style.boxShadow="0 0 18px "+f.c;document.body.appendChild(ring);setTimeout(function(){ring.remove()},800);
  sfxPlay("orb",f.k);setTimeout(function(){ammoSetCount(n-1)},620);}
 else{sfxPlay("orb",f.k);ammoSetCount(n-1);}}
function ammoReset(){ammoSetCount(AMMO_MAX);const lg=document.getElementById("sc-ammo-log");if(lg)lg.value="";ammoRender();sfxPlay("charge");
 document.querySelectorAll("#sc-ammo .sc-am").forEach(function(b,i){b.style.animationDelay=(i*.06)+"s";b.classList.add("load");setTimeout(function(){b.classList.remove("load")},900);});}
document.addEventListener("change",function(e){if(e.target&&e.target.id==="sc-arma2t")ammoRender();});
document.addEventListener("input",function(e){if(e.target&&e.target.id==="sc-proiettili")ammoRender();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){const o=document.getElementById("am-ov");if(o&&o.classList.contains("open"))ammoClose();}});

/* ==== Cariche aetheriche: due contenitori da 3 ==== */
let CH_N=0;
function chHTML(){let h='<div class="ae-wrap"><div class="ae-tanks">';
 for(let t=0;t<2;t++){h+='<div class="ae-tank" id="ae-t'+t+'"><div class="ae-glass" role="button" tabindex="0" aria-label="Contenitore '+(t+1)+'" onclick="chTap('+t+',event)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();chAdd(1)}"><div class="ae-liq" id="ae-l'+t+'"><span class="ae-wave"></span><span class="ae-wave b"></span><span class="ae-bb"><i></i><i></i><i></i><i></i><i></i><i></i></span></div><span class="ae-mk" style="bottom:33.33%"></span><span class="ae-mk" style="bottom:66.66%"></span><span class="ae-shine"></span></div><div class="ae-cap"></div><div class="ae-lbl">'+(t?"II":"I")+'</div></div>';}
 h+='</div><div class="ae-side"><div class="ae-n" id="ae-n">0 / 6</div><button type="button" class="ae-b" onclick="chAdd(1)">＋ Carica</button><button type="button" class="ae-b" onclick="chAdd(-1)">－ Togli</button><button type="button" class="ae-use" id="ae-use" onclick="chUse()">✦ Usa abilità <small>−3</small></button></div></div>';return h;}
function chBuild(arr){const r1=document.getElementById("sc-ch-r1"),r2=document.getElementById("sc-ch-r2");if(!r1)return;
 r1.parentElement.innerHTML='<div id="sc-ch-r1">'+chHTML()+'</div><div id="sc-ch-r2" hidden></div>';
 CH_N=Array.isArray(arr)?arr.filter(Boolean).length:0;chRender(false);}
function chRender(anim){for(let t=0;t<2;t++){const v=Math.max(0,Math.min(3,CH_N-t*3)),l=document.getElementById("ae-l"+t),tk=document.getElementById("ae-t"+t);if(!l)continue;
  if(!anim)l.style.transition="none";l.style.height=(v/3*100)+"%";if(!anim){void l.offsetWidth;l.style.transition="";}
  tk.classList.toggle("full",v===3);tk.classList.toggle("empty",v===0);}
 const n=document.getElementById("ae-n");if(n)n.textContent=CH_N+" / 6";const u=document.getElementById("ae-use");if(u)u.disabled=CH_N<3;}
function chSet(v){const old=CH_N;CH_N=Math.max(0,Math.min(6,v));if(CH_N===old)return;chRender(true);if(CH_N>old){sfxPlay("charge");const t=CH_N<=3?0:1,tk=document.getElementById("ae-t"+t);if(tk){tk.classList.remove("pulse");void tk.offsetWidth;tk.classList.add("pulse");}}else sfxPlay("tick");paAuto();}
function chAdd(d){chSet(CH_N+d);}
function chTap(t,e){/* tocco sul contenitore: riempie fino al livello toccato, rispettando l'ordine */
 const g=e.currentTarget.getBoundingClientRect(),y=1-(e.clientY-g.top)/g.height,seg=Math.max(1,Math.min(3,Math.ceil(y*3)));
 if(t===1&&CH_N<3){chAdd(1);return;}
 let target=t*3+seg;if(target===CH_N)target-=1;chSet(target);}
function chUse(){if(CH_N<3)return;const tk=document.getElementById(CH_N>3?"ae-t1":"ae-t0");
 if(tk&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){const r=tk.getBoundingClientRect();
  const ring=document.createElement("span");ring.className="am-ring";ring.style.left=(r.left+r.width/2)+"px";ring.style.top=(r.top+r.height/2)+"px";ring.style.borderColor="#7fb6ff";ring.style.boxShadow="0 0 20px #4d8dff";document.body.appendChild(ring);setTimeout(function(){ring.remove()},800);
  for(let k=0;k<18;k++){const sp=document.createElement("span");sp.className="am-spark";const a=-Math.PI/2+(Math.random()-.5)*2.6,d=50+Math.random()*80;sp.style.left=(r.left+r.width/2)+"px";sp.style.top=(r.top+r.height*.4)+"px";sp.style.background="#bcd8ff";sp.style.boxShadow="0 0 10px #4d8dff";sp.style.setProperty("--dx",(Math.cos(a)*d).toFixed(1)+"px");sp.style.setProperty("--dy",(Math.sin(a)*d).toFixed(1)+"px");document.body.appendChild(sp);setTimeout(function(){sp.remove()},900);}
  const w=document.querySelector(".ae-wrap");if(w){w.classList.remove("burst");void w.offsetWidth;w.classList.add("burst");}}
 sfxPlay("orb","folgorante");CH_N-=3;chRender(true);paAuto();}

function paTheme(){try{const _k=paActive();if(_k)localStorage.setItem("tcj-pa-theme",_k);else localStorage.removeItem("tcj-pa-theme");}catch(e){}if(mThemeActive()){const mp=mPref(),h0=document.documentElement,s0=document.getElementById("scheda");h0.setAttribute("data-pg","master");h0.setAttribute("data-el",mp.c);if(s0)s0.setAttribute("data-el",paActive()?paPref(paActive()).c:(PA_DEF[scCur]||"glaciale"));try{fxSet(mp.fx)}catch(e){}return;}const k=paActive(),h=document.documentElement,sec=document.getElementById("scheda");
 if(k){const p=paPref(k);h.setAttribute("data-pg",k);h.setAttribute("data-el",p.c);}else{h.removeAttribute("data-pg");h.removeAttribute("data-el");}
 if(sec)sec.setAttribute("data-el",k?paPref(k).c:(PA_DEF[scCur]||"glaciale"));
 try{fxSet(paFxEl())}catch(e){}}
let slAsk=null,slBg=false;
function slMenuOpen(){const m=document.getElementById("sl-menu");return !!(m&&!m.hidden)}
function slToggle(e){if(e)e.stopPropagation();const m=document.getElementById("sl-menu"),b=document.getElementById("sl-btn");if(!m||!b)return;const open=m.hidden;m.hidden=!open;b.setAttribute("aria-expanded",String(open));slAsk=null;if(open)slRender();}
function slClose(){const m=document.getElementById("sl-menu"),b=document.getElementById("sl-btn");if(m)m.hidden=true;if(b)b.setAttribute("aria-expanded","false");slAsk=null;}
function slRender(){const b=document.getElementById("sl-btn"),m=document.getElementById("sl-menu");if(!b||!m)return;
 const act=paActive(),ac=SC_CHARS.find(c=>c.k===act);
 b.innerHTML=ac?('<span class="sl-bi">'+ac.e+'</span><span class="sl-bt"> '+ac.n+'</span> ▾'):'<span class="sl-bi">⚔</span><span class="sl-bt"> Slayer</span> ▾';
 if(m.hidden)return;
 let h='<div class="sl-h">Personaggio</div>';
 SC_CHARS.forEach(c=>{const open=paIsOpen(c.k),on=c.k===act;
  h+=`<button type="button" class="sl-item${on?" on":""}" onclick="slPick('${c.k}')"><span class="sl-e">${c.e}</span><span class="sl-nm">${c.n}</span><span class="sl-st">${on?"✓ attivo":open?"aperta":"🔒"}</span></button>`;
  if(slAsk===c.k)h+=`<div class="sl-code"><input type="password" id="sl-code-in" placeholder="Password" aria-label="Password di ${c.n}" autocomplete="off" onkeydown="if(event.key==='Enter')slTry()"><button type="button" onclick="slTry()">Apri</button></div><div class="sl-err" id="sl-err" style="display:none">Password errata. Riprova.</div>`;});
 h+=`<div class="sl-sep"></div><div class="sl-row"><div><span>Suoni</span><small>Effetti sonori del sito</small></div><button type="button" class="sl-sw" role="switch" aria-checked="${sfxOn()}" aria-label="Suoni" onclick="sfxToggle()"></button></div>`;
 h+=`<div class="sl-row"><div><span>Effetti laterali</span><small>${(act||mThemeActive())?"Particelle animate ai lati della pagina":"Visibili quando un personaggio è attivo"}</small></div><button type="button" class="sl-sw" role="switch" aria-checked="${fxOn()}" aria-label="Effetti laterali" onclick="fxToggle()"></button></div>`;
 if(act){const pf=paPref(act),opt=function(v){return PA_ELS.map(function(e){return '<option value="'+e[0]+'"'+(e[0]===v?' selected':'')+'>'+e[1]+'</option>'}).join("")};
  h+='<button type="button" class="sl-row sl-bgt" onclick="slBg=!slBg;slRender()" aria-expanded="'+slBg+'"><span>Impostazioni sfondo</span><span class="sl-car">'+(slBg?'\u25B4':'\u25BE')+'</span></button>';
  if(slBg)h+='<div class="sl-bg"><label>Colore del sito<select onchange="paSetPref(\'c\',this.value)">'+opt(pf.c)+'</select></label><label>Effetti laterali<select onchange="paSetPref(\'fx\',this.value)">'+opt(pf.fx)+'</select></label>'+(pf.custom?'<button type="button" class="sl-act" onclick="paResetPref()">\u21BA Torna ai colori di '+ac.n+'</button>':'<small>Colori di base di '+ac.n+'</small>')+'</div>';}
 if(paMaster()){const mp=mPref(),mopt=function(v){return M_ELS.map(function(e){return '<option value="'+e[0]+'"'+(e[0]===v?' selected':'')+'>'+e[1]+'</option>'}).join("")};
  h+='<div class="sl-sep"></div><div class="sl-h sl-mh">👑 Zona Master</div><div class="sl-row"><div><span>Sfondo del Master</span><small>Ha la precedenza sui colori dei personaggi</small></div><button type="button" class="sl-sw sl-msw" role="switch" aria-checked="'+mp.on+'" aria-label="Sfondo del Master" onclick="mSetPref(\'on\','+(!mp.on)+')"></button></div>';
  if(mp.on)h+='<div class="sl-bg"><label>Colore del sito<select onchange="mSetPref(\'c\',this.value)">'+mopt(mp.c)+'</select></label><label>Effetti laterali<select onchange="mSetPref(\'fx\',this.value)">'+mopt(mp.fx)+'</select></label>'+('<label>Rotta della nave<select onchange="wmSetRoute(this.value)"><option value="">'+(NV_ROTTA?'Quella del sito ('+WM_NAME[NV_ROTTA]+')':'Nessuna (come nel sito)')+'</option><option value="none"'+(function(){try{return localStorage.getItem("tcj_rotta")==="none"?" selected":""}catch(e){return""}})()+'>Nascondi rotta</option>'+Object.keys(WM_NAME).map(function(k){let cur=null;try{cur=localStorage.getItem("tcj_rotta")}catch(e){}return '<option value="'+k+'"'+(cur===k?' selected':'')+'>'+WM_NAME[k]+'</option>'}).join("")+'</select></label>')+(mp.custom?'<button type="button" class="sl-act" onclick="mResetPref()">\u21BA Torna al Cremisi del Master</button>':'<small>Cremisi del Master, con il Sigillo Cremisi ai lati</small>')+'</div>';}
 h+='<div class="sl-sep"></div><a class="sl-act" href="#scheda" onclick="slClose()">↓ Vai all\'Area Slayer</a>';
 if(ac)h+=`<button type="button" class="sl-act" onclick="slClose();paNeutral()">◆ Torna al colore neutro</button>`;
 if(ac&&paOpenList().indexOf(act)>=0)h+=`<button type="button" class="sl-act" onclick="slClose();paLock()">🔒 Chiudi l'area di ${ac.n}</button>`;
 m.innerHTML=h;
 if(slAsk){const i=document.getElementById("sl-code-in");if(i)setTimeout(function(){i.focus()},0);}}
function slGo(k){paThemeOn=true;if(k!==scCur)scSwitch(k);else scBuild();}
function slPick(k){if(paIsOpen(k)){slClose();slGo(k);slRender();return;}slAsk=(slAsk===k?null:k);slRender();}
function slTry(){const k=slAsk,i=document.getElementById("sl-code-in");if(!k||!i)return;const v=i.value.trim().toLowerCase();
 if(v&&v===String(PA_CODES[k]||"").toLowerCase()){paSetOpen(k,true);slClose();slGo(k);slRender();pgPlay(k);if(window.__sfxBurst){try{window.__sfxBurst()}catch(e){}}return;}
 const er=document.getElementById("sl-err");if(er)er.style.display="";const box=i.parentNode;if(box){box.classList.remove("pa-shake");void box.offsetWidth;box.classList.add("pa-shake");}i.select();}
document.addEventListener("click",function(e){if(!slMenuOpen())return;const dd=document.getElementById("sl-dd");const path=e.composedPath?e.composedPath():[];if(dd&&path.indexOf(dd)<0)slClose();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&slMenuOpen())slClose();});

/* --- effetti laterali (canvas ai due bordi) --- */
const FX={k:"",raf:0,bw:0,H:0,dpr:1,t:0,last:0,mob:false,still:false,side:[]};
function fxOn(){try{return localStorage.getItem("tcj_fx")!=="0"}catch(e){return true}}
function fxToggle(){try{localStorage.setItem("tcj_fx",fxOn()?"0":"1")}catch(e){}fxSet(paFxEl());slRender();}
function fxRnd(a,b){return a+Math.random()*(b-a)}
function fxSet(k){const on=!!k&&fxOn();document.documentElement.classList.toggle("fx-on",on);cancelAnimationFrame(FX.raf);FX.raf=0;
 if(!on){FX.k="";return;}
 FX.k=k;FX.still=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);fxInit();
 if(FX.still){fxFrame(0);}else{FX.last=performance.now();FX.raf=requestAnimationFrame(fxLoop);}}
function fxInit(){const W=window.innerWidth,H=window.innerHeight;FX.mob=W<700;FX.H=H;
 FX.bw=FX.mob?18:Math.round(Math.min(150,Math.max(64,W*0.085)));FX.dpr=Math.min(window.devicePixelRatio||1,1.5);
 FX.side=["fx-l","fx-r"].map(function(id,si){const cv=document.getElementById(id);if(!cv)return null;
  cv.style.width=FX.bw+"px";cv.style.height=H+"px";cv.width=Math.round(FX.bw*FX.dpr);cv.height=Math.round(H*FX.dpr);
  const deco=document.createElement("canvas");deco.width=cv.width;deco.height=cv.height;const dc=deco.getContext("2d");dc.setTransform(FX.dpr,0,0,FX.dpr,0,0);
  fxDeco(dc,FX.k,FX.bw,H,si);
  return {cv:cv,ctx:cv.getContext("2d"),deco:deco,mir:si===1,p:fxParts(FX.k,FX.bw,H)};}).filter(Boolean);}
function fxEdge(c,bw,H,rgb,a){const g=c.createLinearGradient(0,0,bw,0);g.addColorStop(0,"rgba("+rgb+","+a+")");g.addColorStop(1,"rgba("+rgb+",0)");c.fillStyle=g;c.fillRect(0,0,bw,H);}
function fxDeco(c,k,bw,H,si){const mob=FX.mob;if(k==="master"){mfxDeco(c,bw,H);return;}if(k==="ardente"||k==="folgorante"||k==="radiante"){fxDeco2(c,k,bw,H,si);return;}
 if(k==="glaciale"){fxEdge(c,bw,H,"150,210,240",mob?.16:.13);
  const branch=function(x,y,ang,len,w,d){if(d<0||len<2)return;const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;c.strokeStyle="rgba(205,238,255,"+(0.16+d*0.09)+")";c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
   const n=2;for(let i=1;i<=n;i++){const t=i/(n+1),bx=x+(x2-x)*t,by=y+(y2-y)*t,sl=len*fxRnd(.3,.5);branch(bx,by,ang-fxRnd(.6,1),sl,w*.7,d-1);branch(bx,by,ang+fxRnd(.6,1),sl,w*.7,d-1);}};
  let y=fxRnd(20,80);while(y<H){const big=(y<H*.15||y>H*.85);branch(0,y,fxRnd(-.35,.35),bw*(big?fxRnd(.45,.8):fxRnd(.22,.5)),mob?.6:1,mob?1:2);y+=mob?fxRnd(60,120):fxRnd(70,150);}
  for(let i=0;i<(mob?20:70);i++){c.fillStyle="rgba(230,248,255,"+fxRnd(.15,.5)+")";const x=Math.pow(Math.random(),2)*bw*.6;c.fillRect(x,Math.random()*H,1,1);}}
 else if(k==="oscuro"){fxEdge(c,bw,H,"60,30,110",mob?.4:.32);fxEdge(c,bw,H,"150,110,230",mob?.12:.08);
  if(si===1&&!mob){const mx=bw*.48,my=Math.min(170,H*.22),r=Math.min(bw*.2,24);const g=c.createRadialGradient(mx,my,0,mx,my,r*4);g.addColorStop(0,"rgba(200,185,255,.22)");g.addColorStop(1,"rgba(200,185,255,0)");c.fillStyle=g;c.fillRect(0,0,bw,my+r*5);
   c.save();c.beginPath();c.arc(mx,my,r,0,Math.PI*2);c.fillStyle="rgba(228,220,255,.55)";c.fill();c.globalCompositeOperation="destination-out";c.beginPath();c.arc(mx+r*.45,my-r*.18,r*.92,0,Math.PI*2);c.fill();c.restore();}}
 else if(k==="terrestre"){fxEdge(c,bw,H,"70,120,50",mob?.22:.15);const gb=c.createLinearGradient(0,H*.6,0,H);gb.addColorStop(0,"rgba(110,80,45,0)");gb.addColorStop(1,"rgba(110,80,45,.22)");c.fillStyle=gb;c.fillRect(0,H*.6,bw*.6,H*.4);
  for(let i=0;i<(mob?120:420);i++){const x=Math.pow(Math.random(),2.2)*bw*(mob?.7:.32),y=H-Math.pow(Math.random(),.6)*H;const gr=Math.random()<.75;c.fillStyle=gr?"rgba("+Math.round(fxRnd(70,120))+","+Math.round(fxRnd(120,170))+",60,"+fxRnd(.2,.5)+")":"rgba(130,95,55,"+fxRnd(.2,.45)+")";c.beginPath();c.arc(x,y,fxRnd(.5,mob?1.2:2),0,Math.PI*2);c.fill();}
  const stems=mob?1:2;for(let s=0;s<stems;s++){const base=bw*(mob?.45:(.16+s*.14)),amp=bw*(mob?.25:.09),fr=fxRnd(.006,.011),ph=fxRnd(0,6.28);
   c.strokeStyle="rgba(95,145,70,"+(mob?.45:.55)+")";c.lineWidth=mob?1:1.8;c.beginPath();for(let y=H;y>=0;y-=6){const x=base+Math.sin(y*fr+ph)*amp;if(y===H)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
   let side=1;for(let y=H-fxRnd(10,30);y>0;y-=mob?fxRnd(40,60):fxRnd(26,44)){const x=base+Math.sin(y*fr+ph)*amp;const L=mob?4:fxRnd(6,10);c.save();c.translate(x,y);c.rotate(side*fxRnd(.6,1.1)-.25);c.fillStyle="rgba("+Math.round(fxRnd(110,160))+","+Math.round(fxRnd(170,205))+",90,"+fxRnd(.4,.6)+")";c.beginPath();c.ellipse(side*L*.6,0,L*.6,L*.28,0,0,Math.PI*2);c.fill();c.restore();side=-side;}}}}
function fxParts(k,bw,H){if(k==="master")return mfxParts(bw,H);if(k==="ardente"||k==="folgorante"||k==="radiante")return fxParts2(k,bw,H);const mob=FX.mob,a=[];const n=function(d,m){return mob?m:d};
 if(k==="glaciale"){for(let i=0;i<n(30,6);i++)a.push({t:"snow",x0:Math.pow(Math.random(),1.3)*bw*.92,y:Math.random()*H,r:fxRnd(.7,mob?1.8:2.9),vy:fxRnd(12,30),amp:fxRnd(3,mob?3:12),ph:fxRnd(0,6.28),a:fxRnd(.35,.85)});}
 else if(k==="oscuro"){for(let i=0;i<n(16,4);i++)a.push({t:"smoke",x:Math.random()*bw*.55,y:Math.random()*H,r:fxRnd(mob?6:14,mob?10:32),vy:-fxRnd(7,16),vx:fxRnd(-3,4),a:fxRnd(.06,.14)});
  for(let i=0;i<n(16,4);i++)a.push({t:"spark",x0:Math.random()*bw*.8,y:Math.random()*H,r:fxRnd(.6,1.7),vy:-fxRnd(16,40),amp:fxRnd(2,8),ph:fxRnd(0,6.28),a:fxRnd(.4,.9),fl:fxRnd(4,11)});}
 else if(k==="terrestre"){for(let i=0;i<n(24,6);i++)a.push({t:"spore",x0:Math.random()*bw*.85,y:Math.random()*H,r:fxRnd(.8,mob?1.6:2.3),vy:-fxRnd(6,15),amp:fxRnd(3,mob?3:10),ph:fxRnd(0,6.28),a:fxRnd(.35,.8)});
  for(let i=0;i<n(16,4);i++)a.push({t:"dust",x0:Math.random()*bw*.6,y:Math.random()*H,r:fxRnd(.5,1.3),vy:-fxRnd(3,8),amp:fxRnd(4,14),ph:fxRnd(0,6.28),a:fxRnd(.25,.55)});}
 return a;}
function fxLoop(now){const dt=Math.min(.05,(now-FX.last)/1000);FX.last=now;fxFrame(dt);FX.raf=requestAnimationFrame(fxLoop);}
function fxFrame(dt){FX.t+=dt;const t=FX.t,bw=FX.bw,H=FX.H,d=FX.dpr;
 FX.side.forEach(function(S){const c=S.ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,S.cv.width,S.cv.height);
  if(S.mir)c.setTransform(-d,0,0,d,S.cv.width,0);else c.setTransform(d,0,0,d,0,0);
  fxPre(c,S,t,bw,H);c.drawImage(S.deco,0,0,bw,H);
  S.p.forEach(function(p){p.y+=p.vy*dt;
   if(p.vy>0&&p.y>H+10)p.y=-10;if(p.vy<0&&p.y<-40){p.y=H+20;}
   const x=p.x0!==undefined?p.x0+Math.sin(t*.8+p.ph)*p.amp:(p.x+=p.vx*dt);
   if(p.x!==undefined&&(p.x<-20||p.x>bw))p.x=Math.random()*bw*.4;
   const fade=Math.max(0,Math.pow(1-Math.min(1,Math.max(0,x)/bw),.7));
   if(p.t==="snow"){c.fillStyle="rgba(228,246,255,"+(p.a*fade)+")";if(p.r>2.2){c.strokeStyle=c.fillStyle;c.lineWidth=.8;c.beginPath();for(let i=0;i<3;i++){const an=i*Math.PI/3+t*.3+p.ph;c.moveTo(x-Math.cos(an)*p.r*1.4,p.y-Math.sin(an)*p.r*1.4);c.lineTo(x+Math.cos(an)*p.r*1.4,p.y+Math.sin(an)*p.r*1.4);}c.stroke();}else{c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();}}
   else if(p.t==="smoke"){const g=c.createRadialGradient(x,p.y,0,x,p.y,p.r);g.addColorStop(0,"rgba(120,80,190,"+(p.a*fade)+")");g.addColorStop(1,"rgba(60,30,110,0)");c.fillStyle=g;c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();}
   else if(p.t==="spark"){const fl=.55+.45*Math.sin(t*p.fl+p.ph);c.fillStyle="rgba(196,160,255,"+(p.a*fl*fade)+")";c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();}
   else if(p.t==="spore"){c.fillStyle="rgba(200,236,120,"+(p.a*.18*fade)+")";c.beginPath();c.arc(x,p.y,p.r*3,0,6.283);c.fill();c.fillStyle="rgba(214,244,140,"+(p.a*fade)+")";c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();}
   else if(p.t==="dust"){c.fillStyle="rgba(165,125,75,"+(p.a*fade)+")";c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();}else fxDrawP(c,p,x,fade,t);});fxPost(c,S,t,dt,bw,H);});}
let fxRT=null;window.addEventListener("resize",function(){clearTimeout(fxRT);fxRT=setTimeout(function(){if(FX.k)fxSet(FX.k)},250);});

const SC_CHARS=[{k:"athena",n:"Athena",e:"\u2744\ufe0f"},{k:"panlan",n:"Pan Lan",e:"\ud83c\udf11"},{k:"asonnes",n:"Asonnes",e:"\ud83c\udf0d"}];
let scCur=(function(){try{const c=localStorage.getItem("tcj-sc-cur");return SC_CHARS.some(x=>x.k===c)?c:SC_CHARS[0].k}catch(e){return SC_CHARS[0].k}})();
function scKey(k){return "tcj-sc4-"+(k||scCur);}
function scRaw(k){try{let s=localStorage.getItem(scKey(k));if(s===null&&(k||scCur)===SC_CHARS[0].k)s=localStorage.getItem("tcj-sc4");return s;}catch(e){return null}}
function scLD(){try{const s=scRaw();return s?JSON.parse(s):{}}catch(e){return{}}}
function scTabs(){const t=document.getElementById("sc-tabs");if(!t)return;
 t.innerHTML=SC_CHARS.map(c=>`<button type="button" class="sc-tab${c.k===scCur?" active":""}${scRaw(c.k)?" filled":""}" data-k="${c.k}" onclick="scSwitch('${c.k}')">${c.e} ${c.n}${paIsOpen(c.k)?"":"<span class='pa-lk'>🔒</span>"}<span class="scdot"></span></button>`).join("");try{slRender()}catch(e){}}
function scSwitch(k){paThemeOn=true;if(k===scCur){paTheme();slRender();return;}scSave(true);scCur=k;try{localStorage.setItem("tcj-sc-cur",k)}catch(e){}scBuild();}
function scGv(id){const e=document.getElementById(id);return e?e.value:""}
function scNucleo(w){const v=document.getElementById("sc-n"+w+"-s").value;const d=document.getElementById("sc-n"+w+"-d");if(!v){d.textContent="";d.style.cssText="padding:.3rem .55rem;border:1px solid var(--border);font-family:'Cinzel',serif;font-size:.7rem;margin-bottom:.3rem;min-height:28px";return;}const n=SC_NC[v];d.textContent=n.tx;d.style.cssText=`padding:.3rem .55rem;border:1px solid ${n.br};background:${n.bg};font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.08em;margin-bottom:.3rem;min-height:28px;color:var(--text)`;}

function scTogCh(i){const b=document.getElementById("sc-chb-"+i);b.classList.toggle("on");if(b.classList.contains("on"))sfxPlay("charge");}
function scFmt(n){return n>=0?"+"+n:""+n;}
function scStatMod(id){const v=parseInt(scGv("scv-"+id),10);return isNaN(v)?null:Math.floor((v-10)/2);}
function scRecalc(){const mods={};SC_STATS.forEach(s=>{const m=scStatMod(s.id);mods[s.id]=m;const el=document.getElementById("scm-"+s.id);if(el)el.value=m===null?"":scFmt(m);});const b=parseInt(scGv("sc-comp-bonus"),10);const bonus=isNaN(b)?0:b;SC_COMPS.forEach(cp=>{const el=document.getElementById("scmod-"+cp.id);if(!el)return;const dot=document.getElementById("scd-"+cp.id);const on=dot&&dot.classList.contains("on");const m=mods[cp.st];if(m===null&&!on){el.value="";return;}el.value=scFmt((m||0)+(on?bonus:0));});}
function scBuild(){const d=scLD();if(!paPrep())return;paBuild(d);scBuildComps(d.comps||{},d.comp_mods||{});const left=SC_STATS.slice(0,3),right=SC_STATS.slice(3);["left","right"].forEach((side,si)=>{const stats=si===0?left:right;document.getElementById("sc-stats-"+side).innerHTML=stats.map(s=>`<div class="sc-stat-item"><span class="sc-stat-name">${s.nm}</span><input class="sc-stat-val" type="number" id="scv-${s.id}" value="${d.stats&&d.stats[s.id]?d.stats[s.id].v:""}" placeholder="10" oninput="scRecalc()"><input class="sc-stat-mod sc-calc" type="text" id="scm-${s.id}" readonly tabindex="-1" value="" placeholder="+0" title="(Valore − 10) ÷ 2, arrotondato per difetto"></div>`).join("");});chBuild(d.charges||[]);const celle=d.celle||Array(6).fill("");cellBuild(celle);[["lvl","sc-lvl"],["rango","sc-rango"],["pv","sc-pv"],["arma","sc-arma"],["abil","sc-abil"],["arma2","sc-arma2"],["proiettili","sc-proiettili"],["equip","sc-equip"]].forEach(([k,id])=>{const el=document.getElementById(id);if(el)el.value=d[k]!==undefined?d[k]:"";});const _ml=document.getElementById("sc-malus");if(_ml)_ml.value=d.malus!==undefined?d.malus:"";[0,1,2,3].forEach(i=>{const _ec=document.getElementById("sc-eq-cnt-"+i);if(_ec)_ec.value=(d.eq_cnt&&d.eq_cnt[i]!==undefined&&d.eq_cnt[i]!=="")?d.eq_cnt[i]:0;const _et=document.getElementById("sc-eq-txt-"+i);if(_et)_et.value=(d.eq_txt&&d.eq_txt[i]!==undefined)?d.eq_txt[i]:"";});document.getElementById("sc-natt-s").value=d.natt||"";scNucleo("att");document.getElementById("sc-ndef-s").value=d.ndef||"";scNucleo("def");try{orbSet("att",scGv("sc-natt-s"),true);orbSet("def",scGv("sc-ndef-s"),true);}catch(e){}document.getElementById("sc-benny").value=d.benny!==undefined?d.benny:0;document.getElementById("sc-ispirazione").value=d.ispirazione!==undefined?d.ispirazione:0;var _cr=document.getElementById("sc-coin-rows");if(_cr){_cr.innerHTML="";if(d.coins){d.coins.forEach(c=>scCoinAdd(c.a,c.c));}else{scCoinAdd();}}const _ct=document.getElementById("sc-coin-team");if(_ct)_ct.value=d.coin_team!==undefined?d.coin_team:"";const _cp=document.getElementById("sc-coin-personal");if(_cp)_cp.value=d.coin_personal!==undefined?d.coin_personal:"";crBuild(d.crowns||[]);const _cb=document.getElementById("sc-comp-bonus");if(_cb)_cb.value=(d.comp_bonus!==undefined&&d.comp_bonus!=="")?d.comp_bonus:2;scRecalc();try{sealRender()}catch(e){}try{const _w=document.getElementById("sc-wcat");_w.innerHTML="";_w.dataset.v=d.wcat||"";wpnRender();document.getElementById("sc-arma2t").value=d.arma2t==="arco"?"arco":"pistola";document.getElementById("sc-ammo-log").value=d.ammolog||"";document.querySelectorAll('input[name="sc-a2t"]').forEach(function(r){r.checked=r.value===document.getElementById("sc-arma2t").value});const _p=document.getElementById("sc-proiettili");if(d.proiettili===undefined||d.proiettili==="")_p.value=6;ammoRender();}catch(e){console.error(e)}scTabs();}
function scSave(quiet){if(window.paNoSave||!paIsOpen(scCur)||!document.getElementById("scv-FOR"))return;const d={};d.id=paGetId();d.notes=paGetNotes();d.seal=window.SEAL_CUR||{};["lvl|sc-lvl","rango|sc-rango","pv|sc-pv","arma|sc-arma","abil|sc-abil","arma2|sc-arma2","proiettili|sc-proiettili","equip|sc-equip","wcat|sc-wcat","arma2t|sc-arma2t","ammolog|sc-ammo-log"].forEach(f=>{const[k,id]=f.split("|");d[k]=scGv(id);});d.stats={};SC_STATS.forEach(s=>{d.stats[s.id]={v:scGv("scv-"+s.id),m:scGv("scm-"+s.id)};});d.charges=[0,1,2,3,4,5].map(i=>i<CH_N);d.celle=Array(6).fill(0).map((_,i)=>scGv("sc-cella-"+i));d.malus=scGv("sc-malus");d.comp_bonus=scGv("sc-comp-bonus");d.comps={};d.comp_mods={};SC_COMPS.forEach(cp=>{const el=document.getElementById("scd-"+cp.id);if(el)d.comps[cp.id]=el.classList.contains("on");const mel=document.getElementById("scmod-"+cp.id);if(mel)d.comp_mods[cp.id]=mel.value;});d.eq_cnt=[0,1,2,3].map(i=>scGv("sc-eq-cnt-"+i));d.eq_txt=[0,1,2,3].map(i=>scGv("sc-eq-txt-"+i));d.natt=scGv("sc-natt-s");d.ndef=scGv("sc-ndef-s");d.benny=scGv("sc-benny");d.ispirazione=scGv("sc-ispirazione");d.coin_team=scGv("sc-coin-team");d.coin_personal=scGv("sc-coin-personal");d.coins=[].slice.call(document.querySelectorAll("#sc-coin-rows .sc-coin-row")).map(function(r){return{a:r.querySelector(".sc-coin-amt").value,c:r.querySelector(".sc-coin-cur").value};});d.crowns=CROWNS.map((_,i)=>{const b=document.getElementById("cr-box-"+i);return!!(b&&b.classList.contains("has"));});try{localStorage.setItem(scKey(),JSON.stringify(d));}catch(e){}scTabs();if(quiet)return;const b=document.getElementById("sc-savebtn");b.textContent="✓ Salvato";b.classList.add("ok");setTimeout(()=>{b.textContent="Salva Scheda";b.classList.remove("ok");},2000);}
