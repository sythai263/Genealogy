/**
 * @project AncestorTree
 * @file src/components/fund/scholarship-status-badge.tsx
 * @description Status badge for scholarships
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@components/ui';
import { FUND_SCHOLARSHIP_STATUS_CLASSES } from '@constants';
import { cn } from '@lib';
import type { ScholarshipStatus } from '@types';

interface ScholarshipStatusBadgeProps {
  status: ScholarshipStatus;
}

export function ScholarshipStatusBadge({
  status,
}: ScholarshipStatusBadgeProps) {
  const t = useTranslations('Fund');

  if (status === 'pending') {
    return (
      <Badge variant="outline" className="text-xs">
        {t('scholarshipStatuses.pending')}
      </Badge>
    );
  }

  return (
    <Badge className={cn('text-xs', FUND_SCHOLARSHIP_STATUS_CLASSES[status])}>
      {t(`scholarshipStatuses.${status}`)}
    </Badge>
  );
}
