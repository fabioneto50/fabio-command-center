/* News state is explicit: successful retrieval, cached copy, or source directory. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,esc=C.escapeHTML,KEY='fcc-home-news-cache-v4';
 let feed=null,mode='loading',loading=false,lastAttempt=0,lastSuccess='',error='',controller=null;
 const positions={health:0,world:0},small=matchMedia('(max-width:720px)');
 const portals={health:[['OMS','https://www.who.int/emergencies'],['SNS','https://www.sns.gov.pt/'],['DGS','https://www.dgs.pt/'],['INEM','https://www.inem.pt/']],world:[['Reuters','https://www.reuters.com/world/'],['AP','https://apnews.com/world-news'],['Euronews','https://www.euronews.com/'],['BBC','https://www.bbc.com/news/world']]};
 const safe=value=>{try{const u=new URL(String(value));return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}};
 const date=v=>{const d=new Date(v||'');return Number.isFinite(d.getTime())?d.toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'data não indicada';};
 function normalize(rows){const seen=new Set();return (Array.isArray(rows)?rows:[]).filter(x=>{const u=safe(x?.articleUrl||x?.url);if(!u||typeof x.title!=='string'||!x.title.trim())return false;const k=u+'|'+x.title;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,10);}
 function article(x){const image=safe(x.image),link=safe(x.articleUrl||x.url);return `<a class="home-news-item" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${image?`<div class="home-news-media"><img src="${esc(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>`:''}<div class="home-news-body"><p class="home-news-kicker">${esc(x.source||'Fonte')} · ${esc(date(x.publishedAt))}</p><h4>${esc(x.title)}</h4><p>${esc(String(x.description||'').slice(0,900))}</p><span>Ler na fonte original ↗</span></div></a>`;}
 function render(kind){
  const root=document.getElementById(kind==='health'?'homeHealthNewsList':'homeWorldNewsList'),meta=document.getElementById(kind==='health'?'homeHealthNewsMeta':'homeWorldNewsMeta');if(!root||!meta)return;
  const panel=root.closest('.home-news-card'),rows=normalize(feed?.[kind]),size=small.matches?1:2,pages=Math.max(1,Math.ceil(rows.length/size));positions[kind]=Math.min(pages-1,positions[kind]);
  meta.setAttribute('role','status');meta.setAttribute('aria-live','polite');
  meta.textContent=mode==='fresh'?`Recolha bem-sucedida: ${date(lastSuccess)} · feed: ${date(feed?.updatedAt)}`:rows.length?`Cópia local · última recolha: ${date(lastSuccess)}${error?' · atualização indisponível':''}`:'Sem notícias descarregadas · diretório de fontes';
  if(rows.length){root.innerHTML=`<div class="home-news-visible">${rows.slice(positions[kind]*size,(positions[kind]+1)*size).map(article).join('')}</div><div class="home-news-dots" aria-label="Páginas de notícias">${Array.from({length:pages},(_,i)=>`<button class="btn home-news-dot" type="button" data-page="${i}" aria-label="Página ${i+1} de ${pages}" ${i===positions[kind]?'aria-current="page"':''}>${i+1}</button>`).join('')}</div>`;root.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{positions[kind]=+b.dataset.page;render(kind);root.querySelector(`[data-page="${positions[kind]}"]`)?.focus();});}
  else root.innerHTML='<p>Estas ligações abrem portais institucionais; não são apresentadas como notícias novas.</p><div class="actions">'+portals[kind].map(([label,link])=>`<a class="btn" target="_blank" rel="noopener noreferrer" href="${link}">${esc(label)} ↗</a>`).join('')+'</div>';
  root.querySelectorAll('img').forEach(img=>img.onerror=()=>{img.closest('.home-news-media')?.remove();});
  const prev=panel?.querySelector('[data-news-prev]'),next=panel?.querySelector('[data-news-next]');if(prev){prev.disabled=!rows.length||positions[kind]===0;prev.onclick=()=>{positions[kind]--;render(kind);};}if(next){next.disabled=!rows.length||positions[kind]===pages-1;next.onclick=()=>{positions[kind]++;render(kind);};}
 }
 function renderAll(){render('health');render('world');}
 function cached(){try{const c=C.parseJSON(FCCStore.getItem(KEY)||'null');if(c?.feed)return c;if(c?.health)return {feed:c,retrievedAt:''};}catch{}return null;}
 async function load(force=false){
  if(loading||(!force&&Date.now()-lastAttempt<300000))return;
  lastAttempt=Date.now();loading=true;controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);document.querySelectorAll('.home-news-refresh').forEach(b=>b.disabled=true);
  try{const r=await fetch('./news-feed.json?t='+Date.now(),{cache:'no-store',signal:controller.signal,headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);const data=C.parseJSON(await r.text());if(!normalize(data.health).length||!normalize(data.world).length)throw new Error('Feed incompleto');feed=data;lastSuccess=new Date().toISOString();mode='fresh';error='';try{await FCCStore.setItem(KEY,JSON.stringify({feed,retrievedAt:lastSuccess}));}catch{}renderAll();}
  catch(e){mode=feed?'cache':'directory';error='Falha de atualização';renderAll();window.FCCDiagnostics?.log('home-news-error','Feed indisponível');}
  finally{clearTimeout(timer);controller=null;loading=false;document.querySelectorAll('.home-news-refresh').forEach(b=>b.disabled=false);}
 }
 const old=cached();if(old){feed=old.feed;lastSuccess=old.retrievedAt||'';mode='cache';}else mode='directory';
 document.querySelectorAll('.home-news-refresh').forEach(b=>b.onclick=()=>load(true));
 small.addEventListener('change',()=>{positions.health=positions.world=0;renderAll();});
 document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='home'&&!document.querySelector('#page-home > .grid')?.hidden)load();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.getElementById('page-home')?.classList.contains('active')&&!document.querySelector('#page-home > .grid')?.hidden)load();});
 window.FCCNews=Object.freeze({load,status:()=>({mode,lastSuccess,loading,error}),render:renderAll});renderAll();
 if(!document.querySelector('#page-home > .grid')?.hidden)load();
})();
