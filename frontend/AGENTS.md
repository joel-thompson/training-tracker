# Frontend

React 19 + Vite application with TanStack Router.

## Tech Stack

- UI: Tailwind CSS, Radix UI, Lucide icons
- Network requests: TanStack Query
- Auth: Clerk (`@clerk/clerk-react`)

## Commands

- `bun run dev` - Start dev server (port 5173)
- `bun run build` - Type check and build
- `bun run lint` - Run ESLint

## Component Structure

Page components are organized by feature in `src/components/`:

```
src/components/
├── ui/                    # shadcn/ui components (Button, Card, etc.)
├── layout/                # Layout components
│   └── AppLayout.tsx      # Main app layout (header, nav, auth, mobile bottom tab bar)
├── home/                  # Home/dashboard page
├── sessions/              # Session management pages
├── history/               # Training history page
├── week/                  # Week view page
├── goals/                 # Goals management page
├── stats/                 # Statistics/analytics page
├── reviews/               # Review/reflection pages
├── settings/              # Settings page
├── welcome/               # Welcome page
├── auth/                  # Authentication pages
└── marketing/             # Public marketing pages
```

## React Query Hooks

Custom hooks for API data fetching are in `src/hooks/`. Hooks are organized by feature in subdirectories:

Example:
```
src/hooks/
└── sessions/                # Session API hooks
    ├── sessionKeys.ts       # Query key factory for session cache management
    ├── useListSessions.ts  # List sessions with infinite query pagination
    ├── useSession.ts       # Fetch single session by ID
    ├── useSessionDates.ts  # Fetch all training dates
    ├── useCreateSession.ts # Create new session
    ├── useUpdateSession.ts # Update session
    ├── useDeleteSession.ts # Soft delete session
    ├── useRestoreSession.ts # Restore deleted session
    ├── useAddSessionItem.ts # Add item to session
    ├── useUpdateSessionItem.ts # Update session item
    └── useDeleteSessionItem.ts # Delete session item
```

When creating a new hook, follow the pattern above.

### Component Conventions

- Page components live in feature folders (e.g., `components/sessions/NewSessionPage.tsx`)
- Route files (`src/routes/`) should be minimal - they only configure routing and import page components
- For routes with params/search, pass them as props from the route component
- Use named exports for page components (e.g., `export function HomePage()`)

## Routing (TanStack Router)

File-based routing in `src/routes/`:
- `__root.tsx` - Root layout
- `_app.tsx` - App layout wrapper (uses `AppLayout` component)
- `_app/` - Authenticated routes get app layout automatically
- `routeTree.gen.ts` - Auto-generated, do not edit

### Creating Routes

1. Create file in `src/routes/` (e.g., `my-route.tsx` for `/my-route`)
2. Use `createFileRoute` with the route path
3. Import and use the corresponding page component from `src/components/`
4. For authenticated routes, place under `_app/` directory
5. Route tree regenerates automatically on file changes

### Route File Pattern

Simple route (no params/search):
```tsx
import { createFileRoute } from "@tanstack/react-router";
import { GoalsPage } from "@/components/goals/GoalsPage";

export const Route = createFileRoute("/_app/goals")({
  component: GoalsPage,
});
```

Route with params/search (use named wrapper to satisfy React hooks linting):
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

## Environment Variables

See `src/utils/env.ts` for the list of environment variables.

## Code Style

### Hook Conventions

For TanStack Query hooks (`useQuery`, `useMutation`, `useInfiniteQuery`), always define the `queryFn`/`mutationFn` logic as a separate async function above the hook:

```typescript
// API function defined above the hook
async function fetchGoal(id: string, token: string | null): Promise<Goal> {
  const response = await api(`/api/v1/goals/${id}`, { token });
  const result = (await response.json()) as ApiResponse<Goal>;
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}

// Hook calls the API function
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

**Rules:**
- Always define `queryFn`/`mutationFn` logic as a separate async function above the hook
- API function should accept all arguments including `token: string | null` as the last parameter
- Hook's `queryFn`/`mutationFn` should only call `getToken()` and invoke the API function
- This pattern improves testability, reusability, and consistency across all hooks

### When to Use Effects

- **DO use Effects** to synchronize with external systems (APIs, browser APIs, third-party libraries)
- **DON'T use Effects** to transform data for rendering - calculate during render instead
- **DON'T use Effects** to handle user events - use event handlers
- **DON'T use Effects** for redundant state - derive from existing props/state
- For expensive calculations, use `useMemo` instead of Effects
- To reset state when props change, use the `key` prop or calculate during rendering
- When fetching data in Effects, always add cleanup logic to handle race conditions

