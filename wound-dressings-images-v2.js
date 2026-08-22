(()=>{
  if(window.__fccWoundDressingImagesV4Installed)return;
  window.__fccWoundDressingImagesV4Installed=true;

  const CURATED='./wound-images-curated-v1.json?v=2.0';
  let MANIFEST={products:{}},READY=false;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const aliases={
    'mepilex border':'mepilex border flex',
    'mepilex heel':'mepilex border heel',
    'surgicel fibrillar':'surgicel fibrilar'
  };

  function keyFor(name){
    const products=MANIFEST.products||{};
    const idx=new Map(Object.keys(products).map(k=>[fold(k),k]));
    const f=aliases[fold(name)]||fold(name);
    if(idx.has(f))return idx.get(f);
    return name||'';
  }

  function imagesFor(name){
    const key=keyFor(name),raw=MANIFEST.products?.[key]?.images||[];
    return raw.filter(x=>x?.src&&x.verified===true&&x.local===true&&!/^https?:/i.test(String(x.src))&&!/^data:/i.test(String(x.src))).map((x,i)=>({
      src:x.src,label:x.label||(i===0?'Imagem principal':`Imagem complementar ${i}`),width:x.width,height:x.height
    }));
  }

  function clearCard(card){
    card?.querySelector('summary > .penso-thumb')?.remove();
    card?.querySelector('.penso-body > .penso-photo-section')?.remove();
    if(card){delete card.dataset.pensoImgSig;delete card.dataset.pensoImg}
  }

  function makeImage(name,item,index){
    const a=document.createElement('a');a.className='penso-gallery-item';a.href=item.src;a.target='_blank';a.rel='noopener';a.title='Abrir imagem na resolução original';
    const frame=document.createElement('div');frame.className='penso-gallery-frame';
    const img=document.createElement('img');img.src=item.src;img.alt=`${name} · ${item.label}`;img.loading='lazy';img.decoding='async';frame.appendChild(img);
    const meta=document.createElement('div');meta.className='penso-gallery-meta';
    const label=document.createElement('b');label.textContent=index===0?'Imagem principal':item.label;
    const q=document.createElement('span');q.textContent=item.width&&item.height?`${item.width}×${item.height}`:'Imagem enviada';
    meta.append(label,q);a.append(frame,meta);return a;
  }

  function decorate(card){
    if(!READY||!card)return;
    const name=card.querySelector('summary strong')?.textContent?.trim();if(!name)return;
    const list=imagesFor(name);if(!list.length){clearCard(card);return}
    const sig=list.map(x=>x.src).join('|');if(card.dataset.pensoImgSig===sig)return;
    clearCard(card);card.dataset.pensoImgSig=sig;card.dataset.pensoImg='1';

    const summary=card.querySelector('summary'),main=card.querySelector('.penso-sum-main');
    if(summary&&main){const thumb=document.createElement('img');thumb.className='penso-thumb';thumb.loading='lazy';thumb.decoding='async';thumb.src=list[0].src;thumb.alt=`${name} · Imagem principal`;summary.insertBefore(thumb,main)}

    const body=card.querySelector('.penso-body');if(!body)return;
    const sec=document.createElement('section');sec.className='penso-photo-section';
    const h=document.createElement('h4');h.textContent=list.length>1?'Imagens do material':'Imagem do material';
    const gallery=document.createElement('div');gallery.className='penso-gallery';
    list.forEach((item,i)=>gallery.appendChild(makeImage(name,item,i)));
    const note=document.createElement('div');note.className='tiny penso-image-note';note.textContent='Imagens locais fornecidas pelo utilizador. Tocar numa imagem abre a versão integral.';
    sec.append(h,gallery,note);body.prepend(sec);
  }

  function audit(){
    const products=window.fccWoundDressings?.data||[];
    const mapped=products.filter(p=>imagesFor(p.name).length>0);
    const total=mapped.reduce((n,p)=>n+imagesFor(p.name).length,0);
    const external=[...document.querySelectorAll('#clin-dressings .penso-photo-section img')].filter(i=>/^https?:/i.test(i.currentSrc||i.src)).length;
    window.FCC_WOUND_IMAGE_AUDIT={productCount:products.length,mappedProducts:mapped.length,totalImages:total,externalActive:external,source:'user-only',ok:external===0,checkedAt:new Date().toISOString()};
  }

  function styles(){
    if(document.getElementById('penso-images-v4-style'))return;
    const s=document.createElement('style');s.id='penso-images-v4-style';s.textContent=`
      .penso-card>summary{justify-content:flex-start!important}.penso-thumb{width:72px;height:72px;object-fit:contain;flex:0 0 auto;border:1px solid var(--line);border-radius:12px;background:#fff;padding:5px}.penso-card .penso-sum-main{flex:1}
      .penso-photo-section{overflow:hidden}.penso-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:10px;margin-top:8px;max-width:980px}
      .penso-gallery-item{display:grid;grid-template-rows:minmax(230px,auto) auto;text-decoration:none!important;color:inherit;border:1px solid var(--line);border-radius:13px;overflow:hidden;background:var(--panel)}
      .penso-gallery-frame{display:flex;align-items:center;justify-content:center;min-height:230px;background:#fff;padding:12px;overflow:hidden}.penso-gallery-frame img{display:block;width:auto;height:auto;max-width:100%;max-height:520px;object-fit:contain}
      .penso-gallery-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-top:1px solid var(--line);font-size:9px}.penso-gallery-meta b{font-size:10px}.penso-gallery-meta span{color:var(--muted)}.penso-image-note{margin-top:7px;line-height:1.5}
      @media(max-width:760px){.penso-thumb{width:60px;height:60px}.penso-gallery{grid-template-columns:1fr}.penso-gallery-frame{min-height:210px;padding:10px}.penso-gallery-frame img{max-height:440px}}
    `;document.head.appendChild(s)
  }

  function scan(root=document){if(!READY)return;if(root?.matches?.('.penso-card'))decorate(root);root?.querySelectorAll?.('.penso-card').forEach(decorate);setTimeout(audit,0)}
  async function load(){
    try{const r=await fetch(CURATED,{cache:'no-store'});if(r.ok){const j=await r.json();if(j?.products)MANIFEST=j}}catch(e){MANIFEST={products:{}}}
    READY=true;scan(document)
  }

  styles();
  const host=document.getElementById('clin-dressings');if(host)new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)}))).observe(host,{childList:true,subtree:true});
  load();setTimeout(()=>scan(document),450);setTimeout(()=>scan(document),1300);
})();
