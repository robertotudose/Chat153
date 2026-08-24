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

- `01 - Chatbot Sin IA/` — versión determinista del producto (botones y
  búsqueda local, sin llamadas a ningún modelo). Define el sistema visual
  de referencia (tipografías Plus Jakarta Sans + Inter + JetBrains Mono,
  paleta slate + azul `#0284c7` de acento, botones principales en
  `slate-900`, nunca azules).
- `02 - Chatbot Con IA/` — el producto real: backend Express
  (`servidor_ia.js`), SQLite (`datos.db`, nunca se versiona), capa de IA
  con Gemini, panel admin (`dashboard.html`, en `/admin`) y demo comercial
  (`demo.html`, en `/demo`).
- `03 - Web SCHOLAIA/` — landing comercial y panel interno de negocio
  (`panel-negocio.html`), con sus cifras en `datos-negocio.json`.
- `04 - Documentacion/` — mapa legal, protocolo de incidentes, guía técnica.

## Reglas que no hay que romper

- Un único archivo por centro educativo, `configuracion_centro.json`,
  adapta todo el producto a un colegio nuevo. No hardcodear nada
  específico de un centro fuera de ahí.
- `.env` y `*.db` nunca se versionan (contienen claves y datos de
  familias/menores). Cada persona tiene los suyos en local.
- Los paneles nuevos (`demo.html`, `panel-negocio.html`) siguen el sistema
  visual de `01 - Chatbot Sin IA/style.css`, no uno inventado.
