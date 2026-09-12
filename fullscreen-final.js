/* Pixel Arcade 10.1 — fullscreen: le navigateur gère la taille, le site ne force aucune dimension inline. */
(()=>{
  const clean=()=>{
    const g=document.getElementById('game');
    document.body.classList.remove('playing');
    if(!g)return;
    ['width','height','max-width','min-height','margin','border-radius','background','overflow','position','inset'].forEach(p=>g.style.removeProperty(p));
    const wrap=g.parentElement;
    if(wrap) ['width','height','max-width','min-height','max-height','margin','overflow','position','inset'].forEach(p=>wrap.style.removeProperty(p));
  };
  window.enterGameFullscreen=async()=>{
    const g=document.getElementById('game');if(!g||document.fullscreenElement)return;
    try{await g.requestFullscreen({navigationUI:'hide'});document.body.classList.add('playing');}
    catch(e){document.body.classList.remove('playing');}
  };
  window.exitGameFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen()}catch{}clean();};
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement)document.body.classList.add('playing');
    else {clean();requestAnimationFrame(clean);setTimeout(clean,120);}
  });
  window.addEventListener('pageshow',clean);
})();
