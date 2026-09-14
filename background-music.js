(()=>{
  if(window.PABackgroundMusic)return;
  let ac=null,master=null,timer=null,playing=false,step=0;
  const key='paMusic';
  // Piano rétro/lo-fi : attaque de marteau, plusieurs harmoniques et décroissance naturelle.
  const scale=[130.81,146.83,164.81,196,220,261.63,293.66,329.63];
  const melody=[0,2,4,7,4,2,5,3,0,4,2,7,5,4,2,1];
  function make(){
    if(ac)return;
    ac=new(window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=.065;master.connect(ac.destination);
  }
  function pianoTone(freq,duration=.9,volume=.17,when=ac.currentTime,pan=0){
    const out=ac.createGain();
    const p=ac.createStereoPanner();p.pan.value=pan;p.connect(out);out.connect(master);
    const now=when;
    // Attaque brillante façon marteau.
    const hammer=ac.createBuffer(1,Math.floor(ac.sampleRate*.025),ac.sampleRate);
    const hd=hammer.getChannelData(0);
    for(let i=0;i<hd.length;i++)hd[i]=(Math.random()*2-1)*Math.exp(-i/hd.length*12);
    const hs=ac.createBufferSource(),hf=ac.createBiquadFilter(),hg=ac.createGain();
    hs.buffer=hammer;hf.type='highpass';hf.frequency.value=1800;hg.gain.setValueAtTime(.0001,now);hg.gain.exponentialRampToValueAtTime(volume*.075,now+.003);hg.gain.exponentialRampToValueAtTime(.0001,now+.035);hs.connect(hf);hf.connect(hg);hg.connect(p);hs.start(now);
    // Fondamental + harmoniques inharmoniques, plus proche d'une corde de piano.
    [[1,.66,'triangle'],[2,.18,'sine'],[3,.07,'sine'],[4.02,.035,'sine'],[5.03,.016,'sine']].forEach(([mul,amp,type],j)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type=type;o.frequency.value=freq*mul*(1+j*.0008);
      g.gain.setValueAtTime(.0001,now);
      g.gain.exponentialRampToValueAtTime(volume*amp,now+.006+j*.001);
      g.gain.exponentialRampToValueAtTime(volume*amp*.42,now+.16);
      g.gain.exponentialRampToValueAtTime(volume*amp*.10,now+duration*.62);
      g.gain.exponentialRampToValueAtTime(.0001,now+duration);
      o.connect(g);g.connect(p);o.start(now);o.stop(now+duration+.06);
    });
  }
  function loFiKick(when){
    const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(70,when);o.frequency.exponentialRampToValueAtTime(43,when+.13);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(.025,when+.008);g.gain.exponentialRampToValueAtTime(.0001,when+.16);o.connect(g);g.connect(master);o.start(when);o.stop(when+.18);
  }
  function loFiHat(when){
    const b=ac.createBuffer(1,Math.floor(ac.sampleRate*.03),ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*8);
    const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='highpass';f.frequency.value=5000;g.gain.value=.006;s.connect(f);f.connect(g);g.connect(master);s.start(when);
  }
  function note(){
    if(!playing||!ac)return;
    const now=ac.currentTime,i=step%melody.length,root=scale[melody[i]];
    const pan=(i%4-1.5)*.17;
    pianoTone(root*(step%8===7?2:1),1.35,.19,now,pan);
    if(i%4===0){
      pianoTone(root/2,1.55,.055,now+.01,-pan*.5);
      pianoTone(root*1.5,1.1,.018,now+.025,-pan);
      loFiKick(now);
    }
    if(i%2===0)loFiHat(now+.14);
    step++;timer=setTimeout(note,590+Math.random()*45);
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