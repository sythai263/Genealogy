/**
 * @project AncestorTree
 * @file src/components/contributions/admin-contributions-view.tsx
 * @description Admin view to review contributions — orchestrates status
 *              filter, paged list and per-card review UI
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
import {
  Button,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
import {
  useContributions,
  usePendingContributionsCount,
  usePeopleByIds,
  useProfilesByIds,
  useResettablePage,
} from '@hooks';
import type { ContributionStatus } from '@types';
import { ContributionReviewCard } from './contribution-review-card';

export function AdminContributionsView() {
  const t = useTranslations('Admin');
  const tContributions = useTranslations('Contributions');
  const tCommon = useTranslations('Common');
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
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

  if (!isAdmin) {
    return (
      <AccessDenied description={tCommon('accessDenied.adminMessage')} />
    );
  }

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
        isEmpty={items.length === 0}
        emptyIcon={ClipboardList}
        emptyTitle={
          statusFilter === 'pending'
            ? t('features.contributions.noPending')
            : t('features.contributions.empty')
        }
        skeletonRows={3}
      >
        <div className="space-y-4">
          {items.map((c) => (
            <ContributionReviewCard
              key={c.id}
              contribution={c}
              person={people?.find((p) => p.id === c.target_person)}
              author={profiles?.find((p) => p.id === c.author_id)}
              reviewer={
                c.reviewed_by
                  ? profiles?.find((p) => p.id === c.reviewed_by)
                  : undefined
              }
            />
          ))}
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
