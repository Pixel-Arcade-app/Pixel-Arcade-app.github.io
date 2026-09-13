/* Pixel Arcade — envoi des signalements. */
(()=>{
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const URL=String(cfg.supabaseUrl||'').replace(/\/$/,''),KEY=cfg.supabaseAnonKey||'';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function send(){
    const status=$('#reportStatus'),button=$('#sendReport');
    const message=$('#reportMessage').value.trim(),category=$('#reportCategory').value,pseudo=$('#reportPseudo').value.trim().slice(0,20);
    if(message.length<10){status.textContent='Décris le problème en au moins 10 caractères.';return}
    if(message.length>4000){status.textContent='Le signalement est trop long.';return}
    if(!URL||!KEY){status.textContent='Le service de signalement n’est pas configuré.';return}
    button.disabled=true;status.textContent='Envoi…';
    try{
      const s=window.PAAuth?.state?.user,body={category,message:message.slice(0,4000),pseudo:pseudo||null,page_url:location.href,user_id:s?.user?.id||null};
      const headers={apikey:KEY,Authorization:'Bearer '+(s?.access_token||KEY),'Content-Type':'application/json',Prefer:'return=minimal'};
      const r=await fetch(URL+'/rest/v1/reports',{method:'POST',headers,body:JSON.stringify(body)});
      if(!r.ok){const t=await r.text();throw Error(t||'Erreur lors de l’envoi')}
      $('#reportMessage').value='';status.textContent='Signalement envoyé. Merci.';
    }catch(e){status.textContent='Impossible d’envoyer le signalement : '+esc(e.message)}finally{button.disabled=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>$('#sendReport')?.addEventListener('click',send),{once:true});else $('#sendReport')?.addEventListener('click',send);
})();
