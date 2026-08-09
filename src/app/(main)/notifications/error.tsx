/**
 * @project AncestorTree
 * @file src/app/(main)/notifications/error.tsx
 * @description Error boundary for the (main)/notifications route
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { RouteError } from '@components/shared';
import type { RouteBoundaryErrorProps } from '@types';

export default function NotificationsError({ error, reset }: RouteBoundaryErrorProps) {
  return <RouteError error={error} reset={reset} titleKey="notifications" />;
}
