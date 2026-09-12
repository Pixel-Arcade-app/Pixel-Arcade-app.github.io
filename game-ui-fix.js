/* Pixel Arcade 10.3 — descriptions + bouton plein écran sur toutes les pages de jeu. */
(()=>{
  const descriptions={
    memory:'Retrouve toutes les paires avec le moins de coups possible.',
    meteor:'Évite les météores et tiens le plus longtemps possible.',
    snake:'Mange les fruits sans toucher les murs ni ton corps.',
    breakout:'Détruis toutes les briques avec ta raquette.',
    clicker:'Améliorations, drones, combos, critiques et succès.',
    quiz:'Réponds aux questions et accumule les points.',
    tetris:'Empile les pièces et complète des lignes.',
    invaders:"Détruis les vagues d'envahisseurs.",
    racer:'Fais trois tours en évitant les obstacles.',
    dungeon:'Explore, récupère des coffres et bats les ennemis.',
    '2048':'Fusionne les nombres pour atteindre le meilleur score.',
    mines:'Ouvre les cases sûres et évite les mines.',
    platformer:'Plateformer rétro coloré avec mondes, ennemis et boss.',
    runner:'Saute les obstacles et cours le plus longtemps possible.',
    flappy:'Passe entre les tuyaux sans les toucher.',
    reaction:'Clique au bon moment pour battre ton temps.',
    aim:'Atteins 20 cibles le plus vite possible.',
    whack:'Tape les pixels lumineux avant qu’ils bougent.',
    color:'Choisis la bonne couleur avant la suivante.',
    typing:'Recopie les mots le plus rapidement possible.',
    number:'Clique toujours sur le plus grand nombre.',
    dot:'Attrape 25 cibles avant qu’elles ne disparaissent.',
    simon:'Mémorise et reproduis des séries de couleurs.',
    pong:'Le premier à 7 gagne.',
    ttt:'Aligne trois symboles avant ton adversaire.',
    draw:'Sois le premier à réagir au signal.',
    tap:"Pousse la barre plus vite que l'autre joueur.",
    rps:'Gagne trois manches de pierre-papier-ciseaux.',
    lights:"Réagis à la bonne cible avant l'autre.",
    dots:'Capture le plus de cases possible.',
    math:'Résous les multiplications plus vite que ton adversaire.'
  };
  const $=s=>document.querySelector(s);
  function description(){
    const id=document.body.dataset.game;
    const info=$('.info-panel');
    if(!id||!info||info.querySelector('.game-description'))return;
    const text=descriptions[id];
    if(!text)return;
    const old=info.querySelector('.game-description');
    if(old)old.remove();
    const sec=document.createElement('section');
    sec.className='game-description panel';
    sec.innerHTML=`<span class="tag">À PROPOS</span><h2>🎮 ${id==='2048'?'2048':($('.info-panel')?.parentElement?.querySelector('#title')?.textContent||'Ce jeu')}</h2><p>${text}</p>`;
    info.parentElement.insertBefore(sec,info);
  }
  function fullscreenButton(){
    const g=$('#game');
    if(!g||g.querySelector('.pa-fullscreen-btn')||g.querySelector('.ready'))return;
    const b=document.createElement('button');
    b.type='button';b.className='pa-fullscreen-btn';b.textContent='⛶ Plein écran';
    b.title='Retourner en plein écran';
    b.onclick=async()=>{
      try{
        if(document.fullscreenElement){await document.exitFullscreen();}
        else if(window.enterGameFullscreen){await window.enterGameFullscreen();}
        else if(g.requestFullscreen){await g.requestFullscreen({navigationUI:'hide'});}
      }catch{}
    };
    g.appendChild(b);
  }
  function updateButton(){
    const b=$('.pa-fullscreen-btn');
    if(b)b.textContent=document.fullscreenElement?'↙ Quitter le plein écran':'⛶ Plein écran';
  }
  function init(){
    if(!document.body.dataset.game)return;
    description();
    const g=$('#game');
    if(g){
      new MutationObserver(()=>{description();fullscreenButton();}).observe(g,{childList:true,subtree:true});
      fullscreenButton();
    }
    document.addEventListener('fullscreenchange',()=>{updateButton();description();setTimeout(()=>{description();fullscreenButton();},50)});
    window.addEventListener('pageshow',()=>setTimeout(()=>{description();fullscreenButton()},50));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
