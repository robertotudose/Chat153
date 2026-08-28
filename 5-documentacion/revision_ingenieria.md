# 🔧 Puntos pendientes de revisión de ingeniería

> **Para:** el ingeniero que revise el código antes de producción.
> **Fecha:** 19 de agosto de 2026.
> **Ámbito:** `1-producto`.

Este documento recoge lo que **conscientemente no se ha resuelto** durante el desarrollo, ordenado por gravedad. Lo ya corregido está al final, para que no se revise dos veces.

---

## 🔴 Prioridad alta

### 1. El archivo `.env` estuvo versionado en git

**Situación.** `ChatBot IA/.env` figuraba en el repositorio. Se ha sacado del control de versiones (`git rm --cached`) y se ha añadido un `.gitignore`, pero **sigue presente en el historial de commits**.

**Qué contenía exactamente:**

| Variable | Contenido |
| :--- | :--- |
| `GEMINI_API_KEY` | **Vacía.** No hay ninguna clave de API expuesta |
| `ADMIN_PASSWORD` | Contraseña real del panel, 14 caracteres, en texto plano |
| `PORT` | Sin relevancia |

**Qué hay que hacer:**

1. Cambiar la contraseña de administración (la antigua debe considerarse comprometida).
2. Limpiar el historial de git con `git filter-repo` o BFG Repo-Cleaner.
3. Confirmar que ningún clon ni fork conserva el histórico anterior.

> Se dejó pendiente a propósito: reescribir el historial de git afecta a cualquier copia del repositorio y es una decisión que corresponde a quien administra el repositorio.

### 2. Autenticación del panel: reforzar

Lo implementado ahora:

* Comparación en **tiempo constante** (`crypto.timingSafeEqual`), sin fugas por temporización.
* Soporte de `ADMIN_PASSWORD_HASH` (SHA-256), recomendado frente a la contraseña en claro.
* Token de sesión aleatorio de 32 bytes, en memoria, con caducidad de 2 horas.

Lo que falta para producción:

* **Sustituir SHA-256 por bcrypt, scrypt o Argon2.** SHA-256 es rápido por diseño, justo lo contrario de lo que interesa para almacenar contraseñas. Es una mejora clara, pero añade una dependencia nativa y se prefirió dejar la decisión al criterio de ingeniería.
* **Limitar los intentos de acceso por usuario**, no solo por IP.
* Considerar segundo factor si el panel va a exponerse a internet.

### 3. Endurecimiento para producción

* `ORIGENES_PERMITIDOS` está en `*` por defecto (cómodo en desarrollo, inaceptable en producción). Hay que fijar los dominios reales de cada centro.
* Falta HTTPS con certificado, terminación TLS en Nginx y cabeceras de seguridad (HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`).
* El limitador de peticiones vive **en memoria del proceso**: con varias instancias detrás de un balanceador, cada una lleva su propia cuenta. Con una sola instancia es correcto; al escalar hará falta Redis o equivalente.

---

## 🟡 Prioridad media

### 4. La base de datos no tiene copias de seguridad automatizadas

`datos.db` (SQLite) contiene datos personales de familias. Está excluida de git, que es lo correcto, pero **no hay copia de seguridad configurada**. Hace falta un volcado periódico (`sqlite3 datos.db ".backup"`) hacia almacenamiento cifrado, con su propio plazo de conservación.

### 5. Multi-tenant a medias

El esquema ya incluye `colegio_id` en todas las tablas y todas las consultas filtran por él. Pero el servidor carga **un único** `configuracion_centro.json` al arrancar. Para servir varios centros desde un mismo proceso hay que:

* Cargar una configuración por centro e indexarla.
* Resolver el centro por dominio de origen o por parámetro del widget.
* Comprobar que ninguna consulta puede cruzar datos entre centros.

### 6. Sin pruebas automatizadas

Existe un banco de pruebas del buscador local en `pruebas_motor.js` (17 casos, 17 aciertos), ejecutable con `node pruebas_motor.js` y que devuelve código de salida distinto de cero si algo falla, así que puede engancharse a integración continua tal cual. Lo demás se ha verificado a mano. Falta incorporar:
* Pruebas de los endpoints (autenticación, limitador, escudo anti-inyección).
* Una prueba de extremo a extremo del modo degradado.

### 7. Cuota del nivel gratuito de Gemini

**La capa de IA ya está probada contra el servicio real** y funciona: streaming, anclaje en la base de conocimiento, negativa a inventar datos y orientación de 4º de ESO.

El problema es la **cuota del nivel gratuito**, que se agota enseguida. Durante las pruebas bastaron unas pocas decenas de consultas seguidas para recibir `429 You exceeded your current quota`. Para un centro real hay que decidir entre:

* **Activar facturación** en Google AI Studio (con el filtrado de contexto, el coste por consulta es muy bajo).
* **Usar un modelo con más cuota gratuita**, como `gemini-3.5-flash-lite`, aceptando algo menos de calidad.
* **Subir `umbral_busqueda_local`** en la configuración, para que más consultas se resuelvan en local sin tocar la IA.

Conviene medir primero cuántas consultas reales llegan de verdad al nivel de IA: por el diseño híbrido, muchas menos de las que parece.

### 8. Latencia

Con el filtrado de contexto, la primera palabra aparece entre 1 y 3 segundos en las consultas habituales. En preguntas abiertas y largas puede irse a 10-14 segundos, porque el modelo razona antes de emitir texto. Si resulta excesivo, hay dos palancas: bajar `presupuesto_razonamiento` o cambiar a un modelo *lite*.

## 🟢 Prioridad baja

### 9. Tipografías

`style.css` referencia Montserrat y Lato, con familia de sistema como reserva. **No se cargan desde Google Fonts a propósito:** servir tipografías desde los servidores de Google implica transferir la IP del visitante a un tercero, algo que tribunales europeos han considerado contrario al RGPD. Si se quieren esas tipografías, hay que **autoalojarlas** en el propio servidor.

### 10. Detalles menores

* El escudo anti-inyección se basa en patrones. Cubre lo habitual, pero no es infalible: la defensa real es la instrucción de sistema, que es restrictiva.
* En la ventana entre cursos (julio y agosto) el calendario muestra el curso siguiente y hoy no aparece resaltado. El texto lo explica, pero puede afinarse.
* `datos.db` crece sin límite entre purgas. Con el volumen previsto no es problema en años.

---

## ✅ Ya corregido durante el desarrollo (no revisar de nuevo)

| Hallazgo | Estado |
| :--- | :--- |
| **Puerta trasera en el panel:** `dashboard.html` aceptaba las contraseñas `admin2026` y `salesianas2026` escritas en el propio HTML, saltándose por completo la validación del servidor | Eliminada |
| **Datos personales en el navegador:** el panel guardaba solicitudes de familias (nombres, correos, teléfonos) en `localStorage` | Eliminado; ahora todo va contra el servidor |
| **Solicitudes ficticias:** el panel mostraba datos inventados con aspecto real cuando no había backend | Sustituido por un estado vacío honesto |
| **Token de administración en `localStorage`** | Movido a `sessionStorage` |
| **Menú de bienvenida que no aparecía:** `hasChildNodes()` contaba un comentario HTML como contenido | Corregido con `childElementCount` |
| **Modo pantalla grande roto:** altura `auto` en el widget con un hijo a `height:100%`, dependencia circular que resolvía a cero y desbordaba el contenido | Corregido con altura definida y `min-height: 0` |
| **Calendario por año natural:** mostraba de enero a diciembre y daba por lectivo un día de agosto | Reescrito por curso escolar (septiembre a agosto) |
| **`eso` filtrada como palabra vacía:** las consultas sobre Educación Secundaria no encontraban nada | Corregido y documentado en el código |
| **Modelo retirado en producción:** `gemini-2.5-flash` devolvía 404 «no longer available to new users» | Actualizado a `gemini-3.6-flash`, con la alternativa `gemini-flash-latest` documentada |
| **Respuestas cortadas a media frase:** los modelos Gemini 3 razonan antes de responder y ese razonamiento consume el mismo presupuesto de tokens. Con `maxOutputTokens: 800`, unos 765 se iban en pensar y quedaban 31 para la respuesta | Límite subido a 2000 y razonamiento acotado con `thinkingConfig`, con reintento automático si el modelo no lo admite |
| **Prompt desmesurado:** se enviaba la base de conocimiento completa (más de 4.000 tokens) en cada consulta, encareciendo y retrasando cada respuesta | Se envían solo las entradas relevantes: la primera palabra pasó de ~11 s a 1-3 s |
| **Error de stream que se perdía:** el `Promise.reject` estaba dentro de un `forEach`, así que un fallo a mitad de respuesta no degradaba a modo local; el usuario veía un mensaje de disculpa en lugar de la respuesta oficial | Corregido: se anota el error y se decide al cerrar el stream |
| **Widget con clases obsoletas:** tras unificar el diseño, la plantilla de `widget.js` seguía usando nombres de clase del CSS anterior y la barra de entrada se veía sin estilo dentro del Shadow DOM | Corregido |
| **`all: initial` en el contenedor del widget:** además de aislar, dejaba la tipografía en el serif por defecto del navegador | Sustituido por propiedades explícitas sobre `:host` |
| **Dos naranjas indistinguibles en el calendario:** «jornada especial» y «festivo oficial» usaban tonos casi iguales, ilegibles con daltonismo rojo-verde | Jornada especial pasa a violeta, y se diferencian también por forma (celda rellena frente a punto) |
| **Modelo de IA retirado:** se usaba `gemini-1.5-flash`, descatalogado por Google | Actualizado a `gemini-2.5-flash`, configurable |
