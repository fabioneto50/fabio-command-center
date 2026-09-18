"""Idempotent corrections for stable records and explicit return navigation."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
changes={
 'dilutions-cuf-v6.js':[
  ("        if(card.classList.contains('cuf-current-card'))continue;", """        // Additional institutional records also count as present on later enhancement passes.
        // The grid observer can run again after navigation; never append the same record twice.
        if(card.classList.contains('cuf-current-card')){
          const key=fold(card.dataset.cufDrug);
          if(seen.has(key)){card.style.display='none';card.dataset.cufSuperseded='1';}
          else{seen.add(key);card.style.removeProperty('display');delete card.dataset.cufSuperseded;}
          continue;
        }"""),
  ("seen.add(key);card.style.removeProperty('display');card.dataset.cufCurrent='1';", "seen.add(key);card.style.removeProperty('display');delete card.dataset.cufSuperseded;card.dataset.cufCurrent='1';")],
 'dilutions-card-ux-v5.js':[
  ("   top.setAttribute('role','button');top.tabIndex=0;top.setAttribute('aria-expanded',String(on));\n   top.setAttribute('aria-label',(on?'Voltar aos resultados: ':'Abrir ficha: ')+(top.querySelector('h3')?.textContent||'medicação'));", """   if(on){for(const a of ['role','tabindex','aria-expanded','aria-label'])top.removeAttribute(a);}
   else{top.setAttribute('role','button');top.tabIndex=0;top.setAttribute('aria-expanded','false');top.setAttribute('aria-label','Abrir ficha: '+(top.querySelector('h3')?.textContent||'medicação'));}"""),
  ("if(selected===recordId(card))back();else open(card);", "if(selected!==recordId(card))open(card);")],
 'tests/audit-record-view.py':[
  ("      ids=p.locator", "      p.wait_for_function(\"document.querySelectorAll('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded=\\\"1\\\"])').length>50\")\n      p.wait_for_timeout(100)\n      ids=p.locator"),
  ("check(tag+theme+' unique public record identities',len(ids)>50 and len(ids)==len(set(ids)))", "check(tag+theme+' unique public record identities',len(ids)>50 and len(ids)==len(set(ids)),{'count':len(ids),'unique':len(set(ids)),'duplicates':[x for x in set(ids) if ids.count(x)>1]})\n      p.wait_for_timeout(150)\n      check(tag+theme+' institutional enhancement is stable',p.locator('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded=\\\"1\\\"])').count()==len(ids))"),
  ("       shot(p,t)\n", "       selected.locator('h3').click();check(t+' reading title is not an accidental close control',selected.is_visible() and p.locator('#fccDilutionBack').is_visible() and selected.locator('.ccd-doc-top').get_attribute('role') is None)\n       shot(p,t)\n")],
 'tests/audit-polish.py':[
  ("      card.locator(':scope > .ccd-doc-top').click()\n", "      p.locator('#fccDilutionBack').click()\n")],
 'tests/audit-live-polish.py':[
  ("animations='disabled');card.locator(':scope>.ccd-doc-top').click()", "animations='disabled');p.locator('#fccDilutionBack').click()")]
}
for name,pairs in changes.items():
 path=root/name;text=path.read_text()
 for old,new in pairs:
  if new in text:continue
  expected=2 if old=="if(selected===recordId(card))back();else open(card);" else 1
  assert text.count(old)==expected,name+': source changed, reconcile first'
  text=text.replace(old,new)
 path.write_text(text)
print('Record identity and explicit return controls updated; clinical content unchanged.')
