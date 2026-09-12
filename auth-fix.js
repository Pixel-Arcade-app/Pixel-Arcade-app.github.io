/* Pixel Arcade — comptes par e-mail + connexion e-mail OU pseudo. */
(()=>{
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const base=String(cfg.supabaseUrl||'').replace(/\/$/,'');
  const key=cfg.supabaseAnonKey||'';
  if(!base||!key||!window.PAAuth)return;

  const api=async(path,opt={})=>{
    const token=opt.token||PAAuth.state?.user?.access_token||key;
    const r=await fetch(base+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',...(opt.headers||{})}});
    const text=await r.text();let d=null;try{d=text?JSON.parse(text):null}catch{}
    if(!r.ok)throw Error(d?.msg||d?.message||d?.error_description||text||r.statusText);
    return d;
  };

  const originalRefresh=PAAuth.refresh;
  const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const pseudoOk=/^[A-Za-z0-9À-ÿ _-]{3,20}$/;

  async function finishSession(d){
    if(!d?.access_token)throw Error('Connexion impossible. Vérifie tes identifiants.');
    const st=PAAuth.state;
    st.user={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user};
    st.online=true;
    await originalRefresh();
    return PAAuth.profile();
  }

  async function signup(email,pseudo,password){
    email=String(email||'').trim();
    pseudo=String(pseudo||'').trim();
    if(!emailOk.test(email))throw Error('Adresse e-mail invalide.');
    if(!pseudoOk.test(pseudo))throw Error('Pseudo : 3 à 20 caractères (lettres, chiffres, espaces, _ ou -).');
    if(String(password).length<8)throw Error('Le mot de passe doit contenir au moins 8 caractères.');
    const d=await api('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{pseudo}})});
    if(!d?.access_token){
      if(d?.user&&!d?.session)throw Error('Compte créé. Vérifie ton e-mail pour confirmer le compte avant de te connecter.');
      throw Error('Le compte a été créé mais Supabase demande une confirmation e-mail.');
    }
    return finishSession(d);
  }

  async function login(identifier,password){
    identifier=String(identifier||'').trim();
    if(!identifier)throw Error('Indique ton e-mail ou ton pseudo.');
    if(String(password).length<1)throw Error('Indique ton mot de passe.');

    if(emailOk.test(identifier)){
      const d=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:identifier,password})});
      return finishSession(d);
    }

    if(!pseudoOk.test(identifier))throw Error('E-mail ou pseudo invalide.');

    const r=await fetch(base+'/functions/v1/pixel-login',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({pseudo:identifier,password})});
    const text=await r.text();let d=null;try{d=text?JSON.parse(text):null}catch{}
    if(!r.ok)throw Error(d?.message||'Connexion impossible. Vérifie ton pseudo et ton mot de passe.');
    return finishSession(d);
  }

  PAAuth.signup=signup;
  PAAuth.login=login;

  function modal(){
    if(document.querySelector('#paAuthModal'))return;
    const m=document.createElement('div');
    m.id='paAuthModal';m.className='pa-modal';
    m.innerHTML='<div class="pa-auth-box"><button class="pa-close" aria-label="Fermer">×</button><div class="pa-tabs"><button data-tab="login" class="active">Se connecter</button><button data-tab="signup">Créer un compte</button></div><div id="paAuthForm"></div><p id="paAuthMsg" class="muted"></p></div>';
    document.body.appendChild(m);
    m.querySelector('.pa-close').onclick=()=>m.remove();
    m.onclick=e=>{if(e.target===m)m.remove()};
    m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>form(b.dataset.tab));

    function form(tab){
      m.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
      if(tab==='signup'){
        m.querySelector('#paAuthForm').innerHTML=`<h2>✨ Créer mon compte</h2><label>E-mail<input id="paEmail" type="email" autocomplete="email" placeholder="ton@email.com"></label><label>Pseudo<input id="paPseudo" maxlength="20" autocomplete="username" placeholder="Ex. PixelMaster"></label><label>Mot de passe<input id="paPass" type="password" minlength="8" autocomplete="new-password" placeholder="8 caractères minimum"></label><button id="paSubmit" class="primary">Créer le compte</button>`;
      }else{
        m.querySelector('#paAuthForm').innerHTML=`<h2>👋 Se connecter</h2><label>E-mail ou pseudo<input id="paIdentifier" maxlength="120" autocomplete="username" placeholder="ton@email.com ou PixelMaster"></label><label>Mot de passe<input id="paPass" type="password" autocomplete="current-password" placeholder="Ton mot de passe"></label><button id="paSubmit" class="primary">Se connecter</button>`;
      }
      m.querySelector('#paSubmit').onclick=async()=>{
        const msg=m.querySelector('#paAuthMsg');msg.textContent='';
        try{
          m.querySelector('#paSubmit').disabled=true;
          let p;
          if(tab==='signup')p=await signup(m.querySelector('#paEmail').value,m.querySelector('#paPseudo').value,m.querySelector('#paPass').value);
          else p=await login(m.querySelector('#paIdentifier').value,m.querySelector('#paPass').value);
          msg.textContent='✓ '+(p?.pseudo||PAAuth.currentPseudo()||'Compte')+' connecté !';
          setTimeout(()=>m.remove(),500);
        }catch(e){msg.textContent='⚠️ '+e.message}
        finally{m.querySelector('#paSubmit').disabled=false}
      };
    }
    form('login');
  }

  PAAuth.open=function(){if(!PAAuth.state.user)modal();else window.location.href='profil.html'};
})();
