/**
 * @project AncestorTree
 * @file src/components/shared/empty-state.tsx
 * @description Shared "no data yet" block used across list and grid views
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@components/ui';
import { cn } from '@lib';
import type { StateSurface } from '@types';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Use `plain` when already rendered inside a Card */
  surface?: StateSurface;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  surface = 'card',
  className,
}: EmptyStateProps) {
  const t = useTranslations('Common');
  const resolvedTitle = title ?? t('empty');

  const body = (
    <div className="py-12 text-center text-muted-foreground">
      {Icon && <Icon className="mx-auto mb-2 h-10 w-10 opacity-50" />}
      <p className="font-medium">{resolvedTitle}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
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
