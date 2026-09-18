"""Compact only module-reading chrome. Preserve all clinical data and existing handlers."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def edit(name,old,new):
    p=root/name;s=p.read_text()
    if new in s:return
    assert s.count(old)==1,(name,'Source changed; reconcile before applying')
    p.write_text(s.replace(old,new,1))
edit('fcc-areas.js',"root.dataset.fccView='hub';root.dataset.fccArea=page;", "root.dataset.fccView='hub';root.dataset.fccArea=page;\n  delete root.dataset.fccCompact;delete root.dataset.fccModule;\n  const summary=root.querySelector(':scope > .fcc-usage-notice summary');if(summary)summary.textContent='Limites de utilização';")
edit('fcc-areas.js',"root.dataset.fccView='detail';root.dataset.fccArea=page;", "const entering=root.dataset.fccView!=='detail'||root.dataset.fccModule!==id;\n  root.dataset.fccView='detail';root.dataset.fccArea=page;root.dataset.fccCompact='1';root.dataset.fccModule=id;")
edit('fcc-areas.js',"const notice=root.querySelector(':scope > .fcc-usage-notice');if(notice)root.querySelector(':scope > .pagehead')?.after(notice);", "const head=root.querySelector(':scope > .pagehead');if(head)head.after(bar);\n  const notice=root.querySelector(':scope > .fcc-usage-notice');\n  if(notice){bar.after(notice);const details=notice.querySelector('details'),summary=notice.querySelector('summary');if(details&&entering)details.open=false;if(summary){summary.textContent='Limites';summary.setAttribute('aria-label','Limites de utilização clínica');}}\n  if(id==='clin-perf')compactPerf();")
edit('fcc-areas.js','<span class="fcc-area-current">${esc(title)}</span>', '<span class="fcc-area-current" role="heading" aria-level="2" tabindex="-1">${esc(title)}</span>')
# Move existing explanatory/source elements, without cloning, rewriting or losing listeners.
perf=''' function compactPerf(){
  const panel=document.getElementById('clin-perf'),toolbar=panel?.querySelector('.perf-toolbar');if(!toolbar)return;
  let info=document.getElementById('fccPerfInfo');
  if(!info){
   const row=document.createElement('div');row.className='fcc-perf-info-row';
   info=document.createElement('details');info.id='fccPerfInfo';info.className='fcc-module-info';
   const summary=document.createElement('summary');summary.textContent='Fontes e informação do módulo';info.append(summary);
   const content=document.createElement('div');content.className='fcc-module-info-content';info.append(content);
   row.append(info);toolbar.before(row);
   const count=document.getElementById('ccdCount');if(count)row.append(count);
   for(const selector of ['.perf-head p','.ccd-banner','.ccd-meta']){const node=panel.querySelector(selector);if(node)content.append(node);}
  }
  const label=panel.querySelector('#perfDoseToggle b');if(label)label.textContent='Calcular dose';
 }
'''
edit('fcc-areas.js',' function detail(page,id){',perf+' function detail(page,id){')
edit('fcc-navigation.js',"const heading=target.querySelector('.pagehead h2');", "const heading=target.querySelector(opts.sub?'.fcc-area-current':'.pagehead h2');")
# Search and catalogue count are useful in the list, not above every opened medicine.
edit('fcc-medications.js',' function render(){', ''' function reading(active){
  const host=document.getElementById('clin-drugs');if(!host)return;
  host.dataset.fccMedView=active?'detail':'list';
  const toolbar=host.querySelector('.fcc-med-toolbar'),count=document.getElementById('fccMedCount');
  if(toolbar)toolbar.hidden=active;if(count)count.hidden=active;
 }
 function render(){''')
edit('fcc-medications.js','if(current){detail(current);return;}','if(current){detail(current);return;}\n  reading(false);')
edit('fcc-medications.js',' function detail(record){',' function detail(record){\n  reading(true);')
css='''
/* Reading view: only entered modules become compact; library overviews stay unchanged. */
html[data-fcc-design] body .page[data-fcc-compact="1"]>.pagehead{display:none!important}
html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-area-context{margin:0 0 8px;min-height:44px;gap:12px;align-items:center}
html[data-fcc-design] body .page[data-fcc-compact="1"] .fcc-area-current{font-size:1rem;line-height:1.35;font-weight:650;color:var(--text);min-width:0}
html[data-fcc-design] body .page[data-fcc-compact="1"] .fcc-area-back{min-height:44px;padding:8px 12px}
html[data-fcc-design] body .page[data-fcc-compact="1"]:has(>.fcc-lock-area)>.fcc-area-context{padding-right:120px}
html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-usage-notice{position:relative;margin:0 0 12px;padding:10px 12px!important;min-height:50px}
html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-usage-notice>strong{padding-right:85px;font-size:13px;line-height:1.5;min-height:28px;display:flex;align-items:center}
html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-usage-notice summary{position:absolute;right:8px;top:3px;margin:0;padding:0 6px;min-height:44px;min-width:72px;justify-content:center}
html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-usage-notice details{border:0;padding:0;margin:0}
html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-usage-notice details>p{margin:8px 0 0}
html[data-fcc-design] body .page[data-fcc-compact="1"]>#clin-perf{margin-top:0}
html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-head{margin:0 0 8px;gap:12px;align-items:center}
html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-head h3{font-size:22px!important;margin:0!important;line-height:1.3!important}
html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-eyebrow{display:none}
html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-dose-toggle{width:auto;height:44px;min-width:112px;min-height:44px;display:flex;padding:8px 10px;border-radius:12px;box-shadow:none}
html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-dose-toggle b{font-size:13px!important;line-height:1.25!important}
html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-safety{font-size:13px!important;line-height:1.45!important;padding:8px 12px;margin-bottom:8px}
html[data-fcc-design] body .fcc-perf-info-row{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:4px 12px;margin:0 0 8px}
html[data-fcc-design] body .fcc-module-info{flex:1;min-width:230px;border:0;padding:0;margin:0}
html[data-fcc-design] body .fcc-module-info>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px!important;font-weight:600;color:var(--clinical);list-style:none}
html[data-fcc-design] body .fcc-module-info>summary::before{content:'+';width:12px;font-size:18px;flex-shrink:0}
html[data-fcc-design] body .fcc-module-info[open]>summary::before{content:'−'}
html[data-fcc-design] body .fcc-module-info>summary::-webkit-details-marker{display:none}
html[data-fcc-design] body .fcc-module-info-content{padding-bottom:8px}
html[data-fcc-design] body .fcc-module-info-content>p{font-size:14px!important;color:var(--muted)!important;margin:0 0 8px;line-height:1.5}
html[data-fcc-design] body .fcc-module-info-content .ccd-meta{margin:8px 0 0}
html[data-fcc-design] body .fcc-perf-info-row>#ccdCount{align-self:flex-start;margin:8px 0 0;white-space:nowrap}
html[data-fcc-design] body #clin-drugs[data-fcc-med-view=detail] .fcc-med-toolbar,html[data-fcc-design] body #clin-drugs[data-fcc-med-view=detail] #fccMedCount{display:none!important}
html[data-fcc-design] body #clin-drugs[data-fcc-med-view=detail] .fcc-detail-heading{margin-top:0;gap:10px}
html[data-fcc-design] body:has(.page.active[data-fcc-compact="1"]) .top{margin-bottom:12px!important;padding-bottom:8px!important}
@media(max-width:760px){
 html[data-fcc-design] body .page[data-fcc-compact="1"]>.fcc-area-context{gap:8px;flex-wrap:nowrap}
 html[data-fcc-design] body .page[data-fcc-compact="1"] .fcc-area-current{font-size:.9375rem;overflow-wrap:anywhere}
 html[data-fcc-design] body .page[data-fcc-compact="1"] .fcc-area-back{font-size:13px!important;padding:8px;gap:6px}
 html[data-fcc-design] body .page[data-fcc-compact="1"]:has(>.fcc-lock-area)>.fcc-area-context{padding-right:52px}
 html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-head h3{font-size:20px!important}
 html[data-fcc-design] body .page[data-fcc-compact="1"] .perf-dose-toggle{min-width:100px}
 html[data-fcc-design] body .fcc-perf-info-row{column-gap:8px}
 html[data-fcc-design] body .fcc-module-info{min-width:180px}
 html[data-fcc-design] body .fcc-perf-info-row>#ccdCount{font-size:11px!important;padding:6px 8px!important}
 html[data-fcc-design] body .fcc-module-info>summary{font-size:12px!important}
}
'''
p=root/'fcc-design.css';s=p.read_text()
if css not in s:p.write_text(s+css)
p=root/'build-info.json';data=json.loads(p.read_text());data['interfaceRevision']='5 — topo compacto nos módulos e fichas';p.write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('Compact reading layout applied; clinical data, guards, routes and input values preserved.')
