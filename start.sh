#!/bin/sh
# Startup script for Coolify deployment
# Validates DATABASE_URL is available before running migrations

echo "=== Container Startup ==="
echo "NODE_ENV: $NODE_ENV"

# Check DATABASE_URL (masked for security)
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set!"
    exit 1
fi

# Mask credentials for logging
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:\([^@]*\)@/:***@/')
echo "DATABASE_URL: $MASKED_URL"

# Run migrations
echo "=== Running Prisma Migrations ==="
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "ERROR: Migration failed!"
    exit 1
fi

# Start the application
echo "=== Starting Next.js Server ==="
exec node server.js
