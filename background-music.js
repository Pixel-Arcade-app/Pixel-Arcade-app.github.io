(()=>{
  if(window.PABackgroundMusic)return;
  let ac=null,master=null,timer=null,playing=false,step=0;
  const key='paMusic';
  const scale=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];
  const melody=[0,2,4,7,4,2,5,3,0,4,2,7,5,4,2,1];
  function make(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.10;master.connect(ac.destination)}
  function tone(freq,duration,type,volume,when){
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(volume,when+.018);g.gain.exponentialRampToValueAtTime(.0001,when+duration-.025);
    o.connect(g);g.connect(master);o.start(when);o.stop(when+duration);
  }
  function chord(root,when){
    tone(root,.48,'sine',.035,when);
    tone(root*1.25,.42,'triangle',.018,when+.01);
    tone(root*1.5,.42,'triangle',.014,when+.01);
  }
  function note(){
    if(!playing||!ac)return;
    const now=ac.currentTime, i=step%melody.length, root=scale[melody[i]];
    // Mélodie principale : son doux type synthé.
    tone(root*(step%8===7?2:1),.28,'triangle',.27,now);
    // Petite basse régulière.
    if(i%4===0)tone(root/2,.42,'sine',.11,now);
    // Accords d'accompagnement, toutes les 4 notes.
    if(i%4===0)chord(root,now);
    // Petite percussion synthétique sans samples externes.
    if(i%2===0)tone(90,.055,'square',.025,now);
    step++;timer=setTimeout(note,300+Math.random()*35);
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