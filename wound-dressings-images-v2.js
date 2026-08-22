(()=>{
  if(window.__fccWoundDressingImagesV8Installed)return;
  window.__fccWoundDressingImagesV8Installed=true;
  const load=()=>{
    if(window.__fccWoundMediaModelV1Installed){window.FCCDressingMedia?.refresh?.();return}
    const s=document.createElement('script');s.src='./wound-dressings-media-model-v1.js?v=1.0';s.async=false;s.onload=()=>window.FCCDressingMedia?.refresh?.();s.onerror=()=>console.error('FCC modular wound media model failed to load');document.head.appendChild(s);
  };
  load();
})();
