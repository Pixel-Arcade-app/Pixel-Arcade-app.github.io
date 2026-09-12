/* Pixel Arcade — présence : uniquement dernier signal + jeu courant, sans IP. */
(()=>{
  let timer=null;
  async function beat(){
    const c=window.PIXEL_ARCADE_CONFIG||{},s=window.PAAuth?.state?.user,u=window.PAAuth?.state?.profile;
    if(!navigator.onLine||!c.supabaseUrl||!c.supabaseAnonKey||!s?.access_token||!s?.user?.id)return;
    const game=document.body?.dataset?.game||null;
    try{await fetch(String(c.supabaseUrl).replace(/\/$/,'')+'/rest/v1/player_presence?on_conflict=user_id',{method:'POST',headers:{apikey:c.supabaseAnonKey,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:s.user.id,game,last_seen:new Date().toISOString()})})}catch{}
  }
  function start(){clearInterval(timer);beat();timer=setInterval(beat,30000)}
  window.addEventListener('pa-auth-ready',start);window.addEventListener('pa-auth-updated',()=>{if(window.PAAuth?.state?.user)start()});window.addEventListener('online',beat);
  if(document.readyState!=='loading')setTimeout(start,500);else document.addEventListener('DOMContentLoaded',()=>setTimeout(start,500));
})();
