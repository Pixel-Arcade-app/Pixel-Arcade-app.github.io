/* Pixel Arcade 10.0 — plein écran propre, sans laisser de dimensions inline. */
(()=>{
  const normalise=()=>{
    const g=document.getElementById('game');
    document.body.classList.remove('playing');
    if(!g)return;
    ['width','height','max-width','min-height','margin','border-radius','background','overflow'].forEach(p=>g.style.removeProperty(p));
    g.removeAttribute('data-fullscreen');
    // Certaines anciennes règles peuvent avoir modifié le parent.
    const wrap=g.parentElement;
    if(wrap) ['height','min-height','max-height','overflow'].forEach(p=>wrap.style.removeProperty(p));
    requestAnimationFrame(()=>{
      ['width','height','max-width','min-height','margin','border-radius','background','overflow'].forEach(p=>g.style.removeProperty(p));
      document.body.classList.remove('playing');
    });
  };
  window.enterGameFullscreen=async()=>{
    const g=document.getElementById('game');
    if(!g)return;
    if(document.fullscreenElement)return;
    try{
      await g.requestFullscreen({navigationUI:'hide'});
      document.body.classList.add('playing');
    }catch(e){document.body.classList.remove('playing')}
  };
  window.exitGameFullscreen=async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen()}catch{}
    normalise();
  };
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement){document.body.classList.add('playing');}
    else {normalise();setTimeout(normalise,80);setTimeout(normalise,300);}
  });
  window.addEventListener('resize',()=>{if(!document.fullscreenElement)normalise()});
})();
