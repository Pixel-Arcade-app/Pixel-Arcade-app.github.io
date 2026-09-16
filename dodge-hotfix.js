(()=>{
  if(document.body?.dataset.game!=='dodge') return;
  const $=id=>document.getElementById(id);
  const c=$('gameCanvas'); if(!c) return;
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const base=String(cfg.supabaseUrl||'').replace(/\/$/,'');
  const key=cfg.supabaseAnonKey||'';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const style=document.createElement('style');
  style.textContent=`
    .dodge-dash-flash{position:absolute;inset:0;pointer-events:none;z-index:8;border:3px solid #22d3ee;box-shadow:inset 0 0 70px #22d3ee55;opacity:0;transition:opacity .08s}
    .dodge-dash-flash.show{opacity:1}
    .dodge-dash-label{position:absolute;left:50%;top:22%;transform:translate(-50%,-50%) scale(.8);pointer-events:none;z-index:9;color:#67e8f9;font:900 28px system-ui;letter-spacing:3px;text-shadow:0 0 18px #22d3ee;opacity:0;transition:.12s}
    .dodge-dash-label.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
    .dodge-mission-fallback{display:flex;flex-direction:column;gap:5px}
    .dodge-mission-fallback b{font-size:.76rem;color:#eef2ff}
  `;
  document.head.appendChild(style);
  const wrap=c.parentElement;
  const flash=document.createElement('div');flash.className='dodge-dash-flash';
  const label=document.createElement('div');label.className='dodge-dash-label';label.textContent='⚡ DASH';
  wrap.append(flash,label);
  function dash(){
    const running=Number(($('time')?.textContent||'0').replace(',','.'))>0;
    if(!running || $('pauseOverlay')?.classList.contains('show')) return;
    const before=Number(($('dash')?.textContent||'0').replace(/[^0-9.]/g,''));
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',code:'ShiftLeft',bubbles:true,cancelable:true}));
    flash.classList.remove('show');label.classList.remove('show');void flash.offsetWidth;
    flash.classList.add('show');label.classList.add('show');
    setTimeout(()=>flash.classList.remove('show'),130);setTimeout(()=>label.classList.remove('show'),350);
    setTimeout(()=>{const after=Number(($('dash')?.textContent||'0').replace(/[^0-9.]/g,''));if(after>=before && before>0) $('dashBtn')?.click()},40);
  }
  const db=$('dashBtn');
  if(db)db.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();dash()},{capture:true});
  const mission=$('missionText'),bar=$('missionBar');
  let m={type:'survive',target:18,name:'Survivre 18 secondes'};
  try{const saved=JSON.parse(localStorage.getItem('pixelDodgeMission')||'null');if(saved?.type)m=saved}catch{}
  function missionTick(){
    if(!mission||!bar)return;
    const time=parseFloat(String($('time')?.textContent||0).replace(',','.'))||0;
    const score=parseFloat(String($('score')?.textContent||0).replace(/\s/g,''))||0;
    const coinsText=parseFloat(String($('coins')?.textContent||0).replace(/\s/g,''))||0;
    let done=0;
    if(m.type==='survive')done=Math.min(m.target,time);
    else if(m.type==='score')done=Math.min(m.target,score);
    else if(m.type==='coins')done=Math.min(m.target,coinsText);
    else if(m.type==='boss')done=(document.querySelector('#bossbar:not(.hidden)')?0:(Number($('wave')?.textContent||1)>=5?1:0));
    else done=Math.min(m.target,Math.max(0,score>0?Math.floor(score/300):0));
    mission.innerHTML=`<b>${esc(m.name)}</b><span>${Math.floor(done)} / ${m.target}</span>`;
    mission.style.display='flex';mission.style.flexDirection='column';
    bar.style.width=Math.min(100,done/m.target*100)+'%';
  }
  setInterval(missionTick,250);missionTick();
  let lastBossWave=0;
  function bossTick(){
    const w=Number($('wave')?.textContent||1);if(w<5||w%5!==0||w===lastBossWave)return;
    lastBossWave=w;
    const event=$('event'),bb=$('bossbar');
    if(event){event.textContent='👾 BOSS — VAGUE '+w;event.classList.remove('hidden');event.style.display='block'}
    if(bb)bb.classList.remove('hidden');
  }
  setInterval(bossTick,250);
  async function loadBoard(diff){
    const host=$('dodgeBoard_'+diff);if(!host)return;
    let rows=[];
    try{
      if(base&&key){
        const token=window.PAAuth?.state?.user?.access_token||key;
        const r=await fetch(base+'/rest/v1/scores?game=eq.'+encodeURIComponent('dodge_'+diff)+'&select=pseudo,score,created_at&order=score.desc,created_at.asc&limit=10',{headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'}});
        if(r.ok)rows=await r.json();
      }
    }catch{}
    if(!rows.length){try{const local=JSON.parse(localStorage.getItem('pixelArcadeScores')||'[]');rows=local.filter(r=>r.game==='dodge_'+diff||r.game==='dodge').sort((a,b)=>Number(b.score)-Number(a.score)).slice(0,10)}catch{}}
    host.innerHTML=rows.length?rows.map((r,i)=>`<div class="row"><span><b class="rank-number">#${i+1}</b> ${esc(r.pseudo||'Joueur')}</span><strong>${Number(r.score||0).toLocaleString('fr-FR')}</strong></div>`).join(''):'<p class="rank-empty">Aucun score enregistré pour cette difficulté.</p>';
  }
  async function rankings(){for(const d of ['easy','normal','hard'])await loadBoard(d)}
  window.addEventListener('pa-auth-ready',rankings);window.addEventListener('pa-auth-updated',rankings);setTimeout(rankings,700);setInterval(()=>{if(document.visibilityState!=='hidden')rankings()},5000);
  const account=()=>{let host=document.querySelector('.dodge-account');if(!host)return;const s=window.PAAuth?.state,p=window.PAAuth?.currentPseudo?.()||s?.profile?.pseudo||s?.user?.user?.user_metadata?.pseudo||'';host.className='dodge-account'+(s?.user?.access_token&&p?'':' offline');host.textContent=s?.user?.access_token&&p?'👤 '+p:'👤 Compte non chargé'};
  setTimeout(account,900);window.addEventListener('pa-auth-ready',account);window.addEventListener('pa-auth-updated',account);
})();