/**
 * @project AncestorTree
 * @file src/components/shared/page-header.tsx
 * @description Shared page title block with optional icon, description and actions
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@lib';

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  icon: Icon,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {Icon && <Icon className="h-6 w-6" />}
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
