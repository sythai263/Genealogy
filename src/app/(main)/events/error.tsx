/**
 * @project AncestorTree
 * @file src/app/(main)/events/error.tsx
 * @description Error boundary for the (main)/events route
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { RouteError } from '@components/shared';
import type { RouteBoundaryErrorProps } from '@types';

export default function EventsError({ error, reset }: RouteBoundaryErrorProps) {
  return <RouteError error={error} reset={reset} titleKey="events" />;
}
