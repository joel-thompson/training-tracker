# Training Tracker 🥋

A web application for Brazilian Jiu-Jitsu practitioners to track training sessions, set goals, and plan their game.

## What It Does

- **Training Sessions** — Log sessions with date, class type, techniques covered, and reflective notes (what went well, areas to improve, questions to explore)
- **Goals** — Set and manage training goals to stay focused on improvement
- **Game Planning** — Build a map of positions and techniques with transitions between them

## Tech Stack

- **Frontend:** React, Vite, TanStack Router/Query, Tailwind
- **Backend:** Hono, PostgreSQL, Drizzle ORM
- **Auth:** Clerk
- **Runtime:** Bun (monorepo with workspaces)

## Project Structure

```
training-tracker/
├── frontend/     # React SPA
├── backend/      # API server
└── shared/       # Shared types, validation, utilities
```

Each package has a `CLAUDE.md` with detailed documentation on commands, patterns, and conventions.

## Quick Start

1. Install dependencies: `bun install`
2. Set up environment variables (see package READMEs)
3. Start the database: `cd backend && bun run db:start`
4. Run migrations: `bun run db:migrate`
5. Start dev servers: `bun run dev`

The frontend runs on port 5173, backend on port 3000.

## Development

Common commands (run from root):

```bash
bun run dev          # Start frontend + backend
bun run build        # Build all packages
bun run lint         # Lint all packages
bun run typecheck    # Type check all packages
```

Database commands are in `backend/`. See `backend/CLAUDE.md` for details.

## Testing

Tests use [Vitest](https://vitest.dev/). Always use `bun run test` — not `bun test` (Bun's built-in runner doesn't process Vitest mocks).

**All packages at once (from root):**

```bash
bun run test
```

**Single package (from root):**

```bash
bun run --filter backend test
bun run --filter frontend test
bun run --filter shared test
```

**Single package (after cd):**

```bash
cd backend && bun run test
```

**Single file (after cd into the package):**

```bash
cd backend && bun run test src/handlers/goals/create.test.ts
cd frontend && bun run test src/utils/api.test.ts
```
