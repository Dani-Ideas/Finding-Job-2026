#!/bin/bash
# Espera hasta tener conexión real a internet antes de correr el scraper

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAX_WAIT=300   # máximo 5 minutos esperando red
INTERVAL=15    # revisar cada 15 segundos
elapsed=0

echo "[$(date)] Verificando conexión a internet..."

while ! curl -s --max-time 5 https://www.google.com > /dev/null 2>&1; do
    if [ "$elapsed" -ge "$MAX_WAIT" ]; then
        echo "[$(date)] Sin internet después de ${MAX_WAIT}s. Abortando."
        exit 1
    fi
    echo "[$(date)] Sin internet, reintentando en ${INTERVAL}s... (${elapsed}s transcurridos)"
    sleep "$INTERVAL"
    elapsed=$((elapsed + INTERVAL))
done

echo "[$(date)] Internet disponible. Iniciando scraper..."

cd "$SCRIPT_DIR" || exit 1
source "$SCRIPT_DIR/venv/bin/activate"
python main.py
EXIT_CODE=$?

echo "[$(date)] Scraper finalizado con código: $EXIT_CODE"
exit $EXIT_CODE
