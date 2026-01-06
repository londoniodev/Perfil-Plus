FROM node:18-alpine As builder

WORKDIR /usr/src/app

# Copy the entire monorepo
COPY . .

# Install all dependencies
RUN npm install

# Build the API
RUN npx turbo run build --filter=@mauromera/api

FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY apps/api/package.json ./

# Install only production dependencies
# In a proper optimized build we would prune, but for simplicity we rely on the builder output
RUN npm install --only=production

# Copy built assets
COPY --from=builder /usr/src/app/apps/api/dist ./dist

CMD ["node", "dist/main"]
