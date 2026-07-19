---
project: AncestorTree
path: docs/refactor-plans/people-supabase-search.md
type: refactor-plan
version: 1.2.0
updated: 2026-07-19
owner: frontend
status: approved
---

# Refactor: People list search via Supabase

## Goal

Move people list search and filters from client-side Fuse.js to Supabase RPC so
filtering runs in PostgreSQL (accent-insensitive Vietnamese search + generation /
chi / living status). List loads **paginated** pages only (20 / 30 / 50) using
**Supabase/PostgREST** `.range()` + `count: 'exact'` — not LIMIT/OFFSET in SQL.

## Files to modify

| File | Change |
|------|--------|
| `supabase/migrations/20260719000022_search_people_filtered.sql` | Search RPC (SETOF) |
| `supabase/migrations/20260719000023_search_people_filtered_pagination.sql` | Ensure SETOF, no SQL paging |
| `src/types/person.ts` | `PeopleListFilters`, `PeopleListResult`, `PeopleFilterOptions` |
| `src/lib/supabase-data.ts` | `searchPeopleFiltered` with `.range()` |
| `src/hooks/use-people.ts` | `usePeopleList` / `usePeopleFilterOptions` |
| `src/constants/people.ts` | Debounce + page size options |
| `src/components/people/people-list-view.tsx` | Filters + pagination UI |
| `src/components/people/people-pagination.tsx` | Page size + prev/next |

## Component structure

```
PeopleListView
  ├── usePeopleFilterOptions()  → generations, chiValues
  ├── usePeopleList(filters)    → { items, total } (debounced + paginated)
  ├── useStats()
  ├── PeopleFilters
  └── PeoplePagination (top + bottom)
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

Returns `SETOF people` (search/filter only — **no** LIMIT/OFFSET).

### Pagination (data layer)

```ts
supabase
  .rpc('search_people_filtered', args, { count: 'exact' })
  .range(from, to)
```

### `get_people_filter_options`

Returns JSON: `{ generations: number[], chi_values: number[] }`.
