(()=>{
  if(window.__fccClinicalMaterialInstalled) return;
  window.__fccClinicalMaterialInstalled=true;

  const STOCK_URL='https://script.google.com/a/macros/jmellosaude.pt/s/AKfycbwT0u4ALCsK7x4mplTIEm5pJueq13mIWLcgGehaEp9JHFn5B5-OYSe_w3wZJd3YQLSj/exec';
  const NOTES_KEY='fcc-clinical-material-notes-v1';

  function ensureStyles(){
    if(document.getElementById('clinical-material-style')) return;
    const st=document.createElement('style');
    st.id='clinical-material-style';
    st.textContent=`
      .material-shell{display:grid;gap:12px;margin-top:10px}
      .material-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px;border:1px solid rgba(92,202,255,.18);border-radius:16px;background:rgba(8,24,37,.72)}
      .material-toolbar .spacer{flex:1}.material-source-chip{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#92dfff;border:1px solid rgba(92,202,255,.25);background:rgba(92,202,255,.07);border-radius:999px;padding:6px 9px}
      .material-frame-card{overflow:hidden;border:1px solid rgba(92,202,255,.20);border-radius:18px;background:#07131e;min-height:68vh}
      .material-frame-head{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(92,202,255,.15)}
      .material-frame-head h3{margin:0;font-size:14px}.material-frame-head p{margin:3px 0 0;font-size:9px;color:var(--muted)}
      .material-frame{display:block;width:100%;height:68vh;border:0;background:#fff}
      .material-help{padding:10px 12px;border:1px solid rgba(244,187,85,.20);background:rgba(244,187,85,.06);border-radius:13px;color:#d8bf85;font-size:10px;line-height:1.5}
      .material-notes{display:none}.material-notes.open{display:block}.material-notes textarea{min-height:150px}
      @media(max-width:640px){.material-frame-card,.material-frame{min-height:72vh;height:72vh}.material-toolbar{padding:10px}.material-frame-head{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(st);
  }

  function ensureModule(){
    const page=document.getElementById('page-clinical');
    if(!page) return;
    const tabs=page.querySelector('.tabs');
    if(!tabs||document.getElementById('clin-material')) return;

    const tab=document.createElement('button');
    tab.type='button';
    tab.className='tab';
    tab.textContent='Material';
    tab.setAttribute('onclick',"subtab('clinical','clin-material',this)");
    const sourceTab=[...tabs.querySelectorAll('.tab')].find(x=>/fontes/i.test(x.textContent));
    if(sourceTab) tabs.insertBefore(tab,sourceTab); else tabs.appendChild(tab);

    const sub=document.createElement('div');
    sub.className='sub';
    sub.id='clin-material';
    sub.innerHTML=`
      <div class="material-shell">
        <div class="pagehead" style="margin-top:0"><div><h2 style="font-size:22px">Material</h2><p>Consulta do material disponível em stock.</p></div><span class="material-source-chip">Fonte oficial · J.Mello Saúde</span></div>
        <div class="material-toolbar">
          <a class="btn primary" href="${STOCK_URL}" target="_blank" rel="noopener">Abrir stock oficial ↗</a>
          <button type="button" class="btn" id="materialReloadBtn">Atualizar vista</button>
          <button type="button" class="btn" id="materialNotesBtn">Notas locais</button>
          <div class="spacer"></div>
          <span class="badge good">Stock externo · não duplicado</span>
        </div>
        <div class="material-help">A lista abaixo é carregada diretamente da aplicação Google fornecida. O Command Center não altera nem copia o stock. Se o Google pedir autenticação, inicia sessão com a conta autorizada. Se a incorporação for bloqueada, usa “Abrir stock oficial”.</div>
        <div class="material-notes" id="materialNotesBox">
          <div class="card full"><h3>Notas locais sobre material</h3><p>Notas privadas deste browser; não alteram o stock oficial.</p><textarea id="materialNotesInput" placeholder="Ex.: localização habitual, material a confirmar, observações..."></textarea><div class="actions"><button type="button" class="btn primary" id="materialNotesSave">Guardar notas</button></div></div>
        </div>
        <div class="material-frame-card">
          <div class="material-frame-head"><div><h3>Stock oficial</h3><p>Origem: Google Apps Script · domínio jmellosaude.pt</p></div><span class="badge">Live</span></div>
          <iframe id="materialStockFrame" class="material-frame" src="${STOCK_URL}" title="Stock de material" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
      </div>`;

    const sources=document.getElementById('clin-sources');
    if(sources) page.insertBefore(sub,sources); else page.appendChild(sub);

    document.getElementById('materialReloadBtn')?.addEventListener('click',()=>{
      const f=document.getElementById('materialStockFrame');
      if(f) f.src=STOCK_URL+(STOCK_URL.includes('?')?'&':'?')+'_ts='+Date.now();
    });
    document.getElementById('materialNotesBtn')?.addEventListener('click',()=>document.getElementById('materialNotesBox')?.classList.toggle('open'));
    const input=document.getElementById('materialNotesInput');
    if(input) input.value=localStorage.getItem(NOTES_KEY)||'';
    document.getElementById('materialNotesSave')?.addEventListener('click',()=>{
      localStorage.setItem(NOTES_KEY,input?.value||'');
      if(typeof toast==='function') toast('Notas de material guardadas');
    });
  }

  ensureStyles();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensureModule,{once:true}); else ensureModule();
})();
