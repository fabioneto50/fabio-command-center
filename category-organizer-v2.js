(()=>{
  if(window.__fccCategoryOrganizerV2Installed)return;
  window.__fccCategoryOrganizerV2Installed=true;

  const KEY='fcc-master-subcategory-order-v1';
  const PAGES=['clinical','emergency','comms','garage','research'];
  const original={};
  let orders={};
  let editingPage='';
  let working=[];
  try{orders=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){orders={}}

  function tabId(tab){
    const on=tab.getAttribute('onclick')||tab.dataset.originalOnclick||'';
    const m=on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/);
    return m?.[1]||tab.dataset.subId||tab.id||('label:'+tab.textContent.trim());
  }
  function tabs(page){return [...(document.querySelector('#page-'+page+' > .tabs')?.querySelectorAll(':scope > .tab')||[])]}
  function capture(page){const ids=tabs(page).map(tabId);if(!original[page])original[page]=[...ids];else ids.forEach(id=>{if(!original[page].includes(id))original[page].push(id)})}
  function normalized(page,src){const all=tabs(page).map(tabId),out=(src||[]).filter(id=>all.includes(id));all.forEach(id=>{if(!out.includes(id))out.push(id)});return out}
  function applyOrder(page){
    const wrap=document.querySelector('#page-'+page+' > .tabs');if(!wrap)return false;
    capture(page);const order=normalized(page,orders[page]);if(!order.length)return false;
    const map=new Map(tabs(page).map(t=>[tabId(t),t]));
    order.forEach(id=>{const t=map.get(id);if(t)wrap.appendChild(t)});
    return true;
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(orders))}catch(e){}}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function label(page){return ({clinical:'Clinical OS',emergency:'Emergency',comms:'Comms',garage:'Garage',research:'Research'})[page]||page}

  function addStyles(){
    if(document.getElementById('fcc-organizer-v2-style'))return;
    const st=document.createElement('style');st.id='fcc-organizer-v2-style';st.textContent=`
      .fcc-sheet-actions{display:flex;gap:7px;align-items:center}.fcc-organize-trigger{height:38px;padding:0 11px;border-radius:12px;border:1px solid var(--line);background:var(--panel-2);color:var(--muted);font-size:9px;font-weight:800;cursor:pointer}
      .fcc-org-backdrop{position:fixed;inset:0;z-index:260;background:rgba(1,7,12,.76);display:none;place-items:center;padding:16px}.fcc-org-backdrop.open{display:grid}.fcc-org-box{width:min(560px,100%);max-height:min(82vh,760px);overflow:auto;border:1px solid var(--line-strong);border-radius:23px;background:linear-gradient(160deg,var(--panel),var(--bg-soft));box-shadow:0 30px 90px rgba(0,0,0,.42);padding:17px}.fcc-org-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;margin-bottom:12px}.fcc-org-head h3{margin:0;font-size:21px}.fcc-org-head p{margin:4px 0 0;color:var(--muted);font-size:9px}.fcc-org-close{width:36px;height:36px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2);color:var(--text)}.fcc-org-list{display:grid;gap:6px}.fcc-org-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:center;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:9px}.fcc-org-item strong{font-size:10px}.fcc-org-item small{display:block;color:var(--muted);font-size:8px;margin-top:2px}.fcc-org-move{display:flex;gap:4px}.fcc-org-move button{width:32px;height:32px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text)}.fcc-org-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px;padding-top:12px;border-top:1px solid var(--line)}
      @media(max-width:640px){.fcc-org-backdrop{align-items:end;padding:8px}.fcc-org-box{width:100%;max-height:82vh;border-radius:22px}.fcc-organize-trigger{height:36px;padding:0 9px}}
    `;document.head.appendChild(st);
  }

  function ensureModal(){
    if(document.getElementById('fccOrgModal'))return;
    const m=document.createElement('div');m.id='fccOrgModal';m.className='fcc-org-backdrop';
    m.innerHTML='<section class="fcc-org-box" role="dialog" aria-modal="true"><div class="fcc-org-head"><div><h3>Organizar subcategorias</h3><p>A ordem fica guardada neste dispositivo.</p></div><button class="fcc-org-close" type="button">×</button></div><div class="fcc-org-list" id="fccOrgList"></div><div class="fcc-org-actions"><button class="btn primary" type="button" id="fccOrgSave">Guardar ordem</button><button class="btn" type="button" id="fccOrgReset">Repor ordem original</button><button class="btn" type="button" id="fccOrgCancel">Cancelar</button></div></section>';
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)close()});
    m.querySelector('.fcc-org-close').addEventListener('click',close);
    document.getElementById('fccOrgCancel').addEventListener('click',close);
    document.getElementById('fccOrgSave').addEventListener('click',commit);
    document.getElementById('fccOrgReset').addEventListener('click',()=>{working=normalized(editingPage,original[editingPage]||[]);render()});
  }
  function open(page){capture(page);editingPage=page;working=normalized(page,orders[page]||original[page]);ensureModal();document.querySelector('#fccOrgModal h3').textContent='Organizar · '+label(page);render();document.getElementById('fccOrgModal').classList.add('open')}
  function close(){document.getElementById('fccOrgModal')?.classList.remove('open');editingPage='';working=[]}
  function move(i,d){const j=i+d;if(j<0||j>=working.length)return;[working[i],working[j]]=[working[j],working[i]];render()}
  function commit(){if(!editingPage)return;orders[editingPage]=[...working];save();applyOrder(editingPage);close();document.getElementById('fcc-category-sheet')?.classList.remove('open');document.getElementById('fcc-sheet-backdrop')?.classList.remove('open');window.fccRebindSubcategories?.();if(typeof toast==='function')toast('Ordem das subcategorias guardada')}
  function render(){
    const list=document.getElementById('fccOrgList');if(!list)return;
    const map=new Map(tabs(editingPage).map(t=>[tabId(t),t]));
    list.innerHTML=working.map((id,i)=>{const t=map.get(id),text=t?.textContent.trim()||id;return `<div class="fcc-org-item"><div><strong>${esc(text)}</strong><small>Posição ${i+1}</small></div><div class="fcc-org-move"><button type="button" data-up="${i}" ${i===0?'disabled':''}>↑</button><button type="button" data-down="${i}" ${i===working.length-1?'disabled':''}>↓</button></div></div>`}).join('');
    list.querySelectorAll('[data-up]').forEach(b=>b.addEventListener('click',()=>move(+b.dataset.up,-1)));
    list.querySelectorAll('[data-down]').forEach(b=>b.addEventListener('click',()=>move(+b.dataset.down,1)));
  }
  function decorate(page){
    const sheet=document.getElementById('fcc-category-sheet');if(!sheet||!sheet.classList.contains('open'))return;
    const head=sheet.querySelector('.fcc-sheet-head');if(!head||head.querySelector('.fcc-organize-trigger'))return;
    const closeBtn=head.querySelector('.fcc-sheet-close'),actions=document.createElement('div'),b=document.createElement('button');
    actions.className='fcc-sheet-actions';b.type='button';b.className='fcc-organize-trigger';b.textContent='Organizar';b.addEventListener('click',e=>{e.stopPropagation();open(page)});
    if(closeBtn){head.insertBefore(actions,closeBtn);actions.append(b,closeBtn)}else{actions.appendChild(b);head.appendChild(actions)}
  }

  addStyles();ensureModal();PAGES.forEach(page=>{capture(page);applyOrder(page)});
  const oldOpen=window.openCategoryMenu;
  if(typeof oldOpen==='function')window.openCategoryMenu=function(page,...args){applyOrder(page);const r=oldOpen.call(this,page,...args);queueMicrotask(()=>decorate(page));return r};
  window.fccOrganizeSubcategories=open;
})();
