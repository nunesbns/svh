# SVH API Hub

This is the central API hub for the Scriptcase Versioning Hub (SVH) ecosystem. It handles snapshot persistence, deduplication, history management, and administrative tasks.

## 🚀 Features

- **Snapshots API**: REST endpoints for receiving and retrieving code snapshots.
- **Deduplication**: SHA-256 based content hashing to avoid redundant storage.
- **Admin Panel**: Built with Filament 3 for managing projects, API keys, and auditing.
- **Queue Processing**: Background jobs for processing snapshots without blocking the API.
- **High Performance**: Powered by FrankenPHP and Laravel Octane.

## 🛠️ Stack

- **Framework**: Laravel 12.x
- **Server**: FrankenPHP + Octane
- **DB**: PostgreSQL 16
- **Cache**: Redis 7
- **Admin**: Filament 3

## 📦 Setup

1.  **Clone & Install**:
    Ensure that Laravel's storage directories have proper write permissions for both host and container access:
    ```bash
    # Configure permissions so both the host and the container can write to them
    chmod -R 777 storage bootstrap/cache public
    
    composer install
    npm install
    npm run build
    ```
    *Note: If styles are not loading, ensure `npm run build` has been executed.*

2.  **Environment**:
    ```bash
    cp .env.example .env
    # Generate the application encryption key
    php artisan key:generate
    ```
    *Note: If running the application locally on the host, configure `DB_HOST` and `REDIS_HOST` in `.env` (typically changing them from `host.docker.internal` to `127.0.0.1`).*

3.  **Database**:
    Ensure the target database (`svh_api` by default) exists on your PostgreSQL server before migrating. Then run:
    ```bash
    php artisan migrate
    ```

4.  **Assets**:
    ```bash
    npm install
    npm run build
    php artisan filament:assets
    ```
    *Note: If styles are not loading, ensure both `npm run build` and `php artisan filament:assets` have been executed.*

5.  **Admin User**:
    You can create an admin user with:
    ```bash
    php artisan make:filament-user
    ```
    *Default credentials (if created via setup script): `admin@admin.com` / `admin`*

## 🐳 Docker Deployment

The project includes a production-ready Docker configuration using FrankenPHP.

### ⚙️ Docker Setup Steps

1. **Prepare Environment**:
   Ensure you have configured the `.env` file and set the correct write permissions:
   ```bash
   cp .env.example .env
   
   # Set permissions so the container's www-data user can write to storage, cache and public assets
   chmod -R 777 storage bootstrap/cache public
   
   # Generate application key (this will write the key to the host's .env file)
   php artisan key:generate
   ```

2. **Create Database**:
   The default configuration connects to a PostgreSQL service on the host via `host.docker.internal`. Ensure the database (`svh_api`) is created. If using the default `opencodeco-postgres` container, you can run:
   ```bash
   docker exec -i opencodeco-postgres psql -U postgres -c "CREATE DATABASE svh_api;"
   ```

3. **Deploy Container**:
   ```bash
   docker compose up -d
   ```
   *Note: If styles appear as plain text in the browser, run `npm install && npm run build` on the host to generate the Vite manifest, and `docker compose exec app php artisan filament:assets` to publish Filament core styles.*

### 🔍 Troubleshooting Health Check
The Dockerfile has a healthcheck querying `/health` on port 8080. If your container shows as `unhealthy` despite the application responding correctly, note that Laravel route files by default prefix routes in `routes/api.php` with `/api`, making the route `/api/health`. You can safely query `http://localhost:8080/api/health` to verify.

## 📋 API Endpoints

- `POST /api/v1/snapshots`: Send a new code snapshot.
- `POST /api/v1/presence`: Send developer presence heartbeat.
- `GET /api/v1/history`: Retrieve snapshot history for an application.
- `GET /api/v1/snapshots/{id}`: Get full snapshot content.
- `GET /api/v1/diff/{a}/{b}`: Get a pre-calculated diff between two versions.
