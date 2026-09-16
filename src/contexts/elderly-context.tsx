/**
 * @project AncestorTree
 * @file src/contexts/elderly-context.tsx
 * @description Elderly mode context — larger fonts, simplified UI
 * @version 1.0.1
 * @updated 2026-08-09
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';

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

const elderlyModeListeners = new Set<() => void>();

function subscribeElderlyMode(callback: () => void) {
  elderlyModeListeners.add(callback);
  return () => {
    elderlyModeListeners.delete(callback);
  };
}

function getElderlyModeSnapshot() {
  return localStorage.getItem('elderlyMode') === 'true';
}

function getElderlyModeServerSnapshot() {
  return false;
}

function setStoredElderlyMode(enabled: boolean) {
  localStorage.setItem('elderlyMode', String(enabled));
  applyElderlyClass(enabled);
  elderlyModeListeners.forEach((listener) => listener());
}

export function ElderlyProvider({ children }: { children: React.ReactNode }) {
  // SSR/first client render always reads the server snapshot (false);
  // localStorage is hydrated through the external store to avoid nav/menu
  // hydration mismatches.
  const elderlyMode = useSyncExternalStore(
    subscribeElderlyMode,
    getElderlyModeSnapshot,
    getElderlyModeServerSnapshot
  );

  useEffect(() => {
    applyElderlyClass(elderlyMode);
  }, [elderlyMode]);

  const toggleElderlyMode = useCallback(() => {
    setStoredElderlyMode(!getElderlyModeSnapshot());
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
