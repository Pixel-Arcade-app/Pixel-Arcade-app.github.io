/* Pixel Arcade — correctif des adresses techniques Supabase. */
(()=>{
  const OLD='@pixelarcade.local';
  const NEW='@oztpipdiymcbqnvdlkfs.supabase.co';
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(init && typeof init.body==='string' && /\/auth\/v1\/(signup|token)/.test(url)){
        const body=JSON.parse(init.body);
        if(typeof body.email==='string' && body.email.endsWith(OLD)){
          body.email=body.email.slice(0,-OLD.length)+NEW;
          init={...init,body:JSON.stringify(body)};
        }
      }
    }catch{}
    return nativeFetch(input,init);
  };
})();
