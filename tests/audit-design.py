"""Explicit landing navigation, responsive design, focus and unchanged private storage.
Real Chromium/WebKit, fresh synthetic contexts. Not physical iOS or clinical validation.
"""
import functools,http.server,json,os,socketserver,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'audit-evidence';OUT.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',4182),functools.partial(Handler,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE=os.environ.get('FCC_DESIGN_URL','http://127.0.0.1:4182/')
report={'commit':os.environ.get('GITHUB_SHA','local'),'url':BASE,'checks':[],'contexts':[],'limitations':['Linux browser engines; not physical iPhone or VoiceOver. Synthetic vaults only.']}
def check(name,ok,detail=None):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail})
 if not ok:raise AssertionError(name+': '+str(detail))
def ready(p):p.wait_for_function("window.FCCAppReady===true&&[...document.querySelectorAll('.nav')].every(x=>!x.disabled)",timeout=60000)
def landing(p,area,prefix):
 p.locator('.nav[data-page="'+area+'"]').click()
 p.wait_for_function('(a)=>FCCNavigation.route().page===a&&!FCCNavigation.route().sub',arg=area)
 p.locator('#fccArea-'+area).wait_for(state='visible')
 check(prefix+' '+area+' no modal',not p.evaluate('!!FCCUI.active()'))
 check(prefix+' '+area+' no selected subgroup',p.locator('#page-'+area+' > .sub.active').count()==0)
 check(prefix+' '+area+' owns highlighted navigation',p.locator('.nav.active').get_attribute('data-page')==area)
 check(prefix+' '+area+' keyboard not opened by autofocus',p.evaluate("document.activeElement.tagName!=='INPUT'"))
try:
 with sync_playwright() as pw:
  for engine in ['chromium','webkit']:
   browser=getattr(pw,engine).launch()
   for width,height in [(390,844),(1440,1000)]:
    ctx=browser.new_context(viewport={'width':width,'height':height},locale='pt-PT',timezone_id='Europe/Lisbon',is_mobile=width<600,has_touch=width<600)
    p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));tag=f'{engine}-{width}'
    try:
     p.goto(BASE,wait_until='domcontentloaded');ready(p)
     check(tag+' design revision',p.evaluate("document.documentElement.dataset.fccDesign==='2'"))
     check(tag+' four consistent SVG navigation icons',p.locator('nav.side .nav .ni svg').count()==4)
     landing(p,'clinical',tag)
     check(tag+' catalogue not implicitly loaded',p.evaluate('!window.FCCMedications'))
     check(tag+' all clinical modules listed',p.locator('#fccArea-clinical .fcc-area-card').count()==len(p.evaluate("FCCNavigation.items('clinical')")))
     p.locator('#fccArea-clinical input').fill('zz-non-existent');check(tag+' empty module search explained',p.locator('#fccArea-clinical .fcc-empty').is_visible())
     p.locator('#fccArea-clinical input').fill('medicação');check(tag+' filtered module choices',p.locator('#fccArea-clinical .fcc-area-card').count()>=1)
     p.locator('#fccArea-clinical [data-area-target="clin-drugs"]').click();p.wait_for_function("FCCNavigation.route().sub==='clin-drugs'&&!!window.FCCMedications")
     check(tag+' explicit card opens only chosen module',p.locator('#page-clinical > .sub.active').count()==1 and p.locator('#clin-drugs').is_visible())
     check(tag+' return to modules action visible',p.locator('#page-clinical .fcc-area-back').is_visible())
     p.locator('#page-clinical .fcc-area-back').click();p.locator('#fccArea-clinical').wait_for(state='visible');check(tag+' return action clears subgroup',p.locator('#page-clinical > .sub.active').count()==0)
     p.reload(wait_until='domcontentloaded');ready(p);check(tag+' landing reload remains unselected',p.locator('#fccArea-clinical').is_visible() and not p.evaluate('FCCNavigation.route().sub'))
     p.locator('.nav[data-page="personal"]').click();p.locator('#fccVaultDialog').wait_for(state='visible')
     check(tag+' private guard preserved',not p.evaluate('FCCAccess.isUnlocked()'))
     p.locator('#fccVaultPass').fill('synthetic design navigation passphrase 2026');p.locator('#fccVaultConfirm').fill('synthetic design navigation passphrase 2026');p.locator('#fccVaultAccept').check();p.locator('#fccVaultSubmit').click();p.wait_for_function("FCCAccess.isUnlocked()&&FCCNavigation.current()==='personal'")
     p.locator('#fccArea-personal').wait_for(state='visible');check(tag+' unlock lands on personal overview',not p.evaluate('FCCNavigation.route().sub') and not p.evaluate('!!FCCUI.active()'))
     vault=p.evaluate('localStorage.getItem(FCCStore.keys.vault)')
     check(tag+' personal five areas',p.locator('#fccArea-personal .fcc-area-card').count()==5)
     p.locator('#fccArea-personal [data-area-target="garage"]').click();p.wait_for_function("FCCNavigation.current()==='garage'");p.locator('#fccArea-garage').wait_for(state='visible')
     check(tag+' child area does not force first subgroup',p.locator('#page-garage > .sub.active').count()==0)
     p.locator('#fccArea-garage [data-area-target]').first.click();p.wait_for_function("!!FCCNavigation.route().sub");landing(p,'personal',tag)
     for _ in range(3):landing(p,'clinical',tag);landing(p,'personal',tag)
     check(tag+' navigation did not alter encrypted private records',vault==p.evaluate('localStorage.getItem(FCCStore.keys.vault)'))
     # Visible focus, module ordering and Escape remain available without forced modal navigation.
     landing(p,'clinical',tag);p.locator('.fcc-area-organize:visible').click();p.locator('#fccOrganizeDialog').wait_for(state='visible');p.keyboard.press('Tab');check(tag+' optional organize focus contained',p.evaluate("document.getElementById('fccOrganizeDialog').contains(document.activeElement)"));p.keyboard.press('Escape');check(tag+' organize closes back to landing',p.locator('#fccArea-clinical').is_visible())
     for theme in ['light','dark']:
      if p.evaluate('document.documentElement.dataset.fccTheme')!=theme:p.locator('#fccThemeQuick').click()
      p.wait_for_function('(t)=>document.documentElement.dataset.fccTheme===t&&getComputedStyle(document.documentElement).colorScheme.includes(t)',arg=theme)
      check(tag+' '+theme+' native color scheme and real toggle',p.locator('#fccThemeQuick').inner_text()==('Escuro' if theme=='light' else 'Claro'))
      for area in ['home','clinical','personal','settings']:
       p.evaluate('(a)=>fccNavigate(a)',area)
       p.wait_for_timeout(200);p.screenshot(path=str(OUT/f'{tag}-design-{area}-{theme}.png'),full_page=False,animations='disabled')
       check(tag+' '+theme+' '+area+' no document overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
       if width<600:
        check(tag+' '+theme+' opaque bottom navigation',p.evaluate("()=>{const c=getComputedStyle(document.querySelector('nav.side'));return /^rgb\(/.test(c.backgroundColor)&&c.opacity==='1'&&c.backdropFilter==='none'}"))
        check(tag+' '+theme+' minimum navigation targets',p.evaluate("[...document.querySelectorAll('nav.side .nav')].every(b=>b.getBoundingClientRect().height>=44&&b.getBoundingClientRect().width>=44)"))
      p.locator('#fccSystemStatus').scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'{tag}-design-system-{theme}.png'),animations='disabled')
      # Every common text color must reach 4.5:1 on its actual design surface.
      colors=p.evaluate("()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['--text','--muted','--clinical','--panel','--panel-2','--bg','--clinical-soft'].map(k=>[k,s.getPropertyValue(k).trim()]))}")
      def lum(h):
       c=[int(h[i:i+2],16)/255 for i in [1,3,5]];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c];return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
      for fg,bg in [('--text','--panel'),('--muted','--panel'),('--muted','--bg'),('--muted','--panel-2'),('--clinical','--clinical-soft')]:
       a,b=sorted([lum(colors[fg]),lum(colors[bg])]);ratio=(b+.05)/(a+.05);check(tag+' '+theme+' contrast '+fg+'/'+bg,ratio>=4.5,round(ratio,2))
      p.evaluate("fccNavigate('clinical',{sub:'clin-vent'})");p.wait_for_timeout(200)
      p.locator('#vMode').scroll_into_view_if_needed()
      rendered=p.evaluate("""()=>['#vMode','#vSex','#vHeight','#globalSearch'].map(q=>{const e=document.querySelector(q),s=getComputedStyle(e);return {selector:q,color:s.color,background:s.backgroundColor,scheme:s.colorScheme}})""")
      import re
      for style in rendered:
       def rgbhex(v):
        nums=[int(float(x)) for x in re.findall(r'[0-9.]+',v)[:3]];return '#'+''.join(f'{x:02x}' for x in nums)
       a,b=sorted([lum(rgbhex(style['color'])),lum(rgbhex(style['background']))]);ratio=(b+.05)/(a+.05);check(tag+' '+theme+' actual input contrast '+style['selector'],ratio>=4.5,{**style,'ratio':round(ratio,2)})
      check(tag+' '+theme+' checkbox not expanded',p.evaluate("[...document.querySelectorAll('#clin-vent input[type=checkbox]')].every(e=>e.getBoundingClientRect().height===24)"))
      p.screenshot(path=str(OUT/f'{tag}-design-form-{theme}.png'),animations='disabled')
      check(tag+' safety decision boundary always visible',p.locator('.fcc-usage-notice>strong').is_visible())
      p.locator('.fcc-usage-notice summary').click();check(tag+' full original safety statement available',p.locator('.fcc-usage-notice details>p').is_visible() and 'prescrição automática' in p.locator('.fcc-usage-notice details>p').inner_text());p.locator('.fcc-usage-notice summary').click()
     # Success notices expire; pending saves and errors must remain visible.
     p.evaluate("window.dispatchEvent(new CustomEvent('fcc-storage-status',{detail:{status:'saved'}}))");check(tag+' saved notice shown',p.locator('#fccSaveStatus').is_visible());p.wait_for_timeout(4200);check(tag+' saved notice no longer overlays navigation',not p.locator('#fccSaveStatus').is_visible())
     p.evaluate("window.dispatchEvent(new CustomEvent('fcc-storage-status',{detail:{status:'error',error:'Synthetic design check'}}))");check(tag+' save error remains visible',p.locator('#fccSaveStatus').is_visible() and p.locator('#fccSaveStatus').get_attribute('role')=='alert');p.evaluate("window.dispatchEvent(new CustomEvent('fcc-storage-status',{detail:{status:'locked'}}))")
     for w in [320,430,768]:
      p.set_viewport_size({'width':w,'height':844})
      for area in ['clinical','personal','settings']:
       p.evaluate('(a)=>fccNavigate(a)',area);check(tag+' reflow '+str(w)+' '+area,p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      p.evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})")
      check(tag+' final content clears navigation '+str(w),p.evaluate("document.querySelector('.footer').getBoundingClientRect().bottom<=document.querySelector('nav.side').getBoundingClientRect().top"))
     p.set_viewport_size({'width':width,'height':height});p.evaluate("fccNavigate('clinical',{sub:'clin-vent'})");p.screenshot(path=str(OUT/f'{tag}-design-clinical-form.png'))
     # The clinical safety warning remains in place, not hidden by redesign.
     check(tag+' safety notice visible',p.locator('#page-clinical > .notice').is_visible())
     check(tag+' input text remains 16px',p.evaluate("[...document.querySelectorAll('#clin-vent input')].filter(e=>e.getClientRects().length&&e.type!=='checkbox').every(e=>parseFloat(getComputedStyle(e).fontSize)>=16)"))
     check(tag+' no new unhandled application errors',not errors,errors)
     report['contexts'].append({'browser':engine,'viewport':[width,height],'pageErrors':errors})
    except Exception as e:
     report['checks'].append({'name':tag+' failed','pass':False,'error':str(e),'trace':traceback.format_exc(),'pageErrors':errors})
     try:p.screenshot(path=str(OUT/(tag+'-design-FAIL.png')))
     except Exception:pass
    finally:ctx.close()
   browser.close()
finally:
 srv.shutdown();(OUT/'design-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(not c['pass'] for c in report['checks']):raise SystemExit(1)
