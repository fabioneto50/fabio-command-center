/* Dedicated dilution records. The source cards stay in place: no clinical text is cloned or rewritten. */
(()=>{
 'use strict';
 if(window.__fccDilutionsCardUXV5Installed)return;
 window.__fccDilutionsCardUXV5Installed=true;
 let host,grid,selected='',generation=0,scheduled=false;
 const cards=()=>[...grid.querySelectorAll(':scope > .ccd-doc-card')].filter(x=>x.dataset.cufSuperseded!=='1');
 const current=()=>window.FCCNavigation?.current()==='clinical'&&FCCNavigation.route().sub==='clin-perf';
 // Stable public identity, including formulation/brand for legacy entries. Two 32-bit hashes avoid long URLs.
 function recordId(card){
  const top=card.querySelector(':scope > .ccd-doc-top');
  const name=top?.querySelector('h3')?.textContent||'';
  const key=card.dataset.cufCurrent||card.dataset.cufDrug?'cuf|'+name:'legacy|'+name+'|'+(top?.querySelector('p')?.textContent||'');
  let a=2166136261,b=5381;for(const c of key){const n=c.codePointAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b,33)^n;}
  return 'd-'+(a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');
 }
 function filters(){return {q:document.getElementById('perfDilutionSearch').value,g:document.getElementById('ccdGroup').value,v:document.getElementById('ccdOnlyVerified').checked?'1':''};}
 function decorate(){
  for(const card of cards()){
   const top=card.querySelector(':scope > .ccd-doc-top'),details=card.querySelector(':scope > .ccd-doc-details');if(!top||!details)continue;
   const id=recordId(card),on=selected===id;card.dataset.fccRecordId=id;
   card.classList.toggle('fcc-record-selected',on);card.classList.toggle('ccd-card-open',on);
   if(details.open!==on)details.open=on;
   if(on){for(const a of ['role','tabindex','aria-expanded','aria-label'])top.removeAttribute(a);}
   else{top.setAttribute('role','button');top.tabIndex=0;top.setAttribute('aria-expanded','false');top.setAttribute('aria-label','Abrir ficha: '+(top.querySelector('h3')?.textContent||'medicação'));}
  }
 }
 function leave(){
  generation++;selected='';if(!host)return;
  host.dataset.fccDilutionView='list';host.dataset.fccRecordView='list';
  document.getElementById('fccDilutionBackBar').hidden=true;decorate();
 }
 function open(card,{route=true,focus=true}={}){
  if(!card||!current())return false;
  if(route){FCCNavigation.replaceFilters(filters());FCCNavigation.replaceDetail(recordId(card),false);}
  selected=recordId(card);host.dataset.fccDilutionView='detail';host.dataset.fccRecordView='detail';
  document.getElementById('fccDilutionBackBar').hidden=false;decorate();
  const title=card.querySelector('.ccd-doc-top h3');title.tabIndex=-1;
  document.title=title.textContent+' · Ficha de medicação';
  if(focus){window.scrollTo({top:0,behavior:'instant'});title.focus({preventScroll:true});}
  return true;
 }
 function back(){
  const id=selected,y=FCCNavigation.replaceDetail('',true);leave();
  const top=cards().find(x=>recordId(x)===id)?.querySelector('.ccd-doc-top');
  document.title='Perfusões e diluições · Fábio Command Center';
  const ticket=generation;requestAnimationFrame(()=>{if(ticket!==generation||!current()||selected)return;top?.focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});});
 }
 async function restoreRoute(route,{focus=false}={}){
  leave();const ticket=generation,f=route.filters||{};
  const input=document.getElementById('perfDilutionSearch'),group=document.getElementById('ccdGroup'),only=document.getElementById('ccdOnlyVerified');
  const q=String(f.q||''),g=[...group.options].some(x=>x.value===f.g)?f.g:'',v=f.v==='1';
  const changed=input.value!==q||group.value!==g||only.checked!==v;
  input.value=q;group.value=g;only.checked=v;if(changed)window.renderPerfDilutions();
  if(!route.ref){decorate();return true;}
  // Institutional enhancement follows the source renderer. Resolve the final card, not an earlier placeholder.
  const deadline=performance.now()+2500;
  do{
   await new Promise(r=>setTimeout(r,25));if(ticket!==generation||!current())return false;
   decorate();const found=cards().find(x=>recordId(x)===route.ref);
   if(found)return open(found,{route:false,focus});
  }while(performance.now()<deadline);
  FCCNavigation.replaceDetail('',true);FCCUI.notify('Ficha não encontrada. A lista continua disponível.','error');return false;
 }
 function install(){
  host=document.getElementById('clin-perf');grid=document.getElementById('perfDilutionGrid');if(!host||!grid)return false;
  const bar=document.createElement('div');bar.id='fccDilutionBackBar';bar.className='fcc-record-bar';bar.hidden=true;
  const button=document.createElement('button');button.id='fccDilutionBack';button.className='btn';button.type='button';button.textContent='← Voltar aos resultados';button.onclick=back;bar.append(button);grid.before(bar);
  const style=document.createElement('style');style.id='ccd-card-ux-v5-style';
  style.textContent='#perfDilutionGrid .ccd-doc-top{position:relative;cursor:pointer;padding:10px 32px 10px 10px;border:1px solid var(--line);border-radius:12px;outline:none}#perfDilutionGrid .ccd-doc-top:focus-visible{outline:3px solid var(--clinical);outline-offset:3px}#perfDilutionGrid .ccd-doc-top:after{content:"›";position:absolute;right:12px;top:16px;color:var(--clinical)}#perfDilutionGrid .fcc-record-selected>.ccd-doc-top:after{display:none}#perfDilutionGrid .ccd-doc-details>summary{display:none!important}';document.head.append(style);
  grid.addEventListener('click',e=>{const top=e.target.closest('.ccd-doc-top');if(!top||!grid.contains(top))return;e.preventDefault();const card=top.closest('.ccd-doc-card');if(selected!==recordId(card))open(card);});
  grid.addEventListener('keydown',e=>{const top=e.target.closest('.ccd-doc-top');if(!top||!grid.contains(top)||!['Enter',' '].includes(e.key))return;e.preventDefault();const card=top.closest('.ccd-doc-card');if(selected!==recordId(card))open(card);});
  new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorate();});}).observe(grid,{childList:true,subtree:true});
  for(const id of ['perfDilutionSearch','ccdGroup','ccdOnlyVerified']){
   const el=document.getElementById(id);el.addEventListener(id==='perfDilutionSearch'?'input':'change',()=>{if(!current())return;leave();FCCNavigation.replaceFilters(filters());});
  }
  window.FCCDilutionView=Object.freeze({restoreRoute,leave,back,open,recordId});decorate();return true;
 }
 let tries=0;const boot=()=>{if(install()||++tries>60)return;setTimeout(boot,120);};boot();
})();
