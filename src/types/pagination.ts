/**
 * @project AncestorTree
 * @file src/types/pagination.ts
 * @description Shared pagination types for list queries
 * @version 1.0.0
 * @updated 2026-07-27
 */

export type ListPageSize = 20 | 30 | 50;

export interface PaginationParams {
  /** 1-based page index */
  page: number;
  pageSize: ListPageSize;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}
