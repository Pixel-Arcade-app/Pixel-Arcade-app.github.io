(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const $=id=>document.getElementById(id);
  const STORE='pixelDodgeAchievementsV1';
  const state=JSON.parse(localStorage.getItem(STORE)||'{}');
  const unlocked=new Set(Array.isArray(state.unlocked)?state.unlocked:[]);
  const stats=state.stats||{runs:0,bestTime:0,bestScore:0,hardRuns:0,perfectRuns:0};
  const defs=[
    ['first','Premier départ','Lancer ta première partie.','run'],
    ['survive30','30 secondes','Survivre au moins 30 secondes.','time30'],
    ['survive60','Une minute','Survivre au moins 60 secondes.','time60'],
    ['score1000','Millier','Atteindre 1 000 points.','score1000'],
    ['score5000','Grosse série','Atteindre 5 000 points.','score5000'],
    ['combo5','Combo x5','Atteindre un combo de x5.','combo5'],
    ['level5','Montée en puissance','Atteindre le niveau 5.','level5'],
    ['wave5','Vague 5','Atteindre la vague 5.','wave5'],
    ['hard','Mode difficile','Terminer une partie en Difficile.','hard'],
    ['perfect60','Sans erreur','Tenir 60 secondes sans perdre de vie.','perfect60'],
    ['score10000','As du dodge','Atteindre 10 000 points.','score10000'],
    ['veteran','Vétéran','Jouer 10 parties.','runs10']
  ];
  let runStarted=false,last={score:0,time:0,level:1,combo:1,lives:null,wave:1},run={start:0,diff:'normal',lostLife:false,unlockedThisRun:[]};
  let objectiveSet=[],objectiveProgress={},poll=0;

  const save=()=>{localStorage.setItem(STORE,JSON.stringify({unlocked:[...unlocked],stats}));};
  const txt=id=>defs.find(x=>x[0]===id)?.[1]||id;
  const toast=(title,body)=>{
    let box=$('dodgeContentToast');
    if(!box){box=document.createElement('div');box.id='dodgeContentToast';document.body.appendChild(box)}
    box.innerHTML='<strong>'+title+'</strong><span>'+body+'</span>';
    box.classList.remove('show');void box.offsetWidth;box.classList.add('show');
    clearTimeout(box._t);box._t=setTimeout(()=>box.classList.remove('show'),3300);
  };
  const unlock=id=>{
    if(unlocked.has(id))return;
    unlocked.add(id);run.unlockedThisRun.push(id);save();
    toast('Succès débloqué',txt(id));
    renderAchievements();
  };
  const num=id=>Number($(id)?.textContent?.replace(/[^0-9.]/g,'')||0);
  const diff=()=>document.querySelector('.dodge-difficulty-badge')?.dataset.diff||'normal';
  const isPlaying=()=>document.body.classList.contains('playing')||!!document.querySelector('#pause')?.classList.contains('active');

  const css=document.createElement('style');
  css.textContent=`
    #dodgeContentToast{position:fixed;left:50%;top:18px;transform:translate(-50%,-140%);z-index:9999;display:flex;flex-direction:column;gap:3px;min-width:min(360px,88vw);padding:12px 15px;border:1px solid #22d3ee;border-radius:13px;background:rgba(9,17,31,.96);color:#eef2ff;box-shadow:0 18px 50px #0008;text-align:center;pointer-events:none;transition:transform .28s ease,opacity .28s ease;opacity:0}
    #dodgeContentToast strong{font-size:.95rem;color:#67e8f9}#dodgeContentToast span{font-size:.82rem;color:#b9c7da}#dodgeContentToast.show{transform:translate(-50%,0);opacity:1}
    .dodge-content-panel{margin-top:13px}.dodge-content-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,.6fr);gap:12px}.dodge-content-card{border:1px solid #293c59;border-radius:14px;background:#101a2d;padding:14px}.dodge-content-card h3{margin:0 0 8px;font-size:1rem}.dodge-objective{display:grid;gap:6px;padding:10px 11px;border:1px solid #2a405d;border-radius:11px;background:#0c1526;margin-top:7px}.dodge-objective.done{border-color:#35d399}.dodge-objective-top{display:flex;justify-content:space-between;gap:8px}.dodge-objective-top strong{font-size:.86rem}.dodge-objective-top span{color:#91a4bd;font-size:.75rem}.dodge-mini-bar{height:6px;background:#020713;border-radius:99px;overflow:hidden}.dodge-mini-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22d3ee,#818cf8);transition:width .2s}.dodge-achievements{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.dodge-achievement{display:flex;gap:8px;align-items:center;padding:9px;border:1px solid #263852;border-radius:10px;background:#0c1526;opacity:.48}.dodge-achievement.unlocked{opacity:1;border-color:#35d399}.dodge-achievement b{font-size:.8rem}.dodge-achievement small{display:block;color:#91a4bd;font-size:.68rem;margin-top:2px}.dodge-achievement-dot{width:10px;height:10px;border-radius:50%;background:#475569;flex:0 0 auto}.dodge-achievement.unlocked .dodge-achievement-dot{background:#4ade80;box-shadow:0 0 12px #4ade80aa}.dodge-run-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.dodge-run-stat{padding:9px;border:1px solid #263852;border-radius:10px;background:#0c1526;text-align:center}.dodge-run-stat b{display:block;font-size:1rem}.dodge-run-stat span{display:block;color:#91a4bd;font-size:.68rem;margin-top:2px}
    body.light #dodgeContentToast{background:rgba(255,255,255,.98);color:#172033;border-color:#6875e8;box-shadow:0 15px 40px rgba(20,30,50,.16)}body.light #dodgeContentToast strong{color:#4f46e5}body.light #dodgeContentToast span{color:#5b6b82}body.light .dodge-content-card{background:#f7f9fc;border-color:#d7dfeb}body.light .dodge-objective,body.light .dodge-achievement,body.light .dodge-run-stat{background:#fff;border-color:#dbe2eb}body.light .dodge-objective-top span,body.light .dodge-achievement small,body.light .dodge-run-stat span{color:#5b6b82}
    @media(max-width:760px){.dodge-content-grid{grid-template-columns:1fr}.dodge-achievements{grid-template-columns:1fr 1fr}}
    @media(max-width:460px){.dodge-achievements{grid-template-columns:1fr}.dodge-run-stats{grid-template-columns:1fr 1fr}.dodge-content-card{padding:11px}.dodge-content-panel{margin-top:9px}}
  `;
  document.head.appendChild(css);

  const mount=()=>{
    if($('dodgeContentPanel'))return;
    const rank=document.querySelector('.rank');if(!rank)return;
    const panel=document.createElement('section');panel.id='dodgeContentPanel';panel.className='panel dodge-content-panel';
    panel.innerHTML=`<h2>Défis et succès</h2><p style="margin-top:0;color:#91a4bd">Des objectifs supplémentaires à accomplir pendant tes parties. Ils sont conservés sur cet appareil.</p><div class="dodge-content-grid"><div class="dodge-content-card"><h3>Défis de la partie</h3><div id="dodgeObjectives"></div></div><div class="dodge-content-card"><h3>Progression</h3><div class="dodge-run-stats"><div class="dodge-run-stat"><b id="dcRuns">0</b><span>Parties</span></div><div class="dodge-run-stat"><b id="dcBestTime">0 s</b><span>Meilleur temps</span></div><div class="dodge-run-stat"><b id="dcBestScore">0</b><span>Meilleur score</span></div></div><h3 style="margin-top:14px">Succès <span id="dcAchCount"></span></h3><div id="dodgeAchievements" class="dodge-achievements"></div></div></div>`;
    rank.insertAdjacentElement('afterend',panel);renderAchievements();updateStats();
  };
  const renderAchievements=()=>{
    const box=$('dodgeAchievements');if(!box)return;
    box.innerHTML=defs.map(d=>`<div class="dodge-achievement ${unlocked.has(d[0])?'unlocked':''}"><i class="dodge-achievement-dot"></i><div><b>${d[1]}</b><small>${d[2]}</small></div></div>`).join('');
    const n=unlocked.size;const el=$('dcAchCount');if(el)el.textContent=`(${n}/${defs.length})`;
  };
  const updateStats=()=>{if($('dcRuns'))$('dcRuns').textContent=stats.runs;if($('dcBestTime'))$('dcBestTime').textContent=(stats.bestTime||0).toFixed(1)+' s';if($('dcBestScore'))$('dcBestScore').textContent=(stats.bestScore||0).toLocaleString('fr-FR')};

  const objectivePool=[
    {id:'time30',label:'Survivre 30 secondes',need:30,get:()=>last.time},
    {id:'score1000',label:'Atteindre 1 000 points',need:1000,get:()=>last.score},
    {id:'combo5',label:'Atteindre le combo x5',need:5,get:()=>last.combo},
    {id:'level5',label:'Atteindre le niveau 5',need:5,get:()=>last.level},
    {id:'wave5',label:'Atteindre la vague 5',need:5,get:()=>last.wave},
    {id:'hard',label:'Jouer en Difficile',need:1,get:()=>run.diff==='hard'?1:0}
  ];
  const pickObjectives=()=>{
    const pool=objectivePool.slice().sort(()=>Math.random()-.5);objectiveSet=pool.slice(0,3);objectiveProgress={};
    renderObjectives();
  };
  const renderObjectives=()=>{
    const box=$('dodgeObjectives');if(!box)return;
    box.innerHTML=objectiveSet.map(o=>{const v=Math.min(o.need,o.get());const pct=Math.max(0,Math.min(100,v/o.need*100));const done=v>=o.need;return `<div class="dodge-objective ${done?'done':''}"><div class="dodge-objective-top"><strong>${done?'✓ ':''}${o.label}</strong><span>${o.id==='hard'?(done?'Fait':'À faire'):Math.floor(v)+' / '+o.need}</span></div><div class="dodge-mini-bar"><i style="width:${pct}%"></i></div></div>`}).join('');
  };
  const startRun=()=>{
    runStarted=true;run={start:performance.now(),diff:diff(),lostLife:false,unlockedThisRun:[]};stats.runs++;if(run.diff==='hard')stats.hardRuns++;save();pickObjectives();updateStats();unlock('first');if(stats.runs>=10)unlock('veteran');
  };
  const finishRun=()=>{
    if(!runStarted)return;runStarted=false;
    const t=last.time,s=last.score;
    stats.bestTime=Math.max(stats.bestTime,t);stats.bestScore=Math.max(stats.bestScore,s);
    if(t>=60&&!run.lostLife)stats.perfectRuns++;
    if(t>=30)unlock('survive30');if(t>=60)unlock('survive60');if(s>=1000)unlock('score1000');if(s>=5000)unlock('score5000');if(s>=10000)unlock('score10000');if(last.combo>=5)unlock('combo5');if(last.level>=5)unlock('level5');if(last.wave>=5)unlock('wave5');if(run.diff==='hard')unlock('hard');if(t>=60&&!run.lostLife)unlock('perfect60');
    save();updateStats();
  };
  const pollGame=()=>{
    const score=num('score'),time=num('time'),level=num('level'),combo=Number(String($('combo')?.textContent||'x1').replace(/[^0-9]/g,''))||1,wave=num('wave');
    const livesText=$('lives')?.textContent||'';const lives=(livesText.match(/♥/g)||[]).length;
    if(lives!==last.lives&&last.lives!==null&&lives<last.lives)run.lostLife=true;
    last={score,time,level,combo,lives,wave};
    if(score>=1000)unlock('score1000');if(score>=5000)unlock('score5000');if(score>=10000)unlock('score10000');if(combo>=5)unlock('combo5');if(level>=5)unlock('level5');if(wave>=5)unlock('wave5');if(time>=30)unlock('survive30');if(time>=60)unlock('survive60');
    if(runStarted){renderObjectives();if(time>=15&&!run._t15){run._t15=1;toast('Nouveau palier','15 secondes de survie. Continue !')}if(time>=45&&!run._t45){run._t45=1;toast('Bonne série','45 secondes. Le rythme monte !')}if(time>=90&&!run._t90){run._t90=1;toast('Maître du dodge','90 secondes. Impressionnant !')}}
    const result=$('result');if(result?.classList.contains('show'))finishRun();
    if(!result?.classList.contains('show')&&last.lives===0)finishRun();
    poll=setTimeout(pollGame,220);
  };
  const wire=()=>{
    mount();
    $('start')?.addEventListener('click',()=>setTimeout(startRun,40));
    $('restart')?.addEventListener('click',()=>setTimeout(startRun,40));
    document.querySelectorAll('#startOverlay .difficulty button').forEach(b=>b.addEventListener('click',()=>{if(runStarted)finishRun();}));
    new MutationObserver(()=>{if($('result')?.classList.contains('show'))finishRun()}).observe($('result')||document.body,{attributes:true,attributeFilter:['class']});
    if(!poll)pollGame();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();
