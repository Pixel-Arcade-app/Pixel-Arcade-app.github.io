/* Pixel Arcade — fullscreen fix v8.2 */
(()=>{
  const $=id=>document.getElementById(id);
  const nativeStart=window.start;
  const nativeRestart=window.restartCurrent;
  const nativeLaunch=window.launchGame;
  let patching=false;
  async function enterFixed(){
    const target=$("game");
    if(!target)return;
    document.body.classList.add("playing");
    target.style.visibility="visible";
    target.style.opacity="1";
    target.style.display="grid";
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    try{
      if(!document.fullscreenElement && target.requestFullscreen){
        await target.requestFullscreen({navigationUI:"hide"});
      }
    }catch(e){
      console.warn("Fullscreen refusé:",e);
      document.body.classList.remove("playing");
    }
  }
  async function exitFixed(){
    document.body.classList.remove("playing");
    try{if(document.fullscreenElement)await document.exitFullscreen()}catch(e){console.warn(e)}
  }
  window.enterGameFullscreen=enterFixed;
  window.exitGameFullscreen=exitFixed;
  window.start=function(name){
    if(patching)return;
    patching=true;
    try{
      if(typeof nativeStart==="function")nativeStart(name);
    }finally{
      patching=false;
    }
    /* games.js starts fullscreen itself; immediately restore the correct target after its DOM update */
    requestAnimationFrame(()=>requestAnimationFrame(enterFixed));
  };
  window.restartCurrent=function(){if(document.body.dataset.game)window.start(document.body.dataset.game)};
  window.launchGame=function(){window.start(document.body.dataset.game)};
  document.addEventListener("fullscreenerror",e=>{console.warn("Fullscreen error",e);document.body.classList.remove("playing")});
  document.addEventListener("fullscreenchange",()=>{
    if(document.fullscreenElement){
      const el=document.fullscreenElement;
      el.style.width="100vw";
      el.style.height="100vh";
      el.style.minHeight="100vh";
      el.style.background="#05070d";
      el.style.margin="0";
      el.style.borderRadius="0";
      el.style.overflow="auto";
    }
  });
})();
