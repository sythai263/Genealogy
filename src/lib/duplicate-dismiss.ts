/**
 * @project AncestorTree
 * @file src/lib/duplicate-dismiss.ts
 * @description localStorage helpers for dismissed duplicate pairs
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { DUPLICATE_DISMISSED_STORAGE_KEY } from '@constants';
import type { DuplicatePair } from '@types';

export function getDismissedPairs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(DUPLICATE_DISMISSED_STORAGE_KEY);
    return new Set(stored ? (JSON.parse(stored) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveDismissedPairs(pairs: Set<string>): void {
  localStorage.setItem(
    DUPLICATE_DISMISSED_STORAGE_KEY,
    JSON.stringify([...pairs])
  );
}

export function pairKey(pair: DuplicatePair): string {
  return [pair.personA.id, pair.personB.id].sort().join('_');
}
