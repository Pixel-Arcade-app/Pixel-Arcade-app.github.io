(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const boot=()=>{
    const c=document.getElementById('gameCanvas'),wrap=c?.parentElement,panel=document.getElementById('gamePanel');
    const start=document.getElementById('start'),overlay=document.getElementById('startOverlay'),result=document.getElementById('result');
    if(!c||!wrap||!start||!overlay||!result||document.getElementById('dodgeFixV4'))return;
    document.documentElement.dataset.dodgeFix='4';
    const ctx=c.getContext('2d');
    const style=document.createElement('style');style.id='dodgeFixV4';style.textContent=`
      .wrap>.result{position:absolute!important;inset:0!important;z-index:30!important;margin:0!important;display:none;align-items:center;justify-content:center;flex-direction:column;gap:8px;border-radius:16px;background:rgba(2,6,23,.94);backdrop-filter:blur(8px);overflow:auto;box-sizing:border-box}
      .wrap>.result.show{display:flex!important}
      .dodge-mobile-controls{display:none;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:8px}
      .dodge-mobile-controls button{min-height:48px;border:1px solid #334155;background:#0d1424;color:#eef2ff;border-radius:11px;font-weight:900;touch-action:none}
      .dodge-mobile-controls .pause{grid-column:1/-1}
      .dodge-account{display:inline-flex;align-items:center;gap:7px;border:1px solid #245a68;background:linear-gradient(135deg,#0d2531,#101a31);color:#bff7ff;border-radius:999px;padding:8px 12px;font-weight:900}
      .dodge-account.offline{border-color:#334155;color:#cbd5e1}
      .dodge-save-status{margin:8px 0 0;font-weight:800}
      .dodge-save-status.ok{color:#4ade80}.dodge-save-status.wait{color:#facc15}.dodge-save-status.err{color:#fb7185}
      @media(max-width:820px){.dodge-mobile-controls{display:grid}.dodge-mobile-controls button{font-size:14px}.hud{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important}.stat{min-width:0!important}.stat b{font-size:1rem!important}.stat span{font-size:.68rem!important}}
      @media(max-width:560px){.dodge-mobile-controls{grid-template-columns:1fr 1fr 1fr}.dodge-mobile-controls button{min-height:50px}.hud{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    `;document.head.appendChild(style);
    const hideStart=()=>{overlay.classList.add('hidden');overlay.style.display='none';c.focus?.({preventScroll:true})};
    const showStart=()=>{overlay.classList.remove('hidden');overlay.style.display='flex'};
    let fallback=false,frame=0,fbStart=0,fbLast=0,fbScore=0,fbLives=3,fbWave=1,fbPlayerX=640,fbInv=0,fbDash=0,fbPaused=false,fbEnemies=[],fbStars=[];
    const keys={};let pointer=null;
    const n=id=>{const x=document.getElementById(id)?.textContent||'0',m=x.replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):0};
    const startWatchdog=()=>setTimeout(()=>{if(!fallback&&!result.classList.contains('show')&&n('time')<0.15)fallbackReset()},900);
    const seedStars=()=>{fbStars=Array.from({length:110},()=>({x:Math.random()*1280,y:Math.random()*720,s:.5+Math.random()*2,a:.2+Math.random()*.7}))};
    const spawnFallback=()=>{const count=Math.min(7,2+Math.floor(fbWave/2));for(let i=0;i<count;i++)fbEnemies.push({x:35+Math.random()*1210,y:-20-Math.random()*220,r:10+Math.random()*9,v:110+fbWave*13+Math.random()*90})};
    const fallbackReset=()=>{fallback=true;fbPaused=false;document.documentElement.dataset.dodgeFallback='1';fbStart=performance.now();fbLast=fbStart;fbScore=0;fbLives=3;fbWave=1;fbPlayerX=640;fbInv=0;fbDash=0;fbEnemies=[];seedStars();hideStart();['score','time','level','combo','wave','coins'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=id==='combo'?'x1':'0'});document.getElementById('level').textContent='1';document.getElementById('lives').textContent='♥♥♥';document.getElementById('dash').textContent='100%';frame=requestAnimationFrame(fallbackLoop)};
    const fallbackLoop=now=>{if(!fallback)return;const dt=fbPaused?0:Math.min(.035,(now-fbLast)/1000);fbLast=now;const elapsed=(now-fbStart)/1000;if(!fbPaused){if(elapsed>fbWave*9){fbWave++;spawnFallback()}if(!fbEnemies.length)spawnFallback();const left=keys.ArrowLeft||keys.a||keys.A,right=keys.ArrowRight||keys.d||keys.D;if(left)fbPlayerX-=430*dt;if(right)fbPlayerX+=430*dt;if(pointer!==null)fbPlayerX+=(pointer-fbPlayerX)*Math.min(1,dt*9);fbPlayerX=Math.max(28,Math.min(1252,fbPlayerX));if(fbDash>0)fbDash-=dt;for(let i=fbEnemies.length-1;i>=0;i--){const e=fbEnemies[i];e.y+=e.v*dt;if(e.y>735){fbEnemies.splice(i,1);continue}if(fbInv<=0&&Math.abs(e.x-fbPlayerX)<e.r+18&&Math.abs(e.y-640)<e.r+18){fbLives--;fbInv=1.15;fbEnemies.splice(i,1);if(fbLives<=0){fallbackEnd(elapsed);return}}}if(fbInv>0)fbInv-=dt;fbScore+=dt*(12+fbWave*3)}
      ctx.clearRect(0,0,1280,720);const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,'#081936');g.addColorStop(.55,'#050b19');g.addColorStop(1,'#02050d');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);
      for(const s of fbStars){ctx.globalAlpha=s.a;ctx.fillStyle='#b9d8ff';ctx.fillRect(s.x,s.y,s.s,s.s);if(!fbPaused){s.y+=s.s*(18+fbWave*2)*dt;if(s.y>720)s.y=0}}
      ctx.globalAlpha=1;for(const e of fbEnemies){ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor='#fb7185';ctx.shadowBlur=18;ctx.fillStyle='#fb7185';ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#7f1d1d';ctx.beginPath();ctx.arc(0,0,e.r*.48,0,Math.PI*2);ctx.fill();ctx.restore()}
      drawPolishedShip(fbPlayerX,653,fbInv>0);
      if(fbPaused){ctx.fillStyle='rgba(2,6,23,.45)';ctx.fillRect(0,0,1280,720);ctx.fillStyle='#fff';ctx.font='900 34px system-ui';ctx.textAlign='center';ctx.fillText('⏸ PAUSE',640,350);ctx.textAlign='left'}
      document.getElementById('score').textContent=Math.floor(fbScore);document.getElementById('time').textContent=elapsed.toFixed(1);document.getElementById('level').textContent=1+Math.floor(elapsed/15);document.getElementById('combo').textContent='x'+Math.min(10,1+Math.floor(elapsed/8));document.getElementById('lives').textContent='♥'.repeat(Math.max(0,fbLives))||'0';document.getElementById('wave').textContent=fbWave;document.getElementById('dash').textContent=Math.max(0,Math.floor((1-Math.min(1,fbDash/.35))*100))+'%';frame=requestAnimationFrame(fallbackLoop)};
    const fallbackEnd=elapsed=>{fallback=false;cancelAnimationFrame(frame);document.documentElement.dataset.dodgeFallback='';document.getElementById('finalScore').textContent=Math.floor(fbScore);document.getElementById('finalTime').textContent=elapsed.toFixed(1);document.getElementById('finalWave').textContent=fbWave;result.classList.add('show');result.style.display='flex';result.style.position='absolute';result.style.inset='0'};
    function drawPolishedShip(cx,cy,inv=false){const t=performance.now();ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=inv&&Math.floor(t/80)%2?0.35:1;ctx.shadowColor='#22d3ee';ctx.shadowBlur=26;ctx.fillStyle='#38bdf8';ctx.beginPath();ctx.moveTo(0,-34);ctx.lineTo(25,20);ctx.lineTo(10,15);ctx.lineTo(0,31);ctx.lineTo(-10,15);ctx.lineTo(-25,20);ctx.closePath();ctx.fill();ctx.shadowBlur=10;ctx.fillStyle='#e0f2fe';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(10,7);ctx.lineTo(0,12);ctx.lineTo(-10,7);ctx.closePath();ctx.fill();ctx.fillStyle='#0f172a';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#67e8f9';ctx.fillRect(-18,18,8,7);ctx.fillRect(10,18,8,7);ctx.shadowColor='#facc15';ctx.shadowBlur=16;ctx.fillStyle='#facc15';ctx.beginPath();ctx.moveTo(-13,27);ctx.lineTo(-5,27);ctx.lineTo(-9,43);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(5,27);ctx.lineTo(13,27);ctx.lineTo(9,43);ctx.closePath();ctx.fill();ctx.restore()}
    const toggleFallbackPause=()=>{if(!fallback)return false;fbPaused=!fbPaused;document.getElementById('pauseOverlay').classList.toggle('hidden',!fbPaused);if(!fbPaused){document.getElementById('pauseOverlay').classList.add('hidden')}return true};
    start.addEventListener('click',()=>{setTimeout(hideStart,80);startWatchdog()},{capture:true});
    const moveResult=()=>{if(result.parentElement!==wrap)wrap.appendChild(result);result.style.position='absolute';result.style.inset='0'};moveResult();new MutationObserver(moveResult).observe(panel||wrap,{childList:true,subtree:true});
    const controls=document.createElement('div');controls.className='dodge-mobile-controls';controls.innerHTML='<button data-key="ArrowLeft">◀ Gauche</button><button data-dash>⚡ Dash</button><button data-key="ArrowRight">Droite ▶</button><button class="pause">⏸ Pause / Reprendre</button>';wrap.appendChild(controls);
    const key=(k,type)=>window.dispatchEvent(new KeyboardEvent(type,{key:k,bubbles:true}));controls.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();key(k,'keydown')});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>key(k,'keyup')))});const db=controls.querySelector('[data-dash');
    controls.querySelector('[data-dash]').addEventListener('pointerdown',e=>{e.preventDefault();key('Shift','keydown')});['pointerup','pointercancel','pointerleave'].forEach(t=>controls.querySelector('[data-dash]').addEventListener(t,()=>key('Shift','keyup')));
    const pauseBtn=document.getElementById('pause'),resumeBtn=document.getElementById('resume');
    const requestCorePause=()=>{if(fallback)return toggleFallbackPause();if(!document.getElementById('pauseOverlay').classList.contains('hidden')){window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true}));return true}window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true}));return true};
    pauseBtn?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();requestCorePause()},{capture:true});
    resumeBtn?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();requestCorePause()},{capture:true});
    controls.querySelector('.pause').onclick=()=>requestCorePause();
    c.style.touchAction='none';c.tabIndex=0;c.setAttribute('role','application');c.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('keydown',e=>{if(panel?.contains(e.target)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Shift'].includes(e.key))e.preventDefault()});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&!fallback&&!document.getElementById('pauseOverlay').classList.contains('hidden'))return;if(document.hidden)requestCorePause()});
    document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&result.classList.contains('show')&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();document.getElementById('again')?.click()}});
    window.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width*1280,y:(e.clientY-r.top)/r.height*720};if(fallback)pointer=pointer.x});
    window.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key==='Shift'&&fallback&&fbDash<=0)fbDash=.35});window.addEventListener('keyup',e=>{keys[e.key]=false});
    document.getElementById('restart')?.addEventListener('click',()=>setTimeout(()=>{if(n('time')<0.15)fallbackReset()},700));
    document.getElementById('again')?.addEventListener('click',()=>{result.classList.remove('show');result.style.display='none';showStart();fallback=false;document.documentElement.dataset.dodgeFallback=''});
    document.getElementById('againAuto')?.addEventListener('click',()=>{result.classList.remove('show');result.style.display='none';showStart();fallback=false;document.documentElement.dataset.dodgeFallback=''});

    const accountHost=document.createElement('span');accountHost.className='dodge-account offline';accountHost.textContent='👤 Connexion…';document.querySelector('.top .actions')?.prepend(accountHost);
    const accountInfo=()=>{const s=window.PAAuth?.state;const p=window.PAAuth?.currentPseudo?.()||s?.profile?.pseudo||s?.user?.user?.user_metadata?.pseudo||'';const connected=!!(s?.user?.access_token&&p);accountHost.className='dodge-account'+(connected?'':' offline');accountHost.textContent=connected?'👤 '+p:'👤 Compte non chargé';return {s,p,connected}};
    const refreshAccount=async()=>{try{if(window.PAAuth?.refresh)await window.PAAuth.refresh()}catch{}accountInfo()};
    window.addEventListener('pa-auth-ready',accountInfo);window.addEventListener('pa-auth-updated',accountInfo);refreshAccount();

    const saveStatus=document.createElement('p');saveStatus.className='dodge-save-status';saveStatus.id='dodgeSaveStatus';saveStatus.textContent='';result.querySelector('#message')?.before(saveStatus);
    let lastSavedKey='';let saving=false;
    const ensureAccountScore=async()=>{
      const info=accountInfo();if(!info.connected||saving)return;
      const score=Math.floor(Number(document.getElementById('finalScore')?.textContent)||0);if(!score)return;
      const key=(info.s?.user?.user?.id||info.p)+':'+score+':'+(document.getElementById('finalTime')?.textContent||'');if(key===lastSavedKey)return;saving=true;saveStatus.className='dodge-save-status wait';saveStatus.textContent='⏳ Enregistrement du score avec ton compte…';
      await new Promise(r=>setTimeout(r,650));
      try{
        const rows=JSON.parse(localStorage.getItem('pixelArcadeScores')||'[]');
        const existing=rows.find(r=>r.game==='dodge'&&Number(r.score)===score&&r.user_id===info.s.user.user.id&&r.synced===true);
        let ok=!!existing;
        if(!ok&&window.PAAuth?.recordScore)ok=await window.PAAuth.recordScore('dodge',score,1,info.p);
        if(ok){saveStatus.className='dodge-save-status ok';saveStatus.textContent='✓ Score enregistré sur ton compte.';document.getElementById('manualScore')?.classList.add('hidden');document.getElementById('autoScore')?.classList.remove('hidden');lastSavedKey=key}
        else{saveStatus.className='dodge-save-status err';saveStatus.textContent='⚠️ Le score n’a pas pu être synchronisé. Il est conservé localement et sera resynchronisé.';document.getElementById('manualScore')?.classList.remove('hidden');document.getElementById('autoScore')?.classList.add('hidden')}
      }catch(e){saveStatus.className='dodge-save-status err';saveStatus.textContent='⚠️ Synchronisation temporairement indisponible.';document.getElementById('manualScore')?.classList.remove('hidden')}
      finally{saving=false}
    };
    new MutationObserver(()=>{if(result.classList.contains('show'))ensureAccountScore()}).observe(result,{attributes:true,attributeFilter:['class']});
    document.getElementById('save')?.addEventListener('click',async()=>{setTimeout(ensureAccountScore,200)},{capture:false});
    window.addEventListener('error',e=>{if(!fallback&&overlay.classList.contains('hidden')&&!result.classList.contains('show')&&n('time')<0.15){console.error('[Pixel Dodge] runtime error',e.error||e.message);setTimeout(()=>{if(!fallback&&n('time')<0.15)fallbackReset()},120)}});
    if(!document.getElementById('dodgeContentLoader')){const s=document.createElement('script');s.id='dodgeContentLoader';s.src='./dodge-content.js?v=5';document.head.appendChild(s)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();