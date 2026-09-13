/* Pixel Arcade — correctifs navigation profil + compte permanent + écran de score + thème global. */
(()=>{
  const isAdmin=location.pathname.replace(/\\/g,'/').toLowerCase().endsWith('/admin.html');

  function installThemeCss(){
    if(document.getElementById('pa-theme-css'))return;
    const s=document.createElement('style');s.id='pa-theme-css';
    s.textContent=`
      body.light:not(.pa-admin){
        --bg:#f3f6fb;--p:#ffffff;--p2:#eef3f9;--line:#d4ddea;--txt:#172033;--muted:#5b6b82;
        background:radial-gradient(circle at 8% -8%,#e7eaff 0,transparent 34%),linear-gradient(180deg,#f9fbff 0%,#eef3f9 100%) !important;
      }
      body.light:not(.pa-admin) header{background:rgba(255,255,255,.88);backdrop-filter:blur(12px);border-color:#d7dfeb}
      body.light:not(.pa-admin) .status{background:#fff;color:#26334a;border-color:#d3ddea;box-shadow:0 3px 12px rgba(36,52,78,.06)}
      body.light:not(.pa-admin) .toolbar{filter:drop-shadow(0 3px 8px rgba(36,52,78,.04))}
      body.light:not(.pa-admin) .filter,body.light:not(.pa-admin) .back,body.light:not(.pa-admin) .small,body.light:not(.pa-admin) .theme{background:#fff!important;color:#172033!important;border-color:#ccd7e5!important}
      body.light:not(.pa-admin) .filter.active,body.light:not(.pa-admin) .primary{color:#fff!important}
      body.light:not(.pa-admin) .card{background:linear-gradient(145deg,#fff,#f8faff)!important;border-color:#d3ddea!important;box-shadow:0 8px 24px rgba(38,55,84,.07)}
      body.light:not(.pa-admin) .card:hover{border-color:#8b96ff!important;box-shadow:0 12px 28px rgba(74,86,185,.13)}
      body.light:not(.pa-admin) .panel{background:rgba(255,255,255,.94)!important;border-color:#d3ddea!important;box-shadow:0 8px 28px rgba(38,55,84,.06)}
      body.light:not(.pa-admin) .hero-panel{background:linear-gradient(135deg,#eef0ff,#fff)!important;border-color:#d5dcf0;box-shadow:0 8px 28px rgba(61,72,160,.08)}
      body.light:not(.pa-admin) .controls{background:#f2f6fb!important;border-color:#d5deea}
      body.light:not(.pa-admin) .row{background:#fff!important;color:#172033!important;border:1px solid #dbe2eb;box-shadow:0 2px 8px rgba(30,43,65,.04)}
      body.light:not(.pa-admin) .row span,body.light:not(.pa-admin) .row b{color:#172033!important}
      body.light:not(.pa-admin) .stat{background:#f7f9fc!important;color:#172033!important;border-color:#d7dfeb!important}
      body.light:not(.pa-admin) .stat b,body.light:not(.pa-admin) .stat span{color:#172033!important}
      body.light:not(.pa-admin) .scorebox{background:#fff!important;color:#172033!important;border-color:#d5deea!important}
      body.light:not(.pa-admin) .finish{background:#fff!important;color:#172033!important;border-color:#d5deea!important;box-shadow:0 12px 32px rgba(30,43,65,.08)}
      body.light:not(.pa-admin) .desc{background:#f2f6fb!important;color:#40516a!important;border-color:#d5deea!important}
      body.light:not(.pa-admin) .desc strong{color:#172033!important}
      body.light:not(.pa-admin) .achievement{background:#f3f6fb!important;color:#314158!important;border:1px solid #d9e1eb}
      body.light:not(.pa-admin) .click-main,body.light:not(.pa-admin) .click-side{background:linear-gradient(145deg,#fff,#f5f8fd)!important;color:#172033!important;border-color:#d5deea!important;box-shadow:0 8px 24px rgba(30,43,65,.06)}
      body.light:not(.pa-admin) .upgrade{background:#f7f9fc!important;color:#172033!important;border-color:#d5deea!important}
      body.light:not(.pa-admin) .upgrade small,body.light:not(.pa-admin) .persec{color:#5b6b82!important}
      body.light:not(.pa-admin) .combo-bar{background:#dfe6f0}
      body.light:not(.pa-admin) .lab-head span{background:#eef1ff;color:#4f5bb7}
      body.light:not(.pa-admin) .favorite-btn{background:#fff!important;color:#172033!important;border-color:#ccd7e5!important}
      body.light:not(.pa-admin) footer{color:#607089!important;border-color:#d7dfeb!important}
      body.light:not(.pa-admin) footer [data-pa-author]{opacity:.9}
      .pa-theme-toggle{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:8px 12px;border-radius:999px;border:1px solid var(--line);background:var(--p);color:var(--txt);font:inherit;font-weight:800;cursor:pointer;box-shadow:0 3px 10px rgba(20,30,50,.08)}
      .pa-theme-toggle:hover{transform:translateY(-1px)}
      .pa-theme-fab{position:fixed;right:18px;top:18px;z-index:9998}
      @media(max-width:700px){.pa-theme-fab{right:12px;top:12px}.pa-theme-toggle{padding:7px 10px;font-size:12px}}
      .playing .pa-theme-fab{display:none}
    `;
    document.head.appendChild(s);
  }

  function applyTheme(){
    if(isAdmin){document.body.classList.remove('light');document.body.classList.add('pa-admin');return}
    document.body.classList.remove('pa-admin');
    const saved=localStorage.getItem('pa_theme');
    document.body.classList.toggle('light',saved!=='dark');
  }

  function addThemeToggle(){
    if(isAdmin)return;
    let b=document.getElementById('paThemeToggle')||document.getElementById('themeBtn');
    if(!b){
      b=document.createElement('button');b.type='button';
      const head=document.querySelector('.head-actions');
      if(head)head.appendChild(b);else{const wrap=document.createElement('div');wrap.className='pa-theme-fab';wrap.appendChild(b);document.body.appendChild(wrap)}
    }
    b.id='paThemeToggle';b.classList.add('pa-theme-toggle');b.removeAttribute('onclick');
    if(!b.__paThemeBound){
      b.addEventListener('click',()=>{
        const light=!document.body.classList.contains('light');
        document.body.classList.toggle('light',light);
        localStorage.setItem('pa_theme',light?'light':'dark');
        updateThemeLabel();
      });
      b.__paThemeBound=true;
    }
    updateThemeLabel();
  }

  function updateThemeLabel(){
    const b=document.getElementById('paThemeToggle');if(!b)return;
    const light=document.body.classList.contains('light');
    b.textContent=light?'Mode sombre':'Mode clair';
    b.setAttribute('aria-label',light?'Activer le mode sombre':'Activer le mode clair');
    b.title=light?'Passer au mode sombre':'Passer au mode clair';
  }

  function fix(){
    document.querySelectorAll('a[href="./profil.html"],a[href="profil.html"]').forEach(a=>a.href='./profile.html');
    const head=document.querySelector('.head-actions');
    if(head&&!document.getElementById('accountBox')){const s=document.createElement('span');s.id='accountBox';head.prepend(s)}
    if(window.PAAuth&&typeof PAAuth.open==='function'&&typeof PAAuth.currentPseudo==='function'){
      const host=document.getElementById('accountBox');if(host){const p=PAAuth.currentPseudo();host.innerHTML=p?`<button class="account-chip" onclick="PAAuth.open()">${p.replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}</button>`:'<button class="account-chip" onclick="PAAuth.open()">Compte</button>'}
    }
  }
  function hideConnectedPseudo(){
    const s=window.PAAuth?.state;
    const p=window.PAAuth?.currentPseudo?.()||s?.profile?.pseudo||s?.user?.user?.user_metadata?.pseudo||'';
    if(!s?.user||!p)return;
    const input=document.getElementById('pseudoInput');
    if(input){input.value=p;input.readOnly=true;input.style.display='none';input.tabIndex=-1}
  }
  function watchGame(){const game=document.getElementById('game');if(!game||game.__paScoreWatch)return;game.__paScoreWatch=true;new MutationObserver(hideConnectedPseudo).observe(game,{childList:true,subtree:true});hideConnectedPseudo()}
  function loadAccountFix(){if(document.querySelector('script[data-pa-auth-fix]'))return;const s=document.createElement('script');s.src='auth-fix.js?v=10.9';s.dataset.paAuthFix='';s.async=false;document.body.appendChild(s)}

  function start(){
    installThemeCss();
    applyTheme();
    addThemeToggle();
    fix();
    watchGame();
    if(!isAdmin)setTimeout(()=>{applyTheme();updateThemeLabel()},50);
  }
  window.addEventListener('load',()=>{setTimeout(loadAccountFix,0);setTimeout(start,30);setTimeout(fix,100);setTimeout(watchGame,120)});
  window.addEventListener('pa-auth-updated',()=>{fix();hideConnectedPseudo();addThemeToggle();updateThemeLabel()});
  window.addEventListener('pa-auth-ready',()=>{fix();hideConnectedPseudo();addThemeToggle();updateThemeLabel()});
  setTimeout(loadAccountFix,600);setTimeout(start,700);setTimeout(fix,800);setTimeout(watchGame,850);
})();
