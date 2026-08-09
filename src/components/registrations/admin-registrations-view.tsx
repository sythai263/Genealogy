/**
 * @project AncestorTree
 * @file src/components/registrations/admin-registrations-view.tsx
 * @description Admin view to review member registration requests
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Check,
  ClipboardList,
  Loader2,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
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
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  REGISTRATION_DEFAULT_STATUS_FILTER,
  REGISTRATION_STATUS_FILTER_ALL,
  REGISTRATION_STATUS_FILTER_VALUES,
  REGISTRATION_STATUS_MAP,
  type ListPageSize,
  type RegistrationStatusFilter,
} from '@constants';
import {
  useApproveRegistration,
  useDeleteRegistration,
  useRegistrations,
  useRejectRegistration,
  useResettablePage,
} from '@hooks';
import { getRelativeTime } from '@lib';
import type { MemberRegistration, RegistrationStatus } from '@types';

function registrationFilterLabel(
  value: RegistrationStatusFilter,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  if (value === REGISTRATION_STATUS_FILTER_ALL) {
    return t('registrations.filters.all');
  }
  return t(`registrations.filters.${value}` as 'registrations.filters.pending');
}

function registrationStatusLabel(
  status: RegistrationStatus,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  return t(`registrations.statuses.${status}` as 'registrations.statuses.pending');
}

export function AdminRegistrationsView() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const tPeople = useTranslations('People');
  const { isEditor, isAdmin } = useAuth();
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
  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();
  const deleteMutation = useDeleteRegistration();

  const [rejectTarget, setRejectTarget] = useState<MemberRegistration | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MemberRegistration | null>(
    null
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  if (!isEditor) {
    return <AccessDenied />;
  }

  async function handleApprove(reg: MemberRegistration) {
    try {
      await approveMutation.mutateAsync({ id: reg.id });
      toast.success(t('registrations.toasts.approveSuccess', { name: reg.full_name }));
    } catch {
      toast.error(t('registrations.toasts.approveError'));
    }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        id: rejectTarget.id,
        reason: rejectReason,
      });
      toast.success(
        t('registrations.toasts.rejectSuccess', { name: rejectTarget.full_name })
      );
      setRejectTarget(null);
      setRejectReason('');
    } catch {
      toast.error(t('registrations.toasts.rejectError'));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t('registrations.toasts.deleteSuccess'));
      setDeleteTarget(null);
    } catch {
      toast.error(t('registrations.toasts.deleteError'));
    }
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
          }>
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
              <Card key={reg.id}>
                <CardHeader className="px-4 pt-3 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{reg.full_name}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {reg.gender === 1 ? tCommon('male') : tCommon('female')}
                        {reg.birth_year &&
                          ` · ${t('registrations.birthYearPrefix', { year: reg.birth_year })}`}
                        {reg.birth_place && ` · ${reg.birth_place}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        REGISTRATION_STATUS_MAP[reg.status]?.variant ??
                        'outline'
                      }
                    >
                      {registrationStatusLabel(reg.status, t)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    {reg.parent_name && (
                      <div>
                        <span className="text-muted-foreground">
                          {t('registrations.fields.parent')}:{' '}
                        </span>
                        {reg.parent_name}
                      </div>
                    )}
                    {reg.generation && (
                      <div>
                        <span className="text-muted-foreground">
                          {tCommon('generation')}:{' '}
                        </span>
                        {reg.generation}
                      </div>
                    )}
                    {reg.chi && (
                      <div>
                        <span className="text-muted-foreground">
                          {tCommon('chi')}:{' '}
                        </span>
                        {reg.chi}
                      </div>
                    )}
                    {reg.relationship && (
                      <div>
                        <span className="text-muted-foreground">
                          {t('registrations.fields.relationship')}:{' '}
                        </span>
                        {reg.relationship}
                      </div>
                    )}
                    {reg.phone && (
                      <div>
                        <span className="text-muted-foreground">
                          {tPeople('form.phone')}:{' '}
                        </span>
                        {reg.phone}
                      </div>
                    )}
                    {reg.email && (
                      <div>
                        <span className="text-muted-foreground">
                          {tPeople('form.email')}:{' '}
                        </span>
                        {reg.email}
                      </div>
                    )}
                  </div>
                  {reg.notes && (
                    <p className="border-t pt-2 text-xs text-muted-foreground">
                      {reg.notes}
                    </p>
                  )}
                  {reg.reject_reason && (
                    <p className="border-t pt-2 text-xs text-red-500">
                      {t('registrations.rejectReasonLabel', {
                        reason: reg.reject_reason,
                      })}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {getRelativeTime(reg.created_at)}
                    </span>
                    <div className="flex gap-1.5">
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            onClick={() => void handleApprove(reg)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            {t('registrations.actions.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setRejectTarget(reg);
                              setRejectReason('');
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            {t('registrations.actions.reject')}
                          </Button>
                        </>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(reg)}
                          title={t('registrations.actions.delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      <AlertDialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('registrations.rejectDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('registrations.rejectDialog.description', {
                name: rejectTarget?.full_name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder={t('registrations.rejectDialog.reasonPlaceholder')}
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleReject()}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('registrations.actions.reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('registrations.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('registrations.deleteDialog.description', {
                name: deleteTarget?.full_name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('registrations.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
