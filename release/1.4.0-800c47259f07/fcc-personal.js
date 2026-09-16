/* Optional private editors. Existing stored records are kept; no owner details are hard-coded. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,esc=C.escapeHTML;
 const definitions={people:{label:'contacto',title:'Contactos',host:'em-family',fields:[['name','Nome'],['role','Relação / função'],['location','Local'],['contact','Contacto']]},locations:{label:'local',title:'Locais',host:'em-family',fields:[['name','Nome do local'],['type','Tipo'],['meet','Ponto de encontro'],['notes','Notas']]},nodes:{label:'nó',title:'Nós de comunicações',host:'co-nodes',fields:[['name','Nome'],['location','Local'],['hardware','Equipamento'],['band','Banda configurada'],['sensor','Sensor'],['antenna','Antena'],['firmware','Firmware'],['battery','Bateria'],['status','Estado']]}};
 function hostFor(type){const known=document.getElementById(definitions[type].host);return known||(type==='nodes'?document.getElementById('page-comms'):document.getElementById('em-family'));}
 function edit(type,id=''){
  return FCCAccess.run(()=>{
   const d=definitions[type],existing=id?(state[type]||[]).find(x=>x.id===id):null;if(id&&!existing)throw new Error('Registo inexistente.');
   const dialog=U.make('fccPersonalEditor',(id?'Editar ':'Adicionar ')+d.label,d.fields.map(([key,label])=>`<label>${esc(label)}<input id="fccEdit-${key}" data-field="${key}" maxlength="${key==='notes'?4000:400}" autocomplete="off" value="${esc(existing?.[key]||'')}"></label>`).join(''),[{label:'Guardar',primary:true,run:async el=>{if(!FCCAccess.isUnlocked())throw new Error('Cofre bloqueado.');const values=Object.fromEntries([...el.querySelectorAll('[data-field]')].map(x=>[x.dataset.field,x.value.trim()]));if(!values.name)throw new Error('O nome é obrigatório.');const row={...(existing||{}),...values,id:existing?.id||'p-'+crypto.randomUUID()};const list=state[type]||(state[type]=[]),i=list.findIndex(x=>x.id===row.id);if(i<0)list.push(row);else list[i]=row;await save();renderAll();render();U.close();U.notify('Registo guardado no cofre.');}}]);U.open(dialog);
  });
 }
 function remove(type,id){return FCCAccess.run(()=>{const d=definitions[type],row=state[type]?.find(x=>x.id===id);if(!row)return;const dialog=U.make('fccRemovePersonal','Eliminar '+d.label,`<p>Eliminar <strong>${esc(row.name)}</strong>? Os registos históricos associados não serão apagados.</p>`,[{label:'Cancelar',run:()=>U.close()},{label:'Eliminar registo',run:async()=>{state[type]=state[type].filter(x=>x.id!==id);await save();renderAll();render();U.close();U.notify('Registo eliminado.');}}]);U.open(dialog);});}
 function render(){
  for(const [type,d]of Object.entries(definitions)){
   const host=hostFor(type);if(!host)continue;let box=document.getElementById('fccManage-'+type);if(!box){box=document.createElement('section');box.id='fccManage-'+type;box.className='card full';host.append(box);}
   if(!FCCAccess.isUnlocked()){box.replaceChildren();continue;}
   box.innerHTML=`<div class="panel-title"><h3>Gerir ${esc(d.title.toLowerCase())}</h3><button class="btn" data-add="${type}">Adicionar ${esc(d.label)}</button></div><div class="list">${(state[type]||[]).map(x=>`<div class="item"><strong>${esc(x.name||'Sem nome')}</strong><div class="actions"><button class="btn" data-edit="${esc(x.id)}">Editar</button><button class="btn" data-remove="${esc(x.id)}">Eliminar</button></div></div>`).join('')||'<p>Sem registos. Os dados ficam apenas no cofre deste dispositivo.</p>'}</div>`;
   box.querySelector('[data-add]').onclick=()=>edit(type);box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit(type,b.dataset.edit));box.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>remove(type,b.dataset.remove));
  }
  document.querySelectorAll('#page-personal,#page-emergency,#page-comms,#page-garage,#page-research,#page-expenses').forEach(root=>{if(!root.querySelector(':scope > .fcc-lock-area')){const button=document.createElement('button');button.className='btn fcc-lock-area';button.type='button';button.textContent='Bloquear área pessoal';button.onclick=()=>FCCAccess.lock();root.prepend(button);}});
  window.fccRefreshPersonalHub?.();
 }
 document.addEventListener('fcc-private-refresh',render);document.addEventListener('fcc-page-change',e=>{if(FCCAccess.isPrivate(e.detail?.page))render();});window.FCCPersonal=Object.freeze({edit,remove,render});render();
})();
