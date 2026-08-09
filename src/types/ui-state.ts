/**
 * @project AncestorTree
 * @file src/types/ui-state.ts
 * @description Types for the shared loading / error / empty page-state components
 * @version 1.0.0
 * @updated 2026-08-09
 */

/** Layout presets used by `PageSkeleton` and `LoadingState` */
export type PageSkeletonVariant =
  | 'list'
  | 'grid'
  | 'table'
  | 'detail'
  | 'form'
  | 'feed';

/** One group of identically shaped skeleton blocks */
export interface SkeletonBlock {
  className: string;
  count: number;
  /** Wrapper class when the blocks should be laid out in a grid */
  wrapperClassName?: string;
}

/** Full recipe for one skeleton variant */
export interface SkeletonSpec {
  containerClassName: string;
  /** Title + subtitle bars rendered before the body blocks */
  withHeader: boolean;
  blocks: SkeletonBlock[];
}

/** Whether a state block wraps itself in a Card or renders bare */
export type StateSurface = 'card' | 'plain';

/** Props Next.js passes to every route-level `error.tsx` boundary */
export interface RouteBoundaryErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
