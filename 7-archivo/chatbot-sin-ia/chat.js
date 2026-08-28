/**
 * =======================================================================
 * SECRETARÍA VIRTUAL - CENTRO EDUCATIVO MODELO (VERSIÓN DETERMINISTA)
 * ASISTENTE DIGITAL INTERACTIVO PARA COLEGIOS E INSTITUTOS
 * 100% FRONTEND | 0% IA | GUIADO POR BOTONES | DETERMINISTA Y PRIVADO
 * =======================================================================
 */

(function () {
  'use strict';

  // Base de datos embebida institucional para demostraciones
  const FALLBACK_FAQS = {
    "centro": {
      "nombre": "Centro Educativo Modelo",
      "direccion": "Av. de la Educación, 24",
      "telefono": "900 123 456",
      "email": "secretaria@centroeducativo.es",
      "horario_secretaria": "Lunes a Viernes: 09:00 - 14:00 | Tardes: 16:00 - 18:00"
    },
    "categorias": [
      {
        "id": "admisiones",
        "icono": "🏫",
        "titulo": "Buscamos plaza (Admisiones y Visitas)",
        "descripcion": "Jornadas de puertas abiertas, escolarización y solicitud de entrevista personalizada.",
        "preguntas": [
          {
            "id": "adm_fechas",
            "pregunta": "¿Cuándo son las jornadas de puertas abiertas y admisiones?",
            "keywords": ["puertas abiertas", "visita", "conocer el centro", "admision", "plazas", "preinscripcion", "fechas", "cuando"],
            "respuesta": "Las <strong>Jornadas de Puertas Abiertas</strong> se organizan periódicamente antes del proceso oficial de escolarización. Si deseas una visita personalizada con el equipo directivo, puedes solicitar cita directamente a través de nuestro formulario o escribiendo a <strong>secretaria@centroeducativo.es</strong>."
          },
          {
            "id": "adm_etapas",
            "pregunta": "¿Qué etapas educativas se imparten en el centro?",
            "keywords": ["etapas", "cursos", "infantil", "primaria", "secundaria", "eso", "bachillerato", "fp", "grados", "edad"],
            "respuesta": "Ofrecemos un itinerario pedagógico completo y continuo:<br>• <strong>Educación Infantil:</strong> 3 a 6 años.<br>• <strong>Educación Primaria:</strong> 6 a 12 años.<br>• <strong>Educación Secundaria Obligatoria (ESO):</strong> 12 a 16 años.<br>• <strong>Bachillerato:</strong> Modalidades de Ciencias y Tecnología, Humanidades y Ciencias Sociales, Artes y General.<br>• <strong>Formación Profesional:</strong> Grado Básico, Medio y Superior."
          },
          {
            "id": "adm_criterios",
            "pregunta": "¿Cómo funciona el baremo de puntos y criterios de admisión?",
            "keywords": ["puntos", "baremo", "criterios", "hermanos", "proximidad", "domicilio", "renta"],
            "respuesta": "El proceso de admisión escolar se rige por el baremo normativo oficial. Se otorgan puntuaciones por:<br>1. Existencia de hermanos matriculados en el centro.<br>2. Proximidad del domicilio familiar o del lugar de trabajo.<br>3. Rentas de la unidad familiar, familias numerosas o monoparentales.<br>4. Criterio complementario aprobado por el Consejo Escolar."
          },
          {
            "id": "adm_solicitar_visita",
            "pregunta": "¿Cómo concertar una entrevista o visita personalizada?",
            "keywords": ["visita", "entrevista", "cita previa", "reunion", "conocer"],
            "respuesta": "Puedes concertar una visita guiada a nuestras instalaciones y una reunión informativa con Dirección completando este breve formulario:",
            "accion": "formulario_admisiones"
          }
        ]
      },
      {
        "id": "infantil",
        "icono": "🧸",
        "titulo": "Educación Infantil (3 a 6 años)",
        "descripcion": "Comedor con siesta, horarios, aula de madrugadores, cuotas y justificación de faltas.",
        "preguntas": [
          {
            "id": "inf_comedor_siesta",
            "pregunta": "🍲 Comedor Escolar y Siesta Asistida",
            "keywords": ["comedor infantil", "siesta", "comida", "alergias", "intolerancias", "celiacos", "menu infantil"],
            "respuesta": "En <strong>Educación Infantil</strong> disponemos de cocina propia con menús diarios adaptados por nutricionistas para todo tipo de alergias e intolerancias.<br><br>• <strong>Horario:</strong> De 12:30 a 15:30 h con monitoras especializadas.<br>• <strong>Siesta supervisada:</strong> Espacio de descanso adaptado con camas individuales para 1º y 2º de Infantil (13:30 a 14:30 h).<br>• <strong>Altas y bajas:</strong> Se gestionan antes del día 25 del mes anterior."
          },
          {
            "id": "inf_horarios_madrugadores",
            "pregunta": "⏰ Horarios, Entradas y Aula Madrugadores",
            "keywords": ["horario infantil", "madrugadores", "entrada", "salida", "recogida"],
            "respuesta": "• <strong>Horario lectivo:</strong> De 09:00 a 12:30 h y de 15:30 a 17:00 h (jornada intensiva según calendario oficial).<br>• <strong>Aula de Madrugadores:</strong> Servicio matinal disponible desde las 07:30 / 07:45 h con opción de desayuno supervisado.<br>• <strong>Entradas y salidas:</strong> Accesos adaptados con recepción directa por el equipo docente."
          },
          {
            "id": "inf_pagos_recibos",
            "pregunta": "💳 Pagos, Cuotas y Recibos Bancarios",
            "keywords": ["pagos infantil", "cuotas", "recibos", "banco", "domiciliacion", "portal"],
            "respuesta": "Los recibos de servicios complementarios (comedor, madrugadores y actividades) se domicilian mensualmente a primeros de mes.<br><br>Las familias pueden consultar el detalle de facturación desde la plataforma escolar. Para incidencias, contacta con administración en <strong>secretaria@centroeducativo.es</strong>."
          },
          {
            "id": "inf_justificar_faltas",
            "pregunta": "📝 Justificar Ausencias y Faltas de Asistencia",
            "keywords": ["falta infantil", "ausencia", "justificar", "medico", "enfermo"],
            "respuesta": "Las ausencias se notifican y justifican preferentemente a través de la aplicación del centro o informando a la tutora a la entrada. Si la ausencia se debe a motivos médicos, se recomienda comunicarlo para coordinar la vuelta a clase."
          }
        ]
      },
      {
        "id": "primaria",
        "icono": "📚",
        "titulo": "Educación Primaria (6 a 12 años)",
        "descripcion": "Comedor con estudio dirigido, horarios, banco de libros, pagos y faltas.",
        "preguntas": [
          {
            "id": "pri_comedor_estudio",
            "pregunta": "🍲 Comedor Escolar y Estudio Dirigido",
            "keywords": ["comedor primaria", "estudio dirigido", "patio", "ludoteca", "menu"],
            "respuesta": "El servicio de comedor en <strong>Primaria</strong> cuenta con supervisión pedagógica continua.<br><br>• <strong>Horario:</strong> 12:30 a 15:30 h.<br>• <strong>Aula de Estudio Dirigido:</strong> Espacio silencioso supervisado para realización de tareas y fomento de la lectura.<br>• <strong>Actividades de recreo:</strong> Dinamización deportiva y talleres en patio."
          },
          {
            "id": "pri_horarios",
            "pregunta": "⏰ Horarios de Clases y Calendario Escolar",
            "keywords": ["horario primaria", "entradas primaria", "calendario escolar"],
            "respuesta": "• <strong>Horario lectivo ordinario:</strong> De 09:00 a 12:30 h y de 15:30 a 17:00 h.<br>• <strong>Atención a familias:</strong> Tutorías individuales concertadas con cita previa a través del portal de familias.<br>• <strong>Puntualidad:</strong> Se ruega máxima puntualidad en las franjas de entrada y salida."
          },
          {
            "id": "pri_libros",
            "pregunta": "🎒 Banco de Libros y Material Escolar",
            "keywords": ["banco de libros", "libros primaria", "becas libros", "material escolar"],
            "respuesta": "El centro participa en el <strong>Programa de Banco de Libros y Gratuidad</strong>:<br><br>• <strong>Adhesión y renovación:</strong> Convocatoria anual al finalizar el curso lectivo.<br>• <strong>Lotes de libros:</strong> Entrega organizada al inicio del curso en septiembre.<br>• El material fungible y cuadernillos de actividades se gestionan según las indicaciones del equipo docente."
          },
          {
            "id": "pri_pagos_actividades",
            "pregunta": "💳 Pagos de Actividades y Salidas Culturales",
            "keywords": ["pagos primaria", "excursiones primaria", "salidas", "recibos"],
            "respuesta": "Las excursiones, salidas culturales y talleres se autorizan y abonan digitalmente a través del portal escolar de forma segura mediante pasarela TPV."
          },
          {
            "id": "pri_justificar_faltas",
            "pregunta": "📝 Justificar Falta de Asistencia",
            "keywords": ["falta primaria", "justificante medico", "ausencia primaria"],
            "respuesta": "Toda falta debe justificarse mediante la app escolar o aportando el volante o justificante médico correspondiente a la tutora en un plazo máximo de 48 horas desde la reincorporación."
          }
        ]
      },
      {
        "id": "eso",
        "icono": "🎓",
        "titulo": "Educación Secundaria (ESO)",
        "descripcion": "Horarios matinales, comedor, tutorías, pagos de salidas y justificación de faltas.",
        "preguntas": [
          {
            "id": "eso_horarios_tutorias",
            "pregunta": "⏰ Horarios de Clases y Atención a Familias",
            "keywords": ["horario eso", "clases secundaria", "tutorias eso"],
            "respuesta": "• <strong>Horario lectivo ESO:</strong> De 08:30 a 14:30 h (jornada continua de mañanas).<br>• <strong>Atención a familias:</strong> Horas de atención de tutoría semanal con cita previa concertada por la plataforma escolar.<br>• <strong>Guardias y permanencia:</strong> Control estricto de entradas y salidas del recinto."
          },
          {
            "id": "eso_comedor_estudio",
            "pregunta": "🍲 Comedor Escolar y Aula de Estudio en ESO",
            "keywords": ["comedor eso", "comer secundaria", "aula estudio eso"],
            "respuesta": "Los alumnos de Secundaria pueden hacer uso del comedor al finalizar su jornada lectiva (14:30 a 15:30 h), disponiendo de instalaciones de biblioteca y aula de estudio supervisada."
          },
          {
            "id": "eso_justificar_faltas",
            "pregunta": "📝 Justificar Faltas y Notificación de Ausencias",
            "keywords": ["faltas eso", "justificante medico eso", "ausencias secundaria"],
            "respuesta": "El registro de asistencia se efectúa hora a hora. Los tutores legales deben comunicar y justificar cualquier falta o retraso mediante la plataforma oficial del centro en un plazo no superior a 48 horas."
          },
          {
            "id": "eso_pagos_salidas",
            "pregunta": "💳 Pagos de Actividades y Excursiones de ESO",
            "keywords": ["pagos eso", "viaje estudios", "excursiones eso", "recibos eso"],
            "respuesta": "Las salidas pedagógicas, intercambios y viajes de fin de etapa se tramitan y abonan digitalmente desde la plataforma escolar. Para información sobre becas o facilidades de pago, consulta en Secretaría."
          }
        ]
      },
      {
        "id": "bachillerato",
        "icono": "🏛️",
        "titulo": "Bachillerato (1º y 2º)",
        "descripcion": "Modalidades de Bachillerato, orientación universitaria, EvAU, horarios y faltas.",
        "preguntas": [
          {
            "id": "bach_modalidades",
            "pregunta": "📚 Modalidades e Itinerarios de Bachillerato",
            "keywords": ["modalidades bachillerato", "ciencias", "humanidades", "artes", "general", "itinerarios"],
            "respuesta": "Impartimos las modalidades oficiales de Bachillerato adaptadas a todas las vocaciones de futuro:<br><br>• <strong>Ciencias y Tecnología:</strong> Itinerarios de Ingeniería, Ciencias de la Salud y Tecnología.<br>• <strong>Humanidades y Ciencias Sociales:</strong> Derecho, ADE, Economía, Humanidades y Comunicación.<br>• <strong>Bachillerato General y Artes:</strong> Itinerarios multidisciplinares y creativos."
          },
          {
            "id": "bach_evau",
            "pregunta": "🎯 Preparación EvAU / PAU y Orientación Universitaria",
            "keywords": ["evau", "selectividad", "pau", "universidad", "notas de corte", "orientacion"],
            "respuesta": "Contamos con un programa específico de preparación para las pruebas de acceso a la Universidad (EvAU / PAU):<br><br>• Simulacros periódicos de examen con criterios oficiales de corrección.<br>• Talleres de ponderaciones, notas de corte y becas universitarias.<br>• Acompañamiento individual por el Departamento de Orientación."
          },
          {
            "id": "bach_horarios",
            "pregunta": "⏰ Horarios de Clases y Tutorías",
            "keywords": ["horarios bachillerato", "tutorias bachillerato", "clases"],
            "respuesta": "• <strong>Horario lectivo:</strong> De 08:15 a 14:45 h en turno matinal.<br>• <strong>Tutorías académicas:</strong> Sesiones individualizadas de seguimiento de rendimiento y preparación de pruebas."
          },
          {
            "id": "bach_faltas",
            "pregunta": "📝 Justificar Faltas de Asistencia en Bachillerato",
            "keywords": ["faltas bachillerato", "asistencia bachillerato", "justificante"],
            "respuesta": "Debido a la importancia de la evaluación continua, las ausencias deben justificarse con documento oficial (médico, deber inexcusable) en un plazo de 48 horas a través del portal de gestión escolar."
          },
          {
            "id": "bach_pagos",
            "pregunta": "💳 Pagos de Tasas y Salidas Pedagógicas",
            "keywords": ["pagos bachillerato", "tasas bachillerato", "excursiones"],
            "respuesta": "La gestión de salidas académicas, visitas universitarias y tasas de gestión se realiza de forma centralizada mediante la plataforma digital del centro."
          }
        ]
      },
      {
        "id": "fp",
        "icono": "💼",
        "titulo": "Formación Profesional (FP)",
        "descripcion": "Ciclos oficiales, FP Dual remunerada, convenios con empresas, tasas y convalidaciones.",
        "preguntas": [
          {
            "id": "fp_ciclos",
            "pregunta": "💼 Ciclos Formativos Impartidos (Básica, Medio y Superior)",
            "keywords": ["ciclos fp", "grados fp", "fp basica", "grado medio", "grado superior"],
            "respuesta": "Ofrecemos títulos oficiales de Formación Profesional con alta inserción laboral:<br><br>• <strong>FP Básica:</strong> 2 cursos lectivos con titulación profesional y graduado en ESO.<br>• <strong>FP Grado Medio:</strong> 2 cursos lectivos con prácticas FCT y opción bilingüe.<br>• <strong>FP Grado Superior:</strong> Modalidades presencial, FP Dual y semipresencial / online con acceso directo a la Universidad."
          },
          {
            "id": "fp_dual_practicas",
            "pregunta": "🤝 FP Dual y Prácticas en Empresa (FCT)",
            "keywords": ["fp dual", "practicas fct", "convenio empresas", "bolsa empleo"],
            "respuesta": "• <strong>FCT (Formación en Centros de Trabajo):</strong> Módulo obligatorio en segundo curso con estancias reales en empresas colaboradoras.<br>• <strong>FP Dual:</strong> Formación en alternancia con contrato retribuido en empresas concertadas.<br>• Bolsa de empleo activa para titulados con alta tasa de contratación."
          },
          {
            "id": "fp_tasas_pagos",
            "pregunta": "💳 Pagos de Matrícula y Tasas de Título Oficial",
            "keywords": ["tasas fp", "pago matricula fp", "titulo oficial fp", "precio fp"],
            "respuesta": "La expedición del <strong>Título Oficial de FP</strong> requiere la liquidación de la tasa oficial correspondiente. Las instrucciones y cartas de pago se facilitan desde la Secretaría del centro escribiendo a <strong>secretaria@centroeducativo.es</strong>."
          },
          {
            "id": "fp_convalidaciones",
            "pregunta": "📋 Convalidaciones y Exención de Prácticas FCT",
            "keywords": ["convalidar fp", "exencion fct", "experiencia laboral fp"],
            "respuesta": "• <strong>Convalidación de módulos:</strong> Se solicita en el primer mes de curso aportando certificado oficial de estudios cursados.<br>• <strong>Exención de FCT:</strong> Requiere acreditar al menos 1 año de experiencia laboral afín a jornada completa mediante certificado de vida laboral y contratos."
          },
          {
            "id": "fp_horarios_secretaria",
            "pregunta": "⏰ Horarios de Clases y Secretaría de FP",
            "keywords": ["horario fp", "secretaria fp", "atencion fp"],
            "respuesta": "• <strong>Horario lectivo FP:</strong> Turno matinal de 08:30 a 14:30 h.<br>• <strong>Atención de Secretaría FP:</strong> Lunes a viernes de 09:00 a 14:00 h.<br>Teléfono: <strong>900 123 456</strong> | Email: <strong>secretaria@centroeducativo.es</strong>."
          }
        ]
      }
    ]
  };

  let knowledgeData = FALLBACK_FAQS;
  let chatWidget, chatBody, chatInput, sendBtn, triggerBtn, closeBtn, cueBubble;

  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    loadKnowledgeBase();
    renderWelcomeTriage();
  });

  function loadKnowledgeBase() {
    fetch('preguntas_frecuentes.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data && data.categorias) {
          knowledgeData = data;
        }
      })
      .catch(() => {
        knowledgeData = FALLBACK_FAQS;
      });
  }

  function initElements() {
    chatWidget = document.getElementById('salesianas-chat-widget');
    chatBody = document.getElementById('chat-body');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('chat-send-btn');
    triggerBtn = document.getElementById('chat-trigger-btn');
    closeBtn = document.getElementById('chat-close-btn');
    cueBubble = document.getElementById('chat-cue-bubble');

    const heroBtn = document.getElementById('hero-chat-btn');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => openChat());
    }
  }

  function initEventListeners() {
    if (triggerBtn) triggerBtn.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', closeChat);
    if (cueBubble) cueBubble.addEventListener('click', openChat);
    if (sendBtn) sendBtn.addEventListener('click', handleUserTextInput);
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUserTextInput();
        }
      });
    }

    const resetBtn = document.getElementById('chat-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        chatBody.innerHTML = '';
        renderWelcomeTriage();
      });
    }

    const expandBtn = document.getElementById('chat-expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', toggleExpandChat);
    }

    // Tecla Escape para salir de pantalla grande o cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatWidget.classList.contains('chat-open')) {
        if (chatWidget.classList.contains('chat-expanded')) {
          toggleExpandChat();
        } else {
          closeChat();
        }
      }
    });
  }

  function toggleExpandChat() {
    chatWidget.classList.toggle('chat-expanded');
    scrollToBottom();
  }

  function toggleChat() {
    if (chatWidget.classList.contains('chat-open')) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    chatWidget.classList.add('chat-open');
    if (window.innerWidth > 600 && chatInput) {
      setTimeout(() => chatInput.focus(), 150);
    }
    scrollToBottom();
  }

  function closeChat() {
    chatWidget.classList.remove('chat-open');
    chatWidget.classList.remove('chat-expanded');
  }

  function scrollToBottom() {
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    let safe = temp.innerHTML;
    safe = safe.replace(/&lt;strong&gt;/gi, '<strong>').replace(/&lt;\/strong&gt;/gi, '</strong>');
    safe = safe.replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>');
    safe = safe.replace(/&lt;em&gt;/gi, '<em>').replace(/&lt;\/em&gt;/gi, '</em>');
    safe = safe.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
    safe = safe.replace(/&lt;ul&gt;/gi, '<ul>').replace(/&lt;\/ul&gt;/gi, '</ul>');
    safe = safe.replace(/&lt;li&gt;/gi, '<li>').replace(/&lt;\/li&gt;/gi, '</li>');
    safe = safe.replace(/&lt;a\s+href="([^"]+)"(?:\s+target="([^"]+)")?(?:\s+rel="([^"]+)")?&gt;/gi, '<a href="$1" target="_blank" rel="noopener">');
    safe = safe.replace(/&lt;\/a&gt;/gi, '</a>');
    return safe;
  }

  function getTimestamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendBotMessage(htmlContent, extraElements = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = htmlContent;
    msgDiv.appendChild(bubble);

    if (extraElements) {
      msgDiv.appendChild(extraElements);
    }

    const time = document.createElement('span');
    time.className = 'message-time';
    time.innerText = getTimestamp();
    msgDiv.appendChild(time);

    chatBody.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    msgDiv.appendChild(bubble);

    const time = document.createElement('span');
    time.className = 'message-time';
    time.innerText = getTimestamp();
    msgDiv.appendChild(time);

    chatBody.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator(callback, duration = 400) {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatBody.appendChild(typing);
    scrollToBottom();

    setTimeout(() => {
      typing.remove();
      if (typeof callback === 'function') callback();
    }, duration);
  }

  function createOptionsContainer(options) {
    const container = document.createElement('div');
    container.className = 'chat-quick-options';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quick-option-btn';
      btn.innerHTML = `<span>${opt.label}</span><svg viewBox="0 0 24 24"><path d="M8.59,16.59L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.59Z"/></svg>`;

      btn.addEventListener('click', () => {
        if (opt.userEcho !== false) {
          appendUserMessage(opt.echoText || opt.label);
        }
        showTypingIndicator(() => opt.onClick());
      });

      container.appendChild(btn);
    });

    return container;
  }

  // TRIAGE INICIAL (2 OPCIONES LIMPIAS)
  function renderWelcomeTriage() {
    const welcomeHtml = `¡Hola! Te damos la bienvenida a la <strong>Secretaría Virtual del Centro Educativo Modelo</strong>.<br><br>¿En qué podemos ayudarte hoy?`;
    
    const options = [
      {
        label: '🏫 Buscamos plaza (Admisiones y Visitas)',
        onClick: () => showCategoryQuestions('admisiones')
      },
      {
        label: '🎒 Ya somos familia del centro',
        onClick: () => showSchoolFamilyMenu()
      },
      {
        label: '📅 Calendario Escolar y Vacaciones',
        onClick: () => renderCalendarCard()
      }
    ];

    appendBotMessage(welcomeHtml, createOptionsContainer(options));
  }

  function showSchoolFamilyMenu() {
    const text = `Selecciona la <strong>etapa educativa</strong> para consultar sus servicios y trámites:`;
    const cats = (knowledgeData.categorias || []).filter(c => c.id !== 'admisiones');

    const options = cats.map(cat => ({
      label: `${cat.icono || '📌'} ${cat.titulo}`,
      onClick: () => showCategoryQuestions(cat.id)
    }));

    options.push({
      label: '🏠 Volver al inicio',
      userEcho: false,
      onClick: () => renderWelcomeTriage()
    });

    appendBotMessage(text, createOptionsContainer(options));
  }

  function showCategoryQuestions(categoryId) {
    const cat = (knowledgeData.categorias || []).find(c => c.id === categoryId);
    if (!cat) {
      appendBotMessage('No se ha encontrado la etapa solicitada.', createOptionsContainer([
        { label: '🏠 Volver al menú principal', onClick: () => renderWelcomeTriage() }
      ]));
      return;
    }

    let intro = `Has seleccionado <strong>${cat.titulo}</strong>.<br><br>¿Qué información o trámite deseas consultar?`;
    const options = (cat.preguntas || []).map(p => ({
      label: p.pregunta,
      echoText: p.pregunta,
      onClick: () => displayAnswer(p, categoryId)
    }));

    options.push({
      label: categoryId === 'admisiones' ? '⬅️ Volver al menú principal' : '⬅️ Volver a etapas educativas',
      userEcho: false,
      onClick: () => categoryId === 'admisiones' ? renderWelcomeTriage() : showSchoolFamilyMenu()
    });

    appendBotMessage(intro, createOptionsContainer(options));

    if (categoryId === 'admisiones') {
      renderOfficialLinkCard();
    }
  }

  // Enlace directo al portal oficial del Gobierno para escolarización/admisiones
  function renderOfficialLinkCard() {
    const linkCard = document.createElement('a');
    linkCard.className = 'chat-link-card';
    linkCard.href = 'https://educa.aragon.es/-/admision-erg-ere';
    linkCard.target = '_blank';
    linkCard.rel = 'noopener noreferrer';

    linkCard.innerHTML = `
      <span class="chat-link-icon" aria-hidden="true">🏛️</span>
      <span class="chat-link-body">
        <span class="chat-link-title">Escolarización Oficial (Gobierno de Aragón)</span>
        <span class="chat-link-desc">Plazos, normativa y solicitud de plaza en el portal oficial de admisión.</span>
      </span>
      <span class="chat-link-arrow" aria-hidden="true">↗</span>
    `;

    chatBody.appendChild(linkCard);
    scrollToBottom();
  }

  function displayAnswer(preguntaObj, categoryId) {
    let answerHtml = preguntaObj.respuesta;
    const options = [];

    if (preguntaObj.accion === 'formulario_admisiones') {
      appendBotMessage(answerHtml);
      renderFormularioAdmisiones();
      return;
    }

    options.push({
      label: '✅ Duda resuelta, ¡gracias!',
      onClick: () => {
        appendBotMessage('¡Nos alegra haberte ayudado! ¿Deseas consultar alguna otra etapa o trámite?', createOptionsContainer([
          { label: '🎒 Ver Etapas Educativas', onClick: () => showSchoolFamilyMenu() },
          { label: '🏠 Menú Principal', onClick: () => renderWelcomeTriage() }
        ]));
      }
    });

    options.push({
      label: '📞 Contactar con Secretaría',
      onClick: () => showContactInfo()
    });

    options.push({
      label: '⬅️ Ver más opciones de esta etapa',
      userEcho: false,
      onClick: () => showCategoryQuestions(categoryId)
    });

    appendBotMessage(answerHtml, createOptionsContainer(options));
  }

  // Helper de validación de correo real
  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(String(email).trim());
  }

  // Helper de validación de teléfono real según prefijo
  function isValidPhone(phone, prefix) {
    const clean = String(phone).replace(/\D/g, '');
    if (prefix === '+34') {
      return /^[6789]\d{8}$/.test(clean);
    }
    return clean.length >= 8 && clean.length <= 12;
  }

  // Helper de validación de nombre real
  function isValidName(name) {
    const trimmed = String(name).trim();
    return trimmed.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed);
  }

  function renderFormularioAdmisiones() {
    const formCard = document.createElement('div');
    formCard.className = 'chat-form-card';
    formCard.innerHTML = `
      <h4>📝 Solicitud de Información / Visita</h4>
      <p class="chat-form-subtitle">Rellena los datos para concertar una visita o solicitar información:</p>
      <form id="form-admisiones" novalidate>
        <div class="chat-form-group">
          <label for="adm-nombre">Nombre y Apellidos *</label>
          <input type="text" id="adm-nombre" class="chat-form-input" required placeholder="Ej: Familia García Martínez" autocomplete="name">
          <div class="chat-form-error" id="err-adm-nombre">⚠️ Por favor, introduce un nombre y apellidos válidos.</div>
        </div>
        
        <div class="chat-form-group">
          <label for="adm-telefono">Teléfono de Contacto *</label>
          <div class="chat-phone-group">
            <select class="chat-prefix-select" id="adm-prefix" aria-label="Prefijo de país">
              <option value="+34" data-len="9" data-placeholder="612 345 678" selected>🇪🇸 +34</option>
              <option value="+40" data-len="10" data-placeholder="712 345 678">🇷🇴 +40</option>
              <option value="+33" data-len="9" data-placeholder="6 12 34 56 78">🇫🇷 +33</option>
              <option value="+351" data-len="9" data-placeholder="912 345 678">🇵🇹 +351</option>
              <option value="+39" data-len="10" data-placeholder="312 345 6789">🇮🇹 +39</option>
              <option value="+44" data-len="10" data-placeholder="7911 123456">🇬🇧 +44</option>
              <option value="+49" data-len="11" data-placeholder="1512 3456789">🇩🇪 +49</option>
              <option value="+212" data-len="9" data-placeholder="612 345 678">🇲🇦 +212</option>
              <option value="+380" data-len="9" data-placeholder="50 123 4567">🇺🇦 +380</option>
              <option value="+86" data-len="11" data-placeholder="131 2345 6789">🇨🇳 +86</option>
              <option value="+57" data-len="10" data-placeholder="300 123 4567">🇨🇴 +57</option>
              <option value="+593" data-len="9" data-placeholder="99 123 4567">🇪🇨 +593</option>
              <option value="+51" data-len="9" data-placeholder="912 345 678">🇵🇪 +51</option>
              <option value="+58" data-len="10" data-placeholder="412 123 4567">🇻🇪 +58</option>
              <option value="+54" data-len="10" data-placeholder="11 1234 5678">🇦🇷 +54</option>
              <option value="+52" data-len="10" data-placeholder="55 1234 5678">🇲🇽 +52</option>
              <option value="+55" data-len="11" data-placeholder="11 91234 5678">🇧🇷 +55</option>
              <option value="+56" data-len="9" data-placeholder="9 1234 5678">🇨🇱 +56</option>
              <option value="+591" data-len="8" data-placeholder="7123 4567">🇧🇴 +591</option>
              <option value="+1" data-len="10" data-placeholder="555 123 4567">🇺🇸 +1</option>
              <option value="+1" data-len="10" data-placeholder="416 123 4567">🇨🇦 +1</option>
              <option value="+32" data-len="9" data-placeholder="470 12 34 56">🇧🇪 +32</option>
              <option value="+31" data-len="9" data-placeholder="6 12345678">🇳🇱 +31</option>
              <option value="+41" data-len="9" data-placeholder="78 123 45 67">🇨🇭 +41</option>
              <option value="+48" data-len="9" data-placeholder="512 345 678">🇵🇱 +48</option>
              <option value="+359" data-len="9" data-placeholder="87 123 4567">🇧🇬 +359</option>
              <option value="+221" data-len="9" data-placeholder="77 123 45 67">🇸🇳 +221</option>
              <option value="+213" data-len="9" data-placeholder="551 23 45 67">🇩🇿 +213</option>
              <option value="+595" data-len="9" data-placeholder="981 123 456">🇵🇾 +595</option>
              <option value="+598" data-len="8" data-placeholder="99 123 456">🇺🇾 +598</option>
              <option value="+53" data-len="8" data-placeholder="5 123 4567">🇨🇺 +53</option>
              <option value="+63" data-len="10" data-placeholder="917 123 4567">🇵🇭 +63</option>
            </select>
            <input type="tel" id="adm-telefono" class="chat-form-input chat-phone-input" required placeholder="612 345 678" maxlength="9" inputmode="numeric" autocomplete="tel">
          </div>
          <div class="chat-form-error" id="err-adm-tel">⚠️ Introduce un teléfono válido de 9 dígitos reales (ej: 612345678).</div>
        </div>

        <div class="chat-form-group">
          <label for="adm-email">Correo Electrónico *</label>
          <input type="email" id="adm-email" class="chat-form-input" required placeholder="ejemplo@correo.com" autocomplete="email">
          <div class="chat-form-error" id="err-adm-email">⚠️ Introduce un correo electrónico real con formato usuario@dominio.com</div>
        </div>

        <div class="chat-form-group">
          <label for="adm-curso">Etapa Educativa de Interés *</label>
          <select id="adm-curso" class="chat-form-select" required>
            <option value="">Selecciona etapa educativa...</option>
            <option value="Educación Infantil (3 a 6 años)">Educación Infantil (3 a 6 años)</option>
            <option value="Educación Primaria (1º a 6º)">Educación Primaria (1º a 6º)</option>
            <option value="Educación Secundaria Obligatoria (ESO)">Educación Secundaria Obligatoria (ESO)</option>
            <option value="Bachillerato">Bachillerato (Ciencias, CCSS, Artes, General)</option>
            <option value="Formación Profesional">Formación Profesional (Básica, Medio, Superior)</option>
          </select>
          <div class="chat-form-error" id="err-adm-curso">⚠️ Por favor, selecciona una etapa educativa.</div>
        </div>

        <div class="chat-form-group">
          <label for="adm-comentarios">Comentarios adicionales o dudas</label>
          <textarea id="adm-comentarios" class="chat-form-textarea" rows="2" placeholder="Indícanos si buscas plaza para este curso o el próximo..."></textarea>
        </div>

        <button type="submit" class="form-submit-btn">Enviar Solicitud Segura</button>

        <div class="chat-form-rgpd">
          <svg viewBox="0 0 24 24"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7A2,2 0 0,1 14,9A2,2 0 0,1 12,11A2,2 0 0,1 10,9A2,2 0 0,1 12,7M16,15.23C16,16.03 13.97,16.9 12,16.9C10.03,16.9 8,16.03 8,15.23V14.5C8,13.84 10.67,13.5 12,13.5C13.33,13.5 16,13.84 16,14.5V15.23Z"/></svg>
          <span><strong>Protección de Datos (RGPD):</strong> Tus datos se tratan exclusivamente por el Centro Educativo para gestionar esta solicitud escolar. No se ceden a terceros. Ejercicio de derechos: <a href="mailto:secretaria@centroeducativo.es">secretaria@centroeducativo.es</a>.</span>
        </div>
      </form>
    `;

    const form = formCard.querySelector('#form-admisiones');
    const prefixSelect = formCard.querySelector('#adm-prefix');
    const telInput = formCard.querySelector('#adm-telefono');
    const nameInput = formCard.querySelector('#adm-nombre');
    const emailInput = formCard.querySelector('#adm-email');
    const cursoSelect = formCard.querySelector('#adm-curso');

    prefixSelect.addEventListener('change', () => {
      const opt = prefixSelect.selectedOptions[0];
      const maxLen = parseInt(opt.getAttribute('data-len') || '9');
      const placeholder = opt.getAttribute('data-placeholder') || '600 000 000';
      telInput.maxLength = maxLen;
      telInput.placeholder = placeholder;
      if (telInput.value.length > maxLen) {
        telInput.value = telInput.value.slice(0, maxLen);
      }
      formCard.querySelector('#err-adm-tel').innerText = `⚠️ Introduce un teléfono válido de ${maxLen} dígitos para ${opt.text}.`;
    });

    telInput.addEventListener('input', () => {
      telInput.value = telInput.value.replace(/\D/g, '');
      const opt = prefixSelect.selectedOptions[0];
      const maxLen = parseInt(opt.getAttribute('data-len') || '9');
      if (telInput.value.length > maxLen) {
        telInput.value = telInput.value.slice(0, maxLen);
      }
      telInput.classList.remove('input-invalid');
      formCard.querySelector('#err-adm-tel').classList.remove('visible');
    });

    nameInput.addEventListener('input', () => {
      nameInput.classList.remove('input-invalid');
      formCard.querySelector('#err-adm-nombre').classList.remove('visible');
    });

    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('input-invalid');
      formCard.querySelector('#err-adm-email').classList.remove('visible');
    });

    cursoSelect.addEventListener('change', () => {
      cursoSelect.classList.remove('input-invalid');
      formCard.querySelector('#err-adm-curso').classList.remove('visible');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let hasError = false;

      const nombre = nameInput.value.trim();
      const prefix = prefixSelect.value;
      const tel = telInput.value.trim();
      const email = emailInput.value.trim();
      const curso = cursoSelect.value;

      if (!isValidName(nombre)) {
        nameInput.classList.add('input-invalid');
        formCard.querySelector('#err-adm-nombre').classList.add('visible');
        hasError = true;
      }

      if (!isValidPhone(tel, prefix)) {
        telInput.classList.add('input-invalid');
        const opt = prefixSelect.selectedOptions[0];
        const len = opt.getAttribute('data-len') || '9';
        formCard.querySelector('#err-adm-tel').innerText = prefix === '+34' 
          ? '⚠️ Introduce un teléfono español válido de 9 dígitos (empieza por 6, 7, 8 o 9).' 
          : `⚠️ Introduce un teléfono válido de ${len} dígitos para ${opt.text}.`;
        formCard.querySelector('#err-adm-tel').classList.add('visible');
        hasError = true;
      }

      if (!isValidEmail(email)) {
        emailInput.classList.add('input-invalid');
        formCard.querySelector('#err-adm-email').classList.add('visible');
        hasError = true;
      }

      if (!curso) {
        cursoSelect.classList.add('input-invalid');
        formCard.querySelector('#err-adm-curso').classList.add('visible');
        hasError = true;
      }

      if (hasError) return;

      const fullPhone = `${prefix} ${tel}`;
      const comentarios = formCard.querySelector('#adm-comentarios') ? formCard.querySelector('#adm-comentarios').value.trim() : '';

      try {
        const stored = JSON.parse(localStorage.getItem('salesianas_solicitudes') || '[]');
        stored.unshift({
          fecha: new Date().toISOString(),
          tramite: 'Admisión y Visita Guiada',
          nombre: nombre,
          curso: curso,
          telefono: fullPhone,
          email: email,
          mensaje: comentarios || 'Solicitud de plaza / visita'
        });
        localStorage.setItem('salesianas_solicitudes', JSON.stringify(stored));
      } catch (e) {
        console.warn('Almacenamiento local no disponible', e);
      }

      formCard.remove();
      appendUserMessage(`Solicitud enviada para ${curso}`);

      showTypingIndicator(() => {
        const confirmMsg = `✅ <strong>¡Solicitud de Admisión Registrada!</strong><br><br>Muchas gracias, <strong>${sanitizeHTML(nombre)}</strong>. Hemos guardado tus datos para la etapa de <strong>${sanitizeHTML(curso)}</strong>.<br><br>📧 Email: <strong>${sanitizeHTML(email)}</strong><br>📞 Teléfono: <strong>${sanitizeHTML(fullPhone)}</strong><br><br>El equipo de Secretaría y Admisiones se pondrá en contacto contigo a la mayor brevedad.`;
        appendBotMessage(confirmMsg, createOptionsContainer([
          { label: '🏠 Volver al Inicio', onClick: () => renderWelcomeTriage() }
        ]));
      }, 500);
    });

    chatBody.appendChild(formCard);
    scrollToBottom();
  }

  // CALENDARIO ESCOLAR (fecha de hoy 100% dinámica, equivalente a =HOY())
  const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const INICIALES_DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function toISODate(dateObj) {
    return `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
  }

  function shiftISODate(y, m, d, offsetDays) {
    const base = new Date(y, m - 1, d);
    base.setDate(base.getDate() + offsetDays);
    return toISODate(base);
  }

  // Algoritmo de Meeus/Jones/Butcher para calcular el Domingo de Resurrección de cualquier año
  function calcularDomingoResurreccion(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
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
    return new Date(year, mes - 1, dia);
  }

  // Genera los períodos de vacaciones y festivos sueltos para el año indicado
  function getCalendarioEscolar(year) {
    const resurreccion = calcularDomingoResurreccion(year);
    const semanaSantaInicio = shiftISODate(resurreccion.getFullYear(), resurreccion.getMonth() + 1, resurreccion.getDate(), -7);
    const semanaSantaFin = shiftISODate(resurreccion.getFullYear(), resurreccion.getMonth() + 1, resurreccion.getDate(), 1);

    const vacaciones = [
      { inicio: `${year - 1}-12-23`, fin: `${year}-01-07`, label: 'Vacaciones de Navidad' },
      { inicio: semanaSantaInicio, fin: semanaSantaFin, label: 'Vacaciones de Semana Santa' },
      { inicio: `${year}-06-23`, fin: `${year}-08-31`, label: 'Vacaciones de Verano' },
      { inicio: `${year}-12-23`, fin: `${year + 1}-01-07`, label: 'Vacaciones de Navidad' }
    ];

    const festivos = [
      { fecha: `${year}-05-01`, label: 'Día del Trabajo' },
      { fecha: `${year}-10-12`, label: 'Fiesta Nacional de España' },
      { fecha: `${year}-11-01`, label: 'Todos los Santos' },
      { fecha: `${year}-12-06`, label: 'Día de la Constitución' },
      { fecha: `${year}-12-08`, label: 'Inmaculada Concepción' }
    ];

    return { vacaciones, festivos };
  }

  function buscarVacacion(dateStr, vacaciones) {
    const match = vacaciones.find(v => dateStr >= v.inicio && dateStr <= v.fin);
    return match ? match.label : null;
  }

  function buscarFestivo(dateStr, festivos) {
    const match = festivos.find(f => f.fecha === dateStr);
    return match ? match.label : null;
  }

  function renderMiniMes(year, monthIndex, todayISO, vacaciones, festivos) {
    const primerDia = new Date(year, monthIndex, 1);
    let desplazamiento = primerDia.getDay() - 1; // Semana empieza en Lunes
    if (desplazamiento < 0) desplazamiento = 6;
    const diasEnMes = new Date(year, monthIndex + 1, 0).getDate();

    let celdas = '';
    for (let i = 0; i < desplazamiento; i++) {
      celdas += '<span class="cal-day cal-empty"></span>';
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const dateStr = `${year}-${pad2(monthIndex + 1)}-${pad2(dia)}`;
      const esHoy = dateStr === todayISO;
      const labelVacacion = buscarVacacion(dateStr, vacaciones);
      const labelFestivo = buscarFestivo(dateStr, festivos);

      let clases = 'cal-day';
      let titulo = '';
      if (labelVacacion) { clases += ' cal-vacation'; titulo = labelVacacion; }
      if (labelFestivo) { clases += ' cal-festivo'; titulo = labelFestivo; }
      if (esHoy) { clases += ' cal-today'; titulo = titulo ? `Hoy · ${titulo}` : 'Hoy'; }

      const atributoTitulo = titulo ? ` title="${sanitizeHTML(titulo)}"` : '';
      celdas += `<span class="${clases}"${atributoTitulo}>${dia}</span>`;
    }

    return `
      <div class="cal-month">
        <div class="cal-month-title">${NOMBRES_MESES[monthIndex]}</div>
        <div class="cal-weekdays">${INICIALES_DIAS_SEMANA.map(d => `<span>${d}</span>`).join('')}</div>
        <div class="cal-days">${celdas}</div>
      </div>
    `;
  }

  function renderCalendarCard() {
    const hoy = new Date(); // Dinámico: se recalcula en cada apertura, igual que =HOY()
    const year = hoy.getFullYear();
    const todayISO = toISODate(hoy);
    const { vacaciones, festivos } = getCalendarioEscolar(year);

    const mesesHtml = NOMBRES_MESES.map((_, idx) => renderMiniMes(year, idx, todayISO, vacaciones, festivos)).join('');
    const fechaLegible = hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const calCard = document.createElement('div');
    calCard.className = 'chat-form-card cal-card';
    calCard.innerHTML = `
      <h4>📅 Calendario Escolar ${year}</h4>
      <p class="chat-form-subtitle">Hoy es ${sanitizeHTML(fechaLegible)}.</p>
      <div class="cal-legend">
        <span class="cal-legend-item"><span class="cal-swatch cal-swatch-today"></span> Hoy</span>
        <span class="cal-legend-item"><span class="cal-swatch cal-swatch-vacation"></span> Vacaciones</span>
        <span class="cal-legend-item"><span class="cal-swatch cal-swatch-festivo"></span> Festivo</span>
      </div>
      <div class="cal-grid">${mesesHtml}</div>
    `;

    chatBody.appendChild(calCard);
    scrollToBottom();

    appendBotMessage('¿Necesitas alguna otra cosa?', createOptionsContainer([
      { label: '📞 Contactar con Secretaría', onClick: () => showContactInfo() },
      { label: '🏠 Menú Principal', onClick: () => renderWelcomeTriage() }
    ]));
  }

  function showContactInfo() {
    const contactHtml = `
      <strong>Centro Educativo Modelo · Secretaría Digital</strong><br>
      📍 Dirección: Av. de la Educación, 24<br>
      📞 Teléfono: <a href="tel:900123456"><strong>900 123 456</strong></a><br>
      ✉️ Email: <a href="mailto:secretaria@centroeducativo.es"><strong>secretaria@centroeducativo.es</strong></a><br><br>
      ⏰ <strong>Horario de Atención de Secretaría:</strong><br>
      • Lunes a Viernes: 09:00 - 14:00 h.<br>
      • Tardes: 16:00 - 18:00 h.
    `;

    appendBotMessage(contactHtml, createOptionsContainer([
      { label: '🏠 Menú Principal', onClick: () => renderWelcomeTriage() }
    ]));
  }

  // BUSCADOR LOCAL DIFUSO (100% Determinista y seguro)
  function handleUserTextInput() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    appendUserMessage(text);
    chatInput.value = '';

    showTypingIndicator(() => {
      const match = searchLocalFaqs(text);
      if (match) {
        appendBotMessage(`He encontrado información sobre tu consulta:<br><br><strong>${match.pregunta}</strong><br><br>${match.respuesta}`, createOptionsContainer([
          { label: '✅ Sí, duda resuelta', onClick: () => renderWelcomeTriage() },
          { label: '📞 Contactar con Secretaría', onClick: () => showContactInfo() },
          { label: '🏠 Ver Todas las Etapas', onClick: () => showSchoolFamilyMenu() }
        ]));
      } else {
        const notFoundHtml = `No he encontrado una respuesta exacta para <em>"${sanitizeHTML(text)}"</em>.<br><br>Por favor, navega por las etapas educativas o contacta con Secretaría:`;
        appendBotMessage(notFoundHtml, createOptionsContainer([
          { label: '🎒 Ver Etapas Educativas', onClick: () => showSchoolFamilyMenu() },
          { label: '📞 Contactar con Secretaría', onClick: () => showContactInfo() },
          { label: '🏠 Menú Principal', onClick: () => renderWelcomeTriage() }
        ]));
      }
    });
  }

  function searchLocalFaqs(query) {
    const qNorm = normalizeText(query);
    const tokens = qNorm.split(/\s+/).filter(t => t.length > 2);
    if (tokens.length === 0) return null;

    let bestMatch = null;
    let maxScore = 0;

    (knowledgeData.categorias || []).forEach(cat => {
      (cat.preguntas || []).forEach(p => {
        let score = 0;
        const pNorm = normalizeText(p.pregunta);
        const rNorm = normalizeText(p.respuesta);
        const kws = p.keywords || [];

        tokens.forEach(tok => {
          if (pNorm.includes(tok)) score += 3;
          if (rNorm.includes(tok)) score += 1;
          kws.forEach(kw => {
            if (normalizeText(kw).includes(tok)) score += 4;
          });
        });

        if (score > maxScore) {
          maxScore = score;
          bestMatch = p;
        }
      });
    });

    return maxScore >= 3 ? bestMatch : null;
  }

  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  }

})();
