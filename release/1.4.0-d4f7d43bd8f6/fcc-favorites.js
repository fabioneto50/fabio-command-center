/* Optional public clinical start screen. Only public clinical route IDs are saved. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,S=FCCStore,KEY='fcc-clinical-favorites-v1',PREF='fcc-ui-preferences-v2',esc=C.escapeHTML;
 const read=key=>{try{const v=JSON.parse(S.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}};
 let data=read(KEY);data.favorites=Array.isArray(data.favorites)?data.favorites:[];data.recent=Array.isArray(data.recent)?data.recent:[];
 const key=x=>[x.page,x.sub,x.ref||''].join('/');
 const safe=x=>x&&x.page==='clinical'&&/^[a-z0-9-]+$/.test(x.sub||'')&&/^[a-zA-Z0-9_.-]*$/.test(x.ref||'')&&typeof x.title==='string';
 function write(){S.setItem(KEY,JSON.stringify(data)).catch(e=>U.notify(e.message,'error'));}
 function list(){return data.favorites.filter(safe).map(x=>({...x}));}
 function has(item){return safe(item)&&data.favorites.some(x=>key(x)===key(item));}
 async function toggle(item){
  if(!safe(item))return false;
  const before=data.favorites.slice(),i=data.favorites.findIndex(x=>key(x)===key(item));
  if(i<0)data.favorites.push({...item});else data.favorites.splice(i,1);
  try{await S.setItem(KEY,JSON.stringify(data));renderHome();renderPage();document.dispatchEvent(new CustomEvent('fcc-favorites-change'));U.notify(i<0?'Adicionado aos favoritos.':'Removido dos favoritos.');return true;}
  catch(e){data.favorites=before;U.notify(e.message,'error');return false;}
 }
 function renderPage(){
  const page=document.getElementById('page-favorites');if(!page)return;
  const q=C.fold(page.querySelector('input')?.value||'');
  const rows=list().filter(x=>!q||C.fold(x.title).includes(q));
  page.querySelector('[role=status]').textContent=`${rows.length} ${rows.length===1?'favorito':'favoritos'}`;
  const grid=page.querySelector('.fcc-area-grid');
  grid.innerHTML=rows.length?rows.map((x,i)=>`<div class="fcc-library-row" role="listitem"><button type="button" class="fcc-area-card has-favorite" data-favorite-open="${i}"><span class="fcc-area-icon">${FCCAreas.icon(x.ref?'medication':'book')}</span><span class="fcc-area-copy"><strong>${esc(x.title)}</strong><span class="fcc-area-description">${x.ref?'Ficha clínica':'Módulo clínico'}</span></span>${FCCAreas.icon('chevron','fcc-area-chevron')}</button><button class="fcc-library-star" type="button" data-favorite-remove="${i}" aria-pressed="true" aria-label="Remover ${esc(x.title)} dos favoritos">${FCCAreas.icon('favorites')}</button></div>`).join(''):'<div class="fcc-empty"><strong>'+ (q?'Sem resultados':'Os teus favoritos ficam aqui')+'</strong><p>'+(q?'Experimenta outro nome.':'Toca na estrela de um módulo ou guarda uma ficha clínica.')+'</p><button class="btn" type="button" data-favorite-browse>Explorar biblioteca</button></div>';
  grid.querySelectorAll('[data-favorite-open]').forEach(b=>b.onclick=()=>{const x=rows[+b.dataset.favoriteOpen];FCCNavigation.navigate('clinical',{sub:x.sub,ref:x.ref||'',focus:true});});
  grid.querySelectorAll('[data-favorite-remove]').forEach(b=>b.onclick=async()=>{const index=+b.dataset.favoriteRemove;b.disabled=true;await toggle(rows[index]);const buttons=grid.querySelectorAll('[data-favorite-remove]');(buttons[Math.min(index,buttons.length-1)]||page.querySelector('h2'))?.focus({preventScroll:true});});
  grid.querySelector('[data-favorite-browse]')?.addEventListener('click',()=>FCCNavigation.navigate('clinical',{focus:true}));
 }
 function installPage(){
  if(document.getElementById('page-favorites'))return;
  const page=document.createElement('section');page.id='page-favorites';page.className='page';page.innerHTML=`<div class="pagehead"><div><h2 tabindex="-1">Favoritos</h2><p>Os módulos e as fichas clínicas que guardaste.</p></div></div><section class="fcc-area-hub"><label class="fcc-area-search">${FCCAreas.icon('search')}<span class="fcc-sr-only">Pesquisar nos favoritos</span><input type="search" maxlength="180" autocomplete="off" placeholder="Pesquisar nos favoritos"></label><div class="fcc-area-caption"><h3>Guardados por ti</h3><span role="status" aria-live="polite"></span></div><div class="fcc-area-grid" role="list"></div></section>`;
  document.querySelector('#main-content > .footer').before(page);page.querySelector('input').oninput=renderPage;renderPage();
 }
 function recent(item){if(!safe(item))return;data.recent=[item,...data.recent.filter(x=>key(x)!==key(item))].slice(0,8);write();}
 const cards=rows=>rows.length?rows.filter(safe).map((x,i)=>`<button type="button" class="btn fcc-module-link" data-target="${esc(JSON.stringify(x))}"><strong>${esc(x.title)}</strong><small>${x.ref?'Ficha':'Módulo'} clínico</small></button>`).join(''):'<div class="fcc-empty">Ainda não existem itens. Usa o botão Favorito numa ficha.</div>';
 function renderHome(){
  const root=document.getElementById('page-home');if(!root)return;
  let panel=document.getElementById('fccClinicalHome');if(!panel){panel=document.createElement('section');panel.id='fccClinicalHome';panel.className='fcc-clinical-home';root.prepend(panel);}
  const mode=read(PREF).home==='clinical';panel.hidden=!mode;
  root.querySelectorAll(':scope > .hero,:scope > .grid').forEach(x=>x.hidden=mode);
  panel.innerHTML=`<div class="hero"><h2>Consulta clínica</h2><p>Pesquisa, favoritos e ferramentas de consulta rápida.</p><button type="button" class="btn" id="fccSwitchNews">Ver notícias</button></div><section class="card full"><h3>Acesso rápido</h3><div class="fcc-quicklinks">${[['clin-drugs','Medicação'],['clin-ivcompat','Compatibilidades IV'],['clin-perf','Perfusões e diluições'],['clin-vent','Ventilação'],['clin-scales','Escalas'],['clin-cases','Casos clínicos']].map(([sub,title])=>`<button class="btn" data-target="${esc(JSON.stringify({page:'clinical',sub,title}))}">${title}</button>`).join('')}</div></section><section class="card full"><h3>Favoritos</h3><div class="fcc-module-menu">${cards(data.favorites)}</div></section><section class="card full"><h3>Recentes</h3><div class="fcc-module-menu">${cards(data.recent)}</div></section>`;
  panel.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const r=JSON.parse(b.dataset.target);FCCNavigation.navigate(r.page,{sub:r.sub,ref:r.ref||''});});panel.querySelector('#fccSwitchNews').onclick=()=>setHome('news');
  const hero=root.querySelector(':scope > .hero');if(hero&&!hero.querySelector('#fccSwitchClinical')){const b=document.createElement('button');b.id='fccSwitchClinical';b.type='button';b.className='btn';b.textContent='Abrir início clínico';b.onclick=()=>setHome('clinical');hero.append(b);}
 }
 async function setHome(value){const p=read(PREF);p.home=value;await S.setItem(PREF,JSON.stringify(p));renderHome();}
 function settings(){
  const grid=document.querySelector('#page-settings > .grid');if(!grid||document.getElementById('fccDisplayPrefs'))return;
  const card=document.createElement('section');card.id='fccDisplayPrefs';card.className='card half';card.innerHTML='<h3>Apresentação</h3><label>Página inicial<select id="fccHomePreference"><option value="news">Notícias</option><option value="clinical">Consulta clínica</option></select></label><label>Densidade<select id="fccDensity"><option value="comfortable">Confortável</option><option value="compact">Compacta</option></select></label><p>A densidade compacta reduz os espaços, não o tamanho dos campos de introdução.</p>';grid.prepend(card);
  const p=read(PREF);card.querySelector('#fccHomePreference').value=p.home||'news';card.querySelector('#fccDensity').value=p.density||'comfortable';document.documentElement.dataset.fccDensity=p.density||'comfortable';
  card.querySelector('#fccHomePreference').onchange=e=>setHome(e.target.value);card.querySelector('#fccDensity').onchange=async e=>{const p=read(PREF);p.density=e.target.value;await S.setItem(PREF,JSON.stringify(p));document.documentElement.dataset.fccDensity=p.density;};
 }
 window.FCCFavorites=Object.freeze({toggle,recent,renderHome,settings,list,has,renderPage,installPage});document.addEventListener('fcc-private-refresh',()=>{data=read(KEY);data.favorites=Array.isArray(data.favorites)?data.favorites:[];data.recent=Array.isArray(data.recent)?data.recent:[];renderHome();renderPage();document.dispatchEvent(new CustomEvent("fcc-favorites-change"));});installPage();settings();renderHome();
})();
