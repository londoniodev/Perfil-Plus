FROM node:20-alpine AS base

# 1. Prune dependencies
FROM base AS pruner
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
Run npm install -g turbo
COPY . .
# Prune the workspace for the web app
RUN turbo prune --scope=mauromera-web --docker

# 2. Install dependencies & Build
FROM base AS builder
RUN apk add --no-cache libc6-compat
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
# Note: We don't copy .env here because we want to bake environment variables at build time OR use runtime config.
# Ideally, for Next.js standalone, we rely on runtime env vars or build args.
# For simplicity in Dokploy, we assume ENVs are injected.
RUN pnpm run build --filter=mauromera-web...

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm run build --filter=mauromera-web...

# 3. Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy necessary files for standalone mode
COPY --from=installer /app/apps/mauromera-web/next.config.ts .
COPY --from=installer /app/apps/mauromera-web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/mauromera-web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/mauromera-web/.next/static ./apps/mauromera-web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/mauromera-web/public ./apps/mauromera-web/public

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/mauromera-web/server.js"]
