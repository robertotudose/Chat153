# Plan Essential

> «Las gestiones de siempre resueltas a golpe de botón, con las respuestas
> que fija la dirección. Sin servidor que mantener.»
> — `3-web/index-libros.html`, ficha del plan Essential

## Cuánto cuesta

Cuota mensual **con el IVA incluido**, según el número de alumnos del centro:

| Alumnos | Al mes |
| --- | ---: |
| 0-300 | 99 € |
| 301-500 | 139 € |
| 501-700 | 179 € |
| 701-1000 | 219 € |
| 1001-1200 | 259 € |
| 1201 o más | 299 € |

Más una instalación única de **220 €**.

Los precios van publicados en la web y **no se negocian**. Si un centro no
llega, se le quita producto —se le baja de plan—, no se le baja el precio.

## Verlo funcionando

Doble clic en **`Probar Essential.command`**, en esta misma carpeta.

Arranca el producto entero con este plan puesto y abre el navegador
solo. No es una simulación: el servidor está de verdad detrás, así que
lo que este plan no incluye lo rechaza de verdad. Para cerrarlo, cierra
la ventana de Terminal que abre.

Desde una terminal es lo mismo que:

```bash
PLAN=essential npm start
```

## Qué incluye

Según la propia ficha comercial (`id="planes"` en `index-libros.html`):

- Navegación por botones.
- Calendario escolar del centro.
- Funciona sin servidor.

Es la versión determinista del producto: el alumno o la familia navega por
menús y botones fijos, y lo que responde el asistente es exactamente lo que
la dirección del centro ha escrito de antemano. No hay generación de texto
ni llamadas a ningún modelo.

## Cómo se activa

Copiando en el `configuracion_centro.json` del centro el bloque de
[`perfil.json`](perfil.json), que es esta carpeta:

```json
"plan": "essential",
"funcionalidades": { "ia_generativa": false, "busqueda_libre": false, ... }
```

El campo `plan` es lo que ha pagado el centro y **manda sobre los
interruptores**: aunque alguien ponga `ia_generativa: true` en un centro de
Essential, el servidor lo sigue sirviendo apagado y no llama al modelo. Esto
está comprobado en el banco de pruebas (grupo «Plan contratado»).

El campo `_ayuda` de `funcionalidades` lo explica en el propio archivo:

> «Si ia_generativa es false, el asistente funciona en modo 100%
> determinista (el plan Essential) sin llamar a ninguna API ni generar
> coste.»

**El «sin servidor» de la ficha comercial se cumple con este código, y está
probado.** No hace falta ningún producto aparte para honrarlo.

`chat.js` pide la configuración al servidor y, si no contesta nadie, la lee
del archivo que tenga al lado (función `arrancar`, sección 11):

> «Si no hay servidor (modo suelto, o el producto sin IA), se cae al
> archivo que esté junto a la página.»

Y con `ia_generativa: false` ni siquiera intenta hablar con el modelo
(`comprobarServidor`, sección 4). Así que basta con dejar en una carpeta de
alojamiento estático estos siete archivos, sin Node por ningún lado:

```
index.html   chat.js   style.css   widget.js
configuracion_centro.json   preguntas_frecuentes.json   marca/
```

**Comprobado el 28-08-2026**, no deducido: se sirvieron esos archivos con
`python3 -m http.server` (sin `servidor_ia.js` en marcha), y el asistente
abrió el menú completo y **no mostró el botón del test de 4.º de ESO**,
porque es de Infinito. Sin más errores en consola que el 404 esperado de
`/api/salud`, que es precisamente la comprobación que hace que el asistente
se dé cuenta de que está solo.

Aquel día el buscador local seguía encendido en Essential y resolvió una
consulta escrita. **Ya no**: `busqueda_libre` pasó a ser de Centro, porque
la web promete «en Essential se pulsa; en Centro se escribe» y el producto
tenía que decir lo mismo.

## Las preguntas son las del centro

En una instalación real, `preguntas_frecuentes.json` **no lleva las preguntas
de ejemplo: lleva las que nos pase el propio colegio**, que son las que de
verdad le entran por teléfono. Cada centro recibe llamadas distintas y un
catálogo escrito por nosotros falla justo en lo suyo.

El límite no es comercial, es de interfaz: **esto son botones, y un menú de
botones deja de ser navegable pasadas unas 40 preguntas**. Cuando la lista
que nos pase un centro se pase de ahí, la conversación se tiene sola — eso ya
no se navega, eso se escribe, y escribir es Centro.

## Qué archivos lo implementan

- `1-producto/chat.js`, sección `7. NAVEGACIÓN GUIADA POR MENÚS
  (nivel 1)` y `8. CALENDARIO ESCOLAR` — el comportamiento de este plan,
  activo con independencia del valor de `ia_generativa`.
- `1-producto/servidor_ia.js`, bloque `PLANES CONTRATADOS` — el
  orden de los tres planes y las funciones `planIncluye()` y
  `funcionalidadActiva()`, que son las que cruzan el plan con los
  interruptores:
  ```js
  function hayIADisponible() {
    return Boolean(CLAVE_API) && funcionalidadActiva('ia_generativa', 'centro');
  }
  ```
- `2-planes/Essential/perfil.json` — el bloque que se copia al vender.

## Qué NO incluye

- **IA generativa.** No hay nivel 3: si la pregunta no encaja con ningún
  botón ni con el buscador local, el asistente remite a secretaría en vez
  de generar una respuesta. Comercialmente es la palanca principal de
  subida a Centro: en cuanto una familia escribe algo que no está
  contemplado, Essential no lo resuelve.
- **Panel de administración con métricas ni registro exportable.** Existe
  en el código (`1-producto/panel/panel.html`, servido en `/panel`), pero
  necesita `servidor_ia.js` en marcha y su base de datos — no tiene sentido
  sin servidor, así que no forma parte de la promesa de este plan.
- **Escribir con sus propias palabras.** `busqueda_libre: false` esconde el
  campo de texto: aquí se pulsa, no se escribe. Es literalmente lo que dice
  la web («en Essential se pulsa; en Centro se escribe»).
- **Test de orientación de 4.º de ESO.** Es exclusivo de Infinito, y no solo
  en la pantalla: el servidor devuelve 403 si se pide a mano.
- **Personalización por sede ni soporte prioritario** — son términos de
  contrato/servicio, no interruptores de código: no hay nada que
  comprobar en `configuracion_centro.json` para ellos.
