# Reunión con Lucas · guion

> Escrito el 26 de agosto de 2026 a las 4:27 de la mañana, al final de una
> sesión larga sobre la web comercial. Este archivo es para llevarlo abierto
> en la reunión, no para leerlo entero.

---

## 1. Lo que pediste recordar

### Rediseñar el panel y los chatbots con el estilo de la web

Ahora mismo el panel (`1-producto/dashboard.html`) y los dos chatbots
usan el sistema visual antiguo: Plus Jakarta Sans + Inter, gama slate, azul
`#0284c7`. La web comercial nueva usa otro mundo: papel, tinta y boli.
**Que un director vea la web y luego el panel y le parezcan dos productos
distintos es un problema de confianza, no de gusto.**

Estas son las fichas exactas para que el rediseño case. Copiadlas tal cual:

```css
--papel:#F3F1EA;     /* fondo general */
--banda:#EAE7DE;     /* franja de sección alterna */
--hoja:#FFFFFF;      /* superficie elevada: tarjetas, tablas */
--tinta:#15171B;     /* texto principal y botones */
--grafito:#484A4F;   /* texto secundario · 7,8:1 sobre papel */
--filete:#DCD8CD;    /* líneas finas */
--boli:#1B4B8F;      /* único acento; solo en lo que se puede pulsar */

--display:'Schibsted Grotesk', sans-serif;   /* titulares, interfaz, cifras */
--cuerpo:'Literata', Georgia, serif;          /* texto corrido */
--mano:'Caveat', cursive;                     /* anotaciones al margen */

--r:4px;             /* radio de esquina */
--ancho:1060px;
```

Reglas que van con las fichas:

- Cuerpo a **19 px** con interlínea 1,72. Nada por debajo de 15 px.
- **Todo el texto por encima de 7:1** de contraste. En la web están medidos
  los 16 pares; si cambiáis un color, hay que volver a medir.
- Botones en **tinta, nunca en azul**. El azul solo para enlaces.
- **Sin antetítulos en mayúsculas** encima de los titulares.
- Objetivos de pulsación de **44 × 44 px** como mínimo.

**Ojo con el `CLAUDE.md`.** Dice hoy: *«Los paneles nuevos siguen el sistema
visual de `01 - Chatbot Sin IA/style.css`, no uno inventado»*. Si cambiáis de
dirección, **hay que actualizar esa regla el mismo día**, o la próxima sesión
de Claude «corregirá» el rediseño devolviéndolo al estilo viejo.

### Meter capturas de ambos dentro de la web

La página vende software y **no tiene ni un píxel de software**: sus dos
únicas imágenes son el logotipo. Es su mayor carencia.

El panel **ya está hecho** (52 KB: acceso, KPIs, buscador, filtros, tablas y
exportación a CSV). No le falta programación, le faltan **datos** para poder
fotografiarlo. Levantar el servidor en local, meter un puñado de consultas de
ejemplo y sacar la captura es media hora, y **no cuesta nada**.

Cuando la captura salga, va etiquetada como **datos de ejemplo**. Un panel con
cifras que parezcan de un centro real, sin tener centros, es una mentira que
no compensa.

---

## 2. Decisiones que dependen solo de vosotros dos

| Qué | Por qué corre prisa |
| :--- | :--- |
| **El test de 4.º de ESO: ¿Infinito o Centro?** | Preguntáoslo así: ¿lo que hace subir de plan es el test o son las sedes? Si un centro de una sola sede lo quiere y no puede pagarlo, está demasiado arriba. |
| **El dominio** | `scholaia.es` está escrito en tres sitios de la web y **nadie lo ha confirmado**. Si al final es otro, son tres líneas. |
| **El logotipo** | En `LAIA`, la «I» está pegada a las dos «A» y se lee como un bloque. Se arregla en Canva dando aire al espaciado de esa línea. Pasadme el archivo nuevo y lo vuelvo a extraer. |
| **Vuestra historia** | Para el apartado de quiénes sois. Nombres, de dónde sois y por qué empezasteis. Si hay una anécdota concreta, mejor que cualquier frase de misión. Y **que sea la misma historia que contéis en redes**: un director que os busque va a ver las dos. |
| **Las tarjetas para los institutos** | Si la URL se va a teclear a mano desde una tarjeta, el dominio tiene que ser corto y fácil de dictar. Decidid dominio antes de imprimir. |
| **Reparto de los 1.000 €** | Anotad dónde va cada euro desde el primero. |

---

## 3. Bloqueado por terceros

- **Gestoría → aviso legal, política de privacidad y cookies.** Son
  obligatorios (LSSI-CE art. 10) el día que la web se publique. Mientras esté
  en local no hay riesgo. Para escribirlos hace falta: razón social, NIF,
  domicilio y correo de contacto.
- **Salesianas.** No van a la web hasta que haya algo firmado. Que os
  propusieran ellos la idea es la mejor señal de mercado que existe, pero una
  negociación abierta no es un cliente.

---

## 4. Lo que NO hay que hacer todavía

- **No paguéis el servidor.** Vendéis yendo en persona con el portátil, y para
  eso no hace falta nada alojado. El servidor se paga con el primer sí.
- **No metáis el widget en la web** mientras no haya servidor: funcionaría
  solo con botones y buscador, o sea que el visitante probaría el plan
  Essential en una página que vende Centro.
- **No añadáis más secciones a la web.** Ya está por encima del 90 % de su
  categoría. Lo que frena el negocio no es el diseño.

---

## 5. Estado de la web, por si hace falta enseñarla

`3-web/index-libros.html` · se sirve con
`python3 -m http.server` desde esa carpeta (la ruta lleva un emoji y `file://`
falla).

- 7 bloques, ~1.160 palabras, sin dependencias externas salvo las tipografías.
- Accesible: contraste por encima de 7:1, pulsables a 44 px, interruptor para
  el movimiento de fondo, sin controles que mientan.
- **Se imprime bien**: unas cinco páginas A4 con el logotipo arriba. Probadlo
  con Cmd+P antes de la reunión, porque es como la va a reenviar un director.
