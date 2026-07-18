/**
 * @project AncestorTree
 * @file src/components/contributions/contribution-list-item.tsx
 * @description Single contribution row in the member list
 * @version 1.0.0
 * @updated 2026-07-18
 */

import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';
import { Badge } from '@components/ui';
import {
  CONTRIBUTION_CHANGE_TYPE_LABELS,
  CONTRIBUTION_STATUS_LABELS,
  CONTRIBUTION_STATUS_VARIANTS,
  getContributionFieldLabel,
} from '@constants';
import { cn } from '@lib/utils';
import type { Contribution, ContributionStatus, Person } from '@types';

const STATUS_ICONS: Record<ContributionStatus, LucideIcon> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

interface ContributionListItemProps {
  contribution: Contribution;
  person?: Person;
}

export function ContributionListItem({
  contribution,
  person,
}: ContributionListItemProps) {
  const StatusIcon = STATUS_ICONS[contribution.status];

  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <StatusIcon
        className={cn(
          'mt-0.5 h-5 w-5',
          contribution.status === 'approved' && 'text-green-600',
          contribution.status === 'rejected' && 'text-destructive',
          contribution.status === 'pending' && 'text-amber-600'
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium">
            {CONTRIBUTION_CHANGE_TYPE_LABELS[contribution.change_type]}
          </span>
          {person && (
            <Link
              href={`/people/${person.id}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {person.display_name}
            </Link>
          )}
          <Badge variant={CONTRIBUTION_STATUS_VARIANTS[contribution.status]}>
            {CONTRIBUTION_STATUS_LABELS[contribution.status]}
          </Badge>
        </div>
        {contribution.reason && (
          <p className="mb-2 text-sm text-muted-foreground">
            Lý do: {contribution.reason}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {Object.entries(contribution.changes).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {getContributionFieldLabel(key)}: {String(value)}
            </Badge>
          ))}
        </div>
        {contribution.review_notes && (
          <p className="mt-2 text-sm text-muted-foreground">
            Ghi chú duyệt: {contribution.review_notes}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date(contribution.created_at).toLocaleDateString('vi-VN')}
        </p>
      </div>
    </div>
  );
}
