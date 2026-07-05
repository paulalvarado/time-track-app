#!/bin/sh
set -e

# Generar archivo de configuración runtime para el frontend
# VITE_API_URL se inyecta desde Dokploy (ej: https://time-track-api.paulperez.dev)
cat > /usr/share/nginx/html/env.js <<EOF
window.__VITE_API_URL__ = "${VITE_API_URL:-http://localhost:3000}";
EOF

# Arrancar Nginx en primer plano
exec nginx -g "daemon off;"
