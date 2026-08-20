(()=>{
  if(window.__fccRuntimeDiagnosticsV2Installed)return;
  window.__fccRuntimeDiagnosticsV2Installed=true;
  const KEY='fcc-runtime-diagnostics-v1';
  const MAX=40;
  let rows=[],moduleOK=0,moduleErrors=0;
  try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(x))rows=x.slice(-MAX)}catch(e){}
  const clean=v=>String(v??'').slice(0,1200);
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX)))}catch(e){}}
  function log(type,message,extra=''){
    const row={at:new Date().toISOString(),type:clean(type),message:clean(message),extra:clean(extra)};
    rows.push(row);if(rows.length>MAX)rows=rows.slice(-MAX);persist();render();return row;
  }
  function module(name,ok,detail=''){if(ok){moduleOK++;return}moduleErrors++;log('module-error',name,detail)}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function render(){
    const page=document.getElementById('page-settings');if(!page)return;
    let card=document.getElementById('fccRuntimeDiagnosticsCard');
    if(!card){card=document.createElement('div');card.id='fccRuntimeDiagnosticsCard';card.className='card full';const grid=page.querySelector(':scope > .grid');if(grid)grid.appendChild(card);else page.appendChild(card)}
    const errors=rows.filter(x=>x.type.includes('error')||x.type==='window-error'||x.type==='promise-error').slice(-12).reverse();
    card.innerHTML=`<div class="row"><div><span class="eyebrow">DIAGNÓSTICO</span><h3 style="margin:2px 0">Runtime / estabilidade</h3><p>Regista apenas falhas JavaScript e de carregamento neste dispositivo. Módulos carregados nesta sessão: ${moduleOK}; falhas de módulo: ${moduleErrors}.</p></div><div class="spacer"></div><span class="badge ${errors.length?'warn':'good'}">${errors.length?errors.length+' falhas recentes':'Sem falhas registadas'}</span></div><div class="actions"><button type="button" class="btn small" id="fccDiagRefresh">Atualizar</button><button type="button" class="btn small" id="fccDiagClear">Limpar registo</button></div><div class="list" style="margin-top:8px">${errors.length?errors.map(x=>`<div class="item"><div><strong>${esc(x.type)}</strong><br><span>${esc(x.message)}</span>${x.extra?`<br><span>${esc(x.extra)}</span>`:''}</div><span class="tiny">${esc(new Date(x.at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}))}</span></div>`).join(''):'<div class="item"><span>Nenhum erro JavaScript recente foi registado.</span></div>'}</div>`;
    card.querySelector('#fccDiagRefresh')?.addEventListener('click',render,{once:true});card.querySelector('#fccDiagClear')?.addEventListener('click',()=>{rows=[];persist();render()},{once:true});
  }
  window.addEventListener('error',e=>log('window-error',e.message||'Erro JavaScript',`${e.filename||''}:${e.lineno||''}:${e.colno||''}`));
  window.addEventListener('unhandledrejection',e=>log('promise-error',e.reason?.message||e.reason||'Promise rejeitada'));
  document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='settings')queueMicrotask(render)});window.addEventListener('pageshow',()=>queueMicrotask(render));
  window.FCCDiagnostics={log,module,render,get:()=>rows.slice(),stats:()=>({moduleOK,moduleErrors}),clear:()=>{rows=[];persist();render()}};
})();
