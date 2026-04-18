# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

BJJ (Brazilian Jiu-Jitsu) training tracker monorepo using Bun workspaces.

## Project Structure

- `frontend/` - React + Vite application
- `backend/` - Hono API server
- `shared/` - Shared types, utilities, constants, and validation

Each sub-project has its own `CLAUDE.md` with more detailed guidance.

## Tech Stack

- Runtime: **Bun** (run `nvm use` first if `bun` is not on `PATH`)
- Frontend: React 19, Vite, TanStack Router, TanStack Query
- Backend: Hono, Drizzle ORM, PostgreSQL
- Auth: Clerk
- Language: TypeScript

## Commands

Run from the repo root:

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

- Import shared code via `shared/types`, `shared/utils`, `shared/constants`, `shared/validation`
- Always use shared types rather than duplicating type definitions
- Business logic belongs in the backend, not the frontend
