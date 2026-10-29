# Refactor Plan — shadcn/ui consolidation & SRP split

**Branch:** `refactor/using-shadcn`
**Status:** Completed (13 commits)
**Date:** 2026-10-29

## Goal

1. Prefer shadcn/ui + Tailwind over raw HTML controls throughout `src/`.
2. Break oversized files into single-responsibility components; reuse
   existing primitives instead of local clones.

## Rules established (follow in future code)

- **Views orchestrate, leaves act.** A `*-view.tsx` keeps fetching, filters,
  and pagination only. Row/card/dialog components own their own mutations,
  `isPending` state and toasts — no callback props for mutation plumbing.
- **Effect/state clusters → hooks.** Groups of coupled state + effects move
  into `src/hooks/use-*.ts` (e.g. `use-tree-person-search`, `use-tree-zoom`,
  `use-tree-pdf-export`, `use-tree-render`, `use-upcoming-events`).
- **Shared primitives over clones.** Person search → `PersonCombobox`
  (`excludeIds`, `deceasedOnly`, `emptyMessage`, `placeholder`, `disabled`,
  optional `label`). Gendered initial avatar → `PersonGenderAvatar`.
- **Constants → `@constants`.** Config objects (nav definitions, options)
  live in `src/constants/`, never inside `components/`.
- **Barrel discipline.** Every new file is exported from its folder
  `index.ts`; imports use the 2nd-level alias.

## Files split

| File | Before | After |
|---|---|---|
| `admin-users-view.tsx` | 1062 | ~250 (+ per-dialog files) |
| `admin-clan-settings-view.tsx` | 709 | 244 (+6 section cards) |
| `family-relations-card.tsx` | 760 | 239 (+4 files) |
| `person-form.tsx` | 752 | 118 (+field primitives + 4 sections) |
| `family-tree-canvas.tsx` | 604 | 93 (+html/d3 helpers + `useTreeRender`) |
| `admin-fund-view.tsx` | 594 | 143 (+2 dialogs + 2 rows) |
| `admin-contributions-view.tsx` | 452 | 180 (+review card) |
| `user-dialogs.tsx` | 453 | 5 files |
| `admin-cau-duong-view.tsx` | 441 | 164 (mutations → lists + pool dialog) |
| `admin-registrations-view.tsx` | 431 | 174 (+card +2 dialogs) |
| `admin-export-view.tsx` | 420 | 44 (+5 format cards) |
| `spouse-row.tsx` | 406 | 213 (+`SpouseSearchCombobox`) |
| `family-tree.tsx` | 396 | 285 (+3 hooks) |
| `app-sidebar.tsx` | 376 | 106 (+nav items → constants) |
| `admin-feed-view.tsx` | 337 | 171 (+card + dialog) |
| `events-view.tsx` | 330 | 223 (+`useUpcomingEvents`) |

## Verification

`pnpm lint` + `pnpm typecheck` clean after every batch.
