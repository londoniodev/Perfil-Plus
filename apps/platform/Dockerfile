# ============================================
# Platform Admin - Multi-stage Dockerfile
# ============================================

FROM node:20-alpine AS base
RUN npm install -g pnpm@9

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/database-management/package.json ./packages/database-management/
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
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/config-tailwind/node_modules ./packages/config-tailwind/node_modules
COPY --from=deps /app/apps/platform/node_modules ./apps/platform/node_modules

# Copy source code
COPY packages/database-management ./packages/database-management
COPY packages/ui ./packages/ui
COPY packages/config-tailwind ./packages/config-tailwind
COPY packages/config-typescript ./packages/config-typescript
COPY apps/platform ./apps/platform
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Generate Prisma client
RUN cd packages/database-management && npx prisma generate

# Build the app
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build --filter=@alvarosky/platform

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/apps/platform/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/static ./apps/platform/.next/static

# Copy Prisma generated client
COPY --from=builder /app/packages/database-management/generated ./packages/database-management/generated

USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/platform/server.js"]
