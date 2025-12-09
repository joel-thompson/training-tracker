# Training Tracker

BJJ (Brazilian Jiu-Jitsu) training tracker - monorepo using Bun workspaces.

## Project Structure

- `frontend/` - React + Vite application
- `backend/` - Hono API server  
- `shared/` - Shared types, utilities, and constants

## Tech Stack

- Runtime: Bun (Use `bun` for all package management and script execution)
- Frontend: React 19, Vite, TanStack Router
- Backend: Hono
- Auth: Clerk
- Language: TypeScript

## Commands

- `bun run dev` - Start both frontend and backend
- `bun run dev:frontend` - Start frontend only
- `bun run dev:backend` - Start backend only
- `bun run build` - Build all packages
- `bun run lint` - Lint all packages

## Code Style

- Import shared code via `shared/types`, `shared/utils`, `shared/constants`

