FROM node:18-alpine

WORKDIR /usr/src/app

# Copy the entire monorepo
COPY . .

# Install all dependencies (including workspaces)
RUN npm install

# Build the API
RUN npx turbo run build --filter=@mauromera/api

# Expose the API port
EXPOSE 3000
ENV PORT 3000

# Start the application
CMD ["node", "apps/api/dist/main"]
