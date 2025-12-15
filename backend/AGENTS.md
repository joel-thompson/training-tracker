# Backend

Hono API server running on Bun.

## Tech Stack
 
- Framework: Hono
- Auth: Clerk (`@hono/clerk-auth`)
- Database: PostgreSQL with Drizzle ORM
- Validation: Zod (via `shared/validation`)

## Commands

- `bun run dev` - Start with hot reload (port 3000)
- `bun run lint` - Run ESLint
- `bun run db:generate` - Generate migrations from schema
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:start` - Start PostgreSQL container
- `bun run db:stop` - Stop PostgreSQL container

## API Structure

- `/health` - Health check (no auth)
- `/api/*` - Protected routes (Clerk auth required)
- `/api/v1/sessions` - Training session endpoints

## Route Organization

Routes are grouped using Hono's route method:

```typescript
// routes/sessions.ts
const sessions = new Hono();
sessions.post("/", createSessionHandler);
sessions.get("/", listSessionsHandler);
// ...

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

### Key Patterns

1. **Input validation**: Assert request body as `unknown`, then use `safeParse`
2. **Error messages**: Use `parsed.error.message` for validation errors
3. **Response typing**: Create a typed `responseData` variable before returning

## Response Format

All API responses use a consistent format:

```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Use helpers from `src/utils/response.ts`:
- `successResponse(data)` - Wrap data in success format
- `errorResponse(code, message)` - Create error response
- `ErrorCodes` - Standard error codes (VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND, INTERNAL_ERROR)

## Auth Pattern

Routes under `/api/*` use Clerk middleware. The `requireUserId` helper throws an `HTTPException` that Hono automatically converts to a 401 response:

```typescript
import { requireUserId } from "../utils/auth";

export const myHandler = async (c: Context) => {
  const userId = requireUserId(c);  // Throws HTTPException(401) if not authenticated
  // Handle authenticated request - no try/catch needed for auth
};
```

## Database Schema

Tables are defined in `src/db/schema.ts`:
- `trainingSessions` - Training session records
- `sessionItems` - Items (successes, problems, questions) within sessions

## Environment Variables

See `src/utils/env.ts` for the list of environment variables.
