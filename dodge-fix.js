(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const boot=()=>{
    const c=document.getElementById('gameCanvas'),wrap=c?.parentElement,panel=document.getElementById('gamePanel');
    const start=document.getElementById('start'),overlay=document.getElementById('startOverlay'),result=document.getElementById('result');
    if(!c||!wrap||!start||!overlay||!result||document.getElementById('dodgeFixV3'))return;
    document.documentElement.dataset.dodgeFix='3';
    const style=document.createElement('style');style.id='dodgeFixV3';style.textContent=`
      .wrap>.result{position:absolute!important;inset:0!important;z-index:30!important;margin:0!important;display:none;align-items:center;justify-content:center;flex-direction:column;gap:8px;border-radius:16px;background:rgba(2,6,23,.94);backdrop-filter:blur(8px);overflow:auto;box-sizing:border-box}
      .wrap>.result.show{display:flex!important}
      .dodge-mobile-controls{display:none;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:8px}
      .dodge-mobile-controls button{min-height:48px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:11px;font-weight:900;touch-action:none}
      .dodge-mobile-controls .pause{grid-column:1/-1}
      @media(max-width:820px){.dodge-mobile-controls{display:grid}.dodge-mobile-controls button{font-size:14px}.hud{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important}.stat{min-width:0!important}.stat b{font-size:1rem!important}.stat span{font-size:.68rem!important}}
      @media(max-width:560px){.dodge-mobile-controls{grid-template-columns:1fr 1fr 1fr}.dodge-mobile-controls button{min-height:50px}.hud{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    `;document.head.appendChild(style);

    const hideStart=()=>{overlay.classList.add('hidden');overlay.style.display='none';c.focus?.({preventScroll:true})};
    const showStart=()=>{overlay.classList.remove('hidden');overlay.style.display='flex'};

    // The original game uses event listeners, not only start.onclick. The old fix
    // therefore could hide the overlay while the actual game handler had failed.
    // Keep the real handler and only hide the overlay after a click; the watchdog
    // below checks that the game actually began.
    start.addEventListener('click',()=>{setTimeout(hideStart,80);setTimeout(startWatchdog,900)},{capture:true});

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
    const db=controls.querySelector('[data-dash']);db.addEventListener('pointerdown',e=>{e.preventDefault();key('Shift','keydown')});['pointerup','pointercancel','pointerleave'].forEach(t=>db.addEventListener(t,()=>key('Shift','keyup')));
    controls.querySelector('.pause').onclick=()=>document.getElementById('pause')?.click();
    c.style.touchAction='none';c.tabIndex=0;c.setAttribute('role','application');c.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('keydown',e=>{if(panel?.contains(e.target)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Shift'].includes(e.key))e.preventDefault()});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)document.getElementById('pause')?.click()});
    document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&result.classList.contains('show')&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();document.getElementById('again')?.click()}});

    let fallback=false,frame=0,fbStart=0,fbLast=0,fbScore=0,fbLives=3,fbWave=1,fbPlayerX=640,fbInv=0,fbDash=0,fbEnemies=[],fbStars=[];
    const n=id=>{const x=document.getElementById(id)?.textContent||'0',m=x.replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):0};
    const seedStars=()=>{fbStars=Array.from({length:70},()=>({x:Math.random()*1280,y:Math.random()*720,s:.5+Math.random()*2,a:.2+Math.random()*.7}))};
    const fallbackReset=()=>{fallback=true;fbStart=performance.now();fbLast=fbStart;fbScore=0;fbLives=3;fbWave=1;fbPlayerX=640;fbInv=0;fbDash=0;fbEnemies=[];seedStars();hideStart();document.getElementById('score').textContent='0';document.getElementById('time').textContent='0.0';document.getElementById('level').textContent='1';document.getElementById('combo').textContent='x1';document.getElementById('lives').textContent='♥♥♥';document.getElementById('wave').textContent='1';document.getElementById('coins').textContent='0';frame=requestAnimationFrame(fallbackLoop)};
    const spawnFallback=()=>{const count=Math.min(7,2+Math.floor(fbWave/2));for(let i=0;i<count;i++)fbEnemies.push({x:35+Math.random()*1210,y:-20-Math.random()*220,r:10+Math.random()*9,v:110+fbWave*13+Math.random()*90})};
    const fallbackLoop=now=>{if(!fallback)return;const dt=Math.min(.035,(now-fbLast)/1000);fbLast=now;const elapsed=(now-fbStart)/1000;if(n('time')>0.15&&!document.documentElement.dataset.dodgeFallback){fallback=false;return}if(elapsed>fbWave*9){fbWave++;spawnFallback()}if(!fbEnemies.length)spawnFallback();const left=keys.ArrowLeft||keys.a||keys.A,right=keys.ArrowRight||keys.d||keys.D;if(left)fbPlayerX-=430*dt;if(right)fbPlayerX+=430*dt;if(pointer&&pointer.x>=0)fbPlayerX+=(pointer.x-fbPlayerX)*Math.min(1,dt*9);fbPlayerX=Math.max(28,Math.min(1252,fbPlayerX));if(fbDash>0)fbDash-=dt;for(let i=fbEnemies.length-1;i>=0;i--){const e=fbEnemies[i];e.y+=e.v*dt;if(e.y>735){fbEnemies.splice(i,1);continue}if(fbInv<=0&&Math.abs(e.x-fbPlayerX)<e.r+18&&Math.abs(e.y-640)<e.r+18){fbLives--;fbInv=1.15;fbEnemies.splice(i,1);if(fbLives<=0){fallbackEnd(elapsed);return}}}if(fbInv>0)fbInv-=dt;fbScore+=dt*(12+fbWave*3);const ctx=c.getContext('2d');ctx.clearRect(0,0,1280,720);ctx.fillStyle='#050914';ctx.fillRect(0,0,1280,720);for(const s of fbStars){ctx.globalAlpha=s.a;ctx.fillStyle='#8ab4ff';ctx.fillRect(s.x,s.y,s.s,s.s);s.y+=s.s*(18+fbWave*2)*dt;if(s.y>720)s.y=0}ctx.globalAlpha=1;for(const e of fbEnemies){ctx.fillStyle='#fb7185';ctx.shadowColor='#fb7185';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill()}ctx.shadowBlur=0;ctx.fillStyle=fbInv>0?'#ffffff':'#38bdf8';ctx.beginPath();ctx.moveTo(fbPlayerX,610);ctx.lineTo(fbPlayerX-22,660);ctx.lineTo(fbPlayerX,650);ctx.lineTo(fbPlayerX+22,660);ctx.closePath();ctx.fill();ctx.fillStyle='#67e8f9';ctx.fillRect(fbPlayerX-5,650,10,28);document.getElementById('score').textContent=Math.floor(fbScore);document.getElementById('time').textContent=elapsed.toFixed(1);document.getElementById('level').textContent=1+Math.floor(elapsed/15);document.getElementById('combo').textContent='x'+Math.min(10,1+Math.floor(elapsed/8));document.getElementById('lives').textContent='♥'.repeat(Math.max(0,fbLives))||'0';document.getElementById('wave').textContent=fbWave;document.getElementById('dash').textContent=Math.max(0,Math.floor((1-Math.min(1,fbDash))*100))+'%';frame=requestAnimationFrame(fallbackLoop)};
    const fallbackEnd=elapsed=>{fallback=false;cancelAnimationFrame(frame);document.getElementById('finalScore').textContent=Math.floor(fbScore);document.getElementById('finalTime').textContent=elapsed.toFixed(1);document.getElementById('finalWave').textContent=fbWave;result.classList.add('show');result.style.display='flex';result.style.position='absolute';result.style.inset='0'};
    function startWatchdog(){if(fallback)return;setTimeout(()=>{if(n('time')<0.15&&!result.classList.contains('show'))fallbackReset()},150)}

    window.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width*1280,y:(e.clientY-r.top)/r.height*720}});
    window.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key==='Shift'&&fallback&&fbDash<=0)fbDash=.35});
    window.addEventListener('keyup',e=>{keys[e.key]=false});
    document.getElementById('restart')?.addEventListener('click',()=>setTimeout(()=>{if(n('time')<0.15)fallbackReset()},700));
    document.getElementById('again')?.addEventListener('click',()=>{result.classList.remove('show');result.style.display='none';showStart();fallback=false});
    document.getElementById('againAuto')?.addEventListener('click',()=>{result.classList.remove('show');result.style.display='none';showStart();fallback=false});

    // If the core game throws before it can advance the HUD, do not leave a blank canvas.
    window.addEventListener('error',e=>{if(!fallback&&overlay.classList.contains('hidden')&&!result.classList.contains('show')&&n('time')<0.15){console.error('[Pixel Dodge] runtime error',e.error||e.message);setTimeout(()=>{if(!fallback&&n('time')<0.15)fallbackReset()},120)}});

    if(!document.getElementById('dodgeContentLoader')){const s=document.createElement('script');s.id='dodgeContentLoader';s.src='./dodge-content.js?v=3';document.head.appendChild(s)}
    function startWatchdog(){if(fallback)return;setTimeout(()=>{if(n('time')<0.15&&!result.classList.contains('show'))fallbackReset()},150)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();