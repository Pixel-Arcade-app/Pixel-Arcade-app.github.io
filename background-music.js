(()=>{
  if(window.PABackgroundMusic)return;
  let ac=null,master=null,timer=null,playing=false,step=0;
  const key='paMusic';
  // Registre plus grave, pensé pour évoquer un piano feutré.
  const scale=[130.81,146.83,164.81,196,220,261.63,293.66,329.63];
  const melody=[0,2,4,7,4,2,5,3,0,4,2,7,5,4,2,1];
  function make(){
    if(ac)return;
    ac=new(window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=.085;master.connect(ac.destination);
  }
  function pianoTone(freq,duration,volume,when,pan=0){
    // Deux harmoniques + attaque douce pour un timbre plus proche d'une corde de piano.
    const p=ac.createStereoPanner();p.pan.value=pan;p.connect(master);
    [[1,.72],[2,.20],[3,.08]].forEach(([mul,amp],j)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type=j===0?'triangle':'sine';o.frequency.value=freq*mul;
      const attack=j===0?.008:.012;
      g.gain.setValueAtTime(.0001,when);
      g.gain.exponentialRampToValueAtTime(volume*amp,when+attack);
      g.gain.exponentialRampToValueAtTime(volume*amp*.32,when+duration*.28);
      g.gain.exponentialRampToValueAtTime(.0001,when+duration);
      o.connect(g);g.connect(p);o.start(when);o.stop(when+duration+.02);
    });
  }
  function note(){
    if(!playing||!ac)return;
    const now=ac.currentTime,i=step%melody.length,root=scale[melody[i]];
    const pan=(i%4-1.5)*.16;
    pianoTone(root*(step%8===7?2:1),.78,.19,now,pan);
    if(i%4===0)pianoTone(root/2,.95,.075,now-.01,-pan*.65);
    if(i%4===0)pianoTone(root*1.5,.72,.045,now+.015,-pan);
    step++;timer=setTimeout(note,520+Math.random()*45);
  }
  async function start(){try{make();if(ac.state==='suspended')await ac.resume();if(playing)return;playing=true;step=Math.floor(Math.random()*16);note();button()}catch{}}
  function stop(){playing=false;clearTimeout(timer);timer=null;button()}
  function button(){const b=document.getElementById('paMusicBtn');if(b)b.textContent=playing?'Musique : activée':'Musique : désactivée'}
  function mount(){
    const b=document.createElement('button');b.id='paMusicBtn';b.type='button';b.className='theme';b.textContent='Musique : désactivée';b.title='La musique démarre après une interaction avec la page';b.style.cssText='margin-left:8px';b.onclick=()=>{if(playing){stop();localStorage.setItem(key,'off')}else{start();localStorage.setItem(key,'on')}};
    const host=document.querySelector('.head-actions');if(host)host.appendChild(b);else document.body.appendChild(b);
    const auto=localStorage.getItem(key)==='on';
    if(auto){const once=()=>{document.removeEventListener('pointerdown',once);document.removeEventListener('keydown',once);start()};document.addEventListener('pointerdown',once,{once:true});document.addEventListener('keydown',once,{once:true})}else button();
  }
  window.PABackgroundMusic={start,stop};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();