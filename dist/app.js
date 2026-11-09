import {DECIMAL_COUNT,MONTHS,pad,isValidDate,flexibleDateSequence,findMatches,getExcerpt} from './core.js';
import {dateParts,validateBirth,fictionalOracle,cosmicCauses,lastWords} from './oracle.js';
import {startVoyage} from './voyage.js';
const $=id=>document.getElementById(id);
const numberFormat=new Intl.NumberFormat('es-MX');
const fmt=n=>numberFormat.format(n);
const state={mode:'birth',digits:'',matches:[],current:0,sequence:'',description:'',loaded:false,edited:false};
let activeVoyage=null;
const modes={
  birthday:{title:'El día que empezó todo.',description:'Día y mes. El año aquí no se mete.',format:'en formato DDMM'},
  birth:{title:'Pon tu mes. Tu día. Tu año.',description:'Tú pones la fecha. Nosotros hacemos el viaje.',format:'en formato MMDDAAAA'},
  chaos:{title:'Aquí cabe hasta tu número de la suerte.',description:'Un número cualquiera. La explicación es opcional.',format:'sin cambiar ningún dígito'}
};

function setDays(){
  const previous=Number($('day').value)||14;
  const month=Number($('month').value)||3;
  const rawYear=Number($('year').value);
  const calendarYear=state.mode==='birth'&&rawYear>=1&&rawYear<=9999 ? rawYear:2000;
  let maximum=31;
  while(!isValidDate(maximum,month,calendarYear))maximum--;
  $('day').replaceChildren(...Array.from({length:maximum},(_,i)=>new Option(pad(i+1),String(i+1))));
  $('day').value=String(Math.min(previous,maximum));
}
MONTHS.forEach((month,index)=>$('month').add(new Option(month,String(index+1))));
$('month').value='3';setDays();$('day').value='14';

function preview(){
  let sequence='';
  if(state.mode==='chaos')sequence=$('custom-number').value;
  else sequence=flexibleDateSequence(Number($('day').value),Number($('month').value),$('year').value,{withYear:state.mode==='birth',order:$('date-order').value,shortYear:$('short-year').checked});
  $('sequence-preview').textContent=sequence||'tu número';
  $('format-note').textContent=state.mode==='chaos'?modes.chaos.format:`en formato ${$('date-order').value==='MDY'?'MMDD':'DDMM'}${state.mode==='birth'?($('short-year').checked?'AA':'AAAA'):''}`;
  $('form-error').hidden=true;
  state.edited=true;
}
function setMode(mode,focus=false){
  if(activeVoyage){activeVoyage.finish();activeVoyage=null;}
  state.mode=mode;
  document.querySelectorAll('.mode-tab').forEach(tab=>{const active=tab.dataset.mode===mode;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
  $('search-panel').setAttribute('aria-labelledby',`tab-${mode}`);
  $('year-field').hidden=mode!=='birth';$('date-fields').hidden=mode==='chaos';$('number-field').hidden=mode!=='chaos';
  document.querySelector('.format-controls').classList.toggle('hidden',mode==='chaos');$('short-year-label').hidden=mode!=='birth';
  $('form-title').textContent=modes[mode].title;$('form-description').textContent=modes[mode].description;
  $('search-label').textContent=state.loaded?'Buscar mi número en π':'Cargando decimales…';
  setDays();preview();
}
document.querySelectorAll('.mode-tab').forEach(tab=>{
  tab.addEventListener('click',()=>setMode(tab.dataset.mode));
  tab.addEventListener('keydown',event=>{
    const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(event.key))return;
    event.preventDefault();const list=['birthday','birth','chaos'];let i=list.indexOf(state.mode);
    i=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;setMode(list[i],true);
  });
});
$('day').addEventListener('change',preview);
$('month').addEventListener('change',()=>{setDays();preview();});
$('year').addEventListener('input',()=>{setDays();preview();});
$('custom-number').addEventListener('input',preview);
$('date-order').addEventListener('change',preview);$('short-year').addEventListener('change',preview);
setMode('birth');

function query(){
  if(state.mode==='chaos'){
    const sequence=$('custom-number').value;
    if(!/^\d{1,24}$/.test(sequence))throw new Error('Escribe de 1 a 24 dígitos, sin espacios ni signos.');
    return {sequence,description:`Tu número ${sequence}`,mode:state.mode};
  }
  const day=Number($('day').value),month=Number($('month').value),year=Number($('year').value);
  const withYear=state.mode==='birth';
  if(withYear&&!/^\d{4}$/.test($('year').value))throw new Error('Escribe un año de cuatro dígitos.');
  if(!isValidDate(day,month,withYear?year:2000))throw new Error('Esa fecha no existe. Revisa el día, el mes y el año.');
  if(withYear){
    const now=new Date();
    const chosen=year*10000+month*100+day,today=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
    if(chosen>today)throw new Error('Tu nacimiento todavía no puede estar en el futuro. Revisa el año.');
  }
  return {sequence:flexibleDateSequence(day,month,year,{withYear,order:$('date-order').value,shortYear:$('short-year').checked}),description:`${day} de ${MONTHS[month-1].toLowerCase()}${withYear?' de '+String(year).padStart(4,'0'):''}${withYear&&$('short-year').checked?' (año corto)':''}`,mode:state.mode};
}

function search(){
  if(!state.loaded)return;
  let q;try{q=query();}catch(error){$('form-error').textContent=error.message;$('form-error').hidden=false;return;}
  $('form-error').hidden=true;
  if(activeVoyage){activeVoyage.cancel();activeVoyage=null;}
  state.sequence=q.sequence;state.description=q.description;state.resultMode=q.mode;
  state.matches=findMatches(state.digits,q.sequence);state.current=0;state.edited=false;
  if($('journey-toggle').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches)journey();else renderResult();
}
$('search-form').addEventListener('submit',event=>{event.preventDefault();search();});

function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function journey(){
  if(activeVoyage)activeVoyage.cancel();
  $('result-actions').hidden=true;$('result-panel').setAttribute('aria-busy','true');$('result-panel').classList.add('journey-running');$('result-status').textContent='EN TRÁNSITO';
  const found=state.matches.length>0,target=found?state.matches[state.current]:state.digits.length-state.sequence.length;
  activeVoyage=startVoyage({container:$('result-content'),digits:state.digits,sequence:state.sequence,target,found,onDone(){activeVoyage=null;$('result-panel').classList.remove('journey-running');renderResult();}});
  if(matchMedia('(max-width: 730px)').matches)$('result-panel').scrollIntoView({behavior:'smooth',block:'center'});
}
function renderResult(){
  $('result-panel').setAttribute('aria-busy','false');
  const content=$('result-content');content.replaceChildren();
  const found=state.matches.length>0;
  $('result-status').replaceChildren(element('span','status-dot'),document.createTextNode(found?' ENCONTRADO':' SIN COINCIDENCIAS'));
  $('result-actions').hidden=!found;
  if(!found){
    const empty=element('div','result-empty');empty.append(element('div','empty-icon','∞'),element('h2','','Todavía no apareció.'),element('p','empty-sequence',state.sequence),element('p','',`No está en los ${fmt(DECIMAL_COUNT)} decimales que buscamos. El resto de π sigue siendo otra historia.`));
    if(state.resultMode==='birth'){
      if(!$('short-year').checked){const shortYear=element('button','retry-button','Probar con año de 2 dígitos →');shortYear.addEventListener('click',()=>{setMode('birth');$('short-year').checked=true;preview();search();});empty.append(shortYear);}
      const shorter=element('button','retry-button','Probar solo día y mes →');shorter.addEventListener('click',()=>{setMode('birthday');search();});empty.append(shorter);
    }
    content.append(empty);return;
  }
  const index=state.matches[state.current],position=index+1;
  content.append(element('p','result-eyebrow',state.current===0?'Tu número aparece en la posición':'Otra coincidencia en la posición'));
  const number=element('h2','position');number.append(element('span','position-prefix','#'),document.createTextNode(fmt(position)));content.append(number);
  const subtitle=element('p','result-subtitle');subtitle.append(document.createTextNode(`${state.description} → `),element('strong','',state.sequence));content.append(subtitle);
  const excerpt=getExcerpt(state.digits,index,state.sequence.length);
  const window=element('div','digit-window');
  const coordinate=element('div','digit-coordinate');coordinate.append(element('span','',`DECIMAL ${fmt(excerpt.start+1)}`),element('span','',`DECIMAL ${fmt(excerpt.end)}`));
  const line=element('div','digit-string');line.append(document.createTextNode((excerpt.start>0?'…':'3.')+excerpt.before),element('mark','',excerpt.match),document.createTextNode(excerpt.after+(excerpt.end<state.digits.length?'…':'')));window.append(coordinate,line);content.append(window);
  content.append(element('p','result-caption',`${fmt(state.matches.length)} ${state.matches.length===1?'coincidencia encontrada':'coincidencias encontradas'} en 2 millones de decimales.`));
  const replay=element('button','replay-button','↻ Repetir viaje desde 3.14159…');replay.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)journey();else toast('El recorrido respeta tu preferencia de movimiento reducido.');});content.append(replay);
  $('match-counter').textContent=`${fmt(state.current+1)} / ${fmt(state.matches.length)}`;
  $('previous-match').disabled=state.matches.length<2;$('next-match').disabled=state.matches.length<2;
  $('copy-label').textContent='Copiar resultado';
}
$('previous-match').addEventListener('click',()=>{state.current=(state.current-1+state.matches.length)%state.matches.length;renderResult();});
$('next-match').addEventListener('click',()=>{state.current=(state.current+1)%state.matches.length;renderResult();});

function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
$('copy-result').addEventListener('click',async()=>{
  const text=`${state.description} (${state.sequence}) aparece en la posición ${fmt(state.matches[state.current]+1)} de los decimales de π. Encontré ${fmt(state.matches.length)} ${state.matches.length===1?'coincidencia':'coincidencias'} en los primeros ${fmt(DECIMAL_COUNT)} decimales. — π su PTM · ${location.origin}`;
  try{await navigator.clipboard.writeText(text);$('copy-label').textContent='¡Copiado!';toast('Resultado copiado.');}catch{toast('No se pudo copiar. Puedes seleccionar el resultado en pantalla.');}
});
$('random-button').addEventListener('click',()=>{
  const random=new Uint32Array(2);crypto.getRandomValues(random);
  if(state.mode==='chaos'){
    const length=4+random[0]%5,index=random[1]%(state.digits.length-length+1);
    $('custom-number').value=state.digits.slice(index,index+length);
  }else{
    $('month').value=String(random[0]%12+1);
    if(state.mode==='birth')$('year').value=String(1950+random[1]%70);
    setDays();$('day').value=String(random[1]%$('day').options.length+1);
  }
  preview();search();
});
const dialog=$('about-dialog');
$('about-open').addEventListener('click',()=>dialog.showModal());
for(const id of ['about-close','about-done'])$(id).addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});

async function loadDigits(){
  try{
    const response=await fetch('./pi-digits.txt');if(!response.ok)throw new Error('No se pudo cargar la secuencia.');
    const digits=(await response.text()).trim();
    if(digits.length!==DECIMAL_COUNT||!digits.startsWith('14159265358979323846264338327950288419716939937510')||!/^[0-9]+$/.test(digits))throw new Error('La secuencia no llegó completa.');
    state.digits=digits;state.loaded=true;
    $('search-button').disabled=false;$('random-button').disabled=false;$('oracle-submit').disabled=false;$('search-label').textContent='Buscar mi número en π';$('dataset-status').textContent=`${fmt(DECIMAL_COUNT)} decimales · Búsqueda local`;
    {
      $('result-panel').setAttribute('aria-busy','false');$('result-status').textContent='LISTO PARA BUSCAR';
      const ready=element('div','result-loading');ready.append(element('span','loading-pi','π'),element('h2','','Tu fecha está a un viaje de distancia.'),element('p','','Pon mes, día y año. Sigue los decimales hasta tu coincidencia.'));$('result-content').replaceChildren(ready);
    }
  }catch(error){
    $('result-panel').setAttribute('aria-busy','false');$('result-status').textContent='SIN CONEXIÓN';$('dataset-status').textContent='No se pudieron cargar los decimales';
    const problem=element('div','result-empty');problem.append(element('div','empty-icon','π'),element('h2','','Los decimales no llegaron.'),element('p','','Revisa tu conexión y vuelve a intentarlo.'));
    const retry=element('button','retry-button','Volver a cargar ↻');retry.addEventListener('click',()=>{retry.disabled=true;loadDigits();});problem.append(retry);$('result-content').replaceChildren(problem);$('search-label').textContent='Esperando los decimales';
  }
}

// The oracle is explicitly fictional; only its numerical recipe is deterministic.
let oracleUniverse=0,oracleTimer=null,oracleBirth=null,oracleLast=null;
const humanDate=iso=>new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${iso}T12:00:00Z`));
function refreshToday(){const now=dateParts();$('oracle-today').textContent=`${pad(now.month)} / ${pad(now.day)} / ${now.year}`;$('oracle-today').dateTime=`${now.year}-${pad(now.month)}-${pad(now.day)}`;return now;}
MONTHS.forEach((name,index)=>$('oracle-month').add(new Option(name,String(index+1))));$('oracle-month').value='3';
function oracleDays(){
  const previous=Number($('oracle-day').value)||14,month=Number($('oracle-month').value),year=Number($('oracle-year').value)||2000;
  const validYear=year>=1&&year<=9999?year:2000;let max=31;while(!isValidDate(max,month,validYear))max--;
  $('oracle-day').replaceChildren(...Array.from({length:max},(_,i)=>new Option(pad(i+1),String(i+1))));$('oracle-day').value=String(Math.min(previous,max));
}
oracleDays();refreshToday();
for(const id of ['oracle-month','oracle-year'])$(id).addEventListener(id==='oracle-month'?'change':'input',()=>{oracleDays();$('oracle-error').hidden=true;});
$('oracle-day').addEventListener('change',()=>$('oracle-error').hidden=true);
$('sync-birthday').addEventListener('click',()=>{
  $('oracle-month').value=$('month').value;$('oracle-year').value=$('year').value;oracleDays();$('oracle-day').value=$('day').value;$('oracle-error').hidden=true;toast('Fecha del buscador copiada al oráculo.');
});
function runOracle(birth,universe=0){
  const today=refreshToday();
  try{validateBirth(birth,today);if(!state.loaded)throw new Error('Espera a que se carguen los decimales.');}catch(error){$('oracle-error').textContent=error.message;$('oracle-error').hidden=false;return;}
  clearTimeout(oracleTimer);oracleUniverse=universe;oracleBirth={...birth};$('oracle-error').hidden=true;
  const output=$('oracle-result');output.className='oracle-result oracle-consulting';output.setAttribute('aria-busy','true');output.replaceChildren(element('div','empty-icon','π'),element('p','oracle-waiting','Consultando las matemáticas no escritas…'),element('p','oracle-empty-note','El departamento de destino está improvisando.'));
  oracleTimer=setTimeout(()=>{
    oracleLast=fictionalOracle(birth,today,state.digits,universe);renderOracle(oracleLast);
  },matchMedia('(prefers-reduced-motion: reduce)').matches?0:1300);
}
$('oracle-form').addEventListener('submit',event=>{event.preventDefault();if(!/^\d{4}$/.test($('oracle-year').value)){$('oracle-error').textContent='Escribe un año de cuatro dígitos.';$('oracle-error').hidden=false;return;}runOracle({day:Number($('oracle-day').value),month:Number($('oracle-month').value),year:Number($('oracle-year').value)},0);});
function renderOracle(result){
  const output=$('oracle-result');output.className='oracle-result oracle-answer';output.setAttribute('aria-busy','false');output.replaceChildren();
  output.append(element('span','fiction-badge','FECHA FICTICIA · SIN VALOR PREDICTIVO'),element('p','oracle-output-label','Tu fecha de deceso, según este alucín:'),element('h3','oracle-date',humanDate(result.target)),element('p','oracle-days',`${fmt(result.days)} días para terminar tus pendientes imaginarios.`));
  const cause=element('div','cosmic-cause');cause.append(element('span','','CAUSA CÓSMICA INVENTADA'),element('p','',cosmicCauses[Number(BigInt(result.fragment)%BigInt(cosmicCauses.length))]));output.append(cause);
  const words=element('div','last-words');words.append(element('span','','TUS ÚLTIMAS PALABRAS, SEGÚN π'),element('p','',`«${lastWords[Number((BigInt(result.fragment)/17n)%BigInt(lastWords.length))]}»`));output.append(words);
  const details=element('details',''),summary=element('summary','','Ver las matemáticas no escritas');details.append(summary,element('pre','oracle-formula',`Nacimiento MMDD AÑO: ${result.born}\n+ Hoy MMDD AÑO:      ${result.current}\n= Suma:              ${result.sum}\n\nÍndice = (suma + universo × 314159)\n         módulo (2,000,000 − 11)\nPosición en π: ${fmt(result.offset+1)}\n12 dígitos reales: ${result.fragment}\nDías = (fragmento módulo 25,550) + 1\nFecha ficticia = hoy + ${fmt(result.days)} días\n\nEsta receta es inventada. No estima longevidad.`));output.append(details);
  const actions=element('div','oracle-result-buttons'),reroll=element('button','','Otra línea temporal →'),copy=element('button','','Copiar alucín');reroll.addEventListener('click',()=>runOracle(oracleBirth,oracleUniverse+1));copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`FICCIÓN MATEMÁTICA · SIN VALOR PREDICTIVO\nπ su última voluntad inventó mi fecha de deceso: ${humanDate(result.target)}.\nCausa cósmica: ${cosmicCauses[Number(BigInt(result.fragment)%BigInt(cosmicCauses.length))]}\nUniverso ${result.universe+1}. Es una broma, no una predicción.\n${location.origin}#oracle`);toast('Alucín copiado con su etiqueta de ficción.');}catch{toast('No se pudo copiar. Selecciona el resultado en pantalla.');}});actions.append(reroll,copy);output.append(actions,element('p','oracle-universe',`UNIVERSO ${fmt(result.universe+1)} · MISMA FECHA + MISMO DÍA = MISMO ALUCÍN`));
}
loadDigits();
