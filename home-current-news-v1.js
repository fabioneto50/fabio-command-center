(()=>{
  if(window.__fccHomeCurrentNewsV4Installed)return;
  window.__fccHomeCurrentNewsV4Installed=true;

  const FEED='./news-feed.json';
  const CACHE_KEY='fcc-home-news-cache-v3';
  const MAX_ARTICLES=10;
  let loading=false;

  const FALLBACK={
    updatedAt:'2026-08-20T16:00:00Z',
    health:[
      {title:'OMS diz que surto de Ébola no Congo ainda pode ser controlado em três meses',url:'https://www.reuters.com/business/healthcare-pharmaceuticals/who-says-congo-ebola-outbreak-can-still-be-brought-under-control-within-three-2026-08-18/',source:'Reuters',publishedAt:'2026-08-18T00:00:00Z'},
      {title:'França registou 1.243 mortes em excesso durante as vagas de calor de julho',url:'https://www.reuters.com/business/healthcare-pharmaceuticals/france-recorded-1243-excess-deaths-during-july-3-july-22-heatwaves-2026-08-19/',source:'Reuters',publishedAt:'2026-08-19T00:00:00Z'},
      {title:'Ataques a cuidados de saúde em zonas de conflito ultrapassam quatro por dia em 2026',url:'https://www.reuters.com/world/asia-pacific/attacks-healthcare-conflict-zones-averaging-more-than-four-day-2026-world-health-2026-08-14/',source:'Reuters',publishedAt:'2026-08-14T00:00:00Z'},
      {title:'Ébola por vírus Bundibugyo na República Democrática do Congo',url:'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON615',source:'OMS',publishedAt:'2026-08-14T00:00:00Z'}
    ],
    world:[
      {title:'Irão rejeita ameaças económicas dos EUA entre novos desenvolvimentos no Médio Oriente',url:'https://apnews.com/article/bbc5df71e56f000515edef0817468c9d',source:'AP',publishedAt:'2026-08-20T00:00:00Z'},
      {title:'Ataques russos matam pelo menos 16 pessoas na região de Kyiv',url:'https://www.reuters.com/world/ukrainian-capital-kyiv-under-attack-by-russian-ballistic-missiles-mayor-says-2026-08-19/',source:'Reuters',publishedAt:'2026-08-20T00:00:00Z'},
      {title:'Kremlin diz que apelo a eleições mostra divisões políticas em Kyiv',url:'https://www.reuters.com/world/kremlin-says-ousted-ukrainian-ministers-call-elections-shows-splits-kyiv-2026-08-20/',source:'Reuters',publishedAt:'2026-08-20T00:00:00Z'},
      {title:'Ministro dos Negócios Estrangeiros chinês visita a Coreia do Sul',url:'https://www.reuters.com/world/china/chinas-foreign-minister-wang-yi-visit-south-korea-august-19-20-2026-08-18/',source:'Reuters',publishedAt:'2026-08-18T00:00:00Z'}
    ]
  };

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safe=u=>{try{const x=new URL(String(u||''),location.href);return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return''}};
  const homeActive=()=>document.getElementById('page-home')?.classList.contains('active');
  const formatDate=v=>{const d=new Date(v||'');return isNaN(d)?'':d.toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})};

  function addStyles(){
    if(document.getElementById('fcc-home-news-style'))return;
    const s=document.createElement('style');
    s.id='fcc-home-news-style';
    s.textContent=`
      #page-home .grid{grid-template-columns:1fr}
      .home-news-card{grid-column:1/-1}
      .home-news-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
      .home-news-meta{color:var(--muted);font-size:10px;margin-top:4px}
      .home-news-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
      .home-news-item{display:block;text-decoration:none;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:12px;transition:border-color .14s ease,transform .14s ease}
      .home-news-item:hover{border-color:var(--line-strong);transform:translateY(-1px)}
      .home-news-item strong{display:block;font-size:12px;line-height:1.42;color:var(--text)}
      .home-news-item span{display:block;color:var(--muted);font-size:9px;margin-top:6px}
      .home-news-source{text-transform:uppercase;letter-spacing:.05em}
      .home-news-empty{grid-column:1/-1;padding:18px;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:10px}
      @media(max-width:720px){.home-news-list{grid-template-columns:1fr}.home-news-head{align-items:center}}
    `;
    document.head.appendChild(s);
  }

  function ensureShell(){window.fccBuildPublicHome?.();return !!(document.getElementById('homeHealthNewsList')&&document.getElementById('homeWorldNewsList'))}
  function normalize(rows){
    const seen=new Set();
    return (Array.isArray(rows)?rows:[]).filter(x=>{
      const url=safe(x?.url),title=String(x?.title||'').trim();if(!url||!title)return false;
      const key=title.toLowerCase()+'|'+url;if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,MAX_ARTICLES);
  }
  function renderList(kind,rows,updatedAt,mode='feed'){
    const list=document.getElementById(kind==='health'?'homeHealthNewsList':'homeWorldNewsList');
    const meta=document.getElementById(kind==='health'?'homeHealthNewsMeta':'homeWorldNewsMeta');
    if(!list)return;
    const items=normalize(rows);
    list.innerHTML=items.length?items.map(x=>`<a class="home-news-item" href="${esc(safe(x.url))}" target="_blank" rel="noopener"><strong>${esc(x.title)}</strong><span><b class="home-news-source">${esc(x.source||'Fonte')}</b>${x.publishedAt?' · '+esc(formatDate(x.publishedAt)):''}</span></a>`).join(''):'<div class="home-news-empty">Sem notícias disponíveis neste momento.</div>';
    if(meta){
      const stamp=formatDate(updatedAt)||formatDate(new Date());
      meta.textContent=mode==='fallback'?`Reserva local · ${stamp}`:`Atualizado · ${stamp}`;
    }
  }
  function renderFeed(feed,mode='feed'){
    renderList('health',feed?.health,feed?.updatedAt,mode);
    renderList('world',feed?.world,feed?.updatedAt,mode);
  }
  function cached(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'null')}catch(e){return null}}
  function save(feed){try{localStorage.setItem(CACHE_KEY,JSON.stringify(feed))}catch(e){}}

  async function fetchFeed(){
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),7000);
    try{
      const r=await fetch(`${FEED}?t=${Date.now()}`,{cache:'no-store',signal:ctrl.signal,headers:{Accept:'application/json'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(normalize(data?.health).length<2||normalize(data?.world).length<2)throw new Error('feed incompleto');
      return data;
    }finally{clearTimeout(timer)}
  }

  async function load(force=false){
    if(loading||!ensureShell())return;
    loading=true;
    const buttons=['homeHealthNewsRefresh','homeWorldNewsRefresh'].map(id=>document.getElementById(id)).filter(Boolean);
    buttons.forEach(b=>b.disabled=true);
    try{
      const c=cached();
      if(c&&!force)renderFeed(c,'feed');else if(!c)renderFeed(FALLBACK,'fallback');
      const feed=await fetchFeed();
      save(feed);renderFeed(feed,'feed');
    }catch(e){
      const c=cached();
      renderFeed(c||FALLBACK,c?'feed':'fallback');
      window.FCCDiagnostics?.log('home-news-error',e?.message||String(e));
    }finally{loading=false;buttons.forEach(b=>b.disabled=false)}
  }

  function bindButtons(){
    ['homeHealthNewsRefresh','homeWorldNewsRefresh'].forEach(id=>{
      const b=document.getElementById(id);if(b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',()=>load(true))}
    });
  }
  function install(){
    if(!ensureShell()){setTimeout(install,120);return}
    addStyles();bindButtons();renderFeed(cached()||FALLBACK,cached()?'feed':'fallback');
    if(homeActive())load(false);
    document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='home'){bindButtons();load(false)}});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&homeActive())load(false)});
  }

  install();
})();
