#!/bin/sh
set -e

# Sustituir variables de entorno en el template de Nginx
# VITE_API_URL debe estar definida en Dokploy (ej: http://time-track-api-zgf3sr:3000)
# Si no está definida, usa localhost como fallback para que Nginx no falle
API_URL="${VITE_API_URL:-http://localhost:3000}"
export API_URL

envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Arrancar Nginx en primer plano
exec nginx -g "daemon off;"
