# Backend

Hono API server for Training Tracker, running on Bun with Drizzle and PostgreSQL.

## Commands

Run from `backend/`:

```bash
bun run dev
bun run build
bun run start
bun run typecheck
bun run test
bun run db:start
bun run db:stop
bun run db:logs
bun run db:migrate
```

Run from the repo root:

```bash
bun run dev
bun run build
bun run test
bun run db:start
```

## Environment Variables

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `FRONTEND_URL`: optional, defaults to `http://localhost:5173`

See [src/utils/env.ts](/Users/Joel/src/training-tracker/backend/src/utils/env.ts) for the current source of truth.
