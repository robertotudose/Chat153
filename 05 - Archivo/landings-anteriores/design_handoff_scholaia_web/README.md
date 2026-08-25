# Handoff: web comercial SCHOLAIA

## Overview
Landing comercial de SCHOLAIA, un asistente virtual de secretaría y orientación para
centros educativos españoles. El público objetivo es la dirección o titularidad de un
colegio concertado que está evaluando la contratación.

La pieza central es la **apertura**: al entrar, un bloque compacto de libros ocupa el
centro de la pantalla, se abre hacia los lados como un telón y revela el logotipo
SCHOLAIA. Al terminar, esa misma composición se queda como lockup del hero y aparece
el resto de la página.

## About the Design Files
Los archivos de este paquete son **referencias de diseño hechas en HTML**: prototipos
que muestran el aspecto y el comportamiento previstos, no código de producción para
copiar tal cual. La tarea es **recrear estos diseños en el entorno del proyecto de
destino** (React, Next.js, Astro, Vue, etc.) con sus patrones y librerías habituales.
Si todavía no hay proyecto, elige el framework más adecuado (una landing estática con
Astro o Next.js es suficiente) e implementa los diseños allí.

`SCHOLAIA.dc.html` es un "Design Component": todo el estilado está en atributos
`style` inline y la lógica está en una clase `Component` al final del archivo.
`support.js` es solo el runtime que permite abrirlo en el navegador; **no** debe
portarse. Lo relevante son los valores (medidas, colores, tipografía, tiempos) y la
estructura.

El archivo contiene tres artboards, en este orden:
1. **Fotogramas de la apertura** — tres estados estáticos (cerrado, abriéndose, abierto)
   en marcos de 520×620. Son documentación de la animación, no una pantalla del sitio.
2. **Escritorio** — la página completa a 1440 px de ancho.
3. **Móvil** — la misma página a 390 px.

Solo los artboards 2 y 3 se implementan. El artboard 1 sirve para entender la secuencia.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, medidas, tiempos y easings son
definitivos. La UI debe recrearse fielmente. La única libertad recomendada es
convertir los dos anchos fijos (1440 / 390) en un layout fluido con un breakpoint,
ver "Responsive behavior".

---

## Screens / Views

### 1. Apertura (overlay del hero, no una página aparte)
**Propósito**: presentar la marca antes de mostrar el contenido. Ocurre dentro del
propio hero: los libros y el logotipo son los mismos elementos del lockup final, solo
cambian de posición.

**Layout**: fila flex centrada, `align-items:center; justify-content:center`,
`gap:96px`, alto fijo `430px`, dentro de un contenedor con
`padding:60px 80px 130px` y `align-items:center`.

Tres hijos, en orden:
- `assets/books-stack.png` — `width:330px` (pila de libros tumbados)
- Bloque del logotipo (ver más abajo)
- `assets/books-row.png` — `width:250px` (libros de pie)

Sombra de ambas imágenes: `drop-shadow(0 18px 34px rgba(60,48,30,.14))`.

**Bloque del logotipo** (lockup SCHO / LAIA, dos líneas):
```
display:flex; flex-direction:column; align-items:center;
line-height:.8; font-family:'Cormorant Garamond',serif; font-weight:300; color:#171B22;
```
- línea 1 `SCHO` — `font-size:118px; letter-spacing:.04em`
- línea 2 `LAIA` — `font-size:118px; letter-spacing:.13em`

El tracking distinto en cada línea es intencional: iguala visualmente el ancho de
ambas palabras, como en el logotipo original.

**Estados de la secuencia** (fase → transform aplicado a cada imagen):

| Fase | Nombre | books-stack | books-row | Logotipo |
|---|---|---|---|---|
| 0 | cerrado | `translateX(292px) rotate(-3deg) scale(.94)` | `translateX(-268px) rotate(4deg) scale(.94)` | `opacity:0; clip-path:inset(0 50% 0 50%)` |
| 1 | abriéndose | `translateX(128px) rotate(-1.5deg) scale(.97)` | `translateX(-118px) rotate(2deg) scale(.97)` | `opacity:.42; clip-path:inset(0 26% 0 26%)` |
| 2 | abierto | `translateX(0) rotate(0) scale(1)` | `translateX(0) rotate(0) scale(1)` | `opacity:1; clip-path:inset(0)` |
| 3 | página | igual que fase 2 | igual que fase 2 | igual que fase 2 |

En fase 0 los dos grupos deben **solaparse ~20-30 px**: es lo que hace que se lean
como un bloque cerrado y lo que oculta el borde del `clip-path` del logotipo. Si se
cambian los tamaños de las imágenes hay que recalcular los offsets para mantener ese
solape.

Equivalente en móvil (mismas fases, imágenes a `width:100px` / `width:76px`,
logotipo `font-size:36px`, `gap:18px`, alto de fila `160px`):
- fase 0: stack `translateX(82px) rotate(-3deg) scale(.94)`, row `translateX(-75px) rotate(4deg) scale(.94)`
- fase 1: stack `translateX(38px) rotate(-1.5deg) scale(.97)`, row `translateX(-36px) rotate(2deg) scale(.97)`
- fases 2-3: sin transform

### 2. Escritorio (1440 px)
Fondo `#F5F0E6` en toda la página. Ancho de contenido con `padding` lateral de 80 px.

**Header** — `display:flex; justify-content:space-between; align-items:center;
padding:34px 80px`. Aparece solo en fase 3 (`opacity` 0→1, `transition:opacity 900ms
ease 300ms`).
- Izquierda: lockup SCHO/LAIA en dos líneas, `font-size:19px`, `line-height:.82`,
  tracking `.06em` / `.15em`.
- Derecha: enlace "Solicitar una demostración" — Lora 15px, `color:#1B1E24`,
  `border-bottom:1px solid #B99150`, `padding-bottom:3px`.

**Hero** — lockup de la apertura y, debajo (`margin-top:70px`, `gap:40px`, centrado),
el bloque de texto que entra en fase 3 (`opacity` 0→1 y `translateY(20px)`→`0`,
`transition:opacity 1000ms ease 200ms, transform 1000ms cubic-bezier(.16,1,.3,1) 200ms`):
- `h1` — Cormorant Garamond 300, `font-size:80px`, `line-height:1.08`,
  `letter-spacing:-.005em`, `color:#171B22`, `max-width:1010px`, centrado,
  `text-wrap:pretty`.
  Texto: "Atención de secretaría y orientación disponible siempre, con el criterio de tu centro."
- `p` — Lora 400, 19px, `line-height:1.7`, `color:#57544C`, `max-width:660px`, centrado.
  Texto: "SCHOLAIA atiende a las familias con la información de tu instituto: responde, ordena las peticiones y deja registro de todo. Tu equipo recupera el tiempo que hoy se va en el teléfono."
- Botón primario (ver "Componentes recurrentes").

**Tres afirmaciones** — bloque con filete superior `1px #D6CDBA`. Cada afirmación es
un único párrafo, sin titulillo, sin numeración y sin tarjeta:
- Cormorant Garamond 300, `font-size:46px`, `line-height:1.34`, `color:#171B22`,
  `max-width:1080px`, `text-wrap:pretty`.
- Bloque 1: `padding:110px 0 100px`, alineado a la izquierda.
- Bloque 2: `padding:100px 0`, `margin-left:auto; text-align:right`.
- Bloque 3: `padding:100px 0 110px`, alineado a la izquierda.
- Entre bloques, un divisor: fila flex con `gap:22px`, dos filetes `1px #D6CDBA` que
  ocupan `flex:1` y, en el centro, un rombo de `7px` con `border:1px solid #B99150` y
  `transform:rotate(45deg)`.

Textos (**aprobados por el cliente, literales, no reescribir**):
1. "Convierte las preguntas habituales de familias en respuestas claras, coherentes y adaptadas a la información de tu centro."
2. "Guía solicitudes, visitas y citas con flujos sencillos que evitan correos incompletos y llamadas repetitivas."
3. "Una capa de atención diseñada para ofrecer información del centro con privacidad, límites claros y criterio institucional."

**Privacidad** — banda de fondo `#EAE1CF`, `padding:120px 80px`,
`display:flex; gap:90px; align-items:flex-start`.
- Columna izquierda (`flex:1`, `gap:36px`):
  - `h2` Cormorant Garamond 300, 58px, `line-height:1.14`, `max-width:760px`:
    "Los datos de los menores no son letra pequeña. Son el punto de partida."
  - `p` Lora 18px, `line-height:1.75`, `color:#4E4B43`, `max-width:700px`:
    "SCHOLAIA trabaja con la información que el centro publica y con los flujos que aprueba la dirección. No pide a las familias datos que no necesita, no conserva lo que no hace falta y no decide nada que corresponda a una persona. El RGPD y la LOPDGDD no se comprueban al final: definen cómo está construido el asistente."
  - Lista de cinco líneas, `max-width:760px`, sin iconos ni viñetas: cada línea es un
    párrafo Lora 17px `color:#3F3C35` con `padding:20px 0`, separado por filetes
    `1px #D3C8AE` (también arriba de la primera y debajo de la última):
    1. "Trata únicamente la información que el centro decide publicar."
    2. "Las conversaciones no se usan para entrenar modelos."
    3. "Alojamiento y tratamiento de datos en la Unión Europea."
    4. "Registro completo de consultas, exportable para el centro."
    5. "Cuando una pregunta excede sus límites, deriva a una persona."
- Columna derecha: `assets/books-row.png` a `width:210px`, `margin-top:20px`,
  `drop-shadow(0 16px 30px rgba(60,48,30,.12))`. Decorativa (`alt=""`).

**Cierre** (`id="demo"`) — centrado, `padding:140px 80px 150px`, `gap:38px`.
- `h2` Cormorant Garamond 300, 62px, `line-height:1.14`, `max-width:900px`:
  "Quince minutos con la información de su centro."
- `p` Lora 18px, `line-height:1.7`, `color:#57544C`, `max-width:620px`:
  "Nos envía su web y las preguntas que más repiten las familias. Le mostramos a SCHOLAIA respondiendo con los datos reales del centro, sin instalar nada."
- Botón primario, `padding:18px 38px`.

**Footer** — `border-top:1px solid #D6CDBA`, `padding:38px 80px 44px`,
`justify-content:space-between; align-items:flex-end`.
- Izquierda: lockup SCHO/LAIA a `font-size:17px`.
- Derecha: Lora 14px `color:#6B665C`:
  "Asistente de secretaría y orientación para centros educativos · hola@scholaia.es"

### 3. Móvil (390 px)
Mismo contenido y mismo orden, una sola columna, `padding` lateral 24 px.
- Header: `padding:20px 24px`; lockup 15px; enlace "Demostración" Lora 13px.
- Hero: lockup reducido (ver tabla de la apertura), bloque de texto con
  `margin-top:44px` y `gap:26px`; `h1` 39px `line-height:1.1`; `p` Lora 16px.
- Afirmaciones: Cormorant 29px, `line-height:1.32`, `padding:54px 0` (la última
  `54px 0 60px`), todas alineadas a la izquierda; divisores con rombo de 6px y
  `gap:16px`.
- Privacidad: `padding:64px 24px`, `h2` 34px, `p` 16px, líneas de lista 15px con
  `padding:16px 0`. Sin la imagen decorativa.
- Cierre: `padding:72px 24px 80px`, `h2` 34px, `p` 16px, botón `padding:16px 30px`.
- Footer: columna, `gap:14px`, `padding:28px 24px 34px`, texto 13px.

### Componentes recurrentes

**Botón primario** (`a href="#demo"`, rectangular, sin border-radius):
```
font-family:'Lora',serif; font-size:16px; color:#F5F0E6;
background:#1B1E24; border:1px solid #1B1E24; padding:17px 34px;   /* 18px 38px en el cierre */
```
Hover: `background:#A9563D; border-color:#A9563D; color:#F8F4EC`.
En móvil: `font-size:15px; padding:15px 28px` (cierre `16px 30px`).
Mínimo 44 px de alto en móvil (se cumple con esos paddings).

**Lockup SCHO / LAIA**: dos líneas, `line-height:.82` (`.8` en tamaños grandes),
tracking `.06em` en SCHO y `.15em` en LAIA para tamaños pequeños; `.04em` / `.13em`
en los tamaños display.

**Enlaces de texto**: `a { color:#A9563D }`, hover `#8C4430`, `text-decoration:none`.

---

## Interactions & Behavior

**Secuencia de apertura** (única animación de la página):
- Se dispara al montar el hero. Fases y tiempos, contados desde la carga:
  - `0 ms` → fase 0 (cerrado)
  - `750 ms` → fase 1 (abriéndose)
  - `2250 ms` → fase 2 (abierto, logotipo revelado)
  - `4300 ms` → fase 3 (aparecen header, titular, subtítulo y botón)
- Transiciones:
  - libros: `transform 1500ms cubic-bezier(.16,1,.3,1)`
  - logotipo: `opacity 1100ms ease, clip-path 1400ms cubic-bezier(.16,1,.3,1)`
  - header: `opacity 900ms ease 300ms`
  - bloque de texto del hero: `opacity 1000ms ease 200ms, transform 1000ms cubic-bezier(.16,1,.3,1) 200ms`
- La animación **no** bloquea el scroll ni tapa la página con un overlay: son los
  propios elementos del hero los que se mueven.
- Accesibilidad: respetar `prefers-reduced-motion` saltando directamente a la fase 3
  (esto no está implementado en el prototipo y **hay que añadirlo**).
- Recomendado en producción: reproducirla solo en la primera visita de la sesión
  (`sessionStorage`) y en fase 3 desde el principio si vuelve.
- Ambas imágenes son decorativas: `alt=""`.

**Otras interacciones**: no hay más. Los enlaces del header y los botones apuntan a
`#demo`; en producción deben llevar al formulario o calendario real de demostración.
No hay estados de carga, formularios ni validación en este diseño.

Los fotogramas del artboard 1 incluyen un botón "Volver a reproducir" — es una ayuda
de revisión, no forma parte del sitio.

## State Management
Un único estado en el componente del hero:
- `phase: 0 | 1 | 2 | 3`, avanzado por tres `setTimeout` (750 / 2250 / 4300 ms) y
  limpiado al desmontar.
- Todo lo demás son valores derivados de `phase` (transforms, `opacity`, `clip-path`).
- Sin data fetching.

Opciones configurables previstas en el prototipo (útiles como props):
- `autoplayApertura` (boolean, por defecto `true`) — si es `false`, arranca en fase 3.
- `velocidadApertura` (0.5-2, por defecto `1`) — divisor de los tiempos.
- `ornamentos` (boolean, por defecto `true`) — muestra u oculta los rombos dorados
  de los divisores.

## Design Tokens

**Colores**
| Uso | Hex |
|---|---|
| Papel (fondo principal) | `#F5F0E6` |
| Papel sobre botón oscuro (texto) | `#F5F0E6` / hover `#F8F4EC` |
| Banda cálida (privacidad) | `#EAE1CF` |
| Tinta (titulares, logotipo) | `#171B22` |
| Tinta UI (botón, enlaces del header) | `#1B1E24` |
| Texto cuerpo | `#57544C` |
| Texto cuerpo sobre banda | `#4E4B43` |
| Texto de lista sobre banda | `#3F3C35` |
| Texto secundario / pies | `#6B665C` |
| Terracota (acento, hover) | `#A9563D` — hover de enlace `#8C4430` |
| Dorado (filetes finos, rombos) | `#B99150` |
| Filete sobre papel | `#D6CDBA` |
| Filete sobre banda | `#D3C8AE` |
| Borde de artboard (solo maqueta) | `#CFC7B5` |
| Escritorio del lienzo (solo maqueta) | `#DDD7C9` |

Nunca blanco puro. Sin azules, sin gradientes.

**Tipografía** (Google Fonts)
- Display: **Cormorant Garamond**, weight 300. Titulares y logotipo.
- Cuerpo: **Lora**, weight 400; itálica solo para los pies de la maqueta.
- Escala escritorio: 80 / 62 / 58 / 46 / 19 / 18 / 17 / 16 / 15 / 14 px.
- Escala móvil: 39 / 34 / 29 / 16 / 15 / 13 px.
- `line-height`: 1.08-1.16 en titulares, 1.32-1.34 en las afirmaciones, 1.7-1.75 en
  cuerpo, .8-.82 en el lockup.
- `text-wrap: pretty` en todos los bloques de texto largo.

**Espaciado** — múltiplos de 2 sobre una base de 4/8: 14, 16, 20, 24, 26, 34, 36, 38,
40, 54, 60, 64, 70, 72, 80, 90, 96, 100, 110, 120, 130, 140, 150.

**Radios y sombras**
- `border-radius: 0` en todo. No hay tarjetas redondeadas.
- Únicas sombras, y solo en las imágenes de libros:
  `drop-shadow(0 18px 34px rgba(60,48,30,.14))` (hero),
  `drop-shadow(0 16px 30px rgba(60,48,30,.12))` (privacidad),
  `drop-shadow(0 10px 20px rgba(60,48,30,.14))` (móvil).

## Restricciones de diseño (peticiones explícitas del cliente)
- **Nunca** etiquetas pequeñas en mayúsculas encima de los titulares (tipo
  "— EL PROPÓSITO"). Los titulares van solos.
- **Nunca** marcadores numerados 01 / 02 / 03 en las secciones.
- **Nunca** tarjetas redondeadas con icono y sombra estilo página de software.
- **Nunca** azul, gradientes morados ni texto monoespaciado decorativo.
- Los tres textos de las afirmaciones están aprobados: se usan literales.

## Responsive behavior
El prototipo entrega dos anchos fijos, 1440 y 390. Para producción:
- Breakpoint único sugerido en 900 px: por encima, layout de escritorio con contenido
  a `max-width:1280px` centrado y `padding` lateral fluido (80 px → 40 px);
  por debajo, layout móvil con `padding` lateral 24 px.
- Escalar los titulares con `clamp()` entre las dos escalas
  (p. ej. `h1: clamp(39px, 5.5vw, 80px)`).
- El lockup de la apertura debe escalar en bloque (imágenes, tamaño del logotipo y
  offsets de las fases en la misma proporción) para conservar el solape de la fase 0.
- La sección de privacidad pasa de dos columnas a una y se oculta la imagen decorativa.

## Assets
- `assets/books-stack.png` (449×394, PNG con transparencia) — pila de libros tumbados.
- `assets/books-row.png` (339×473, PNG con transparencia) — cuatro libros de pie.

Ambos son recortes hechos a partir de las ilustraciones de marca que aportó el
cliente (acuarela, lomos de cuero, ornamentos dorados; verde salvia, rosa empolvado,
terracota y crema envejecido). El fondo se ha eliminado; conviene pedir al cliente
los originales vectoriales o en alta resolución antes de publicar, y exportarlos
también en WebP/AVIF con `2x`.

El logotipo es tipográfico (Cormorant Garamond 300 en dos líneas), no una imagen.
Si el cliente dispone del logotipo original en SVG, sustituirlo por el archivo real.

## Files
- `SCHOLAIA.dc.html` — el diseño completo: fotogramas de la apertura, escritorio y
  móvil. El estilado está inline; la lógica de la secuencia está en la clase
  `Component` al final del archivo.
- `support.js` — runtime necesario solo para abrir el HTML en el navegador. No portar.
- `assets/` — las dos ilustraciones.
