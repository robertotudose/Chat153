#!/bin/bash
# ==========================================================================
# ABRE EL ASISTENTE CON UN PLAN PUESTO
# ==========================================================================
# No se ejecuta directamente: lo llaman los "Probar <plan>.command" de cada
# carpeta, que son los que se abren con doble clic desde el Finder.
#
# Arranca el producto de verdad —servidor incluido— con el plan indicado, y
# abre el navegador. Así lo que se ve es el comportamiento real, no una
# simulación: si el plan no incluye algo, el servidor lo rechaza de verdad.
# ==========================================================================

set -e

PLAN="$1"
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRODUCTO="$(cd "$AQUI/../1-producto" && pwd)"
PUERTO="${PORT:-3000}"

echo ""
echo "  Abriendo el asistente con el plan: $PLAN"
echo ""

# El plan se decide al arrancar, así que para cambiarlo hay que reiniciar.
EN_USO="$(lsof -tiTCP:$PUERTO -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$EN_USO" ]; then
  echo "  Ya había un servidor en el puerto $PUERTO. Se reinicia para cambiar de plan."
  kill $EN_USO 2>/dev/null || true
  sleep 1
fi

cd "$PRODUCTO"

if [ ! -d node_modules ]; then
  echo "  Primera vez: instalando dependencias..."
  npm install --silent
fi

PLAN="$PLAN" node servidor_ia.js &
SERVIDOR=$!

# Se espera a que responda antes de abrir el navegador, para no enseñar un
# error de conexión por llegar medio segundo antes de tiempo.
for i in $(seq 1 40); do
  if curl -s -o /dev/null "http://localhost:$PUERTO/api/salud"; then break; fi
  sleep 0.25
done

open "http://localhost:$PUERTO"

echo ""
echo "  ─────────────────────────────────────────────────────────────"
echo "   Asistente:  http://localhost:$PUERTO"
echo "   Panel:      http://localhost:$PUERTO/panel"
echo ""
echo "   Para cerrarlo: Control + C, o cierra esta ventana."
echo "  ─────────────────────────────────────────────────────────────"
echo ""

wait $SERVIDOR
