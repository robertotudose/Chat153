/**
 * =========================================================================
 * ANÁLISIS DE CONSULTAS
 * =========================================================================
 * Dos cosas que el panel del centro necesita saber de cada consulta:
 * de qué habla y si de verdad se respondió.
 *
 * PARA QUÉ: el panel del centro enseña a la dirección de qué le preguntan
 * las familias. Esa información solo sirve si el tema es el correcto, así
 * que aquí importa MÁS no equivocarse que clasificarlo todo. Ante la duda
 * devuelve null y la consulta se queda «sin clasificar», que es la verdad.
 *
 * Vive en su propio archivo, y no dentro del servidor, porque es una
 * función pura y se puede probar sola: `node pruebas_temas.js`.
 * =========================================================================
 */

'use strict';

/* Palabras de más de tres letras que aparecen en cualquier pregunta y no
   dicen de qué va. Sin esta lista, «¿el autobús para en Utebo por la
   mañana?» acababa clasificada como Calendario por el «mañana». */
const VACIAS = new Set([
  'para', 'pero', 'como', 'cuando', 'donde', 'desde', 'hasta', 'entre', 'sobre',
  'esta', 'este', 'esto', 'estos', 'estas', 'esos', 'esas', 'eso', 'esa',
  'tiene', 'tienen', 'tengo', 'hacer', 'hace', 'puede', 'pueden', 'puedo',
  'quien', 'cual', 'cuales', 'cuanto', 'cuanta', 'cuantos', 'cuantas',
  'todo', 'toda', 'todos', 'todas', 'tambien', 'mismo', 'misma', 'otro', 'otra',
  'ahora', 'luego', 'antes', 'despues', 'manana', 'tarde', 'noche',
  'hola', 'buenas', 'buenos', 'gracias', 'favor', 'porque', 'aqui', 'alli',
  'necesito', 'quiero', 'saber', 'decir', 'poder', 'seria', 'serian',
  'algo', 'alguna', 'alguno', 'algun', 'algunas', 'algunos', 'nada',
  'centro', 'colegio', 'instituto'
]);

function normalizarTexto(texto) {
  return String(texto).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* Los títulos los escribe el centro y suelen llevar emoji delante. En una
   columna de datos eso estorba. */
function limpiarTitulo(titulo) {
  return String(titulo || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ').trim();
}

function tokenizar(texto) {
  return Array.from(new Set(
    normalizarTexto(texto).split(' ').filter((t) => t.length > 3 && !VACIAS.has(t))
  ));
}

/**
 * Construye un clasificador sobre una base de conocimiento concreta.
 *
 * El índice se hace con el TÍTULO de la categoría, la PREGUNTA y las
 * PALABRAS CLAVE. Deliberadamente NO entra el texto de la respuesta: las
 * respuestas son largas y se mencionan unas a otras, así que con ellas
 * dentro todo casaba con todo y «¿cuánto cuesta el comedor?» acababa en
 * Educación Infantil.
 */
function crearClasificador(conocimiento, opciones) {
  const ajustes = Object.assign({ minimo: 2.4, premioPorEntrada: 0.3, margen: 0.15 }, opciones || {});

  const entradas = [];
  const porId = new Map();

  for (const categoria of (conocimiento && conocimiento.categorias) || []) {
    const titulo = limpiarTitulo(categoria.titulo);
    porId.set(categoria.id, titulo);
    for (const pregunta of categoria.preguntas || []) {
      entradas.push({
        tema: titulo,
        tokens: new Set(tokenizar(
          [titulo, pregunta.pregunta, (pregunta.keywords || []).join(' ')].join(' ')))
      });
    }
  }

  /* Peso por rareza: una palabra que sale en dos entradas de cuarenta
     señala algo; una que sale en treinta, no. */
  const enCuantas = new Map();
  for (const e of entradas) {
    for (const t of e.tokens) enCuantas.set(t, (enCuantas.get(t) || 0) + 1);
  }
  const total = Math.max(1, entradas.length);
  const peso = new Map();
  for (const [t, veces] of enCuantas) peso.set(t, Math.log(total / veces));

  function pesoDe(token) {
    if (peso.has(token)) return peso.get(token);
    /* La consulta puede traer la palabra en singular o algo más larga
       («comedores», «matriculas»). Se acepta la coincidencia por prefijo,
       con una pequeña penalización por no ser exacta. */
    let mejor = 0;
    for (const [t, p] of peso) {
      if ((t.length >= 5 && token.startsWith(t.slice(0, 5))) ||
          (token.length >= 5 && t.startsWith(token.slice(0, 5)))) {
        mejor = Math.max(mejor, p * 0.85);
      }
    }
    return mejor;
  }

  function clasificar(mensaje, idCategoria) {
    if (idCategoria && porId.has(idCategoria)) return porId.get(idCategoria);

    const consulta = tokenizar(mensaje || '');
    if (!consulta.length) return null;

    const pesos = new Map();
    for (const token of consulta) pesos.set(token, pesoDe(token));

    const porTema = new Map();
    for (const entrada of entradas) {
      let puntos = 0;
      for (const token of consulta) {
        if (!pesos.get(token)) continue;
        for (const t of entrada.tokens) {
          if (t === token || t.includes(token) || token.includes(t)) {
            puntos += pesos.get(token);
            break;
          }
        }
      }
      if (!puntos) continue;
      const acumulado = porTema.get(entrada.tema) || { mejor: 0, entradas: 0 };
      acumulado.mejor = Math.max(acumulado.mejor, puntos);
      acumulado.entradas++;
      porTema.set(entrada.tema, acumulado);
    }

    /* Que varias entradas de la misma categoría respondan a la consulta es
       señal de que el tema es ese, no de que la categoría sea grande: el
       premio es pequeño a propósito. */
    const orden = Array.from(porTema.entries())
      .map(([tema, dato]) => ({ tema, nota: dato.mejor + ajustes.premioPorEntrada * (dato.entradas - 1) }))
      .sort((a, b) => b.nota - a.nota);

    if (!orden.length || orden[0].nota < ajustes.minimo) return null;

    /* Empate técnico entre dos categorías: la palabra que ha casado es de
       relleno y está repartida por media base. «¿hay transporte escolar?»
       empataba Primaria y Calendario por el «escolar», y el centro no tiene
       nada escrito sobre transporte. Antes que colgarle un tema al azar,
       se queda sin clasificar. */
    if (orden.length > 1 && orden[0].nota - orden[1].nota < ajustes.margen) return null;

    return orden[0].tema;
  }

  return { clasificar, temas: Array.from(porId.values()), entradas: entradas.length };
}

/* -------------------------------------------------------------------------
   ¿La respuesta responde de verdad?
   -------------------------------------------------------------------------
   POR QUÉ: hasta ahora se daba por resuelta cualquier respuesta con texto,
   así que un «eso no lo tengo, llame a secretaría» contaba como acierto y la
   lista de preguntas sin responder del panel salía siempre vacía. Justo esas
   son las que el centro necesita ver para poder contestarlas.

   Busca marcas de AUSENCIA de información, nunca de derivación: una
   respuesta que da el dato y además ofrece el teléfono sigue contando como
   resuelta, que es lo correcto. Y exige que lo que falta sea información:
   «no disponemos de plazas» es una respuesta, no un hueco.

   Es una heurística sobre texto en español, no una certeza. Cuando aparezcan
   fórmulas nuevas en respuestas reales, se añaden aquí con su caso en
   pruebas_analisis.js. */
const SIN_RESPUESTA = [
  /no (dispongo|disponemos|tengo|tenemos|cuento|contamos)\s*(de|con)?\s*(esa|ese|esta|este|la|el|los|las)?\s*(informaci|dato|detalle)/i,
  /no (me|nos) consta/i,
  /(no|sin) (aparece|figura|consta|se especifica|se indica|se detalla)/i,
  /no est[áa](n)? (publicad|recogid|disponible|especificad|indicad|detallad)/i,
  /(esa|esta|dicha) informaci[óo]n no (la tengo|la tenemos|est[áa]|figura|aparece|consta)/i,
  /no (lo |la )?s[ée]/i,
  /no s[é]/i,
  /no (puedo|podemos) (confirmar|asegurar|precisar|concretar)/i,
  /no (te |le |os |les )?(puedo|podemos) (dar|facilitar|indicar|concretar) (ese|este|esa|esta|el|la)/i,
  /prefiero no (inventar|aventurar|dar)/i,
  /no (tengo|tenemos) (constancia|registrado|recogido|documentado)/i
];

function pareceSinRespuesta(texto) {
  const t = String(texto || '');
  if (!t.trim()) return true;
  return SIN_RESPUESTA.some((patron) => patron.test(t));
}

module.exports = {
  crearClasificador, pareceSinRespuesta,
  limpiarTitulo, normalizarTexto, tokenizar
};
