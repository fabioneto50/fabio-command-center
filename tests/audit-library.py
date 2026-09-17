"""Reference-list navigation audit for GitHub Pages, not the Replit application.
Fresh synthetic browser contexts only; public favorites never contain private records.
"""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4184),functools.partial(Handler,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:4184/'
report={'commit':os.environ.get('GITHUB_SHA','local'),'method':'GitHub Pages source; synthetic contexts; list, chips, favorites, privacy and explicit navigation','checks':[]}
def check(name,value,detail=None):
 report['checks'].append({'name':name,'pass':bool(value),'detail':detail})
 if not value:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('.nav')].every(x=>!x.disabled)",timeout=60000)
def landing(p):
 p.locator('nav.side [data-page=clinical]').click();p.wait_for_selector('#fccArea-clinical');p.wait_for_function("FCCNavigation.current()==='clinical'&&!FCCNavigation.route().sub")
try:
 with sync_playwright() as pw:
  for name in ['chromium','webkit']:
   browser=getattr(pw,name).launch()
   for width,height in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{name}-{width}'
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p);landing(p)
     check(tag+' library heading',p.locator('#page-clinical > .pagehead h2').inner_text()=='Biblioteca clínica')
     check(tag+' no automatically opened subgroup',p.locator('#page-clinical > .sub.active').count()==0 and not p.evaluate('!!FCCUI.active()'))
     check(tag+' no eager medication catalogue',p.evaluate('!window.FCCMedications'))
     check(tag+' reference filters available',p.locator('#fccArea-clinical [data-area-filter]').count()==4)
     check(tag+' preserved 24 modules',p.locator('#fccArea-clinical .fcc-area-card').count()==24)
     check(tag+' five working nav destinations',p.locator('nav.side .nav').count()==5 and p.locator('nav.side .ni svg').count()==5)
     for size in [320,390,430,768,1440]:
      p.set_viewport_size({'width':size,'height':844});p.wait_for_timeout(60)
      check(tag+' viewport '+str(size)+' no document overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      geometry=p.evaluate("""()=>{const row=document.querySelector('#fccArea-clinical .fcc-library-row'),card=row.querySelector('.fcc-area-card').getBoundingClientRect(),icon=row.querySelector('.fcc-area-icon').getBoundingClientRect(),title=row.querySelector('strong').getBoundingClientRect(),star=row.querySelector('.fcc-library-star').getBoundingClientRect(),chevron=row.querySelector('.fcc-area-chevron').getBoundingClientRect();return {proper:icon.right<=title.left&&title.right<=star.left&&star.right<=chevron.left+1,starWidth:star.width,starHeight:star.height,sameRow:Math.abs(icon.y+icon.height/2-(star.y+star.height/2))<2,columns:getComputedStyle(document.querySelector('#fccArea-clinical .fcc-area-grid')).gridTemplateColumns.split(' ').length}}""")
      check(tag+' viewport '+str(size)+' row and independent touch target',geometry['proper'] and geometry['sameRow'] and geometry['starWidth']>=44 and geometry['starHeight']>=44,geometry)
      if size<=920:check(tag+' viewport '+str(size)+' full-width list',geometry['columns']==1)
     p.set_viewport_size({'width':width,'height':height})
     # A star must save without triggering its adjacent module button or opening a keyboard.
     p.locator('[data-favorite-sub=clin-drugs]').click();p.wait_for_function('FCCFavorites.list().length===1')
     check(tag+' star saves without navigation',not p.evaluate('FCCNavigation.route().sub') and p.locator('[data-favorite-sub=clin-drugs]').get_attribute('aria-pressed')=='true')
     check(tag+' favorite button is not nested in another button',p.locator('.fcc-library-star button,button .fcc-library-star').count()==0)
     check(tag+' favorite action restores focus',p.evaluate("document.activeElement.dataset.favoriteSub==='clin-drugs'"))
     p.locator('[data-area-filter=favorites]').click();check(tag+' favorites filter works',p.locator('#fccArea-clinical .fcc-area-card').count()==1)
     p.locator('[data-area-target=clin-drugs]').click();p.wait_for_function("FCCNavigation.route().sub==='clin-drugs'&&!!window.FCCMedications")
     check(tag+' selected module only',p.locator('#page-clinical > .sub.active').count()==1)
     p.locator('#page-clinical .fcc-area-back').click();p.wait_for_selector('#fccArea-clinical')
     check(tag+' back retains module filter',p.locator('[data-area-filter=favorites]').get_attribute('aria-pressed')=='true' and p.locator('#fccArea-clinical .fcc-area-card').count()==1)
     p.locator('[data-page=favorites]').click();p.wait_for_selector('#page-favorites.page.active')
     check(tag+' favorites has saved module',p.locator('[data-favorite-open]').count()==1)
     p.reload(wait_until='domcontentloaded');ready(p);p.wait_for_selector('#page-favorites.page.active')
     check(tag+' favorite route and data survive reload',p.locator('[data-favorite-open]').count()==1)
     p.locator('[data-favorite-open]').click();p.wait_for_function("FCCNavigation.route().sub==='clin-drugs'");p.locator('#clin-drugs').wait_for(state='visible')
     check(tag+' favorite opens real existing module',p.locator('#clin-drugs').is_visible())
     p.locator('[data-page=favorites]').click();p.wait_for_selector('#page-favorites.page.active');p.locator('[data-favorite-remove]').click();p.wait_for_function('FCCFavorites.list().length===0')
     check(tag+' removing final favorite explains empty state',p.locator('#page-favorites .fcc-empty').is_visible())
     landing(p);p.locator('[data-area-filter=calculators]').click()
     calc=p.locator('#fccArea-clinical [data-area-target]').evaluate_all('(buttons)=>buttons.map(b=>b.dataset.areaTarget)')
     check(tag+' calculator filter selects calculator modules',len(calc)==9 and 'clin-calcs' in calc and 'clin-drugs' not in calc)
     p.locator('[data-area-filter=modules]').click();modules=p.locator('#fccArea-clinical [data-area-target]').evaluate_all('(buttons)=>buttons.map(b=>b.dataset.areaTarget)')
     check(tag+' filters partition existing module list',set(calc).isdisjoint(modules) and len(calc)+len(modules)==24)
     p.locator('[data-area-filter=all]').click();p.locator('#fccArea-clinical input').fill('medicação');check(tag+' legacy names remain searchable',p.locator('[data-area-target=clin-drugs]').count()==1)
     p.locator('#fccArea-clinical input').fill('zznothing');p.locator('[data-clear-filters]').click();check(tag+' empty state resets query and filters',p.locator('#fccArea-clinical .fcc-area-card').count()==24)
     # Keep the same vault gate as production. Personal remains an overview after unlocking.
     p.locator('[data-page=personal]').click();p.locator('#fccArea-personal').wait_for(state='visible');check(tag+' locked landing is public overview only',not p.evaluate('!!FCCUI.active()') and not p.evaluate('!!window.FCCPersonal'));p.locator('[data-area-unlock]').click();p.locator('#fccVaultDialog').wait_for(state='visible');check(tag+' private gate unchanged',not p.evaluate('FCCAccess.isUnlocked()'))
     phrase='synthetic library audit phrase 2026'
     p.locator('#fccVaultPass').fill(phrase);p.locator('#fccVaultConfirm').fill(phrase);p.locator('#fccVaultAccept').check();p.locator('#fccVaultSubmit').click();p.wait_for_function('FCCAccess.isUnlocked()&&!FCCUI.active()',timeout=20000);p.wait_for_selector('#fccArea-personal')
     check(tag+' personal opens overview without subgroup',p.locator('#fccArea-personal .fcc-area-card').count()==6 and not p.evaluate('FCCNavigation.route().sub') and not p.evaluate('!!FCCUI.active()'))
     vault=p.evaluate('localStorage.getItem(FCCStore.keys.vault)');p.locator('#fccArea-personal [data-area-filter=tools]').click();check(tag+' personal tools filter',p.locator('#fccArea-personal .fcc-area-card').count()==2)
     p.locator('#fccArea-personal [data-area-filter=records]').click();check(tag+' personal records filter',p.locator('#fccArea-personal .fcc-area-card').count()==4)
     p.locator('#fccArea-personal [data-area-target=garage]').click();p.wait_for_selector('#fccArea-garage');check(tag+' personal child does not auto-open subgroup',p.locator('#page-garage > .sub.active').count()==0)
     check(tag+' personal navigation did not modify private records',p.evaluate('localStorage.getItem(FCCStore.keys.vault)')==vault)
     # A floating lock must not overlap the description at small viewport widths.
     p.evaluate("fccNavigate('personal')")
     for test_width in [320,390,430,768,1440]:
      p.set_viewport_size({'width':test_width,'height':844});p.wait_for_timeout(50)
      check(tag+' personal lock does not cover subtitle '+str(test_width),p.evaluate("""()=>{const a=document.querySelector('#page-personal .fcc-area-head-actions').getBoundingClientRect(),b=document.querySelector('#page-personal > .pagehead p').getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom}"""))
     p.set_viewport_size({'width':width,'height':height});p.wait_for_timeout(4200)
     # Capture the implemented website, including both themes and real module content.
     for theme in ['light','dark']:
      p.evaluate('(theme)=>fccSetTheme(theme,false)',theme)
      for area in ['clinical','personal','favorites','settings']:
       p.evaluate('(area)=>fccNavigate(area)',area)
       if area in ['clinical','personal']:p.locator('#fccArea-'+area+' [data-area-filter=all]').click()
       p.wait_for_timeout(150);p.screenshot(path=str(OUT/f'{tag}-library-{area}-{theme}.png'),animations='disabled')
       check(tag+' '+area+' '+theme+' no overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
     check(tag+' no unhandled application errors',not errors,errors)
    except Exception as e:
     report['checks'].append({'name':tag+' library audit failure','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:p.screenshot(path=str(OUT/(tag+'-library-FAILED.png')))
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 srv.shutdown();(OUT/'library-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not c['pass'] for c in report['checks']):raise SystemExit(1)
