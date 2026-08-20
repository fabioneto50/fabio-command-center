(()=>{
  if(window.__fccPersonalHubV1Installed)return;
  window.__fccPersonalHubV1Installed=true;

  const CHILDREN=[
    {page:'emergency',code:'EM',title:'Emergency',desc:'Preparação, inventário, família, cenários e notas.'},
    {page:'comms',code:'RF',title:'Comms',desc:'Meshtastic, rádio, telemetria, sensores e testes.'},
    {page:'garage',code:'GX',title:'Garage',desc:'Veículos, manutenção, custos, documentos e acessórios.'},
    {page:'research',code:'RX',title:'Research',desc:'Biblioteca, pesquisa de evidência, referências e guidelines.'}
  ];
  const CHILD_SET=new Set(CHILDREN.map(x=>x.page));

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function tabsFor(page){return [...(document.querySelector('#page-'+page+' > .tabs')?.querySelectorAll(':scope > .tab')||[])]}

  function addStyles(){
    if(document.getElementById('fcc-personal-hub-style'))return;
    const s=document.createElement('style');s.id='fcc-personal-hub-style';s.textContent=`
      #page-personal .personal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
      #page-personal .personal-area{position:relative;text-align:left;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,var(--panel),var(--panel-2));padding:15px;cursor:pointer;color:var(--text);transition:.14s ease;min-height:150px}
      #page-personal .personal-area:hover{border-color:rgba(98,212,255,.38);transform:translateY(-1px);background:linear-gradient(145deg,var(--panel-2),var(--panel-3))}
      #page-personal .personal-area-head{display:flex;align-items:flex-start;gap:11px}.personal-area-code{width:45px;height:45px;display:grid;place-items:center;flex:0 0 auto;border:1px solid rgba(98,212,255,.22);border-radius:13px;background:var(--clinical-soft);color:var(--clinical);font-size:10px;font-weight:950;letter-spacing:.05em}
      #page-personal .personal-area h3{margin:1px 0 4px;font-size:17px}.personal-area p{margin:0;color:var(--muted);font-size:9px;line-height:1.45}.personal-area-count{position:absolute;right:13px;top:13px;font-size:7px;color:var(--muted);font-weight:850;letter-spacing:.06em;text-transform:uppercase}
      .personal-mini-tabs{display:flex;gap:5px;flex-wrap:wrap;margin-top:12px}.personal-mini-tabs span{border:1px solid var(--line);border-radius:8px;padding:4px 6px;font-size:7px;color:var(--muted);background:var(--panel)}
      #page-personal .personal-note{margin-top:12px;border:1px solid rgba(114,227,167,.18);background:var(--tactical-soft);border-radius:13px;padding:10px;color:var(--muted);font-size:8px;line-height:1.5}
      @media(max-width:720px){#page-personal .personal-grid{grid-template-columns:1fr}.personal-area{min-height:135px}}
    `;document.head.appendChild(s);
  }

  function ensurePage(){
    if(document.getElementById('page-personal'))return;
    const main=document.querySelector('.layout main');if(!main)return;
    const page=document.createElement('section');page.className='page';page.id='page-personal';
    page.innerHTML=`<div class="pagehead"><div><h2>Pessoal</h2><p>Emergência, comunicações, veículos e investigação num único espaço.</p></div><span class="badge good">PERSONAL HUB</span></div><div class="personal-grid" id="personalGrid"></div><div class="personal-note">Os módulos continuam separados internamente para preservar os dados, filtros, backups e funcionalidades existentes. A navegação principal passa apenas a agrupá-los em Pessoal.</div>`;
    const settings=document.getElementById('page-settings');if(settings)main.insertBefore(page,settings);else main.appendChild(page);
    renderCards();
  }

  function renderCards(){
    const grid=document.getElementById('personalGrid');if(!grid)return;
    grid.innerHTML=CHILDREN.map(x=>{
      const labels=tabsFor(x.page).map(t=>t.textContent.trim()).filter(Boolean);
      const preview=labels.slice(0,5).map(l=>`<span>${esc(l)}</span>`).join('')+(labels.length>5?`<span>+${labels.length-5}</span>`:'');
      return `<button class="personal-area" type="button" data-personal-page="${x.page}"><span class="personal-area-count">${labels.length} subtópicos</span><div class="personal-area-head"><span class="personal-area-code">${x.code}</span><div><h3>${x.title}</h3><p>${x.desc}</p></div></div><div class="personal-mini-tabs">${preview}</div></button>`;
    }).join('');
    grid.querySelectorAll('[data-personal-page]').forEach(b=>b.addEventListener('click',()=>{
      const p=b.dataset.personalPage;
      if(typeof window.openCategoryMenu==='function')window.openCategoryMenu(p);else window.go?.(p);
    }));
  }

  function ensureNav(){
    const side=document.querySelector('nav.side');if(!side)return false;
    CHILDREN.forEach(x=>{const n=side.querySelector(`.nav[data-page="${x.page}"]`);if(n)n.hidden=true});
    let personal=side.querySelector('.nav[data-page="personal"]');
    if(!personal){
      personal=document.createElement('button');personal.className='nav';personal.dataset.page='personal';personal.type='button';personal.innerHTML='<span class="ni">◎</span><span>Pessoal</span>';personal.addEventListener('click',()=>window.go?.('personal'));
      const clinical=side.querySelector('.nav[data-page="clinical"]');if(clinical)clinical.after(personal);else side.appendChild(personal);
    }
    const settings=side.querySelector('.nav[data-page="settings"] span:last-child');if(settings)settings.textContent='Definições';
    return true;
  }

  function simplifyHome(){
    const home=document.getElementById('page-home');if(!home)return;
    home.querySelectorAll('.card[onclick]').forEach(card=>{
      const on=card.getAttribute('onclick')||'';
      if(/go\(['"](?:emergency|comms|garage|research)['"]\)/.test(on))card.remove();
    });
    if(!document.getElementById('homePersonalCard')){
      const clinical=[...home.querySelectorAll('.card')].find(c=>(c.getAttribute('onclick')||'').includes("go('clinical')"));
      const card=document.createElement('div');card.className='card';card.id='homePersonalCard';card.style.cursor='pointer';card.innerHTML='<h3>◎ Pessoal</h3><p>Emergency, Comms, Garage e Research num único espaço.</p>';card.addEventListener('click',()=>window.go?.('personal'));
      if(clinical)clinical.after(card);else home.querySelector('.grid')?.appendChild(card);
    }
    const hero=home.querySelector('.hero h2');if(hero)hero.textContent='Um command center pessoal dividido em Clinical e Pessoal.';
  }

  function simplifyBrand(){
    const p=document.querySelector('.brand p');if(p)p.textContent='MASTER · Clinical · Pessoal';
  }

  function markPersonalActive(){
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page==='personal'));
  }

  function wrapNavigation(){
    if(window.__fccPersonalGoWrapped)return;window.__fccPersonalGoWrapped=true;
    const originalGo=window.go;
    const originalDirect=window.__fccDirectGo||originalGo;
    if(typeof originalGo==='function')window.go=function(p,...args){const r=originalGo.call(this,p,...args);if(CHILD_SET.has(p))markPersonalActive();return r};
    if(typeof originalDirect==='function')window.__fccDirectGo=function(p,...args){const r=originalDirect.call(this,p,...args);if(CHILD_SET.has(p))markPersonalActive();return r};
  }

  function install(){
    if(!document.querySelector('nav.side')||!document.querySelector('.layout main'))return false;
    addStyles();ensurePage();ensureNav();simplifyHome();simplifyBrand();wrapNavigation();renderCards();
    return true;
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>60)return;setTimeout(boot,120)};boot();
})();