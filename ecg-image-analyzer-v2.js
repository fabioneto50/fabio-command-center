(()=>{
  if(window.__fccEcgImageAnalyzerV2Installed)return;
  window.__fccEcgImageAnalyzerV2Installed=true;

  const LEAD_LAYOUT_3X4=[
    ['I','aVR','V1','V4'],
    ['II','aVL','V2','V5'],
    ['III','aVF','V3','V6']
  ];
  let currentFile=null,currentBitmap=null,lastAnalysis=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const median=a=>{const x=a.filter(Number.isFinite).sort((m,n)=>m-n);if(!x.length)return NaN;const k=Math.floor(x.length/2);return x.length%2?x[k]:(x[k-1]+x[k])/2};
  const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN;
  const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1))};
  const mad=a=>{const m=median(a);return median(a.map(x=>Math.abs(x-m)))};

  function addStyles(){
    if(document.getElementById('ecg-analyzer-v2-style'))return;
    const s=document.createElement('style');s.id='ecg-analyzer-v2-style';s.textContent=`
      .ecga-card{grid-column:1/-1;border:1px solid rgba(98,212,255,.24);background:var(--panel);border-radius:17px;padding:15px}.ecga-head{display:flex;gap:12px;align-items:flex-start}.ecga-head h3{margin:0;font-size:18px}.ecga-head p{margin:4px 0 0;color:var(--muted);font-size:9px;line-height:1.55}.ecga-head .spacer{flex:1}.ecga-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:11px}.ecga-confirm{grid-column:1/-1;border:1px solid var(--line);border-radius:12px;background:var(--panel-2);padding:9px 10px;display:flex;gap:8px;align-items:flex-start;font-size:9px;line-height:1.45}.ecga-confirm input{width:auto;margin-top:2px}.ecga-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.ecga-gate{margin-top:10px;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:10px}.ecga-gate.good{border-color:rgba(114,227,167,.36)}.ecga-gate.warn{border-color:rgba(242,185,94,.4)}.ecga-gate.bad{border-color:rgba(255,123,134,.4)}.ecga-gate strong{font-size:10px}.ecga-gate p{margin:4px 0 0;font-size:8px;line-height:1.5;color:var(--muted)}.ecga-results{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.ecga-kpi{border:1px solid var(--line);background:var(--panel-2);border-radius:13px;padding:10px}.ecga-kpi small{display:block;color:var(--muted);font-size:7px;text-transform:uppercase;letter-spacing:.08em}.ecga-kpi strong{display:block;font-size:18px;margin-top:4px}.ecga-kpi span{display:block;color:var(--muted);font-size:8px;margin-top:3px}.ecga-findings{margin-top:10px;display:grid;gap:7px}.ecga-finding{border:1px solid var(--line);border-radius:12px;padding:9px 10px;background:var(--panel-2);font-size:9px;line-height:1.5}.ecga-finding.good{border-color:rgba(114,227,167,.3)}.ecga-finding.warn{border-color:rgba(242,185,94,.36)}.ecga-finding.bad{border-color:rgba(255,123,134,.36)}.ecga-leads{margin-top:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.ecga-lead{border:1px solid var(--line);border-radius:11px;padding:8px;background:var(--panel-2)}.ecga-lead b{font-size:9px}.ecga-lead span{display:block;color:var(--muted);font-size:7px;margin-top:3px}.ecga-canvas-wrap{margin-top:10px;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:8px;overflow:auto}.ecga-canvas-wrap canvas{display:block;width:100%;min-width:620px;height:190px}.ecga-note{margin-top:10px;border:1px solid rgba(242,185,94,.3);background:rgba(242,185,94,.055);border-radius:12px;padding:10px;font-size:8px;line-height:1.55}.ecga-progress{margin-top:8px;height:5px;border-radius:999px;background:var(--panel-2);overflow:hidden;display:none}.ecga-progress span{display:block;height:100%;width:0;background:var(--clinical);transition:width .2s}.ecga-statusline{font-size:8px;color:var(--muted);margin-top:6px}.ecga-hidden{display:none!important}
      html[data-fcc-theme="light"] .ecga-confirm,html[data-fcc-theme="light"] .ecga-gate,html[data-fcc-theme="light"] .ecga-kpi,html[data-fcc-theme="light"] .ecga-finding,html[data-fcc-theme="light"] .ecga-lead,html[data-fcc-theme="light"] .ecga-canvas-wrap{background:#fff!important}
      @media(max-width:850px){.ecga-controls,.ecga-results{grid-template-columns:repeat(2,1fr)}.ecga-leads{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.ecga-controls,.ecga-results,.ecga-leads{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function install(){
    const host=document.getElementById('clin-ecg');if(!host)return false;
    const photo=document.querySelector('.ecgp-card');if(!photo||document.getElementById('ecgAnalyzerV2'))return false;
    addStyles();
    const card=document.createElement('section');card.id='ecgAnalyzerV2';card.className='ecga-card';
    card.innerHTML=`<div class="ecga-head"><div><h3>Analisador do traçado ECG</h3><p>Digitalização local da fotografia + análise quantitativa conservadora. Só apresenta resultados quando a imagem, calibração e extração passam os controlos de qualidade.</p></div><div class="spacer"></div><span class="badge warn">Experimental · fail-closed</span></div>
      <div class="ecga-controls">
        <label>Formato<select id="ecgaLayout"><option value="3x4r">3×4 + tira de ritmo II</option><option value="3x4">3×4 sem tira de ritmo</option></select></label>
        <label>Velocidade<select id="ecgaSpeed"><option value="25">25 mm/s</option><option value="50">50 mm/s</option></select></label>
        <label>Ganho<select id="ecgaGain"><option value="10">10 mm/mV</option><option value="5">5 mm/mV</option><option value="20">20 mm/mV</option></select></label>
        <label>Derivação de ritmo<select id="ecgaRhythm"><option value="II">II</option><option value="I">I</option><option value="V1">V1</option></select></label>
        <label class="ecga-confirm"><input id="ecgaConfirmCalibration" type="checkbox"><span><b>Confirmo a calibração impressa no ECG</b><br>Confirma visualmente velocidade e ganho no próprio traçado. Sem esta confirmação, a app não calcula intervalos/amplitudes.</span></label>
      </div>
      <div class="ecga-actions"><button id="ecgaRun" class="btn primary" type="button">Analisar traçado</button><button id="ecgaReset" class="btn" type="button">Limpar análise</button></div>
      <div class="ecga-progress" id="ecgaProgress"><span></span></div><div id="ecgaStatus" class="ecga-statusline">Carrega primeiro uma fotografia do ECG.</div>
      <div id="ecgaGate"></div><div id="ecgaOutput"></div>
      <div class="ecga-note"><b>Limite de segurança:</b> este módulo faz digitalização e medições locais, mas não é um dispositivo médico validado e não substitui a leitura do ECG original. Não confirma STEMI, FA, Brugada ou outras entidades apenas pela fotografia. Quando a confiança é insuficiente, o resultado é bloqueado em vez de estimado.</div>`;
    photo.after(card);
    const input=document.getElementById('ecgPhotoInput');
    input?.addEventListener('change',e=>{currentFile=e.target.files?.[0]||null;currentBitmap=null;reset(false);setStatus(currentFile?'Imagem pronta para análise. Confirma formato/calibração e prime “Analisar traçado”.':'Carrega primeiro uma fotografia do ECG.')});
    document.getElementById('ecgaRun').onclick=run;
    document.getElementById('ecgaReset').onclick=()=>reset(true);
    return true;
  }

  function setStatus(t){const el=document.getElementById('ecgaStatus');if(el)el.textContent=t}
  function progress(v){const p=document.getElementById('ecgaProgress'),s=p?.querySelector('span');if(!p||!s)return;p.style.display=v>0&&v<100?'block':'none';s.style.width=clamp(v,0,100)+'%'}
  function reset(clearFile=false){lastAnalysis=null;document.getElementById('ecgaGate')?.replaceChildren();document.getElementById('ecgaOutput')?.replaceChildren();progress(0);if(clearFile){currentFile=null;currentBitmap=null;const i=document.getElementById('ecgPhotoInput');if(i)i.value='';const q=document.getElementById('ecgPhotoQuality');if(q)q.innerHTML='';const p=document.getElementById('ecgPhotoPreview');if(p)p.innerHTML='<div class="ecgp-placeholder">Fotografa ou escolhe um ECG de 12 derivações.</div>';setStatus('Carrega primeiro uma fotografia do ECG.')}}

  async function bitmapFromFile(file){
    if(currentBitmap)return currentBitmap;
    if('createImageBitmap'in window){currentBitmap=await createImageBitmap(file);return currentBitmap}
    currentBitmap=await new Promise((resolve,reject)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('image'))};im.src=u});return currentBitmap;
  }

  function drawScaled(bitmap,maxW=1800,maxH=1300){
    const scale=Math.min(1,maxW/bitmap.width,maxH/bitmap.height);const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,w,h);return {canvas:c,ctx,w,h,data:ctx.getImageData(0,0,w,h)};
  }

  function imageStats(img){
    const d=img.data.data;let sum=0,sum2=0,n=0,redish=0,dark=0;
    for(let i=0;i<d.length;i+=16){const r=d[i],g=d[i+1],b=d[i+2],y=.2126*r+.7152*g+.0722*b;sum+=y;sum2+=y*y;n++;if(r>g*1.08&&r>b*1.08&&r>100)redish++;if(y<150)dark++}
    const m=sum/n,s=Math.sqrt(Math.max(0,sum2/n-m*m));return {mean:m,sd:s,redFrac:redish/n,darkFrac:dark/n};
  }

  function projection(img,axis,mode='grid'){
    const {width:w,height:h,data}=img.data;const arr=new Float32Array(axis==='x'?w:h),cnt=new Uint32Array(arr.length);
    const step=axis==='x'?Math.max(1,Math.floor(h/450)):Math.max(1,Math.floor(w/450));
    if(axis==='x'){
      for(let x=0;x<w;x++)for(let y=0;y<h;y+=step){const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],Y=.2126*r+.7152*g+.0722*b,ch=Math.max(r,g,b)-Math.min(r,g,b);let s=0;if(mode==='grid')s=(r>g*1.05&&r>b*1.05&&r>90)?Math.max(0,r-(g+b)/2):Math.max(0,155-Y)*.15;else s=Math.max(0,190-Y)*(ch<55?1:.25);arr[x]+=s;cnt[x]++}
    }else{
      for(let y=0;y<h;y++)for(let x=0;x<w;x+=step){const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],Y=.2126*r+.7152*g+.0722*b,ch=Math.max(r,g,b)-Math.min(r,g,b);let s=0;if(mode==='grid')s=(r>g*1.05&&r>b*1.05&&r>90)?Math.max(0,r-(g+b)/2):Math.max(0,155-Y)*.15;else s=Math.max(0,190-Y)*(ch<55?1:.25);arr[y]+=s;cnt[y]++}
    }
    for(let i=0;i<arr.length;i++)arr[i]/=Math.max(1,cnt[i]);return arr;
  }

  function autocorrPeriod(arr,expected,minLag=3,maxLag=40){
    const n=arr.length,m=mean(Array.from(arr)),x=Array.from(arr,v=>v-m),energy=x.reduce((s,v)=>s+v*v,0)||1;const peaks=[];
    maxLag=Math.min(maxLag,Math.floor(n/8));
    for(let lag=minLag;lag<=maxLag;lag++){let s=0;for(let i=0;i<n-lag;i++)s+=x[i]*x[i+lag];const c=s/energy;peaks.push({lag,c})}
    peaks.sort((a,b)=>{const da=Math.abs(a.lag-expected),db=Math.abs(b.lag-expected);const sa=a.c-.025*da,sb=b.c-.025*db;return sb-sa});
    const best=peaks[0]||{lag:0,c:0};return best;
  }

  function estimateCalibration(img,layout,speed){
    const w=img.canvas.width;const expected=Math.max(3,Math.min(18,(w*.92)/250));
    const px=autocorrPeriod(projection(img,'x','grid'),expected,3,Math.min(45,Math.round(expected*6)));
    const py=autocorrPeriod(projection(img,'y','grid'),expected,3,Math.min(45,Math.round(expected*6)));
    function normalize(p){if(!p.lag)return {v:0,c:0};let v=p.lag;if(v>expected*2.7&&v/5>2.5)v/=5;return {v,c:p.c}}
    const a=normalize(px),b=normalize(py);let value=median([a.v,b.v].filter(v=>v>0));
    const agreement=value?Math.abs(a.v-b.v)/value:1;const corr=(a.c+b.c)/2;const ratio=value/expected;
    const plausible=value>=2.5&&value<=22&&ratio>.45&&ratio<2.2;
    const confidence=plausible?clamp(.55*(corr/.35)+.45*(1-clamp(agreement,0,1)),0,1):0;
    return {pxPerMm:value,confidence,x:a,y:b,expected,agreement,speed};
  }

  function traceScore(data,w,x,y){
    const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],Y=.2126*r+.7152*g+.0722*b,ch=Math.max(r,g,b)-Math.min(r,g,b),neutral=1-clamp(ch/90,0,1);return Math.max(0,195-Y)*(.35+.65*neutral);
  }

  function extractTrace(img,rect){
    const {width:w,height:h,data}=img.data;const x0=clamp(Math.round(rect.x),0,w-1),y0=clamp(Math.round(rect.y),0,h-1),x1=clamp(Math.round(rect.x+rect.w),1,w),y1=clamp(Math.round(rect.y+rect.h),1,h);
    const left=x0+Math.round((x1-x0)*.08),right=x1-Math.round((x1-x0)*.025),top=y0+Math.round((y1-y0)*.09),bottom=y1-Math.round((y1-y0)*.09);
    const out=[],scores=[];let prev=Math.round((top+bottom)/2),found=0;
    for(let x=left;x<right;x++){
      let bestY=prev,best=-1;const range=Math.max(12,Math.round((bottom-top)*.44));const ya=Math.max(top,prev-range),yb=Math.min(bottom-1,prev+range);
      for(let y=ya;y<=yb;y++){const s=traceScore(data,w,x,y)-Math.abs(y-prev)*.28;if(s>best){best=s;bestY=y}}
      if(best>23){prev=bestY;found++}else{
        let global=-1,gy=prev;for(let y=top;y<bottom;y++){const s=traceScore(data,w,x,y)-Math.abs(y-prev)*.09;if(s>global){global=s;gy=y}}if(global>32){prev=gy;found++;best=global}
      }
      out.push(prev);scores.push(Math.max(0,best));
    }
    const sm=out.map((v,i)=>median(out.slice(Math.max(0,i-1),Math.min(out.length,i+2))));
    const baseline=median(sm),signal=sm.map(y=>baseline-y);const coverage=found/Math.max(1,out.length);const quality=clamp(coverage*.7+clamp((median(scores)-18)/35,0,1)*.3,0,1);
    return {signal,coverage,quality,left,right,top,bottom,baseline};
  }

  function layouts(w,h,layout){
    const mx=w*.035,my=h*.055,uw=w-2*mx,uh=h-2*my;const leads={};
    if(layout==='3x4r'){
      const topH=uh*.74,rowH=topH/3,colW=uw/4;
      for(let r=0;r<3;r++)for(let c=0;c<4;c++)leads[LEAD_LAYOUT_3X4[r][c]]={x:mx+c*colW,y:my+r*rowH,w:colW,h:rowH};
      leads.__rhythm={x:mx,y:my+topH,w:uw,h:uh-topH};
    }else{
      const rowH=uh/3,colW=uw/4;for(let r=0;r<3;r++)for(let c=0;c<4;c++)leads[LEAD_LAYOUT_3X4[r][c]]={x:mx+c*colW,y:my+r*rowH,w:colW,h:rowH};
    }
    return leads;
  }

  function movingAverage(a,n){n=Math.max(1,Math.round(n));const out=new Array(a.length),q=[];let sum=0;for(let i=0;i<a.length;i++){q.push(a[i]);sum+=a[i];if(q.length>n)sum-=q.shift();out[i]=sum/q.length}return out}
  function highpass(a,n){const ma=movingAverage(a,n);return a.map((v,i)=>v-ma[i])}

  function detectR(signal,fs){
    if(signal.length<Math.max(80,fs*1.2))return {peaks:[],quality:0};
    const hp=highpass(signal,fs*.55);const der=hp.map((v,i)=>i?Math.abs(v-hp[i-1]):0);const env=movingAverage(der.map(x=>x*x),Math.max(2,fs*.08));const med=median(env),M=mad(env)||1,threshold=med+Math.max(M*4,med*1.8);const candidates=[];let last=-1e9;
    for(let i=1;i<env.length-1;i++)if(env[i]>threshold&&env[i]>=env[i-1]&&env[i]>=env[i+1]&&i-last>fs*.24){let best=i,bv=0;const a=Math.max(0,i-Math.round(fs*.08)),b=Math.min(hp.length-1,i+Math.round(fs*.08));for(let j=a;j<=b;j++){const v=Math.abs(hp[j]);if(v>bv){bv=v;best=j}}candidates.push(best);last=best}
    const rr=candidates.slice(1).map((p,i)=>(p-candidates[i])/fs);const q=rr.length>=2?clamp(1-(sd(rr)/(mean(rr)||1)),0,1):rr.length?0.55:0;return {peaks:candidates,rr,hp,env,threshold,quality:q};
  }

  function qrsWidth(signal,peaks,fs){
    const hp=highpass(signal,fs*.5),d=hp.map((v,i)=>i?Math.abs(v-hp[i-1]):0),widths=[];
    for(const p of peaks){const lo=Math.max(1,p-Math.round(fs*.14)),hi=Math.min(d.length-2,p+Math.round(fs*.16));let pk=0;for(let i=lo;i<=hi;i++)pk=Math.max(pk,d[i]);if(pk<=0)continue;const th=pk*.18;let a=p,b=p;while(a>lo&&d[a]>th)a--;while(b<hi&&d[b]>th)b++;const ms=(b-a)/fs*1000;if(ms>=45&&ms<=220)widths.push(ms)}
    return {value:median(widths),spread:sd(widths),n:widths.length};
  }

  function stEstimate(signal,peaks,fs,pxPerMm,gain){
    if(peaks.length<2||!pxPerMm||!gain)return {mv:NaN,n:0};const q=qrsWidth(signal,peaks,fs);if(!Number.isFinite(q.value))return {mv:NaN,n:0};const vals=[];
    for(const p of peaks){const preA=Math.max(0,p-Math.round(fs*.22)),preB=Math.max(0,p-Math.round(fs*.12));if(preB<=preA)continue;const base=median(signal.slice(preA,preB));const j=p+Math.round(fs*(q.value/2000));const st=j+Math.round(fs*.06);if(st>=signal.length)continue;const amp=signal[st]-base;vals.push(amp/pxPerMm/gain)}
    return {mv:median(vals),n:vals.length,qrs:q.value};
  }

  function analyseLead(trace,fs,cal,gain){
    const r=detectR(trace.signal,fs),q=qrsWidth(trace.signal,r.peaks,fs),st=stEstimate(trace.signal,r.peaks,fs,cal.pxPerMm,gain);return {trace,r,qrs:q,st};
  }

  function renderGate(level,title,text){const g=document.getElementById('ecgaGate');g.innerHTML=`<div class="ecga-gate ${level}"><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`}

  function drawRhythm(trace,r,fs){
    const wrap=document.createElement('div');wrap.className='ecga-canvas-wrap';const c=document.createElement('canvas');c.width=1100;c.height=190;wrap.appendChild(c);const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);const s=trace.signal;if(!s.length)return wrap;const max=Math.max(8,...s.map(v=>Math.abs(v))),mid=c.height/2,pad=12;ctx.lineWidth=1.5;ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--clinical').trim()||'#62d4ff';ctx.beginPath();for(let i=0;i<s.length;i++){const x=pad+i/(s.length-1)*(c.width-2*pad),y=mid-s[i]/max*(mid-pad);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--warn').trim()||'#f2b95e';for(const p of r.peaks){const x=pad+p/(s.length-1)*(c.width-2*pad);ctx.fillRect(x-1,7,2,10)}ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()||'#81949e';ctx.font='11px sans-serif';ctx.fillText(`Traçado digitalizado · ${fs.toFixed(0)} amostras/s · marcadores = QRS detetados`,12,c.height-8);return wrap;
  }

  function renderResults(a){
    const out=document.getElementById('ecgaOutput');const hr=a.hr,rrcv=a.rrCv,qrs=a.rhythm.qrs.value;const findings=[];
    if(hr<50)findings.push({level:'warn',t:'Frequência baixa',x:`FC estimada ${hr.toFixed(0)} bpm. Confirmar no ECG original e no contexto clínico.`});
    else if(hr>100)findings.push({level:'warn',t:'Frequência elevada',x:`FC estimada ${hr.toFixed(0)} bpm. Confirmar no ECG original e no contexto clínico.`});
    else findings.push({level:'good',t:'Frequência',x:`FC estimada dentro de 50–100 bpm (${hr.toFixed(0)} bpm).`});
    if(rrcv>.18)findings.push({level:'warn',t:'RR irregular',x:`Variabilidade RR elevada (CV ${(rrcv*100).toFixed(0)}%). Isto não confirma fibrilhação auricular; ondas P e traçado original têm de ser revistos.`});
    else findings.push({level:'good',t:'RR',x:`Intervalos RR relativamente regulares (CV ${(rrcv*100).toFixed(0)}%).`});
    if(Number.isFinite(qrs))findings.push({level:qrs>=120?'warn':'good',t:'QRS estimado',x:`Duração mediana aproximada ${qrs.toFixed(0)} ms${qrs>=120?' (QRS largo; confirmar manualmente).':''}`});
    const stLeads=a.leads.filter(x=>Number.isFinite(x.st.mv)&&x.st.n>=2&&Math.abs(x.st.mv)>=.15).sort((x,y)=>Math.abs(y.st.mv)-Math.abs(x.st.mv));
    if(stLeads.length)findings.push({level:'warn',t:'Desvio ST mensurável',x:`A digitalização encontrou desvio ST aproximado ≥0,15 mV em ${stLeads.slice(0,6).map(x=>`${x.name} (${x.st.mv>0?'+':''}${x.st.mv.toFixed(2)} mV)`).join(', ')}. Não equivale a diagnóstico de SCA/STEMI; confirmar pontos J/ST diretamente no ECG.`});
    else findings.push({level:'good',t:'ST automático',x:'Não foi identificado desvio ST ≥0,15 mV com confiança suficiente nas derivações analisáveis. Isto não exclui isquemia ou oclusão coronária.'});

    const leadCards=a.leads.map(l=>`<div class="ecga-lead"><b>${esc(l.name)}</b><span>extração ${(l.trace.quality*100).toFixed(0)}% · QRS ${Number.isFinite(l.qrs.value)?l.qrs.value.toFixed(0)+' ms':'—'} · ST ${Number.isFinite(l.st.mv)?(l.st.mv>0?'+':'')+l.st.mv.toFixed(2)+' mV':'—'}</span></div>`).join('');
    out.innerHTML=`<div class="ecga-results"><div class="ecga-kpi"><small>Frequência</small><strong>${hr.toFixed(0)} bpm</strong><span>${a.rhythm.r.peaks.length} complexos detetados</span></div><div class="ecga-kpi"><small>RR</small><strong>${rrcv<=.08?'Regular':rrcv>.18?'Irregular':'Variável'}</strong><span>CV ${(rrcv*100).toFixed(1)}%</span></div><div class="ecga-kpi"><small>QRS</small><strong>${Number.isFinite(qrs)?qrs.toFixed(0)+' ms':'—'}</strong><span>${Number.isFinite(qrs)&&qrs>=120?'aprox. largo':'estimativa automática'}</span></div><div class="ecga-kpi"><small>Calibração</small><strong>${a.cal.pxPerMm.toFixed(1)} px/mm</strong><span>confiança ${(a.cal.confidence*100).toFixed(0)}%</span></div></div><div class="ecga-findings">${findings.map(f=>`<div class="ecga-finding ${f.level}"><b>${esc(f.t)}</b><div>${esc(f.x)}</div></div>`).join('')}</div><div class="ecga-leads">${leadCards}</div>`;
    out.appendChild(drawRhythm(a.rhythm.trace,a.rhythm.r,a.fs));
  }

  async function run(){
    const file=currentFile||document.getElementById('ecgPhotoInput')?.files?.[0];if(!file){renderGate('bad','Análise bloqueada','Seleciona primeiro uma fotografia do ECG.');return}
    if(!document.getElementById('ecgaConfirmCalibration')?.checked){renderGate('bad','Análise bloqueada','Confirma no papel/ecrã a velocidade e o ganho antes de calcular medições.');return}
    const runBtn=document.getElementById('ecgaRun');runBtn.disabled=true;progress(8);setStatus('A preparar a imagem…');
    try{
      const bitmap=await bitmapFromFile(file);const img=drawScaled(bitmap);const stats=imageStats(img);progress(22);setStatus('A verificar grelha e calibração…');await new Promise(r=>setTimeout(r,0));
      const layout=document.getElementById('ecgaLayout').value,speed=Number(document.getElementById('ecgaSpeed').value),gain=Number(document.getElementById('ecgaGain').value);const cal=estimateCalibration(img,layout,speed);
      const hardFails=[];if(img.w<1100||img.h<600)hardFails.push('resolução insuficiente');if(stats.mean<45||stats.mean>242)hardFails.push('exposição inadequada');if(stats.sd<22)hardFails.push('contraste insuficiente');if(cal.confidence<.28)hardFails.push('grelha/calibração não reconhecida com confiança');
      if(hardFails.length){renderGate('bad','Análise clínica bloqueada',`Não vou estimar o ECG porque existem controlos de qualidade que falharam: ${hardFails.join(', ')}. Repete a fotografia de frente, sem reflexos, com a grelha completa visível.`);setStatus('Falha fechada: imagem/calibração insuficiente.');progress(100);return}
      progress(38);setStatus('A digitalizar as derivações…');await new Promise(r=>setTimeout(r,0));const rects=layouts(img.w,img.h,layout),leadResults=[];
      for(const [name,rect] of Object.entries(rects)){if(name==='__rhythm')continue;const trace=extractTrace(img,rect);const duration=2.5,fs=trace.signal.length/duration;const ana=analyseLead(trace,fs,cal,gain);leadResults.push({name,...ana})}
      let rhythmTrace, rhythmName=document.getElementById('ecgaRhythm').value;
      if(layout==='3x4r'&&rects.__rhythm)rhythmTrace=extractTrace(img,rects.__rhythm);else rhythmTrace=leadResults.find(x=>x.name===rhythmName)?.trace||leadResults.find(x=>x.name==='II')?.trace;
      const duration=layout==='3x4r'?10:2.5,fs=rhythmTrace.signal.length/duration,r=detectR(rhythmTrace.signal,fs),q=qrsWidth(rhythmTrace.signal,r.peaks,fs),rhythm={trace:rhythmTrace,r,qrs:q};progress(72);setStatus('A validar os complexos e as medições…');await new Promise(r=>setTimeout(r,0));
      const rhythmMin=layout==='3x4r'?5:2;if(rhythmTrace.quality<.45||r.peaks.length<rhythmMin||r.rr.length<1){renderGate('bad','Análise clínica bloqueada','O traçado de ritmo não foi digitalizado com qualidade suficiente ou não foram detetados complexos QRS suficientes. Revê o formato selecionado e repete a fotografia.');setStatus('Falha fechada: extração do traçado insuficiente.');progress(100);return}
      const rr=r.rr.filter(x=>x>.25&&x<2.5);if(!rr.length){renderGate('bad','Análise clínica bloqueada','Os intervalos RR detetados não são fisiologicamente plausíveis. Não é apresentado um resultado automático.');progress(100);return}
      const hr=60/median(rr),rrCv=sd(rr)/(mean(rr)||1);if(!(hr>=20&&hr<=250)){renderGate('bad','Análise clínica bloqueada','A frequência calculada é implausível para esta digitalização. Não é apresentado resultado.');progress(100);return}
      const leadQuality=mean(leadResults.map(x=>x.trace.quality));const confidence=clamp(.3*cal.confidence+.35*rhythmTrace.quality+.2*r.quality+.15*leadQuality,0,1);if(confidence<.42){renderGate('bad','Análise clínica bloqueada',`Confiança global ${(confidence*100).toFixed(0)}% — abaixo do limiar de segurança. Não apresento interpretação automática.`);progress(100);return}
      lastAnalysis={hr,rrCv,cal,stats,leads:leadResults,rhythm,fs,confidence,layout,speed,gain};renderGate(confidence>=.67?'good':'warn',confidence>=.67?'Análise quantitativa disponível':'Análise com confiança moderada',`Confiança global ${(confidence*100).toFixed(0)}%. Resultados são medições aproximadas da fotografia; confirmar sempre no ECG original.`);renderResults(lastAnalysis);setStatus('Análise concluída.');progress(100);
    }catch(e){console.error(e);renderGate('bad','Não foi possível analisar','O processamento da fotografia falhou. Nenhuma interpretação foi produzida.');setStatus('Erro no processamento.');progress(100)}finally{runBtn.disabled=false}
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>40)return;setTimeout(boot,150)};boot();
})();
