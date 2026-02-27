FROM node:20-alpine AS base

# 1. Prune dependencies
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the SaaS Dashboard app
RUN turbo prune --scope=saas_dashboard --docker

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

# Build-time arguments for Next.js public env vars (if any)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_TENANT_ID
ENV NEXT_PUBLIC_TENANT_ID=${NEXT_PUBLIC_TENANT_ID}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

# Signal to app code that we're in build phase
ENV NEXT_PHASE=phase-production-build

# Provide a dummy DATABASE_URL purely for prisma generate to complete without breaking (matches _template)
# Provide a dummy NEXT_PUBLIC_TENANT_ID to allow Next.js static generation to pass the missing env check
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    NEXT_PUBLIC_TENANT_ID="admin_build" \
    pnpm run build --filter=saas_dashboard

# 3. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy public files
COPY --from=builder /app/apps/saas_dashboard/public ./apps/saas_dashboard/public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/saas_dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/saas_dashboard/.next/static ./apps/saas_dashboard/.next/static
# Copy schema for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/saas_dashboard/server.js"]
