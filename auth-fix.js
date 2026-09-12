/* Pixel Arcade — correctif e-mail technique Supabase. */
(()=>{
  const cfg=window.PIXEL_ARCADE_CONFIG||{};
  const base=String(cfg.supabaseUrl||'').replace(/\/$/,'');
  const key=cfg.supabaseAnonKey||'';
  if(!base||!key)return;
  const technicalEmail=p=>{
    const local=String(p).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,20)||'joueur';
    const host=(base.match(/^https?:\/\/([^/]+)/)||[])[1];
    return local+'@'+host;
  };
  const api=async(path,opt={})=>{
    const token=opt.token||PAAuth.state?.user?.access_token||key;
    const r=await fetch(base+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',...(opt.headers||{})}});
    const text=await r.text();let d=null;try{d=text?JSON.parse(text):null}catch{}
    if(!r.ok)throw Error(d?.msg||d?.message||d?.error_description||text||r.statusText);
    return d;
  };
  const originalSignup=PAAuth.signup;
  PAAuth.signup=async(pseudo,password)=>{
    pseudo=String(pseudo||'').trim();
    const d=await api('/auth/v1/signup',{method:'POST',body:JSON.stringify({email:technicalEmail(pseudo),password,data:{pseudo}})});
    if(!d?.access_token)throw Error('Le compte a été créé mais la confirmation e-mail est activée. Dans Supabase : Authentication → Providers → Email → désactive Confirm email.');
    const st=PAAuth.state;
    st.user={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user};
    st.online=true;
    await PAAuth.refresh();
    return PAAuth.profile();
  };
  PAAuth.login=async(pseudo,password)=>{
    pseudo=String(pseudo||'').trim();
    const d=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:technicalEmail(pseudo),password})});
    const st=PAAuth.state;
    st.user={access_token:d.access_token,refresh_token:d.refresh_token,user:d.user};
    st.online=true;
    await PAAuth.refresh();
    return PAAuth.profile();
  };
})();
