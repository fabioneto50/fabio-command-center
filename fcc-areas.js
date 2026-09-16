/* Area landing pages: entering an area never chooses or opens a module. */
(()=>{
 'use strict';const C=FCCCore,esc=C.escapeHTML;
 const privateAreas=[
  {id:'expenses',title:'Despesas',description:'Registos, análises e orçamento.',icon:'wallet'},
  {id:'emergency',title:'Emergência',description:'Preparação, inventário e contactos.',icon:'shield'},
  {id:'comms',title:'Comunicações',description:'Rádio, nós e telemetria.',icon:'radio'},
  {id:'garage',title:'Veículos',description:'Manutenção, custos e documentos.',icon:'vehicle'},
  {id:'research',title:'Investigação',description:'Biblioteca e pesquisa de evidência.',icon:'book'}
 ];
 const paths={
  home:'M3 10.5 12 3l9 7.5M5 9v12h5v-7h4v7h5V9',
  clinical:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z',
  personal:'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
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
 const descriptions={clinical:'Ferramentas e referências para a prática clínica.',personal:'Os teus projetos e registos, num único espaço.',emergency:'Organiza a preparação e os recursos essenciais.',comms:'Equipamentos, comunicações e testes de campo.',garage:'Acompanha a manutenção e os registos dos veículos.',expenses:'Regista, organiza e acompanha as tuas despesas.'};
 const iconFor=id=>({'clin-perf':'droplet','clin-drugs':'medication','clin-ivcompat':'link','clin-vent':'wind','clin-ecg':'pulse','clin-hemo':'pulse','clin-abg':'droplet','clin-fluid':'droplet','clin-calcs':'calculator','clin-scales':'sliders','clin-cases':'book','clin-sources':'book','clin-als':'clinical','clin-lasa':'shield','clin-dressings':'layers','clin-icu':'shield','clin-transport':'vehicle','clin-isbar':'radio'}[id]||'grid');
 const isArea=page=>Object.hasOwn(descriptions,page);
 const icon=(name,cls='')=>`<svg class="fcc-icon ${esc(cls)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]||paths.grid}"/></svg>`;
 function rows(page){return page==='personal'?privateAreas:FCCNavigation.items(page);}
 function host(page){return document.getElementById('page-'+page);}
 function reset(page){
  const root=host(page);if(!root||!isArea(page))return;
  root.dataset.fccView='hub';root.dataset.fccArea=page;
  root.querySelectorAll(':scope > .sub').forEach(x=>x.classList.remove('active'));
  root.querySelectorAll(':scope > .tabs > .tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});
 }
 function show(page){
  const root=host(page);if(!root||!isArea(page))return false;
  reset(page);root.querySelector(':scope > .fcc-area-context')?.remove();
  let hub=root.querySelector(':scope > .fcc-area-hub');
  if(!hub){
   hub=document.createElement('section');hub.className='fcc-area-hub';hub.id='fccArea-'+page;
   hub.setAttribute('aria-label','Módulos de '+(FCCNavigation.labels[page]||page));
   hub.innerHTML=`<div class="fcc-area-tools"><label class="fcc-area-search">${icon('search')}<span class="fcc-sr-only">Pesquisar em ${esc(FCCNavigation.labels[page]||page)}</span><input type="search" placeholder="${page==='personal'?'Procurar uma área…':'Procurar um módulo…'}" autocomplete="off" maxlength="180"></label>${page==='personal'?'':`<button type="button" class="btn fcc-area-organize" aria-label="Organizar módulos">${icon('sliders')}<span>Organizar</span></button>`}</div><div class="fcc-area-caption"><h3>${page==='personal'?'As tuas áreas':'Todos os módulos'}</h3><span role="status" aria-live="polite"></span></div><div class="fcc-area-grid"></div>`;
   const tabs=root.querySelector(':scope > .tabs');if(tabs)tabs.before(hub);else root.append(hub);
   hub.querySelector('input').addEventListener('input',()=>render(page));
   hub.querySelector('.fcc-area-organize')?.addEventListener('click',()=>fccOrganizeSubcategories(page));
  }
  hub.hidden=false;hub.querySelector('input').value='';render(page);
  const heading=root.querySelector(':scope > .pagehead h2');if(heading){heading.textContent=page==='clinical'?'Clínica':FCCNavigation.labels[page];heading.tabIndex=-1;}
  const intro=root.querySelector(':scope > .pagehead p');if(intro)intro.textContent=descriptions[page];
  return true;
 }
 function render(page){
  const hub=host(page)?.querySelector(':scope > .fcc-area-hub');if(!hub)return;
  const all=rows(page),q=C.fold(hub.querySelector('input').value),list=all.filter(x=>!q||C.fold(x.title+' '+(x.description||'')).includes(q));
  hub.querySelector('[role=status]').textContent=`${list.length} ${page==='personal'?'áreas':'módulos'}`;
  hub.querySelector('.fcc-area-grid').innerHTML=list.length?list.map(x=>`<button type="button" class="fcc-area-card" data-area-target="${esc(x.id)}"${page==='personal'?` data-personal-page="${esc(x.id)}"`:''}><span class="fcc-area-card-top"><span class="fcc-area-icon">${icon(x.icon||iconFor(x.id))}</span>${icon('chevron','fcc-area-chevron')}</span><strong>${esc(x.title).replace('Eletrocardiograma','Eletrocardio&shy;grama').replace('Compatibilidades','Compatibili&shy;dades')}</strong><span class="fcc-area-description">${esc(x.description||'Abrir este módulo')}</span></button>`).join(''):'<div class="fcc-empty"><strong>Nenhum módulo encontrado</strong><p>Experimenta outro nome ou limpa a pesquisa.</p></div>';
  hub.querySelectorAll('[data-area-target]').forEach(button=>button.addEventListener('click',()=>page==='personal'?fccNavigate(button.dataset.areaTarget,{focus:true}):fccNavigate(page,{sub:button.dataset.areaTarget,focus:true})));
 }
 function detail(page,id){
  const root=host(page);if(!root||!isArea(page))return;
  root.dataset.fccView='detail';root.dataset.fccArea=page;
  const hub=root.querySelector(':scope > .fcc-area-hub');if(hub)hub.hidden=true;
  let bar=root.querySelector(':scope > .fcc-area-context');if(!bar){bar=document.createElement('div');bar.className='fcc-area-context';const panel=root.querySelector(':scope > .sub');if(panel)panel.before(bar);else root.append(bar);}
  const title=rows(page).find(x=>x.id===id)?.title||'Módulo';
  bar.innerHTML=`<button class="btn fcc-area-back" type="button">${icon('arrow')}<span>Todos os módulos</span></button><span class="fcc-area-current">${esc(title)}</span>`;
  bar.querySelector('button').onclick=()=>fccNavigate(page,{focus:true});
 }
 document.addEventListener('fcc-dialog-closed',e=>{if(e.detail?.id==='fccOrganizeDialog'){const route=window.FCCNavigation?.route();if(route&&!route.sub)render(route.page);}});
 window.FCCAreas=Object.freeze({isArea,reset,show,detail,render,icon,privateAreas});
})();
