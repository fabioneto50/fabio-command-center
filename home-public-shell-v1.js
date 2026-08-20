(()=>{
  if(window.__fccHomePublicShellV2Installed)return;
  window.__fccHomePublicShellV2Installed=true;

  function build(){
    const home=document.getElementById('page-home');
    if(!home)return false;
    home.dataset.publicShell='2';
    home.innerHTML=`
      <div class="hero">
        <h2>Notícias</h2>
        <p>Saúde e atualidade mundial, atualizadas automaticamente.</p>
      </div>
      <div class="grid">
        <section class="card full home-news-card" id="homeHealthNewsCard">
          <div class="home-news-head">
            <div><span class="eyebrow">SAÚDE</span><h3>Notícias de Saúde</h3><div class="home-news-meta" id="homeHealthNewsMeta">A carregar notícias…</div></div>
            <button class="btn small" id="homeHealthNewsRefresh" type="button">Atualizar</button>
          </div>
          <div class="home-news-list" id="homeHealthNewsList"><div class="home-news-empty">A carregar notícias de saúde…</div></div>
        </section>
        <section class="card full home-news-card" id="homeWorldNewsCard">
          <div class="home-news-head">
            <div><span class="eyebrow">MUNDO</span><h3>Atualidade do Mundo</h3><div class="home-news-meta" id="homeWorldNewsMeta">A carregar notícias…</div></div>
            <button class="btn small" id="homeWorldNewsRefresh" type="button">Atualizar</button>
          </div>
          <div class="home-news-list" id="homeWorldNewsList"><div class="home-news-empty">A carregar atualidade mundial…</div></div>
        </section>
        <div hidden aria-hidden="true"><span id="homeHealth"></span><span id="homePrep"></span><div id="homeAlerts"></div><textarea id="homeNotes"></textarea></div>
      </div>`;
    return true;
  }

  build();
  document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='home'&&!document.getElementById('homeHealthNewsCard'))build()});
  window.fccBuildPublicHome=build;
})();
