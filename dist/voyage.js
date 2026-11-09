const format=new Intl.NumberFormat('es-MX');
export function startVoyage({container,digits,sequence,target,found,onDone}) {
  let frame,finished=false,start=null;
  const duration=found?3700:4300;
  container.innerHTML='<div class="voyage"><div class="voyage-top"><span class="voyage-label">VIAJANDO POR π</span><span class="voyage-target"></span></div><div class="voyage-galaxy" aria-hidden="true"><div class="voyage-ring ring-a"></div><div class="voyage-ring ring-b"></div><span class="voyage-pi">π</span><div class="tape-pointer"></div><div class="voyage-tape"></div></div><div class="voyage-distance"><span>DECIMAL</span><strong>0</strong></div><div class="voyage-progress"><div></div></div><div class="voyage-footer"><span>Recorrido acelerado · se saltan decimales</span><button type="button">Omitir viaje →</button></div></div>';
  const tape=container.querySelector('.voyage-tape'),counter=container.querySelector('.voyage-distance strong'),bar=container.querySelector('.voyage-progress div'),label=container.querySelector('.voyage-label');
  container.querySelector('.voyage-target').textContent=sequence;
  const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(frame);onDone();};
  container.querySelector('button').addEventListener('click',finish);
  function tick(now){
    if(finished)return;if(start===null)start=now;
    const progress=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-progress,4),index=Math.round(target*eased);
    const before=Math.max(0,index-10),match=digits.slice(index,index+sequence.length),after=digits.slice(index+sequence.length,index+sequence.length+20);
    tape.replaceChildren(document.createTextNode((before===0?'3.':'…')+digits.slice(before,index)));
    const center=document.createElement('span');center.className=progress===1&&found?'tape-found':'';center.textContent=match;tape.append(center,document.createTextNode(after+'…'));
    counter.textContent=format.format(index+1);bar.style.width=`${progress*100}%`;
    if(progress===1){label.textContent=found?'COINCIDENCIA A LA VISTA':'LLEGAMOS AL LÍMITE';if(now-start>duration+500){finish();return;}}
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
  return {finish,cancel(){finished=true;cancelAnimationFrame(frame);}};
}
