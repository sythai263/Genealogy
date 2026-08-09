---
project: AncestorTree
path: docs/refactor-plans/api-page-standardization.md
type: refactor-plan
version: 1.0.0
updated: 2026-08-09
owner: frontend
status: done
---

# Refactor Plan: API Helpers & Page Error/Loading Standardization

**Date:** 2026-08-09
**Status:** Done — `pnpm tsc --noEmit` clean, `pnpm lint` 0 new problems, `pnpm build` passes
**Approval:** User — "helpers-only" response shape + "full" migration scope

## Goal

Remove duplicated API response/guard code and duplicated page loading/error UI.
Every API route returns the same flat `{ error }` shape through shared helpers,
and every route boundary + view state renders through shared components.

## Batches

### A — API helpers (`src/lib/api/`)

New 2nd-level barrel, imported as `@lib/api`. Deliberately **not** re-exported
from the flat `@lib` barrel so `next/server` and node `fs`/`path` stay out of
the client bundle; `eslint.config.mjs` carries a matching `!@lib/api` exemption.

| File | Exports |
|---|---|
| `responses.ts` | `apiOk`, `apiError`, `apiFile`, `toErrorMessage` |
| `handler.ts` | `withApiHandler(name, handler, clientMessage?)` |
| `guards.ts` | `isDesktopMode`, `guardDesktopOnly`, `guardWebOnly`, `requireCronSecret`, `requireRole` |
| `files.ts` | `resolveSafePath`, `mimeTypeForPath`, `validateUpload` |
| `supabase-admin.ts` | `createServiceRoleClient` |
| `supabase-fetch.ts` | `makeDockerAwareFetch`, `createRequestScopedClient`, `getAuthCookieName`, URL getters |

Backed by `src/constants/api.ts` (`API_STATUS`, `API_ERROR_MESSAGES`,
`MEDIA_EXT_MIME_TYPES`, `API_ADMIN_ROLES`) and `src/types/api.ts`
(`ApiErrorBody`, `ApiHandler`, `ApiRouteContext`, `AuthorizedRequester`,
`UploadValidationOptions`, `ApiFileOptions`).

All 6 routes migrated: `backup`, `backup/restore`, `cron`, `debug/auth`,
`export/gedcom`, `media/[...path]`. The media route's locally-defined
`guardDesktopOnly()` / `resolveSafePath()` and its 3x-repeated preamble are gone;
`/api/backup` no longer leaks raw error text to the client.

`src/proxy.ts` keeps its own `makeDockerAwareFetch` copy — middleware runs on a
runtime that cannot import the node builtins reachable through `@lib/api`.

### B — HTTP client (`src/services/http.ts`)

`requestJson<T>`, `requestBlob`, `downloadBlob` unwrap the flat `{ error }` body
and throw `Error(message)`. `services/backup.ts` dropped its local
`readErrorMessage()`.

### C — Shared page-state components (`@components/shared`)

`PageSkeleton`, `LoadingState`, `ErrorState`, `EmptyState`, `PageHeader`,
`QueryBoundary`, `AccessDenied`. `RouteError` now delegates to `ErrorState` and
keeps its existing public API plus an optional `description`.

Skeleton shapes live in `src/constants/ui-states.ts` as
`PAGE_SKELETON_VARIANTS` (`list | grid | table | detail | form | feed`), so no
component hardcodes skeleton geometry. Boundary titles live in
`src/constants/route-boundaries.ts` as `ROUTE_ERROR_TITLES`.

`ErrorState` / `EmptyState` / `QueryBoundary` accept `surface="plain"` for the
common case of rendering inside an existing `Card`.

### D — Route boundaries

All 43 routes now carry a generated, identical pair:

```tsx
export default function AdminUsersError({ error, reset }: RouteBoundaryErrorProps) {
  return <RouteError error={error} reset={reset} title={ROUTE_ERROR_TITLES.adminUsers} />;
}
```

```tsx
export default function AdminUsersLoading() {
  return <PageSkeleton variant="table" />;
}
```

Added where previously missing: group-level boundaries for `(auth)` and
`(landing)`, both files for `admin/cau-duong`, `admin/contributions`,
`admin/import-export`, `people/[id]`, `people/[id]/edit`, `people/new`, `setup`,
plus `loading.tsx` for `admin`, `admin/users`, `contributions`, `directory`,
`events`, `people`, `tree`. New `src/app/global-error.tsx`,
`src/app/not-found.tsx`, `src/app/(main)/people/[id]/not-found.tsx`.

Gone: the 3 files that copied `RouteError`'s JSX, the 6 Card variants that threw
away the `error` prop, the `<button className="underline">` retry links, the
`h-75`/`h-100` skeletons, and the `px-4 py-8` vs `p-4` container drift.

### E — View components

Inline skeleton/spinner/empty blocks replaced across the feed, notifications,
contributions (public + admin), achievements (public + admin), documents
(library + admin), events (view + list panel + admin), charter (public + admin),
registrations, spouses, users, people list, person detail, person edit, book,
fund (public + admin), stats, relationship and elderly-tree views.

The `if (!isEditor)` permission card was duplicated in 13 admin views; all now
render `<AccessDenied />`, with `admin-contributions-view` passing
`ACCESS_DENIED_ADMIN_MESSAGE`.

## Behaviour changes

- API error messages are now uniformly Vietnamese and sourced from
  `API_ERROR_MESSAGES`; previously they were a mix of Vietnamese and English.
- `/api/export/gedcom` desktop-mode rejection keeps status 400 but returns the
  shared `webOnly` message.
- Unexpected throws inside any route now log server-side under `[route-name]`
  and return a generic message instead of `err.message`.

## Pre-existing bugs (unchanged behaviour, flagged)

- `src/app/api/backup/route.ts`: `exportedData` is declared but never populated,
  so `exportedData[t].length` throws and every request 500s. The DB query step
  is missing. Preserved as-is; `withApiHandler` now turns the crash into a
  logged 500 with the `backupFailed` message.
- `src/app/api/backup/restore/route.ts`: the table-restore step was never
  written and the success path had no `return`. Because the typed handler must
  return a `Response`, this now returns an explicit
  `501 Not Implemented` rather than falling off the end of the function.

## Verification

```
pnpm tsc --noEmit   # clean
pnpm lint           # 5 errors, all pre-existing react-hooks/set-state-in-effect
pnpm build          # 59 pages generated, 6 API routes dynamic
```

Pre-existing lint errors are in `achievement-form.tsx`, `person-combobox.tsx`,
`spouse-row.tsx`, `elderly-context.tsx` and `use-people.ts` — none touched here.
