/**
 * @project AncestorTree
 * @file src/hooks/use-duplicates.ts
 * @description React Query hook for duplicate detection (client-side)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo } from 'react';
import { useTreeData } from './use-families';
import { findDuplicates } from '@lib';
import type { DuplicatePair } from '@types';

/**
 * Duplicate-detection algorithm needs the full tree graph (every person +
 * family link) to score name/parent/generation similarity pairwise — there
 * is no server-side filter that can narrow this down before the comparison
 * runs, so `useTreeData` (already cached, `staleTime: 5min`) stays a full
 * fetch. Pagination of the *results* (not the input data) is applied by the
 * consuming view (`AdminDuplicatesView`) instead of here.
 */
export function useDuplicates() {
  const { data: treeData, isLoading } = useTreeData();

  const duplicates = useMemo<DuplicatePair[]>(() => {
    if (!treeData) return [];
    return findDuplicates(treeData);
  }, [treeData]);

  return { data: duplicates, isLoading };
}
