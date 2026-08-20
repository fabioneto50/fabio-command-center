(()=>{
  if(window.__fccPersonalSecurityV2Installed)return;
  window.__fccPersonalSecurityV2Installed=true;
  const PRIVATE=new Set(['personal','emergency','comms','garage','research','expenses']);
  const SESSION_KEY='fcc-personal-unlocked-v3';
  const PIN_HASH='0129288b1c55fa9317a679364d4876ecf99ea4a3b9316e4ebde357444b9a2057';
  let pending=null;
  const isUnlocked=()=>{try{return sessionStorage.getItem(SESSION_KEY)==='1'}catch(e){return false}};
  const setUnlocked=()=>{try{sessionStorage.setItem(SESSION_KEY,'1')}catch(e){}};
  const clearUnlocked=()=>{try{sessionStorage.removeItem(SESSION_KEY)}catch(e){}};
  async function digest(pin){const data=new TextEncoder().encode('fcc-personal|'+String(pin||'')),buf=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  function style(){
    if(document.getElementById('fcc-personal-security-style'))return;
    const s=document.createElement('style');s.id='fcc-personal-security-style';s.textContent=`.personal-pin-backdrop{position:fixed;inset:0;z-index:420;display:none;place-items:center;padding:16px;background:rgba(1,7,12,.82)}.personal-pin-backdrop.open{display:grid}.personal-pin-box{width:min(390px,100%);border:1px solid var(--line-strong);border-radius:22px;background:linear-gradient(160deg,var(--panel),var(--bg-soft));box-shadow:0 24px 70px rgba(0,0,0,.42);padding:20px}.personal-pin-box h3{margin:3px 0 6px}.personal-pin-box p{margin:0;color:var(--muted)}.personal-pin-input{margin-top:14px;font-size:22px!important;letter-spacing:.25em;text-align:center;font-variant-numeric:tabular-nums}.personal-pin-error{min-height:20px;margin-top:7px;color:var(--danger);font-size:11px}.personal-pin-actions{display:flex;gap:8px;margin-top:8px}.personal-pin-actions .btn{flex:1}html[data-fcc-theme="light"] .personal-pin-backdrop{background:rgba(35,58,69,.35)}@media(max-width:920px){.personal-pin-backdrop{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}}`;document.head.appendChild(s)
  }
  function ensure(){
    if(document.getElementById('fccPersonalPinModal'))return;
    const m=document.createElement('div');m.id='fccPersonalPinModal';m.className='personal-pin-backdrop';m.innerHTML='<section class="personal-pin-box" role="dialog" aria-modal="true" aria-labelledby="fccPersonalPinTitle"><span class="eyebrow">ÁREA PESSOAL</span><h3 id="fccPersonalPinTitle">Introduzir PIN</h3><p>Código pessoal deste Command Center. O desbloqueio dura apenas esta sessão.</p><input class="personal-pin-input" id="fccPersonalPinInput" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="••••" aria-label="PIN de acesso"><div class="personal-pin-error" id="fccPersonalPinError"></div><div class="personal-pin-actions"><button class="btn" id="fccPersonalPinCancel" type="button">Cancelar</button><button class="btn primary" id="fccPersonalPinSubmit" type="button">Entrar</button></div></section>';document.body.appendChild(m);
    document.getElementById('fccPersonalPinSubmit').addEventListener('click',verify);document.getElementById('fccPersonalPinCancel').addEventListener('click',close);document.getElementById('fccPersonalPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')verify();else if(e.key==='Escape')close()});m.addEventListener('click',e=>{if(e.target===m)close()});
  }
  function open(cb){ensure();pending=typeof cb==='function'?cb:null;const m=document.getElementById('fccPersonalPinModal'),i=document.getElementById('fccPersonalPinInput'),er=document.getElementById('fccPersonalPinError');if(!m||!i||!er)return false;i.value='';er.textContent='';m.classList.add('open');setTimeout(()=>i.focus(),30);return false}
  function close(){document.getElementById('fccPersonalPinModal')?.classList.remove('open');pending=null}
  async function verify(){const input=document.getElementById('fccPersonalPinInput'),err=document.getElementById('fccPersonalPinError'),btn=document.getElementById('fccPersonalPinSubmit');if(!input||!err||!btn)return;btn.disabled=true;try{if((await digest(input.value))!==PIN_HASH){err.textContent='PIN incorreto.';input.select();return}setUnlocked();const cb=pending;close();cb?.()}catch(e){window.FCCDiagnostics?.log('pin-error',e?.message||e);err.textContent='Não foi possível validar o PIN.'}finally{btn.disabled=false}}
  const guard=(page,proceed)=>{if(!PRIVATE.has(page)||isUnlocked())return true;return open(proceed)};
  style();ensure();window.FCCNavigation?.addGuard(guard);
  window.fccLockPersonal=()=>{clearUnlocked();close();const p=window.FCCNavigation?.current();if(PRIVATE.has(p))window.fccNavigate?.('home',{bypassGuard:true})};
  window.fccPersonalUnlocked=isUnlocked;
  window.addEventListener('pageshow',close);
})();
