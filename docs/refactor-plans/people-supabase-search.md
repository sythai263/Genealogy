---
project: AncestorTree
path: docs/refactor-plans/people-supabase-search.md
type: refactor-plan
version: 1.0.0
updated: 2026-07-19
owner: frontend
status: approved
---

# Refactor: People list search via Supabase

## Goal

Move people list search and filters from client-side Fuse.js to Supabase RPC so
filtering runs in PostgreSQL (accent-insensitive Vietnamese search + generation /
chi / living status).

## Files to modify

| File | Change |
|------|--------|
| `supabase/migrations/20260719000022_search_people_filtered.sql` | New RPCs |
| `src/types/person.ts` | `PeopleListFilters`, `PeopleFilterOptions` |
| `src/lib/supabase-data.ts` | `searchPeopleFiltered`, `getPeopleFilterOptions` |
| `src/hooks/use-people.ts` | Coding-standard imports + `usePeopleList` / `usePeopleFilterOptions` |
| `src/constants/people.ts` | Debounce / min-chars constants |
| `src/components/people/people-list-view.tsx` | Drop Fuse; use Supabase hooks |

## Component structure

```
PeopleListView
  ├── usePeopleFilterOptions()  → generations, chiValues
  ├── usePeopleList(filters)    → Person[] (debounced search)
  ├── useStats()
  └── PeopleFilters (controlled UI only)
```

## Supabase schema

### `search_people_filtered`

| Param | Type | Notes |
|-------|------|--------|
| `search_term` | `text` | Optional; min 2 chars when set |
| `p_generation` | `int` | Optional |
| `p_chi` | `int` | Optional |
| `p_is_living` | `boolean` | Optional |
| `ignore_acc` | `boolean` | Default `true`; unaccent + `đ`→`d` |

Returns `SETOF people`, ordered by generation, display_name. No LIMIT (list page).

### `get_people_filter_options`

Returns JSON: `{ generations: number[], chi_values: number[] }`.
