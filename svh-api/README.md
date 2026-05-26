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

## 📋 Requirements & Tools

This project requires the following tools for local development:

- **PHP**: `^8.4`
- **Composer**: `^2.x`
- **Node.js**: `^22.x`
- **PostgreSQL**: `^16.x` or `^17.x`
- **Redis**: `^7.x`

### 🛠️ Version Management with `mise`

To avoid version mismatches and conflicts on your host machine, we recommend using [mise-en-place (mise)](https://mise.jdx.dev/) to automatically manage your local runtime versions.

A `.mise.toml` configuration file is included in the project root. Once you have `mise` installed, you can automatically install and configure the correct versions of PHP, Composer, and Node.js by running:

```bash
mise install
```

---

## 📦 Setup

1. **Clone & Install**:
   Ensure that Laravel's storage directories have proper write permissions:
   ```bash
   chmod -R 775 storage bootstrap/cache
   
   composer install
   npm install
   npm run build
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Migration**:
   Ensure the target database (`svh_api`) is created, then run:
   ```bash
   php artisan migrate
   ```

4. **Filament Assets**:
   ```bash
   php artisan filament:assets
   ```

5. **Create Database**:
   If using the default `opencodeco-postgres` container, you can create the database with:
   ```bash
   docker exec -i opencodeco-postgres psql -U postgres -c "CREATE DATABASE svh_api;"
   ```

6. **Deploy Container**:
   ```bash
   docker compose up -d --build --force-recreate
   ```

6. **Create your user**:

   ```bash
   docker exec -it svh-api-app-1 filament:user
   ```

### 🔍 Health Check & Troubleshooting
The Dockerfile has a healthcheck querying the `/api/health` route on port 8080. If your container shows as `unhealthy`, ensure the database and redis dependencies are online and check container logs with:
```bash
docker compose logs -f app
```

## 📋 API Endpoints

- `POST /api/v1/snapshots`: Send a new code snapshot.
- `GET /api/v1/snapshots/{id}`: Get full snapshot content.
- `POST /api/v1/presence`: Send developer presence heartbeat.
- `GET /api/v1/presence/conflicts`: Retrieve presence conflicts.
- `GET /api/v1/history`: Retrieve snapshot history for an application.
- `POST /api/v1/diff/raw`: Compare two raw code inputs and calculate diff.
- `GET /api/v1/diff/{a}/{b}`: Get a pre-calculated diff between two versions.
- `POST /api/v1/restore`: Restore a snapshot.
- `GET /api/health`: Retrieve the API application health status.
- `GET /api/metrics`: Retrieve real-time operational metrics.
