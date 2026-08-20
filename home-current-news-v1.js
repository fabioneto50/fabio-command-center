(()=>{
  if(window.__fccHomeCurrentNewsV3Installed)return;
  window.__fccHomeCurrentNewsV3Installed=true;

  const CACHE_KEY='fcc-home-news-cache-v2';
  const API='https://api.gdeltproject.org/api/v2/doc/doc';
  const MAX_ARTICLES=12;
  let loading=false;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safe=u=>{try{const x=new URL(String(u||''));return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return''}};
  const homeActive=()=>document.getElementById('page-home')?.classList.contains('active');

  function addStyles(){
    if(document.getElementById('fcc-home-news-style'))return;
    const s=document.createElement('style');
    s.id='fcc-home-news-style';
    s.textContent=`
      .home-news-card{grid-column:1/-1}
      .home-news-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
      .home-news-meta{color:var(--muted);font-size:10px;margin-top:4px}
      .home-news-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
      .home-news-item{display:block;text-decoration:none;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:12px;transition:border-color .14s ease,transform .14s ease}
      .home-news-item:hover{border-color:var(--line-strong);transform:translateY(-1px)}
      .home-news-item strong{display:block;font-size:12px;line-height:1.4;color:var(--text)}
      .home-news-item span{display:block;color:var(--muted);font-size:9px;margin-top:6px}
      .home-news-source{text-transform:uppercase;letter-spacing:.05em}
      .home-news-empty{grid-column:1/-1;padding:18px;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:10px}
      @media(max-width:720px){.home-news-list{grid-template-columns:1fr}.home-news-head{align-items:center}}
    `;
    document.head.appendChild(s);
  }

  function ensureNews(){
    const grid=document.querySelector('#page-home > .grid');
    if(!grid)return false;
    let card=document.getElementById('homeCurrentNewsCard');
    if(!card){
      card=document.createElement('div');
      card.className='card full home-news-card';
      card.id='homeCurrentNewsCard';
      card.innerHTML='<div class="home-news-head"><div><span class="eyebrow">ATUALIDADE</span><h3>Notícias recentes</h3><div class="home-news-meta" id="homeNewsMeta">A preparar notícias…</div></div><button class="btn small" id="homeNewsRefresh" type="button">Atualizar</button></div><div class="home-news-list" id="homeNewsList"><div class="home-news-empty">A carregar notícias…</div></div><div class="tiny" style="margin-top:9px">Fontes da imprensa portuguesa agregadas através do GDELT. Abre sempre a notícia original para leitura e verificação.</div>';
      const clinical=document.getElementById('homeClinicalCard');
      if(clinical)clinical.after(card);else grid.prepend(card);
    }
    const refresh=document.getElementById('homeNewsRefresh');
    if(refresh&&!refresh.dataset.bound){refresh.dataset.bound='1';refresh.addEventListener('click',()=>load(true))}
    return true;
  }

  function articleDate(v){
    const s=String(v||'');
    if(/^\d{14}$/.test(s)){
      const d=new Date(Date.UTC(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8),+s.slice(8,10),+s.slice(10,12),+s.slice(12,14)));
      return isNaN(d)?'':d.toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'});
    }
    const d=new Date(s);
    return isNaN(d)?'':d.toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'});
  }

  function render(articles,meta=''){
    if(!ensureNews())return;
    const list=document.getElementById('homeNewsList'),m=document.getElementById('homeNewsMeta');
    if(!list)return;
    const rows=(articles||[]).filter(x=>safe(x.url)&&x.title).slice(0,MAX_ARTICLES);
    list.innerHTML=rows.length?rows.map(x=>`<a class="home-news-item" href="${esc(safe(x.url))}" target="_blank" rel="noopener"><strong>${esc(x.title)}</strong><span><b class="home-news-source">${esc(x.domain||'fonte')}</b>${x.seendate?' · '+esc(articleDate(x.seendate)):''}</span></a>`).join(''):'<div class="home-news-empty">Não foi possível obter notícias recentes neste momento. Usa “Atualizar” para tentar novamente.</div>';
    if(m)m.textContent=meta||`Atualizado ${new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}`;
  }

  function cached(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'null')}catch(e){return null}}
  function save(rows){try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),articles:rows}))}catch(e){}}

  async function request(span){
    const u=new URL(API);
    u.searchParams.set('query','sourcecountry:portugal');
    u.searchParams.set('mode','ArtList');
    u.searchParams.set('format','json');
    u.searchParams.set('maxrecords','24');
    u.searchParams.set('sort','datedesc');
    u.searchParams.set('timespan',span);
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);
    try{
      const r=await fetch(u,{cache:'no-store',signal:ctrl.signal,headers:{Accept:'application/json'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const j=await r.json();
      return Array.isArray(j.articles)?j.articles:[];
    }finally{clearTimeout(timer)}
  }

  async function load(force=false){
    if(loading||!ensureNews())return;
    const c=cached();
    if(c?.articles?.length)render(c.articles,`Última atualização guardada · ${new Date(c.savedAt).toLocaleString('pt-PT')}`);
    if(!force&&c?.savedAt&&Date.now()-c.savedAt<10*60*1000)return;
    loading=true;
    const meta=document.getElementById('homeNewsMeta'),btn=document.getElementById('homeNewsRefresh');
    if(meta)meta.textContent='A atualizar notícias…';if(btn)btn.disabled=true;
    try{
      let rows=await request('24h');
      if(rows.length<6)rows=await request('72h');
      const seen=new Set();
      rows=rows.filter(x=>{const k=(safe(x.url)||'')+'|'+String(x.title||'').trim().toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true});
      save(rows);render(rows);
    }catch(e){
      window.FCCDiagnostics?.log('home-news-error',e?.message||String(e));
      if(!c?.articles?.length)render([],navigator.onLine?'Serviço de notícias temporariamente indisponível':'Offline · sem notícias guardadas');
    }finally{loading=false;if(btn)btn.disabled=false}
  }

  function install(){
    if(!ensureNews()){setTimeout(install,150);return}
    if(homeActive())load(false);
    document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='home')load(false)});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&homeActive())load(false)});
  }

  addStyles();install();
})();
