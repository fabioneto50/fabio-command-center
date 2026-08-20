(()=>{
  if(window.__fccGlobalTypographyV2Installed)return;
  window.__fccGlobalTypographyV2Installed=true;

  const style=document.createElement('style');
  style.id='fcc-global-typography-v2-style';
  style.textContent=`
    /* Global readability scale */
    body{font-size:16px}
    .brand h1{font-size:18px!important}
    body .pagehead h2{font-size:31px!important}
    body .card h3{font-size:16px!important;line-height:1.3}
    body h4{font-size:14px!important;line-height:1.35}

    body p,body li,body dd,body dt{font-size:14px!important;line-height:1.62}
    body label{font-size:13px!important;line-height:1.45}
    body input,body textarea,body select{font-size:14px!important;line-height:1.45}
    body .btn,body .nav{font-size:14px!important}
    body .btn.small,body .tab{font-size:13px!important}
    body .pill,body .badge,body .master-chip,body .eyebrow{font-size:11px!important}
    body small,body .tiny{font-size:11.5px!important;line-height:1.5}
    body th,body td{font-size:13px!important;line-height:1.5}
    body summary{font-size:13px!important;line-height:1.5}
    body code{font-size:12px!important}
    body .notice,body .advice,body .redflag{font-size:13px!important;line-height:1.62}
    body .result .subtext{font-size:13px!important;line-height:1.58}
    body .item strong,body .check strong{font-size:13px!important}
    body .item span,body .check span{font-size:12px!important;line-height:1.5}
    body .step{font-size:12px!important}
    body .search-hit b{font-size:14px!important}
    body .search-hit span{font-size:12px!important}
    body .brand p{font-size:11px!important}
    body .hero p,body .card p,body .pagehead p{font-size:14px!important}
    body .metric small{font-size:11px!important}

    /* Runtime navigation / Personal */
    body .fcc-sheet-eyebrow{font-size:11px!important}
    body .fcc-subcode{font-size:12px!important}
    body .fcc-subitem strong{font-size:14px!important}
    body .fcc-subitem small{font-size:12px!important}
    body .fcc-organize-trigger{font-size:13px!important}
    body .fcc-org-head p{font-size:13px!important}
    body .fcc-org-item strong{font-size:13px!important}
    body .fcc-org-item small{font-size:12px!important}
    body .personal-area-code{font-size:12px!important}
    body .personal-area-count{font-size:11px!important}
    body .personal-area p{font-size:13px!important}
    body .personal-mini-tabs span{font-size:11px!important}
    body .personal-note{font-size:12px!important}

    /* Medication / dilution runtime content */
    body .fcc-code-inline{font-size:11px!important;line-height:1.45!important}
    body .fcc-code-inline span{font-size:10px!important}
    body .fcc-med-ref-links .btn{font-size:12px!important}
    body .fcc-known-codes>summary{font-size:12px!important}
    body .fcc-known-title{font-size:12px!important}
    body .fcc-code-note{font-size:11px!important;line-height:1.55!important}
    body .fcc-code-row b{font-size:12px!important}
    body .fcc-code-row small{font-size:11px!important}
    body .fcc-code-row code{font-size:12px!important}

    /* Spacing for larger type */
    body .tab{padding:10px 12px!important}
    body .nav{padding:11px 11px!important}
    body .btn{padding-top:10px;padding-bottom:10px}
    body .item,body .check{padding:12px!important}

    @media(max-width:640px){
      body{font-size:16px}
      .brand h1{font-size:17px!important}
      body .pagehead h2{font-size:27px!important}
      body .card h3{font-size:16px!important}
      body p,body li,body dd,body dt{font-size:14px!important}
      body label{font-size:13px!important}
      body input,body textarea,body select,body .btn,body .nav{font-size:14px!important}
      body .tab{font-size:13px!important}
      body .pill,body .badge,body .master-chip,body .eyebrow{font-size:11px!important}
      body small,body .tiny{font-size:11.5px!important}
      body th,body td{font-size:13px!important}
    }
  `;
  document.head.appendChild(style);
})();
