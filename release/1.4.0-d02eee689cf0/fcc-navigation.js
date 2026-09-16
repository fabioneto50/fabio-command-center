/* Single navigation owner, hash routes and accessible category menus. */
(()=>{
 'use strict';const U=FCCUI,C=FCCCore,esc=C.escapeHTML;
 const guards=[],parents=new Map([['emergency','personal'],['comms','personal'],['garage','personal'],['research','personal'],['expenses','personal']]);
 const labels={home:'Início',clinical:'Área clínica',personal:'Pessoal',emergency:'Emergência',comms:'Comunicações',garage:'Veículos',research:'Investigação',expenses:'Despesas',settings:'Definições'};
 const clinical=[['clin-perf','Perfusões e diluições','Preparação e cálculo'],['clin-drugs','Medicação','Fichas e cuidados'],['clin-ivcompat','Compatibilidades IV','Condições por par'],['clin-vent','Ventilação mecânica','Ventilador e gasimetria'],['clin-ecg','Eletrocardiograma','Interpretação e fotografia'],['clin-hemo','Hemodinâmica','Perfusão e índices'],['clin-abg','Gasimetria','Ácido-base'],['clin-elec','Eletrólitos','Valores e correções'],['clin-sepsis','Sépsis e choque','Avaliação estruturada'],['clin-stroke','AVC','Via de avaliação'],['clin-sed','Sedação e delirium','RASS, CPOT e BPS'],['clin-als','Suporte avançado de vida','Cronómetro e eventos'],['clin-crrt','Substituição renal','Efluente e dose'],['clin-fluid','Balanço hídrico','Entradas, saídas e diurese'],['clin-scales','Escalas','Avaliação clínica'],['clin-calcs','Calculadoras','Fórmulas e unidades'],['clin-cases','Casos clínicos','Objetivos e variantes'],['clin-icu','Admissão na UCI','Lista de verificação'],['clin-transport','Transporte crítico','Preparação e segurança'],['clin-isbar','Comunicação ISBAR','Passagem de informação'],['clin-dressings','Pensos e apósitos','Produtos e indicações'],['clin-material','Material','Stock externo e notas'],['clin-lasa','Medicação de alto risco','Documentação institucional'],['clin-sources','Fontes','Referências recebidas']];
 const KEY='fcc-master-subcategory-order-v1';let serial=0,currentRoute={page:'home',sub:'',ref:''},historyWriting=false;
 const positions=new Map();
 function targetOf(tab){return tab?.dataset.subId||tab?.getAttribute('onclick')?.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||'';}
 function items(page){
  let rows=page==='clinical'?clinical.map(([id,title,description])=>({id,title,description})):[];
  document.querySelectorAll(`#page-${CSS.escape(page)} > .tabs > .tab`).forEach(tab=>{const id=targetOf(tab);if(id&&!rows.some(x=>x.id===id))rows.push({id,title:tab.textContent.trim(),description:''});});
  try{const order=JSON.parse(FCCStore.getItem(KEY)||'{}')[page]||[];if(Array.isArray(order)){const initial=new Map(rows.map((x,i)=>[x.id,i]));rows.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):1000+initial.get(a.id))-(order.includes(b.id)?order.indexOf(b.id):1000+initial.get(b.id)));}}catch(e){}
  return rows;
 }
 function isPrivate(page){return FCCAccess.isPrivate(page);}
 function medicationFilters(input={}){
  const p=Number(input.p);return {q:String(input.q||'').slice(0,180),g:String(input.g||'').slice(0,160),p:Number.isSafeInteger(p)&&p>=0?Math.min(p,100000):0};
 }
 function cleanRoute(value){
  const [path,search='']=String(value||'').replace(/^#\/?/,'').split('?');
  const p=path.split('/').map(x=>{try{return decodeURIComponent(x);}catch{return '';}});
  const page=Object.hasOwn(labels,p[0])?p[0]:'home',sub=p[1]||'',ref=p[2]||'';
  const route={page,sub:/^[a-z0-9-]{0,100}$/.test(sub)?sub:'',ref:!isPrivate(page)&&/^[a-zA-Z0-9_.-]{0,200}$/.test(ref)?ref:''};
  if(page==='clinical'&&sub==='clin-drugs')route.filters=medicationFilters(Object.fromEntries(new URLSearchParams(search)));
  return route;
 }
 function hash(route){
  let value='#/'+[route.page,route.sub,route.ref].filter(Boolean).map(encodeURIComponent).join('/');
  if(route.page==='clinical'&&route.sub==='clin-drugs'){
   const f=medicationFilters(route.filters),params=new URLSearchParams();
   if(f.q)params.set('q',f.q);if(f.g)params.set('g',f.g);if(f.p)params.set('p',String(f.p));
   if(params.size)value+='?'+params.toString();
  }
  return value;
 }
 function write(route,replace=false){historyWriting=true;const state={fcc:true,page:route.page,sub:route.sub};history[replace?'replaceState':'pushState'](state,'',hash(route));historyWriting=false;}
 function pageRoot(page){return document.getElementById('page-'+page);}
 function closeTransient(){U.close();document.getElementById('globalResults')?.classList.remove('open');document.querySelector('.material-maximized')?.classList.remove('material-maximized');document.body.style.overflow='';}
 async function navigate(page,opts={}){
  if(!Object.hasOwn(labels,page))return false;
  // No publicly settable bypass flag. Every private route always checks the vault.
  if(isPrivate(page)&&!FCCAccess.isUnlocked())return FCCAccess.run(()=>navigate(page,opts));
  for(const guard of guards){try{if(await guard(page,opts)===false)return false;}catch(e){U.notify('Acesso bloqueado: não foi possível verificar esta navegação.','error');return false;}}
  const my=++serial;positions.set(hash(currentRoute),window.scrollY);closeTransient();
  let target=pageRoot(page);
  if(!target&&page==='expenses'){await FCCModules.ensure('expenses');target=pageRoot(page);}
  if(!target)return false;
  document.querySelectorAll('.page.active').forEach(x=>x.classList.remove('active'));target.classList.add('active');
  const owner=parents.get(page)||page;document.querySelectorAll('.nav[data-page]').forEach(x=>{x.classList.toggle('active',x.dataset.page===owner);if(x.dataset.page===owner)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});
  currentRoute={page,sub:opts.sub||'',ref:isPrivate(page)?'':opts.ref||''};
  if(page==='clinical'&&opts.sub==='clin-drugs')currentRoute.filters=medicationFilters(opts.filters);
  if(!opts.history)write(currentRoute,!!opts.replace);
  try{
   const group=FCCModules.forRoute(page,opts.sub||'');
   await FCCModules.ensure(group);
   if(my!==serial)return false;
   if(isPrivate(page)&&!FCCAccess.isUnlocked())return navigate('home',{replace:true});
   if(opts.sub)await activate(page,opts.sub,null,{route:false});
   else if(page==='clinical'){target.querySelectorAll(':scope > .sub').forEach(x=>x.classList.remove('active'));await openMenu('clinical',{navigateFirst:false});}
   if(opts.sub==='clin-drugs')FCCMedications.restoreRoute(currentRoute,{focus:!opts.history});
   else if(opts.ref&&opts.sub==='clin-cases')FCCCases.open(opts.ref,{route:false});
   if(page==='home')window.FCCFavorites?.renderHome?.();
   document.title=(labels[page]||'')+' · Fábio Command Center';
   document.dispatchEvent(new CustomEvent('fcc-page-change',{detail:{page,owner}}));
   const restore=opts.history?positions.get(hash(currentRoute))||0:0;
   if(!U.active())window.scrollTo({top:restore,behavior:'auto'});
   if(typeof opts.after==='function')await opts.after();
   return true;
  }catch(e){
   if(my!==serial)return false;
   showError(target,page,opts,e);return false;
  }
 }
 function showError(target,page,opts,e){
  let block=target.querySelector(':scope > .fcc-module-state');if(!block){block=document.createElement('section');block.className='fcc-module-state';target.prepend(block);}block.innerHTML=`<h3>Não foi possível carregar este módulo</h3><p>${esc(e.message||'Falha de ligação.')}</p><button type="button" class="btn">Tentar novamente</button>`;block.setAttribute('role','alert');block.querySelector('button').onclick=()=>{block.remove();navigate(page,{...opts,replace:true});};
 }
 async function activate(page,id,button,opts={}){
  if(isPrivate(page)&&!FCCAccess.isUnlocked())return FCCAccess.run(()=>navigate(page,{sub:id}));
  if(!items(page).some(x=>x.id===id)&&!document.getElementById(id))return false;
  await FCCModules.ensure(FCCModules.forRoute(page,id));
  const root=pageRoot(page),target=document.getElementById(id);if(!root||!target||target.closest('.page')!==root)return false;
  root.querySelectorAll(':scope > .sub').forEach(x=>{x.classList.toggle('active',x===target);x.setAttribute('role','tabpanel');});
  root.querySelectorAll(':scope > .tabs > .tab').forEach(x=>{const on=targetOf(x)===id;x.classList.toggle('active',on);x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;});
  const tabs=root.querySelector(':scope > .tabs'),selected=tabs?.querySelector('.tab.active');
  if(tabs&&selected&&tabs.scrollWidth>tabs.clientWidth){const left=selected.offsetLeft-tabs.offsetLeft;tabs.scrollLeft=Math.max(0,left-(tabs.clientWidth-selected.offsetWidth)/2);}
  root.querySelector(':scope > .fcc-module-state')?.remove();
  if(opts.route!==false){currentRoute={page,sub:id,ref:''};write(currentRoute);}
  currentRoute={...currentRoute,page,sub:id};
  window.FCCFavorites?.recent({page,sub:id,ref:'',title:items(page).find(x=>x.id===id)?.title||id});
  document.dispatchEvent(new CustomEvent('fcc-subtab-change',{detail:{page,id}}));
  return true;
 }
 function rebind(){
  document.querySelectorAll('.page > .tabs').forEach(tabs=>{
   tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Módulos de '+(labels[tabs.closest('.page').id.replace('page-','')]||'consulta'));
   tabs.querySelectorAll('.tab').forEach(tab=>{
    const id=targetOf(tab);if(!id)return;tab.dataset.subId=id;tab.removeAttribute('onclick');tab.setAttribute('role','tab');tab.id=tab.id||'tab-'+id;tab.setAttribute('aria-controls',id);tab.setAttribute('aria-selected',String(tab.classList.contains('active')));tab.tabIndex=tab.classList.contains('active')?0:-1;
    const panel=document.getElementById(id);if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);}
    if(tab.dataset.fccBound)return;tab.dataset.fccBound='1';tab.onclick=()=>navigate(tab.closest('.page').id.replace('page-',''),{sub:id});
   });
   if(!tabs.querySelector('[tabindex="0"]'))tabs.querySelector('.tab')?.setAttribute('tabindex','0');
  });
 }
 async function openMenu(page,{navigateFirst=false}={}){
  if(isPrivate(page)&&!FCCAccess.isUnlocked())return FCCAccess.run(()=>openMenu(page));
  if(page==='expenses')await FCCModules.ensure('expenses');
  const rows=items(page);if(!rows.length)return navigate(page);
  const dialog=U.make('fccCategoryDialog',labels[page]||page,`<div class="fcc-menu-tools"><label>Pesquisar módulo<input id="fccCategorySearch" type="search" autocomplete="off"></label><button class="btn" id="fccOrganize">Organizar</button></div><div id="fccCategoryItems" class="fcc-module-menu"></div>`);
  const render=()=>{const q=C.fold(dialog.querySelector('input').value),list=dialog.querySelector('#fccCategoryItems');list.innerHTML=rows.filter(r=>!q||C.fold(r.title+' '+r.description).includes(q)).map(r=>`<button type="button" class="btn fcc-module-link" data-sub="${esc(r.id)}"><strong>${esc(r.title).replace('Eletrocardiograma','Eletrocardio&shy;grama').replace('Compatibilidades','Compatibili&shy;dades')}</strong><small>${esc(r.description)}</small></button>`).join('')||'<p>Sem resultados.</p>';list.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{U.close();navigate(page,{sub:b.dataset.sub});});};
  render();dialog.querySelector('input').oninput=render;dialog.querySelector('#fccOrganize').onclick=()=>organize(page);U.open(dialog,'#fccCategorySearch');
 }
 function organize(page){
  const rows=items(page),dialog=U.make('fccOrganizeDialog','Organizar · '+labels[page],'<div id="fccOrderRows"></div>',[{label:'Guardar ordem',primary:true,run:async()=>{let saved={};try{saved=JSON.parse(FCCStore.getItem(KEY)||'{}');}catch{}saved[page]=rows.map(x=>x.id);await FCCStore.setItem(KEY,JSON.stringify(saved));applyOrder(page);U.close();U.notify('Ordem guardada neste dispositivo.');}}]);
  const render=()=>{const list=dialog.querySelector('#fccOrderRows');list.innerHTML=rows.map((r,i)=>`<div class="fcc-org-row"><span>${esc(r.title)}</span><button class="btn" data-up="${i}" aria-label="Mover ${esc(r.title)} para cima" ${i===0?'disabled':''}>↑</button><button class="btn" data-down="${i}" aria-label="Mover ${esc(r.title)} para baixo" ${i===rows.length-1?'disabled':''}>↓</button></div>`).join('');list.querySelectorAll('button').forEach(b=>b.onclick=()=>{const up=b.hasAttribute('data-up'),i=+(up?b.dataset.up:b.dataset.down),j=i+(up?-1:1);[rows[i],rows[j]]=[rows[j],rows[i]];render();list.querySelector(`[data-${up?'up':'down'}="${j}"]`)?.focus();});};render();U.open(dialog);
 }
 function applyOrder(page){const wrap=pageRoot(page)?.querySelector(':scope > .tabs');if(!wrap)return;const tabs=[...wrap.children];items(page).forEach(r=>{const t=tabs.find(x=>targetOf(x)===r.id);if(t)wrap.append(t);});}
 function replaceFilters(filters){if(currentRoute.page!=='clinical'||currentRoute.sub!=='clin-drugs')return;currentRoute={...currentRoute,ref:'',filters:medicationFilters(filters)};write(currentRoute,true);}
 function replaceDetail(ref='',replace=true){if(isPrivate(currentRoute.page))ref='';currentRoute={...currentRoute,ref};write(currentRoute,replace);}
 window.FCCNavigation=Object.freeze({navigate,addGuard:fn=>{if(typeof fn==='function')guards.push(fn);},removeGuard:fn=>{const i=guards.indexOf(fn);if(i>=0)guards.splice(i,1);},setParent:(page,parent)=>parents.set(page,parent),current:()=>currentRoute.page,route:()=>({...currentRoute}),replaceDetail,replaceFilters,closeTransient,items,labels,restore:()=>navigate(cleanRoute(location.hash).page,{...cleanRoute(location.hash),history:true}),rebind});
 window.fccNavigate=navigate;window.go=navigate;window.__fccDirectGo=navigate;
 window.subtab=(page,id,btn)=>navigate(page,{sub:id});window.fccActivateSubcategory=(page,id)=>navigate(page,{sub:id});window.fccRebindSubcategories=rebind;
 window.openCategoryMenu=openMenu;window.closeCategoryMenu=U.close;window.fccOrganizeSubcategories=organize;
 window.openClin=k=>navigate('clinical',{sub:'clin-'+k});
 window.openModal=id=>U.open(id);window.closeModal=id=>U.close();
 document.addEventListener('click',e=>{const nav=e.target.closest('.nav[data-page]');if(!nav)return;e.preventDefault();e.stopImmediatePropagation();nav.focus({preventScroll:true});const p=nav.dataset.page;if(p==='clinical')openMenu(p);else navigate(p);},true);
 document.addEventListener('keydown',e=>{const tab=e.target.closest('.tabs>.tab');if(!tab||!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;const all=[...tab.parentElement.querySelectorAll('.tab')],i=all.indexOf(tab),next=e.key==='Home'?all[0]:e.key==='End'?all.at(-1):all[(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length];e.preventDefault();next.focus();next.click();});
 window.addEventListener('popstate',()=>{if(!historyWriting)FCCNavigation.restore();});window.addEventListener('hashchange',()=>{if(!historyWriting&&hash(currentRoute)!==location.hash)FCCNavigation.restore();});
 rebind();
})();
