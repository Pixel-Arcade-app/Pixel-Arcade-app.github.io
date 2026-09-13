/* Pixel Arcade — numéro de téléphone facultatif à la création du compte. */
(()=>{
  const CFG=()=>window.PIXEL_ARCADE_CONFIG||{};
  const url=()=>String(CFG().supabaseUrl||'').replace(/\/$/,'');
  const key=()=>CFG().supabaseAnonKey||'';
  const pendingKey=email=>'pa_pending_phone_'+String(email||'').trim().toLowerCase();
  function addPhoneField(){
    const form=document.getElementById('paAuthForm');
    if(!form||!form.querySelector('#paEmail')||form.querySelector('#paPhone'))return;
    const age=form.querySelector('#paAge');
    const label=document.createElement('label');
    label.innerHTML='Numéro de téléphone <span class="muted">(facultatif)</span><input id="paPhone" type="tel" inputmode="tel" autocomplete="tel" maxlength="25" placeholder="Ex. +33 6 12 34 56 78">';
    if(age?.parentElement)age.parentElement.insertAdjacentElement('afterend',label);else form.appendChild(label);
  }
  function savePending(){
    const email=document.getElementById('paEmail')?.value||'',phone=document.getElementById('paPhone')?.value.trim()||'';
    if(!email)return;
    try{if(phone)localStorage.setItem(pendingKey(email),phone);else localStorage.removeItem(pendingKey(email));}catch{}
  }
  async function syncPending(){
    const s=window.PAAuth?.state;if(!s?.user?.access_token||!s?.user?.user?.email)return;
    const k=pendingKey(s.user.user.email),phone=localStorage.getItem(k);if(!phone)return;
    try{const r=await fetch(url()+'/rest/v1/profiles?id=eq.'+encodeURIComponent(s.user.user.id),{method:'PATCH',headers:{apikey:key(),Authorization:'Bearer '+s.user.access_token,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({phone})});if(r.ok)localStorage.removeItem(k);}catch{}
  }
  const mo=new MutationObserver(()=>addPhoneField());
  window.addEventListener('load',()=>{mo.observe(document.body,{childList:true,subtree:true});addPhoneField();syncPending();});
  document.addEventListener('click',e=>{if(e.target?.id==='paSubmit'&&document.getElementById('paPhone'))savePending();},true);
  window.addEventListener('pa-auth-ready',syncPending);
  window.addEventListener('pa-auth-updated',syncPending);
})();
