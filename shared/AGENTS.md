# Shared

Shared types, utilities, constants, and validation schemas for frontend and backend.

## Structure

```
src/
  types/              - TypeScript types
    api.ts            - API response wrapper types
    sessions.ts       - Session-related types
    testing.ts        - Test endpoint types
    index.ts          - Re-export all types
  utils/index.ts      - Export all utilities
  constants/index.ts  - Export all constants
  validation/         - Zod validation schemas
    sessions.ts       - Session-related schemas
    index.ts          - Export all validation
```

## Commands

- `bun run lint` - Run ESLint

## Package Exports

Import using subpath exports:
- `shared/types` - TypeScript types and interfaces
- `shared/utils` - Utility functions
- `shared/constants` - Shared constants
- `shared/validation` - Zod validation schemas

## Validation Pattern

Validation schemas are defined with Zod in `validation/`. Types are inferred from schemas:

```typescript
// In validation/sessions.ts
export const createSessionSchema = z.object({ ... });

// In types/index.ts
import type { z } from "zod";
import type { createSessionSchema } from "../validation/sessions";
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
```

## Adding New Code

1. Add to appropriate directory (`types/`, `utils/`, `constants/`, or `validation/`)
2. Export from the directory's `index.ts`
3. Import in frontend/backend via `shared/<subpath>`
