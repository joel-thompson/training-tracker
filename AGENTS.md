# Training Tracker

This project is a Bun workspaces monorepo aligned with MossKit.

## Structure

- `frontend`: Vite + React app with TanStack Router, TanStack Query, Clerk auth, shadcn/ui primitives, and feature pages for sessions, goals, stats, game planning, and the AI coach
- `backend`: Hono API with Drizzle, PostgreSQL Docker setup, Clerk-backed auth helpers, and AI coach endpoints
- `shared`: shared TypeScript types, Zod schemas, constants, and utilities consumed by both frontend and backend
- `mosskit.json`: manifest describing the enabled MossKit-style features for this app

## Directory Layout

- `frontend/src/routes`: TanStack Router route files
- `frontend/src/components`: page components and UI primitives
- `frontend/src/hooks`: React Query hooks organized by feature
- `frontend/src/utils`: frontend API and env helpers
- `backend/src/routes`: Hono route modules
- `backend/src/handlers`: route handlers organized by domain
- `backend/src/db`: Drizzle schema and database wiring
- `backend/src/utils`: backend env, auth, and response helpers
- `shared/src/types`: shared TypeScript types
- `shared/src/validation`: shared Zod schemas
- `shared/src/utils`: shared runtime-safe utilities

## How To Work In This App

- Shared contracts and validation should live in `shared` first, then be consumed from frontend and backend.
- Keep route handlers close to their Hono route definitions rather than introducing a controller layer.
- Root scripts coordinate common tasks such as `dev`, `build`, `test`, `lint`, `typecheck`, and database commands.
- `bun run dev` starts both frontend and backend from the repo root.
- `bun run db:start` and `bun run db:stop` manage the local PostgreSQL container.
- Optional features are tracked in `mosskit.json`; this app should be treated as having `auth` and `shadcn` enabled.
- If `bun` is not available in a shell, run `nvm use` first.
- When making commits, do not include a `Co-Authored-By` line.

## Verification

- `bun run test`: runs backend, frontend, and shared tests
- `bun run typecheck`: runs TypeScript checks across all workspaces
- `bun run build`: builds backend and frontend
- `bun run lint`: runs Oxlint across the repo

## Notes

- Preserve existing app behavior and styling when updating tooling or project structure.
