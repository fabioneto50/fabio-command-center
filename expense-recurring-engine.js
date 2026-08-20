(()=>{
  if(window.__fccExpenseRecurringEngineInstalled)return;
  window.__fccExpenseRecurringEngineInstalled=true;

  const KEY='fcc-master-expenses-v1';
  const rawSet=Storage.prototype.setItem;
  const VALID_FREQ=new Set(['daily','weekly','fortnightly','monthly','quarterly','yearly']);
  const VALID_STATUS=new Set(['active','paused','cancelled']);

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const pad=n=>String(n).padStart(2,'0');
  const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const today=()=>ymd(new Date());
  const parseDate=s=>{const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],12):new Date()};
  const daysInMonth=(y,m)=>new Date(y,m+1,0,12).getDate();
  const moneyEq=p=>{
    const a=Number(p.amount||0);
    return p.frequency==='daily'?a*365/12:p.frequency==='weekly'?a*52/12:p.frequency==='fortnightly'?a*26/12:p.frequency==='quarterly'?a/3:p.frequency==='yearly'?a/12:a;
  };
  const stableId=s=>{
    let h=2166136261;for(const c of String(s||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}
    return 'rec-'+(h>>>0).toString(36);
  };

  function read(){
    try{
      const x=JSON.parse(localStorage.getItem(KEY)||'null');
      return x&&typeof x==='object'?x:{version:1,expenses:[],categories:[],merchantRules:{},budgets:{},recurring:{},settings:{currency:'EUR'}};
    }catch(e){return {version:1,expenses:[],categories:[],merchantRules:{},budgets:{},recurring:{},settings:{currency:'EUR'}}}
  }
  function emit(detail={}){queueMicrotask(()=>window.dispatchEvent(new CustomEvent('fcc-expenses-changed',{detail})))}
  function write(state,detail={}){rawSet.call(localStorage,KEY,JSON.stringify(state));emit(detail)}

  function latestExpense(state,merchant){
    const q=fold(merchant);
    return [...(state.expenses||[])].filter(x=>fold(x.merchant)===q).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0]||null;
  }
  function normalizePlan(key,p={},state=read()){
    const merchant=String(p.merchant||key||'').trim();
    const last=latestExpense(state,merchant);
    const startDate=String(p.startDate||last?.date||today()).slice(0,10);
    const start=parseDate(startDate);
    const category=p.category||last?.category||'Outros';
    const inferredType=fold(category)==='subscricoes'?'subscription':'recurring';
    const amount=Number(p.amount ?? p.lastAmount ?? last?.amount ?? 0);
    return {
      id:p.id||stableId(merchant),merchant,
      amount:isFinite(amount)?+amount.toFixed(2):0,
      category,type:p.type||inferredType,
      frequency:VALID_FREQ.has(p.frequency)?p.frequency:'monthly',
      billingDay:Math.min(31,Math.max(1,Number(p.billingDay)||start.getDate())),
      startDate,activeFrom:String(p.activeFrom||startDate).slice(0,10),
      payment:p.payment||last?.payment||'Outro',cancelUrl:p.cancelUrl||'',note:p.note||'',
      status:VALID_STATUS.has(p.status)?p.status:'active',
      createdAt:p.createdAt||last?.createdAt||new Date().toISOString(),updatedAt:p.updatedAt||new Date().toISOString(),
      pausedAt:p.pausedAt||'',cancelledAt:p.cancelledAt||'',lastGenerated:p.lastGenerated||''
    };
  }
  function normalizeRecurring(state){
    const out={};
    const src=state.recurring&&typeof state.recurring==='object'?state.recurring:{};
    Object.entries(src).forEach(([key,val])=>{const p=normalizePlan(key,val||{},state);if(p.merchant)out[p.merchant]=p});
    for(const x of state.expenses||[]){
      if(!x?.recurring||!x.merchant||out[x.merchant])continue;
      out[x.merchant]=normalizePlan(x.merchant,{lastAmount:x.amount,category:x.category,startDate:x.date,payment:x.payment},state);
    }
    state.recurring=out;return out;
  }

  function mergeIncoming(value){
    try{
      const incoming=JSON.parse(value),existing=read();
      if(!incoming||typeof incoming!=='object')return value;
      incoming.expenses=Array.isArray(incoming.expenses)?incoming.expenses:[];
      const auto=(existing.expenses||[]).filter(x=>x?.autoRecurring),ids=new Set(incoming.expenses.map(x=>x.id));
      auto.forEach(x=>{if(!ids.has(x.id))incoming.expenses.push(x)});
      normalizeRecurring(existing);
      const prior=existing.recurring||{},src=incoming.recurring&&typeof incoming.recurring==='object'?incoming.recurring:{},merged={...prior};
      Object.entries(src).forEach(([key,val])=>{
        const ex=prior[key];
        if(ex){
          const hasLast=!!(val&&Object.prototype.hasOwnProperty.call(val,'lastAmount'));
          const lastAmt=hasLast?val.lastAmount:ex.amount;
          const category=hasLast&&val?.category?val.category:ex.category;
          merged[key]=normalizePlan(key,{...val,...ex,amount:lastAmt,category,updatedAt:hasLast?(val?.updatedAt||ex.updatedAt):ex.updatedAt},incoming);
        }else merged[key]=normalizePlan(key,val||{},incoming);
      });
      incoming.recurring=merged;normalizeRecurring(incoming);return JSON.stringify(incoming);
    }catch(e){return value}
  }

  function saveIncoming(state,detail={source:'expense-center'}){
    const next=mergeIncoming(JSON.stringify(state));
    rawSet.call(localStorage,KEY,next);
    emit(detail);
  }

  function monthlyOccurrences(plan,endDate){
    const start=parseDate(plan.startDate),end=parseDate(endDate),out=[];let y=start.getFullYear(),m=start.getMonth();
    while(y<end.getFullYear()||(y===end.getFullYear()&&m<=end.getMonth())){
      const d=Math.min(plan.billingDay,daysInMonth(y,m)),s=ymd(new Date(y,m,d,12));
      if(s>=plan.startDate&&s>=(plan.activeFrom||plan.startDate)&&s<=endDate)out.push(s);
      m++;if(m>11){m=0;y++}
    }
    return out;
  }
  function intervalOccurrences(plan,endDate,days){
    const out=[],end=parseDate(endDate),d=parseDate(plan.startDate),active=parseDate(plan.activeFrom||plan.startDate);
    while(d<active)d.setDate(d.getDate()+days);
    let guard=0;while(d<=end&&guard<5000){out.push(ymd(d));d.setDate(d.getDate()+days);guard++}return out;
  }
  function quarterlyOccurrences(plan,endDate){
    const start=parseDate(plan.startDate),end=parseDate(endDate),out=[];let y=start.getFullYear(),m=start.getMonth(),guard=0;
    while((y<end.getFullYear()||(y===end.getFullYear()&&m<=end.getMonth()))&&guard<1000){
      const d=Math.min(plan.billingDay,daysInMonth(y,m)),s=ymd(new Date(y,m,d,12));
      if(s>=plan.startDate&&s>=(plan.activeFrom||plan.startDate)&&s<=endDate)out.push(s);
      m+=3;while(m>11){m-=12;y++}guard++;
    }
    return out;
  }
  function yearlyOccurrences(plan,endDate){
    const start=parseDate(plan.startDate),end=parseDate(endDate),out=[],sm=start.getMonth();
    for(let y=start.getFullYear();y<=end.getFullYear();y++){
      const d=Math.min(plan.billingDay,daysInMonth(y,sm)),s=ymd(new Date(y,sm,d,12));
      if(s>=plan.startDate&&s>=(plan.activeFrom||plan.startDate)&&s<=endDate)out.push(s);
    }
    return out;
  }
  function occurrences(plan,endDate=today()){
    if(!plan||plan.status!=='active'||!plan.startDate)return [];
    if(plan.frequency==='daily')return intervalOccurrences(plan,endDate,1);
    if(plan.frequency==='weekly')return intervalOccurrences(plan,endDate,7);
    if(plan.frequency==='fortnightly')return intervalOccurrences(plan,endDate,14);
    if(plan.frequency==='quarterly')return quarterlyOccurrences(plan,endDate);
    if(plan.frequency==='yearly')return yearlyOccurrences(plan,endDate);
    return monthlyOccurrences(plan,endDate);
  }
  function hasMovement(state,plan,date){
    return (state.expenses||[]).some(x=>x.recurringPlanId===plan.id&&x.date===date||x.recurring&&fold(x.merchant)===fold(plan.merchant)&&x.date===date&&Math.abs(Number(x.amount||0)-Number(plan.amount||0))<0.005);
  }
  function processDue(){
    const state=read();normalizeRecurring(state);const end=today();let added=0;const newRows=[];
    for(const [key,plan] of Object.entries(state.recurring||{})){
      if(plan.status!=='active'||!(plan.amount>0))continue;
      const due=occurrences(plan,end);
      for(const date of due){
        if(hasMovement(state,plan,date)||newRows.some(x=>x.recurringPlanId===plan.id&&x.date===date))continue;
        newRows.push({id:'rexp-'+plan.id+'-'+date,merchant:plan.merchant,amount:+Number(plan.amount).toFixed(2),category:plan.category||'Outros',date,payment:plan.payment||'Outro',note:plan.note?`Recorrente automático · ${plan.note}`:'Recorrente automático',recurring:true,autoRecurring:true,recurringPlanId:plan.id,createdAt:new Date().toISOString()});added++;
      }
      if(due.length)state.recurring[key].lastGenerated=due[due.length-1];
    }
    if(added){state.expenses=[...newRows.sort((a,b)=>String(b.date).localeCompare(String(a.date))),...(state.expenses||[])];write(state,{source:'recurring-engine',added})}
    else rawSet.call(localStorage,KEY,JSON.stringify(state));
    return added;
  }

  function savePlan(input){
    const state=read();normalizeRecurring(state);const oldKey=String(input.oldKey||input.merchant||'').trim(),merchant=String(input.merchant||'').trim();
    if(!merchant)throw new Error('merchant');
    const current=state.recurring[oldKey]||state.recurring[merchant]||{};if(oldKey&&oldKey!==merchant)delete state.recurring[oldKey];
    const plan=normalizePlan(merchant,{...current,...input,merchant,updatedAt:new Date().toISOString()},state);state.recurring[merchant]=plan;write(state,{source:'recurring-ui',action:'save-plan'});
    const added=processDue();return {plan,added};
  }
  function setStatus(key,status){
    const state=read();normalizeRecurring(state);const plan=state.recurring[key];if(!plan)return null;const now=today();
    if(status==='paused'){plan.status='paused';plan.pausedAt=now}
    else if(status==='cancelled'){plan.status='cancelled';plan.cancelledAt=now}
    else if(status==='active'){const wasStopped=plan.status==='paused'||plan.status==='cancelled';plan.status='active';if(wasStopped)plan.activeFrom=now;plan.pausedAt='';plan.cancelledAt=''}
    plan.updatedAt=new Date().toISOString();state.recurring[key]=plan;write(state,{source:'recurring-ui',action:'status',status});
    const added=status==='active'?processDue():0;return {plan,added};
  }
  function removePlan(key){const state=read();normalizeRecurring(state);delete state.recurring[key];write(state,{source:'recurring-ui',action:'remove-plan'})}

  function nextOccurrence(plan,after=today()){
    if(!plan||plan.status!=='active')return '';
    const endD=parseDate(after);endD.setFullYear(endD.getFullYear()+3);return occurrences(plan,ymd(endD)).find(x=>x>after)||'';
  }
  function monthStats(){
    const state=read();normalizeRecurring(state);const now=today(),mk=now.slice(0,7),monthStart=mk+'-01';
    const e=parseDate(monthStart);e.setMonth(e.getMonth()+1);e.setDate(0);const monthEnd=ymd(e);
    const rows=(state.expenses||[]).filter(x=>x.recurring&&String(x.date||'').slice(0,7)===mk),spent=rows.reduce((s,x)=>s+Number(x.amount||0),0);
    const plans=Object.values(state.recurring||{}),active=plans.filter(x=>x.status==='active');let remaining=0;
    active.forEach(p=>occurrences(p,monthEnd).filter(d=>d>now&&!hasMovement(state,p,d)).forEach(()=>remaining+=Number(p.amount||0)));
    const equivalent=active.reduce((s,p)=>s+moneyEq(p),0),next=active.map(p=>({plan:p,date:nextOccurrence(p,now)})).filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
    return {state,rows,spent,remaining,equivalent,activeCount:active.length,next};
  }

  const boot=read();normalizeRecurring(boot);rawSet.call(localStorage,KEY,JSON.stringify(boot));processDue();
  window.FCCRecurringEngine={KEY,read,write,saveIncoming,normalizeRecurring,normalizePlan,occurrences,processDue,savePlan,setStatus,removePlan,nextOccurrence,monthStats,today,moneyEq};
})();