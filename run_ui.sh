#!/bin/bash
# Inicia la UI del Job Scraper en http://localhost:3100

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$SCRIPT_DIR/ui"

if [ ! -d "$UI_DIR/node_modules" ]; then
  echo "Instalando dependencias (primera vez)..."
  cd "$UI_DIR" && npm install
fi

echo "Iniciando UI en http://localhost:3100"
cd "$UI_DIR" && npm run dev
