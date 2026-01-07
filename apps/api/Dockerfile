# ==============================================================================
# STAGE 1: Dependencies - Instalar dependencias con cache optimizado
# ==============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar solo archivos de configuración de dependencias primero
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar todas las dependencias (incluyendo devDeps para el build)
RUN npm ci

# ==============================================================================
# STAGE 2: Builder - Compilar la aplicación
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias instaladas (npm workspaces las pone todas en root node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente
COPY . .

ENV NODE_ENV=production

# Build con turbo
RUN npx turbo run build --filter=@mauromera/api

# ==============================================================================
# STAGE 3: Production Dependencies - Solo dependencias de producción
# ==============================================================================
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar SOLO dependencias de producción (workspaces instala todo en root node_modules)
RUN npm ci --omit=dev

# ==============================================================================
# STAGE 4: Runner - Imagen de producción mínima
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar dependencias de producción (npm workspaces las pone en root node_modules)
COPY --from=prod-deps /app/node_modules ./node_modules

# Copiar el código compilado
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/

USER nestjs

EXPOSE 3000

ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "apps/api/dist/main"]
