"""Post-review refinements of already committed readable source. No network or user data."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
assert json.loads((root/'scripts/library-polish-applied.json').read_text())['sourceTransferSha256']=='9e6533f531f2b1d9dd2ccbe48bac12d51d1a408a5f0c66f75e2057f8fd225d74'
def edit(name,old,new):
    path=root/name;s=path.read_text()
    if old not in s:
        assert new in s,(name,'source changed; reconcile before editing')
        return
    assert s.count(old)==1,(name,'ambiguous replacement')
    path.write_text(s.replace(old,new,1))
# Restrict overview chrome to the two requested areas. Other page badges carry live data IDs.
edit('fcc-areas.js','function header(page){\n  const root=host(page)',"function header(page){\n  if(!['clinical','personal'].includes(page))return;\n  const root=host(page)")
# Remove actual empty columns, not their surrounding clinical content.
for key in ['reconstitution_stability','dilution_stability']:
    edit('dilutions-cuf-v6.js',"${field('Estabilidade',r."+key+")}<div></div>","${field('Estabilidade',r."+key+")}")
# A click is asynchronous in WebKit; assert the resulting state after the event has run.
edit('tests/audit-polish.py',"first=root.locator('.home-news-item h4').first.inner_text();buttons.last.click()", "first=root.locator('.home-news-item h4').first.inner_text();buttons.last.click()\n      p.wait_for_function(\"([id,n])=>document.querySelector('#'+id+' .home-news-dot[aria-current=page]')?.textContent.trim()===String(n)\",arg=[root_id,count])")
# The existing card header is the accessible expand button; its native summary is intentionally hidden.
edit('tests/audit-polish.py',"card=p.locator('#perfDilutionGrid > .ccd-doc-card:visible').first;card.locator(':scope > details > summary').click();", "card=p.locator('#perfDilutionGrid > .ccd-doc-card:has(.cuf2213-route):visible').first;card.locator(':scope > .ccd-doc-top').click();")
edit('tests/audit-polish.py',"card.locator(':scope > details > summary').click()", "card.locator(':scope > .ccd-doc-top').click()")
edit('tests/audit-library.py',"p.locator('#fccVaultSubmit').click();p.wait_for_selector('#fccArea-personal')", "p.locator('#fccVaultSubmit').click();p.wait_for_function('FCCAccess.isUnlocked()&&!FCCUI.active()',timeout=20000);p.wait_for_selector('#fccArea-personal')")
edit('tests/audit-design.py',"p.wait_for_function(\"FCCAccess.isUnlocked()&&FCCNavigation.current()==='personal'\")", "p.wait_for_function(\"FCCAccess.isUnlocked()&&FCCNavigation.current()==='personal'&&!FCCUI.active()\")")
print('Scoped card, header and actual user-interaction refinements applied.')
