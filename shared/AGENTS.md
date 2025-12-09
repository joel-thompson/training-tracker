# Shared

Shared types, utilities, and constants for frontend and backend.

## Structure

```
src/
  types/index.ts     - Export all types
  utils/index.ts     - Export all utilities
  constants/index.ts - Export all constants
```

## Commands

- `bun run lint` - Run ESLint

## Package Exports

Import using subpath exports:
- `shared/types` - TypeScript types and interfaces
- `shared/utils` - Utility functions
- `shared/constants` - Shared constants

## Adding New Code

1. Add to appropriate directory (`types/`, `utils/`, or `constants/`)
2. Export from the directory's `index.ts`
3. Import in frontend/backend via `shared/<subpath>`

