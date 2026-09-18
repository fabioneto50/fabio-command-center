"""Fix confirmed WebKit native-select overflow without clipping clinical content."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
css='''
/* WebKit: replaced native selects retain intrinsic text overflow, even at width:1px.
   The A/B selects are data adapters behind labelled inputs; remove only those boxes.
   Visible category selects keep their native popup and keyboard operation. */
html[data-fcc-design] body #clin-ivcompat select.ivc-native-hidden{display:none!important}
html[data-fcc-design] body #clin-ivcompat select:not(.ivc-native-hidden){
 min-width:0;max-width:100%;width:100%;box-sizing:border-box;
 appearance:none;-webkit-appearance:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
 padding-inline-end:36px;
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='m4 6 4 4 4-4' fill='none' stroke='%236b8796' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")!important;
 background-repeat:no-repeat!important;background-position:right 12px center!important;background-size:16px 16px!important;
}
html[data-fcc-design] body #clin-ivcompat .ivcat-filter>label{min-width:0;max-width:100%}
'''
p=root/'fcc-design.css';text=p.read_text()
if css not in text:p.write_text(text+css)
# Regression exercises the actual selectable category, not only empty pickers.
addition='''     # A narrow WebKit select must not push the document wider than its CSS box.
     for size in [320,430]:
      p.set_viewport_size({'width':size,'height':844});nav(p,'clin-ivcompat');p.wait_for_selector('#ivcatCategory')
      category=p.locator('#ivcatCategory');longest=category.evaluate("e=>[...e.options].sort((a,b)=>b.textContent.length-a.textContent.length)[0].value")
      category.select_option(longest)
      check(tag+str(size)+' long category selection preserved',category.input_value()==longest)
      check(tag+str(size)+' native dropdown has no intrinsic overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
      check(tag+str(size)+' both real drug inputs remain accessible',p.locator('#clin-ivcompat .ivc-combo>input:visible').count()==2)
      check(tag+str(size)+' hidden select adapters not focusable',p.locator('#clin-ivcompat select.ivc-native-hidden').evaluate_all('es=>es.length===2&&es.every(e=>getComputedStyle(e).display===\"none\")'))
      category.select_option(index=0)
      first=p.locator('#clin-ivcompat .ivc-combo>input').first;first.fill('Noradrenalina');first.press('ArrowDown');first.press('Enter')
      p.wait_for_function("document.getElementById('ivcDrugA').value==='Noradrenalina'")
      check(tag+str(size)+' labelled picker still updates hidden adapter',p.locator('#ivcDrugA').input_value()=='Noradrenalina')
      check(tag+str(size)+' selected drug and menu fit document',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
'''
p=root/'tests/audit-compact-interactions.py';text=p.read_text()
anchor="     p.set_viewport_size({'width':w,'height':h})\n     nav(p,'clin-drugs')"
if addition not in text:
 assert text.count(anchor)==1,'Reconcile source: regression anchor changed'
 p.write_text(text.replace(anchor,addition+anchor))
print('Corrected confirmed native-select overflow; added category and keyboard-picker regressions.')
