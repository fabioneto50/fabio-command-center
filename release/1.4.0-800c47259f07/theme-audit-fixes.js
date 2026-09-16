(()=>{
  if(window.__fccThemeAuditFixesInstalled)return;
  window.__fccThemeAuditFixesInstalled=true;
  const st=document.createElement('style');
  st.id='fcc-light-theme-audit-v2';
  st.textContent=`
  html[data-fcc-theme="light"]{color-scheme:light}
  html[data-fcc-theme="light"] body,html[data-fcc-theme="light"] main,html[data-fcc-theme="light"] .page{color:var(--text)!important}

  /* Core surfaces */
  html[data-fcc-theme="light"] .item,
  html[data-fcc-theme="light"] .health,
  html[data-fcc-theme="light"] .source-row,
  html[data-fcc-theme="light"] .check,
  html[data-fcc-theme="light"] .step,
  html[data-fcc-theme="light"] .clin-valid label,
  html[data-fcc-theme="light"] .casechoice,
  html[data-fcc-theme="light"] .tablewrap,
  html[data-fcc-theme="light"] .search,
  html[data-fcc-theme="light"] .result{
    background:#fff!important;border-color:#d5e1e6!important;color:#1b343e!important
  }
  html[data-fcc-theme="light"] .source-row b,
  html[data-fcc-theme="light"] .health b,
  html[data-fcc-theme="light"] .item strong,
  html[data-fcc-theme="light"] .casechoice,
  html[data-fcc-theme="light"] td{color:#1b343e!important}
  html[data-fcc-theme="light"] .source-row p,
  html[data-fcc-theme="light"] .health span,
  html[data-fcc-theme="light"] .item span,
  html[data-fcc-theme="light"] .tiny,
  html[data-fcc-theme="light"] .result .subtext{color:#687e88!important}
  html[data-fcc-theme="light"] .testpass{background:#edf8f2!important;border-color:#abd7c1!important}
  html[data-fcc-theme="light"] .testfail{background:#fff0f1!important;border-color:#e0b0b4!important}
  html[data-fcc-theme="light"] .expiry-badge{background:#fff8e9!important;border-color:#ddc78f!important;color:#835d16!important}

  /* Section headings that had fixed dark-theme text colours */
  html[data-fcc-theme="light"] #page-clinical .pagehead h2,
  html[data-fcc-theme="light"] #page-clinical .metric{color:#145f79!important}
  html[data-fcc-theme="light"] #page-emergency .pagehead h2{color:#805712!important}
  html[data-fcc-theme="light"] #page-comms .pagehead h2{color:#1f754e!important}
  html[data-fcc-theme="light"] #page-garage .pagehead h2{color:#355f74!important}
  html[data-fcc-theme="light"] #page-research .pagehead h2{color:#594cad!important}
  html[data-fcc-theme="light"] #page-settings .pagehead h2,
  html[data-fcc-theme="light"] #page-expenses .pagehead h2{color:#203c47!important}

  /* Status / semantic components */
  html[data-fcc-theme="light"] .oknote{background:#edf8f2!important;border-color:#abd7c1!important;color:#286d4f!important}
  html[data-fcc-theme="light"] .tele{background:#eff9f4!important;border-color:#b4dbc7!important}
  html[data-fcc-theme="light"] .tele b{color:#216f4c!important}
  html[data-fcc-theme="light"] .tele span{color:#608273!important}
  html[data-fcc-theme="light"] .casechoice:hover{background:#f2f7f9!important;border-color:#aac1ca!important}
  html[data-fcc-theme="light"] .casechoice.correct{background:#edf8f2!important;border-color:#9bcdb3!important;color:#235f46!important}
  html[data-fcc-theme="light"] .casechoice.wrong{background:#fff0f1!important;border-color:#dba5aa!important;color:#8e3942!important}

  /* Mobile sticky navigation / tabs */
  @media(max-width:920px){
    html[data-fcc-theme="light"] .side{background:rgba(255,255,255,.96)!important;border-color:#cfdde3!important;box-shadow:0 14px 40px rgba(38,65,77,.16)!important}
    html[data-fcc-theme="light"] .tabs{background:linear-gradient(180deg,rgba(247,250,251,.98),rgba(247,250,251,.94))!important}
  }

  /* Category navigation + organizer */
  html[data-fcc-theme="light"] .fcc-category-sheet,
  html[data-fcc-theme="light"] .fcc-org-box{background:linear-gradient(160deg,#fff,#f6fafb)!important;border-color:#cbdce3!important;color:#1b343e!important}
  html[data-fcc-theme="light"] .fcc-subitem,
  html[data-fcc-theme="light"] .fcc-org-item,
  html[data-fcc-theme="light"] .fcc-organize-trigger,
  html[data-fcc-theme="light"] .fcc-org-move button{background:#f8fbfc!important;border-color:#d6e3e8!important;color:#27414c!important}
  html[data-fcc-theme="light"] .fcc-subitem small,
  html[data-fcc-theme="light"] .fcc-org-item small{color:#6d8189!important}

  /* Perfusions */
  html[data-fcc-theme="light"] .perf-dil-card,
  html[data-fcc-theme="light"] .perf-collapsible,
  html[data-fcc-theme="light"] .perf-toolbar,
  html[data-fcc-theme="light"] .perf-panel-head{background:#fff!important;border-color:#d5e2e7!important;color:#1b343e!important}
  html[data-fcc-theme="light"] .perf-safety{background:#fff9ec!important;border-color:#dfcb9f!important;color:#745a24!important}
  html[data-fcc-theme="light"] .perf-dil-code{background:#e8f6fa!important;border-color:#b9dce6!important;color:#176f8f!important}
  html[data-fcc-theme="light"] .perf-dil-main,
  html[data-fcc-theme="light"] .perf-dil-conc,
  html[data-fcc-theme="light"] .perf-dil-line,
  html[data-fcc-theme="light"] .perf-local-line{background:#f7fafb!important;border-color:#dbe5e9!important;color:#203943!important}
  html[data-fcc-theme="light"] .perf-source,
  html[data-fcc-theme="light"] .perf-dose-toggle{background:#f5f9fb!important;border-color:#cadde4!important;color:#176783!important}

  /* IV compatibility */
  html[data-fcc-theme="light"] .ivc-result,
  html[data-fcc-theme="light"] .ivc-source,
  html[data-fcc-theme="light"] .ivsrc-panel,
  html[data-fcc-theme="light"] .ivsrc-row,
  html[data-fcc-theme="light"] .ivcat-card{background:#fff!important;border-color:#d5e2e7!important;color:#1b343e!important}
  html[data-fcc-theme="light"] .ivc-empty,
  html[data-fcc-theme="light"] .ivc-policy>div{background:#f8fbfc!important;border-color:#d9e4e8!important;color:#27414b!important}
  html[data-fcc-theme="light"] .ivsrc-link,
  html[data-fcc-theme="light"] .ivcat-sources a{background:#f5f9fb!important;border-color:#d3e1e6!important;color:#285063!important}

  /* Material */
  html[data-fcc-theme="light"] .material-toolbar,
  html[data-fcc-theme="light"] .material-frame-card{background:#fff!important;border-color:#d5e2e7!important}
  html[data-fcc-theme="light"] .material-help{background:#fff9ec!important;border-color:#dfcb9f!important;color:#745a24!important}
  html[data-fcc-theme="light"] .material-frame-head{background:#f8fbfc!important;border-color:#dce6ea!important}

  /* Expenses */
  html[data-fcc-theme="light"] .exp-kpi,
  html[data-fcc-theme="light"] .exp-rule,
  html[data-fcc-theme="light"] .exp-recurring{background:#fff!important;border-color:#d5e2e7!important;color:#1b343e!important}
  html[data-fcc-theme="light"] .exp-track,
  html[data-fcc-theme="light"] .exp-budget-progress{background:#edf3f5!important;border-color:#d4e0e5!important}
  html[data-fcc-theme="light"] .exp-cat-chip{background:#eaf6fa!important;border-color:#bddbe5!important;color:#176c89!important}

  /* Dialogs / overlays / toast */
  html[data-fcc-theme="light"] .modalbox,
  html[data-fcc-theme="light"] .family-pin-box{background:#fff!important;border-color:#cfdee4!important;color:#1b343e!important}
  html[data-fcc-theme="light"] .toast{background:#fff!important;border-color:#bcd0d8!important;color:#27414b!important;box-shadow:0 12px 35px rgba(31,62,76,.15)!important}

  /* Links and buttons inside light cards */
  html[data-fcc-theme="light"] .source-row .btn,
  html[data-fcc-theme="light"] .item .btn,
  html[data-fcc-theme="light"] .health .btn{background:#fff!important;color:#29414b!important;border-color:#cbd9df!important}
  `;
  document.head.appendChild(st);
})();