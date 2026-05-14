# Scriptcase Versioning Hub (SVH)

Scriptcase Versioning Hub is an external versioning ecosystem designed to capture, organize, and restore code snapshots from the Scriptcase IDE.

## 🚀 Overview

SVH solves the challenge of versioning within the Scriptcase IDE without requiring changes to the Scriptcase server or database. It works by intercepting save actions directly in the developer's browser and persisting the code to a central hub.

**Key Goals:**
- **Zero Watcher**: No need for CLI watchers or background processes on the Scriptcase server.
- **Zero Triggers**: No database triggers or audit tables needed in the client's Scriptcase database.
- **Automated Capture**: Identifies the logged-in user and project context automatically.

## 🏗️ Architecture

The system consists of two main components:

### 1. Chrome Extension (Manifest V3)
Installed in each developer's browser.
- **Capture**: Intercepts `Ctrl+S`, "Save" button clicks, and internal fetch/XHR requests to detect code changes.
- **Context**: Automatically resolves `cod_prj`, `cod_apl`, scope (events/libs), and the Scriptcase user login.
- **Sidebar**: Provides a real-time timeline of snapshots, side-by-side diffs, and a one-click restore feature.
- **Restore**: Injects historical content back into the IDE editor for review and final saving.

### 2. API Hub (Laravel 12)
Centralized hub for persistence and management.
- **Persistence**: Stores snapshots in PostgreSQL with LZ4 compression.
- **Deduplication**: Uses SHA-256 hashing to avoid storing redundant snapshots.
- **Admin Panel**: Powered by Filament 3, allowing managers to view developer activity, manage API keys, and audit restorations.
- **Performance**: High-concurrency support using FrankenPHP and Laravel Octane.

## 🛠️ Tech Stack

### API (Backend)
- **Framework**: Laravel 12.x (PHP 8.4)
- **App Server**: FrankenPHP + Laravel Octane
- **Admin UI**: Filament 3.x
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7

### Extension (Frontend)
- **Platform**: Chrome Extension Manifest V3
- **Language**: TypeScript
- **Bundler**: esbuild
- **UI**: Preact + Tailwind CSS
- **Utilities**: diff2html

## 📥 Installation & Setup

### API Hub

1.  Navigate to the API directory:
    ```bash
    cd svh-api
    ```
2.  Setup environment:
    ```bash
    cp .env.example .env
    # Configure your DB and Redis in .env
    ```
3.  Launch with Docker:
    ```bash
    docker compose up -d
    ```
4.  Run migrations and create admin:
    ```bash
    docker compose exec app php artisan migrate
    docker compose exec app php artisan make:filament-user
    ```

### Chrome Extension

1.  Navigate to the extension directory:
    ```bash
    cd svh-extension
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the extension:
    ```bash
    npm run build
    ```
4.  Load into Chrome:
    - Open `chrome://extensions/`
    - Enable **Developer mode**.
    - Click **Load unpacked** and select the `svh-extension/dist` folder.
5.  Configure:
    - Click the extension icon and go to **Options**.
    - Set the **API URL** and your **API Key** (generated in the Hub Admin).

## 📂 Project Structure

- `svh-api/`: Laravel backend application.
- `svh-extension/`: Chrome extension source code.

## 📄 License

This project is licensed under the MIT License.
