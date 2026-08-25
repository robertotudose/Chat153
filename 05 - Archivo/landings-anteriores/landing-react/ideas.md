# Dirección de diseño — SCHOLAIA

## Lectura de referencia

La referencia verificada presenta una composición **editorial, oscura y contemplativa**. Su lenguaje combina una textura pétrea azul-negra con un halo cenital frío, márgenes muy generosos, el logotipo tipográfico de dos líneas `SCHO / LAIA`, y copias breves con serif de alto contraste. El contenido se descubre como una secuencia de escenas, no como una cuadrícula de producto convencional. Los dos primeros segmentos muestran, por orden, el manifiesto “La atención escolar, reimaginada.” y la promesa de automatizar la secretaría del centro, atender dudas, tramitar visitas/citas y centralizar solicitudes.

Los segmentos tercero y cuarto confirman un CTA mínimo, centrado y gris translúcido —“Probar y personalizar”— que anticipa una sección `SCHOLAIA STUDIO`. La demostración se anuncia con título sans de alto peso, cuerpo serif breve y dos superficies rectangulares de vidrio azul-gris; la primera corresponde a la identidad del centro y la segunda a la vista del asistente. Tras este módulo, el monograma se amplía a escala de cartel. La implementación conservará este ritmo, pero lo adaptará a una lectura B2B más completa, responsive y accesible.

Los dos últimos segmentos validan que la marca funciona en tres estados: el logotipo apilado de lectura clara, su ampliación tipográfica a gran formato y una versión compacta con superposición de trazos. El cierre no introduce recursos adicionales: vuelve al halo mineral y deja que el monograma actúe como firma. Por ello, la landing conservará un cierre de marca de baja densidad, sin inventar testimonios ni métricas no corroboradas.

## Tres direcciones posibles

### 1. Archivo nocturno

**Muy breve intro:** Una presencia editorial y sobria, con luz rasante sobre materia oscura y contenido presentado como páginas de un manifiesto. Convierte la tecnología en una herramienta institucional, calmada y de gran criterio.

**Probabilidad:** 0.07

### 2. Sala de orientación

**Muy breve intro:** Un mundo luminoso y humano de papeles translúcidos, tinta verde y módulos con guiños a la arquitectura escolar. Acerca el valor tecnológico desde una calidez de comunidad.

**Probabilidad:** 0.04

### 3. Señal líquida

**Muy breve intro:** Un sistema de interfaces fluidas con reflejos opalinos, campos de color profundo y movimientos inspirados en ondas de señal. Presenta SCHOLAIA como una capa invisible que ordena la atención escolar.

**Probabilidad:** 0.09

---

## Dirección elegida: Archivo nocturno

### Design Movement

**Editorial Techno-Brutalism suavizado por Liquid Glass.** La presencia visual toma la austeridad de la edición de arte y la combina con materiales translúcidos de precisión. La inspiración visual aportada es la fuente de verdad para el ritmo oscuro, la luz cenital, la tipografía y el emblema.

### Core Principles

1. **Quiet confidence:** grandes silencios visuales y frases precisas, nunca ruido comercial.
2. **Material before decoration:** textura de grafito, reflejos de vidrio y bordes de luz construyen la profundidad; no se usarán degradados morados genéricos.
3. **Editorial asymmetry:** las secciones cambian deliberadamente de peso, alineación y escala para guiar la lectura.
4. **Clarity within atmosphere:** los paneles líquidos ofrecen contraste suficiente, legibilidad y jerarquía operativa.

### Color Philosophy

El negro tinta y el azul pizarra representan la calma, discreción y confianza que exige la atención escolar. Un blanco mineral proporciona claridad y una luz azul-hielo, usada de forma restringida, funciona como señal de actividad y como **color de marca propio: Lumen Schola (#B8D7F4)**. La iluminación no decorará: revelará prioridad.

### Layout Paradigm

Una **secuencia de placas editoriales**: escenas de pantalla completa y bandas de contenido que se solapan suavemente. En vez de una landing centrada y repetitiva, cada pieza se posiciona mediante un eje editorial desplazado. Los módulos funcionales (demostración, comparativas, formulario) emergen como inserciones de cristal en una publicación nocturna.

### Signature Elements

1. Un **halo cenital mineral** que recorre la página sobre una textura oscura.
2. El **monograma tipográfico apilado SCHO / LAIA**, tratado como una marca arquitectónica.
3. Paneles de **liquid glass con borde refractivo**, tintados en azul carbón y con brillo desplazado en hover.

### Interaction Philosophy

El movimiento confirma control: los botones se comprimen ligeramente al pulsar, las superficies de vidrio responden a la proximidad y la demostración permite comprobar capacidades sin salir de la página. Ninguna animación compite con la lectura o con la información de un centro.

### Animation

Las entradas utilizan desvanecimiento y traslado vertical de 12–20 px, con una curva `cubic-bezier(0.23, 1, 0.32, 1)` y escalonados de 45–65 ms. La luz ambiental se desplaza de forma casi imperceptible durante 16 s. Los reflejos de vidrio cambian por `transform` y `opacity` en menos de 220 ms. Se desactivará todo movimiento no esencial con `prefers-reduced-motion`.

### Typography System

**DM Serif Display** se reserva para manifiestos, frases de valor y cifras críticas; aporta el registro editorial de la referencia. **Manrope** ordena navegación, cuerpo y controles con una geometría limpia. El monograma se dibuja con letras sans ultraligeras y espaciado negativo controlado; no es una palabra en fuente por defecto. Los títulos de manifiesto emplean serif con tamaño fluido, mientras que las etiquetas usan Manrope en mayúsculas con tracking amplio.

### Brand Essence

**SCHOLAIA es la capa de atención escolar que permite a cada centro responder con calma, coherencia y disponibilidad continua.** Personalidad: **serena, rigurosa, anticipatoria**.

### Brand Voice

Los titulares son declarativos, cortos y con cadencia editorial. Las llamadas a la acción invitan a verificar valor, no presionan a comprar. Microcopy clara, adulta y libre de promesas vagas.

> “Las preguntas llegan. La respuesta ya está preparada.”

> “Configuremos una atención que se parezca a su centro.”

### Wordmark & Logo

Un monograma modular apilado: `SCHO` se superpone y tensa con `LAIA`, formando un bloque vertical de trazos finos, como en la referencia. El símbolo se muestra en grande en el inicio, y en tamaño legible pero no minúsculo en la cabecera y favicon.

### Signature Brand Color

**Lumen Schola — #B8D7F4.** Un azul hielo mineral reservado para estados activos, indicadores de disponibilidad, y bordes de refracción.

## Style Decisions

- La paleta permanece estrictamente en negro tinta, azul pizarra, blanco mineral y Lumen Schola; se excluyen tonos cálidos, rosas, corales y púrpuras de las superficies de marca.
- Los módulos de producto se resolverán como inserciones de liquid glass azul-carbón con borde refractivo Lumen, o como tipografía y reglas editoriales; no se emplearán cuadrículas de tarjetas SaaS genéricas como lenguaje primario.
- En escalas compactas, la identidad conservará la construcción arquitectónica apilada `SCHO / LAIA`, acompañada del símbolo de marca y nunca reducida a una tipografía convencional.
