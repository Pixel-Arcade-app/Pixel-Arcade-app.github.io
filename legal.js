/* Pixel Arcade — pages légales, cookies et liens du footer. */
(()=>{
  const COOKIE_NAME='pa_cookie_consent';
  const readPrefs=()=>{try{const raw=getCookie(COOKIE_NAME);return raw?JSON.parse(raw):null}catch{return null}};
  const savePrefs=(status,optional=false)=>setCookie(COOKIE_NAME,JSON.stringify({status,optional}));
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
    if(b && b.dataset.paCookieUi!=='2.5'){b.remove();b=null}
    if(!b){
      b=document.createElement('section');b.id='paCookieBanner';b.className='cookie-banner';b.dataset.paCookieUi='2.5';
      b.innerHTML='<h2>Cookies et traceurs</h2><p>Pixel Arcade utilise un cookie nécessaire pour mémoriser ton choix concernant les cookies. Aucun cookie publicitaire ou de mesure d’audience n’est actuellement utilisé.</p><div class="cookie-actions"><button type="button" class="primary" data-cookie="accept">Tout accepter</button><button type="button" data-cookie="refuse">Tout refuser</button><button type="button" data-cookie="custom">Personnaliser</button><button type="button" data-cookie="save" class="save-custom">Enregistrer mes choix</button></div><div class="cookie-settings"><div class="cookie-setting"><span>Cookies nécessaires<br><small>Indispensables au fonctionnement et à la mémorisation du choix.</small></span><input type="checkbox" checked disabled></div><div class="cookie-setting"><span>Mesure d’audience et publicité<br><small>Actuellement non utilisés. Ton choix sera mémorisé.</small></span><input type="checkbox" data-cookie-optional></div></div>';
      document.body.appendChild(b);
      b.querySelector('[data-cookie="accept"]').onclick=()=>{savePrefs('accepted',true);b.classList.remove('show')};
      b.querySelector('[data-cookie="refuse"]').onclick=()=>{savePrefs('refused',false);b.classList.remove('show')};
      b.querySelector('[data-cookie="custom"]').onclick=()=>{
        const settingsBox=b.querySelector('.cookie-settings');
        const save=b.querySelector('[data-cookie="save"]');
        const open=!settingsBox.classList.contains('show');
        settingsBox.classList.toggle('show',open);
        save.style.display=open?'inline-flex':'none';
        b.querySelector('[data-cookie="custom"]').textContent=open?'Masquer les options':'Personnaliser';
        if(open)settingsBox.scrollIntoView({block:'nearest',behavior:'smooth'});
      };
      b.querySelector('[data-cookie="save"]').onclick=()=>{const optional=!!b.querySelector('[data-cookie-optional]').checked;savePrefs('custom',optional);b.classList.remove('show')};
      b.querySelector('[data-cookie-optional]').addEventListener('change',e=>{e.currentTarget.setAttribute('aria-checked',String(e.currentTarget.checked))});
      b.querySelector('.cookie-setting:last-child').addEventListener('click',e=>{if(e.target!==b.querySelector('[data-cookie-optional]'))b.querySelector('[data-cookie-optional]').click()});
    }
    const prefs=readPrefs();
    const optional=b.querySelector('[data-cookie-optional]');
    if(optional){optional.checked=!!prefs?.optional;optional.setAttribute('aria-label','Autoriser les cookies optionnels');}
    const save=b.querySelector('[data-cookie="save"]');if(save)save.style.display=settings?'inline-flex':'none';
    b.classList.add('show');
    if(settings){
      b.querySelector('.cookie-settings').classList.add('show');
      b.querySelector('[data-cookie="save"]').style.display='inline-flex';
      b.querySelector('[data-cookie="custom"]').textContent='Masquer les options';
    }else{
      b.querySelector('.cookie-settings').classList.remove('show');
      b.querySelector('[data-cookie="save"]').style.display='none';
      b.querySelector('[data-cookie="custom"]').textContent='Personnaliser';
    }
  }
  window.PACookieSettings=()=>showCookieBanner(true);
  function boot(){addFooterLinks();if(!getCookie(COOKIE_NAME))showCookieBanner(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
