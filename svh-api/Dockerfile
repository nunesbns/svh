# ============================================================
# Stage 1 — Composer deps
# ============================================================
FROM dunglas/frankenphp:1-php8.4-bookworm AS vendor
WORKDIR /app
RUN install-php-extensions \
      pdo_pgsql pgsql redis intl bcmath opcache zip pcntl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install \
      --no-scripts --no-interaction \
      --prefer-dist --optimize-autoloader

# ============================================================
# Stage 2 — Frontend (Filament assets / Vite)
# ============================================================
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package*.json vite.config.* tailwind.config.* postcss.config.* ./
RUN npm install
COPY resources resources
COPY public public
RUN npm run build

# ============================================================
# Stage 3 — Runtime (FrankenPHP + PHP 8.4)
# ============================================================
FROM dunglas/frankenphp:1-php8.4-bookworm AS runtime

ARG APP_VERSION=dev
ENV APP_ENV=production \
    APP_DEBUG=false \
    OCTANE_SERVER=frankenphp \
    SERVER_NAME=":8080" \
    PHP_INI_SCAN_DIR=/usr/local/etc/php/conf.d:/etc/svh/php

# Extensões PHP requeridas (Laravel 12 + Filament + Redis + PG)
RUN install-php-extensions \
      pdo_pgsql pgsql redis intl bcmath opcache zip pcntl

# Supervisord para múltiplos processos
RUN apt-get update \
 && apt-get install -y --no-install-recommends supervisor curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Código aplicação
COPY --chown=www-data:www-data . /app
COPY --chown=www-data:www-data --from=vendor   /app/vendor       /app/vendor
COPY --chown=www-data:www-data --from=frontend /app/public/build /app/public/build

# Config files
COPY docker/php/php.ini           /etc/svh/php/zz-svh.ini
COPY docker/supervisor/svh.conf   /etc/supervisor/conf.d/svh.conf
COPY docker/entrypoint.sh         /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# Otimizações Laravel 12 em build
RUN mkdir -p resources/views storage/framework/{cache,sessions,testing,views} bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && php artisan storage:link || true \
 && php artisan event:cache \
 && php artisan view:cache || true \
 && php artisan route:cache \
 && php artisan config:cache

LABEL org.opencontainers.image.title="Scriptcase Versioning Hub" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.source="https://github.com/anomalyco/svh"

EXPOSE 8080 8443
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://127.0.0.1:8080/health || exit 1

USER www-data
ENTRYPOINT ["entrypoint"]
CMD ["supervisord","-c","/etc/supervisor/conf.d/svh.conf","-n"]
