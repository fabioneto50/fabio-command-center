(()=>{
  if(window.__fccSearchEnhancerInstalled)return;
  window.__fccSearchEnhancerInstalled=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc2=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function pageName(section){return section?.id?.replace(/^page-/,'')||''}
  function pageLabel(section){
    const h=section?.querySelector('.pagehead h2')?.textContent?.trim();
    if(h)return h;
    const p=pageName(section);
    return ({home:'Início',clinical:'Clinical',emergency:'Emergency',comms:'Comms',garage:'Garage',research:'Research',settings:'Settings',expenses:'Despesas'})[p]||p;
  }
  function tabTarget(tab){
    const on=tab.getAttribute('onclick')||'';
    return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||tab.dataset.subId||'';
  }
  function discoverSubcategories(){
    const out=[];
    document.querySelectorAll('section.page[id^="page-"]').forEach(section=>{
      const page=pageName(section),cat=pageLabel(section);
      const tabs=section.querySelector(':scope > .tabs')||section.querySelector('.tabs');
      if(!tabs)return;
      tabs.querySelectorAll(':scope > .tab').forEach(tab=>{
        const label=tab.textContent.trim(),target=tabTarget(tab);
        if(!label||!target)return;
        out.push({title:`${cat} · ${label}`,label,sub:`Subcategoria · ${cat}`,page,target,tab});
      });
    });
    return out;
  }
  function dynamicPageHits(q){
    const out=[];
    document.querySelectorAll('section.page[id^="page-"]').forEach(section=>{
      const page=pageName(section);if(page==='home')return;
      const label=pageLabel(section);
      if(fold(label).includes(q))out.push({title:label,sub:'Categoria',page,type:'page'});
    });
    return out;
  }
  function pushUnique(arr,hit){
    const k=[hit.type||'',hit.page||'',hit.target||'',fold(hit.title)].join('|');
    if(!arr.some(x=>x.__k===k)){hit.__k=k;arr.push(hit)}
  }

  window.renderGlobalSearch=function(){
    const input=document.getElementById('globalSearch'),box=document.getElementById('globalResults');
    if(!input||!box)return;
    const q=fold(input.value);
    if(!q){box.classList.remove('open');box.innerHTML='';return}
    const hits=[];

    discoverSubcategories().forEach(x=>{
      const hay=fold(`${x.title} ${x.label} ${x.sub}`);
      if(hay.includes(q))pushUnique(hits,{...x,type:'subcategory'});
    });
    dynamicPageHits(q).forEach(x=>pushUnique(hits,x));

    const appState=typeof state!=='undefined'?state:null;
    if(appState){
      for(const x of (appState.inventory||[]).filter(x=>fold(`${x.name} ${x.category}`).includes(q)).slice(0,6))pushUnique(hits,{title:x.name,sub:'Emergency · '+x.category,page:'emergency',type:'content'});
      for(const x of (appState.research||[]).filter(x=>fold(Object.values(x).join(' ')).includes(q)).slice(0,6))pushUnique(hits,{title:x.title,sub:'Research',page:'research',type:'content'});
      for(const x of (appState.people||[]).filter(x=>fold(x.name).includes(q)).slice(0,4))pushUnique(hits,{title:x.name,sub:'Família',page:'emergency',type:'content'});
      for(const x of (appState.mods||[]).filter(x=>fold(`${x.name} ${x.vehicle}`).includes(q)).slice(0,4))pushUnique(hits,{title:x.name,sub:'Garage · '+x.vehicle,page:'garage',type:'content'});
    }

    const ranked=hits.sort((a,b)=>{
      const aq=fold(a.label||a.title),bq=fold(b.label||b.title);
      const ae=aq===q?0:aq.startsWith(q)?1:a.type==='subcategory'?2:3;
      const be=bq===q?0:bq.startsWith(q)?1:b.type==='subcategory'?2:3;
      return ae-be||String(a.title).localeCompare(String(b.title),'pt');
    }).slice(0,20);

    box._hits=ranked;
    box.innerHTML=ranked.length?ranked.map((h,i)=>`<button class="search-hit" onclick="openSearchHit(${i})"><div><b>${esc2(h.title)}</b><span>${esc2(h.sub)}</span></div></button>`).join(''):'<div class="item"><span>Sem resultados.</span></div>';
    box.classList.add('open');
  };

  window.openSearchHit=function(i){
    const box=document.getElementById('globalResults'),input=document.getElementById('globalSearch');
    const h=box?._hits?.[i];if(!h)return;
    box.classList.remove('open');if(input)input.value='';
    const direct=window.__fccDirectGo||window.go;
    if(h.type==='subcategory'&&h.target){
      direct?.(h.page);
      setTimeout(()=>{
        const section=document.getElementById('page-'+h.page);
        const tab=[...(section?.querySelectorAll('.tabs .tab')||[])].find(t=>tabTarget(t)===h.target);
        if(tab)tab.click();
        else document.getElementById(h.target)?.scrollIntoView({block:'start'});
      },0);
      return;
    }
    direct?.(h.page);
  };
})();