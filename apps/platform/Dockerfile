# ============================================
# Platform Admin - Multi-stage Dockerfile
# Using Debian-slim for Prisma compatibility
# ============================================

FROM node:20-slim AS base
RUN npm install -g pnpm@9

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/database-management/package.json ./packages/database-management/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config-tailwind/package.json ./packages/config-tailwind/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY apps/platform/package.json ./apps/platform/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build
# ============================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/database-management/node_modules ./packages/database-management/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/config-tailwind/node_modules ./packages/config-tailwind/node_modules
COPY --from=deps /app/apps/platform/node_modules ./apps/platform/node_modules

# Copy source code
COPY packages/database-management ./packages/database-management
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY packages/config-tailwind ./packages/config-tailwind
COPY packages/config-typescript ./packages/config-typescript
COPY apps/platform ./apps/platform
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Generate Prisma client for linux target
RUN cd packages/database-management && npx prisma generate

# Build the app
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build --filter=@alvarosky/platform

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-slim AS runner
WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copy built assets and dependencies
COPY --from=builder /app/apps/platform/public ./apps/platform/public
COPY --from=builder /app/apps/platform/.next ./apps/platform/.next
COPY --from=builder /app/apps/platform/package.json ./apps/platform/package.json
COPY --from=builder /app/apps/platform/node_modules ./apps/platform/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/platform
CMD ["sh", "-c", "cd /app/packages/database-management && npx prisma db push && cd /app/apps/platform && npx next start -p 4000"]
