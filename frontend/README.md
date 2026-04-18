# Frontend

React 19 + Vite client for Training Tracker.

## Commands

Run from `frontend/`:

```bash
bun run dev
bun run build
bun run preview
bun run typecheck
bun run test
```

Run from the repo root:

```bash
bun run dev
bun run build
bun run test
```

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY`: required for Clerk auth
- `VITE_API_URL`: optional override for the backend URL, defaults to `http://localhost:3000`

See [src/utils/env.ts](/Users/Joel/src/training-tracker/frontend/src/utils/env.ts) for the current source of truth.
