/* Shared validation at the clinical input boundary. Public calculations are not persisted. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,esc=C.escapeHTML;
 const infIds=['infDrug','infAmount','infAmountUnit','infVol','infWt','infDU','infDose','infRate'];
 const val=id=>document.getElementById(id)?.value??'';
 const fieldNames={'quantidade':'infAmount','volume':'infVol','peso':'infWt','dose':'infDose','débito':'infRate','unidade da dose':'infDU','unidade da quantidade':'infAmountUnit'};
 const results={
  analyzeVent:['ventSummary','ventMetrics','ventAdvice'],analyzeECG:['ecgResult'],calcHemo:['hemoResult'],calcPF:['pfResult'],analyzeABG:['abgResult','abgExtra'],analyzeElectrolytes:['elecResult'],calcCorrectedNa:['cnResult'],analyzeStroke:['strokeResult'],calcCRRT:['crResult'],calcCrCl:['cgResult'],calcOsm:['osResult'],calcBody:['boResult'],calcGCS:['gResult'],calcBPS:['bpsResult'],calcCPOT:['cpotResult'],calcFSPL:['rfResult'],calcLink:['linkResult']
 };
 // r=required; bounds are computational domains, not claims of normal clinical values.
 const config={
  analyzeVent:{vHeight:{r:true,min:80,max:250},vVt:{r:true,min:0,x:true},vRR:{r:true,min:0,x:true},vPEEP:{r:true,min:0},vTotalPEEP:{min:0},vPplat:{min:0,x:true},vPpeak:{min:0,x:true},vFiO2:{r:true,min:21,max:100},vSpO2:{min:0,max:100},vPH:{min:0,max:14,x:true},vCO2:{min:0,x:true},vO2:{min:0,x:true},vHCO3:{min:0,x:true},vLac:{min:0},vBE:{},vTi:{min:0,x:true}},
  analyzeECG:{eRate:{r:true,min:0,x:true},eQRS:{r:true,min:0,x:true},ePR:{min:0,x:true},eQTc:{min:0,x:true}},
  calcHemo:{hSBP:{r:true,min:0,x:true},hDBP:{r:true,min:0,x:true},hHR:{r:true,min:0,x:true}},
  calcPF:{pfO2:{r:true,min:0,x:true},pfFi:{r:true,min:21,max:100}},
  analyzeABG:{aPH:{r:true,min:0,max:14,x:true},aCO2:{r:true,min:0,x:true},aHCO3:{r:true,min:0,x:true},aNa:{min:0,x:true},aCl:{min:0,x:true},aAlb:{min:0,x:true}},
  analyzeElectrolytes:{elNa:{r:true,min:0,x:true},elK:{r:true,min:0,x:true},elCa:{min:0,x:true},elCr:{min:0,x:true}},
  calcCorrectedNa:{cnNa:{r:true,min:0,x:true},cnGlu:{r:true,min:0,x:true},cnFactor:{r:true,min:0,x:true}},
  analyzeStroke:{stHours:{r:true,min:0},stNIHSS:{min:0,max:42},stSBP:{r:true,min:0,x:true},stDBP:{r:true,min:0,x:true}},
  calcCRRT:{crWt:{r:true,min:0,x:true},crD:{r:true,min:0},crR:{r:true,min:0},crU:{r:true,min:0}},
  calcCrCl:{cgAge:{r:true,min:18,max:130},cgWt:{r:true,min:0,x:true},cgCr:{r:true,min:0,x:true}},
  calcOsm:{osNa:{r:true,min:0,x:true},osGlu:{r:true,min:0,x:true},osBun:{r:true,min:0}},
  calcBody:{boWt:{r:true,min:0,x:true},boHt:{r:true,min:0,x:true}},
  calcGCS:{gE:{r:true,min:1,max:4},gV:{r:true,min:1,max:5},gM:{r:true,min:1,max:6}},
  calcBPS:{b1:{r:true,min:1,max:4},b2:{r:true,min:1,max:4},b3:{r:true,min:1,max:4}},
  calcCPOT:{c1:{r:true,min:0,max:2},c2:{r:true,min:0,max:2},c3:{r:true,min:0,max:2},c4:{r:true,min:0,max:2}},
  calcFSPL:{rfDist:{r:true,min:0,x:true},rfFreq:{r:true,min:0,x:true}},
  calcLink:{rfTx:{r:true},rfGT:{r:true},rfGR:{r:true},rfLoss:{r:true,min:0},rfPL:{r:true},rfSens:{r:true}}
 };
 function clear(ids,message='Os dados foram alterados. Calcula novamente.'){
  for(const id of ids){const el=document.getElementById(id);if(!el)continue;el.dataset.valid='false';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.innerHTML=`<div class="subtext">${esc(message)}</div>`;}
 }
 function label(id){const el=document.getElementById(id);return el?.closest('label')?.childNodes?.[0]?.textContent?.trim()||el?.getAttribute('aria-label')||id;}
 function validate(name){
  const defs=config[name];if(!defs)return true;
  clear(results[name]||[],'');
  for(const id of Object.keys(defs))U.fieldError(document.getElementById(id),'');
  let current='';
  try{
   const parsed={};for(const [id,o]of Object.entries(defs)){current=id;parsed[id]=C.number(val(id),label(id),{required:!!o.r,min:o.min,max:o.max,exclusiveMin:!!o.x});}
   if(name==='calcHemo'&&parsed.hSBP<parsed.hDBP)throw new C.ValidationError('pressão arterial','A pressão sistólica não pode ser inferior à diastólica.');
   if(name==='analyzeStroke'&&parsed.stSBP<parsed.stDBP)throw new C.ValidationError('pressão arterial','A pressão sistólica não pode ser inferior à diastólica.');
   if(name==='analyzeVent'&&parsed.vPplat!==null&&document.getElementById('vPlateauValid')?.checked&&document.getElementById('vPassive')?.checked&&parsed.vPplat<=(parsed.vTotalPEEP??parsed.vPEEP))throw new C.ValidationError('Pplat','Pplat deve ser superior à PEEP usada para calcular a mecânica estática.');
   if(name==='analyzeECG'&&!val('eReg')){current='eReg';throw new C.ValidationError('regularidade','Seleciona a regularidade do ritmo.');}
   (results[name]||[]).forEach(id=>{const el=document.getElementById(id);if(el)el.dataset.valid='true';});return true;
  }catch(e){clear(results[name]||[],e.message);U.fieldError(document.getElementById(current),e.message);return false;}
 }
 function convert(direction){
  infIds.forEach(id=>U.fieldError(document.getElementById(id),''));
  try{
   const output=C.infusion({amount:val('infAmount'),amountUnit:val('infAmountUnit'),volume:val('infVol'),weight:val('infWt'),doseUnit:val('infDU'),value:val(direction==='doseToRate'?'infDose':'infRate')},direction);
   const target=document.getElementById(direction==='doseToRate'?'infRate':'infDose');
   const precision=direction==='doseToRate'?4:6;
   const displayed=Number(output.value.toFixed(precision));
   if(output.value>0&&displayed===0)throw new C.ValidationError('resultado','Valor inferior à precisão apresentada. Rever a preparação e usar cálculo com precisão apropriada.');
   target.value=displayed;
   const root=document.getElementById('infResult');root.dataset.valid='true';root.setAttribute('role','status');root.setAttribute('aria-live','polite');root.innerHTML=`<div class="big">${esc(displayed.toLocaleString('pt-PT',{maximumFractionDigits:precision}))} ${esc(output.unit)}</div><div class="subtext">${esc(val('infDrug'))} · ${esc(output.concentration.toLocaleString('pt-PT',{maximumSignificantDigits:8}))} ${esc(output.concentrationUnit)}. Volume final ${esc(val('infVol'))} mL. Confirma apresentação, concentração e unidade; o débito não é uma prescrição.</div>`;
   return output;
  }catch(e){clear(['infResult'],e.message);U.fieldError(document.getElementById(fieldNames[e.field]||'infAmount'),e.message);return null;}
 }
 function sepsis(){
  const ids={weight:'sWt',age:'sAge',map:'sMAP',lactate:'sLac',urine:'sUrine',crt:'sCRT'};
  Object.values(ids).forEach(id=>U.fieldError(document.getElementById(id),''));
  try{const result=C.sepsis({...Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,val(id)])),shock:val('sShock')});const root=document.getElementById('sepsisResult');root.dataset.valid='true';root.setAttribute('role','status');root.setAttribute('aria-live','polite');root.innerHTML=result.alerts.map(a=>`<div class="${a.level==='bad'?'redflag':'advice'}"><strong>${esc(a.title)}</strong><p>${esc(a.text)}</p></div>`).join('');return result;}
  catch(e){clear(['sepsisResult'],e.message);return null;}
 }
 document.addEventListener('input',onEdit);document.addEventListener('change',onEdit);
 function onEdit(e){
  const id=e.target.id;if(!id)return;
  if(id==='infDrug'){const defaults={Noradrenalina:'mcgkgmin',Adrenalina:'mcgkgmin',Dobutamina:'mcgkgmin',Dopamina:'mcgkgmin',Propofol:'mgkgh',Dexmedetomidina:'mcgkgh',Alfentanil:'mcgkgh',Remifentanil:'mcgkgmin',Rocurónio:'mcgkgmin',Insulina:'uih',Heparina:'uih',Amiodarona:'mgh'};const du=document.getElementById('infDU');if(du&&defaults[e.target.value])du.value=defaults[e.target.value];['infAmount','infDose','infRate'].forEach(k=>{const el=document.getElementById(k);if(el)el.value='';});clear(['infResult'],'Fármaco alterado. Introduz e confirma a nova preparação.');}

  if(infIds.includes(id)){if(document.getElementById('infResult')?.dataset.valid==='true')clear(['infResult']);U.fieldError(e.target,'');}
  if(['sWt','sAge','sMAP','sLac','sUrine','sCRT','sShock'].includes(id)&&document.getElementById('sepsisResult')?.dataset.valid==='true')clear(['sepsisResult']);
  for(const [name,defs]of Object.entries(config))if(Object.hasOwn(defs,id)||(name==='analyzeVent'&&['vMode','vSex','vPassive','vPlateauValid'].includes(id))||(name==='analyzeStroke'&&['stBleed','stLVO','stDOAC'].includes(id))||(name==='analyzeECG'&&['eReg','eP','eST','eSymptoms','eLeads'].includes(id)))if((results[name]||[]).some(r=>document.getElementById(r)?.dataset.valid==='true'))clear(results[name]);
 }
 function finish(name){const ids=results[name]||[];if(ids.some(id=>/\b(?:NaN|Infinity)\b/.test(document.getElementById(id)?.textContent||''))){clear(ids,'Não foi possível obter um resultado finito. Revê os valores e as unidades.');return false;}return true;}
 window.FCCClinical=Object.freeze({validate,convert,sepsis,clear,config,finish});
})();
