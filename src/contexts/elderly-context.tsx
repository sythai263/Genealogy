/**
 * @project AncestorTree
 * @file src/contexts/elderly-context.tsx
 * @description Elderly mode context — larger fonts, simplified UI
 * @version 1.0.1
 * @updated 2026-08-09
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ElderlyContextValue {
  elderlyMode: boolean;
  toggleElderlyMode: () => void;
}

const ElderlyContext = createContext<ElderlyContextValue>({
  elderlyMode: false,
  toggleElderlyMode: () => {},
});

function applyElderlyClass(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add('elderly-mode');
  } else {
    document.documentElement.classList.remove('elderly-mode');
  }
}

export function ElderlyProvider({ children }: { children: React.ReactNode }) {
  // Always start false so SSR and the first client render match; hydrate from
  // localStorage after mount to avoid nav/menu hydration mismatches.
  const [elderlyMode, setElderlyMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('elderlyMode');
    if (stored === 'true') {
      setElderlyMode(true);
      applyElderlyClass(true);
    }
  }, []);

  const toggleElderlyMode = useCallback(() => {
    setElderlyMode((prev) => {
      const next = !prev;
      localStorage.setItem('elderlyMode', String(next));
      applyElderlyClass(next);
      return next;
    });
  }, []);

  return (
    <ElderlyContext.Provider value={{ elderlyMode, toggleElderlyMode }}>
      {children}
    </ElderlyContext.Provider>
  );
}

export function useElderly() {
  return useContext(ElderlyContext);
}
