#!/bin/sh
set -e

echo "🔄 Running database migrations..."
cd /app
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

echo "🚀 Starting application as nestjs user..."
exec su-exec nestjs node apps/api/dist/main
