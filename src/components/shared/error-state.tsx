/**
 * @project AncestorTree
 * @file src/components/shared/error-state.tsx
 * @description In-page error block for failed React Query requests
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@components/ui';
import {
  UI_ERROR_DEFAULT_TITLE,
  UI_ERROR_FALLBACK_MESSAGE,
  UI_RETRY_LABEL,
} from '@constants';
import { cn } from '@lib';
import type { StateSurface } from '@types';

interface ErrorStateProps {
  error?: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** Use `plain` when already rendered inside a Card */
  surface?: StateSurface;
  className?: string;
}

export function ErrorState({
  error,
  title = UI_ERROR_DEFAULT_TITLE,
  description,
  onRetry,
  surface = 'card',
  className,
}: ErrorStateProps) {
  const body = (
    <div className="py-12 text-center">
      <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-muted-foreground">
        {error?.message || description || UI_ERROR_FALLBACK_MESSAGE}
      </p>
      {onRetry && <Button onClick={onRetry}>{UI_RETRY_LABEL}</Button>}
    </div>
  );

  if (surface === 'plain') {
    return <div className={className}>{body}</div>;
  }

  return (
    <Card className={cn(className)}>
      <CardContent className="p-0">{body}</CardContent>
    </Card>
  );
}
