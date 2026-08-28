/**
 * =========================================================================
 * BANCO DE PRUEBAS DEL BUSCADOR LOCAL
 * =========================================================================
 * Comprueba que el nivel 2 del motor (búsqueda sin IA, coste cero) acierta
 * con la forma real en que escriben las familias: con erratas, con
 * sinónimos y con frases coloquiales.
 *
 *     node pruebas_motor.js
 *
 * Extrae las funciones puras de chat.js y las ejecuta contra la base de
 * conocimiento real, sin necesitar navegador ni servidor.
 * =========================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --- Extracción del motor desde chat.js ---
const fuente = fs.readFileSync(path.join(__dirname, 'chat.js'), 'utf8');
const inicio = fuente.indexOf('  function normalizar(');
const fin = fuente.indexOf('     4. NIVEL 3');
if (inicio === -1 || fin === -1) {
  console.error('No se ha podido localizar el motor dentro de chat.js.');
  process.exit(1);
}
const motor = fuente.slice(inicio, fuente.lastIndexOf('/*', fin));

const estado = {
  conocimiento: JSON.parse(fs.readFileSync(path.join(__dirname, 'preguntas_frecuentes.json'), 'utf8'))
};

// En modo estricto, lo que se declara dentro de eval no sale a este ámbito:
// hay que devolverlo de forma explícita con una expresión final.
const { buscarEnLocal } = eval(motor + '\n({ buscarEnLocal: buscarEnLocal })');

/**
 * Cada caso es [consulta, esperado, motivo].
 * `esperado` admite varios identificadores separados por |, y el valor
 * especial SIN_RESPUESTA cuando lo correcto es NO responder en local y
 * dejar que la consulta suba al nivel de IA.
 */
const CASOS = [
  ['comedro precio',                      'SIN_RESPUESTA',                'errata + dato que la base no contiene: debe escalar'],
  ['vacasiones de navidad',               'cal_vacaciones',               'errata en una palabra larga'],
  ['calendario escolar',                  'cal_vacaciones',               'término directo'],
  ['dias festivos del centro',            'cal_',                         'variante coloquial'],
  ['se puede faltar el dia de la fiesta',  'cal_fiesta_centro_asistencia', 'la duda más frecuente de las familias'],
  ['hay clase manana',                    'cal_',                         'consulta sobre día lectivo'],
  ['quiero apuntar a mi hijo',            'adm_',                         'sinónimo: apuntar -> matrícula'],
  ['me han devuelto el recibo del banco', 'pag_recibo_devuelto',          'lenguaje natural'],
  ['como pido un papel de notas',         'sec_certificados',             'sinónimo: papel -> certificado'],
  ['a que hora abren la secretaria',      'sec_horario_contacto',         'sinónimo: abren -> horario'],
  ['que hago si mi hijo esta enfermo',    'sec_justificar_faltas|inf_justificar_faltas', 'implícito: justificar falta'],
  ['se me ha olvidado la contrasena',     'sec_acceso_portal',            'lenguaje natural'],
  ['que estudio despues de la eso',       'orientacion_',                 'orientación académica'],
  ['el menu es apto para celiacos',       'com_menus_alergias|inf_comedor_siesta', 'alergias en el comedor'],
  ['horario de bachillerato',             'bach_horarios',                'consulta por etapa'],
  ['practicas en empresa fp',             'fp_dual_practicas',            'consulta de FP'],
  ['cuanto cuesta el autobus a marte',    'SIN_RESPUESTA',                'fuera de ámbito: no debe inventar']
];

// Puntuación por debajo de la cual la consulta escala al nivel de IA
const UMBRAL = 8;

let aciertos = 0;
console.log('\n  BANCO DE PRUEBAS DEL BUSCADOR LOCAL\n');
console.log('  ' + 'CONSULTA'.padEnd(38) + 'RESULTADO'.padEnd(32) + 'PTS   ');
console.log('  ' + '─'.repeat(78));

CASOS.forEach(function (caso) {
  const consulta = caso[0];
  const esperado = caso[1];
  const resultado = buscarEnLocal(consulta);
  const id = resultado ? resultado.pregunta.id : '—';
  const puntos = resultado ? resultado.puntuacion : 0;

  const correcto = esperado === 'SIN_RESPUESTA'
    ? (!resultado || puntos < UMBRAL)
    : esperado.split('|').some(function (e) { return id.indexOf(e) === 0; });

  if (correcto) aciertos++;
  console.log('  ' + consulta.padEnd(38) + id.slice(0, 30).padEnd(32) +
              String(puntos).padEnd(6) + (correcto ? '✓' : '✗ esperaba ' + esperado));
});

console.log('  ' + '─'.repeat(78));
console.log('  ACIERTOS: ' + aciertos + '/' + CASOS.length + '\n');

if (aciertos < CASOS.length) {
  console.log('  Recuerda: la mayoría de los fallos se corrigen añadiendo a "keywords"');
  console.log('  la forma real en que pregunta una familia, no tocando el algoritmo.\n');
  process.exit(1);
}
