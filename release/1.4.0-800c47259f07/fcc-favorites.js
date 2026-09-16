/* Optional public clinical start screen. Only public clinical route IDs are saved. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,S=FCCStore,KEY='fcc-clinical-favorites-v1',PREF='fcc-ui-preferences-v2',esc=C.escapeHTML;
 const read=key=>{try{const v=JSON.parse(S.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}};
 let data=read(KEY);data.favorites=Array.isArray(data.favorites)?data.favorites:[];data.recent=Array.isArray(data.recent)?data.recent:[];
 const key=x=>[x.page,x.sub,x.ref||''].join('/');
 const safe=x=>x&&x.page==='clinical'&&/^[a-z0-9-]+$/.test(x.sub||'')&&/^[a-zA-Z0-9_.-]*$/.test(x.ref||'')&&typeof x.title==='string';
 function write(){S.setItem(KEY,JSON.stringify(data)).catch(e=>U.notify(e.message,'error'));}
 function toggle(item){if(!safe(item))return;const i=data.favorites.findIndex(x=>key(x)===key(item));if(i<0)data.favorites.push(item);else data.favorites.splice(i,1);write();renderHome();U.notify(i<0?'Adicionado aos favoritos.':'Removido dos favoritos.');}
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
 window.FCCFavorites=Object.freeze({toggle,recent,renderHome,settings});document.addEventListener('fcc-private-refresh',()=>{data=read(KEY);data.favorites=Array.isArray(data.favorites)?data.favorites:[];data.recent=Array.isArray(data.recent)?data.recent:[];renderHome();});settings();renderHome();
})();
