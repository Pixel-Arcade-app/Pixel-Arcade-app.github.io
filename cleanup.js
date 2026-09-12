/* Nettoyage de l'ancien cache/service worker + configuration + correctif fullscreen. */
(async()=>{try{if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.unregister()}if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(e){console.warn(e)}})();
document.write('<script src="config.js"></script>');
window.addEventListener('load',()=>{const s=document.createElement('script');s.src='fullscreen-fix.js?v=8.2';document.body.appendChild(s)});
