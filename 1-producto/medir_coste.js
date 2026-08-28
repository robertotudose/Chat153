/**
 * =========================================================================
 * CUÁNTO CUESTA UNA CONSULTA
 * =========================================================================
 *     node medir_coste.js        (o npm run coste)
 *
 * Arma el prompt real que se le manda al modelo y lo desglosa, para que la
 * cifra de `4-negocio/datos-negocio.json` no se quede vieja cada vez que
 * se le añade algo al contexto. No llama a la API: no gasta nada.
 *
 * El recuento de tokens es una aproximación (3,7 caracteres por token en
 * español). Sirve para comparar y para dimensionar, no para facturar.
 * =========================================================================
 */

'use strict';

const fs = require('fs'), path = require('path');
const dir = __dirname;
const fuente=fs.readFileSync(path.join(dir,'servidor_ia.js'),'utf8');
const CONFIG=JSON.parse(fs.readFileSync(path.join(dir,'configuracion_centro.json'),'utf8'));
const CONOCIMIENTO=JSON.parse(fs.readFileSync(path.join(dir,'preguntas_frecuentes.json'),'utf8'));
let RESPUESTAS_CENTRO=[];
try{ const {DatabaseSync}=require('node:sqlite'); const bd=new DatabaseSync(path.join(dir,'datos.db'));
  RESPUESTAS_CENTRO=bd.prepare('SELECT pregunta,texto FROM respuestas_centro WHERE activa=1').all(); }catch(e){}

const ini=fuente.indexOf('function resumirCalendario()');
const fin=fuente.indexOf('/* =========================================================================\n   5. LLAMADA AL MODELO');
const bloque=fuente.slice(ini,fin);
const api=new Function('CONFIG','CONOCIMIENTO','RESPUESTAS_INICIALES','crearClasificador','bd','ID_CENTRO', bloque.replace('let RESPUESTAS_CENTRO = [];','let RESPUESTAS_CENTRO = RESPUESTAS_INICIALES;') +
  '; return {construirInstruccionSistema, resumirCalendario, resumirConocimiento, resumirRespuestasCentro};')(CONFIG,CONOCIMIENTO,RESPUESTAS_CENTRO,require('./analisis_consultas').crearClasificador,null,'x');

const tok = t => Math.round(String(t).length/3.7);   // aproximación para español
const PREGUNTAS=['¿el viernes hay clase?','¿cuánto cuesta el comedor?','necesito un certificado de matrícula','¿cuándo se abre el plazo de admisión?','¿hay menú sin gluten?'];

const ENTRADA_USD_MILLON = 0.10;   // Gemini Flash-Lite
const SALIDA_USD_MILLON = 0.40;
const SALIDA_TOKENS = 328;          // medido, en datos-negocio.json
const LLAMADAS_MES = 800;           // 2.000 conversaciones, 40 % llegan a la IA

console.log('');
console.log('  QUÉ SE MANDA AL MODELO EN CADA CONSULTA');
console.log('  ' + '-'.repeat(64));
const cal = api.resumirCalendario();
console.log('  calendario del centro                ', String(tok(cal)).padStart(5), 'tokens');
let sumaCon = 0, sumaResp = 0, sumaTot = 0;
for (const p of PREGUNTAS) {
  sumaCon += tok(api.resumirConocimiento(p));
  sumaResp += tok(api.resumirRespuestasCentro(p));
  sumaTot += tok(api.construirInstruccionSistema('general', p));
}
const n = PREGUNTAS.length;
const con = Math.round(sumaCon / n), resp = Math.round(sumaResp / n), total = Math.round(sumaTot / n);
console.log('  conocimiento elegido (media)         ', String(con).padStart(5), 'tokens');
console.log('  respuestas del centro (media)        ', String(resp).padStart(5), 'tokens');
console.log('  reglas, contacto y armazón           ', String(total - con - resp - tok(cal)).padStart(5), 'tokens');
console.log('  ' + '-'.repeat(64));
console.log('  entrada por consulta                 ', String(total).padStart(5), 'tokens');
console.log('  salida por consulta (medido)         ', String(SALIDA_TOKENS).padStart(5), 'tokens');

const usdMes = (total * LLAMADAS_MES * ENTRADA_USD_MILLON + SALIDA_TOKENS * LLAMADAS_MES * SALIDA_USD_MILLON) / 1e6;
console.log('');
console.log('  A ' + LLAMADAS_MES + ' llamadas al mes (un centro con 2.000 conversaciones):');
console.log('    coste de API           ' + usdMes.toFixed(2) + ' $/mes  ≈  ' + (usdMes * 0.92).toFixed(2) + ' €/mes');
console.log('    presupuestado           2,00 €/mes por centro');
console.log('    se cobra              140-149 €/mes por centro');
console.log('');
console.log('  El coste de IA es el ' + (usdMes * 0.92 / 145 * 100).toFixed(2) + ' % del precio. No es ahí donde');
console.log('  está el dinero de este negocio.');
console.log('');
