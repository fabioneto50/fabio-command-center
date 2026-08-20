(()=>{
  if(window.__fccGlobalTypographyV1Installed)return;
  window.__fccGlobalTypographyV1Installed=true;

  const style=document.createElement('style');
  style.id='fcc-global-typography-v1-style';
  style.textContent=`
    /* Global readability scale — headings intentionally unchanged */
    body{font-size:14px}
    body p,body li,body dd,body dt{font-size:12px!important;line-height:1.62}
    body label{font-size:11px!important;line-height:1.45}
    body input,body textarea,body select{font-size:12px!important;line-height:1.45}
    body .btn,body .nav{font-size:12px!important}
    body .btn.small,body .tab{font-size:11px!important}
    body .pill,body .badge,body .master-chip,body .eyebrow{font-size:10px!important}
    body small,body .tiny{font-size:10px!important;line-height:1.45}
    body th,body td{font-size:11px!important;line-height:1.48}
    body summary{font-size:11px!important;line-height:1.45}
    body code{font-size:10.5px!important}
    body .notice,body .advice,body .redflag{font-size:11px!important;line-height:1.62}
    body .result .subtext{font-size:11px!important;line-height:1.58}
    body .item strong,body .check strong{font-size:11px!important}
    body .item span,body .check span{font-size:10px!important;line-height:1.45}
    body .step{font-size:10px!important}
    body .search-hit b{font-size:12px!important}
    body .search-hit span{font-size:10px!important}
    body .brand p{font-size:10px!important}
    body .hero p,body .card p,body .pagehead p{font-size:12px!important}
    body .metric small{font-size:10px!important}

    /* Runtime navigation / Personal */
    body .fcc-sheet-eyebrow{font-size:10px!important}
    body .fcc-subcode{font-size:11px!important}
    body .fcc-subitem strong{font-size:12px!important}
    body .fcc-subitem small{font-size:10px!important}
    body .fcc-organize-trigger{font-size:11px!important}
    body .fcc-org-head p{font-size:11px!important}
    body .fcc-org-item strong{font-size:11px!important}
    body .fcc-org-item small{font-size:10px!important}
    body .personal-area-code{font-size:11px!important}
    body .personal-area-count{font-size:9px!important}
    body .personal-area p{font-size:11px!important}
    body .personal-mini-tabs span{font-size:9px!important}
    body .personal-note{font-size:10px!important}

    /* Medication / dilution runtime content */
    body .fcc-code-inline{font-size:9px!important;line-height:1.4!important}
    body .fcc-code-inline span{font-size:8px!important}
    body .fcc-med-ref-links .btn{font-size:10px!important}
    body .fcc-known-codes>summary{font-size:10px!important}
    body .fcc-known-title{font-size:10px!important}
    body .fcc-code-note{font-size:9px!important;line-height:1.5!important}
    body .fcc-code-row b{font-size:10px!important}
    body .fcc-code-row small{font-size:9px!important}
    body .fcc-code-row code{font-size:10px!important}

    /* Keep titles / display numbers exactly as designed */
    body h1,body h2,body h3,body h4,body h5,body h6,
    body .metric,body .result .big,body .code,body .logo{font-size:revert-layer}

    @media(max-width:640px){
      body{font-size:14px}
      body p,body li,body dd,body dt{font-size:12px!important}
      body input,body textarea,body select,body .btn,body .nav{font-size:12px!important}
      body .tab{font-size:11px!important}
    }
  `;
  document.head.appendChild(style);
})();
