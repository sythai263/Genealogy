/**
 * @project AncestorTree
 * @file src/components/contributions/contribution-list-item.tsx
 * @description Single contribution row in the member list
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@components/ui';
import {
  CONTRIBUTION_STATUS_ICONS,
  CONTRIBUTION_STATUS_VARIANTS,
  isContributionFieldKey,
} from '@constants';
import { cn } from '@lib';
import type { Contribution, Person } from '@types';

interface ContributionListItemProps {
  contribution: Contribution;
  person?: Person;
}

export function ContributionListItem({
  contribution,
  person,
}: ContributionListItemProps) {
  const t = useTranslations('Contributions');
  const locale = useLocale();
  const StatusIcon = CONTRIBUTION_STATUS_ICONS[contribution.status];

  function fieldLabel(key: string): string {
    if (isContributionFieldKey(key)) {
      return t(`fields.${key}`);
    }
    return key;
  }

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
            {t(`changeTypes.${contribution.change_type}`)}
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
            {t(`statuses.${contribution.status}`)}
          </Badge>
        </div>
        {contribution.reason && (
          <p className="mb-2 text-sm text-muted-foreground">
            {t('reasonPrefix', { reason: contribution.reason })}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {Object.entries(contribution.changes).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {fieldLabel(key)}: {String(value)}
            </Badge>
          ))}
        </div>
        {contribution.review_notes && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t('reviewNotesPrefix', { notes: contribution.review_notes })}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date(contribution.created_at).toLocaleDateString(locale)}
        </p>
      </div>
    </div>
  );
}
