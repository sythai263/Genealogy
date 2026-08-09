/**
 * @project AncestorTree
 * @file src/components/shared/error-state.tsx
 * @description In-page error block for failed React Query requests
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@components/ui';
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
  title,
  description,
  onRetry,
  surface = 'card',
  className,
}: ErrorStateProps) {
  const t = useTranslations('Common');
  const resolvedTitle = title ?? t('errorTitle');
  const resolvedDescription =
    error?.message || description || t('errorFallback');

  const body = (
    <div className="py-12 text-center">
      <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
      <h2 className="mb-2 text-lg font-semibold">{resolvedTitle}</h2>
      <p className="mb-4 text-muted-foreground">{resolvedDescription}</p>
      {onRetry && <Button onClick={onRetry}>{t('retry')}</Button>}
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
