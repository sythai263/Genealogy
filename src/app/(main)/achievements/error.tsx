/**
 * @project AncestorTree
 * @file src/app/(main)/achievements/error.tsx
 * @description Error boundary for achievements page
 * @version 1.0.0
 * @updated 2026-02-25
 */

'use client';

import { RouteError } from '@components/shared';

export default function AchievementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} title="Lỗi tải trang vinh danh" />;
}
