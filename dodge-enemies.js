(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const c=document.getElementById('gameCanvas'),wrap=c?.parentElement;if(!c||!wrap)return;
  const ctx=c.getContext('2d');
  const style=document.createElement('style');style.textContent=`
    .dodge-enemy-label{position:absolute;left:12px;bottom:10px;z-index:10;padding:5px 9px;border:1px solid #263852;border-radius:8px;background:#07101dcc;color:#91a4bd;font:700 11px system-ui;pointer-events:none;opacity:.85}
  `;document.head.appendChild(style);
  const label=document.createElement('div');label.className='dodge-enemy-label';label.textContent='Menaces : drones • chasseurs • intercepteurs';wrap.appendChild(label);
  const E=[];let last=performance.now(),spawn=0,active=false;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function add(type){
    const side=Math.random()<.5?-1:1;
    if(type==='flyby')E.push({type,x:side<0?-80:1360,y:rnd(90,560),vx:side*rnd(720,980),vy:rnd(-35,35),life:3.2,rot:side<0?0:Math.PI,phase:rnd(0,6)});
    else if(type==='zigzag')E.push({type,x:rnd(60,1220),y:-50,vx:rnd(-55,55),vy:rnd(150,230),life:7,phase:rnd(0,6)});
    else if(type==='hunter')E.push({type,x:rnd(80,1200),y:-50,vx:0,vy:rnd(80,130),life:8,phase:rnd(0,6)});
    else E.push({type:'orb',x:rnd(35,1245),y:-30,vx:rnd(-20,20),vy:rnd(130,210),life:8,r:rnd(9,15),phase:rnd(0,6)});
  }
  function ship(e){
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.rot||0);ctx.shadowColor='#f97316';ctx.shadowBlur=20;
    const grad=ctx.createLinearGradient(-30,0,30,0);grad.addColorStop(0,'#fb7185');grad.addColorStop(.5,'#f8fafc');grad.addColorStop(1,'#fb7185');ctx.fillStyle=grad;
    ctx.beginPath();ctx.moveTo(34,0);ctx.lineTo(8,-10);ctx.lineTo(-24,-24);ctx.lineTo(-13,-4);ctx.lineTo(-30,0);ctx.lineTo(-13,4);ctx.lineTo(-24,24);ctx.lineTo(8,10);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='#450a0a';ctx.beginPath();ctx.ellipse(7,0,7,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#facc15';ctx.shadowColor='#facc15';ctx.shadowBlur=14;ctx.fillRect(-28,-4,10,8);ctx.restore();
  }
  function zig(e){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(e.phase)*.15);ctx.shadowColor='#a78bfa';ctx.shadowBlur=18;ctx.fillStyle='#8b5cf6';ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(18,17);ctx.lineTo(0,10);ctx.lineTo(-18,17);ctx.closePath();ctx.fill();ctx.fillStyle='#ddd6fe';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(7,8);ctx.lineTo(0,5);ctx.lineTo(-7,8);ctx.closePath();ctx.fill();ctx.restore()}
  function hunter(e){ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor='#ef4444';ctx.shadowBlur=22;ctx.fillStyle='#ef4444';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(21,18);ctx.lineTo(7,13);ctx.lineTo(0,24);ctx.lineTo(-7,13);ctx.lineTo(-21,18);ctx.closePath();ctx.fill();ctx.fillStyle='#fee2e2';ctx.fillRect(-4,-8,8,13);ctx.restore()}
  function orb(e){ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor='#f97316';ctx.shadowBlur=20;const g=ctx.createRadialGradient(-3,-3,1,0,0,e.r);g.addColorStop(0,'#fff7ed');g.addColorStop(.35,'#fb923c');g.addColorStop(1,'#c2410c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.restore()}
  function frame(now){
    const dt=Math.min(.04,(now-last)/1000);last=now;
    const fallback=document.documentElement.dataset.dodgeFallback==='1';
    if(fallback&&!document.getElementById('pauseOverlay')?.classList.contains('show')){
      active=true;spawn-=dt;
      const wave=Number(document.getElementById('wave')?.textContent||1);
      if(spawn<=0){const pool=wave<3?['orb','zigzag']:wave<6?['orb','zigzag','flyby']:['orb','zigzag','flyby','hunter'];add(pool[Math.floor(Math.random()*pool.length)]);spawn=Math.max(.42,1.35-wave*.045)}
      for(let i=E.length-1;i>=0;i--){const e=E[i];e.life-=dt;e.phase+=dt;if(e.type==='flyby')e.x+=e.vx*dt,e.y+=e.vy*dt;else if(e.type==='zigzag')e.x+=Math.sin(e.phase*3.5)*150*dt,e.y+=e.vy*dt;else if(e.type==='hunter')e.x+=Math.sin(e.phase*2.2)*95*dt,e.y+=e.vy*dt;else e.x+=e.vx*dt,e.y+=e.vy*dt;if(e.life<=0||e.x<-150||e.x>1430||e.y>800)E.splice(i,1)}
      for(const e of E){if(e.type==='flyby')ship(e);else if(e.type==='zigzag')zig(e);else if(e.type==='hunter')hunter(e);else orb(e)}
    }else if(!fallback&&active){E.length=0;active=false}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();