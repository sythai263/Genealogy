/**
 * @project AncestorTree
 * @file src/components/contributions/admin-contributions-view.tsx
 * @description Admin view to review and approve/reject contributions
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileEdit,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  CONTRIBUTION_STATUS_VARIANTS,
  isChangeType,
  isContributionFieldKey,
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useContributions,
  useDeleteContribution,
  usePendingContributionsCount,
  usePeopleByIds,
  useProfilesByIds,
  useResettablePage,
  useReviewContribution,
} from '@hooks';
import type { Contribution, ContributionStatus, Person } from '@types';

function getPersonFieldDisplayValue(person: Person, key: string): string | undefined {
  if (!isContributionFieldKey(key)) return undefined;
  const value = person[key];
  if (value === undefined || value === null) return undefined;
  return String(value);
}

export function AdminContributionsView() {
  const t = useTranslations('Admin');
  const tContributions = useTranslations('Contributions');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { profile, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [pageSize, setPageSize] = useState<ListPageSize>(
    LIST_DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useResettablePage(`${statusFilter}|${pageSize}`);

  const listStatus =
    statusFilter === 'all' ? undefined : (statusFilter as ContributionStatus);
  const { data, isLoading } = useContributions({
    status: listStatus,
    page,
    pageSize,
  });
  const { data: pendingCount = 0 } = usePendingContributionsCount();
  const reviewContribution = useReviewContribution();
  const deleteContribution = useDeleteContribution();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((c) => c.target_person).filter(Boolean))],
    [items]
  );
  const profileIds = useMemo(
    () => [
      ...new Set(
        items.flatMap((c) =>
          [c.author_id, c.reviewed_by].filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          )
        )
      ),
    ],
    [items]
  );
  const { data: people } = usePeopleByIds(personIds);
  const { data: profiles } = useProfilesByIds(profileIds);

  function getStatusLabel(status: ContributionStatus): string {
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

  if (!isAdmin) {
    return (
      <AccessDenied description={tCommon('accessDenied.adminMessage')} />
    );
  }

  const filteredContributions = items;

  const handleDelete = async (c: Contribution) => {
    try {
      await deleteContribution.mutateAsync(c.id);
      toast.success(t('features.contributions.toasts.deleteSuccess'));
    } catch {
      toast.error(t('features.contributions.toasts.deleteError'));
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (!profile) return;
    try {
      await reviewContribution.mutateAsync({
        id,
        status,
        reviewerId: profile.id,
        reviewNotes: reviewNotes[id],
      });
      toast.success(
        status === 'approved'
          ? t('features.contributions.toasts.approved')
          : t('features.contributions.toasts.rejected')
      );
      setReviewNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      toast.error(t('features.contributions.toasts.processError'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('dashboard.title')}
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <ClipboardList className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t('features.contributions.title')}
            </h1>
            <p className="text-muted-foreground">
              {pendingCount > 0
                ? t('features.contributions.pendingBanner', {
                    count: pendingCount,
                  })
                : t('features.contributions.noPending')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              {tContributions('statuses.pending')} ({pendingCount})
            </SelectItem>
            <SelectItem value="approved">
              {tContributions('statuses.approved')}
            </SelectItem>
            <SelectItem value="rejected">
              {tContributions('statuses.rejected')}
            </SelectItem>
            <SelectItem value="all">{tCommon('all')}</SelectItem>
          </SelectContent>
        </Select>
        <CardDescription>
          {isLoading
            ? t('features.contributions.loading')
            : t('features.contributions.totalCount', { count: total })}
        </CardDescription>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={filteredContributions.length === 0}
        emptyIcon={ClipboardList}
        emptyTitle={
          statusFilter === 'pending'
            ? t('features.contributions.noPending')
            : t('features.contributions.empty')
        }
        skeletonRows={3}
      >
        <div className="space-y-4">
          {filteredContributions.map((c) => {
            const person = people?.find((p) => p.id === c.target_person);
            const author = profiles?.find((p) => p.id === c.author_id);
            const reviewer = c.reviewed_by
              ? profiles?.find((p) => p.id === c.reviewed_by)
              : undefined;

            return (
              <Card key={c.id}>
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
                              {t(
                                'features.contributions.deleteConfirm.description'
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {tCommon('cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(c)}
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
                      <Link
                        href={`/people/${person.id}`}
                        className="hover:underline"
                      >
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
                          <div
                            key={key}
                            className="flex items-center gap-2 text-sm"
                          >
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
                        placeholder={t(
                          'features.contributions.notePlaceholder'
                        )}
                        value={reviewNotes[c.id] || ''}
                        onChange={(e) =>
                          setReviewNotes((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(c.id, 'approved')}
                          disabled={reviewContribution.isPending}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {t('features.contributions.approve')}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReview(c.id, 'rejected')}
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
          })}
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={t('features.contributions.countLabel')}
          />
        </div>
      </QueryBoundary>
    </div>
  );
}
