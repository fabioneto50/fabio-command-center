/* Search uses canonical public data, not the current DOM or previously opened cards. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,fold=C.fold,esc=C.escapeHTML;
 let publicIndex=null,pending=null,sequence=0,timer=null,active=-1,hits=[];
 const aliases={pensos:'apositos',penso:'aposito',farmacos:'medicacao',farmaco:'medicacao',medicamentos:'medicacao',medicamento:'medicacao',norepinefrina:'noradrenalina',norepinephrine:'noradrenalina',epinefrina:'adrenalina',epinephrine:'adrenalina',acetaminophen:'paracetamol',paracetamol:'paracetamol'};
 const input=document.getElementById('globalSearch'),box=document.getElementById('globalResults');
 async function ensureIndex(){if(publicIndex)return publicIndex;if(!pending)pending=FCCModules.json('data/search-index.json').then(data=>{if(!Array.isArray(data))throw new Error('Índice inválido.');publicIndex=data.map(x=>({...x,folded:fold(x.title+' '+x.text+' '+x.type)}));return publicIndex;}).catch(e=>{pending=null;throw e;});return pending;}
 function privateEntries(){
  if(!FCCAccess.isUnlocked())return [];
  let state;try{state=JSON.parse(FCCStore.getItem('fcc-master-user-data-v1')||'{}');}catch{return [];}
  const entries=[];
  for(const [field,page,sub,type]of [['inventory','emergency','em-inv','Inventário'],['people','emergency','em-family','Família'],['locations','emergency','em-family','Locais'],['research','research','','Investigação'],['mods','garage','ga-mods','Acessórios']])for(const x of state[field]||[]){const title=x.name||x.title;if(title)entries.push({title,page,sub,type,ref:'',private:true,folded:fold(Object.values(x).join(' '))});}
  return entries;
 }
 function close(){box.classList.remove('open');input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
 function setActive(index){active=index;box.querySelectorAll('[role="option"]').forEach((el,i)=>el.setAttribute('aria-selected',String(i===index)));if(index>=0){input.setAttribute('aria-activedescendant','fcc-search-'+index);document.getElementById('fcc-search-'+index)?.scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');}
 const rank=(h,q)=>fold(h.title)===q?0:fold(h.title).startsWith(q)?1:fold(h.title).includes(q)?2:h.type==='Módulo'?3:4;
 async function search(){
  const token=++sequence,raw=fold(input.value),q=aliases[raw]||raw;
  if(!q){hits=[];box.replaceChildren();close();return;}
  box.classList.add('open');input.setAttribute('aria-expanded','true');input.setAttribute('aria-busy','true');box.innerHTML='<div role="presentation">A pesquisar…</div>';
  try{
   const base=await ensureIndex();if(token!==sequence)return;
   const moduleEntries=FCCNavigation.items('clinical').map(x=>({title:x.title,text:x.description,folded:fold(x.title+' '+x.description),type:'Módulo',page:'clinical',sub:x.id}));
   const terms=q.split(/\s+/).filter(Boolean);
   const matches=[...moduleEntries,...base,...privateEntries()].filter(h=>terms.every(term=>h.folded.includes(term)||fold(h.title).includes(term)));
   const seen=new Set();hits=matches.sort((a,b)=>rank(a,q)-rank(b,q)||a.title.localeCompare(b.title,'pt')).filter(x=>{const key=[x.type,x.page,x.sub,x.ref||x.title].join('|');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,30);
   box.innerHTML=hits.length?hits.map((h,i)=>`<div role="option" aria-selected="false" id="fcc-search-${i}" class="search-hit" data-index="${i}"><div><b>${esc(h.title)}</b><span>${esc(h.type)}${h.private?' · cofre local':''}</span></div></div>`).join(''):'<div role="presentation">Sem resultados. Experimenta o princípio ativo ou o nome do módulo.</div>';
   box.querySelectorAll('[data-index]').forEach(el=>{el.onpointerdown=e=>e.preventDefault();el.onclick=()=>open(+el.dataset.index);});
   setActive(-1);document.getElementById('fccSearchCount').textContent=`${hits.length} resultados apresentados${matches.length>30?' de '+matches.length:''}.`;
  }catch(e){if(token===sequence){hits=[];box.innerHTML='<div role="presentation">Pesquisa indisponível. Confirma a ligação ou o pacote offline e tenta novamente.</div>';document.getElementById('fccSearchCount').textContent='Não foi possível carregar o índice de pesquisa.';}}
  finally{if(token===sequence)input.removeAttribute('aria-busy');}
 }
 async function open(i){
  const h=hits[i];if(!h)return;if(h.private&&!FCCAccess.isUnlocked()){clearPrivate();return;}
  close();
  const ok=await FCCNavigation.navigate(h.page,{sub:h.sub||'',ref:h.page==='clinical'&&['clin-drugs','clin-cases'].includes(h.sub)?h.ref||'':''});
  if(!ok)return;
  if(h.sub==='clin-perf'){const q=document.getElementById('perfDilutionSearch');if(q){q.value=h.title;q.dispatchEvent(new Event('input',{bubbles:true}));}}
  if(h.sub==='clin-dressings'){const q=document.getElementById('pensoSearch');if(q){q.value=h.title;q.dispatchEvent(new Event('input',{bubbles:true}));}const card=[...document.querySelectorAll('#clin-dressings details')].find(x=>fold(x.textContent).includes(fold(h.title)));if(card)card.open=true;}
  if(h.sub==='clin-ivcompat'){const select=document.getElementById('ivcDrugA');const option=[...(select?.options||[])].find(x=>fold(x.value)===fold(h.title));if(option){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));}}
 }
 function clearPrivate(){sequence++;clearTimeout(timer);input.removeAttribute('aria-busy');hits=[];box.replaceChildren();input.value='';close();document.getElementById('fccSearchCount').textContent='';}
 function schedule(){clearTimeout(timer);timer=setTimeout(search,150);}
 if(!input||!box)return;
 input.removeAttribute('oninput');input.addEventListener('input',schedule);input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls','globalResults');input.setAttribute('aria-expanded','false');input.setAttribute('autocomplete','off');input.placeholder='Pesquisar medicação, módulos, pensos…';
 box.setAttribute('role','listbox');box.setAttribute('aria-label','Resultados da pesquisa');
 const counter=document.createElement('span');counter.id='fccSearchCount';counter.className='fcc-sr-only';counter.setAttribute('role','status');counter.setAttribute('aria-live','polite');input.after(counter);
 const clear=document.createElement('button');clear.type='button';clear.className='fcc-search-clear';clear.textContent='×';clear.setAttribute('aria-label','Limpar pesquisa');clear.onclick=()=>{clearPrivate();input.focus();};input.parentElement.append(clear);
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){close();return;}
  if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(!box.classList.contains('open')){search();return;}if(hits.length)setActive((active+(e.key==='ArrowDown'?1:-1)+hits.length)%hits.length);}
  if(e.key==='Enter'&&box.classList.contains('open')&&hits.length){e.preventDefault();open(active>=0?active:0);}
 });
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.globalbox'))close();});
 window.FCCSearch=Object.freeze({search,open,ensureIndex,clearPrivate,getHits:()=>hits.map(({folded,...h})=>h)});window.renderGlobalSearch=search;window.openSearchHit=open;
})();
