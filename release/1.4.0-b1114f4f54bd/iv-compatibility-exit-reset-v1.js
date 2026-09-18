(()=>{
  if(window.__fccIVCompatibilityExitResetV2Installed)return;
  window.__fccIVCompatibilityExitResetV2Installed=true;
  function clear(){const A=document.getElementById('ivcDrugA'),B=document.getElementById('ivcDrugB'),out=document.getElementById('ivcResult');if(A)A.value='';if(B)B.value='';document.querySelectorAll('#clin-ivcompat .ivc-combo input').forEach(i=>i.value='');document.querySelectorAll('#clin-ivcompat .ivc-suggest').forEach(x=>x.classList.remove('open'));if(out)out.innerHTML='<div class="ivc-empty"><strong>Seleciona dois fármacos</strong><p>O resultado só é classificado quando existem referências suficientes para o par.</p></div>'}
  let was=false;
  const isActive=()=>!!(document.getElementById('page-clinical')?.classList.contains('active')&&document.getElementById('clin-ivcompat')?.classList.contains('active'));
  function sync(){const now=isActive();if(was&&!now)clear();was=now}
  document.addEventListener('fcc-subtab-change',sync);document.addEventListener('fcc-page-change',sync);was=isActive();
})();
