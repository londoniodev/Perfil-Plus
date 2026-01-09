# ==============================================================================
# STAGE 1: Dependencies - Instalar dependencias con cache optimizado
# ==============================================================================
FROM node:20-alpine3.18 AS deps
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
FROM node:20-alpine3.18 AS builder
WORKDIR /app

# Copiar dependencias instaladas (npm workspaces las pone todas en root node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente
COPY . .

ENV NODE_ENV=production

# Generar Prisma Client
RUN npm exec -- prisma generate --schema=apps/api/prisma/schema.prisma

# Build con turbo
RUN npx turbo run build --filter=@mauromera/api

# ==============================================================================
# STAGE 3: Production Dependencies - Solo dependencias de producción
# ==============================================================================
FROM node:20-alpine3.18 AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar SOLO dependencias de producción (workspaces instala todo en root node_modules)
RUN npm ci --omit=dev

# ==============================================================================
# STAGE 4: Runner - Imagen de producción mínima
# ==============================================================================
FROM node:20-alpine3.18 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar dependencias de producción
COPY --from=prod-deps /app/node_modules ./node_modules

# Copiar el Prisma Client generado desde el builder (está en node_modules)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copiar el código compilado
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/

# Copiar el schema de Prisma (necesario para migraciones en runtime)
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma

# Crear script de inicio que ejecuta migraciones y luego arranca la app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "🔄 Syncing database schema..."' >> /app/start.sh && \
    echo './node_modules/.bin/prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss' >> /app/start.sh && \
    echo 'echo "✅ Schema sync completed"' >> /app/start.sh && \
    echo 'echo "🚀 Starting server..."' >> /app/start.sh && \
    echo 'exec node apps/api/dist/main' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nestjs:nodejs /app/start.sh

USER nestjs

EXPOSE 3001

ENV PORT=3001

# Healthcheck - usando el puerto correcto 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=45s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

CMD ["/app/start.sh"]
