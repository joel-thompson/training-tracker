# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Hono API server running on Bun. See root `CLAUDE.md` for monorepo-level guidance.

## Commands

- `bun run dev` - Start with hot reload (port 3000)
- `bun run lint` - Run ESLint
- `bun run typecheck` - Type-check
- `bun run db:generate` - Generate migrations from schema
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:start` - Start PostgreSQL container
- `bun run db:stop` - Stop PostgreSQL container

## Database Schema Changes

1. Update the schema in `src/db/schema.ts`
2. Update types in `shared/types` if needed
3. Update validation schemas in `shared/validation` if needed
4. Run `bun run db:generate` to generate a migration

**IMPORTANT: Do not run the migration automatically. Show the generated migration and ask the user to review before running `bun run db:migrate`.**

## Route Organization

Routes are grouped using Hono's route method:

```typescript
// routes/sessions.ts
const sessions = new Hono();
sessions.post("/", createSessionHandler);
sessions.get("/", listSessionsHandler);

// index.ts
app.route("/api/v1/sessions", sessions);
```

## Handlers Pattern

Route handlers live in `src/handlers/` organized by domain:

```
src/handlers/
  sessions/
    create.ts
    list.ts
    get.ts
    ...
    index.ts  # Re-exports all handlers
```

### Handler Structure

```typescript
import type { Context } from "hono";
import { mySchema } from "shared/validation";
import { requireUserId } from "../utils/auth";
import { successResponse, errorResponse, ErrorCodes } from "../utils/response";
import type { MyResponseType } from "shared/types";

export const myHandler = async (c: Context) => {
  const userId = requireUserId(c);

  // 1. Parse input as unknown, then validate with Zod
  const body: unknown = await c.req.json();
  const parsed = mySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  // 2. Do work...

  // 3. Create typed response data, then return
  const responseData: MyResponseType = { ... };
  return c.json(successResponse(responseData));
};
```

Key patterns:

1. Assert request body as `unknown`, then use `safeParse`
2. Use `parsed.error.message` for validation errors
3. Create a typed `responseData` variable before returning

## Auth Pattern

Routes under `/api/*` use Clerk middleware. `requireUserId` throws an `HTTPException` that Hono converts to a 401 automatically — no try/catch needed for auth:

```typescript
export const myHandler = async (c: Context) => {
  const userId = requireUserId(c);
  // Handle authenticated request
};
```

## Response Format

All API responses use:

```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Helpers from `src/utils/response.ts`:

- `successResponse(data)`
- `errorResponse(code, message)`
- `ErrorCodes` — `VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `INTERNAL_ERROR`

## Environment Variables

See `src/utils/env.ts` for all required environment variables.
