(()=>{
  if(window.__fccResearchLiveSearchV1Installed)return;
  window.__fccResearchLiveSearchV1Installed=true;
  const API='https://www.ebi.ac.uk/europepmc/webservices/rest/search';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  let last=[];
  function addStyles(){
    if(document.getElementById('fcc-research-live-style'))return;
    const s=document.createElement('style');s.id='fcc-research-live-style';s.textContent=`
      .res-live{margin:0 0 14px;border:1px solid rgba(98,212,255,.22);border-radius:17px;background:linear-gradient(145deg,var(--panel),var(--panel-2));padding:13px}.res-live-head{display:flex;gap:10px;align-items:flex-end}.res-live-head>div:first-child{flex:1}.res-live-head h3{margin:0 0 4px}.res-live-head p{margin:0;color:var(--muted);font-size:8px}.res-live-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;margin-top:10px}.res-live-search input{width:100%}.res-live-links{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.res-live-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.res-live-item{border:1px solid var(--line);border-radius:13px;background:var(--panel);padding:10px}.res-live-item h4{margin:5px 0;font-size:11px;line-height:1.35}.res-live-item p{font-size:8px;color:var(--muted);line-height:1.45;margin:3px 0}.res-live-meta{display:flex;gap:5px;flex-wrap:wrap}.res-live-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.res-live-loading{grid-column:1/-1;padding:14px;text-align:center;color:var(--muted);font-size:9px}.res-live-error{grid-column:1/-1;border:1px solid rgba(242,185,94,.25);background:var(--amber-soft);border-radius:11px;padding:10px;font-size:8px;color:var(--muted)}
      @media(max-width:760px){.res-live-head{display:block}.res-live-results{grid-template-columns:1fr}.res-live-search{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  function extLinks(q){const e=encodeURIComponent(q);return `<div class="res-live-links"><a class="btn small" target="_blank" rel="noopener" href="https://pubmed.ncbi.nlm.nih.gov/?term=${e}">PubMed ↗</a><a class="btn small" target="_blank" rel="noopener" href="https://europepmc.org/search?query=${e}">Europe PMC ↗</a><a class="btn small" target="_blank" rel="noopener" href="https://scholar.google.com/scholar?q=${e}">Google Scholar ↗</a></div>`}
  function render(rows){
    const out=document.getElementById('resLiveResults');if(!out)return;last=rows;
    out.innerHTML=rows.length?rows.map((r,i)=>{
      const link=r.pmid?`https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(r.pmid)}/`:`https://europepmc.org/article/${encodeURIComponent(r.source||'')}/${encodeURIComponent(r.id||'')}`;
      return `<article class="res-live-item"><div class="res-live-meta"><span class="badge">${esc(r.pubYear||'—')}</span>${r.isOpenAccess==='Y'?'<span class="badge good">Open access</span>':''}${r.citedByCount?`<span class="badge">${esc(r.citedByCount)} citações</span>`:''}</div><h4>${esc(r.title||'Sem título')}</h4><p>${esc(r.authorString||'')}</p><p>${esc(r.journalTitle||r.journalInfo?.journal?.title||'')}</p><div class="res-live-actions"><a class="btn small primary" target="_blank" rel="noopener" href="${link}">Abrir artigo ↗</a><button class="btn small" type="button" data-res-import="${i}">Importar</button></div></article>`
    }).join(''):'<div class="res-live-loading">Sem resultados.</div>';
    out.querySelectorAll('[data-res-import]').forEach(b=>b.addEventListener('click',()=>importResult(+b.dataset.resImport)));
  }
  function importResult(i){
    const r=last[i];if(!r)return;try{window.openResearchNew?.();setTimeout(()=>{
      const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v||''};
      set('rTitle',r.title);set('rYear',r.pubYear);set('rAuthors',r.authorString);set('rJournal',r.journalTitle||r.journalInfo?.journal?.title);set('rDoi',r.doi);set('rPmid',r.pmid);set('rUrl',r.pmid?`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`:`https://europepmc.org/article/${r.source||''}/${r.id||''}`);set('rTopic','Pesquisa externa');
    },30)}catch(e){}
  }
  async function search(){
    const input=document.getElementById('resLiveQuery'),out=document.getElementById('resLiveResults'),links=document.getElementById('resLiveExternal');if(!input||!out)return;
    const q=input.value.trim();if(!q){out.innerHTML='<div class="res-live-loading">Escreve um tema, fármaco, guideline, autor ou pergunta clínica.</div>';if(links)links.innerHTML='';return}
    if(links)links.innerHTML=extLinks(q);out.innerHTML='<div class="res-live-loading">A pesquisar literatura atual…</div>';
    try{const url=`${API}?query=${encodeURIComponent(q)}&format=json&resultType=core&pageSize=24&sort=CITED desc`;const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();render(j?.resultList?.result||[])}catch(e){out.innerHTML=`<div class="res-live-error"><b>Pesquisa integrada indisponível.</b><br>Usa os botões PubMed / Europe PMC / Google Scholar acima. ${esc(e.message||'')}</div>`}
  }
  function install(){
    const page=document.getElementById('page-research');if(!page)return false;addStyles();if(document.getElementById('resLivePanel'))return true;
    const panel=document.createElement('section');panel.id='resLivePanel';panel.className='res-live';panel.innerHTML=`<div class="res-live-head"><div><span class="eyebrow">PESQUISA EXTERNA</span><h3>Pesquisar nova evidência</h3><p>Pesquisa online independente da biblioteca já guardada no Command Center.</p></div><span class="badge good">Europe PMC · live</span></div><div class="res-live-search"><input id="resLiveQuery" type="search" placeholder="Ex.: septic shock norepinephrine 2026, mechanical ventilation ARDS, family communication ICU…"><button id="resLiveBtn" class="btn primary" type="button">Pesquisar</button></div><div id="resLiveExternal"></div><div id="resLiveResults" class="res-live-results"><div class="res-live-loading">Escreve um tema, fármaco, guideline, autor ou pergunta clínica.</div></div>`;
    const head=page.querySelector(':scope > .pagehead');if(head)head.after(panel);else page.prepend(panel);
    document.getElementById('resLiveBtn').addEventListener('click',search);document.getElementById('resLiveQuery').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search()}});return true;
  }
  let tries=0;const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};boot();
})();
