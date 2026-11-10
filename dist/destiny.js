import {getOracleScene} from './multiverse.js';

// Each group follows the matching story in multiverse.js. No randomness or API.
const option=(id,label,status,title,story,lastWords)=>({id,label,status,title,story,lastWords});
export const DESTINY_CHALLENGES={
  'earth-1218':[
    [
      option('manual','Leer el manual','escape','El técnico sí leyó el manual.','Desconectaste la corriente antes de meter la mano. Sobreviviste; el tornillo sigue sobrando.','Cinco minutos, pero con procedimiento.'),
      option('improvisar','Puentearlo con un clip','defeat','El clip no tenía certificación.','El equipo volvió a encender. Tú quedaste fuera del contrato de mantenimiento.','Así lo vi en un tutorial.'),
      option('ticket','Abrir un ticket','portal','Escalado a otra dimensión.','Soporte transfirió tu caso a otro universo. Sigues vivo, pero ahora necesitas otro número de folio.','¿Me repites el número de reporte?')
    ],
    [
      option('esperar','Esperar sin tocar nada','escape','Sobreviviste al 99 %.','La actualización terminó ocho horas después. El único deceso fue el de tu productividad.','Sí era cuestión de paciencia.'),
      option('apagar','Desconectar en pleno reinicio','defeat','Error fatal, bastante literal.','El sistema pidió no apagar el equipo. Decidiste comprobar si también era una amenaza.','¿Y si lo vuelvo a conectar?'),
      option('reiniciar','Reiniciar la realidad','portal','Restauración en otro universo.','El punto de restauración estaba en otra dimensión. Tus archivos no, pero tú sí llegaste.','Al menos ya cambió la pantalla.')
    ],
    [
      option('resolver','Resolver un pendiente hoy','escape','Mañana perdió su primera batalla.','Terminaste una sola tarea. El calendario quedó tan sorprendido que te concedió seguir con vida.','Una menos. Faltan novecientas.'),
      option('posponer','Posponer todo otra vez','defeat','El mañana se quedó sin cupo.','La lista alcanzó masa crítica. La última notificación decía «ya para qué».','El lunes sin falta.'),
      option('delegar','Delegarlo a mi otro yo','portal','El pendiente cambió de universo.','Tu otro yo aceptó la tarea a cambio de que fueras a ayudarle. Sobrevivir también tiene letra chiquita.','¿También aquí hay juntas?')
    ],
    [
      option('pasamanos','Agarrarme del pasamanos','escape','La física aceptó tu apelación.','Te sostuviste antes de caer. No fue épico, pero tu dignidad tiene garantía limitada.','Nadie vio eso, ¿verdad?'),
      option('deshacer','Buscar Control Z','defeat','No había historial de cambios.','Intentaste deshacer la caída. La gravedad opera sin interfaz y no respondió al atajo.','Falta el teclado.'),
      option('portal','Caer dentro del portal','portal','Caída con cambio de domicilio.','Aterrizaste vivo en otra dimensión. El portal no incluyó traslado de muebles.','¿Aquí también se paga renta?')
    ]
  ],
  'spider-man':[
    [
      option('correr','Correr hacia el portal','portal','Vivo, pero en la dimensión equivocada.','El coche pasó de largo. Tú cruzaste un portal que definitivamente no estaba en Google Maps.','¿Esta sí es mi Nueva York?'),
      option('atrapar','Intentar atrapar el coche','defeat','Te confundiste de protagonista.','Confundiste protagonismo con resistencia estructural. El coche no compartió tu entusiasmo.','En las películas sí pueden.'),
      option('grabar','Grabarlo para las redes','defeat','Un éxito que no vas a revisar.','El video consiguió millones de vistas. El coche consiguió tu ubicación exacta.','Esto se va a hacer viral.')
    ],
    [
      option('soltar','Soltar la calabaza y alejarme','escape','Hoy no hubo truco ni trato.','Te alejaste del paquete. El Duende Verde dejó una reseña de una estrella por falta de compromiso.','Yo ni pedí envío exprés.'),
      option('abrir','Abrir el regalo','defeat','Entrega confirmada.','El regalo explotó antes de que encontraras la tarjeta. La garantía solo cubría la caja.','Qué detallazo.'),
      option('devolver','Devolverla por el portal','portal','Devolución con pasajero.','La calabaza volvió al remitente. El portal también se llevó al repartidor: tú.','¿Quién firma de recibido?')
    ],
    [
      option('esperar','Dejar pasar los tentáculos','escape','La paciencia ganó el cruce.','Esperaste detrás de la esquina. Doctor Octopus destruyó el semáforo, pero respetó tu distancia por accidente.','Cruzo en el siguiente verde.'),
      option('reclamar','Exigir mi preferencia peatonal','defeat','Tenías razón y cero blindaje.','Le citaste el reglamento a un hombre con cuatro brazos mecánicos. La multa quedó pendiente.','¡Está pintado en el piso!'),
      option('metro','Tomar el metro dimensional','portal','Próxima estación: otra realidad.','Bajaste al metro para evitar la pelea. El mapa de líneas tenía una dimensión de más.','¿Esta línea transborda con la mía?')
    ],
    [
      option('guardar','Guardar el teléfono y cubrirme','escape','Fuera de cuadro, dentro de la vida.','Te refugiaste a tiempo. No hay foto, pero tampoco hace falta una colecta.','Lo importante es que no rompí la pantalla.'),
      option('selfie','Acercarme por una mejor selfie','defeat','La última foto salió movida.','La cámara te enfocó. El villano también. El filtro no corrigió el daño colateral.','Nomás que se vea Spider-Man.'),
      option('filtro','Activar el filtro dimensional','portal','El filtro era demasiado real.','Tocaste un filtro que decía «otro mundo». La aplicación cumplió exactamente lo prometido.','Eso no venía en los permisos.')
    ]
  ],
  'dragon-ball':[
    [
      option('refugio','Alejarme de la pelea','escape','Por una vez no miraste el combate.','Saliste del radio de la explosión. Tu casa no tuvo tanta iniciativa, pero eso ya es otro trámite.','¿El seguro cubre saiyajines?'),
      option('intervenir','Decirles que se calmen','defeat','Mediación con pésimo resultado.','Te metiste entre dos ataques para pedir diálogo. Ninguno traía activado el control de daños.','Hablando se entiende la gente.'),
      option('teletransportar','Pedir una teletransportación','portal','Te salvaron con destino pendiente.','Goku te sacó de la explosión. Olvidó preguntarte a qué universo querías ir.','Dije lejos, no tanto.')
    ],
    [
      option('descansar','Bajar las manos y descansar','escape','Conservaste tu último uno por ciento.','Goku reunió energía por otro lado. Tú descubriste que también se puede apoyar desde una silla.','Mi aportación fue moral.'),
      option('donar','Dar hasta la última energía','defeat','Batería agotada. Sin cargador.','La Genkidama salió espectacular. Tu indicador de energía no volvió a aparecer.','Todavía aguanto tantito.'),
      option('recargar','Buscar carga en otro universo','portal','Adaptador universal, casi.','Encontraste un enchufe dimensional. Te recargó la energía y te cambió la realidad de paso.','¿Aquí de cuánto es el voltaje?')
    ],
    [
      option('mudarse','Irme a una zona tranquila','escape','Sobrevivió el vecino prudente.','Te alejaste del entrenamiento. El ruido seguía llegando, pero los escombros ya no.','Mejor desde aquí le bajo al volumen.'),
      option('queja','Insistir con la queja vecinal','defeat','Queja resuelta por demolición.','Vegeta prometió terminar con el problema de ruido. La solución incluyó toda la cuadra.','Traigo las firmas de los vecinos.'),
      option('esferas','Pedirle a Shenlong otra dirección','portal','Cambio de domicilio concedido.','Pediste vivir lejos del ruido. Shenlong interpretó «lejos» en unidades de universos.','La próxima vez redacto mejor el deseo.')
    ],
    [
      option('salir','Tomar la primera nave disponible','escape','Saliste antes del siguiente capítulo.','No esperaste a que acabaran los cinco minutos. La nave no tenía equipaje de mano, pero sí futuro.','Las maletas se quedan.'),
      option('esperar','Esperar los cinco minutos','defeat','El tiempo narrativo no te cubrió.','Esperaste otros siete capítulos. Namek no esperó a que terminara la temporada.','Todavía me da tiempo de comer.'),
      option('agencia','Reclamar a la agencia dimensional','portal','Vacaciones reubicadas.','La agencia te ofreció otra realidad en lugar del reembolso. Aceptaste antes de escuchar más explosiones.','Con que no sea Namek otra vez.')
    ]
  ]
};

const endingIds=new Set(Object.entries(DESTINY_CHALLENGES).flatMap(([world,stories])=>stories.flatMap((choices,variant)=>choices.map(choice=>`${world}:${variant}:${choice.id}`))));
export const ENDING_COUNT=endingIds.size;
export const ENDING_STORAGE_KEY='su-pitmd:endings:v1';
export const STATUS_LABELS={escape:'DESTINO EVITADO',portal:'ESCAPASTE A OTRA REALIDAD',defeat:'EL DESTINO GANÓ ESTA RONDA'};

export function getDestinyChallenge(result){
  const scene=getOracleScene(result);
  return {key:`${scene.id}:${scene.variant}`,choices:DESTINY_CHALLENGES[scene.id][scene.variant].map(({id,label})=>({id,label}))};
}
export function chooseDestiny(result,choiceId){
  const scene=getOracleScene(result),key=`${scene.id}:${scene.variant}`;
  const choice=DESTINY_CHALLENGES[scene.id][scene.variant].find(item=>item.id===choiceId);
  if(!choice)throw new Error('Esa decisión no pertenece a esta escena.');
  return {...choice,sceneKey:key,endingId:`${key}:${choice.id}`,statusLabel:STATUS_LABELS[choice.status]};
}
export function normalizeEndings(value){
  return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&endingIds.has(id)))]:[];
}
export function unlockEnding(collection,endingId){
  return normalizeEndings([...normalizeEndings(collection),endingId]);
}
