"""Refine density after reviewing actual browser screenshots; no clinical text changes."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def patch(name,old,new):
 p=ROOT/name;text=p.read_text()
 if new in text:return
 assert text.count(old)==1,name+': reconcile changed source'
 p.write_text(text.replace(old,new,1))
patch('fcc-design.css','.ccd-doc-top h3{font-size:20px!important;line-height:1.25!important;margin:0 0 3px!important}', '.fcc-record-selected>.ccd-doc-top h3{font-size:20px!important;line-height:1.25!important;margin:0 0 3px!important}')
patch('fcc-design.css','.ccd-doc-top h3,html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading h3{font-size:18px!important}', '.fcc-record-selected>.ccd-doc-top h3,html[data-fcc-design] body #clin-drugs[data-fcc-record-view="detail"] .fcc-detail-heading h3{font-size:18px!important}')
patch('fcc-design.css','.fcc-provenance summary{min-height:44px;display:flex;align-items:center;font-size:13px!important}', '.fcc-provenance summary{min-height:44px;display:list-item;padding:11px 0;box-sizing:border-box;font-size:13px!important}')
# A late return animation must not steal focus after a new search has started.
patch('dilutions-card-ux-v5.js','requestAnimationFrame(()=>{if(!current()||selected)return;top?.focus', 'const ticket=generation;requestAnimationFrame(()=>{if(ticket!==generation||!current()||selected)return;top?.focus')
print('Compact title precedence, native disclosure and return-focus race refined.')
