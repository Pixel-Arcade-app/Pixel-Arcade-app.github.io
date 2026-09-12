/* Pixel Arcade — comptes avec vrai e-mail + pseudo. */
(()=>{
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const URL=String(cfg.supabaseUrl||'').replace(/\/$/,''),KEY=cfg.supabaseAnonKey||'';
  const EDGE=URL+'/functions/v1/pixel-login';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pseudoOk=/^[A-Za-z0-9À-ÿ _-]{3,20}$/;
  const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const getState=()=>window.PAAuth?.state;
  const api=async(path,opt={})=>{const s=getState();const token=opt.token||s?.user?.access_token||KEY;const r=await fetch(URL+path,{...opt,headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json',...(opt.headers||{})}});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{}if(!r.ok)throw Error(d?.msg||d?.message||d?.error_description||t||'Erreur');return d};
  async function realSignup(email,pseudo,password){
    email=email.trim();pseudo=pseudo.trim();
    if(!emailOk.test(email))throw Error('Entre une adresse e-mail valide.');
    if(!pseudoOk.test(pseudo))throw Error('Pseudo : 3 à 20 caractères (lettres, chiffres, espaces, _ ou -).');
    if(password.length<8)throw Error('Le mot de passe doit contenir au moins 8 caractères.');
    const d=await api('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{pseudo}})});
    if(d?.access_token){
      const s=getState();s.user={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user};s.online=true;
      await window.PAAuth.refresh();
      return {logged:true,pseudo};
    }
    return {logged:false,pseudo,message:'Compte créé ! Vérifie ton e-mail pour confirmer ton compte, puis connecte-toi.'};
  }
  async function realLogin(identifier,password){
    identifier=identifier.trim();
    if(!identifier||!password)throw Error('Renseigne ton identifiant et ton mot de passe.');
    let d;
    if(identifier.includes('@')){
      d=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:identifier,password})});
    }else{
      const r=await fetch(EDGE,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({pseudo:identifier,password})});
      const t=await r.text();let x=null;try{x=t?JSON.parse(t):null}catch{}if(!r.ok)throw Error(x?.message||'Connexion impossible. Vérifie ton pseudo et ton mot de passe.');d=x;
    }
    if(!d?.access_token)throw Error('Connexion impossible. Vérifie tes identifiants.');
    const s=getState();s.user={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user};s.online=true;
    await window.PAAuth.refresh();
    return {logged:true,pseudo:window.PAAuth.currentPseudo()||d.user?.user_metadata?.pseudo||identifier};
  }
  function renderAccount(){
    const s=getState();
    document.querySelectorAll('#accountBox').forEach(host=>{host.innerHTML=s?.user?`<button class="account-chip" onclick="PAAuth.open()">👤 ${esc(window.PAAuth.currentPseudo()||'Compte')}</button>`:'<button class="account-chip" onclick="PAAuth.open()">👤 Compte</button>'});
  }
  function modal(){
    if(document.getElementById('paAuthModal'))return;
    const m=document.createElement('div');m.id='paAuthModal';m.className='pa-modal';
    m.innerHTML='<div class="pa-auth-box"><button class="pa-close" aria-label="Fermer">×</button><div class="pa-tabs"><button data-tab="login" class="active">Se connecter</button><button data-tab="signup">Créer un compte</button></div><div id="paAuthForm"></div><p id="paAuthMsg" class="muted"></p></div>';
    document.body.appendChild(m);m.querySelector('.pa-close').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()};
    m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>form(b.dataset.tab));
    function form(tab){
      m.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
      m.querySelector('#paAuthForm').innerHTML=tab==='signup'?`<h2>✨ Créer mon compte</h2><label>E-mail<input id="paEmail" type="email" autocomplete="email" placeholder="ton@email.com"></label><label>Pseudo<input id="paPseudo" maxlength="20" autocomplete="username" placeholder="Ex. PixelMaster"></label><label>Mot de passe<input id="paPass" type="password" minlength="8" autocomplete="new-password" placeholder="8 caractères minimum"></label><button id="paSubmit" class="primary">Créer le compte</button>`:`<h2>👋 Connexion</h2><label>E-mail ou pseudo<input id="paIdentifier" autocomplete="username" placeholder="ton@email.com ou PixelMaster"></label><label>Mot de passe<input id="paPass" type="password" autocomplete="current-password" placeholder="Ton mot de passe"></label><button id="paSubmit" class="primary">Se connecter</button>`;
      m.querySelector('#paSubmit').onclick=async()=>{const msg=m.querySelector('#paAuthMsg');msg.textContent='';const b=m.querySelector('#paSubmit');b.disabled=true;try{let r;if(tab==='signup')r=await realSignup(m.querySelector('#paEmail').value,m.querySelector('#paPseudo').value,m.querySelector('#paPass').value);else r=await realLogin(m.querySelector('#paIdentifier').value,m.querySelector('#paPass').value);msg.textContent='✓ '+(r.message||((r.pseudo||'Compte')+' connecté !'));renderAccount();window.dispatchEvent(new Event('pa-auth-updated'));if(r.logged)setTimeout(()=>m.remove(),500)}catch(e){msg.textContent='⚠️ '+e.message}finally{b.disabled=false}};
    }
    form('login');
  }
  const oldOpen=window.PAAuth?.open;
  if(window.PAAuth){window.PAAuth.open=()=>{if(getState()?.user)location.href='./profile.html';else modal()};window.PAAuth.emailSignup=realSignup;window.PAAuth.emailLogin=realLogin;}
  function boot(){renderAccount();window.dispatchEvent(new Event('pa-auth-updated'));}
  window.addEventListener('pa-auth-ready',boot);window.addEventListener('pa-auth-updated',renderAccount);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
})();
