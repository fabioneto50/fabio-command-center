(()=>{
  if(window.__fccSearchEnhancerInstalled)return;
  window.__fccSearchEnhancerInstalled=true;

  const PRIVATE=new Set(['personal','emergency','comms','garage','research','expenses']);
  const INDEX=new Map();
  const aliases={
    'apostos':'apositos','aposto':'aposito','pensos':'apositos','penso':'aposito',
    'farmacos':'medicacao','farmaco':'medicacao','medicamentos':'medicacao','medicamento':'medicacao',
    'diluicoes':'diluicao','diluições':'diluicao','compatibilidades':'compatibilidade'
  };
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc2=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const unlocked=()=>typeof window.fccPersonalUnlocked==='function'&&window.fccPersonalUnlocked();
  const normalizedQuery=q=>{const f=fold(q);return aliases[f]||f};
  const matches=(text,q)=>{const f=fold(text),n=normalizedQuery(q);if(!n)return false;if(f.includes(n))return true;const swapped=aliases[n];return !!(swapped&&f.includes(swapped))};

  function pageName(section){return section?.id?.replace(/^page-/,'')||''}
  function pageLabel(section){const h=section?.querySelector('.pagehead h2')?.textContent?.trim();if(h)return h;const p=pageName(section);return ({home:'Início',clinical:'Clinical',personal:'Pessoal',emergency:'Emergency',comms:'Comms',garage:'Garage',research:'Research',settings:'Definições',expenses:'Despesas'})[p]||p}
  function tabTarget(tab){const on=tab?.getAttribute('onclick')||'';return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||tab?.dataset?.subId||''}
  function allowed(page){return !PRIVATE.has(page)||unlocked()}
  function key(hit){return [hit.type||'',hit.page||'',hit.target||'',fold(hit.title),hit.ref||''].join('|')}
  function cache(hit){if(!hit?.title||!allowed(hit.page||''))return;INDEX.set(key(hit),hit)}
  function pushUnique(arr,hit){const k=key(hit);if(!arr.some(x=>x.__k===k)){hit.__k=k;arr.push(hit)}}

  function discoverSubcategories(){
    const out=[];
    document.querySelectorAll('section.page[id^="page-"]').forEach(section=>{
      const page=pageName(section);if(!allowed(page))return;const cat=pageLabel(section),tabs=section.querySelector(':scope > .tabs')||section.querySelector('.tabs');if(!tabs)return;
      tabs.querySelectorAll(':scope > .tab').forEach(tab=>{const label=tab.textContent.trim(),target=tabTarget(tab);if(label&&target)out.push({title:`${cat} · ${label}`,label,sub:`Subcategoria · ${cat}`,page,target,tab,type:'subcategory',searchText:`${cat} ${label}`})});
    });return out
  }
  function dynamicPageHits(q){const out=[];document.querySelectorAll('section.page[id^="page-"]').forEach(section=>{const page=pageName(section);if(!allowed(page))return;const label=pageLabel(section);if(matches(label,q))out.push({title:label,sub:'Categoria',page,type:'page',searchText:label})});return out}

  function ingestMedication(){
    document.querySelectorAll('#med4Results [data-med4]').forEach(el=>{const title=el.dataset.med4||el.querySelector('strong')?.textContent?.trim();if(!title)return;const group=el.querySelector('span')?.textContent?.trim()||'Medicação';cache({type:'medication',title,sub:`Clinical · INFO Medicação${group?' · '+group:''}`,page:'clinical',target:'clin-drugs',ref:title,searchText:`${title} ${group} medicação medicamento fármaco`})});
    const detail=document.querySelector('#med4Results .med4-detail');if(detail){const title=detail.querySelector('h3')?.textContent?.trim();if(title)cache({type:'medication',title,sub:'Clinical · INFO Medicação',page:'clinical',target:'clin-drugs',ref:title,searchText:`${detail.textContent} medicação medicamento fármaco`})}
  }
  function ingestDressings(){
    const data=window.fccWoundDressings?.data||[];
    data.forEach(p=>cache({type:'dressing',title:p.name,sub:'Clinical · Pensos / Apósitos',page:'clinical',target:'clin-dressings',ref:p.name,searchText:[p.name,...(p.presentations||[]).flat(),...(p.tags||[]),p.indication,p.components,'penso apósito material ferida'].join(' ')}));
    document.querySelectorAll('#clin-dressings .penso-card').forEach(card=>{const title=card.querySelector('summary strong')?.textContent?.trim();if(title)cache({type:'dressing',title,sub:'Clinical · Pensos / Apósitos',page:'clinical',target:'clin-dressings',ref:title,searchText:`${card.textContent} penso apósito material ferida`})})
  }
  function ingestDilutions(){
    document.querySelectorAll('#perfDilutionGrid .ccd-doc-card').forEach(card=>{const title=card.querySelector('.ccd-doc-top h3')?.textContent?.trim()||card.querySelector('h3')?.textContent?.trim();if(!title)return;cache({type:'dilution',title,sub:'Clinical · Diluições',page:'clinical',target:'clin-perf',ref:title,searchText:`${card.textContent} diluição reconstituição estabilidade administração perfusão`})});
  }
  function ingestIV(){
    const seen=new Set();document.querySelectorAll('#ivcDrugA option,#ivcDrugB option').forEach(o=>{const title=o.value||o.textContent?.trim();if(!title||seen.has(fold(title)))return;seen.add(fold(title));const group=o.parentElement?.tagName==='OPTGROUP'?o.parentElement.label:'';cache({type:'iv',title,sub:`Clinical · Compatibilidade IV${group?' · '+group:''}`,page:'clinical',target:'clin-ivcompat',ref:title,searchText:`${title} ${group} compatibilidade IV y-site fármaco medicação`})});
  }
  function ingestCases(){
    (window.FCC_CASE_BANK||[]).forEach(c=>cache({type:'case',title:c.title||`${c.topic} · ${c.subtopic}`,sub:`Clinical · Casos · ${c.topic||''}`,page:'clinical',target:'clin-sepsis',ref:c.id,query:c.text||c.subtopic||c.topic,searchText:[c.title,c.topic,c.subtopic,c.text,c.why,...(c.choices||[]),'caso clínico treino'].join(' ')}));
  }
  function elementTitle(el){return el.querySelector(':scope > .panel-title h3,:scope > h3,:scope > h4,:scope > summary strong,:scope > strong')?.textContent?.trim()||''}
  function ingestGeneric(){
    const specific=new Set(['clin-drugs','clin-dressings','clin-perf','clin-ivcompat']);
    document.querySelectorAll('section.page[id^="page-"]').forEach(section=>{
      const page=pageName(section);if(!allowed(page))return;const cat=pageLabel(section);
      const subs=[...section.querySelectorAll(':scope > .sub')];
      if(!subs.length){const txt=section.textContent||'';if(txt.trim())cache({type:'section',title:cat,sub:'Conteúdo · '+cat,page,target:'',ref:cat,searchText:txt})}
      subs.forEach(sub=>{
        const target=sub.id||'';if(specific.has(target))return;let count=0;
        sub.querySelectorAll('.card,.item,article,details,.clin-merged-block').forEach(el=>{
          if(count>=120||el.closest('.card')!==el&&el.matches('.item'))return;
          const text=(el.textContent||'').replace(/\s+/g,' ').trim();if(text.length<3)return;let title=elementTitle(el);if(!title&&el.id?.startsWith('merged-'))title=el.querySelector('h3')?.textContent?.trim()||'';if(!title)return;
          cache({type:'content',title,sub:`${cat} · ${target.replace(/^clin-/,'')||'conteúdo'}`,page,target,ref:title,searchText:text});count++;
        });
      });
    })
  }
  function ingestState(){
    const appState=typeof state!=='undefined'?state:null;if(!appState||!unlocked())return;
    for(const x of appState.inventory||[])cache({type:'content',title:x.name,sub:'Emergency · '+(x.category||''),page:'emergency',ref:x.name,searchText:Object.values(x).join(' ')});
    for(const x of appState.research||[])cache({type:'content',title:x.title,sub:'Research',page:'research',ref:x.title,searchText:Object.values(x).join(' ')});
    for(const x of appState.people||[])cache({type:'content',title:x.name,sub:'Família',page:'emergency',ref:x.name,searchText:Object.values(x).join(' ')});
    for(const x of appState.mods||[])cache({type:'content',title:x.name,sub:'Garage · '+(x.vehicle||''),page:'garage',ref:x.name,searchText:Object.values(x).join(' ')})
  }
  function rebuildIndex(){ingestMedication();ingestDressings();ingestDilutions();ingestIV();ingestCases();ingestGeneric();ingestState();window.FCC_GLOBAL_SEARCH_INDEX=INDEX}

  function rank(hit,q){const n=normalizedQuery(q),t=fold(hit.title),s=fold(hit.searchText||`${hit.title} ${hit.sub}`);if(t===n)return 0;if(t.startsWith(n))return 1;if(t.includes(n))return 2;if(hit.type==='medication'||hit.type==='dressing'||hit.type==='dilution'||hit.type==='iv'||hit.type==='case')return 3;if(fold(hit.sub).includes(n))return 4;return s.includes(n)?5:9}

  window.renderGlobalSearch=function(){
    const input=document.getElementById('globalSearch'),box=document.getElementById('globalResults');if(!input||!box)return;const q=normalizedQuery(input.value);if(!q){box.classList.remove('open');box.innerHTML='';box._hits=[];return}
    rebuildIndex();const hits=[];
    discoverSubcategories().forEach(x=>{if(matches(`${x.title} ${x.label} ${x.sub}`,q))pushUnique(hits,x)});dynamicPageHits(q).forEach(x=>pushUnique(hits,x));
    INDEX.forEach(h=>{if(allowed(h.page)&&matches(`${h.title} ${h.sub} ${h.searchText||''}`,q))pushUnique(hits,{...h})});
    const ranked=hits.sort((a,b)=>rank(a,q)-rank(b,q)||String(a.title).localeCompare(String(b.title),'pt',{sensitivity:'base'})).slice(0,30);
    box._hits=ranked;box.innerHTML=ranked.length?ranked.map((h,i)=>`<button class="search-hit" data-search-i="${i}" onclick="openSearchHit(${i})"><div><b>${esc2(h.title)}</b><span>${esc2(h.sub)}</span></div></button>`).join(''):'<div class="item"><span>Sem resultados.</span></div>';box.classList.add('open');
  };

  function afterTarget(page,target,fn){
    const run=()=>{if(target){const section=document.getElementById('page-'+page),tab=[...(section?.querySelectorAll(':scope > .tabs > .tab')||[])].find(t=>tabTarget(t)===target);if(tab)tab.click();else document.getElementById(target)?.classList.add('active')}setTimeout(()=>fn?.(),90)};
    if(typeof window.fccNavigate==='function')window.fccNavigate(page,{after:run});else{(window.go||window.__fccDirectGo)?.(page);setTimeout(run,80)}
  }
  function scrollByTitle(root,title){if(!root)return;const n=fold(title);const nodes=[...root.querySelectorAll('h2,h3,h4,strong,summary')];const h=nodes.find(x=>fold(x.textContent)===n)||nodes.find(x=>fold(x.textContent).includes(n));h?.closest('.card,.item,article,details,.clin-merged-block')?.scrollIntoView({behavior:'smooth',block:'center'})}

  window.openSearchHit=function(i){
    const box=document.getElementById('globalResults'),input=document.getElementById('globalSearch'),h=box?._hits?.[i];if(!h)return;box.classList.remove('open');if(input)input.value='';
    if(h.type==='page'){window.fccNavigate?.(h.page);return}
    if(h.type==='subcategory'){afterTarget(h.page,h.target,()=>document.getElementById(h.target)?.scrollIntoView({behavior:'smooth',block:'start'}));return}
    if(h.type==='medication'){afterTarget('clinical','clin-drugs',()=>{const q=document.getElementById('med4Search');if(q){q.value=h.ref;q.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(()=>document.querySelector('#med4Results .med4-detail')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}});return}
    if(h.type==='dressing'){afterTarget('clinical','clin-dressings',()=>{const q=document.getElementById('pensoSearch');if(q){q.value=h.ref;q.dispatchEvent(new Event('input',{bubbles:true}))}setTimeout(()=>{const card=[...document.querySelectorAll('#clin-dressings .penso-card')].find(c=>fold(c.querySelector('summary strong')?.textContent)===fold(h.ref));if(card){card.open=true;card.scrollIntoView({behavior:'smooth',block:'center'})}},80)});return}
    if(h.type==='dilution'){afterTarget('clinical','clin-perf',()=>{const q=document.getElementById('perfDilutionSearch');if(q){q.value=h.ref;q.dispatchEvent(new Event('input',{bubbles:true}))}setTimeout(()=>{const card=[...document.querySelectorAll('#perfDilutionGrid .ccd-doc-card')].find(c=>fold(c.querySelector('h3')?.textContent)===fold(h.ref));if(card){const d=card.querySelector('.ccd-doc-details');if(d)d.open=true;card.scrollIntoView({behavior:'smooth',block:'center'})}},120)});return}
    if(h.type==='iv'){afterTarget('clinical','clin-ivcompat',()=>{const sel=document.getElementById('ivcDrugA');if(sel){const opt=[...sel.options].find(o=>fold(o.value||o.textContent)===fold(h.ref));if(opt){sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));sel.scrollIntoView({behavior:'smooth',block:'center'})}}});return}
    if(h.type==='case'){afterTarget('clinical','clin-sepsis',()=>{document.getElementById('merged-clin-cases')?.scrollIntoView({behavior:'smooth',block:'start'});const q=document.getElementById('fccCaseSearch');if(q){q.value=h.query||h.title;q.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(()=>document.querySelector(`[data-case="${CSS.escape(String(h.ref))}"]`)?.click(),100)}});return}
    afterTarget(h.page,h.target,()=>{const root=(h.target&&document.getElementById(h.target))||document.getElementById('page-'+h.page);scrollByTitle(root,h.ref||h.title)})
  };

  function installInputUX(){
    const input=document.getElementById('globalSearch'),box=document.getElementById('globalResults');if(!input||!box||input.dataset.globalSearchV2==='1')return;input.dataset.globalSearchV2='1';input.placeholder='Pesquisar medicação, pensos, diluições, casos, códigos…';
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.classList.remove('open');input.blur();return}if(e.key==='Enter'&&box.classList.contains('open')&&box._hits?.length){e.preventDefault();window.openSearchHit(0)}});
    document.addEventListener('click',e=>{if(!e.target.closest('.globalbox'))box.classList.remove('open')});
  }

  let rebuildTimer=null;const schedule=()=>{clearTimeout(rebuildTimer);rebuildTimer=setTimeout(rebuildIndex,140)};
  const clinical=document.getElementById('page-clinical');if(clinical)new MutationObserver(schedule).observe(clinical,{childList:true,subtree:true});
  installInputUX();rebuildIndex();setTimeout(rebuildIndex,700);setTimeout(rebuildIndex,2200);setTimeout(rebuildIndex,5000);
})();
