# SCHOLAIA · instrucciones para Claude

Proyecto de dos personas que trabajan desde máquinas distintas (y a veces
desde un entorno en la nube compartido). Para que quede todo sincronizado
sin que nadie tenga que acordarse de los comandos de git:

- **Antes de empezar a trabajar en algo**, ejecuta `git pull` para traer lo
  último que haya subido la otra persona.
- **Al terminar una tarea** que el usuario haya pedido, haz `git add`,
  `git commit` (mensaje breve, en español, describiendo qué se hizo) y
  `git push`, sin necesidad de preguntar antes. Esta autorización aplica
  solo a este repositorio.
- Si `git pull` trae cambios que chocan con algo que estabas editando,
  para y avisa al usuario en vez de resolverlo sobrescribiendo sin más.

## Estructura del proyecto

Siete carpetas, numeradas en el orden en que se usan: qué construimos, cómo
se vende, cómo se enseña, las cuentas, los papeles, lo que se presenta y lo
muerto. El número va sin espacios (`1-producto`, no `01 - Producto`) para no tener que
entrecomillar rutas en cada comando. Los archivos sueltos quedan al final de
la lista solos, porque los dígitos van antes que las letras.

- `1-producto/` — **todo lo que se instala en un centro**, y lo único que
  ejecuta código: backend Express (`servidor_ia.js`), SQLite (`datos.db`,
  nunca se versiona), capa de IA con Gemini, clasificación de consultas
  (`analisis_consultas.js`), el widget y sus pruebas (`npm test`). Dentro,
  `panel/` es el panel diario de la secretaría, servido en `/panel`.
- `2-planes/` — los tres planes que se venden. Cada carpeta tiene su
  `perfil.json` (lo que se copia al instalar) y su ficha. **No hay código:**
  los tres planes son el mismo `1-producto/` con distinta configuración.
- `3-web/` — landing comercial (`index-libros.html`). Define el sistema visual
  vigente: papel `#F3F1EA`, tinta `#15171B`, azul de bolígrafo `#1B4B8F` como
  único acento, Schibsted Grotesk + Literata, radio 4 px, cero mayúsculas,
  cero antetítulos y cero monoespaciada.
- `4-negocio/` — panel interno de negocio (`panel-negocio.html`) con sus
  cifras en `datos-negocio.json`. No se enseña a los centros.
- `5-documentacion/` — mapa legal, protocolo de incidentes, guía técnica.
- `6-para-ensenar/` — **lo que se prepara para enseñárselo a alguien**: guiones
  de reunión, material de demostración, resúmenes. No va a una carpeta
  temporal del ordenador: ahí se pierde al cerrar la sesión, no lo tiene la
  otra persona y no queda en git.
- `7-archivo/` — lo que ya no se usa, con una nota de por qué. Ahí están el
  chatbot sin IA (`chatbot-sin-ia/`, un fork divergido que el plan Essential
  no necesita) y los paneles anteriores.

## Reglas que no hay que romper

- Un único archivo por centro educativo, `configuracion_centro.json`,
  adapta todo el producto a un colegio nuevo. No hardcodear nada
  específico de un centro fuera de ahí.
- Los tres planes (Essential, Centro, Infinito) son **un solo producto**: el
  campo `plan` de ese mismo archivo. No se duplica código por plan — ya pasó
  una vez y costó 2.792 líneas divergidas. El plan manda sobre los
  interruptores de `funcionalidades`, nunca al revés, y **lo hace cumplir el
  servidor**: apagar algo solo en el navegador no separa nada, porque un POST
  a mano no pasa por ningún menú.
- Cuando la web y el plan de negocio se contradigan, manda `3-web/`: es lo
  último acordado por el equipo.
- Lo que el centro escribe desde el panel (respuestas a preguntas que el
  asistente no supo contestar) va a la base de datos, nunca a
  `preguntas_frecuentes.json`: así una respuesta equivocada se borra sin
  tocar ningún archivo del producto.
- El panel del centro no puede enseñar cifras que no sean ciertas. Si algo
  no se sabe —el tema de una consulta, por ejemplo— se dice «sin
  clasificar» en vez de rellenarlo a ojo.
- El correo y el teléfono de una familia no viajan con la lista de
  solicitudes: se piden uno a uno y el servidor anota quién los abrió. No
  deshacer esto por comodidad.
- El calendario y el contacto del centro se editan desde el panel
  (`/api/admin/centro`, `/api/admin/calendario/:tipo`), pero siguen
  guardándose en `configuracion_centro.json`: sigue siendo el único archivo
  que adapta el producto a un colegio. Solo dirección los edita; el
  servidor lo exige, no solo la pantalla.
- Las contraseñas van con scrypt y sal, mínimo diez caracteres, y la
  autoría de cualquier acción la pone el servidor desde la sesión, nunca
  el navegador.
- El servidor sirve una **lista cerrada** de archivos públicos. No volver a
  poner `express.static` sobre la carpeta entera: ahí está `datos.db`.
  Cualquier archivo nuevo que deba ser público se añade a mano a esa lista.
- Después de tocar el servidor, el widget o el panel: `npm run seguridad`
  con el servidor en marcha. Son 79 comprobaciones y detectan las
  regresiones de esto.
- `.env` y `*.db` nunca se versionan (contienen claves y datos de
  familias/menores). Cada persona tiene los suyos en local.
- Todo lo nuevo sigue el sistema visual de `3-web/`, no uno inventado ni el
  antiguo del chatbot sin IA. En una pantalla de trabajo se hereda la paleta
  y las tipografías, pero no los gestos de la landing: ni cursor de lápiz,
  ni aperturas animadas.
