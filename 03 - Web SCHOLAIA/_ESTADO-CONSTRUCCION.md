# Estado de construcción de la web comercial

Última actualización: 2026-08-25 10:15 CEST — **ONDAS 1 A 4 COMPLETADAS**

El entregable es `03 - Web SCHOLAIA/index.html` (52 KB) + `assets/` (172 KB).
Se sirve con `python3 -m http.server` desde esa carpeta (la ruta tiene un emoji
y `file://` falla).

## Qué está hecho

Las cuatro ondas del plan (`/Users/robertotudose/.claude/plans/replicated-plotting-snowglobe.md`).
Markup y textos, apertura de los libros, lluvia de material, cursor de lápiz,
textura y relieve, estilos de sección, responsive, accesibilidad e impresión.
Todas las piezas integradas en sus regiones; `_partes/` eliminada.

## Verificado

- Apertura: libros quietos a **1.665 ms** (objetivo 1.660), logo a 915 ms,
  titular en carga limpia a 1.050-1.100 ms (medido por A2, por debajo del
  límite de 1.400 ms).
- Fórmula de desplazamientos calculando en vivo: x0=269,1 px y x1=117,0 px a 1440 px.
- Sin desbordamiento horizontal a 1440, 900, 390 ni 320 px.
- Consola sin errores.
- 14 combinaciones de contraste medidas, **todas pasan**.
- Prohibiciones del cliente: cero `eyebrow`, cero `uppercase`, cero `monospace`,
  cero `border-radius` distinto de 0. El único `box-shadow` es un `none` de la
  hoja de impresión.
- Regla de fallo abierto: sin la clase `.apertura` todo se ve en su estado final.

## Tres fallos corregidos durante la integración

1. **Nombres de clase incompatibles.** A3 usó `.lluvia-overlay`/`.lluvia-objeto`
   y A4 escribió la regla de impresión contra `[class*="ll-"]`, que no casaba.
   Renombradas a `.ll-overlay`/`.ll-objeto`.
2. **La fórmula del plan estaba mal.** Le faltaba sumar `fila.offsetLeft`, así
   que los libros quedaban separados en vez de solapados. Lo detectó y corrigió
   A2 probando en el navegador.
3. **La fila del hero se partía en móvil.** Desbordaba por 3 px (341 frente a
   338 disponibles) y, con `flex-wrap:wrap`, los libros de pie caían a una
   segunda línea rompiendo el gesto de telón. Arreglado en R7 con `nowrap` y
   permitiéndoles encoger.

## Pendiente de decisión del usuario

- **El dominio `scholaia.es`** está puesto en los metadatos Open Graph, deducido
  del correo. **Nadie lo ha confirmado.**
- **El enlace `hola@scholaia.es`** (terracota sobre papel) da 4,53:1 frente al
  mínimo de 4,50. Pasa por tres centésimas: si se retoca ese tono, deja de cumplir.
- **Las tres afirmaciones ocupan casi pantalla y media cada una.** Son las cifras
  exactas del handoff aprobado; si al verlas parece excesivo, se recorta en R4.
- `review-animations` no se puede invocar desde un agente (es de uso exclusivo
  del usuario). Si se quiere esa segunda pasada, hay que lanzarla con
  `/review-animations` a mano.

## No tocar

`landing-estatica/`, `landing-react/`, `landing-nueva/` y `design_handoff_scholaia_web/`
quedan como archivo histórico.
