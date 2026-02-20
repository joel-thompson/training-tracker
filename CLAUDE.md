# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

BJJ (Brazilian Jiu-Jitsu) training tracker - monorepo using Bun workspaces.

## Project Structure

- `frontend/` - React + Vite application
- `backend/` - Hono API server
- `shared/` - Shared types, utilities, and constants

Each sub-project has its own `CLAUDE.md` with detailed guidance.

## Tech Stack

- Runtime: **Bun** (use `bun` for all package management and script execution)
- Frontend: React 19, Vite, TanStack Router, TanStack Query
- Backend: Hono, Drizzle ORM, PostgreSQL
- Auth: Clerk
- Language: TypeScript

## Commands

Run from the repo root:

- `bun run dev:frontend` - Frontend only (port 5173)
- `bun run dev:backend` - Backend only (port 3000)
- `bun run build` - Build all packages
- `bun run lint` - Lint all packages
- `bun run typecheck` - Type-check all packages
- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio

## Code Style

- Import shared code via `shared/types`, `shared/utils`, `shared/constants`, `shared/validation`
- Always use shared types — avoid duplicating type definitions (e.g., use `ItemType` from `shared/types` instead of redefining `"success" | "problem" | "question"`)
- Business logic belongs in the backend, not the frontend
