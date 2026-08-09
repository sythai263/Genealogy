/**
 * @project AncestorTree
 * @file src/components/shared/route-error.tsx
 * @description Reusable error boundary component for route error.tsx files
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { ErrorState } from './error-state';
import type { RouteBoundaryErrorProps } from '@types';
import { PAGE_CONTAINER_CLASS } from '@constants';
import type { AppMessages } from '@messages/types';

export type RouteErrorKey = keyof AppMessages['Common']['routeErrors'];

type RouteErrorProps = RouteBoundaryErrorProps & {
  defaultMessage?: string;
} & (
  | { title: string; titleKey?: never }
  | { titleKey: RouteErrorKey; title?: never }
);

export function RouteError({
  error,
  reset,
  titleKey,
  title,
  defaultMessage,
}: RouteErrorProps) {
  const t = useTranslations('Common');
  const resolvedTitle = title ?? t(`routeErrors.${titleKey}`);

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <ErrorState
        error={error}
        title={resolvedTitle}
        description={defaultMessage}
        onRetry={reset}
      />
    </div>
  );
}
