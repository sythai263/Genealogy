/**
 * @project AncestorTree
 * @file src/components/registrations/admin-registrations-view.tsx
 * @description Admin view to review member registration requests —
 *              orchestrates status filter, search, paged list; cards and
 *              dialogs live in sibling components
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ClipboardList, Search, UserPlus } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  REGISTRATION_DEFAULT_STATUS_FILTER,
  REGISTRATION_STATUS_FILTER_ALL,
  REGISTRATION_STATUS_FILTER_VALUES,
  type ListPageSize,
  type RegistrationStatusFilter,
} from '@constants';
import { useRegistrations, useResettablePage } from '@hooks';
import type { MemberRegistration } from '@types';
import { RegistrationCard } from './registration-card';
import {
  DeleteRegistrationDialog,
  RejectRegistrationDialog,
} from './registration-dialogs';

function registrationFilterLabel(
  value: RegistrationStatusFilter,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  if (value === REGISTRATION_STATUS_FILTER_ALL) {
    return t('registrations.filters.all');
  }
  return t(`registrations.filters.${value}` as 'registrations.filters.pending');
}

export function AdminRegistrationsView() {
  const t = useTranslations('Admin');
  const { isEditor } = useAuth();
  const [statusFilter, setStatusFilter] = useState<RegistrationStatusFilter>(
    REGISTRATION_DEFAULT_STATUS_FILTER
  );
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(
    `${statusFilter}|${search}|${pageSize}`
  );

  const { data, isLoading } = useRegistrations({
    status:
      statusFilter === REGISTRATION_STATUS_FILTER_ALL
        ? undefined
        : statusFilter,
    search: search || undefined,
    page,
    pageSize,
  });

  const [rejectTarget, setRejectTarget] = useState<MemberRegistration | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<MemberRegistration | null>(
    null
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  if (!isEditor) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="h-6 w-6" />
          {t('registrations.title')}
        </h1>
        <p className="text-muted-foreground">{t('registrations.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('registrations.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as RegistrationStatusFilter)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGISTRATION_STATUS_FILTER_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {registrationFilterLabel(value, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyIcon={UserPlus}
        emptyTitle={
          statusFilter === 'pending'
            ? t('registrations.emptyPending')
            : t('registrations.noResults')
        }
        skeletonRows={3}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((reg) => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                onReject={setRejectTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={t('registrations.countLabel')}
          />
        </div>
      </QueryBoundary>

      <RejectRegistrationDialog
        registration={rejectTarget}
        onClose={() => setRejectTarget(null)}
      />
      <DeleteRegistrationDialog
        registration={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
