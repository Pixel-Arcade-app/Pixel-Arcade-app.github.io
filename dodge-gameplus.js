(()=>{
 if(document.body?.dataset.game!=='dodge')return;
 const $=id=>document.getElementById(id), c=$('gameCanvas'), wrap=c?.parentElement; if(!c||!wrap)return;
 const style=document.createElement('style');style.textContent=`
 .dodge-plus-layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;border-radius:16px}
 .dodge-bonus-toast{position:absolute;left:50%;bottom:16%;transform:translateX(-50%) scale(.85);z-index:12;pointer-events:none;font:900 18px system-ui;color:#fde68a;text-shadow:0 0 16px #f59e0b;opacity:0;transition:.16s}.dodge-bonus-toast.show{opacity:1;transform:translateX(-50%) scale(1)}
 `;document.head.appendChild(style);
 const layer=document.createElement('canvas');layer.className='dodge-plus-layer';layer.width=1280;layer.height=720;wrap.appendChild(layer);const x=layer.getContext('2d');
 const toast=document.createElement('div');toast.className='dodge-bonus-toast';wrap.appendChild(toast);
 let bonus=[],boss=null,last=performance.now(),bonusTimer=3,bossWave=0,playerX=640,toastT=0;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 function shipX(){return window.__dodgePointerX??playerX}
 window.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();playerX=(e.clientX-r.left)/r.width*1280;window.__dodgePointerX=playerX});
 window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')playerX-=45;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')playerX+=45;playerX=Math.max(35,Math.min(1245,playerX))});
 function spawnBonus(){const types=['shield','slow','points','coin','combo'];const type=types[Math.floor(Math.random()*types.length)];bonus.push({type,x:rnd(55,1225),y:-25,r:16,t:0,vy:rnd(80,120)});}
 function drawBonus(b){x.save();x.translate(b.x,b.y);const col={shield:'#38bdf8',slow:'#a78bfa',points:'#4ade80',coin:'#facc15',combo:'#fb7185'}[b.type];x.shadowColor=col;x.shadowBlur=24;x.fillStyle=col;x.beginPath();x.arc(0,0,b.r+Math.sin(b.t*5)*2,0,Math.PI*2);x.fill();x.shadowBlur=0;x.fillStyle='#06101d';x.font='900 17px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText({shield:'S',slow:'◌',points:'+',coin:'$',combo:'×'}[b.type],0,1);x.restore()}
 function showToast(text){toast.textContent=text;toast.classList.add('show');toastT=.9}
 function drawBoss(b){x.save();x.translate(b.x,b.y);const pulse=1+Math.sin(b.t*4)*.05;x.scale(pulse,pulse);x.shadowColor='#fb7185';x.shadowBlur=35;x.fillStyle='#be123c';x.beginPath();x.moveTo(0,-65);x.lineTo(78,-18);x.lineTo(58,42);x.lineTo(22,26);x.lineTo(0,58);x.lineTo(-22,26);x.lineTo(-58,42);x.lineTo(-78,-18);x.closePath();x.fill();x.shadowBlur=12;x.fillStyle='#fb7185';x.beginPath();x.arc(0,-6,25,0,Math.PI*2);x.fill();x.fillStyle='#111827';x.beginPath();x.arc(-10,-8,5,0,Math.PI*2);x.arc(10,-8,5,0,Math.PI*2);x.fill();x.fillStyle='#fecdd3';x.fillRect(-52,24,28,7);x.fillRect(24,24,28,7);x.restore();}
 function loop(now){const dt=Math.min(.035,(now-last)/1000);last=now;const time=parseFloat(String($('time')?.textContent||0).replace(',','.'))||0,wave=Math.max(1,Number($('wave')?.textContent)||1),paused=!$('pauseOverlay')?.classList.contains('hidden'),fallback=document.documentElement.dataset.dodgeFallback==='1';
  if(fallback||time<.2){bonus.length=0;boss=null;layer.style.display='none';requestAnimationFrame(loop);return}
  layer.style.display='block';
  if(!paused){bonusTimer-=dt;if(bonusTimer<=0){spawnBonus();bonusTimer=rnd(5.5,8.5)}
   const px=shipX();for(let i=bonus.length-1;i>=0;i--){const b=bonus[i];b.t+=dt;b.y+=b.vy*dt;if(b.y>750){bonus.splice(i,1);continue}if(Math.hypot(b.x-px,b.y-653)<b.r+25){const labels={shield:'🛡️ Bouclier activé',slow:'⏱️ Ralentissement',points:'✨ Bonus points',coin:'🪙 +1 pièce',combo:'🔥 Combo augmenté'};if(b.type==='coin'){$('coins').textContent=String((Number($('coins')?.textContent)||0)+1)}if(b.type==='points')$('score').textContent=String((Number($('score')?.textContent)||0)+250);if(b.type==='combo'){const el=$('combo');if(el){const n=Math.min(10,(Number(String(el.textContent).replace(/\D/g,''))||1)+1);el.textContent='x'+n}}showToast(labels[b.type]);bonus.splice(i,1)}}
   if(wave>=5&&wave%5===0){if(bossWave!==wave){bossWave=wave;boss={x:640,y:105,t:0,hp:100};const ev=$('event');if(ev){ev.textContent='👾 BOSS — VAGUE '+wave;ev.classList.remove('hidden');ev.style.display='block'}}if(boss){boss.t+=dt;boss.x=640+Math.sin(boss.t*.75)*330;boss.y=115+Math.sin(boss.t*1.4)*18}}
   else {boss=null}
  }
  x.clearRect(0,0,1280,720);for(const b of bonus)drawBonus(b);if(boss)drawBoss(boss);if(toastT>0){toastT-=dt;if(toastT<=0)toast.classList.remove('show')}
  requestAnimationFrame(loop);
 }
 requestAnimationFrame(loop);
 const ranking=$('ranking');if(ranking){ranking.innerHTML=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><button class="btn" data-rank="easy">Facile</button><button class="btn" data-rank="normal">Normal</button><button class="btn" data-rank="hard">Difficile</button></div><div id="dodgeBoard_normal" class="rank-list"><p>Chargement…</p></div>`;const tabs=ranking.querySelectorAll('[data-rank]');tabs.forEach(b=>b.onclick=()=>{tabs.forEach(q=>q.classList.remove('active'));b.classList.add('active');const host=ranking.querySelector('[id^="dodgeBoard_"]');host.id='dodgeBoard_'+b.dataset.rank;loadBoard(b.dataset.rank)});tabs[1].classList.add('active')}
 async function loadBoard(diff){const host=$('dodgeBoard_'+diff);if(!host)return;let rows=[];try{const cfg=window.PIXEL_ARCADE_CONFIG||{},base=String(cfg.supabaseUrl||'').replace(/\/$/,''),key=cfg.supabaseAnonKey||'',token=window.PAAuth?.state?.user?.access_token||key;if(base&&key){const r=await fetch(base+'/rest/v1/scores?game=eq.'+encodeURIComponent('dodge_'+diff)+'&select=pseudo,score,created_at&order=score.desc,created_at.asc&limit=10',{headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'}});if(r.ok)rows=await r.json()}}catch(e){}
  if(!rows.length)try{const local=JSON.parse(localStorage.getItem('pixelArcadeScores')||'[]');rows=local.filter(r=>r.game==='dodge_'+diff||r.game==='dodge').sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,10)}catch(e){}
  host.innerHTML=rows.length?rows.map((r,i)=>`<div class="row"><span><b>#${i+1}</b> ${esc(r.pseudo||'Joueur')}</span><strong>${Number(r.score||0).toLocaleString('fr-FR')}</strong></div>`).join(''):'<p>Aucun score enregistré pour cette difficulté.</p>';
 }
 function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 async function rankings(){if(!ranking)return;const active=ranking.querySelector('[id^="dodgeBoard_"]')?.id?.replace('dodgeBoard_','')||'normal';await loadBoard(active)}
 setTimeout(()=>{if(ranking){const b=ranking.querySelector('[data-rank="normal"]');if(b)b.click()}},1500);window.addEventListener('pa-auth-ready',rankings);window.addEventListener('pa-auth-updated',rankings);setInterval(()=>{if(document.visibilityState!=='hidden')rankings()},6000);
})();