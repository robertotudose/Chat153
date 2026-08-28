# Planes de SCHOLAIA

Esta carpeta documenta los tres planes que se venden hoy (`Essential`,
`Centro`, `Infinito`, definidos en `3-web/index-libros.html`,
sección `id="planes"`). Cada subcarpeta tiene dos cosas:

- **`perfil.json`** — el bloque que se copia en el `configuracion_centro.json`
  del centro al hacer una instalación. Es lo único que hay que tocar para
  que un colegio tenga un plan u otro.
- **`README.md`** — la ficha: qué incluye, qué no, y qué archivos del
  producto lo implementan de verdad.

**La web manda.** Cuando el plan de negocio y la web se contradigan, vale lo
que dice `3-web` — es lo último acordado por el equipo. De ahí
salen los nombres (Essential/Centro/Infinito) y el reparto: el test de 4.º de
ESO va en Infinito.

**Aquí no hay código.** Ni una línea de `chat.js`, ni una copia de
`style.css`, ni nada que se sirva a un navegador. Los `README.md` apuntan al
código que ya existe en `1-producto/` y `1-producto/panel/`.

## La decisión de arquitectura que esto protege

Los tres planes **no son tres copias del producto**. Son **un mismo
producto que mira qué ha pagado el centro**. No hay una carpeta
`Essential/chat.js` distinta de la de `Centro/chat.js`: es el mismo archivo,
comportándose distinto según lo que diga el JSON.

Quien decide es el campo `plan` de `configuracion_centro.json`, y **manda
sobre los interruptores de `funcionalidades`**. Los interruptores sirven para
que un centro apague algo que sí tiene contratado; nunca para encender algo
que no. En el servidor:

```js
const PLANES = ['essential', 'centro', 'infinito'];

function funcionalidadActiva(nombre, planMinimo) {
  return planIncluye(planMinimo) && (CONFIG.funcionalidades || {})[nombre] !== false;
}
```

Un plan mal escrito, o que falte, se trata como `essential`: una errata no
puede regalar funcionalidad que nadie ha pagado.

### El plan se cobra en el servidor, no en la pantalla

Esto no es un detalle de implementación, es la diferencia entre separar los
planes y aparentar que están separados. El navegador se puede modificar; un
`POST` a mano no pasa por ningún menú. Antes de esto, `/api/chat` aceptaba
`modo: "orientacion_4eso"` sin mirar el plan: un centro de Centro podía usar
el test de Infinito, con su prompt y su modelo. Ahora devuelve 403, y el
banco de pruebas lo comprueba en cada ejecución (grupo «Plan contratado»).

Lo mismo con el contenido: una categoría de `preguntas_frecuentes.json` puede
llevar `plan_minimo`, y lo que el plan no incluye ni se pinta en el menú, ni
entra en el prompt que se manda al modelo, ni aparece como tema en el panel.
Sin ese campo, una categoría sale en todos los planes: olvidarse de ponerlo
deja una pregunta de más, nunca una familia sin respuesta.

### Por qué importa: el repositorio ya pagó este error una vez

Hasta el 28-08-2026 el repositorio tenía dos copias del mismo producto —
el chatbot sin IA y `1-producto/` — nacidas del mismo código y
divergiendo desde entonces. Las cifras, comparando con `wc -l` y `diff` los
tres archivos que existían en ambas carpetas:

| Archivo | Chatbot sin IA | `1-producto` | Líneas que difieren (`diff` `<`/`>`) |
| --- | ---: | ---: | ---: |
| `chat.js` | 1.019 líneas | 2.085 líneas | 2.792 |
| `style.css` | 1.797 líneas | 2.346 líneas | 553 |
| `preguntas_frecuentes.json` | 222 líneas | 710 líneas | 569 |

(Cifras obtenidas el 28-08-2026 con `wc -l` y `diff archivo1 archivo2 | grep -c '^[<>]'` sobre
ambas carpetas.)

En `chat.js` casi no quedaba una función idéntica letra por letra entre las
dos copias. Y no era que una fuese la otra más funciones al final: había
reescrituras del mismo bloque en los dos sitios — el motor de búsqueda
difusa, el calendario, el orquestador de menús — cada una con sus propios
matices y sus propios bugs arreglados en un sitio y no en el otro. Cada
arreglo había que hacerlo dos veces, y no se estaba haciendo.

Ese fork está archivado en `7-archivo/chatbot-sin-ia/`, porque el plan
Essential se sirve desde el código bueno. Pero la lección es la razón de ser
de esta carpeta: crear una copia por plan (`2-planes/Essential/chat.js`,
`2-planes/Centro/chat.js`, `2-planes/Infinito/chat.js`) habría
multiplicado por tres el problema que acabábamos de quitarnos de encima. De
ahí que aquí haya `perfil.json` y fichas, y ni una línea de producto.

## Qué NO hace esta carpeta

- No copia ni duplica nada de `1-producto/` ni de
  `1-producto/panel/`: solo apunta a ellos.
- No es un tercer producto ni una plantilla para crear uno.
- No guarda la lógica de ningún plan: eso vive en el servidor y en `chat.js`,
  y lo que hay aquí es la configuración con la que se instala.

## Dónde está la escalera de verdad

El salto entre planes **no es cuánto contenido llevan**. Las preguntas las
pone el propio centro en los tres, porque cada colegio recibe llamadas
distintas y un catálogo escrito por nosotros falla justo en lo suyo. Lo que
cambia es qué se puede hacer:

| | Essential | Centro | Infinito |
| --- | :---: | :---: | :---: |
| Sus preguntas frecuentes, por botones | ✅ | ✅ | ✅ |
| Calendario del centro | ✅ | ✅ | ✅ |
| Escribir con sus palabras | ❌ | ✅ | ✅ |
| Cambiar las respuestas ellos mismos | ❌ | ✅ | ✅ |
| Saber qué preguntan las familias | ❌ | ✅ | ✅ |
| Test de orientación de 4.º de ESO | ❌ | ❌ | ✅ |

Las tres filas del medio son las que sostienen la venta de Centro, y ninguna
se compra metiendo más preguntas en Essential:

1. **La familia escribe.** Es el gesto natural. En Essential, quien escribe
   no recibe nada — el campo de texto ni siquiera aparece.
2. **Lo cambian ellos.** Sin panel, cada cambio de fecha vuelve a nosotros.
   Esto además acota nuestro coste: el soporte es el gasto real del negocio,
   no la API.
3. **Saben qué se les pregunta.** Sin servidor no hay dónde guardarlo, así
   que un centro de Essential no se entera de lo que no supo responder.

## Las tres fichas

- [`Essential/README.md`](Essential/README.md) · [`perfil.json`](Essential/perfil.json)
- [`Centro/README.md`](Centro/README.md) · [`perfil.json`](Centro/perfil.json)
- [`Infinito/README.md`](Infinito/README.md) · [`perfil.json`](Infinito/perfil.json)
