"""Idempotent correction of repeated institutional enhancement and its regression test."""
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
 'tests/audit-record-view.py':[
  ("      ids=p.locator", "      p.wait_for_function(\"document.querySelectorAll('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded=\\\"1\\\"])').length>50\")\n      p.wait_for_timeout(100)\n      ids=p.locator"),
  ("check(tag+theme+' unique public record identities',len(ids)>50 and len(ids)==len(set(ids)))", "check(tag+theme+' unique public record identities',len(ids)>50 and len(ids)==len(set(ids)),{'count':len(ids),'unique':len(set(ids)),'duplicates':[x for x in set(ids) if ids.count(x)>1]})\n      p.wait_for_timeout(150)\n      check(tag+theme+' institutional enhancement is stable',p.locator('#perfDilutionGrid>[data-fcc-record-id]:not([data-cuf-superseded=\\\"1\\\"])').count()==len(ids))")]
}
for name,pairs in changes.items():
 path=root/name;text=path.read_text()
 for old,new in pairs:
  if new in text:continue
  assert text.count(old)==1,name+': source changed, reconcile first'
  text=text.replace(old,new,1)
 path.write_text(text)
print('Repeated enhancement and final-record identity checks updated; clinical content unchanged.')
