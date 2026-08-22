(()=>{
  if(window.__fccWoundDressingImagesV5Installed)return;
  window.__fccWoundDressingImagesV5Installed=true;

  const BUNDLE='./wound-images-user-v4.json?v=4.2';
  const EXPECTED={
    'Acticoat® / Acticoat® Flex 3':1,'Actisorb® Silver 220':1,'Adaptic®':1,'Allevyn® Life':1,
    'Aquacel® Ag+ Extra':2,'Aquacel® Extra':2,'Argenpal 42,5 mg barra cutânea®':1,'Atrauman® Ag':4,
    'Cutanplast®':2,'Emla® Penso':1,'Inadine®':4,'Jelonet®':2,'Melgisorb® Plus':2,'Mepilex®':2,
    'Mepilex® Border Flex':2,'Mepilex® Border Heel':2,'Mepitel®':1,'Merogel®':1,'Multidex®':1,'Nu-Gel®':1,
    'Promogran®':1,'Spongostan® Standard':1,'Surgicel®':3,'Surgicel® Fibrilar':3,'TachoSil®':1,'Tutopatch®':1,
    'Varihesive® Extra Fino':1,'Varihesive® Gel Control':1
  };
  const RENAMES={'Mepilex® Border':'Mepilex® Border Flex','Mepilex® Heel':'Mepilex® Border Heel'};
  let MEDIA=new Map(),READY=false,BUNDLE_OK=false;
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

  function dataSrc(b64){return `data:image/avif;base64,${b64}`}
  function imagesFor(name){return MEDIA.get(fold(name))||[]}
  function clearCard(card){
    card?.querySelector('summary > .penso-thumb')?.remove();
    card?.querySelector('.penso-body > .penso-photo-section')?.remove();
    if(card){delete card.dataset.pensoImgSig;delete card.dataset.pensoImg}
  }
  function makeImage(name,item,index){
    const a=document.createElement('a');a.className='penso-gallery-item';a.href=item.src;a.target='_blank';a.rel='noopener';a.title='Abrir imagem';
    const frame=document.createElement('div');frame.className='penso-gallery-frame';
    const img=document.createElement('img');img.src=item.src;img.alt=`${name} · ${item.label}`;img.loading='lazy';img.decoding='async';frame.appendChild(img);
    const meta=document.createElement('div');meta.className='penso-gallery-meta';
    const label=document.createElement('b');label.textContent=index===0?'Imagem principal':item.label;
    const q=document.createElement('span');q.textContent='Imagem enviada';meta.append(label,q);a.append(frame,meta);return a
  }
  function decorate(card){
    if(!READY||!card)return;
    const name=card.querySelector('summary strong')?.textContent?.trim();if(!name)return;
    const list=imagesFor(name);if(!list.length){clearCard(card);return}
    const sig=`v5:${name}:${list.length}`;if(card.dataset.pensoImgSig===sig)return;
    clearCard(card);card.dataset.pensoImgSig=sig;card.dataset.pensoImg='1';
    const summary=card.querySelector('summary'),main=card.querySelector('.penso-sum-main');
    if(summary&&main){const thumb=document.createElement('img');thumb.className='penso-thumb';thumb.loading='lazy';thumb.decoding='async';thumb.src=list[0].src;thumb.alt=`${name} · Imagem principal`;summary.insertBefore(thumb,main)}
    const body=card.querySelector('.penso-body');if(!body)return;
    const sec=document.createElement('section');sec.className='penso-photo-section';
    const h=document.createElement('h4');h.textContent=list.length>1?'Imagens do material':'Imagem do material';
    const gallery=document.createElement('div');gallery.className='penso-gallery';list.forEach((item,i)=>gallery.appendChild(makeImage(name,item,i)));
    const note=document.createElement('div');note.className='tiny penso-image-note';note.textContent='Apenas imagens fornecidas pelo utilizador nesta conversa. Sem imagens externas, montagens ou recortes automáticos.';
    sec.append(h,gallery,note);body.prepend(sec)
  }
  function audit(){
    const products=window.fccWoundDressings?.data||[];
    const mapped=products.filter(p=>imagesFor(p.name).length>0),total=mapped.reduce((n,p)=>n+imagesFor(p.name).length,0);
    const external=[...document.querySelectorAll('#clin-dressings .penso-photo-section img')].filter(i=>/^https?:/i.test(i.currentSrc||i.src)).length;
    const ok=BUNDLE_OK&&products.length===28&&mapped.length===28&&total===46&&external===0;
    window.FCC_WOUND_IMAGE_AUDIT={productCount:products.length,mappedProducts:mapped.length,totalImages:total,externalActive:external,bundleValid:BUNDLE_OK,source:'user-conversation-bundle-only',ok,checkedAt:new Date().toISOString()};
    document.documentElement.dataset.fccWoundImages=ok?'ok':'warning'
  }
  function styles(){
    if(document.getElementById('penso-images-v5-style'))return;
    const s=document.createElement('style');s.id='penso-images-v5-style';s.textContent=`
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
    try{
      const r=await fetch(BUNDLE,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const j=await r.json(),products={};
      for(const [rawName,arr] of Object.entries(j?.products||{})){const name=RENAMES[rawName]||rawName;products[name]=Array.isArray(arr)?arr:[]}
      const expectedNames=Object.keys(EXPECTED),actualNames=Object.keys(products);
      const bad=expectedNames.filter(n=>!products[n]||products[n].length!==EXPECTED[n]);
      const extras=actualNames.filter(n=>!Object.prototype.hasOwnProperty.call(EXPECTED,n));
      const total=expectedNames.reduce((n,k)=>n+(products[k]?.length||0),0);
      BUNDLE_OK=j?.format==='avif'&&bad.length===0&&extras.length===0&&total===46;
      if(!BUNDLE_OK)throw new Error(`Bundle inválido: bad=${bad.join(',')} extras=${extras.join(',')} total=${total}`);
      expectedNames.forEach(name=>MEDIA.set(fold(name),products[name].map((b64,i)=>({src:dataSrc(b64),label:i===0?'Imagem principal':`Imagem complementar ${i}`}))));
    }catch(e){console.error('FCC user wound image bundle failed validation',e);MEDIA=new Map();BUNDLE_OK=false}
    READY=true;scan(document)
  }
  styles();
  const host=document.getElementById('clin-dressings');if(host)new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)}))).observe(host,{childList:true,subtree:true});
  load();setTimeout(()=>scan(document),500);setTimeout(()=>scan(document),1500)
})();
