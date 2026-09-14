/* Pixel Arcade — sélection de jeux retirée. Aucun jeu n'est actuellement disponible. */
window.addEventListener('DOMContentLoaded',()=>{
  const g=document.getElementById('game');
  if(g) g.innerHTML='<div class="ready"><h2>Aucun jeu disponible</h2><p>La sélection de jeux a été retirée du site.</p></div>';
});