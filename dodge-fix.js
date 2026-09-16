(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const ready=()=>{
    const c=document.getElementById('gameCanvas'),panel=document.getElementById('gamePanel'),result=document.getElementById('result');
    if(!c||!panel||!result||document.getElementById('dodgeMobileFix'))return;
    const style=document.createElement('style');style.id='dodgeMobileFix';style.textContent=`
      body[data-game="dodge"] .pa-theme-fab{top:55px!important;right:18px!important}
      .dodge-mobile-fix{display:none;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:9px;user-select:none}
      .dodge-mobile-fix button{min-height:48px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:12px;font-weight:900;font-size:15px;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .dodge-mobile-fix button:active{border-color:#22d3ee;transform:scale(.98)}
      .dodge-mobile-fix .mobile-pause{grid-column:1/-1;min-height:44px}
      body.light .dodge-mobile-fix button{background:#fff;color:#172033;border-color:#ccd7e5}
      .wrap>.result{position:absolute!important;inset:0!important;z-index:20!important;margin:0!important;display:none;align-items:center;justify-content:center;border-radius:16px;background:rgba(2,6,23,.92);backdrop-filter:blur(6px);padding:clamp(12px,4vw,22px);text-align:center;overflow:auto;overscroll-behavior:contain;box-sizing:border-box}
      .wrap>.result.show{display:flex!important}.wrap>.result{flex-direction:column;gap:7px}.wrap>.result h2{margin:0;font-size:clamp(1.35rem,5vw,2rem)}.wrap>.result p{margin:5px 0;line-height:1.5}.wrap>.result input{background:#0c1424;color:#fff;border:1px solid #475569;max-width:100%;font-size:16px}.wrap>.result .result-actions{justify-content:center;align-items:center;flex-wrap:wrap}.wrap>.result button{min-height:44px}.wrap>.result #manualScore,.wrap>.result #autoScore{width:min(100%,520px)}body.light .wrap>.result{background:rgba(255,255,255,.94);color:#172033;border-color:#d5deea}body.light .wrap>.result input{background:#fff;color:#172033;border-color:#cbd5e1}
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
        #gamePanel .stage{width:100%!important;min-width:0!important}
        #gamePanel .wrap{width:100%!important}
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
        .dodge-mobile-fix button{min-height:48px!important;font-size:14px!important}
        .dodge-mobile-fix .mobile-pause{min-height:43px!important}
        .wrap>.result{padding:9px!important}.wrap>.result h2{font-size:1.25rem!important}.wrap>.result p{font-size:.82rem!important}.wrap>.result input{margin:5px 0!important;width:100%!important}.wrap>.result .result-actions{gap:6px!important}.wrap>.result .result-actions button{width:100%!important}.wrap>.result #manualScore,.wrap>.result #autoScore{max-width:300px!important}
        .rank{margin-top:9px!important}.rank h2{font-size:1.15rem!important}
        .dodge-difficulty-badge{font-size:.72rem!important;padding:4px 8px!important}
      }
      @media(max-width:360px){#gamePanel aside.hud{grid-template-columns:repeat(4,minmax(0,1fr))!important}#gamePanel aside.hud .stat b{font-size:.82rem!important}.dodge-mobile-fix button{font-size:13px!important}.top .actions{grid-template-columns:1fr 1fr!important}.top .actions .btn:last-child{grid-column:1/-1}}
      @media(pointer:coarse){#gamePanel .game{cursor:default!important}}
    `;document.head.appendChild(style);
    const box=document.createElement('div');box.id='dodgeMobileFix';box.className='dodge-mobile-fix';box.innerHTML='<button data-k="ArrowLeft" aria-label="Déplacer à gauche">◀ Gauche</button><button data-dash="1" aria-label="Activer le dash">Dash</button><button data-k="ArrowRight" aria-label="Déplacer à droite">Droite ▶</button><button class="mobile-pause" type="button">Pause / Reprendre</button>';c.parentElement.appendChild(box);
    const vibrate=()=>{try{navigator.vibrate?.(12)}catch{}};
    const key=(k,down)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k,bubbles:true}));
    box.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();vibrate();key(k,true)});['pointerup','pointercancel','pointerleave'].forEach(x=>b.addEventListener(x,()=>key(k,false))) });
    const dash=box.querySelector('[data-dash]');dash.addEventListener('pointerdown',e=>{e.preventDefault();vibrate();key('Shift',true)});['pointerup','pointercancel','pointerleave'].forEach(x=>dash.addEventListener(x,()=>key('Shift',false)));
    box.querySelector('.mobile-pause').addEventListener('click',e=>{e.preventDefault();vibrate();document.getElementById('pause')?.click()});
    const tip=document.createElement('div');tip.style.cssText='margin:6px 0 0;color:#91a4bd;font-size:.74rem;text-align:center';tip.textContent='Commandes tactiles : gauche · dash · droite · pause';c.parentElement.appendChild(tip);
    const wrap=c.parentElement;
    const moveResult=()=>{if(result.parentElement!==wrap)wrap.appendChild(result);result.style.setProperty('position','absolute','important');result.style.setProperty('inset','0','important');result.style.setProperty('z-index','20','important')};
    moveResult();
    const observer=new MutationObserver(moveResult);observer.observe(panel,{childList:true,subtree:true});
    const resize=()=>{if(document.fullscreenElement===panel){c.style.maxHeight='calc(100vh - 150px)'}else c.style.maxHeight='none'};document.addEventListener('fullscreenchange',resize);resize();
    c.addEventListener('pointerdown',vibrate,{passive:true});

    // Difficulté visible et record local séparé pour chaque difficulté.
    const diffNames={easy:'Facile',normal:'Normal',hard:'Difficile'};
    const diffHints={easy:'Plus de vies et un rythme plus doux.',normal:'Le réglage équilibré.',hard:'Moins de marge d’erreur et des vagues plus rapides.'};
    let currentDiff=document.querySelector('#startOverlay .difficulty button.active')?.dataset.diff||'normal';
    const diffKey=()=>`pixelDodgeBest_${currentDiff}`;
    const getDiffBest=()=>Number(localStorage.getItem(diffKey())||0);
    const setDiffBest=v=>localStorage.setItem(diffKey(),String(Math.max(getDiffBest(),Number(v)||0)));
    const bestEl=document.getElementById('best');
    const badge=document.createElement('span');badge.id='dodgeDifficultyBadge';badge.className='dodge-difficulty-badge';badge.dataset.diff=currentDiff;badge.textContent='Difficulté : '+diffNames[currentDiff];
    const title=document.querySelector('.top h1');if(title&&!document.getElementById('dodgeDifficultyBadge'))title.insertAdjacentElement('afterend',badge);
    const hint=document.createElement('div');hint.id='dodgeDifficultyHint';hint.textContent=diffHints[currentDiff];if(badge)badge.insertAdjacentElement('afterend',hint);
    const updateDiffUI=diff=>{currentDiff=diffNames[diff]?diff:'normal';if(badge){badge.dataset.diff=currentDiff;badge.textContent='Difficulté : '+diffNames[currentDiff]}if(hint)hint.textContent=diffHints[currentDiff];if(bestEl)bestEl.textContent=getDiffBest().toLocaleString('fr-FR')};
    document.querySelectorAll('#startOverlay .difficulty button').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>updateDiffUI(b.dataset.diff),0),{passive:true}));
    updateDiffUI(currentDiff);

    // Les statistiques importantes sont annoncées aux lecteurs d’écran sans gêner le jeu visuel.
    ['score','time','level','combo','lives','dash','wave','best','missionText'].forEach(id=>{const el=document.getElementById(id);if(el)el.setAttribute('aria-live','polite')});
    if(document.getElementById('score'))document.getElementById('score').setAttribute('aria-label','Score actuel');
    if(document.getElementById('lives'))document.getElementById('lives').setAttribute('aria-label','Vies restantes');
    if(document.getElementById('dash'))document.getElementById('dash').setAttribute('aria-label','Énergie de dash');

    // À la fin d’une partie, conserve un record local indépendant pour la difficulté jouée.
    const saveLocalDiffBest=()=>{const n=Number(document.getElementById('finalScore')?.textContent||0);if(n>0){setDiffBest(n);if(bestEl)bestEl.textContent=getDiffBest().toLocaleString('fr-FR')}};
    const resultObserver=new MutationObserver(()=>{if(result.classList.contains('show')){saveLocalDiffBest();result.setAttribute('role','dialog');result.setAttribute('aria-modal','true');result.setAttribute('aria-label','Partie terminée')}});resultObserver.observe(result,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});

    // R ouvre à nouveau le choix de difficulté quand une partie est terminée.
    const chooseDifficulty=()=>{
      result.classList.remove('show');
      result.style.display='none';
      overlay.classList.remove('hidden');
      overlay.style.display='flex';
      overlay.scrollIntoView({block:'center',behavior:'smooth'});
      document.querySelectorAll('#startOverlay .difficulty button').forEach(b=>b.removeAttribute('aria-current'));
      const active=document.querySelector(`#startOverlay .difficulty button[data-diff="${currentDiff}"]`);active?.setAttribute('aria-current','true');
      document.querySelector('#startOverlay .difficulty button.active')?.focus?.();
    };
    ['again','againAuto'].forEach(id=>document.getElementById(id)?.addEventListener('click',chooseDifficulty,true));
    document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&result.classList.contains('show')&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();chooseDifficulty()}});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();