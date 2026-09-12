/* Pixel Arcade 10.2 — nettoyage des anciens correctifs. */
(async()=>{try{if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.unregister()}if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(e){console.warn(e)}})();
/* Charge la configuration avant games.js. */
document.write('<script src="config.js?v=10.2"></script>');
/* IMPORTANT : ne jamais lancer un jeu automatiquement au chargement de la page.
   Le jeu doit démarrer uniquement après un clic sur « Lancer le jeu ».
   Les anciens bootstrap/fullscreen-fix sont volontairement désactivés ici. */
