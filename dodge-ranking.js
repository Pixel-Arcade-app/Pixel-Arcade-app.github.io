(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const labels={easy:'Facile',normal:'Normal',hard:'Difficile'};
  const descriptions={easy:'Pour débuter — plus de marge d’erreur.',normal:'Équilibre entre vitesse et difficulté.',hard:'Pour les meilleurs — beaucoup plus exigeant.'};
  const multipliers={easy:'×1',normal:'×1',hard:'×1'};
  let selected=localStorage.getItem('pixelDodgeDifficulty')||'normal';
  let patched=false;

  function apiBase(){return String(cfg.supabaseUrl||'').replace(/\/$/,'')}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function gameKey(d){return 'dodge_'+d}

  async function loadBoard(diff){
    const host=document.getElementById('dodgeBoard_'+diff);if(!host)return;
    host.innerHTML='<p class="message">Chargement…</p>';
    try{
      const url=apiBase()+'/rest/v1/scores?game=eq.'+encodeURIComponent(gameKey(diff))+'&select=pseudo,score,created_at&order=score.desc,created_at.asc&limit=10';
      const r=await fetch(url,{headers:{apikey:cfg.supabaseAnonKey,Accept:'application/json'}});
      if(!r.ok)throw Error('scores');
      const rows=await r.json();
      if(!rows.length){host.innerHTML='<p class="rank-empty">Aucun score enregistré.</p>';return}
      host.innerHTML=rows.map((x,i)=>'<div class="row"><span><b class="rank-number">#'+(i+1)+'</b> '+esc(x.pseudo||'Joueur')+'</span><strong>'+Number(x.score||0).toLocaleString('fr-FR')+'</strong></div>').join('');
    }catch{host.innerHTML='<p class="rank-empty">Classement indisponible pour le moment.</p>'}
  }

  function updateSelected(){
    document.querySelectorAll('[data-dodge-board]').forEach(card=>{
      const on=card.dataset.dodgeBoard===selected;
      card.classList.toggle('selected',on);
      const badge=card.querySelector('.dodge-current');
      if(badge)badge.textContent=on?'Difficulté jouée':'';
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
    old.innerHTML='<h2>Classements — Pixel Dodge</h2><p class="dodge-rank-intro">Il y a <strong>3 classements séparés</strong> : un par difficulté. Un score obtenu en Facile ne peut donc pas se comparer directement à un score en Difficile.</p><div class="dodge-rank-grid">'+Object.keys(labels).map(d=>'<section class="dodge-board" data-dodge-board="'+d+'"><div class="dodge-board-head"><div><h3>'+labels[d]+'</h3><p>'+descriptions[d]+'</p></div><span class="dodge-current"></span></div><div class="dodge-score-rule">Score enregistré : <b>'+multipliers[d]+'</b> des points réellement gagnés</div><div id="dodgeBoard_'+d+'" class="rank-list"><p class="message">Chargement…</p></div></section>').join('')+'</div>';
    const style=document.createElement('style');style.id='dodgeRankingStyle';style.textContent=`
      .dodge-rank-intro{margin:-6px 0 16px;color:var(--muted,#9fb0c7);line-height:1.5}
      .dodge-rank-intro strong{color:var(--txt,#eef2ff)}
      .dodge-rank-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .dodge-board{min-width:0;padding:14px;border:1px solid #263852;border-radius:16px;background:linear-gradient(145deg,#0a1220,#0d1728);transition:border-color .18s,box-shadow .18s,transform .18s}
      .dodge-board.selected{border-color:#22d3ee;box-shadow:0 0 0 1px #22d3ee33,0 12px 30px #0004;transform:translateY(-1px)}
      .dodge-board-head{display:flex;align-items:flex-start;justify-content:space-between;gap:9px;margin-bottom:9px}
      .dodge-board-head h3{margin:0;font-size:1.1rem}
      .dodge-board-head p{margin:3px 0 0;color:#91a4bd;font-size:.75rem;line-height:1.35}
      .dodge-current{flex:0 0 auto;min-height:22px;padding:4px 7px;border-radius:99px;font-size:.65rem;font-weight:900;color:#67e8f9;text-align:right}
      .dodge-score-rule{margin:0 0 9px;padding:6px 8px;border-radius:8px;background:#07101d;color:#8294ad;font-size:.68rem;line-height:1.3}
      .dodge-score-rule b{color:#b7c4ff}
      .dodge-board .rank-list{min-width:0}
      .dodge-board .row{align-items:center;margin:0;padding:9px 8px;min-height:40px}
      .dodge-board .row span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dodge-board .row strong{flex:0 0 auto}
      .rank-number{display:inline-block;min-width:27px;color:#7f8da5}
      body.light .dodge-rank-intro strong{color:#172033}
      body.light .dodge-board{background:linear-gradient(145deg,#fff,#f5f8fd);border-color:#d7dfeb;box-shadow:0 5px 18px rgba(30,43,65,.04)}
      body.light .dodge-board.selected{border-color:#6875e8;box-shadow:0 0 0 1px #6875e833,0 10px 25px rgba(74,86,185,.1)}
      body.light .dodge-board-head p{color:#5b6b82}
      body.light .dodge-score-rule{background:#f1f4f8;color:#607089}
      body.light .dodge-score-rule b{color:#4f46c5}
      @media(max-width:900px){.dodge-rank-grid{grid-template-columns:1fr}.dodge-board{padding:13px}}
      @media(max-width:560px){.dodge-rank-intro{font-size:.82rem}.dodge-board-head h3{font-size:1rem}.dodge-board-head p{font-size:.72rem}.dodge-score-rule{font-size:.65rem}.dodge-board .row{padding:9px 7px}}
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