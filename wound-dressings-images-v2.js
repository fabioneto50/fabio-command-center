(()=>{
  if(window.__fccWoundDressingImagesV9Installed)return;
  window.__fccWoundDressingImagesV9Installed=true;
  const load=()=>{
    if(window.__fccWoundMediaModelV2Installed){window.FCCDressingMedia?.refresh?.();return}
    const s=document.createElement('script');
    s.src='./wound-dressings-media-model-v1.js?v=3.0';
    s.async=false;
    s.onload=()=>window.FCCDressingMedia?.refresh?.();
    s.onerror=()=>console.error('FCC modular wound media model v3 failed to load');
    document.head.appendChild(s);
  };
  load();
})();
