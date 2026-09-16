/* Complete encrypted export and transactionally recoverable imports. */
(()=>{
 'use strict';const C=FCCCore,S=FCCStore,U=FCCUI,esc=C.escapeHTML;
 const download=(value,name)=>{const blob=new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
 async function exportAll(recovery=false){return FCCAccess.run(async()=>{const result=recovery?await S.emergencyBackup():await S.exportBackup();download(result,'FCC-cofre-completo-'+C.civilDate()+'.json');U.notify('Cópia cifrada preparada. Confirma que o ficheiro ficou guardado fora do navegador.');});}
 const summary=snap=>Object.entries(snap.records).map(([k,v])=>`<div class="item"><strong>${esc(S.registry.private[k]||S.registry.public[k]||k)}</strong><span>${new TextEncoder().encode(v).length.toLocaleString('pt-PT')} bytes</span></div>`).join('')||'<p>Esta cópia não contém registos.</p>';
 async function importFile(file){
  if(!file)return;return FCCAccess.run(async()=>{
   if(file.size>12e6)throw new Error('Ficheiro superior a 12 MB.');
   const envelope=C.parseJSON(await file.text());
   const protectedBackup=envelope.type==='fcc-complete-backup';
   let verified=null;
   const dialog=U.make('fccImportDialog','Verificar cópia antes de importar',`
    <p>O estado atual será preservado num ponto de recuperação cifrado. A importação só altera os dados depois da confirmação.</p>
    ${protectedBackup?'<label>Frase-passe da cópia<input id="fccBackupPass" type="password" autocomplete="current-password" maxlength="1024"></label>':'<div class="advice">Cópia antiga sem cifragem. Apenas os módulos nela existentes serão substituídos; despesas e outros módulos ausentes são preservados.</div>'}
    <div id="fccImportPreview" aria-live="polite"></div>
   `,[{label:'Verificar conteúdo',id:'fccBackupCheck',run:async el=>{
    const input=el.querySelector('#fccBackupPass');verified=await S.readBackup(envelope,input?.value||'');if(input)input.value='';
    el.querySelector('#fccImportPreview').innerHTML=summary(verified);
    el.querySelector('#fccBackupApply').disabled=false;
   }},{label:'Confirmar importação',primary:true,id:'fccBackupApply',run:async()=>{
    if(!verified)throw new Error('Verifica primeiro a cópia.');
    await S.transaction(verified,{merge:!!verified.legacy});verified=null;U.close();FCCAccess.refreshState();U.notify('Cópia importada e verificada. Ponto de recuperação disponível.');
   }}]);dialog.querySelector('#fccBackupApply').disabled=true;U.open(dialog);
  });
 }
 async function importExpenses(file){
  if(!file)return;return FCCAccess.run(async()=>{
   if(file.size>12e6)throw new Error('Ficheiro superior a 12 MB.');const data=C.parseJSON(await file.text());
   if(data.type==='fcc-complete-backup'||data.type==='fcc-master-backup')return importFile(file);
   if(!data||!Array.isArray(data.expenses))throw new Error('Cópia de despesas não reconhecida.');
   const snap=S.snapshot();snap.records['fcc-master-expenses-v1']=JSON.stringify(data);S.validateSnapshot(snap);
   const dialog=U.make('fccExpenseImportDialog','Confirmar importação de despesas',`<p>${data.expenses.length} movimentos. Esta cópia antiga não é cifrada. Os restantes módulos serão preservados e será criado um ponto de recuperação.</p>`,[{label:'Importar despesas',primary:true,run:async()=>{await S.transaction(snap);FCCAccess.refreshState();U.close();U.notify('Despesas importadas; estado anterior recuperável.');}}]);U.open(dialog);
  });
 }
 async function importPack(file){
  if(!file)return;return FCCAccess.run(async()=>{
   if(file.size>5e6)throw new Error('Pacote demasiado grande.');
   const pack=C.parseJSON(await file.text());if(pack.type!=='fcc-content-pack'||pack.schema!==1)throw new Error('Pacote de conteúdo incompatível.');
   const snap=S.snapshot();snap.records['fcc-master-content-pack-v1']=JSON.stringify(pack);S.validateSnapshot(snap);
   const dialog=U.make('fccPackDialog','Confirmar pacote de conteúdo',`<p>Versão: <strong>${esc(pack.version||'não indicada')}</strong>.</p><p>Esta operação não valida cientificamente as fontes. Serão atualizadas as referências e as listas suportadas pelo pacote; o catálogo e os casos canónicos não são substituídos.</p>`,[{label:'Aplicar pacote',primary:true,run:async()=>{await S.transaction(snap);FCCAccess.refreshState();U.close();U.notify('Pacote aplicado. Cópia anterior recuperável.');}}]);U.open(dialog);
  });
 }
 function reset(scope='all'){
  return FCCAccess.run(()=>{
   const labels={all:'todos os dados da aplicação',expenses:'apenas despesas e recorrências',preferences:'apenas preferências'};
   if(!labels[scope])throw new Error('Âmbito desconhecido.');
   const dialog=U.make('fccResetDialog','Repor '+labels[scope],`<p>Será criado um ponto de recuperação cifrado. Não serão apagados dados de outras aplicações neste domínio, nem a frase-passe deste cofre.</p><label>Escreve REPOR para confirmar<input id="fccResetConfirm" autocomplete="off"></label>`,[{label:'Cancelar',run:()=>U.close()},{label:'Repor',run:async el=>{if(el.querySelector('#fccResetConfirm').value!=='REPOR')throw new Error('Escreve REPOR para confirmar.');await S.reset(scope);FCCAccess.refreshState();U.close();U.notify('Dados repostos. A versão anterior pode ser recuperada.');}}]);U.open(dialog);
  });
 }
 async function recover(){return FCCAccess.run(()=>{const dialog=U.make('fccRecoveryDialog','Recuperar estado anterior','<p>O ponto de recuperação anterior substituirá os dados atuais. O estado atual ficará, por sua vez, recuperável.</p>',[{label:'Recuperar',primary:true,run:async()=>{await S.restorePrevious();FCCAccess.refreshState();U.close();U.notify('Estado anterior recuperado.');}}]);U.open(dialog);});}
 function support(){download({version:C.VERSION,generatedAt:new Date().toISOString(),tests:C.selfTests(),modules:window.FCCModules?.status?.(),scope:'Sem dados pessoais, pesquisas, notas, IDs de registos ou metadados do cofre.'},'FCC-diagnostico-sem-dados-pessoais.json');}
 function install(){
  const root=document.getElementById('page-settings');if(!root)return;
  const card=document.createElement('section');card.className='card full';card.id='fccDataCenter';card.innerHTML=`<h3>Cofre e recuperação</h3><p id="fccVaultStatus"></p><div class="actions"><button class="btn primary" id="fccVaultOpen">Desbloquear / configurar</button><button class="btn" id="fccVaultLock" hidden>Bloquear</button><button class="btn" id="fccCompleteExport">Exportar cópia completa</button><label class="btn">Importar cópia<input id="fccCompleteImport" type="file" accept="application/json,.json" hidden></label><button class="btn" id="fccRecovery">Recuperar estado anterior</button></div><details><summary>O que está incluído e limites</summary><p>Dados principais, despesas, recorrências, investigação, preparações, notas de material, progresso dos casos, preferências, favoritos e ordenação. Não inclui páginas externas, ficheiros que nunca foram guardados ou conteúdo de outros dispositivos.</p><p>A cópia é cifrada com a frase-passe do cofre. A gravação local não substitui uma cópia externa. Não introduzas dados identificáveis de utentes neste projeto pessoal.</p><button class="btn" id="fccEmergencyExport">Exportar cópia em memória após erro de gravação</button></details><details><summary>Reposição por âmbito</summary><div class="actions"><button class="btn" data-reset="preferences">Repor preferências</button><button class="btn" data-reset="expenses">Repor despesas</button><button class="btn" data-reset="all">Repor dados da aplicação</button></div></details>`;
  root.querySelector('.grid')?.prepend(card);
  const bind=(id,fn)=>document.getElementById(id).onclick=e=>U.busy(e.currentTarget,fn);
  bind('fccVaultOpen',()=>FCCAccess.ask());bind('fccVaultLock',()=>FCCAccess.lock());bind('fccCompleteExport',()=>exportAll());bind('fccEmergencyExport',()=>exportAll(true));bind('fccRecovery',recover);
  document.getElementById('fccCompleteImport').onchange=e=>{importFile(e.target.files?.[0]).catch(x=>U.notify(x.message,'error'));e.target.value='';};
  card.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>reset(b.dataset.reset));
  FCCAccess.refreshState();
 }
 window.FCCBackup=Object.freeze({exportAll,importFile,importExpenses,importPack,reset,recover,support,install});
})();
