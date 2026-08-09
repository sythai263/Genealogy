/**
 * @project AncestorTree
 * @file src/components/shared/query-boundary.tsx
 * @description Collapses the loading / error / empty triad of a React Query view
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { PageSkeletonVariant, StateSurface } from '@types';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';

interface QueryBoundaryProps {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  /** Renders the empty block instead of children when true */
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  errorTitle?: string;
  skeletonVariant?: PageSkeletonVariant;
  skeletonRows?: number;
  /** Pass `plain` when the boundary already sits inside a Card */
  surface?: StateSurface;
  children: ReactNode;
}

export function QueryBoundary({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorTitle,
  skeletonVariant = 'list',
  skeletonRows,
  surface = 'card',
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <LoadingState variant={skeletonVariant} rows={skeletonRows} />;
  }

  if (isError || error) {
    return (
      <ErrorState
        error={error}
        title={errorTitle}
        onRetry={onRetry}
        surface={surface}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        surface={surface}
      />
    );
  }

  return <>{children}</>;
}
