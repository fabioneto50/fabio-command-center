(()=>{
  if(window.__fccHomePublicShellV3Installed)return;
  window.__fccHomePublicShellV3Installed=true;

  function controls(refreshId,label){
    return `<div class="home-news-controls"><button class="btn small home-news-refresh" id="${refreshId}" type="button">Atualizar</button><button class="btn small home-news-arrow" type="button" data-news-prev aria-label="Notícias anteriores de ${label}">‹</button><button class="btn small home-news-arrow" type="button" data-news-next aria-label="Próximas notícias de ${label}">›</button></div>`;
  }

  function build(){
    const home=document.getElementById('page-home');
    if(!home)return false;
    home.dataset.publicShell='3';
    home.innerHTML=`
      <div class="hero">
        <h2>Notícias</h2>
        <p>Saúde e atualidade mundial, atualizadas automaticamente.</p>
      </div>
      <div class="grid">
        <section class="card full home-news-card" id="homeHealthNewsCard">
          <div class="home-news-head">
            <div><span class="eyebrow">SAÚDE</span><h3>Notícias de Saúde</h3><div class="home-news-meta" id="homeHealthNewsMeta">A carregar notícias…</div></div>
            ${controls('homeHealthNewsRefresh','saúde')}
          </div>
          <div class="home-news-list" id="homeHealthNewsList"><div class="home-news-empty">A carregar notícias de saúde…</div></div>
        </section>
        <section class="card full home-news-card" id="homeWorldNewsCard">
          <div class="home-news-head">
            <div><span class="eyebrow">MUNDO</span><h3>Atualidade do Mundo</h3><div class="home-news-meta" id="homeWorldNewsMeta">A carregar notícias…</div></div>
            ${controls('homeWorldNewsRefresh','atualidade mundial')}
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
