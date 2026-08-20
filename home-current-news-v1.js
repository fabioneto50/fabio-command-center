(()=>{
  if(window.__fccHomeCurrentNewsV5Installed)return;
  window.__fccHomeCurrentNewsV5Installed=true;

  const FEED='./news-feed.json';
  const CACHE_KEY='fcc-home-news-cache-v4';
  const MAX_ARTICLES=10;
  let loading=false;

  const FALLBACK={
    updatedAt:'2026-08-20T16:00:00Z',
    health:[
      {title:'Atualizações de saúde pública e emergências',url:'https://www.who.int/emergencies',source:'OMS',publishedAt:'2026-08-20T00:00:00Z',description:'Informação recente sobre saúde pública, surtos e resposta internacional da Organização Mundial da Saúde.',image:''},
      {title:'Atualidade do Serviço Nacional de Saúde',url:'https://www.sns.gov.pt/',source:'SNS',publishedAt:'2026-08-20T00:00:00Z',description:'Notícias, informação institucional e atualizações relevantes do Serviço Nacional de Saúde em Portugal.',image:''},
      {title:'Informação de saúde pública em Portugal',url:'https://www.dgs.pt/',source:'DGS',publishedAt:'2026-08-20T00:00:00Z',description:'Atualizações e recomendações da Direção-Geral da Saúde.',image:''},
      {title:'Emergência médica em Portugal',url:'https://www.inem.pt/',source:'INEM',publishedAt:'2026-08-20T00:00:00Z',description:'Informação institucional e atualizações de emergência médica pré-hospitalar.',image:''}
    ],
    world:[
      {title:'Atualidade internacional',url:'https://www.reuters.com/world/',source:'Reuters',publishedAt:'2026-08-20T00:00:00Z',description:'Principais desenvolvimentos internacionais, diplomáticos e geopolíticos.',image:''},
      {title:'Notícias do mundo',url:'https://apnews.com/world-news',source:'AP',publishedAt:'2026-08-20T00:00:00Z',description:'Cobertura internacional dos principais acontecimentos mundiais.',image:''},
      {title:'Atualidade europeia e mundial',url:'https://www.euronews.com/',source:'Euronews',publishedAt:'2026-08-20T00:00:00Z',description:'Notícias europeias e internacionais em atualização.',image:''},
      {title:'Cobertura internacional',url:'https://www.bbc.com/news/world',source:'BBC',publishedAt:'2026-08-20T00:00:00Z',description:'Contexto e informação sobre os principais acontecimentos internacionais.',image:''}
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
      #page-home .grid{grid-template-columns:1fr;gap:18px}
      #page-home .hero{padding-bottom:24px}
      .home-news-card{grid-column:1/-1;overflow:hidden;padding:18px}
      .home-news-head{display:flex;gap:14px;align-items:center;justify-content:space-between;margin-bottom:14px}
      .home-news-head h3{font-size:21px!important;margin:2px 0 0}
      .home-news-meta{color:var(--muted);font-size:12px!important;margin-top:4px}
      .home-news-controls{display:flex;align-items:center;gap:7px;flex:0 0 auto}
      .home-news-arrow{width:40px;height:40px;padding:0!important;border-radius:999px!important;font-size:21px!important;display:grid;place-items:center}
      .home-news-arrow:disabled{opacity:.35;cursor:default;transform:none!important}
      .home-news-viewport{overflow:hidden;border-radius:16px;touch-action:pan-y pinch-zoom}
      .home-news-track{display:flex;transition:transform .32s cubic-bezier(.2,.75,.25,1);will-change:transform}
      .home-news-slide{flex:0 0 100%;min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:1px}
      .home-news-item{min-width:0;display:flex;flex-direction:column;text-decoration:none;border:1px solid var(--line);border-radius:17px;background:var(--panel-2);overflow:hidden;transition:border-color .15s ease,transform .15s ease;min-height:380px}
      .home-news-item:hover{border-color:var(--line-strong);transform:translateY(-2px)}
      .home-news-media{height:200px;background:var(--panel-3);position:relative;overflow:hidden}
      .home-news-media img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .3s ease}
      .home-news-item:hover .home-news-media img{transform:scale(1.025)}
      .home-news-media-fallback{width:100%;height:100%;display:grid;place-items:center;color:rgba(255,255,255,.86);font-size:46px;font-weight:850;letter-spacing:-.05em}
      .home-news-media-fallback.health{background:linear-gradient(135deg,rgba(22,133,173,.96),rgba(23,84,111,.82))}
      .home-news-media-fallback.world{background:linear-gradient(135deg,rgba(101,86,199,.94),rgba(43,69,116,.84))}
      .home-news-body{display:flex;flex-direction:column;flex:1;padding:16px 17px 17px}
      .home-news-kicker{font-size:11px!important;text-transform:uppercase;letter-spacing:.065em;color:var(--muted);font-weight:800;margin-bottom:8px}
      .home-news-item strong{display:block;font-size:18px!important;line-height:1.3;color:var(--text);letter-spacing:-.015em}
      .home-news-desc{font-size:14px!important;line-height:1.55;color:var(--muted);margin:10px 0 15px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
      .home-news-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--muted)}
      .home-news-source{text-transform:uppercase;letter-spacing:.05em;font-weight:800;color:var(--text)}
      .home-news-read{font-weight:800;color:var(--clinical);white-space:nowrap}
      .home-news-dots{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:13px;min-height:10px}
      .home-news-dot{width:8px;height:8px;border:0;border-radius:999px;padding:0;background:var(--line-strong);cursor:pointer;transition:.2s ease}
      .home-news-dot.active{width:26px;background:var(--clinical)}
      .home-news-empty{padding:24px;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:13px}
      @media(max-width:720px){
        .home-news-card{padding:14px}
        .home-news-head{align-items:flex-start}
        .home-news-head h3{font-size:19px!important}
        .home-news-refresh{display:none}
        .home-news-slide{grid-template-columns:1fr;gap:12px}
        .home-news-item{min-height:0}
        .home-news-media{height:190px}
        .home-news-item strong{font-size:18px!important}
        .home-news-desc{font-size:14px!important;-webkit-line-clamp:4}
        .home-news-body{padding:14px 15px 15px}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureShell(){
    window.fccBuildPublicHome?.();
    return !!(document.getElementById('homeHealthNewsList')&&document.getElementById('homeWorldNewsList'));
  }

  function normalize(rows){
    const seen=new Set();
    return (Array.isArray(rows)?rows:[]).filter(x=>{
      const url=safe(x?.articleUrl||x?.url),title=String(x?.title||'').trim();
      if(!url||!title)return false;
      const key=title.toLowerCase()+'|'+url;
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    }).slice(0,MAX_ARTICLES);
  }

  function pairs(items){
    const out=[];
    for(let i=0;i<items.length;i+=2)out.push(items.slice(i,i+2));
    return out;
  }

  function articleCard(kind,x){
    const url=safe(x.articleUrl||x.url);
    const image=safe(x.image);
    const desc=String(x.description||'').trim()||`Leia os principais detalhes desta notícia publicada por ${x.source||'a fonte original'}.`;
    const visual=image
      ?`<img src="${esc(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-news-image>`
      :`<div class="home-news-media-fallback ${kind}">${kind==='health'?'✚':'◎'}</div>`;
    return `<a class="home-news-item" href="${esc(url)}" target="_blank" rel="noopener"><div class="home-news-media">${visual}</div><div class="home-news-body"><div class="home-news-kicker">${esc(x.source||'Fonte')}${x.publishedAt?' · '+esc(formatDate(x.publishedAt)):''}</div><strong>${esc(x.title)}</strong><div class="home-news-desc">${esc(desc)}</div><div class="home-news-foot"><span class="home-news-source">${esc(x.source||'Fonte')}</span><span class="home-news-read">Ler notícia →</span></div></div></a>`;
  }

  function installCarousel(kind,list,items){
    const slides=pairs(items);
    if(!slides.length){
      list.innerHTML='<div class="home-news-empty">Sem notícias disponíveis neste momento.</div>';
      return;
    }

    list.innerHTML=`<div class="home-news-viewport"><div class="home-news-track">${slides.map(pair=>`<div class="home-news-slide">${pair.map(x=>articleCard(kind,x)).join('')}</div>`).join('')}</div></div><div class="home-news-dots">${slides.map((_,i)=>`<button type="button" class="home-news-dot${i===0?' active':''}" aria-label="Grupo ${i+1} de notícias"></button>`).join('')}</div>`;

    list.querySelectorAll('[data-news-image]').forEach(img=>{
      img.addEventListener('error',()=>{
        const media=img.closest('.home-news-media');
        if(media)media.innerHTML=`<div class="home-news-media-fallback ${kind}">${kind==='health'?'✚':'◎'}</div>`;
      },{once:true});
    });

    const viewport=list.querySelector('.home-news-viewport');
    const track=list.querySelector('.home-news-track');
    const dots=[...list.querySelectorAll('.home-news-dot')];
    const card=list.closest('.home-news-card');
    const prev=card?.querySelector('[data-news-prev]');
    const next=card?.querySelector('[data-news-next]');
    let index=0,startX=0,deltaX=0,dragging=false;

    const go=n=>{
      index=Math.max(0,Math.min(slides.length-1,n));
      track.style.transform=`translate3d(${-index*100}%,0,0)`;
      dots.forEach((d,i)=>d.classList.toggle('active',i===index));
      if(prev)prev.disabled=index===0;
      if(next)next.disabled=index===slides.length-1;
    };

    dots.forEach((d,i)=>d.onclick=()=>go(i));
    if(prev)prev.onclick=()=>go(index-1);
    if(next)next.onclick=()=>go(index+1);

    viewport.addEventListener('touchstart',e=>{
      startX=e.touches[0]?.clientX||0;
      deltaX=0;
      dragging=true;
    },{passive:true});
    viewport.addEventListener('touchmove',e=>{
      if(dragging)deltaX=(e.touches[0]?.clientX||startX)-startX;
    },{passive:true});
    viewport.addEventListener('touchend',()=>{
      if(!dragging)return;
      dragging=false;
      if(Math.abs(deltaX)>45)go(index+(deltaX<0?1:-1));
    },{passive:true});

    go(0);
  }

  function renderList(kind,rows,updatedAt,mode='feed'){
    const list=document.getElementById(kind==='health'?'homeHealthNewsList':'homeWorldNewsList');
    const meta=document.getElementById(kind==='health'?'homeHealthNewsMeta':'homeWorldNewsMeta');
    if(!list)return;
    installCarousel(kind,list,normalize(rows));
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
      save(feed);
      renderFeed(feed,'feed');
    }catch(e){
      const c=cached();
      renderFeed(c||FALLBACK,c?'feed':'fallback');
      window.FCCDiagnostics?.log('home-news-error',e?.message||String(e));
    }finally{
      loading=false;
      buttons.forEach(b=>b.disabled=false);
    }
  }

  function bindButtons(){
    ['homeHealthNewsRefresh','homeWorldNewsRefresh'].forEach(id=>{
      const b=document.getElementById(id);
      if(b&&!b.dataset.bound){
        b.dataset.bound='1';
        b.addEventListener('click',()=>load(true));
      }
    });
  }

  function install(){
    if(!ensureShell()){setTimeout(install,120);return}
    addStyles();
    bindButtons();
    const c=cached();
    renderFeed(c||FALLBACK,c?'feed':'fallback');
    if(homeActive())load(false);
    document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='home'){bindButtons();load(false)}});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&homeActive())load(false)});
  }

  install();
})();
