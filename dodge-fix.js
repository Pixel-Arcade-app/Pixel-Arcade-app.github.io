(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const ready=()=>{
    const c=document.getElementById('gameCanvas'),panel=document.getElementById('gamePanel'),result=document.getElementById('result'),overlay=document.getElementById('startOverlay');
    if(!c||!panel||!result||!overlay||document.getElementById('dodgeMobileFix'))return;

    const css=document.createElement('style');
    css.id='dodgeMobileFix';
    css.textContent=`
      body[data-game="dodge"] .pa-theme-fab{top:55px!important;right:18px!important}
      .dodge-mobile-fix{display:none;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:9px 0 0;user-select:none}
      .dodge-mobile-fix button{min-height:50px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:12px;font-weight:900;font-size:15px;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .dodge-mobile-fix button:active{border-color:#22d3ee;transform:scale(.97)}
      .dodge-mobile-fix .mobile-pause{grid-column:1/-1;min-height:45px}
      body.light .dodge-mobile-fix button{background:#fff;color:#172033;border-color:#ccd7e5}
      .wrap>.result{position:absolute!important;inset:0!important;z-index:30!important;margin:0!important;display:none;align-items:center;justify-content:center;flex-direction:column;gap:8px;border-radius:16px;background:rgba(2,6,23,.94);backdrop-filter:blur(8px);padding:clamp(14px,4vw,26px);text-align:center;overflow:auto;overscroll-behavior:contain;box-sizing:border-box}
      .wrap>.result.show{display:flex!important}
      .wrap>.result h2{margin:0;font-size:clamp(1.35rem,5vw,2rem)}
      .wrap>.result p{margin:5px 0;line-height:1.5}
      .wrap>.result input{background:#0c1424;color:#fff;border:1px solid #475569;max-width:100%;font-size:16px}
      .wrap>.result .result-actions{justify-content:center;align-items:center;flex-wrap:wrap;gap:8px}
      .wrap>.result button{min-height:46px}
      body.light .wrap>.result{background:rgba(255,255,255,.96);color:#172033}
      body.light .wrap>.result input{background:#fff;color:#172033;border-color:#cbd5e1}
      .dodge-difficulty-badge{display:inline-flex;align-items:center;gap:6px;margin:8px 0 0;padding:5px 10px;border-radius:999px;border:1px solid #334155;background:#0d1424;color:#cbd5e1;font-size:.78rem;font-weight:900}
      .dodge-difficulty-badge[data-diff="easy"]{border-color:#4ade80;color:#4ade80}.dodge-difficulty-badge[data-diff="normal"]{border-color:#22d3ee;color:#67e8f9}.dodge-difficulty-badge[data-diff="hard"]{border-color:#fb7185;color:#fb7185}
      body.light .dodge-difficulty-badge{background:#fff}
      #dodgeDifficultyHint{margin:6px 0 0;color:#91a4bd;font-size:.78rem;line-height:1.35}
      body.light #dodgeDifficultyHint{color:#5b6b82}
      @media(prefers-reduced-motion:reduce){body[data-game="dodge"] *{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}
      @media(max-width:820px){
        body[data-game="dodge"] .pa-theme-fab{top:50px!important;right:12px!important}
        .dodge-mobile-fix{display:grid!important}
        #gamePanel{padding:10px!important}
        #gamePanel .layout{display:flex!important;flex-direction:column!important;gap:9px!important;width:100%!important}
        #gamePanel .stage,#gamePanel .wrap{width:100%!important;min-width:0!important}
        #gamePanel #gameCanvas{display:block!important;width:100%!important;height:auto!important;aspect-ratio:16/9!important;max-width:100%!important}
        #gamePanel aside.hud{display:grid!important;position:static!important;width:100%!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:7px!important;align-items:stretch!important}
        #gamePanel aside.hud .stat{min-width:0!important;width:auto!important;min-height:0!important;height:auto!important;padding:8px 5px!important;border-radius:11px!important}
        #gamePanel aside.hud .stat b{font-size:1.05rem!important;line-height:1.15!important}
        #gamePanel aside.hud .stat span{font-size:.68rem!important;line-height:1.1!important}
        #gamePanel aside.hud .mission{grid-column:1/-1!important;width:auto!important;min-height:0!important;padding:8px!important}
        #gamePanel .tools{display:flex!important;justify-content:center!important;margin-top:7px!important}
        #gamePanel .tools .tool{min-height:44px!important;padding:9px 12px!important}
      }
      @media(max-width:560px){
        body[data-game="dodge"] .pa-theme-fab{top:46px!important;right:10px!important}
        .shell{width:calc(100% - 10px)!important;margin:7px auto 30px!important}
        .top{gap:7px!important}.top h1{font-size:1.65rem!important}.top p{font-size:.82rem!important}
        .top .actions{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:5px!important}
        .top .actions .btn{padding:9px 5px!important;font-size:12px!important;min-height:42px!important;text-align:center!important}
        #gamePanel{padding:7px!important;border-radius:15px!important}
        #gamePanel .description{padding:9px 10px!important;margin:6px 0 8px!important}
        #gamePanel .description p{font-size:.82rem!important}
        #gamePanel .keys{font-size:.72rem!important;gap:4px!important}
        #gamePanel .key,#gamePanel .badge{padding:4px 6px!important;font-size:.7rem!important}
        #gamePanel .layout{gap:7px!important}
        #gamePanel aside.hud{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important}
        #gamePanel aside.hud .stat{padding:7px 3px!important;border-radius:9px!important}
        #gamePanel aside.hud .stat b{font-size:.9rem!important}
        #gamePanel aside.hud .stat span{font-size:.6rem!important}
        #gamePanel aside.hud .mission{padding:7px 6px!important}
        #gamePanel aside.hud .mission small{font-size:.67rem!important}
        #gamePanel .tools{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important}
        #gamePanel .tools .tool{width:100%!important;font-size:13px!important}
        .dodge-mobile-fix{grid-template-columns:1fr 1fr 1fr!important;gap:6px!important;margin-top:7px!important}
        .dodge-mobile-fix button{min-height:50px!important;font-size:14px!important}
        .dodge-mobile-fix .mobile-pause{min-height:44px!important}
        .wrap>.result{padding:10px!important}.wrap>.result h2{font-size:1.25rem!important}.wrap>.result p{font-size:.82rem!important}.wrap>.result .result-actions{width:100%!important}.wrap>.result .result-actions button{width:100%!important}.wrap>.result input{width:100%!important}
        .rank{margin-top:9px!important}.rank h2{font-size:1.15rem!important}
        .dodge-difficulty-badge{font-size:.72rem!important;padding:4px 8px!important}
      }
      @media(max-width:360px){#gamePanel aside.hud .stat b{font-size:.82rem!important}.dodge-mobile-fix button{font-size:13px!important}.top .actions{grid-template-columns:1fr 1fr!important}.top .actions .btn:last-child{grid-column:1/-1}}
      @media(pointer:coarse){#gamePanel .game{cursor:default!important}}
    `;
    document.head.appendChild(css);

    const controls=document.createElement('div');
    controls.id='dodgeMobileFix';
    controls.className='dodge-mobile-fix';
    controls.innerHTML='<button data-k="ArrowLeft" aria-label="Déplacer à gauche">◀ Gauche</button><button data-dash aria-label="Activer le dash">Dash</button><button data-k="ArrowRight" aria-label="Déplacer à droite">Droite ▶</button><button class="mobile-pause" type="button" aria-label="Mettre le jeu en pause ou reprendre">Pause / Reprendre</button>';
    c.parentElement.appendChild(controls);

    const key=(k,type)=>window.dispatchEvent(new KeyboardEvent(type,{key:k,bubbles:true}));
    const buzz=()=>{try{navigator.vibrate?.(10)}catch{}};
    controls.querySelectorAll('[data-k]').forEach(btn=>{
      const k=btn.dataset.k;
      btn.addEventListener('pointerdown',e=>{e.preventDefault();buzz();key(k,'keydown')});
      ['pointerup','pointercancel','pointerleave'].forEach(t=>btn.addEventListener(t,()=>key(k,'keyup')));
    });
    const dash=controls.querySelector('[data-dash]');
    dash.addEventListener('pointerdown',e=>{e.preventDefault();buzz();key('Shift','keydown')});
    ['pointerup','pointercancel','pointerleave'].forEach(t=>dash.addEventListener(t,()=>key('Shift','keyup')));
    controls.querySelector('.mobile-pause').addEventListener('click',e=>{e.preventDefault();buzz();document.getElementById('pause')?.click()});

    const tip=document.createElement('div');
    tip.style.cssText='margin:6px 0 0;color:#91a4bd;font-size:.74rem;text-align:center';
    tip.textContent='Commandes tactiles : gauche · dash · droite · pause';
    c.parentElement.appendChild(tip);

    const moveResult=()=>{
      if(result.parentElement!==c.parentElement)c.parentElement.appendChild(result);
      result.style.position='absolute';result.style.inset='0';result.style.zIndex='30';
    };
    moveResult();
    new MutationObserver(moveResult).observe(panel,{childList:true,subtree:true});

    const diffNames={easy:'Facile',normal:'Normal',hard:'Difficile'};
    const diffHints={easy:'Plus de marge d’erreur et un rythme plus doux.',normal:'Le réglage équilibré.',hard:'Vagues plus rapides et moins de vies.'};
    let currentDiff=document.querySelector('#startOverlay .difficulty button.active')?.dataset.diff||'normal';
    const bestKey=d=>`pixelDodgeBest_${d}`;
    const bestFor=d=>Number(localStorage.getItem(bestKey(d))||0);
    const bestEl=document.getElementById('best');
    const title=document.querySelector('.top h1');
    const badge=document.createElement('span');badge.id='dodgeDifficultyBadge';badge.className='dodge-difficulty-badge';
    const hint=document.createElement('div');hint.id='dodgeDifficultyHint';
    if(title)title.insertAdjacentElement('afterend',badge);
    if(badge)badge.insertAdjacentElement('afterend',hint);
    const updateDiff=d=>{
      currentDiff=diffNames[d]?d:'normal';
      badge.dataset.diff=currentDiff;badge.textContent='Difficulté : '+diffNames[currentDiff];
      hint.textContent=diffHints[currentDiff];
      if(bestEl)bestEl.textContent=bestFor(currentDiff).toLocaleString('fr-FR');
      document.querySelectorAll('#startOverlay .difficulty button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.diff===currentDiff?'true':'false'));
    };
    document.querySelectorAll('#startOverlay .difficulty button').forEach(b=>b.addEventListener('click',()=>updateDiff(b.dataset.diff)));
    updateDiff(currentDiff);

    ['score','time','level','combo','lives','dash','wave','best','missionText'].forEach(id=>document.getElementById(id)?.setAttribute('aria-live','polite'));
    document.getElementById('score')?.setAttribute('aria-label','Score actuel');
    document.getElementById('lives')?.setAttribute('aria-label','Vies restantes');
    document.getElementById('dash')?.setAttribute('aria-label','Énergie de dash');

    const saveLocalBest=()=>{
      const n=Number(document.getElementById('finalScore')?.textContent||0);
      if(n>bestFor(currentDiff))localStorage.setItem(bestKey(currentDiff),String(n));
      if(bestEl)bestEl.textContent=bestFor(currentDiff).toLocaleString('fr-FR');
    };
    new MutationObserver(()=>{
      if(result.classList.contains('show')){
        saveLocalBest();
        result.setAttribute('role','dialog');result.setAttribute('aria-modal','true');result.setAttribute('aria-label','Partie terminée');
      }
    }).observe(result,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});

    const chooseDifficulty=()=>{
      result.classList.remove('show');result.style.display='none';
      overlay.classList.remove('hidden');overlay.style.display='flex';
      overlay.scrollIntoView({block:'center',behavior:'smooth'});
      const active=document.querySelector(`#startOverlay .difficulty button[data-diff="${currentDiff}"]`);
      active?.focus?.();
    };
    ['again','againAuto'].forEach(id=>document.getElementById(id)?.addEventListener('click',chooseDifficulty,true));
    document.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()==='r'&&result.classList.contains('show')&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();chooseDifficulty()}
    });

    let touchX=0,touchStart=0;
    c.addEventListener('touchstart',e=>{const t=e.changedTouches[0];touchX=t.clientX;touchStart=performance.now()},{passive:true});
    c.addEventListener('touchend',e=>{
      const t=e.changedTouches[0],dx=t.clientX-touchX,dt=performance.now()-touchStart;
      if(Math.abs(dx)<24||dt>700)return;
      key(dx<0?'ArrowLeft':'ArrowRight','keydown');setTimeout(()=>key(dx<0?'ArrowLeft':'ArrowRight','keyup'),100);
    },{passive:true});

    document.addEventListener('dblclick',e=>{if(e.target.closest('#gamePanel'))e.preventDefault()},{passive:false});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();

// Extension de contenu gameplay : défis, succès et progression locale.
if(document.body?.dataset.game==='dodge'&&!document.getElementById('dodgeContentLoader')){
  const s=document.createElement('script');
  s.id='dodgeContentLoader';
  s.src='./dodge-content.js?v=1';
  document.head.appendChild(s);
}
