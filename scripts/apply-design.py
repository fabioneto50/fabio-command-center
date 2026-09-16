"""Final website presentation corrections; never accesses browser or user data."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
style='''/* Private area header: reserve room for the lock without overlapping the subtitle. */
html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead>div{padding-right:125px;min-width:0}
html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead h2{padding-right:0}
@media(max-width:920px){html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead>div{padding-right:60px}}
'''
p=root/'fcc-design.css';s=p.read_text()
assert '/* Final reference review:' in s,'Previous visual changes are required.'
if '/* Private area header:' not in s:p.write_text(s+'\n'+style)
p=root/'tests/audit-library.py';s=p.read_text()
old="     # Capture the implemented website, including both themes and real module content."
new="""     # A floating lock must not overlap the description at small viewport widths.
     p.evaluate(\"fccNavigate('personal')\")
     for test_width in [320,390,430,768,1440]:
      p.set_viewport_size({'width':test_width,'height':844});p.wait_for_timeout(50)
      check(tag+' personal lock does not cover subtitle '+str(test_width),p.evaluate(\"\"\"()=>{const a=document.querySelector('#page-personal > .fcc-lock-area').getBoundingClientRect(),b=document.querySelector('#page-personal > .pagehead p').getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom}\"\"\"))
     p.set_viewport_size({'width':width,'height':height});p.wait_for_timeout(4200)
     # Capture the implemented website, including both themes and real module content."""
if new not in s:
 assert s.count(old)==1,'Capture test changed; reconcile first.'
 p.write_text(s.replace(old,new,1))
print('Applied lock/subtitle layout correction and responsive overlap regression.')
