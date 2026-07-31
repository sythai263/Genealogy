# Refactor Plan: Apply Coding Standard to All Files

**Date:** 2026-07-31  
**Status:** Completed (2026-07-31)  
**Approval:** User selected option A (Phases 1–5)

## Goal

Bring the entire `src/` tree into compliance with
`.cursor/rules/coding-standard.mdc`:

- 2nd-level absolute imports via feature barrels (`@components/{feature}`)
- Flat modules via root barrels (`@hooks`, `@lib`, `@constants`, `@types`, `@schemas`)
- No deep file imports, no deep relative paths
- Domain constants only under `src/constants/`
- ESLint enforcement to prevent regression

## Out of scope

- Splitting large files purely for SRP size
- Nesting flat `hooks/` into domain subfolders
- Restructuring `lib/supabase-data-*.ts` into nested folders
- Supabase schema changes (none)

## Component / module structure

```text
src/
├── components/{feature}/index.ts   # 2nd-level barrels (already present)
├── hooks/index.ts                  # flat hooks barrel
├── lib/index.ts                    # flat lib barrel
├── constants/index.ts              # domain constants
├── types/index.ts
└── schemas/index.ts
```

**Correct imports:**

| From | To |
|------|-----|
| `@/components/auth/login-form` | `@components/auth` |
| `@/hooks/use-people` | `@hooks` |
| `@/lib/utils` | `@lib` |
| `./constants` in UI | `@constants` |

**Forbidden:** `@components` (root-only), `@components/auth/login-form`, `../../..`

## Files to modify (categories)

1. **Quick wins:** `src/components/index.ts`, `src/hooks/index.ts`,
   `src/lib/validations/person.ts`, `person-form.tsx`, achievements/events constants
2. **~107 files** with deep `@/components/.../...` imports
3. **~80+ files** with deep `@hooks/use-*` / `@lib/*` imports
4. **~26 files** with UI-local `UPPER_SNAKE` constants → `src/constants/`
5. **`eslint.config.mjs`** — `no-restricted-imports`

## Supabase database schema

No changes.

## Verification

- `pnpm lint` — pass
- `pnpm exec tsc --noEmit` — pass
- Deep `@components/*/*`, `@hooks/use-*`, `@lib/*` imports removed (codemod: 195 files)
- ESLint `no-restricted-imports` enforces barrels going forward

## Done notes

- Script: `scripts/codemod-barrel-imports.mjs`
- New constants modules: `layout.ts`, `media.ts`, `registrations.ts`, `achievements.ts`
- Left as intentional exceptions: `ui/sidebar.tsx` SIDEBAR_* internals; `@/app/.../actions` server-action import
