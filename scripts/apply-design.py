"""Idempotent final presentation corrections; no browser or personal data."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
assert all((root/n).exists() for n in ['fcc-areas.js','fcc-design.css','fcc-appearance.js'])
style='''/* Final reference review: keep filters on one line and use uniform navigation icons. */
@media(max-width:920px){
 html[data-fcc-design] body .fcc-area-filters{flex-wrap:nowrap;max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin;gap:7px;padding-bottom:2px}
 html[data-fcc-design] body .fcc-area-filters>button{flex:0 0 auto;padding:9px 12px;font-size:12px}
 html[data-fcc-design] body nav.side .ni{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0;color:inherit!important}
}
'''
p=root/'fcc-design.css';s=p.read_text()
if '/* Final reference review:' not in s:p.write_text(s+'\n'+style)
p=root/'tests/audit-library.py';s=p.read_text()
old="p.locator('[data-favorite-open]').click();p.wait_for_function(\"FCCNavigation.route().sub==='clin-drugs'\")"
new=old+";p.locator('#clin-drugs').wait_for(state='visible')"
if new not in s:
 assert s.count(old)==1,'Favorite navigation test changed; reconcile first'
 p.write_text(s.replace(old,new,1))
print('Applied visual polish and explicit lazy-loading wait in favorite test.')
