(()=>{
  if(window.__fccFamilySecurityInstalled) return;
  window.__fccFamilySecurityInstalled=true;

  const LOCK_MINUTES=60;
  const ITERATIONS=150000;
  const GLOBAL_CRED={
    v:2,
    salt:'6bcOLHljaYBk7I6MNgSVAA==',
    hash:'22wR0BpD26+k4oVPKcBTlMKjtTY+MffeiwHR/chzTS4=',
    iterations:ITERATIONS,
    scope:'global-static'
  };
  let unlocked=false;
  let lastActivity=0;
  let bypassNext=false;
  let pendingTab=null;

  function bytesToB64(bytes){let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s)}
  function b64ToBytes(s){const bin=atob(s);return Uint8Array.from(bin,c=>c.charCodeAt(0))}

  async function derive(pin,saltB64,iterations=ITERATIONS){
    if(!crypto?.subtle) throw new Error('Web Crypto indisponível');
    const enc=new TextEncoder();
    const material=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:b64ToBytes(saltB64),iterations},material,256);
    return bytesToB64(new Uint8Array(bits));
  }

  function ensureUI(){
    if(document.getElementById('familyPinModal')) return;
    const style=document.createElement('style');
    style.id='family-pin-style';
    style.textContent=`
      .family-pin-backdrop{position:fixed;inset:0;z-index:240;background:rgba(2,7,12,.78);backdrop-filter:blur(14px);display:none;place-items:center;padding:18px}.family-pin-backdrop.open{display:grid}
      .family-pin-box{width:min(410px,100%);border:1px solid rgba(255,190,78,.28);border-radius:24px;background:linear-gradient(160deg,#111d27,#09131d);box-shadow:0 30px 90px rgba(0,0,0,.6);padding:20px}.family-pin-icon{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:rgba(245,184,68,.12);border:1px solid rgba(245,184,68,.3);font-size:23px;margin-bottom:14px}.family-pin-box h3{margin:0 0 5px;font-size:23px}.family-pin-box p{margin:0 0 15px;color:var(--muted);font-size:11px;line-height:1.55}.family-pin-fields{display:grid;gap:9px}.family-pin-fields input{font-size:22px;text-align:center;letter-spacing:.25em;padding:13px}.family-pin-actions{display:flex;gap:8px;margin-top:13px}.family-pin-actions .btn{flex:1}.family-pin-error{min-height:17px;margin-top:8px;color:#ff929b;font-size:10px}.family-security-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px;padding:9px 10px;border:1px solid rgba(245,184,68,.2);border-radius:13px;background:rgba(245,184,68,.06)}.family-security-bar span{font-size:10px;color:#e7c780}.family-security-actions{display:flex;gap:6px}.family-security-actions button{font-size:9px;padding:6px 8px}
      html[data-fcc-theme="light"] .family-pin-backdrop{background:rgba(35,58,69,.25)!important}html[data-fcc-theme="light"] .family-pin-box{background:var(--panel)!important;box-shadow:0 30px 80px rgba(31,62,76,.18)!important}
    `;
    document.head.appendChild(style);

    const wrap=document.createElement('div');
    wrap.id='familyPinModal';wrap.className='family-pin-backdrop';
    wrap.innerHTML=`<div class="family-pin-box" role="dialog" aria-modal="true" aria-labelledby="familyPinTitle"><div class="family-pin-icon">⌾</div><h3 id="familyPinTitle">Desbloquear Família</h3><p id="familyPinHelp">Introduz o PIN global da Família. É o mesmo no iPhone, computador e restantes dispositivos. O acesso volta a bloquear após 60 minutos de inatividade.</p><div class="family-pin-fields"><input id="familyPinInput" inputmode="numeric" autocomplete="off" type="password" maxlength="8" placeholder="PIN"></div><div id="familyPinError" class="family-pin-error"></div><div class="family-pin-actions"><button type="button" class="btn" id="familyPinCancel">Cancelar</button><button type="button" class="btn primary" id="familyPinSubmit">Desbloquear</button></div></div>`;
    document.body.appendChild(wrap);
    document.getElementById('familyPinCancel').addEventListener('click',closeModal);
    document.getElementById('familyPinSubmit').addEventListener('click',submitPin);
    document.getElementById('familyPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')submitPin()});
  }

  function openModal(tab=null){
    ensureUI();pendingTab=tab||pendingTab;
    const input=document.getElementById('familyPinInput');
    input.value='';document.getElementById('familyPinError').textContent='';
    document.getElementById('familyPinModal').classList.add('open');
    setTimeout(()=>input.focus(),50);
  }

  function closeModal(){document.getElementById('familyPinModal')?.classList.remove('open');pendingTab=null}
  function setError(msg){document.getElementById('familyPinError').textContent=msg}

  async function submitPin(){
    const input=document.getElementById('familyPinInput');
    const pin=(input.value||'').trim();
    if(!/^\d{4,8}$/.test(pin)){setError('Usa 4 a 8 dígitos.');return}
    const btn=document.getElementById('familyPinSubmit');btn.disabled=true;
    try{
      const hash=await derive(pin,GLOBAL_CRED.salt,GLOBAL_CRED.iterations);
      if(hash!==GLOBAL_CRED.hash){setError('PIN incorreto.');return}
      unlocked=true;lastActivity=Date.now();
      document.getElementById('familyPinModal').classList.remove('open');
      if(pendingTab){const t=pendingTab;pendingTab=null;openFamilyTab(t)}else decorateFamily();
    }catch(e){setError('Não foi possível validar o PIN neste dispositivo.')}finally{btn.disabled=false}
  }

  function openFamilyTab(tab){
    bypassNext=true;
    tab.click();
    setTimeout(()=>{bypassNext=false;decorateFamily()},0);
  }

  function decorateFamily(){
    const panel=document.getElementById('em-family');if(!panel||!unlocked)return;
    let bar=panel.querySelector('.family-security-bar');
    if(!bar){
      bar=document.createElement('div');bar.className='family-security-bar';
      bar.innerHTML='<span>⌾ Família desbloqueada · PIN global · bloqueio automático após 60 min</span><div class="family-security-actions"><button type="button" class="btn">Bloquear</button></div>';
      bar.querySelector('button').addEventListener('click',lockNow);
      panel.prepend(bar);
    }
  }

  function lockNow(){
    unlocked=false;lastActivity=0;
    document.querySelector('#em-family .family-security-bar')?.remove();
    const family=document.getElementById('em-family');
    if(family?.classList.contains('active')){
      family.classList.remove('active');
      document.querySelector('#page-emergency .tab.active')?.classList.remove('active');
      if(typeof openCategoryMenu==='function')openCategoryMenu('emergency');
    }
  }

  function isExpired(){return unlocked&&Date.now()-lastActivity>LOCK_MINUTES*60*1000}
  ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>{if(unlocked)lastActivity=Date.now()},{passive:true}));
  setInterval(()=>{if(isExpired())lockNow()},30000);

  function familyTabFromTarget(target){
    const tab=target?.closest?.('#page-emergency .tab');if(!tab)return null;
    const code=tab.getAttribute('onclick')||'';
    return code.includes("'em-family'")||code.includes('"em-family"')?tab:null;
  }

  document.addEventListener('click',e=>{
    const tab=familyTabFromTarget(e.target);if(!tab)return;
    if(bypassNext){bypassNext=false;return}
    if(unlocked&&!isExpired()){lastActivity=Date.now();setTimeout(decorateFamily,0);return}
    e.preventDefault();e.stopImmediatePropagation();
    openModal(tab);
  },true);

  const mark=()=>{const tab=[...document.querySelectorAll('#page-emergency .tab')].find(t=>(t.getAttribute('onclick')||'').includes('em-family'));if(tab&&!tab.dataset.pinMarked){tab.dataset.pinMarked='1';tab.textContent=tab.textContent.replace(/\s*🔒$/,'')+' 🔒'}};
  mark();setTimeout(mark,250);
  window.isFamilyUnlocked=()=>unlocked&&!isExpired();
})();
