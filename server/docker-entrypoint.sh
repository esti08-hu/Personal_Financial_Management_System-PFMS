#!/bin/sh
set -e

echo "Starting application..."
echo "Environment: $1"

if [ "$1" = "dev" ]; then
    pnpm drizzle-kit migrate
    exec pnpm start:dev
fi

if [ "$1" = "prod" ]; then
    echo "Running migrations..."
    pnpm drizzle-kit migrate
    echo "Starting production server..."
    exec node dist/src/main
fi

