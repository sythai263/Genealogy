/**
 * @project AncestorTree
 * @file src/app/(main)/people/[id]/loading.tsx
 * @description Loading skeleton for the (main)/people/[id] route
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { PageSkeleton } from '@components/shared';

export default function PersonDetailLoading() {
  return <PageSkeleton variant="detail" />;
}
