(()=>{
 if(window.__fccWoundDressingImagesV2Installed)return;window.__fccWoundDressingImagesV2Installed=true;
 const MANIFEST='./wound-images-hq-v3.json?v=3.1';let HQ={products:{}};const ENHANCED=new Map();
 const OFFICIAL={
   'Inadine®':[
     {src:'https://assets.solventum.com/is/image/mmmspinco/P01512_A1C1_R',label:'Produto / apósito',source:'Solventum',official:true},
     {src:'https://assets.solventum.com/is/image/mmmspinco/P01512_A1R1_R',label:'Embalagem',source:'Solventum',official:true}
   ],
   'Allevyn® Life':[
     {src:'https://smith-nephew.stylelabs.cloud/api/public/content/9cc7231a46d948e09ed7af0221d3641a?v=769258ce',label:'Produto / apósito',source:'Smith+Nephew',official:true}
   ],
   'Varihesive® Extra Fino':[
     {src:'https://digitalassetcdn.net/cff39c3a-3f60-497b-9e2c-b29f005deb56.jpg?fit=bounds&format=webp&height=876&quality=85&versionNumber=1&width=876',label:'Produto / apósito',source:'ConvaTec · DuoDERM Extra Thin',official:true,width:876,height:876}
   ]
 };
 const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={'acticoat acticoat flex 3':'Acticoat® / Acticoat® Flex 3','argenpal 42 5 mg barra cutanea':'Argenpal 42,5 mg barra cutânea®'};
 function keyFor(n){const imgs=window.FCC_WOUND_IMAGES||{},all=new Set([...Object.keys(imgs),...Object.keys(HQ.products||{}),...Object.keys(OFFICIAL)]),f=fold(n),keys=[...all],idx=new Map(keys.map(k=>[fold(k),k]));if(idx.has(f))return idx.get(f);if(aliases[f])return aliases[f];for(const [x,k] of idx){if(f.includes(x)||x.includes(f))return k}return n||''}
 function mediaFor(name){
   const key=keyFor(name),legacy=(window.FCC_WOUND_IMAGES||{})[key],raw=HQ.products?.[key]?.images||[];
   const generated=raw.filter(x=>x&&x.src).map((x,i)=>({src:x.src,label:x.label||`Imagem ${i+1}`,source:x.source_page||'',hq:true,official:false,width:x.width,height:x.height}));
   const official=(OFFICIAL[key]||[]).map(x=>({...x,hq:true}));const seen=new Set();const list=[];
   [...generated,...official].forEach(x=>{if(x?.src&&!seen.has(x.src)&&list.length<2){seen.add(x.src);list.push(x)}});
   if(list.length<2&&legacy)list.push({src:legacy,label:list.length?'Referência documental · imagem melhorada':'Produto / apósito · imagem melhorada',source:'INF.2251.00',hq:false,official:false});
   return {key,list,primary:list[0]||null}
 }
 function signature(media){return media.list.map(x=>`${x.src}|${x.label}`).join('||')}
 function enhanceLegacy(src){
   if(!src||!src.startsWith('data:image/'))return Promise.resolve(src);if(ENHANCED.has(src))return ENHANCED.get(src);
   const p=new Promise(resolve=>{const im=new Image();im.onload=()=>{try{let sw=im.naturalWidth||im.width,sh=im.naturalHeight||im.height;if(!sw||!sh){resolve(src);return}let scale=Math.max(2,Math.min(6,1200/Math.max(sw,sh)));let tw=Math.max(sw,Math.round(sw*scale)),th=Math.max(sh,Math.round(sh*scale));let prev=document.createElement('canvas');prev.width=sw;prev.height=sh;let pctx=prev.getContext('2d',{alpha:false});pctx.imageSmoothingEnabled=true;pctx.imageSmoothingQuality='high';pctx.fillStyle='#fff';pctx.fillRect(0,0,sw,sh);pctx.drawImage(im,0,0,sw,sh);let cw=sw,ch=sh;while(cw*1.8<tw&&ch*1.8<th){const nw=Math.min(tw,Math.round(cw*1.8)),nh=Math.min(th,Math.round(ch*1.8));const c=document.createElement('canvas');c.width=nw;c.height=nh;const x=c.getContext('2d',{alpha:false});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.fillStyle='#fff';x.fillRect(0,0,nw,nh);x.drawImage(prev,0,0,nw,nh);prev=c;cw=nw;ch=nh}const out=document.createElement('canvas');out.width=tw;out.height=th;const ctx=out.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#fff';ctx.fillRect(0,0,tw,th);ctx.filter='contrast(1.07) saturate(1.03)';ctx.drawImage(prev,0,0,tw,th);ctx.filter='none';resolve(out.toDataURL('image/webp',.96))}catch(e){resolve(src)}};im.onerror=()=>resolve(src);im.src=src});ENHANCED.set(src,p);return p
 }
 function makeImage(name,item){
   const a=document.createElement('a');a.className='penso-gallery-item';a.href=item.src;a.target='_blank';a.rel='noopener';a.title='Abrir imagem em tamanho completo';
   const wrap=document.createElement('div');wrap.className='penso-gallery-frame';const img=document.createElement('img');img.src=item.src;img.alt=`${name} · ${item.label}`;img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>a.classList.add('penso-image-failed'));wrap.appendChild(img);
   const meta=document.createElement('div');meta.className='penso-gallery-meta';const label=document.createElement('b');label.textContent=item.label;const quality=document.createElement('span');quality.textContent=item.official?'Oficial · HQ':item.hq?(item.width&&item.height?`HQ · ${item.width}×${item.height}`:'HQ'):'A melhorar…';meta.append(label,quality);a.append(wrap,meta);
   if(!item.hq){enhanceLegacy(item.src).then(src=>{if(!src)return;img.src=src;a.href=src;quality.textContent='Melhorada · HQ visual'})}return a
 }
 function decorate(card){if(!card)return;const name=card.querySelector('summary strong')?.textContent?.trim();if(!name)return;const media=mediaFor(name),sig=signature(media);if(!media.primary)return;if(card.dataset.pensoImgSig===sig)return;card.dataset.pensoImgSig=sig;card.dataset.pensoImg='1';
   const summary=card.querySelector('summary'),main=card.querySelector('.penso-sum-main');let thumb=summary?.querySelector(':scope > .penso-thumb');if(summary&&main){if(!thumb){thumb=document.createElement('img');thumb.className='penso-thumb';thumb.loading='lazy';thumb.decoding='async';summary.insertBefore(thumb,main)}thumb.src=media.primary.src;thumb.alt=`${name} · ${media.primary.label}`;if(!media.primary.hq)enhanceLegacy(media.primary.src).then(src=>{if(src)thumb.src=src})}
   const body=card.querySelector('.penso-body');if(!body)return;body.querySelector(':scope > .penso-photo-section')?.remove();const sec=document.createElement('section');sec.className='penso-photo-section';const h=document.createElement('h4');h.textContent='Imagens do material';const gallery=document.createElement('div');gallery.className='penso-gallery';media.list.forEach(item=>gallery.appendChild(makeImage(name,item)));const note=document.createElement('div');note.className='tiny penso-image-note';const officialCount=media.list.filter(x=>x.official).length,hqCount=media.list.filter(x=>x.hq).length;note.textContent=officialCount?`${officialCount} imagem${officialCount===1?'':'ns'} oficial${officialCount===1?'':'is'} do fabricante em alta qualidade.${media.list.some(x=>!x.hq)?' A referência documental adicional é reamostrada e melhorada automaticamente.':''} Clica para ampliar.`:hqCount?`${hqCount} imagem${hqCount===1?'':'ns'} HQ disponível${hqCount===1?'':'eis'}. Clica para ampliar.${media.list.some(x=>!x.hq)?' A referência documental restante é reamostrada e melhorada automaticamente.':''}`:'A imagem institucional é reamostrada em alta resolução visual, com suavização e contraste melhorados. A versão original permanece como fallback.';sec.append(h,gallery,note);body.prepend(sec)
 }
 function styles(){if(document.getElementById('penso-images-v2-style'))return;const s=document.createElement('style');s.id='penso-images-v2-style';s.textContent=`
   .penso-card>summary{justify-content:flex-start!important}.penso-thumb{width:76px;height:76px;object-fit:contain;flex:0 0 auto;border:1px solid var(--line);border-radius:13px;background:#fff;padding:4px;filter:contrast(1.02);box-shadow:0 2px 9px rgba(0,0,0,.06)}.penso-card .penso-sum-main{flex:1}
   .penso-photo-section{overflow:hidden}.penso-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:8px}.penso-gallery-item{display:grid;grid-template-rows:minmax(260px,1fr) auto;text-decoration:none!important;color:inherit;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--panel);transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}.penso-gallery-item:hover{transform:translateY(-2px);border-color:rgba(98,212,255,.46);box-shadow:0 12px 30px rgba(0,0,0,.10)}.penso-gallery-frame{display:flex;align-items:center;justify-content:center;min-height:260px;background:#fff;padding:8px}.penso-gallery-frame img{display:block;width:100%;height:320px;object-fit:contain;image-rendering:auto}.penso-gallery-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px;border-top:1px solid var(--line);font-size:9px}.penso-gallery-meta b{font-size:10px}.penso-gallery-meta span{color:var(--muted);white-space:nowrap}.penso-image-note{margin-top:8px;line-height:1.5}.penso-image-failed{display:none!important}
   html[data-fcc-theme="light"] .penso-gallery-item{background:#fff}.penso-photo-section h4{margin-bottom:0}
   @media(max-width:760px){.penso-thumb{width:64px;height:64px}.penso-gallery{grid-template-columns:1fr}.penso-gallery-item{grid-template-rows:minmax(220px,1fr) auto}.penso-gallery-frame{min-height:220px}.penso-gallery-frame img{height:280px}}
 `;document.head.appendChild(s)}
 function scan(r=document){if(r?.matches?.('.penso-card'))decorate(r);r?.querySelectorAll?.('.penso-card').forEach(decorate)}
 async function loadHQ(){try{const r=await fetch(MANIFEST,{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.products)HQ=j}}catch(e){console.warn('HQ wound image manifest unavailable; using official/enhanced fallbacks.',e)}scan(document)}
 styles();scan();const host=document.getElementById('clin-dressings');if(host)new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)}))).observe(host,{childList:true,subtree:true});loadHQ();setTimeout(()=>scan(document),350);setTimeout(()=>scan(document),1200);
})();