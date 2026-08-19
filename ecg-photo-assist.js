(()=>{
  if(window.__fccEcgPhotoAssistInstalled)return;
  window.__fccEcgPhotoAssistInstalled=true;
  let objectUrl='';

  function addStyles(){
    if(document.getElementById('ecg-photo-style'))return;
    const s=document.createElement('style');s.id='ecg-photo-style';s.textContent=`
      .ecgp-card{grid-column:1/-1;border:1px solid rgba(98,212,255,.22);background:var(--panel);border-radius:17px;padding:15px}.ecgp-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.ecgp-head h3{margin:0;font-size:17px}.ecgp-head p{margin:4px 0 0;color:var(--muted);font-size:9px;line-height:1.5}.ecgp-grid{display:grid;grid-template-columns:minmax(240px,.9fr) minmax(300px,1.4fr);gap:12px;margin-top:12px}.ecgp-upload{border:1px dashed var(--line-strong);border-radius:14px;padding:12px;background:var(--panel-2)}.ecgp-upload input{margin-top:7px}.ecgp-preview{min-height:220px;border:1px solid var(--line);border-radius:14px;background:var(--panel-2);display:grid;place-items:center;overflow:hidden;position:relative}.ecgp-preview img{max-width:100%;max-height:520px;display:block}.ecgp-placeholder{color:var(--muted);font-size:9px;padding:20px;text-align:center}.ecgp-quality{display:grid;gap:6px;margin-top:9px}.ecgp-check{border:1px solid var(--line);border-radius:11px;padding:8px 9px;font-size:9px;background:var(--panel-2)}.ecgp-check.good{border-color:rgba(114,227,167,.35)}.ecgp-check.warn{border-color:rgba(242,185,94,.38)}.ecgp-check.bad{border-color:rgba(255,123,134,.38)}.ecgp-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ecgp-note{margin-top:10px;border:1px solid rgba(242,185,94,.28);background:rgba(242,185,94,.06);border-radius:12px;padding:10px;font-size:9px;line-height:1.55;color:var(--text)}
      html[data-fcc-theme="light"] .ecgp-upload,html[data-fcc-theme="light"] .ecgp-preview,html[data-fcc-theme="light"] .ecgp-check{background:#fff!important}
      @media(max-width:780px){.ecgp-grid{grid-template-columns:1fr}.ecgp-preview{min-height:170px}}
    `;document.head.appendChild(s);
  }

  function qualityHTML(rows){return rows.map(x=>`<div class="ecgp-check ${x.level}"><b>${x.icon} ${x.title}</b><div class="tiny" style="margin-top:3px">${x.text}</div></div>`).join('')}

  function analyseImage(img){
    const rows=[];const w=img.naturalWidth,h=img.naturalHeight;
    rows.push(w>=1200&&h>=700?{level:'good',icon:'✓',title:'Resolução',text:`${w} × ${h}px · adequada para revisão visual.`}:{level:'warn',icon:'!',title:'Resolução',text:`${w} × ${h}px · tenta fotografar com maior resolução e sem zoom digital.`});
    rows.push(w>=h?{level:'good',icon:'✓',title:'Orientação',text:'Imagem em formato horizontal.'}:{level:'warn',icon:'!',title:'Orientação',text:'A fotografia está vertical; roda/captura o ECG na horizontal se possível.'});
    try{
      const c=document.createElement('canvas');c.width=80;c.height=80;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,80,80);const d=ctx.getImageData(0,0,80,80).data;let sum=0,sum2=0,n=0;for(let i=0;i<d.length;i+=4){const y=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];sum+=y;sum2+=y*y;n++}const mean=sum/n,sd=Math.sqrt(Math.max(0,sum2/n-mean*mean));
      if(mean<45)rows.push({level:'warn',icon:'!',title:'Luminosidade',text:'Imagem muito escura; melhora a iluminação sem criar reflexos.'});else if(mean>235)rows.push({level:'warn',icon:'!',title:'Luminosidade',text:'Imagem muito clara/sobre-exposta; evita reflexos no papel/ecrã.'});else rows.push({level:'good',icon:'✓',title:'Luminosidade',text:'Luminosidade global aceitável.'});
      rows.push(sd>=28?{level:'good',icon:'✓',title:'Contraste',text:'Contraste global suficiente para revisão visual.'}:{level:'warn',icon:'!',title:'Contraste',text:'Contraste baixo; aproxima a câmara e garante foco nas grelhas e traçados.'});
    }catch(e){}
    rows.push({level:'good',icon:'i',title:'Âmbito',text:'A app consegue avaliar a qualidade da fotografia e manter o analisador estruturado. A interpretação clínica automática da imagem exige um modelo/backend dedicado e não é simulada localmente.'});
    return rows;
  }

  function clear(){
    const input=document.getElementById('ecgPhotoInput'),preview=document.getElementById('ecgPhotoPreview'),quality=document.getElementById('ecgPhotoQuality');if(input)input.value='';if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=''}if(preview)preview.innerHTML='<div class="ecgp-placeholder">Fotografa ou escolhe um ECG de 12 derivações.</div>';if(quality)quality.innerHTML='';
  }

  function onFile(file){
    if(!file||!file.type.startsWith('image/'))return;
    if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);
    const preview=document.getElementById('ecgPhotoPreview');preview.innerHTML='';const img=document.createElement('img');img.alt='Pré-visualização do ECG';img.onload=()=>{document.getElementById('ecgPhotoQuality').innerHTML=qualityHTML(analyseImage(img))};img.src=objectUrl;preview.appendChild(img);
  }

  function install(){
    const host=document.getElementById('clin-ecg');if(!host||host.dataset.photoAssist==='1')return false;addStyles();host.dataset.photoAssist='1';
    const grid=host.querySelector(':scope > .grid')||host.querySelector('.grid');if(!grid)return false;
    const card=document.createElement('div');card.className='ecgp-card';card.innerHTML=`<div class="ecgp-head"><div><h3>ECG por fotografia</h3><p>Carrega ou fotografa o ECG. A app verifica primeiro a qualidade da imagem e mantém a interpretação estruturada logo abaixo.</p></div><span class="badge warn">Assistência visual</span></div><div class="ecgp-grid"><div><div class="ecgp-upload"><b style="font-size:10px">Fotografia do ECG</b><div class="tiny" style="margin-top:4px">Ideal: 12 derivações completas, imagem horizontal, sem reflexos, foco nítido e grelha visível.</div><input id="ecgPhotoInput" type="file" accept="image/*" capture="environment"><div class="ecgp-actions"><button type="button" class="btn" id="ecgPhotoClear">Remover imagem</button><button type="button" class="btn primary" id="ecgStructuredJump">Analisador estruturado ↓</button></div></div><div id="ecgPhotoQuality" class="ecgp-quality"></div></div><div><div id="ecgPhotoPreview" class="ecgp-preview"><div class="ecgp-placeholder">Fotografa ou escolhe um ECG de 12 derivações.</div></div><div class="ecgp-note"><b>Importante:</b> esta versão estática não executa um modelo clínico sobre a fotografia. Não vou apresentar uma interpretação automática falsa. A fotografia fica apenas no browser e serve de apoio visual ao analisador estruturado. Para interpretação automática real por imagem será necessário ligar este módulo a um backend/modelo dedicado.</div></div></div>`;
    grid.insertBefore(card,grid.firstChild);
    const structured=card.nextElementSibling;if(structured)structured.classList.add('ecg-structured-card');
    document.getElementById('ecgPhotoInput').addEventListener('change',e=>onFile(e.target.files?.[0]));document.getElementById('ecgPhotoClear').addEventListener('click',clear);document.getElementById('ecgStructuredJump').addEventListener('click',()=>document.querySelector('.ecg-structured-card')?.scrollIntoView({behavior:'smooth',block:'start'}));
    return true;
  }

  let n=0;const run=()=>{n++;if(install()||n>30)return;setTimeout(run,150)};run();
})();