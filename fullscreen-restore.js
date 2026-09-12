/* Pixel Arcade — restaure la mise en page après la sortie du plein écran. */
(()=>{
  let saved=null;
  function game(){return document.getElementById('game')}
  function save(){const g=game();if(!g||saved)return;saved={width:g.style.width,height:g.style.height,maxWidth:g.style.maxWidth,minHeight:g.style.minHeight,margin:g.style.margin,borderRadius:g.style.borderRadius,background:g.style.background,overflow:g.style.overflow}}
  function restore(){const g=game();if(!g||!saved)return;g.style.width=saved.width;g.style.height=saved.height;g.style.maxWidth=saved.maxWidth;g.style.minHeight=saved.minHeight;g.style.margin=saved.margin;g.style.borderRadius=saved.borderRadius;g.style.background=saved.background;g.style.overflow=saved.overflow;saved=null;document.body.classList.remove('playing')}
  const oldEnter=window.enterGameFullscreen;
  window.enterGameFullscreen=function(){save();return oldEnter?oldEnter.apply(this,arguments):undefined};
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)restore()});
  window.addEventListener('pagehide',()=>{if(!document.fullscreenElement)restore()});
})();
