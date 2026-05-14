#!/usr/bin/env sh
set -e

# Aguarda Postgres e Redis (timeout 30s cada)
php /app/artisan svh:wait-for --service=db --timeout=30
php /app/artisan svh:wait-for --service=redis --timeout=30

# Migrações idempotentes
php /app/artisan migrate --force --no-interaction

# Storage
php /app/artisan storage:link || true

# Recompila caches caso env tenha mudado entre starts
php /app/artisan config:cache
php /app/artisan route:cache
php /app/artisan event:cache

exec "$@"
