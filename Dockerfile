# ── Stage 1: Install dependencies ──────────────────────────────────────
FROM node:22-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────────
FROM node:22-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NODE_ENV=production
RUN pnpm build

# ── Stage 3: Production (Nginx) ────────────────────────────────────────
FROM nginx:alpine AS production

# Instalar envsubst para sustituir variables en runtime
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html

# Configuración template con placeholder ${API_URL}
# Dokploy inyecta API_URL como variable de entorno
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Entrypoint: sustituye variables de entorno en la config y arranca Nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
