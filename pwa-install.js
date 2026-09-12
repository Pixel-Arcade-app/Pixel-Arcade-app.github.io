/* Pixel Arcade — installation PWA Chrome. */
(()=>{
  let deferredPrompt=null;
  const isMain=location.pathname.endsWith('/index.html')||location.pathname.endsWith('/');
  if(!isMain)return;
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredPrompt=event;
    showInstallButton();
  });
  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    const btn=document.getElementById('paInstallButton');
    if(btn)btn.remove();
  });
  function showInstallButton(){
    if(document.getElementById('paInstallButton'))return;
    const main=document.querySelector('main');
    if(!main)return;
    const panel=document.createElement('section');
    panel.className='panel';
    panel.style.cssText='margin:24px 0;padding:22px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap';
    panel.innerHTML='<div><span class="tag">APPLICATION</span><h2 style="margin:8px 0 6px">Pixel Arcade pour Chrome</h2><p class="muted" style="margin:0">Installe Pixel Arcade comme une application, puis ouvre-la directement depuis Chrome.</p></div><button id="paInstallButton" class="primary" type="button">Ouvrir dans l’appli</button>';
    const hero=main.querySelector('.hero-panel');
    main.insertBefore(panel,hero?hero.nextSibling:main.firstChild);
    panel.querySelector('#paInstallButton').addEventListener('click',async()=>{
      if(!deferredPrompt)return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null;
      panel.remove();
    });
  }
  window.addEventListener('load',()=>{
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
})();
