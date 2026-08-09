---
project: AncestorTree
path: docs/refactor-plans/admin-pages-batch-2-coding-standard.md
type: refactor-plan
version: 1.0.0
updated: 2026-08-09
owner: frontend
status: approved
---

# Refactor Plan: Admin Pages Batch 2 Coding Standard

**Date:** 2026-08-09  
**Status:** Completed  
**Approval:** User — "build"

## Goal

Apply `.cursor/rules/coding-standard.mdc` to:

- `admin/events/page.tsx` (~449)
- `admin/contributions/page.tsx` (~387)
- `admin/fund/page.tsx` (~378)
- `admin/documents/page.tsx` (~360)
- `admin/feed/page.tsx` (~299)
- `admin/import/page.tsx` (~248)
- `admin/charter/page.tsx` (~242)
- `admin/export/page.tsx` (~223)
- `admin/duplicates/page.tsx` (~203)

## Structure

| Feature | Components |
|---------|------------|
| events | `admin-events-view.tsx`, `event-form.tsx` |
| contributions | `admin-contributions-view.tsx` |
| fund | `admin-fund-view.tsx` |
| documents | `admin-documents-view.tsx`, `document-form.tsx` |
| feed | `admin-feed-view.tsx` |
| import | `admin-import-view.tsx` (new `@components/import`) |
| charter | `admin-charter-view.tsx`, `article-form.tsx` |
| export | `admin-export-view.tsx` (new `@components/export`) |
| duplicates | `admin-duplicates-view.tsx`, `score-bar.tsx`, `duplicate-person-card.tsx` (new `@components/duplicates`) |

Thin Server Component pages import from `@components/{feature}`.

## Constants / types / helpers

- Reuse existing `@constants` (events, documents, feed, contributions, charter, duplicates)
- Import max file size / step labels → `constants` if extracted
- Duplicates localStorage helpers → `lib` if shared
- No Supabase schema changes

## Reuse

- Fund: prefer existing `scholarship-status-badge` over inline `getStatusBadge`
- Documents: `formatFileSize` via `@lib` if already present
