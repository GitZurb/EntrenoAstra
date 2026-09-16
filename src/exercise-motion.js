import { motion3D } from "./exercise-kinematics.js";

export const STATIC_IDS = new Set(["plancha", "plancha_lateral", "sentadilla_pared"]);

// Catálogo completo: cada entrada dispone de cinemática y guía por fases.
export const EXERCISE_FIGURES = Object.fromEntries([
  "press_banca",
  "press_inclinado",
  "press_declinado",
  "press_mancuernas",
  "press_inclinado_mancuernas",
  "press_suelo",
  "aperturas",
  "flexiones",
  "flexiones_declinadas",
  "pullover",
  "remo_barra",
  "remo_mancuerna",
  "remo_apoyado",
  "peso_muerto",
  "peso_muerto_rumano",
  "remo_kettlebell",
  "encogimientos",
  "superman",
  "press_militar",
  "press_hombro_mancuernas",
  "press_arnold",
  "elevaciones_laterales",
  "elevaciones_frontales_disco",
  "pajaros",
  "remo_menton",
  "curl_barra",
  "curl_alterno",
  "curl_martillo",
  "curl_inclinado",
  "curl_concentrado",
  "press_frances",
  "extension_triceps_mancuerna",
  "fondos_banco",
  "press_cerrado",
  "patada_triceps",
  "sentadilla_frontal",
  "sentadilla_trasera",
  "sentadilla_goblet",
  "sentadilla_banco",
  "sentadilla_pared",
  "sentadilla_bulgara",
  "zancadas",
  "zancada_inversa_barra",
  "step_up",
  "sentadilla_mancuernas",
  "rdl_mancuernas",
  "hip_thrust",
  "puente_gluteo_una_pierna",
  "buenos_dias",
  "pm_una_pierna",
  "swing_kb",
  "curl_nordico",
  "gemelo_pie",
  "gemelo_una_pierna",
  "plancha",
  "plancha_lateral",
  "crunch_declinado",
  "elevacion_piernas_banco",
  "paseo_granjero",
  "russian_twist",
  "dead_bug"
].map(id => [id, { thumb: STATIC_IDS.has(id) ? 0 : 1 }]));

export function cycleAmount(progress) {
  const p=((progress%1)+1)%1;
  if(p<.12)return 0;
  if(p<.46)return (1-Math.cos(Math.PI*(p-.12)/.34))/2;
  if(p<.58)return 1;
  return (1+Math.cos(Math.PI*(p-.58)/.42))/2;
}

export function getFigure(exercise) { return EXERCISE_FIGURES[exercise.id]||EXERCISE_FIGURES[exercise.figureOf]||null; }
export function sampleMotion(exercise,amount=0) {
  if(!getFigure(exercise))return null;
  const id=EXERCISE_FIGURES[exercise.id]?exercise.id:exercise.figureOf;
  return motion3D(id,STATIC_IDS.has(id)?0:amount,exercise);
}

const GROUPS = [
 ['press_banca press_inclinado press_declinado press_mancuernas press_inclinado_mancuernas press_suelo press_cerrado', ['Empuje de pecho','Apoyos estables y carga equilibrada.','Los codos se extienden para alejar la carga del pecho.','La carga regresa de forma controlada.']],
 ['aperturas', ['Apertura de pecho','Brazos abiertos con los codos ligeramente flexionados.','Las manos describen un arco sobre el pecho.','Se abre de nuevo manteniendo la flexión del codo.']],
 ['flexiones flexiones_declinadas', ['Empuje con el cuerpo','Manos apoyadas y tronco alineado.','Los brazos extienden el cuerpo como una unidad.','Se flexionan los codos sin dejar caer la cadera.']],
 ['pullover', ['Arco de hombros','Ambas manos sujetan la mancuerna.','Los brazos se desplazan por encima de la cabeza.','Regresan al punto de partida sin forzar el hombro.']],
 ['remo_barra remo_mancuerna remo_apoyado remo_kettlebell', ['Tracción de espalda','Tronco estable y brazos extendidos.','Los codos se desplazan hacia atrás acercando la carga.','Los brazos se extienden sin girar el tronco.']],
 ['peso_muerto', ['Extensión de cadera y rodillas','Carga próxima al cuerpo y apoyos firmes.','Cadera y rodillas se extienden de forma coordinada.','Ambas articulaciones se flexionan para regresar.']],
 ['peso_muerto_rumano rdl_mancuernas buenos_dias pm_una_pierna', ['Bisagra de cadera','Tronco alineado, rodillas sin bloquear.','La cadera se desplaza atrás mientras el tronco se inclina.','La cadera vuelve adelante hasta recuperar la postura.']],
 ['encogimientos', ['Elevación de hombros','Brazos relajados a los lados.','Se elevan los hombros sin dibujar círculos.','Los hombros descienden de forma controlada.']],
 ['superman', ['Extensión de tronco','Pelvis apoyada y tronco inclinado.','El tronco recupera la línea del cuerpo.','Se vuelve a la inclinación sin hiperextender.']],
 ['press_militar press_hombro_mancuernas press_arnold', ['Empuje sobre la cabeza','Carga próxima a los hombros.','Se extienden los brazos manteniendo el tronco estable.','La carga regresa de forma controlada a los hombros.']],
 ['elevaciones_laterales pajaros', ['Apertura de hombros','Codos ligeramente flexionados.','Los brazos se abren a los lados del cuerpo.','Se cierran con control, sin impulso del tronco.']],
 ['elevaciones_frontales_disco', ['Elevación frontal','Disco sujeto con ambas manos.','Los brazos suben por delante del cuerpo.','Descienden manteniendo el tronco estable.']],
 ['remo_menton', ['Elevación de codos','Barra delante del cuerpo.','Los codos guían el ascenso de la barra.','Se vuelve al inicio sin forzar el recorrido.']],
 ['curl_barra curl_alterno curl_martillo curl_inclinado curl_concentrado', ['Flexión de codo','Brazo estable junto al tronco o al apoyo.','El antebrazo se acerca al brazo al flexionar el codo.','El codo se extiende de forma controlada.']],
 ['press_frances extension_triceps_mancuerna patada_triceps', ['Extensión de codo','Parte superior del brazo estable.','El codo se extiende sin balancear el hombro.','Se flexiona de nuevo manteniendo el brazo colocado.']],
 ['fondos_banco', ['Empuje con apoyo posterior','Manos en el banco y pies apoyados.','Se extienden los codos para elevar el cuerpo.','Se flexionan dentro de un recorrido cómodo.']],
 ['sentadilla_frontal sentadilla_trasera sentadilla_goblet sentadilla_banco sentadilla_mancuernas', ['Flexión de cadera y rodillas','Pies apoyados y carga equilibrada.','Cadera y rodillas se flexionan; los pies permanecen apoyados.','Se recupera la posición de pie de forma coordinada.']],
 ['sentadilla_pared', ['Postura isométrica','Espalda apoyada en la pared.','Se mantiene la postura con respiración normal.','Esta demostración no cuenta repeticiones.']],
 ['sentadilla_bulgara zancadas zancada_inversa_barra', ['Apoyo dividido','Apoyos separados y tronco estable.','Las rodillas se flexionan al descender el cuerpo.','Se recupera la postura manteniendo el equilibrio.']],
 ['step_up', ['Subida a una plataforma','Un pie está apoyado sobre la plataforma.','La pierna elevada se extiende para subir el cuerpo.','Se desciende de forma controlada.']],
 ['hip_thrust puente_gluteo_una_pierna', ['Elevación de pelvis','Parte superior de la espalda y pie de apoyo estables.','La cadera se eleva hasta alinearse con el tronco.','La pelvis desciende sin perder los apoyos.']],
 ['swing_kb', ['Balanceo desde la cadera','La kettlebell se sitúa entre las piernas.','La extensión de cadera acompaña el balanceo; los brazos guían.','La cadera se flexiona al regresar la kettlebell.']],
 ['curl_nordico', ['Control de la flexión de rodilla','Rodillas apoyadas y tobillos en un soporte específico.','El cuerpo se inclina conservando la alineación del tronco.','Se regresa con asistencia, sin dejarse caer.']],
 ['gemelo_pie gemelo_una_pierna', ['Elevación de talones','Antepié apoyado y equilibrio estable.','Los talones se elevan manteniendo el apoyo delantero.','Los talones descienden de forma controlada.']],
 ['plancha plancha_lateral', ['Estabilidad del tronco','Cuerpo alineado sobre los apoyos.','Se mantiene la postura respirando con normalidad.','La postura es estática: no se simulan repeticiones.']],
 ['crunch_declinado', ['Flexión de tronco','Pelvis estable sobre el apoyo.','El tronco se flexiona de forma controlada.','Regresa al apoyo sin tirar del cuello.']],
 ['elevacion_piernas_banco', ['Elevación de piernas','Tronco apoyado en el banco.','Las piernas se elevan de forma coordinada.','Descienden sin arquear la espalda.']],
 ['paseo_granjero', ['Marcha con carga','Carga equilibrada a ambos lados.','Los apoyos de los pies se alternan al caminar.','El tronco se mantiene estable durante la marcha.']],
 ['russian_twist', ['Rotación de tronco','Pelvis estable y carga cerca del cuerpo.','Hombros y manos giran juntos hacia un lado.','Se vuelve por el centro hacia el otro lado.']],
 ['dead_bug', ['Coordinación contralateral','Espalda apoyada y extremidades recogidas.','Un brazo y la pierna contraria se extienden.','Se recogen de nuevo sin arquear la espalda.']],
];
export const MOTION_GUIDES=Object.fromEntries(GROUPS.flatMap(([ids,text])=>ids.split(' ').map(id=>[id,text])));
