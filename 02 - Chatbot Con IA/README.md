# 🤖 Asistente Escolar con IA

> Secretaría virtual y orientación académica para centros educativos.
> Motor híbrido de tres niveles con degradación automática: **si la IA cae, el asistente sigue funcionando**.

---

## 🧠 Cómo funciona: tres niveles, de más barato a más caro

Cada consulta se resuelve en el nivel más bajo posible. Esto no es solo una decisión técnica: es lo que mantiene la factura de la IA cerca de cero.

| Nivel | Qué hace | Coste | Latencia |
| :--- | :--- | :--- | :--- |
| **1 · Botones** | Navegación guiada por menús | 0 € | Instantánea |
| **2 · Buscador local** | El usuario escribe libremente y se busca en la base de conocimiento con tolerancia a erratas y sinónimos | 0 € | < 10 ms |
| **3 · IA generativa** | Solo si los niveles anteriores no resuelven | Céntimos | 1-3 s |

El **nivel 2** es la pieza que diferencia este producto. Implementa:

* **Distancia de Levenshtein** para tolerar erratas: *«comedro»* encuentra *«comedor»*, *«vacasiones»* encuentra *«vacaciones»*.
* **Diccionario de sinónimos escolares** que traduce cómo habla una familia al vocabulario de la base de conocimiento: *«apuntar»* → matrícula, *«papel de notas»* → certificado, *«se ha puesto malo»* → justificar falta.
* **Filtro de palabras vacías**, para que un *«qué»* o un *«cómo»* no puntúen.
* **Reparto de peso por longitud de clave**: una palabra suelta dentro de una clave de varias vale menos que una clave exacta.

> ⚠️ **Cuidado al tocar la lista de palabras vacías:** `eso` NO puede figurar en ella. En un centro educativo es la Educación Secundaria Obligatoria, no el pronombre.

### 🛟 Degradación elegante

Si el servidor de IA no responde, **no se muestra ninguna pantalla de error**. Aparece un aviso discreto en el pie del chat (*«Funcionando en modo básico»*) y el asistente sigue respondiendo con la base de conocimiento, exactamente igual que el producto *Chatbot Sin IA*. La familia que consulta puede no llegar a notarlo.

---

## 📂 Archivos

```text
02 - Chatbot Con IA/
├── configuracion_centro.json   # ⭐ EL ÚNICO ARCHIVO QUE HAY QUE TOCAR POR CENTRO
├── preguntas_frecuentes.json   # Base de conocimiento (11 categorías, 43 preguntas)
├── chat.js                     # Motor del cliente (híbrido, calendario, test 4º ESO)
├── widget.js                   # Cargador de una línea con Shadow DOM
├── style.css                   # Sistema de diseño compartido + añadidos de la versión con IA
├── servidor_ia.js              # Backend Express + Gemini + SQLite
├── dashboard.html              # Panel de administración
├── index.html                  # Web de demostración con el widget integrado
├── ejemplo-integracion.html    # Demostración del aislamiento en una web ajena
├── package.json                # Una sola dependencia: Express
└── .env.example                # Plantilla de variables de entorno
```

---

## 🧮 Coste y velocidad: cómo se mantienen bajos

Dos decisiones concretas, ambas verificadas contra el servicio real de Gemini:

**1. A la IA solo se le manda lo pertinente.** Enviar la base de conocimiento entera suponía más de 4.000 tokens en *cada* consulta. Ahora el servidor selecciona las 8 entradas más relevantes para la pregunta (`ia.entradas_contexto`). La primera palabra de la respuesta pasó de tardar unos 11 segundos a entre 1 y 3.

**2. Se acota el razonamiento del modelo.** Los modelos Gemini 3 razonan antes de responder, y ese razonamiento **consume el mismo presupuesto de tokens que la respuesta**. Con el límite en 800, unos 765 se iban en pensar y la respuesta llegaba cortada a media frase. Por eso `max_tokens_respuesta` es 2000 y `presupuesto_razonamiento` es 128.

> ⚠️ **No bajes `max_tokens_respuesta` de 1500.** Parece un ahorro y lo que consigue es que las respuestas se corten.

### Cuota del nivel gratuito

El nivel gratuito de Gemini se agota antes de lo que parece: unas decenas de consultas seguidas devuelven `429`. Cuando ocurre, **el asistente no falla**: pasa a modo determinista durante el resto de la sesión y sigue respondiendo con la base de conocimiento. Para producción hay que valorar activar facturación, usar un modelo *lite* o subir `ia.umbral_busqueda_local` para que más consultas se resuelvan en local.

---

## 🎨 Sistema de diseño compartido

Los dos productos —*Chatbot Sin IA* y *Chatbot Con IA*— usan **el mismo lenguaje visual**: misma tipografía (Plus Jakarta Sans e Inter), misma paleta, mismos componentes de página y mismo widget. Quien vea las dos demos debe reconocer un único producto con dos motores distintos.

`style.css` está dividido en dos partes:

1. **El sistema compartido**, idéntico al del producto sin IA.
2. **Los añadidos de esta versión**, al final del archivo y claramente marcados: aviso de modo básico, cursor de escritura, jornadas especiales del calendario, consentimiento de los formularios, tema oscuro y reglas de accesibilidad.

Si se cambia el diseño en uno de los dos productos, hay que llevar el cambio al otro: la primera parte del archivo debe mantenerse en paralelo.

> **Nota sobre las tipografías:** en la página de demostración se cargan desde Google Fonts. El **widget incrustado no las carga**: usa la familia del sistema como reserva. Servir tipografías desde servidores de Google transfiere la IP del visitante a un tercero, algo cuestionado por tribunales europeos en aplicación del RGPD. Si un centro quiere esas tipografías en producción, debe autoalojarlas.

---

## 🚀 Puesta en marcha

**Requisito:** Node.js 22.5 o superior (probado sobre Node 24 LTS). La base de datos usa el módulo `node:sqlite` incorporado, así que no hay que compilar nada.

```bash
npm install
cp .env.example .env
npm start
```

* Web de demostración → `http://localhost:3000`
* Panel de administración → `http://localhost:3000/admin`
* Ejemplo de integración → `http://localhost:3000/ejemplo-integracion.html`

**El asistente arranca aunque no haya clave de IA.** Sin `GEMINI_API_KEY` funciona en modo determinista, sin coste y sin errores.

---

## 🏫 Adaptar el asistente a un centro nuevo

Se toca **un solo archivo**: `configuracion_centro.json`. No hace falta programar.

| Bloque | Para qué sirve |
| :--- | :--- |
| `centro` | Nombre, dirección, teléfono, correo y horarios |
| `marca` | Colores corporativos, logotipo y textos del widget |
| `funcionalidades` | Interruptores: IA, test de 4º ESO, calendario, modo oscuro, formularios |
| `ia` | Modelo, temperatura y umbral a partir del cual se consulta a la IA |
| `privacidad` | Aviso de privacidad y plazos de conservación de datos |
| `solicitudes` | Dónde acaban las solicitudes: base de datos, correo, webhook o `mailto` |
| `enlaces_oficiales` | Enlaces a administraciones públicas |
| `comunidad_autonoma` | Ajusta los nombres que cambian según la comunidad |
| `calendario` | Vacaciones, festivos, días no lectivos y jornadas especiales |

### 📅 Los tres tipos de día (y por qué importan)

La duda más frecuente de las familias en centros concertados es si hay que acudir los días de fiesta del colegio. El calendario los distingue de forma explícita:

| Tipo | Color | ¿Hay que ir? |
| :--- | :--- | :--- |
| Vacaciones y días no lectivos | 🟢 Verde | No |
| Festivos oficiales | 🔴 Rojo | No, el centro está cerrado |
| **Jornadas especiales del centro** | 🟠 Naranja | **Sí, la asistencia es obligatoria** |

Las jornadas especiales (fiesta del centro, jornada cultural, convivencias) **no tienen clases ordinarias pero sí son días lectivos**: se pasa lista y las faltas deben justificarse. Tanto el buscador local como la IA lo aclaran siempre de forma expresa.

La Semana Santa se calcula sola cada año con el algoritmo de Meeus/Jones/Butcher: no hay que mantenerla a mano.

---

## 🔌 Integrar el widget en la web de un centro

Una línea antes de cerrar `</body>`:

```html
<script src="https://TU-SERVIDOR/widget.js"
        data-servidor="https://TU-SERVIDOR"
        defer></script>
```

El widget se monta dentro de un **Shadow DOM**: una caja aislada del resto de la página. Ni los estilos del centro afectan al asistente ni al revés. Esto no es un lujo: sin aislamiento, cualquier plantilla de WordPress con CSS agresivo rompe el diseño y no hay forma de evitarlo. Puedes comprobarlo en `ejemplo-integracion.html`, una página con estilos deliberadamente destructivos.

Atributos disponibles:

* `data-servidor` — dirección del backend. Si se omite, se usa la del propio script.
* `data-posicion` — `derecha` (por defecto) o `izquierda`.

Para abrir el asistente desde un botón de la web del centro, basta con añadir `data-abrir-chat` con uno de estos valores: `inicio`, `admisiones`, `orientacion` o `calendario`.

---

## 🎓 Test de orientación de 4º de ESO

**15 preguntas y unos tres minutos.** Diez de elección entre situaciones cotidianas concretas (un trabajo en grupo, algo que se rompe en casa, un amigo con un problema) y cinco de «ronda rápida» que se contestan de un toque. Cada respuesta pondera nueve áreas profesionales: empresa, educación, derecho, comunicación, turismo, idiomas, politécnica, salud y deporte. Se calcula en el navegador, sin coste.

Al final, dos preguntas abiertas que ningún test cerrado puede cubrir: con qué plazo se imagina el alumno y qué le preocupa al decidir.

> **Por qué 15 y no 35.** La versión inicial adaptaba las 35 afirmaciones de un test universitario («¿te consideras metódico?»). A los 15-16 años ese formato falla dos veces: el autoconcepto todavía se está formando, así que autoevaluarse en abstracto da respuestas poco fiables; y pasada la pregunta 20 aparece el *satisficing*, es decir, se contesta cualquier cosa por acabar. Más preguntas terminaban dando **peor** dato. La solución no fue recortar, sino cambiar el formato: elegir entre escenarios que cargan áreas distintas aporta mucha más información por pregunta que puntuar una afirmación en una escala. Verificado con perfiles simulados: los seis arquetipos (técnico, sanitario, gestor, creativo, deportista, idiomas) caen en su área correspondiente al 100 %.

Al terminar:

* **Con IA:** el modelo recibe el ranking de áreas ya calculado más las dos respuestas abiertas, y elabora la orientación bajo instrucciones estrictas — ninguna vía es superior a otra, la FP no es «para quien no vale para estudiar», y siempre se remite al departamento de orientación. Es **una sola llamada** al modelo, no una conversación entera.
* **Sin IA:** se genera una recomendación determinista a partir del área mejor puntuada y de la respuesta sobre plazo, que decide entre Bachillerato y Grado Medio.

En ambos casos se ofrece un **informe descargable** con el perfil de intereses en barras, las respuestas y la orientación. Se genera **íntegramente en el dispositivo del alumno**: no pasa por el servidor ni se guarda copia alguna.

---

## 🛡️ Seguridad y privacidad

| Medida | Implementación |
| :--- | :--- |
| **Conversación efímera** | Vive solo en memoria mientras el chat está abierto. Al cerrarlo se destruye. Sin `localStorage` ni cookies: el widget no necesita banner de cookies |
| **Anonimización RGPD** | Correos, teléfonos y DNI se sustituyen por marcadores antes de registrar nada |
| **Purga automática** | Los datos vencidos se borran solos según los plazos del archivo de configuración |
| **Limitador de peticiones** | 30 por minuto y por IP, con ventana deslizante |
| **Escudo anti-inyección** | Se bloquea antes de gastar tokens y se registra el intento |
| **Protección XSS** | Los mensajes del usuario se insertan con `textContent`; las respuestas se sanean permitiendo solo etiquetas de formato y enlaces `http(s)`, `mailto` y `tel` |
| **Panel protegido** | Contraseña validada **solo en el servidor**, con comparación en tiempo constante, y token de sesión en `sessionStorage` con caducidad de 2 horas |
| **Transparencia (Reglamento de IA)** | Aviso permanente de que se está hablando con una máquina |

---

## 📡 Endpoints

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/salud` | Estado del servicio. Permite al cliente degradarse |
| `POST` | `/api/chat` | Consulta al modelo, en streaming (SSE) |
| `POST` | `/api/solicitudes` | Registro de solicitudes de familias |
| `POST` | `/api/admin/login` | Autenticación del panel |
| `GET` | `/api/admin/metricas` | Métricas y registros (requiere token) |
| `POST` | `/api/admin/solicitudes/estado` | Cambio de estado de una solicitud |

---

## ✏️ Añadir preguntas

En `preguntas_frecuentes.json`, copia el bloque de una pregunta y edítalo:

```json
{
  "id": "sec_carne_escolar",
  "pregunta": "🪪 ¿Cómo solicito un duplicado del carné escolar?",
  "keywords": ["carne", "tarjeta", "duplicado", "he perdido el carne"],
  "respuesta": "El carné se entrega a principios de curso. Para un duplicado..."
}
```

**Consejo que marca la diferencia:** en `keywords` no pongas solo términos técnicos, sino **las formas reales en que pregunta una familia**. «He perdido el carné» funciona mucho mejor que «carné». Durante el desarrollo, la mitad de los fallos del buscador se corrigieron añadiendo frases naturales, no tocando el algoritmo.

Los datos del centro (nombre, teléfono, horarios) **no van aquí**: van en `configuracion_centro.json`.
