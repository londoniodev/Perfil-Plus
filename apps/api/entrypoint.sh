#!/bin/sh
set -e

echo "🔄 Synchronizing database schema..."
cd /app
npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss

echo "🚀 Starting application as nestjs user..."
exec su-exec nestjs node apps/api/dist/main
