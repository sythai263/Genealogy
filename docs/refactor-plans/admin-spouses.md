# Refactor Plan: Admin Spouses (Coding Standard)

**Date:** 2026-08-09  
**Status:** Completed  
**Approval:** User — "build"

## Goal

Bring [`src/app/(main)/admin/spouses/page.tsx`](../../src/app/(main)/admin/spouses/page.tsx) into compliance with `.cursor/rules/coding-standard.mdc`:

- Thin Server Component page
- Single-responsibility client components under `components/spouses/`
- Shared types in `types/`, constants in `constants/`
- 2nd-level barrel imports only

## Files to modify / create

| Action | Path |
|--------|------|
| Create | `docs/refactor-plans/admin-spouses.md` |
| Create | `src/constants/spouses.ts` |
| Update | `src/constants/index.ts` |
| Update | `src/types/family.ts` (`FamilyMissingSpouse`) |
| Create | `src/types/spouse.ts` (`SpouseSavePayload`) |
| Update | `src/types/index.ts` |
| Update | `src/lib/supabase-data.ts` (import type from `@types`) |
| Create | `src/components/spouses/spouse-row.tsx` |
| Create | `src/components/spouses/admin-spouses-view.tsx` |
| Create | `src/components/spouses/index.ts` |
| Replace | `src/app/(main)/admin/spouses/page.tsx` (thin SC) |

## Component structure

```text
src/components/spouses/
├── index.ts                 # barrel
├── spouse-row.tsx           # one worklist row + search/create
└── admin-spouses-view.tsx   # filters, snapshot list, save orchestration

src/app/(main)/admin/spouses/page.tsx  # Server Component → AdminSpousesView
```

## Supabase schema

No database schema changes.

## Behavior preserved

- Search existing members (debounced advanced backend search) then link
- Or create new spouse from typed name + optional birth year
- Snapshot worklist; `targetFamilyId` on link; Enter advances focus
