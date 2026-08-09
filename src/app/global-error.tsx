/**
 * @project AncestorTree
 * @file src/app/global-error.tsx
 * @description Last-resort boundary for errors thrown in the root layout
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useSyncExternalStore } from 'react';
import { localeCookieName, type AppLocale } from '@i18n/config';
import { en } from '@messages/en';
import { vi } from '@messages/vi';
import type { RouteBoundaryErrorProps } from '@types';

function readLocaleFromCookie(): AppLocale {
  if (typeof document === 'undefined') return 'vi';
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${localeCookieName}=`));
  const value = match?.split('=')[1];
  return value === 'en' ? 'en' : 'vi';
}

/**
 * Replaces the whole document when the root layout fails, so it cannot rely on
 * providers, theming or shadcn primitives — plain markup only.
 * Messages are read from the cookie + static message modules.
 */
export default function GlobalError({ error, reset }: RouteBoundaryErrorProps) {
  const locale = useSyncExternalStore(
    () => () => {},
    readLocaleFromCookie,
    () => 'vi' as AppLocale
  );
  const common = locale === 'en' ? en.Common : vi.Common;

  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-xl font-semibold">
            {common.routeErrors.root}
          </h1>
          <p className="text-sm opacity-70">
            {error.message || common.errorFallback}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            {common.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
