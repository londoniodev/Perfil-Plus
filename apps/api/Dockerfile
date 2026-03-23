FROM node:20-alpine AS base

# 1. Prune dependencies
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the api app
RUN turbo prune --scope=@alvarosky/api --docker

# 2. Install dependencies & Build
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy pruned lockfile and package.json's
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Force flat node_modules to avoid symlink issues in Docker copy
RUN echo "node-linker=hoisted" > .npmrc

# Install dependencies (incluyendo binarios nativos para sharp en linux/musl)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --os=linux --libc=musl --cpu=x64

# Copy source code
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client
RUN pnpm run build --filter=@alvarosky/database

# Run Unit Tests (CI/CD Quality Gate)
RUN pnpm --filter @alvarosky/api test -- --ci --passWithNoTests

# Build the project
RUN pnpm run build --filter=@alvarosky/api...

# Remove debug build output
# RUN echo "Listing build output:" && ls -R /app/apps/api/dist

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
# FIX CRÍTICO: Los symlinks de pnpm se rompen entre stages de Docker.
# Copiamos el paquete compilado DIRECTAMENTE a donde Node.js lo busca,
# sobreescribiendo el symlink roto.
COPY --from=builder --chown=nestjs:nodejs /app/packages/database ./node_modules/@alvarosky/database
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared ./node_modules/@alvarosky/shared
COPY --from=builder --chown=nestjs:nodejs /app/packages/types ./node_modules/@alvarosky/types
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

USER nestjs

# Exponemos el puerto
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start:migrate:prod"]