(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const ready=()=>{
    const c=document.getElementById('gameCanvas'),panel=document.getElementById('gamePanel'),result=document.getElementById('result');
    if(!c||!panel||!result||document.getElementById('dodgeMobileFix'))return;
    const style=document.createElement('style');style.id='dodgeMobileFix';style.textContent=`
      .dodge-mobile-fix{display:none;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:9px}
      .dodge-mobile-fix button{min-height:46px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:11px;font-weight:900;touch-action:none;cursor:pointer}
      .dodge-mobile-fix button:active{border-color:#22d3ee;transform:scale(.98)}
      body.light .dodge-mobile-fix button{background:#fff;color:#172033;border-color:#ccd7e5}
      .wrap>.result{position:absolute;inset:0;z-index:8;margin:0;display:none;align-items:center;justify-content:center;border-radius:16px;background:rgba(2,6,23,.88);backdrop-filter:blur(5px);padding:clamp(12px,4vw,22px);text-align:center;overflow:auto;overscroll-behavior:contain}
      .wrap>.result.show{display:flex!important}
      .wrap>.result>h2,.wrap>.result>p,.wrap>.result>div{max-width:520px}
      .wrap>.result{flex-direction:column;gap:7px}
      .wrap>.result h2{margin:0;font-size:clamp(1.35rem,5vw,2rem)}
      .wrap>.result p{margin:5px 0;line-height:1.5}
      .wrap>.result input{background:#0c1424;color:#fff;border:1px solid #475569;max-width:100%;font-size:16px}
      .wrap>.result .result-actions{justify-content:center;align-items:center;flex-wrap:wrap}
      .wrap>.result button{min-height:44px}
      .wrap>.result #manualScore,.wrap>.result #autoScore{width:min(100%,520px)}
      body.light .wrap>.result{background:rgba(255,255,255,.92);color:#172033;border-color:#d5deea}
      body.light .wrap>.result input{background:#fff;color:#172033;border-color:#cbd5e1}
      @media(max-width:820px){.dodge-mobile-fix{display:grid}}
      @media(max-width:560px){.wrap>.result{padding:10px}.wrap>.result h2{font-size:1.3rem}.wrap>.result p{font-size:.88rem}.wrap>.result input{margin:5px 0;width:100%}.wrap>.result .result-actions{gap:7px}.wrap>.result .result-actions button{width:100%}.wrap>.result #manualScore,.wrap>.result #autoScore{max-width:320px}.wrap>.result .message{font-size:.8rem}}
      @media(max-width:360px){.wrap>.result{padding:7px}.wrap>.result h2{font-size:1.15rem}.wrap>.result p{font-size:.8rem}.wrap>.result .result-actions button{min-height:42px;padding:8px 10px}}
    `;document.head.appendChild(style);
    const box=document.createElement('div');box.id='dodgeMobileFix';box.className='dodge-mobile-fix';box.innerHTML='<button data-k="ArrowLeft">Gauche</button><button data-dash="1">Dash</button><button data-k="ArrowRight">Droite</button>';c.parentElement.appendChild(box);
    const key=(k,down)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k,bubbles:true}));
    box.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();key(k,true)});['pointerup','pointercancel','pointerleave'].forEach(x=>b.addEventListener(x,()=>key(k,false))) });
    box.querySelector('[data-dash]').addEventListener('pointerdown',e=>{e.preventDefault();window.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true}))});
    const tip=document.createElement('div');tip.style.cssText='margin:7px 0 0;color:#91a4bd;font-size:.78rem;text-align:center';tip.textContent='Sur mobile : utilise les boutons ou touche directement la zone de jeu.';c.parentElement.appendChild(tip);
    const wrap=c.parentElement;
    const moveResult=()=>{if(result.parentElement!==wrap)wrap.appendChild(result)};
    moveResult();
    const observer=new MutationObserver(moveResult);observer.observe(panel,{childList:true,subtree:true});
    const resize=()=>{if(document.fullscreenElement===panel){c.style.maxHeight='calc(100vh - 150px)'}else c.style.maxHeight='none'};document.addEventListener('fullscreenchange',resize);resize();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
