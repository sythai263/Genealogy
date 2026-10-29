/**
 * @project AncestorTree
 * @file src/components/contributions/contribution-review-card.tsx
 * @description One contribution review card — status/change badges, proposed
 *              changes diff, reason, review note + approve/reject actions,
 *              reviewed-by footer, delete confirm (owns mutations + notes state)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  CheckCircle2,
  FileEdit,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
} from '@components/ui';
import {
  CONTRIBUTION_STATUS_VARIANTS,
  isChangeType,
  isContributionFieldKey,
} from '@constants';
import { useDeleteContribution, useReviewContribution } from '@hooks';
import type { Contribution, Person, Profile } from '@types';

function getPersonFieldDisplayValue(
  person: Person,
  key: string
): string | undefined {
  if (!isContributionFieldKey(key)) return undefined;
  const value = person[key];
  if (value === undefined || value === null) return undefined;
  return String(value);
}

interface ContributionReviewCardProps {
  contribution: Contribution;
  person: Person | undefined;
  author: Profile | undefined;
  reviewer: Profile | undefined;
}

export function ContributionReviewCard({
  contribution: c,
  person,
  author,
  reviewer,
}: ContributionReviewCardProps) {
  const t = useTranslations('Admin');
  const tContributions = useTranslations('Contributions');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { profile } = useAuth();
  const reviewContribution = useReviewContribution();
  const deleteContribution = useDeleteContribution();
  const [note, setNote] = useState('');

  function getStatusLabel(status: Contribution['status']): string {
    return tContributions(`statuses.${status}`);
  }

  function getChangeTypeLabel(changeType: string): string {
    if (isChangeType(changeType)) {
      return tContributions(`changeTypes.${changeType}`);
    }
    return changeType;
  }

  function getFieldLabel(key: string): string {
    if (isContributionFieldKey(key)) {
      return tContributions(`fields.${key}`);
    }
    return key;
  }

  const handleDelete = async () => {
    try {
      await deleteContribution.mutateAsync(c.id);
      toast.success(t('features.contributions.toasts.deleteSuccess'));
    } catch {
      toast.error(t('features.contributions.toasts.deleteError'));
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!profile) return;
    try {
      await reviewContribution.mutateAsync({
        id: c.id,
        status,
        reviewerId: profile.id,
        reviewNotes: note || undefined,
      });
      toast.success(
        status === 'approved'
          ? t('features.contributions.toasts.approved')
          : t('features.contributions.toasts.rejected')
      );
    } catch {
      toast.error(t('features.contributions.toasts.processError'));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={CONTRIBUTION_STATUS_VARIANTS[c.status]}>
              {getStatusLabel(c.status)}
            </Badge>
            <Badge variant="outline">
              {getChangeTypeLabel(c.change_type)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {new Date(c.created_at).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('features.contributions.deleteConfirm.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('features.contributions.deleteConfirm.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    {tCommon('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardTitle className="text-base mt-2">
          {person ? (
            <Link href={`/people/${person.id}`} className="hover:underline">
              {person.display_name}
            </Link>
          ) : (
            t('features.contributions.unknownPerson')
          )}
        </CardTitle>
        {author && (
          <CardDescription className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {t('features.contributions.proposedBy', {
              name: author.full_name || author.email,
            })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <FileEdit className="h-3.5 w-3.5" />
            {t('features.contributions.proposedChanges')}
          </div>
          <div className="bg-muted rounded-lg p-3 space-y-1">
            {Object.entries(c.changes).map(([key, val]) => {
              const currentValue = person
                ? getPersonFieldDisplayValue(person, key)
                : undefined;

              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="font-medium min-w-30">
                    {getFieldLabel(key)}:
                  </span>
                  <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">
                    {String(val)}
                  </span>
                  {currentValue !== undefined && (
                    <span className="text-muted-foreground text-xs">
                      {t('features.contributions.currentValue', {
                        value: currentValue,
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {c.reason && (
          <div className="text-sm">
            {tContributions('reasonPrefix', { reason: c.reason })}
          </div>
        )}

        {c.status === 'pending' && (
          <div className="border-t pt-4 space-y-3">
            <Textarea
              placeholder={t('features.contributions.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleReview('approved')}
                disabled={reviewContribution.isPending}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t('features.contributions.approve')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview('rejected')}
                disabled={reviewContribution.isPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t('features.contributions.reject')}
              </Button>
            </div>
          </div>
        )}

        {c.status !== 'pending' && (
          <div className="border-t pt-3 text-sm text-muted-foreground">
            {reviewer && (
              <span>
                {t('features.contributions.reviewedBy', {
                  name: reviewer.full_name || reviewer.email,
                })}
              </span>
            )}
            {c.reviewed_at && (
              <span>
                {' · '}
                {new Date(c.reviewed_at).toLocaleDateString(locale)}
              </span>
            )}
            {c.review_notes && (
              <p className="mt-1">
                {tContributions('reviewNotesPrefix', {
                  notes: c.review_notes,
                })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
