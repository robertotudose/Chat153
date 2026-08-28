# Panel del centro

El panel diario de la **secretaría** de un colegio: lo que han pedido las
familias, lo que el asistente no supo responder y el registro de todo lo que
ha pasado por él.

Sustituye a `dashboard.html` (`/admin`) y a `demo.html` (`/demo`), que están
archivados en `7-archivo/paneles-anteriores/`. Las dos direcciones antiguas
redirigen aquí.

## Cómo se abre

**Con el servidor en marcha** — es el modo de verdad:

```bash
cd "producto" && npm start
```

y entrar en <http://localhost:3000/panel> con **su usuario y su contraseña**.
La sesión dura dos horas.

La primera vez, cuando el centro todavía no tiene accesos personales, se entra
con la contraseña del `.env` (`ADMIN_PASSWORD`) y el panel lleva directamente a
crear el primer usuario. **En cuanto existe uno, esa contraseña deja de
valer**: es una llave de arranque, no una puerta compartida abierta detrás de
los accesos personales.

**Suelto, para enseñarlo en una visita** — sin servidor ni contraseña:

```bash
cd "1-producto/panel" && python3 -m http.server 8899
```

y abrir <http://localhost:8899/panel.html>. Al no encontrar servidor se
rellena con datos de ejemplo y lo dice con una etiqueta roja en la cabecera.
Hay que servirlo: la ruta del proyecto lleva un emoji y `file://` se atraganta.

## Qué hace

| | |
|---|---|
| **Hoy** | Cuatro cifras del día y la bandeja de solicitudes sin cerrar |
| **Solicitudes** | Todas, con buscador y filtros por estado y tipo |
| **Preguntas** | De qué preguntan las familias, qué se quedó sin respuesta y las respuestas que ha añadido el centro |
| **Registro** | El histórico completo, buscable, paginado y exportable |
| **Accesos** | La contraseña de cada cual; y, para dirección, quién puede entrar y quién ha mirado datos de familias |
| **Centro** | Contacto y horario, y las cuatro listas del calendario. Solo dirección edita |

Y las acciones: cambiar el estado de una solicitud, abrir el correo del centro
ya rellenado, escribir la respuesta que le faltaba al asistente, exportar a CSV
e imprimir el informe.

Todo funciona igual con datos reales y con el ejemplo: son dos *fuentes*
intercambiables (`FUENTE_SERVIDOR` y `FUENTE_EJEMPLO`) con la misma forma, así
que la versión de demostración y la de verdad no se separan nunca.

## Lo que hubo que arreglar en el servidor para que esto no mintiera

### El registro no contaba casi nada

`registrarConsulta()` solo se llamaba desde el servidor, así que **todo lo que
resolvían los botones y el buscador local no se registraba en ningún sitio**.
El panel habría enseñado una fracción de la actividad real y una tasa de
resolución artificialmente baja.

Ahora hay un `POST /api/consultas` al que `chat.js` avisa cuando resuelve en el
navegador, con su vía (`buscador`, `boton`, `calendario`). Se manda y se
olvida: si falla, la familia no se entera.

### «Resuelta» quería decir «contestó algo»

`resuelta` era `Boolean(texto.trim())`, de modo que un «no tengo ese dato,
llame a secretaría» contaba como acierto y la lista de preguntas sin responder
salía siempre vacía — justo la lista que hace útil el panel.

Ahora lo decide `pareceSinRespuesta()`, en `analisis_consultas.js`, que busca
marcas de **ausencia de información** y no de derivación: «no disponemos de
información sobre las rutas» es un hueco, «no disponemos de plazas» es una
respuesta. Es una heurística sobre texto en español, con sus casos en
`pruebas_analisis.js`. Cuando aparezcan fórmulas nuevas en respuestas reales,
se añaden ahí.

### No se guardaba de qué iba cada consulta

`categoria` guardaba el modo (`general`, `orientacion_4eso`...), no el tema.
Ahora hay una columna `tema` y un clasificador (`analisis_consultas.js`) que
la rellena a partir de la base de conocimiento del centro, con peso por rareza
de las palabras: ante la duda deja la consulta **sin clasificar**, que es
preferible a colgarle un tema equivocado a algo que la dirección va a mirar
para decidir qué información preparar.

### Contestar un hueco no puede reescribir el pasado

Cuando la secretaría responde una pregunta pendiente, esa consulta se marca
`atendida = 1` y sale de la lista. **No** pasa a `resuelta = 1`: en su momento
no se resolvió, y el registro no se retoca.

## El centro y su calendario

Antes de esto, cambiar una fecha o el horario de secretaría exigía editar
`configuracion_centro.json` a mano en el servidor y reiniciarlo. Ahora
dirección lo hace desde el panel y se usa desde la siguiente pregunta que
haga una familia: no hace falta reiniciar nada, porque el servidor lee
`CONFIG` en cada consulta, no lo cachea.

El archivo `configuracion_centro.json` sigue siendo el único sitio que adapta
el producto a un colegio, tal y como pide el CLAUDE.md del proyecto: el panel
no crea una fuente de datos aparte, reescribe ese mismo archivo entero cada
vez (conservando el orden y los campos `_ayuda`), así que se puede seguir
editando a mano exactamente igual que antes.

**Solo dirección edita.** El calendario le dice a todas las familias si hay
que venir un día o no: no es una tarea del día a día como cerrar una
solicitud. Secretaría lo ve, no lo toca; el servidor lo hace cumplir, no solo
la pantalla.

Cada fecha lleva un identificador estable (se asigna una vez, al arrancar, y
no cambia aunque se reordene la lista) y quién la añadió — ese dato **no**
sale en `/api/configuracion`, que es lo que ve el navegador de una familia.

Lo que no está: **editar una fecha en el sitio.** Se borra y se vuelve a
añadir; para lo poco que cambia un calendario en un curso no compensaba una
segunda pantalla. El servidor sí tiene el endpoint (`POST .../:tipo/:id`) por
si hace falta más adelante.

## Accesos y traza

Un acceso por persona, con dos papeles:

- **Secretaría** trabaja en el panel y cambia su propia contraseña.
- **Dirección** hace lo mismo y además da y quita accesos y ve quién ha
  mirado datos de familias.

Las contraseñas se guardan con **scrypt y sal por usuario**, no con un SHA
a secas: un SHA se calcula miles de millones de veces por segundo y una lista
robada se rompe en minutos. Mínimo diez caracteres. Tras tres intentos
fallidos la espera crece con cada fallo, por cuenta y no solo por IP, que es
lo que protege de que prueben mil contraseñas contra la misma persona desde
sitios distintos.

Quitar un acceso cierra sus sesiones al momento, y cada petición vuelve a
comprobar que la persona sigue activa: si la baja llega por otro camino —una
edición a mano en la base de datos, otra copia del servidor— la sesión abierta
tampoco sobrevive.

**Los datos de contacto de las familias no viajan con la lista.** El correo y
el teléfono se piden uno a uno, cuando alguien pulsa «ver los datos de
contacto» o escribe un correo, y el servidor anota quién y cuándo. Exportar
también queda anotado, con cuántas solicitudes se llevó. Eso es lo que permite
responder a «¿quién vio el teléfono de esta familia?», que es exactamente lo
que pregunta una auditoría. Minimizar de verdad es no enviar el dato, no
esconderlo en el navegador.

Las sesiones viven en memoria a propósito: al reiniciar el servidor se cierran
todas. Para un panel de horario de secretaría es lo correcto y evita tener
sesiones vivas en disco.

## Lo que falta

### Cosas pequeñas y honestas

- **El buscador local del navegador no conoce las respuestas del centro.** Se
  inyectan en el contexto del modelo, así que la IA sí las usa, pero si la
  pregunta la resuelve el buscador local con una entrada antigua, la respuesta
  nueva no aparece. Para arreglarlo hay que servirlas al cliente junto con
  `preguntas_frecuentes.json`.
- **La Semana Santa que el calendario calcula sola no entra en la pastilla de
  «qué día es hoy»**: `jornadaDeHoy()` solo mira fechas escritas a mano. Si cae
  en Semana Santa no dice nada, en vez de decir algo equivocado.
- **Las consultas anteriores a la migración** no tienen tema y salen como «Sin
  clasificar». Se irán quedando atrás solas.
- **La lista de solicitudes se corta en 300.** Suficiente para un curso normal;
  si un centro llega ahí, hay que paginarla como el registro.
- **Un centro con `ia_generativa: false`** (plan Essential, sin servidor) no
  registra nada: no hay a quién avisar. Ese plan tampoco tiene panel.
- **No hay «he olvidado mi contraseña».** La restablece dirección desde
  Accesos, y si quien la ha olvidado es la única dirección del centro, hay que
  entrar en el servidor. Con dos personas con papel de dirección no pasa: el
  panel impide quitarle ese papel a la última que lo tenga.
- **La llave de arranque del `.env` sigue con el formato antiguo.** Si se usa
  `ADMIN_PASSWORD_HASH`, es un SHA-256 sin sal, que es débil. Se ha dejado así
  para no romper las instalaciones que ya lo tengan puesto, y solo sirve
  mientras el centro no tiene ningún acceso personal. Las contraseñas de las
  personas nunca pasan por ahí: van con scrypt.
- **La traza enseña las 200 últimas entradas.** Si hiciera falta más para una
  auditoría, la tabla `accesos_datos` está entera en la base de datos.

## Cosas que conviene no romper

- **Los datos de las familias no se enseñan en la lista.** Aparecen al abrir la
  ficha, con el aviso de para qué se pueden usar.
- **El informe impreso no lleva datos personales.** Imprime cifras, temas y
  huecos; la bandeja y las solicitudes se quedan fuera a propósito, porque un
  informe acaba encima de una mesa.
- **La exportación a CSV neutraliza las fórmulas.** Un mensaje que empiece por
  `=` se escapa antes de escribirlo: si no, Excel lo ejecuta al abrirlo.
- **El servidor anonimiza** correos, teléfonos y DNI dentro del texto de las
  consultas antes de guardarlas (`anonimizar()`).
- **Todo lo que se pinta se escapa** antes de insertarlo en el HTML (`esc()`).
  Los mensajes los escriben las familias: es texto de fuera.
- **Las respuestas del centro se guardan en la base de datos**, nunca en
  `preguntas_frecuentes.json`. Una respuesta equivocada se borra sin tocar
  ningún archivo del producto.
- **El autor de una respuesta, de un cambio de estado y de una fecha del
  calendario lo pone el servidor** desde la sesión, no el navegador. Una
  traza que el cliente puede escribir no es una traza.
- **El tipo de fecha de la URL (`/api/admin/calendario/:tipo`) se comprueba
  contra una lista sin prototipo** (`Object.create(null)`). Con un objeto
  normal, `/calendario/__proto__` habría colado sin dar el 404 que debía dar.
  Se encontró probándolo, no leyendo el código: `npm run seguridad` lo repite.
- **El hash y la sal de una contraseña no salen del servidor** en ninguna
  respuesta, ni para el propio interesado.

## Pruebas

```bash
cd "producto" && npm test
```

Ejecuta el banco del buscador local (`pruebas_motor.js`) y el del análisis de
consultas (`pruebas_analisis.js`): clasificación por temas y detección de
respuestas que en realidad no responden.

Y con el servidor en marcha, las 58 comprobaciones de seguridad:

```bash
PRUEBA_USUARIO=... PRUEBA_CLAVE=... npm run seguridad
```

Ataca al servidor de verdad: intenta descargarse la base de datos, colarse sin
sesión, meter SQL en los filtros, colar código en la pantalla de secretaría y
darle la vuelta al asistente. Lo que no se pueda comprobar sale como
**omitido**, que no es lo mismo que aprobado. El detalle de la revisión y lo
que se encontró está en `5-documentacion/revision_seguridad.md`.
