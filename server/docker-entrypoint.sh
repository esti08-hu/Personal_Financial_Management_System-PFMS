#!/bin/bash
set -e

echo "Starting application..."
echo "Environment: $1"


# Check if the environment is set to development
if [ "$1" = "dev" ]; then
    # Start the application in development mode
    pnpm drizzle-kit migrate
    exec pnpm start:dev
fi

if [ "$1" = "prod" ]; then
    # Start the application in production mode
    pnpm drizzle-kit migrate
    exec pnpm run build && exec pnpm start:prod
fi

