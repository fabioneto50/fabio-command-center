"""Idempotent source migration for explicit area landing pages; no browser or user data."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def change(name,old,new):
 p=root/name;s=p.read_text()
 if new in s:return
 assert s.count(old)==1,(name,'source changed; reconcile first')
 p.write_text(s.replace(old,new,1))
change('navigation-hub.js',"'personal-security-v1.js','fcc-navigation.js'","'personal-security-v1.js','fcc-areas.js','fcc-navigation.js'")
change('navigation-hub.js',"'fcc-favorites.js','fcc-offline.js'","'fcc-favorites.js','fcc-offline.js','fcc-appearance.js'")
change('fcc-navigation.js',"if(!target)return false;\n  document.querySelectorAll('.page.active')","if(!target)return false;\n  if(!opts.sub)FCCAreas.reset(page);\n  document.querySelectorAll('.page.active')")
change('fcc-navigation.js',"else if(page==='clinical'){target.querySelectorAll(':scope > .sub').forEach(x=>x.classList.remove('active'));await openMenu('clinical',{navigateFirst:false});}","else FCCAreas.show(page);")
change('fcc-navigation.js',"if(!U.active())window.scrollTo({top:restore,behavior:'auto'});","if(!U.active()){window.scrollTo({top:restore,behavior:'auto'});if(opts.focus){const heading=target.querySelector('.pagehead h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}}")
change('fcc-navigation.js',"root.querySelector(':scope > .fcc-module-state')?.remove();","root.querySelector(':scope > .fcc-module-state')?.remove();\n  FCCAreas.detail(page,id);")
change('fcc-navigation.js',"if(p==='clinical')openMenu(p);else navigate(p);","navigate(p,{focus:true});")
change('index.html','<html lang="pt-PT">','<html lang="pt-PT" data-fcc-design="2">')
if 'fcc-design.css' not in (root/'index.html').read_text():
 change('index.html','<meta name="referrer" content="no-referrer">','<link rel="stylesheet" href="fcc-design.css">\n<meta name="referrer" content="no-referrer">')
p=root/'scripts/build-assets.cjs';s=p.read_text()
if "'fcc-ui.css','fcc-design.css'" not in s:
 assert s.count("'styles.css','fcc-ui.css'")==2
 p.write_text(s.replace("'styles.css','fcc-ui.css'","'styles.css','fcc-ui.css','fcc-design.css'"))
# The category chooser remains available explicitly, but bottom navigation opens the landing.
change('tests/audit-browser.py',"page.locator('.nav[data-page=\"clinical\"]').click();page.locator('#fccCategoryDialog').wait_for(state='visible');", "page.locator('.nav[data-page=\"clinical\"]').click();page.wait_for_function(\"FCCNavigation.route().page==='clinical'&&!FCCNavigation.route().sub\");check(prefix+' clinical landing has no auto panel',page.locator('#page-clinical > .sub.active').count()==0 and not page.evaluate('!!FCCUI.active()'));page.evaluate(\"document.querySelector('.nav[data-page=clinical]').focus();openCategoryMenu('clinical')\");page.locator('#fccCategoryDialog').wait_for(state='visible');")
info=root/'build-info.json';data=json.loads(info.read_text());data['interfaceRevision']='2 — áreas sem seleção automática';info.write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('Area navigation and visual system source migration applied.')
