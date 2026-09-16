(()=>{
  if(window.__fccContentCoreV1Installed)return;
  window.__fccContentCoreV1Installed=true;

  const areas=new Map();
  const subtabs=new Map();
  const state={mounted:false};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const asArray=v=>Array.isArray(v)?v:(v==null?[]:[v]);
  const uid=s=>String(s||'item').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'item';

  function styles(){
    if(document.getElementById('fcc-content-core-v1-style'))return;
    const s=document.createElement('style');s.id='fcc-content-core-v1-style';s.textContent=`
      .fcc-modular-zone{display:grid;gap:10px;margin-top:12px}.fcc-modular-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.fcc-modular-head h3{margin:0;font-size:15px}.fcc-modular-head p{margin:3px 0 0;color:var(--muted);font-size:11px}.fcc-modular-tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.fcc-modular-tools input,.fcc-modular-tools select{min-width:170px}
      .fcc-modular-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.fcc-modular-card{border:1px solid var(--line);border-radius:15px;background:var(--panel);overflow:hidden}.fcc-modular-card>summary{list-style:none;cursor:pointer;padding:12px;display:flex;gap:10px;align-items:center;justify-content:space-between}.fcc-modular-card>summary::-webkit-details-marker{display:none}.fcc-modular-card[open]{border-color:var(--line-strong)}.fcc-modular-title{min-width:0}.fcc-modular-title strong{display:block;font-size:13px;line-height:1.3}.fcc-modular-title span{display:block;margin-top:3px;color:var(--muted);font-size:9px;line-height:1.4}.fcc-modular-chevron{color:var(--muted);transition:.15s}.fcc-modular-card[open] .fcc-modular-chevron{transform:rotate(180deg)}
      .fcc-modular-body{display:grid;gap:9px;padding:0 12px 12px;border-top:1px solid var(--line)}.fcc-modular-tags{display:flex;gap:5px;flex-wrap:wrap;padding-top:10px}.fcc-modular-tags span{font-size:8px;border:1px solid var(--line);border-radius:999px;padding:4px 6px;color:var(--muted);background:var(--panel-2)}.fcc-modular-section{border:1px solid var(--line);border-radius:11px;padding:9px;background:var(--panel-2)}.fcc-modular-section h4{margin:0 0 5px;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}.fcc-modular-section p{margin:0;font-size:11px;line-height:1.55}.fcc-modular-actions{display:flex;gap:6px;flex-wrap:wrap}.fcc-modular-empty{padding:12px;border:1px dashed var(--line);border-radius:12px;color:var(--muted);font-size:11px}
      .fcc-modular-subtab>.fcc-modular-zone{margin-top:0}@media(max-width:700px){.fcc-modular-grid{grid-template-columns:1fr}.fcc-modular-head{align-items:stretch;flex-direction:column}.fcc-modular-tools{display:grid;grid-template-columns:1fr}.fcc-modular-tools input,.fcc-modular-tools select{min-width:0;width:100%}}
    `;document.head.appendChild(s);
  }

  function normalizeItem(item,i=0){
    const x={...(item||{})};x.id=x.id||uid(x.title||x.name||`item-${i+1}`);x.title=x.title||x.name||'Sem título';x.tags=asArray(x.tags).filter(Boolean);x.sections=asArray(x.sections).filter(Boolean);x.actions=asArray(x.actions).filter(Boolean);return x;
  }
  function normalizeArea(def){
    if(!def?.id)throw new Error('FCCContent area requires id');
    return {title:'',description:'',target:'',placement:'append',searchable:false,filterable:false,items:[],...def,items:asArray(def.items).map(normalizeItem)};
  }
  function registerArea(def){const a=normalizeArea(def),prev=areas.get(a.id);if(prev)a.items=[...prev.items,...a.items];areas.set(a.id,a);if(state.mounted)mountArea(a.id);return a}
  function registerItems(areaId,items){const a=areas.get(areaId);if(!a)throw new Error(`FCCContent area not found: ${areaId}`);const incoming=asArray(items).map(normalizeItem);for(const item of incoming){const i=a.items.findIndex(x=>x.id===item.id);if(i>=0)a.items[i]={...a.items[i],...item};else a.items.push(item)}if(state.mounted)mountArea(areaId);return a.items}
  function getItems(areaId){return [...(areas.get(areaId)?.items||[])]}

  function renderAction(a){
    if(!a?.label)return'';const cls=`btn${a.primary?' primary':''}${a.small===false?'':' small'}`;
    if(a.href)return `<a class="${cls}" href="${esc(a.href)}"${a.external!==false?' target="_blank" rel="noopener"':''}>${esc(a.label)}</a>`;
    return `<button class="${cls}" type="button" data-fcc-action="${esc(a.action||'')}" data-fcc-payload="${esc(JSON.stringify(a.payload??null))}">${esc(a.label)}</button>`;
  }
  function renderCard(item){
    const sections=item.sections.length?item.sections:(item.summary?[{title:item.sectionTitle||'Resumo',text:item.summary}]:[]);
    return `<details class="fcc-modular-card" data-fcc-item="${esc(item.id)}"><summary><div class="fcc-modular-title"><strong>${esc(item.title)}</strong>${item.subtitle?`<span>${esc(item.subtitle)}</span>`:''}</div><span class="fcc-modular-chevron">⌄</span></summary><div class="fcc-modular-body">${item.tags.length?`<div class="fcc-modular-tags">${item.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}${sections.map(s=>`<section class="fcc-modular-section"><h4>${esc(s.title||'Informação')}</h4><p>${esc(s.text||'')}</p></section>`).join('')}${item.actions.length?`<div class="fcc-modular-actions">${item.actions.map(renderAction).join('')}</div>`:''}</div></details>`;
  }
  function categories(items){return [...new Set(items.flatMap(x=>x.tags||[]))].sort((a,b)=>String(a).localeCompare(String(b),'pt'))}
  function visibleItems(area,host){const q=fold(host?.querySelector('[data-fcc-search]')?.value),tag=host?.querySelector('[data-fcc-filter]')?.value||'';return area.items.filter(x=>(!tag||x.tags.includes(tag))&&(!q||fold([x.title,x.subtitle,x.summary,...x.tags,...x.sections.flatMap(s=>[s.title,s.text])].join(' ')).includes(q)))}
  function renderArea(area,host){
    const rows=visibleItems(area,host),grid=host.querySelector('[data-fcc-grid]'),count=host.querySelector('[data-fcc-count]');if(count)count.textContent=`${rows.length} / ${area.items.length}`;if(grid)grid.innerHTML=rows.length?rows.map(renderCard).join(''):'<div class="fcc-modular-empty">Sem itens nesta área.</div>';bindActions(host);syncSearch(area,rows)
  }
  function shell(area){
    const el=document.createElement('section');el.className='fcc-modular-zone';el.dataset.fccArea=area.id;
    const tags=categories(area.items);el.innerHTML=`<div class="fcc-modular-head"><div><h3>${esc(area.title||'Conteúdo')}</h3>${area.description?`<p>${esc(area.description)}</p>`:''}</div><div class="fcc-modular-tools">${area.searchable?`<input type="search" data-fcc-search placeholder="${esc(area.searchPlaceholder||'Pesquisar…')}">`:''}${area.filterable?`<select data-fcc-filter><option value="">Todos</option>${tags.map(t=>`<option>${esc(t)}</option>`).join('')}</select>`:''}<span class="badge" data-fcc-count>${area.items.length} / ${area.items.length}</span></div></div><div class="fcc-modular-grid" data-fcc-grid></div>`;
    el.querySelector('[data-fcc-search]')?.addEventListener('input',()=>renderArea(area,el));el.querySelector('[data-fcc-filter]')?.addEventListener('change',()=>renderArea(area,el));return el;
  }
  function mountArea(id){
    const area=areas.get(id);if(!area?.target)return false;const target=document.querySelector(area.target);if(!target)return false;
    let host=document.querySelector(`[data-fcc-area="${CSS.escape(id)}"]`);if(!area.items.length){host?.remove();return true}
    if(!host){host=shell(area);if(area.placement==='prepend')target.prepend(host);else if(area.placement==='before')target.before(host);else if(area.placement==='after')target.after(host);else target.append(host)}renderArea(area,host);return true;
  }

  function normalizeSubtab(def){if(!def?.id||!def?.page||!def?.label)throw new Error('FCCContent subtab requires id, page and label');return {title:def.label,description:'',items:[],...def,items:asArray(def.items).map(normalizeItem)}}
  function registerSubtab(def){const s=normalizeSubtab(def);subtabs.set(s.id,s);if(state.mounted)mountSubtab(s.id);return s}
  function tabTarget(tab){const on=tab?.getAttribute('onclick')||'';return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||tab?.dataset?.subId||''}
  function mountSubtab(id){
    const def=subtabs.get(id),page=document.getElementById('page-'+def?.page),tabsWrap=page?.querySelector(':scope > .tabs');if(!def||!page||!tabsWrap)return false;
    let tab=[...tabsWrap.querySelectorAll(':scope > .tab')].find(t=>tabTarget(t)===def.id);if(!tab){tab=document.createElement('button');tab.type='button';tab.className='tab';tab.dataset.subId=def.id;tab.textContent=def.label;tab.setAttribute('onclick',`subtab('${def.page}','${def.id}',this)`);const after=[...tabsWrap.querySelectorAll(':scope > .tab')].find(t=>tabTarget(t)===def.after);if(after?.nextSibling)tabsWrap.insertBefore(tab,after.nextSibling);else tabsWrap.appendChild(tab)}
    let sub=document.getElementById(def.id);if(!sub){sub=document.createElement('div');sub.id=def.id;sub.className='sub fcc-modular-subtab';const areaId=`subtab:${def.id}`;sub.innerHTML=`<div class="pagehead"><div><h3>${esc(def.title||def.label)}</h3>${def.description?`<p>${esc(def.description)}</p>`:''}</div></div><div data-fcc-subtab-host="${esc(areaId)}"></div>`;page.appendChild(sub);registerArea({id:areaId,title:def.contentTitle||'',description:def.contentDescription||'',target:`[data-fcc-subtab-host="${CSS.escape(areaId)}"]`,searchable:def.searchable!==false,filterable:!!def.filterable,items:def.items})}
    return true;
  }

  function bindActions(root){root.querySelectorAll('[data-fcc-action]').forEach(btn=>{if(btn.dataset.fccBound==='1')return;btn.dataset.fccBound='1';btn.addEventListener('click',()=>{const fn=window[btn.dataset.fccAction];if(typeof fn!=='function')return;let payload=null;try{payload=JSON.parse(btn.dataset.fccPayload||'null')}catch(e){}fn(payload,btn)})})}
  function syncSearch(area,items){
    const index=window.FCC_GLOBAL_SEARCH_INDEX;if(!(index instanceof Map))return;for(const item of items){const text=[item.title,item.subtitle,item.summary,...item.tags,...item.sections.flatMap(s=>[s.title,s.text])].join(' ');const key=['content',area.page||'clinical',area.targetId||area.target||'',fold(item.title),item.id].join('|');index.set(key,{type:'content',title:item.title,sub:area.searchLabel||`Clinical · ${area.title||'Conteúdo'}`,page:area.page||'clinical',target:area.targetId||'',ref:item.title,searchText:text})}
  }

  function extendDressings(items){
    const api=window.fccWoundDressings;if(!api?.data||!Array.isArray(api.data))return false;let changed=false;for(const raw of asArray(items)){const x={...raw};if(!x.name)continue;const i=api.data.findIndex(p=>fold(p.name)===fold(x.name));if(i>=0)api.data[i]={...api.data[i],...x};else api.data.push(x);changed=true}if(changed)api.render?.();return true;
  }
  function mountAll(){styles();subtabs.forEach((_,id)=>mountSubtab(id));areas.forEach((_,id)=>mountArea(id));state.mounted=true;document.dispatchEvent(new CustomEvent('fcc-content-mounted',{detail:{areas:areas.size,subtabs:subtabs.size}}));return {areas:areas.size,subtabs:subtabs.size}}
  function snapshot(){return {areas:[...areas.values()].map(a=>({id:a.id,target:a.target,items:a.items.length})),subtabs:[...subtabs.values()].map(s=>({id:s.id,page:s.page,items:s.items.length}))}}

  window.FCCContent={registerArea,registerItems,getItems,registerSubtab,mountArea,mountSubtab,mountAll,extendDressings,snapshot,version:'1.0.0'};
})();
