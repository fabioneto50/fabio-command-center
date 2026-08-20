(()=>{
  if(window.__fccPersonalSecurityV1Installed)return;
  window.__fccPersonalSecurityV1Installed=true;

  const PERSONAL='personal';
  const PRIVATE_CHILDREN=new Set(['emergency','comms','garage','research','expenses']);
  const PRIVATE_SEARCH=new Set([PERSONAL,...PRIVATE_CHILDREN]);
  const SESSION_KEY='fcc-personal-unlocked-v1';
  const PIN_HASH='0129288b1c55fa9317a679364d4876ecf99ea4a3b9316e4ebde357444b9a2057';
  let pending=null;
  const isUnlocked=()=>{try{return sessionStorage.getItem(SESSION_KEY)==='1'}catch(e){return false}};
  const setUnlocked=()=>{try{sessionStorage.setItem(SESSION_KEY,'1')}catch(e){}};
  const clearUnlocked=()=>{try{sessionStorage.removeItem(SESSION_KEY)}catch(e){}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  async function digest(pin){
    const data=new TextEncoder().encode('fcc-personal|'+String(pin||''));
    const buf=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  function addStyles(){
    if(document.getElementById('fcc-personal-security-style'))return;
    const s=document.createElement('style');s.id='fcc-personal-security-style';s.textContent=`
      .personal-pin-backdrop{position:fixed;inset:0;z-index:420;display:none;place-items:center;padding:16px;background:rgba(1,7,12,.78);backdrop-filter:blur(14px)}.personal-pin-backdrop.open{display:grid}
      .personal-pin-box{width:min(390px,100%);border:1px solid var(--line-strong);border-radius:22px;background:linear-gradient(160deg,var(--panel),var(--bg-soft));box-shadow:0 30px 90px rgba(0,0,0,.48);padding:20px}.personal-pin-box h3{margin:3px 0 6px}.personal-pin-box p{margin:0;color:var(--muted)}
      .personal-pin-input{margin-top:14px;font-size:22px!important;letter-spacing:.25em;text-align:center;font-variant-numeric:tabular-nums}.personal-pin-error{min-height:20px;margin-top:7px;color:var(--danger);font-size:11px}.personal-pin-actions{display:flex;gap:8px;margin-top:8px}.personal-pin-actions .btn{flex:1}
      html[data-fcc-theme="light"] .personal-pin-backdrop{background:rgba(35,58,69,.28)}html[data-fcc-theme="light"] .personal-pin-box{background:linear-gradient(160deg,#fff,#f5f9fb);box-shadow:0 30px 80px rgba(31,62,76,.18)}
    `;document.head.appendChild(s);
  }

  function ensureModal(){
    if(document.getElementById('fccPersonalPinModal'))return;
    const m=document.createElement('div');m.id='fccPersonalPinModal';m.className='personal-pin-backdrop';
    m.innerHTML='<section class="personal-pin-box" role="dialog" aria-modal="true" aria-labelledby="fccPersonalPinTitle"><span class="eyebrow">ÁREA PESSOAL</span><h3 id="fccPersonalPinTitle">Introduzir PIN</h3><p>O mesmo código é utilizado em qualquer navegador. O desbloqueio dura apenas esta sessão.</p><input class="personal-pin-input" id="fccPersonalPinInput" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="••••" aria-label="PIN de acesso"><div class="personal-pin-error" id="fccPersonalPinError"></div><div class="personal-pin-actions"><button class="btn" id="fccPersonalPinCancel" type="button">Cancelar</button><button class="btn primary" id="fccPersonalPinSubmit" type="button">Entrar</button></div></section>';
    document.body.appendChild(m);
    const input=document.getElementById('fccPersonalPinInput');
    document.getElementById('fccPersonalPinSubmit').addEventListener('click',verify);
    document.getElementById('fccPersonalPinCancel').addEventListener('click',close);
    input.addEventListener('keydown',e=>{if(e.key==='Enter')verify();if(e.key==='Escape')close()});
    m.addEventListener('click',e=>{if(e.target===m)close()});
  }

  function open(cb){
    ensureModal();pending=typeof cb==='function'?cb:null;
    const m=document.getElementById('fccPersonalPinModal'),i=document.getElementById('fccPersonalPinInput'),e=document.getElementById('fccPersonalPinError');
    if(!m||!i||!e)return;
    i.value='';e.textContent='';m.classList.add('open');setTimeout(()=>i.focus(),30);
  }

  function close(){
    document.getElementById('fccPersonalPinModal')?.classList.remove('open');
    pending=null;
  }

  async function verify(){
    const input=document.getElementById('fccPersonalPinInput'),err=document.getElementById('fccPersonalPinError');
    if(!input||!err)return;
    try{
      const ok=(await digest(input.value))===PIN_HASH;
      if(!ok){err.textContent='PIN incorreto.';input.select();return}
      setUnlocked();
      const cb=pending;
      close();
      cb?.();
    }catch(e){
      console.error('FCC PIN verification failed',e);
      err.textContent='Não foi possível validar o PIN. Tenta novamente.';
    }
  }

  function wrapPrimaryNavigation(){
    if(window.__fccPersonalSecurityGoWrapped)return;
    const original=window.go;
    if(typeof original!=='function')return;
    window.__fccPersonalSecurityGoWrapped=true;
    window.go=function(page,...args){
      const privatePage=page===PERSONAL||PRIVATE_CHILDREN.has(page);
      if(!privatePage){
        close();
        return original.call(this,page,...args);
      }
      if(isUnlocked())return original.call(this,page,...args);
      let result;
      open(()=>{result=original.call(this,page,...args)});
      return result;
    };
  }

  function wrapGlobalSearch(){
    if(window.__fccPersonalSearchWrapped||typeof window.renderGlobalSearch!=='function')return;
    window.__fccPersonalSearchWrapped=true;
    const old=window.renderGlobalSearch;
    window.renderGlobalSearch=function(...args){
      const r=old.apply(this,args);if(isUnlocked())return r;
      const box=document.getElementById('globalResults');if(!box||!Array.isArray(box._hits))return r;
      const hits=box._hits.filter(h=>!PRIVATE_SEARCH.has(h.page));box._hits=hits;
      box.innerHTML=hits.length?hits.map((h,i)=>`<button class="search-hit" onclick="openSearchHit(${i})"><div><b>${esc(h.title)}</b><span>${esc(h.sub)}</span></div></button>`).join(''):'<div class="item"><span>Sem resultados nesta área pública.</span></div>';
      return r;
    };
  }

  addStyles();ensureModal();wrapPrimaryNavigation();wrapGlobalSearch();
  window.fccLockPersonal=()=>{clearUnlocked();close();const active=document.querySelector('.page.active')?.id?.replace('page-','');if(active===PERSONAL||PRIVATE_CHILDREN.has(active))window.go?.('home')};
  window.fccPersonalUnlocked=isUnlocked;
  window.addEventListener('pageshow',()=>close());
})();
