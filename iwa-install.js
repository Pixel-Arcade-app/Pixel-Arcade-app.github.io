/* Pixel Arcade — bouton de téléchargement IWA sur la page principale. */
(()=>{
  if(location.pathname.endsWith('/index.html')||location.pathname.endsWith('/')){
    window.addEventListener('load',()=>{
      if(document.getElementById('iwaDownloadPanel'))return;
      const panel=document.createElement('section');
      panel.id='iwaDownloadPanel';
      panel.className='panel';
      panel.style.cssText='margin:24px 0;padding:22px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap';
      panel.innerHTML='<div><span class="tag">APPLICATION</span><h2 style="margin:8px 0 6px">Pixel Arcade pour Chrome</h2><p class="muted" style="margin:0">Télécharge la version IWA signée de Pixel Arcade.</p></div><a class="primary" href="./iwa/pixel-arcade-latest.swbn" download="pixel-arcade.swbn" style="display:inline-flex;align-items:center;text-decoration:none">Télécharger l’IWA</a>';
      const main=document.querySelector('main');
      const hero=main&&main.querySelector('.hero-panel');
      if(main)main.insertBefore(panel,hero?hero.nextSibling:main.firstChild);
    });
  }
})();
