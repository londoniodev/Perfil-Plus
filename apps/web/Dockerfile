# ==============================================================================
# STAGE 1: Dependencies - Instalar dependencias con cache optimizado
# ==============================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar solo archivos de configuración de dependencias primero
# Esto permite cachear la instalación de dependencias
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias con npm ci (más rápido y determinístico)
RUN npm ci

# ==============================================================================
# STAGE 2: Builder - Compilar la aplicación
# ==============================================================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar dependencias instaladas desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Cache bust - cambiar este valor fuerza rebuild del código
ARG CACHEBUST=1

# Copiar el código fuente
COPY . .

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build con turbo (aprovecha cache local)
RUN npx turbo run build --filter=@mauromera/web

# ==============================================================================
# STAGE 3: Runner - Imagen de producción mínima
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/apps/web/public ./apps/web/public

# Crear directorio .next con permisos correctos
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copiar el build standalone (output file tracing de Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck para verificar que la app está corriendo
# Usa 127.0.0.1 en lugar de localhost para evitar IPv6
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
