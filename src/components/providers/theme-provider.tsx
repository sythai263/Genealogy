/**
 * @project AncestorTree
 * @file src/components/providers/theme-provider.tsx
 * @description Theme provider via @wrksz/themes (React 19–safe script injection)
 * @version 2.0.0
 * @updated 2026-07-28
 */

import { ThemeProvider as WrkszThemeProvider } from '@wrksz/themes/next';
import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <WrkszThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </WrkszThemeProvider>
  );
}
