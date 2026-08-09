/**
 * @project AncestorTree
 * @file src/components/shared/route-error.tsx
 * @description Reusable error boundary component for route error.tsx files
 * @version 2.0.0
 * @updated 2026-08-09
 */

'use client';

import { ErrorState } from './error-state';
import type { RouteBoundaryErrorProps } from '@types';
import { PAGE_CONTAINER_CLASS } from '@constants';

interface RouteErrorProps extends RouteBoundaryErrorProps {
  title: string;
  defaultMessage?: string;
}

export function RouteError({
  error,
  reset,
  title,
  defaultMessage,
}: RouteErrorProps) {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <ErrorState
        error={error}
        title={title}
        description={defaultMessage}
        onRetry={reset}
      />
    </div>
  );
}
