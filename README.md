# Scriptcase Versioning Hub (SVH)

<p align="center">
  <img src="svh_logo_300x300.png" alt="Scriptcase Versioning Hub Logo" width="150" />
</p>

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
- **Syntax Check**: Provides quick PHP syntax checking via the "Check Syntax" button, opening an on-screen dialog indicating compiler validation results and enabling a one-click jump to the error line.

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

This repository is structured as a monorepo. Each subproject contains its own installation, build, and configuration instructions. Please refer to their respective README files:

- **API Hub (Backend)**: For setting up Laravel, Docker containers, database migrations, and configuring environment variables, see [svh-api/README.md](svh-api/README.md).
- **Chrome Extension (Frontend)**: For building, loading, and configuring the Chrome extension, see [svh-extension/README.md](svh-extension/README.md).

## 📂 Project Structure

- `svh-api/`: Laravel backend application.
- `svh-extension/`: Chrome extension source code.

## 📄 License

This project is licensed under the GPL-3.0 license.
