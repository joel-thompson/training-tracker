# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

React 19 + Vite application with TanStack Router. See root `CLAUDE.md` for monorepo-level guidance.

## Commands

- `bun run dev` - Start dev server (port 5173)
- `bun run build` - Type-check and build
- `bun run lint` - Run ESLint
- `bun run typecheck` - Type-check without building

## Routing (TanStack Router)

File-based routing in `src/routes/`:

- `__root.tsx` - Root layout
- `_app.tsx` - Authenticated app layout (uses `AppLayout` component)
- `_app/` - Authenticated routes (get app layout automatically)
- `routeTree.gen.ts` - Auto-generated, **do not edit**

### Route File Pattern

Simple route (no params/search):

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { GoalsPage } from "@/components/goals/GoalsPage";

export const Route = createFileRoute("/_app/goals")({
  component: GoalsPage,
});
```

Route with params/search — use a named wrapper to satisfy React hooks linting:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { EditSessionPage } from "@/components/sessions/EditSessionPage";

export const Route = createFileRoute("/_app/sessions/$id/edit")({
  component: EditSessionPageWrapper,
});

function EditSessionPageWrapper() {
  const { id } = Route.useParams();
  return <EditSessionPage sessionId={id} />;
}
```

- Route files should be minimal — they only configure routing and import page components
- Page components live in `src/components/<feature>/`
- Use named exports for page components

## Component Structure

```
src/components/
├── ui/          # Radix UI wrappers (Button, Card, etc.)
├── layout/      # AppLayout (header, nav, mobile bottom tab bar)
└── <feature>/   # Feature-specific page components
```

## React Query Hooks

Custom hooks live in `src/hooks/` organized by feature. Each feature directory contains a query key factory and one file per operation:

```
src/hooks/sessions/
  sessionKeys.ts       # Query key factory
  useListSessions.ts
  useCreateSession.ts
  useDeleteSession.ts
  ...
```

### Hook Convention

Always define `queryFn`/`mutationFn` logic as a separate async function above the hook:

```typescript
async function fetchGoal(id: string, token: string | null): Promise<Goal> {
  const response = await api(`/api/v1/goals/${id}`, { token });
  const result = (await response.json()) as ApiResponse<Goal>;
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

export function useGoal(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: goalKeys.byId(id),
    queryFn: async () => {
      const token = await getToken();
      return fetchGoal(id, token);
    },
    enabled: !!id,
  });
}
```

Rules:

- API function accepts all arguments including `token: string | null` as last parameter
- Hook's `queryFn`/`mutationFn` only calls `getToken()` and invokes the API function

## API Requests

Use the `api` utility from `src/utils/api.ts` for all backend requests — do not use raw `fetch` with manual URL construction:

```typescript
import { api } from "@/utils/api";

const response = await api("/api/v1/goals", {
  method: "POST",
  token,
  body: JSON.stringify(data),
});
```

## Effect Usage

- **DO** use Effects to synchronize with external systems (APIs, browser APIs, third-party libraries)
- **DON'T** use Effects to transform data for rendering — calculate during render instead
- **DON'T** use Effects to handle user events — use event handlers
- **DON'T** use Effects for state derivable from existing props/state
- Use `useMemo` for expensive calculations instead of Effects
- Always add cleanup logic in Effects that fetch data (handle race conditions)

## Environment Variables

See `src/utils/env.ts` for all required environment variables.
