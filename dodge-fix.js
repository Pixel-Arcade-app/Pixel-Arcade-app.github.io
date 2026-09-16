(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const boot=()=>{
    const c=document.getElementById('gameCanvas'),wrap=c?.parentElement,panel=document.getElementById('gamePanel');
    const start=document.getElementById('start'),overlay=document.getElementById('startOverlay'),result=document.getElementById('result');
    if(!c||!wrap||!start||!overlay||!result||document.getElementById('dodgeFixV2'))return;
    document.documentElement.dataset.dodgeFix='2';
    const style=document.createElement('style');style.id='dodgeFixV2';style.textContent=`
      .wrap>.result{position:absolute!important;inset:0!important;z-index:30!important;margin:0!important;display:none;align-items:center;justify-content:center;flex-direction:column;gap:8px;border-radius:16px;background:rgba(2,6,23,.94);backdrop-filter:blur(8px);overflow:auto;box-sizing:border-box}
      .wrap>.result.show{display:flex!important}
      .dodge-mobile-controls{display:none;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:8px}
      .dodge-mobile-controls button{min-height:48px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:11px;font-weight:900;touch-action:none}
      .dodge-mobile-controls .pause{grid-column:1/-1}
      @media(max-width:820px){.dodge-mobile-controls{display:grid}.dodge-mobile-controls button{font-size:14px}.hud{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important}.stat{min-width:0!important}.stat b{font-size:1rem!important}.stat span{font-size:.68rem!important}}
      @media(max-width:560px){.dodge-mobile-controls{grid-template-columns:1fr 1fr 1fr}.dodge-mobile-controls button{min-height:50px}.hud{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    `;document.head.appendChild(style);

    // Critical fix: some late-loaded scripts can leave the start overlay visible
    // even though the start/achievement handlers have fired. Keep the original
    // game handler, but guarantee that a successful click cannot leave the overlay.
    const originalStart=start.onclick;
    start.onclick=function(e){
      let err=null;
      try{if(typeof originalStart==='function')return originalStart.call(this,e)}catch(ex){err=ex;console.error('[Pixel Dodge] start error',ex)}
      finally{setTimeout(()=>{
        if(!overlay.classList.contains('hidden')){
          overlay.classList.add('hidden');
          overlay.style.display='none';
        }
        c.focus?.({preventScroll:true});
      },60)}
      if(err)throw err;
    };

    // If another script replaces onclick after this file loads, re-wrap it once.
    let wrapped=start.onclick;
    const observer=new MutationObserver(()=>{
      if(start.onclick!==wrapped){
        const fn=start.onclick;
        start.onclick=function(e){
          try{if(typeof fn==='function')return fn.call(this,e)}finally{setTimeout(()=>{if(!overlay.classList.contains('hidden')){overlay.classList.add('hidden');overlay.style.display='none'}},60)}};
        wrapped=start.onclick;
      }
    });
    observer.observe(start,{attributes:true,attributeFilter:['onclick']});

    // Result belongs over the canvas, not below the game.
    const moveResult=()=>{if(result.parentElement!==wrap)wrap.appendChild(result);result.style.position='absolute';result.style.inset='0'};
    moveResult();
    new MutationObserver(moveResult).observe(panel||wrap,{childList:true,subtree:true});

    // Mobile controls.
    const controls=document.createElement('div');controls.className='dodge-mobile-controls';
    controls.innerHTML='<button data-key="ArrowLeft">◀ Gauche</button><button data-dash>⚡ Dash</button><button data-key="ArrowRight">Droite ▶</button><button class="pause">⏸ Pause / Reprendre</button>';
    wrap.appendChild(controls);
    const key=(k,type)=>window.dispatchEvent(new KeyboardEvent(type,{key:k,bubbles:true}));
    controls.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();key(k,'keydown')});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>key(k,'keyup')))});
    const db=controls.querySelector('[data-dash]');db.addEventListener('pointerdown',e=>{e.preventDefault();key('Shift','keydown')});['pointerup','pointercancel','pointerleave'].forEach(t=>db.addEventListener(t,()=>key('Shift','keyup')));
    controls.querySelector('.pause').onclick=()=>document.getElementById('pause')?.click();

    // Prevent page scrolling/zoom gestures from interfering with the game.
    c.style.touchAction='none';c.tabIndex=0;c.setAttribute('role','application');c.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('keydown',e=>{if(panel?.contains(e.target)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Shift'].includes(e.key))e.preventDefault()});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&!document.getElementById('pauseOverlay')?.classList.contains('hidden'))return;if(document.hidden)document.getElementById('pause')?.click()});

    // Keyboard shortcut to return to the difficulty screen after a result.
    document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&result.classList.contains('show')&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();document.getElementById('again')?.click()}});

    // Load the progression/achievement layer exactly once.
    if(!document.getElementById('dodgeContentLoader')){const s=document.createElement('script');s.id='dodgeContentLoader';s.src='./dodge-content.js?v=2';document.head.appendChild(s)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();