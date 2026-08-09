/**
 * @project AncestorTree
 * @file src/components/shared/loading-state.tsx
 * @description In-page loading skeleton for React Query driven sections
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { Skeleton } from '@components/ui';
import { PAGE_SKELETON_VARIANTS } from '@constants';
import { cn } from '@lib';
import type { PageSkeletonVariant } from '@types';

interface LoadingStateProps {
  variant?: PageSkeletonVariant;
  /** Override the block repeat count of the variant's last block group */
  rows?: number;
  className?: string;
}

/**
 * Same skeleton shapes as `PageSkeleton` but without the page container and
 * header bars — for use inside a view that already rendered its own header.
 */
export function LoadingState({ variant = 'list', rows, className }: LoadingStateProps) {
  const spec = PAGE_SKELETON_VARIANTS[variant];

  return (
    <div className={cn('space-y-4', className)}>
      {spec.blocks.map((block, blockIndex) => {
        const count =
          rows && blockIndex === spec.blocks.length - 1 ? rows : block.count;
        return (
          <div key={blockIndex} className={block.wrapperClassName}>
            {Array.from({ length: count }).map((_, itemIndex) => (
              <Skeleton key={itemIndex} className={block.className} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
