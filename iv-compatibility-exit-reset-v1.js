(()=>{
  if(window.__fccIVCompatibilityExitResetV1Installed)return;
  window.__fccIVCompatibilityExitResetV1Installed=true;
  function active(){const p=document.getElementById('page-clinical'),h=document.getElementById('clin-ivcompat');return !!(p?.classList.contains('active')&&h?.classList.contains('active'))}
  function clear(){const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB'),out=document.getElementById('ivcResult');if(A)A.value='';if(B)B.value='';document.querySelectorAll('#clin-ivcompat .ivc-combo input').forEach(i=>i.value='');document.querySelectorAll('#clin-ivcompat .ivc-suggest').forEach(x=>x.classList.remove('open'));if(out)out.innerHTML='<div class="ivc-empty"><strong>Seleciona dois fármacos</strong><p>O resultado só é classificado quando existem referências suficientes para o par.</p></div>'}
  function install(){const p=document.getElementById('page-clinical'),h=document.getElementById('clin-ivcompat');if(!p||!h)return false;let was=active();const check=()=>{const now=active();if(was&&!now)clear();was=now};const ob=new MutationObserver(check);ob.observe(p,{attributes:true,attributeFilter:['class']});ob.observe(h,{attributes:true,attributeFilter:['class']});document.addEventListener('fcc-subtab-change',check);return true}
  let tries=0;const boot=()=>{tries++;if(install()||tries>70)return;setTimeout(boot,120)};boot();
})();
