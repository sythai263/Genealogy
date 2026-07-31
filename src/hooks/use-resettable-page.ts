'use client';

import { useState } from 'react';

/**
 * Pagination page state that resets to 1 when `resetKey` changes.
 * Uses React's "adjust state during render" pattern instead of useEffect.
 */
export function useResettablePage(resetKey: string): [number, (page: number) => void] {
  const [page, setPage] = useState(1);
  const [prevKey, setPrevKey] = useState(resetKey);

  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setPage(1);
  }

  return [page, setPage];
}
