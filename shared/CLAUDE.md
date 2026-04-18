# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Shared types, utilities, constants, and validation schemas consumed by both `frontend` and `backend`. See root `CLAUDE.md` for monorepo-level guidance.

## Commands

- `bun run typecheck` - Type-check
- `bun run test` - Run all tests
- `bun run test src/path/to/file.test.ts` - Run a single test file (use `bun run test`, not `bun test`)

Repo-wide linting runs from the root with `bun run lint`.

## Package Exports

Import using subpath exports:

- `shared/types` - TypeScript types and interfaces
- `shared/utils` - Utility functions
- `shared/constants` - Shared constants
- `shared/validation` - Zod validation schemas

## Adding New Code

1. Add to the appropriate directory (`types/`, `utils/`, `constants/`, or `validation/`)
2. Export from the directory's `index.ts`
3. Import in frontend/backend via `shared/<subpath>`
