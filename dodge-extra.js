(()=>{
  if(document.body?.dataset.game!=='dodge')return;
  const ready=()=>{
    if(document.getElementById('paDodgeExtra'))return;
    const style=document.createElement('style');style.id='paDodgeExtra';style.textContent=`
      .dodge-extra{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px}
      .dodge-extra button{border:1px solid #334155;background:#0d1424;color:#eef2ff;padding:9px 13px;border-radius:10px;font-weight:800;cursor:pointer}
      .dodge-extra button.active{border-color:#22d3ee;color:#67e8f9}
      body.light .dodge-extra button{background:#fff;color:#172033;border-color:#ccd7e5}
      @media(max-width:560px){.dodge-extra button{min-height:44px;flex:1;min-width:130px}}
    `;document.head.appendChild(style);
    const host=document.querySelector('.top .actions');
    if(host){
      const fav=document.createElement('button');fav.type='button';fav.className='btn';fav.id='dodgeFavorite';fav.textContent='☆ Favori';fav.title='Disponible quand tu es connecté';host.appendChild(fav);
      const music=document.createElement('button');music.type='button';music.className='btn';music.id='dodgeMusic';music.textContent='♫ Musique : désactivée';host.appendChild(music);
      fav.onclick=async()=>{
        const auth=window.PAAuth,s=auth?.state;
        if(!s?.user){fav.textContent='☆ Connecte-toi pour ajouter';setTimeout(updateFavorite,1800);return}
        fav.disabled=true;try{const ok=await auth.toggleFavorite('dodge');if(!ok)throw Error();updateFavorite()}catch{fav.textContent='☆ Erreur'}finally{fav.disabled=false}
      };
      function updateFavorite(){
        const auth=window.PAAuth,s=auth?.state;
        if(!s?.user){fav.textContent='☆ Favori';fav.title='Connecte-toi pour ajouter Pixel Dodge aux favoris';return}
        const on=!!auth.favoriteGames?.().includes('dodge');fav.textContent=on?'★ Favori':'☆ Favori';fav.title=on?'Retirer des favoris':'Ajouter aux favoris';fav.classList.toggle('active',on)
      }
      updateFavorite();window.addEventListener('pa-auth-ready',updateFavorite);window.addEventListener('pa-auth-updated',updateFavorite)
      let ac=null,master=null,timer=null,on=false,step=0;
      const melody=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,523.25,440,392,329.63];
      function make(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.045;master.connect(ac.destination)}
      function tone(f,d,v,type,when){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(v,when+.015);g.gain.exponentialRampToValueAtTime(.0001,when+d-.02);o.connect(g);g.connect(master);o.start(when);o.stop(when+d)}
      function tick(){if(!on||!ac)return;const t=ac.currentTime,n=melody[step%melody.length];tone(n,.25,.20,'triangle',t);if(step%4===0){tone(n/2,.38,.07,'sine',t);tone(n*1.5,.3,.035,'sine',t)}if(step%2===0)tone(85,.045,.012,'square',t);step++;timer=setTimeout(tick,300+Math.random()*35)}
      async function start(){try{make();if(ac.state==='suspended')await ac.resume();if(on)return;on=true;step=Math.floor(Math.random()*melody.length);tick();updateMusic()}catch{}}
      function stop(){on=false;clearTimeout(timer);timer=null;updateMusic()}
      function updateMusic(){music.textContent=on?'♫ Musique : activée':'♫ Musique : désactivée';music.classList.toggle('active',on)}
      music.onclick=()=>on?stop():start();
      if(localStorage.getItem('pixelDodgeMusic')==='on'){const once=()=>{start();window.removeEventListener('pointerdown',once);window.removeEventListener('keydown',once)};window.addEventListener('pointerdown',once,{once:true});window.addEventListener('keydown',once,{once:true})}
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();