"""Apply the requested dedicated-record UI changes. No clinical, vault or formula edits."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
replacements={'fcc-medications.js': [["host.dataset.fccMedView=active?'detail':'list';", "host.dataset.fccMedView=active?'detail':'list';host.dataset.fccRecordView=active?'detail':'list';"], ['<div class="med4-detail"><div class="fcc-detail-heading"><h3 tabindex="-1">${esc(record.n)}</h3><button class="btn" id="fccMedBack">Voltar aos resultados</button>', '<div class="fcc-record-bar"><button type="button" class="btn" id="fccMedBack">← Voltar aos resultados</button></div><div class="med4-detail"><div class="fcc-detail-heading"><h3 tabindex="-1">${esc(record.n)}</h3>'], ['clearTimeout(timer);if(route)syncRoute();current=record;detail(record);if(route)FCCNavigation.replaceDetail(id(record),false);', 'clearTimeout(timer);if(route){syncRoute();FCCNavigation.replaceDetail(id(record),false);}current=record;detail(record);'], ["()=>{current=null;render();FCCNavigation.replaceDetail('');document.getElementById('med4Search').focus();};", "()=>{const y=FCCNavigation.replaceDetail(''),name=current?.n;current=null;render();const card=[...root.querySelectorAll('[data-med4]')].find(x=>x.dataset.med4===name);(card||document.getElementById('med4Search')).focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});};"]], 'fcc-navigation.js': [['function cleanRoute(value){', "function dilutionFilters(input={}){return {q:String(input.q||'').slice(0,180),g:String(input.g||'').slice(0,160),v:input.v==='1'?'1':''};}\n function cleanRoute(value){"], ['  return route;\n }\n function hash', "  if(page==='clinical'&&sub==='clin-perf')route.filters=dilutionFilters(Object.fromEntries(new URLSearchParams(search)));\n  return route;\n }\n function hash"], ['  return value;\n }\n function write', "  if(route.page==='clinical'&&route.sub==='clin-perf'){const f=dilutionFilters(route.filters),p=new URLSearchParams();if(f.q)p.set('q',f.q);if(f.g)p.set('g',f.g);if(f.v)p.set('v',f.v);if(p.size)value+='?'+p.toString();}\n  return value;\n }\n function write"], ['positions.set(hash(currentRoute),window.scrollY);closeTransient();', 'positions.set(hash(currentRoute),window.scrollY);closeTransient();window.FCCDilutionView?.leave();'], ['  if(!opts.history)write(currentRoute,!!opts.replace);', "  if(page==='clinical'&&opts.sub==='clin-perf')currentRoute.filters=dilutionFilters(opts.filters);\n  if(!opts.history)write(currentRoute,!!opts.replace);"], ["   else if(opts.ref&&opts.sub==='clin-cases')FCCCases.open(opts.ref,{route:false});", "   else if(opts.sub==='clin-perf')await FCCDilutionView.restoreRoute(currentRoute,{focus:!opts.history});\n   else if(opts.ref&&opts.sub==='clin-cases')FCCCases.open(opts.ref,{route:false});\n   if(my!==serial)return false;"], ["const heading=target.querySelector(opts.sub?'.fcc-area-current':'.pagehead h2');", "const heading=target.querySelector(currentRoute.ref?'#med4Results h3,.fcc-record-selected h3':opts.sub?'.fcc-area-current':'.pagehead h2');"], ["function replaceFilters(filters){if(currentRoute.page!=='clinical'||currentRoute.sub!=='clin-drugs')return;currentRoute={...currentRoute,ref:'',filters:medicationFilters(filters)};write(currentRoute,true);}", "function replaceFilters(filters){if(currentRoute.page!=='clinical'||!['clin-drugs','clin-perf'].includes(currentRoute.sub))return;currentRoute={...currentRoute,ref:'',filters:currentRoute.sub==='clin-drugs'?medicationFilters(filters):dilutionFilters(filters)};write(currentRoute,true);}"], ["function replaceDetail(ref='',replace=true){if(isPrivate(currentRoute.page))ref='';currentRoute={...currentRoute,ref};write(currentRoute,replace);}", "function replaceDetail(ref='',replace=true){positions.set(hash(currentRoute),window.scrollY);if(isPrivate(currentRoute.page))ref='';currentRoute={...currentRoute,ref};write(currentRoute,replace);return positions.get(hash(currentRoute))||0;}"]]}
for name,pairs in replacements.items():
    path=root/name;text=path.read_text()
    for old,new in pairs:
        if new in text:continue
        assert text.count(old)==1,name+': source changed; reconcile before applying'
        text=text.replace(old,new,1)
    path.write_text(text)
css='''
/* Individual medication reading: only the record and its return control occupy the content column. */
html[data-fcc-design] body:has(#page-clinical.active>.sub.active[data-fcc-record-view="detail"]) .top{display:none!important}
@media(min-width:921px){html[data-fcc-design] body:has(#page-clinical.active>.sub.active[data-fcc-record-view="detail"]) nav.side{top:16px}}
html[data-fcc-design] body #page-clinical.active:has(>.sub.active[data-fcc-record-view="detail"])>:is(.pagehead,.fcc-area-context,.fcc-usage-notice){display:none!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"]>:not(#perfDilutionGrid):not(#fccDilutionBackBar){display:none!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] #perfDilutionGrid{grid-template-columns:minmax(0,1fr);margin:0;gap:0}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] #perfDilutionGrid>:not(.fcc-record-selected){display:none!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-record-selected>.ccd-doc-top{cursor:default;background:none!important;border:0;margin:0;padding:0!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-record-selected>.ccd-doc-top h3{font-size:clamp(22px,3vw,28px)!important;line-height:1.3!important;overflow-wrap:anywhere}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-record-selected>.ccd-doc-details{margin-top:12px}
html[data-fcc-design] body .fcc-record-bar{display:flex;align-items:center;gap:12px;margin:0 0 12px}
html[data-fcc-design] body .fcc-record-bar[hidden]{display:none!important}
html[data-fcc-design] body .fcc-record-bar .btn{min-height:44px;padding:8px 12px}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"]>.card{padding:0!important;border:0;background:transparent!important;box-shadow:none}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .med4-detail{padding:20px;border:1px solid var(--line);border-radius:18px;background:var(--panel)!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading{align-items:flex-start}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading h3{margin:0;font-size:clamp(22px,3vw,28px)!important;line-height:1.3!important;overflow-wrap:anywhere}
@media(max-width:760px){
 html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .med4-detail{padding:16px}
 html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-record-selected{padding:16px!important}
 html[data-fcc-design] body .fcc-record-bar{margin-bottom:10px}
}
'''
path=root/'fcc-design.css';text=path.read_text()
if css not in text:path.write_text(text+css)
info=root/'build-info.json';value=json.loads(info.read_text());value['interfaceRevision']='6 — ficha individual sem cabeçalhos do catálogo';info.write_text(json.dumps(value,ensure_ascii=False,indent=2))
print('Dedicated-record UI prepared; clinical data and vault untouched.')
