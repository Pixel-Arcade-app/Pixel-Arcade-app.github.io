/* Pixel Arcade 10.1 — nettoyage + bootstrap des anciennes pages de jeux. */
(async()=>{try{if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.unregister()}if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(e){console.warn(e)}})();
/* Charge la configuration avant games.js. */
document.write('<script src="config.js?v=10.1"></script>');
window.addEventListener('load',()=>{
  const oldFix=document.createElement('script');oldFix.src='fullscreen-fix.js?v=10.1';document.body.appendChild(oldFix);
  /* Certaines anciennes pages n'ont pas de bouton « Lancer » et restent sur « Chargement du jeu… ».
     On les lance automatiquement une fois tous les scripts de la page chargés. */
  let tries=0;const boot=setInterval(()=>{
    tries++;
    const game=document.getElementById('game'), launch=document.getElementById('launchBtn'), bodyGame=document.body?.dataset?.game;
    if(!bodyGame||launch){clearInterval(boot);return}
    if(game && /Chargement du jeu/i.test(game.textContent||'') && typeof window.launchGame==='function'){
      clearInterval(boot);try{window.launchGame()}catch(e){console.error('Impossible de lancer le jeu:',e)}return;
    }
    if(tries>50)clearInterval(boot);
  },100);
});
