(()=>{
  if(window.__fccExpenseCenterInstalled)return;
  window.__fccExpenseCenterInstalled=true;

  const KEY='fcc-master-expenses-v1';
  const ORDER_KEY='fcc-master-subcategory-order-v1';
  const VERSION=1;
  const DEFAULT_CATEGORIES=[
    'Alimentação','Supermercado','Transportes','Veículos / Combustível','Casa',
    'Saúde','Lazer','Compras','Subscrições','Viagens','Educação',
    'Seguros / Financeiro','Telecomunicações','Presentes','Trabalho','Outros'
  ];
  const BASE_RULES=[
    ['uber eats','Alimentação'],['bolt food','Alimentação'],['glovo','Alimentação'],['wolt','Alimentação'],
    ['mcdonald','Alimentação'],['burger king','Alimentação'],['kfc','Alimentação'],['pizza hut','Alimentação'],
    ['restaurante','Alimentação'],['cafe','Alimentação'],['café','Alimentação'],['pastelaria','Alimentação'],
    ['continente','Supermercado'],['pingo doce','Supermercado'],['lidl','Supermercado'],['auchan','Supermercado'],
    ['mercadona','Supermercado'],['intermarche','Supermercado'],['intermarché','Supermercado'],['aldi','Supermercado'],
    ['uber','Transportes'],['bolt','Transportes'],['carris','Transportes'],['metropolitano','Transportes'],['metro lisboa','Transportes'],
    ['cp ','Transportes'],['fertagus','Transportes'],['rede expressos','Transportes'],['flixbus','Transportes'],['taxi','Transportes'],['táxi','Transportes'],
    ['galp','Veículos / Combustível'],['repsol','Veículos / Combustível'],['prio','Veículos / Combustível'],['bp ','Veículos / Combustível'],
    ['cepsa','Veículos / Combustível'],['moove','Veículos / Combustível'],['via verde','Veículos / Combustível'],
    ['emel','Veículos / Combustível'],['estacionamento','Veículos / Combustível'],['lavagem auto','Veículos / Combustível'],
    ['leroy merlin','Casa'],['ikea','Casa'],['jysk','Casa'],['bricomarche','Casa'],['bricomarché','Casa'],['maxmat','Casa'],
    ['farmacia','Saúde'],['farmácia','Saúde'],['wells','Saúde'],['hospital','Saúde'],['clinica','Saúde'],['clínica','Saúde'],
    ['cinema','Lazer'],['nos cinemas','Lazer'],['ticketline','Lazer'],['bol','Lazer'],['steam','Lazer'],['playstation','Lazer'],
    ['worten','Compras'],['fnac','Compras'],['amazon','Compras'],['aliexpress','Compras'],['temu','Compras'],['zara','Compras'],
    ['h&m','Compras'],['decathlon','Compras'],['primark','Compras'],['ikea online','Compras'],
    ['netflix','Subscrições'],['spotify','Subscrições'],['disney','Subscrições'],['hbo','Subscrições'],['max.com','Subscrições'],
    ['icloud','Subscrições'],['apple.com/bill','Subscrições'],['google one','Subscrições'],['youtube premium','Subscrições'],
    ['amazon prime','Subscrições'],['chatgpt','Subscrições'],['openai','Subscrições'],
    ['booking','Viagens'],['airbnb','Viagens'],['tap air','Viagens'],['ryanair','Viagens'],['easyjet','Viagens'],['hotel','Viagens'],
    ['edp','Casa'],['endesa','Casa'],['goldenergy','Casa'],['epal','Casa'],['luzboa','Casa'],
    ['meo','Telecomunicações'],['vodafone','Telecomunicações'],['nos telecom','Telecomunicações'],['nowo','Telecomunicações'],
    ['seguro','Seguros / Financeiro'],['fidelidade','Seguros / Financeiro'],['tranquilidade','Seguros / Financeiro'],
    ['ageas','Seguros / Financeiro'],['zurich','Seguros / Financeiro'],['allianz','Seguros / Financeiro'],
    ['udemy','Educação'],['coursera','Educação'],['livraria','Educação'],['curso','Educação']
  ];

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const money=n=>Number(n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
  const today=()=>new Date().toISOString().slice(0,10);
  const monthKey=d=>String(d||'').slice(0,7);

  function defaultState(){
    return {version:VERSION,expenses:[],categories:[...DEFAULT_CATEGORIES],merchantRules:{},budgets:{},recurring:{},settings:{currency:'EUR'}};
  }
  function loadState(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!raw||typeof raw!=='object')return defaultState();
      return {
        ...defaultState(),...raw,
        expenses:Array.isArray(raw.expenses)?raw.expenses:[],
        categories:Array.isArray(raw.categories)&&raw.categories.length?raw.categories:[...DEFAULT_CATEGORIES],
        merchantRules:raw.merchantRules&&typeof raw.merchantRules==='object'?raw.merchantRules:{},
        budgets:raw.budgets&&typeof raw.budgets==='object'?raw.budgets:{},
        recurring:raw.recurring&&typeof raw.recurring==='object'?raw.recurring:{}
      };
    }catch(e){return defaultState()}
  }
  let data=loadState();
  function save(){if(window.FCCRecurringEngine?.saveIncoming)window.FCCRecurringEngine.saveIncoming(data,{source:'expense-center'});else localStorage.setItem(KEY,JSON.stringify(data));renderAll()}

  function classify(text){
    const q=fold(text);
    if(!q)return {category:'Outros',reason:'Sem descrição suficiente',merchant:''};
    const learned=Object.entries(data.merchantRules).sort((a,b)=>b[0].length-a[0].length).find(([merchant])=>q.includes(fold(merchant)));
    if(learned)return {category:learned[1],reason:'Regra aprendida',merchant:learned[0]};
    const base=[...BASE_RULES].sort((a,b)=>b[0].length-a[0].length).find(([term])=>q.includes(fold(term)));
    if(base)return {category:base[1],reason:'Reconhecimento automático',merchant:base[0]};
    return {category:'Outros',reason:'Sem regra conhecida',merchant:extractMerchant(text)};
  }
  function extractMerchant(text){
    let s=String(text||'').replace(/(?:^|\s)(?:€\s*)?\d+(?:[.,]\d{1,2})?(?:\s*€)?\s*$/,'').trim();
    return s||String(text||'').trim();
  }
  function parseNatural(text){
    const s=String(text||'').trim();
    const matches=[...s.matchAll(/(?:^|\s)(?:€\s*)?(\d+(?:[.,]\d{1,2})?)(?:\s*€)?(?=\s|$)/g)];
    let amount='';
    if(matches.length)amount=matches[matches.length-1][1].replace(',','.');
    const merchant=extractMerchant(s);
    const hit=classify(merchant||s);
    return {merchant,amount,category:hit.category,reason:hit.reason};
  }
  function categoryOptions(selected=''){
    return data.categories.map(c=>`<option value="${esc(c)}" ${c===selected?'selected':''}>${esc(c)}</option>`).join('');
  }

  function addStyles(){
    if(document.getElementById('fcc-expense-style'))return;
    const st=document.createElement('style');st.id='fcc-expense-style';st.textContent=`
      #page-expenses{--expense:#4fc6a4;--expense-soft:rgba(79,198,164,.10)}
      .exp-shell{display:grid;gap:12px}.exp-quick{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(140px,.55fr);gap:10px;align-items:end}
      .exp-natural{position:relative}.exp-natural input{font-size:16px;padding:13px 14px}.exp-hint{margin-top:5px;font-size:8px;color:var(--muted)}
      .exp-suggestion{margin-top:10px;border:1px solid rgba(79,198,164,.25);background:rgba(79,198,164,.06);border-radius:14px;padding:11px;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}.exp-suggestion b{font-size:11px}.exp-suggestion span{font-size:8px;color:var(--muted)}
      .exp-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.exp-kpi{border:1px solid var(--line);border-radius:15px;background:var(--panel);padding:13px}.exp-kpi small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.exp-kpi strong{display:block;margin-top:5px;font-size:22px;letter-spacing:-.03em}.exp-kpi span{display:block;color:var(--muted);font-size:8px;margin-top:3px}
      .exp-bars{display:grid;gap:7px}.exp-bar{display:grid;grid-template-columns:minmax(110px,.8fr) minmax(120px,2fr) auto;gap:9px;align-items:center}.exp-bar label{display:block;font-size:9px;color:var(--text)}.exp-track{height:8px;background:var(--panel-3);border-radius:999px;overflow:hidden;border:1px solid var(--line)}.exp-fill{height:100%;background:linear-gradient(90deg,var(--clinical),var(--tactical));border-radius:999px}.exp-bar b{font-size:9px}
      .exp-table{width:100%;border-collapse:collapse}.exp-table th,.exp-table td{padding:9px;border-bottom:1px solid var(--line);font-size:9px}.exp-table th{color:var(--muted);font-weight:700}.exp-cat-chip{display:inline-flex;padding:4px 7px;border-radius:999px;background:var(--clinical-soft);border:1px solid rgba(98,212,255,.18);font-size:8px}
      .exp-rule{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--panel-2)}
      .exp-budget-row{display:grid;grid-template-columns:minmax(120px,1fr) 120px 1.6fr auto;gap:8px;align-items:center;border-bottom:1px solid var(--line);padding:9px 0}.exp-budget-row:last-child{border:0}.exp-budget-row strong{font-size:9px}.exp-budget-row input{padding:7px}.exp-budget-progress{height:8px;border-radius:999px;background:var(--panel-3);overflow:hidden;border:1px solid var(--line)}.exp-budget-progress>span{display:block;height:100%;background:var(--clinical)}
      .exp-recurring{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:9px;background:var(--panel-2)}.exp-recurring strong{font-size:10px}.exp-recurring span{font-size:8px;color:var(--muted)}
      .exp-filter-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.exp-empty{padding:18px;text-align:center;color:var(--muted);font-size:10px;border:1px dashed var(--line);border-radius:13px}
      .exp-nav-icon{font-size:14px;font-weight:900}
      html[data-fcc-theme="light"] .exp-suggestion{background:rgba(33,138,90,.06)}
      @media(max-width:900px){.exp-kpis{grid-template-columns:repeat(2,1fr)}.exp-filter-row{grid-template-columns:repeat(2,1fr)}.exp-budget-row{grid-template-columns:1fr 110px}.exp-budget-progress{grid-column:1/3}.exp-budget-row .btn{grid-column:2}}
      @media(max-width:640px){.exp-quick,.exp-kpis,.exp-filter-row{grid-template-columns:1fr}.exp-bar{grid-template-columns:1fr auto}.exp-track{grid-column:1/3}.exp-rule{grid-template-columns:1fr}.exp-recurring{grid-template-columns:1fr auto}.exp-budget-row{grid-template-columns:1fr 100px}.exp-natural input{font-size:15px}}
    `;document.head.appendChild(st);
  }

  function ensureNav(){
    if(document.querySelector('.nav[data-page="expenses"]'))return;
    const nav=document.querySelector('.side');if(!nav)return;
    const b=document.createElement('button');b.className='nav';b.dataset.page='expenses';b.setAttribute('onclick',"go('expenses')");b.innerHTML='<span class="ni exp-nav-icon">€</span><span>Despesas</span>';
    const research=nav.querySelector('.nav[data-page="research"]');
    if(research)nav.insertBefore(b,research);else nav.appendChild(b);
  }

  function ensureHomeCard(){
    const grid=document.querySelector('#page-home > .grid');if(!grid||document.getElementById('homeExpenseCard'))return;
    const card=document.createElement('div');card.className='card';card.id='homeExpenseCard';card.style.cursor='pointer';
    card.innerHTML='<h3>💶 Despesas</h3><div class="metric" id="homeExpenseMetric">—</div><p>Registo, categorização e análise financeira pessoal.</p>';
    card.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openExpensesMenu()});
    const research=[...grid.children].find(x=>/Research/i.test(x.textContent));
    if(research)grid.insertBefore(card,research);else grid.appendChild(card);
    renderHomeMetric();
  }

  function section(id,title,html,active=false){
    return `<div class="sub${active?' active':''}" id="${id}"><div class="exp-shell">${html}</div></div>`;
  }

  function ensurePage(){
    if(document.getElementById('page-expenses'))return;
    const main=document.querySelector('main');if(!main)return;
    const page=document.createElement('section');page.className='page';page.id='page-expenses';
    page.innerHTML=`
      <div class="pagehead"><div><h2>Despesas</h2><p>Registo inteligente, categorização e análise das tuas despesas.</p></div><span class="badge good">Dados locais · EUR</span></div>
      <div class="tabs">
        <button class="tab active" onclick="subtab('expenses','exp-new',this)">Nova despesa</button>
        <button class="tab" onclick="subtab('expenses','exp-general',this)">Análise geral</button>
        <button class="tab" onclick="subtab('expenses','exp-period',this)">Análise por período</button>
        <button class="tab" onclick="subtab('expenses','exp-categories',this)">Categorias</button>
        <button class="tab" onclick="subtab('expenses','exp-budgets',this)">Orçamentos</button>
        <button class="tab" onclick="subtab('expenses','exp-recurring',this)">Recorrentes / Subscrições</button>
        <button class="tab" onclick="subtab('expenses','exp-rules',this)">Comerciantes / Regras</button>
        <button class="tab" onclick="subtab('expenses','exp-reports',this)">Relatórios / Exportação</button>
      </div>

      ${section('exp-new','Nova despesa',`
        <div class="card full">
          <h3>Registo rápido</h3><p>Escreve como te for natural. Ex.: <b>Uber 12,50</b> ou <b>Glovo 18,90</b>.</p>
          <div class="exp-quick" style="margin-top:10px">
            <label class="exp-natural">Descrição / comerciante<input id="expNatural" placeholder="Ex.: Uber 12,50" autocomplete="off"><span class="exp-hint">A categoria e o valor são sugeridos enquanto escreves.</span></label>
            <label>Data<input id="expDate" type="date"></label>
          </div>
          <div id="expAutoSuggestion"></div>
        </div>
        <div class="card full">
          <h3>Detalhes</h3>
          <div class="form4">
            <label>Comerciante<input id="expMerchant" placeholder="Uber"></label>
            <label>Valor €<input id="expAmount" type="number" step="0.01" min="0"></label>
            <label>Categoria<select id="expCategory"></select></label>
            <label>Método<select id="expPayment"><option>Cartão</option><option>MB Way</option><option>Dinheiro</option><option>Débito direto</option><option>Transferência</option><option>Outro</option></select></label>
          </div>
          <div class="form2" style="margin-top:9px">
            <label>Nota<input id="expNote" placeholder="Opcional"></label>
            <label style="display:flex;align-items:center;gap:8px;grid-template-columns:auto 1fr"><input id="expRecurringFlag" type="checkbox" style="width:16px"> Marcar como recorrente / subscrição</label>
          </div>
          <div class="actions"><button class="btn primary" id="expSaveBtn">Guardar despesa</button><button class="btn" id="expClearBtn">Limpar</button></div>
        </div>
        <div class="card full"><h3>Últimas despesas</h3><div id="expRecent"></div></div>
      `,true)}

      ${section('exp-general','Análise geral',`
        <div id="expGeneralKpis" class="exp-kpis"></div>
        <div class="grid" style="margin-top:0">
          <div class="card half"><h3>Por categoria · mês atual</h3><div id="expGeneralCategories" class="exp-bars" style="margin-top:10px"></div></div>
          <div class="card half"><h3>Evolução mensal</h3><div id="expMonthlyTrend" class="exp-bars" style="margin-top:10px"></div></div>
          <div class="card full"><h3>Maiores despesas · mês atual</h3><div id="expTopExpenses"></div></div>
        </div>
      `)}

      ${section('exp-period','Análise por período',`
        <div class="card full">
          <h3>Período personalizado</h3>
          <div class="exp-filter-row" style="margin-top:9px">
            <label>De<input id="expFrom" type="date"></label>
            <label>Até<input id="expTo" type="date"></label>
            <label>Categoria<select id="expPeriodCategory"><option value="">Todas</option></select></label>
            <label>Pesquisar<input id="expPeriodSearch" placeholder="Comerciante / nota"></label>
          </div>
        </div>
        <div id="expPeriodKpis" class="exp-kpis"></div>
        <div class="grid" style="margin-top:0">
          <div class="card half"><h3>Distribuição por categoria</h3><div id="expPeriodCategories" class="exp-bars" style="margin-top:10px"></div></div>
          <div class="card half"><h3>Top comerciantes</h3><div id="expPeriodMerchants" class="exp-bars" style="margin-top:10px"></div></div>
          <div class="card full"><h3>Movimentos</h3><div id="expPeriodTable"></div></div>
        </div>
      `)}

      ${section('exp-categories','Categorias',`
        <div class="card half"><h3>Categorias disponíveis</h3><div id="expCategoryList" class="list"></div></div>
        <div class="card half"><h3>Adicionar categoria</h3><label>Nome<input id="expNewCategory" placeholder="Ex.: Animais"></label><div class="actions"><button class="btn primary" id="expAddCategory">Adicionar</button></div><div class="advice" style="margin-top:10px">Categorias personalizadas passam imediatamente a estar disponíveis na Nova despesa e nas regras.</div></div>
      `)}

      ${section('exp-budgets','Orçamentos',`
        <div class="card full"><h3>Orçamento mensal</h3><p>Define um limite global e/ou por categoria. O consumo é calculado com base no mês atual.</p><div style="margin-top:10px"><label>Limite mensal total €<input id="expBudgetTotal" type="number" min="0" step="1"></label></div><div class="actions"><button class="btn primary" id="expBudgetTotalSave">Guardar limite total</button></div></div>
        <div class="card full"><h3>Limites por categoria</h3><div id="expBudgetRows"></div></div>
      `)}

      ${section('exp-recurring','Recorrentes / Subscrições',`
        <div class="card full"><h3>Recorrentes identificadas</h3><p>Despesas marcadas como recorrentes e comerciantes com repetição frequente.</p><div id="expRecurringList" class="stack"></div></div>
      `)}

      ${section('exp-rules','Comerciantes / Regras',`
        <div class="card full"><h3>Ensinar categorização</h3><p>Associa um comerciante a uma categoria. A regra é aplicada automaticamente nas próximas despesas.</p>
          <div class="form2" style="margin-top:9px"><label>Comerciante / palavra<input id="expRuleMerchant" placeholder="Ex.: Glovo"></label><label>Categoria<select id="expRuleCategory"></select></label></div>
          <div class="actions"><button class="btn primary" id="expRuleSave">Guardar regra</button></div>
        </div>
        <div class="card full"><h3>Regras aprendidas</h3><div id="expRulesList" class="stack"></div></div>
      `)}

      ${section('exp-reports','Relatórios / Exportação',`
        <div class="card half"><h3>Exportar dados</h3><p>Os dados desta categoria são independentes e podem ser exportados para cópia de segurança.</p><div class="actions"><button class="btn primary" id="expExportJson">Exportar JSON</button><button class="btn" id="expExportCsv">Exportar CSV</button></div></div>
        <div class="card half"><h3>Importar backup</h3><p>Importa um JSON previamente exportado pelo módulo Despesas.</p><label>Ficheiro JSON<input id="expImportFile" type="file" accept=".json,application/json"></label></div>
        <div class="card full"><h3>Resumo de dados</h3><div id="expReportSummary"></div></div>
      `)}
    `;
    const settings=document.getElementById('page-settings');
    if(settings)main.insertBefore(page,settings);else main.appendChild(page);
  }

  function openExpensesMenu(){
    if(typeof window.openCategoryMenu==='function'){
      window.openCategoryMenu('expenses');
      setTimeout(()=>{
        const sheet=document.getElementById('fcc-category-sheet');
        if(!sheet)return;
        const h=sheet.querySelector('.fcc-sheet-head h3');if(h)h.textContent='Despesas';
        const eye=sheet.querySelector('.fcc-sheet-eyebrow');if(eye)eye.textContent='FINANCE';
        const p=sheet.querySelector('.fcc-sheet-head p');if(p)p.textContent='Regista, analisa e organiza as tuas despesas.';
        const head=sheet.querySelector('.fcc-sheet-head');
        if(head&&!head.querySelector('.exp-organize-trigger')&&typeof window.fccOrganizeSubcategories==='function'){
          const close=head.querySelector('.fcc-sheet-close');
          const b=document.createElement('button');b.type='button';b.className='fcc-organize-trigger exp-organize-trigger';b.textContent='Organizar';
          b.addEventListener('click',e=>{e.stopPropagation();window.fccOrganizeSubcategories('expenses')});
          if(close)head.insertBefore(b,close);else head.appendChild(b);
        }
      },0);
    }else if(typeof go==='function')go('expenses');
  }

  function installNavigationIntercept(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('.nav[data-page="expenses"]');
      if(nav){e.preventDefault();e.stopImmediatePropagation();openExpensesMenu()}
    },true);
  }

  function initControls(){
    const d=document.getElementById('expDate');if(d&&!d.value)d.value=today();
    fillCategorySelects();

    const natural=document.getElementById('expNatural');
    natural?.addEventListener('input',()=>{
      const p=parseNatural(natural.value);
      if(p.merchant)document.getElementById('expMerchant').value=p.merchant;
      if(p.amount)document.getElementById('expAmount').value=p.amount;
      document.getElementById('expCategory').value=p.category;
      renderSuggestion(p);
    });
    document.getElementById('expMerchant')?.addEventListener('input',e=>{
      const hit=classify(e.target.value);document.getElementById('expCategory').value=hit.category;renderSuggestion({merchant:e.target.value,category:hit.category,reason:hit.reason,amount:document.getElementById('expAmount').value});
    });
    document.getElementById('expSaveBtn')?.addEventListener('click',saveExpense);
    document.getElementById('expClearBtn')?.addEventListener('click',clearExpenseForm);

    ['expFrom','expTo','expPeriodCategory','expPeriodSearch'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderPeriod));
    const now=new Date(),first=new Date(now.getFullYear(),now.getMonth(),1);
    const from=document.getElementById('expFrom'),to=document.getElementById('expTo');
    if(from&&!from.value)from.value=first.toISOString().slice(0,10);
    if(to&&!to.value)to.value=today();

    document.getElementById('expAddCategory')?.addEventListener('click',addCategory);
    document.getElementById('expBudgetTotalSave')?.addEventListener('click',()=>{
      data.budgets.__total=Number(document.getElementById('expBudgetTotal').value||0);save();toastSafe('Orçamento total guardado');
    });
    document.getElementById('expRuleSave')?.addEventListener('click',saveRule);
    document.getElementById('expExportJson')?.addEventListener('click',exportJson);
    document.getElementById('expExportCsv')?.addEventListener('click',exportCsv);
    document.getElementById('expImportFile')?.addEventListener('change',importJson);
  }

  function renderSuggestion(p){
    const box=document.getElementById('expAutoSuggestion');if(!box)return;
    if(!p?.merchant){box.innerHTML='';return}
    box.innerHTML=`<div class="exp-suggestion"><div><b>${esc(p.merchant)} → ${esc(p.category)}</b><span>${esc(p.reason)}${p.amount?' · '+money(p.amount):''}</span></div><span class="badge good">Sugestão automática</span></div>`;
  }

  function fillCategorySelects(){
    ['expCategory','expRuleCategory'].forEach(id=>{const s=document.getElementById(id);if(s){const cur=s.value;s.innerHTML=categoryOptions(cur);if(cur&&data.categories.includes(cur))s.value=cur}});
    const ps=document.getElementById('expPeriodCategory');if(ps){const cur=ps.value;ps.innerHTML='<option value="">Todas</option>'+categoryOptions(cur);ps.value=cur}
  }

  function saveExpense(){
    const merchant=document.getElementById('expMerchant')?.value.trim()||'';
    const amount=Number(document.getElementById('expAmount')?.value||0);
    const category=document.getElementById('expCategory')?.value||'Outros';
    const date=document.getElementById('expDate')?.value||today();
    const payment=document.getElementById('expPayment')?.value||'Outro';
    const note=document.getElementById('expNote')?.value.trim()||'';
    const recurring=!!document.getElementById('expRecurringFlag')?.checked;
    if(!merchant||!amount||amount<=0){toastSafe('Indica comerciante e valor válido');return}
    data.expenses.unshift({id:uid(),merchant,amount:+amount.toFixed(2),category,date,payment,note,recurring,createdAt:new Date().toISOString()});
    const auto=classify(merchant);
    if(auto.category!==category||auto.reason==='Sem regra conhecida')data.merchantRules[merchant]=category;
    if(recurring)data.recurring[merchant]={category,lastAmount:+amount.toFixed(2),updatedAt:new Date().toISOString()};
    save();clearExpenseForm();toastSafe('Despesa guardada');
  }
  function clearExpenseForm(){
    ['expNatural','expMerchant','expAmount','expNote'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
    const c=document.getElementById('expCategory');if(c)c.value='Outros';
    const r=document.getElementById('expRecurringFlag');if(r)r.checked=false;
    const d=document.getElementById('expDate');if(d)d.value=today();
    const s=document.getElementById('expAutoSuggestion');if(s)s.innerHTML='';
  }

  function removeExpense(id){data.expenses=data.expenses.filter(x=>x.id!==id);save();toastSafe('Despesa eliminada')}
  function expenseTable(rows,limit=0){
    const arr=limit?rows.slice(0,limit):rows;
    if(!arr.length)return '<div class="exp-empty">Ainda não existem despesas neste período.</div>';
    return `<div class="tablewrap"><table class="exp-table"><thead><tr><th>Data</th><th>Comerciante</th><th>Categoria</th><th>Método</th><th>Valor</th><th></th></tr></thead><tbody>${arr.map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.merchant)}</b>${x.note?`<div class="tiny">${esc(x.note)}</div>`:''}</td><td><span class="exp-cat-chip">${esc(x.category)}</span></td><td>${esc(x.payment||'')}</td><td><b>${money(x.amount)}</b></td><td><button class="btn small" data-exp-del="${esc(x.id)}">×</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  function bindDeleteButtons(root=document){root.querySelectorAll('[data-exp-del]').forEach(b=>b.onclick=()=>removeExpense(b.dataset.expDel))}

  function aggregate(rows,keyFn){
    const m={};rows.forEach(x=>{const k=keyFn(x)||'Outros';m[k]=(m[k]||0)+Number(x.amount||0)});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  }
  function bars(entries,maxItems=12){
    if(!entries.length)return '<div class="exp-empty">Sem dados.</div>';
    const max=Math.max(...entries.map(x=>x[1]),1);
    return entries.slice(0,maxItems).map(([name,val])=>`<div class="exp-bar"><label>${esc(name)}</label><div class="exp-track"><div class="exp-fill" style="width:${Math.max(2,(val/max)*100)}%"></div></div><b>${money(val)}</b></div>`).join('');
  }

  function monthRows(key){return data.expenses.filter(x=>monthKey(x.date)===key)}
  function currentMonth(){return today().slice(0,7)}
  function previousMonth(){
    const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return d.toISOString().slice(0,7)
  }
  function renderHomeMetric(){
    const el=document.getElementById('homeExpenseMetric');if(el){const total=monthRows(currentMonth()).reduce((s,x)=>s+x.amount,0);el.innerHTML=`${money(total)} <small>este mês</small>`}
  }
  function renderRecent(){
    const el=document.getElementById('expRecent');if(!el)return;el.innerHTML=expenseTable([...data.expenses].sort((a,b)=>String(b.date).localeCompare(String(a.date))),8);bindDeleteButtons(el)
  }
  function renderGeneral(){
    const cur=monthRows(currentMonth()),prev=monthRows(previousMonth());
    const total=cur.reduce((s,x)=>s+x.amount,0),pTotal=prev.reduce((s,x)=>s+x.amount,0);
    const cats=aggregate(cur,x=>x.category);const top=cats[0];
    const days=new Date().getDate(),avg=days?total/days:0;
    const diff=pTotal?((total-pTotal)/pTotal)*100:null;
    const k=document.getElementById('expGeneralKpis');if(k)k.innerHTML=`
      <div class="exp-kpi"><small>Este mês</small><strong>${money(total)}</strong><span>${cur.length} despesas</span></div>
      <div class="exp-kpi"><small>Mês anterior</small><strong>${money(pTotal)}</strong><span>${diff===null?'Sem comparação':(diff>=0?'+':'')+diff.toFixed(1)+'%'}</span></div>
      <div class="exp-kpi"><small>Média / dia</small><strong>${money(avg)}</strong><span>até hoje</span></div>
      <div class="exp-kpi"><small>Categoria principal</small><strong style="font-size:16px">${esc(top?.[0]||'—')}</strong><span>${top?money(top[1]):'Sem dados'}</span></div>`;
    const ce=document.getElementById('expGeneralCategories');if(ce)ce.innerHTML=bars(cats);
    const months=[];for(let i=5;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);const key=d.toISOString().slice(0,7);months.push([key,monthRows(key).reduce((s,x)=>s+x.amount,0)])}
    const mt=document.getElementById('expMonthlyTrend');if(mt)mt.innerHTML=bars(months,6);
    const topEl=document.getElementById('expTopExpenses');if(topEl){topEl.innerHTML=expenseTable([...cur].sort((a,b)=>b.amount-a.amount),10);bindDeleteButtons(topEl)}
  }

  function periodRows(){
    const from=document.getElementById('expFrom')?.value||'0000-01-01',to=document.getElementById('expTo')?.value||'9999-12-31';
    const cat=document.getElementById('expPeriodCategory')?.value||'',q=fold(document.getElementById('expPeriodSearch')?.value||'');
    return data.expenses.filter(x=>x.date>=from&&x.date<=to&&(!cat||x.category===cat)&&(!q||fold(x.merchant+' '+x.note+' '+x.category).includes(q))).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  }
  function renderPeriod(){
    const rows=periodRows(),total=rows.reduce((s,x)=>s+x.amount,0),cats=aggregate(rows,x=>x.category),mer=aggregate(rows,x=>x.merchant);
    const avg=rows.length?total/rows.length:0,max=rows.reduce((m,x)=>Math.max(m,x.amount),0);
    const k=document.getElementById('expPeriodKpis');if(k)k.innerHTML=`
      <div class="exp-kpi"><small>Total</small><strong>${money(total)}</strong><span>${rows.length} despesas</span></div>
      <div class="exp-kpi"><small>Média / despesa</small><strong>${money(avg)}</strong><span>ticket médio</span></div>
      <div class="exp-kpi"><small>Maior despesa</small><strong>${money(max)}</strong><span>no período</span></div>
      <div class="exp-kpi"><small>Categorias</small><strong>${cats.length}</strong><span>com movimentos</span></div>`;
    const c=document.getElementById('expPeriodCategories');if(c)c.innerHTML=bars(cats);
    const m=document.getElementById('expPeriodMerchants');if(m)m.innerHTML=bars(mer);
    const t=document.getElementById('expPeriodTable');if(t){t.innerHTML=expenseTable(rows);bindDeleteButtons(t)}
  }

  function addCategory(){
    const input=document.getElementById('expNewCategory');const name=input?.value.trim();if(!name)return;
    if(data.categories.some(c=>fold(c)===fold(name))){toastSafe('Categoria já existe');return}
    data.categories.push(name);if(input)input.value='';save();toastSafe('Categoria adicionada');
  }
  function deleteCategory(name){
    if(DEFAULT_CATEGORIES.includes(name)){toastSafe('As categorias base não podem ser eliminadas');return}
    if(data.expenses.some(x=>x.category===name)){toastSafe('Categoria em uso; altera primeiro as despesas associadas');return}
    data.categories=data.categories.filter(c=>c!==name);
    Object.keys(data.merchantRules).forEach(k=>{if(data.merchantRules[k]===name)delete data.merchantRules[k]});
    delete data.budgets[name];save();
  }
  function renderCategories(){
    const el=document.getElementById('expCategoryList');if(!el)return;
    el.innerHTML=data.categories.map(c=>`<div class="item"><div><strong>${esc(c)}</strong><span>${data.expenses.filter(x=>x.category===c).length} movimentos</span></div>${DEFAULT_CATEGORIES.includes(c)?'<span class="badge">Base</span>':`<button class="btn small" data-cat-del="${esc(c)}">Eliminar</button>`}</div>`).join('');
    el.querySelectorAll('[data-cat-del]').forEach(b=>b.onclick=()=>deleteCategory(b.dataset.catDel));
  }

  function renderBudgets(){
    const total=document.getElementById('expBudgetTotal');if(total)total.value=data.budgets.__total||'';
    const rows=document.getElementById('expBudgetRows');if(!rows)return;
    const cur=monthRows(currentMonth());
    rows.innerHTML=data.categories.map(c=>{
      const spent=cur.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0),limit=Number(data.budgets[c]||0),pct=limit?Math.min(100,(spent/limit)*100):0;
      return `<div class="exp-budget-row"><strong>${esc(c)}</strong><input type="number" min="0" step="1" data-budget="${esc(c)}" value="${limit||''}" placeholder="€ / mês"><div><div class="exp-budget-progress"><span style="width:${pct}%"></span></div><div class="tiny" style="margin-top:4px">${money(spent)}${limit?' / '+money(limit):''}</div></div><button class="btn small" data-budget-save="${esc(c)}">Guardar</button></div>`;
    }).join('');
    rows.querySelectorAll('[data-budget-save]').forEach(b=>b.onclick=()=>{const cat=b.dataset.budgetSave,input=rows.querySelector(`[data-budget="${CSS.escape(cat)}"]`);data.budgets[cat]=Number(input?.value||0);save();toastSafe('Orçamento guardado')});
  }

  function recurringCandidates(){
    const by={};data.expenses.forEach(x=>{(by[x.merchant]||(by[x.merchant]=[])).push(x)});
    const arr=[];
    Object.entries(by).forEach(([merchant,rows])=>{
      const manual=rows.some(x=>x.recurring)||data.recurring[merchant];
      const months=new Set(rows.map(x=>monthKey(x.date))).size;
      if(manual||months>=2){
        const avg=rows.reduce((s,x)=>s+x.amount,0)/rows.length;
        arr.push({merchant,category:rows[0]?.category||data.recurring[merchant]?.category||'Outros',count:rows.length,months,avg,manual});
      }
    });
    return arr.sort((a,b)=>b.months-a.months||b.count-a.count);
  }
  function renderRecurring(){
    const el=document.getElementById('expRecurringList');if(!el)return;
    const arr=recurringCandidates();
    el.innerHTML=arr.length?arr.map(x=>`<div class="exp-recurring"><div><strong>${esc(x.merchant)}</strong><span>${esc(x.category)} · ${x.count} registos · ${x.months} mês(es)</span></div><b>${money(x.avg)} méd.</b><span class="badge ${x.manual?'good':''}">${x.manual?'Marcada':'Candidata'}</span></div>`).join(''):'<div class="exp-empty">Ainda não foram identificadas despesas recorrentes.</div>';
  }

  function saveRule(){
    const merchant=document.getElementById('expRuleMerchant')?.value.trim(),cat=document.getElementById('expRuleCategory')?.value;
    if(!merchant||!cat)return;data.merchantRules[merchant]=cat;save();document.getElementById('expRuleMerchant').value='';toastSafe('Regra guardada');
  }
  function deleteRule(merchant){delete data.merchantRules[merchant];save()}
  function renderRules(){
    const el=document.getElementById('expRulesList');if(!el)return;
    const rows=Object.entries(data.merchantRules).sort((a,b)=>a[0].localeCompare(b[0],'pt'));
    el.innerHTML=rows.length?rows.map(([m,c])=>`<div class="exp-rule"><strong>${esc(m)}</strong><span class="exp-cat-chip">${esc(c)}</span><button class="btn small" data-rule-del="${esc(m)}">Eliminar</button></div>`).join(''):'<div class="exp-empty">Ainda não ensinaste regras personalizadas.</div>';
    el.querySelectorAll('[data-rule-del]').forEach(b=>b.onclick=()=>deleteRule(b.dataset.ruleDel));
  }

  function renderReports(){
    const el=document.getElementById('expReportSummary');if(!el)return;
    const total=data.expenses.reduce((s,x)=>s+x.amount,0),first=[...data.expenses].sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
    el.innerHTML=`<div class="exp-kpis"><div class="exp-kpi"><small>Registos</small><strong>${data.expenses.length}</strong></div><div class="exp-kpi"><small>Total histórico</small><strong>${money(total)}</strong></div><div class="exp-kpi"><small>Regras aprendidas</small><strong>${Object.keys(data.merchantRules).length}</strong></div><div class="exp-kpi"><small>Desde</small><strong style="font-size:16px">${first?.date||'—'}</strong></div></div>`;
  }

  function download(name,type,text){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
  }
  function exportJson(){download(`despesas-${today()}.json`,'application/json',JSON.stringify(data,null,2))}
  function exportCsv(){
    const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
    const rows=[['Data','Comerciante','Valor EUR','Categoria','Método','Nota','Recorrente'],...data.expenses.map(x=>[x.date,x.merchant,x.amount.toFixed(2),x.category,x.payment,x.note,x.recurring?'Sim':'Não'])];
    download(`despesas-${today()}.csv`,'text/csv;charset=utf-8','\ufeff'+rows.map(r=>r.map(q).join(';')).join('\n'));
  }
  function importJson(e){
    const f=e.target.files?.[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{try{const obj=JSON.parse(r.result);if(!obj||!Array.isArray(obj.expenses))throw 0;data={...defaultState(),...obj};save();toastSafe('Backup de despesas importado')}catch(err){toastSafe('Ficheiro inválido')}e.target.value=''};r.readAsText(f)
  }

  function renderAll(){
    fillCategorySelects();renderHomeMetric();renderRecent();renderGeneral();renderPeriod();renderCategories();renderBudgets();renderRecurring();renderRules();renderReports();
  }
  function toastSafe(msg){if(typeof toast==='function')toast(msg);else console.log(msg)}

  function init(){
    addStyles();ensureNav();ensurePage();ensureHomeCard();installNavigationIntercept();initControls();renderAll();
    setTimeout(()=>{
      try{
        const saved=JSON.parse(localStorage.getItem(ORDER_KEY)||'{}');
        if(saved?.expenses&&Array.isArray(saved.expenses)){
          const wrap=document.querySelector('#page-expenses > .tabs'),tabs=[...(wrap?.querySelectorAll('.tab')||[])];
          const id=t=>((t.getAttribute('onclick')||'').match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)||[])[1];
          const map=new Map(tabs.map(t=>[id(t),t]));saved.expenses.forEach(k=>map.get(k)&&wrap.appendChild(map.get(k)));
        }
      }catch(e){}
    },100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.openExpensesMenu=openExpensesMenu;
})();