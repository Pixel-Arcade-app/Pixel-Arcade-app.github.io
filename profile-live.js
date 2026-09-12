/* Pixel Arcade 10.0 — profil toujours synchronisé avec Supabase. */
(()=>{
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const URL=String(cfg.supabaseUrl||'').replace(/\/$/,''),KEY=cfg.supabaseAnonKey||'';
  const getState=()=>window.PAAuth?.state;
  let timer=0,loading=false;
  async function freshProfile(){
    const s=getState();const id=s?.user?.user?.id;if(!id||!URL||!KEY)return false;
    try{
      const r=await fetch(URL+'/rest/v1/profiles?id=eq.'+encodeURIComponent(id)+'&select=*',{headers:{apikey:KEY,Authorization:'Bearer '+s.user.access_token}});
      if(!r.ok)return false;const d=await r.json();
      if(d?.[0]){s.profile=d[0];try{localStorage.setItem('pixelArcadeProfile',JSON.stringify(s.profile))}catch{}return true}
    }catch(e){console.warn('Profil Supabase:',e)}
    return false;
  }
  async function renderFresh(){
    if(loading||!document.getElementById('profilePage')||!window.PAAuth)return;
    loading=true;
    try{
      const s=getState();
      if(!s?.user){if(window.PAAuth.refresh)await window.PAAuth.refresh();}
      if(getState()?.user){await freshProfile();if(window.PAProfilePlus?.render)await window.PAProfilePlus.render();}
    }finally{loading=false}
  }
  window.PAProfileLive={render:renderFresh};
  if(window.PAAuth){window.PAAuth.renderProfilePage=renderFresh;}
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(renderFresh,120)};
  window.addEventListener('pa-auth-ready',schedule);
  window.addEventListener('pa-auth-updated',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
