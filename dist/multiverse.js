// Internal universe numbers and original parody scenes for this app.
// The dates are invented by oracle.js; none of these stories are canon.
export const ORACLE_UNIVERSES = [
  {
    id:'earth-1218',number:1,name:'Earth-1218',setting:'Nuestro mundo',
    forecast:'En Earth-1218 morirás el:',accent:'#d4b1fa',
    stories:[
      {cause:'Una reparación que solo iba a tomar cinco minutos.',story:'Fuiste por un tornillo. El informe todavía dirá «sin novedad».',lastWords:'En mi máquina sí funciona.'},
      {cause:'Una actualización que «solo tomará un minuto».',story:'El instalador llegará al 99 %. Tú también, pero de tu existencia.',lastWords:'Ahora sí ya va a terminar.'},
      {cause:'Daño colateral de tus pendientes imaginarios.',story:'Los dejaste para mañana. El calendario considerará que eso ya es demasiado optimismo.',lastWords:'Ahorita lo respaldo.'},
      {cause:'Un resbalón en una realidad sin botón de deshacer.',story:'La vida te pedirá confirmar el cambio. Le darás «Aceptar» sin leer.',lastWords:'¿Dónde está Control Z?'}
    ]
  },
  {
    id:'spider-man',number:2,name:'Spider-Man',setting:'Nueva York · Entre telarañas y daños colaterales',
    forecast:'En el universo de Spider-Man morirás el:',accent:'#ff8b9d',
    stories:[
      {cause:'El coche que Spider-Man esquivó.',story:'Morirás aplastado por el coche que Spider-Man esquivó. Él estará bien, gracias por preguntar.',lastWords:'¡A mí también, vecino!'},
      {cause:'Una entrega del Duende Verde en la calle equivocada.',story:'Confundirás una bomba calabaza con decoración de Halloween. El servicio de paquetería no aceptará devoluciones.',lastWords:'¿Esto sí se puede tocar?'},
      {cause:'Una maniobra de Doctor Octopus sin revisar los espejos.',story:'Le pedirás que quite sus tentáculos del paso peatonal. Tendrás razón, pero eso no te dará inmunidad.',lastWords:'¡Aquí tiene preferencia el peatón!'},
      {cause:'Una selfie en medio de una pelea de Spider-Man.',story:'La foto saldrá movida. El Daily Bugle publicará que todo fue culpa de Spider-Man; tú ni saldrás etiquetado.',lastWords:'Una foto y ya me voy.'}
    ]
  },
  {
    id:'dragon-ball',number:3,name:'Dragon Ball',setting:'La Tierra · Donde revivir depende de juntar las esferas',
    forecast:'En el universo de Dragon Ball morirás el:',accent:'#ffc477',
    stories:[
      {cause:'Daño colateral de una pelea de Goku.',story:'Goku necesitará comprobar si el enemigo es fuerte. Tu calle formará parte de la demostración.',lastWords:'¿Por qué empezó a sonar esa música?'},
      {cause:'Donar energía a una Genkidama con la batería al 1 %.',story:'Levantarás las manos con demasiado entusiasmo. La carga rápida no vendrá incluida.',lastWords:'Con tantito sí alcanza.'},
      {cause:'Pedirle a Vegeta que baje el ruido del entrenamiento.',story:'Técnicamente dejará de molestarte. El comité vecinal registrará el caso como resuelto.',lastWords:'¿Y si mejor peleas en otro lado?'},
      {cause:'Unas vacaciones de cinco minutos en Namek.',story:'Los cinco minutos durarán varios capítulos. Tu reservación no incluirá reembolso ni transporte de regreso.',lastWords:'Pero todavía faltan cinco minutos.'}
    ]
  }
];

export function getOracleScene(result){
  if(!Number.isInteger(result.universe)||result.universe<0)throw new Error('Salto temporal inválido.');
  if(!/^\d{12}$/.test(result.fragment))throw new Error('Fragmento de π inválido.');
  const world=ORACLE_UNIVERSES[result.universe%ORACLE_UNIVERSES.length];
  const visit=Math.floor(result.universe/ORACLE_UNIVERSES.length)+1;
  const variant=Number((BigInt(result.fragment)+BigInt(visit-1))%BigInt(world.stories.length));
  const {stories,...identity}=world;
  return {...identity,...stories[variant],variant,visit,jump:result.universe};
}

export function oracleShareText(result,dateLabel,origin){
  const scene=getOracleScene(result);
  return `FICCIÓN MATEMÁTICA · SIN VALOR PREDICTIVO\nπde otra vida · UNIVERSO ${scene.number} · ${scene.name}\nTu fecha está en π. Tu final está por verse.\n${scene.forecast} ${dateLabel}\nCausa inventada: ${scene.cause}\n${scene.story}\nÚltimas palabras: «${scene.lastWords}»\nSalto ${scene.jump} · Línea ${scene.visit}. Es una broma, no una predicción.\n${origin}#oracle`;
}
