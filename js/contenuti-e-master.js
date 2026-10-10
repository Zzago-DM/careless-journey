/* Logica dei contenuti: bestiario, manuale (armi, celle, Omnicelle, amplificatori), plancia, generatore NPC, calendario, note, accesso e schede della Zona Master, continenti */

/* BD: spostato in dati/behemoth.js */
const aC={glaciale:"var(--ice)",ardente:"var(--fire)",folgorante:"var(--lightning)",terrestre:"var(--earth)",radiante:"var(--radiant)",oscuro:"var(--dark)",neutro:"var(--neutral)"};
const aI={glaciale:"❄",ardente:"🔥",folgorante:"⚡",terrestre:"🌍",radiante:"✨",oscuro:"🌑",neutro:"◆"};
const cL={classico:"Classico",variante:"Variante",anomalo:"Anomalo",leggendario:"Leggendario",evoluto:"Evoluto",nuovo:"Nuova Aggiunta"};
const cC={classico:"var(--text2)",variante:"var(--ice)",anomalo:"var(--fire)",leggendario:"var(--gold2)",evoluto:"var(--radiant)",nuovo:"var(--lightning)"};
const aTC={glaciale:"tg",ardente:"ta",folgorante:"tf",terrestre:"tt",radiante:"tr",oscuro:"to",neutro:"tn"};

function buildBeh(){setTimeout(fbehApply,0);document.getElementById("bgrid").innerHTML=BD.map((b,i)=>`<div class="bcard" data-cat="${b.c}" data-ae="${b.a}" data-i="${i}" tabindex="0" role="button" aria-haspopup="dialog"><div class="bn">${b.n}</div><div style="display:flex;gap:.35rem;flex-wrap:wrap"><span class="tag ${aTC[b.a]}">${aI[b.a]} ${b.a}</span><span class="tag" style="color:${cC[b.c]};border-color:${cC[b.c]}33">${cL[b.c]}</span></div></div>`).join("");}
let BEH_F="all";function fbeh(t,btn){BEH_F=t;document.querySelectorAll(".fb").forEach(b=>b.classList.remove("active"));btn.classList.add("active");fbehApply();const bx=document.getElementById("bbox");if(bx)bx.scrollTop=0;}
function fbehApply(){const q=((document.getElementById("bsearch")||{}).value||"").trim().toLowerCase();let n=0;document.querySelectorAll("#bgrid .bcard").forEach(c=>{const ok=(BEH_F==="all"||c.dataset.cat===BEH_F||c.dataset.ae===BEH_F)&&(!q||c.textContent.toLowerCase().indexOf(q)>=0);c.classList.toggle("hidden",!ok);if(ok)n++;});const ct=document.getElementById("bcount");if(ct)ct.textContent=n+" Behemoth";const no=document.getElementById("bnone");if(no)no.hidden=n>0;}
function buildMBeh(){if(!document.getElementById("msl"))return;document.getElementById("msl").innerHTML=BD.map(b=>{const sg=b.s?Object.entries(b.s).map(([k,v])=>{const bn=Math.floor((v-10)/2);const bs=bn>=0?"+"+bn:""+bn;return`<div style="background:rgba(200,56,56,.06);padding:.3rem;text-align:center"><div style="font-family:'Cinzel',serif;font-size:.46rem;letter-spacing:.06em;color:#a06060;text-transform:uppercase">${k}</div><div style="font-size:.82rem;color:var(--text)">${v}</div><div style="font-size:.68rem;color:${bn>=0?'var(--ice)':'var(--fire)'}">${bs}</div></div>`}).join(""):"";const hg=b.hp?`<div style="font-size:.54rem;font-family:'Cinzel',serif;letter-spacing:.1em;text-transform:uppercase;color:#a06060;margin:.55rem 0 .25rem">PV</div><div style="display:flex;gap:.55rem;flex-wrap:wrap">${b.hp.map((v,i)=>`<span style="font-size:.74rem;color:var(--text2)">×${[1.2,1.3,1.4,1.5][i]}: <strong style="color:var(--text)">${v}</strong></span>`).join("")}</div>`:"";return`<div class="mbcard" data-cat="${b.c}" data-ae="${b.a}"><div class="mbh" onclick="const x=this.nextElementSibling;x.style.display=x.style.display==='none'?'block':'none';this.querySelector('.mbtg').textContent=x.style.display==='none'?'▼':'▲'">${typeof behIco==="function"?behIco(b.n):""}<div style="flex:1;min-width:0"><div style="font-family:'Cinzel',serif;font-size:.78rem;font-weight:600;color:var(--master2);margin-bottom:.35rem">${b.n}</div><div style="display:flex;gap:.3rem;flex-wrap:wrap"><span class="tag ${aTC[b.a]}">${aI[b.a]} ${b.a}</span><span class="tag" style="color:${cC[b.c]};border-color:${cC[b.c]}33">${cL[b.c]}</span></div></div><span class="mbtg" style="color:#a06060;font-size:.72rem">▼</span></div><div style="display:none;margin-top:.65rem;border-top:1px solid rgba(200,56,56,.1);padding-top:.6rem"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem">${sg}</div>${hg}</div></div>`}).join("");}
function fmbeh(t,btn){document.querySelectorAll(".fmb").forEach(b=>b.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".mbcard").forEach(c=>c.classList.toggle("hidden",t!=="all"&&c.dataset.cat!==t&&c.dataset.ae!==t));}

/* WD: spostato in dati/manuale.js */
function buildW(){document.getElementById("wgrid").innerHTML=WD.map(w=>`<div class="card" style="padding:1.2rem"><div style="font-family:'Cinzel',serif;font-size:.92rem;font-weight:700;color:var(--gold2);margin-bottom:.2rem">${w.n}</div><div style="display:inline-block;font-family:'Cinzel',serif;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;padding:.1rem .4rem;border:1px solid rgba(var(--gold-rgb),.3);color:var(--gold3);margin-bottom:.8rem">${w.t}</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:.2rem;margin-bottom:.75rem">${["Lv1-5","Lv6-10","Lv11-15","Lv16-20","Lv21-30"].map((l,i)=>`<div style="background:rgba(var(--gold-rgb),.04);padding:.28rem .22rem;text-align:center"><div style="font-family:'Cinzel',serif;font-size:.44rem;color:var(--text2)">${l}</div><div style="font-size:.78rem;color:var(--text)">${w.tr[i]}</div></div>`).join("")}</div><div style="font-family:'Cinzel',serif;font-size:.55rem;letter-spacing:.1em;color:var(--gold3);text-transform:uppercase;margin-bottom:.5rem">Cariche: ${w.ch}</div>${w.bm?`<div style="padding:.5rem 0 .55rem;border-bottom:1px solid rgba(var(--gold-rgb),.05)"><div style="font-family:'Cinzel',serif;font-size:.55rem;letter-spacing:.1em;color:var(--gold3);text-transform:uppercase;margin-bottom:.25rem">Bonus-move</div><div style="font-size:.8rem;color:var(--text2);line-height:1.5">${w.bm}</div></div>`:""}${w.sp.map(s=>`<div style="padding:.45rem 0;border-bottom:1px solid rgba(var(--gold-rgb),.05)"><div style="font-family:'Cinzel',serif;font-size:.7rem;color:var(--gold2);margin-bottom:.18rem">${s.n}</div><div style="font-size:.8rem;color:var(--text2);line-height:1.5">${s.d}</div></div>`).join("")}</div>`).join("");}

/* CD: spostato in dati/manuale.js */
function buildC(){let h="";for(const[cat,items] of Object.entries(CD)){h+=`<div class="cct" style="grid-column:1/-1">${cat}</div>`;h+=items.map(c=>`<div class="ccrd"><div class="cn">${c.n}</div><div class="cr"><span class="clbl">+3</span><span style="color:var(--text)">${c.p3}</span></div><div class="cr"><span class="clbl">+6</span><span style="color:var(--gold2)">${c.p6}</span></div></div>`).join("");}document.getElementById("cgrid").innerHTML=h;}
/* OD: spostato in dati/manuale.js */
function buildO(){document.getElementById("ogrid").innerHTML=OD.map(o=>`<div class="card" style="border-top:3px solid ${o.col}"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.7rem"><div class="ct">${o.n}</div><span class="tag ${o.tag}">${o.ae}</span></div><div style="font-size:.72rem;color:var(--text2);margin-bottom:.6rem">⚡ Costo: 12 Cariche Aetheriche</div>${o.eff.map(e=>`<div style="font-size:.8rem;color:var(--text2);margin-bottom:.4rem;padding-left:.7rem;border-left:2px solid ${o.col}44">${e}</div>`).join("")}</div>`).join("");}
/* AMPD: spostato in dati/manuale.js */
function buildAMP(){document.getElementById("ampbody").innerHTML=AMPD.map(a=>`<tr><td><strong>${a[0]}</strong></td><td>${a[1]}</td></tr>`).join("");}
/* PL_BEHEMOTHS: spostato in dati/plancia.js */

const PL_ELEMENTS=[{k:"Glaciale",c:"#7ec8e3"},{k:"Ardente",c:"#e05a20"},{k:"Folgorante",c:"#f0d020"},{k:"Terrestre",c:"#8b9d6b"},{k:"Radiante",c:"#d4a8ff"},{k:"Oscuro",c:"#a888d8"}];
const PL_MULTS=["1.2","1.3","1.4","1.5","1.8","1.9","2.0"];
const PL_STAT_ORDER=["FOR","DES","COST","INT","SAG","CAR"];
let plCounter=0;
let plState={};
function plAdd(){
  const id="pl"+(plCounter++);
  plState[id]={behIndex:0,mult:"1.5",pvCurrent:"",tokens:{},malus:{},brokenParts:{},variazioni:""};
  PL_ELEMENTS.forEach(e=>{plState[id].tokens[e.k]=0;plState[id].malus[e.k]=false;});
  plRender();
}
function plDel(id){sfxPlay("drop");delete plState[id];plRender();}
function plSetBeh(id,idx){plState[id].behIndex=parseInt(idx);plState[id].brokenParts={};plRender();}
function plSetMult(id,m){plState[id].mult=m;plRender();}
function plSetPvCur(id,v){plState[id].pvCurrent=v;}
function plSetVar(id,v){plState[id].variazioni=v;}
function plSetNumParts(id,v){let n=parseInt(v)||0;n=Math.max(0,Math.min(20,n));plState[id].numParts=n;Object.keys(plState[id].brokenParts).forEach(k=>{if(parseInt(k)>=n)delete plState[id].brokenParts[k];});plRender();}
function plSetToken(id,elem,val){const cur=plState[id].tokens[elem];plState[id].tokens[elem]=(cur===val)?val-1:val;const v=plState[id].tokens[elem];plState[id].malus[elem]=v>=10;plRender();}
function plToggleMalus(id,elem){plState[id].malus[elem]=!plState[id].malus[elem];sfxPlay(plState[id].malus[elem]?"on":"off");plRender();}
function plPartTog(id,i){var s=plState[id];s.brokenParts[i]=s.brokenParts[i]?0:1;sfxPlay(s.brokenParts[i]?"crack":"mend");plRender();}
function plPartStep(id,i,d){var s=plState[id];var p=PL_DROPS[PL_BEHEMOTHS[s.behIndex].nome].p[i];var mx=p.rg?999:p.q;var v=(s.brokenParts[i]||0)+d;s.brokenParts[i]=Math.max(0,Math.min(mx,v));plRender();}
function plPartsReset(id){sfxPlay("mend");plState[id].brokenParts={};plRender();}
function plEsc(x){return (""+x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function plRar(r){return "<span class='pl-rp "+r+"'>"+r+"</span>";}
/* PL_DROPS: spostato in dati/plancia.js */
function plDrops(id){
  var s=plState[id], dm=PL_DROPS[PL_BEHEMOTHS[s.behIndex].nome];
  if(!dm)return "";
  var parts=dm.p.map(function(p,i){
    var c=s.brokenParts[i]||0, ctrl;
    if(p.q===1 && !p.rg){
      ctrl="<div class='pl-dcchk"+(c?" on":"")+"' onclick=\"plPartTog('"+id+"',"+i+")\">"+(c?"\u2713":"")+"</div>";
    }else{
      var mx=p.rg?"\u267b":("/"+p.q);
      ctrl="<div class='pl-dcstep'><button onclick=\"plPartStep('"+id+"',"+i+",-1)\""+(c<=0?" disabled":"")+">\u2212</button><span>"+c+" <i>"+mx+"</i></span><button onclick=\"plPartStep('"+id+"',"+i+",1)\""+(c>=(p.rg?999:p.q)?" disabled":"")+">+</button></div>";
    }
    var fl=(p.cd?"<span class='pl-dcfl c' title='condizionale'>\u26a1</span>":"")+(p.rg?"<span class='pl-dcfl r' title='si rigenera'>\u267b</span>":"");
    var yl=p.y>1?" <b>\u00d7"+p.y+"</b>":"";
    return "<div class='pl-dcpart'>"+ctrl+"<div class='pl-dcinfo'><div class='pl-dcl'>"+plEsc(p.l)+(p.q>1?" \u00d7"+p.q:"")+fl+"</div><div class='pl-dcm'>"+plEsc(p.m)+yl+"</div></div></div>";
  }).join("");
  var agg={},order=[];
  dm.p.forEach(function(p,i){var c=s.brokenParts[i]||0;if(c<=0)return;if(!agg[p.m]){agg[p.m]={q:0,r:p.r};order.push(p.m);}agg[p.m].q+=c*(p.y||1);});
  var mats=order.length?order.map(function(n){return "<div class='pl-dcmat'><span>"+plEsc(n)+" <b>\u00d7"+agg[n].q+"</b></span>"+plRar(agg[n].r)+"</div>";}).join(""):"<div class='pl-dcempty'>Nessuna parte rotta \u2014 spunta le parti qui sopra.</div>";
  var kills=dm.k.map(function(k){return "<div class='pl-dckill'><span>"+plEsc(k.m)+"</span>"+plRar(k.r)+"</div>";}).join("");
  var notes=(dm.nt&&dm.nt.length)?"<div class='pl-dcnotes'>"+dm.nt.map(function(n){return "<div>"+plEsc(n)+"</div>";}).join("")+"</div>":"";
  return "<div class='pl-drops'><span class='pl-lbl' style='display:flex;justify-content:space-between;align-items:center'>Parti rotte &amp; Drop <button class='pl-dcreset' onclick=\"plPartsReset('"+id+"')\">Azzera parti</button></span><div class='pl-dcparts'>"+parts+"</div>"+notes+"<div class='pl-dcsub'>Materiali ottenuti</div><div class='pl-dcmats'>"+mats+"</div><div class='pl-dcsub'>Drop da Uccisione (casuali)</div>"+kills+"</div>";
}
function plRender(){const el=document.getElementById("pl-list");if(!el)return;el.innerHTML=Object.keys(plState).map(id=>plCard(id)).join("");}
function plCard(id){
  const s=plState[id];const beh=PL_BEHEMOTHS[s.behIndex];const pvMax=beh.pv[s.mult];
  const options=PL_BEHEMOTHS.map((b,i)=>`<option value="${i}" ${i===s.behIndex?"selected":""}>${b.nome}</option>`).join("");
  const multOpts=PL_MULTS.map(m=>`<option value="${m}" ${m===s.mult?"selected":""}>×${m} → ${beh.pv[m]} PV</option>`).join("");
  const statsHTML=PL_STAT_ORDER.map(sk=>{const val=beh.stats[sk];const bon=beh.bonus[sk];const bs=bon>=0?"+"+bon:bon;return `<div class="pl-stat"><div class="sk">${sk}</div><div class="sv">${val}</div><div class="sb">${bs}</div></div>`;}).join("");
  const tokensHTML=PL_ELEMENTS.map(e=>{const val=s.tokens[e.k];const on=s.malus[e.k];let dots="";for(let n=1;n<=10;n++){const filled=n<=val;const bg=filled?e.c:"rgba(0,0,0,.25)";const bd=filled?e.c:"rgba(255,255,255,.18)";dots+=`<button class="pl-dot" style="background:${bg};border-color:${bd}" onclick="plSetToken('${id}','${e.k}',${n})" title="${n}"></button>`;}return `<div class="pl-trow"><span class="pl-tname" style="color:${e.c}">${e.k}</span><div class="pl-tdots">${dots}</div><span class="pl-malus ${on?'on':''}" style="color:${e.c}" onclick="plToggleMalus('${id}','${e.k}')">Malus</span></div>`;}).join("");
  const dropsHTML=plDrops(id);
  return `<div class="pl-card">
    <div class="pl-head"><button type="button" class="pl-ico" onclick="plOpenPick('${id}')" title="Scegli un altro Behemoth" aria-label="Scegli un altro Behemoth">${typeof behIco==="function"?behIco(beh.nome):""}</button><select class="pl-title-sel" onchange="plSetBeh('${id}',this.value)">${options}</select><button class="pl-del" onclick="plDel('${id}')" title="Rimuovi">×</button></div>
    <div style="margin-bottom:.7rem;display:flex;gap:.35rem;flex-wrap:wrap"><span class="tag t-${beh.aether}">${beh.aether}</span>${typeof plCatTag==="function"?plCatTag(beh.nome):""}</div>
    <div style="margin-bottom:.9rem"><span class="pl-lbl">Statistiche</span><div class="pl-stats">${statsHTML}</div></div>
    <hr class="pl-sep">
    <div style="margin-bottom:.9rem"><span class="pl-lbl">Punti Vita</span><div class="pl-pv"><select onchange="plSetMult('${id}',this.value)">${multOpts}</select><div class="pl-pvmax"><div class="n">${pvMax}</div><div class="l">PV max</div></div><div class="pl-pvcur" style="display:flex;align-items:center;gap:.4rem"><span class="pl-lbl" style="margin:0">Attuali:</span><input type="text" inputmode="numeric" placeholder="${pvMax}" value="${s.pvCurrent}" oninput="plSetPvCur('${id}',this.value)"></div></div></div>
    <hr class="pl-sep">
    <div style="margin-bottom:.9rem"><span class="pl-lbl">Token Elementali (10 → malus)</span><div class="pl-tokens">${tokensHTML}</div></div>
    <hr class="pl-sep">
    ${dropsHTML}
    <hr class="pl-sep">
    <div><span class="pl-lbl">Variazioni / Note</span><textarea class="pl-var" placeholder="Modifiche, abilità speciali, condizioni particolari..." oninput="plSetVar('${id}',this.value)">${s.variazioni}</textarea></div>
  </div>`;
}


// ─── GENERATORE STATISTICHE UMANOIDI (Zona Master) ─────────────────────────
const NPC_STATS=[{k:"FOR",l:"Forza"},{k:"DES",l:"Destrezza"},{k:"COST",l:"Costituzione"},{k:"INT",l:"Intelligenza"},{k:"SAG",l:"Saggezza"},{k:"CAR",l:"Carisma"}];
let npcQty=1;
function npcMod(v){const m=Math.floor((v-10)/2);return m>=0?`+${m}`:`${m}`;}
function npcRollStats(level){
  const s={FOR:8,DES:8,COST:8,INT:8,SAG:8,CAR:8};
  const keys=Object.keys(s);
  for(let i=0;i<30;i++){const k=keys[Math.floor(Math.random()*keys.length)];s[k]+=1;}
  for(let lvl=2;lvl<=level;lvl+=2){const k=keys[Math.floor(Math.random()*keys.length)];s[k]+=2;}
  return s;
}
function npcStep(d){
  const inp=document.getElementById("npc-lvl");
  let v=parseInt(inp.value)+d;
  v=Math.max(1,Math.min(30,v));
  inp.value=v;
  npcSyncLvl();
}
function npcSyncLvl(){
  document.getElementById("npc-lvl-val").textContent=document.getElementById("npc-lvl").value;
}
function npcSetQty(q){
  npcQty=q;
  buildNpcQtyBtns();
}
function buildNpcQtyBtns(){
  const el=document.getElementById("npc-qty-btns");
  if(!el)return;
  el.innerHTML=[1,2,3,4,5,6].map(q=>`<button onclick="npcSetQty(${q})" style="flex:1;padding:.45rem;font-family:'Cinzel',serif;font-size:.7rem;border:1px solid ${q===npcQty?'var(--master)':'rgba(200,56,56,.2)'};background:${q===npcQty?'rgba(200,56,56,.15)':'transparent'};color:${q===npcQty?'var(--master2)':'#a08080'};cursor:pointer;transition:all .2s">${q}</button>`).join("");
}
function npcGenerate(){
  sfxPlay("dice");
  const level=parseInt(document.getElementById("npc-lvl").value);
  const role=document.getElementById("npc-role").value.trim()||"Umanoide";
  let html="";
  for(let i=0;i<npcQty;i++){
    const stats=npcRollStats(level);
    const costMod=Math.floor((stats.COST-10)/2);
    const hp=(5+costMod)*level;
    html+=`<div class="sc" style="animation:npcStamp .4s ease-out both;animation-delay:${i*70}ms">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
        <div style="flex:1;min-width:0"><span class="scl" style="margin-bottom:0">${role}</span></div>
        <div style="text-align:right;flex-shrink:0;margin-left:.6rem;display:flex;align-items:center;gap:.6rem">
          <div><div style="font-size:.5rem;color:#a06060;font-family:'Cinzel',serif;letter-spacing:.08em;text-transform:uppercase">HP</div><div style="font-size:1.3rem;color:var(--master2);font-family:'Cinzel Decorative',serif;line-height:1;font-weight:700">${hp}</div></div>
          <span style="font-family:'Cinzel',serif;font-size:.62rem;letter-spacing:.08em;border:1px solid var(--master);color:var(--master2);padding:.15rem .55rem">LV. ${level}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
        ${NPC_STATS.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:.45rem .65rem;background:rgba(255,255,255,.02);border:1px solid rgba(200,56,56,.1)">
          <span style="color:#a08080;font-size:.76rem">${s.l}</span>
          <span style="font-family:'Cinzel',serif;font-size:.85rem;color:var(--text)">${stats[s.k]} <b style="color:var(--master2)">${npcMod(stats[s.k])}</b></span>
        </div>`).join("")}
      </div>
      <div style="margin-top:.5rem;font-size:.68rem;color:#806060;font-style:italic">PV = (5 + bonus COST ${npcMod(stats.COST)}) × Lv.${level} = ${hp}</div>
    </div>`;
  }
  document.getElementById("npc-results").innerHTML=html;
}

const TR=[{n:1,b:"ly",nm:"Triade Radiante",t:"Nascita, inizio, luce pura"},{n:2,b:"ly",nm:"Triade Folgorante",t:"Scoperta, energia, espansione"},{n:3,b:"ly",nm:"Triade Ardente",t:"Conflitto, coraggio, passione"},{n:4,b:"ly",nm:"Triade Terrestre",t:"Stabilità, costruzione, prosperità"},{n:5,b:"ly",nm:"Triade Congelante",t:"Silenzio, attesa, gelo"},{n:6,b:"ly",nm:"Triade Oscura",t:"Crepuscolo, introspezione"},{n:"p",txt:"✦ Passaggio da Lyra a Kornos ✦",sub:"Giorno 30 Triade Oscura → Giorno 1 Triade Alborea"},{n:7,b:"ko",nm:"Triade Alborea",t:"Rinascita, memoria, chiarore dopo l'ombra"},{n:8,b:"ko",nm:"Triade Tuonante",t:"Turbolenza, prova, voce interiore"},{n:9,b:"ko",nm:"Triade Fiammeggiante",t:"Purificazione, rivoluzione"},{n:10,b:"ko",nm:"Triade Sporizzata",t:"Decomposizione, metamorfosi"},{n:11,b:"ko",nm:"Triade Algente",t:"Morte apparente, immobilità"},{n:12,b:"ko",nm:"Triade Foscomanto",t:"Oscurità totale, fine del ciclo"},{n:"p2",txt:"✦ Passaggio da Kornos a Lyra ✦",sub:"Giorno 30 Triade Foscomanto → Giorno 1 Triade Radiante"}];
function buildTR(){document.getElementById("trgrid").innerHTML=TR.map(t=>{if(t.n==="p"||t.n==="p2")return`<div class="tbanner" style="grid-column:1/-1">${t.txt}<br><span style="font-size:.8rem">${t.sub}</span></div>`;const badge=t.b==="ly"?`<div class="bly">🌕 Lyra</div>`:`<div class="bko">🌑 Kornos</div>`;return`<div class="trc"><div class="trn">${t.n}</div>${badge}<div class="trnm">${t.nm}</div><div class="trtm">${t.t}</div></div>`;}).join("");}

function swTab(id,btn){sfxPlay("swish");var _p=document.getElementById("p-"+id),_b=_p&&_p.closest(".bbox");if(_b)_b.scrollTop=0;document.querySelectorAll(".mtab").forEach(t=>t.classList.remove("active"));document.querySelectorAll(".mpanel").forEach(p=>p.classList.remove("active"));btn.classList.add("active");document.getElementById("p-"+id).classList.add("active");}
function swN(id,btn){document.querySelectorAll(".ntab").forEach(t=>t.classList.remove("active"));document.querySelectorAll(".npanel").forEach(p=>p.classList.remove("active"));btn.classList.add("active");document.getElementById("np-"+id).classList.add("active");}
function svN(ch){localStorage.setItem("tcj-n-"+ch,document.getElementById("n-"+ch).value);const b=document.getElementById("sv-"+ch);b.textContent="✓ Salvato";b.classList.add("saved");setTimeout(()=>{b.textContent="Salva";b.classList.remove("saved")},2000);}
function loadN(){["athena","panlan","asonnes"].forEach(c=>{const s=localStorage.getItem("tcj-n-"+c);if(s)document.getElementById("n-"+c).value=s;});}

const PW="Golden_Sun";
let mOpen=false;
function openpw(){if(mOpen){document.getElementById("ms").scrollIntoView({behavior:"smooth"});return;}document.getElementById("pwo").classList.add("open");if(window.__sfxLock){window.__sfxLock();}setTimeout(()=>document.getElementById("pwi").focus(),100);}
function closepw(){document.getElementById("pwo").classList.remove("open");document.getElementById("pwi").value="";document.getElementById("pwe").style.display="none";}
function chkpw(){if(document.getElementById("pwi").value===PW){mOpen=true;closepw();buildMBeh();buildMCards(MD,50,"grid-mael");buildMCards(AD,26,"grid-alti");buildMCards(MND,26,"grid-minori");playUnlock();}else{sfxPlay("deny");document.getElementById("pwe").style.display="block";document.getElementById("pwi").value="";document.getElementById("pwi").focus();}}
function playUnlock(){var ov=document.getElementById("munlock"),wrap=document.getElementById("sigilWrap");if(!ov||!wrap){revealMaster();return;}var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;wrap.classList.remove("gold","appear");document.getElementById("sigilSvg").style.opacity="";ov.style.display="flex";if(window.__sfxSigil){window.__sfxSigil();}requestAnimationFrame(function(){ov.classList.add("show");requestAnimationFrame(function(){wrap.classList.add("appear");});});if(reduce){setTimeout(function(){wrap.classList.add("gold");},350);setTimeout(revealMaster,1500);return;}setTimeout(function(){wrap.classList.add("gold");},2400);setTimeout(explodeSigil,4800);}
function explodeSigil(){var svg=document.getElementById("sigilSvg"),cv=document.getElementById("munlockCanvas");if(!svg||!cv){revealMaster();return;}if(window.__sfxBurst){window.__sfxBurst();}var rect=svg.getBoundingClientRect(),DPR=Math.min(window.devicePixelRatio||1,2),IW=window.innerWidth,IH=window.innerHeight;cv.width=IW*DPR;cv.height=IH*DPR;cv.style.width=IW+"px";cv.style.height=IH+"px";var ctx=cv.getContext("2d");ctx.setTransform(DPR,0,0,DPR,0,0);svg.style.transition="opacity .3s ease";svg.style.opacity="0";var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,ser=new XMLSerializer().serializeToString(svg),img=new Image();img.onload=function(){var w=Math.max(2,Math.round(rect.width)),h=Math.max(2,Math.round(rect.height)),sc=document.createElement("canvas");sc.width=w;sc.height=h;var sx=sc.getContext("2d");sx.drawImage(img,0,0,w,h);var data=null;try{data=sx.getImageData(0,0,w,h).data;}catch(e){data=null;}var parts=[];if(data){var step=Math.max(5,Math.round(Math.min(w,h)/42));for(var y=0;y<h;y+=step){for(var x=0;x<w;x+=step){if(data[(y*w+x)*4+3]>25){var px=rect.left+x,py=rect.top+y,dx=px-cx,dy=py-cy,dist=Math.sqrt(dx*dx+dy*dy)||1,ang=Math.atan2(dy,dx)+(Math.random()-0.5)*0.5,spd=2+Math.random()*5.5+(dist/Math.max(w,h))*8.5;parts.push({x:px,y:py,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-1.8,life:1,sz:2+Math.random()*3.8,rot:Math.random()*6.28,vr:(Math.random()-0.5)*0.32});}}}}var t0=null,fst=null;function fr(ts){if(t0===null){t0=ts;}var dt=Math.min((ts-t0)/16.7,3);t0=ts;if(fst===null){fst=ts;}var elp=(ts-fst)/1000;ctx.clearRect(0,0,IW,IH);ctx.globalCompositeOperation="lighter";if(elp<0.75){var kk=elp/0.75,fa=Math.pow(1-kk,1.6),rad=Math.max(IW,IH)*0.05+kk*Math.max(IW,IH)*0.5;var rg=ctx.createRadialGradient(cx,cy,rad*0.62,cx,cy,rad);rg.addColorStop(0,"rgba(255,240,200,0)");rg.addColorStop(0.82,"rgba(255,224,150,"+(0.26*fa)+")");rg.addColorStop(1,"rgba(255,210,120,0)");ctx.fillStyle=rg;ctx.beginPath();ctx.arc(cx,cy,rad,0,6.2832);ctx.fill();var cf=ctx.createRadialGradient(cx,cy,0,cx,cy,130);cf.addColorStop(0,"rgba(255,250,232,"+(0.55*fa)+")");cf.addColorStop(1,"rgba(255,240,200,0)");ctx.fillStyle=cf;ctx.beginPath();ctx.arc(cx,cy,130,0,6.2832);ctx.fill();}var alive=false;for(var n=0;n<parts.length;n++){var pt=parts[n];if(pt.life<=0){continue;}alive=true;pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;pt.vy+=0.08*dt;pt.vx*=0.99;pt.vy*=0.99;pt.life-=0.005*dt;pt.rot+=pt.vr*dt;var a=pt.life<0?0:pt.life;ctx.save();ctx.translate(pt.x,pt.y);ctx.rotate(pt.rot);ctx.globalAlpha=a;ctx.fillStyle=a>0.6?"#fff2cc":"#e8c463";ctx.fillRect(-pt.sz,-pt.sz,pt.sz*2,pt.sz*2);ctx.restore();}ctx.globalCompositeOperation="source-over";if(alive||elp<0.8){requestAnimationFrame(fr);}else{ctx.clearRect(0,0,IW,IH);}}requestAnimationFrame(fr);setTimeout(revealMaster,3000);};img.onerror=function(){setTimeout(revealMaster,200);};img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(ser);}
function revealMaster(){try{paRefresh();paTheme();slRender();if(mThemeActive())setTimeout(function(){sfxPlay("gong")},350);}catch(e){}var ov=document.getElementById("munlock"),ms=document.getElementById("ms"),b=document.getElementById("mbtn");if(b){b.textContent="\uD83D\uDD13 Master";b.classList.add("unlocked");}if(ms){ms.style.display="block";}if(ov){ov.classList.remove("show");setTimeout(function(){ov.style.display="none";var c=document.getElementById("munlockCanvas");if(c){var cc=c.getContext("2d");cc.setTransform(1,0,0,1,0,0);cc.clearRect(0,0,c.width,c.height);}var wrap=document.getElementById("sigilWrap");if(wrap){wrap.classList.remove("appear","gold");}var sg=document.getElementById("sigilSvg");if(sg){sg.style.opacity="";}},1300);}if(ms){setTimeout(function(){ms.scrollIntoView({behavior:"smooth"});},1550);}}
function updNav(){const ss=document.querySelectorAll("section[id]");const ls=document.querySelectorAll(".nav-links a");let cur="";ss.forEach(s=>{if(window.scrollY>=s.offsetTop-80)cur=s.id});ls.forEach(l=>l.classList.toggle("active",l.getAttribute("href")==="#"+cur));}
function swMN(id,btn){document.querySelectorAll("[id^='mnp-']").forEach(p=>p.style.display="none");document.getElementById("mnp-"+id).style.display="block";btn.parentElement.querySelectorAll(".ntab").forEach(t=>{t.style.borderColor="rgba(200,56,56,.2)";t.style.color="#a08080";});btn.style.borderColor="rgba(200,56,56,.5)";btn.style.color="#c08080";}
function svMN(tab){localStorage.setItem("tcj-mn-"+tab,document.getElementById("mn-"+tab).value);const b=document.getElementById("msv-"+tab);b.textContent="✓ Salvato";b.classList.add("saved");setTimeout(()=>{b.textContent="Salva";b.classList.remove("saved")},2000);}
function loadMN(){["generale","sessione","trame","npc"].forEach(t=>{const s=localStorage.getItem("tcj-mn-"+t);if(s)document.getElementById("mn-"+t).value=s;});}

function mod(v){const m=Math.floor((v-10)/2);return(m>=0?"+":"")+m;}
function renderStatCards(data,maxStat,containerId){const el=document.getElementById(containerId);if(!el)return;el.innerHTML=data.map(d=>{const sHtml=Object.entries(d.s).map(([k,v])=>{const pct=Math.round(v/maxStat*100);return`<div><div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-family:'Cinzel',serif;font-size:.52rem;letter-spacing:.08em;text-transform:uppercase;color:#a06060">${k}</span><span style="font-size:.78rem;color:var(--text)">${v} <span style="color:#906060;font-size:.68rem">(${mod(v)})</span></span></div><div style="height:2px;background:rgba(200,56,56,.1);border-radius:1px"><div style="height:100%;width:${pct}%;background:${d.ac};border-radius:1px;opacity:.75"></div></div></div>`;}).join("");const lvl=d.lv?`<div style="font-size:.58rem;color:#806060;margin-top:.15rem">Lv.${d.lv}</div>`:"";const wpn=d.wp?`<div style="font-size:.7rem;color:#907070;margin-top:.15rem">⚔ ${d.wp}</div>`:"";const art=d.ar?`<div style="font-size:.7rem;color:#907070">◈ ${d.ar}</div>`:"";const nt=d.nt?`<div style="font-size:.76rem;color:#907070;font-style:italic;border-top:1px solid rgba(200,56,56,.08);padding-top:.55rem;margin-top:.55rem">${d.nt}</div>`:"";return`<div style="background:rgba(200,56,56,.04);border:1px solid rgba(200,56,56,.12);border-top:3px solid ${d.ac};padding:1.1rem"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem"><div style="flex:1;min-width:0"><div style="font-size:.55rem;font-family:'Cinzel',serif;letter-spacing:.1em;text-transform:uppercase;color:${d.ac};margin-bottom:.15rem">${d.ae}</div><div style="font-family:'Cinzel',serif;font-size:.92rem;font-weight:700;color:var(--master2)">${d.nm}</div><div style="font-size:.72rem;color:#a08080;margin-top:.1rem">${d.rl}</div>${wpn}${art}${lvl}</div><div style="text-align:right;flex-shrink:0;margin-left:.75rem"><div style="font-size:.5rem;color:#a06060;font-family:'Cinzel',serif;letter-spacing:.08em;text-transform:uppercase">HP</div><div style="font-size:1.4rem;color:${d.ac};font-family:'Cinzel Decorative',serif;line-height:1;font-weight:700">${d.hp}</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem .75rem;border-top:1px solid rgba(200,56,56,.1);padding-top:.65rem">${sHtml}</div>${nt}</div>`;}).join("");}

function buildMCards(data,maxStat,containerId){const el=document.getElementById(containerId);if(!el)return;el.innerHTML=data.map(d=>{const sHtml=Object.entries(d.s).map(([k,v])=>{const pct=Math.round(v/maxStat*100);return`<div><div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-family:'Cinzel',serif;font-size:.52rem;letter-spacing:.08em;text-transform:uppercase;color:#a06060">${k}</span><span style="font-size:.78rem;color:var(--text)">${v} <span style="color:#906060;font-size:.68rem">(${mod(v)})</span></span></div><div style="height:2px;background:rgba(200,56,56,.1)"><div style="height:100%;width:${pct}%;background:${d.ac};opacity:.75"></div></div></div>`;}).join("");const wpn=(d.wf||d.wp)?`<div style="margin-top:.7rem;font-size:.76rem;color:#c09060">⚔ <strong style="color:var(--text)">${d.wf||d.wp}</strong></div>`:"";const mech=d.mech?d.mech.map(([k,v])=>`<div style="display:flex;gap:.5rem;margin-top:.3rem;font-size:.76rem"><span style="font-family:'Cinzel',serif;font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:#a06060;min-width:92px;flex-shrink:0;padding-top:.12rem">${k}</span><span style="color:var(--text2)">${v}</span></div>`).join(""):"";const art=d.ar?`<div style="margin-top:.7rem;font-size:.76rem;color:#c09060">◈ <strong style="color:var(--text)">${d.ar}</strong>${d.ad?` <span style="color:var(--text2);font-style:italic">— ${d.ad}</span>`:""}</div>`:"";const lvl=d.lv?`<div style="margin-top:.55rem;font-size:.62rem;color:#806060">Livello ${d.lv}</div>`:"";const quote=d.q?`<div style="margin-top:.55rem;padding:.5rem .65rem;background:rgba(200,56,56,.06);border-left:2px solid ${d.ac};font-size:.78rem;color:var(--text2);font-style:italic">${d.q}</div>`:"";const note=d.nt?`<div style="margin-top:.6rem;border-top:1px solid rgba(200,56,56,.1);padding-top:.55rem;font-size:.78rem;color:#a08080;font-style:italic">${d.nt}</div>`:"";return`<div class="mbcard" style="border-top:3px solid ${d.ac}${d.villain?';border:1px solid rgba(224,90,32,.4);border-top:3px solid #e05a20':''}"><div class="mbh" onclick="const x=this.nextElementSibling;x.style.display=x.style.display==='none'?'block':'none';this.querySelector('.mbtg').textContent=x.style.display==='none'?'▼':'▲'">${containerId!=="grid-mael"&&typeof maeIco==="function"?maeIco(d.nm):""}<div style="flex:1;min-width:0"><div style="font-size:.52rem;font-family:'Cinzel',serif;letter-spacing:.1em;text-transform:uppercase;color:${d.ac};margin-bottom:.15rem">${d.ae}</div><div style="font-family:'Cinzel',serif;font-size:.92rem;font-weight:700;color:var(--master2)">${d.nm}</div><div style="font-size:.72rem;color:#a08080;margin-top:.1rem">${d.rl}</div></div><div style="text-align:right;flex-shrink:0;margin-left:.6rem;display:flex;align-items:center;gap:.6rem"><div><div style="font-size:.5rem;color:#a06060;font-family:'Cinzel',serif;letter-spacing:.08em;text-transform:uppercase">HP</div><div style="font-size:1.3rem;color:${d.ac};font-family:'Cinzel Decorative',serif;line-height:1;font-weight:700">${d.hp}</div></div><span class="mbtg" style="color:#a06060;font-size:.72rem">▼</span></div></div><div style="display:none;margin-top:.7rem;border-top:1px solid rgba(200,56,56,.1);padding-top:.65rem"><div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem .75rem">${sHtml}</div>${wpn}${mech}${art}${lvl}${quote}${note}</div></div>`;}).join("");}
/* MD: spostato in dati/master-schede.js */
/* AD: spostato in dati/master-schede.js */
/* MND: spostato in dati/master-schede.js */


/* CONT_DATA: spostato in dati/continenti.js */

function showCont(id){
  const d=CONT_DATA[id];if(!d)return;
  if(id==="ramsgate")sfxPlay("bell");else sfxPlay("orb",id);
  // Nascondi tutti i label, mostra solo quello cliccato
  ["ardente","terrestre","folgorante","radiante","glaciale","oscuro","ramsgate"].forEach(k=>{
    const lbl=document.getElementById("lbl-"+k);
    if(lbl)lbl.style.opacity=k===id?"1":"0";
  });
  const p=document.getElementById("cont-panel");
  const icon=document.getElementById("cp-icon");
  icon.textContent=d.icon;
  icon.style.background=d.bg;
  document.getElementById("cp-title").textContent=d.name;
  document.getElementById("cp-title").style.color=d.color;
  document.getElementById("cp-cap").textContent=d.capital;
  document.getElementById("cp-ruler").textContent=d.ruler;
  document.getElementById("cp-lore").innerHTML=d.lore;
  const det=document.getElementById("cp-detail");
  if(d.detail){det.textContent=d.detail;det.style.display="block";}else{det.style.display="none";}
  p.classList.add("visible");
  // Scroll verso il pannello
  setTimeout(()=>p.scrollIntoView({behavior:"smooth",block:"nearest"}),50);
}
function closeCont(){
  sfxPlay("swish");
  ["ardente","terrestre","folgorante","radiante","glaciale","oscuro","ramsgate"].forEach(k=>{
    const lbl=document.getElementById("lbl-"+k);
    if(lbl)lbl.style.opacity="0";
  });
  const p=document.getElementById("cont-panel");
  p.classList.remove("visible");
}
function initMapClicks(){
  ["ardente","terrestre","folgorante","radiante","glaciale","oscuro","ramsgate"].forEach(id=>{
    const g=document.getElementById("isl-"+id);
    if(g)g.addEventListener("click",()=>showCont(id));
  });
}

window.addEventListener("load",()=>{buildBeh();buildW();buildC();buildO();buildAMP();buildTR();loadMN();mlLoad();scBuild();initMapClicks();try{document.querySelectorAll(".al-ov,.cr-ov").forEach(function(o){document.body.appendChild(o)});htlBuild();wmRoute();wmHoverInit();mlInit();calRender();}catch(e){console.error(e)}try{nvInit();nvToggleAll(localStorage.getItem("tcj_nv_all")==="1");}catch(e){}try{orbInit();orbSet("att",scGv("sc-natt-s"),true);orbSet("def",scGv("sc-ndef-s"),true);}catch(e){}buildNpcQtyBtns();plAdd();});
window.addEventListener("scroll",updNav,{passive:true});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closepw();});
