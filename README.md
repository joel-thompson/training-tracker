# Training Tracker

Training Tracker is a BJJ-focused web app for logging sessions, managing goals, mapping game plans, reviewing stats, and using an AI coach.

This repo is a Bun workspaces monorepo aligned with the current MossKit project shape.

## Included

- Bun workspaces
- Vite + React frontend with TanStack Router and TanStack Query
- Hono backend with Drizzle and PostgreSQL
- shared TypeScript + Zod contracts
- Clerk authentication
- shadcn/ui primitives
- AI coach streaming integration

## Local Development

If `bun` is not available in your shell, run `nvm use` first.

```bash
bun install
bun run db:start
bun run db:migrate
bun run dev
```

The frontend runs on `http://localhost:5173`.
The backend runs on `http://localhost:3000`.

## Environment Setup

Set the required environment variables before starting the app.

- Frontend: `VITE_CLERK_PUBLISHABLE_KEY`
- Frontend optional: `VITE_API_URL` defaults to `http://localhost:3000`
- Backend: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `OPENAI_API_KEY`
- Backend optional: `FRONTEND_URL` defaults to `http://localhost:5173`

See [frontend/src/utils/env.ts](/Users/Joel/src/training-tracker/frontend/src/utils/env.ts) and [backend/src/utils/env.ts](/Users/Joel/src/training-tracker/backend/src/utils/env.ts) for the current source of truth.

## Useful Commands

```bash
bun run dev
bun run build
bun run test
bun run lint
bun run typecheck
bun run format
bun run db:start
bun run db:stop
bun run db:migrate
```

## App Management

This app includes `mosskit.json`, which is used by MossKit app-management commands.

From the app root you can run:

```bash
bunx @joelthompson/create-mosskit info
bunx @joelthompson/create-mosskit features
bunx @joelthompson/create-mosskit add auth
bunx @joelthompson/create-mosskit add shadcn
```

## Notes

- Shared contracts should be defined in `shared` first and then consumed by frontend and backend.
- Tests use Vitest. Use `bun run test`, not Bun's built-in `bun test`.
- Each package has an `AGENTS.md` with more detailed guidance on local conventions.
