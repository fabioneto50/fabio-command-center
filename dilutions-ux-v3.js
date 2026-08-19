(()=>{
  if(window.__fccDilutionsUXV3Installed)return;
  window.__fccDilutionsUXV3Installed=true;

  let wasActive=false;
  let resetting=false;

  function addStyles(){
    if(document.getElementById('fcc-dilutions-ux-v3-style'))return;
    const s=document.createElement('style');
    s.id='fcc-dilutions-ux-v3-style';
    s.textContent=`
      #clin-perf .perf-toolbar.ccd-toolbar-stacked{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;align-items:stretch!important}
      #clin-perf .ccd-search-row{display:block;width:100%}
      #clin-perf .ccd-search-row .search{width:100%;min-width:0}
      #clin-perf .ccd-search-row .search input{width:100%}
      #clin-perf .ccd-filter-row{display:grid;grid-template-columns:minmax(240px,1fr) auto auto;gap:8px;align-items:center;width:100%}
      #clin-perf .ccd-filter-row #ccdGroup{width:100%;min-width:0}
      #clin-perf .ccd-filter-row .badge{min-height:38px;display:flex;align-items:center;justify-content:center;white-space:nowrap}
      #clin-perf .ccd-filter-row>.btn{min-height:38px;white-space:nowrap}
      @media(max-width:760px){
        #clin-perf .ccd-filter-row{grid-template-columns:1fr}
        #clin-perf .ccd-filter-row .badge,#clin-perf .ccd-filter-row>.btn{width:100%;justify-content:flex-start}
      }
    `;
    document.head.appendChild(s);
  }

  function resetFilters(){
    if(resetting)return;
    const search=document.getElementById('perfDilutionSearch');
    const group=document.getElementById('ccdGroup');
    const only=document.getElementById('ccdOnlyVerified');
    if(!search&&!group&&!only)return;
    resetting=true;
    try{
      if(search)search.value='';
      if(group)group.value='';
      if(only)only.checked=false;
      if(typeof window.renderPerfDilutions==='function')window.renderPerfDilutions();
    }finally{resetting=false}
  }

  function stackToolbar(){
    const host=document.getElementById('clin-perf');
    const toolbar=host?.querySelector('.perf-toolbar');
    const search=document.getElementById('perfDilutionSearch');
    const group=document.getElementById('ccdGroup');
    const only=document.getElementById('ccdOnlyVerified');
    if(!host||!toolbar||!search||!group)return false;

    addStyles();
    toolbar.classList.add('ccd-toolbar-stacked');

    let searchRow=toolbar.querySelector(':scope > .ccd-search-row');
    let filterRow=toolbar.querySelector(':scope > .ccd-filter-row');
    if(!searchRow){searchRow=document.createElement('div');searchRow.className='ccd-search-row'}
    if(!filterRow){filterRow=document.createElement('div');filterRow.className='ccd-filter-row'}

    const searchBox=search.closest('.search')||search;
    const onlyLabel=only?.closest('label')||null;
    const localButton=[...toolbar.children].find(el=>el.tagName==='BUTTON'&&!el.classList.contains('ccd-search-row')&&!el.classList.contains('ccd-filter-row'))||null;

    if(searchBox.parentElement!==searchRow)searchRow.appendChild(searchBox);
    if(group.parentElement!==filterRow)filterRow.appendChild(group);
    if(onlyLabel&&onlyLabel.parentElement!==filterRow)filterRow.appendChild(onlyLabel);
    if(localButton&&localButton.parentElement!==filterRow)filterRow.appendChild(localButton);

    if(searchRow.parentElement!==toolbar)toolbar.prepend(searchRow);
    if(filterRow.parentElement!==toolbar)toolbar.appendChild(filterRow);

    return true;
  }

  function activeNow(){
    const page=document.getElementById('page-clinical');
    const host=document.getElementById('clin-perf');
    return !!(page?.classList.contains('active')&&host?.classList.contains('active'));
  }

  function bindReset(){
    document.addEventListener('fcc-subtab-change',e=>{
      const leaving=e.detail?.page==='clinical'&&e.detail?.id!=='clin-perf'&&wasActive;
      if(leaving)resetFilters();
      wasActive=e.detail?.page==='clinical'&&e.detail?.id==='clin-perf';
    });

    const page=document.getElementById('page-clinical');
    const host=document.getElementById('clin-perf');
    if(!page||!host)return;
    wasActive=activeNow();
    const ob=new MutationObserver(()=>{
      const now=activeNow();
      if(wasActive&&!now)resetFilters();
      wasActive=now;
    });
    ob.observe(page,{attributes:true,attributeFilter:['class']});
    ob.observe(host,{attributes:true,attributeFilter:['class']});
  }

  function install(){
    if(!stackToolbar())return false;
    bindReset();
    return true;
  }

  let tries=0;
  const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};
  boot();
})();
