# Refactor Plan: Admin Pages Coding Standard

**Date:** 2026-08-09  
**Status:** Completed  
**Approval:** User — "build"

## Goal

Apply `.cursor/rules/coding-standard.mdc` to:

- `admin/settings/page.tsx` (~748)
- `admin/registrations/page.tsx` (~387)
- `admin/import-export/page.tsx` (~224)
- `admin/users/page.tsx` (~1319)

## Structure

| Feature | Components |
|---------|------------|
| registrations | `admin-registrations-view.tsx` |
| import-export | `import-export-view.tsx` |
| settings | `admin-clan-settings-view.tsx` + section cards |
| users | `admin-users-view.tsx`, `tree-mapping-dialog.tsx`, `person-name.tsx` |

Thin Server Component pages import from `@components/{feature}`.

## Constants / types

- `REGISTRATION_DEFAULT_STATUS_FILTER`, status filter options → `constants/registrations.ts`
- Media include options → `constants/backup.ts` (reuse `IncludeMedia` / `RestoreResult`)
- `USER_ROLE_META` (label + color + description) → `constants/users.ts`
- Clan settings helpers → `lib/clan-settings-helpers.ts`
- No Supabase schema changes

## Reuse

- Users tree mapping uses `@components/people` `PersonCombobox` (+ optional `hint`)
