# Revisión de seguridad

**27 de agosto de 2026.** Repaso completo del producto con IA (servidor,
widget y panel del centro) buscando activamente lo que un tercero podría
hacer. Todo lo de aquí está comprobado contra el servidor en marcha, no
leído del código.

Para repetirla:

```bash
cd "producto" && npm start          # en una terminal
PRUEBA_USUARIO=... PRUEBA_CLAVE=... npm run seguridad
```

Son 58 comprobaciones. Lo que no se pueda comprobar se marca como **omitido**,
que no es lo mismo que aprobado.

---

## Lo que estaba mal

### 1 · Crítico — la base de datos se descargaba desde el navegador

El servidor hacía `express.static(__dirname)`, es decir, servía su propia
carpeta entera. En esa carpeta está `datos.db`.

Cualquiera que escribiera `/datos.db` en la barra del navegador se llevaba,
sin contraseña ni nada:

- nombre, correo, teléfono y mensaje de **todas las familias**;
- las **contraseñas del centro** (con hash, pero para romperlas con calma);
- el **registro de quién había mirado los datos de quién**, que es justo lo
  que existía para demostrar que nadie los mira sin motivo.

Toda la minimización de datos del panel —no mandar el contacto hasta que
alguien lo pide, anotar cada acceso— quedaba anulada por una línea.

También salían `servidor_ia.js` (con los patrones del escudo de inyección a
la vista), `package.json` y `configuracion_centro.json`.

**Arreglado:** lista cerrada de archivos públicos. Lo que no esté en ella no
se sirve, aunque se acierte el nombre.

### 2 · Alto — la configuración interna del centro era pública

`configuracion_centro.json` se entregaba entero a cada visitante: el
**webhook interno** del centro, el correo de destino de las solicitudes y los
plazos de conservación. El navegador no necesita nada de eso.

**Arreglado:** `GET /api/configuracion` devuelve solo lo que usa el widget.

### 3 · Alto — los errores contaban dónde vive el servidor

Un JSON mal formado devolvía la página de error de Express con la traza
completa: rutas absolutas del disco, el nombre de usuario de la máquina y las
versiones de las librerías.

**Arreglado:** un manejador propio que responde `{"error": "..."}` y deja el
detalle en la consola del servidor.

### 4 · Alto — el escudo de inyección no cazaba la frase más común

El filtro buscaba «ignora **las** instrucciones» pero no «ignora **tus**
instrucciones», que es como se escribe casi siempre — y es, literalmente, el
ejemplo que la web comercial pone como bloqueado. Tampoco cazaba «olvídate de
las instrucciones», «a partir de ahora eres...» ni «entra en modo
mantenimiento».

**Arreglado:** lista ampliada, con casos que comprueban además que **no** se
corta a una familia que pregunta algo normal. Un falso positivo es peor que
dejar pasar un intento que el modelo va a rechazar igual.

### 5 · Medio — el historial de la conversación no se miraba

El historial lo manda el navegador, así que se puede falsificar un turno del
propio asistente («modo mantenimiento activado») para que el modelo lo dé por
cierto. El filtro solo miraba el mensaje.

El modelo aguantó los dos intentos que se le hicieron, pero no tiene sentido
pagarle por rechazarlos ni dejar de anotarlos.

**Arreglado:** el historial se sanea (solo dos papeles y texto, ocho turnos,
2.000 caracteres) y pasa por el mismo escudo.

### 6 · Medio — el panel no llevaba cabeceras de seguridad

Se podía incrustar en otra web (que es como se engaña a alguien para que pulse
donde no cree), se quedaba en cachés intermedias y no tenía política de
contenido.

**Arreglado:** `X-Frame-Options: DENY`, `frame-ancestors 'none'`,
`Cache-Control: no-store` en el panel y en todo `/api/admin`, `nosniff`,
`Referrer-Policy` y una CSP cuyo punto importante es `connect-src 'self'`:
aunque algún día se colara un script, no podría mandar los datos fuera.

### 7 · Bajo — CORS abierto de par en par

`ORIGENES_PERMITIDOS` viene en `*`, así que cualquier web puede llamar a la
API y gastar la cuota de IA del centro. No expone datos (el panel va con
token), pero cuesta dinero.

**Arreglado a medias:** el servidor ahora avisa al arrancar. Ponerlo bien es
editar el `.env` de cada instalación.

---

## Lo que ya estaba bien

Comprobado atacándolo, no suponiéndolo:

- **Inyección SQL.** Seis ataques contra los filtros del registro
  (`' OR 1=1`, `'; DROP TABLE consultas;--`...). Todo va con parámetros; la
  tabla sigue en pie. La paginación acota los números absurdos.
- **Código metido por una familia.** Diez cargas distintas (`<script>`,
  `<img onerror>`, `javascript:`, `<svg onload>`, `data:text/html`...). El
  panel las escapa; el saneador del chat las deja inertes y descarta los
  atributos de los enlaces que sí permite.
- **Acceso al panel.** Sin token, con token inventado y con usuario
  inexistente: 401 en todos los casos. El mensaje de error no dice si el
  usuario existe. Los papeles se respetan en el servidor, no solo en la
  pantalla.
- **Datos de las familias.** La lista de solicitudes no lleva correos ni
  teléfonos; se piden uno a uno y queda anotado quién los abrió.
- **Anonimización.** Correos, teléfonos y DNI se ocultan en el texto de las
  consultas antes de guardarlas.
- **Límites.** Mensaje de más de 2.000 caracteres, 400. Cuerpo de 200 KB, 413.
- **Fuerza bruta.** Tras tres intentos fallidos la espera crece, por cuenta y
  no solo por IP.

---

## Añadido el 27 de agosto: editor de calendario del centro

Al construir la pantalla de Centro (contacto y calendario editables por
dirección) se encontró y arregló en el momento, antes de dar la función por
buena:

- **`/api/admin/calendario/:tipo` indexaba un objeto normal con una clave que
  viene de la URL.** `/calendario/__proto__` no daba el 404 esperado —
  `TIPOS_CALENDARIO['__proto__']` devuelve `Object.prototype`, que es
  «verdadero» — y caía en una excepción no controlada (500) en vez de un
  rechazo limpio. Arreglado con `Object.create(null)`: sin prototipo, esas
  claves ya no existen. Cuatro casos nuevos en el banco (`__proto__`,
  `constructor`, `toString`, `hasOwnProperty`).
- **`pedir()`, en el panel, tiraba el mensaje de error del servidor.** Un 400
  con «la fecha de inicio es posterior a la de fin» llegaba a quien usa el
  panel como «El servidor respondió 400», así que no sabía qué corregir. No
  es un fallo de seguridad, pero sí de los que hacen que alguien reintente
  con datos peores.
- Comprobado que el rol se hace cumplir en el servidor, no solo en la
  pantalla: una cuenta de secretaría recibe 403 al intentar tocar el contacto
  o el calendario por la API directamente, aunque el botón esté oculto.
- Comprobado que `/api/configuracion` (lo que ve el navegador de una familia)
  no lleva quién añadió cada fecha.

14 comprobaciones nuevas, banco en 58 → 72.

## Corregido el 27 de agosto: recortar de más también rompe

Al dejar de servir `configuracion_centro.json` entero se quitó del bloque
público `retencion_solicitudes_dias`, y resulta que el widget **sí** lo
necesita: se lo enseña a la familia en el mismo formulario donde le pide el
correo («tus datos se conservarán N meses»), que es cuando el art. 13 del
RGPD obliga a informar. Sin ese dato, el widget caía a su valor por defecto
de doce meses y se lo decía a la familia aunque el centro tuviera configurado
otro plazo.

No se notaba porque el centro de ejemplo tiene justo 365 días. Con 180
habría estado diciendo el doble.

La lección para el banco de pruebas: la comprobación decía «no lleva los
plazos de conservación» y prohibía la palabra «retencion» a secas, así que
tapaba el error en vez de encontrarlo. Ahora distingue el plazo de los
**logs** (interno, no sale) del de las **solicitudes** (obligatorio
enseñarlo), y hay un caso que exige que este último llegue.

## Lo que sigue sin resolver

- **La CSP del panel necesita `'unsafe-inline'`** porque los estilos y la
  lógica van dentro del propio archivo. Para quitarlo habría que sacarlos a
  archivos aparte o firmarlos con hash.
- **CORS en `*`** hasta que cada instalación ponga sus dominios.
- **El escudo de inyección es una lista de patrones**, y una lista nunca está
  completa. La defensa de verdad son las reglas del prompt del sistema, que
  aguantaron los cuatro intentos que se les hicieron. Esto solo ahorra tokens
  y deja constancia.
- **La llave de arranque del `.env`** admite `ADMIN_PASSWORD_HASH` en SHA-256
  sin sal. Se ha dejado por compatibilidad y solo sirve mientras el centro no
  tiene ningún acceso personal.
- **No hay HTTPS aquí**: eso lo pone quien despliegue, delante del servidor.
  Sin él, la contraseña del panel viaja en claro.
