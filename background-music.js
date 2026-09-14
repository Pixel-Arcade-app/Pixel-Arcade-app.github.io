(()=>{
  if(window.PABackgroundMusic)return;
  let ac=null,master=null,timer=null,playing=false,step=0;
  const key='paMusic';
  const scale=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];
  const melody=[0,2,4,7,4,2,5,3,0,4,2,7,5,4,2,1];
  function make(){
    if(ac)return;
    ac=new(window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();
    master.gain.value=.085;
    master.connect(ac.destination);
  }
  function piano(freq,duration,volume,pan,when){
    const p=ac.createStereoPanner(),g=ac.createGain(),o1=ac.createOscillator(),o2=ac.createOscillator(),o3=ac.createOscillator();
    const peak=Math.max(.0001,volume);
    o1.type='sine';o2.type='sine';o3.type='triangle';
    o1.frequency.value=freq;o2.frequency.value=freq*2;o3.frequency.value=freq*3;
    p.pan.value=pan;
    g.gain.setValueAtTime(.0001,when);
    g.gain.exponentialRampToValueAtTime(peak,when+.008);
    g.gain.exponentialRampToValueAtTime(peak*.34,when+.18);
    g.gain.exponentialRampToValueAtTime(.0001,when+duration);
    o1.connect(g);o2.connect(g);o3.connect(g);g.connect(p);p.connect(master);
    o1.start(when);o2.start(when);o3.start(when);
    o1.stop(when+duration+.03);o2.stop(when+duration+.03);o3.stop(when+duration+.03);
  }
  function note(){
    if(!playing||!ac)return;
    const now=ac.currentTime,i=step%melody.length,root=scale[melody[i]];
    const pan=Math.sin(step*.82)*.55;
    // Son principal façon piano : plusieurs harmoniques, sans ancien instrument synthé.
    piano(root*(step%8===7?2:1),.62,.20,pan,now);
    // Réponse stéréo très légère, une octave au-dessus.
    if(i%4===2)piano(root*2,.38,.055,-pan,now+.055);
    // Basse douce façon piano grave.
    if(i%4===0)piano(root/2,.78,.055,-pan*.55,now);
    step++;timer=setTimeout(note,360+Math.random()*30);
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