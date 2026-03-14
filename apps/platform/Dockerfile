FROM node:20-alpine AS base

# 1. Prune dependencies
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the platform app
RUN turbo prune --scope=@alvarosky/platform --docker

# 2. Install dependencies & Build
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy pruned lockfile and package.json's
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies (only what's needed for platform)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build-time arguments
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client for Management (used by platform)
RUN cd packages/database-management && npx prisma generate

# Build the project
RUN pnpm run build --filter=@alvarosky/platform

# 3. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy public files
COPY --from=builder /app/apps/platform/public ./apps/platform/public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/static ./apps/platform/.next/static

# Copy database schemas required at runtime (for migrations and provisioning)
COPY --from=builder --chown=nextjs:nodejs /app/packages/database-management/prisma ./packages/database-management/prisma
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma ./packages/database/prisma

# Install Prisma globally (needed for tenant provisioning scripts)
RUN npm install -g prisma@5.22.0

USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Migrations on start + App start
CMD ["sh", "-c", "cd packages/database-management && sed -i '/^generator client {$/,/^}$/d' prisma/schema.prisma && prisma db push --skip-generate --accept-data-loss && cd ../../ && node apps/platform/server.js"]
