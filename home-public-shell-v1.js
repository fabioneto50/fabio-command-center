(()=>{
  if(window.__fccHomePublicShellV1Installed)return;
  window.__fccHomePublicShellV1Installed=true;

  function build(){
    const home=document.getElementById('page-home');
    if(!home||home.dataset.publicShell==='1')return false;
    home.dataset.publicShell='1';
    home.innerHTML=`
      <div class="hero">
        <h2>Clinical Command Center · acesso rápido e atualidade.</h2>
        <p>Consulta clínica estruturada, notícias recentes e estado do sistema num único ecrã.</p>
        <div class="pills"><span class="pill">Clinical OS</span><span class="pill">Notícias atuais</span><span class="pill">PWA / offline-ready</span></div>
      </div>
      <div class="grid">
        <div class="card" id="homeClinicalCard" onclick="go('clinical')" style="cursor:pointer">
          <span class="eyebrow">CLINICAL OS</span><h3>Consulta clínica</h3>
          <div class="metric">20 <small>módulos</small></div>
          <p>Ventilação, ECG, sépsis, perfusões, fármacos, escalas, casos e workflows.</p>
          <div class="actions"><button class="btn primary" type="button">Abrir Clinical</button></div>
        </div>
        <div class="card full home-news-card" id="homeCurrentNewsCard">
          <div class="home-news-head"><div><span class="eyebrow">ATUALIDADE</span><h3>Notícias recentes</h3><div class="home-news-meta" id="homeNewsMeta">A preparar notícias…</div></div><button class="btn small" id="homeNewsRefresh" type="button">Atualizar</button></div>
          <div class="home-news-list" id="homeNewsList"><div class="home-news-empty">A carregar notícias…</div></div>
          <div class="tiny" style="margin-top:9px">Fontes da imprensa portuguesa agregadas através do GDELT. Abre sempre a notícia original para leitura e verificação.</div>
        </div>
        <div class="card">
          <span class="eyebrow">SISTEMA</span><h3>System Health</h3>
          <div class="metric" id="homeHealth">—</div>
          <p>Estado da versão, schema e conteúdos do Command Center.</p>
          <div class="actions"><button class="btn small" type="button" onclick="go('settings')">Abrir Maintenance Center</button></div>
        </div>
        <div hidden aria-hidden="true"><span id="homePrep"></span><div id="homeAlerts"></div><textarea id="homeNotes"></textarea></div>
      </div>`;
    return true;
  }

  build();
  document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='home')build()});
  window.fccBuildPublicHome=build;
})();
