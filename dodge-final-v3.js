(()=>{
  if(document.body?.dataset.game!=='dodge') return;
  const $=id=>document.getElementById(id);
  const old=$('gameCanvas'); if(!old) return;
  try{old.__paDodgeOldStop?.()}catch{}
  const wrap=old.parentElement;
  const canvas=document.createElement('canvas');
  canvas.id='gameCanvas'; canvas.className=old.className; canvas.width=1280; canvas.height=720; canvas.tabIndex=0;
  old.replaceWith(canvas);
  const ctx=canvas.getContext('2d'), W=1280,H=720;
  const css=document.createElement('style'); css.textContent=`
    #gameCanvas{background:#030712;box-shadow:inset 0 0 80px #020617,0 0 30px #22d3ee18}
    .dodge-final-hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:8;padding:6px 11px;border:1px solid #29415e;border-radius:999px;background:#07101ddd;color:#b7c7dc;font:700 11px system-ui;pointer-events:none;opacity:.9}
    .dodge-boss-name{position:absolute;left:50%;top:34px;transform:translateX(-50%);z-index:8;color:#fecdd3;font:900 18px system-ui;letter-spacing:2px;text-shadow:0 0 18px #fb7185;pointer-events:none;display:none}
    .dodge-account{display:inline-flex;align-items:center;gap:7px;border:1px solid #245a68;background:#0d2531;color:#bff7ff;border-radius:999px;padding:8px 12px;font-weight:900}
    .dodge-account.offline{border-color:#334155;color:#cbd5e1;background:#0d1424}
  `; document.head.appendChild(css);
  const hint=document.createElement('div'); hint.className='dodge-final-hint'; hint.textContent='← → / A D · Shift = Dash · Espace = Pause'; wrap.appendChild(hint);
  const bossName=document.createElement('div'); bossName.className='dodge-boss-name'; bossName.textContent='👾 BOSS'; wrap.appendChild(bossName);

  let raf=0,running=false,paused=false,last=0,startAt=0,pausedAt=0,pausedTotal=0;
  let difficulty='normal',score=0,time=0,level=1,wave=1,combo=1,bestCombo=1,lives=3,dash=100,dashCd=0,coins=0,shield=0,slow=0;
  let spawn=0,pupSpawn=2.8,shotSpawn=0,enemyId=0,boss=null,mission=null,sound=true,audio=null;
  let pointerTarget=null;
  const keys=Object.create(null), enemies=[],pups=[],particles=[],shots=[],bossShots=[],texts=[];
  const stars=Array.from({length:180},()=>({x:Math.random()*W,y:Math.random()*H,s:.5+Math.random()*2,v:12+Math.random()*35}));
  const modes={easy:{lives:4,spd:390,mult:.82},normal:{lives:3,spd:430,mult:1},hard:{lives:2,spd:480,mult:1.22}};
  const skinColors={classic:'#38bdf8',neon:'#22d3ee',inferno:'#fb7185',galaxy:'#a78bfa',crystal:'#f0abfc'};
  let skin='classic',bank=0,xp=0;
  let player={x:615,y:635,w:50,h:50,vx:0,inv:0};
  const achievements={
    first:['🎮','Première partie','Lancer une partie'],survive30:['⏱️','30 secondes','Survivre 30 secondes'],survive60:['⏱️','Une minute','Survivre 60 secondes'],score1000:['💯','Mille points','Faire 1 000 points'],score5000:['🏆','Cinq mille','Faire 5 000 points'],combo5:['🔥','Combo x5','Atteindre un combo x5'],combo10:['🔥','Combo x10','Atteindre un combo x10'],level5:['📈','Niveau 5','Atteindre le niveau 5'],wave5:['🌊','Vague 5','Atteindre la vague 5'],wave10:['🌊','Vague 10','Atteindre la vague 10'],hard:['💀','Mode difficile','Terminer une partie en difficile'],perfect60:['🛡️','Intouchable','Survivre 60 secondes sans perdre de vie'],boss:['👑','Chasseur de boss','Vaincre un boss'],collector:['🪙','Collectionneur','Ramasser 10 pièces'],marathon:['🚀','Marathon','Survivre 120 secondes']
  };
  let unlocked=new Set();
  function readProgress(){try{const s=JSON.parse(localStorage.getItem('pixelDodgeProgress')||'{}');bank=+s.coins||0;xp=+s.xp||0;skin=skinColors[s.skin]?s.skin:'classic';unlocked=new Set([...(Array.isArray(s.achievementsV3)?s.achievementsV3:[]),...(Array.isArray(s.achievements)?s.achievements:[])])}catch{}}
  function saveProgress(){try{const s=JSON.parse(localStorage.getItem('pixelDodgeProgress')||'{}');s.coins=Math.max(0,bank);s.xp=Math.max(0,xp);s.skin=skin;s.achievementsV3=[...unlocked];localStorage.setItem('pixelDodgeProgress',JSON.stringify(s))}catch{}}
  readProgress();
  const accountHost=document.querySelector('.dodge-account')||document.createElement('span'); accountHost.className='dodge-account offline'; if(!accountHost.parentElement) document.querySelector('.top .actions')?.prepend(accountHost);
  function account(){const s=window.PAAuth?.state||{},p=window.PAAuth?.currentPseudo?.()||s.profile?.pseudo||s.user?.user_metadata?.pseudo||'';const ok=!!s.user?.access_token;accountHost.className='dodge-account'+(ok?'':' offline');accountHost.textContent=ok?'👤 '+(p||'Compte connecté'):'👤 Compte non chargé';return{s,p,ok}}
  account(); window.addEventListener('pa-auth-ready',account); window.addEventListener('pa-auth-updated',account);
  function profileLevel(){return 1+Math.floor(xp/1000)}
  function notify(t,sub=''){texts.push({x:W/2,y:245,t,sub,life:2.2,max:2.2,big:true})}
  let achSync=0;
  function unlock(id){if(unlocked.has(id))return;unlocked.add(id);saveProgress();const a=achievements[id];if(a)notify('🏅 '+a[1],a[2]);syncAchievements()}
  async function syncAchievements(){const a=account();if(!a.ok||!window.PAAuth?.updateProfile)return;const now=performance.now();if(now-achSync<600)return;achSync=now;try{const old=Array.isArray(a.s?.profile?.achievements)?a.s.profile.achievements:[];const merged=[...new Set([...old,...unlocked])];if(merged.length!==old.length)await window.PAAuth.updateProfile({achievements:merged})}catch{}}
  function setMission(){const pool=[['survive',18,'Survivre 18 secondes'],['score',1500,'Atteindre 1 500 points'],['coins',15,'Ramasser 15 pièces'],['collect',5,'Ramasser 5 bonus'],['boss',1,'Vaincre 1 boss']];const m=pool[Math.floor(Math.random()*pool.length)];mission={type:m[0],target:m[1],done:0,name:m[2],complete:false}}
  function missionUpdate(){if(!mission)return;if(mission.type==='survive')mission.done=time;if(mission.type==='score')mission.done=score;if(mission.type==='coins')mission.done=coins;if(mission.type==='collect')mission.done=Math.min(mission.target,mission.done);if(mission.type==='boss')mission.done=mission.done;if(mission.done>=mission.target&&!mission.complete){mission.complete=true;score+=500;xp+=120;saveProgress();notify('🎯 MISSION RÉUSSIE','+500 points · +120 XP');setTimeout(()=>{if(running&&!paused)setMission()},800)}}
  function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
  function burst(x,y,col,n=22){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=30+Math.random()*260;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.7,max:1,size:1.5+Math.random()*4,col})}
  function addText(x,y,t,col='#fff'){texts.push({x,y,t,life:1,max:1,col})}
  function spawnEnemy(type){const side=Math.random()<.5?-1:1;const e={id:++enemyId,type,x:0,y:0,w:34,h:34,vx:0,vy:0,phase:Math.random()*6.28,rot:0};
    if(type==='orb'){e.x=30+Math.random()*1220;e.y=-35;e.w=e.h=28;e.vy=155+wave*12+Math.random()*90}
    else if(type==='zigzag'){e.x=50+Math.random()*1180;e.y=-45;e.w=e.h=36;e.vy=180+wave*10;e.vx=70+Math.random()*80}
    else if(type==='flyby'){e.x=side<0?-80:1360;e.y=90+Math.random()*470;e.w=70;e.h=30;e.vx=side*(760+Math.random()*300);e.vy=(Math.random()-.5)*30}
    else if(type==='hunter'){e.x=50+Math.random()*1180;e.y=-50;e.w=46;e.h=48;e.vy=100+wave*6}
    else {e.x=35+Math.random()*1210;e.y=-35;e.w=e.h=42;e.vy=95+wave*8;e.vx=(Math.random()-.5)*50}
    enemies.push(e)
  }
  function spawnEnemyByWave(){const pool=wave<3?['orb','zigzag']:wave<5?['orb','zigzag','flyby']:wave<8?['orb','zigzag','flyby','hunter']:['orb','zigzag','flyby','hunter','mine'];spawnEnemy(pool[Math.floor(Math.random()*pool.length)])}
  function spawnBonus(){const types=['shield','slow','points','coin','combo'],type=types[Math.floor(Math.random()*types.length)];pups.push({x:45+Math.random()*1190,y:-25,r:20,type,vy:110+Math.random()*35,phase:Math.random()*6.28})}
  function spawnBoss(){boss={x:W/2-115,y:65,w:230,h:105,hp:180+wave*28,max:180+wave*28,dir:1,fire:0,phase:0};bossName.style.display='block';$('bossbar')?.classList.remove('hidden');$('event').textContent='👾 BOSS — VAGUE '+wave;$('event').classList.remove('hidden');$('bossFill').style.width='100%';notify('👾 BOSS ARRIVE','Vague '+wave);burst(W/2,120,'#fb7185',70)}
  function clearBossUi(){boss=null;bossName.style.display='none';$('bossbar')?.classList.add('hidden');$('event')?.classList.add('hidden');$('event')?.replaceChildren();const wa=$('waveAlert');if(wa){clearTimeout(wa.__paTimer);wa.__paTimer=null;wa.classList.remove('show')}}
  function dashUse(){
    if(!running||paused||dash<35||dashCd>0)return false;
    dash-=35;dashCd=.42;player.inv=.42;
    let d=0;
    if(keys.ArrowLeft||keys.a||keys.A||keys.KeyA||keys['ArrowLeft'])d=-1;
    else if(keys.ArrowRight||keys.d||keys.D||keys.KeyD)d=1;
    else if(pointerTarget!==null)d=(pointerTarget>player.x+player.w/2)?1:-1;
    else d=player.vx<0?-1:1;
    const before=player.x;
    player.x=Math.max(5,Math.min(W-player.w-5,player.x+d*300));
    burst(before+25,player.y+25,'#22d3ee',32);burst(player.x+25,player.y+25,'#67e8f9',32);
    addText(player.x+25,player.y-18,'⚡ DASH','#67e8f9');tone?.(180,.08);
    return true;
  }
  function pause(){if(!running)return;paused=!paused;if(paused)pointerTarget=null;const po=$('pauseOverlay');po.classList.toggle('hidden',!paused);$('pause').textContent=paused?'▶ Reprendre':'Ⅱ Pause';if(paused){pausedAt=performance.now();cancelAnimationFrame(raf)}else{pausedTotal+=performance.now()-pausedAt;last=performance.now();raf=requestAnimationFrame(loop)}}
  function reset(){cancelAnimationFrame(raf);running=false;paused=false;score=0;time=0;level=1;wave=1;combo=1;bestCombo=1;lives=modes[difficulty].lives;dash=100;dashCd=0;coins=0;shield=0;slow=0;spawn=.35;pupSpawn=2.4;shotSpawn=.15;enemyId=0;boss=null;enemies.length=0;pups.length=0;particles.length=0;shots.length=0;bossShots.length=0;texts.length=0;player={x:615,y:635,w:50,h:50,vx:0,inv:0};pointerTarget=null;mission=null;setMission();clearBossUi();$('pauseOverlay')?.classList.add('hidden');$('pause').textContent='Ⅱ Pause';$('startOverlay')?.classList.remove('hidden');$('result')?.classList.remove('show');$('result').style.display='none';$('manualScore')?.classList.add('hidden');$('autoScore')?.classList.add('hidden');$('message').textContent='';updateHud();draw()}
  function start(){reset();pointerTarget=null;running=true;startAt=performance.now();last=startAt;pausedTotal=0;$('startOverlay').classList.add('hidden');$('result').classList.remove('show');$('result').style.display='none';unlock('first');raf=requestAnimationFrame(loop)}
  function collect(b){const val={shield:100,slow:150,points:350,coin:80,combo:180}[b.type];score+=val*combo;if(b.type==='shield')shield=9;if(b.type==='slow')slow=7;if(b.type==='coin')coins++;if(b.type==='combo')combo=Math.min(12,combo+2);else combo=Math.min(12,combo+1);bestCombo=Math.max(bestCombo,combo);if(mission?.type==='coins'&&b.type==='coin')mission.done++;if(mission?.type==='collect')mission.done++;if(coins>=10)unlock('collector');burst(b.x,b.y,{shield:'#22d3ee',slow:'#a78bfa',points:'#facc15',coin:'#facc15',combo:'#4ade80'}[b.type],35);addText(b.x,b.y-22,'+'+val,{shield:'#22d3ee',slow:'#a78bfa',points:'#facc15',coin:'#facc15',combo:'#4ade80'}[b.type]);if(combo>=5)unlock('combo5');if(combo>=10)unlock('combo10');missionUpdate()}
  function damage(){if(player.inv>0)return;if(shield>0){shield=0;player.inv=.65;burst(player.x+25,player.y+25,'#22d3ee',45);addText(player.x+25,player.y,'BOUCLIER','#67e8f9');score+=100*combo;return}lives--;combo=Math.max(1,combo-3);player.inv=1.05;burst(player.x+25,player.y+25,'#fb7185',30);if(lives<=0)finish()}
  async function saveOnline(v){const a=account();if(a.ok&&window.PAAuth?.recordScore){try{const ok=await window.PAAuth.recordScore('dodge',v,1,a.p||'Joueur');$('message').textContent=ok?'✓ Score enregistré.':'⚠️ Score gardé localement.';return}catch{}}try{const a2=JSON.parse(localStorage.getItem('pixelArcadeScores')||'[]');a2.unshift({game:'dodge',score:Math.round(v),players:1,pseudo:a.p||localStorage.getItem('pixelArcadePseudo')||'Joueur',created_at:new Date().toISOString(),synced:false});localStorage.setItem('pixelArcadeScores',JSON.stringify(a2.slice(0,100)))}catch{}$('message').textContent='⚠️ Score gardé localement.'}
  async function loadRanking(){const el=$('ranking');if(!el)return;try{const cfg=window.PIXEL_ARCADE_CONFIG||{};const url=String(cfg.supabaseUrl||'').replace(/\/$/,'');const key=cfg.supabaseAnonKey||'';if(url&&key){const r=await fetch(url+'/rest/v1/scores?select=pseudo,score,game&game=eq.dodge&order=score.desc&limit=10',{headers:{apikey:key,Authorization:'Bearer '+key}});if(r.ok){const d=await r.json();if(Array.isArray(d)&&d.length){el.innerHTML=d.map((x,i)=>`<div class="row"><span>#${i+1} · ${String(x.pseudo||'Joueur').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</span><b>${Number(x.score)||0}</b></div>`).join('');return}}}}catch{}try{const a=JSON.parse(localStorage.getItem('pixelArcadeScores')||'[]').filter(x=>x.game==='dodge').sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,10);el.innerHTML=a.length?a.map((x,i)=>`<div class="row"><span>#${i+1} · ${String(x.pseudo||'Joueur').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</span><b>${Number(x.score)||0}</b></div>`).join(''):'<p>Aucun score pour le moment.</p>'}catch{el.innerHTML='<p>Classement indisponible.</p>'}}
  function finish(){if(!running)return;running=false;cancelAnimationFrame(raf);const sec=time,v=Math.floor(score),gain=Math.max(20,Math.floor(v/8))+coins*10;bank+=coins;xp+=gain;saveProgress();if(sec>=30)unlock('survive30');if(sec>=60)unlock('survive60');if(sec>=120)unlock('marathon');if(v>=1000)unlock('score1000');if(v>=5000)unlock('score5000');if(level>=5)unlock('level5');if(wave>=5)unlock('wave5');if(wave>=10)unlock('wave10');if(difficulty==='hard')unlock('hard');if(sec>=60&&lives===modes[difficulty].lives)unlock('perfect60');clearBossUi();$('finalScore').textContent=v;$('finalTime').textContent=sec.toFixed(1)+' s';$('finalWave').textContent=wave;$('resultStats').textContent=`🪙 +${coins} pièces · ✨ +${gain} XP · 🔥 meilleur combo x${bestCombo}`;$('result').classList.add('show');$('result').style.display='block';$('manualScore').classList.add('hidden');$('autoScore').classList.remove('hidden');$('pauseOverlay').classList.add('hidden');saveOnline(v);renderShop();updateHud();loadRanking()}
  function updateHud(){const set=(id,v)=>{const e=$(id);if(e)e.textContent=v};set('score',Math.floor(score));set('time',time.toFixed(1));set('level',level);set('combo','x'+combo);set('lives','♥'.repeat(Math.max(0,lives)));set('dash',Math.round(dash)+'%');set('wave',wave);set('coins',coins);set('xp','Niv. '+profileLevel());set('missionText',mission?`${mission.name} (${Math.floor(mission.done)}/${mission.target})`:'Mission');const mb=$('missionBar');if(mb)mb.style.width=(mission?Math.min(100,mission.done/mission.target*100):0)+'%';renderShopMini()}
  function renderShopMini(){const a=$('bankCoins');if(a)a.textContent=bank.toLocaleString('fr-FR');const l=$('profileLevel');if(l)l.textContent=profileLevel();const x=$('profileXP');if(x)x.textContent=xp;const bar=$('xpBar');if(bar)bar.style.width=(xp%1000)/10+'%';const p=$('progressText');if(p)p.textContent=(xp%1000)+' / 1000 XP'}
  function renderShop(){renderShopMini();const el=$('shop');if(!el)return;const defs={classic:['Classic',0,'🚀'],neon:['Neon',250,'⚡'],inferno:['Inferno',650,'🔥'],galaxy:['Galaxy',1200,'🌌'],crystal:['Crystal',2000,'💎']};let s={};try{s=JSON.parse(localStorage.getItem('pixelDodgeProgress')||'{}')}catch{}const owned=new Set(s.skins||['classic']);owned.add('classic');el.innerHTML=Object.entries(defs).map(([k,v])=>`<div class="skin ${skin===k?'on':''}"><div class="icon">${v[2]}</div><b>${v[0]}</b><div>${v[1]?'🪙 '+v[1]:'Départ'}</div><button data-skin="${k}">${skin===k?'Équipé':owned.has(k)?'Équiper':bank>=v[1]?'Acheter':'Verrouillé'}</button></div>`).join('');el.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>{const k=b.dataset.skin;let q={};try{q=JSON.parse(localStorage.getItem('pixelDodgeProgress')||'{}')}catch{}const o=new Set(q.skins||['classic']);o.add('classic');if(o.has(k)){skin=k;q.skin=k;q.skins=[...o];q.coins=bank;q.xp=xp;localStorage.setItem('pixelDodgeProgress',JSON.stringify(q));renderShop();return}if(bank>=defs[k][1]){bank-=defs[k][1];o.add(k);q.skins=[...o];q.skin=k;q.coins=bank;q.xp=xp;localStorage.setItem('pixelDodgeProgress',JSON.stringify(q));skin=k;renderShop()}})}
  function update(dt){
    time=Math.max(0,(performance.now()-startAt-pausedTotal)/1000);
    level=1+Math.floor(time/20);
    const nextWave=1+Math.floor(time/12);
    if(nextWave!==wave){wave=nextWave;waveAlert();if(wave%5===0&&!boss)spawnBoss()}
    const mult=modes[difficulty].mult*(slow>0?.55:1);
    let move=0;if(keys.ArrowLeft||keys.a||keys.A)move-=1;if(keys.ArrowRight||keys.d||keys.D)move+=1;
    const target=pointerTarget;
    if(target!==null)move=0;
    if(target!==null){const desired=target-player.w/2;const dx=desired-player.x;player.vx=Math.max(-modes[difficulty].spd,Math.min(modes[difficulty].spd,dx*9));if(Math.abs(dx)<1.5)player.vx=0}
    else player.vx=move*modes[difficulty].spd;
    player.x=Math.max(5,Math.min(W-player.w-5,player.x+player.vx*dt));
    player.inv=Math.max(0,player.inv-dt);dashCd=Math.max(0,dashCd-dt);dash=Math.min(100,dash+28*dt);shield=Math.max(0,shield-dt);slow=Math.max(0,slow-dt);
    spawn-=dt;if(spawn<=0){spawnEnemyByWave();spawn=Math.max(.32,1.05-wave*.035)*modes[difficulty].mult}
    pupSpawn-=dt;if(pupSpawn<=0){spawnBonus();pupSpawn=3.4+Math.random()*3.2}
    shotSpawn-=dt;if(shotSpawn<=0){shots.push({x:player.x+25,y:player.y-8,vx:0,vy:-720});shotSpawn=.34}
    for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.y+=e.vy*mult*dt;e.x+=e.vx*dt;if(e.type==='zigzag')e.x+=Math.sin(time*4+e.phase)*130*dt;if(e.type==='hunter'){const dx=(player.x+25)-(e.x+e.w/2);e.x+=Math.max(-150,Math.min(150,dx*.6))*dt}if(e.type==='mine')e.x+=Math.sin(time*2+e.phase)*55*dt;if(e.y>H+90||e.x<-180||e.x>1460){enemies.splice(i,1);continue}if(hit(player,e)){enemies.splice(i,1);damage();if(!running)break}}
    for(let i=pups.length-1;i>=0;i--){const b=pups[i];b.y+=b.vy*dt;b.x+=Math.sin(time*2+b.phase)*25*dt;if(b.y>H+50){pups.splice(i,1);continue}const box={x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2};if(hit(player,box)){pups.splice(i,1);collect(b)}}
    for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.y+=s.vy*dt;if(s.y<-30){shots.splice(i,1);continue}let gone=false;for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(s.x>e.x&&s.x<e.x+e.w&&s.y>e.y&&s.y<e.y+e.h){enemies.splice(j,1);shots.splice(i,1);score+=30*combo;combo=Math.min(12,combo+0.15);bestCombo=Math.max(bestCombo,combo);burst(e.x+e.w/2,e.y+e.h/2,e.type==='flyby'?'#facc15':'#a78bfa',12);gone=true;break}}if(gone)continue;if(boss&&s.x>boss.x&&s.x<boss.x+boss.w&&s.y>boss.y&&s.y<boss.y+boss.h){boss.hp-=7;shots.splice(i,1);if(boss.hp<=0){score+=1000*combo;unlock('boss');if(mission?.type==='boss')mission.done=mission.target;missionUpdate();burst(boss.x+boss.w/2,boss.y+50,'#fb7185',100);boss=null;clearBossUi()}}}
    if(boss){boss.x+=boss.dir*120*dt;if(boss.x<30||boss.x+boss.w>W-30)boss.dir*=-1;boss.fire-=dt;boss.phase+=dt;if(boss.fire<=0){boss.fire=.7;for(let q=-1;q<=1;q++)bossShots.push({x:boss.x+boss.w/2,y:boss.y+boss.h,vx:q*120,vy:260})}$('bossFill').style.width=Math.max(0,boss.hp/boss.max*100)+'%';if(hit(player,boss))damage()}
    for(let i=bossShots.length-1;i>=0;i--){const s=bossShots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.y>H+30||s.x<-30||s.x>W+30){bossShots.splice(i,1);continue}if(s.x>player.x&&s.x<player.x+player.w&&s.y>player.y&&s.y<player.y+player.h){bossShots.splice(i,1);damage();if(!running)break}}
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
    for(let i=texts.length-1;i>=0;i--){texts[i].life-=dt;texts[i].y-=18*dt;if(texts[i].life<=0)texts.splice(i,1)}
    score+=dt*(10+wave*2)*combo;missionUpdate();updateHud()
  }
  function waveAlert(){const a=$('waveAlert'),t=$('waveAlertTitle'),s=$('waveAlertText');if(!a)return;t.textContent='Vague '+wave;s.textContent=wave%5===0?'⚠️ BOSS !':'Les ennemis accélèrent…';a.classList.add('show');clearTimeout(a.__paTimer);a.__paTimer=setTimeout(()=>a.classList.remove('show'),1100)}
  function drawShip(x,y,col,ghost=false){ctx.save();ctx.translate(x+25,y+25);ctx.globalAlpha=ghost?.18:1;ctx.shadowBlur=22;ctx.shadowColor=col;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(21,22);ctx.lineTo(0,14);ctx.lineTo(-21,22);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e0f2fe';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(8,10);ctx.lineTo(0,7);ctx.lineTo(-8,10);ctx.closePath();ctx.fill();ctx.fillStyle='#0b1020';ctx.beginPath();ctx.arc(0,1,3.5,0,Math.PI*2);ctx.fill();ctx.restore()}
  function drawEnemy(e){const purple=e.type!=='flyby',col=purple?'#a78bfa':'#facc15';ctx.save();ctx.translate(e.x+e.w/2,e.y+e.h/2);ctx.shadowBlur=18;ctx.shadowColor=col;ctx.fillStyle=col;
    if(e.type==='flyby'){ctx.rotate(e.vx<0?Math.PI:0);ctx.beginPath();ctx.moveTo(-32,0);ctx.lineTo(28,-13);ctx.lineTo(18,0);ctx.lineTo(28,13);ctx.closePath();ctx.fill()}
    else if(e.type==='mine'){ctx.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6;const r=i%2?15:23;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.fillStyle='#160b2c';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill()}
    else if(e.type==='hunter'){ctx.beginPath();ctx.moveTo(0,25);ctx.lineTo(22,-18);ctx.lineTo(0,-10);ctx.lineTo(-22,-18);ctx.closePath();ctx.fill();ctx.fillStyle='#f5d0fe';ctx.beginPath();ctx.arc(0,-3,4,0,Math.PI*2);ctx.fill()}
    else if(e.type==='zigzag'){ctx.beginPath();ctx.moveTo(0,22);ctx.lineTo(18,-16);ctx.lineTo(0,-7);ctx.lineTo(-18,-16);ctx.closePath();ctx.fill();ctx.fillStyle='#f5d0fe';ctx.beginPath();ctx.arc(0,2,4,0,Math.PI*2);ctx.fill()}
    else {ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#180d31';ctx.beginPath();ctx.arc(-5,-2,3,0,Math.PI*2);ctx.arc(5,-2,3,0,Math.PI*2);ctx.fill()}
    ctx.restore()}
  function draw(){ctx.clearRect(0,0,W,H);const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,900);g.addColorStop(0,'#081a35');g.addColorStop(1,'#02050c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.strokeStyle='#10233d';ctx.globalAlpha=.38;for(let x=0;x<=W;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<=H;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.globalAlpha=1;for(const s of stars){s.y+=s.v/60;if(s.y>H)s.y=0;ctx.fillStyle='#dbeafe';ctx.globalAlpha=.25+s.s*.18;ctx.fillRect(s.x,s.y,s.s,s.s)}ctx.globalAlpha=1;for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.col;ctx.fillRect(p.x,p.y,p.size,p.size)}ctx.globalAlpha=1;for(const b of pups){const cols={shield:'#22d3ee',slow:'#a78bfa',points:'#facc15',coin:'#facc15',combo:'#4ade80'};ctx.save();ctx.translate(b.x,b.y);ctx.shadowBlur=18;ctx.shadowColor=cols[b.type];ctx.fillStyle=cols[b.type];ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#07101b';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText({shield:'🛡',slow:'◌',points:'★',coin:'¢',combo:'×2'}[b.type],0,1);ctx.restore()}for(const e of enemies)drawEnemy(e);for(const s of shots){ctx.fillStyle='#e0f2fe';ctx.shadowBlur=10;ctx.shadowColor='#22d3ee';ctx.fillRect(s.x-2,s.y-12,4,18)}ctx.shadowBlur=0;for(const s of bossShots){ctx.fillStyle='#fb7185';ctx.beginPath();ctx.arc(s.x,s.y,6,0,Math.PI*2);ctx.fill()}if(boss){ctx.save();ctx.shadowBlur=28;ctx.shadowColor='#fb7185';ctx.fillStyle='#fb7185';ctx.beginPath();ctx.roundRect(boss.x,boss.y,boss.w,boss.h,22);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#190914';ctx.beginPath();ctx.arc(boss.x+65,boss.y+52,16,0,Math.PI*2);ctx.arc(boss.x+165,boss.y+52,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(boss.x+65,boss.y+52,6,0,Math.PI*2);ctx.arc(boss.x+165,boss.y+52,6,0,Math.PI*2);ctx.fill();ctx.restore()}if(running&&!paused&&player.inv%0.16<0.08)drawShip(player.x,player.y,skinColors[skin]||skinColors.classic);else if(!running||paused)drawShip(player.x,player.y,skinColors[skin]||skinColors.classic);for(const t of texts){ctx.globalAlpha=Math.max(0,t.life/t.max);ctx.textAlign='center';ctx.fillStyle=t.col||'#fff';ctx.font=t.big?'900 24px system-ui':'800 16px system-ui';ctx.shadowBlur=t.big?16:0;ctx.shadowColor=t.col||'#fff';ctx.fillText(t.t,t.x,t.y);if(t.sub){ctx.font='700 14px system-ui';ctx.fillStyle='#cbd5e1';ctx.fillText(t.sub,t.x,t.y+25)}}ctx.globalAlpha=1;ctx.shadowBlur=0}
  function loop(now){if(!running||paused)return;const dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;update(dt);draw();raf=requestAnimationFrame(loop)}
  function pointerX(e){const r=canvas.getBoundingClientRect();return Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width))}
  function setPointer(e){if(!running||paused)return;pointerTarget=pointerX(e)}
  canvas.addEventListener('pointermove',setPointer,{passive:true});
  canvas.addEventListener('pointerdown',e=>{if(!running||paused)return;e.preventDefault();setPointer(e);try{canvas.setPointerCapture(e.pointerId)}catch{}},{passive:false});
  canvas.addEventListener('pointerup',e=>{if(e.pointerType==='touch')pointerTarget=null});
  canvas.addEventListener('pointercancel',()=>pointerTarget=null);
  canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')pointerTarget=null});
  canvas.addEventListener('touchstart',e=>{if(!running||paused)return;const t=e.touches[0];if(t){const r=canvas.getBoundingClientRect();pointerTarget=Math.max(0,Math.min(W,(t.clientX-r.left)*W/r.width))}},{passive:true});
  canvas.addEventListener('touchmove',e=>{if(!running||paused)return;const t=e.touches[0];if(t){const r=canvas.getBoundingClientRect();pointerTarget=Math.max(0,Math.min(W,(t.clientX-r.left)*W/r.width))}},{passive:true});
  canvas.addEventListener('touchend',()=>pointerTarget=null,{passive:true});
  document.addEventListener('keydown',e=>{
    const k=e.key,code=e.code;
    keys[k]=true;keys[code]=true;
    if(['ArrowLeft','ArrowRight','a','A','d','D','Shift',' '].includes(k)||code==='Space'||code==='ShiftLeft'||code==='ShiftRight')e.preventDefault();
    if((k==='Shift'||code==='ShiftLeft'||code==='ShiftRight')&&!e.repeat)dashUse();
    if((code==='Space'||k===' ')&&!e.repeat)pause();
  },{passive:false});
  document.addEventListener('keyup',e=>{keys[e.key]=false;keys[e.code]=false});
  $('pause').onclick=()=>pause(); $('resume').onclick=()=>{if(paused)pause()}; $('dashBtn').onclick=e=>{e.preventDefault();dashUse();}; $('start').onclick=start; $('again').onclick=start; $('againAuto').onclick=start; $('restart').onclick=reset;
  document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{difficulty=b.dataset.diff;document.querySelectorAll('[data-diff]').forEach(x=>x.classList.toggle('active',x===b));reset()});
  $('save').onclick=async()=>{const p=($('pseudo').value||'').trim();const v=Math.floor(score);try{await window.PAAuth?.saveAnonymousScore?.('dodge',v,1,p||'Joueur')}catch{}$('message').textContent='✓ Score enregistré.';loadRanking()};
  $('fullscreen').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else $('gamePanel')?.requestFullscreen?.()}catch{}};
  canvas.__paDodgeOldStop=()=>{cancelAnimationFrame(raf);running=false};
  window.addEventListener('beforeunload',()=>cancelAnimationFrame(raf),{once:true});
  renderShop();updateHud();loadRanking();reset();
})();
