# AGENTS.md

React 19 + Vite application with TanStack Router. See root `AGENTS.md` for monorepo-level guidance.

## Commands

- `bun run dev` - Start dev server (port 5173)
- `bun run build` - Type-check and build
- `bun run preview` - Preview the production build
- `bun run typecheck` - Type-check without building
- `bun run test` - Run all tests
- `bun run test src/path/to/file.test.ts` - Run a single test file (use `bun run test`, not `bun test`)

Repo-wide linting runs from the root with `bun run lint`.

## Routing

File-based routing lives in `src/routes/`.

- Keep route files minimal.
- Put page components in `src/components/<feature>/`.
- Do not edit `routeTree.gen.ts` by hand.

## React Query Hooks

Custom hooks live in `src/hooks/` organized by feature.

Rules:

- Define API request logic as a separate async function above the hook.
- Pass `token: string | null` into API helpers as the last argument.
- Keep hook bodies focused on token lookup and query/mutation wiring.

## API Requests

Use the `api` helper from `src/utils/api.ts` for backend requests instead of raw `fetch`.

## Effect Usage

- Use Effects for external synchronization only.
- Do not use Effects for derivable render state.
- Do not use Effects for user events.
- Add cleanup logic when an Effect performs async work.

## Environment Variables

See `src/utils/env.ts` for all required environment variables.
