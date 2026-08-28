# Plan Infinito

> «Para quien lleva más de un colegio: una fundación, una congregación, un grupo. Cada sede con su instalación propia, y con descuento a partir de la segunda.»
> — `3-web/index-libros.html`, ficha del plan Infinito

## Cuánto cuesta

Cuota mensual **con el IVA incluido**, según el número de alumnos del centro:

| Alumnos | Al mes |
| --- | ---: |
| 0-300 | 259 € |
| 301-500 | 299 € |
| 501-700 | 339 € |
| 701-1000 | 379 € |
| 1001-1200 | 419 € |
| 1201 o más | 459 € |

Más una instalación única de **420 €**.

Cada sede adicional lleva **80 € de descuento al mes** sobre el precio de su
tramo. No hay multi-sede: cada sede es su propia instalación, con su
calendario y sus respuestas.

Los precios van publicados en la web y **no se negocian**. Si un centro no
llega, se le quita producto —se le baja de plan—, no se le baja el precio.

## Verlo funcionando

Doble clic en **`Probar Infinito.command`**, en esta misma carpeta.

Arranca el producto entero con este plan puesto y abre el navegador
solo. No es una simulación: el servidor está de verdad detrás, así que
lo que este plan no incluye lo rechaza de verdad. Para cerrarlo, cierra
la ventana de Terminal que abre.

Desde una terminal es lo mismo que:

```bash
PLAN=infinito npm start
```

## Qué incluye

Según la ficha comercial:

- Todo lo del Centro.
- Test de orientación de 4.º de ESO.
- Centros sin límite, cada uno con su calendario.
- Personalización completa, por sede.
- Soporte prioritario.

La propia web dedica una sección aparte al test de orientación
(`id="orientacion"` en `index-libros.html`, línea 672): quince preguntas
sobre situaciones concretas, no escalas del uno al cinco, que puntúan nueve
áreas profesionales y devuelven un informe con la modalidad de Bachillerato
o la familia de FP que mejor encaja. El informe se genera en el dispositivo
del alumno y no se almacena ninguna copia — eso ya está resuelto en el
código (ver «Hecho ya» más abajo).

## Cómo se activa

En `1-producto/configuracion_centro.json`, bloque
`funcionalidades`:

```json
"funcionalidades": {
  "ia_generativa": true,
  "test_orientacion_4eso": true
}
```

Es Centro más un único interruptor encendido: `test_orientacion_4eso: true`.
Opcionalmente, en el bloque `ia`, se puede fijar un modelo distinto (más
capaz) solo para esta conversación:

```json
"ia": {
  "modelo": "gemini-flash-latest",
  "modelo_orientacion": "gemini-3.6-flash"
}
```

Si `modelo_orientacion` se deja vacío, se usa el mismo modelo que las
consultas normales (`servidor_ia.js`, línea 746).

### «Centros sin límite, cada uno con lo suyo»: cómo funciona de verdad

Esto no es un interruptor dentro de `funcionalidades` — es una consecuencia
de cómo está construido el resto del producto:

- `configuracion_centro.json` se lee siempre de una ruta fija dentro de la
  carpeta del servidor (`servidor_ia.js`, línea 191:
  `const RUTA_CONFIG = path.join(__dirname, 'configuracion_centro.json');`).
- La base de datos también es fija por instancia (`servidor_ia.js`, línea
  219: `new DatabaseSync(path.join(__dirname, 'datos.db'))`).

Es decir: **un centro (o una sede) es un despliegue** de
`1-producto/` con su propio `configuracion_centro.json` y su propio
`datos.db`. Para una fundación con varios colegios, Infinito es tantos
despliegues como sedes, cada uno con su calendario, su marca y sus
respuestas propias — nunca uno compartido a medias.

Dato curioso que sí está ya en el esquema de la base de datos, aunque hoy no
se aprovecha: casi todas las tablas de `datos.db` llevan una columna
`colegio_id`, rellenada con `ID_CENTRO` (`servidor_ia.js`, línea 179:
`const ID_CENTRO = (CONFIG.centro && CONFIG.centro.id) || 'centro';`), y
todas las consultas filtran por ella. El esquema está preparado para que un
único servidor sirva a varios centros a la vez si algún día se quisiera
compartir instancia — pero eso no es lo que hace hoy el producto: hoy,
`ID_CENTRO` es constante durante toda la vida del proceso porque sale de un
único `configuracion_centro.json` cargado al arrancar.

«Personalización completa, por sede» es, con esta arquitectura, gratis:
cada sede tiene su propio archivo y puede llevar un `marca.color_primario`,
un `calendario` y unas `preguntas_frecuentes.json` completamente distintos
sin tocar una línea de código.

## Qué archivos lo implementan

**Cliente — `1-producto/chat.js`, sección `9. TEST DE ORIENTACIÓN
PARA 4º DE ESO`, líneas 1154 a 1686** (la sección 10, `FORMULARIOS
INTEGRADOS`, empieza en la línea 1687). Dentro de ese bloque:

- El interruptor de visibilidad, en la construcción del menú principal:
  `chat.js`, línea 778 — `if (estado.config.funcionalidades.test_orientacion_4eso) { ... }`
  — solo si es `true` se añade la opción «🎓 ¿Qué estudio después de 4º de
  ESO?» al menú (línea 779).
- `iniciarOrientacion()` (línea 1329), que vuelve a comprobar el mismo
  interruptor en la línea 1334 — así que ni siquiera un enlace directo
  (`data-abrir-chat="orientacion"`, cableado en la sección 11 · ARRANQUE)
  puede saltárselo si el centro lo tiene apagado.

**Servidor — `1-producto/servidor_ia.js`:**

- Línea 698 — `if (modo === 'orientacion_4eso') { ... }`, dentro de la
  función que construye el prompt: instrucciones específicas para esta
  conversación (estructura de la respuesta, criterios innegociables —
  «ninguna opción es superior a otra», límite de 400 palabras).
- Línea 746 — `const MODELO_ORIENTACION = (CONFIG.ia && CONFIG.ia.modelo_orientacion) || MODELO;`
- Línea 815 — `const modelo = modo === 'orientacion_4eso' ? MODELO_ORIENTACION : MODELO;`,
  dentro de `generarRespuestaEnStreaming()`: es aquí donde de verdad se
  elige qué modelo de Gemini atiende esta conversación frente a las demás.
- Ruta `POST /api/chat` (línea 1018): línea 1021 fija `modo` a
  `'orientacion_4eso'` solo si el cliente lo pide explícitamente
  (`req.body.modo === 'orientacion_4eso'`); líneas 1040, 1069 y 1074
  registran en el log genérico «Test de orientación no atendido /
  completado / interrumpido» en vez del texto de la conversación.

## Hecho ya (no hay que repetirlo)

Dos puntos de este bloque ya están arreglados y commiteados:

- El test de orientación ya no guarda el contenido de las respuestas del
  alumno — así lo documenta el propio comentario en `servidor_ia.js`, justo
  antes de la línea 1068: se registra que el test se completó, nunca lo que
  contestó el alumno, para poder cumplir la promesa por escrito de que «no
  se guarda nada de lo que contestes».
- `iniciarOrientacion()` ya comprueba el interruptor
  `funcionalidades.test_orientacion_4eso` (línea 1334 de `chat.js`).

## Qué NO incluye (porque no hay nada más arriba)

Infinito es el plan completo: no le falta ninguna funcionalidad de
`funcionalidades` en `configuracion_centro.json`. Lo que lo diferencia de
Centro no es código adicional más allá del test de orientación, sino:

- **Cuántos despliegues cubre el contrato** (uno por sede, sin límite) —
  es una condición comercial, no un interruptor.
- **Soporte prioritario** — también contractual.

Esto importa comercialmente porque es fácil pensar que Infinito «tiene más
producto» que Centro; en realidad tiene el mismo producto, un interruptor
más encendido, y la libertad contractual de desplegarlo tantas veces como
sedes tenga el centro.
