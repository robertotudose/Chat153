# 🤖 Proyecto: Asistente Escolar · Nota principal

> **Última actualización: 19 de agosto de 2026.** El proyecto se ha reorganizado y el producto con IA se ha reescrito por completo (versión 3.0). Esta nota recoge el estado actual; lo anterior queda archivado en `05 - Archivo`.

## 📌 Estado actual en cuatro líneas

* **Dos productos, un mismo diseño:** `01 - Chatbot Sin IA` (determinista, coste cero) y `02 - Chatbot Con IA` (motor híbrido con IA). Comparten tipografía, paleta y componentes.
* **Genérico y configurable:** ya no está atado a ningún centro concreto. Adaptarlo a un colegio nuevo es editar `configuracion_centro.json`, sin tocar código.
* **Resistente:** si el servidor de IA cae, el asistente sigue respondiendo en modo determinista. No muestra pantallas de error.
* **Pendiente antes de producción:** ver `04 - Documentacion/revision_ingenieria.md`.

## 🗂️ Estructura de carpetas

```text
Chatbot/
├── README.md                  # Índice general del proyecto
├── 01 - Chatbot Sin IA/       # Producto determinista
├── 02 - Chatbot Con IA/       # Producto principal
├── 03 - Web SCHOLAIA/         # Web comercial (estática y React)
├── 04 - Documentacion/        # Guías, mapa legal, costes, revisión de ingeniería
├── 05 - Archivo/              # Histórico de versiones retiradas
└── Chatbot Salesianas.md      # Esta nota
```

## 🧠 Cómo responde el asistente

Tres niveles, del más barato al más caro: **botones** → **buscador local con tolerancia a erratas y sinónimos** → **IA generativa**. La mayoría de las consultas frecuentes se resuelven sin gastar un solo token.

## 📅 Los tres tipos de día del calendario

La duda más frecuente de las familias en centros concertados: los días de fiesta del centro **son lectivos y hay que asistir**, aunque no haya clase ordinaria. El calendario los distingue en violeta frente a las vacaciones (verde) y los festivos oficiales (ámbar), y tanto el buscador como la IA lo aclaran siempre.

## 🎓 Test de orientación de 4º de ESO

Quince preguntas (tres minutos), orientación personalizada e informe descargable que se genera **en el dispositivo del alumno**, sin pasar por el servidor. El test pregunta por situaciones concretas en vez de pedir autoevaluaciones abstractas, porque a los 15-16 años se acierta mucho más describiendo lo que uno hace que lo que uno cree ser.

---

> ⚠️ **Lo que sigue es material de la versión anterior**, conservado como referencia de contenidos escolares. Los datos concretos del Colegio María Auxiliadora ya no están en el producto, que es genérico.

---

## 📂 Estructura de Proyectos Independientes

El asistente ha sido segmentado en dos proyectos completamente autónomos y listos para producción:

### 🧠 1. [`ChatBot IA`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/) (Versión Avanzada con Gemini 1.5 Flash)
*   **Solapa destacada:** **🎓 4º ESO TEST (Ayuda a futuro)** — Orientador vocacional inteligente que evalúa aptitudes del alumno y recomienda Bachillerato o Ciclos de FP en Salesianas.
*   **Servidor Backend:** [`servidor_ia.js`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/servidor_ia.js) con Express, Rate Limiting (30 req/min), escudo anti-prompt injection y anonimización RGPD.
*   **Panel Administrativo:** [`dashboard.html`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/dashboard.html) con visualización de métricas en tiempo real y logs.
*   **Frontend y Base de Conocimientos:** [`index.html`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/index.html), [`chat.js`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/chat.js), [`preguntas_frecuentes.json`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/preguntas_frecuentes.json), [`style.css`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/02%20-%20Chatbot%20Con%20IA/style.css).

### ⚡ 2. [`ChatBot Sin IA`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/01%20-%20Chatbot%20Sin%20IA/) (Versión Determinista 100% Estática)
*   **Sin Dependencias:** No requiere Node.js, backend ni API Keys. Cero coste por tokens y 100% determinista.
*   **Enfoque de Secretaría Pura:** Triage directo de 2 vías (Admisiones y Familias con Comedor, Pagos, FP y Secretaría) sin cuestionario de 4º ESO ni dependencias de IA.
*   **Motor Frontend:** Buscador difuso local por coincidencia de palabras clave, árbol de navegación interactivo y formularios dinámicos integrados en el chat.
*   **Archivos:** [`index.html`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/01%20-%20Chatbot%20Sin%20IA/index.html), [`chat.js`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/01%20-%20Chatbot%20Sin%20IA/chat.js), [`preguntas_frecuentes.json`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/01%20-%20Chatbot%20Sin%20IA/preguntas_frecuentes.json), [`style.css`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/01%20-%20Chatbot%20Sin%20IA/style.css).

### 📚 3. Documentación y Operativa
*   [`mapa_legal.md`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/mapa_legal.md): Mapa legal y cumplimiento normativo (RGPD, Ley de IA UE 2024/1689, contratación pública y VERI*FACTU).
*   [`protocolo_incidentes.md`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/protocolo_incidentes.md): Protocolo de actuación ante incidentes de seguridad (ScholaIA / AvisIA).
*   [`infraestructura_y_costes.md`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/infraestructura_y_costes.md): Especificaciones técnicas del VPS, arquitectura multi-tenant y desglose de costes (~30-40 €/mes para 5 colegios).
*   [`guia_tecnica.md`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/guia_tecnica.md): Guía de despliegue web e integración.
*   **Informes y Documentos PDF:**
    *   [`Protocolo Incidentes Seguridad - ScholaIA.pdf`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/PDF/Protocolo%20Incidentes%20Seguridad%20-%20ScholaIA.pdf)
    *   [`Manual Técnico - Chatbot Salesianas Zaragoza.pdf`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/PDF/Manual%20T%C3%A9cnico%20-%20Chatbot%20Salesianas%20Zaragoza.pdf)
    *   [`Propuesta Comercial - Asistente Digital Salesianas.pdf`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/PDF/Propuesta%20Comercial%20-%20Asistente%20Digital%20Salesianas.pdf)
    *   [`Nota de Actualización Técnica v2.0 - Chatbot Salesianas.pdf`](file:///Users/robertotudose/Documents/-Cerebro%20IA%20%F0%9F%A7%A0-/10%20-%20Proyectos/Chatbot/04%20-%20Documentacion/PDF/Nota%20de%20Actualizacio%CC%81n%20Te%CC%81cnica%20v2.0%20-%20Chatbot%20Salesianas.pdf)

---

## 🧸 1. Resumen de Etapas Escolares y Módulo 4º ESO
El chatbot cuenta con un **Selector de Módulos Inicial** que permite a las familias filtrar las FAQs e inyectar contexto automático a la IA de Gemini 1.5 Flash según el nivel escolar del alumno.

### 🧸 Educación Infantil (3 a 6 años)
*   **Servicio de Comedor:** Incluye descanso y siesta supervisada por personal especializado en aula adaptada (de 13:30 a 14:30 h).
*   **Período de Adaptación:** Primeros 4 días lectivos de septiembre de forma escalonada. Los horarios definitivos se notifican en julio.
*   **Uniforme e Higiene:** Obligatorio el chándal oficial del centro y el babi/bata escolar con el nombre bordado.
*   **Materiales Escolares:** Gestionados de forma común mediante una cuota cooperativa de aula; no se adquieren libros de texto individuales.

### 🎒 Educación Primaria (6 a 12 años)
*   **Comedor y Aula de Estudio:** El comedor opera de 12:30 a 15:30 h. Los cursos superiores (4º, 5º y 6º) disponen de aula de estudio dirigida obligatoria a partir de las 14:30 h.
*   **Banco de Libros:** Adherido al sistema oficial de Banco de Libros de Aragón. Préstamo de lotes de libros completos con tasa de adhesión en junio y devolución en buen estado en junio del año siguiente.
*   **Actividades Extraescolares:** Coordinadas por el AMPA y empresas asociadas (deportes, artes y tecnología/robótica). El pago se realiza por recibo bancario domiciliado mensual; las altas y bajas se tramitan antes del día 25 del mes anterior.

### 📚 Educación Secundaria (ESO)
*   **Justificación de Faltas:** Debe realizarse por los tutores legales de forma digital a través del portal **Alexia**, o bien aportando el justificante médico físico al tutor en un plazo máximo de 48 horas.
*   **Horarios y Tutorías:** Jornada partida (08:30 a 13:00 h y 15:00 a 17:00 h). Miércoles por la tarde libre. Las tutorías con profesores se solicitan mediante Alexia.
*   **Excursiones:** Autorización digital firmada en línea por familias y pagos centralizados con pasarela TPV digital.

### 💼 Formación Profesional (FP)
*   **Oferta de Ciclos:** FP Básica (Servicios Administrativos), Grado Medio (Gestión Administrativa bilingüe) y Grado Superior (Administración y Finanzas). Modalidades presencial, Dual y Online (a distancia).
*   **Prácticas en Empresas:** FCT no remunerada en segundo año. FP Dual que combina formación y trabajo remunerado mediante contrato de formación.
*   **Trámites de Convalidación y Exención:**
    *   *Convalidación:* Primer mes del curso escolar presentando certificado académico previo.
    *   *Exención de FCT:* Acreditar al menos 1 año de experiencia laboral jornada completa en puestos similares mediante vida laboral y certificado de funciones.

---

## 🛡️ 2. Auditoría y Arquitectura de Seguridad

Como parte de las tareas del auditor de seguridad, se ha evaluado e implementado el siguiente esquema de protección:

### ⚡ 2.1. Rate Limiting (Límite de Tasa por IP)
*   **Mecanismo:** Limitador de tasa en memoria dentro del backend en Express.
*   **Configuración:** Máximo de **30 consultas por minuto** por dirección IP.
*   **Comportamiento ante abusos:** Bloqueo automático por IP que devuelve un código de estado HTTP `429` (Too Many Requests), mostrando un mensaje amigable al usuario que le pide esperar un minuto antes de reintentar. Esto protege al backend de sobrecostes por abuso de tokens en la API de Gemini o denegación de servicio (DoS).

### 🦹 2.2. Escudo contra Prompt Injection
*   **Mecanismo:** El backend (`servidor_ia.js`) escanea la cadena de texto de la consulta antes de transferirla a la API de Google Gemini.
*   **Detección:** Filtra un listado de palabras clave de inyección/manipulación (ej. `ignora las instrucciones`, `developer mode`, `bypass security`, `system prompt`, `override`).
*   **Acción:** Cancela la consulta del usuario, no consume tokens de procesamiento, registra el incidente en los logs y responde en el chat con una advertencia de seguridad.

### 💻 2.3. Protección contra Cross-Site Scripting (XSS)
*   **Entrada de Usuario:** `chat.js` utiliza la propiedad nativa `textContent` al inyectar las preguntas en el DOM, lo cual evita que cualquier código HTML o script introducido por teclado se interprete por el navegador.
*   **Salida de IA/Base de Datos:** Para respuestas que requieran enlaces o formatos enriquecidos, el frontend implementa una función `sanitizeHTML()` basada en expresiones regulares, la cual elimina activamente etiquetas potencialmente peligrosas como `<script>`, `<iframe>` o atributos en línea reactivos (ej. `onload`, `onerror`).

### ⚖️ 2.4. Cumplimiento de Privacidad y RGPD
*   **Logs Anónimos:** Se registran las consultas en `logs_consultas.json` únicamente para análisis de términos de búsqueda del dashboard, pero **se omite el registro de direcciones IP** o metadatos identificativos.
*   **Limpieza de Datos PII:** El servidor backend aplica expresiones regulares en caliente sobre el texto del usuario para buscar y anonimizar de forma automática números de teléfono (`[TELEFONO-OCULTO]`) y correos electrónicos (`[EMAIL-OCULTO]`) antes de escribir en el archivo de registro.

---

## 📝 3. Integración con Google Sheets para Trámites
La secretaría del centro utiliza **Google Sheets** de manera 100% gratuita y centralizada como buzón para almacenar solicitudes y formularios digitales generados desde el chatbot.

1.  **Formulario en el Chat:** El bot detecta si el usuario desea iniciar un trámite (como "Alta de Comedor") y despliega dinámicamente un formulario dentro del chat.
2.  **App Script en Google Sheets:** La hoja de cálculo del colegio contiene una macro en JavaScript (`doPost`) configurada como "Aplicación web". Esta macro procesa peticiones JSON y añade filas ordenadas.
3.  **Flujo del Servidor:** El servidor de Node.js actúa como proxy seguro; recibe la solicitud del usuario en el endpoint `/api/formulario` y redirige los campos estructurados hacia la URL secreta de la macro de Google.

---

## 📊 4. Plan de Precios (Propuesta Comercial)

La propuesta comercial para el colegio como **"Cliente Piloto"** incluye un período inicial sin coste y dos planes adaptados a las necesidades técnicas:

| Concepto | Plan de Botones Guía (Básico) | Plan de IA Gemini (Avanzado) |
| :--- | :--- | :--- |
| **Fase Piloto de Prueba** | Gratis (30 - 45 días) | Gratis (30 - 45 días) |
| **Instalación y Configuración** | 150 € (Pago único) | 300 € (Pago único) |
| **Suscripción Mensual** | 29 € / mes | 79 € / mes |
| **Mantenimiento y Soporte** | Incluido (Modificación manual de textos) | Incluido (Estadísticas + Ajustes de IA) |

---

> [!IMPORTANT]
> **Recomendaciones de Seguridad para el Administrador Informático:**
> 1. Asegúrese de cambiar el valor de `ADMIN_PASSWORD` en el archivo `.env` antes de desplegar el servidor en producción.
> 2. Mantenga la clave `GEMINI_API_KEY` en estricto secreto y no la comparta ni la suba a repositorios públicos como GitHub.
