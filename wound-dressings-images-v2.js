(()=>{
  if(window.__fccWoundDressingImagesV10Installed)return;
  window.__fccWoundDressingImagesV10Installed=true;
  const load=()=>{
    if(window.__fccWoundMediaModelV3Installed){window.FCCDressingMedia?.refresh?.();return}
    const s=document.createElement('script');s.src='./wound-dressings-media-model-v1.js?v=4.0';s.async=false;
    s.onload=()=>window.FCCDressingMedia?.refresh?.();s.onerror=()=>console.error('FCC modular wound media model v4 failed to load');document.head.appendChild(s);
  };
  load();
})();
