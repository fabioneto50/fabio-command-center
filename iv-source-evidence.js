(()=>{
  if(window.__fccIVSourceEvidenceInstalled)return;
  window.__fccIVSourceEvidenceInstalled=true;

  const CORE=[
    {id:'vch',name:'VCH Critical Care Chart',match:/VCH|pdtm\.vch\.ca/i,url:'https://pdtm.vch.ca/Supporting%20Documents/IV%20Compatibility/Y-site%20Compatibility%20Critical%20Care%20Chart.pdf'},
    {id:'stabilis',name:'Stabilis',match:/Stabilis|stabilis\.org/i,url:'https://www.stabilis.org/'},
    {id:'review',name:'Revisão sistemática UCI · Castells Lao et al.',match:/Revis[aã]o sistem[aá]tica|medintensiva|S2173572719302139|S0210569118302432/i,url:'https://www.medintensiva.org/en-compatibility-drugs-administered-as-y-site-articulo-S2173572719302139'}
  ];

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clean=s=>String(s||'').replace(/\s*↗\s*/g,'').trim();

  function css(){
    if(document.getElementById('ivsrc-style'))return;
    const st=document.createElement('style');st.id='ivsrc-style';st.textContent=`
      .ivsrc-panel{margin-top:12px;border:1px solid rgba(113,158,190,.20);border-radius:16px;background:rgba(5,17,27,.76);overflow:hidden}
      .ivsrc-head{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;padding:12px 13px;border-bottom:1px solid rgba(113,158,190,.14)}.ivsrc-head h4{margin:0;font-size:12px}.ivsrc-head p{margin:3px 0 0;color:var(--muted);font-size:8px;line-height:1.45}.ivsrc-head .badge{white-space:nowrap}
      .ivsrc-summary{padding:11px 13px;font-size:10px;line-height:1.5;border-bottom:1px solid rgba(113,158,190,.12)}
      .ivsrc-rows{display:grid}.ivsrc-row{display:grid;grid-template-columns:minmax(160px,1.15fr) minmax(150px,.85fr) 28px;gap:10px;align-items:center;padding:10px 13px;border-bottom:1px solid rgba(113,158,190,.10)}.ivsrc-row:last-child{border-bottom:0}.ivsrc-name b{display:block;font-size:9px}.ivsrc-name span{display:block;color:var(--muted);font-size:7px;margin-top:2px}.ivsrc-state{display:inline-flex;width:max-content;max-width:100%;align-items:center;gap:6px;border-radius:999px;padding:5px 8px;font-size:8px;font-weight:850;border:1px solid var(--line)}.ivsrc-state:before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}.ivsrc-compatible{color:#74dfb8;background:rgba(59,209,155,.07);border-color:rgba(59,209,155,.22)}.ivsrc-incompatible{color:#ff929b;background:rgba(255,110,121,.07);border-color:rgba(255,110,121,.22)}.ivsrc-conditional{color:#f3ca79;background:rgba(244,187,85,.07);border-color:rgba(244,187,85,.22)}.ivsrc-unknown{color:#8ca4b4;background:rgba(113,158,190,.05);border-color:rgba(113,158,190,.16)}.ivsrc-link{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;border:1px solid rgba(113,158,190,.18);text-decoration:none;color:#8ddfff;background:rgba(8,22,34,.65)}
      .ivsrc-note{padding:9px 13px;color:var(--muted);font-size:8px;line-height:1.5;background:rgba(113,158,190,.025)}
      @media(max-width:640px){.ivsrc-row{grid-template-columns:1fr 28px}.ivsrc-state{grid-column:1/2;grid-row:2}.ivsrc-link{grid-column:2;grid-row:1/3}.ivsrc-head{flex-direction:column}}
    `;document.head.appendChild(st);
  }

  function sourceId(text,url){
    for(const c of CORE)if(c.match.test(text+' '+url))return c.id;
    return null;
  }

  function baseState(out){
    if(out.querySelector('.ivc-result.ivc-ok'))return 'compatible';
    if(out.querySelector('.ivc-result.ivc-bad'))return 'incompatible';
    if(out.querySelector('.ivc-result.ivc-warn'))return 'conditional';
    if(out.querySelector('.ivc-evidence-lite'))return 'supplement';
    return 'unknown';
  }

  function label(state){
    if(state==='compatible')return 'Suporta compatibilidade';
    if(state==='incompatible')return 'Incompatibilidade documentada';
    if(state==='conditional')return 'Condicionada / depende das condições';
    return 'Sem classificação integrada';
  }

  function row(src){
    return `<div class="ivsrc-row"><div class="ivsrc-name"><b>${esc(src.name)}</b>${src.detail?`<span>${esc(src.detail)}</span>`:''}</div><span class="ivsrc-state ivsrc-${src.state}">${esc(label(src.state))}</span>${src.url?`<a class="ivsrc-link" href="${esc(src.url)}" target="_blank" rel="noopener" title="Abrir fonte">↗</a>`:'<span></span>'}</div>`;
  }

  function summary(rows){
    const c=rows.filter(x=>x.state==='compatible').length;
    const i=rows.filter(x=>x.state==='incompatible').length;
    const d=rows.filter(x=>x.state==='conditional').length;
    const u=rows.filter(x=>x.state==='unknown').length;
    if(c&&i)return `<b>Evidência discordante.</b> ${c} fonte(s) suportam compatibilidade e ${i} documentam incompatibilidade. Não partilhar o Y-site sem validação adicional da Farmácia.`;
    if(i)return `<b>Incompatibilidade documentada.</b> ${i} fonte(s) apresentadas suportam incompatibilidade${u?`; ${u} fonte(s) sem classificação integrada`:''}.`;
    if(c)return `<b>Compatibilidade suportada.</b> ${c} fonte(s) apresentadas suportam compatibilidade${d?`; ${d} indicam dependência de condições`:''}${u?`; ${u} sem classificação integrada`:''}.`;
    if(d)return `<b>Compatibilidade condicionada.</b> ${d} fonte(s) descrevem compatibilidade apenas em condições/concentrações específicas${u?`; ${u} sem classificação integrada`:''}.`;
    return `<b>Sem resultado integrado.</b> Nenhuma das fontes atualmente integradas nesta app tem uma classificação apresentada para este par. Isto não equivale a incompatibilidade.`;
  }

  function decorate(){
    const out=document.getElementById('ivcResult');if(!out)return;
    out.querySelector('.ivsrc-panel')?.remove();
    const a=document.getElementById('ivcDrugA')?.value,b=document.getElementById('ivcDrugB')?.value;
    if(!a||!b||a===b)return;

    const state=baseState(out);
    const anchors=[...out.querySelectorAll('a[href]')].filter(a=>!a.closest('.ivsrc-panel'));
    const rows=[];const seen=new Set();

    anchors.forEach(a=>{
      const name=clean(a.textContent)||a.href;
      const id=sourceId(name,a.href);
      let s=state;
      // O painel suplementar v2 usa a revisão sistemática como evidência do par;
      // VCH/Stabilis são apenas links de consulta e não recebem classificação inferida.
      if(state==='supplement')s=id==='review'?'conditional':'unknown';
      if(state==='unknown')s='unknown';
      const key=id||a.href||name;if(seen.has(key))return;seen.add(key);
      const core=CORE.find(x=>x.id===id);
      rows.push({id,name:core?.name||name,url:a.href,state:s,detail:core?'Fonte de referência':'Referência apresentada para este par'});
    });

    CORE.forEach(c=>{
      if(seen.has(c.id))return;
      seen.add(c.id);rows.push({id:c.id,name:c.name,url:c.url,state:'unknown',detail:'Sem classificação integrada para este par'});
    });

    const panel=document.createElement('section');panel.className='ivsrc-panel';
    panel.innerHTML=`<div class="ivsrc-head"><div><h4>Leitura por fonte</h4><p>Cada fonte é mostrada separadamente. Ausência de dados numa fonte não anula um resultado existente noutra.</p></div><span class="badge">${rows.length} fontes</span></div><div class="ivsrc-summary">${summary(rows)}</div><div class="ivsrc-rows">${rows.map(row).join('')}</div><div class="ivsrc-note">“Sem classificação integrada” significa apenas que esta versão da app não tem uma posição dessa fonte associada ao par. Não significa que a fonte tenha concluído incompatibilidade. A concentração, diluente, formulação e condições de contacto continuam a ser determinantes.</div>`;
    out.appendChild(panel);

    const empty=out.querySelector('.ivc-empty p');
    if(empty&&/pelo menos duas|duas referências|sem consenso/i.test(empty.textContent))empty.textContent='A app apresenta agora a evidência fonte a fonte. Uma fonte pode ter dados mesmo quando as restantes ainda não têm classificação integrada.';
  }

  function relabelPolicy(){
    const page=document.getElementById('clin-ivcompat');if(!page)return;
    [...page.querySelectorAll('h3')].forEach(h=>{if(/Regra de validação/i.test(h.textContent))h.textContent='Leitura e validação por fonte'});
    [...page.querySelectorAll('p')].forEach(p=>{if(/prefere segurança a preencher todas as combinações/i.test(p.textContent))p.textContent='Cada fonte é apresentada individualmente; consenso aumenta a confiança, mas uma fonte válida não é escondida por ausência de dados nas restantes.'});
  }

  function init(){
    css();relabelPolicy();
    const out=document.getElementById('ivcResult');if(!out)return setTimeout(init,180);
    let busy=false;
    const obs=new MutationObserver(()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{decorate();busy=false})});
    obs.observe(out,{childList:true,subtree:true,characterData:true});
    document.getElementById('ivcDrugA')?.addEventListener('change',()=>setTimeout(decorate,20));
    document.getElementById('ivcDrugB')?.addEventListener('change',()=>setTimeout(decorate,20));
    decorate();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
