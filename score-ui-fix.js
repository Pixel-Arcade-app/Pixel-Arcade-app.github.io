/* Pixel Arcade 9.8 — quand un compte est connecté, le pseudo du score est automatique. */
(()=>{
  const hideConnectedPseudo=()=>{
    const s=window.PAAuth?.state;
    const p=window.PAAuth?.currentPseudo?.()||s?.profile?.pseudo||s?.user?.user?.user_metadata?.pseudo||'';
    if(!s?.user||!p)return;
    const input=document.getElementById('pseudoInput');
    if(input){input.value=p;input.readOnly=true;input.setAttribute('aria-hidden','true');input.style.display='none';input.tabIndex=-1}
    const msg=document.getElementById('saveMsg');
    if(msg)msg.textContent='Enregistrement automatique avec ton pseudo « '+p+' »…';
  };
  const game=document.getElementById('game');
  if(game){new MutationObserver(hideConnectedPseudo).observe(game,{childList:true,subtree:true});}
  window.addEventListener('pa-auth-ready',hideConnectedPseudo);
  window.addEventListener('pa-auth-updated',hideConnectedPseudo);
  setTimeout(hideConnectedPseudo,0);setTimeout(hideConnectedPseudo,50);setTimeout(hideConnectedPseudo,200);
})();
