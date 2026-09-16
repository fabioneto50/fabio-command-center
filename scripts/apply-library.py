"""Apply readable UI integration changes to this website only. No browser/user data."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def change(name,old,new):
 p=root/name;s=p.read_text()
 if new in s:return
 assert s.count(old)==1,(name,'source changed; reconcile first')
 p.write_text(s.replace(old,new,1))
change('fcc-favorites.js','data.recent.filter(x=>key(x)===key(item))','data.recent.filter(x=>key(x)!==key(item))')
change('fcc-navigation.js',"settings:'Definições'}","settings:'Definições',favorites:'Favoritos'}")
change('fcc-navigation.js',"if(page==='home')window.FCCFavorites?.renderHome?.();","if(page==='home')window.FCCFavorites?.renderHome?.();\n   if(page==='favorites')FCCFavorites.renderPage();")
change('navigation-hub.js',"if(page==='settings')return 'shell';","if(page==='settings'||page==='favorites')return 'shell';")
change('fcc-appearance.js',"clinical:['Clínica','Ferramentas e referências para a prática clínica.']","clinical:['Biblioteca clínica','Módulos, calculadoras e consulta rápida.']")
change('fcc-appearance.js',"personal:['Pessoal'","personal:['Área pessoal'")
change('fcc-appearance.js'," side.querySelectorAll('.nav[data-page]')"," if(!side.querySelector('[data-page=favorites]')){const b=document.createElement('button');b.className='nav';b.dataset.page='favorites';side.querySelector('[data-page=settings]').before(b);}\n side.querySelectorAll('.nav[data-page]')")
change('fcc-design.css','--bg:#f3f6fa;--bg-soft:#edf2f7;--panel:#ffffff;--panel-2:#f7f9fc;--panel-3:#edf2f7;','--bg:#f4f7f3;--bg-soft:#edf3ed;--panel:#fcfdfb;--panel-2:#eff4ef;--panel-3:#e8efea;')
change('fcc-design.css','--text:#192c42;--muted:#52667d;--line:#dce4ed;--line-strong:#9baec1;','--text:#1c2b33;--muted:#596d75;--line:#dce5df;--line-strong:#91a69b;')
change('fcc-design.css','--clinical:#0b6471;--clinical-soft:#e1f2f3;','--clinical:#2f716e;--clinical-soft:#e1efeb;--fcc-solid-accent:#2f716e;')
style=root/'fcc-design.css';marker='/* Reference library layout:'
current=style.read_text()
if marker not in current:style.write_text(current+'\n'+(root/'scripts/library-style.css').read_text())
change('tests/audit-design.py','four consistent SVG navigation icons','five consistent SVG navigation icons')
change('tests/audit-design.py',".ni svg').count()==4",".ni svg').count()==5")
change('tests/audit-live.py',"check(prefix+' global search visible',page.locator('#globalSearch').is_visible())", """check(prefix+' global search visible',page.locator('#globalSearch').is_visible())
                    check(prefix+' five SVG site navigation items',page.locator('nav.side .nav .ni svg').count()==5)
                    page.locator('nav.side [data-page=clinical]').click();page.wait_for_selector('#fccArea-clinical')
                    check(prefix+' live library overview without subgroup',page.locator('#page-clinical > .sub.active').count()==0 and not page.evaluate('!!FCCUI.active()'))
                    check(prefix+' live 24 horizontal module choices',page.locator('#fccArea-clinical .fcc-area-card').count()==24 and page.locator('#fccArea-clinical .fcc-library-star').count()==24)
                    page.locator('[data-area-filter=calculators]').click();check(prefix+' live calculator filter',page.locator('#fccArea-clinical .fcc-area-card').count()==9)
                    page.locator('[data-area-filter=all]').click();page.screenshot(path=str(OUT/(prefix+'-live-library.png')))
                    page.locator('nav.side [data-page=favorites]').click();page.wait_for_selector('#page-favorites.page.active')
                    check(prefix+' live favorites destination exists',page.locator('#page-favorites .fcc-empty').is_visible())
                    page.locator('nav.side [data-page=home]').click()
""")
info=root/'build-info.json';data=json.loads(info.read_text());data['interfaceRevision']='3 — biblioteca em lista, filtros e favoritos';info.write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('Reference library integration applied; website-only sources.')
