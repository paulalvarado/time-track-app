#!/bin/sh
set -e

# Sustituir variables de entorno en el template de Nginx
# API_URL debe estar definida en Dokploy (ej: http://time-track-api-zgf3sr:3000)
envsubst '${API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Arrancar Nginx en primer plano
exec nginx -g "daemon off;"
