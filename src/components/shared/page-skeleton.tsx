/**
 * @project AncestorTree
 * @file src/components/shared/page-skeleton.tsx
 * @description Shared route-level loading skeleton driven by variant presets
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { Skeleton } from '@components/ui';
import {
  PAGE_SKELETON_VARIANTS,
  SKELETON_SUBTITLE_CLASS,
  SKELETON_TITLE_CLASS,
} from '@constants';
import { cn } from '@lib';
import type { PageSkeletonVariant } from '@types';

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  /** Set to false when the page renders its own header while loading */
  withHeader?: boolean;
  className?: string;
}

export function PageSkeleton({
  variant = 'list',
  withHeader,
  className,
}: PageSkeletonProps) {
  const spec = PAGE_SKELETON_VARIANTS[variant];
  const showHeader = withHeader ?? spec.withHeader;

  return (
    <div className={cn(spec.containerClassName, className)}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className={SKELETON_TITLE_CLASS} />
          <Skeleton className={SKELETON_SUBTITLE_CLASS} />
        </div>
      )}
      {spec.blocks.map((block, blockIndex) => (
        <div key={blockIndex} className={block.wrapperClassName}>
          {Array.from({ length: block.count }).map((_, itemIndex) => (
            <Skeleton key={itemIndex} className={block.className} />
          ))}
        </div>
      ))}
    </div>
  );
}
