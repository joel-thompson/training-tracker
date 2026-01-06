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

Each package has an `AGENTS.md` with detailed documentation on commands, patterns, and conventions.

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

Database commands are in `backend/`. See `backend/AGENTS.md` for details.
