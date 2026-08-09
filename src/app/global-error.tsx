/**
 * @project AncestorTree
 * @file src/app/global-error.tsx
 * @description Last-resort boundary for errors thrown in the root layout
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import {
  ROUTE_ERROR_TITLES,
  UI_ERROR_FALLBACK_MESSAGE,
  UI_RETRY_LABEL,
} from '@constants';
import type { RouteBoundaryErrorProps } from '@types';

/**
 * Replaces the whole document when the root layout fails, so it cannot rely on
 * providers, theming or shadcn primitives — plain markup only.
 */
export default function GlobalError({ error, reset }: RouteBoundaryErrorProps) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-xl font-semibold">{ROUTE_ERROR_TITLES.root}</h1>
          <p className="text-sm opacity-70">
            {error.message || UI_ERROR_FALLBACK_MESSAGE}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            {UI_RETRY_LABEL}
          </button>
        </div>
      </body>
    </html>
  );
}
