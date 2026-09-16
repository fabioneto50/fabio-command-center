(()=>{
  if(window.__fccEcgImageAnalyzerV3Installed)return;
  window.__fccEcgImageAnalyzerV3Installed=true;

  let file=null,bitmap=null,last=null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN;
  const median=a=>{const x=a.filter(Number.isFinite).sort((a,b)=>a-b);if(!x.length)return NaN;const n=x.length,k=Math.floor(n/2);return n%2?x[k]:(x[k-1]+x[k])/2};
  const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
  const mad=a=>{const m=median(a);return median(a.map(v=>Math.abs(v-m)))};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const MAPS={
    '3x4r':{rows:3,cols:4,rhythm:true,map:[['I','aVR','V1','V4'],['II','aVL','V2','V5'],['III','aVF','V3','V6']]},
    '3x4':{rows:3,cols:4,rhythm:false,map:[['I','aVR','V1','V4'],['II','aVL','V2','V5'],['III','aVF','V3','V6']]},
    '6x2':{rows:6,cols:2,rhythm:false,map:[['I','V1'],['II','V2'],['III','V3'],['aVR','V4'],['aVL','V5'],['aVF','V6']]},
    '12x1':{rows:12,cols:1,rhythm:false,map:[['I'],['II'],['III'],['aVR'],['aVL'],['aVF'],['V1'],['V2'],['V3'],['V4'],['V5'],['V6']]}
  };

  function style(){
    if(document.getElementById('ecga-v3-style'))return;
    const s=document.createElement('style');s.id='ecga-v3-style';s.textContent=`
      #ecgAnalyzerV2{display:none!important}.ecg3{grid-column:1/-1;border:1px solid rgba(98,212,255,.25);background:var(--panel);border-radius:18px;padding:15px}.ecg3-head{display:flex;gap:12px;align-items:flex-start}.ecg3-head h3{margin:0;font-size:19px}.ecg3-head p{margin:4px 0 0;color:var(--muted);font-size:9px;line-height:1.5}.ecg3-head .spacer{flex:1}.ecg3-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:11px}.ecg3-confirm{grid-column:1/-1;display:flex;gap:8px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:9px 10px;background:var(--panel-2);font-size:9px;line-height:1.45}.ecg3-confirm input{width:auto;margin-top:2px}.ecg3-crop{grid-column:1/-1;border:1px solid var(--line);border-radius:12px;padding:9px;background:var(--panel-2)}.ecg3-crop summary{font-size:9px;font-weight:800;cursor:pointer}.ecg3-crop-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:8px}.ecg3-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.ecg3-status{margin-top:8px;font-size:8px;color:var(--muted)}.ecg3-progress{display:none;height:5px;border-radius:999px;background:var(--panel-2);overflow:hidden;margin-top:7px}.ecg3-progress span{display:block;height:100%;width:0;background:var(--clinical)}.ecg3-gate{margin-top:10px;border:1px solid var(--line);border-radius:13px;padding:10px;background:var(--panel-2)}.ecg3-gate.good{border-color:rgba(114,227,167,.35)}.ecg3-gate.warn{border-color:rgba(242,185,94,.42)}.ecg3-gate.bad{border-color:rgba(255,123,134,.42)}.ecg3-gate b{font-size:10px}.ecg3-gate p{font-size:8px;line-height:1.5;color:var(--muted);margin:4px 0 0}.ecg3-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}.ecg3-kpi{border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:10px}.ecg3-kpi small{display:block;color:var(--muted);font-size:7px;letter-spacing:.08em;text-transform:uppercase}.ecg3-kpi strong{display:block;font-size:17px;margin-top:4px}.ecg3-kpi span{display:block;color:var(--muted);font-size:7px;margin-top:3px}.ecg3-find{display:grid;gap:7px;margin-top:10px}.ecg3-find>div{border:1px solid var(--line);border-radius:12px;background:var(--panel-2);padding:9px 10px;font-size:9px;line-height:1.5}.ecg3-find .warn{border-color:rgba(242,185,94,.36)}.ecg3-find .bad{border-color:rgba(255,123,134,.36)}.ecg3-find .good{border-color:rgba(114,227,167,.3)}.ecg3-leads{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px}.ecg3-lead{border:1px solid var(--line);border-radius:10px;padding:7px;background:var(--panel-2)}.ecg3-lead b{font-size:8px}.ecg3-lead span{display:block;color:var(--muted);font-size:7px;margin-top:2px}.ecg3-wave{margin-top:9px;border:1px solid var(--line);border-radius:13px;background:var(--panel-2);padding:8px;overflow:auto}.ecg3-wave canvas{display:block;width:100%;min-width:620px;height:185px}.ecg3-note{margin-top:9px;border:1px solid rgba(242,185,94,.3);background:rgba(242,185,94,.055);border-radius:12px;padding:10px;font-size:8px;line-height:1.55}
      html[data-fcc-theme="light"] .ecg3-confirm,html[data-fcc-theme="light"] .ecg3-crop,html[data-fcc-theme="light"] .ecg3-gate,html[data-fcc-theme="light"] .ecg3-kpi,html[data-fcc-theme="light"] .ecg3-find>div,html[data-fcc-theme="light"] .ecg3-lead,html[data-fcc-theme="light"] .ecg3-wave{background:#fff!important}
      @media(max-width:900px){.ecg3-kpis{grid-template-columns:repeat(3,1fr)}.ecg3-leads{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.ecg3-controls,.ecg3-crop-grid,.ecg3-kpis,.ecg3-leads{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.ecg3-controls,.ecg3-crop-grid,.ecg3-kpis,.ecg3-leads{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function install(){
    const host=document.getElementById('clin-ecg'),photo=document.querySelector('.ecgp-card');if(!host||!photo||document.getElementById('ecgAnalyzerV3'))return false;
    style();
    const old=document.getElementById('ecgAnalyzerV2');if(old)old.style.display='none';
    const card=document.createElement('section');card.id='ecgAnalyzerV3';card.className='ecg3';card.innerHTML=`
      <div class="ecg3-head"><div><h3>Analisador ECG · 12 derivações</h3><p>Digitaliza o traçado localmente. Testa vários layouts, usa a grelha quando possível e pode recorrer à largura temporal do ECG quando a grelha não é reconhecida.</p></div><div class="spacer"></div><span class="badge warn">Experimental · validação obrigatória</span></div>
      <div class="ecg3-controls">
        <label>Layout<select id="ecg3Layout"><option value="auto">Detetar automaticamente</option><option value="3x4r">3×4 + tira de ritmo</option><option value="3x4">3×4</option><option value="6x2">6×2</option><option value="12x1">12×1</option></select></label>
        <label>Velocidade<select id="ecg3Speed"><option value="25">25 mm/s</option><option value="50">50 mm/s</option></select></label>
        <label>Ganho<select id="ecg3Gain"><option value="10">10 mm/mV</option><option value="5">5 mm/mV</option><option value="20">20 mm/mV</option></select></label>
        <label>Calibração<select id="ecg3CalMode"><option value="auto">Grelha + fallback largura</option><option value="width">Usar largura temporal</option><option value="grid">Exigir grelha</option></select></label>
        <label class="ecg3-confirm"><input type="checkbox" id="ecg3Confirm"><span><b>Confirmo velocidade e ganho impressos no ECG</b><br>Sem esta confirmação não são calculadas medidas temporais ou amplitudes.</span></label>
        <details class="ecg3-crop"><summary>Ajustar recorte se o ECG tiver cabeçalho/margens grandes</summary><div class="ecg3-crop-grid"><label>Topo %<input id="ecg3Top" type="number" min="0" max="35" step="1" value="6"></label><label>Fundo %<input id="ecg3Bottom" type="number" min="0" max="25" step="1" value="3"></label><label>Esquerda %<input id="ecg3Left" type="number" min="0" max="20" step="1" value="2"></label><label>Direita %<input id="ecg3Right" type="number" min="0" max="20" step="1" value="2"></label></div></details>
      </div>
      <div class="ecg3-actions"><button class="btn primary" id="ecg3Run" type="button">Analisar ECG</button><button class="btn" id="ecg3Reset" type="button">Limpar análise</button></div>
      <div class="ecg3-progress" id="ecg3Progress"><span></span></div><div class="ecg3-status" id="ecg3Status">Carrega uma fotografia de um ECG completo.</div><div id="ecg3Gate"></div><div id="ecg3Output"></div>
      <div class="ecg3-note"><b>Segurança:</b> a reconstrução a partir de fotografia pode falhar por perspetiva, grelha, impressora, artefactos e formato. O módulo mede e sinaliza padrões quantitativos; não confirma por si só STEMI, FA, Brugada ou outro diagnóstico. Rever sempre o ECG original.</div>`;
    photo.after(card);
    const inp=document.getElementById('ecgPhotoInput');inp?.addEventListener('change',e=>{file=e.target.files?.[0]||null;bitmap=null;clearOutput();status(file?'Imagem carregada. Confirma velocidade/ganho e analisa.':'Carrega uma fotografia de um ECG completo.')});
    document.getElementById('ecg3Run').onclick=run;document.getElementById('ecg3Reset').onclick=()=>{clearOutput();status('Análise limpa. A fotografia mantém-se carregada.')};
    return true;
  }

  function status(t){const e=document.getElementById('ecg3Status');if(e)e.textContent=t}
  function prog(v){const p=document.getElementById('ecg3Progress'),s=p?.querySelector('span');if(!p||!s)return;p.style.display=v>0&&v<100?'block':'none';s.style.width=clamp(v,0,100)+'%'}
  function clearOutput(){last=null;document.getElementById('ecg3Gate')?.replaceChildren();document.getElementById('ecg3Output')?.replaceChildren();prog(0)}
  function gate(level,title,text){const g=document.getElementById('ecg3Gate');if(g)g.innerHTML=`<div class="ecg3-gate ${level}"><b>${esc(title)}</b><p>${esc(text)}</p></div>`}
  const yieldUi=()=>new Promise(r=>setTimeout(r,0));

  async function getBitmap(f){
    if(bitmap)return bitmap;
    if(window.createImageBitmap){bitmap=await createImageBitmap(f);return bitmap}
    bitmap=await new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('image'))};im.src=u});return bitmap;
  }
  function toCanvas(b){
    const scale=Math.min(1,2100/b.width,1600/b.height),w=Math.max(1,Math.round(b.width*scale)),h=Math.max(1,Math.round(b.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(b,0,0,w,h);return {canvas:c,ctx,w,h,data:ctx.getImageData(0,0,w,h)};
  }
  function crop(img){
    const top=clamp(Number(document.getElementById('ecg3Top').value)||0,0,35)/100,bottom=clamp(Number(document.getElementById('ecg3Bottom').value)||0,0,25)/100,left=clamp(Number(document.getElementById('ecg3Left').value)||0,0,20)/100,right=clamp(Number(document.getElementById('ecg3Right').value)||0,0,20)/100;
    const x=Math.round(img.w*left),y=Math.round(img.h*top),w=Math.max(100,Math.round(img.w*(1-left-right))),h=Math.max(100,Math.round(img.h*(1-top-bottom))),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img.canvas,x,y,w,h,0,0,w,h);return {canvas:c,ctx,w,h,data:ctx.getImageData(0,0,w,h)};
  }
  function imageStats(img){
    const d=img.data.data;let n=0,sum=0,sum2=0,dark=0;for(let i=0;i<d.length;i+=16){const r=d[i],g=d[i+1],b=d[i+2],Y=.2126*r+.7152*g+.0722*b;sum+=Y;sum2+=Y*Y;n++;if(Y<180)dark++}const m=sum/n;return {mean:m,sd:Math.sqrt(Math.max(0,sum2/n-m*m)),dark:dark/n};
  }

  function gridProjection(img,axis){
    const {width:w,height:h,data}=img.data,N=axis==='x'?w:h,out=new Float32Array(N),count=new Uint32Array(N),step=3;
    if(axis==='x')for(let x=0;x<w;x++)for(let y=0;y<h;y+=step){const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],Y=.2126*r+.7152*g+.0722*b,red=r>g*1.04&&r>b*1.04&&r>100;out[x]+=red?Math.max(0,r-(g+b)/2):Math.max(0,175-Y)*.08;count[x]++}
    else for(let y=0;y<h;y++)for(let x=0;x<w;x+=step){const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],Y=.2126*r+.7152*g+.0722*b,red=r>g*1.04&&r>b*1.04&&r>100;out[y]+=red?Math.max(0,r-(g+b)/2):Math.max(0,175-Y)*.08;count[y]++}
    for(let i=0;i<N;i++)out[i]/=Math.max(1,count[i]);return out;
  }
  function corrAt(a,lag){const m=mean(Array.from(a));let num=0,den=0;for(let i=0;i<a.length-lag;i++){const x=a[i]-m,y=a[i+lag]-m;num+=x*y;den+=x*x}return den?num/den:0}
  function bestGridPeriod(img,fallback){
    const xs=gridProjection(img,'x'),ys=gridProjection(img,'y'),min=Math.max(2,Math.round(fallback*.45)),max=Math.min(40,Math.round(fallback*2.3));
    const evalOne=a=>{let best={p:0,c:-1};for(let p=min;p<=max;p++){const c=corrAt(a,p)-Math.abs(p-fallback)*.015;if(c>best.c)best={p,c}}return best};
    const x=evalOne(xs),y=evalOne(ys),p=median([x.p,y.p]);const agree=p?1-Math.min(1,Math.abs(x.p-y.p)/p):0,raw=(x.c+y.c)/2;return {pxPerMm:p,confidence:clamp(.65*Math.max(0,raw/.45)+.35*agree,0,1),x,y};
  }

  function pixelScore(data,w,x,y){
    const i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],Y=.2126*r+.7152*g+.0722*b,ch=Math.max(r,g,b)-Math.min(r,g,b),red=r>g*1.07&&r>b*1.07&&r>95,dark=Math.max(0,210-Y),neutral=1-clamp(ch/120,0,.85);let s=dark*(.35+.65*neutral);if(red)s*=.16;if(Y<85)s+=25;return s;
  }
  function extractTrace(img,rect){
    const {width:w,height:h,data}=img.data,x0=clamp(Math.round(rect.x),0,w-1),x1=clamp(Math.round(rect.x+rect.w),1,w),y0=clamp(Math.round(rect.y),0,h-1),y1=clamp(Math.round(rect.y+rect.h),1,h);
    const L=x0+Math.round((x1-x0)*.075),R=x1-Math.round((x1-x0)*.02),T=y0+Math.round((y1-y0)*.08),B=y1-Math.round((y1-y0)*.08),H=Math.max(1,B-T),out=[];let prev=Math.round((T+B)/2),found=0,scoreList=[];
    for(let x=L;x<R;x++){
      let bestY=prev,best=-Infinity;const jump=Math.max(10,Math.round(H*.24)),a=Math.max(T,prev-jump),b=Math.min(B-1,prev+jump);
      for(let y=a;y<=b;y++){let s=pixelScore(data,w,x,y);if(y>T)s+=.35*pixelScore(data,w,x,y-1);if(y<B-1)s+=.35*pixelScore(data,w,x,y+1);s-=Math.abs(y-prev)*.16;if(s>best){best=s;bestY=y}}
      if(best<15){let gb=-Infinity,gy=prev;for(let y=T;y<B;y++){const s=pixelScore(data,w,x,y)-Math.abs(y-prev)*.045;if(s>gb){gb=s;gy=y}}if(gb>best){best=gb;bestY=gy}}
      if(best>18)found++;prev=bestY;out.push(bestY);scoreList.push(best);
    }
    const sm=out.map((v,i)=>median(out.slice(Math.max(0,i-2),Math.min(out.length,i+3)))),base=median(sm),signal=sm.map(v=>base-v),coverage=found/Math.max(1,out.length),amp=mad(signal)*1.4826,quality=clamp(.55*coverage+.25*clamp((median(scoreList)-12)/50,0,1)+.20*clamp(amp/(H*.08),0,1),0,1);
    return {signal,quality,coverage,baseline:base,left:L,right:R,top:T,bottom:B};
  }

  function layoutRects(w,h,key){
    const def=MAPS[key],mx=w*.015,my=h*.015,uw=w-2*mx,uh=h-2*my,leads={},rhythmH=def.rhythm?uh*.22:0,mainH=uh-rhythmH,rowH=mainH/def.rows,colW=uw/def.cols;
    for(let r=0;r<def.rows;r++)for(let c=0;c<def.cols;c++){const name=def.map[r][c];leads[name]={x:mx+c*colW,y:my+r*rowH,w:colW,h:rowH}}
    if(def.rhythm)leads.__rhythm={x:mx,y:my+mainH,w:uw,h:rhythmH};return leads;
  }
  function moving(a,n){n=Math.max(1,Math.round(n));const o=new Array(a.length);let sum=0,q=[];for(let i=0;i<a.length;i++){q.push(a[i]);sum+=a[i];if(q.length>n)sum-=q.shift();o[i]=sum/q.length}return o}
  function highpass(a,n){const m=moving(a,n);return a.map((v,i)=>v-m[i])}
  function detectR(signal,fs){
    if(signal.length<Math.max(50,fs*.7))return {peaks:[],rr:[],quality:0,hp:signal};const hp=highpass(signal,fs*.55),d=hp.map((v,i)=>i?Math.abs(v-hp[i-1]):0),env=moving(d.map(v=>v*v),Math.max(2,fs*.07)),med=median(env),M=mad(env)||Math.max(1e-6,med*.3),th=med+Math.max(M*3.1,med*1.25),peaks=[];let last=-1e9;
    for(let i=1;i<env.length-1;i++)if(env[i]>=th&&env[i]>=env[i-1]&&env[i]>=env[i+1]&&i-last>fs*.22){let p=i,bv=0;for(let j=Math.max(0,i-Math.round(fs*.09));j<=Math.min(hp.length-1,i+Math.round(fs*.09));j++){const v=Math.abs(hp[j]);if(v>bv){bv=v;p=j}}peaks.push(p);last=p}
    const rr=peaks.slice(1).map((p,i)=>(p-peaks[i])/fs).filter(v=>v>.22&&v<3),q=rr.length>=2?clamp(1-sd(rr)/(mean(rr)||1),0,1):rr.length?0.5:0;return {peaks,rr,quality:q,hp,threshold:th};
  }
  function qrsWidth(signal,peaks,fs){
    if(!peaks.length)return NaN;const hp=highpass(signal,fs*.45),d=hp.map((v,i)=>i?Math.abs(v-hp[i-1]):0),vals=[];for(const p of peaks){let lo=Math.max(1,p-Math.round(fs*.14)),hi=Math.min(d.length-2,p+Math.round(fs*.16)),pk=0;for(let i=lo;i<=hi;i++)pk=Math.max(pk,d[i]);if(!pk)continue;const th=pk*.16;let a=p,b=p;while(a>lo&&d[a]>th)a--;while(b<hi&&d[b]>th)b++;const ms=(b-a)/fs*1000;if(ms>=35&&ms<=240)vals.push(ms)}return median(vals);
  }
  function st(signal,peaks,fs,pxmm,gain){
    const q=qrsWidth(signal,peaks,fs);if(!Number.isFinite(q)||peaks.length<1)return NaN;const vals=[];for(const p of peaks){const a=Math.max(0,p-Math.round(fs*.22)),b=Math.max(0,p-Math.round(fs*.10));if(b<=a)continue;const base=median(signal.slice(a,b)),j=p+Math.round(fs*q/2000),idx=j+Math.round(fs*.06);if(idx<signal.length)vals.push((signal[idx]-base)/(pxmm*gain))}return median(vals);
  }

  function analyseLayout(img,key,pxmm,speed,gain){
    const rects=layoutRects(img.w,img.h,key),fs=pxmm*speed,leads=[];for(const [name,rect] of Object.entries(rects)){if(name==='__rhythm')continue;const tr=extractTrace(img,rect),r=detectR(tr.signal,fs);leads.push({name,trace:tr,r,qrs:qrsWidth(tr.signal,r.peaks,fs),st:st(tr.signal,r.peaks,fs,pxmm,gain)})}
    let rhythm=null;if(rects.__rhythm){const tr=extractTrace(img,rects.__rhythm),r=detectR(tr.signal,fs);rhythm={name:'II · tira',trace:tr,r,qrs:qrsWidth(tr.signal,r.peaks,fs),st:st(tr.signal,r.peaks,fs,pxmm,gain)}}
    const usable=leads.filter(l=>l.trace.quality>=.24&&l.r.peaks.length>=1),rr=usable.flatMap(l=>l.r.rr),hrs=usable.map(l=>l.r.rr.length?60/median(l.r.rr):NaN).filter(v=>v>=20&&v<=250);if(rhythm?.trace.quality>=.26&&rhythm.r.rr.length){rr.push(...rhythm.r.rr);hrs.push(60/median(rhythm.r.rr))}
    const extraction=mean(leads.map(l=>l.trace.quality)),yieldScore=clamp(usable.length/8,0,1),rrScore=clamp(rr.length/8,0,1),score=.55*extraction+.25*yieldScore+.20*rrScore;return {key,leads,rhythm,usable,rr,hrs,extraction,score,fs};
  }

  function drawWave(a){
    const src=a.layout.rhythm?.trace.quality>=.25?a.layout.rhythm:a.layout.leads.filter(l=>l.trace.quality>=.24).sort((x,y)=>y.trace.quality-x.trace.quality)[0];if(!src)return null;const wrap=document.createElement('div');wrap.className='ecg3-wave';const c=document.createElement('canvas');c.width=1100;c.height=185;wrap.appendChild(c);const ctx=c.getContext('2d'),s=src.trace.signal,max=Math.max(5,...s.map(v=>Math.abs(v))),mid=88,pad=12;ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--clinical').trim()||'#62d4ff';ctx.lineWidth=1.5;ctx.beginPath();s.forEach((v,i)=>{const x=pad+i/Math.max(1,s.length-1)*(c.width-2*pad),y=mid-v/max*72;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--warn').trim()||'#f2b95e';for(const p of src.r.peaks){const x=pad+p/Math.max(1,s.length-1)*(c.width-2*pad);ctx.fillRect(x-1,6,2,11)}ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()||'#81949e';ctx.font='11px sans-serif';ctx.fillText(`${src.name} · traçado reconstruído · marcadores = QRS candidatos`,12,176);return wrap;
  }

  function render(a){
    const o=document.getElementById('ecg3Output'),layout=a.layout,hr=a.hr,cv=a.cv,qrs=a.qrs,find=[];
    find.push({c:hr<50||hr>100?'warn':'good',t:'Frequência',x:`FC estimada ${hr.toFixed(0)} bpm a partir de ${a.hrSources} derivações/segmentos utilizáveis.`});
    find.push({c:cv>.18?'warn':'good',t:'Regularidade RR',x:cv>.18?`Variabilidade RR elevada (CV ${(cv*100).toFixed(0)}%). Não confirma FA; rever ondas P e o traçado original.`:`RR ${cv<=.08?'relativamente regular':'moderadamente variável'} (CV ${(cv*100).toFixed(0)}%).`});
    if(Number.isFinite(qrs))find.push({c:qrs>=120?'warn':'good',t:'QRS',x:`Duração mediana aproximada ${qrs.toFixed(0)} ms${qrs>=120?' — QRS possivelmente largo; confirmar manualmente.':''}`});
    const stLead=layout.leads.filter(l=>Number.isFinite(l.st)&&l.trace.quality>=.28&&Math.abs(l.st)>=.12).sort((a,b)=>Math.abs(b.st)-Math.abs(a.st));
    if(stLead.length)find.push({c:'warn',t:'ST',x:`Desvio ST aproximado ≥0,12 mV em ${stLead.slice(0,6).map(l=>`${l.name} ${l.st>0?'+':''}${l.st.toFixed(2)} mV`).join(', ')}. Confirmar ponto J/ST diretamente no ECG; esta medição não diagnostica SCA.`});else find.push({c:'good',t:'ST',x:'Não foi obtido desvio ST ≥0,12 mV com qualidade suficiente. Isto não exclui isquemia/oclusão.'});
    o.innerHTML=`<div class="ecg3-kpis"><div class="ecg3-kpi"><small>FC</small><strong>${hr.toFixed(0)} bpm</strong><span>${a.hrSources} fontes</span></div><div class="ecg3-kpi"><small>RR</small><strong>${cv<=.08?'Regular':cv>.18?'Irregular':'Variável'}</strong><span>CV ${(cv*100).toFixed(1)}%</span></div><div class="ecg3-kpi"><small>QRS</small><strong>${Number.isFinite(qrs)?qrs.toFixed(0)+' ms':'—'}</strong><span>mediana automática</span></div><div class="ecg3-kpi"><small>Layout</small><strong>${esc(a.layoutLabel)}</strong><span>${layout.usable.length}/12 derivações úteis</span></div><div class="ecg3-kpi"><small>Escala</small><strong>${a.pxmm.toFixed(1)} px/mm</strong><span>${esc(a.calSource)}</span></div></div><div class="ecg3-find">${find.map(f=>`<div class="${f.c}"><b>${esc(f.t)}</b><div>${esc(f.x)}</div></div>`).join('')}</div><div class="ecg3-leads">${layout.leads.map(l=>`<div class="ecg3-lead"><b>${esc(l.name)}</b><span>qualidade ${(l.trace.quality*100).toFixed(0)}% · QRS ${Number.isFinite(l.qrs)?l.qrs.toFixed(0)+' ms':'—'} · ST ${Number.isFinite(l.st)?(l.st>0?'+':'')+l.st.toFixed(2)+' mV':'—'}</span></div>`).join('')}</div>`;
    const wave=drawWave(a);if(wave)o.appendChild(wave);
  }

  async function run(){
    const f=file||document.getElementById('ecgPhotoInput')?.files?.[0];if(!f){gate('bad','Sem ECG','Seleciona primeiro uma fotografia no campo acima.');return}if(!document.getElementById('ecg3Confirm')?.checked){gate('bad','Confirma a calibração','Confirma a velocidade e o ganho que estão impressos no ECG.');return}
    const btn=document.getElementById('ecg3Run');btn.disabled=true;clearOutput();try{
      prog(8);status('A preparar e recortar a fotografia…');const b=await getBitmap(f),full=toCanvas(b),img=crop(full),stats=imageStats(img);await yieldUi();if(img.w<650||img.h<350){gate('bad','Imagem demasiado pequena',`Área útil ${img.w}×${img.h}px. Reduz as margens do recorte ou usa uma fotografia com maior resolução.`);return}if(stats.mean<35||stats.mean>248||stats.sd<10){gate('bad','Imagem difícil de processar','A exposição/contraste da área recortada não permite separar o traçado com segurança. Ajusta o recorte ou repete a fotografia.');return}
      prog(23);status('A estimar a calibração…');const speed=Number(document.getElementById('ecg3Speed').value),gain=Number(document.getElementById('ecg3Gain').value),fallback=img.w/(speed*10),grid=bestGridPeriod(img,fallback),mode=document.getElementById('ecg3CalMode').value;let pxmm,calSource;
      if(mode==='grid'){if(grid.confidence<.18){gate('bad','Grelha não reconhecida','Selecionaste “Exigir grelha”, mas a periodicidade da grelha não foi reconhecida. Usa “Grelha + fallback largura” ou melhora a fotografia.');return}pxmm=grid.pxPerMm;calSource=`grelha (${(grid.confidence*100).toFixed(0)}%)`}
      else if(mode==='width'){pxmm=fallback;calSource='largura temporal confirmada'}
      else if(grid.confidence>=.26&&Math.abs(grid.pxPerMm-fallback)/fallback<.45){pxmm=.65*grid.pxPerMm+.35*fallback;calSource=`grelha + largura (${(grid.confidence*100).toFixed(0)}%)`}else{pxmm=fallback;calSource='fallback pela largura temporal'}
      if(!(pxmm>=1.5&&pxmm<=30)){gate('bad','Calibração implausível','A escala calculada ficou fora do intervalo plausível. Ajusta o recorte e confirma velocidade.');return}
      prog(38);status('A testar layouts de 12 derivações…');await yieldUi();const requested=document.getElementById('ecg3Layout').value,keys=requested==='auto'?['3x4r','3x4','6x2','12x1']:[requested],candidates=[];for(const k of keys){candidates.push(analyseLayout(img,k,pxmm,speed,gain));await yieldUi()}candidates.sort((a,b)=>b.score-a.score);const best=candidates[0];
      prog(67);status(`Layout ${best.key} selecionado. A validar QRS e RR…`);const allRR=[...best.rr].filter(v=>v>.22&&v<3),hrVals=best.hrs.filter(v=>v>=20&&v<=250);if(best.usable.length<3){gate('bad','Poucas derivações extraídas',`Só ${best.usable.length}/12 derivações passaram o limiar mínimo. Tenta ajustar Topo/Fundo/Esquerda/Direita e confirma o layout manualmente.`);return}if(hrVals.length<2&&allRR.length<2){gate('bad','QRS insuficientes','O ECG foi reconhecido como imagem, mas não foram encontrados QRS consistentes em derivações suficientes. Experimenta selecionar manualmente o layout ou ajustar o recorte.');return}
      const hr=median(hrVals.length?hrVals:allRR.map(rr=>60/rr)),rrPool=allRR.length>=2?allRR:best.usable.flatMap(l=>l.r.rr),cv=rrPool.length>=2?sd(rrPool)/(mean(rrPool)||1):0,qrsVals=best.leads.map(l=>l.qrs).filter(v=>Number.isFinite(v)&&v>=35&&v<=240),qrs=median(qrsVals),traceQ=best.extraction,confidence=clamp(.34*clamp(best.usable.length/8,0,1)+.28*traceQ+.18*clamp((hrVals.length||allRR.length)/5,0,1)+.12*(grid.confidence>=.26?grid.confidence:.55)+.08*(Number.isFinite(qrs)?1:.45),0,1);
      if(!(hr>=20&&hr<=250)){gate('bad','Frequência implausível','Os QRS extraídos não produziram uma frequência fisiologicamente plausível. Não é apresentado resultado.');return}if(confidence<.34){gate('bad','Confiança insuficiente',`A análise chegou a ${(confidence*100).toFixed(0)}% de confiança. Ajusta recorte/layout ou repete a fotografia; o resultado foi bloqueado.`);return}
      last={layout:best,hr,cv,qrs,pxmm,calSource,confidence,hrSources:Math.max(hrVals.length,Math.min(allRR.length,12)),layoutLabel:best.key==='3x4r'?'3×4 + ritmo':best.key==='3x4'?'3×4':best.key==='6x2'?'6×2':'12×1'};gate(confidence>=.62?'good':'warn',confidence>=.62?'Análise quantitativa disponível':'Análise disponível com confiança moderada',`Confiança ${(confidence*100).toFixed(0)}% · ${best.usable.length}/12 derivações utilizáveis · calibração por ${calSource}. Confirmar no ECG original.`);render(last);status('Análise concluída.');prog(100);
    }catch(e){console.error(e);gate('bad','Erro de processamento','O browser não conseguiu concluir a digitalização. Nenhum resultado foi produzido.');status('Erro no processamento.')}finally{btn.disabled=false;prog(100)}
  }

  let tries=0;const boot=()=>{tries++;if(install()||tries>50)return;setTimeout(boot,150)};boot();
})();
