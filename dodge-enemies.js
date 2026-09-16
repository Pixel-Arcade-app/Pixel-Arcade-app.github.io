(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const $=id=>document.getElementById(id),c=$('gameCanvas'),wrap=c?.parentElement;if(!c||!wrap)return;
  const style=document.createElement('style');style.textContent=`
    .dodge-bonus-layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;border-radius:16px}
    .dodge-bonus-toast{position:absolute;left:50%;bottom:16%;transform:translate(-50%,8px) scale(.9);z-index:12;pointer-events:none;font:900 18px system-ui;color:#fde68a;text-shadow:0 0 16px #f59e0b;opacity:0;transition:.16s}.dodge-bonus-toast.show{opacity:1;transform:translate(-50%,0) scale(1)}
  `;document.head.appendChild(style);
  const layer=document.createElement('canvas');layer.className='dodge-bonus-layer';layer.width=1280;layer.height=720;wrap.appendChild(layer);const ctx=layer.getContext('2d');
  const toast=document.createElement('div');toast.className='dodge-bonus-toast';wrap.appendChild(toast);
  let bonuses=[],last=performance.now(),timer=4,boss=null,bossWave=0,playerX=640,toastTime=0;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  window.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();playerX=(e.clientX-r.left)/r.width*1280;window.__dodgePointerX=playerX});
  window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')playerX=Math.max(30,playerX-48);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')playerX=Math.min(1250,playerX+48)});
  function spawnBonus(){const types=['shield','slow','points','coin','combo'];bonuses.push({type:types[Math.floor(Math.random()*types.length)],x:rnd(50,1230),y:-25,r:17,t:0,vy:rnd(75,115)})}
  function drawBonus(b){const colors={shield:'#38bdf8',slow:'#a78bfa',points:'#4ade80',coin:'#facc15',combo:'#fb7185'},icons={shield:'S',slow:'◌',points:'+',coin:'$',combo:'×'},col=colors[b.type];ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.t*.9);ctx.shadowColor=col;ctx.shadowBlur=24;ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,b.r+Math.sin(b.t*5)*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#06101d';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(icons[b.type],0,1);ctx.restore()}
  function drawBoss(b){ctx.save();ctx.translate(b.x,b.y);const pulse=1+Math.sin(b.t*4)*.05;ctx.scale(pulse,pulse);ctx.shadowColor='#fb7185';ctx.shadowBlur=35;ctx.fillStyle='#9f1239';ctx.beginPath();ctx.moveTo(0,-62);ctx.lineTo(80,-18);ctx.lineTo(58,43);ctx.lineTo(23,28);ctx.lineTo(0,60);ctx.lineTo(-23,28);ctx.lineTo(-58,43);ctx.lineTo(-80,-18);ctx.closePath();ctx.fill();ctx.shadowBlur=12;ctx.fillStyle='#fb7185';ctx.beginPath();ctx.arc(0,-6,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(-10,-8,5,0,Math.PI*2);ctx.arc(10,-8,5,0,Math.PI*2);ctx.fill();ctx.restore()}
  function showToast(t){toast.textContent=t;toast.classList.add('show');toastTime=.9}
  function loop(now){const dt=Math.min(.035,(now-last)/1000);last=now;const time=parseFloat(String($('time')?.textContent||0).replace(',','.'))||0,wave=Math.max(1,Number($('wave')?.textContent)||1),paused=!$('pauseOverlay')?.classList.contains('hidden'),fallback=document.documentElement.dataset.dodgeFallback==='1';
    if(fallback||time<.2){bonuses=[];boss=null;layer.style.display='none';requestAnimationFrame(loop);return}
    layer.style.display='block';
    if(!paused){timer-=dt;if(timer<=0){spawnBonus();timer=rnd(5,8)}const px=window.__dodgePointerX??playerX;
      for(let i=bonuses.length-1;i>=0;i--){const b=bonuses[i];b.t+=dt;b.y+=b.vy*dt;if(b.y>755){bonuses.splice(i,1);continue}if(Math.hypot(b.x-px,b.y-653)<b.r+24){if(b.type==='coin')$('coins').textContent=String((Number($('coins')?.textContent)||0)+1);if(b.type==='points')$('score').textContent=String((Number($('score')?.textContent)||0)+250);if(b.type==='combo'){const el=$('combo');if(el){const n=Math.min(10,(Number(String(el.textContent).replace(/\D/g,''))||1)+1);el.textContent='x'+n}}const label={shield:'🛡️ Bouclier',slow:'⏱️ Temps ralenti',points:'✨ +250 points',coin:'🪙 +1 pièce',combo:'🔥 Combo +1'}[b.type];showToast(label);bonuses.splice(i,1)}}
      if(wave>=5&&wave%5===0){if(bossWave!==wave){bossWave=wave;boss={x:640,y:110,t:0};const ev=$('event');if(ev){ev.textContent='👾 BOSS — VAGUE '+wave;ev.classList.remove('hidden');ev.style.display='block'}}if(boss){boss.t+=dt;boss.x=640+Math.sin(boss.t*.75)*320;boss.y=110+Math.sin(boss.t*1.3)*18}}else boss=null;
    }
    ctx.clearRect(0,0,1280,720);for(const b of bonuses)drawBonus(b);if(boss)drawBoss(boss);if(toastTime>0){toastTime-=dt;if(toastTime<=0)toast.classList.remove('show')};requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop);
})();