(()=>{
  if(window.__fccWoundDressingsOrderV2Installed)return;
  window.__fccWoundDressingsOrderV2Installed=true;

  // Category order belongs to the central navigator; do not overwrite user preferences.
  const api=window.fccWoundDressings;
  if(!api?.data?.length)return;

  const collator=new Intl.Collator('pt-PT',{sensitivity:'base',numeric:true,ignorePunctuation:true});
  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const firstLetter=name=>{const c=fold(name).match(/[A-Z]/)?.[0]||'#';return c};
  const titleOf=card=>card?.querySelector('summary strong')?.textContent?.trim()||'';

  function sortData(){api.data.sort((a,b)=>collator.compare(a?.name||'',b?.name||''))}

  function addStyles(){
    if(document.getElementById('penso-alpha-style'))return;
    const s=document.createElement('style');s.id='penso-alpha-style';s.textContent=`
      .penso-alpha-nav{margin:10px 0 12px;border:1px solid var(--line);border-radius:14px;padding:9px;background:var(--panel);overflow:hidden}
      .penso-alpha-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 7px}.penso-alpha-head strong{font-size:var(--fcc-caption,.8125rem)}.penso-alpha-head span{font-size:var(--fcc-caption,.8125rem);color:var(--muted)}
      .penso-alpha-list{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:5px}
      .penso-alpha-btn{min-width:0;height:30px;border:1px solid var(--line);border-radius:9px;background:rgba(127,127,127,.04);color:var(--text);font-size:var(--fcc-caption,.8125rem);font-weight:800;cursor:pointer;transition:transform .12s ease,border-color .12s ease,background .12s ease}
      .penso-alpha-btn:hover:not(:disabled){transform:translateY(-1px);border-color:rgba(98,212,255,.42)}
      .penso-alpha-btn.active{border-color:rgba(98,212,255,.55);background:rgba(98,212,255,.12)}
      .penso-alpha-btn:disabled{opacity:.28;cursor:default}
      .penso-alpha-btn.all{grid-column:span 2}
      @media(max-width:760px){.penso-alpha-nav{padding:8px}.penso-alpha-list{display:flex;overflow-x:auto;gap:6px;padding-bottom:2px;scrollbar-width:thin}.penso-alpha-btn{flex:0 0 34px;height:32px}.penso-alpha-btn.all{flex-basis:54px}.penso-alpha-head span{display:none}}
    `;document.head.appendChild(s)
  }

  function cards(){return [...(document.getElementById('pensoGrid')?.querySelectorAll('.penso-card')||[])]}

  function updateBar(){
    const bar=document.getElementById('pensoAlphaBar');if(!bar)return;
    const visible=cards();const available=new Set(visible.map(c=>firstLetter(titleOf(c))));
    bar.querySelectorAll('[data-alpha]').forEach(btn=>{
      const l=btn.dataset.alpha;
      if(l==='*'){btn.disabled=!visible.length;return}
      btn.disabled=!available.has(l);
      if(btn.disabled)btn.classList.remove('active');
    });
    const count=bar.querySelector('[data-alpha-count]');if(count)count.textContent=`${visible.length} material${visible.length===1?'':'is'} visível${visible.length===1?'':'eis'}`;
  }

  function goLetter(letter,btn){
    document.querySelectorAll('#pensoAlphaBar .penso-alpha-btn').forEach(x=>x.classList.remove('active'));
    btn?.classList.add('active');
    const grid=document.getElementById('pensoGrid');if(!grid)return;
    if(letter==='*'){grid.scrollIntoView({behavior:'smooth',block:'start'});return}
    const target=cards().find(c=>firstLetter(titleOf(c))===letter);
    if(target)target.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function ensureBar(){
    const grid=document.getElementById('pensoGrid');if(!grid)return false;
    addStyles();
    let bar=document.getElementById('pensoAlphaBar');
    if(!bar){
      bar=document.createElement('nav');bar.id='pensoAlphaBar';bar.className='penso-alpha-nav';bar.setAttribute('aria-label','Índice alfabético de material de penso');
      bar.innerHTML=`<div class="penso-alpha-head"><strong>Índice alfabético</strong><span data-alpha-count></span></div><div class="penso-alpha-list"><button class="penso-alpha-btn all active" type="button" data-alpha="*">Todos</button>${letters.map(l=>`<button class="penso-alpha-btn" type="button" data-alpha="${l}" aria-label="Ir para materiais com a letra ${l}">${l}</button>`).join('')}</div>`;
      grid.before(bar);
      bar.addEventListener('click',e=>{const b=e.target.closest('[data-alpha]');if(!b||b.disabled)return;goLetter(b.dataset.alpha,b)});
    }
    updateBar();return true
  }

  sortData();
  api.render?.();
  ensureBar();

  const grid=document.getElementById('pensoGrid');
  if(grid&&!grid.dataset.alphaObserved){
    grid.dataset.alphaObserved='1';
    new MutationObserver(()=>queueMicrotask(updateBar)).observe(grid,{childList:true});
  }

  setTimeout(()=>{sortData();api.render?.();ensureBar()},250);
})();
