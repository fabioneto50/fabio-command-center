/* Shared accessible interface primitives. Content strings are escaped at their boundary. */
(()=>{
 'use strict';
 const C=FCCCore,esc=C.escapeHTML;
 let active=null,returnFocus=null,priorInert=[],scrollBefore='';
 const focusable=root=>[...root.querySelectorAll('button:not([disabled]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(e=>e.getClientRects().length&&!e.closest('[inert]'));
 function close(){
  if(!active)return;
  const old=active;active=null;
  old.querySelectorAll('input[type=password]').forEach(x=>x.value='');
  old.classList.remove('open');old.hidden=true;old.inert=true;
  for(const [el,value]of priorInert)el.inert=value;
  priorInert=[];document.body.style.overflow=scrollBefore;
  if(returnFocus?.isConnected&&!returnFocus.closest('[inert]'))returnFocus.focus({preventScroll:true});
  returnFocus=null;document.dispatchEvent(new CustomEvent('fcc-dialog-closed',{detail:{id:old.id}}));
 }
 function open(el,first){
  if(typeof el==='string')el=document.getElementById(el);
  if(!el)return false;
  close();returnFocus=document.activeElement;active=el;scrollBefore=document.body.style.overflow;
  if(el.parentElement!==document.body)document.body.append(el);
  el.hidden=false;el.inert=false;el.classList.add('open');
  const dialog=el.matches('[role="dialog"]')?el:el.querySelector('[role="dialog"]')||el;
  dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.tabIndex=-1;
  if(!dialog.hasAttribute('aria-labelledby')&&!dialog.hasAttribute('aria-label')){
   const h=dialog.querySelector('h2,h3');if(h){h.id=h.id||el.id+'-title';dialog.setAttribute('aria-labelledby',h.id);}else dialog.setAttribute('aria-label','Janela de diálogo');
  }
  priorInert=[...document.body.children].filter(n=>n!==el&&!['SCRIPT','STYLE'].includes(n.tagName)).map(n=>[n,n.inert]);
  priorInert.forEach(([n])=>n.inert=true);document.body.style.overflow='hidden';
  (typeof first==='string'?el.querySelector(first):first||focusable(el)[0]||dialog)?.focus({preventScroll:true});
  return true;
 }
 document.addEventListener('keydown',e=>{
  if(!active)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key==='Tab'){
   const list=focusable(active),i=list.indexOf(document.activeElement);
   if(!list.length){e.preventDefault();(active.querySelector('[role=dialog]')||active).focus();return;}
   if((!e.shiftKey&&i===list.length-1)||(e.shiftKey&&i<=0)||i===-1){e.preventDefault();(e.shiftKey?list.at(-1):list[0]).focus();}
  }
 },true);
 document.addEventListener('focusin',e=>{if(active&&!active.contains(e.target))(focusable(active)[0]||active.querySelector('[role=dialog]')||active).focus();});
 function make(id,title,body,actions=[]){
  let el=document.getElementById(id);if(el===active)close();if(!el){el=document.createElement('div');el.id=id;el.className='fcc-dialog-backdrop';el.hidden=true;el.inert=true;document.body.append(el);}
  el.innerHTML=`<section class="fcc-dialog" role="dialog" aria-modal="true" aria-labelledby="${esc(id)}-title"><div class="fcc-dialog-head"><h2 id="${esc(id)}-title">${esc(title)}</h2><button type="button" class="btn fcc-close" aria-label="Fechar janela">×</button></div><div class="fcc-dialog-body">${body}</div><div class="fcc-dialog-error" role="alert"></div><div class="actions fcc-dialog-actions"></div></section>`;
  el.querySelector('.fcc-close').onclick=close;
  el.onclick=e=>{if(e.target===el)close();};
  for(const a of actions){const b=document.createElement('button');b.type='button';b.className='btn'+(a.primary?' primary':'');b.textContent=a.label;if(a.id)b.id=a.id;b.onclick=()=>busy(b,()=>a.run(el));el.querySelector('.fcc-dialog-actions').append(b);}
  return el;
 }
 function error(el,message){const target=el?.querySelector?.('.fcc-dialog-error')||el;if(target){target.textContent=String(message||'');target.setAttribute('role','alert');}}
 async function busy(button,run){
  if(button.disabled)return;button.disabled=true;button.setAttribute('aria-busy','true');
  try{return await run();}catch(e){const target=button.closest('.fcc-dialog-backdrop');if(target)error(target,e.message||'Não foi possível concluir.');else notify(e.message||'Não foi possível concluir.','error');return false;}finally{button.disabled=false;button.removeAttribute('aria-busy');}
 }
 let noticeTimer;
 function notify(message,kind='info'){
  const el=document.getElementById('toast');if(!el)return;
  el.setAttribute('role',kind==='error'?'alert':'status');el.setAttribute('aria-live',kind==='error'?'assertive':'polite');el.textContent=String(message);el.classList.add('show');
  clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),kind==='error'?12000:4000);
 }
 function fieldError(input,message){
  if(!input)return;const id=input.id+'-error';let msg=document.getElementById(id);
  if(!msg){msg=document.createElement('span');msg.id=id;msg.className='fcc-field-error';input.after(msg);}
  msg.textContent=message||'';input.setAttribute('aria-invalid',message?'true':'false');
  if(message){input.setAttribute('aria-describedby',id);input.focus({preventScroll:true});}else if(input.getAttribute('aria-describedby')===id)input.removeAttribute('aria-describedby');
 }
 function status(){
  let el=document.getElementById('fccSaveStatus');if(!el){el=document.createElement('div');el.id='fccSaveStatus';el.className='fcc-storage-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.append(el);}return el;
 }
 let saveNoticeTimer;
 window.addEventListener('fcc-storage-status',e=>{
  const d=e.detail||{},el=status();clearTimeout(saveNoticeTimer);el.hidden=d.status==='locked';el.dataset.state=d.status;
  el.textContent=d.status==='saving'?'A guardar no cofre…':d.status==='error'?'Não guardado: '+d.error:d.status==='saved'?'Guardado no cofre local':'Cofre bloqueado';
  if(d.status==='error'){el.setAttribute('role','alert');el.setAttribute('aria-live','assertive');}else{el.setAttribute('role','status');el.setAttribute('aria-live','polite');}
  if(d.status==='saved')saveNoticeTimer=setTimeout(()=>{if(el.dataset.state==='saved')el.hidden=true;},4000);
 });
 const init=()=>{
  document.querySelectorAll('.modal').forEach(el=>{el.hidden=!el.classList.contains('open');el.inert=el.hidden;});
  document.querySelectorAll('input,select,textarea').forEach(el=>{
   if(el.type==='hidden'||el.closest('label')||el.getAttribute('aria-label')||el.labels?.length)return;
   const label=el.placeholder||el.id||'Campo';el.setAttribute('aria-label',label);
  });
  const search=document.getElementById('globalSearch');if(search)search.setAttribute('aria-label','Pesquisar no Command Center');
  status();
 };
 window.FCCUI=Object.freeze({open,close,make,error,busy,notify,fieldError,esc,focusable,active:()=>active,init});
 init();
})();
