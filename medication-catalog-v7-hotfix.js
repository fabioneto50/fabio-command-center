(()=>{
  if(window.__fccMedicationCatalogV7HotfixInstalled)return;
  window.__fccMedicationCatalogV7HotfixInstalled=true;

  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const install=()=>{
    const A=window.FCCMedicationCatalogV7;
    const host=document.getElementById('clin-drugs');
    const root=document.getElementById('med4Results');
    const input=document.getElementById('med4Search');
    const group=document.getElementById('med4Group');
    const oldBox=document.getElementById('med4Suggest');
    if(!A||!host||!root||!input||!group||!oldBox)return false;

    // Detach the original V7 suggestion observer. It rebuilt the same node it
    // observed and could enter a recursive MutationObserver cycle on iOS.
    const box=oldBox.cloneNode(false);
    oldBox.replaceWith(box);
    input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('open'),120));

    let scheduled=0;
    let rendering=false;

    const records=()=>A.records||[];
    const filtered=()=>{
      const q=fold(input.value),g=group.value||'';
      return records().filter(d=>(!g||d.g===g)&&(!q||fold([d.n,d.g,d.q,d.pd,d.use,d.pk].join(' ')).includes(q)));
    };

    const ensureGroups=()=>{
      const existing=new Set([...group.options].map(o=>o.value));
      [...new Set(records().map(d=>d.g).filter(Boolean))]
        .sort((a,b)=>a.localeCompare(b,'pt',{sensitivity:'base'}))
        .forEach(g=>{
          if(existing.has(g))return;
          const o=document.createElement('option');o.value=g;o.textContent=g;group.appendChild(o);existing.add(g);
        });
    };

    const updateCount=(visibleCount=A.count)=>{
      const badge=[...host.querySelectorAll('.pagehead .badge')]
        .find(el=>/\d+\s+medicamentos/i.test(el.textContent||''));
      if(badge)badge.textContent=`${A.count} medicamentos`;
      host.dataset.medicationCatalogCount=String(A.count);
      host.dataset.medicationCatalogVersion='7.4.3';
      host.dataset.medicationVisibleCount=String(visibleCount);
      const alphaCount=document.getElementById('med5AlphaCount');
      if(alphaCount)alphaCount.textContent=(!input.value&&!group.value)?`${A.count} medicamentos`:`${visibleCount} medicamentos`;
    };

    const detail=d=>{
      const fields=[
        ['Resumo rápido',d.q],['Classe / farmacodinâmica',d.pd],['Utilização clínica',d.use],
        ['Farmacocinética',d.pk],['Monitorização',d.mon],['Riscos / precauções',d.risk],
        ['Função renal',d.renal],['Função hepática',d.hepatic],['Interações relevantes',d.inter],
        ['Antídoto / reversão',d.antidote],['Pontos críticos de enfermagem',d.nursing]
      ].filter(([,v])=>v);
      const iv=!!document.getElementById('ivcDrugA')&&[...document.getElementById('ivcDrugA').options].some(o=>fold(o.textContent)===fold(d.n)||fold(o.value)===fold(d.n));
      return `<article class="med4-detail med7-generated" data-med743-detail="${esc(d.n)}"><div class="med4-head"><div><h3>${esc(d.n)}</h3><p>${esc(d.g||'Sem grupo')}${iv?' · IV / hospitalar':''}</p></div><div class="spacer"></div><span class="badge good">Catálogo 923 · V7</span></div><div class="med4-mech"><small>Como funciona</small><div>${esc(d.pd||d.q||'Consultar RCM/SmPC da apresentação concreta.')}</div></div><div class="med7-grid">${fields.map(([l,v])=>`<section class="med7-box"><div class="med7-label">${esc(l)}</div><p>${esc(v)}</p></section>`).join('')}</div><div class="notice med4-warning"><b>Referência clínica:</b> confirmar RCM/SmPC, prescrição, protocolo institucional, indicação, via, concentração e apresentação concreta.</div><div class="med4-actions">${iv?`<button class="btn primary" type="button" data-med743-compat>Compatibilidade IV</button><button class="btn" type="button" data-med743-perf>Perfusões / diluição</button>`:''}${d.src?`<a class="btn" target="_blank" rel="noopener" href="${esc(d.src)}">RCM / fonte ↗</a>`:''}<button class="btn" type="button" data-med743-back>Voltar à lista</button></div></article>`;
    };

    const openDetail=d=>{
      rendering=true;
      try{
        root.innerHTML=detail(d);
        root.querySelector('[data-med743-back]')?.addEventListener('click',()=>{input.value='';renderList()});
        root.querySelector('[data-med743-compat]')?.addEventListener('click',()=>window.openMed4Compat?.(d.n));
        root.querySelector('[data-med743-perf]')?.addEventListener('click',()=>window.openMed4Perf?.(d.n));
        updateCount(1);
      }finally{rendering=false}
    };

    const renderSuggestions=()=>{
      const q=fold(input.value);box.innerHTML='';
      if(q.length<2){box.classList.remove('open');return}
      const rows=filtered().slice(0,12);
      if(!rows.length){box.classList.remove('open');return}
      for(const d of rows){
        const b=document.createElement('button');b.type='button';
        b.innerHTML=`<strong>${esc(d.n)}</strong><span>${esc(d.g||'Sem grupo')}</span>`;
        b.onmousedown=e=>{e.preventDefault();input.value=d.n;box.classList.remove('open');openDetail(d)};
        box.appendChild(b);
      }
      box.classList.add('open');
    };

    function renderList(){
      if(rendering)return;
      rendering=true;
      try{
        ensureGroups();
        const rows=filtered();
        const q=fold(input.value),exact=q?records().find(d=>fold(d.n)===q):null;
        if(exact){openDetail(exact);renderSuggestions();return}
        root.innerHTML=rows.length?`<div class="med4-list" data-med743-list>${rows.map(d=>`<button class="med4-mini" type="button" data-med4="${esc(d.n)}"><strong>${esc(d.n)}</strong><span>${esc(d.g||'Sem grupo')}</span></button>`).join('')}</div>`:'<div class="item"><span>Sem correspondências.</span></div>';
        root.querySelectorAll('[data-med4]').forEach(b=>{
          b.onclick=e=>{
            e?.preventDefault?.();
            const d=A.get?.(b.dataset.med4)||records().find(x=>fold(x.n)===fold(b.dataset.med4));
            if(d){input.value=d.n;box.classList.remove('open');openDetail(d)}
            return false;
          };
        });
        updateCount(rows.length);
        renderSuggestions();
      }finally{rendering=false}
    }

    const reconcile=()=>{scheduled=0;renderList()};
    const schedule=()=>{if(!scheduled)scheduled=requestAnimationFrame(reconcile)};

    // V4 may render its legacy subset first. These handlers always run a V7
    // pass immediately afterwards, replacing only #med4Results with the full set.
    input.addEventListener('input',()=>setTimeout(schedule,0));
    input.addEventListener('focus',()=>setTimeout(schedule,0));
    group.addEventListener('change',()=>setTimeout(schedule,0));
    document.addEventListener('fcc-subtab-change',e=>{
      if(e.detail?.page==='clinical'&&e.detail?.id==='clin-drugs')setTimeout(schedule,0);
    });

    schedule();
    setTimeout(schedule,250);
    setTimeout(schedule,1000);

    window.FCCMedicationV7Health={
      version:'7.4.3-hotfix',
      get count(){return A.count},
      expected:923,
      get ok(){return A.count===923},
      get rendered(){return root.querySelectorAll('[data-med743-list] > [data-med4]').length},
      refresh:renderList,
      search:q=>{input.value=q||'';schedule()},
      reason:'direct-full-catalogue-render'
    };
    return true;
  };

  let tries=0;
  const run=()=>{if(install()||tries++>60)return;setTimeout(run,100)};
  run();
})();
