(()=>{
  if(window.__fccCategoryOrganizerInstalled)return;
  window.__fccCategoryOrganizerInstalled=true;

  const KEY='fcc-master-subcategory-order-v1';
  const PAGES=['clinical','emergency','comms','garage','research'];
  const TITLE_MAP={'Clinical OS':'clinical','Emergency':'emergency','Comms':'comms','Garage':'garage','Research':'research'};
  const original={};
  let orders={};
  let editingPage='';
  let working=[];
  let dragIndex=-1;
  let applying=false;

  try{orders=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){orders={}}

  function tabId(tab){
    const on=tab.getAttribute('onclick')||'';
    const m=on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/);
    return m?.[1]||tab.dataset.subId||tab.id||('label:'+tab.textContent.trim());
  }
  function tabs(page){return [...(document.querySelector('#page-'+page+' > .tabs')?.querySelectorAll('.tab')||[])]}
  function capture(page){
    const ids=tabs(page).map(tabId);
    if(!original[page])original[page]=[...ids];
    else ids.forEach(id=>{if(!original[page].includes(id))original[page].push(id)});
  }
  function normalized(page,src){
    const all=tabs(page).map(tabId);
    const out=(src||[]).filter(id=>all.includes(id));
    all.forEach(id=>{if(!out.includes(id))out.push(id)});
    return out;
  }
  function applyOrder(page){
    if(applying)return;
    const wrap=document.querySelector('#page-'+page+' > .tabs');if(!wrap)return;
    capture(page);
    const order=normalized(page,orders[page]);
    if(!order.length)return;
    const map=new Map(tabs(page).map(t=>[tabId(t),t]));
    applying=true;
    order.forEach(id=>{const t=map.get(id);if(t)wrap.appendChild(t)});
    applying=false;
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(orders))}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function addStyles(){
    if(document.getElementById('fcc-organizer-style'))return;
    const st=document.createElement('style');st.id='fcc-organizer-style';st.textContent=`
      .fcc-sheet-actions{display:flex;gap:7px;align-items:center}.fcc-organize-trigger{height:38px;padding:0 11px;border-radius:12px;border:1px solid var(--line);background:var(--panel-2);color:var(--muted);font-size:9px;font-weight:800;cursor:pointer}.fcc-organize-trigger:hover{color:var(--text);border-color:var(--line-strong)}
      .fcc-org-backdrop{position:fixed;inset:0;z-index:260;background:rgba(1,7,12,.76);backdrop-filter:blur(12px);display:none;place-items:center;padding:16px}.fcc-org-backdrop.open{display:grid}
      .fcc-org-box{width:min(560px,100%);max-height:min(82vh,760px);overflow:auto;border:1px solid var(--line-strong);border-radius:23px;background:linear-gradient(160deg,var(--panel),var(--bg-soft));box-shadow:0 30px 90px rgba(0,0,0,.42);padding:17px}
      .fcc-org-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;margin-bottom:12px}.fcc-org-head h3{margin:0;font-size:21px}.fcc-org-head p{margin:4px 0 0;color:var(--muted);font-size:9px;line-height:1.45}.fcc-org-close{width:36px;height:36px;border:1px solid var(--line);border-radius:11px;background:var(--panel-2);color:var(--text);cursor:pointer}
      .fcc-org-list{display:grid;gap:6px}.fcc-org-item{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:9px;align-items:center;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:8px;transition:.12s ease}.fcc-org-item.dragging{opacity:.45}.fcc-org-handle{font-size:16px;color:var(--muted);text-align:center;cursor:grab;user-select:none}.fcc-org-item strong{font-size:10px}.fcc-org-item small{display:block;color:var(--muted);font-size:8px;margin-top:2px}.fcc-org-move{display:flex;gap:4px}.fcc-org-move button{width:30px;height:30px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text);cursor:pointer}.fcc-org-move button:disabled{opacity:.25;cursor:default}
      .fcc-org-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px;padding-top:12px;border-top:1px solid var(--line)}
      html[data-fcc-theme="light"] .fcc-org-backdrop{background:rgba(35,58,69,.25)!important}html[data-fcc-theme="light"] .fcc-org-box{box-shadow:0 30px 80px rgba(31,62,76,.18)!important}
      @media(max-width:640px){.fcc-org-backdrop{align-items:end;padding:8px}.fcc-org-box{width:100%;max-height:82vh;border-radius:22px}.fcc-organize-trigger{height:36px;padding:0 9px}}
    `;document.head.appendChild(st);
  }

  function ensureModal(){
    if(document.getElementById('fccOrgModal'))return;
    const m=document.createElement('div');m.id='fccOrgModal';m.className='fcc-org-backdrop';
    m.innerHTML='<section class="fcc-org-box" role="dialog" aria-modal="true"><div class="fcc-org-head"><div><h3>Organizar subcategorias</h3><p id="fccOrgHint">A ordem guardada passa a ser usada neste dispositivo.</p></div><button class="fcc-org-close" type="button">×</button></div><div class="fcc-org-list" id="fccOrgList"></div><div class="fcc-org-actions"><button class="btn primary" type="button" id="fccOrgSave">Guardar ordem</button><button class="btn" type="button" id="fccOrgReset">Repor ordem original</button><button class="btn" type="button" id="fccOrgCancel">Cancelar</button></div></section>';
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m)close()});
    m.querySelector('.fcc-org-close').addEventListener('click',close);
    document.getElementById('fccOrgCancel').addEventListener('click',close);
    document.getElementById('fccOrgSave').addEventListener('click',commit);
    document.getElementById('fccOrgReset').addEventListener('click',resetWorking);
  }

  function pageLabel(page){return ({clinical:'Clinical OS',emergency:'Emergency',comms:'Comms',garage:'Garage',research:'Research'})[page]||page}
  function open(page){
    capture(page);editingPage=page;working=normalized(page,orders[page]||original[page]);
    ensureModal();render();
    document.querySelector('#fccOrgModal h3').textContent='Organizar · '+pageLabel(page);
    document.getElementById('fccOrgModal').classList.add('open');
  }
  function close(){document.getElementById('fccOrgModal')?.classList.remove('open');editingPage='';working=[]}
  function resetWorking(){working=normalized(editingPage,original[editingPage]||[]);render()}
  function move(i,delta){const j=i+delta;if(j<0||j>=working.length)return;[working[i],working[j]]=[working[j],working[i]];render()}
  function commit(){
    if(!editingPage)return;
    orders[editingPage]=[...working];save();applyOrder(editingPage);close();
    document.getElementById('fcc-category-sheet')?.classList.remove('open');document.getElementById('fcc-sheet-backdrop')?.classList.remove('open');
    if(typeof toast==='function')toast('Ordem das subcategorias guardada');
  }
  function render(){
    const list=document.getElementById('fccOrgList');if(!list)return;
    const map=new Map(tabs(editingPage).map(t=>[tabId(t),t]));
    list.innerHTML=working.map((id,i)=>{
      const t=map.get(id),label=t?.textContent.trim()||id;
      return `<div class="fcc-org-item" draggable="true" data-i="${i}"><div class="fcc-org-handle" title="Arrastar">≡</div><div><strong>${esc(label)}</strong><small>Posição ${i+1}</small></div><div class="fcc-org-move"><button type="button" data-up="${i}" ${i===0?'disabled':''} aria-label="Mover para cima">↑</button><button type="button" data-down="${i}" ${i===working.length-1?'disabled':''} aria-label="Mover para baixo">↓</button></div></div>`;
    }).join('');
    list.querySelectorAll('[data-up]').forEach(b=>b.addEventListener('click',()=>move(+b.dataset.up,-1)));
    list.querySelectorAll('[data-down]').forEach(b=>b.addEventListener('click',()=>move(+b.dataset.down,1)));
    list.querySelectorAll('.fcc-org-item').forEach(item=>{
      item.addEventListener('dragstart',()=>{dragIndex=+item.dataset.i;item.classList.add('dragging')});
      item.addEventListener('dragend',()=>{dragIndex=-1;item.classList.remove('dragging')});
      item.addEventListener('dragover',e=>e.preventDefault());
      item.addEventListener('drop',e=>{e.preventDefault();const to=+item.dataset.i;if(dragIndex<0||to===dragIndex)return;const [x]=working.splice(dragIndex,1);working.splice(to,0,x);dragIndex=-1;render()});
    });
  }

  function currentSheetPage(sheet){return TITLE_MAP[sheet.querySelector('.fcc-sheet-head h3')?.textContent.trim()]||''}
  function decorateSheet(){
    const sheet=document.getElementById('fcc-category-sheet');if(!sheet||!sheet.classList.contains('open'))return;
    const page=currentSheetPage(sheet);if(!page)return;
    const head=sheet.querySelector('.fcc-sheet-head');if(!head||head.querySelector('.fcc-organize-trigger'))return;
    const closeBtn=head.querySelector('.fcc-sheet-close');
    const actions=document.createElement('div');actions.className='fcc-sheet-actions';
    const b=document.createElement('button');b.type='button';b.className='fcc-organize-trigger';b.textContent='Organizar';b.addEventListener('click',e=>{e.stopPropagation();open(page)});
    if(closeBtn){head.insertBefore(actions,closeBtn);actions.append(b,closeBtn)}else{actions.appendChild(b);head.appendChild(actions)}
  }

  function watchTabs(){
    PAGES.forEach(page=>{
      const wrap=document.querySelector('#page-'+page+' > .tabs');if(!wrap)return;
      capture(page);applyOrder(page);
      const ob=new MutationObserver(()=>{if(applying)return;capture(page);setTimeout(()=>applyOrder(page),0)});ob.observe(wrap,{childList:true});
    });
  }
  function watchSheet(){
    const bodyObs=new MutationObserver(()=>{
      const sheet=document.getElementById('fcc-category-sheet');if(!sheet||sheet.dataset.orgObserved)return;
      sheet.dataset.orgObserved='1';
      const ob=new MutationObserver(()=>setTimeout(decorateSheet,0));ob.observe(sheet,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    });
    bodyObs.observe(document.body,{childList:true,subtree:true});
    setTimeout(decorateSheet,0);
  }

  addStyles();ensureModal();
  const init=()=>{watchTabs();watchSheet();PAGES.forEach(applyOrder)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.fccOrganizeSubcategories=open;
})();
