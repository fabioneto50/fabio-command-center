(()=>{
  if(window.__fccWoundDressingImagesV3Installed)return;
  window.__fccWoundDressingImagesV3Installed=true;

  const CURATED='./wound-images-curated-v1.json?v=1.1';
  const LEGACY_MANIFEST='./wound-images-hq-v3.json?v=3.3';
  let HQ={products:{}},READY=false;
  const ENHANCED=new Map();
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const aliases={
    'acticoat acticoat flex 3':'Acticoat® / Acticoat® Flex 3',
    'argenpal 42 5 mg barra cutanea':'Argenpal 42,5 mg barra cutânea®',
    'surgicel fibrillar':'Surgicel® Fibrilar',
    'mepilex border flex':'Mepilex® Border',
    'mepilex border heel':'Mepilex® Heel'
  };

  function keyFor(name){
    const embedded=window.FCC_WOUND_IMAGES||{};
    const all=new Set([...Object.keys(embedded),...Object.keys(HQ.products||{})]);
    const f=fold(name),idx=new Map([...all].map(k=>[fold(k),k]));
    if(idx.has(f))return idx.get(f);
    if(aliases[f])return aliases[f];
    for(const [x,k] of idx){if(f.includes(x)||x.includes(f))return k}
    return name||'';
  }

  function embeddedUser(key){
    return !!(window.FCC_WOUND_IMAGES||{})[key]&&(window.FCC_WOUND_USER_EMBEDDED||{})[key]===true;
  }

  function verifiedHQ(key){
    const raw=HQ.products?.[key]?.images||[];
    return raw.filter(x=>x?.src&&x.verified===true&&!/^https?:\/\//i.test(String(x.src))).slice(0,4).map((x,i)=>({
      src:x.src,
      label:x.label||`Imagem ${i+1}`,
      source:x.source_page||'Fonte verificada',
      hq:true,
      width:x.width,
      height:x.height
    }));
  }

  function mediaFor(name){
    const key=keyFor(name);
    const legacy=(window.FCC_WOUND_IMAGES||{})[key]||'';
    const curated=verifiedHQ(key);
    if(curated.length)return {key,legacy,list:curated,primary:curated[0],curated:true,userLocal:false};
    if(legacy&&embeddedUser(key)){
      const item={src:legacy,label:'Imagem enviada pelo utilizador',source:'Upload local',hq:true};
      return {key,legacy,list:[item],primary:item,curated:true,userLocal:true};
    }
    const list=legacy?[{src:legacy,label:'Referência documental',source:'INF.2251.00',hq:false}]:[];
    return {key,legacy,list,primary:list[0]||null,curated:false,userLocal:false};
  }

  function enhanceLegacy(src){
    if(!src||!src.startsWith('data:image/'))return Promise.resolve(src);
    if(ENHANCED.has(src))return ENHANCED.get(src);
    const p=new Promise(resolve=>{
      const im=new Image();
      im.onload=()=>{
        try{
          const sw=im.naturalWidth||im.width,sh=im.naturalHeight||im.height;
          if(!sw||!sh){resolve(src);return}
          const scale=Math.max(2,Math.min(5,1100/Math.max(sw,sh)));
          const tw=Math.max(sw,Math.round(sw*scale)),th=Math.max(sh,Math.round(sh*scale));
          const out=document.createElement('canvas');out.width=tw;out.height=th;
          const ctx=out.getContext('2d',{alpha:false});
          ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#fff';ctx.fillRect(0,0,tw,th);
          ctx.filter='contrast(1.05) saturate(1.02)';ctx.drawImage(im,0,0,tw,th);ctx.filter='none';
          resolve(out.toDataURL('image/webp',.94));
        }catch(e){resolve(src)}
      };
      im.onerror=()=>resolve(src);im.src=src;
    });
    ENHANCED.set(src,p);return p;
  }

  function useLegacy(img,link,quality,legacy){
    if(!legacy)return false;
    enhanceLegacy(legacy).then(src=>{
      const safe=src||legacy;img.src=safe;if(link)link.href=safe;if(quality)quality.textContent='Fallback · INF.2251.00';
    });
    return true;
  }

  function makeImage(name,item,legacy){
    const a=document.createElement('a');a.className='penso-gallery-item';a.href=item.src;a.target='_blank';a.rel='noopener';a.title='Abrir imagem na resolução original';
    const frame=document.createElement('div');frame.className='penso-gallery-frame';
    const img=document.createElement('img');img.src=item.src;img.alt=`${name} · ${item.label}`;img.loading='lazy';img.decoding='async';frame.appendChild(img);
    const meta=document.createElement('div');meta.className='penso-gallery-meta';
    const label=document.createElement('b');label.textContent=item.hq?'Imagem principal · local':item.label;
    const quality=document.createElement('span');quality.textContent=item.hq?(item.width&&item.height?`Original · ${item.width}×${item.height}`:'Original · HQ'):'Documento institucional';
    meta.append(label,quality);a.append(frame,meta);
    img.addEventListener('error',()=>{if(!useLegacy(img,a,quality,legacy))a.remove()},{once:true});
    if(!item.hq)enhanceLegacy(item.src).then(src=>{if(src){img.src=src;a.href=src;quality.textContent='Fallback · INF.2251.00'}});
    return a;
  }

  function decorate(card){
    if(!READY||!card)return;
    const name=card.querySelector('summary strong')?.textContent?.trim();if(!name)return;
    const media=mediaFor(name);if(!media.primary)return;
    const sig=media.list.map(x=>`${x.src}|${x.label}`).join('||');if(card.dataset.pensoImgSig===sig)return;
    card.dataset.pensoImgSig=sig;card.dataset.pensoImg='1';

    const summary=card.querySelector('summary'),main=card.querySelector('.penso-sum-main');
    let thumb=summary?.querySelector(':scope > .penso-thumb');
    if(summary&&main){
      if(!thumb){thumb=document.createElement('img');thumb.className='penso-thumb';thumb.loading='lazy';thumb.decoding='async';summary.insertBefore(thumb,main)}
      thumb.src=media.primary.src;thumb.alt=`${name} · ${media.primary.label}`;
      thumb.onerror=()=>{if(media.legacy&&!media.userLocal)useLegacy(thumb,null,null,media.legacy)};
      if(!media.primary.hq&&media.legacy)enhanceLegacy(media.legacy).then(src=>{if(src)thumb.src=src});
    }

    const body=card.querySelector('.penso-body');if(!body)return;
    body.querySelector(':scope > .penso-photo-section')?.remove();
    const sec=document.createElement('section');sec.className='penso-photo-section';
    const h=document.createElement('h4');h.textContent='Imagem do material';
    const gallery=document.createElement('div');gallery.className='penso-gallery';
    media.list.forEach(item=>gallery.appendChild(makeImage(name,item,media.userLocal?'':media.legacy)));
    const note=document.createElement('div');note.className='tiny penso-image-note';
    note.textContent=media.curated
      ?'Fotografia local verificada. O ficheiro mantém a resolução disponível; tocar na imagem abre a versão integral.'
      :'Fallback incorporado do guia institucional INF.2251.00.';
    sec.append(h,gallery,note);body.prepend(sec);
  }

  function audit(){
    const products=window.fccWoundDressings?.data||[];
    const missingCurated=products.filter(p=>{const key=keyFor(p.name);return verifiedHQ(key).length===0&&!embeddedUser(key)}).map(p=>p.name);
    const external=[...document.querySelectorAll('#clin-dressings .penso-photo-section img')].filter(i=>/^https?:\/\//i.test(i.currentSrc||i.src)).length;
    const result={productCount:products.length,curatedCount:products.length-missingCurated.length,missingCurated,externalActive:external,ok:products.length===28&&missingCurated.length===0&&external===0,checkedAt:new Date().toISOString()};
    window.FCC_WOUND_IMAGE_AUDIT=result;
    document.documentElement.dataset.fccWoundImages=result.ok?'ok':'warning';
    return result;
  }

  function styles(){
    if(document.getElementById('penso-images-v3-style'))return;
    const s=document.createElement('style');s.id='penso-images-v3-style';s.textContent=`
      .penso-card>summary{justify-content:flex-start!important}.penso-thumb{width:72px;height:72px;object-fit:contain;flex:0 0 auto;border:1px solid var(--line);border-radius:12px;background:#fff;padding:5px}.penso-card .penso-sum-main{flex:1}
      .penso-photo-section{overflow:hidden}.penso-gallery{display:grid;grid-template-columns:minmax(0,760px);gap:10px;margin-top:8px}
      .penso-gallery-item{display:grid;grid-template-rows:minmax(280px,auto) auto;text-decoration:none!important;color:inherit;border:1px solid var(--line);border-radius:13px;overflow:hidden;background:var(--panel)}
      .penso-gallery-frame{display:flex;align-items:center;justify-content:center;min-height:280px;background:#fff;padding:14px;overflow:hidden}.penso-gallery-frame img{display:block;width:auto;height:auto;max-width:100%;max-height:560px;object-fit:contain}
      .penso-gallery-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-top:1px solid var(--line);font-size:9px}.penso-gallery-meta b{font-size:10px}.penso-gallery-meta span{color:var(--muted)}.penso-image-note{margin-top:7px;line-height:1.5}
      @media(max-width:760px){.penso-thumb{width:60px;height:60px}.penso-gallery{grid-template-columns:1fr}.penso-gallery-frame{min-height:220px;padding:10px}.penso-gallery-frame img{max-height:440px}}
    `;document.head.appendChild(s);
  }

  function scan(root=document){if(!READY)return;if(root?.matches?.('.penso-card'))decorate(root);root?.querySelectorAll?.('.penso-card').forEach(decorate);setTimeout(audit,0)}
  async function readManifest(url){try{const r=await fetch(url,{cache:'no-store'});if(r.ok){const j=await r.json();if(j?.products)return j}}catch(e){}return null}
  async function loadHQ(){
    const curated=await readManifest(CURATED);
    if(curated?.products)HQ=curated;
    else{
      const legacy=await readManifest(LEGACY_MANIFEST);
      if(legacy?.products)HQ=legacy;
      console.info('Curated wound image manifest unavailable; fallback image sources remain enabled.');
    }
    READY=true;scan(document);
  }

  styles();
  const host=document.getElementById('clin-dressings');if(host)new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)}))).observe(host,{childList:true,subtree:true});
  loadHQ();setTimeout(()=>scan(document),450);setTimeout(()=>scan(document),1300);
})();
