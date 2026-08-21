(()=>{
  if(window.__fccWoundGalleryExtrasV1Installed)return;
  window.__fccWoundGalleryExtrasV1Installed=true;

  const EXTRA_JSON=['./wound-gallery-extra-01.json?v=1.1','./wound-gallery-extra-02.json?v=1.1'];
  const SHEETS=[
    {url:'./wound-gallery-sheet-01.b64?v=1.1',width:320,height:336,cells:[
      ['TachoSil®',0,1],['Varihesive® Extra Fino',0,2],
      ['Tutopatch®',1,0],['Nu-Gel®',1,1],['Varihesive® Gel Control',1,2],['Spongostan® Standard',1,3],
      ['Atrauman® Ag',2,0],['Merogel®',2,1],['Surgicel® Fibrilar',2,2],['Multidex®',2,3],
      ['Surgicel®',3,0],['Promogran®',3,1],['Promogran®',3,2],['Surgicel® Fibrilar',3,3]
    ]},
    {url:'./wound-gallery-sheet-02.b64?v=1.1',width:360,height:378,cells:[
      ['Surgicel® Fibrilar',0,0],['Mepilex® Border Heel',0,1],['Spongostan® Standard',0,2],['Mepilex® Border Heel',0,3],
      ['Mepilex® Border Flex',1,0],['Mepitel®',1,1],['Mepilex® Border Flex',1,2],['Jelonet®',1,3],
      ['Mepilex®',2,0],['Mepilex®',2,1],['Melgisorb® Plus',2,2],['Melgisorb® Plus',2,3],
      ['Mepitel®',3,0],['Cutanplast®',3,1],['Inadine®',3,2],['Inadine®',3,3],
      ['Cutanplast®',4,0],['Inadine®',4,1],['Inadine®',4,2],['Emla® Penso',4,3]
    ]}
  ];

  const EXTRA=new Map();
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const keyFor=name=>fold(name);
  const add=(name,item)=>{
    if(!name||!item?.src)return;
    const key=keyFor(name),list=EXTRA.get(key)||[];
    const sig=(item.src||'').slice(0,96)+'|'+(item.label||'');
    if(!list.some(x=>x.sig===sig))list.push({...item,sig});
    EXTRA.set(key,list);
  };

  async function readJSON(url){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)return null;return await r.json()}catch(e){return null}}
  async function readText(url){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)return '';return (await r.text()).trim()}catch(e){return ''}}

  function ingestJSON(j){
    for(const [name,value] of Object.entries(j?.products||{})){
      const arr=Array.isArray(value)?value:(Array.isArray(value?.images)?value.images:[]);
      arr.forEach((x,i)=>{
        const src=x?.src||(x?.b64?`data:image/webp;base64,${x.b64}`:'');
        if(src)add(name,{src,label:x?.label||`Imagem complementar ${i+1}`,width:x?.width,height:x?.height,source:'Imagem enviada',extra:true});
      });
    }
  }

  function imageFromData(src){return new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src})}

  function cropCell(im,row,col,label){
    try{
      const sx=(col*250+5)/1000*im.naturalWidth;
      const sy=(row*210+5)/1050*im.naturalHeight;
      const sw=240/1000*im.naturalWidth;
      const sh=173/1050*im.naturalHeight;
      const scale=Math.max(3,Math.min(6,480/Math.max(sw,1)));
      const c=document.createElement('canvas');c.width=Math.max(240,Math.round(sw*scale));c.height=Math.max(173,Math.round(sh*scale));
      const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);
      return {src:c.toDataURL('image/webp',.88),label,width:c.width,height:c.height,source:'Imagem enviada',extra:true};
    }catch(e){return null}
  }

  async function ingestSheet(sheet){
    const b64=await readText(sheet.url);if(!b64)return;
    const im=await imageFromData(`data:image/webp;base64,${b64}`);if(!im)return;
    const counters={};
    sheet.cells.forEach(([name,row,col])=>{
      const n=(counters[name]||0)+1;counters[name]=n;
      const item=cropCell(im,row,col,`Imagem complementar ${n}`);if(item)add(name,item);
    });
  }

  function styles(){
    if(document.getElementById('wound-gallery-extras-v1-style'))return;
    const s=document.createElement('style');s.id='wound-gallery-extras-v1-style';s.textContent=`
      #clin-dressings .penso-gallery.has-user-extras{grid-template-columns:repeat(2,minmax(0,1fr));max-width:920px}
      #clin-dressings .penso-gallery.has-user-extras>.penso-gallery-item:not(.penso-gallery-extra-user){grid-column:1/-1}
      #clin-dressings .penso-gallery-extra-user{grid-template-rows:minmax(180px,auto) auto}
      #clin-dressings .penso-gallery-extra-user .penso-gallery-frame{min-height:180px;padding:10px}
      #clin-dressings .penso-gallery-extra-user .penso-gallery-frame img{max-height:360px}
      #clin-dressings .penso-gallery-extra-user .penso-gallery-meta span{font-weight:800;color:var(--clinical)}
      @media(max-width:760px){#clin-dressings .penso-gallery.has-user-extras{grid-template-columns:1fr}#clin-dressings .penso-gallery.has-user-extras>.penso-gallery-item{grid-column:1/-1}}
    `;document.head.appendChild(s)
  }

  function makeItem(name,item,index){
    const a=document.createElement('a');a.className='penso-gallery-item penso-gallery-extra-user';a.href=item.src;a.target='_blank';a.rel='noopener';a.title='Abrir imagem complementar';
    const frame=document.createElement('div');frame.className='penso-gallery-frame';
    const img=document.createElement('img');img.src=item.src;img.alt=`${name} · ${item.label||('Imagem complementar '+index)}`;img.loading='lazy';img.decoding='async';frame.appendChild(img);
    const meta=document.createElement('div');meta.className='penso-gallery-meta';
    const b=document.createElement('b');b.textContent=item.label||`Imagem complementar ${index}`;
    const q=document.createElement('span');q.textContent='Imagem complementar · enviada';meta.append(b,q);a.append(frame,meta);return a;
  }

  function decorate(card){
    const name=card?.querySelector('summary strong')?.textContent?.trim();if(!name)return false;
    const list=EXTRA.get(keyFor(name))||[];if(!list.length)return false;
    const gallery=card.querySelector('.penso-photo-section .penso-gallery');if(!gallery)return false;
    const sig=list.map(x=>x.sig).join('||');if(gallery.dataset.extraSig===sig)return true;
    gallery.querySelectorAll('.penso-gallery-extra-user').forEach(n=>n.remove());
    list.forEach((item,i)=>gallery.appendChild(makeItem(name,item,i+1)));
    gallery.classList.add('has-user-extras');gallery.dataset.extraSig=sig;
    const note=card.querySelector('.penso-image-note');if(note)note.textContent=`Fotografia principal local verificada. Inclui ${list.length} imagem${list.length===1?'':'ns'} complementar${list.length===1?'':'es'} enviada${list.length===1?'':'s'} pelo utilizador; tocar numa imagem abre-a em detalhe.`;
    return true;
  }

  function decorateAll(){
    const cards=[...document.querySelectorAll('#clin-dressings .penso-card')];let decorated=0,total=0;
    cards.forEach(c=>{const n=c.querySelector('summary strong')?.textContent?.trim();total+=(EXTRA.get(keyFor(n))||[]).length;if(decorate(c))decorated++});
    window.FCC_WOUND_EXTRA_AUDIT={mappedProducts:EXTRA.size,totalImages:[...EXTRA.values()].reduce((a,b)=>a+b.length,0),decoratedCards:decorated,visibleExtraImages:document.querySelectorAll('#clin-dressings .penso-gallery-extra-user').length,checkedAt:new Date().toISOString()};
  }

  async function load(){
    styles();
    const jsons=await Promise.all(EXTRA_JSON.map(readJSON));jsons.filter(Boolean).forEach(ingestJSON);
    for(const sheet of SHEETS)await ingestSheet(sheet);
    decorateAll();setTimeout(decorateAll,450);setTimeout(decorateAll,1400);
    const host=document.getElementById('clin-dressings');if(host&&!host.dataset.extraGalleryObserved){host.dataset.extraGalleryObserved='1';new MutationObserver(()=>setTimeout(decorateAll,0)).observe(host,{childList:true,subtree:true})}
  }

  load();
})();
