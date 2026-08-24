# 🏫 Chatbot de Secretaría Virtual - Salesianas Zaragoza
### ⚡ Versión Estática y Determinista (100% Sin IA / Cero Costes de Servidor)

Bienvenido a la versión **autónoma, determinista y 100% libre de IA** del Chatbot de Secretaría Virtual y Orientación para el **Colegio María Auxiliadora (Salesianas Zaragoza)**.

Esta solución está diseñada para operar íntegramente en el navegador web del usuario (Client-Side), garantizando máxima inmediatez, coste cero y total certidumbre en las respuestas escolares.

---

## 🌟 Ventajas Principales de la Versión Sin IA

1. **Cero Costes Operativos:** No requiere suscripciones a APIs de IA (OpenAI, Google Gemini, Anthropic) ni consumo de tokens mensuales.
2. **Sin Servidor ni Backend:** No necesita Node.js, Python, Express ni bases de datos activas. Funciona en cualquier servidor web estático (Apache, Nginx, GitHub Pages, Netlify, cPanel o directamente abriendo el archivo local).
3. **100% Predecible y Confiable:** Las respuestas son deterministas y oficiales; no hay riesgo de alucinaciones, respuestas inexactas o desvíos de conversación.
4. **Privacidad y RGPD Total:** Ningún dato personal viaja a servidores de terceros de inteligencia artificial. Los formularios generan correos directos `mailto:` desde el cliente de la familia hacia la secretaría u orientación del centro.
5. **Velocidad Instantánea:** Tiempo de respuesta inferior a 10 milisegundos con soporte para búsqueda difusa por palabras clave.

---

## 📁 Estructura del Proyecto

```text
ChatBot Sin IA/
├── index.html               # Página de demostración con la web escolar y widget de chat
├── chat.js                  # Motor 100% JavaScript nativo (árbol de decisiones, buscador difuso y formularios)
├── style.css                # Estilos visuales con la paleta de Salesianas (#3490b0, #b6bc00, #0f172a)
├── preguntas_frecuentes.json # Base de conocimiento estructurada en JSON
└── README.md                # Esta guía técnica y operativa
```

---

## 🚀 Cómo Ejecutar en Local

Para probar o utilizar el chatbot de forma inmediata:

### En macOS:
```bash
open "index.html"
```

### En Windows:
Hacer doble clic sobre el archivo `index.html` o en la consola:
```cmd
start index.html
```

### En Linux:
```bash
xdg-open index.html
```

> **Nota Técnica:** El motor `chat.js` incluye una copia de seguridad embebida de las preguntas frecuentes. Por tanto, funcionará al 100% incluso si se abre mediante el protocolo de archivos directos `file:///` sin levantar ningún servidor HTTP.

---

## 🌳 Módulos y Flujo de Interacción

El chatbot se inicia con un **Triage de Bienvenida** dividido en dos itinerarios principales:

### 1. 🏫 Buscamos colegio (Admisiones)
* Fechas y formato de las Jornadas de Puertas Abiertas.
* Etapas educativas completas (Infantil, Primaria, Secundaria y FP).
* Criterios y baremo oficial de escolarización de Aragón.
* Formulario interactivo para concertar visita personalizada.

### 2. 🎒 Ya somos familia del colegio (Trámites y Servicios)
* **Comedor:** Cocina propia, menús de Endermar, siesta en Infantil, aula de estudio en Primaria y fechas de alta/baja (antes del día 25).
* **Pagos:** Abono de salidas escolares mediante la app Alexia, recibos devueltos y cuotas de actividades extraescolares.
* **Secretaría:** Horarios de atención presencial y telefónica (Susana Millán), solicitud de certificados oficiales y justificación de faltas.
* **Formación Profesional:** Ciclos de Grado Básico, Medio y Superior, prácticas FCT, FP Dual y convalidaciones.

---

## 🔍 Motor de Búsqueda Difusa Local

El campo de texto inferior permite al usuario escribir preguntas libres (ej. *"¿Cómo pido un certificado?"*, *"¿Qué horario tiene el comedor?"*, *"Bachillerato de ciencias"*).

El algoritmo de `chat.js` realiza:
1. Normalización de texto (eliminación de tildes, signos de puntuación y paso a minúsculas).
2. Ponderación por palabras clave (`keywords`), coincidencias en el título de la pregunta y en el cuerpo de la respuesta.
3. Si la relevancia supera el umbral, muestra la respuesta oficial con botones para seguir profundizando en la categoría.
4. Si la consulta no coincide con ninguna entrada, sugiere de forma amigable los tres accesos directos principales para no dejar al usuario sin salida.

---

## 📝 Cómo Integrar el Chatbot en la Web Oficial del Colegio

Para integrar este widget en la web oficial de Salesianas Zaragoza (`zaragoza.salesianas.org`) o en su gestor de contenidos (WordPress, Drupal, HTML estático):

### Paso 1: Incluir los estilos en el `<head>`
```html
<link rel="stylesheet" href="/ruta-chatbot/style.css">
```

### Paso 2: Copiar el código del widget antes de cerrar `</body>`
```html
<div class="salesianas-chat-widget" id="salesianas-chat-widget">
  <div class="chat-window">
    <div class="chat-header">
      <div class="chat-header-avatar">
        <svg viewBox="0 0 24 24"><path d="M12,3L1,9L12,15L21,9L12,3M19,10.66V15.5C19,16.88 15.86,18 12,18C8.14,18 5,16.88 5,15.5V10.66L12,14.5L19,10.66M12,16.5L2,11V15.5C2,17.43 6.5,19 12,19C17.5,19 22,17.43 22,15.5V11L12,16.5Z"/></svg>
      </div>
      <div class="chat-header-info">
        <h3>Asistente Salesianas</h3>
        <p><span class="status-badge"></span> Secretaría y Orientación</p>
      </div>
      <div class="chat-header-actions">
        <button class="chat-header-btn" id="chat-reset-btn" title="Reiniciar">↻</button>
        <button class="chat-header-btn" id="chat-close-btn" aria-label="Cerrar">✕</button>
      </div>
    </div>
    
    <div class="chat-banner-warning">
      <span><strong>Nota:</strong> Colegio María Auxiliadora (Salesianas) de C/ Mornés.</span>
    </div>

    <div class="chat-body" id="chat-body" role="log" aria-live="polite"></div>

    <div class="chat-footer">
      <div class="chat-input-wrapper">
        <input type="text" class="chat-input" id="chat-input" placeholder="Escribe tu consulta...">
      </div>
      <button class="chat-send-btn" id="chat-send-btn">➤</button>
    </div>
  </div>

  <div class="chat-cue-bubble" id="chat-cue-bubble">¿Dudas de secretaría u orientación? 💬</div>
  <button class="chat-trigger-btn" id="chat-trigger-btn" aria-label="Abrir asistente">💬</button>
</div>
```

### Paso 3: Cargar el script
```html
<script src="/ruta-chatbot/chat.js"></script>
```

---

## ✏️ Cómo Personalizar las Preguntas en `preguntas_frecuentes.json`

No es necesario saber programar para añadir o cambiar respuestas. Basta con abrir `preguntas_frecuentes.json` y seguir la estructura:

```json
{
  "id": "nueva_pregunta_id",
  "pregunta": "¿Cómo solicitar el carné escolar?",
  "keywords": ["carne", "tarjeta", "foto", "identificacion"],
  "respuesta": "El carné escolar se entrega a principios de curso. Si necesitas un duplicado, puedes solicitarlo en secretaría abonando las tasas de reimpresión."
}
```

---

## 🛡️ Seguridad y Accesibilidad

* **Protección XSS:** Se sanitizan todas las cadenas antes de inyectarse en el DOM.
* **Accesibilidad:** Uso de contrastes WCAG AA (`#1f6f8b` sobre fondos claros), etiquetas ARIA (`role="log"`, `aria-live="polite"`) y soporte de navegación con teclado (tecla Enter para enviar).
* **Responsive Móvil:** Adaptación fluida a pantallas táctiles con botones de fácil pulsación y modo de pantalla completa en teléfonos móviles.

---

**Colegio María Auxiliadora - Salesianas Zaragoza**  
*Formando personas, construyendo futuro con corazón.*
