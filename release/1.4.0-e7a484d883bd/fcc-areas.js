/* Area landing pages: entering an area never chooses or opens a module. */
(()=>{
 'use strict';const C=FCCCore,esc=C.escapeHTML;
 const privateAreas=[
  {id:'expenses',title:'Despesas',description:'Registos, análises e orçamento.',icon:'wallet'},
  {id:'emergency',title:'Emergência',description:'Preparação, inventário e contactos.',icon:'shield'},
  {id:'comms',title:'Comunicações',description:'Rádio, nós e telemetria.',icon:'radio'},
  {id:'garage',title:'Veículos',description:'Manutenção, custos e documentos.',icon:'vehicle'},
  {id:'research',title:'Investigação',description:'Biblioteca e pesquisa de evidência.',icon:'book'},
  {id:'notes',page:'emergency',sub:'em-notes',title:'Notas',description:'O teu plano e notas de preparação.',icon:'book'}
 ];
 const paths={
  home:'M3 10.5 12 3l9 7.5M5 9v12h5v-7h4v7h5V9',
  clinical:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z',
  personal:'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  favorites:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  droplet:'M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12ZM9 17a3 3 0 0 0 3 2',
  medication:'m9 4-5 5a6 6 0 0 0 8 8l5-5a6 6 0 0 0-8-8ZM7 6l8 8',
  link:'m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M12 9l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  pulse:'M2 12h5l3-8 4 16 3-8h5',
  wind:'M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3',
  calculator:'M5 3h14v18H5ZM8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 3h1m6 0h1',
  book:'M12 5c-3-2-7-2-10-1v16c3-1 7-1 10 1m0-16c3-2 7-2 10-1v16c-3-1-7-1-10 1Zm0 0v16',
  shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM8 12l3 3 5-6',
  wallet:'M3 6h17v15H3V6Zm0 0 14-3v3m3 5h-6v5h6m-3-2.5h.01',
  radio:'M8 18h8M10 14h4M12 10v10M5 14a10 10 0 0 1 0-12m14 12a10 10 0 0 0 0-12M8 11a6 6 0 0 1 0-6m8 6a6 6 0 0 0 0-6',
  vehicle:'m5 7 2-4h10l2 4M3 10l2-3h14l2 3v8H3ZM5 18v3m14-3v3M6 13h2m8 0h2',
  layers:'m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  arrow:'M19 12H5m6-6-6 6 6 6',
  chevron:'m9 5 7 7-7 7',
  grid:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
  search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-2 4 7 7',
  sliders:'M4 7h7m4 0h5M4 17h2m4 0h10M11 4v6m-5 4v6',
  lock:'M6 10h12v11H6Zm2 0V6a4 4 0 0 1 8 0v4m-4 5v2'
 };
 const descriptions={clinical:'Módulos, calculadoras e consulta rápida.',personal:'Os teus projetos e registos, num único espaço.',emergency:'Organiza a preparação e os recursos essenciais.',comms:'Equipamentos, comunicações e testes de campo.',garage:'Acompanha a manutenção e os registos dos veículos.',expenses:'Regista, organiza e acompanha as tuas despesas.'};
 const iconFor=id=>({'clin-perf':'droplet','clin-drugs':'medication','clin-ivcompat':'link','clin-vent':'wind','clin-ecg':'pulse','clin-hemo':'pulse','clin-abg':'droplet','clin-fluid':'droplet','clin-calcs':'calculator','clin-scales':'sliders','clin-cases':'book','clin-sources':'book','clin-als':'clinical','clin-lasa':'shield','clin-dressings':'layers','clin-icu':'shield','clin-transport':'vehicle','clin-isbar':'radio'}[id]||'grid');
 const isArea=page=>Object.hasOwn(descriptions,page);
 const icon=(name,cls='')=>`<svg class="fcc-icon ${esc(cls)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]||paths.grid}"/></svg>`;
 function rows(page){return FCCNavigation.items(page);}
 function host(page){return document.getElementById('page-'+page);}
 function reset(page){
  const root=host(page);if(!root||!isArea(page))return;
  root.dataset.fccView='hub';root.dataset.fccArea=page;
  delete root.dataset.fccCompact;delete root.dataset.fccModule;
  const summary=root.querySelector(':scope > .fcc-usage-notice summary');if(summary)summary.textContent='Limites de utilização';
  root.querySelectorAll(':scope > .sub').forEach(x=>x.classList.remove('active'));
  root.querySelectorAll(':scope > .tabs > .tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});
 }
 const filters=new Map(),queries=new Map();
 const calculations=new Set(['clin-perf','clin-vent','clin-hemo','clin-abg','clin-elec','clin-crrt','clin-fluid','clin-scales','clin-calcs']);
 const libraryTitles={'clin-drugs':'Fármacos','clin-ivcompat':'Compatibilidade IV','clin-ecg':'ECG'};
 const libraryCopy={'clin-drugs':'Fichas rápidas · Urgência e UCI','clin-ivcompat':'Ligações em Y e linhas partilhadas','clin-vent':'Ventilação e parâmetros respiratórios','clin-ecg':'Leitura sistemática e fotografia','clin-abg':'Ácido-base e oxigenação'};
 const defaultOrder=['clin-drugs','clin-ivcompat','clin-vent','clin-ecg','clin-abg'];
 function libraryRows(page){
  let all=rows(page).map(x=>({...x,searchTitle:x.title,title:libraryTitles[x.id]||x.title,description:libraryCopy[x.id]||x.description||'Abrir este módulo'}));
  if(page==='clinical'){
   let custom=false;try{custom=Array.isArray(JSON.parse(FCCStore.getItem('fcc-master-subcategory-order-v1')||'{}').clinical);}catch{}
   if(!custom){const position=new Map(all.map((x,i)=>[x.id,i]));all.sort((a,b)=>(defaultOrder.includes(a.id)?defaultOrder.indexOf(a.id):100+position.get(a.id))-(defaultOrder.includes(b.id)?defaultOrder.indexOf(b.id):100+position.get(b.id)));}
  }
  return all;
 }
 function filterChoices(page){return page==='clinical'?[['all','Todos'],['modules','Módulos'],['calculators','Calculadoras'],['favorites','Favoritos']]:page==='personal'?[['all','Todos'],['tools','Ferramentas'],['records','Registos'],['favorites','Favoritos']]:[['all','Todos']];}
 function favoriteItem(page,row){return page==='personal'?{page:row.page||row.id,sub:row.sub||'',ref:'',title:row.title}:{page:'clinical',sub:row.id,ref:'',title:row.title};}
 function selected(page,row){return ['clinical','personal'].includes(page)&&!!window.FCCFavorites?.has(favoriteItem(page,row));}
 function header(page){
  if(!['clinical','personal'].includes(page))return;
  const root=host(page),head=root?.querySelector(':scope > .pagehead');if(!head)return;
  head.classList.add('fcc-library-header');head.querySelector(':scope > .badge')?.remove();
  let actions=head.querySelector('.fcc-area-head-actions');
  if(!actions){
   actions=document.createElement('div');actions.className='fcc-area-head-actions';
   actions.innerHTML=`<button type="button" class="btn fcc-area-organize" aria-label="Organizar módulos" title="Organizar módulos">${icon('sliders')}</button><button type="button" class="btn fcc-area-preferences"></button>`;
   head.append(actions);actions.firstElementChild.onclick=()=>fccOrganizeSubcategories(page);
  }
  const button=actions.lastElementChild,personal=page==='personal',opened=FCCAccess.isUnlocked();
  button.innerHTML=icon(personal?(opened?'lock':'personal'):'settings');
  const label=personal?(opened?'Bloquear área pessoal':'Desbloquear área pessoal'):'Preferências da biblioteca clínica';
  button.setAttribute('aria-label',label);button.title=label;
  button.onclick=()=>personal?(opened?FCCAccess.lock():FCCAccess.run(()=>fccNavigate('personal',{replace:true}))):fccNavigate('settings',{focus:true});
 }
 function privacy(page){
  if(page!=='personal')return;
  const hub=host(page)?.querySelector('.fcc-area-hub');if(!hub)return;
  let box=hub.querySelector('.fcc-personal-privacy');
  if(!box){box=document.createElement('div');box.className='fcc-personal-privacy';box.innerHTML=`${icon('lock')}<div><strong>Cofre bloqueado</strong><p>Podes explorar as áreas. Os dados e os favoritos pessoais só aparecem depois de desbloquear.</p></div><button class="btn" type="button" data-area-unlock>Desbloquear</button>`;hub.querySelector('.fcc-area-filters').after(box);box.querySelector('button').onclick=()=>FCCAccess.run(()=>fccNavigate('personal',{replace:true}));}
  box.hidden=FCCAccess.isUnlocked();header(page);
 }
 function openRow(page,row){return page==='personal'?fccNavigate(row.page||row.id,{sub:row.sub||'',focus:true}):fccNavigate(page,{sub:row.id,focus:true});}
 function show(page){
  const root=host(page);if(!root||!isArea(page))return false;
  reset(page);root.querySelector(':scope > .fcc-area-context')?.remove();
  let hub=root.querySelector(':scope > .fcc-area-hub');
  if(!hub){
   hub=document.createElement('section');hub.className='fcc-area-hub';hub.id='fccArea-'+page;
   hub.setAttribute('aria-label','Módulos de '+(FCCNavigation.labels[page]||page));
   const placeholder=page==='clinical'?'Pesquisar na biblioteca clínica':page==='personal'?'Pesquisar na área pessoal':'Pesquisar módulos';
   hub.innerHTML=`<div class="fcc-area-tools"><label class="fcc-area-search">${icon('search')}<span class="fcc-sr-only">${esc(placeholder)}</span><input type="search" placeholder="${esc(placeholder)}" autocomplete="off" maxlength="180"></label></div><div class="fcc-area-filters" role="group" aria-label="Filtrar módulos">${filterChoices(page).map(([value,label])=>`<button type="button" data-area-filter="${value}" aria-pressed="false">${label}</button>`).join('')}</div><div class="fcc-area-caption"><div><span class="fcc-library-eyebrow">${page==='clinical'?'MÓDULOS CLÍNICOS':'ORGANIZAÇÃO PESSOAL'}</span><h3>${page==='clinical'?'Biblioteca clínica':page==='personal'?'As tuas áreas':'Explorar módulos'}</h3></div><span role="status" aria-live="polite" aria-atomic="true"></span></div><div class="fcc-area-grid" role="list"></div>`;
   const tabs=root.querySelector(':scope > .tabs');if(tabs)tabs.before(hub);else root.append(hub);
   hub.querySelector('input').addEventListener('input',()=>{queries.set(page,hub.querySelector('input').value);render(page);});
   hub.querySelectorAll('[data-area-filter]').forEach(button=>button.addEventListener('click',()=>{filters.set(page,button.dataset.areaFilter);render(page);}));
   hub.querySelector('.fcc-area-organize')?.addEventListener('click',()=>fccOrganizeSubcategories(page));
  }
  header(page);hub.hidden=false;hub.querySelector('input').value=queries.get(page)||'';privacy(page);render(page);
  const heading=root.querySelector(':scope > .pagehead h2');if(heading){heading.textContent=page==='clinical'?'Biblioteca clínica':page==='personal'?'Área pessoal':FCCNavigation.labels[page];heading.tabIndex=-1;}
  const intro=root.querySelector(':scope > .pagehead p');if(intro)intro.textContent=descriptions[page];
  // Keep the safety boundary, but place it below module choices on the overview.
  const notice=root.querySelector(':scope > .fcc-usage-notice');if(notice)hub.after(notice);
  return true;
 }
 function render(page){
  const hub=host(page)?.querySelector(':scope > .fcc-area-hub');if(!hub)return;
  privacy(page);const all=libraryRows(page),q=C.fold(hub.querySelector('input').value),filter=filters.get(page)||'all';
  const list=all.filter(x=>{
   if(q&&!C.fold(x.title+' '+x.searchTitle+' '+x.description).includes(q))return false;
   if(filter==='favorites')return selected(page,x);
   if(filter==='calculators')return calculations.has(x.id);
   if(filter==='modules')return !calculations.has(x.id);
   if(filter==='tools')return ['emergency','comms'].includes(x.id);
   if(filter==='records')return ['expenses','garage','research','notes'].includes(x.id);
   return true;
  });
  hub.querySelectorAll('[data-area-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.areaFilter===filter)));
  hub.querySelector('[role=status]').textContent=`${list.length} ${page==='personal'?(list.length===1?'área':'áreas'):(list.length===1?'módulo':'módulos')}`;
  const grid=hub.querySelector('.fcc-area-grid');
  grid.innerHTML=list.length?list.map(x=>`<div class="fcc-library-row" role="listitem"><button type="button" class="fcc-area-card${['clinical','personal'].includes(page)?' has-favorite':''}" data-area-target="${esc(x.id)}"${page==='personal'?` data-personal-page="${esc(x.id)}"`:''}><span class="fcc-area-icon" data-tone="${esc(x.icon||iconFor(x.id))}">${icon(x.icon||iconFor(x.id))}</span><span class="fcc-area-copy"><strong>${esc(x.title)}</strong><span class="fcc-area-description">${esc(x.description)}</span></span>${icon('chevron','fcc-area-chevron')}</button>${['clinical','personal'].includes(page)?`<button type="button" class="fcc-library-star" data-favorite-sub="${esc(x.id)}" aria-pressed="${selected(page,x)}" aria-label="${selected(page,x)?'Remover':'Adicionar'} ${esc(x.title)} ${selected(page,x)?'dos':'aos'} favoritos">${icon('favorites')}</button>`:''}</div>`).join(''):`<div class="fcc-empty"><strong>${filter==='favorites'&&!q?'Ainda não tens módulos favoritos':'Nenhum módulo encontrado'}</strong><p>${filter==='favorites'&&!q?'Toca na estrela ao lado de um módulo para o guardar.':'Experimenta outro nome ou altera os filtros.'}</p><button class="btn" type="button" data-clear-filters>Mostrar todos</button></div>`;
  grid.querySelectorAll('[data-area-target]').forEach(button=>button.addEventListener('click',()=>openRow(page,all.find(x=>x.id===button.dataset.areaTarget))));
  grid.querySelectorAll('[data-favorite-sub]').forEach(button=>button.addEventListener('click',async()=>{
   const id=button.dataset.favoriteSub,row=all.find(x=>x.id===id);
   const save=async()=>{button.disabled=true;await FCCFavorites.toggle(favoriteItem(page,row));render(page);const next=grid.querySelector(`[data-favorite-sub="${CSS.escape(id)}"]`)||grid.querySelector('[data-favorite-sub]')||hub.querySelector(`[data-area-filter="${filter}"]`);next?.focus({preventScroll:true});};
   if(page==='personal'&&!FCCAccess.isUnlocked())return FCCAccess.run(save);
   await save();
  }));
  if(page==='personal'&&filter==='favorites'&&!FCCAccess.isUnlocked()){
   grid.innerHTML='<div class="fcc-empty"><strong>Favoritos pessoais protegidos</strong><p>Desbloqueia o cofre para consultar os teus favoritos.</p><button class="btn" type="button" data-favorites-unlock>Desbloquear cofre</button></div>';
   grid.querySelector('button').onclick=()=>FCCAccess.run(()=>render('personal'));
  }
  grid.querySelector('[data-clear-filters]')?.addEventListener('click',()=>{filters.set(page,'all');queries.set(page,'');hub.querySelector('input').value='';render(page);hub.querySelector('[data-area-filter="all"]').focus({preventScroll:true});});
 }
 function compactPerf(){
  const panel=document.getElementById('clin-perf'),toolbar=panel?.querySelector('.perf-toolbar');if(!toolbar)return;
  let info=document.getElementById('fccPerfInfo');
  if(!info){
   const row=document.createElement('div');row.className='fcc-perf-info-row';
   info=document.createElement('details');info.id='fccPerfInfo';info.className='fcc-module-info';
   const summary=document.createElement('summary');summary.textContent='Fontes e informação do módulo';info.append(summary);
   const content=document.createElement('div');content.className='fcc-module-info-content';info.append(content);
   row.append(info);toolbar.before(row);
   const count=document.getElementById('ccdCount');if(count)row.append(count);
   for(const selector of ['.perf-head p','.ccd-banner','.ccd-meta']){const node=panel.querySelector(selector);if(node)content.append(node);}
  }
  const label=panel.querySelector('#perfDoseToggle b');if(label)label.textContent='Calcular dose';
 }
 function detail(page,id){
  const root=host(page);if(!root||!isArea(page))return;
  const entering=root.dataset.fccView!=='detail'||root.dataset.fccModule!==id;
  root.dataset.fccView='detail';root.dataset.fccArea=page;root.dataset.fccCompact='1';root.dataset.fccModule=id;
  const hub=root.querySelector(':scope > .fcc-area-hub');if(hub)hub.hidden=true;
  let bar=root.querySelector(':scope > .fcc-area-context');if(!bar){bar=document.createElement('div');bar.className='fcc-area-context';const panel=root.querySelector(':scope > .sub');if(panel)panel.before(bar);else root.append(bar);}
  const title=libraryRows(page).find(x=>x.id===id)?.title||'Módulo';
  const head=root.querySelector(':scope > .pagehead');if(head)head.after(bar);
  const notice=root.querySelector(':scope > .fcc-usage-notice');
  if(notice){bar.after(notice);const details=notice.querySelector('details'),summary=notice.querySelector('summary');if(details&&entering)details.open=false;if(summary){summary.textContent='Limites';summary.setAttribute('aria-label','Limites de utilização clínica');}}
  if(id==='clin-perf')compactPerf();
  bar.innerHTML=`<button class="btn fcc-area-back" type="button">${icon('arrow')}<span>Todos os módulos</span></button><span class="fcc-area-current" role="heading" aria-level="2" tabindex="-1">${esc(title)}</span>`;
  bar.querySelector('button').onclick=()=>fccNavigate(page,{focus:true});
 }
 document.addEventListener('fcc-dialog-closed',e=>{if(e.detail?.id==='fccOrganizeDialog'){const route=window.FCCNavigation?.route();if(route&&!route.sub)render(route.page);}});
 document.addEventListener('fcc-favorites-change',()=>{render('clinical');render('personal');});
 document.addEventListener('fcc-private-refresh',()=>{if(!FCCAccess.isUnlocked()){for(const k of [...queries.keys()])if(k!=='clinical'){queries.delete(k);filters.delete(k);const input=host(k)?.querySelector('.fcc-area-hub input');if(input)input.value='';}}render('personal');});
 window.FCCAreas=Object.freeze({isArea,reset,show,detail,render,icon,privateAreas});
})();
