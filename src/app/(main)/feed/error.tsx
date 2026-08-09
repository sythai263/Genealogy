/**
 * @project AncestorTree
 * @file src/app/(main)/feed/error.tsx
 * @description Error boundary for the (main)/feed route
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { RouteError } from '@components/shared';
import type { RouteBoundaryErrorProps } from '@types';

export default function FeedError({ error, reset }: RouteBoundaryErrorProps) {
  return <RouteError error={error} reset={reset} titleKey="feed" />;
}
