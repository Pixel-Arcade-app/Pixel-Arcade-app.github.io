import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}});
const ok=(body:unknown)=>json(body,200);

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return json({ok:true});
  try{
    const auth=req.headers.get('Authorization')||'';
    if(!auth.startsWith('Bearer '))return json({error:'Connexion requise.'},401);
    const token=auth.slice(7);
    const url=Deno.env.get('SUPABASE_URL')!;
    const anon=Deno.env.get('SUPABASE_ANON_KEY')!;
    const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if(!url||!anon||!service)return json({error:'Configuration serveur incomplète.'},500);
    const userClient=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}});
    const {data:{user},error:userErr}=await userClient.auth.getUser(token);
    if(userErr||!user)return json({error:'Session invalide.'},401);
    const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:me,error:meErr}=await admin.from('profiles').select('id,pseudo,is_admin').eq('id',user.id).maybeSingle();
    if(meErr||!me?.is_admin)return json({error:'Accès administrateur refusé.'},403);

    const body=await req.json().catch(()=>({}));
    const action=body.action;
    if(action==='list'){
      const profiles=[];
      for(let page=1;;page++){
        const r=await admin.auth.admin.listUsers({page,perPage:1000});
        if(r.error)throw r.error;
        profiles.push(...r.data.users);
        if(r.data.users.length<1000)break;
      }
      const ids=profiles.map(u=>u.id);
      const [{data:rows,error:pErr},{data:presence,error:prErr}]=await Promise.all([
        admin.from('profiles').select('id,pseudo,xp,games_played,total_score,favorites,is_admin,disabled_at,created_at').in('id',ids),
        ids.length?admin.from('player_presence').select('user_id,game,last_seen').in('user_id',ids):Promise.resolve({data:[],error:null})
      ]);
      if(pErr)throw pErr;if(prErr)throw prErr;
      const pmap=new Map((rows||[]).map(x=>[x.id,x]));
      const amap=new Map((presence||[]).map(x=>[x.user_id,x]));
      const now=Date.now();
      const users=profiles.map(u=>{const p=pmap.get(u.id)||{},pr=amap.get(u.id);const active=!!pr&&(now-new Date(pr.last_seen).getTime()<90000)&&!p.disabled_at&&!u.banned_until;
        return {id:u.id,pseudo:p.pseudo||u.user_metadata?.pseudo||u.email?.split('@')[0]||'Joueur',status:(p.disabled_at||u.banned_until)?'disabled':'active',last_sign_in_at:u.last_sign_in_at||null,created_at:u.created_at,xp:Number(p.xp||0),games_played:Number(p.games_played||0),total_score:Number(p.total_score||0),favorites:Array.isArray(p.favorites)?p.favorites:[],is_admin:!!p.is_admin,active_now:active,game:pr?.game||null,region:null};});
      return ok({admin:true,users});
    }
    const target=String(body.user_id||'');
    if(!target)return json({error:'Utilisateur manquant.'},400);
    const {data:targetProfile}=await admin.from('profiles').select('id,pseudo,is_admin,disabled_at').eq('id',target).maybeSingle();
    if(!targetProfile)return json({error:'Compte introuvable.'},404);
    if(targetProfile.is_admin && target!==user.id)return json({error:'Un administrateur ne peut pas modifier un autre administrateur.'},403);
    if(action==='toggle'){
      const disabling=!targetProfile.disabled_at;
      const {error:pErr}=await admin.from('profiles').update({disabled_at:disabling?new Date().toISOString():null}).eq('id',target);
      if(pErr)throw pErr;
      const {error:aErr}=await admin.auth.admin.updateUserById(target,{ban_duration:disabling?'100y':'none'});
      if(aErr)throw aErr;
      return ok({ok:true,disabled:disabling});
    }
    if(action==='delete'){
      if(target===user.id)return json({error:'Impossible de supprimer le compte administrateur actuellement connecté.'},400);
      const {error}=await admin.auth.admin.deleteUser(target,true);if(error)throw error;
      return ok({ok:true});
    }
    if(action==='reset_password'){
      const password=String(body.password||'');
      if(password.length<8)return json({error:'Le nouveau mot de passe doit contenir au moins 8 caractères.'},400);
      const {error}=await admin.auth.admin.updateUserById(target,{password});if(error)throw error;
      return ok({ok:true});
    }
    return json({error:'Action inconnue.'},400);
  }catch(e){console.error(e);return json({error:e instanceof Error?e.message:'Erreur serveur.'},500)}
});
