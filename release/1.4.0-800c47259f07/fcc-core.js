/* Shared, dependency-free validation and calculation core. UI and tests use this implementation. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.FCCCore = api; if(root.document?.currentScript?.src)root.FCC_ASSET_BASE=new URL(".",root.document.currentScript.src).href; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '1.4.0';
  const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class ValidationError extends Error {
    constructor(field, message) { super(message); this.name = 'ValidationError'; this.field = field; }
  }
  function number(value, field = 'valor', options = {}) {
    const {required = true, min = -Infinity, max = Infinity, exclusiveMin = false} = options;
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
      if (!required) return null;
      throw new ValidationError(field, 'Preenche o campo ' + field + '.');
    }
    if (typeof value !== 'string' && typeof value !== 'number') throw new ValidationError(field, 'Valor numérico inválido.');
    let text = typeof value === 'string' ? value.trim() : String(value);
    // One decimal separator is accepted; grouped or ambiguous numbers are not silently reinterpreted.
    if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(text)) throw new ValidationError(field, 'Introduz um número válido, sem separador de milhares.');
    const n = Number(text.replace(',', '.'));
    if (!Number.isFinite(n)) throw new ValidationError(field, 'O valor tem de ser finito.');
    if (n < min || (exclusiveMin && n === min) || n > max) throw new ValidationError(field, 'Valor fora do domínio permitido para ' + field + '.');
    return n;
  }
  const UNITS = Object.freeze({
    mcgkgmin:{label:'mcg/kg/min',family:'mass',weight:true,factor:60},
    mcgkgh:{label:'mcg/kg/h',family:'mass',weight:true,factor:1},
    mgkgh:{label:'mg/kg/h',family:'mass',weight:true,factor:1000},
    mcgmin:{label:'mcg/min',family:'mass',weight:false,factor:60},
    mgh:{label:'mg/h',family:'mass',weight:false,factor:1000},
    uikgh:{label:'UI/kg/h',family:'UI',weight:true,factor:1},
    uih:{label:'UI/h',family:'UI',weight:false,factor:1}
  });
  function baseAmount(amount, unit) {
    const n = number(amount, 'quantidade', {min:0,exclusiveMin:true});
    const multipliers = {g:1000000,mg:1000,mcg:1,UI:1};
    if (!Object.hasOwn(multipliers, unit)) throw new ValidationError('unidade da quantidade', 'Unidade de quantidade não suportada.');
    const v = n * multipliers[unit];
    if (!Number.isFinite(v)) throw new ValidationError('quantidade', 'Quantidade demasiado elevada.');
    return {v,type:unit === 'UI' ? 'UI' : 'mass'};
  }
  function infusion(input, direction) {
    if (!['doseToRate','rateToDose'].includes(direction)) throw new ValidationError('direção', 'Conversão desconhecida.');
    const a = baseAmount(input.amount, input.amountUnit);
    const volume = number(input.volume, 'volume', {min:0,exclusiveMin:true});
    const unit = UNITS[input.doseUnit];
    if (!unit) throw new ValidationError('unidade da dose', 'Unidade de dose não suportada.');
    if (a.type !== unit.family) throw new ValidationError('unidade da dose', 'Unidades incompatíveis: UI e unidades de massa não podem ser convertidas entre si.');
    const weight = unit.weight ? number(input.weight, 'peso', {min:0,exclusiveMin:true}) : 1;
    const value = number(input.value, direction === 'doseToRate' ? 'dose' : 'débito', {min:0});
    const concentration = a.v / volume, factor = weight * unit.factor;
    const result = direction === 'doseToRate' ? value * factor / concentration : value * concentration / factor;
    if (![concentration,factor,result].every(Number.isFinite) || concentration <= 0 || factor <= 0) throw new ValidationError('resultado', 'Não foi possível calcular com estes valores.');
    return {value:result,unit:direction==='doseToRate'?'mL/h':unit.label,concentration,concentrationUnit:a.type==='UI'?'UI/mL':'mcg/mL',direction};
  }
  function sepsis(input) {
    const definitions = {weight:{min:0,exclusiveMin:true},age:{min:0,max:130},map:{min:0,exclusiveMin:true},lactate:{min:0},urine:{min:0},crt:{min:0}};
    const labels = {weight:'peso',age:'idade',map:'PAM',lactate:'lactato',urine:'diurese',crt:'tempo de reperfusão capilar'};
    const values = Object.fromEntries(Object.entries(definitions).map(([k,o])=>[k,number(input[k],labels[k],{...o,required:false})]));
    const missing = Object.keys(values).filter(k=>values[k]===null), alerts=[];
    const add=(level,title,text)=>alerts.push({level,title,text});
    if (input.shock === 'yes') add('bad','Choque/hipoperfusão','Priorizar avaliação e ressuscitação pela equipa, de acordo com o protocolo institucional.');
    if (values.map !== null && values.map < 60) add('bad','PAM muito baixa','Integrar perfusão, contexto clínico e avaliação imediata.');
    else if (values.map !== null && values.map < 65) add('warn','PAM <65 mmHg','Rever perfusão e objetivos individualizados da equipa.');
    if (values.lactate !== null && values.lactate >= 4) add('bad','Lactato ≥4 mmol/L','Avaliar tendência, perfusão e outras causas.');
    else if (values.lactate !== null && values.lactate >= 2) add('warn','Lactato elevado','Acompanhar a tendência no contexto clínico.');
    if (values.urine !== null && values.urine < 0.5) add('warn',values.urine===0?'Diurese zero introduzida':'Diurese <0,5 mL/kg/h','Confirmar medição e período; avaliar perfusão, função renal e obstrução.');
    if (values.crt !== null && values.crt > 3) add('warn','Reperfusão capilar prolongada','Interpretar como parte da avaliação da perfusão periférica.');
    // Arithmetic reference only, not a recommendation to administer this volume automatically.
    if (input.shock === 'yes' && values.weight !== null) add('info','Referência aritmética de 30 mL/kg',`${30*values.weight} mL. Não é uma prescrição: indicação, tolerância, volume e ritmo exigem avaliação e reavaliação pela equipa.`);
    if (missing.length) add('info','Dados insuficientes para avaliação completa','Não introduzido: '+missing.map(k=>labels[k]).join(', ')+'. Ausência de alertas não exclui gravidade.');
    else if (!alerts.length) add('info','Sem alertas para os dados introduzidos','Este resultado não exclui sépsis, choque ou deterioração; integrar avaliação clínica.');
    return {values,missing,alerts,complete:missing.length===0};
  }
  function civilDate(instant = new Date(), zone = 'Europe/Lisbon') {
    const d = instant instanceof Date ? instant : new Date(instant);
    if (!Number.isFinite(d.getTime())) throw new ValidationError('data','Data inválida.');
    const parts = new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const get=t=>parts.find(p=>p.type===t).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function validCivilDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return false;
    const [y,m,d]=s.split('-').map(Number), date=new Date(Date.UTC(y,m-1,d));
    return y>=1900&&y<=2200&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
  }
  function validateData(value, limits={}) {
    const maxNodes=limits.maxNodes||150000,maxString=limits.maxString||2000000;let nodes=0;
    function walk(v,depth){
      if (++nodes>maxNodes||depth>30) throw new ValidationError('ficheiro','Estrutura demasiado grande ou profunda.');
      if (typeof v==='string'&&v.length>maxString) throw new ValidationError('ficheiro','Campo demasiado extenso.');
      if (typeof v==='number'&&!Number.isFinite(v)) throw new ValidationError('ficheiro','Número não finito.');
      if (v&&typeof v==='object') {
        if (Array.isArray(v)&&v.length>20000) throw new ValidationError('ficheiro','Lista demasiado extensa.');
        for (const [k,x] of Object.entries(v)) {
          if (['__proto__','prototype','constructor'].includes(k)) throw new ValidationError('ficheiro','Propriedade não permitida.');
          walk(x,depth+1);
        }
      }
      if (typeof v==='function'||typeof v==='symbol'||typeof v==='undefined') throw new ValidationError('ficheiro','Tipo de dado não permitido.');
    }
    walk(value,0); return value;
  }
  function parseJSON(text) {
    if (typeof text!=='string'||new TextEncoder().encode(text).length>12000000) throw new ValidationError('ficheiro','Ficheiro inválido ou superior a 12 MB.');
    return validateData(JSON.parse(text));
  }
  function shuffleCase(c, random=Math.random) {
    if (!c||!Array.isArray(c.choices)||!Number.isInteger(c.correct)||c.correct<0||c.correct>=c.choices.length) throw new ValidationError('caso','Caso sem resposta válida.');
    const choices=c.choices.map((text,i)=>({text,id:String(c.id||'case')+':'+i,correct:i===c.correct}));
    for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
    return {...c,choices:choices.map(x=>x.text),choiceIds:choices.map(x=>x.id),correct:choices.findIndex(x=>x.correct)};
  }
  const objective=c=>c.objectiveId||fold((c.topic||'')+'|'+(c.subtopic||c.title||''));
  function sampleCases(bank,count,random=Math.random) {
    const groups=new Map();
    for(const c of bank||[]){const k=objective(c);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);}
    const candidates=[...groups.values()].map(a=>a[Math.floor(random()*a.length)]);
    for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
    return candidates.slice(0,count).map(c=>shuffleCase(c,random));
  }
  function selfTests() {
    const tests=[]; const test=(name,run)=>{try{run();tests.push({name,pass:true,actual:'OK',expected:'OK'});}catch(e){tests.push({name,pass:false,actual:e.message,expected:'OK'});}};
    const near=(a,b)=>{if(Math.abs(a-b)>1e-9)throw new Error(`${a} != ${b}`);};
    const input={amount:8,amountUnit:'mg',volume:50,weight:70,doseUnit:'mcgkgmin',value:0.1};
    test('Perfusão: conversão direta',()=>near(infusion(input,'doseToRate').value,2.625));
    test('Perfusão: conversão inversa',()=>near(infusion({...input,value:2.625},'rateToDose').value,0.1));
    test('Perfusão: rejeitar massa/UI',()=>{let rejected=false;try{infusion({...input,doseUnit:'uih'},'rateToDose');}catch(e){rejected=e instanceof ValidationError;}if(!rejected)throw new Error('Unidades incompatíveis aceites');});
    test('Perfusão: vazio não é zero',()=>{let rejected=false;try{infusion({...input,value:''},'doseToRate');}catch(e){rejected=true;}if(!rejected)throw new Error('Campo vazio aceite');});
    test('Sépsis: diurese zero',()=>{if(!sepsis({urine:0}).alerts.some(x=>x.title==='Diurese zero introduzida'))throw new Error('Zero sem alerta');});
    test('Data civil Lisboa',()=>{if(civilDate('2026-09-15T23:30:00Z')!=='2026-09-16')throw new Error('Dia incorreto');});
    return tests;
  }
  return Object.freeze({VERSION,fold,escapeHTML,ValidationError,number,UNITS,baseAmount,infusion,sepsis,civilDate,validCivilDate,validateData,parseJSON,shuffleCase,sampleCases,objective,selfTests});
});
