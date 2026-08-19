(()=>{
  if(window.__fccExpenseRecurringUiInstalled)return;
  window.__fccExpenseRecurringUiInstalled=true;

  const E=window.FCCRecurringEngine;if(!E)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=n=>Number(n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
  const safeUrl=s=>{try{const u=new URL(String(s||''),location.href);return /^https?:$/.test(u.protocol)?u.href:''}catch(e){return ''}};
  const freqLabel=f=>({daily:'Diária',weekly:'Semanal',fortnightly:'Quinzenal',monthly:'Mensal',quarterly:'Trimestral',yearly:'Anual'})[f]||f;
  const typeLabel=t=>({subscription:'Subscrição',recurring:'Gasto recorrente',fixed:'Despesa fixa'})[t]||'Gasto recorrente';
  const statusLabel=s=>({active:'Ativo',paused:'Pausado',cancelled:'Cancelado'})[s]||s;
  let editing='';

  function addStyles(){
    if(document.getElementById('fcc-recurring-ui-style'))return;
    const s=document.createElement('style');s.id='fcc-recurring-ui-style';s.textContent=`
      .exr-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.exr-kpi{border:1px solid var(--line);background:var(--panel);border-radius:15px;padding:13px}.exr-kpi small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.07em}.exr-kpi strong{display:block;font-size:21px;margin-top:5px}.exr-kpi span{display:block;color:var(--muted);font-size:8px;margin-top:3px}
      .exr-form{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:10px}.exr-wide{grid-column:span 2}.exr-plan{border:1px solid var(--line);background:var(--panel-2);border-radius:14px;padding:12px;display:grid;gap:9px}.exr-plan-top{display:flex;gap:10px;align-items:flex-start}.exr-plan-top h4{margin:0;font-size:12px}.exr-plan-top p{margin:3px 0 0;color:var(--muted);font-size:8px}.exr-plan .spacer{flex:1}.exr-meta{display:flex;gap:6px;flex-wrap:wrap}.exr-chip{font-size:8px;padding:4px 7px;border:1px solid var(--line);border-radius:999px;background:var(--panel);color:var(--muted)}.exr-chip.active{border-color:rgba(114,227,167,.35);color:var(--good)}.exr-chip.paused{border-color:rgba(242,185,94,.35);color:var(--warn)}.exr-chip.cancelled{border-color:rgba(255,123,134,.35);color:var(--danger)}
      .exr-actions{display:flex;gap:6px;flex-wrap:wrap}.exr-empty{padding:18px;text-align:center;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:9px}.exr-note{margin-top:6px;color:var(--muted);font-size:8px;line-height:1.5}.exr-day-note{display:block;margin-top:3px;color:var(--muted);font-size:8px;min-height:12px}
      html[data-fcc-theme="light"] .exr-plan,html[data-fcc-theme="light"] .exr-kpi{background:#fff!important}
      @media(max-width:900px){.exr-kpis{grid-template-columns:repeat(2,1fr)}.exr-form{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:640px){.exr-kpis,.exr-form{grid-template-columns:1fr}.exr-wide{grid-column:auto}.exr-plan-top{flex-wrap:wrap}}
    `;document.head.appendChild(s);
  }

  function categories(){const s=E.read();return (s.categories||[]).length?s.categories:['Alimentação','Transportes','Casa','Subscrições','Outros']}
  function categoryOptions(sel=''){return categories().map(x=>`<option ${x===sel?'selected':''}>${esc(x)}</option>`).join('')}
  function syncFrequencyUi(){
    const f=document.getElementById('exrFrequency'),d=document.getElementById('exrDay'),n=document.getElementById('exrDayNote');if(!f||!d)return;
    const daily=f.value==='daily';d.disabled=daily;d.title=daily?'Não se aplica na frequência diária':'';
    if(n)n.textContent=daily?'É registada uma cobrança todos os dias a partir da data de início.':'';
  }

  function install(){
    addStyles();
    const tab=[...document.querySelectorAll('#page-expenses > .tabs .tab')].find(x=>(x.getAttribute('onclick')||'').includes("'exp-recurring'"));
    if(tab)tab.textContent='Subscrições / Recorrentes';
    const host=document.getElementById('exp-recurring');if(!host)return;
    host.innerHTML=`<div class="exp-shell">
      <div id="exrKpis" class="exr-kpis"></div>
      <div class="card full">
        <div class="panel-title"><div><h3 id="exrFormTitle">Novo gasto recorrente</h3><p>Cria subscrições e despesas fixas. A cobrança só entra nas despesas quando chega o respetivo dia.</p></div><span class="badge good">Lançamento dia a dia</span></div>
        <div class="exr-form">
          <label>Nome / comerciante<input id="exrMerchant" placeholder="Ex.: Netflix"></label>
          <label>Valor €<input id="exrAmount" type="number" min="0" step="0.01"></label>
          <label>Categoria<select id="exrCategory"></select></label>
          <label>Tipo<select id="exrType"><option value="subscription">Subscrição</option><option value="fixed">Despesa fixa</option><option value="recurring">Outro gasto recorrente</option></select></label>
          <label>Frequência<select id="exrFrequency"><option value="daily">Diária</option><option value="weekly">Semanal</option><option value="fortnightly">Quinzenal</option><option value="monthly" selected>Mensal</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option></select></label>
          <label>Data de início<input id="exrStart" type="date"></label>
          <label>Dia de cobrança<input id="exrDay" type="number" min="1" max="31" placeholder="1–31"><span id="exrDayNote" class="exr-day-note"></span></label>
          <label>Método<select id="exrPayment"><option>Cartão</option><option>MB Way</option><option>Dinheiro</option><option>Débito direto</option><option>Transferência</option><option>Outro</option></select></label>
          <label class="exr-wide">Link para gerir/cancelar<input id="exrCancelUrl" type="url" placeholder="https://..."></label>
          <label class="exr-wide">Nota<input id="exrNote" placeholder="Plano, contrato, observações..."></label>
        </div>
        <div class="actions"><button class="btn primary" id="exrSave">Guardar recorrente</button><button class="btn" id="exrClear">Limpar</button></div>
        <div class="exr-note">Ao marcar uma despesa normal como “recorrente / subscrição”, é criado automaticamente um plano mensal. Podes depois alterar para diária, semanal, quinzenal, mensal, trimestral ou anual.</div>
      </div>
      <div class="grid" style="margin-top:0">
        <div class="card half"><h3>Ativos</h3><div id="exrActive" class="stack"></div></div>
        <div class="card half"><h3>Pausados / Cancelados</h3><div id="exrStopped" class="stack"></div></div>
        <div class="card full"><h3>Movimentos recorrentes · mês atual</h3><div id="exrMonthRows"></div></div>
      </div>
    </div>`;
    document.getElementById('exrStart').value=E.today();
    document.getElementById('exrDay').value=new Date().getDate();
    document.getElementById('exrCategory').innerHTML=categoryOptions('Subscrições');
    document.getElementById('exrSave').onclick=save;
    document.getElementById('exrClear').onclick=clear;
    document.getElementById('exrFrequency').addEventListener('change',syncFrequencyUi);
    document.getElementById('exrStart').addEventListener('change',e=>{const d=new Date(e.target.value+'T12:00:00');if(!isNaN(d))document.getElementById('exrDay').value=d.getDate()});
    enhanceNewExpense();syncFrequencyUi();render();
  }

  function enhanceNewExpense(){
    const flag=document.getElementById('expRecurringFlag');if(!flag||document.getElementById('exrQuickHint'))return;
    const hint=document.createElement('div');hint.id='exrQuickHint';hint.className='advice';hint.style.marginTop='8px';hint.style.display='none';
    hint.innerHTML='<strong>Recorrente</strong><br>Ao guardar, fica mensal por defeito. Depois podes editar frequência, dia e link de cancelamento em “Subscrições / Recorrentes”.';
    flag.closest('.card')?.querySelector('.actions')?.before(hint);
    flag.addEventListener('change',()=>hint.style.display=flag.checked?'block':'none');
  }

  function clear(){
    editing='';document.getElementById('exrFormTitle').textContent='Novo gasto recorrente';
    ['exrMerchant','exrAmount','exrCancelUrl','exrNote'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('exrCategory').innerHTML=categoryOptions('Subscrições');document.getElementById('exrType').value='subscription';document.getElementById('exrFrequency').value='monthly';document.getElementById('exrStart').value=E.today();document.getElementById('exrDay').value=new Date().getDate();document.getElementById('exrPayment').value='Cartão';syncFrequencyUi();
  }
  function save(){
    const merchant=document.getElementById('exrMerchant').value.trim(),amount=Number(document.getElementById('exrAmount').value||0);
    if(!merchant||!(amount>0)){toastSafe('Indica nome e valor válido');return}
    const start=document.getElementById('exrStart').value||E.today();
    const res=E.savePlan({oldKey:editing,merchant,amount,category:document.getElementById('exrCategory').value,type:document.getElementById('exrType').value,frequency:document.getElementById('exrFrequency').value,startDate:start,activeFrom:start,billingDay:Number(document.getElementById('exrDay').value)||new Date(start+'T12:00:00').getDate(),payment:document.getElementById('exrPayment').value,cancelUrl:document.getElementById('exrCancelUrl').value.trim(),note:document.getElementById('exrNote').value.trim(),status:'active'});
    clear();render();toastSafe(res.added?`Recorrente guardado · ${res.added} cobrança(s) lançada(s)`:'Recorrente guardado');
    if(res.added)setTimeout(()=>location.reload(),450);
  }
  function edit(key){
    const state=E.read();E.normalizeRecurring(state);const p=state.recurring?.[key];if(!p)return;editing=key;
    document.getElementById('exrFormTitle').textContent='Editar · '+p.merchant;document.getElementById('exrMerchant').value=p.merchant;document.getElementById('exrAmount').value=p.amount;document.getElementById('exrCategory').innerHTML=categoryOptions(p.category);document.getElementById('exrType').value=p.type||'recurring';document.getElementById('exrFrequency').value=p.frequency||'monthly';document.getElementById('exrStart').value=p.startDate||E.today();document.getElementById('exrDay').value=p.billingDay||1;document.getElementById('exrPayment').value=p.payment||'Outro';document.getElementById('exrCancelUrl').value=p.cancelUrl||'';document.getElementById('exrNote').value=p.note||'';syncFrequencyUi();document.getElementById('exrMerchant').scrollIntoView({behavior:'smooth',block:'center'});
  }
  function status(key,next){
    if(next==='cancelled'&&!confirm('Marcar este gasto recorrente como cancelado? Os movimentos já registados são mantidos.'))return;
    const res=E.setStatus(key,next);render();toastSafe(next==='paused'?'Recorrente pausado':next==='cancelled'?'Recorrente cancelado':'Recorrente reativado');if(res?.added)setTimeout(()=>location.reload(),450);
  }
  function remove(key){if(confirm('Eliminar este plano recorrente da lista? Os movimentos já registados não são apagados.')){E.removePlan(key);render()}}

  function planCard(key,p){
    const next=E.nextOccurrence(p,E.today()),url=safeUrl(p.cancelUrl),stateClass=p.status;
    const dayChip=p.frequency==='daily'?'':`<span class="exr-chip">Dia ${esc(p.billingDay)}</span>`;
    return `<div class="exr-plan"><div class="exr-plan-top"><div><h4>${esc(p.merchant)}</h4><p>${esc(p.category)} · ${esc(typeLabel(p.type))}</p></div><div class="spacer"></div><strong>${money(p.amount)}</strong></div><div class="exr-meta"><span class="exr-chip ${stateClass}">${esc(statusLabel(p.status))}</span><span class="exr-chip">${esc(freqLabel(p.frequency))}</span>${dayChip}${next?`<span class="exr-chip">Próxima ${esc(next)}</span>`:''}</div>${p.note?`<div class="tiny">${esc(p.note)}</div>`:''}<div class="exr-actions"><button class="btn small" data-exr-edit="${esc(key)}">Editar</button>${p.status==='active'?`<button class="btn small" data-exr-status="paused" data-exr-key="${esc(key)}">Pausar</button><button class="btn small" data-exr-status="cancelled" data-exr-key="${esc(key)}">Cancelar</button>`:`<button class="btn small" data-exr-status="active" data-exr-key="${esc(key)}">Reativar</button>`}${url?`<a class="btn small" href="${esc(url)}" target="_blank" rel="noopener">Gerir / cancelar ↗</a>`:''}<button class="btn small" data-exr-remove="${esc(key)}">Remover</button></div></div>`;
  }

  function monthTable(rows){
    if(!rows.length)return '<div class="exr-empty">Ainda não existem cobranças recorrentes neste mês.</div>';
    const a=[...rows].sort((x,y)=>String(y.date).localeCompare(String(x.date)));
    return `<div class="tablewrap"><table class="exp-table"><thead><tr><th>Data</th><th>Comerciante</th><th>Categoria</th><th>Origem</th><th>Valor</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.merchant)}</b></td><td>${esc(x.category)}</td><td>${x.autoRecurring?'Automático':'Manual'}</td><td><b>${money(x.amount)}</b></td></tr>`).join('')}</tbody></table></div>`;
  }
  function render(){
    const host=document.getElementById('exp-recurring');if(!host)return;
    const stats=E.monthStats(),state=stats.state;E.normalizeRecurring(state);const plans=Object.entries(state.recurring||{}).sort((a,b)=>a[1].merchant.localeCompare(b[1].merchant,'pt'));
    const next=stats.next?`${stats.next.plan.merchant} · ${stats.next.date}`:'Sem cobrança futura';
    document.getElementById('exrKpis').innerHTML=`<div class="exr-kpi"><small>Cobrado este mês</small><strong>${money(stats.spent)}</strong><span>${stats.rows.length} movimento(s) recorrente(s)</span></div><div class="exr-kpi"><small>Ainda previsto este mês</small><strong>${money(stats.remaining)}</strong><span>Só entra quando chegar o dia</span></div><div class="exr-kpi"><small>Ativos</small><strong>${stats.activeCount}</strong><span>${esc(next)}</span></div><div class="exr-kpi"><small>Custo mensal equivalente</small><strong>${money(stats.equivalent)}</strong><span>Estimativa das recorrências ativas</span></div>`;
    const active=plans.filter(([,p])=>p.status==='active'),stopped=plans.filter(([,p])=>p.status!=='active');
    document.getElementById('exrActive').innerHTML=active.length?active.map(([k,p])=>planCard(k,p)).join(''):'<div class="exr-empty">Ainda não existem subscrições ou gastos recorrentes ativos.</div>';
    document.getElementById('exrStopped').innerHTML=stopped.length?stopped.map(([k,p])=>planCard(k,p)).join(''):'<div class="exr-empty">Sem recorrentes pausados ou cancelados.</div>';
    document.getElementById('exrMonthRows').innerHTML=monthTable(stats.rows);
    host.querySelectorAll('[data-exr-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.exrEdit));
    host.querySelectorAll('[data-exr-status]').forEach(b=>b.onclick=()=>status(b.dataset.exrKey,b.dataset.exrStatus));
    host.querySelectorAll('[data-exr-remove]').forEach(b=>b.onclick=()=>remove(b.dataset.exrRemove));
  }
  function toastSafe(m){if(typeof window.toast==='function')window.toast(m);else console.log(m)}

  const boot=()=>{install();render()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('fcc-expenses-changed',()=>setTimeout(()=>{if(document.getElementById('exp-recurring')){enhanceNewExpense();render()}},0));
})();