(()=>{
  if(window.__fccMedicationInfoUXV5Installed)return;
  window.__fccMedicationInfoUXV5Installed=true;

  const LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const openSet=new Set();
  const detailCache=new Map();
  const knownLetters=new Set();
  let activeLetter='';
  let processing=false;
  let programmatic=false;
  let wasActive=false;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initial=name=>{const c=fold(name).charAt(0);return /[A-Z]/.test(c)?c:'#'};

  function addStyles(){
    if(document.getElementById('med5-style'))return;
    const s=document.createElement('style');s.id='med5-style';s.textContent=`
      .med5-alpha-wrap{margin-top:10px;border-top:1px solid var(--line);padding-top:9px}.med5-alpha-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.med5-alpha-head span{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:900}.med5-alpha{display:flex;gap:4px;overflow-x:auto;padding:1px 0 4px;scrollbar-width:thin}.med5-alpha button{flex:0 0 auto;min-width:28px;height:28px;border:1px solid var(--line);border-radius:8px;background:var(--panel-2);color:var(--muted);font-size:9px;font-weight:900;cursor:pointer}.med5-alpha button:hover{border-color:var(--line-strong);color:var(--text)}.med5-alpha button.active{background:var(--clinical-soft);border-color:rgba(98,212,255,.48);color:var(--clinical)}.med5-alpha button:disabled{opacity:.25;cursor:default}.med5-alpha .med5-all{min-width:48px}.med5-detail-row{grid-column:1/-1;margin:2px 0 7px}.med5-detail-row .med4-detail{margin:0}.med4-mini.med5-open{border-color:rgba(98,212,255,.42);background:var(--clinical-soft)}.med4-mini.med5-open:after{content:'−';float:right;color:var(--clinical);font-size:13px}.med4-mini:not(.med5-open):after{content:'+';float:right;color:var(--muted);font-size:12px}.med5-empty{grid-column:1/-1;border:1px dashed var(--line);border-radius:12px;padding:12px;color:var(--muted);font-size:9px;text-align:center}
      html[data-fcc-theme="light"] .med5-alpha button{background:#fff!important}
      @media(max-width:640px){.med5-alpha-wrap{margin-top:8px}.med5-alpha button{min-width:30px;height:30px}}
    `;document.head.appendChild(s);
  }

  function root(){return document.getElementById('med4Results')}
  function input(){return document.getElementById('med4Search')}
  function group(){return document.getElementById('med4Group')}
  function suggestBox(){return document.getElementById('med4Suggest')}

  function ensureAlphabet(){
    const shell=document.querySelector('#clin-drugs .med4-shell');if(!shell||document.getElementById('med5Alpha'))return;
    const card=shell.querySelector('.card.full');if(!card)return;
    const wrap=document.createElement('div');wrap.className='med5-alpha-wrap';
    wrap.innerHTML=`<div class="med5-alpha-head"><span>Filtro alfabético</span><span id="med5AlphaCount">Todos</span></div><div class="med5-alpha" id="med5Alpha"><button class="med5-all active" type="button" data-letter="">Todos</button>${LETTERS.map(l=>`<button type="button" data-letter="${l}">${l}</button>`).join('')}</div>`;
    card.appendChild(wrap);
    wrap.querySelectorAll('[data-letter]').forEach(b=>b.addEventListener('click',()=>selectLetter(b.dataset.letter||'')));
  }

  function updateAlphabet(){
    const bar=document.getElementById('med5Alpha');if(!bar)return;
    bar.querySelectorAll('[data-letter]').forEach(b=>{
      const l=b.dataset.letter||'';
      b.classList.toggle('active',l===activeLetter);
      if(l)b.disabled=knownLetters.size>0&&!knownLetters.has(l);
    });
  }

  function captureLetters(buttons){buttons.forEach(b=>{const l=initial(b.dataset.med4||b.textContent);if(l!=='#')knownLetters.add(l)});updateAlphabet()}

  function sortButtons(list){
    const buttons=[...list.querySelectorAll(':scope > .med4-mini')];
    const sorted=buttons.slice().sort((a,b)=>(a.dataset.med4||a.textContent).localeCompare(b.dataset.med4||b.textContent,'pt',{sensitivity:'base'}));
    const changed=buttons.some((b,i)=>b!==sorted[i]);
    if(changed)sorted.forEach(b=>list.appendChild(b));
    return sorted;
  }

  function captureDetail(name,original){
    const q=input()?.value||'';
    const g=group()?.value||'';
    programmatic=true;
    try{
      original?.call(null);
      const d=root()?.querySelector('.med4-detail');
      if(d)detailCache.set(name,d.outerHTML);
      const restore=fold(q)===fold(name)?'':q;
      if(input())input().value=restore;
      if(group())group().value=g;
      input()?.dispatchEvent(new Event('input',{bubbles:true}));
      suggestBox()?.classList.remove('open');
    }finally{programmatic=false}
  }

  function bindButton(b){
    if(b.dataset.med5Bound==='1')return;
    const name=b.dataset.med4||b.querySelector('strong')?.textContent?.trim()||'';
    if(!name)return;
    const original=b.onclick;
    b.dataset.med5Bound='1';
    b.onclick=e=>{
      e?.preventDefault?.();e?.stopPropagation?.();
      if(openSet.has(name)){
        openSet.delete(name);
        processList();
        return false;
      }
      if(!detailCache.has(name))captureDetail(name,original);
      if(detailCache.has(name)){
        openSet.add(name);
        processList();
        requestAnimationFrame(()=>{
          const row=root()?.querySelector(`.med5-detail-row[data-name="${CSS.escape(name)}"]`);
          row?.scrollIntoView({behavior:'smooth',block:'nearest'});
        });
      }else original?.call(b,e);
      return false;
    };
  }

  function applyLetter(list,buttons){
    let shown=0;
    buttons.forEach(b=>{
      const name=b.dataset.med4||'';
      const show=!activeLetter||initial(name)===activeLetter;
      b.style.display=show?'':'none';
      if(show)shown++;
      const row=list.querySelector(`.med5-detail-row[data-name="${CSS.escape(name)}"]`);if(row)row.style.display=show?'':'none';
    });
    let empty=list.querySelector('.med5-empty');
    if(shown===0&&buttons.length){if(!empty){empty=document.createElement('div');empty.className='med5-empty';list.appendChild(empty)}empty.textContent=activeLetter?`Sem medicamentos pela letra ${activeLetter} neste filtro.`:'Sem medicamentos neste filtro.'}
    else empty?.remove();
    const count=document.getElementById('med5AlphaCount');if(count)count.textContent=activeLetter?`${activeLetter} · ${shown}`:`${shown} medicamentos`;
  }

  function processList(){
    if(processing)return;
    const r=root(),list=r?.querySelector('.med4-list');if(!r||!list)return;
    processing=true;
    try{
      list.querySelectorAll(':scope > .med5-detail-row').forEach(x=>x.remove());
      const buttons=sortButtons(list);captureLetters(buttons);
      buttons.forEach(b=>{
        bindButton(b);
        const name=b.dataset.med4||'';
        const isOpen=openSet.has(name)&&detailCache.has(name);
        b.classList.toggle('med5-open',isOpen);b.setAttribute('aria-expanded',String(isOpen));
        if(isOpen){
          const row=document.createElement('div');row.className='med5-detail-row';row.dataset.name=name;row.innerHTML=detailCache.get(name);b.after(row);
        }
      });
      applyLetter(list,buttons);
    }finally{processing=false}
  }

  function selectLetter(letter){
    activeLetter=letter;
    openSet.clear();
    programmatic=true;
    try{
      if(input())input().value='';
      input()?.dispatchEvent(new Event('input',{bubbles:true}));
      suggestBox()?.classList.remove('open');
    }finally{programmatic=false}
    updateAlphabet();
    queueMicrotask(processList);
  }

  function resetState(){
    activeLetter='';openSet.clear();
    programmatic=true;
    try{
      if(input())input().value='';
      if(group())group().value='';
      input()?.dispatchEvent(new Event('input',{bubbles:true}));
      group()?.dispatchEvent(new Event('change',{bubbles:true}));
      suggestBox()?.classList.remove('open');
    }finally{programmatic=false}
    updateAlphabet();
    setTimeout(processList,0);
  }

  function install(){
    const host=document.getElementById('clin-drugs'),r=root(),inp=input(),grp=group();
    if(!host||!r||!inp||!grp)return false;
    addStyles();ensureAlphabet();
    processList();

    const mo=new MutationObserver(()=>{if(!processing)queueMicrotask(processList)});mo.observe(r,{childList:true,subtree:false});
    inp.addEventListener('input',()=>{if(!programmatic&&activeLetter){activeLetter='';updateAlphabet()}setTimeout(processList,0)});
    grp.addEventListener('change',()=>setTimeout(processList,0));

    document.addEventListener('fcc-subtab-change',e=>{
      if(e.detail?.page==='clinical'&&e.detail?.id!=='clin-drugs'&&wasActive)resetState();
      wasActive=e.detail?.page==='clinical'&&e.detail?.id==='clin-drugs';
    });

    const page=document.getElementById('page-clinical');
    wasActive=host.classList.contains('active')&&page?.classList.contains('active');
    const activeObserver=new MutationObserver(()=>{
      const now=host.classList.contains('active')&&page?.classList.contains('active');
      if(wasActive&&!now)resetState();
      wasActive=now;
    });
    activeObserver.observe(host,{attributes:true,attributeFilter:['class']});
    if(page)activeObserver.observe(page,{attributes:true,attributeFilter:['class']});
    return true;
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>50)return;setTimeout(boot,120)};boot();
})();