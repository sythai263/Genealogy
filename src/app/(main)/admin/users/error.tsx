/**
 * @project AncestorTree
 * @file src/app/(main)/admin/users/error.tsx
 * @description Error boundary for the (main)/admin/users route
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { RouteError } from '@components/shared';
import type { RouteBoundaryErrorProps } from '@types';

export default function AdminUsersError({ error, reset }: RouteBoundaryErrorProps) {
  const t = useTranslations('Common');
  return <RouteError error={error} reset={reset} title={t('routeErrors.adminUsers')} />;
}
