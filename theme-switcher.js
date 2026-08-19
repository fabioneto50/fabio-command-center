(()=>{
  if(window.__fccThemeSwitcherInstalled)return;
  window.__fccThemeSwitcherInstalled=true;

  const KEY='fcc-master-theme-v1';
  const root=document.documentElement;
  const valid=v=>v==='light'||v==='dark';
  let theme=valid(localStorage.getItem(KEY))?localStorage.getItem(KEY):'dark';

  function addStyles(){
    if(document.getElementById('fcc-theme-style'))return;
    const st=document.createElement('style');
    st.id='fcc-theme-style';
    st.textContent=`
      .fcc-theme-toggle{display:inline-flex;gap:3px;padding:3px;border:1px solid var(--line);border-radius:12px;background:var(--panel-2)}
      .fcc-theme-toggle button{border:0;background:transparent;color:var(--muted);padding:7px 10px;border-radius:9px;font-size:9px;font-weight:800;cursor:pointer}
      .fcc-theme-toggle button.active{background:var(--clinical-soft);color:var(--text);box-shadow:inset 0 0 0 1px rgba(67,159,197,.22)}
      #fccThemeQuick{min-width:60px}

      html[data-fcc-theme="light"]{
        --bg:#f2f6f8;--bg-soft:#f7fafb;--panel:#ffffff;--panel-2:#f7fafc;--panel-3:#eef4f7;
        --line:#d7e2e7;--line-strong:#bccdd5;--text:#142931;--muted:#667b84;
        --clinical:#1685ad;--clinical-soft:rgba(22,133,173,.10);
        --tactical:#218a5a;--tactical-soft:rgba(33,138,90,.09);
        --amber:#9b6918;--amber-soft:rgba(155,105,24,.09);
        --violet:#6556c7;--violet-soft:rgba(101,86,199,.09);
        --steel:#557d92;--danger:#b9414b;--good:#218a5a;--warn:#9b6918;
        --shadow:0 18px 50px rgba(35,58,69,.10)
      }
      html[data-fcc-theme="light"]{background:#f2f6f8!important}
      html[data-fcc-theme="light"] body{color:var(--text)!important;background:radial-gradient(circle at 15% -5%,rgba(52,157,194,.10),transparent 28rem),radial-gradient(circle at 105% 18%,rgba(49,151,104,.06),transparent 26rem),linear-gradient(180deg,#f9fbfc 0,#f2f6f8 46%,#edf3f5 100%)!important}
      html[data-fcc-theme="light"] body:before{opacity:.35!important;background-image:linear-gradient(rgba(18,52,66,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(18,52,66,.03) 1px,transparent 1px)!important}
      html[data-fcc-theme="light"] .top{background:linear-gradient(180deg,rgba(249,251,252,.98),rgba(249,251,252,.91) 72%,transparent)!important}
      html[data-fcc-theme="light"] .logo{color:#083141!important;background:linear-gradient(145deg,#b9edff,#85d8f5 56%,#a8e7c7)!important;box-shadow:0 0 0 1px rgba(34,92,115,.08),0 8px 24px rgba(55,128,157,.10)!important}
      html[data-fcc-theme="light"] .master-chip,html[data-fcc-theme="light"] .pill,html[data-fcc-theme="light"] .badge{background:#f7fafb!important;border-color:#cbd9df!important;color:#5d737d!important}
      html[data-fcc-theme="light"] .badge.good{background:#edf8f2!important;border-color:#a7d6bf!important;color:#267a53!important}
      html[data-fcc-theme="light"] .badge.warn{background:#fff8e9!important;border-color:#dfc78f!important;color:#8f6619!important}
      html[data-fcc-theme="light"] .badge.bad{background:#fff0f1!important;border-color:#e1afb4!important;color:#a73f48!important}
      html[data-fcc-theme="light"] .btn{background:#fff!important;border-color:#cad8de!important;color:#29414b!important}
      html[data-fcc-theme="light"] .btn:hover{background:#f2f7f9!important;border-color:#9fb8c3!important}
      html[data-fcc-theme="light"] .btn.primary{background:linear-gradient(180deg,#e8f7fc,#dff1f7)!important;border-color:#9bcddd!important;color:#176783!important}
      html[data-fcc-theme="light"] .nav{color:#657a84!important}
      html[data-fcc-theme="light"] .nav:hover{background:#eaf1f4!important;color:#203943!important}
      html[data-fcc-theme="light"] .nav.active{background:linear-gradient(90deg,rgba(22,133,173,.12),rgba(22,133,173,.025))!important;color:#153844!important}
      html[data-fcc-theme="light"] .ni{background:#f4f8fa!important;border-color:#d4e0e5!important;color:#607984!important}
      html[data-fcc-theme="light"] .nav.active .ni{background:#e9f6fa!important;border-color:#a9d4e2!important;color:#177596!important}
      html[data-fcc-theme="light"] .hero{background:linear-gradient(135deg,#ffffff,#f7fafb 60%,#f2f9f5)!important;border-color:#cfdee4!important}
      html[data-fcc-theme="light"] .hero p,html[data-fcc-theme="light"] .card p,html[data-fcc-theme="light"] .pagehead p{color:#657b85!important}
      html[data-fcc-theme="light"] .card{background:linear-gradient(180deg,#ffffff,#f9fbfc)!important;border-color:#d7e2e7!important;box-shadow:0 12px 30px rgba(38,66,79,.07)!important}
      html[data-fcc-theme="light"] .card:hover{border-color:#b5cad3!important}
      html[data-fcc-theme="light"] .card[onclick]:hover{background:linear-gradient(180deg,#fff,#f3f8fa)!important}
      html[data-fcc-theme="light"] .metric,html[data-fcc-theme="light"] .result .big{color:#15303a!important}
      html[data-fcc-theme="light"] .tab{color:#687d86!important}
      html[data-fcc-theme="light"] .tab:hover{background:#edf3f5!important;color:#2a4651!important}
      html[data-fcc-theme="light"] .tab.active{background:rgba(22,133,173,.10)!important;color:#126b8a!important;border-color:rgba(22,133,173,.23)!important}
      html[data-fcc-theme="light"] label{color:#667c86!important}
      html[data-fcc-theme="light"] input,html[data-fcc-theme="light"] textarea,html[data-fcc-theme="light"] select{background:#fff!important;border-color:#cedce2!important;color:#172e37!important}
      html[data-fcc-theme="light"] input:focus,html[data-fcc-theme="light"] textarea:focus,html[data-fcc-theme="light"] select:focus{background:#fff!important;border-color:#61a9c2!important}
      html[data-fcc-theme="light"] .result,html[data-fcc-theme="light"] .item,html[data-fcc-theme="light"] .check,html[data-fcc-theme="light"] .step,html[data-fcc-theme="light"] .tablewrap,html[data-fcc-theme="light"] .search{background:#f8fbfc!important;border-color:#d5e2e7!important}
      html[data-fcc-theme="light"] th{background:#eef4f6!important;color:#5f7781!important}html[data-fcc-theme="light"] td,html[data-fcc-theme="light"] th{border-color:#dce6ea!important}
      html[data-fcc-theme="light"] .notice{background:#fff9ec!important;border-color:#dfcb9f!important;color:#745a24!important}
      html[data-fcc-theme="light"] .advice{background:#edf8fc!important;border-color:#b5d8e5!important;color:#345f70!important}
      html[data-fcc-theme="light"] .redflag{background:#fff1f2!important;border-color:#e2b6ba!important;color:#884149!important}
      html[data-fcc-theme="light"] .global-results{background:rgba(255,255,255,.99)!important;border-color:#cbdbe1!important;box-shadow:0 22px 60px rgba(31,62,76,.16)!important}
      html[data-fcc-theme="light"] .search-hit{border-color:#e0e8eb!important}html[data-fcc-theme="light"] .search-hit:hover{background:#f1f6f8!important}
      html[data-fcc-theme="light"] .fcc-sheet-backdrop{background:rgba(35,58,69,.25)!important}
      html[data-fcc-theme="light"] .fcc-category-sheet,html[data-fcc-theme="light"] .family-pin-box{background:linear-gradient(160deg,#fff,#f5f9fb)!important;border-color:#c9dce4!important;box-shadow:0 30px 80px rgba(31,62,76,.18)!important}
      html[data-fcc-theme="light"] .fcc-sheet-close{background:#f5f9fb!important;border-color:#cedde3!important;color:#29414b!important}
      html[data-fcc-theme="light"] .fcc-subitem{background:#f8fbfc!important;border-color:#d6e3e8!important;color:#213a44!important}
      html[data-fcc-theme="light"] .fcc-subitem:hover{background:#eff7fa!important;border-color:#9ccddd!important}
      html[data-fcc-theme="light"] .fcc-subcode{background:linear-gradient(145deg,#e5f6fb,#d8eef6)!important;border-color:#b7dbe7!important;color:#176e8d!important}
      html[data-fcc-theme="light"] .ivc-result,html[data-fcc-theme="light"] .ivsrc-panel,html[data-fcc-theme="light"] .ivc-source,html[data-fcc-theme="light"] .ivcat-card,html[data-fcc-theme="light"] .material-toolbar,html[data-fcc-theme="light"] .material-frame-card{background:#fff!important;border-color:#d5e2e7!important}
      html[data-fcc-theme="light"] .ivc-suggest{background:#fff!important;border-color:#bcd9e4!important;box-shadow:0 18px 45px rgba(31,62,76,.18)!important}
      html[data-fcc-theme="light"] .ivc-suggestion:hover,html[data-fcc-theme="light"] .ivc-suggestion.active{background:#edf7fa!important}
      html[data-fcc-theme="light"] .ivsrc-row{border-color:#e1e9ec!important}
      html[data-fcc-theme="light"] .ivsrc-link,html[data-fcc-theme="light"] .ivcat-sources a{background:#f5f9fb!important;border-color:#d3e1e6!important}
      html[data-fcc-theme="light"] .modal{background:rgba(37,60,71,.28)!important}
      html[data-fcc-theme="light"] .modalbox{background:#fff!important;border-color:#d1e0e6!important;box-shadow:0 28px 80px rgba(31,62,76,.18)!important}
      html[data-fcc-theme="light"] .footer{color:#84959c!important}
    `;
    document.head.appendChild(st);
  }

  function apply(next,persist=true){
    theme=valid(next)?next:'dark';
    root.dataset.fccTheme=theme;
    root.style.colorScheme=theme;
    if(persist)localStorage.setItem(KEY,theme);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=theme==='light'?'#f4f7f9':'#06111e';
    document.querySelectorAll('[data-fcc-theme-choice]').forEach(b=>{
      const active=b.dataset.fccThemeChoice===theme;
      b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
    });
    const q=document.getElementById('fccThemeQuick');
    if(q){q.textContent=theme==='dark'?'Claro':'Escuro';q.title=theme==='dark'?'Ativar modo claro':'Ativar modo escuro';}
    const s=document.getElementById('fccThemeStatus');if(s)s.textContent=theme==='light'?'Modo claro ativo':'Modo escuro ativo';
  }

  function ensureQuick(){
    if(document.getElementById('fccThemeQuick'))return;
    const row=document.querySelector('.top>.row');if(!row)return;
    const b=document.createElement('button');b.type='button';b.id='fccThemeQuick';b.className='btn small';b.addEventListener('click',()=>apply(theme==='dark'?'light':'dark'));
    const backup=[...row.querySelectorAll('button')].find(x=>/backup/i.test(x.textContent));
    if(backup)row.insertBefore(b,backup);else row.appendChild(b);
  }

  function ensureSettings(){
    const page=document.getElementById('page-settings');if(!page||document.getElementById('fccThemeSettings'))return;
    const grid=page.querySelector('.grid');if(!grid)return;
    const c=document.createElement('div');c.className='card half';c.id='fccThemeSettings';
    c.innerHTML='<h3>Aparência</h3><p>Escolhe o aspeto de todo o Command Center. A preferência fica guardada neste dispositivo.</p><div class="actions"><div class="fcc-theme-toggle"><button type="button" data-fcc-theme-choice="light">Claro</button><button type="button" data-fcc-theme-choice="dark">Escuro</button></div></div><div class="tiny" id="fccThemeStatus" style="margin-top:8px"></div>';
    const first=grid.firstElementChild;if(first)grid.insertBefore(c,first.nextSibling);else grid.appendChild(c);
    c.querySelectorAll('[data-fcc-theme-choice]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.fccThemeChoice)));
  }

  addStyles();apply(theme,false);
  const init=()=>{ensureQuick();ensureSettings();apply(theme,false)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.fccSetTheme=apply;
})();
