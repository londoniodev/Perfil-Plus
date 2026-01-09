# ==============================================================================
# STAGE 1: Dependencies - Instalar dependencias con cache optimizado
# ==============================================================================
FROM node:20-alpine3.18 AS deps
WORKDIR /app

# Copiar solo archivos de configuración de dependencias primero
# Copiar solo archivos de configuración de dependencias primero
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar todas las dependencias
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ==============================================================================
# STAGE 2: Builder - Compilar la aplicación
# ==============================================================================
FROM node:20-alpine3.18 AS builder
WORKDIR /app
RUN npm install -g pnpm

# Copiar dependencias instaladas (npm workspaces las pone todas en root node_modules)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copiar el código fuente
COPY . .

ENV NODE_ENV=production

# Generar Prisma Client
RUN npm exec -- prisma generate --schema=apps/api/prisma/schema.prisma

# Build con turbo
RUN npx turbo run build --filter=@mauromera/api

# Prepare Prisma Client for copying (dereference symlinks for pnpm)
RUN cp -rL node_modules/@prisma/client /app/prisma-generated

# Dereference all node_modules symlinks for production
RUN mkdir -p /app/prod-node-modules && cp -rL node_modules/* /app/prod-node-modules/

# ==============================================================================
# STAGE 3: Production Dependencies - Solo dependencias de producción
# ==============================================================================
FROM node:20-alpine3.18 AS prod-deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar SOLO dependencias de producción
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# ==============================================================================
# STAGE 4: Runner - Imagen de producción mínima
# ==============================================================================
FROM node:20-alpine3.18 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar dependencias de producción (dereferenciadas desde builder)
COPY --from=builder /app/prod-node-modules ./node_modules

# Copiar el Prisma Client generado desde el builder (copia dereferenciada)
COPY --from=builder /app/prisma-generated ./node_modules/@prisma/client

# Copiar el código compilado
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/

USER nestjs

EXPOSE 3001

ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "apps/api/dist/main"]
