/* Pixel Arcade — configuration. Ne mets JAMAIS la clé service_role ici. */
window.PIXEL_ARCADE_VERSION="10.7.0";
window.PIXEL_ARCADE_CONFIG={supabaseUrl:"https://oztpipdiymcbqnvdlkfs.supabase.co",supabaseAnonKey:"sb_publishable_dMPMLOczi3OJm7Nb1DkT6g_nVgpAZxO"};
(function(){
  function syncVersion(){
    const version=String(window.PIXEL_ARCADE_VERSION||"");
    if(!version)return;
    const re=/\bversion\s+\d+(?:\.\d+){1,3}\b/gi;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(n.parentElement&&n.parentElement.tagName!=="SCRIPT"&&re.test(n.nodeValue)){re.lastIndex=0;n.nodeValue=n.nodeValue.replace(re,"version "+version);}});
    document.querySelectorAll("[data-pa-version]").forEach(el=>el.textContent=version);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncVersion,{once:true});else syncVersion();
})();
if(location.protocol!=='file:'&&!window.PA_DOWNLOAD_MODE){window.addEventListener('load',()=>{for(const href of ['v9.css?v=10.6','v9-fix.css?v=10.6','profile-plus.css?v=10.6','graphics-plus.css?v=10.6','game-ui-fix.css?v=10.6']){const css=document.createElement('link');css.rel='stylesheet';css.href=href;document.head.appendChild(css)}for(const src of ['auth.js?v=10.6','v9.js?v=10.6','auth-v2.js?v=10.6','profile-plus.js?v=10.6','presence.js?v=10.6','site-fix.js?v=10.6','platformer-card.js?v=1.0','fullscreen-final.js?v=10.6','profile-live.js?v=10.6','game-ui-fix.js?v=10.6','iwa-install.js?v=10.7']){const s=document.createElement('script');s.src=src;s.async=false;document.body.appendChild(s)}})}
