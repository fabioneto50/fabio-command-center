"""Correct narrow-screen intrinsic sizing; no clinical data or private storage changes."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
css='''
/* Narrow module grids must shrink to their container, not to a checkbox label's intrinsic width. */
html[data-fcc-design] body .page[data-fcc-compact="1"] #clin-perf .perf-toolbar.ccd-toolbar-stacked{grid-template-columns:minmax(0,1fr)!important;min-width:0;max-width:100%}
html[data-fcc-design] body .page[data-fcc-compact="1"] #clin-perf :is(.ccd-search-row,.ccd-filter-row,.ccd-search-row .search){min-width:0;max-width:100%;box-sizing:border-box}
html[data-fcc-design] body .page[data-fcc-compact="1"] #clin-perf .ccd-search-row .search input{min-width:0;flex:1 1 0;max-width:100%}
html[data-fcc-design] body .page[data-fcc-compact="1"] #clin-perf .ccd-filter-row .badge{min-width:0;max-width:100%;white-space:normal!important;text-align:left}
html[data-fcc-design] body .page[data-fcc-compact="1"] #clin-perf .ccd-filter-row input[type="checkbox"]{flex:0 0 auto}
@media(max-width:760px){
 html[data-fcc-design] body .page[data-fcc-compact="1"] #clin-perf .ccd-filter-row{grid-template-columns:minmax(0,1fr)!important}
 html[data-fcc-design] body .fcc-module-info>summary{font-size:13px!important}
}
'''
p=root/'fcc-design.css';s=p.read_text()
if css not in s:p.write_text(s+css)
def edit(name,old,new):
 p=root/name;s=p.read_text()
 if new in s:return
 assert s.count(old)==1,(name,'Source changed; reconcile before editing')
 p.write_text(s.replace(old,new,1))
edit('fcc-medications.js',"if(focus)document.querySelector('#med4Results h3')?.focus({preventScroll:true});", "if(focus){window.scrollTo({top:0,behavior:'instant'});document.querySelector('#med4Results h3')?.focus({preventScroll:true});}")
edit('tests/audit-compact-interactions.py',"nav(p,sub);check(tag+str(size)+sub+' reading layout reflows',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and not p.locator('#page-clinical>.pagehead').is_visible())", """nav(p,sub)
       geometry=p.evaluate('''()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,wide:[...document.querySelectorAll('.page.active *')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).slice(0,12).map(x=>({tag:x.tagName,id:x.id,class:x.className,right:x.getBoundingClientRect().right,width:x.getBoundingClientRect().width}))})''')
       check(tag+str(size)+sub+' reading layout reflows',geometry['scrollWidth']<=geometry['width']+1 and not p.locator('#page-clinical>.pagehead').is_visible(),geometry)""")
edit('tests/audit-compact-interactions.py',"p.set_viewport_size({'width':w,'height':h});nav(p,page='personal');", """p.set_viewport_size({'width':w,'height':h})
     nav(p,'clin-drugs');p.locator('#med4Search').fill('');p.wait_for_function(\"document.querySelectorAll('#med4Results [data-med4]').length===36\")
     last=p.locator('#med4Results [data-med4]').last;name=last.get_attribute('data-med4');last.scroll_into_view_if_needed()
     check(tag+' long catalogue scroll exercised',p.evaluate('scrollY')>300)
     last.click();p.wait_for_selector('#med4Results h3');p.wait_for_function('scrollY<5')
     check(tag+' selecting from far down opens readable heading',p.locator('#med4Results h3').inner_text()==name and p.evaluate('scrollY')<5)
     p.locator('#fccMedBack').click();check(tag+' long list restored after reading',p.locator('#med4Search').is_visible())
     nav(p,page='personal');""")
print('Intrinsic sizing and explicit medication reading position corrected; reflow assertion preserved.')
