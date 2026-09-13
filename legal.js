/* Pixel Arcade — pages légales, cookies et liens du footer. */
(()=>{
  const COOKIE_NAME='pa_cookie_consent';
  const setCookie=(name,value,maxAge=15552000)=>{document.cookie=name+'='+encodeURIComponent(value)+'; Max-Age='+maxAge+'; Path=/; SameSite=Lax; Secure'};
  const getCookie=name=>{const m=document.cookie.match(new RegExp('(?:^|; )'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)'));return m?decodeURIComponent(m[1]):null};
  function addFooterLinks(){
    let footer=document.querySelector('footer');
    if(!footer){footer=document.createElement('footer');document.body.appendChild(footer)}
    if(footer.querySelector('[data-pa-legal-links]'))return;
    const nav=document.createElement('nav');nav.dataset.paLegalLinks='';nav.className='legal-links';nav.style.cssText='justify-content:center;margin:10px 0 0';
    nav.innerHTML='<a href="./mentions-legales.html">Mentions légales</a><a href="./conditions-utilisation.html">Conditions d’utilisation</a><a href="./politique-confidentialite.html">Confidentialité</a><a href="./cookies.html">Cookies</a><a href="./signaler.html">Signaler un problème</a><button type="button" data-pa-cookie-settings>Gérer les cookies</button>';
    footer.appendChild(nav);
    nav.querySelector('[data-pa-cookie-settings]').onclick=()=>showCookieBanner(true);
  }
  function showCookieBanner(settings=false){
    let b=document.getElementById('paCookieBanner');
    if(!b){
      b=document.createElement('section');b.id='paCookieBanner';b.className='cookie-banner';
      b.innerHTML='<h2>Cookies et traceurs</h2><p>Pixel Arcade utilise un cookie nécessaire pour mémoriser ton choix concernant les cookies. Aucun cookie publicitaire ou de mesure d’audience n’est activé par défaut.</p><div class="cookie-actions"><button type="button" class="primary" data-cookie="accept">Tout accepter</button><button type="button" data-cookie="refuse">Tout refuser</button><button type="button" data-cookie="custom">Personnaliser</button></div><div class="cookie-settings"><div class="cookie-setting"><span>Cookies nécessaires<br><small>Indispensables au fonctionnement et à la mémorisation du choix.</small></span><input type="checkbox" checked disabled></div><div class="cookie-setting"><span>Mesure d’audience et publicité<br><small>Non utilisés actuellement.</small></span><input type="checkbox" disabled></div></div>';
      document.body.appendChild(b);
      b.querySelector('[data-cookie="accept"]').onclick=()=>{setCookie(COOKIE_NAME,'accepted');b.classList.remove('show')};
      b.querySelector('[data-cookie="refuse"]').onclick=()=>{setCookie(COOKIE_NAME,'refused');b.classList.remove('show')};
      b.querySelector('[data-cookie="custom"]').onclick=()=>b.querySelector('.cookie-settings').classList.toggle('show');
    }
    b.classList.add('show');
    if(settings)b.querySelector('.cookie-settings').classList.add('show');
  }
  function boot(){addFooterLinks();if(!getCookie(COOKIE_NAME))showCookieBanner(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
