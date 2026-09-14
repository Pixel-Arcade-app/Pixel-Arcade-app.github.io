(()=>{
  if(window.PABackgroundMusic)return;
  let ac=null,master=null,timer=null,playing=false,step=0;
  const key='paMusic';
  // Petite boucle rétro/lo-fi, grave et chaleureuse.
  const scale=[130.81,146.83,164.81,196,220,261.63,293.66,329.63];
  const melody=[0,2,4,7,4,2,5,3,0,4,2,7,5,4,2,1];
  function make(){
    if(ac)return;
    ac=new(window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=.075;master.connect(ac.destination);
  }
  function pianoTone(freq,duration,volume,when,pan=0){
    const p=ac.createStereoPanner();p.pan.value=pan;p.connect(master);
    [[1,.72],[2,.17],[3,.055],[4,.02]].forEach(([mul,amp],j)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type=j===0?'triangle':'sine';o.frequency.value=freq*mul;
      g.gain.setValueAtTime(.0001,when);
      g.gain.exponentialRampToValueAtTime(volume*amp,when+.009);
      g.gain.exponentialRampToValueAtTime(volume*amp*.20,when+duration*.30);
      g.gain.exponentialRampToValueAtTime(.0001,when+duration);
      o.connect(g);g.connect(p);o.start(when);o.stop(when+duration+.04);
    });
  }
  function loFiKick(when){
    const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(75,when);o.frequency.exponentialRampToValueAtTime(42,when+.13);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(.045,when+.008);g.gain.exponentialRampToValueAtTime(.0001,when+.16);o.connect(g);g.connect(master);o.start(when);o.stop(when+.18);
  }
  function loFiHat(when){
    const b=ac.createBuffer(1,Math.floor(ac.sampleRate*.035),ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*7);
    const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='highpass';f.frequency.value=4500;g.gain.value=.012;s.connect(f);f.connect(g);g.connect(master);s.start(when);
  }
  function note(){
    if(!playing||!ac)return;
    const now=ac.currentTime,i=step%melody.length,root=scale[melody[i]];
    const pan=(i%4-1.5)*.20;
    pianoTone(root*(step%8===7?2:1),.95,.17,now,pan);
    if(i%4===0){
      pianoTone(root/2,1.15,.065,now,-pan*.55);
      pianoTone(root*1.5,.88,.035,now+.025,-pan);
      loFiKick(now);
    }
    if(i%2===0)loFiHat(now+.12);
    step++;timer=setTimeout(note,560+Math.random()*55);
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