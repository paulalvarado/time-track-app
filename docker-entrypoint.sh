#!/bin/sh
set -e

# Inyectar la URL de la API en el index.html
# VITE_API_URL se configura en Dokploy (ej: https://time-track-api.paulperez.dev)
API_URL="${VITE_API_URL:-http://localhost:3000}"
sed -i "s|__API_URL__|${API_URL}|g" /usr/share/nginx/html/index.html

# Arrancar Nginx en primer plano
exec nginx -g "daemon off;"
