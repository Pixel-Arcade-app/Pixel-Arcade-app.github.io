(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const ready=()=>{
    const c=document.getElementById('gameCanvas'), panel=document.getElementById('gamePanel');
    if(!c||!panel||document.getElementById('dodgeMobileFix'))return;
    const style=document.createElement('style');style.id='dodgeMobileFix';style.textContent=`
      .dodge-mobile-fix{display:none;grid-template-columns:1fr 1fr 1fr 1fr;gap:7px;margin-top:8px}
      .dodge-mobile-fix button{min-height:46px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:11px;font-weight:900;touch-action:none}
      .dodge-mobile-fix button:active{border-color:#22d3ee;transform:scale(.98)}
      @media(max-width:820px){.dodge-mobile-fix{display:grid}}
    `;document.head.appendChild(style);
    const box=document.createElement('div');box.className='dodge-mobile-fix';box.innerHTML='<button data-k="ArrowLeft">←</button><button data-fire="1">Tir</button><button data-k="ArrowRight">→</button><button data-dash="1">Dash</button>';c.parentElement.appendChild(box);
    const key=(k,down)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:k,bubbles:true}));
    box.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();key(k,true)});['pointerup','pointercancel','pointerleave'].forEach(x=>b.addEventListener(x,()=>key(k,false))) });
    const fire=box.querySelector('[data-fire]');fire.addEventListener('pointerdown',e=>{e.preventDefault();window.dispatchEvent(new KeyboardEvent('keydown',{key:'z',bubbles:true}))});
    const dash=box.querySelector('[data-dash]');dash.addEventListener('pointerdown',e=>{e.preventDefault();window.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true}))});
    let tip=document.createElement('div');tip.style.cssText='margin:7px 0 0;color:#91a4bd;font-size:.78rem;text-align:center';tip.textContent='Sur mobile : utilise les boutons ou touche directement la zone de jeu.';c.parentElement.appendChild(tip);
    const resize=()=>{if(document.fullscreenElement===panel){c.style.maxHeight='calc(100vh - 150px)'}else c.style.maxHeight='none'};document.addEventListener('fullscreenchange',resize);resize();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
