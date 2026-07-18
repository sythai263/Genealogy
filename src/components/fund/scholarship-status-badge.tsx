/**
 * @project AncestorTree
 * @file src/components/fund/scholarship-status-badge.tsx
 * @description Status badge for scholarships
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Badge } from '@components/ui';
import { FUND_SCHOLARSHIP_STATUS_LABELS } from '@constants';
import { cn } from '@lib/utils';
import type { ScholarshipStatus } from '@types';

interface ScholarshipStatusBadgeProps {
  status: ScholarshipStatus;
}

const STATUS_CLASSES: Record<ScholarshipStatus, string> = {
  pending: '',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
};

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
    <Badge className={cn('text-xs', STATUS_CLASSES[status])}>
      {FUND_SCHOLARSHIP_STATUS_LABELS[status]}
    </Badge>
  );
}
