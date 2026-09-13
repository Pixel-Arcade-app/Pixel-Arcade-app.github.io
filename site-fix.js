/* Pixel Arcade — correctifs navigation profil + compte permanent + écran de score. */
(()=>{
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
  window.addEventListener('load',()=>{setTimeout(loadAccountFix,0);setTimeout(fix,80);setTimeout(watchGame,100)});window.addEventListener('pa-auth-updated',()=>{fix();hideConnectedPseudo()});window.addEventListener('pa-auth-ready',()=>{fix();hideConnectedPseudo()});setTimeout(loadAccountFix,600);setTimeout(fix,800);setTimeout(watchGame,850);
})();
