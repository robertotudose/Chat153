# 🗄️ Archivo histórico — carpeta `Desarrollo/` (v2.0)

> **Estado:** eliminada del árbol de trabajo el 19 de agosto de 2026.
> **Motivo:** era una copia anterior y estrictamente más pobre del actual *Chatbot Con IA*. Mantener dos copias divergentes del mismo producto generaba confusión sobre cuál era la buena.
> **Recuperable:** sí. Todo su contenido sigue vivo en el historial de git, en el commit `f486b59`.

---

## 📌 Cómo recuperarla si algún día hace falta

```bash
# Ver un fichero concreto sin restaurar nada
git show f486b59:"10 - Proyectos/Chatbot/Desarrollo/chat.js"

# Restaurar la carpeta completa
git checkout f486b59 -- "10 - Proyectos/Chatbot/Desarrollo"
```

---

## 📂 Qué contenía exactamente

Siete ficheros, 2.015 líneas en total:

| Fichero | Tamaño | Equivalente actual | Comparativa |
| :--- | :--- | :--- | :--- |
| `chat.js` | 21 KB | `chat.js` del Chatbot Con IA (40 KB) | Subconjunto: sin test de 4º ESO, sin validación de formularios, sin modo expandido |
| `servidor_ia.js` | 9,7 KB | `servidor_ia.js` (15 KB) | Mismos 4 endpoints, misma arquitectura, menos endurecido |
| `dashboard.html` | 10,7 KB | `dashboard.html` (53 KB) | Panel mínimo frente al actual con métricas completas |
| `index.html` | 9,3 KB | `index.html` (14,5 KB) | Maqueta web más simple |
| `style.css` | 10,9 KB | `style.css` (32 KB) | Sin responsive completo ni modo pantalla grande |
| `preguntas_frecuentes.json` | 6,2 KB | base unificada actual | 16 entradas en 4 categorías (comedor, pagos, secretaría, FP) |
| `README.md` | 7,9 KB | — | Documentaba la v2.0 y el "handoff a Gemini" |

## 🧩 Qué aportaba su base de conocimiento

Las 16 entradas que contenía (`comedor_alta_baja`, `comedor_menu`, `comedor_horario_actividades`, `pagos_excursiones`, `pagos_extraescolares`, `pagos_recibos_devueltos`, `secretaria_horario`, `secretaria_certificados`, `secretaria_portal`, `fp_oferta`, `fp_practicas`, `fp_tramites` y sus 4 categorías padre) se revisaron y volcaron en la base de conocimiento unificada del producto actual. No se perdió contenido.

---

## ⚠️ Discrepancia detectada al archivar (lección aprendida)

El `README.md` de esta carpeta afirmaba:

> *"Si el servidor de IA está apagado, el frontend ejecuta de forma automática un buscador local semántico difuso con **distancia de Levenshtein** y sinónimos para responder de manera óptima offline."*

**Esa funcionalidad nunca existió en el código.** Una búsqueda sobre `Desarrollo/chat.js` no devuelve ninguna implementación de Levenshtein, de diccionario de sinónimos ni de fallback offline. Era documentación aspiracional: describía lo que se pretendía construir, no lo construido.

**Lección:** la documentación de este proyecto ha ido por delante del código en más de un punto (también con el modelo de IA, ver abajo). Antes de dar por hecha una capacidad descrita en un `.md`, hay que verificarla en el código.

*Nota: el buscador difuso con Levenshtein sí se ha implementado de verdad en el producto actual, escrito desde cero.*

---

## 🕰️ Otros datos de contexto de la época

* **Modelo de IA:** `gemini-1.5-flash`, hoy retirado por Google. El producto actual usa Gemini 2.5 Flash.
* **Destino de las solicitudes:** Google Sheets. El producto actual usa SQLite con destino configurable por centro.
* **Marca:** el proyecto nació específico para el Colegio María Auxiliadora (Salesianas Zaragoza). El producto actual es genérico y personalizable por centro mediante `configuracion_centro.json`.
