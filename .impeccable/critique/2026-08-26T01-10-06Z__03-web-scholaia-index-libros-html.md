---
timestamp: 2026-08-26T01-10-06Z
slug: 03-web-scholaia-index-libros-html
---
⚠️ DEGRADED: single-context (el harness prohíbe subagentes salvo petición explícita del usuario)

# Crítica · 03 - Web SCHOLAIA/index-libros.html
Modo: Persuade. Detector: 1 hallazgo (escaneo degradado, sin parser HTML).

## Salud de diseño: 19/32 (59%) — Aceptable
| # | Heurística | Nota | Problema |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | El mailto no confirma nada; el botón del registro no anuncia nada a un lector de pantalla |
| 2 | Sistema / mundo real | 4 | Habla el idioma del centro: «jornada especial», «justificar una falta» |
| 3 | Control y libertad | 2 | El material que sube no se puede parar (WCAG 2.2.2) |
| 4 | Consistencia | 3 | El enlace de cabecera desaparece en móvil; las notas a boli mezclan chiste y dato |
| 5 | Prevención de errores | 1 | Todo el embudo termina en mailto: falla en silencio con webmail |
| 6 | Reconocer, no recordar | 3 | 8,7 pantallas sin navegación ni anclas |
| 7 | Flexibilidad | n/a | Landing |
| 8 | Estético y minimalista | 3 | Héroe pesado de marca; página larga |
| 9 | Recuperación de errores | 1 | No hay estado de error en ninguna parte |
| 10 | Ayuda | n/a | Landing |

## Problemas prioritarios
- [P0] Todo el embudo es un mailto. No hay formulario, ni teléfono, ni calendario.
- [P0] La página vende cumplimiento y falla accesibilidad: fichas que mienten con aria-expanded, registro sin aria-live, movimiento automático sin pausa.
- [P1] Sin prueba social, sin identidad y sin aviso legal (LSSI-CE art. 10).
- [P1] 8,7 pantallas, un solo mensaje repetido, sin forma de escanear.
- [P2] transition:width en .ficha .pista::after (detector). El logotipo tiene la I dentro de la A.
