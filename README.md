# 🧠 Proyecto Chatbot · Índice general

Asistentes virtuales de secretaría y orientación para centros educativos. Dos productos con **el mismo diseño** y **motores distintos**, más la web comercial de la marca.

---

## 📂 Qué hay en cada carpeta

| Carpeta | Qué es | Cuándo se usa |
| :--- | :--- | :--- |
| **`1-producto`** | Producto principal. Motor híbrido de tres niveles con IA generativa y degradación automática | Producto de referencia. Incluye todo lo del anterior y además IA, calendario, test de orientación y panel |
| **`3-web`** | Web comercial de la marca: `index.html` autocontenido más `assets` y `marca` | Presentación comercial ante centros |
| **`5-documentacion`** | Guía técnica, mapa legal, infraestructura y costes, protocolo de incidentes y puntos pendientes de ingeniería | Documentación de proyecto y material para licitaciones |
| **`6-para-ensenar`** | Guiones de reunión y material de demostración, listo para enseñar | Antes de una reunión o una demostración |
| **`7-archivo`** | Histórico: el chatbot sin IA, paneles y landings anteriores | Consulta puntual. No se trabaja aquí |
| **`4-negocio`** | Herramientas internas: panel de negocio y cifras (`datos-negocio.json`) | Uso interno. No se enseña a los centros |
| **`1-producto/panel`** | El panel diario de la secretaría (`panel.html`), servido en `/panel` | Lo usa el colegio todos los días |
| **`2-planes`** | Los tres planes que se venden: su `perfil.json` y su ficha | Al preparar la instalación de un centro |

---

## 🔍 Los tres planes

Son **un solo producto**. Lo que cambia es el campo `plan` de
`configuracion_centro.json`, y lo hace cumplir el servidor: apagar algo solo
en el navegador no separa nada.

|  | Essential | Centro | Infinito |
| :--- | :---: | :---: | :---: |
| Sus preguntas frecuentes, por botones | ✅ | ✅ | ✅ |
| Calendario escolar del centro | ✅ | ✅ | ✅ |
| Escribir con sus propias palabras | ❌ | ✅ | ✅ |
| Respuestas de IA sobre lo del centro | ❌ | ✅ | ✅ |
| Panel: lo cambian ellos y ven qué se pregunta | ❌ | ✅ | ✅ |
| Test de orientación de 4.º de ESO | ❌ | ❌ | ✅ |
| Servidor | No necesita | Node.js 22.5+ | Node.js 22.5+ |

Las preguntas las pone el propio colegio en los tres planes: cada centro
recibe llamadas distintas. Lo que se compra al subir de plan no es más
contenido, son capacidades — escribir, cambiarlo uno mismo y saber qué se
pregunta.

Cada plan tiene su ficha y su `perfil.json` en
[`2-planes/`](2-planes/README.md).

---

## 🚀 Por dónde empezar

```bash
cd "producto"
npm install
npm start
```

Después, `http://localhost:3000`. Arranca aunque no haya clave de IA: en ese caso funciona en modo determinista.

Para adaptar el asistente a un centro nuevo se toca **un único archivo**: `1-producto/configuracion_centro.json`. No hace falta programar.

---

## 📌 Antes de pasar a producción

Leer **[`5-documentacion/revision_ingenieria.md`](5-documentacion/revision_ingenieria.md)**: recoge lo que queda pendiente de revisar, ordenado por gravedad, y lo ya corregido para no revisarlo dos veces.
