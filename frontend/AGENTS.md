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

## Routing (TanStack Router)

File-based routing in `src/routes/`:
- `__root.tsx` - Root layout
- `_app.tsx` - App layout (header, nav) for authenticated routes
- `_app/` - Authenticated routes get app layout automatically
- `routeTree.gen.ts` - Auto-generated, do not edit

### Creating Routes

1. Create file in `src/routes/` (e.g., `my-route.tsx` for `/my-route`)
2. Use `createFileRoute` with the route path
3. For authenticated routes, place under `_app/` directory
4. Route tree regenerates automatically on file changes

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for authentication

## Code Style

### When to Use Effects

- **DO use Effects** to synchronize with external systems (APIs, browser APIs, third-party libraries)
- **DON'T use Effects** to transform data for rendering - calculate during render instead
- **DON'T use Effects** to handle user events - use event handlers
- **DON'T use Effects** for redundant state - derive from existing props/state
- For expensive calculations, use `useMemo` instead of Effects
- To reset state when props change, use the `key` prop or calculate during rendering
- When fetching data in Effects, always add cleanup logic to handle race conditions

