/* Personal landing owns no selected subgroup. Private data remains behind FCCAccess. */
(()=>{
 'use strict';
 if(window.__fccPersonalHubV2Installed)return;window.__fccPersonalHubV2Installed=true;
 const main=document.querySelector('.layout main');
 if(!document.getElementById('page-personal')){
  const page=document.createElement('section');page.id='page-personal';page.className='page';
  page.innerHTML='<div class="pagehead"><div><h2>Pessoal</h2><p>Os teus projetos e registos, num único espaço.</p></div><span class="badge good">Cofre local</span></div>';
  main.insertBefore(page,document.getElementById('page-settings'));
 }
 function ensureNav(){
  const side=document.querySelector('nav.side');if(!side)return;
  FCCAreas.privateAreas.forEach(x=>side.querySelectorAll(`.nav[data-page="${x.id}"]`).forEach(n=>n.remove()));
  if(!side.querySelector('.nav[data-page="personal"]')){
   const button=document.createElement('button');button.className='nav';button.dataset.page='personal';button.type='button';button.innerHTML='<span class="ni" aria-hidden="true"></span><span>Pessoal</span>';side.querySelector('[data-page="clinical"]').after(button);
  }
 }
 ensureNav();FCCAreas.privateAreas.forEach(x=>FCCNavigation.setParent(x.id,'personal'));
 window.fccRefreshPersonalHub=()=>{if(FCCNavigation.current()==='personal')FCCAreas.render('personal');};
})();
