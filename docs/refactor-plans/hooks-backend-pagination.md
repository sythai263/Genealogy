---
project: AncestorTree
path: docs/refactor-plans/hooks-backend-pagination.md
type: refactor-plan
version: 2.0.0
updated: 2026-08-09
owner: frontend
status: done
---

# Refactor Plan: Hooks Backend Pagination

**Date:** 2026-08-09  
**Status:** Done — `pnpm tsc --noEmit`, `pnpm lint` (0 new problems) and `pnpm build` all pass  
**Approval:** User — "build all"

## Goal

Stop full-table fetches that filter/paginate/aggregate on the frontend. Align remaining hooks with existing `PaginatedResult` + `getPaginationRange` pattern.

## Batches

### A — Fund
- Paginate `getFundTransactions` / `getScholarships` (`page`, `pageSize`, `type?`, `year?`)
- Server-side balance via SQL RPC `get_fund_balance`
- Update hooks + fund views + `ListPagination`

### B — People lookups
- Add `getPeopleByIds` / `usePeopleByIds` for list name maps
- Replace mega-`<Select>` with `PersonCombobox`
- Stop calling `usePeople()` on list pages

### C — Spouses / profiles / stats
- Paginate + filter `getFamiliesMissingSpouse`
- `getProfilesByIds` / `useProfilesByIds` for author maps
- `getStats` / family counts via head `count` / aggregates (no full select)

### D — Bounds for remaining lists
- Notifications: real page/offset pagination; bell `limit(10)`
- Clan articles: optional page/range
- Comments/likes: scope to current page IDs where feasible
- Duplicates / eligible members: reduce full-table blast (paginate UI results; prefer lighter selects / reuse tree cache); document if full graph still required for algorithm

## Schema
- New migration `20260809000026_fund_balance_people_stats.sql`: `get_fund_balance()` and `get_people_stats()` RPCs, both with a client-side fallback if the RPC is absent
- No breaking table changes

## Outcome

Removed as dead code once every call site was migrated, so the full-table path can't
be reintroduced by accident:

| Hook | Data-layer function |
|---|---|
| `usePeople` | `getPeople` |
| `useProfiles` | `getProfiles` |
| `useFamilies` | `getFamilies` |
| `useUnverifiedProfiles` | `getUnverifiedProfiles` |

### Deliberate full fetches (kept)

- `getTreeData` — the tree view renders the whole graph; already cached with a 5 min `staleTime`.
- `useDuplicates` — pairwise duplicate detection needs the complete person set. Pagination is applied to the rendered result list instead.
- `getAllFundTransactions` / `getAllScholarships` — CSV export only, never used for rendering.
