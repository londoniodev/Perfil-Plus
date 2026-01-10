# ==============================================================================
# STAGE 1: Builder - Install all dependencies and build
# ==============================================================================
FROM node:20.19-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

ENV NODE_ENV=production

# Generate Prisma Client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the app
RUN npx turbo run build --filter=@mauromera/api

# ==============================================================================
# STAGE 2: Runner - Production image
# ==============================================================================
FROM node:20.19-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install pnpm, openssl for Prisma, and su-exec for user switching
RUN npm install -g pnpm && apk add --no-cache openssl su-exec

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Copy prisma schema and migrations for runtime migration
COPY apps/api/prisma ./apps/api/prisma

# Install ALL dependencies (including prisma CLI for migrations)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client in runner
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Now set production mode
ENV NODE_ENV=production

# Copy built app
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy entrypoint script (runs as root to execute migrations)
COPY apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001
ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

# Entrypoint runs migrations as root, then switches to nestjs user
ENTRYPOINT ["/entrypoint.sh"]

