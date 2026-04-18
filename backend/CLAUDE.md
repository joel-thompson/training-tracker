# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Hono API server running on Bun. See root `CLAUDE.md` for monorepo-level guidance.

## Commands

- `bun run dev` - Start with hot reload (port 3000)
- `bun run build` - Build the production bundle
- `bun run start` - Run the production bundle from `dist/`
- `bun run typecheck` - Type-check
- `bun run test` - Run all tests
- `bun run test src/path/to/file.test.ts` - Run a single test file (use `bun run test`, not `bun test`)
- `bun run db:generate` - Generate migrations from schema
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:start` - Start PostgreSQL container
- `bun run db:stop` - Stop PostgreSQL container
- `bun run db:logs` - Tail PostgreSQL logs

Repo-wide linting runs from the root with `bun run lint`.

## Database Schema Changes

1. Update the schema in `src/db/schema.ts`
2. Update types in `shared/types` if needed
3. Update validation schemas in `shared/validation` if needed
4. Run `bun run db:generate` to generate a migration

**IMPORTANT: Do not run the migration automatically. Show the generated migration and ask the user to review before running `bun run db:migrate`.**

## Route Organization

Routes are grouped using Hono's `route` method.

## Handlers Pattern

Route handlers live in `src/handlers/` organized by domain.

Key patterns:

1. Assert request bodies as `unknown`, then validate with Zod
2. Use `parsed.error.message` for validation errors
3. Create a typed `responseData` variable before returning

## Auth Pattern

Routes under `/api/*` use Clerk middleware. `requireUserId` throws an `HTTPException` that Hono converts to a 401 automatically.

## Response Format

All API responses use:

```json
{ "success": true, "data": {} }
```

or:

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## Environment Variables

See `src/utils/env.ts` for all required environment variables.
