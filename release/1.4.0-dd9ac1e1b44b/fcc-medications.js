/* Canonical catalogue UI. The 923 source records are preserved unchanged; only rendering is new. */
(()=>{
 'use strict';const C=FCCCore,U=FCCUI,esc=C.escapeHTML;
 const PAGE_SIZE=36;let records=[],page=0,query='',group='',current=null,brands={},timer;
 const FIELDS=[['use','Utilização clínica'],['pd','Classe e farmacodinâmica'],['pk','Farmacocinética'],['mon','Monitorização'],['risk','Riscos e precauções'],['nursing','Cuidados de enfermagem'],['renal','Função renal'],['hepatic','Função hepática'],['inter','Interações'],['antidote','Antídoto / reversão'],['routeVariant','Via / variante'],['baseAssociation','Associação / princípio ativo'],['preg','Gravidez e aleitamento'],['ger','Pessoa idosa'],['peds','Pediatria'],['obesity','Obesidade'],['hd','Diálise'],['ecmo','ECMO'],['albumin','Albumina'],['qt','Intervalo QT'],['neuro','Neurologia'],['food','Alimentos'],['crush','Trituração'],['tube','Administração por sonda'],['photo','Fotoproteção'],['filter','Filtro'],['access','Acesso'],['speed','Velocidade de administração'],['ph','pH'],['extr','Extravasamento'],['storage','Conservação'],['high','Alto risco'],['lasa','Nomes / apresentações confundíveis'],['tdm','Monitorização terapêutica'],['narrow','Margem terapêutica'],['onset','Início de ação'],['event','Eventos adversos'],['eLactancia','e-Lactancia / LactMed'],['correctionNotes','Notas de correção recebidas']];
 const url=value=>{try{const u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch(e){return '';}};
 const id=r=>'m-'+C.fold(r.n).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 function sourceLinks(record){
  const values=[record.sourceRegulatory,record.sourceClinical,record.src,...Object.values(record.auditCorrections||{}).map(x=>x.source)].flat().filter(Boolean),links=[];
  for(const value of values){for(const match of String(value).matchAll(/https?:\/\/[^\s<>"']+/g)){const link=url(match[0]);if(link&&!links.includes(link))links.push(link);}}
  return links.map((link,i)=>`<a target="_blank" rel="noopener noreferrer" href="${esc(link)}">${esc(new URL(link).hostname)} · referência ${i+1} ↗</a>`).join('')||'<p>Sem ligação específica nas fontes recebidas para esta ficha.</p>';
 }
 function shownRows(){const q=C.fold(query);return records.filter(r=>(!group||r.g===group)&&(!q||C.fold([r.n,r.g,r.q,r.use,r.routeVariant,...(brands[C.fold(r.n)]||[])].join(' ')).includes(q)));}
 function syncRoute(){FCCNavigation.replaceFilters({q:query,g:group,p:page});}
 function restoreRoute(route,{focus=false}={}){
  clearTimeout(timer);const f=route.filters||{};query=String(f.q||'');group=records.some(r=>r.g===f.g)?f.g:'';page=Number(f.p)||0;current=null;
  document.getElementById('med4Search').value=query;document.getElementById('fccMedGroup').value=group;
  render();if(route.ref)show(route.ref,{route:false,focus});
 }
 function reading(active){
  const host=document.getElementById('clin-drugs');if(!host)return;
  host.dataset.fccMedView=active?'detail':'list';host.dataset.fccRecordView=active?'detail':'list';
  const toolbar=host.querySelector('.fcc-med-toolbar'),count=document.getElementById('fccMedCount');
  if(toolbar)toolbar.hidden=active;if(count)count.hidden=active;
 }
 function render(){
  const root=document.getElementById('med4Results');if(!root)return;
  if(current){detail(current);return;}
  reading(false);
  const rows=shownRows(),pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));page=Math.max(0,Math.min(page,pages-1));
  document.getElementById('fccMedCount').textContent=`${rows.length} fichas · página ${page+1} de ${pages}`;
  root.innerHTML=rows.length?`<div class="fcc-med-grid">${rows.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).map(r=>`<button type="button" class="fcc-med-card med4-mini" data-med4="${esc(r.n)}"><strong>${esc(r.n)}</strong><small>${esc(r.g||'Sem grupo indicado')}</small><span class="fcc-med-summary">${esc(r.q||r.use||'Abrir ficha')}</span></button>`).join('')}</div><div class="fcc-pagination"><button class="btn" id="fccMedPrev" ${page===0?'disabled':''}>Anterior</button><span>${page+1} / ${pages}</span><button class="btn" id="fccMedNext" ${page===pages-1?'disabled':''}>Seguinte</button></div>`:'<div class="fcc-empty">Sem resultados. Experimenta o princípio ativo ou altera o grupo.</div>';
  root.querySelectorAll('[data-med4]').forEach(b=>b.onclick=()=>show(b.dataset.med4));
  const prev=root.querySelector('#fccMedPrev'),next=root.querySelector('#fccMedNext');if(prev)prev.onclick=()=>{page--;render();syncRoute();root.scrollIntoView({block:'start'});};if(next)next.onclick=()=>{page++;render();syncRoute();root.scrollIntoView({block:'start'});};
 }
 function detail(record){
  reading(true);
  const root=document.getElementById('med4Results');document.getElementById('fccMedCount').textContent=record.n;
  const mandatory=new Set(['use','pd','mon','risk','renal','hepatic','inter','nursing']);
  root.innerHTML=`<article class="med5-detail-row" data-name="${esc(record.n)}"><div class="fcc-record-bar"><button type="button" class="btn" id="fccMedBack">← Voltar aos resultados</button></div><div class="med4-detail"><div class="fcc-detail-heading"><h3 tabindex="-1">${esc(record.n)}</h3><button class="btn" id="fccMedFavorite" aria-label="Adicionar ${esc(record.n)} aos favoritos">Favorito</button></div><small>${esc(record.g||'')}</small>${brands[C.fold(record.n)]?.length?`<p>Nomes comerciais na base recebida: ${esc(brands[C.fold(record.n)].join(', '))}</p>`:''}<p>${esc(record.q||record.use||'Sem resumo nas fontes recebidas.')}</p>${record.risk?`<div class="fcc-detail-warning"><strong>Precauções</strong><p>${esc(record.risk)}</p></div>`:''}<div class="actions"><button class="btn" id="fccMedDilutions">Ver diluições</button><button class="btn" id="fccMedCompat">Ver compatibilidades</button></div><div class="fcc-facts-grid">${FIELDS.filter(([k])=>record[k]||mandatory.has(k)).map(([k,label])=>`<section class="fcc-fact" data-clinical-field="${esc(k)}"><h4>${esc(label)}</h4><p>${esc(record[k]||'Sem informação nas fontes utilizadas.')}</p></section>`).join('')}</div><details class="fcc-provenance"><summary>Referências utilizadas e proveniência</summary><p>Catálogo preservado com correções pontuais de 23/09/2026. Não constitui revisão clínica integral das 923 fichas.</p><p>${esc(record.reviewScope||"Revisão integral pendente.")}</p>${Object.entries(record.auditCorrections||{}).map(([field,x])=>`<p><b>Campo corrigido: ${esc(FIELDS.find(f=>f[0]===field)?.[1]||field)}</b> · ${esc(x.finding)} · secções ${esc(x.section)} · ${esc(x.date)}.</p>`).join('')}<p>Revisão humana indicada na fonte: ${esc(record.humanReview||'não documentada')}. ${record.s?esc(record.s):''}</p><p>As referências abaixo foram recebidas com esta ficha. Não existe, na base original, uma ligação verificável de cada afirmação à página ou secção da fonte; não é atribuída uma validação que não foi realizada.</p><div class="fcc-reference-list">${sourceLinks(record)}</div><p>Confirmar formulação, via e protocolo aplicável. Informação não disponível não significa ausência de risco.</p></details></div></article>`;
  root.querySelector('#fccMedBack').onclick=()=>{const y=FCCNavigation.replaceDetail(''),name=current?.n;current=null;render();const card=[...root.querySelectorAll('[data-med4]')].find(x=>x.dataset.med4===name);(card||document.getElementById('med4Search')).focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});};
  root.querySelector('#fccMedFavorite').onclick=()=>window.FCCFavorites?.toggle({page:'clinical',sub:'clin-drugs',ref:id(record),title:record.n});
  root.querySelector('#fccMedDilutions').onclick=async()=>{await FCCNavigation.navigate('clinical',{sub:'clin-perf'});const q=document.getElementById('perfDilutionSearch');if(q){q.value=record.n;q.dispatchEvent(new Event('input',{bubbles:true}));}};
  root.querySelector('#fccMedCompat').onclick=async()=>{await FCCNavigation.navigate('clinical',{sub:'clin-ivcompat'});const select=document.getElementById('ivcDrugA'),option=[...(select?.options||[])].find(x=>C.fold(x.value)===C.fold(record.n));if(option){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));}else U.notify('Seleciona a apresentação correspondente no módulo de compatibilidades.');};
 }
 function show(name,{route=true,focus=true}={}){
  const record=records.find(r=>r.n===name||id(r)===name||C.fold(r.n)===C.fold(name));if(!record){U.notify('Ficha não encontrada.','error');return false;}
  clearTimeout(timer);if(route){syncRoute();FCCNavigation.replaceDetail(id(record),false);}current=record;detail(record);if(focus){window.scrollTo({top:0,behavior:'instant'});document.querySelector('#med4Results h3')?.focus({preventScroll:true});}
  window.FCCFavorites?.recent({page:'clinical',sub:'clin-drugs',ref:id(record),title:record.n});return true;
 }
 function install(){
  const host=document.getElementById('clin-drugs');host.innerHTML=`<div class="card full"><div class="fcc-med-toolbar"><label>Pesquisar medicamento<input id="med4Search" type="search" placeholder="Princípio ativo, grupo ou indicação" autocomplete="off"></label><label>Grupo<select id="fccMedGroup"><option value="">Todos os grupos</option>${[...new Set(records.map(r=>r.g).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt')).map(g=>`<option>${esc(g)}</option>`).join('')}</select></label></div><p id="fccMedCount" role="status" aria-live="polite"></p><div id="med4Results"></div><div id="drugGrid" hidden></div><input id="drugSearch" hidden></div>`;
  host.querySelector('#med4Search').oninput=e=>{query=e.target.value.slice(0,180);page=0;current=null;clearTimeout(timer);timer=setTimeout(()=>{render();syncRoute();},120);};
  host.querySelector('#fccMedGroup').onchange=e=>{clearTimeout(timer);group=e.target.value;page=0;current=null;render();syncRoute();};render();
  host.dataset.medicationCatalogCount=records.length;
 }
 window.FCCMedicationReady=(async()=>{
  [records,brands]=await Promise.all([FCCModules.json('data/medications.json'),FCCModules.json('data/brand-names.json')]);
  if(records.length!==923||new Set(records.map(x=>x.n)).size!==923)throw new Error('O catálogo não corresponde aos 923 registos preservados.');
  window.FCCMedicationCatalogV7={records,count:records.length,add:item=>{C.validateData(item);if(!item?.n)throw new Error('Ficha sem nome.');const n=records.findIndex(x=>C.fold(x.n)===C.fold(item.n));if(n>=0)records[n]=item;else records.push(item);window.FCCMedicationCatalogV7.count=records.length;render();return item;}};
  window.FCCMedicationV7Health={ok:true,count:records.length,version:'1.4.0-canonical',clinicalReview:'not-performed'};
  window.FCCMedications=Object.freeze({show,render,restoreRoute,id,get:()=>records});
  install();return true;
 })();
})();
