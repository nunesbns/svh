# Scriptcase Versioning Hub

Monorepo containing the **Scriptcase Versioning Hub** ecosystem.

## Projects

- `svh-api/` — Laravel 12 API (FrankenPHP + Octane, PostgreSQL, Redis, Filament 3)
- `svh-extension/` — Chrome Extension (Manifest V3, TypeScript, esbuild, Jest)

## Quick Start

### API

```bash
cd svh-api
docker compose up -d
```

### Extension

```bash
cd svh-extension
npm install
npm run build
```

Load `dist/` as unpacked extension in Chrome.

## Architecture

See `Scriptcase Versioning Hub - TDD.md` for full design document.
