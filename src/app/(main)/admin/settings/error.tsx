/**
 * @project AncestorTree
 * @file src/app/(main)/admin/settings/error.tsx
 * @description Error boundary for the (main)/admin/settings route
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { RouteError } from '@components/shared';
import type { RouteBoundaryErrorProps } from '@types';

export default function AdminSettingsError({ error, reset }: RouteBoundaryErrorProps) {
  const t = useTranslations('Common');
  return <RouteError error={error} reset={reset} title={t('routeErrors.adminSettings')} />;
}
