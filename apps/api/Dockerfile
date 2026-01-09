# ==============================================================================
# STAGE 1: Builder - Install all dependencies and build
# ==============================================================================
FROM node:20-alpine3.18 AS builder
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
FROM node:20-alpine3.18 AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Copy prisma schema for generation
COPY apps/api/prisma ./apps/api/prisma

# Install ALL dependencies (without NODE_ENV=production to include devDeps like prisma)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client in runner
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Now set production mode
ENV NODE_ENV=production

# Copy built app
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist

USER nestjs

EXPOSE 3001
ENV PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "apps/api/dist/main"]
