/* Explicit offline packages; updates never reload a working form without consent. */
(()=>{
 'use strict';const U=FCCUI,esc=FCCCore.escapeHTML;let registration=null,manifest=null,initialized=false,reloading=false;
 function send(type,payload={}){return new Promise((resolve,reject)=>{const target=registration?.waiting||registration?.active||navigator.serviceWorker?.controller;if(!target)return reject(new Error('A preparação offline ainda não está pronta.'));const channel=new MessageChannel(),timer=setTimeout(()=>reject(new Error('Tempo de espera excedido. Tenta novamente.')),type==='CACHE_PACKAGE'?180000:8000);channel.port1.onmessage=e=>{if(e.data?.progress!==undefined){const status=document.getElementById('fccOfflineProgress');if(status)status.textContent='Preparar pacote: '+e.data.progress+' / '+e.data.total;return;}clearTimeout(timer);channel.port1.close();if(e.data?.error)reject(new Error(e.data.error));else resolve(e.data);};target.postMessage({type,...payload},[channel.port2]);});}
 const size=n=>(n/1024/1024).toFixed(2)+' MB';
 async function refresh(){
  const box=document.getElementById('fccOfflinePackages');if(!box)return;
  try{const data=await send('STATUS');manifest=data.manifest;box.innerHTML=Object.entries(data.packages).map(([key,p])=>`<div class="item"><div><strong>${esc(p.label)}</strong><p>${p.complete?'Disponível offline nesta versão':'Ainda não preparado'} · ${esc(size(p.bytes))} · ${p.files} recursos</p></div><button class="btn" data-pack="${esc(key)}" ${p.complete?'disabled':''}>${p.complete?'Preparado':'Preparar'}</button></div>`).join('');box.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>U.busy(b,async()=>{await send('CACHE_PACKAGE',{package:b.dataset.pack});await refresh();U.notify('Pacote verificado e disponível offline.');}));const info=document.getElementById('fccOfflineBuild');if(info)info.textContent='Recursos offline: '+data.build+'. Material externo e pesquisa de artigos necessitam de ligação.';}
  catch(e){box.textContent=e.message;}
 }
 function updateAvailable(){const b=document.getElementById('fccApplyUpdate');if(b)b.hidden=!registration?.waiting;}
 async function applyUpdate(){
  if(!registration?.waiting){U.notify('Não existe atualização pendente.');return;}
  const dialog=U.make('fccUpdateDialog','Aplicar nova versão','<p>Guarda primeiro o trabalho em curso. A página será recarregada e os campos que não tenham sido guardados serão limpos. Os dados do cofre não serão apagados.</p><p>A versão anterior de recursos offline é conservada. Não avances se ainda precisas dos resultados ou campos abertos.</p>',[{label:'Agora não',run:()=>U.close()},{label:'Atualizar e recarregar',primary:true,run:async()=>{const s=FCCStore.status();if(s.error||s.conflict)throw new Error('Resolve o erro de gravação ou exporta uma cópia antes de atualizar.');if(s.unlocked)await FCCStore.flush();reloading=true;U.close();registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}}]);U.open(dialog);
 }
 function installSettings(){
  const grid=document.querySelector('#page-settings > .grid');if(!grid||document.getElementById('fccOfflineCard'))return;
  const card=document.createElement('section');card.className='card full';card.id='fccOfflineCard';card.innerHTML='<h3>Modo offline e atualizações</h3><p>A base da aplicação é preparada automaticamente. Escolhe os restantes pacotes. Só aparece “Disponível” depois de todos os recursos serem descarregados e verificados.</p><p id="fccOfflineBuild"></p><div class="actions"><button class="btn" id="fccCheckUpdate">Verificar nova versão</button><button class="btn primary" id="fccApplyUpdate" hidden>Aplicar atualização</button><button class="btn" id="fccOfflineRefresh">Verificar pacotes</button></div><p id="fccOfflineProgress" role="status" aria-live="polite"></p><div id="fccOfflinePackages" class="list"></div>';grid.append(card);
  card.querySelector('#fccCheckUpdate').onclick=e=>U.busy(e.currentTarget,async()=>{await registration?.update();updateAvailable();U.notify(registration?.waiting?'Existe uma atualização pronta a aplicar.':'Verificação pedida. Uma atualização só é disponibilizada após validação dos recursos.');});card.querySelector('#fccApplyUpdate').onclick=applyUpdate;card.querySelector('#fccOfflineRefresh').onclick=refresh;
 }
 async function init(){
  if(initialized)return;initialized=true;installSettings();
  if(!('serviceWorker' in navigator)||!isSecureContext){document.getElementById('fccOfflinePackages').textContent='Modo offline indisponível neste contexto. O cofre não depende do service worker.';return;}
  try{registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{updateAvailable();if(worker.state==='activated'||worker.state==='installed')refresh();});});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)location.reload();else refresh();});updateAvailable();if(registration.active)refresh();else navigator.serviceWorker.ready.then(()=>refresh()).catch(()=>{});}
  catch(e){document.getElementById('fccOfflinePackages').textContent='Preparação offline indisponível. Os dados existentes não foram alterados.';}
 }
 window.FCCOffline=Object.freeze({init,refresh,send,applyUpdate});
})();
