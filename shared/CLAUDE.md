# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Shared types, utilities, constants, and validation schemas consumed by both `frontend` and `backend`. See root `CLAUDE.md` for monorepo-level guidance.

## Commands

- `bun run lint` - Run ESLint
- `bun run typecheck` - Type-check

## Package Exports

Import using subpath exports:

- `shared/types` - TypeScript types and interfaces
- `shared/utils` - Utility functions
- `shared/constants` - Shared constants
- `shared/validation` - Zod validation schemas

## Validation Pattern

Schemas are defined in `validation/`, and types are inferred from them:

```typescript
// validation/sessions.ts
export const createSessionSchema = z.object({ ... });

// types/index.ts
import type { z } from "zod";
import type { createSessionSchema } from "../validation/sessions";
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
```

## Adding New Code

1. Add to the appropriate directory (`types/`, `utils/`, `constants/`, or `validation/`)
2. Export from the directory's `index.ts`
3. Import in frontend/backend via `shared/<subpath>`
