(()=>{
  if(window.PABackgroundMusic)return;
  let ac=null,gain=null,timer=null,playing=false,step=0;
  const scale=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];
  const key='paMusic';
  function make(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();gain=ac.createGain();gain.gain.value=.045;gain.connect(ac.destination)}
  function note(){if(!playing||!ac)return;const now=ac.currentTime;const pattern=[0,2,4,7,4,2,5,3,0,4,2,7,5,4,2,1];const n=scale[pattern[step%pattern.length]];const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=n*(step%8===7?2:1);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.18,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+.28);o.connect(g);g.connect(gain);o.start(now);o.stop(now+.3);step++;timer=setTimeout(note,310+Math.random()*45)}
  async function start(){try{make();if(ac.state==='suspended')await ac.resume();if(playing)return;playing=true;step=Math.floor(Math.random()*16);note();button()}catch{}}
  function stop(){playing=false;clearTimeout(timer);timer=null;button()}
  function button(){const b=document.getElementById('paMusicBtn');if(b)b.textContent=playing?'Musique : activée':'Musique : désactivée'}
  function mount(){const b=document.createElement('button');b.id='paMusicBtn';b.type='button';b.className='theme';b.textContent='Musique : désactivée';b.title='La musique démarre après une interaction avec la page';b.style.cssText='margin-left:8px';b.onclick=()=>playing?stop():start();const host=document.querySelector('.head-actions');if(host)host.appendChild(b);else document.body.appendChild(b);const auto=localStorage.getItem(key)==='on';if(auto){const once=()=>{document.removeEventListener('pointerdown',once);document.removeEventListener('keydown',once);start()};document.addEventListener('pointerdown',once,{once:true});document.addEventListener('keydown',once,{once:true})}else button()}
  window.PABackgroundMusic={start,stop};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  document.addEventListener('click',e=>{if(e.target?.id==='paMusicBtn')localStorage.setItem(key,playing?'on':'off')});
})();
