/* Pixel Arcade — correctifs navigation profil + compte permanent. */
(()=>{
  function fix(){
    document.querySelectorAll('a[href="./profil.html"],a[href="profil.html"]').forEach(a=>a.href='./profile.html');
    const head=document.querySelector('.head-actions');
    if(head&&!document.getElementById('accountBox')){const s=document.createElement('span');s.id='accountBox';head.prepend(s)}
    if(window.PAAuth&&typeof PAAuth.open==='function'&&typeof PAAuth.currentPseudo==='function'){
      const host=document.getElementById('accountBox');if(host){const p=PAAuth.currentPseudo();host.innerHTML=p?`<button class="account-chip" onclick="PAAuth.open()">👤 ${p.replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}</button>`:'<button class="account-chip" onclick="PAAuth.open()">👤 Compte</button>'}
    }
  }
  window.addEventListener('load',()=>setTimeout(fix,80));window.addEventListener('pa-auth-updated',fix);setTimeout(fix,500);
})();
