"""Post-review refinements of already committed readable source. No network or user data."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
assert json.loads((root/'scripts/library-polish-applied.json').read_text())['sourceTransferSha256']=='9e6533f531f2b1d9dd2ccbe48bac12d51d1a408a5f0c66f75e2057f8fd225d74'
def edit(name,old,new):
    path=root/name;s=path.read_text()
    if new in s:return
    assert old in s,(name,'source changed; reconcile before editing')
    assert s.count(old)==1,(name,'ambiguous replacement')
    path.write_text(s.replace(old,new,1))
# Restrict overview chrome to the two requested areas. Other page badges carry live data IDs.
edit('fcc-areas.js','function header(page){\n  const root=host(page)',"function header(page){\n  if(!['clinical','personal'].includes(page))return;\n  const root=host(page)")
# Remove actual empty columns, not their surrounding clinical content.
for key in ['reconstitution_stability','dilution_stability']:
    edit('dilutions-cuf-v6.js',"${field('Estabilidade',r."+key+")}<div></div>","${field('Estabilidade',r."+key+")}")
# Wait until the selected page's event has run before asserting the displayed state.
edit('tests/audit-polish.py',"first=root.locator('.home-news-item h4').first.inner_text();buttons.last.click()", "first=root.locator('.home-news-item h4').first.inner_text();buttons.last.click()\n      p.wait_for_function(\"([id,n])=>document.querySelector('#'+id+' .home-news-dot[aria-current=page]')?.textContent.trim()===String(n)\",arg=[root_id,count])")
# The existing card header is the accessible expand button; its native summary is intentionally hidden.
edit('tests/audit-polish.py',"card=p.locator('#perfDilutionGrid > .ccd-doc-card:visible').first;card.locator(':scope > details > summary').click();", "card=p.locator('#perfDilutionGrid > .ccd-doc-card:has(.cuf2213-route):visible').first;card.locator(':scope > .ccd-doc-top').click();")
edit('tests/audit-polish.py',"card.locator(':scope > details > summary').click()", "card.locator(':scope > .ccd-doc-top').click()")
edit('tests/audit-library.py',"p.locator('#fccVaultSubmit').click();p.wait_for_selector('#fccArea-personal')", "p.locator('#fccVaultSubmit').click();p.wait_for_function('FCCAccess.isUnlocked()&&!FCCUI.active()',timeout=20000);p.wait_for_selector('#fccArea-personal')")
edit('tests/audit-design.py',"p.wait_for_function(\"FCCAccess.isUnlocked()&&FCCNavigation.current()==='personal'\")", "p.wait_for_function(\"FCCAccess.isUnlocked()&&FCCNavigation.current()==='personal'&&!FCCUI.active()\")")
# Locking from a public clinical tool must preserve that public route, not force the personal hub.
old_guard="""  page.evaluate('FCCAccess.lock()');check(prefix+' lock removes private DOM',page.evaluate("!document.body.textContent.includes('SYNTHETIC SECRET')&&!FCCAccess.isUnlocked()"));check(prefix+' private route cannot bypass guard',page.evaluate("async()=>{await fccNavigate('expenses',{bypassGuard:true});return FCCNavigation.current()==='personal'&&!FCCNavigation.route().sub&&!FCCAccess.isUnlocked()&&!document.getElementById('fccVaultDialog').hidden;}"));page.keyboard.press('Escape')"""
new_guard='''  page.evaluate('FCCAccess.lock()')
  check(prefix+' lock removes private DOM',page.evaluate("!document.body.textContent.includes('SYNTHETIC SECRET')&&!FCCAccess.isUnlocked()"))
  # Locking while viewing a PUBLIC clinical tool preserves that public route.
  # Rejection must not navigate to a private page or reveal private records.
  before_guard=page.evaluate('JSON.stringify(FCCNavigation.route())')
  denied=page.evaluate("""async(before)=>{const result=await fccNavigate('expenses',{bypassGuard:true});return {denied:result===false,sameRoute:JSON.stringify(FCCNavigation.route())===before,locked:!FCCAccess.isUnlocked(),dialogOpen:FCCUI.active()?.id==='fccVaultDialog'&&!document.getElementById('fccVaultDialog').hidden,privatePageVisible:!!document.querySelector('#page-expenses.active'),privateDataAbsent:FCCStore.getItem('fcc-master-expenses-v1')===null&&!document.body.textContent.includes('SYNTHETIC SECRET')};}""",before_guard)
  check(prefix+' private route cannot bypass guard',denied['denied'] and denied['sameRoute'] and denied['locked'] and denied['dialogOpen'] and not denied['privatePageVisible'] and denied['privateDataAbsent'],denied)
  page.keyboard.press('Escape')'''
edit('tests/audit-browser.py',old_guard,new_guard)
# Exact page and exact fixture article; normalize renderer-inserted innerText whitespace.
old_news="      check(tag+' '+kind+' selected page updates content',root.locator('.home-news-dot[aria-current=page]').inner_text()==str(count) and root.locator('.home-news-item h4').first.inner_text()!=first)"
new_news='''      # WebKit may insert a line break around a grid child's innerText.
      # Compare exact article and page state atomically, using trimmed textContent.
      expected_title=f'Notícia sintética {kind} {(count-1)*(1 if width<721 else 2)+1}'
      state=root.evaluate("e=>({page:e.querySelector('.home-news-dot[aria-current=page]')?.textContent.trim(),title:e.querySelector('.home-news-item h4')?.textContent.trim()})")
      check(tag+' '+kind+' selected page updates content',state['page']==str(count) and state['title']==expected_title and state['title']!=first.strip(),state)'''
edit('tests/audit-polish.py',old_news,new_news)
print('Scoped presentation and exact navigation regressions applied.')
