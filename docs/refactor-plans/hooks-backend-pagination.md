---
project: AncestorTree
path: docs/refactor-plans/hooks-backend-pagination.md
type: refactor-plan
version: 1.0.0
updated: 2026-08-09
owner: frontend
status: approved
---

# Refactor Plan: Hooks Backend Pagination

**Date:** 2026-08-09  
**Status:** In progress  
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
- New migration: `get_fund_balance()` RPC (and any spouses filter helpers if needed)
- No breaking table changes
