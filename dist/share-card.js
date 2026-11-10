import {getOracleScene,oracleShareText} from './multiverse.js';

export function createShareModel(result,dateLabel,origin,ending=null){
  const scene=getOracleScene(result);
  if(ending&&ending.sceneKey!==`${scene.id}:${scene.variant}`)throw new Error('El final pertenece a otra escena.');
  return {
    world:scene.name,number:scene.number,accent:scene.accent,date:dateLabel,
    stamp:`SALTO ${scene.jump} · LÍNEA ${scene.visit}`,
    status:ending?.statusLabel||'EL ORÁCULO DIJO…',title:ending?.title||scene.cause,
    story:ending?.story||scene.story,words:ending?.lastWords||scene.lastWords,
    choice:ending?.label||'',url:`${origin}/#oracle`,
    text:ending?`FICCIÓN MATEMÁTICA · SIN VALOR PREDICTIVO\nSu πtmd · UNIVERSO ${scene.number} · ${scene.name}\n${ending.statusLabel}\nDecisión: ${ending.label}\n${ending.title}\n${ending.story}\n«${ending.lastWords}»\nFecha del oráculo (ficticia): ${dateLabel}\n${origin}/#oracle`:oracleShareText(result,dateLabel,origin)
  };
}

function lines(ctx,text,width){
  const output=[];
  let current='';
  for(const word of text.split(/\s+/)){
    const next=current?`${current} ${word}`:word;
    if(current&&ctx.measureText(next).width>width){output.push(current);current=word;}else current=next;
  }
  if(current)output.push(current);
  return output;
}

// Return fitted, measurable blocks. Exported so every authored ending can be checked.
export function layoutShareBody(ctx,model){
  for(let scale=1;scale>=0.64;scale-=0.04){
    let y=460;
    const blocks=[];
    for(const [text,size,weight,color,gap] of [
      [model.title,49,700,'#f5effa',26],
      [model.story,32,400,'#d8cbdc',30],
      [model.choice?`ELEGISTE: ${model.choice}`:'',23,600,model.accent,24],
      [`«${model.words}»`,32,400,'#f5effa',0]
    ]){
      if(!text)continue;
      const fontSize=Math.floor(size*scale),font=`${weight} ${fontSize}px sans-serif`,height=Math.ceil(fontSize*1.38);
      ctx.font=font;
      const wrapped=lines(ctx,text,896);
      blocks.push({lines:wrapped,font,color,y,height});
      y+=wrapped.length*height+gap;
    }
    if(y<=1078)return blocks;
  }
  throw new Error('No se pudo ajustar el texto de la tarjeta.');
}

export async function createShareCard(model){
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Tu navegador no permite crear la imagen.');
  const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#21182b');bg.addColorStop(1,'#0e1210');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
  ctx.strokeStyle=model.accent;ctx.globalAlpha=.12;ctx.lineWidth=2;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(938,180,175+i*55,95+i*32,-.5,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=1;ctx.textBaseline='top';
  const write=(text,x,y,font,color)=>{ctx.font=font;ctx.fillStyle=color;ctx.fillText(text,x,y);};
  write('Su πtmd',88,64,'700 62px sans-serif','#e4ffa7');
  write('FICCIÓN MATEMÁTICA · SIN VALOR PREDICTIVO',90,157,'600 23px sans-serif','#cab8d6');
  write(`UNIVERSO ${model.number}`,90,229,'600 24px monospace',model.accent);
  write(model.world,86,270,'700 76px sans-serif',model.accent);
  write(model.stamp,90,363,'400 22px monospace','#b8a7c3');
  ctx.fillStyle=model.accent;ctx.fillRect(90,411,900,2);
  write(model.status,90,425,'600 22px sans-serif',model.accent);
  for(const block of layoutShareBody(ctx,model))block.lines.forEach((line,index)=>write(line,90,block.y+index*block.height,block.font,block.color));
  ctx.fillStyle='#584563';ctx.fillRect(90,1113,900,1);
  write('FECHA DEL ORÁCULO (FICTICIA)',90,1141,'500 21px sans-serif','#b8a7c3');
  write(model.date,90,1175,'600 34px sans-serif',model.accent);
  write(model.url.replace(/^https?:\/\//,''),90,1262,'500 23px sans-serif','#e4ffa7');
  write('Una parodia de HecAgus. No es una predicción.',90,1301,'400 20px sans-serif','#b8a7c3');
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo exportar el PNG.')),'image/png'));
}
