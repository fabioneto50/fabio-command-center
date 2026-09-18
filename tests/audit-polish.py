"""Regression for the two reported screenshots and explicit library navigation.
Real browser engines, synthetic profiles and deterministic news; no clinical edits.
"""
import functools, http.server, json, os, socketserver, threading, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4194),functools.partial(Handler,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:4194/'
report={'commit':os.environ.get('GITHUB_SHA','local'),'method':'Chromium and WebKit; real application; synthetic vault and deterministic news fixtures; no clinical revalidation','checks':[],'contexts':[]}
PASS='synthetic library personal favorites 2026';PRIVATE='fcc-personal-favorites-v1'
feed={'updatedAt':'2026-09-17T20:00:00Z',**{k:[{'title':f'Notícia sintética {k} {i+1}','description':'Texto de ensaio da paginação, não uma notícia real.','source':'Fonte de teste','url':f'https://example.org/{k}/{i+1}','publishedAt':'2026-09-17T18:00:00Z'} for i in range(10)] for k in ['health','world']}}
def check(name,value,detail=None):
 report['checks'].append({'name':name,'pass':bool(value),'detail':detail})
 if not value:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('nav.side .nav')].every(x=>!x.disabled)",timeout=60000)
def area(p,name):
 p.locator('nav.side [data-page='+name+']').click();p.wait_for_function('(a)=>FCCNavigation.current()===a&&!FCCNavigation.route().sub',arg=name)
 if name in ['personal','clinical']:p.locator('#fccArea-'+name).wait_for(state='visible')
def unlock(p,setup=False):
 p.locator('#fccVaultDialog').wait_for(state='visible');p.locator('#fccVaultPass').fill(PASS)
 if setup:p.locator('#fccVaultConfirm').fill(PASS);p.locator('#fccVaultAccept').check()
 p.locator('#fccVaultSubmit').click();p.wait_for_function('FCCAccess.isUnlocked()&&!FCCUI.active()',timeout=20000)
def shot(p,name):p.wait_for_timeout(150);p.screenshot(path=str(OUT/(name+'.png')),animations='disabled')
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch(headless=True)
   for width,height in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600)
    ctx.route('**/news-feed.json*',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps(feed)))
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{width}-polish'
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p);p.wait_for_selector('.home-news-dot')
     for kind,root_id in [('health','homeHealthNewsList'),('world','homeWorldNewsList')]:
      root=p.locator('#'+root_id);buttons=root.locator('.home-news-dot');count=10 if width<721 else 5
      check(tag+' '+kind+' numbered pages',buttons.count()==count and buttons.all_text_contents()==[str(i+1) for i in range(count)])
      sizes=buttons.evaluate_all("es=>es.map(e=>({before:getComputedStyle(e,'::before').content,after:getComputedStyle(e,'::after').content,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))")
      check(tag+' '+kind+' no dot overlay and usable targets',all(x['before'] in ['none','normal'] and x['after'] in ['none','normal'] and x['w']>=44 and x['h']>=44 for x in sizes),sizes)
      first=root.locator('.home-news-item h4').first.inner_text();buttons.last.click()
      p.wait_for_function("([id,n])=>document.querySelector('#'+id+' .home-news-dot[aria-current=page]')?.textContent.trim()===String(n)",arg=[root_id,count])
      # WebKit may insert a line break around a grid child's innerText.
      # Compare exact article and page state atomically, using trimmed textContent.
      expected_title=f'Notícia sintética {kind} {(count-1)*(1 if width<721 else 2)+1}'
      state=root.evaluate("e=>({page:e.querySelector('.home-news-dot[aria-current=page]')?.textContent.trim(),title:e.querySelector('.home-news-item h4')?.textContent.trim()})")
      check(tag+' '+kind+' selected page updates content',state['page']==str(count) and state['title']==expected_title and state['title']!=first.strip(),state)
      check(tag+' '+kind+' one selected page',root.locator('[aria-current=page]').count()==1)
      colors=root.locator('[aria-current=page]').evaluate("e=>({bg:getComputedStyle(e).backgroundColor,fg:getComputedStyle(e).color,other:getComputedStyle(e.parentElement.firstElementChild).backgroundColor})")
      check(tag+' '+kind+' active style distinct',colors['bg']!=colors['other'] and colors['fg']!=colors['bg'],colors)
      if kind=='health':root.locator('.home-news-dots').screenshot(path=str(OUT/(tag+'-news-pagination.png')))
     area(p,'clinical')
     check(tag+' real library heading',p.locator('#page-clinical>.pagehead h2').inner_text()=='Biblioteca clínica')
     check(tag+' clinical no implicit modal or panel',p.locator('#page-clinical>.sub.active').count()==0 and not p.evaluate('!!FCCUI.active()'))
     check(tag+' clinical catalogue not eagerly loaded',p.evaluate('!window.FCCMedications'))
     check(tag+' five fixed navigation destinations',p.locator('nav.side .nav').get_attribute('data-page') is not None if p.locator('nav.side .nav').count()==1 else p.locator('nav.side .nav').evaluate_all("es=>es.map(e=>e.dataset.page)")==['home','clinical','personal','favorites','settings'])
     check(tag+' clinical header controls',p.locator('#page-clinical>.pagehead .fcc-area-head-actions button').count()==2)
     p.locator('#page-clinical .fcc-area-preferences').click();p.wait_for_selector('#page-settings.active');check(tag+' preference control opens existing settings',p.locator('#fccDisplayPrefs').is_visible());area(p,'clinical')
     p.locator('#fccArea-clinical [data-favorite-sub=clin-drugs]').click();p.wait_for_function('FCCFavorites.list().length===1')
     check(tag+' clinical favorite does not navigate',not p.evaluate('FCCNavigation.route().sub'))
     area(p,'personal')
     check(tag+' locked personal hub opens without modal',not p.evaluate('!!FCCUI.active()') and not p.evaluate('FCCAccess.isUnlocked()'))
     check(tag+' static personal overview without private module',p.evaluate('!window.FCCPersonal&&FCCStore.getItem("fcc-master-user-data-v1")===null'))
     check(tag+' six actual personal destinations and four filters',p.locator('#fccArea-personal .fcc-area-card').count()==6 and p.locator('#fccArea-personal [data-area-filter]').count()==4)
     p.locator('#fccArea-personal [data-area-target=notes]').click();p.locator('#fccVaultDialog').wait_for(state='visible')
     check(tag+' real notes route remains protected',p.evaluate('!FCCAccess.isUnlocked()&&FCCNavigation.current()==="personal"') and not p.locator('#em-notes').is_visible())
     p.keyboard.press('Escape');p.reload(wait_until='domcontentloaded');ready(p);p.locator('#fccArea-personal').wait_for(state='visible')
     check(tag+' locked overview safe after reload',not p.evaluate('!!FCCUI.active()') and not p.evaluate('!!window.FCCPersonal'))
     p.locator('#fccArea-personal [data-area-filter=favorites]').click();check(tag+' favorites explicitly protected',p.locator('#fccArea-personal [data-favorites-unlock]').is_visible())
     p.locator('#fccArea-personal [data-area-filter=all]').click()
     p.locator('#fccArea-personal [data-favorite-sub=expenses]').click();unlock(p,True)
     p.wait_for_function('FCCFavorites.list().some(x=>x.page==="expenses")')
     check(tag+' star unlock returns to hub rather than opening module',p.evaluate('FCCNavigation.current()==="personal"&&!FCCNavigation.route().sub&&!window.FCCPersonal'))
     check(tag+' personal star focus restored',p.evaluate('document.activeElement.dataset.favoriteSub==="expenses"'))
     p.locator('#fccArea-personal [data-favorite-sub=notes]').click();p.wait_for_function('FCCFavorites.list().length===3')
     check(tag+' personal shortcuts stored only encrypted',p.evaluate('(key)=>localStorage.getItem(key)===null&&!!FCCStore.getItem(key)&&!localStorage.getItem(FCCStore.keys.vault).includes("Despesas")',PRIVATE))
     p.locator('#fccArea-personal [data-area-filter=favorites]').click();check(tag+' personal favorite filter',p.locator('#fccArea-personal .fcc-area-card').count()==2)
     p.evaluate("async()=>{const d=JSON.parse(FCCStore.getItem('fcc-master-user-data-v1')||'{}');d.notes={...(d.notes||{}),emergency:'SYNTHETIC PRIVATE NOTE FOR POLISH'};await FCCStore.setItem('fcc-master-user-data-v1',JSON.stringify(d));FCCAccess.refreshState();}")
     p.locator('#fccArea-personal [data-area-target=notes]').click();p.wait_for_selector('#em-notes.active')
     check(tag+' notes shortcut opens existing stored notes',p.locator('#emNotes').input_value()=='SYNTHETIC PRIVATE NOTE FOR POLISH')
     area(p,'personal');check(tag+' personal return preserves filter not subgroup',p.locator('#fccArea-personal [data-area-filter=favorites]').get_attribute('aria-pressed')=='true' and not p.evaluate('FCCNavigation.route().sub'))
     area(p,'favorites');check(tag+' favorites view includes public and decrypted personal',p.locator('#page-favorites [data-favorite-open]').count()==3)
     p.locator('#page-favorites input').fill('notas');p.locator('#page-favorites [data-favorite-open]').click();p.wait_for_selector('#em-notes.active')
     check(tag+' favorite targets existing note route',p.locator('#emNotes').input_value().startswith('SYNTHETIC'))
     area(p,'personal');p.locator('#page-personal .fcc-area-preferences').click();p.wait_for_function('!FCCAccess.isUnlocked()')
     check(tag+' lock leaves only static overview',p.evaluate('FCCNavigation.current()==="personal"&&!FCCNavigation.route().sub') and not p.evaluate('!!FCCUI.active()'))
     check(tag+' private content removed from DOM and memory',p.locator('#emNotes').input_value()=='' and p.evaluate('(k)=>FCCStore.getItem(k)===null&&FCCFavorites.list().every(x=>x.page==="clinical")',PRIVATE))
     area(p,'favorites');check(tag+' locked favorites show public entries only',p.locator('#page-favorites [data-favorite-open]').count()==1)
     p.reload(wait_until='domcontentloaded');ready(p);p.wait_for_selector('#page-favorites.active');p.locator('.fcc-favorites-privacy button').click();unlock(p)
     check(tag+' encrypted favorites survive reload',p.locator('#page-favorites [data-favorite-open]').count()==3)
     # All viewports: reflow, independent star button and bottom safe area.
     for w in [320,390,430,768,1440]:
      p.set_viewport_size({'width':w,'height':1000})
      for scope in ['clinical','personal']:
       area(p,scope);p.locator('#fccArea-'+scope+' [data-area-filter=all]').click()
       check(tag+f' {scope} at {w} no overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
       geometry=p.locator('#page-'+scope+' > .pagehead').evaluate("e=>{const a=e.querySelector('.fcc-area-head-actions').getBoundingClientRect(),b=e.querySelector('h2').getBoundingClientRect();return {notOverlapping:a.left>=b.right||a.top>=b.bottom||a.bottom<=b.top,buttons:[...e.querySelectorAll('button')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height}))}}")
       check(tag+f' {scope} at {w} header usable',geometry['notOverlapping'] and all(x['w']>=44 and x['h']>=44 for x in geometry['buttons']),geometry)
       stars=p.locator('#fccArea-'+scope+' .fcc-library-star').evaluate_all("es=>es.map(e=>{const a=e.getBoundingClientRect(),b=e.parentElement.querySelector('strong').getBoundingClientRect(),c=e.parentElement.querySelector('.fcc-area-chevron').getBoundingClientRect();return a.left>=b.right-1&&a.right<=c.left+1&&a.width>=44&&a.height>=44})")
       check(tag+f' {scope} at {w} independent favorites targets',all(stars))
      if w<=920:
       check(tag+f' bottom bar at {w} fixed and opaque',p.evaluate("()=>{const e=document.querySelector('nav.side'),s=getComputedStyle(e);return s.position==='fixed'&&s.bottom==='0px'&&/^rgb\\(/.test(s.backgroundColor)}"))
     p.set_viewport_size({'width':width,'height':height})
     for theme in ['light','dark']:
      p.evaluate('(t)=>fccSetTheme(t,false)',theme)
      for scope in ['clinical','personal','favorites','settings']:
       area(p,scope);shot(p,tag+'-'+scope+'-'+theme)
      # Compare exact rendered content with the unchanged institutional records.
      p.evaluate("fccNavigate('clinical',{sub:'clin-perf'})");p.wait_for_selector('#perfDilutionSearch');p.locator('#perfDilutionSearch').fill('amoxicilina');p.wait_for_timeout(400)
      card=p.locator('#perfDilutionGrid > .ccd-doc-card:has(.cuf2213-route):visible').first;card.locator(':scope > .ccd-doc-top').click();card.locator('.cuf2213-route').first.wait_for(state='visible')
      content=card.inner_text()
      expected=json.loads((ROOT/'data/institutional.json').read_text())['antibiotics']['records'];expected=[r for r in expected if r['drug']=='Amoxicilina + Ácido clavulânico']
      check(tag+' '+theme+' every supplied presentation retained',card.locator('.cuf2213-route').count()==len(expected))
      for i,row in enumerate(expected):
       text=card.locator('.cuf2213-route').nth(i).inner_text()
       for key in ['route','dose','form','reconstitution','reconstitution_stability','dilution','dilution_stability','observations']:
        if row[key]:check(tag+f' {theme} presentation {i} exact {key}',row[key] in text)
      metrics=card.locator('.cuf2213-route').first.evaluate("e=>{const s=[...e.querySelectorAll('.ccd-doc-section')],o=e.querySelector('.ccd-doc-grid-wide .ccd-doc-field'),g=o.parentElement;return {heading:parseFloat(getComputedStyle(e.querySelector('.cuf-route-title')).fontSize),sections:s.map(x=>parseFloat(getComputedStyle(x).fontSize)),body:parseFloat(getComputedStyle(o.querySelector('div')).fontSize),ratio:o.getBoundingClientRect().width/g.getBoundingClientRect().width,emptyColumns:e.querySelectorAll('.ccd-doc-grid > div:empty').length,overflow:e.scrollWidth>e.clientWidth+1}}")
      check(tag+' '+theme+' readable headings and full-width observations',metrics['heading']>=16 and min(metrics['sections'])>=14 and metrics['body']>=14 and metrics['ratio']>.98 and metrics['emptyColumns']==0 and not metrics['overflow'],metrics)
      route=card.locator('.cuf2213-route').first;route.scroll_into_view_if_needed();route.screenshot(path=str(OUT/(tag+'-antibiotics-'+theme+'.png')))
      check(tag+' '+theme+' no clinical document overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      # Collapse before reopening in next theme; show() can retain the expansion state.
      p.locator('#fccDilutionBack').click()
     check(tag+' no unhandled runtime errors',not errors,errors);report['contexts'].append({'browser':engine,'viewport':[width,height],'pageErrors':errors})
    except Exception as e:
     report['checks'].append({'name':tag+' failure','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:shot(p,tag+'-FAILED')
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 srv.shutdown();(OUT/'polish-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not x['pass'] for x in report['checks']):raise SystemExit(1)
