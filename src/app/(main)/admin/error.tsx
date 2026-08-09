/**
 * @project AncestorTree
 * @file src/app/(main)/admin/error.tsx
 * @description Error boundary for the (main)/admin route
 * @version 2.0.0
 * @updated 2026-08-09
 */

'use client';

import { RouteError } from '@components/shared';
import { ROUTE_ERROR_TITLES } from '@constants';
import type { RouteBoundaryErrorProps } from '@types';

export default function AdminDashboardError({ error, reset }: RouteBoundaryErrorProps) {
  return <RouteError error={error} reset={reset} title={ROUTE_ERROR_TITLES.adminDashboard} />;
}
