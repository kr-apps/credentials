# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AdonisJS 6** application with **Inertia.js** and **Vue 3** for the frontend, using **PostgreSQL** as the database. The stack includes:

- **Backend**: AdonisJS 6 with TypeScript
- **Frontend**: Vue 3 with Inertia.js (SSR enabled)
- **Styling**: Tailwind CSS v4 + shadcn-vue components
- **Database**: PostgreSQL with Lucid ORM
- **Authentication**: AdonisJS Auth
- **Testing**: Japa test runner

## Development Commands

```bash
# Development server with hot module replacement
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run all tests
npm test

# Run specific test suite
node ace test functional
node ace test unit

# Type checking
npm run typecheck

# Linting and formatting
npm run lint
npm run format

# Database migrations
node ace migration:run
node ace migration:rollback
node ace migration:fresh
node ace make:migration <name>
```

## Architecture

### Backend Structure

The backend follows AdonisJS conventions with TypeScript path aliases defined in `package.json` (e.g., `#controllers/*`, `#models/*`, `#middleware/*`):

- **`start/`**: Application bootstrap
  - `routes.ts`: HTTP route definitions
  - `kernel.ts`: Middleware stack configuration (server and router middleware)
  - `env.ts`: Environment variables validation schema

- **`app/`**: Application code
  - `models/`: Lucid ORM models (e.g., `user.ts`)
  - `middleware/`: HTTP middleware (`auth_middleware`, `guest_middleware`, `silent_auth_middleware`)
  - `exceptions/`: Custom exception handlers

- **`config/`**: Configuration files for all AdonisJS packages (database, auth, session, inertia, vite, etc.)

- **`database/migrations/`**: Database schema migrations

### Frontend Structure (Inertia + Vue)

The frontend lives in the `inertia/` directory with SSR enabled:

- **`inertia/app/`**: Application entry points
  - `app.ts`: Client-side entrypoint
  - `ssr.ts`: Server-side rendering entrypoint

- **`inertia/pages/`**: Inertia page components (Vue SFCs)
  - Routed via `router.renderInertia()` in `start/routes.ts`
  - `errors/`: Error page components

- **`inertia/components/`**: Reusable Vue components
  - `ui/`: shadcn-vue components (installed via `shadcn-vue` CLI)

- **`inertia/lib/`**: Utility functions
  - `utils.ts`: Frontend utilities (e.g., `cn()` for Tailwind class merging)

- **`inertia/css/`**: Global styles

- **Alias**: `~/` resolves to `inertia/` directory (defined in `vite.config.ts`)

### Middleware Stack

Middleware is configured in `start/kernel.ts`:

**Server middleware** (runs on all requests):

1. Container bindings
2. Static file serving
3. CORS
4. Vite middleware (dev only)
5. Inertia middleware

**Router middleware** (runs on matched routes):

1. Body parser
2. Session
3. Shield (CSRF protection)
4. Auth initialization

**Named middleware** (applied explicitly to routes):

- `auth`: Requires authenticated user
- `guest`: Requires unauthenticated user

### Inertia.js Integration

- **SSR enabled**: Server-side rendering configured in `config/inertia.ts` and `vite.config.ts`
- **Root view**: `inertia_layout` (Edge template in `resources/views/`)
- **Shared data**: Configure in `config/inertia.ts` `sharedData` object
- Pages are rendered via `router.on('/').renderInertia('home')` in routes

### Hot Module Replacement

HotHook is configured in `package.json` to reload:

- `app/controllers/**/*.ts`
- `app/middleware/*.ts`

## Testing

Tests are organized by suite in `adonisrc.ts`:

- **Unit tests**: `tests/unit/**/*.spec.ts` (2s timeout)
- **Functional tests**: `tests/functional/**/*.spec.ts` (30s timeout)

Bootstrap configuration: `tests/bootstrap.ts`

## Database

- **Connection**: PostgreSQL (configured in `config/database.ts`)
- **ORM**: Lucid (AdonisJS's ActiveRecord implementation)
- **Migrations**: Stored in `database/migrations/` with natural sorting enabled
- **Environment variables**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`

## Environment Variables

All environment variables are validated in `start/env.ts`. Required variables include:

- `NODE_ENV`, `PORT`, `APP_KEY`, `HOST`, `LOG_LEVEL`
- `SESSION_DRIVER` (cookie or memory)
- Database connection variables (see above)

See `.env.example` for a complete list.

## Build Process

- **Vite build hook**: Runs on build (configured in `adonisrc.ts` hooks)
- **Metafiles**: `resources/views/**/*.edge` and `public/**` are copied to build
- **Experimental flags**: `mergeMultipartFieldsAndFiles` and `shutdownInReverseOrder` enabled
