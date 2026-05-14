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
    ```bash
    composer install
    npm install
    npm run build
    ```
    *Note: If styles are not loading, ensure `npm run build` has been executed.*

2.  **Environment**:
    ```bash
    cp .env.example .env
    # Configure DB_HOST, REDIS_HOST, etc.
    ```
3.  **Database**:
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

```bash
docker compose up -d
```
*Note: If styles appear as plain text in the browser, run `npm install && npm run build` on the host to generate the Vite manifest, and `docker compose exec app php artisan filament:assets` to publish Filament core styles.*

## 📋 API Endpoints

- `POST /api/v1/snapshots`: Send a new code snapshot.
- `POST /api/v1/presence`: Send developer presence heartbeat.
- `GET /api/v1/history`: Retrieve snapshot history for an application.
- `GET /api/v1/snapshots/{id}`: Get full snapshot content.
- `GET /api/v1/diff/{a}/{b}`: Get a pre-calculated diff between two versions.
