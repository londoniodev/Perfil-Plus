FROM node:20-alpine AS base

# 1. Prune dependencies
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the web app
RUN turbo prune --scope=@mauromera/web --docker

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

# Build the project
# This assumes the build script in apps/web/package.json is "next build"
RUN pnpm run build --filter=@mauromera/web...

# 3. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy public files
COPY --from=builder /app/apps/web/public ./apps/web/public

# Create .next directory with correct permissions
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy built application
# Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# Copiamos el esquema para poder correr migraciones en producción
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
