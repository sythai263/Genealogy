/**
 * @project AncestorTree
 * @file src/components/fund/scholarship-status-badge.tsx
 * @description Status badge for scholarships
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Badge } from '@components/ui';
import { FUND_SCHOLARSHIP_STATUS_CLASSES, FUND_SCHOLARSHIP_STATUS_LABELS } from '@constants';
import { cn } from '@lib';
import type { ScholarshipStatus } from '@types';

interface ScholarshipStatusBadgeProps {
  status: ScholarshipStatus;
}

export function ScholarshipStatusBadge({
  status,
}: ScholarshipStatusBadgeProps) {
  if (status === 'pending') {
    return (
      <Badge variant="outline" className="text-xs">
        {FUND_SCHOLARSHIP_STATUS_LABELS.pending}
      </Badge>
    );
  }

  return (
    <Badge className={cn('text-xs', FUND_SCHOLARSHIP_STATUS_CLASSES[status])}>
      {FUND_SCHOLARSHIP_STATUS_LABELS[status]}
    </Badge>
  );
}
