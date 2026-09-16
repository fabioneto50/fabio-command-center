"""Idempotent post-capture refinement; no browser or personal data is read."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def change(name,old,new):
 p=root/name;s=p.read_text()
 if new in s:return
 assert s.count(old)==1,(name,'source changed; reconcile first')
 p.write_text(s.replace(old,new,1))
# Existing area-navigation sources are already committed. Refine the visual system.
change('fcc-design.css','background:var(--bg)!important;-webkit-text-size-adjust:100%;','color-scheme:dark!important;background:var(--bg)!important;-webkit-text-size-adjust:100%;')
change('fcc-design.css','--bg:#f3f6fa;--bg-soft:#edf2f7;','color-scheme:light!important;--bg:#f3f6fa;--bg-soft:#edf2f7;')
change('fcc-design.css','html[data-fcc-design] body{background:var(--bg)!important;','html[data-fcc-design][data-fcc-theme] body{background:var(--bg)!important;')
change('fcc-design.css','font-weight:600;transition:background .16s,color .16s}', 'font-weight:600;transition:none}')
change('fcc-design.css','html[data-fcc-design] body .btn{display:inline-flex;','html[data-fcc-design] body .btn{transition:border-color .15s,box-shadow .15s;display:inline-flex;')
change('fcc-design.css','background:var(--panel-2)!important;border-color:var(--line-strong)!important;border-radius:12px;padding:11px 12px;box-shadow:none}','background:var(--panel-2)!important;border-color:var(--line-strong)!important;border-radius:12px;padding:11px 12px;box-shadow:none;transition:border-color .14s}')
extra="""
/* Post-capture review: retain visible controls, clearer status and one active navigation item. */
html[data-fcc-design] body .page.active{animation:none}
html[data-fcc-design] body input:is([type=checkbox],[type=radio]){min-height:24px;height:24px;min-width:24px;width:24px;padding:0;border-radius:5px;accent-color:var(--clinical)}
html[data-fcc-design] body .clin-valid label{display:flex;gap:10px;align-items:center;min-height:48px;padding:12px;border-radius:12px;background:var(--panel-2)!important;border-color:var(--line)!important}
html[data-fcc-design] body .fcc-lock-area{position:absolute;right:0;top:0;float:none!important;margin:0!important;z-index:2;min-width:44px;min-height:44px}
html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead h2{padding-right:125px}
html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead>.badge{margin-right:115px}
html[data-fcc-design] body .fcc-storage-status{padding:8px 13px;border:1px solid var(--line);box-shadow:0 3px 18px #061b3310;border-radius:12px;width:max-content;max-width:calc(100vw - 32px);left:auto;right:16px}
html[data-fcc-design] body .fcc-storage-status[data-state=error]{border-color:var(--danger);color:var(--danger);font-weight:600}
html[data-fcc-design] body .fcc-usage-notice{padding:12px 15px;background:var(--panel)!important;color:var(--muted)!important}
html[data-fcc-design] body .fcc-usage-notice>strong{display:block;color:var(--text);font-size:13px;line-height:1.5;font-weight:600}
html[data-fcc-design] body .fcc-usage-notice summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:13px!important;gap:8px;color:var(--clinical)}
html[data-fcc-design] body .fcc-usage-notice summary:before{content:'+';font-size:18px;width:12px}
html[data-fcc-design] body .fcc-usage-notice details[open] summary:before{content:'−'}
html[data-fcc-design] body .fcc-usage-notice summary::-webkit-details-marker{display:none}
html[data-fcc-design] body .fcc-usage-notice details>p{font-size:13px!important;line-height:1.6!important;margin:0 0 4px;color:var(--muted)}
@media(min-width:921px){html[data-fcc-design] body .card.half :is(.form3,.form4){grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:920px){
 html[data-fcc-design] body .app{padding-top:max(12px,env(safe-area-inset-top,0px))!important}
 html[data-fcc-design] body .fcc-lock-area>span{display:none}
 html[data-fcc-design] body .fcc-lock-area{padding:10px!important;width:44px}
 html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead h2{padding-right:60px}
 html[data-fcc-design] body .page:has(>.fcc-lock-area)>.pagehead>.badge{margin-right:0}
 html[data-fcc-design] body .fcc-storage-status{left:50%;right:auto;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 32px)}
}
"""
p=root/'fcc-design.css'
if '/* Post-capture review:' not in p.read_text():p.write_text(p.read_text()+extra)
# Only successful-save feedback expires. Errors and pending saves stay visible.
change('fcc-ui.js',"window.addEventListener('fcc-storage-status',e=>{", "let saveNoticeTimer;\n window.addEventListener('fcc-storage-status',e=>{")
change('fcc-ui.js',"const d=e.detail||{},el=status();el.dataset.state=d.status;", "const d=e.detail||{},el=status();clearTimeout(saveNoticeTimer);el.hidden=d.status==='locked';el.dataset.state=d.status;")
change('fcc-ui.js',"if(d.status==='error')el.setAttribute('role','alert');else el.setAttribute('role','status');", "if(d.status==='error'){el.setAttribute('role','alert');el.setAttribute('aria-live','assertive');}else{el.setAttribute('role','status');el.setAttribute('aria-live','polite');}\n  if(d.status==='saved')saveNoticeTimer=setTimeout(()=>{if(el.dataset.state==='saved')el.hidden=true;},4000);")
extraJS="""
 function refineAreaChrome(){
  document.querySelectorAll('.fcc-lock-area').forEach(button=>{
   if(button.dataset.fccStyled)return;button.dataset.fccStyled='1';button.setAttribute('aria-label','Bloquear área pessoal');button.title='Bloquear área pessoal';button.innerHTML=FCCAreas.icon('lock')+'<span>Bloquear</span>';
  });
 }
 refineAreaChrome();document.addEventListener('fcc-page-change',refineAreaChrome);document.addEventListener('fcc-module-ready',refineAreaChrome);
 const notice=document.querySelector('#page-clinical > .notice');
 if(notice&&!notice.dataset.fccStyled){
  const full=notice.textContent;notice.dataset.fccStyled='1';notice.classList.add('fcc-usage-notice');notice.innerHTML='<strong>Apoio à decisão, não prescrição. Não substitui a avaliação clínica nem o protocolo local.</strong><details><summary>Limites de utilização</summary><p></p></details>';notice.querySelector('p').textContent=full;
  // The duplicated badge is replaced by the same boundary in the always-visible notice.
  document.querySelector('#page-clinical > .pagehead > .badge')?.remove();
 }
"""
p=root/'fcc-appearance.js'
if 'function refineAreaChrome' not in p.read_text():p.write_text(p.read_text().replace(' orderSettings();',extraJS+'\n orderSettings();',1))
# Test the real theme renderer, including native color schemes and labels.
change('tests/audit-browser.py',"page.evaluate('(t)=>{document.documentElement.dataset.fccTheme=t}',theme);screenshot(page,prefix+'-vent-'+theme)","page.evaluate('(t)=>fccSetTheme(t,false)',theme);page.wait_for_timeout(200);screenshot(page,prefix+'-vent-'+theme)")
change('tests/audit-design.py',"p.evaluate('(t)=>document.documentElement.dataset.fccTheme=t',theme)","if p.evaluate('document.documentElement.dataset.fccTheme')!=theme:p.locator('#fccThemeQuick').click()\n      p.wait_for_function('(t)=>document.documentElement.dataset.fccTheme===t&&getComputedStyle(document.documentElement).colorScheme.includes(t)',arg=theme)\n      check(tag+' '+theme+' native color scheme and real toggle',p.locator('#fccThemeQuick').inner_text()==('Escuro' if theme=='light' else 'Claro'))")
change('tests/audit-design.py',"p.screenshot(path=str(OUT/f'{tag}-design-{area}-{theme}.png'),full_page=False)","p.wait_for_timeout(200);p.screenshot(path=str(OUT/f'{tag}-design-{area}-{theme}.png'),full_page=False,animations='disabled')")
change('tests/audit-design.py',"# Every common text color must reach 4.5:1 on its actual design surface.","p.locator('#fccSystemStatus').scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'{tag}-design-system-{theme}.png'),animations='disabled')\n      # Every common text color must reach 4.5:1 on its actual design surface.")
change('tests/audit-design.py',"for w in [320,430,768]:", " p.evaluate(\"fccNavigate('clinical',{sub:'clin-vent'})\");p.wait_for_timeout(200)\n      p.locator('#vMode').scroll_into_view_if_needed()\n      rendered=p.evaluate(\"\"\"()=>['#vMode','#vSex','#vHeight','#globalSearch'].map(q=>{const e=document.querySelector(q),s=getComputedStyle(e);return {selector:q,color:s.color,background:s.backgroundColor,scheme:s.colorScheme}})\"\"\")\n      import re\n      for style in rendered:\n       def rgbhex(v):\n        nums=[int(float(x)) for x in re.findall(r'[0-9.]+',v)[:3]];return '#'+''.join(f'{x:02x}' for x in nums)\n       a,b=sorted([lum(rgbhex(style['color'])),lum(rgbhex(style['background']))]);ratio=(b+.05)/(a+.05);check(tag+' '+theme+' actual input contrast '+style['selector'],ratio>=4.5,{**style,'ratio':round(ratio,2)})\n      check(tag+' '+theme+' checkbox not expanded',p.evaluate(\"[...document.querySelectorAll('#clin-vent input[type=checkbox]')].every(e=>e.getBoundingClientRect().height===24)\"))\n      p.screenshot(path=str(OUT/f'{tag}-design-form-{theme}.png'),animations='disabled')\n      check(tag+' safety decision boundary always visible',p.locator('.fcc-usage-notice>strong').is_visible())\n      p.locator('.fcc-usage-notice summary').click();check(tag+' full original safety statement available',p.locator('.fcc-usage-notice details>p').is_visible() and 'prescrição automática' in p.locator('.fcc-usage-notice details>p').inner_text());p.locator('.fcc-usage-notice summary').click()\n     # Success notices expire; pending saves and errors must remain visible.\n     p.evaluate(\"window.dispatchEvent(new CustomEvent('fcc-storage-status',{detail:{status:'saved'}}))\");check(tag+' saved notice shown',p.locator('#fccSaveStatus').is_visible());p.wait_for_timeout(4200);check(tag+' saved notice no longer overlays navigation',not p.locator('#fccSaveStatus').is_visible())\n     p.evaluate(\"window.dispatchEvent(new CustomEvent('fcc-storage-status',{detail:{status:'error',error:'Synthetic design check'}}))\");check(tag+' save error remains visible',p.locator('#fccSaveStatus').is_visible() and p.locator('#fccSaveStatus').get_attribute('role')=='alert');p.evaluate(\"window.dispatchEvent(new CustomEvent('fcc-storage-status',{detail:{status:'locked'}}))\")\n     for w in [320,430,768]:")
print('Verified post-capture refinements applied; full browser audit follows.')
