/* Pixel Arcade — correctifs compte, inscription, pseudo unique et accès administrateur. */
(()=>{
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const base=String(cfg.supabaseUrl||'').replace(/\/$/,'');
  const key=cfg.supabaseAnonKey||'';
  if(!base||!key||!window.PAAuth)return;
  const state=()=>window.PAAuth.state;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api=async(path,opt={})=>{const token=opt.token||state()?.user?.access_token||key;const r=await fetch(base+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',...(opt.headers||{})}});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{}if(!r.ok)throw Error(d?.message||d?.msg||d?.error_description||d?.error||t||r.statusText);return d};
  const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const pseudoOk=/^[A-Za-z0-9À-ÿ _-]{3,20}$/;
  const userId=()=>state()?.user?.user?.id||state()?.user?.user?.sub||'';
  async function pseudoAvailable(p){return await api('/rest/v1/rpc/is_pseudo_available',{method:'POST',body:JSON.stringify({candidate:String(p).trim()})})===true}
  async function recordLoginContext(){try{if(state()?.user?.access_token)await api('/rest/v1/rpc/record_last_login_context',{method:'POST',body:'{}'})}catch{}}
  async function signup(email,pw,d){
    email=String(email||'').trim();
    const pseudo=String(d.pseudo||'').trim(),first=String(d.first_name||'').trim(),last=String(d.last_name||'').trim(),phone=String(d.phone||'').trim(),age=Number(d.age);
    if(!emailOk.test(email))throw Error('Entre une adresse e-mail valide.');
    if(!pseudoOk.test(pseudo))throw Error('Pseudo : minimum 3 et maximum 20 caractères. Lettres, chiffres, espaces, _ et - uniquement.');
    if(!(await pseudoAvailable(pseudo)))throw Error('Ce pseudo est déjà utilisé. Choisis-en un autre.');
    if(!first)throw Error('Le prénom est obligatoire.');
    if(!last)throw Error('Le nom de famille est obligatoire.');
    if(!Number.isInteger(age)||age<15||age>120)throw Error('L’âge minimum pour créer un compte est de 15 ans.');
    if(String(pw).length<8)throw Error('Le mot de passe doit contenir au moins 8 caractères.');
    const data={pseudo,first_name:first,last_name:last,age,phone:phone||null,terms_accepted_at:new Date().toISOString(),privacy_accepted_at:new Date().toISOString()};
    let res;
    try{res=await api('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password:pw,data})})}catch(e){if(/already|exists|registered|email_exists|user_already_exists|already registered/i.test(String(e.message)))throw Error('Cette adresse e-mail est déjà utilisée.');throw e}
    if(res?.user&&Array.isArray(res.user.identities)&&res.user.identities.length===0)throw Error('Cette adresse e-mail est déjà utilisée.');
    if(!res?.user&&!res?.access_token)throw Error('La création du compte n’a pas pu être terminée. Réessaie dans quelques instants.');
    if(!res?.access_token)return{logged:false,pseudo,message:'Compte créé. Vérifie ton adresse e-mail avec le message reçu avant de te connecter.'};
    const s=state();s.user={access_token:res.access_token,refresh_token:res.refresh_token,user:res.user};s.online=true;if(window.PAAuth.refresh)await window.PAAuth.refresh();await recordLoginContext();return{logged:true,pseudo};
  }
  function fixLinks(){document.querySelectorAll('a[href="./profil.html"],a[href="profil.html"],a[href="/profil.html"]').forEach(a=>a.href='./profile.html')}
  function renderAdminButton(){document.querySelectorAll('.head-actions').forEach(head=>{if(location.pathname.endsWith('/admin.html'))return;let b=head.querySelector('[data-pa-admin-link]');const yes=!!state()?.user&&(state()?.profile?.is_admin===true||state()?.user?.user?.user_metadata?.is_admin===true);if(yes&&!b){b=document.createElement('a');b.href='./admin.html';b.className='back';b.dataset.paAdminLink='';b.textContent='Administration';head.appendChild(b)}if(!yes&&b)b.remove()})}
  async function checkAdmin(){if(!state()?.user)return false;if(state()?.profile?.is_admin===true)return true;const id=userId();if(!id)return false;try{const rows=await api('/rest/v1/profiles?select=is_admin&id=eq.'+encodeURIComponent(id)+'&limit=1');const yes=Array.isArray(rows)&&rows[0]?.is_admin===true;if(state().profile)state().profile.is_admin=yes;return yes}catch{return false}}
  function modal(){
    if(document.getElementById('paAuthModal'))return;
    const m=document.createElement('div');m.id='paAuthModal';m.className='pa-modal';m.innerHTML='<div class="pa-auth-box"><button class="pa-close" aria-label="Fermer">×</button><div class="pa-tabs"><button data-tab="login" class="active">Se connecter</button><button data-tab="signup">Créer un compte</button></div><div id="paAuthForm"></div><p id="paAuthMsg" class="muted"></p></div>';
    document.body.appendChild(m);m.querySelector('.pa-close').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()};m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>form(b.dataset.tab));
    function form(tab){
      m.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
      m.querySelector('#paAuthForm').innerHTML=tab==='signup'?`<h2>Créer mon compte</h2><label>E-mail<input id="paEmail" type="email" maxlength="254" autocomplete="email" required placeholder="ton@email.com"></label><label>Pseudo<input id="paPseudo" type="text" minlength="3" maxlength="20" autocomplete="username" required pattern="[A-Za-z0-9À-ÿ _-]{3,20}" placeholder="3 à 20 caractères"></label><div class="report-grid"><label class="report-field">Prénom<input id="paFirstName" maxlength="60" autocomplete="given-name" required></label><label class="report-field">Nom de famille<input id="paLastName" maxlength="80" autocomplete="family-name" required></label></div><label>Âge<input id="paAge" type="number" min="15" max="120" inputmode="numeric" required></label><label>Numéro de téléphone <span class="muted">(facultatif)</span><input id="paPhone" type="tel" maxlength="30" autocomplete="tel" placeholder="Facultatif"></label><label>Mot de passe<input id="paPass" type="password" minlength="8" autocomplete="new-password" required placeholder="8 caractères minimum"></label><label class="legal-check"><input id="paTerms" type="checkbox" required> <span>J’ai lu et j’accepte les <a href="./conditions-utilisation.html" target="_blank" rel="noopener">conditions d’utilisation</a> et j’ai pris connaissance de la <a href="./politique-confidentialite.html" target="_blank" rel="noopener">politique de confidentialité</a>.</span></label><button id="paSubmit" class="primary">Créer le compte</button>`:`<h2>Connexion</h2><label>E-mail ou pseudo<input id="paIdentifier" maxlength="254" autocomplete="username" required placeholder="ton@email.com ou PixelMaster"></label><label>Mot de passe<input id="paPass" type="password" autocomplete="current-password" required placeholder="Ton mot de passe"></label><button id="paSubmit" class="primary">Se connecter</button>`;
      m.querySelector('#paSubmit').onclick=async()=>{const msg=m.querySelector('#paAuthMsg'),b=m.querySelector('#paSubmit');msg.textContent='';b.disabled=true;try{let r;if(tab==='signup'){const ids=['paEmail','paPseudo','paFirstName','paLastName','paAge','paPass'];if(!ids.every(id=>m.querySelector('#'+id).reportValidity()))throw Error('Vérifie les champs obligatoires.');if(!m.querySelector('#paTerms').checked)throw Error('Tu dois accepter les conditions d’utilisation.');r=await signup(m.querySelector('#paEmail').value,m.querySelector('#paPass').value,{pseudo:m.querySelector('#paPseudo').value,first_name:m.querySelector('#paFirstName').value,last_name:m.querySelector('#paLastName').value,age:m.querySelector('#paAge').value,phone:m.querySelector('#paPhone').value})}else{r=await window.PAAuth.emailLogin(m.querySelector('#paIdentifier').value,m.querySelector('#paPass').value);if(r.logged)await recordLoginContext()}msg.textContent=r.message||((r.pseudo||'Compte')+' connecté !');window.dispatchEvent(new Event('pa-auth-updated'));if(r.logged)setTimeout(()=>m.remove(),700)}catch(e){const raw=String(e?.message||'');if(/invalid login credentials|connexion impossible|identifiants invalides|vérifie.*identifiants|user not found/i.test(raw))msg.textContent='Erreur : pseudo/e-mail ou mot de passe incorrect.';else msg.textContent='Erreur : '+raw}finally{b.disabled=false}};
    }
    form('login');
  }
  function loadDodgeFix(){if(document.body?.dataset.game!=='dodge'||document.querySelector('script[data-pa-dodge-fix]'))return;const s=document.createElement('script');s.src='dodge-fix.js?v=1.0';s.dataset.paDodgeFix='';s.async=false;document.body.appendChild(s)}
  window.PAAuth.emailSignup=signup;
  window.PAAuth.open=()=>{if(state()?.user){location.href='./profile.html';return}modal()};
  async function run(){fixLinks();if(state()?.user)await checkAdmin();renderAdminButton();loadDodgeFix()}
  run();setTimeout(run,300);setTimeout(run,1200);
  window.addEventListener('pa-auth-ready',()=>setTimeout(run,50));window.addEventListener('pa-auth-updated',()=>setTimeout(run,50));
})();
