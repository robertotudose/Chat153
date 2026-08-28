# Plan Centro

> «El que recomendamos. Las familias escriben con sus palabras y el
> asistente responde. Con panel y registro.»
> — `3-web/index-libros.html`, ficha del plan Centro (marcada
> como `ficha--destacada` en el HTML: es el plan que la web resalta)

## Cuánto cuesta

Cuota mensual **con el IVA incluido**, según el número de alumnos del centro:

| Alumnos | Al mes |
| --- | ---: |
| 0-300 | 179 € |
| 301-500 | 219 € |
| 501-700 | 259 € |
| 701-1000 | 299 € |
| 1001-1200 | 339 € |
| 1201 o más | 379 € |

Más una instalación única de **320 €**.

Los precios van publicados en la web y **no se negocian**. Si un centro no
llega, se le quita producto —se le baja de plan—, no se le baja el precio.

## Verlo funcionando

Doble clic en **`Probar Centro.command`**, en esta misma carpeta.

Arranca el producto entero con este plan puesto y abre el navegador
solo. No es una simulación: el servidor está de verdad detrás, así que
lo que este plan no incluye lo rechaza de verdad. Para cerrarlo, cierra
la ventana de Terminal que abre.

Desde una terminal es lo mismo que:

```bash
PLAN=centro npm start
```

## Qué incluye

Según la ficha comercial:

- Todo lo del Essential.
- IA sobre la información del centro.
- Panel de métricas.
- Registro de consultas exportable.

Es el producto completo de `1-producto/`: motor híbrido de tres
niveles (botones → buscador local → IA generativa) con degradación
automática, más el panel de `1-producto/panel/` para la secretaría.

## Cómo se activa

En `1-producto/configuracion_centro.json`, bloque
`funcionalidades`, con los valores que trae la plantilla por defecto:

```json
"funcionalidades": {
  "ia_generativa": true,
  "busqueda_libre": true,
  "test_orientacion_4eso": false,
  "calendario_escolar": true,
  "formularios": true
}
```

La diferencia con Essential es un único valor: `ia_generativa: true`. Eso
activa el nivel 3 del motor (`hayIADisponible()` en `servidor_ia.js`, línea
794) siempre que exista `GEMINI_API_KEY` en el `.env` del servidor.
`test_orientacion_4eso` queda en `false`: ese interruptor pertenece al plan
Infinito y se documenta en su propia ficha.

El panel de secretaría (`1-producto/panel/panel.html`, servido en `/panel`)
no tiene interruptor propio en `configuracion_centro.json` — está siempre
disponible en el servidor de `02`, protegido por sesión y contraseña
(`servidor_ia.js`, rutas `/api/admin/*`, con `requiereSesion` y, para lo que
solo puede tocar dirección, `requiereDireccion`). Lo que sí depende de la
configuración es qué puede editar cada rol: dirección puede cambiar el
contacto del centro y el calendario desde el panel
(`POST /api/admin/centro`, `POST /api/admin/calendario/:tipo`), y ambos
siguen escribiendo en `configuracion_centro.json` — sigue siendo el único
archivo que adapta el producto a un centro.

## Qué archivos lo implementan

- `1-producto/servidor_ia.js`:
  - `hayIADisponible()` (línea 794) — enciende o apaga el nivel 3 según
    `funcionalidades.ia_generativa`.
  - Constantes `MODELO` (línea 743) y `MODELOS_RESPALDO` (línea 748) — qué
    modelo de Gemini responde y a cuáles recurre si el principal está
    saturado.
  - `LIMITE_LLAMADAS_DIA` (línea 766) y `quedaPresupuesto()` /
    `anotarLlamadaIA()` (líneas 774-788) — el tope de gasto diario que
    protege la factura.
  - Ruta `POST /api/chat` (línea 1018) — el endpoint de streaming (Server-
    Sent Events) que sirve las respuestas de la IA.
- `1-producto/chat.js`, sección `4. NIVEL 3 · CAPA DE IA Y SALUD
  DEL SERVIDOR` (línea 344 en adelante) y sección `3. NIVEL 2 · BUSCADOR
  LOCAL DIFUSO` (línea 242 en adelante) — el cliente que decide cuándo
  subir de nivel.
- `1-producto/panel/panel.html` — panel de métricas y registro de
  consultas. Se apoya en las rutas de `servidor_ia.js`:
  - `GET /api/admin/metricas` (línea 1631) — cifras del panel.
  - `GET /api/admin/consultas` (línea 1699) — registro con filtros y
    paginación; con `?todo=1` devuelve el conjunto completo del filtro para
    exportarlo.
  - `GET /api/admin/solicitudes/exportar` (línea 1790) — exportación de
    solicitudes.

## Qué NO incluye

- **Test de orientación de 4.º de ESO.** Su interruptor
  (`funcionalidades.test_orientacion_4eso`) está pensado para quedar en
  `false` en este plan; el bloque de código existe en `chat.js` pero no se
  ofrece al alumno si el interruptor está apagado (`chat.js`, línea 778:
  `if (estado.config.funcionalidades.test_orientacion_4eso) { ... }`, y de
  nuevo dentro de `iniciarOrientacion()`, línea 1334).
- **Centros sin límite ni personalización por sede.** Cada despliegue de
  `1-producto/` lee un único `configuracion_centro.json` (ruta fija
  en `servidor_ia.js`, línea 191: `RUTA_CONFIG`). Un centro con varias
  sedes que quiera un calendario y una marca distintos por sede necesita un
  despliegue — y un `configuracion_centro.json` — por sede. Eso es
  exactamente lo que vende Infinito.
- **Soporte prioritario** — término de contrato, no de código.
