# Training Tracker

This project is a Bun workspaces monorepo aligned with MossKit.

## Tech Stack

- Runtime: Bun. If `bun` is not available in a shell, run `nvm use` first.
- Frontend: React 19, Vite, TanStack Router, TanStack Query
- Backend: Hono, Drizzle ORM, PostgreSQL
- Auth: Clerk
- Language: TypeScript

## Structure

- `frontend`: Vite + React app with TanStack Router, TanStack Query, Clerk auth, shadcn/ui primitives, and feature pages for sessions, goals, stats, game planning, and the AI coach
- `backend`: Hono API with Drizzle, PostgreSQL Docker setup, Clerk-backed auth helpers, and AI coach endpoints
- `shared`: shared TypeScript types, Zod schemas, constants, and utilities consumed by both frontend and backend
- `mosskit.json`: manifest describing the enabled MossKit-style features for this app

Each sub-project has its own `AGENTS.md` with more detailed local guidance.

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
- When making commits, do not include a `Co-Authored-By` line.

## Root Commands

- `bun run dev` - Start frontend + backend together
- `bun run build` - Build all packages
- `bun run lint` - Run Oxlint across the repo
- `bun run typecheck` - Type-check all packages
- `bun run test` - Run all tests
- `bun run format` - Format the repo with Prettier
- `bun run db:start` - Start PostgreSQL
- `bun run db:stop` - Stop PostgreSQL
- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio

## Code Style

- Import shared code via `shared/types`, `shared/utils`, `shared/constants`, and `shared/validation`.
- Always use shared types rather than duplicating type definitions.
- Business logic belongs in the backend, not the frontend.

## Verification

- `bun run test`: runs backend, frontend, and shared tests
- `bun run typecheck`: runs TypeScript checks across all workspaces
- `bun run build`: builds backend and frontend
- `bun run lint`: runs Oxlint across the repo

## Development Server

Do not try to run the development server. It is already running. The frontend is available at http://localhost:5173/, the backend is available at http://localhost:3000

If the server is unavailable, ask the user to start the server.

## Browser Auth Testing

- For browser smoke tests, use `browser-use`.
- Prefer `browser-use --profile Default open http://localhost:5173` for authenticated checks. In this environment, that uses the local Chrome profile at `/Users/Joel/Library/Application Support/Google/Chrome/Default`, which can preserve existing GitHub and Clerk sessions.
- If the user is not already logged in, first verify the unauthenticated flow in a fresh browser session:
  - `browser-use close`
  - `browser-use open http://localhost:5173`
  - click the sign-in CTA and confirm the `GitHub` auth button reaches the GitHub sign-in page
- If `browser-use connect` fails, it usually means Chrome is not running with remote debugging enabled. In that case, fall back to `browser-use --profile Default ...` instead of blocking on `connect`.
- When checking multiple protected routes, navigate sequentially in one browser session. Do not issue parallel `browser-use open ...` commands against the same session.
- Useful protected-route smoke checks are:
  - `/sessions/new`
  - `/history`
  - `/goals`
  - `/stats`
  - `/coach`
  - `/game`
  - `/settings`
- If `localhost` is unreachable from the shell sandbox, still try the browser flow. The browser may be able to reach the host machine's dev server even when `curl` from the shell cannot.

## Notes

- Preserve existing app behavior and styling when updating tooling or project structure.
