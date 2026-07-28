/**
 * @project AncestorTree
 * @file src/components/providers/theme-provider.tsx
 * @description next-themes provider for light / dark / system preference
 * @version 2.1.0
 * @updated 2026-07-28
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

// next-themes injects an inline <script> to prevent theme flicker.
// React 19 warns about script tags inside components — false positive for SSR.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag')
    ) {
      return;
    }
    orig.apply(console, args);
  };
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
