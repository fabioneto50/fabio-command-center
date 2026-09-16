/* Shared visual semantics. No clinical values, private records or calculations are changed. */
(()=>{
 'use strict';const root=document.documentElement;root.dataset.fccDesign='2';
 const copy={
  clinical:['Biblioteca clínica','Módulos, calculadoras e consulta rápida.'],
  personal:['Área pessoal','Os teus projetos e registos, num único espaço.'],
  emergency:['Emergência','Preparação, inventário e contactos.'],
  comms:['Comunicações','Equipamentos, telemetria e testes de campo.'],
  garage:['Veículos','Manutenção, custos e documentação.'],
  research:['Investigação','Biblioteca, referências e pesquisa de evidência.'],
  settings:['Definições','Personaliza a aplicação e gere os dados deste dispositivo.']
 };
 for(const [page,[title,description]]of Object.entries(copy)){
  const head=document.querySelector('#page-'+page+' > .pagehead');if(!head)continue;
  const h=head.querySelector('h2');if(h)h.textContent=title;
  const p=head.querySelector('p');if(p)p.textContent=description;
 }
 const side=document.querySelector('nav.side');side.setAttribute('aria-label','Navegação principal');
 if(!side.querySelector('[data-page=favorites]')){const b=document.createElement('button');b.className='nav';b.dataset.page='favorites';side.querySelector('[data-page=settings]').before(b);}
 side.querySelectorAll('.nav[data-page]').forEach(button=>{
  const key=button.dataset.page;button.type='button';button.removeAttribute('onclick');
  button.innerHTML=`<span class="ni">${FCCAreas.icon(key)}</span><span>${FCCNavigation.labels[key]||key}</span>`;
  if(key==='clinical')button.lastElementChild.textContent='Clínica';
 });
 const search=document.getElementById('globalSearch');search.placeholder='Pesquisar na aplicação…';
 const brand=document.querySelector('.brand');
 if(brand){const q=document.getElementById('fccThemeQuick');if(q){q.classList.add('fcc-theme-btn');brand.parentElement.insertBefore(q,brand.nextSibling);}}
 const names={appHealthVersion:'Aplicação',schemaHealth:'Dados',contentHealth:'Conteúdo',storageHealth:'Armazenamento'};
 for(const [id,title]of Object.entries(names)){const card=document.getElementById(id)?.closest('.health');if(card){card.querySelector('span').textContent=title;card.querySelector('b').style.fontVariantNumeric='tabular-nums';}}
 const status=document.getElementById('appHealthVersion')?.closest('.card');if(status)status.id='fccSystemStatus';
 // Raise the appearance controls in the settings grid without moving actions or changing handlers.
 function orderSettings(){
  const grid=document.querySelector('#page-settings > .grid');if(!grid)return;
  ['fccDisplayPrefs','fccThemeSettings'].reverse().forEach(id=>{const card=document.getElementById(id);if(card&&card.parentElement===grid)grid.prepend(card);});
 }

 function refineAreaChrome(){
  document.querySelectorAll('.fcc-lock-area').forEach(button=>{
   if(button.dataset.fccStyled)return;button.dataset.fccStyled='1';button.setAttribute('aria-label','Bloquear área pessoal');button.title='Bloquear área pessoal';button.innerHTML=FCCAreas.icon('lock')+'<span>Bloquear</span>';
  });
 }
 refineAreaChrome();document.addEventListener('fcc-page-change',refineAreaChrome);document.addEventListener('fcc-module-ready',refineAreaChrome);
 const notice=document.querySelector('#page-clinical > .notice');
 if(notice&&!notice.dataset.fccStyled){
  const full=notice.textContent;notice.dataset.fccStyled='1';notice.classList.add('fcc-usage-notice');notice.innerHTML='<strong>Apoio à decisão, não prescrição. Não substitui a avaliação clínica nem o protocolo local.</strong><details><summary>Limites de utilização</summary><p></p></details>';notice.querySelector('p').textContent=full;
  // The duplicated badge is replaced by the same boundary in the always-visible notice.
  document.querySelector('#page-clinical > .pagehead > .badge')?.remove();
 }

 orderSettings();
 document.addEventListener('fcc-page-change',e=>{if(e.detail?.page==='settings')orderSettings();});
})();
