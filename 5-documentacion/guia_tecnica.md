# 🛠️ Guía de integración técnica

Dirigida al informático del centro. Explica cómo desplegar el asistente, incrustarlo en la web existente y mantenerlo.

*Actualizada el 19 de agosto de 2026 · Corresponde a la versión 3.0 del producto.*

---

## 📂 Archivos del proyecto

| Archivo | Función |
| :--- | :--- |
| `configuracion_centro.json` | **El único archivo que hay que tocar por centro.** Datos, colores, funcionalidades, calendario y privacidad |
| `preguntas_frecuentes.json` | Base de conocimiento: 11 categorías y 43 preguntas |
| `chat.js` | Motor del cliente: buscador difuso, calendario, formularios y test de orientación |
| `widget.js` | Cargador de una línea que monta el asistente en un Shadow DOM |
| `style.css` | Sistema de diseño compartido con el producto sin IA |
| `servidor_ia.js` | Backend Express con Gemini, SQLite y panel |
| `dashboard.html` | Panel de administración |
| `index.html` | Web de demostración |
| `ejemplo-integracion.html` | Demostración del aislamiento en una web ajena |

---

## ⚡ 1. Desplegar el servidor

**Requisito:** Node.js 22.5 o superior. Probado sobre Node 24 LTS.

La base de datos usa el módulo `node:sqlite` incorporado en Node, así que **no hay que compilar nada** ni instalar ningún motor de base de datos. La única dependencia externa es Express.

```bash
npm install
cp .env.example .env
npm start
```

Variables del archivo `.env`:

| Variable | Para qué sirve |
| :--- | :--- |
| `PORT` | Puerto de escucha. Por defecto 3000 |
| `GEMINI_API_KEY` | Clave de Google Gemini. **Si se deja vacía, el asistente arranca igualmente en modo determinista** |
| `ADMIN_PASSWORD_HASH` | Hash SHA-256 de la contraseña del panel |
| `ORIGENES_PERMITIDOS` | Dominios autorizados a incrustar el widget, separados por comas |

Para generar el hash de la contraseña:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('TU_PASSWORD').digest('hex'))"
```

> ⚠️ En producción, `ORIGENES_PERMITIDOS` **no puede quedarse en `*`**. Hay que poner los dominios reales del centro.

---

## 🔌 2. Incrustar el widget en la web del centro

Una sola línea antes de cerrar `</body>`:

```html
<script src="https://TU-SERVIDOR/widget.js"
        data-servidor="https://TU-SERVIDOR"
        defer></script>
```

No hay que tocar la plantilla ni la hoja de estilos del centro. El widget se monta dentro de un **Shadow DOM**, una caja aislada: el CSS de la web no entra y el del asistente no sale. Puede comprobarse abriendo `ejemplo-integracion.html`, una página con estilos deliberadamente destructivos en la que el asistente conserva su diseño intacto.

Atributos opcionales:

* `data-posicion="izquierda"` — coloca el botón flotante a la izquierda.

Para abrir el asistente desde un botón propio del centro, basta con añadir el atributo `data-abrir-chat` con uno de estos valores: `inicio`, `admisiones`, `orientacion` o `calendario`.

```html
<button data-abrir-chat="orientacion">Test de orientación</button>
```

---

## 🧠 3. Cómo responde el asistente

Tres niveles, resolviendo siempre en el más barato posible:

1. **Botones.** Navegación guiada. Coste cero.
2. **Buscador local.** El usuario escribe libremente; se busca en la base de conocimiento tolerando erratas (distancia de Levenshtein) y traduciendo sinónimos escolares. Coste cero.
3. **IA generativa.** Solo si los anteriores no resuelven.

El umbral que decide cuándo se sube al nivel 3 se ajusta en `configuracion_centro.json`, en `ia.umbral_busqueda_local`. Subirlo da más precisión y más coste; bajarlo, lo contrario.

### Coste y velocidad

A la IA solo se le envían las entradas de la base de conocimiento relevantes para cada pregunta (`ia.entradas_contexto`, 8 por defecto), no la base completa. Además se acota el razonamiento del modelo con `ia.presupuesto_razonamiento`.

> ⚠️ **`max_tokens_respuesta` no debe bajar de 1500.** Los modelos Gemini 3 razonan antes de responder y ese razonamiento consume el mismo presupuesto: con un límite bajo, la respuesta llega cortada a media frase.

Si Google agota la cuota gratuita y devuelve un error 429, el asistente pasa a modo determinista durante el resto de la sesión en lugar de fallar.

**Si el servidor de IA no responde**, el cliente lo detecta al arrancar mediante `/api/salud` y pasa a modo determinista. No aparece ninguna pantalla de error: solo un aviso discreto en el pie del chat.

---

## 📊 4. Panel de administración

Accesible en `/admin` con la contraseña configurada en el `.env`. Muestra el volumen de consultas, la tasa de resolución, las consultas que el asistente no supo responder —útiles para enriquecer la base de conocimiento— y las solicitudes recibidas de las familias, con exportación a CSV.

La sesión caduca a las 2 horas y se pierde al cerrar el navegador.

---

## 🛡️ 5. Seguridad y privacidad

| Medida | Detalle |
| :--- | :--- |
| Conversación efímera | Solo en memoria mientras el chat está abierto. Sin `localStorage` ni cookies, por lo que el widget no requiere banner de cookies |
| Anonimización | Correos, teléfonos y DNI se sustituyen por marcadores antes de registrar la consulta |
| Purga automática | Los datos vencidos se borran solos según los plazos de `configuracion_centro.json` |
| Limitador | 30 peticiones por minuto y por IP |
| Anti-inyección | Se bloquea antes de gastar tokens y se registra el intento |
| XSS | Entrada del usuario con `textContent`; salida saneada a una lista blanca de etiquetas |
| Transparencia | Aviso permanente de que se habla con una IA, conforme al Reglamento Europeo de IA |

---

## ✏️ 6. Mantener la base de conocimiento

Se edita `preguntas_frecuentes.json` copiando el bloque de una pregunta existente. No hace falta programar.

El consejo que más rendimiento da: en `keywords` no hay que poner solo el término técnico, sino **cómo pregunta realmente una familia**. «He perdido el carné» funciona mucho mejor que «carné». Durante el desarrollo, la mayoría de los fallos del buscador se resolvieron añadiendo frases naturales, no tocando el algoritmo.

Las consultas sin resolver que aparecen en el panel son la mejor fuente para saber qué falta.

---

## 🗓️ 7. Actualizar el calendario cada curso

En `configuracion_centro.json`, bloque `calendario`. Hay que distinguir tres cosas:

* `vacaciones` y `dias_no_lectivos` — sin clase y sin obligación de acudir.
* `festivos_oficiales` — el centro está cerrado.
* `jornadas_especiales` — **no hay clase ordinaria pero la asistencia es obligatoria**: fiesta del centro, jornada cultural, convivencias.

Ese tercer caso es el que más dudas genera entre las familias, y el asistente lo aclara siempre de forma expresa.

La Semana Santa **no hay que introducirla**: se calcula automáticamente cada año.
