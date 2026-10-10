/* Nave: riserve ed equipaggiamento salvati nel browser */

    function nvReserve(k,delta){var e=document.getElementById("nv-res-"+k);if(!e)return;e.value=Math.max(0,(parseInt(e.value)||0)+delta);nvSave();}
    function nvSave(){try{var eq=document.getElementById("nv-equip-grande"),rd=document.getElementById("nv-res-disp"),re=document.getElementById("nv-res-equip");localStorage.setItem("tcj-nave",JSON.stringify({equip:eq?eq.value:"",disp:rd?rd.value:"0",resEquip:re?re.value:"0"}));}catch(e){}}
    function nvLoad(){try{var s=localStorage.getItem("tcj-nave");if(!s)return;var d=JSON.parse(s);var eq=document.getElementById("nv-equip-grande"),rd=document.getElementById("nv-res-disp"),re=document.getElementById("nv-res-equip");if(eq&&d.equip!==undefined)eq.value=d.equip;if(rd&&d.disp!==undefined)rd.value=d.disp;if(re&&d.resEquip!==undefined)re.value=d.resEquip;}catch(e){}}
    nvLoad();
    
/* Questo codice stava dentro la sezione: dopo averlo eseguito si toglie il richiamo dalla pagina, così la struttura resta identica */
document.currentScript.remove();
