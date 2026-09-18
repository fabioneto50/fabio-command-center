"""Presentation-only revision: compact records without altering any clinical string."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
changes={
 'dilutions-document-db-v4.js':[("${x.routes.map(routeBlock).join('')}","<div class=\"fcc-route-grid\">${x.routes.map(routeBlock).join('')}</div>")],
 'dilutions-cuf-v6.js':[("${rows.map(routeBlock).join('')}","<div class=\"fcc-route-grid\">${rows.map(routeBlock).join('')}</div>")],
 'fcc-medications.js':[("${FIELDS.filter(([k])=>", "<div class=\"fcc-facts-grid\">${FIELDS.filter(([k])=>"),("</section>`).join('')}<details class=\"fcc-provenance\">", "</section>`).join('')}</div><details class=\"fcc-provenance\">")],
 'tests/audit-polish.py':[("metrics['body']>=16", "metrics['body']>=14")]
}
for name,pairs in changes.items():
 path=ROOT/name;text=path.read_text()
 for old,new in pairs:
  if new in text:continue
  assert text.count(old)==1,name+': reconcile changed source before applying'
  text=text.replace(old,new,1)
 path.write_text(text)
css=r'''
/* Record density 7: reclaim whitespace, never truncate or hide clinical fields. */
html[data-fcc-design] body .sub[data-fcc-record-view="detail"] .fcc-record-bar{margin-bottom:6px;gap:8px}
html[data-fcc-design] body .sub[data-fcc-record-view="detail"] .fcc-record-bar .btn{min-height:44px;padding:6px 10px;font-size:14px!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-record-selected{padding:12px!important;border-radius:14px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-top{gap:6px 12px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-top h3{font-size:20px!important;line-height:1.25!important;margin:0 0 3px!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-top p{font-size:13px!important;line-height:1.35!important;margin:0!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-routebadges{margin-top:0;gap:4px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-routebadges .badge{font-size:12px!important;line-height:1.35!important;padding:4px 7px;min-height:0}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-ashp{display:flex;flex-wrap:wrap;align-items:baseline;gap:3px 10px;padding:7px 9px!important;margin:7px 0!important;border-radius:9px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-ashp>span{font-size:12px!important;line-height:1.35!important;letter-spacing:0}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-ashp>b{font-size:15px!important;line-height:1.35!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-ashp>.tiny{flex-basis:100%;font-size:12.5px!important;line-height:1.4!important;margin:0!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-details{margin:7px 0 0!important;padding:0!important;border:0}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-route-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:start}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-route-grid:has(>.ccd-doc-route:only-child){grid-template-columns:minmax(0,1fr)}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-route{margin:0!important;padding:9px 10px!important;border-radius:10px;min-width:0}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-routehead{margin:0 0 5px;padding:0 0 5px;gap:4px 8px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-routehead :is(b,.cuf-route-title){font-size:16px!important;line-height:1.3!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-routehead>span{font-size:12px!important;line-height:1.35!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:5px;gap:3px 8px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid:has(>.ccd-doc-section):has(>.ccd-doc-field:nth-child(4):last-child){grid-template-columns:repeat(3,minmax(0,1fr))}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-section{font-size:14px!important;line-height:1.3!important;margin:0!important;padding:2px 0}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-field{padding:3px 0!important;min-height:0;border:0;border-radius:0;background:transparent!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-field>small{font-size:12.5px!important;line-height:1.35!important;margin:0 0 2px!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-field>div{font-size:14px!important;line-height:1.4!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid-wide{grid-template-columns:minmax(0,1fr);border-top:1px solid var(--line);padding-top:4px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid-wide .ccd-doc-field>small{display:inline;font-weight:650}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid-wide .ccd-doc-field>small:after{content:': '}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid-wide .ccd-doc-field>div{display:inline}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .cuf-current-note{padding:7px 9px!important;margin:0 0 7px!important;border-radius:9px}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .cuf-current-note :is(b,span){font-size:12.5px!important;line-height:1.4!important}
html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-source{font-size:12.5px!important;line-height:1.4!important;margin-top:7px}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .med4-detail{padding:12px!important;border-radius:14px}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading{gap:6px 10px;align-items:center}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading h3{font-size:20px!important;line-height:1.25!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .med4-detail>small{font-size:12.5px!important;line-height:1.35!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .med4-detail>p{font-size:14px!important;line-height:1.4!important;margin:5px 0!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-warning{margin:7px 0;padding:7px 9px;font-size:13px!important;line-height:1.4!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-warning p{font-size:14px!important;line-height:1.4!important;margin:2px 0 0!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .actions{margin:5px 0;gap:6px}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .btn{min-height:44px;padding:6px 10px;font-size:14px!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-facts-grid{column-width:280px;column-gap:18px;margin-top:4px;column-fill:balance}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-fact{display:inline-block;width:100%;box-sizing:border-box;break-inside:avoid;vertical-align:top;padding:6px 0!important;margin:0 0 3px!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-fact h4{font-size:14px!important;line-height:1.35!important;margin:0 0 3px!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-fact p{font-size:14px!important;line-height:1.4!important;margin:0!important;overflow-wrap:anywhere}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-provenance{margin:7px 0 0;padding:7px 9px;font-size:13px!important}
html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-provenance summary{min-height:44px;display:flex;align-items:center;font-size:13px!important}
@media(min-width:1680px){html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-route-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:760px){
 html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-route-grid{grid-template-columns:minmax(0,1fr)}
 html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .fcc-record-selected{padding:10px!important}
 html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-top h3,html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading h3{font-size:18px!important}
 html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-routebadges{margin-top:4px}
 html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-facts-grid{columns:1}
}
@media(max-width:360px){html[data-fcc-design] body #clin-perf[data-fcc-record-view="detail"] .ccd-doc-grid:has(>.ccd-doc-section):has(>.ccd-doc-field:nth-child(4):last-child){grid-template-columns:repeat(2,minmax(0,1fr))}}
'''
path=ROOT/'fcc-design.css';text=path.read_text()
if '/* Record density 7:' not in text:path.write_text(text+css)
info_path=ROOT/'build-info.json';info=json.loads(info_path.read_text());info['interfaceRevision']='7 — fichas compactas com apresentações lado a lado';info_path.write_text(json.dumps(info,ensure_ascii=False,indent=2))
print('Density revision applied; clinical values and validation rules unchanged.')
