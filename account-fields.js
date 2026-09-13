/* Pixel Arcade — champs obligatoires du compte et acceptation des documents. */
(()=>{
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function boot(){
    if(!window.PAAuth)return;
    const originalSignup=window.PAAuth.signup;
    const originalLogin=window.PAAuth.login;
    window.PAAuth.signup=async(pseudo,password,details={})=>{
      const p=String(pseudo||'').trim(), first=String(details.first_name||'').trim(), last=String(details.last_name||'').trim(), age=Number(details.age);
      if(!first)throw Error('Le prénom est obligatoire.');
      if(!last)throw Error('Le nom de famille est obligatoire.');
      if(!Number.isInteger(age)||age<1||age>120)throw Error('L’âge doit être un nombre entier compris entre 1 et 120.');
      const profile=await originalSignup(p,password);
      try{
        const updated=await window.PAAuth.updateProfile({first_name:first,last_name:last,age,terms_accepted_at:new Date().toISOString(),privacy_accepted_at:new Date().toISOString()});
        return updated?window.PAAuth.profile():profile;
      }catch(e){throw Error('Le compte a été créé, mais les informations du profil n’ont pas pu être enregistrées. Connecte-toi puis réessaie depuis ton profil.')}
    };
    window.PAAuth.open=()=>{
      if(window.PAAuth.state?.user){window.location.href='profil.html';return}
      if(document.getElementById('paAuthModal'))return;
      const m=document.createElement('div');m.id='paAuthModal';m.className='pa-modal';
      m.innerHTML='<div class="pa-auth-box"><button class="pa-close" aria-label="Fermer">×</button><div class="pa-tabs"><button data-tab="login" class="active">Se connecter</button><button data-tab="signup">Créer un compte</button></div><div id="paAuthForm"></div><p id="paAuthMsg" class="muted"></p></div>';
      document.body.appendChild(m);
      m.querySelector('.pa-close').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()};
      m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>form(b.dataset.tab));
      function form(tab){
        m.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
        const signup=tab==='signup';
        m.querySelector('#paAuthForm').innerHTML=signup?`<h2>Créer mon compte</h2><label>Pseudo<input id="paPseudo" maxlength="20" autocomplete="username" placeholder="Ex. PixelMaster"></label><div class="report-grid"><label class="report-field">Prénom<input id="paFirstName" maxlength="60" autocomplete="given-name" required></label><label class="report-field">Nom de famille<input id="paLastName" maxlength="80" autocomplete="family-name" required></label></div><label>Âge<input id="paAge" type="number" min="1" max="120" inputmode="numeric" autocomplete="bday-year" required></label><label>Mot de passe<input id="paPass" type="password" minlength="8" autocomplete="new-password" placeholder="8 caractères minimum"></label><label class="legal-check"><input id="paTerms" type="checkbox"> <span>J’ai lu et j’accepte les <a href="./conditions-utilisation.html" target="_blank" rel="noopener">conditions d’utilisation</a> et j’ai pris connaissance de la <a href="./politique-confidentialite.html" target="_blank" rel="noopener">politique de confidentialité</a>.</span></label><button id="paSubmit" class="primary">Créer le compte</button>`:`<h2>Connexion</h2><label>Pseudo<input id="paPseudo" maxlength="20" autocomplete="username" placeholder="Ex. PixelMaster"></label><label>Mot de passe<input id="paPass" type="password" minlength="8" autocomplete="current-password" placeholder="8 caractères minimum"></label><button id="paSubmit" class="primary">Se connecter</button>`;
        m.querySelector('#paSubmit').onclick=async()=>{
          const msg=m.querySelector('#paAuthMsg');msg.textContent='';const btn=m.querySelector('#paSubmit');
          try{
            btn.disabled=true;
            const pseudo=m.querySelector('#paPseudo').value, pass=m.querySelector('#paPass').value;
            let p;
            if(signup){
              if(!m.querySelector('#paTerms').checked)throw Error('Tu dois accepter les conditions d’utilisation pour créer un compte.');
              p=await window.PAAuth.signup(pseudo,pass,{first_name:m.querySelector('#paFirstName').value,last_name:m.querySelector('#paLastName').value,age:m.querySelector('#paAge').value});
            }else p=await originalLogin(pseudo,pass);
            msg.textContent='Compte connecté : '+(p?.pseudo||pseudo);
            setTimeout(()=>m.remove(),500);
          }catch(e){msg.textContent='Erreur : '+e.message}finally{btn.disabled=false}
        };
      }
      form('login');
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();
