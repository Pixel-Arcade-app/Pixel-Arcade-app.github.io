/* Désactive l'ancien service worker/cache et charge la configuration cloud avant games.js. */
(async()=>{try{if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.unregister()}if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(e){console.warn(e)}})();
document.write('<script src="config.js"></script>');
