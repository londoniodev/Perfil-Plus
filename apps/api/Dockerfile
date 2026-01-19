FROM node:20-alpine AS base

# 1. Prune dependencies
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the api
RUN turbo prune --scope=@mauromera/api --docker

# 2. Install dependencies & Build
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy pruned lockfile and package.json's
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Generar Prisma Client (Importante para que el backend reconozca la DB)
RUN pnpm run build --filter=@mauromera/database

# Build the project
RUN pnpm run build --filter=@mauromera/api...

# Debug build output
RUN echo "Listing build output:" && ls -R /app/apps/api/dist

# 3. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy built files
# Copiamos la carpeta dist compilada
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
# Copiamos las dependencias instaladas
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
# Copiamos el Schema (Por seguridad y consistencia)
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/prisma ./prisma

USER nestjs

# Exponemos el puerto
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/main"]