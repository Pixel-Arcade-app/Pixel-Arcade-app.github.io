(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const labels={easy:'Facile',normal:'Normal',hard:'Difficile'};
  let selected=localStorage.getItem('pixelDodgeDifficulty')||'normal';
  let patched=false;

  function apiBase(){return String(cfg.supabaseUrl||'').replace(/\\/$/,'')}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function gameKey(d){return 'dodge_'+d}

  async function loadBoard(diff){
    const host=document.getElementById('dodgeBoard_'+diff);if(!host)return;
    host.innerHTML='<p class="message">Chargement…</p>';
    try{
      const url=apiBase()+'/rest/v1/scores?game=eq.'+encodeURIComponent(gameKey(diff))+'&select=pseudo,score,created_at&order=score.desc&limit=10';
      const r=await fetch(url,{headers:{apikey:cfg.supabaseAnonKey,Accept:'application/json'}});
      if(!r.ok)throw Error('scores');
      const rows=await r.json();
      if(!rows.length){host.innerHTML='<p class="rank-empty">Aucun score pour cette difficulté.</p>';return}
      host.innerHTML=rows.map((x,i)=>'<div class="row"><span>#'+(i+1)+' '+esc(x.pseudo||'Joueur')+'</span><strong>'+Number(x.score||0).toLocaleString('fr-FR')+'</strong></div>').join('');
    }catch{host.innerHTML='<p class="rank-empty">Classement indisponible pour le moment.</p>'}
  }

  function updateSelected(){
    document.querySelectorAll('[data-dodge-board]').forEach(card=>{
      const on=card.dataset.dodgeBoard===selected;
      card.classList.toggle('selected',on);
      const badge=card.querySelector('.dodge-current');
      if(badge)badge.textContent=on?'Difficulté sélectionnée':'';
    });
  }

  function patchRecordScore(){
    if(patched||!window.PAAuth?.recordScore)return;
    const original=window.PAAuth.recordScore.bind(window.PAAuth);
    window.PAAuth.recordScore=async function(game,points,players,pseudo){
      if(game==='dodge')game=gameKey(selected);
      return original(game,points,players,pseudo);
    };
    patched=true;
  }

  function build(){
    const old=document.querySelector('.rank');if(!old)return;
    old.innerHTML='<h2>Classements — Pixel Dodge</h2><p class="dodge-rank-intro">Les scores sont séparés selon la difficulté choisie au lancement de la partie.</p><div class="dodge-rank-grid">'+Object.keys(labels).map(d=>'<section class="dodge-board" data-dodge-board="'+d+'"><div class="dodge-board-head"><h3>'+labels[d]+'</h3><span class="dodge-current"></span></div><div id="dodgeBoard_'+d+'" class="rank-list"><p class="message">Chargement…</p></div></section>').join('')+'</div>';
    const style=document.createElement('style');style.id='dodgeRankingStyle';style.textContent=`
      .dodge-rank-intro{margin:-6px 0 14px;color:var(--muted,#9fb0c7)}
      .dodge-rank-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .dodge-board{padding:13px;border:1px solid #263852;border-radius:15px;background:#0a1220}
      .dodge-board.selected{border-color:#22d3ee;box-shadow:0 0 0 1px #22d3ee33,0 10px 30px #0004}
      .dodge-board-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}
      .dodge-board-head h3{margin:0;font-size:1.05rem}
      .dodge-current{font-size:.7rem;font-weight:800;color:#67e8f9;text-align:right}
      body.light .dodge-board{background:#f7f9fc;border-color:#d7dfeb}
      body.light .dodge-board.selected{border-color:#6875e8}
      @media(max-width:820px){.dodge-rank-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(style);
    updateSelected();
    Object.keys(labels).forEach(loadBoard);
  }

  function hook(){
    document.querySelectorAll('.difficulty [data-diff]').forEach(btn=>btn.addEventListener('click',()=>{
      selected=btn.dataset.diff||'normal';
      localStorage.setItem('pixelDodgeDifficulty',selected);
      updateSelected();
    }));
    patchRecordScore();
    window.addEventListener('pa-auth-ready',patchRecordScore);
    window.addEventListener('pa-auth-updated',patchRecordScore);
    document.addEventListener('click',e=>{
      if(e.target.closest('#save,#again,#againAuto,#restart'))setTimeout(()=>{patchRecordScore();Object.keys(labels).forEach(loadBoard)},700);
    });
  }

  function ready(){build();hook()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();