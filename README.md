# 🧠 Proyecto Chatbot · Índice general

Asistentes virtuales de secretaría y orientación para centros educativos. Dos productos con **el mismo diseño** y **motores distintos**, más la web comercial de la marca.

---

## 📂 Qué hay en cada carpeta

| Carpeta | Qué es | Cuándo se usa |
| :--- | :--- | :--- |
| **`01 - Chatbot Sin IA`** | Asistente 100% determinista. Sin servidor, sin IA, sin coste | Centros que quieren coste cero absoluto y respuestas totalmente predecibles |
| **`02 - Chatbot Con IA`** | Producto principal. Motor híbrido de tres niveles con IA generativa y degradación automática | Producto de referencia. Incluye todo lo del anterior y además IA, calendario, test de orientación y panel |
| **`03 - Web SCHOLAIA`** | Web comercial de la marca. `landing-estatica` (HTML) y `landing-react` (Vite + React) | Presentación comercial ante centros |
| **`04 - Documentacion`** | Guía técnica, mapa legal, infraestructura y costes, protocolo de incidentes y puntos pendientes de ingeniería | Documentación de proyecto y material para licitaciones |
| **`05 - Archivo`** | Histórico de versiones retiradas y contexto acumulado | Consulta puntual. No se trabaja aquí |

---

## 🔍 Diferencia entre los dos productos

|  | Sin IA | Con IA |
| :--- | :--- | :--- |
| Navegación por botones | ✅ | ✅ |
| Buscador local por palabras clave | ✅ | ✅ con erratas y sinónimos |
| Respuestas de IA generativa | ❌ | ✅ |
| Sigue funcionando si la IA cae | — | ✅ pasa a modo determinista |
| Calendario escolar | ✅ dos tipos de día | ✅ tres tipos, incluidas jornadas con asistencia obligatoria |
| Test de orientación de 4º de ESO | ❌ | ✅ con informe descargable |
| Panel de administración | ❌ | ✅ |
| Instalación con una línea en webs ajenas | ❌ | ✅ con Shadow DOM |
| Servidor | No necesita | Node.js 22.5+ |
| Coste mensual | 0 € | Servidor + céntimos de IA |

Ambos comparten el sistema de diseño: misma tipografía, misma paleta y mismos componentes. **Si se cambia el diseño en uno, hay que llevarlo al otro.**

---

## 🚀 Por dónde empezar

```bash
cd "02 - Chatbot Con IA"
npm install
npm start
```

Después, `http://localhost:3000`. Arranca aunque no haya clave de IA: en ese caso funciona en modo determinista.

Para adaptar el asistente a un centro nuevo se toca **un único archivo**: `02 - Chatbot Con IA/configuracion_centro.json`. No hace falta programar.

---

## 📌 Antes de pasar a producción

Leer **[`04 - Documentacion/revision_ingenieria.md`](04%20-%20Documentacion/revision_ingenieria.md)**: recoge lo que queda pendiente de revisar, ordenado por gravedad, y lo ya corregido para no revisarlo dos veces.
