/* Pixel Dodge — stability/input fixes loaded by site-fix.js */
(()=>{
  'use strict';
  const isDodge=()=>document.body?.dataset?.game==='dodge';
  function install(){
    if(!isDodge()||window.__pixelDodgeFixes)return;
    window.__pixelDodgeFixes=true;
    const canvas=document.getElementById('gameCanvas');
    if(!canvas)return;

    // Prevent mobile browsers from interpreting gameplay gestures as page scrolling/zooming.
    canvas.style.touchAction='none';
    canvas.addEventListener('contextmenu',e=>e.preventDefault());

    // Avoid accidental double activation when a touch generates both pointer and click events.
    let lastPointer=0;
    canvas.addEventListener('pointerdown',()=>{lastPointer=performance.now()},{passive:true});
    document.addEventListener('click',e=>{
      if(performance.now()-lastPointer<350 && e.target.closest('#start,#again,#againAuto,#dashBtn'))e.preventDefault();
    },true);

    // Stop keyboard shortcuts from firing while typing a pseudo.
    document.addEventListener('keydown',e=>{
      const el=e.target;
      if(el && (el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.isContentEditable'))return;
      if(e.code==='Space'||e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='ShiftLeft'||e.code==='ShiftRight')e.preventDefault();
    },true);

    // Keep the game paused while its tab is hidden. This prevents unfair deaths and timer jumps.
    document.addEventListener('visibilitychange',()=>{
      if(!isDodge())return;
      if(document.hidden){
        const pause=document.getElementById('pause');
        const overlay=document.getElementById('pauseOverlay');
        if(window.__pixelDodgeRunningHint!==false && pause && !overlay?.classList.contains('hidden'))return;
        // The game script owns the pause state; trigger its normal pause button only when active.
        if(pause && !document.getElementById('result')?.classList.contains('show') && document.getElementById('startOverlay')?.classList.contains('hidden')){
          pause.click();
          window.__pixelDodgeAutoPaused=true;
        }
      }else if(window.__pixelDodgeAutoPaused){
        window.__pixelDodgeAutoPaused=false;
        document.getElementById('resume')?.click();
      }
    });

    // Recover cleanly if a browser temporarily loses the canvas context.
    canvas.addEventListener('webglcontextlost',e=>e.preventDefault());

    // If an unexpected runtime error occurs during the game, stop the animation loop through
    // the public controls instead of leaving a frozen, half-active screen.
    window.addEventListener('error',e=>{
      if(!isDodge())return;
      if(!e?.error)return;
      const result=document.getElementById('result');
      const start=document.getElementById('startOverlay');
      if(result?.classList.contains('show')||!start?.classList.contains('hidden'))return;
      const msg=document.getElementById('message');
      if(msg)msg.textContent='Une erreur est survenue. Utilise « Recommencer » pour relancer la partie.';
    });

    // Restore focus to the canvas after using gameplay controls, useful on desktop keyboards.
    ['start','resume','again','againAuto','restart'].forEach(id=>{
      document.getElementById(id)?.addEventListener('click',()=>setTimeout(()=>canvas.focus?.(),0));
    });
    canvas.tabIndex=0;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
  else setTimeout(install,100);
})();
