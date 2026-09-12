/* Pixel Arcade 9.9 — sortie plein écran robuste. */
(()=>{
  let saved=null;
  const game=()=>document.getElementById('game');
  function save(){const g=game();if(!g||saved)return;saved={width:g.style.width,height:g.style.height,maxWidth:g.style.maxWidth,minHeight:g.style.minHeight,margin:g.style.margin,borderRadius:g.style.borderRadius,background:g.style.background,overflow:g.style.overflow};}
  function clearPlaying(){document.body.classList.remove('playing');document.documentElement.classList.remove('playing');}
  function restore(){const g=game();if(g&&saved){g.style.width=saved.width;g.style.height=saved.height;g.style.maxWidth=saved.maxWidth;g.style.minHeight=saved.minHeight;g.style.margin=saved.margin;g.style.borderRadius=saved.borderRadius;g.style.background=saved.background;g.style.overflow=saved.overflow;saved=null;}clearPlaying();if(g)g.removeAttribute('data-fullscreen-active');}
  const oldEnter=window.enterGameFullscreen;
  window.enterGameFullscreen=function(){save();const r=oldEnter?oldEnter.apply(this,arguments):undefined;if(r&&typeof r.finally==='function')r.finally(()=>{if(!document.fullscreenElement)setTimeout(restore,0)});return r;};
  function check(){if(!document.fullscreenElement&&document.body.classList.contains('playing'))restore();}
  ['fullscreenchange','webkitfullscreenchange','MSFullscreenChange'].forEach(ev=>document.addEventListener(ev,()=>{setTimeout(check,0);setTimeout(check,80);setTimeout(check,300)}));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(check,50)});
  window.addEventListener('pageshow',()=>setTimeout(check,50));
  setInterval(check,500);
})();