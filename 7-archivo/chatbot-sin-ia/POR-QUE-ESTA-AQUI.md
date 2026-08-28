# Por qué este código está archivado

Archivado el 28 de agosto de 2026. Antes vivía en `01 - Chatbot Sin IA/`.

## Qué era

La primera versión del producto: el asistente sin IA, con botones y buscador
local, servido como archivos estáticos. Durante un tiempo fue lo que se
enseñaba como «el chatbot sin IA» frente al de `02 - Chatbot Con IA/`.

## Por qué ya no hace falta

Nació del mismo código que `02` y llevaba tiempo divergiendo por su cuenta.
Medido con `wc -l` y `diff` el 28-08-2026, antes de archivarlo:

| Archivo | Aquí | `02 - Chatbot Con IA` | Líneas que difieren |
| --- | ---: | ---: | ---: |
| `chat.js` | 1.019 | 2.085 | 2.792 |
| `style.css` | 1.797 | 2.346 | 553 |
| `preguntas_frecuentes.json` | 222 | 710 | 569 |

No era `02` menos funciones: eran dos reescrituras en paralelo del mismo
motor de búsqueda, del mismo calendario y del mismo orquestador de menús.
Cada arreglo había que hacerlo dos veces, y no se estaba haciendo.

Lo que lo justificaba era el plan Essential: «funciona sin servidor». Pero
eso **se cumple desde el código bueno**, y está probado: se sirvieron siete
archivos estáticos con `python3 -m http.server`, sin Node por ningún lado, y
el asistente funcionó. Desde el 28-08-2026 el plan es un campo de
`configuracion_centro.json` (`"plan": "essential"`) y el servidor lo hace
cumplir; la ficha está en `08 - Planes/Essential/`.

Servir Essential desde aquí le daba al cliente **menos producto**: 222 líneas
de base de conocimiento contra 710, y ninguna de las mejoras de seguridad,
privacidad ni calendario del último año.

## Si alguna vez hace falta mirarlo

Está entero y en el historial de git. Pero antes de copiar nada de aquí,
comprueba si el mismo problema ya está resuelto —probablemente mejor— en
`02 - Chatbot Con IA/`.
