/* Local encrypted vault access. No shared PIN, hash, account or persistent key. */
(()=>{
 'use strict';
 const Store=FCCStore,UI=FCCUI;
 const PRIVATE=new Set(['personal','emergency','comms','garage','research','expenses']);
 let pending=null,lastActivity=Date.now(),unlocking=false,failures=0,waitUntil=0,generation=0;
 const unlockState=()=>Store.status().unlocked;
 function refreshState(){
  if(typeof window.fccReloadUserState==='function')window.fccReloadUserState();
  document.dispatchEvent(new CustomEvent('fcc-private-refresh',{detail:{unlocked:unlockState()}}));
  renderStatus();
 }
 function ask(run){
  if(unlockState())return typeof run==='function'?run():true;
  const nextAction=typeof run==='function'?run:null;
  const status=Store.status(),setup=!status.configured;
  const el=UI.make('fccVaultDialog',setup?'Proteger os dados deste dispositivo':'Desbloquear o cofre local',`
   <p>${setup?'Escolhe uma frase-passe com pelo menos 14 caracteres. O antigo PIN partilhado deixou de ser utilizado.':'A frase-passe abre apenas o cofre guardado neste navegador.'}</p>
   ${setup&&status.legacyKeys?'<div class="advice">Existem dados anteriores neste navegador. Serão cifrados e verificados antes de remover a cópia local sem cifragem. Não serão enviados para um servidor.</div>':''}
   <label for="fccVaultPass">Frase-passe<input id="fccVaultPass" type="password" autocomplete="${setup?'new-password':'current-password'}" minlength="14" maxlength="1024" spellcheck="false" autocapitalize="none"></label>
   ${setup?'<label for="fccVaultConfirm">Repetir frase-passe<input id="fccVaultConfirm" type="password" autocomplete="new-password" maxlength="1024" spellcheck="false" autocapitalize="none"></label><p class="tiny">Guarda esta frase-passe num gestor de palavras-passe. Não existe recuperação por e-mail: sem a frase-passe não será possível abrir o cofre nem as cópias cifradas. A migração não altera cópias antigas já exportadas.</p><label class="check"><input id="fccVaultAccept" type="checkbox"><span>Compreendo que preciso de guardar a frase-passe e uma cópia de segurança externa.</span></label>':''}
   <p class="tiny">A cifragem protege os dados guardados, não um dispositivo comprometido nem conteúdo acessível enquanto o cofre está aberto. Bloqueio automático após 5 minutos de inatividade.</p>
  `,[{label:'Cancelar',run:()=>{pending=null;UI.close();}},{label:setup?'Criar e migrar cofre':'Desbloquear',primary:true,id:'fccVaultSubmit',run:async dialog=>{
   if(Date.now()<waitUntil)throw new Error('Aguarda alguns segundos antes de voltar a tentar.');
   if(unlocking)return;unlocking=true;
   const ticket=generation,input=dialog.querySelector('#fccVaultPass');let pass=input.value;
   try{
    if(setup){if(pass!==dialog.querySelector('#fccVaultConfirm').value)throw new Error('As frases-passe não coincidem.');if(!dialog.querySelector('#fccVaultAccept').checked)throw new Error('Confirma que compreendes como recuperar os teus dados.');await Store.create(pass);}
    else await Store.unlock(pass);
    if(ticket!==generation||dialog.hidden){await Store.lock();pending=null;return;}
    input.value='';const confirm=dialog.querySelector('#fccVaultConfirm');if(confirm)confirm.value='';pass='';
    failures=0;lastActivity=Date.now();refreshState();const next=pending;pending=null;UI.close();if(next)await next();
   }catch(e){if(!setup){failures++;waitUntil=Date.now()+Math.min(30000,1000*2**Math.min(failures,5));}throw e;}finally{pass='';unlocking=false;}
  }}]);
  pending=nextAction;
  el.querySelector('#fccVaultPass').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.querySelector('#fccVaultSubmit').click();}});
  UI.open(el,'#fccVaultPass');return false;
 }
 async function lock(){
  if(!unlockState())return true;
  try{
   await Store.lock();pending=null;UI.close();
   window.FCCSearch?.clearPrivate?.();
   document.querySelectorAll('.page').forEach(page=>{
    if(PRIVATE.has(page.id.replace('page-',''))){
     page.querySelectorAll('input,textarea').forEach(x=>x.value='');
     page.querySelectorAll('.list,.tablewrap tbody,.personal-grid,.res-live-results').forEach(x=>x.replaceChildren());
    }
   });
   document.querySelectorAll('#iI,#iS,#iB,#iA,#iR,.modal input,.modal textarea').forEach(x=>x.value='');
   document.querySelectorAll('.fcc-dialog-backdrop').forEach(x=>x.remove());
   document.getElementById('isbarOut')?.replaceChildren();
   refreshState();
   if(PRIVATE.has(window.FCCNavigation?.current()))await window.fccNavigate('personal',{replace:true});
   UI.notify('Cofre bloqueado.');return true;
  }catch(e){UI.notify('Não foi possível bloquear sem perder alterações: '+e.message,'error');return false;}
 }
 async function run(fn){if(unlockState()){lastActivity=Date.now();return await fn();}return ask(fn);}
 function deferCall(name,args){
  const fields=[...document.querySelectorAll('.page.active input[id],.page.active select[id],.page.active textarea[id]')].map(el=>({id:el.id,value:el.value,checked:el.checked}));
  return ask(()=>{for(const item of fields){const el=document.getElementById(item.id);if(el){el.value=item.value;if(el.type==='checkbox')el.checked=item.checked;}}return window[name](...args);});
 }
 function renderStatus(){
  const el=document.getElementById('fccVaultStatus');if(!el)return;
  const s=Store.status();el.textContent=s.unlocked?'Cofre aberto neste separador':s.configured?'Cofre cifrado · bloqueado':s.legacyKeys?'Dados anteriores por migrar: define a frase-passe':'Cofre ainda não configurado';
  if(s.migrationWarning)el.textContent+=' · '+s.migrationWarning;
  const b=document.getElementById('fccVaultLock');if(b)b.hidden=!s.unlocked;
 }
 ['pointerdown','keydown'].forEach(type=>document.addEventListener(type,()=>{if(unlockState())lastActivity=Date.now();},{passive:true}));
 setInterval(()=>{if(unlockState()&&Date.now()-lastActivity>5*60*1000)lock();},15000);
 window.addEventListener('storage',e=>{if(e.key===Store.keys.vault)Store.checkExternalChange();});
 window.addEventListener('beforeunload',e=>{const s=Store.status();if(s.pending||s.error||s.conflict){e.preventDefault();e.returnValue='';}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&unlockState()&&Date.now()-lastActivity>5*60*1000)lock();});
 document.addEventListener('fcc-dialog-closed',e=>{if(e.detail?.id==='fccVaultDialog'){generation++;if(!unlocking)pending=null;}});
 window.fccPersonalUnlocked=unlockState;window.isFamilyUnlocked=unlockState;window.fccLockPersonal=lock;
 window.FCCAccess=Object.freeze({run,ask,lock,deferCall,isUnlocked:unlockState,isPrivate:page=>PRIVATE.has(page),refreshState});
})();
