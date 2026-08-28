/**
 * =========================================================================
 * ASISTENTE ESCOLAR CON IA · MOTOR DEL CLIENTE
 * =========================================================================
 * Secretaría virtual y orientación académica para centros educativos.
 *
 * ARQUITECTURA HÍBRIDA EN TRES NIVELES (de más barato a más caro):
 *
 *   Nivel 1 · BOTONES     Navegación guiada por menús. Coste 0. Instantáneo.
 *   Nivel 2 · BÚSQUEDA    El usuario escribe libremente y se busca en la base
 *                         de conocimiento local con tolerancia a erratas
 *                         (distancia de Levenshtein) y sinónimos. Coste 0.
 *   Nivel 3 · IA          Solo si los niveles anteriores no resuelven, se
 *                         consulta al modelo generativo del servidor.
 *
 * DEGRADACIÓN ELEGANTE: si el servidor de IA no responde, el asistente NO
 * muestra un error. Avisa discretamente en el pie y sigue funcionando en
 * modo determinista, igual que el producto "Chatbot Sin IA".
 *
 * PRIVACIDAD: la conversación vive únicamente en memoria mientras el chat
 * está abierto. Al cerrarlo se destruye. No se usa localStorage ni cookies.
 * =========================================================================
 */

(function () {
  'use strict';

  /* =======================================================================
     1. CONFIGURACIÓN Y ESTADO
     ======================================================================= */

  // Configuración mínima de emergencia. Solo entra en juego si no se puede
  // leer configuracion_centro.json (por ejemplo al abrir el archivo con
  // file://). No duplica ese archivo: contiene lo justo para que el
  // asistente arranque sin romperse y muestre algo coherente.
  const CONFIG_EMERGENCIA = {
    centro: {
      id: 'centro', nombre: 'Centro Educativo', nombre_corto: 'el centro',
      direccion: '', telefono: '', email: '', horario_secretaria: ''
    },
    marca: {
      titulo_widget: 'Secretaría Virtual',
      subtitulo_widget: 'Secretaría y Orientación',
      mensaje_burbuja: '¿Tienes alguna duda? 💬'
    },
    funcionalidades: {
      ia_generativa: true, busqueda_libre: true, test_orientacion_4eso: true,
      calendario_escolar: true, formularios: true, modo_oscuro: false,
      streaming_respuestas: true
    },
    /* Sin configuración que leer se asume el plan más bajo: es justo el que
       funciona sin servidor, que es la situación en la que estamos aquí. */
    plan: 'essential',
    ia: { umbral_busqueda_local: 4 },
    privacidad: { url_aviso_privacidad: '', avisar_que_es_una_ia: true },
    solicitudes: { destino: 'sqlite' },
    enlaces_oficiales: { mostrar: false, enlaces: [] },
    calendario: null
  };

  const estado = {
    config: CONFIG_EMERGENCIA,
    // Dirección del servidor. Vacía = mismo origen que la página (modo demo).
    // Cuando el widget se incrusta en la web de un centro, widget.js la rellena.
    servidor: '',
    conocimiento: { categorias: [] },
    // Historial en memoria volátil. Se vacía al cerrar el chat (RGPD).
    historial: [],
    // 'ia' = servidor disponible · 'local' = degradado a modo determinista
    modo: 'local',
    servidorComprobado: false,
    // Hay servidor detrás, aunque la IA esté apagada. Es distinto de `modo`:
    // sin esto no se sabía a quién avisar de lo que resuelve el navegador.
    hayServidor: false,
    peticionEnCurso: false,
    // Estado del test de orientación de 4º de ESO
    orientacion: { activo: false, paso: 0, puntuaciones: {}, abiertas: [], libres: [], esperandoLibre: false }
  };

  // Referencias al DOM (se rellenan en inicializarElementos)
  let raiz, widget, cuerpoChat, campoTexto, botonEnviar, botonAbrir,
      botonCerrar, burbuja, avisoPie;

  /* Los tres planes que se venden, de menos a más. Cada uno incluye lo del
     anterior, así que comparar posiciones basta. Esto solo decide qué se
     PINTA: quien cobra el plan de verdad es el servidor. */
  const PLANES = ['essential', 'centro', 'infinito'];

  function planIncluye(planMinimo) {
    const actual = PLANES.indexOf(String(estado.config.plan || 'essential').toLowerCase());
    const pedido = PLANES.indexOf(String(planMinimo).toLowerCase());
    // Un nombre mal escrito no puede regalar funcionalidad: se pide el máximo.
    return (actual === -1 ? 0 : actual) >= (pedido === -1 ? PLANES.length : pedido);
  }

  /* =======================================================================
     2. UTILIDADES DE TEXTO Y SEGURIDAD
     ======================================================================= */

  // Escudo XSS: escapa todo y después restituye solo un puñado de etiquetas
  // de formato inofensivas. Nunca se permiten <script>, <iframe> ni atributos
  // de evento (onclick, onerror...).
  function sanear(cadena) {
    if (!cadena) return '';
    const temp = document.createElement('div');
    temp.textContent = String(cadena);
    let seguro = temp.innerHTML;

    const permitidas = ['strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'p', 'small'];
    permitidas.forEach(function (etq) {
      seguro = seguro.replace(new RegExp('&lt;' + etq + '&gt;', 'gi'), '<' + etq + '>');
      seguro = seguro.replace(new RegExp('&lt;\\/' + etq + '&gt;', 'gi'), '</' + etq + '>');
    });
    seguro = seguro.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
    // Solo se admiten enlaces http(s), mailto y tel. Cualquier otro esquema
    // (javascript:, data:...) se queda escapado como texto plano.
    seguro = seguro.replace(
      /&lt;a\s+href="((?:https?:\/\/|mailto:|tel:)[^"]*)"[^&]*&gt;/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer">'
    );
    seguro = seguro.replace(/&lt;\/a&gt;/gi, '</a>');
    return seguro;
  }

  // Convierte el markdown ligero que devuelve la IA a HTML seguro
  function markdownAHtml(texto) {
    let html = sanear(texto);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  // Quita tildes, signos y mayúsculas para poder comparar textos
  function normalizar(cadena) {
    if (!cadena) return '';
    return String(cadena)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Distancia de Levenshtein: número mínimo de inserciones, borrados o
   * sustituciones para convertir una palabra en otra. Sirve para tolerar
   * erratas ("comedro" -> "comedor", "vacasiones" -> "vacaciones").
   * Implementación con dos filas para no reservar la matriz completa.
   */
  function distanciaLevenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    let filaPrevia = new Array(b.length + 1);
    let filaActual = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) filaPrevia[j] = j;

    for (let i = 1; i <= a.length; i++) {
      filaActual[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const coste = a[i - 1] === b[j - 1] ? 0 : 1;
        filaActual[j] = Math.min(
          filaActual[j - 1] + 1,      // inserción
          filaPrevia[j] + 1,          // borrado
          filaPrevia[j - 1] + coste   // sustitución
        );
      }
      const intercambio = filaPrevia;
      filaPrevia = filaActual;
      filaActual = intercambio;
    }
    return filaPrevia[b.length];
  }

  // Dos palabras se consideran "la misma con una errata" según su longitud:
  // en palabras cortas no se tolera nada, en largas hasta dos caracteres.
  function seParecen(a, b) {
    if (a === b) return true;
    const minLong = Math.min(a.length, b.length);
    if (minLong < 4) return false;
    if (Math.abs(a.length - b.length) > 2) return false;
    const tolerancia = minLong <= 6 ? 1 : 2;
    return distanciaLevenshtein(a, b) <= tolerancia;
  }

  /**
   * Diccionario de sinónimos del ámbito escolar. Traduce la forma en que
   * habla una familia a los términos que usa la base de conocimiento.
   * Clave = término canónico · Valor = formas equivalentes.
   */
  const SINONIMOS = {
    comedor: ['comida', 'comer', 'menu', 'cocina', 'almuerzo', 'catering', 'bandeja'],
    matricula: ['matricular', 'inscripcion', 'apuntar', 'plaza', 'admision', 'preinscripcion'],
    falta: ['ausencia', 'faltar', 'absentismo', 'inasistencia', 'no ir', 'no asistir'],
    justificar: ['justificante', 'excusa', 'volante', 'parte medico'],
    pago: ['pagar', 'abonar', 'recibo', 'cuota', 'precio', 'coste', 'tarifa', 'factura', 'domiciliacion'],
    horario: ['hora', 'horas', 'cuando', 'abren', 'abre', 'cierran', 'jornada'],
    certificado: ['documento', 'papel', 'justificante oficial', 'acreditacion', 'expediente'],
    vacaciones: ['festivo', 'fiesta', 'puente', 'no lectivo', 'descanso', 'libre'],
    beca: ['ayuda', 'subvencion', 'gratuidad', 'exencion'],
    transporte: ['autobus', 'bus', 'ruta', 'furgoneta'],
    extraescolar: ['actividad', 'actividades', 'talleres', 'deporte', 'musica', 'robotica'],
    uniforme: ['ropa', 'chandal', 'babi', 'bata', 'equipacion'],
    tutoria: ['tutor', 'profesor', 'reunion', 'entrevista', 'cita'],
    bachillerato: ['bachiller', 'bach'],
    orientacion: ['orientador', 'vocacional', 'que estudiar', 'futuro', 'salidas']
  };

  /**
   * Palabras vacías del castellano y muletillas propias de este dominio.
   * Sin este filtro, una consulta como "¿qué hago si mi hijo está enfermo?"
   * puntúa por el "que" en cualquier pregunta que lo contenga.
   */
  const PALABRAS_VACIAS = new Set([
    'que', 'como', 'cual', 'cuales', 'cuando', 'donde', 'quien', 'cuanto', 'cuanta',
    'para', 'por', 'con', 'sin', 'del', 'las', 'los', 'una', 'uno', 'unos', 'unas',
    'este', 'esta', 'esto', 'ese', 'esa', 'aquel', 'mio', 'mis', 'sus', 'tus',
    // OJO: 'eso' NO puede figurar aquí. En un centro educativo es la
    // Educación Secundaria Obligatoria, no el pronombre.
    // Lo mismo ocurriría con 'fp' o 'pau' si se filtraran por ser cortas.
    'hay', 'ser', 'soy', 'son', 'era', 'fue', 'han', 'has', 'hace', 'hacer', 'hago',
    'tiene', 'tengo', 'tener', 'puedo', 'puede', 'poder', 'quiero', 'queria', 'querer',
    'necesito', 'necesita', 'saber', 'decir', 'dime', 'sobre', 'algo', 'alguna', 'alguno',
    'mucho', 'muy', 'mas', 'menos', 'todo', 'toda', 'todos', 'todas', 'otro', 'otra',
    'hijo', 'hija', 'hijos', 'hijas', 'nino', 'nina', 'alumno', 'alumna', 'chico', 'chica',
    'buenas', 'buenos', 'hola', 'gracias', 'favor', 'porfa', 'ayuda', 'ayudar',
    'centro', 'colegio', 'instituto', 'escuela'
  ]);

  // Amplía la consulta del usuario con los términos canónicos equivalentes.
  // Los términos derivados de un sinónimo pesan la mitad que los que el
  // usuario ha escrito realmente: son una pista más débil.
  function expandirSinonimos(tokens) {
    const ampliados = tokens.map(function (t) { return { texto: t, peso: 1 }; });
    const yaPresentes = tokens.slice();

    tokens.forEach(function (tok) {
      Object.keys(SINONIMOS).forEach(function (canonico) {
        if (tok === canonico) return;
        const equivalentes = SINONIMOS[canonico];
        for (let i = 0; i < equivalentes.length; i++) {
          const partes = normalizar(equivalentes[i]).split(' ');
          if (partes.indexOf(tok) !== -1 && yaPresentes.indexOf(canonico) === -1) {
            yaPresentes.push(canonico);
            ampliados.push({ texto: canonico, peso: 0.4 });
            return;
          }
        }
      });
    });
    return ampliados;
  }

  /* =======================================================================
     3. NIVEL 2 · BUSCADOR LOCAL DIFUSO (coste cero)
     ======================================================================= */

  /**
   * Busca la mejor coincidencia en la base de conocimiento local.
   * Puntuación por token de la consulta:
   *    +5  coincidencia exacta con una palabra clave
   *    +3  palabra clave con errata (Levenshtein)
   *    +3  aparece en el enunciado de la pregunta
   *    +2  enunciado con errata
   *    +1  aparece en el cuerpo de la respuesta
   * Devuelve { pregunta, categoria, puntuacion } o null.
   */
  function buscarEnLocal(consulta) {
    const consultaNorm = normalizar(consulta);
    const crudos = consultaNorm.split(' ').filter(function (t) {
      return t.length > 2 && !PALABRAS_VACIAS.has(t);
    });
    if (!crudos.length) return null;

    const tokens = expandirSinonimos(crudos);

    let mejor = null;
    let mejorPuntuacion = 0;

    (estado.conocimiento.categorias || []).forEach(function (cat) {
      (cat.preguntas || []).forEach(function (preg) {
        let puntuacion = 0;
        const enunciado = normalizar(preg.pregunta).split(' ');
        const cuerpo = normalizar(preg.respuesta);
        const claves = (preg.keywords || []).map(function (k) {
          const texto = normalizar(k);
          const palabras = texto.split(' ');
          return {
            texto: texto,
            palabras: palabras,
            // Una palabra suelta dentro de una clave de varias ("estudio"
            // dentro de "aula estudio") es una pista más débil que una clave
            // de una sola palabra. Se reparte el peso entre sus términos.
            reparto: 1 / Math.sqrt(palabras.length)
          };
        });

        // La clave completa aparece literalmente en la consulta: señal fuerte
        claves.forEach(function (clave) {
          if (clave.palabras.length > 1 && consultaNorm.indexOf(clave.texto) !== -1) {
            puntuacion += 8;
          }
        });

        const acertados = {};

        tokens.forEach(function (item) {
          const tok = item.texto;
          const peso = item.peso;
          let mejorAporte = 0;

          claves.forEach(function (clave) {
            if (clave.palabras.indexOf(tok) !== -1) {
              mejorAporte = Math.max(mejorAporte, 5 * clave.reparto * peso);
            } else if (peso === 1) {
              for (let j = 0; j < clave.palabras.length; j++) {
                if (seParecen(tok, clave.palabras[j])) {
                  mejorAporte = Math.max(mejorAporte, 4 * clave.reparto);
                  break;
                }
              }
            }
          });

          if (enunciado.indexOf(tok) !== -1) {
            mejorAporte += 3 * peso;
          } else if (peso === 1) {
            for (let i = 0; i < enunciado.length; i++) {
              if (seParecen(tok, enunciado[i])) { mejorAporte += 2; break; }
            }
          }

          if (cuerpo.indexOf(tok) !== -1) mejorAporte += 1 * peso;

          if (mejorAporte > 0) {
            puntuacion += mejorAporte;
            if (peso === 1) acertados[tok] = true;
          }
        });

        // Cubrir varias palabras distintas de la consulta vale más que
        // acertar muchas veces con una sola.
        const cobertura = Object.keys(acertados).length;
        if (cobertura > 1) puntuacion += (cobertura - 1) * 2;

        if (puntuacion > mejorPuntuacion) {
          mejorPuntuacion = puntuacion;
          mejor = { pregunta: preg, categoria: cat.id, puntuacion: Math.round(puntuacion) };
        }
      });
    });

    return mejor && mejorPuntuacion > 0 ? mejor : null;
  }

  /* =======================================================================
     4. NIVEL 3 · CAPA DE IA Y SALUD DEL SERVIDOR
     ======================================================================= */

  // Comprueba una sola vez si el backend responde. Si no, el asistente pasa
  // a modo determinista sin mostrar ningún error al usuario.
  function comprobarServidor() {
    if (!estado.config.funcionalidades.ia_generativa) {
      estado.modo = 'local';
      estado.servidorComprobado = true;
      return Promise.resolve(false);
    }

    const temporizador = new AbortController();
    const corte = setTimeout(function () { temporizador.abort(); }, 4000);

    return fetch(rutaApi('/api/salud'), { signal: temporizador.signal })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (datos) {
        clearTimeout(corte);
        estado.servidorComprobado = true;
        estado.hayServidor = true;
        estado.modo = datos && datos.ia_disponible ? 'ia' : 'local';
        if (estado.modo === 'local') mostrarAvisoModoBasico();
        return estado.modo === 'ia';
      })
      .catch(function () {
        clearTimeout(corte);
        estado.servidorComprobado = true;
        estado.hayServidor = false;
        estado.modo = 'local';
        mostrarAvisoModoBasico();
        return false;
      });
  }

  // Aviso discreto en el pie del chat. No es un error bloqueante: el
  // asistente sigue respondiendo con la base de conocimiento.
  function mostrarAvisoModoBasico() {
    if (!avisoPie) return;
    avisoPie.textContent = 'El asistente inteligente no está disponible ahora mismo · Funcionando en modo básico';
    avisoPie.classList.add('visible');
  }

  function ocultarAvisoModoBasico() {
    if (!avisoPie) return;
    avisoPie.classList.remove('visible');
  }

  /**
   * Avisa al servidor de una consulta que se ha resuelto aquí, en el
   * navegador, sin llamar a nadie.
   *
   * POR QUÉ: los niveles 1 y 2 (los botones y el buscador local) son la
   * mayor parte de lo que hace el asistente y no pasaban por el servidor,
   * así que el registro del centro solo veía la parte que llegó a la IA. El
   * panel de secretaría daba entonces una tasa de resolución mucho más baja
   * de la real y no enseñaba ni la mitad de lo que se pregunta.
   *
   * Se manda y se olvida: si falla, la familia no se entera de nada.
   */
  function registrarEnServidor(consulta, resuelta, via, idCategoria) {
    if (!estado.hayServidor || !consulta) return;
    try {
      fetch(rutaApi('/api/consultas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consulta: String(consulta).slice(0, 500),
          resuelta: resuelta !== false,
          via: via || 'buscador',
          categoria_id: idCategoria || '',
          /* Un centro Essential no tiene servidor propio y manda esto al
             nuestro: si no dice quién es, su actividad se mezcla con la de
             los demás colegios. */
          centro: (estado.config.centro || {}).id || ''
        })
      }).catch(function () { /* el registro no puede estropear la conversación */ });
    } catch (error) { /* idem */ }
  }

  /**
   * Envía la consulta al backend y pinta la respuesta en streaming
   * (palabra a palabra) para que la espera resulte menos incómoda.
   * Si algo falla a mitad, se degrada a modo local sin romper la conversación.
   */
  function consultarIA(textoUsuario, alTerminar, modoForzado) {
    estado.peticionEnCurso = true;

    const burbujaRespuesta = crearBurbujaVacia();
    let acumulado = '';

    const cuerpoPeticion = JSON.stringify({
      mensaje: textoUsuario,
      // Solo se envían los últimos 8 turnos: suficiente para dar contexto
      // y evita que el consumo de tokens crezca sin control.
      historial: estado.historial.slice(-8),
      // modoForzado permite indicar el modo aunque estado.orientacion.activo
      // ya se haya puesto a false (p.ej. al cerrar el test de orientación).
      modo: modoForzado || (estado.orientacion.activo ? 'orientacion_4eso' : 'general')
    });

    fetch(rutaApi('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cuerpoPeticion
    })
      .then(function (respuesta) {
        if (respuesta.status === 429) return Promise.reject(new Error('limite'));
        if (!respuesta.ok || !respuesta.body) return Promise.reject(new Error('servidor'));

        const lector = respuesta.body.getReader();
        const decodificador = new TextDecoder();
        let buffer = '';
        let errorDelStream = null;

        function leerTrozo() {
          return lector.read().then(function (resultado) {
            if (resultado.done) return finalizar();

            buffer += decodificador.decode(resultado.value, { stream: true });
            const lineas = buffer.split('\n');
            buffer = lineas.pop();

            lineas.forEach(function (linea) {
              if (linea.indexOf('data: ') !== 0) return;
              const contenido = linea.slice(6);
              if (contenido === '[FIN]') return;
              try {
                const trozo = JSON.parse(contenido);
                if (trozo.texto) {
                  acumulado += trozo.texto;
                  burbujaRespuesta.innerHTML = markdownAHtml(acumulado);
                  irAlFinal();
                }
                // Ojo: aquí estamos dentro de un forEach. Devolver una promesa
                // rechazada no serviría de nada, se perdería. Se anota el
                // error y se decide al terminar de leer el stream.
                if (trozo.error) errorDelStream = trozo.error;
              } catch (e) { /* trozo incompleto: se ignora */ }
            });

            return leerTrozo();
          });
        }

        function finalizar() {
          estado.peticionEnCurso = false;

          // Si el servicio falló y no llegó ni una palabra, no se deja al
          // usuario con un mensaje de disculpa: se responde con la base de
          // conocimiento, que para la mayoría de consultas basta.
          if (errorDelStream && !acumulado.trim()) {
            const contenedor = burbujaRespuesta.closest('.message');
            if (contenedor) contenedor.remove();

            // El aviso se muestra siempre: la familia debe saber que esa
            // respuesta sale de la base oficial y no del asistente inteligente.
            mostrarAvisoModoBasico();

            // Solo la cuota agotada apaga la IA para el resto de la sesión.
            // Un fallo puntual no debe impedir que el siguiente intento use IA.
            if (errorDelStream === 'cuota') estado.modo = 'local';

            responderConBaseLocal(textoUsuario, true);
            return;
          }

          if (!acumulado.trim()) {
            burbujaRespuesta.innerHTML = markdownAHtml(
              'No he podido elaborar una respuesta. ¿Quieres que lo intentemos de otra forma?'
            );
          }

          estado.historial.push({ rol: 'usuario', texto: textoUsuario });
          estado.historial.push({ rol: 'asistente', texto: acumulado });
          if (typeof alTerminar === 'function') alTerminar(acumulado);
        }

        return leerTrozo();
      })
      .catch(function (error) {
        estado.peticionEnCurso = false;
        burbujaRespuesta.closest('.message').remove();

        if (error && error.message === 'limite') {
          mensajeBot(
            'Estás enviando consultas muy seguidas. Espera un minuto y vuelve a intentarlo, por favor.',
            crearBotones([{ etiqueta: '🏠 Menú principal', alPulsar: mostrarMenuPrincipal }])
          );
          return;
        }

        // Cualquier otro fallo: se degrada a modo local y se responde igual
        estado.modo = 'local';
        mostrarAvisoModoBasico();
        responderConBaseLocal(textoUsuario, true);
      });
  }

  /* =======================================================================
     5. PRIMITIVAS DE INTERFAZ
     ======================================================================= */

  function irAlFinal() {
    if (cuerpoChat) cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
  }

  function horaActual() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Pinta un mensaje. Bot y usuario comparten estructura; lo único que
   * cambia es el lado, si el contenido se interpreta como HTML (solo el del
   * bot, ya saneado) y si lleva elementos adjuntos.
   */
  function pintarMensaje(quien, contenido, extra) {
    const contenedor = nuevoElemento('div', 'message ' + quien);
    const burbujaMsg = nuevoElemento('div', 'message-bubble');

    // El texto del usuario va por textContent: nunca se interpreta como HTML
    if (quien === 'user') burbujaMsg.textContent = contenido;
    else burbujaMsg.innerHTML = contenido;

    contenedor.appendChild(burbujaMsg);
    if (extra) contenedor.appendChild(extra);
    contenedor.appendChild(nuevoElemento('span', 'message-time', horaActual()));

    cuerpoChat.appendChild(contenedor);
    irAlFinal();
    return burbujaMsg;
  }

  function mensajeBot(html, extra) { return pintarMensaje('bot', html, extra); }
  function mensajeUsuario(texto) { return pintarMensaje('user', texto); }

  // Burbuja vacía que se irá rellenando con el streaming de la IA
  function crearBurbujaVacia() {
    const burbujaMsg = mensajeBot('<span class="cursor-escritura"></span>');
    return burbujaMsg;
  }

  function indicadorEscribiendo(alTerminar, duracion) {
    const puntos = document.createElement('div');
    puntos.className = 'typing-indicator';
    puntos.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    cuerpoChat.appendChild(puntos);
    irAlFinal();
    setTimeout(function () {
      puntos.remove();
      if (typeof alTerminar === 'function') alTerminar();
    }, duracion || 400);
  }

  function crearBotones(opciones) {
    const contenedor = document.createElement('div');
    contenedor.className = 'chat-quick-options';

    opciones.forEach(function (opcion) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'quick-option-btn';

      const texto = document.createElement('span');
      texto.textContent = opcion.etiqueta;
      boton.appendChild(texto);
      boton.insertAdjacentHTML('beforeend',
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59,16.59L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.59Z"/></svg>');

      boton.addEventListener('click', function () {
        if (opcion.eco !== false) mensajeUsuario(opcion.ecoTexto || opcion.etiqueta);
        indicadorEscribiendo(function () { opcion.alPulsar(); });
      });

      contenedor.appendChild(boton);
    });

    return contenedor;
  }

  // Botones que se repiten en casi todas las respuestas. Definirlos una vez
  // evita repetir la misma literal por todo el archivo.
  const BOTON = {
    contacto: function () {
      return {
        etiqueta: '📞 Contactar con Secretaría',
        alPulsar: function () {
          registrarEnServidor('Contactar con secretaría', true, 'boton', 'secretaria');
          mostrarContacto();
        }
      };
    },
    menu: function () { return { etiqueta: '🏠 Menú principal', eco: false, alPulsar: mostrarMenuPrincipal }; },
    familias: function () { return { etiqueta: '🎒 Trámites y servicios', alPulsar: mostrarMenuFamilias }; },
    escribirPregunta: function () {
      return { etiqueta: '✍️ Escribir mi pregunta', alPulsar: mostrarPantallaEscribirPregunta };
    }
  };

  /**
   * El botón «escribir mi pregunta» solo tiene sentido en Essential: es el
   * plan sin casilla de texto (busqueda_libre en false), así que sin este
   * botón una familia que no encuentra su respuesta se va sin dejar rastro.
   * En Centro e Infinito ya se escribe y se recibe respuesta por el pie del
   * chat, y ofrecer aquí lo mismo confundiría sobre dónde se contesta.
   *
   * Además hace falta un destino al que mandar la pregunta: un botón que no
   * puede enviar nada es peor que no tener botón. `estado.servidor` cubre el
   * caso con dirección explícita (widget incrustado con data-servidor);
   * `estado.hayServidor` cubre el caso de mismo origen, que se confirma en
   * cuanto /api/configuracion responde de verdad (ver arrancar()).
   */
  function debeOfrecerEscribirPregunta() {
    return !estado.config.funcionalidades.busqueda_libre &&
      !!(estado.servidor || estado.hayServidor);
  }

  // Añade el botón de escribir la pregunta al final de una lista de botones
  // ya construida, solo cuando procede. Se usa en los mismos sitios donde se
  // ofrece contactar con secretaría: es la otra salida cuando los botones no
  // han resuelto la duda de la familia.
  function conEscribirPregunta(botones) {
    if (debeOfrecerEscribirPregunta()) botones.push(BOTON.escribirPregunta());
    return botones;
  }

  // Crea un elemento con clase y texto en una sola línea. Se usa texto plano
  // (nunca innerHTML) para que ningún dato de configuración pueda inyectar
  // etiquetas en la página.
  function nuevoElemento(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }

  /* =======================================================================
     6. ORQUESTADOR: QUÉ HACER CON LO QUE ESCRIBE EL USUARIO
     ======================================================================= */

  function alEnviarTexto() {
    if (!campoTexto || estado.peticionEnCurso) return;
    const texto = campoTexto.value.trim();
    if (!texto) return;

    mensajeUsuario(texto);
    campoTexto.value = '';

    // Si estamos dentro del test de orientación, el texto es una respuesta
    // del alumno y sigue su propio flujo.
    if (estado.orientacion.activo) {
      if (estado.orientacion.esperandoLibre) procesarTextoLibre(texto);
      else procesarRespuestaOrientacion(texto);
      return;
    }

    enrutarConsulta(texto);
  }

  /**
   * Corazón del sistema híbrido. Decide en qué nivel se responde:
   *   1. ¿La base local resuelve con confianza suficiente? -> responde gratis.
   *   2. ¿Hay servidor de IA? -> consulta al modelo.
   *   3. Si no -> responde con lo mejor que tenga la base local.
   */
  function enrutarConsulta(texto) {
    const umbral = (estado.config.ia && estado.config.ia.umbral_busqueda_local) || 4;
    const coincidencia = buscarEnLocal(texto);

    // Nivel 2: la base local lo resuelve con holgura. Coste cero.
    if (coincidencia && coincidencia.puntuacion >= umbral + 4) {
      coincidencia.textoUsuario = texto;
      indicadorEscribiendo(function () {
        mostrarRespuestaLocal(coincidencia);
      });
      return;
    }

    // Nivel 3: hay IA disponible. Se le pasa la consulta.
    if (estado.modo === 'ia') {
      consultarIA(texto);
      return;
    }

    // Sin IA: se responde con la base local aunque la confianza sea menor.
    indicadorEscribiendo(function () {
      responderConBaseLocal(texto, false);
    });
  }

  function responderConBaseLocal(texto, veniaDeFallo) {
    const umbral = (estado.config.ia && estado.config.ia.umbral_busqueda_local) || 4;
    const coincidencia = buscarEnLocal(texto);

    if (coincidencia && coincidencia.puntuacion >= umbral) {
      if (veniaDeFallo) {
        mensajeBot('Te respondo con la información oficial que tengo guardada:');
      }
      coincidencia.textoUsuario = texto;
      mostrarRespuestaLocal(coincidencia);
      return;
    }

    // Sin coincidencia: nunca se deja al usuario en un callejón sin salida.
    // Esto es justo lo que el centro necesita ver en su panel para poder
    // escribir la respuesta que falta, así que se registra como no resuelta.
    registrarEnServidor(texto, false, 'buscador');
    mensajeBot(
      'No he encontrado información sobre <em>«' + sanear(texto) + '»</em>.<br><br>' +
      'Puedo ayudarte por aquí:',
      crearBotones(conEscribirPregunta([
        { etiqueta: '🏫 Admisiones y plazas', alPulsar: function () { mostrarPreguntasCategoria('admisiones'); } },
        BOTON.familias(),
        BOTON.contacto()
      ]))
    );
  }

  function mostrarRespuestaLocal(coincidencia) {
    const preg = coincidencia.pregunta;

    registrarEnServidor(
      coincidencia.textoUsuario || preg.pregunta, true,
      preg.accion === 'mostrar_calendario' ? 'calendario' : (coincidencia.via || 'buscador'),
      coincidencia.categoria);

    // Algunas respuestas disparan una tarjeta especial en lugar de texto
    if (preg.accion === 'mostrar_calendario' && estado.config.funcionalidades.calendario_escolar) {
      mensajeBot(sanear(preg.respuesta));
      pintarCalendario();
      return;
    }
    if (preg.accion === 'mostrar_contacto') {
      mostrarContacto();
      return;
    }
    if (preg.accion === 'formulario_admisiones' && estado.config.funcionalidades.formularios) {
      mensajeBot(sanear(preg.respuesta));
      pintarFormulario('visita');
      return;
    }

    mensajeBot(
      '<strong>' + sanear(preg.pregunta) + '</strong><br><br>' + sanear(preg.respuesta),
      crearBotones(conEscribirPregunta([
        { etiqueta: '✅ Resuelto, gracias', alPulsar: function () {
            mensajeBot('¡Me alegro de haber ayudado! Si surge cualquier otra duda, aquí estoy. 😊');
          } },
        { etiqueta: '⬅️ Ver más de esta sección', eco: false, alPulsar: function () {
            mostrarPreguntasCategoria(coincidencia.categoria);
          } },
        BOTON.contacto()
      ]))
    );
  }

  /* =======================================================================
     7. NAVEGACIÓN GUIADA POR MENÚS (nivel 1)
     ======================================================================= */

  function mostrarMenuPrincipal() {
    const nombre = estado.config.centro.nombre;
    const opciones = [
      { etiqueta: '🏫 Buscamos plaza (Admisiones)', alPulsar: function () { mostrarPreguntasCategoria('admisiones'); } },
      { etiqueta: '🎒 Ya somos familia del centro', alPulsar: mostrarMenuFamilias }
    ];

    if (estado.config.funcionalidades.test_orientacion_4eso && planIncluye('infinito')) {
      opciones.push({ etiqueta: '🎓 ¿Qué estudio después de 4º de ESO?', alPulsar: iniciarOrientacion });
    }
    if (estado.config.funcionalidades.calendario_escolar) {
      opciones.push({
        etiqueta: '📅 Calendario escolar y festivos',
        alPulsar: function () {
          registrarEnServidor('Calendario escolar y festivos', true, 'calendario', 'calendario');
          pintarCalendario(true);
        }
      });
    }
    opciones.push(BOTON.contacto());
    if (debeOfrecerEscribirPregunta()) opciones.push(BOTON.escribirPregunta());

    mensajeBot(
      '¡Hola! Te damos la bienvenida a la <strong>Secretaría Virtual de ' + sanear(nombre) + '</strong>.<br><br>' +
      '¿En qué puedo ayudarte?' +
      (estado.config.funcionalidades.busqueda_libre
        ? '<br><br><small>También puedes escribir tu pregunta directamente abajo.</small>'
        : ''),
      crearBotones(opciones)
    );
  }

  // Menú de familias: primero por etapa educativa, después por servicio
  function mostrarMenuFamilias() {
    const categorias = estado.conocimiento.categorias || [];
    const etapas = categorias.filter(function (c) { return c.ambito === 'etapa'; });
    const servicios = categorias.filter(function (c) { return c.ambito === 'servicio'; });

    const opciones = etapas.map(function (cat) {
      return {
        etiqueta: cat.titulo,
        alPulsar: function () { mostrarPreguntasCategoria(cat.id); }
      };
    });

    servicios.forEach(function (cat) {
      opciones.push({
        etiqueta: cat.titulo,
        alPulsar: function () { mostrarPreguntasCategoria(cat.id); }
      });
    });

    opciones.push({ etiqueta: '⬅️ Volver al inicio', eco: false, alPulsar: mostrarMenuPrincipal });

    mensajeBot(
      'Perfecto. Elige la <strong>etapa educativa</strong> del alumno o el <strong>servicio</strong> sobre el que necesitas información:',
      crearBotones(opciones)
    );
  }

  function mostrarPreguntasCategoria(idCategoria) {
    const cat = (estado.conocimiento.categorias || []).find(function (c) { return c.id === idCategoria; });
    if (!cat) { mostrarMenuPrincipal(); return; }

    const opciones = (cat.preguntas || []).map(function (preg) {
      return {
        etiqueta: preg.pregunta,
        alPulsar: function () {
          mostrarRespuestaLocal({
            pregunta: preg, categoria: cat.id, puntuacion: 99,
            via: 'boton', textoUsuario: preg.pregunta
          });
        }
      };
    });

    opciones.push({
      etiqueta: cat.ambito === 'admision' ? '⬅️ Volver al inicio' : '⬅️ Volver a etapas y servicios',
      eco: false,
      alPulsar: cat.ambito === 'admision' ? mostrarMenuPrincipal : mostrarMenuFamilias
    });

    mensajeBot(
      '<strong>' + sanear(cat.titulo) + '</strong><br>' + sanear(cat.descripcion || '') +
      '<br><br>¿Sobre qué quieres saber más?',
      crearBotones(opciones)
    );

    pintarEnlacesOficiales(idCategoria);
  }

  // Tarjetas de enlace a administraciones públicas (configurables por centro)
  function pintarEnlacesOficiales(idCategoria) {
    const conf = estado.config.enlaces_oficiales;
    if (!conf || !conf.mostrar || !Array.isArray(conf.enlaces)) return;

    conf.enlaces.forEach(function (enlace) {
      if (enlace.mostrar_en && enlace.mostrar_en.indexOf(idCategoria) === -1) return;
      if (!/^https:\/\//.test(enlace.url || '')) return; // solo HTTPS

      const tarjeta = nuevoElemento('a', 'chat-link-card');
      tarjeta.href = enlace.url;
      tarjeta.target = '_blank';
      tarjeta.rel = 'noopener noreferrer';

      const cuerpo = nuevoElemento('span', 'chat-link-body');
      cuerpo.appendChild(nuevoElemento('span', 'chat-link-title', enlace.titulo || ''));
      cuerpo.appendChild(nuevoElemento('span', 'chat-link-desc', enlace.descripcion || ''));

      [nuevoElemento('span', 'chat-link-icon', enlace.icono || '🔗'), cuerpo,
       nuevoElemento('span', 'chat-link-arrow', '↗')].forEach(function (parte) {
        tarjeta.appendChild(parte);
      });

      cuerpoChat.appendChild(tarjeta);
      irAlFinal();
    });
  }

  function mostrarContacto() {
    const c = estado.config.centro;
    const telLimpio = String(c.telefono || '').replace(/\s/g, '');

    let html = '<strong>' + sanear(c.nombre) + ' · Secretaría</strong><br>';
    if (c.direccion) html += '📍 ' + sanear(c.direccion) + '<br>';
    if (c.telefono) html += '📞 <a href="tel:' + encodeURIComponent(telLimpio) + '"><strong>' + sanear(c.telefono) + '</strong></a><br>';
    if (c.email) html += '✉️ <a href="mailto:' + encodeURIComponent(c.email) + '"><strong>' + sanear(c.email) + '</strong></a><br>';
    if (c.horario_secretaria) html += '<br>⏰ <strong>Horario de atención:</strong><br>' + sanear(c.horario_secretaria);

    mensajeBot(html, crearBotones([
      BOTON.menu()
    ]));
  }

  /* =======================================================================
     8. CALENDARIO ESCOLAR
     ======================================================================= */

  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const INICIALES_DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function dosDigitos(n) { return String(n).padStart(2, '0'); }

  function aISO(fecha) {
    return fecha.getFullYear() + '-' + dosDigitos(fecha.getMonth() + 1) + '-' + dosDigitos(fecha.getDate());
  }

  function desplazarFecha(fecha, dias) {
    const copia = new Date(fecha.getTime());
    copia.setDate(copia.getDate() + dias);
    return copia;
  }

  /**
   * Domingo de Resurrección por el algoritmo de Meeus/Jones/Butcher.
   * Permite calcular la Semana Santa de cualquier año sin mantenerla a mano.
   */
  function domingoResurreccion(anio) {
    const a = anio % 19;
    const b = Math.floor(anio / 100);
    const c = anio % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anio, mes - 1, dia);
  }

  /**
   * Determina el curso escolar vigente. Un curso NO coincide con el año
   * natural: va de septiembre a agosto. Si hoy es 19 de agosto, seguimos
   * en el curso que empezó el septiembre anterior.
   */
  function obtenerCursoEscolar(hoy) {
    const cal = estado.config.calendario || {};
    const inicioConf = cal.inicio_curso ? new Date(cal.inicio_curso + 'T00:00:00') : null;
    const finConf = cal.fin_curso ? new Date(cal.fin_curso + 'T00:00:00') : null;

    // Si el centro ha declarado las fechas del curso, mandan ellas: son el
    // dato oficial. Solo se deduce a partir de la fecha de hoy cuando no
    // hay configuración (el curso se supone de septiembre a agosto).
    let mesInicio, anioInicio;
    if (inicioConf) {
      mesInicio = inicioConf.getMonth();
      anioInicio = inicioConf.getFullYear();
    } else {
      mesInicio = 8;
      anioInicio = hoy.getMonth() >= mesInicio ? hoy.getFullYear() : hoy.getFullYear() - 1;
    }

    return {
      anioInicio: anioInicio,
      anioFin: anioInicio + 1,
      mesInicio: mesInicio,
      inicioLectivo: inicioConf,
      finLectivo: finConf,
      etiqueta: anioInicio + '-' + (anioInicio + 1)
    };
  }

  /**
   * Construye el índice de días especiales del curso a partir de la
   * configuración del centro. Devuelve un mapa fecha ISO -> descriptor,
   * cubriendo los dos años naturales que abarca el curso escolar.
   */
  function construirIndiceCalendario(curso) {
    const cal = estado.config.calendario || {};
    const indice = {};

    function marcar(iso, tipo, nombre, obligatoria) {
      indice[iso] = { tipo: tipo, nombre: nombre, asistencia_obligatoria: !!obligatoria };
    }

    function marcarRango(inicio, fin, tipo, nombre) {
      const desde = new Date(inicio + 'T00:00:00');
      const hasta = new Date(fin + 'T00:00:00');
      if (isNaN(desde) || isNaN(hasta)) return;
      for (let f = desde; f <= hasta; f = desplazarFecha(f, 1)) {
        marcar(aISO(f), tipo, nombre, false);
      }
    }

    (cal.vacaciones || []).forEach(function (v) {
      if (v.inicio && v.fin) marcarRango(v.inicio, v.fin, 'vacaciones', v.nombre);
    });

    // Semana Santa calculada para los dos años que toca el curso
    if (cal.calcular_semana_santa_automaticamente !== false) {
      [curso.anioInicio, curso.anioFin].forEach(function (a) {
        const pascua = domingoResurreccion(a);
        marcarRango(aISO(desplazarFecha(pascua, -7)), aISO(desplazarFecha(pascua, 1)),
                    'vacaciones', 'Vacaciones de Semana Santa');
      });
    }

    (cal.festivos_oficiales || []).forEach(function (f) {
      if (f.fecha) marcar(f.fecha, 'festivo', f.nombre, false);
    });

    (cal.dias_no_lectivos || []).forEach(function (d) {
      if (d.fecha) marcar(d.fecha, 'no_lectivo', d.nombre, false);
    });

    // Las jornadas especiales se marcan al final para que tengan prioridad:
    // es la información que más confunde a las familias.
    (cal.jornadas_especiales || []).forEach(function (j) {
      if (j.fecha) marcar(j.fecha, 'jornada_especial', j.nombre, j.asistencia_obligatoria !== false);
    });

    return indice;
  }

  function pintarMes(anio, indiceMes, hoyISO, indice) {
    const primero = new Date(anio, indiceMes, 1);
    let hueco = primero.getDay() - 1;      // la semana empieza en lunes
    if (hueco < 0) hueco = 6;
    const totalDias = new Date(anio, indiceMes + 1, 0).getDate();

    let celdas = '';
    for (let i = 0; i < hueco; i++) celdas += '<span class="cal-day cal-empty"></span>';

    for (let dia = 1; dia <= totalDias; dia++) {
      const iso = anio + '-' + dosDigitos(indiceMes + 1) + '-' + dosDigitos(dia);
      const info = indice[iso];
      let clases = 'cal-day';
      let titulo = '';

      if (info) {
        if (info.tipo === 'vacaciones' || info.tipo === 'no_lectivo') clases += ' cal-vacation';
        else if (info.tipo === 'festivo') clases += ' cal-festivo';
        else if (info.tipo === 'jornada_especial') clases += ' cal-jornada';
        titulo = info.nombre || '';
        if (info.tipo === 'jornada_especial' && info.asistencia_obligatoria) {
          titulo += ' · Asistencia obligatoria';
        }
      }
      if (iso === hoyISO) {
        clases += ' cal-today';
        titulo = titulo ? 'Hoy · ' + titulo : 'Hoy';
      }

      const attr = titulo ? ' title="' + sanear(titulo).replace(/"/g, '&quot;') + '"' : '';
      celdas += '<span class="' + clases + '"' + attr + '>' + dia + '</span>';
    }

    return '<div class="cal-month">' +
             '<div class="cal-month-title">' + MESES[indiceMes] + ' ' + String(anio).slice(2) + '</div>' +
             '<div class="cal-weekdays">' + INICIALES_DIAS.map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div>' +
             '<div class="cal-days">' + celdas + '</div>' +
           '</div>';
  }

  function pintarCalendario(conBotones) {
    const hoy = new Date();
    const hoyISO = aISO(hoy);
    const curso = obtenerCursoEscolar(hoy);
    const indice = construirIndiceCalendario(curso);

    // Doce meses consecutivos desde el arranque del curso (habitualmente
    // de septiembre a agosto), no de enero a diciembre.
    let meses = '';
    for (let i = 0; i < 12; i++) {
      const indiceMes = (curso.mesInicio + i) % 12;
      const anio = curso.anioInicio + Math.floor((curso.mesInicio + i) / 12);
      meses += pintarMes(anio, indiceMes, hoyISO, indice);
    }

    const fechaLegible = hoy.toLocaleDateString('es-ES',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const tarjeta = document.createElement('div');
    tarjeta.className = 'chat-form-card cal-card';
    tarjeta.innerHTML =
      '<h4>📅 Calendario escolar ' + sanear(curso.etiqueta) + '</h4>' +
      '<p class="chat-form-subtitle">Hoy es ' + sanear(fechaLegible) + '. ' +
        sanear(estadoDeHoy(hoyISO, indice, curso)) + '</p>' +
      '<div class="cal-legend">' +
        '<span class="cal-legend-item"><span class="cal-swatch cal-swatch-today"></span> Hoy</span>' +
        '<span class="cal-legend-item"><span class="cal-swatch cal-swatch-vacation"></span> Sin clase</span>' +
        '<span class="cal-legend-item"><span class="cal-swatch cal-swatch-jornada"></span> Jornada especial (hay que asistir)</span>' +
        '<span class="cal-legend-item"><span class="cal-swatch cal-swatch-festivo"></span> Festivo oficial</span>' +
      '</div>' +
      '<div class="cal-grid">' + meses + '</div>';

    cuerpoChat.appendChild(tarjeta);
    irAlFinal();

    if (conBotones !== false) {
      mensajeBot('¿Necesitas algo más?', crearBotones(conEscribirPregunta([
        { etiqueta: '🎉 ¿Hay que venir en las fiestas del centro?', alPulsar: function () {
            const preg = localizarPregunta('cal_fiesta_centro_asistencia');
            if (preg) mostrarRespuestaLocal({ pregunta: preg, categoria: 'calendario', puntuacion: 99 });
          } },
        BOTON.contacto(),
        BOTON.menu()
      ])));
    }
  }

  // Frase corta que resume la situación del día de hoy
  function estadoDeHoy(hoyISO, indice, curso) {
    const info = indice[hoyISO];
    const diaSemana = new Date(hoyISO + 'T00:00:00').getDay();

    if (info) {
      if (info.tipo === 'jornada_especial') {
        return 'Hoy es ' + info.nombre + ': no hay clases ordinarias, pero la asistencia es obligatoria.';
      }
      if (info.tipo === 'festivo') return 'Hoy es festivo (' + info.nombre + '): el centro permanece cerrado.';
      return 'Hoy no hay clase (' + info.nombre + ').';
    }

    // Fuera del periodo lectivo declarado por el centro
    const hoyFecha = new Date(hoyISO + 'T00:00:00');
    if (curso.inicioLectivo && hoyFecha < curso.inicioLectivo) {
      return 'El curso todavía no ha empezado: las clases comienzan el ' +
        curso.inicioLectivo.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) + '.';
    }
    if (curso.finLectivo && hoyFecha > curso.finLectivo) {
      return 'El curso ya ha terminado: estamos en periodo de vacaciones.';
    }

    if (diaSemana === 0 || diaSemana === 6) return 'Hoy es fin de semana.';
    return 'Hoy es un día lectivo normal.';
  }

  function localizarPregunta(idPregunta) {
    let encontrada = null;
    (estado.conocimiento.categorias || []).forEach(function (cat) {
      (cat.preguntas || []).forEach(function (p) {
        if (p.id === idPregunta) encontrada = p;
      });
    });
    return encontrada;
  }

  /* =======================================================================
     9. TEST DE ORIENTACIÓN PARA 4º DE ESO
     ======================================================================= */

  /*
   * Test de intereses de 15 preguntas, ponderado sobre las mismas 9 áreas
   * profesionales que usan los tests vocacionales universitarios (empresa,
   * educación, derecho, comunicación, turismo, idiomas, politécnica, salud
   * y deporte). No llama a la IA: es gratis, objetivo y repetible.
   *
   * POR QUÉ 15 Y NO 35: la versión anterior planteaba 35 afirmaciones sobre
   * uno mismo ("¿te consideras metódico?"). A los 15-16 años eso falla por dos
   * motivos. Primero, el autoconcepto todavía se está formando: pedirles que se
   * evalúen en abstracto da respuestas poco fiables. Segundo, pasada la
   * pregunta ~20 aparece el "satisficing": se contesta cualquier cosa por
   * acabar, así que MÁS preguntas terminan dando PEOR dato.
   *
   * La solución no fue recortar preguntas sin más, sino cambiar el formato:
   * en lugar de puntuar una afirmación en una escala (un dato por pregunta),
   * se elige entre escenarios concretos que cargan áreas distintas (mucha más
   * información por pregunta). Por eso 15 discriminan tan bien como las 35 de
   * antes. Las cinco últimas son una "ronda rápida" para romper el ritmo: al
   * alternar formatos se sostiene la atención mucho mejor que con 35 pantallas
   * idénticas.
   *
   * Las situaciones son deliberadamente cotidianas y concretas ("se te rompe
   * la bici", "un amigo te cuenta un problema") en vez de abstractas: a esta
   * edad se responde con mucha más precisión sobre lo que uno HACE que sobre
   * lo que uno CREE SER.
   */
  const PREGUNTAS_PERFIL = [
    { tipo: 'elige', texto: 'Sábado, cero planes obligatorios. ¿Qué te apetece más?', opciones: [
      { texto: 'Montar algo con gente: quedada, plan, lo que surja', areas: {turismo:1,empresa:0.6,educacion:0.5,deporte:0.3} },
      { texto: 'Cacharrear con el ordenador, un juego o algo técnico', areas: {politecnica:1,comunicacion:0.4} },
      { texto: 'Salir a entrenar o jugar un partido', areas: {deporte:1,salud:0.5} },
      { texto: 'Tranqui en casa: series, música, leer', areas: {comunicacion:0.7,idiomas:0.5,educacion:0.2} }
    ] },
    { tipo: 'elige', texto: 'Trabajo en grupo en clase. Sin que nadie lo mande, tú acabas...', opciones: [
      { texto: 'Repartiendo tareas y vigilando que llegue a tiempo', areas: {empresa:1,educacion:0.4,deporte:0.3} },
      { texto: 'Currándote el diseño y que quede bien', areas: {comunicacion:1,politecnica:0.5} },
      { texto: 'Explicándoselo a los que se han perdido', areas: {educacion:1,idiomas:0.5} },
      { texto: 'Comprobando que lo que ponemos es verdad', areas: {derecho:1,salud:0.6,politecnica:0.5} }
    ] },
    { tipo: 'elige', texto: 'Se te rompe algo (la bici, el mando, una estantería). ¿Qué haces?', opciones: [
      { texto: 'Lo abro y lo intento arreglar yo', areas: {politecnica:1} },
      { texto: 'Busco un tutorial y lo sigo paso a paso', areas: {politecnica:0.6,educacion:0.4} },
      { texto: 'Le pregunto a alguien que sepa y aprendo mirando', areas: {educacion:0.5,idiomas:0.3,salud:0.2} },
      { texto: 'Lo llevo a arreglar, mi tiempo vale más', areas: {empresa:0.8,turismo:0.3} }
    ] },
    { tipo: 'elige', texto: 'Un amigo te cuenta un problema gordo. Lo primero que te sale:', opciones: [
      { texto: 'Escucharle y estar ahí, sin más', areas: {salud:1,educacion:0.6} },
      { texto: 'Buscarle soluciones concretas', areas: {empresa:0.6,politecnica:0.5,derecho:0.4} },
      { texto: 'Si le han hecho algo injusto, me enciendo', areas: {derecho:1,comunicacion:0.4} },
      { texto: 'Sacarle de casa y despejarle', areas: {deporte:0.8,turismo:0.6,salud:0.3} }
    ] },
    { tipo: 'elige', texto: '¿Qué clase se te hace más corta?', opciones: [
      { texto: 'Mates, Física, Tecnología', areas: {politecnica:1,empresa:0.3} },
      { texto: 'Biología, Anatomía', areas: {salud:1,deporte:0.4} },
      { texto: 'Lengua, Historia, Filosofía', areas: {derecho:0.8,educacion:0.6,comunicacion:0.6,idiomas:0.4} },
      { texto: 'Inglés y otros idiomas', areas: {idiomas:1,turismo:0.8} },
      { texto: 'Ed. Física, Plástica, Música', areas: {deporte:0.7,comunicacion:0.6,politecnica:0.3} }
    ] },
    { tipo: 'elige', texto: 'Ves un vídeo que se ha hecho viral. Lo primero que piensas:', opciones: [
      { texto: 'Cómo lo han grabado y editado', areas: {comunicacion:1,politecnica:0.5} },
      { texto: 'Cuánto habrán ganado con eso', areas: {empresa:1} },
      { texto: 'Si lo que dice es verdad o se lo ha inventado', areas: {derecho:1,comunicacion:0.4,salud:0.3} },
      { texto: 'Lo mando al grupo y sigo', areas: {comunicacion:0.4,turismo:0.3} }
    ] },
    { tipo: 'elige', texto: 'Te regalan un mes fuera, donde tú quieras. Eliges...', opciones: [
      { texto: 'Un sitio nuevo donde no conozco a nadie ni el idioma', areas: {idiomas:1,turismo:1} },
      { texto: 'Donde pueda aprender un oficio o hacer prácticas', areas: {politecnica:0.7,empresa:0.7} },
      { texto: 'Un campamento con deporte y gente', areas: {deporte:1,turismo:0.5,educacion:0.4} },
      { texto: 'Un voluntariado ayudando a gente', areas: {salud:1,educacion:0.8} }
    ] },
    { tipo: 'elige', texto: 'Dentro de diez años, ¿dónde te ves más?', opciones: [
      { texto: 'Con mi propio negocio o dirigiendo algo', areas: {empresa:1,turismo:0.4} },
      { texto: 'Con bata o uniforme, ayudando a gente', areas: {salud:1,educacion:0.4} },
      { texto: 'Con un ordenador o máquinas, creando cosas', areas: {politecnica:1,comunicacion:0.5} },
      { texto: 'Delante de gente: dando clase, hablando, defendiendo algo', areas: {educacion:1,derecho:0.8,comunicacion:0.7,idiomas:0.5} }
    ] },
    { tipo: 'elige', texto: '¿Qué es lo que más te raya?', opciones: [
      { texto: 'Que las cosas estén desordenadas o sin plan', areas: {empresa:0.8,derecho:0.6,educacion:0.3} },
      { texto: 'Que no me dejen hacerlo a mi manera', areas: {empresa:0.7,comunicacion:0.5,politecnica:0.4} },
      { texto: 'Estar quieto mucho rato', areas: {deporte:1,turismo:0.5} },
      { texto: 'Que alguien lo pase mal y no poder ayudar', areas: {salud:1,educacion:0.7} }
    ] },
    { tipo: 'elige', texto: 'Aprendes mejor cuando...', opciones: [
      { texto: 'Lo hago con las manos, aunque me equivoque', areas: {politecnica:1,deporte:0.5,salud:0.4} },
      { texto: 'Entiendo la teoría primero y luego la aplico', areas: {derecho:0.8,educacion:0.7,salud:0.5,idiomas:0.5} },
      { texto: 'Se lo explico a otra persona', areas: {educacion:1,idiomas:0.6,comunicacion:0.5} },
      { texto: 'Veo cómo lo hace alguien que sabe', areas: {deporte:0.6,comunicacion:0.5,turismo:0.4} }
    ] },
    { tipo: 'rapida', texto: 'Se me da bien convencer a la gente.', areas: {comunicacion:1,empresa:0.8,derecho:0.7,turismo:0.5,idiomas:0.4} },
    { tipo: 'rapida', texto: 'Me fijo en detalles que a los demás se les escapan.', areas: {salud:0.8,derecho:0.7,politecnica:0.7,comunicacion:0.4} },
    { tipo: 'rapida', texto: 'Necesito moverme, no aguanto sentado todo el día.', areas: {deporte:1,turismo:0.4,salud:0.3} },
    { tipo: 'rapida', texto: 'Me gusta que me expliquen el porqué de las cosas, no solo el cómo.', areas: {politecnica:0.7,derecho:0.6,salud:0.6,educacion:0.5} },
    { tipo: 'rapida', texto: 'Conecto rápido con la gente que acabo de conocer.', areas: {turismo:0.8,educacion:0.8,comunicacion:0.7,salud:0.6,empresa:0.5} }
  ];

  // Respuestas de la ronda rápida. El "no" resta para que rechazar algo también
  // sea información, no solo un cero.
  const OPCIONES_RAPIDA = [
    { etiqueta: '👍 Sí, me pega', valor: 1 },
    { etiqueta: '🤷 A medias', valor: 0.4 },
    { etiqueta: '👎 Nada que ver', valor: -0.5 }
  ];

  // Mensajes de ánimo en puntos concretos, para que no sea una lista interminable.
  const HITOS_TEST = {
    5: '¡Vas a buen ritmo! 💪',
    10: 'Ya casi. Cambio de formato para la recta final 👇'
  };

  // Qué carreras/ciclos y qué modalidad de Bachillerato encaja con cada área.
  const AREAS_INFO = {
    empresa: { nombre: 'Empresa y negocio', bachillerato: 'Humanidades y Ciencias Sociales (itinerario Economía)', fp: 'Administración y Finanzas, Comercio Internacional, Marketing y Publicidad', ejemplos: 'ADE, Economía, Marketing' },
    educacion: { nombre: 'Educación y trabajo social', bachillerato: 'Humanidades y Ciencias Sociales', fp: 'Educación Infantil, Integración Social, Animación Sociocultural', ejemplos: 'Magisterio, Pedagogía, Educación Social' },
    derecho: { nombre: 'Derecho y ámbito jurídico', bachillerato: 'Humanidades y Ciencias Sociales', fp: 'Administración y Finanzas, Gestión Administrativa', ejemplos: 'Derecho, Criminología, Relaciones Laborales' },
    comunicacion: { nombre: 'Comunicación y medios', bachillerato: 'Humanidades y Ciencias Sociales, o Artes', fp: 'Producción y Realización de Proyectos Audiovisuales', ejemplos: 'Periodismo, Publicidad y RR.PP., Comunicación Audiovisual' },
    turismo: { nombre: 'Turismo y hostelería', bachillerato: 'Humanidades y Ciencias Sociales', fp: 'Guía, Información y Asistencias Turísticas, Gestión de Alojamientos', ejemplos: 'Turismo, Gestión Hotelera' },
    idiomas: { nombre: 'Idiomas y relaciones internacionales', bachillerato: 'Humanidades y Ciencias Sociales', fp: 'Comercio Internacional', ejemplos: 'Traducción e Interpretación, Estudios Internacionales, Filología' },
    politecnica: { nombre: 'Ingeniería y tecnología', bachillerato: 'Ciencias (itinerario Tecnológico)', fp: 'Informática y Comunicaciones, Electricidad y Electrónica, Fabricación Mecánica', ejemplos: 'Ingenierías, Informática, Arquitectura' },
    salud: { nombre: 'Ciencias de la salud', bachillerato: 'Ciencias (itinerario Biosanitario)', fp: 'Cuidados Auxiliares de Enfermería, Emergencias Sanitarias, Laboratorio Clínico', ejemplos: 'Medicina, Enfermería, Fisioterapia, Farmacia' },
    deporte: { nombre: 'Actividad física y deporte', bachillerato: 'Ciencias, o Humanidades y Ciencias Sociales', fp: 'Actividades Físicas y Deportivas', ejemplos: 'CAFYD, Fisioterapia, Entrenamiento deportivo' }
  };

  /*
   * Vocabulario para puntuar las respuestas libres ("Otra cosa") SIN llamar a
   * la IA. Es importante que sea local: si cada respuesta escrita disparase una
   * consulta al modelo, un alumno que use "Otra cosa" en las 15 preguntas
   * costaría 15 llamadas en vez de una. La IA sí lee estas respuestas, pero al
   * final, dentro de la única consulta que ya se hacía de todos modos.
   *
   * Va todo sin tildes y en minúscula porque se compara contra normalizar().
   */
  const PISTAS_AREA = {
    empresa: ['negocio', 'empresa', 'emprend', 'vender', 'venta', 'dinero', 'marketing', 'jefe', 'tienda', 'economi', 'bolsa', 'comercio', 'banco', 'contab', 'administra', 'invertir', 'mi propia', 'mi propio', 'montar algo', 'autonomo'],
    educacion: ['nino', 'ninos', 'ensen', 'profe', 'maestr', 'educa', 'colegio', 'guarder', 'pedagog', 'monitor', 'infantil', 'tutor', 'campamento'],
    derecho: ['ley', 'leyes', 'derecho', 'abogad', 'juez', 'justicia', 'polic', 'guardia civil', 'crimin', 'delito', 'fiscal', 'juzgado', 'militar', 'bombero'],
    comunicacion: ['perio', 'comunica', 'redes', 'tiktok', 'youtube', 'instagram', 'edita', 'edicion', 'video', 'foto', 'disen', 'publicid', 'audiovisual', 'cine', 'radio', 'streaming', 'podcast', 'escribir'],
    turismo: ['turismo', 'viaj', 'hotel', 'guia', 'restaur', 'cocina', 'cocinero', 'coctel', 'hostel', 'evento', 'crucero', 'camarer', 'reposter', 'peluquer', 'estetic', 'cara al publico'],
    idiomas: ['idioma', 'ingles', 'frances', 'aleman', 'traduc', 'interpret', 'filolog', 'extranjero', 'erasmus', 'japones', 'chino'],
    // Los oficios manuales van bien surtidos a propósito: son justo los
    // perfiles a los que peor les encajan las opciones cerradas y, por tanto,
    // los que más van a escribir su respuesta.
    politecnica: ['ordenador', 'informat', 'program', 'codigo', 'videojueg', 'videojuego', 'robot', 'ingenier', 'mecan', 'electr', 'tecnolog', 'maquina', 'coche', 'moto', 'motor', 'arquitect', 'construc', 'soldad', 'industrial', 'datos', 'ciberseguridad', 'impresora 3d', 'dron', 'taller', 'arreglar', 'reparar', 'fontaner', 'carpinter', 'albanil', 'obra', 'chapa', 'pintura', 'climatizacion', 'aeronaut', 'agricultura', 'jardiner'],
    salud: ['medic', 'enferm', 'sanitar', 'salud', 'cuidar', 'hospital', 'psicolog', 'fisio', 'farmac', 'veterinar', 'dentista', 'nutric', 'cuerpo', 'anatom', 'ambulancia', 'animales', 'peluquer', 'estetic', 'maquillaj', 'unas'],
    deporte: ['deporte', 'futbol', 'balonces', 'entrena', 'gimnas', 'atlet', 'fisico', 'baile', 'danza', 'yoga', 'natac', 'padel', 'tenis', 'ciclismo', 'escalada']
  };

  /**
   * Puntúa una respuesta escrita a mano buscando vocabulario de cada área.
   * Se topa en 1.5 por área para que una respuesta muy larga no desequilibre
   * el resto del test.
   */
  function clasificarTextoLibre(texto) {
    const limpio = normalizar(texto);
    const areas = {};
    Object.keys(PISTAS_AREA).forEach(function (area) {
      let coincidencias = 0;
      PISTAS_AREA[area].forEach(function (pista) {
        if (limpio.indexOf(pista) !== -1) coincidencias++;
      });
      if (coincidencias) areas[area] = Math.min(1.5, coincidencias * 0.7);
    });
    return areas;
  }

  // Dos preguntas abiertas finales: lo que no puede medir un test de intereses
  // (el plazo con el que se imagina el alumno y qué le frena).
  const PREGUNTAS_ORIENTACION = [
    { clave: 'plazo', texto: '¿Te ves estudiando unos cuantos años más, o prefieres formarte y empezar a trabajar antes? Como lo veas ahora mismo, sin pensarlo mucho.' },
    { clave: 'dudas', texto: 'Última: ¿hay algo que te agobie de todo esto? (las notas, no tener ni idea de qué elegir, lo que opinen en casa...) Dilo tal cual.' }
  ];

  function iniciarOrientacion() {
    /* El test es del plan Infinito. El menú ya lo esconde cuando el centro no
       lo tiene contratado, pero se podía entrar igual por la puerta de al
       lado: un data-abrir-chat="orientacion" en cualquier botón de la web del
       centro. La comprobación va aquí, que es por donde se entra siempre. */
    if (!estado.config.funcionalidades.test_orientacion_4eso || !planIncluye('infinito')) {
      mostrarMenuPrincipal();
      return;
    }

    estado.orientacion = { activo: true, paso: 0, puntuaciones: {}, abiertas: [], libres: [], esperandoLibre: false };
    Object.keys(AREAS_INFO).forEach(function (area) { estado.orientacion.puntuaciones[area] = 0; });

    mensajeBot(
      '<strong>🎓 ¿Y ahora qué?</strong><br><br>' +
      'Vamos a ver por dónde van tus intereses. Son <strong>' + PREGUNTAS_PERFIL.length + ' preguntas</strong> ' +
      'y un par de cosas al final que quiero que me cuentes tú. Unos <strong>3 minutos</strong>.<br><br>' +
      'No es un examen y no hay respuestas buenas ni malas. Ve a lo primero que pienses, ' +
      'que suele ser lo más acertado.<br><br>' +
      'Al acabar te doy una orientación y un <strong>informe para descargar</strong>, por si quieres ' +
      'enseñárselo a tu familia o al orientador del centro.<br><br>' +
      '<small>🔒 No se guarda nada de lo que contestes: el informe se crea en tu propio móvil u ordenador.</small>',
      crearBotones([
        { etiqueta: '▶️ Vamos allá', eco: false, alPulsar: siguientePreguntaPerfil },
        { etiqueta: '⬅️ Ahora no', eco: false, alPulsar: function () {
            estado.orientacion.activo = false;
            mostrarMenuPrincipal();
          } }
      ])
    );
  }

  // Barra de avance: a esta edad ver cuánto queda es lo que evita el abandono
  // a mitad del test.
  function barraProgreso(paso, total) {
    const porcentaje = Math.round((paso / total) * 100);
    return '<div class="chat-progreso">' +
             '<div class="chat-progreso-barra">' +
               '<div class="chat-progreso-relleno" style="width:' + porcentaje + '%"></div>' +
             '</div>' +
             '<span class="chat-progreso-texto">' + paso + '/' + total + '</span>' +
           '</div>';
  }

  function siguientePreguntaPerfil() {
    const paso = estado.orientacion.paso;

    if (paso >= PREGUNTAS_PERFIL.length) {
      siguientePreguntaOrientacion();
      return;
    }

    if (HITOS_TEST[paso]) mensajeBot(HITOS_TEST[paso]);

    const preg = PREGUNTAS_PERFIL[paso];
    const cabecera = barraProgreso(paso + 1, PREGUNTAS_PERFIL.length) + sanear(preg.texto);

    // Cada opción de las preguntas de elección lleva su propio reparto de áreas.
    // En la ronda rápida el reparto es de la pregunta y lo que cambia es el
    // multiplicador de la respuesta.
    const botones = preg.tipo === 'elige'
      ? preg.opciones.map(function (op) {
          return { etiqueta: op.texto, alPulsar: function () { registrarRespuestaPerfil(op.areas, 1); } };
        })
      : OPCIONES_RAPIDA.map(function (op) {
          return { etiqueta: op.etiqueta, alPulsar: function () { registrarRespuestaPerfil(preg.areas, op.valor); } };
        });

    // Ninguna lista cerrada cubre a todo el mundo, y forzar a elegir "la que
    // menos mal encaje" mete ruido en la puntuación. Con esta opción el alumno
    // contesta con sus palabras: se puntúa en local por vocabulario y el texto
    // literal se le pasa a la IA al final, junto con todo lo demás.
    botones.push({
      etiqueta: preg.tipo === 'elige' ? '✏️ Otra cosa, te la escribo' : '✏️ Depende, te lo explico',
      eco: false,
      alPulsar: pedirTextoLibre
    });

    mensajeBot(cabecera, crearBotones(botones));
  }

  function pedirTextoLibre() {
    estado.orientacion.esperandoLibre = true;
    mensajeBot('Cuéntamelo con tus palabras 👇');
    if (campoTexto) {
      campoTexto.placeholder = 'Escribe tu respuesta...';
      campoTexto.focus();
    }
  }

  function procesarTextoLibre(texto) {
    const preg = PREGUNTAS_PERFIL[estado.orientacion.paso];
    estado.orientacion.esperandoLibre = false;
    if (campoTexto) campoTexto.placeholder = 'Escribe tu consulta...';

    estado.orientacion.libres.push({
      pregunta: preg.texto,
      respuesta: texto
    });

    // Puntuación local por vocabulario: gratis y suficiente para que la
    // pregunta no se quede sin aportar nada al perfil.
    registrarRespuestaPerfil(clasificarTextoLibre(texto), 1);
  }

  function registrarRespuestaPerfil(areas, multiplicador) {
    // Por si el alumno pidió escribir y luego se decidió por un botón: sin
    // esto, lo siguiente que escribiera se tomaría como respuesta libre.
    estado.orientacion.esperandoLibre = false;
    Object.keys(areas).forEach(function (area) {
      estado.orientacion.puntuaciones[area] += areas[area] * multiplicador;
    });
    estado.orientacion.paso += 1;
    siguientePreguntaPerfil();
  }

  function siguientePreguntaOrientacion() {
    const paso = estado.orientacion.paso - PREGUNTAS_PERFIL.length;

    if (paso >= PREGUNTAS_ORIENTACION.length) {
      cerrarOrientacion();
      return;
    }

    const preg = PREGUNTAS_ORIENTACION[paso];
    mensajeBot(
      (paso === 0 ? '<small>✅ Test hecho. Ahora dos cosas con tus palabras, que esto no lo puede saber un test:</small><br><br>' : '') +
      sanear(preg.texto)
    );
    if (campoTexto) {
      campoTexto.placeholder = 'Escribe tu respuesta...';
      campoTexto.focus();
    }
  }

  function procesarRespuestaOrientacion(texto) {
    const paso = estado.orientacion.paso - PREGUNTAS_PERFIL.length;
    const preg = PREGUNTAS_ORIENTACION[paso];
    if (!preg) { cerrarOrientacion(); return; }

    estado.orientacion.abiertas.push({ clave: preg.clave, pregunta: preg.texto, respuesta: texto });
    estado.orientacion.paso += 1;

    indicadorEscribiendo(function () { siguientePreguntaOrientacion(); }, 500);
  }

  // Ordena las áreas por puntuación y les pone una nota de 0 a 100.
  // Se normaliza entre el mínimo y el máximo obtenidos, no sobre el máximo a
  // secas: en la ronda rápida un "nada que ver" resta, así que puede haber
  // puntuaciones negativas y dividir solo por el máximo las dejaría todas a 0.
  function rankingAreas(puntuaciones) {
    const claves = Object.keys(puntuaciones);
    const valores = claves.map(function (a) { return puntuaciones[a]; });
    const minimo = Math.min.apply(null, valores);
    const rango = (Math.max.apply(null, valores) - minimo) || 1;
    return claves
      .map(function (area) {
        return {
          area: area,
          puntos: puntuaciones[area],
          porcentaje: Math.round(((puntuaciones[area] - minimo) / rango) * 100)
        };
      })
      .sort(function (a, b) { return b.puntos - a.puntos; });
  }

  function cerrarOrientacion() {
    estado.orientacion.activo = false;
    if (campoTexto) campoTexto.placeholder = 'Escribe tu consulta...';

    mensajeBot('Vale, dame un segundo que le doy una vuelta a todo… 🤔');

    const ranking = rankingAreas(estado.orientacion.puntuaciones);
    const top3 = ranking.slice(0, 3);
    const resumenAbiertas = estado.orientacion.abiertas
      .map(function (r) { return r.pregunta + '\nRespuesta del alumno: ' + r.respuesta; })
      .join('\n\n');
    const resumenAreas = top3
      .map(function (r) { return '- ' + AREAS_INFO[r.area].nombre + ': ' + r.porcentaje + '% de afinidad'; })
      .join('\n');

    // Lo que el alumno escribió a mano en vez de elegir una opción. Va aparte
    // porque es donde suele estar lo más revelador: si alguien se ha molestado
    // en escribirlo es que ninguna opción le encajaba.
    const resumenLibres = estado.orientacion.libres.length
      ? '\n\nEn estas preguntas ninguna opción le encajaba y prefirió escribirlo:\n\n' +
        estado.orientacion.libres
          .map(function (r) { return r.pregunta + '\nEscribió: ' + r.respuesta; })
          .join('\n\n')
      : '';

    if (estado.modo === 'ia') {
      consultarIA(
        'Resultado del test de intereses vocacionales (áreas de mayor a menor afinidad):\n' + resumenAreas +
        resumenLibres +
        '\n\nRespuestas abiertas del alumno:\n\n' + resumenAbiertas,
        function (recomendacion) { ofrecerInformeOrientacion(recomendacion, ranking); },
        'orientacion_4eso'
      );
    } else {
      // Sin IA: recomendación determinista construida solo con el ranking de áreas
      indicadorEscribiendo(function () {
        const recomendacion = recomendacionDeterminista(ranking, estado.orientacion.abiertas);
        mensajeBot(markdownAHtml(recomendacion));
        ofrecerInformeOrientacion(recomendacion, ranking);
      }, 900);
    }
  }

  /**
   * Recomendación de reserva cuando no hay IA disponible. Se apoya en el
   * área mejor puntuada del test (dato objetivo) y afina Bachillerato/FP
   * mirando solo la respuesta abierta sobre plazo, mucho más barato que
   * analizar todo el texto libre.
   */
  function recomendacionDeterminista(ranking, abiertas) {
    const mejor = ranking[0];
    const info = AREAS_INFO[mejor.area];
    const respuestaPlazo = normalizar((abiertas.filter(function (r) { return r.clave === 'plazo'; })[0] || {}).respuesta || '');

    const indiciosPracticos = ['practico', 'manos', 'hacer', 'taller', 'trabajar', 'oficio',
      'montar', 'arreglar', 'reparar', 'construir', 'antes', 'pronto', 'dinero'];
    const indiciosAcademicos = ['teoria', 'estudiar', 'leer', 'universidad', 'carrera',
      'investigar', 'entender', 'varios años', 'seguir estudiando'];

    let practico = 0, academico = 0;
    indiciosPracticos.forEach(function (t) { if (respuestaPlazo.indexOf(t) !== -1) practico++; });
    indiciosAcademicos.forEach(function (t) { if (respuestaPlazo.indexOf(t) !== -1) academico++; });

    const via = practico > academico
      ? '**Formación Profesional de Grado Medio**, en la familia de **' + info.fp + '**. ' +
        'Se aprende haciendo, incluye prácticas reales en empresas y permite incorporarse antes al mercado laboral. ' +
        'Un Grado Medio **no cierra ninguna puerta**: da acceso directo a un Grado Superior, y desde ahí se puede ' +
        'llegar a la universidad convalidando créditos.'
      : '**Bachillerato de ' + info.bachillerato + '**. Te permitirá profundizar en las materias que se relacionan ' +
        'con tu perfil y acceder después a estudios como ' + info.ejemplos + '.';

    return '**Orientación personalizada**\n\n' +
      'Según tus respuestas, tu área de mayor afinidad es **' + info.nombre + '** (' + mejor.porcentaje + '%). ' +
      'La opción que mejor encaja con ese perfil es ' + via +
      '\n\nOtras áreas donde también muestras interés: **' + AREAS_INFO[ranking[1].area].nombre + '** y ' +
      '**' + AREAS_INFO[ranking[2].area].nombre + '**.' +
      '\n\nAntes de decidir, te recomiendo hablarlo con el **departamento de orientación** del centro: ' +
      'conocen tu expediente y pueden afinar mucho más esta valoración.';
  }

  function ofrecerInformeOrientacion(recomendacion, ranking) {
    mensajeBot(
      'Te he dejado un <strong>informe con tu perfil y la orientación</strong>. ' +
      'Puedes guardarlo o enseñárselo a quien tú quieras.<br><br>' +
      '<small>🔒 Se genera aquí, en tu dispositivo. No queda ninguna copia.</small>',
      crearBotones([
        { etiqueta: '📄 Descargar mi informe', eco: false, alPulsar: function () {
            generarInformeOrientacion(recomendacion, ranking);
          } },
        { etiqueta: '📞 Pedir cita con Orientación', alPulsar: function () { pintarFormulario('orientacion'); } },
        BOTON.menu()
      ])
    );
  }

  /**
   * Genera el informe como documento HTML autónomo y lo entrega al alumno.
   * Se construye entero en el navegador: no viaja a ningún servidor.
   */
  function generarInformeOrientacion(recomendacion, ranking) {
    const centro = estado.config.centro;
    const fecha = new Date().toLocaleDateString('es-ES',
      { day: 'numeric', month: 'long', year: 'numeric' });

    function escapar(t) {
      return String(t == null ? '' : t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Solo se muestran las áreas con señal real. Si el alumno ha contestado de
    // forma muy concentrada, varias empatan en el mínimo y saldrían al 0 %:
    // ver "0 %" en tu propio informe desanima y además no aporta nada.
    const conSenal = (ranking || []).filter(function (r) { return r.porcentaje > 0; });
    const barras = (conSenal.length ? conSenal : (ranking || [])).slice(0, 5).map(function (r) {
      const info = AREAS_INFO[r.area];
      return '<div class="area"><p class="area-nombre">' + escapar(info.nombre) + ' · ' + r.porcentaje + '%</p>' +
             '<div class="area-fondo"><div class="area-relleno" style="width:' + r.porcentaje + '%"></div></div></div>';
    }).join('');

    const bloques = estado.orientacion.libres
      .concat(estado.orientacion.abiertas)
      .map(function (r) {
        return '<div class="bloque"><p class="pregunta">' + escapar(r.pregunta) + '</p>' +
               '<p class="respuesta">' + escapar(r.respuesta) + '</p></div>';
      }).join('');

    const recomendacionHtml = escapar(recomendacion)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    const color = escapar(estado.config.marca.color_primario || '#0f172a');

    // Hoja de estilo del informe, compacta y sin dependencias externas:
    // el documento debe poder abrirse y guardarse sin conexión.
    const estilos = [
      '*{box-sizing:border-box}',
      'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;color:#1e293b;max-width:760px;margin:0 auto;padding:40px 24px;background:#fff}',
      'h1{font-size:24px;margin:0 0 4px}',
      'h2{font-size:16px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin:32px 0 12px;padding-bottom:8px;border-bottom:1px solid #e2e8f0}',
      '.cabecera{border-bottom:3px solid ' + color + ';padding-bottom:16px;margin-bottom:8px}',
      '.meta{color:#64748b;font-size:14px;margin:0}',
      '.bloque{margin-bottom:18px;padding-left:14px;border-left:3px solid #e2e8f0}',
      '.pregunta{font-weight:600;margin:0 0 4px;font-size:15px}',
      '.respuesta{margin:0;color:#334155;white-space:pre-wrap}',
      '.area{margin-bottom:14px}',
      '.area-nombre{margin:0 0 6px;font-size:14px;font-weight:600}',
      '.area-fondo{background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden}',
      '.area-relleno{background:' + color + ';height:100%;border-radius:6px}',
      '.recomendacion{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px}',
      '.pie{margin-top:36px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px}',
      '.acciones{margin:28px 0;text-align:center}',
      'button{background:' + color + ';color:#fff;border:0;padding:12px 24px;border-radius:8px;font-size:15px;cursor:pointer}',
      '@media print{.acciones{display:none}body{padding:0}}'
    ].join('');

    const documento =
      '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Informe de orientación académica</title><style>' + estilos + '</style></head><body>' +
      '<div class="cabecera"><h1>Informe de orientación académica</h1>' +
      '<p class="meta">' + escapar(centro.nombre) + ' · ' + escapar(fecha) + '</p></div>' +
      '<div class="acciones"><button onclick="window.print()">🖨️ Imprimir o guardar como PDF</button></div>' +
      '<h2>Tu perfil de intereses</h2>' + barras +
      '<h2>Tus respuestas</h2>' + bloques +
      '<h2>Orientación</h2><div class="recomendacion">' + recomendacionHtml + '</div>' +
      '<p class="pie">Este informe es orientativo y se ha generado automáticamente a partir de las ' +
      'respuestas facilitadas por el alumno. No sustituye la valoración del departamento de ' +
      'orientación del centro, que dispone del expediente académico completo.<br><br>' +
      'Documento generado en el dispositivo del usuario. No se ha almacenado ninguna copia.</p>' +
      '</body></html>';

    // Vía preferente: abrir en una pestaña con botón de impresión
    const ventana = window.open('', '_blank');
    if (ventana && ventana.document) {
      ventana.document.write(documento);
      ventana.document.close();
      return;
    }

    // Si el navegador bloquea las ventanas emergentes, se descarga el archivo
    const blob = new Blob([documento], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'informe-orientacion.html';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* =======================================================================
     10. FORMULARIOS INTEGRADOS
     ======================================================================= */

  function esEmailValido(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim());
  }

  function esTelefonoValido(telefono, prefijo) {
    const limpio = String(telefono).replace(/\D/g, '');
    if (prefijo === '+34') return /^[6789]\d{8}$/.test(limpio);
    return limpio.length >= 8 && limpio.length <= 12;
  }

  function esNombreValido(nombre) {
    const limpio = String(nombre).trim();
    return limpio.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(limpio);
  }

  const TIPOS_FORMULARIO = {
    visita: {
      titulo: '📝 Solicitud de visita o información',
      subtitulo: 'Déjanos tus datos y te contactamos para concertar una visita al centro.',
      etiquetaEnvio: 'Enviar solicitud'
    },
    orientacion: {
      titulo: '🎓 Cita con el Departamento de Orientación',
      subtitulo: 'Rellena estos datos y el orientador del centro se pondrá en contacto contigo.',
      etiquetaEnvio: 'Solicitar cita'
    },
    tramite: {
      titulo: '📄 Solicitud de trámite',
      subtitulo: 'Indícanos qué necesitas y secretaría te responderá.',
      etiquetaEnvio: 'Enviar solicitud'
    }
  };

  // Definición de los campos. Añadir uno nuevo es añadir una línea aquí,
  // no repetir otro bloque de HTML.
  const CAMPOS_FORMULARIO = [
    { id: 'nombre',   etiqueta: 'Nombre y apellidos *', tipo: 'text',     auto: 'name',  hueco: 'Ej.: María García López', error: 'Introduce un nombre y apellidos válidos.' },
    { id: 'email',    etiqueta: 'Correo electrónico *', tipo: 'email',    auto: 'email', hueco: 'Ej.: familia@correo.es',  error: 'Introduce un correo electrónico válido.' },
    { id: 'telefono', etiqueta: 'Teléfono *',           tipo: 'tel',      auto: 'tel',   hueco: '600 000 000',             error: 'Introduce un teléfono válido.', prefijo: true },
    { id: 'mensaje',  etiqueta: 'Cuéntanos brevemente qué necesitas', tipo: 'textarea', hueco: 'Opcional' }
  ];

  const PREFIJOS = ['🇪🇸 +34', '🇫🇷 +33', '🇵🇹 +351', '🇮🇹 +39', '🇬🇧 +44', '🇲🇦 +212', '🇷🇴 +40'];

  function pintarFormulario(tipo) {
    if (!estado.config.funcionalidades.formularios) { mostrarContacto(); return; }

    const def = TIPOS_FORMULARIO[tipo] || TIPOS_FORMULARIO.tramite;
    const idForm = 'form-' + tipo + '-' + Date.now();
    const avisoUrl = estado.config.privacidad.url_aviso_privacidad;

    const campos = CAMPOS_FORMULARIO.map(function (campo) {
      const idCampo = idForm + '-' + campo.id;
      const control = campo.tipo === 'textarea'
        ? '<textarea id="' + idCampo + '" class="chat-form-textarea" rows="3" placeholder="' + campo.hueco + '"></textarea>'
        : '<input type="' + campo.tipo + '" id="' + idCampo + '" class="chat-form-input' +
          (campo.prefijo ? ' chat-phone-input' : '') + '" autocomplete="' +
          (campo.auto || 'off') + '" placeholder="' + campo.hueco + '">';

      const selector = campo.prefijo
        ? '<select id="' + idForm + '-prefijo" class="chat-form-select chat-prefix-select" aria-label="Prefijo telefónico">' +
          PREFIJOS.map(function (p, i) {
            return '<option value="' + p.split(' ')[1] + '"' + (i === 0 ? ' selected' : '') + '>' + p + '</option>';
          }).join('') + '</select>'
        : '';

      return '<div class="chat-form-group">' +
               '<label for="' + idCampo + '">' + campo.etiqueta + '</label>' +
               (campo.prefijo ? '<div class="chat-phone-group">' + selector + control + '</div>' : control) +
               (campo.error ? '<div class="chat-form-error" id="' + idForm + '-err-' + campo.id + '">⚠️ ' + campo.error + '</div>' : '') +
             '</div>';
    }).join('');

    const tarjeta = nuevoElemento('div', 'chat-form-card');
    tarjeta.innerHTML =
      '<h4>' + sanear(def.titulo) + '</h4>' +
      '<p class="chat-form-subtitle">' + sanear(def.subtitulo) + '</p>' +
      '<form id="' + idForm + '" novalidate>' + campos +
        '<div class="chat-form-group">' +
          '<label class="chat-form-check">' +
            '<input type="checkbox" id="' + idForm + '-consent">' +
            '<span>He leído y acepto que mis datos se usen para atender esta solicitud.' +
              (avisoUrl ? ' <a href="' + sanear(avisoUrl) + '" target="_blank" rel="noopener noreferrer">Aviso de privacidad</a>.' : '') +
            '</span>' +
          '</label>' +
          '<div class="chat-form-error" id="' + idForm + '-err-consent">⚠️ Debes aceptarlo para poder enviar la solicitud.</div>' +
        '</div>' +
        // El RGPD obliga a informar del plazo de conservación en el momento
        // de recoger el dato, no después (art. 13).
        '<p class="chat-form-rgpd">🔒 <span>Tus datos se usarán solo para atender esta solicitud y se ' +
          'conservarán ' + Math.round((estado.config.privacidad.retencion_solicitudes_dias || 365) / 30) +
          ' meses como máximo.</span></p>' +
        '<button type="submit" class="form-submit-btn">' + sanear(def.etiquetaEnvio) + '</button>' +
      '</form>';

    cuerpoChat.appendChild(tarjeta);
    irAlFinal();

    const form = tarjeta.querySelector('#' + idForm);
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      enviarFormulario(form, idForm, tipo, tarjeta);
    });
  }

  function enviarFormulario(form, idForm, tipo, tarjeta) {
    const valor = function (sufijo) {
      const campo = form.querySelector('#' + idForm + sufijo);
      return campo ? campo.value : '';
    };
    const marcarError = function (sufijo, hayError) {
      const aviso = form.querySelector('#' + idForm + '-err-' + sufijo);
      const campo = form.querySelector('#' + idForm + '-' + sufijo);
      if (aviso) aviso.classList.toggle('visible', hayError);
      if (campo) campo.classList.toggle('input-invalid', hayError);
      return !hayError;
    };

    const nombre = valor('-nombre');
    const email = valor('-email');
    const prefijo = valor('-prefijo');
    const telefono = valor('-telefono');
    const mensaje = valor('-mensaje');
    const consentimiento = form.querySelector('#' + idForm + '-consent').checked;

    const okNombre = marcarError('nombre', !esNombreValido(nombre));
    const okEmail = marcarError('email', !esEmailValido(email));
    const okTelefono = marcarError('telefono', !esTelefonoValido(telefono, prefijo));
    const okConsent = marcarError('consent', !consentimiento);

    if (!okNombre || !okEmail || !okTelefono || !okConsent) return;

    const datos = {
      tipo: tipo,
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: prefijo + ' ' + telefono.trim(),
      mensaje: mensaje.trim()
    };

    const boton = form.querySelector('.form-submit-btn');
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    // Modo mailto: sin servidor. Abre el cliente de correo de la familia.
    if (estado.config.solicitudes.destino === 'mailto') {
      const destino = estado.config.solicitudes.email_destino || estado.config.centro.email;
      const asunto = encodeURIComponent('Solicitud desde el asistente web · ' + tipo);
      const cuerpo = encodeURIComponent(
        'Nombre: ' + datos.nombre + '\nEmail: ' + datos.email +
        '\nTeléfono: ' + datos.telefono + '\n\nMensaje:\n' + datos.mensaje
      );
      window.location.href = 'mailto:' + destino + '?subject=' + asunto + '&body=' + cuerpo;
      confirmarEnvio(tarjeta, true);
      return;
    }

    fetch(rutaApi('/api/solicitudes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function () { confirmarEnvio(tarjeta, true); })
      .catch(function () {
        // Si el servidor no responde, no se pierde la solicitud: se ofrece
        // el correo directo como alternativa.
        confirmarEnvio(tarjeta, false);
      });
  }

  function confirmarEnvio(tarjeta, correcto) {
    tarjeta.remove();

    if (correcto) {
      mensajeBot(
        '✅ <strong>Solicitud enviada correctamente.</strong><br><br>' +
        'Secretaría se pondrá en contacto contigo lo antes posible. ¡Gracias!',
        crearBotones([BOTON.menu()])
      );
      return;
    }

    const c = estado.config.centro;
    mensajeBot(
      '⚠️ No he podido enviar la solicitud en este momento.<br><br>' +
      'Puedes escribirnos directamente a <a href="mailto:' + encodeURIComponent(c.email) + '">' +
      sanear(c.email) + '</a> o llamar al <a href="tel:' +
      encodeURIComponent(String(c.telefono).replace(/\s/g, '')) + '">' + sanear(c.telefono) + '</a>.',
      crearBotones([BOTON.menu()])
    );
  }

  /* =======================================================================
     11. BUZÓN DE PREGUNTAS SIN RESPUESTA (PLAN ESSENTIAL)
     ======================================================================= */

  /**
   * Pantalla del botón «✍️ Escribir mi pregunta». Essential no tiene IA ni
   * casilla de escribir libre, así que hoy una familia que no encuentra su
   * respuesta se va sin dejar rastro. Esto es solo un buzón: deja clarísimo
   * que aquí no se contesta, para que la familia no se quede esperando y
   * llame a secretaría si de verdad necesita una respuesta.
   */
  function mostrarPantallaEscribirPregunta() {
    const c = estado.config.centro;
    const telLimpio = String(c.telefono || '').replace(/\s/g, '');

    let contacto = '';
    if (c.telefono) {
      contacto += 'llama al <a href="tel:' + encodeURIComponent(telLimpio) + '"><strong>' +
        sanear(c.telefono) + '</strong></a>';
    }
    if (c.email) {
      contacto += (contacto ? ' o escribe a ' : 'escribe a ') +
        '<a href="mailto:' + encodeURIComponent(c.email) + '"><strong>' + sanear(c.email) + '</strong></a>';
    }

    mensajeBot(
      'Escribe qué es lo que buscabas y no has encontrado.<br><br>' +
      'Ojo: por aquí no vas a recibir respuesta. Esta casilla es solo para que sepamos qué te falta y mejoremos el asistente.' +
      (contacto ? '<br><br>Si necesitas que te contesten, ' + contacto + '.' : '') +
      '<br><br><small>No hace falta que escribas datos personales: con el texto de tu pregunta basta.</small>'
    );

    pintarFormularioPregunta();
  }

  function pintarFormularioPregunta() {
    const idForm = 'form-pregunta-' + Date.now();

    const tarjeta = nuevoElemento('div', 'chat-form-card');
    tarjeta.innerHTML =
      '<form id="' + idForm + '" novalidate>' +
        '<div class="chat-form-group">' +
          '<label for="' + idForm + '-texto">Tu pregunta</label>' +
          '<textarea id="' + idForm + '-texto" class="chat-form-textarea" rows="3" maxlength="500" ' +
            'placeholder="Escribe aquí lo que buscabas…"></textarea>' +
          '<div class="chat-form-error" id="' + idForm + '-err">⚠️ Escribe la pregunta antes de enviarla.</div>' +
        '</div>' +
        '<button type="submit" class="form-submit-btn">Enviar pregunta</button>' +
      '</form>';

    cuerpoChat.appendChild(tarjeta);
    irAlFinal();

    const form = tarjeta.querySelector('#' + idForm);
    const campo = tarjeta.querySelector('#' + idForm + '-texto');
    if (window.innerWidth > 600) campo.focus();

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      enviarPreguntaSugerida(form, idForm, tarjeta);
    });
  }

  function enviarPreguntaSugerida(form, idForm, tarjeta) {
    const campo = form.querySelector('#' + idForm + '-texto');
    const aviso = form.querySelector('#' + idForm + '-err');
    // Recorte también en el navegador: así la familia no escribe de más
    // para que luego el servidor se lo rechace por pasarse de 500 caracteres.
    const texto = campo.value.trim().slice(0, 500);

    if (!texto) {
      if (aviso) aviso.classList.add('visible');
      campo.classList.add('input-invalid');
      return;
    }
    aviso.classList.remove('visible');
    campo.classList.remove('input-invalid');

    const boton = form.querySelector('.form-submit-btn');
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    fetch(rutaApi('/api/preguntas-sugeridas'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: texto, centro: estado.config.centro.id })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function () { confirmarPreguntaEnviada(tarjeta, true); })
      .catch(function () { confirmarPreguntaEnviada(tarjeta, false); });
  }

  function confirmarPreguntaEnviada(tarjeta, correcto) {
    tarjeta.remove();

    if (correcto) {
      mensajeBot(
        '✅ <strong>Gracias.</strong> Tu pregunta queda anotada.<br><br>' +
        'Con ella ayudamos a mejorar el asistente.<br><br>' +
        'Recuerda: por aquí no vas a recibir respuesta.',
        crearBotones([BOTON.menu(), BOTON.contacto()])
      );
      return;
    }

    // Si el envío falla no se finge que se ha guardado: se dice con
    // honestidad y se deja el contacto directo, igual que en las solicitudes.
    const c = estado.config.centro;
    mensajeBot(
      '⚠️ No he podido guardar tu pregunta en este momento.<br><br>' +
      'Puedes escribirnos directamente a <a href="mailto:' + encodeURIComponent(c.email) + '">' +
      sanear(c.email) + '</a> o llamar al <a href="tel:' +
      encodeURIComponent(String(c.telefono).replace(/\s/g, '')) + '">' + sanear(c.telefono) + '</a>.',
      crearBotones([BOTON.menu()])
    );
  }

  /* =======================================================================
     12. ARRANQUE
     ======================================================================= */

  // Vuelca los colores del centro en las variables CSS del widget
  function aplicarMarca() {
    const marca = estado.config.marca || {};
    const destino = raiz && raiz.host ? raiz.host : document.documentElement;

    if (marca.color_primario) destino.style.setProperty('--primary', marca.color_primario);
    if (marca.color_primario_oscuro) destino.style.setProperty('--primary-hover', marca.color_primario_oscuro);
    if (marca.color_primario_claro) destino.style.setProperty('--primary-light', marca.color_primario_claro);
    if (marca.color_acento) destino.style.setProperty('--accent', marca.color_acento);

    if (estado.config.funcionalidades.modo_oscuro) {
      (widget || document.body).classList.add('tema-oscuro');
    }

    const titulo = buscarElemento('#chat-title');
    if (titulo && marca.titulo_widget) titulo.textContent = marca.titulo_widget;
    const subtitulo = buscarElemento('#chat-subtitle');
    if (subtitulo && marca.subtitulo_widget) subtitulo.textContent = marca.subtitulo_widget;
    if (burbuja && marca.mensaje_burbuja) burbuja.textContent = marca.mensaje_burbuja;
  }

  function buscarElemento(selector) {
    const ambito = raiz || document;
    return ambito.querySelector(selector);
  }

  // Construye la URL de un endpoint respetando el servidor configurado
  function rutaApi(camino) {
    return (estado.servidor || '') + camino;
  }

  function cargarJSON(ruta) {
    return fetch(ruta).then(function (r) { return r.ok ? r.json() : Promise.reject(); });
  }

  function inicializarElementos() {
    widget = buscarElemento('#salesianas-chat-widget') || buscarElemento('.asistente-widget');
    cuerpoChat = buscarElemento('#chat-body');
    campoTexto = buscarElemento('#chat-user-input') || buscarElemento('#chat-input');
    botonEnviar = buscarElemento('#chat-send-btn');
    botonAbrir = buscarElemento('#chat-trigger-btn');
    botonCerrar = buscarElemento('#chat-close-btn');
    burbuja = buscarElemento('#chat-cue-bubble');
    avisoPie = buscarElemento('#chat-aviso-modo');

    // Si la página no trae el aviso de modo básico, se crea al vuelo
    if (!avisoPie && widget) {
      const pie = buscarElemento('.chat-credits');
      if (pie) {
        avisoPie = document.createElement('div');
        avisoPie.id = 'chat-aviso-modo';
        avisoPie.className = 'chat-aviso-modo';
        pie.parentNode.insertBefore(avisoPie, pie);
      }
    }
    return !!(widget && cuerpoChat);
  }

  function abrirChat() {
    if (!widget) return;
    widget.classList.add('chat-open');
    // childElementCount y no hasChildNodes(): el HTML de la página trae un
    // comentario dentro de #chat-body, y los comentarios cuentan como nodos
    // hijo. Con hasChildNodes() el menú de bienvenida no llegaba a pintarse.
    if (cuerpoChat.childElementCount === 0) mostrarMenuPrincipal();
    if (window.innerWidth > 600 && campoTexto) setTimeout(function () { campoTexto.focus(); }, 150);
    irAlFinal();
  }

  function cerrarChat() {
    if (!widget) return;
    widget.classList.remove('chat-open', 'chat-expanded');
    reiniciarConversacion(); // al cerrar, la conversación desaparece
  }

  function conectarEventos() {
    // Tabla de cableado: elemento, evento y qué hacer. Añadir un control
    // nuevo es añadir una fila, no otro bloque de tres líneas.
    const CABLEADO = [
      ['#chat-trigger-btn', 'click', function () {
        widget.classList.contains('chat-open') ? cerrarChat() : abrirChat();
      }],
      ['#chat-close-btn', 'click', cerrarChat],
      ['#chat-cue-bubble', 'click', abrirChat],
      ['#chat-send-btn', 'click', alEnviarTexto],
      ['#chat-reset-btn', 'click', function () {
        reiniciarConversacion();
        mostrarMenuPrincipal();
      }],
      ['#chat-expand-btn', 'click', function () {
        widget.classList.toggle('chat-expanded');
        irAlFinal();
      }],
      ['#chat-input, #chat-user-input', 'keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); alEnviarTexto(); }
      }]
    ];

    CABLEADO.forEach(function (fila) {
      const elemento = buscarElemento(fila[0]);
      if (elemento) elemento.addEventListener(fila[1], fila[2]);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !widget || !widget.classList.contains('chat-open')) return;
      if (widget.classList.contains('chat-expanded')) widget.classList.remove('chat-expanded');
      else cerrarChat();
    });

    // Botones que abren el chat en un punto concreto. Se buscan dentro del
    // widget y también en la web del centro, para que el colegio pueda poner
    // un data-abrir-chat="orientacion" en cualquier botón suyo.
    const FLUJOS = {
      orientacion: iniciarOrientacion,
      admisiones: function () { mostrarPreguntasCategoria('admisiones'); },
      calendario: function () { pintarCalendario(true); }
    };

    [].concat(
      raiz ? Array.prototype.slice.call(raiz.querySelectorAll('[data-abrir-chat]')) : [],
      Array.prototype.slice.call(document.querySelectorAll('[data-abrir-chat]'))
    ).forEach(function (boton) {
      boton.addEventListener('click', function () {
        abrirChat();
        const flujo = FLUJOS[boton.getAttribute('data-abrir-chat')];
        if (flujo) setTimeout(flujo, 300);
      });
    });
  }

  // Vacía la conversación. RGPD: no debe quedar rastro al cerrar o reiniciar.
  function reiniciarConversacion() {
    estado.historial = [];
    estado.orientacion = { activo: false, respuestas: [], paso: 0 };
    cuerpoChat.innerHTML = '';
  }

  /**
   * Punto de entrada. Se expone en window.AsistenteEscolar para que el
   * cargador del widget (widget.js) pueda arrancarlo dentro de un Shadow DOM.
   */
  function arrancar(opciones) {
    opciones = opciones || {};
    raiz = opciones.raiz || null;
    estado.servidor = (opciones.servidor || '').replace(/\/$/, '');
    const base = opciones.base || '';

    if (!inicializarElementos()) return;
    conectarEventos();

    Promise.all([
      /* Se pide al servidor, que devuelve solo la parte pública. Si no hay
         servidor (modo suelto, o el producto sin IA), se cae al archivo que
         esté junto a la página.
         Si responde de verdad, ya sabemos que hay un servidor detrás aunque
         la IA esté apagada (comprobarServidor no llega a mirarlo en ese
         caso): es la señal de «mismo origen responde» que necesita el botón
         de escribir la pregunta en Essential. */
      cargarJSON(rutaApi('/api/configuracion'))
        .then(function (datos) { estado.hayServidor = true; return datos; })
        .catch(function () { return cargarJSON(base + 'configuracion_centro.json'); })
        .catch(function () { return null; }),
      cargarJSON(base + 'preguntas_frecuentes.json').catch(function () { return null; })
    ]).then(function (resultados) {
      if (resultados[0]) {
        // Se fusiona con la configuración de emergencia para que nunca
        // falte una clave aunque el archivo del centro esté incompleto.
        estado.config = Object.assign({}, CONFIG_EMERGENCIA, resultados[0]);
        Object.keys(CONFIG_EMERGENCIA).forEach(function (clave) {
          if (typeof CONFIG_EMERGENCIA[clave] === 'object' && CONFIG_EMERGENCIA[clave] !== null) {
            estado.config[clave] = Object.assign({}, CONFIG_EMERGENCIA[clave], resultados[0][clave] || {});
          }
        });
      }
      if (resultados[1] && resultados[1].categorias) {
        /* Se filtra aquí, al cargar, y no en cada menú: así el plan lo respetan
           por igual los botones, el buscador local y las fichas de categoría,
           sin tener que acordarse en cada sitio. */
        estado.conocimiento = Object.assign({}, resultados[1], {
          categorias: resultados[1].categorias.filter(function (cat) {
            return planIncluye(cat.plan_minimo || 'essential');
          })
        });
      }

      aplicarMarca();

      if (!estado.config.funcionalidades.busqueda_libre) {
        const pie = buscarElemento('.chat-footer');
        if (pie) pie.style.display = 'none';
      }

      return comprobarServidor();
    }).then(function () {
      if (widget && widget.classList.contains('chat-open')) mostrarMenuPrincipal();
    });
  }

  window.AsistenteEscolar = { arrancar: arrancar, estado: estado };

  // Arranque automático cuando el widget ya está en la página (modo demo)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (document.getElementById('salesianas-chat-widget')) arrancar({});
    });
  } else if (document.getElementById('salesianas-chat-widget')) {
    arrancar({});
  }

})();
