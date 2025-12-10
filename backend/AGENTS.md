# Backend

Hono API server running on Bun.

## Tech Stack
 
- Framework: Hono
- Auth: Clerk (`@hono/clerk-auth`)

## Commands

- `bun run dev` - Start with hot reload (port 3000)
- `bun run lint` - Run ESLint

## API Structure

- `/health` - Health check (no auth)
- `/api/*` - Protected routes (Clerk auth required)

## Handlers Pattern

Route handlers are separated from route definitions. Handlers live in `src/handlers/` and are imported into `index.ts`:

```typescript
import { myHandler } from "./handlers/myHandler";

app.get("/myEndpoint", myHandler);
```

Each handler receives a Hono `Context` and returns a response:

```typescript
import type { Context } from "hono";

export const myHandler = (c: Context) => {
  return c.json({ message: "Hello" });
};
```

## Auth Pattern

Routes under `/api/*` use Clerk middleware:

```typescript
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

app.use("/api/*", clerkMiddleware());

app.get("/api/example", (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // Handle authenticated request
});
```

## Environment Variables

See `src/utils/env.ts` for the list of environment variables.

