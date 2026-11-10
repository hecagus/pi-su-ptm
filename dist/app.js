import {DECIMAL_COUNT,EXPANDED_DECIMAL_COUNT,DEFAULT_DATE_ORDER,MONTHS,pad,isValidDate,flexibleDateSequence,findMatches,getExcerpt} from './core.js';
import {dateParts,validateBirth,fictionalOracle} from './oracle.js';
import {ORACLE_UNIVERSES,getOracleScene} from './multiverse.js';
import {getDestinyChallenge,chooseDestiny,normalizeEndings,unlockEnding,ENDING_COUNT,ENDING_STORAGE_KEY} from './destiny.js';
import {createShareModel,createShareCard} from './share-card.js';
import {startVoyage} from './voyage.js';
const $=id=>document.getElementById(id);
const numberFormat=new Intl.NumberFormat('es-MX');
const fmt=n=>numberFormat.format(n);
const state={mode:'birth',digits:'',matches:[],current:0,sequence:'',description:'',loaded:false,edited:false};
let activeVoyage=null;
const modes={
  birthday:{title:'El día que empezó todo.',description:'Día y mes. El año aquí no se mete.',format:'en formato DDMM'},
  birth:{title:'Pon tu día. Tu mes. Tu año.',description:'Buscamos día, mes y año completo, en ese orden.',format:'en formato DDMMAAAA'},
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
$('date-order').value=DEFAULT_DATE_ORDER;

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
  $('search-label').textContent=state.loaded?'Buscar mi número en π':'Cargando 10 millones…';
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

function refreshDatasetStatus(){
  $('dataset-status').textContent=`${fmt(state.digits.length)} decimales · Búsqueda local`;
}

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
    const empty=element('div','result-empty');empty.append(element('div','empty-icon','∞'),element('h2','','Todavía no apareció.'),element('p','empty-sequence',state.sequence),element('p','',`No está en los ${fmt(state.digits.length)} decimales que buscamos. El resto de π sigue siendo otra historia.`));
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
  content.append(element('p','result-caption',`${fmt(state.matches.length)} ${state.matches.length===1?'coincidencia encontrada':'coincidencias encontradas'} en ${fmt(state.digits.length)} decimales.`));
  const replay=element('button','replay-button','↻ Repetir viaje desde 3.14159…');replay.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)journey();else toast('El recorrido respeta tu preferencia de movimiento reducido.');});content.append(replay);
  $('match-counter').textContent=`${fmt(state.current+1)} / ${fmt(state.matches.length)}`;
  $('previous-match').disabled=state.matches.length<2;$('next-match').disabled=state.matches.length<2;
  $('copy-label').textContent='Copiar resultado';
}
$('previous-match').addEventListener('click',()=>{state.current=(state.current-1+state.matches.length)%state.matches.length;renderResult();});
$('next-match').addEventListener('click',()=>{state.current=(state.current+1)%state.matches.length;renderResult();});

function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
$('copy-result').addEventListener('click',async()=>{
  const text=`${state.description} (${state.sequence}) aparece en la posición ${fmt(state.matches[state.current]+1)} de los decimales de π. Encontré ${fmt(state.matches.length)} ${state.matches.length===1?'coincidencia':'coincidencias'} en los primeros ${fmt(state.digits.length)} decimales. — Su πtmd · ${location.origin}`;
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
  const controller=new AbortController();
  $('result-panel').setAttribute('aria-busy','true');$('result-status').textContent='CARGANDO';
  const loading=element('div','result-loading'),progress=element('p','','Cargando 10 millones de decimales…');
  loading.append(element('span','loading-pi','π'),element('h2','','Desenrollando el infinito…'),progress);
  $('result-content').replaceChildren(loading);
  $('search-label').textContent='Cargando 10 millones…';
  let loaded=0;
  try{
    const paths=['./pi-digits.txt',...Array.from({length:EXPANDED_DECIMAL_COUNT/DECIMAL_COUNT-1},(_,i)=>`./pi-chunks/${String(i+1).padStart(2,'0')}.txt`)];
    const blocks=await Promise.all(paths.map(async(path,index)=>{
      const response=await fetch(path,{signal:controller.signal});
      if(!response.ok)throw new Error('No se pudo cargar la secuencia.');
      const block=await response.text();
      if(block.length!==DECIMAL_COUNT||!/^[0-9]+$/.test(block))throw new Error('La secuencia no llegó completa.');
      if(index===0&&!block.startsWith('14159265358979323846264338327950288419716939937510'))throw new Error('La secuencia no es válida.');
      loaded+=block.length;
      progress.textContent=`${fmt(loaded)} de ${fmt(EXPANDED_DECIMAL_COUNT)} decimales cargados…`;
      return block;
    }));
    const digits=blocks.join('');
    if(digits.length!==EXPANDED_DECIMAL_COUNT)throw new Error('La secuencia no llegó completa.');
    state.digits=digits;state.loaded=true;
    $('search-button').disabled=false;$('random-button').disabled=false;$('oracle-submit').disabled=false;$('search-label').textContent='Buscar mi número en π';refreshDatasetStatus();
    $('result-panel').setAttribute('aria-busy','false');$('result-status').textContent='LISTO PARA BUSCAR';
    const ready=element('div','result-loading');ready.append(element('span','loading-pi','π'),element('h2','','Tu fecha está a un viaje de distancia.'),element('p','','10 millones de decimales listos. Pon día, mes y año.'));$('result-content').replaceChildren(ready);
  }catch(error){
    controller.abort();
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
  const world=ORACLE_UNIVERSES[universe%ORACLE_UNIVERSES.length];
  const output=$('oracle-result');output.className='oracle-result oracle-consulting';output.style.setProperty('--world-accent',world.accent);output.setAttribute('aria-busy','true');output.replaceChildren(element('div','empty-icon','π'),element('p','oracle-waiting',`Abriendo portal a ${world.name}…`),element('p','oracle-empty-note','El departamento de destino está improvisando.'));
  oracleTimer=setTimeout(()=>{
    oracleLast=fictionalOracle(birth,today,state.digits.slice(0,DECIMAL_COUNT),universe);renderOracle(oracleLast);
  },matchMedia('(prefers-reduced-motion: reduce)').matches?0:1300);
}
$('oracle-form').addEventListener('submit',event=>{event.preventDefault();if(!/^\d{4}$/.test($('oracle-year').value)){$('oracle-error').textContent='Escribe un año de cuatro dígitos.';$('oracle-error').hidden=false;return;}runOracle({day:Number($('oracle-day').value),month:Number($('oracle-month').value),year:Number($('oracle-year').value)},0);});

let endings=[],canSaveEndings=true,cardFile=null,cardUrl=null;
try{endings=normalizeEndings(JSON.parse(localStorage.getItem(ENDING_STORAGE_KEY)||'[]'));}catch{canSaveEndings=false;}

function renderDestinyGame(result,onEnding){
  const game=element('section','destiny-game'),challenge=getDestinyChallenge(result);
  game.setAttribute('aria-label','Evita tu destino');
  function play(focus=false){
    onEnding(null);
    game.replaceChildren(element('span','destiny-eyebrow','MINIJUEGO · TU DECISIÓN CAMBIA EL RELATO'),element('h4','','Evita tu destino'),element('p','destiny-prompt','π ya improvisó tu final. ¿Qué vas a hacer?'));
    const choices=element('div','destiny-choices');
    challenge.choices.forEach((choice,index)=>{
      const button=element('button','destiny-choice');button.type='button';
      const number=element('span','',`0${index+1}`);number.setAttribute('aria-hidden','true');
      button.append(number,element('span','',choice.label));
      button.addEventListener('click',()=>finish(choice.id));choices.append(button);
    });
    game.append(choices,progress());
    if(focus)choices.querySelector('button').focus();
  }
  function progress(){
    return element('p','destiny-progress',`${endings.length} / ${ENDING_COUNT} finales descubiertos · ${canSaveEndings?'Guardados en este navegador.':'Disponibles en esta pestaña.'}`);
  }
  function finish(choiceId){
    const ending=chooseDestiny(result,choiceId),isNew=!endings.includes(ending.endingId);
    endings=unlockEnding(endings,ending.endingId);
    try{localStorage.setItem(ENDING_STORAGE_KEY,JSON.stringify(endings));canSaveEndings=true;}catch{canSaveEndings=false;}
    onEnding(ending);
    const title=element('h5','destiny-ending-title',ending.title);title.tabIndex=-1;
    game.replaceChildren(element('span','destiny-eyebrow',ending.statusLabel),title,element('p','destiny-ending-story',ending.story),element('p','destiny-ending-words',`«${ending.lastWords}»`),element('p','destiny-unlocked',isNew?'✦ Final nuevo desbloqueado':'Este final ya está en tu colección.'));
    const buttons=element('div','destiny-ending-actions'),replay=element('button','','Probar otra decisión');
    replay.type='button';replay.addEventListener('click',()=>play(true));buttons.append(replay);
    if(ending.status==='portal'){
      const portal=element('button','','Cruzar al siguiente universo →');portal.type='button';
      portal.addEventListener('click',()=>runOracle(oracleBirth,result.universe+1));buttons.append(portal);
    }
    game.append(buttons,progress(),element('p','destiny-fiction','Final de ficción. La fecha del oráculo conserva su fórmula; tu decisión cambia la historia.'));
    title.focus();
  }
  play();return game;
}

$('card-close').addEventListener('click',()=>$('card-dialog').close());
$('card-dialog').addEventListener('close',()=>{if(cardUrl)URL.revokeObjectURL(cardUrl);cardUrl=null;cardFile=null;$('card-preview').removeAttribute('src');});
$('card-download').addEventListener('click',()=>{
  if(!cardUrl||!cardFile)return;
  const link=document.createElement('a');link.href=cardUrl;link.download=cardFile.name;document.body.append(link);link.click();link.remove();
});
$('card-share').addEventListener('click',async()=>{
  if(!cardFile)return;
  try{await navigator.share({files:[cardFile],title:'Su πtmd · Mi destino ficticio'});}catch(error){if(error.name!=='AbortError')$('card-status').textContent='No se pudo compartir. Puedes descargar el PNG y enviarlo desde tu galería.';}
});
async function openShareCard(result,ending,button){
  button.disabled=true;button.textContent='Creando tarjeta…';
  try{
    const model=createShareModel(result,humanDate(result.target),location.origin,ending),blob=await createShareCard(model);
    cardFile=new File([blob],`su-pitmd-universo-${model.number}.png`,{type:'image/png'});
    cardUrl=URL.createObjectURL(blob);$('card-preview').src=cardUrl;
    $('card-preview').alt=`Tarjeta de ficción de ${model.world}. ${model.status}: ${model.title}. ${model.story} «${model.words}». Fecha ficticia: ${model.date}.`;
    $('card-share').hidden=!(navigator.share&&navigator.canShare?.({files:[cardFile]}));
    $('card-status').textContent=$('card-share').hidden?'Descarga la imagen para enviarla desde tu galería.':'Lista para compartir como imagen o descargar.';
    $('card-dialog').showModal();
  }catch{toast('No se pudo crear la tarjeta. Puedes usar «Copiar alucín».');}
  finally{button.disabled=false;button.textContent='Crear tarjeta para compartir';}
}

function renderOracle(result){
  let activeEnding=null;
  const scene=getOracleScene(result);
  const output=$('oracle-result');output.className='oracle-result oracle-answer';output.setAttribute('aria-busy','false');output.style.setProperty('--world-accent',scene.accent);output.replaceChildren();
  output.append(element('span','fiction-badge','FECHA FICTICIA · SIN VALOR PREDICTIVO'));
  const world=element('div','oracle-world');
  world.append(element('span','oracle-world-number',`UNIVERSO ${scene.number}`),element('h3','oracle-world-name',scene.name),element('p','oracle-world-setting',scene.setting));output.append(world);
  output.append(element('p','oracle-output-label',scene.forecast),element('h4','oracle-date',humanDate(result.target)),element('p','oracle-days',`${fmt(result.days)} días para terminar tus pendientes imaginarios.`));
  const cause=element('div','cosmic-cause');cause.append(element('span','','TU DESENLACE EN ESTE UNIVERSO'),element('p','oracle-cause-title',scene.cause),element('p','oracle-story',scene.story));output.append(cause);
  const words=element('div','last-words');words.append(element('span','','TUS ÚLTIMAS PALABRAS, SEGÚN π'),element('p','',`«${scene.lastWords}»`));output.append(words);
  output.append(renderDestinyGame(result,ending=>{activeEnding=ending;}));
  const card=element('button','destiny-card-button','Crear tarjeta para compartir');card.type='button';card.addEventListener('click',()=>openShareCard(result,activeEnding,card));output.append(card);
  const details=element('details',''),summary=element('summary','','Ver las matemáticas no escritas');details.append(summary,element('pre','oracle-formula',`Nacimiento MMDD AÑO: ${result.born}\n+ Hoy MMDD AÑO:      ${result.current}\n= Suma:              ${result.sum}\n\nSalto temporal: ${result.universe}\nUniverso de la app: ${scene.number} · ${scene.name}\nÍndice = (suma + salto × 314159)\n         módulo (2,000,000 − 11)\nPosición en π: ${fmt(result.offset+1)}\n12 dígitos reales: ${result.fragment}\nDías = (fragmento módulo 25,550) + 1\nFecha ficticia = hoy + ${fmt(result.days)} días\n\nEsta receta es inventada. No estima longevidad.`));output.append(details);
  const actions=element('div','oracle-result-buttons'),reroll=element('button','','Otra línea temporal →'),copy=element('button','','Copiar alucín');
  reroll.addEventListener('click',()=>runOracle(oracleBirth,oracleUniverse+1));
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(createShareModel(result,humanDate(result.target),location.origin,activeEnding).text);toast('Universo y alucín copiados con su etiqueta de ficción.');}catch{toast('No se pudo copiar. Selecciona el resultado en pantalla.');}});
  actions.append(reroll,copy);output.append(actions);
  if(result.universe>0){const home=element('button','oracle-return','↶ Volver a Earth-1218');home.addEventListener('click',()=>runOracle(oracleBirth,0));output.append(home);}
  output.append(element('p','oracle-universe',`SALTO ${fmt(scene.jump)} · LÍNEA ${fmt(scene.visit)} · RESULTADO REPRODUCIBLE`),element('p','oracle-parody-note','La numeración es de esta app. Los relatos son parodias inventadas, no historias oficiales.'));
}

loadDigits();
