(()=>{
  if(window.__fccThemeAutoV2Installed)return;
  window.__fccThemeAutoV2Installed=true;
  const KEY='fcc-theme-manual-until-v2';
  const autoTheme=()=>{const h=new Date().getHours();return h>=8&&h<20?'light':'dark'};
  function boundary(){const n=new Date(),d=new Date(n);const h=n.getHours();if(h<8)d.setHours(8,0,0,0);else if(h<20)d.setHours(20,0,0,0);else{d.setDate(d.getDate()+1);d.setHours(8,0,0,0)}return d.getTime()}
  function getOverride(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&(x.theme==='light'||x.theme==='dark')&&+x.until>Date.now())return x}catch(e){}localStorage.removeItem(KEY);return null}
  function setOverride(theme){localStorage.setItem(KEY,JSON.stringify({theme,until:boundary()}));status()}
  function apply(theme){if(typeof window.fccSetTheme==='function')window.fccSetTheme(theme);else{document.documentElement.dataset.fccTheme=theme;document.documentElement.style.colorScheme=theme}}
  function sync(){const o=getOverride();apply(o?.theme||autoTheme());status();schedule()}
  let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(()=>{localStorage.removeItem(KEY);sync()},Math.max(1000,boundary()-Date.now()+1200))}
  function status(){const s=document.getElementById('fccThemeStatus');if(!s)return;const o=getOverride(),theme=document.documentElement.dataset.fccTheme||autoTheme();const next=o?`${theme==='light'?'Modo claro':'Modo escuro'} ativo · alteração manual até ${new Date(o.until).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}`:`Automático · claro 08:00–20:00 · ${theme==='light'?'modo claro':'modo escuro'} ativo`;if(s.textContent!==next)s.textContent=next}
  function bind(){
    const q=document.getElementById('fccThemeQuick');if(q&&!q.dataset.autoBound){q.dataset.autoBound='1';q.addEventListener('click',()=>queueMicrotask(()=>setOverride(document.documentElement.dataset.fccTheme||autoTheme())))}
    document.querySelectorAll('[data-fcc-theme-choice]').forEach(b=>{if(b.dataset.autoBound)return;b.dataset.autoBound='1';b.addEventListener('click',()=>queueMicrotask(()=>setOverride(b.dataset.fccThemeChoice)))})
    const settings=document.getElementById('fccThemeSettings');if(settings&&!document.getElementById('fccThemeAutoHint')){const x=document.createElement('div');x.id='fccThemeAutoHint';x.className='tiny';x.style.marginTop='6px';x.textContent='Horário automático: claro 08:00–20:00 · escuro 20:00–08:00. Uma alteração manual mantém-se até à próxima mudança de horário.';settings.appendChild(x)}
    status();
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){bind();sync()}});window.addEventListener('pageshow',()=>{bind();sync()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();sync()},{once:true});else{bind();sync()}
  setTimeout(()=>{bind();sync()},250);setTimeout(bind,1000);
})();