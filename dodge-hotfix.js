(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const $=id=>document.getElementById(id),c=$('gameCanvas'); if(!c)return;
  const cfg=window.PIXEL_ARCADE_CONFIG||{},base=String(cfg.supabaseUrl||'').replace(/\/$/,''),key=cfg.supabaseAnonKey||'';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const style=document.createElement('style');style.textContent=`
    .dodge-dash-flash{position:absolute;inset:0;pointer-events:none;z-index:8;border:3px solid #22d3ee;box-shadow:inset 0 0 70px #22d3ee55;opacity:0;transition:opacity .08s}
    .dodge-dash-flash.show{opacity:1}.dodge-dash-label{position:absolute;left:50%;top:22%;transform:translate(-50%,-50%) scale(.8);pointer-events:none;z-index:9;color:#67e8f9;font:900 28px system-ui;letter-spacing:3px;text-shadow:0 0 18px #22d3ee;opacity:0;transition:.12s}.dodge-dash-label.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
    .dodge-enemy-layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;border-radius:16px}
    .dodge-enemy-legend{position:absolute;left:12px;bottom:12px;z-index:6;display:flex;gap:5px;flex-wrap:wrap;max-width:72%;pointer-events:none;opacity:.72}
    .dodge-enemy-legend span{font:800 11px system-ui;padding:4px 7px;border:1px solid #334155;background:#07101dcc;border-radius:99px;color:#dbeafe}
  `;document.head.appendChild(style);
  const wrap=c.parentElement,flash=document.createElement('div'),label=document.createElement('div');flash.className='dodge-dash-flash';label.className='dodge-dash-label';label.textContent='⚡ DASH';wrap.append(flash,label);
  function dash(){
    const time=parseFloat(String($('time')?.textContent||0).replace(',','.'))||0;
    if(time<=0||!$('pauseOverlay')?.classList.contains('hidden'))return;
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',code:'ShiftLeft',bubbles:true,cancelable:true}));
    flash.classList.remove('show');label.classList.remove('show');void flash.offsetWidth;flash.classList.add('show');label.classList.add('show');
    setTimeout(()=>flash.classList.remove('show'),130);setTimeout(()=>label.classList.remove('show'),350);
  }
  $('dashBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();dash()},{capture:true});

  /* ===== NOUVEAUX ENNEMIS ===== */
  const enemyCanvas=document.createElement('canvas');enemyCanvas.className='dodge-enemy-layer';enemyCanvas.width=1280;enemyCanvas.height=720;wrap.appendChild(enemyCanvas);const ex=enemyCanvas.getContext('2d');
  const legend=document.createElement('div');legend.className='dodge-enemy-legend';legend.innerHTML='<span>🔴 Orbe</span><span>🟣 Zigzag</span><span>🛩️ Éclair</span><span>🔻 Intercepteur</span><span>💠 Chasseur</span>';wrap.appendChild(legend);
  const enemyTypes=[
    {type:'zigzag',minWave:2,weight:4},
    {type:'speed',minWave:3,weight:3},
    {type:'interceptor',minWave:4,weight:3},
    {type:'hunter',minWave:6,weight:2}
  ];let enemies=[],enemyLast=performance.now(),enemySpawn=0,enemyPlayerX=640,enemyFlash=0,enemyHitCooldown=0,enemyLives=3,enemyStarted=false;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function chooseEnemy(w){const pool=enemyTypes.filter(e=>w>=e.minWave),bag=[];pool.forEach(e=>{for(let i=0;i<e.weight;i++)bag.push(e.type)});return bag[Math.floor(Math.random()*bag.length)]||'zigzag'}
  function makeEnemy(w){const type=chooseEnemy(w);const e={type,x:rnd(45,1235),y:-45,r:rnd(14,22),age:0,phase:rnd(0,Math.PI*2),vx:0,vy:0,rot:0,life:1};
    if(type==='zigzag'){e.vy=145+w*12;e.amp=rnd(70,150);e.freq=rnd(4,7)}
    if(type==='speed'){e.y=rnd(110,610);e.x=-80;e.vx=rnd(820,1080)*(Math.random()<.5?1:-1);if(e.vx<0)e.x=1360}
    if(type==='interceptor'){e.vy=185+w*9;e.vx=rnd(80,150)*(Math.random()<.5?1:-1)}
    if(type==='hunter'){e.vy=125+w*7;e.accel=rnd(35,65)}
    enemies.push(e);
  }
  function drawEnemy(e){
    ex.save();ex.translate(e.x,e.y);ex.rotate(e.rot);const pulse=1+Math.sin(e.age*7)*.08;
    if(e.type==='zigzag'){
      ex.shadowColor='#c084fc';ex.shadowBlur=22;ex.fillStyle='#a855f7';ex.beginPath();ex.moveTo(0,-22);ex.lineTo(19,12);ex.lineTo(7,8);ex.lineTo(0,20);ex.lineTo(-7,8);ex.lineTo(-19,12);ex.closePath();ex.fill();ex.shadowBlur=0;ex.fillStyle='#f5d0fe';ex.beginPath();ex.arc(0,-2,5,0,Math.PI*2);ex.fill();
    }else if(e.type==='speed'){
      ex.shadowColor='#f59e0b';ex.shadowBlur=25;ex.fillStyle='#fbbf24';ex.beginPath();ex.moveTo(34,0);ex.lineTo(-12,-10);ex.lineTo(-5,0);ex.lineTo(-12,10);ex.closePath();ex.fill();ex.shadowBlur=0;ex.fillStyle='#fff7ed';ex.fillRect(-2,-3,18,6);ex.strokeStyle='#f97316';ex.lineWidth=3;ex.beginPath();ex.moveTo(-10,-7);ex.lineTo(-30,-15);ex.moveTo(-10,7);ex.lineTo(-30,15);ex.stroke();
    }else if(e.type==='interceptor'){
      ex.shadowColor='#fb7185';ex.shadowBlur=20;ex.fillStyle='#ef4444';ex.beginPath();ex.moveTo(0,24);ex.lineTo(20,-12);ex.lineTo(7,-7);ex.lineTo(0,-23);ex.lineTo(-7,-7);ex.lineTo(-20,-12);ex.closePath();ex.fill();ex.shadowBlur=0;ex.fillStyle='#fecdd3';ex.beginPath();ex.arc(0,-4,5,0,Math.PI*2);ex.fill();
    }else{
      ex.shadowColor='#22d3ee';ex.shadowBlur=24;ex.fillStyle='#06b6d4';ex.beginPath();ex.ellipse(0,0,25,11,0,0,Math.PI*2);ex.fill();ex.fillStyle='#a5f3fc';ex.beginPath();ex.ellipse(0,-3,9,5,0,0,Math.PI*2);ex.fill();ex.fillStyle='#083344';ex.fillRect(-17,5,34,4);
    }
    ex.restore();
  }
  function enemyLoop(now){
    if(document.documentElement.dataset.dodgeFallback==='1'){enemyCanvas.style.display='none';legend.style.display='none';requestAnimationFrame(enemyLoop);return}
    enemyCanvas.style.display='block';legend.style.display='flex';const dt=Math.min(.035,(now-enemyLast)/1000);enemyLast=now;
    const time=parseFloat(String($('time')?.textContent||0).replace(',','.'))||0,wave=Math.max(1,Number($('wave')?.textContent)||1),paused=!$('pauseOverlay')?.classList.contains('hidden');
    if(time<.2){enemyStarted=false;enemies.length=0;enemyLives=Math.max(1,(String($('lives')?.textContent||'♥♥♥').match(/♥/g)||[]).length)}
    if(time>.2&&!enemyStarted){enemyStarted=true;enemyLives=Math.max(1,(String($('lives')?.textContent||'♥♥♥').match(/♥/g)||[]).length)}
    const rect=c.getBoundingClientRect();
    if(window.__dodgePointerX!=null)enemyPlayerX=window.__dodgePointerX;
    if(time>.2&&!paused){
      enemySpawn-=dt;enemyHitCooldown=Math.max(0,enemyHitCooldown-dt);enemyFlash=Math.max(0,enemyFlash-dt);
      const interval=Math.max(.55,1.65-wave*.075);
      if(enemySpawn<=0){if(Math.random()<Math.min(.92,.48+wave*.055))makeEnemy(wave);enemySpawn=interval*rnd(.7,1.15)}
      for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.age+=dt;
        if(e.type==='zigzag'){e.y+=e.vy*dt;e.x+=Math.sin(e.age*e.freq+e.phase)*e.amp*dt}
        else if(e.type==='speed'){e.x+=e.vx*dt;e.rot+=dt*(e.vx>0?2:-2)}
        else if(e.type==='interceptor'){e.y+=e.vy*dt;e.x+=e.vx*dt;if(e.x<35||e.x>1245)e.vx*=-1}
        else {e.y+=e.vy*dt;const dx=enemyPlayerX-e.x;e.vx+=Math.sign(dx)*e.accel*dt;e.vx=Math.max(-210,Math.min(210,e.vx));e.x+=e.vx*dt}
        if(e.y>770||e.x<-150||e.x>1430){enemies.splice(i,1);continue}
        if(enemyHitCooldown<=0&&Math.hypot(e.x-enemyPlayerX,e.y-653)<e.r+21){
          enemyHitCooldown=1.05;enemyFlash=.22;enemies.splice(i,1);enemyLives=Math.max(0,enemyLives-1);const hearts='♥'.repeat(enemyLives)||'0';if($('lives'))$('lives').textContent=hearts;
          if(enemyLives<=0){const again=$('again');if($('finalScore'))$('finalScore').textContent=$('score')?.textContent||'0';if($('finalTime'))$('finalTime').textContent=$('time')?.textContent||'0';if($('finalWave'))$('finalWave').textContent=$('wave')?.textContent||'1';$('result')?.classList.add('show');$('result').style.display='block';}
        }
      }
    }
    ex.clearRect(0,0,1280,720);for(const e of enemies)drawEnemy(e);
    if(enemyFlash>0){ex.fillStyle='rgba(251,113,133,.12)';ex.fillRect(0,0,1280,720)}
    requestAnimationFrame(enemyLoop);
  }
  window.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();window.__dodgePointerX=(e.clientX-r.left)/r.width*1280});
  window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')enemyPlayerX=Math.max(28,enemyPlayerX-55);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')enemyPlayerX=Math.min(1252,enemyPlayerX+55)});
  requestAnimationFrame(enemyLoop);

  /* ===== MISSION ===== */
  const mission=$('missionText'),bar=$('missionBar');
  const pool=[{type:'survive',target:18,name:'Survivre 18 secondes'},{type:'score',target:1500,name:'Atteindre 1 500 points'},{type:'coins',target:15,name:'Ramasser 15 pièces'},{type:'collect',target:5,name:'Ramasser 5 bonus'},{type:'boss',target:1,name:'Vaincre 1 boss'}];
  let m=pool[0];
  function missionTick(){
    if(!mission||!bar)return;
    const time=parseFloat(String($('time')?.textContent||0).replace(',','.'))||0,score=Number(String($('score')?.textContent||0).replace(/\s/g,''))||0,coins=Number(String($('coins')?.textContent||0).replace(/\s/g,''))||0,wave=Number($('wave')?.textContent||1);
    let done=m.type==='survive'?time:m.type==='score'?score:m.type==='coins'?coins:m.type==='boss'?(wave>=5?1:0):Math.min(m.target,Math.floor(score/300));
    done=Math.min(m.target,Math.max(0,done));mission.innerHTML=`<b>${esc(m.name)}</b><span>${Math.floor(done)} / ${m.target}</span>`;mission.style.display='flex';mission.style.flexDirection='column';bar.style.width=(done/m.target*100)+'%';
    if(done>=m.target){mission.querySelector('b').textContent='✓ '+m.name;bar.style.width='100%';}
  }
  setInterval(missionTick,250);missionTick();

  /* ===== BOSS INDICATOR ===== */
  let lastBossWave=0;
  function bossTick(){
    const w=Number($('wave')?.textContent||1);if(w<5||w%5||w===lastBossWave)return;lastBossWave=w;
    const event=$('event'),bb=$('bossbar');if(event){event.textContent='👾 BOSS — VAGUE '+w;event.classList.remove('hidden');event.style.display='block'}if(bb)bb.classList.remove('hidden');
  }
  setInterval(bossTick,250);

  /* ===== CLASSEMENT ===== */
  async function loadBoard(diff){
    const host=$('dodgeBoard_'+diff);if(!host)return;let rows=[];
    try{if(base&&key){const token=window.PAAuth?.state?.user?.access_token||key,r=await fetch(base+'/rest/v1/scores?game=eq.'+encodeURIComponent('dodge_'+diff)+'&select=pseudo,score,created_at&order=score.desc,created_at.asc&limit=10',{headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'}});if(r.ok)rows=await r.json()}}catch{}
    if(!rows.length)try{const local=JSON.parse(localStorage.getItem('pixelArcadeScores')||'[]');rows=local.filter(r=>r.game==='dodge_'+diff||r.game==='dodge').sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,10)}catch{}
    host.innerHTML=rows.length?rows.map((r,i)=>`<div class="row"><span><b class="rank-number">#${i+1}</b> ${esc(r.pseudo||'Joueur')}</span><strong>${Number(r.score||0).toLocaleString('fr-FR')}</strong></div>`).join(''):'<p class="rank-empty">Aucun score enregistré pour cette difficulté.</p>';
  }
  async function rankings(){for(const d of ['easy','normal','hard'])await loadBoard(d)}
  window.addEventListener('pa-auth-ready',rankings);window.addEventListener('pa-auth-updated',rankings);setTimeout(rankings,1200);setInterval(()=>{if(document.visibilityState!=='hidden')rankings()},5000);

  const account=()=>{const host=document.querySelector('.dodge-account');if(!host)return;const s=window.PAAuth?.state,p=window.PAAuth?.currentPseudo?.()||s?.profile?.pseudo||s?.user?.user?.user_metadata?.pseudo||'';host.className='dodge-account'+(s?.user?.access_token&&p?'':' offline');host.textContent=s?.user?.access_token&&p?'👤 '+p:'👤 Compte non chargé'};
  setTimeout(account,1200);window.addEventListener('pa-auth-ready',account);window.addEventListener('pa-auth-updated',account);
})();