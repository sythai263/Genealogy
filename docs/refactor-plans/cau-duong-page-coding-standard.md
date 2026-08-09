---
project: AncestorTree
path: docs/refactor-plans/cau-duong-page-coding-standard.md
type: refactor-plan
version: 1.0.0
updated: 2026-08-09
owner: frontend
status: approved
---

# Refactor Plan: Cầu đương Public Page Coding Standard

**Date:** 2026-08-09  
**Status:** Completed  
**Approval:** User — "build"

## Goal

Apply `.cursor/rules/coding-standard.mdc` to `src/app/(main)/cau-duong/page.tsx` (~240).

## Structure

| File | Role |
|------|------|
| `components/cau-duong/cau-duong-view.tsx` | Client view (schedule + eligible members) |
| `app/(main)/cau-duong/page.tsx` | Thin Server Component |

## Notes

- Constants already in `@constants/cau-duong.ts`
- Keep separate from `AdminCauDuongView` (read-only public UI)
- No Supabase schema changes
