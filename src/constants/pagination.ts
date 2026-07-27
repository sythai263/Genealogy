/**
 * @project AncestorTree
 * @file src/constants/pagination.ts
 * @description Shared list pagination constants
 * @version 1.0.0
 * @updated 2026-07-27
 */

import type { ListPageSize } from '@types';

export const LIST_PAGE_SIZE_OPTIONS = [20, 30, 50] as const;
export type { ListPageSize };
export const LIST_DEFAULT_PAGE_SIZE: ListPageSize = 20;

export function isListPageSize(value: number): value is ListPageSize {
  return LIST_PAGE_SIZE_OPTIONS.some((size) => size === value);
}

/** Compute inclusive Supabase `.range()` bounds from 1-based page. */
export function getPaginationRange(page: number, pageSize: number) {
  const safePage = Math.max(page, 1);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to, page: safePage };
}
