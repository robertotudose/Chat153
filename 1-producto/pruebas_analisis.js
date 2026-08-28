/**
 * =========================================================================
 * BANCO DE PRUEBAS DEL ANÁLISIS DE CONSULTAS
 * =========================================================================
 *     node pruebas_analisis.js
 *
 * Comprueba que una consulta acaba en el tema correcto y, sobre todo, que
 * lo que no encaja en ningún tema se queda SIN clasificar. Un tema
 * equivocado es peor que ninguno: el centro mira ese gráfico para decidir
 * qué información preparar.
 * =========================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { crearClasificador, pareceSinRespuesta } = require('./analisis_consultas');

const conocimiento = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'preguntas_frecuentes.json'), 'utf8'));
const clasificador = crearClasificador(conocimiento);

/* Cada caso es [consulta, esperado]. `null` significa «no debe clasificarla».
   Un fragmento de texto significa «el tema debe contenerlo».

   AMBIGÜEDADES CONOCIDAS, que son de la base de conocimiento y no del
   clasificador: «¿dónde se recoge el título de la ESO?» cae en Formación
   Profesional, porque «título» está tanto en las palabras clave de
   Secretaría como en «Tasas de Título Oficial» de FP. Con los datos del
   centro delante, las dos respuestas se defienden. Si molesta, se arregla
   afinando las palabras clave en preguntas_frecuentes.json, no aquí. */
const CASOS = [
  ['¿el viernes hay clase?', 'Calendario'],
  ['¿hoy hay clase o es fiesta?', 'Calendario'],
  ['la fiesta del colegio, ¿hay que venir?', 'Calendario'],
  ['¿cuándo empiezan las vacaciones de Navidad?', 'Calendario'],

  ['¿cuánto cuesta el comedor?', 'Comedor'],
  ['¿hay menú sin gluten en el comedor?', 'Comedor'],
  ['quiero dar de baja a mi hija del comedor', 'Comedor'],

  ['necesito un certificado de matrícula', 'Secretaría'],
  ['he perdido la contraseña del portal de familias', 'Secretaría'],

  ['¿cuándo se abre el plazo de admisión?', 'Admisiones'],
  ['queremos visitar el centro antes de matricular', 'Admisiones'],

  ['¿qué es el aula de madrugadores?', 'Infantil'],
  ['¿qué modalidades de bachillerato hay?', 'Bachillerato'],
  ['¿qué ciclos de formación profesional tenéis?', 'Formación Profesional'],
  ['¿cómo se domicilian los recibos?', 'Pagos'],

  // Lo que NO debe clasificarse: no hay nada de esto en la base del centro.
  // El centro no tiene NADA escrito sobre transporte. Ninguna de estas tres
  // debe clasificarse: si aparecieran bajo «Educación Primaria» solo porque
  // llevan la palabra «escolar», el gráfico del panel mentiría.
  ['¿el autobús para en Utebo por la mañana?', null],
  ['¿el autobús escolar para en Utebo por la mañana?', null],
  ['¿hay transporte escolar?', null],
  ['¿por dónde pasa la ruta escolar?', null],
  ['hola buenas tardes', null],
  ['gracias, muy amable', null],
  // Pagos, aunque la respuesta concreta no esté: el tema sí es ese.
  ['¿se puede pagar la excursión con tarjeta?', 'Pagos']
];

let fallos = 0;

console.log('');
console.log(`  Clasificador sobre ${clasificador.entradas} entradas y ${clasificador.temas.length} temas`);
console.log('  ' + '─'.repeat(74));

for (const [consulta, esperado] of CASOS) {
  const obtenido = clasificador.clasificar(consulta);
  const bien = esperado === null
    ? obtenido === null
    : Boolean(obtenido && obtenido.includes(esperado));

  if (!bien) fallos++;
  const marca = bien ? '  ok  ' : ' FALLA';
  const salida = obtenido === null ? '— sin clasificar' : obtenido;
  console.log(`${marca}  ${consulta.padEnd(48).slice(0, 48)}  ${salida}`);
  if (!bien) console.log(`         esperaba: ${esperado === null ? '— sin clasificar' : esperado}`);
}

console.log('  ' + '─'.repeat(74));
console.log(`  ${CASOS.length - fallos} de ${CASOS.length} temas correctos.`);

/* -------------------------------------------------------------------------
   ¿Se detecta cuándo el asistente en realidad no ha respondido?
   Las que empiezan por «respondió» son respuestas de verdad y NO deben
   contarse como huecos, aunque acaben derivando a secretaría.
   ------------------------------------------------------------------------- */
const RESPUESTAS = [
  ['No disponemos de información sobre las rutas del autobús escolar. Puede llamar al 900 123 456.', true],
  ['No dispongo de ese dato. Secretaría se lo puede facilitar de 9:00 a 14:00.', true],
  ['Eso no me consta, mejor pregunte en secretaría.', true],
  ['No lo sé con seguridad, prefiero no inventarlo.', true],
  ['Esa información no está publicada en la web del centro.', true],
  ['No puedo confirmar si quedan plazas; conviene llamar al centro.', true],
  ['', true],

  ['El comedor cuesta 6,20 € el día suelto y 108 € al mes.', false],
  ['El viernes es jornada especial: no hay clase ordinaria, pero hay que asistir.', false],
  ['El justificante se entrega al tutor en los tres días siguientes. Si necesita más ayuda, llame al 900 123 456.', false],
  ['No disponemos de plazas libres en 1.º de Primaria para este curso.', false],
  ['El horario de secretaría es de 9:00 a 14:00 y de 16:00 a 18:00.', false]
];

let fallosR = 0;
console.log('');
console.log('  Detección de respuestas que en realidad no responden');
console.log('  ' + '─'.repeat(74));

for (const [texto, esperado] of RESPUESTAS) {
  const obtenido = pareceSinRespuesta(texto);
  const bien = obtenido === esperado;
  if (!bien) fallosR++;
  const marca = bien ? '  ok  ' : ' FALLA';
  const etiqueta = obtenido ? 'sin respuesta' : 'respondió    ';
  console.log(`${marca}  ${etiqueta}  «${(texto || '(vacío)').slice(0, 56)}»`);
}

console.log('  ' + '─'.repeat(74));
console.log(`  ${RESPUESTAS.length - fallosR} de ${RESPUESTAS.length} detecciones correctas.`);
console.log('');
process.exit(fallos + fallosR ? 1 : 0);
