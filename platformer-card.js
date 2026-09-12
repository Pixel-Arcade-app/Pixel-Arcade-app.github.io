/* Pixel Arcade — ajoute Pixel Quest à l'arcade sans modifier la structure existante. */
(()=>{
 function add(){
  if(!location.pathname.endsWith('/index.html')&&!location.pathname.endsWith('/'))return;
  if(document.querySelector('[data-game-card][data-game="platformer"]'))return;
  const section=document.querySelector('.category[data-category="big"] .games');if(!section)return;
  const card=document.createElement('a');card.className='card';card.dataset.gameCard='';card.dataset.game='platformer';card.href='./platformer.html';
  card.innerHTML='<div class="icon">🌈</div><span class="tag">Solo • GROS JEU</span><h2>Pixel Quest</h2><p>Un grand plateformer rétro coloré : 8 mondes, pièces, ennemis, checkpoints et boss.</p><b>Jouer →</b>';
  section.appendChild(card);
  const hero=Array.from(document.querySelectorAll('.hero-stats b')).find(x=>x.textContent.trim()==='30');if(hero)hero.textContent='31';
  const sub=document.querySelector('header .sub');if(sub&&sub.textContent.includes('30 jeux'))sub.textContent=sub.textContent.replace('30 jeux','31 jeux');
  const info=document.getElementById('searchInfo');if(info&&info.textContent.includes('30 jeux'))info.textContent=info.textContent.replace('30 jeux','31 jeux');
  const footer=document.querySelector('footer');if(footer&&footer.textContent.includes('30 jeux'))footer.textContent=footer.textContent.replace('30 jeux','31 jeux');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
