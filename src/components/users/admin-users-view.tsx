/**
 * @project AncestorTree
 * @file src/components/users/admin-users-view.tsx
 * @description Admin user management — orchestrates filters, selection and
 *              dialogs; table/bulk-bar/dialogs live in sibling components
 *              (FR-507~509)
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  UserCog,
  Users,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import { EmptyState, ListPagination, QueryBoundary } from '@components/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
import {
  useProfilesPage,
  useResettablePage,
  useUnverifiedProfilesCount,
  useVerifyUser,
} from '@hooks';
import type { Profile, UserRole } from '@types';
import { BulkActionBar } from './bulk-action-bar';
import { RoleLegendCard } from './role-legend-card';
import { TreeMappingDialog } from './tree-mapping-dialog';
import {
  BulkDeleteDialog,
  BulkSuspendDialog,
  DeleteUserDialog,
  RoleChangeDialog,
  SuspendUserDialog,
} from './user-dialogs';
import { UsersTable } from './users-table';

export function AdminUsersView() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const tLayout = useTranslations('Layout');
  const { profile: currentProfile } = useAuth();
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);
  const [pageSize, setPageSize] = useState<ListPageSize>(
    LIST_DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useResettablePage(
    `${showUnverifiedOnly}|${pageSize}`
  );

  const { data, isLoading, error } = useProfilesPage({
    unverifiedOnly: showUnverifiedOnly,
    page,
    pageSize,
  });
  const { data: unverifiedCount = 0 } = useUnverifiedProfilesCount();
  const verifyMutation = useVerifyUser();

  const [suspendUser, setSuspendUser] = useState<Profile | null>(null);
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null);
  const [mappingUser, setMappingUser] = useState<Profile | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    userId: string;
    currentRole: UserRole;
    newRole: UserRole;
    userName: string;
  } | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkSuspendOpen, setBulkSuspendOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const selectionResetKey = `${showUnverifiedOnly}|${page}|${pageSize}`;
  const [prevSelectionKey, setPrevSelectionKey] = useState(selectionResetKey);

  if (prevSelectionKey !== selectionResetKey) {
    setPrevSelectionKey(selectionResetKey);
    setSelectedUsers(new Set());
  }

  const displayedProfiles = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const handleRoleChange = (
    userId: string,
    newRole: UserRole,
    currentRole: UserRole,
    userName: string
  ) => {
    if (newRole === currentRole) return;
    setConfirmDialog({ userId, currentRole, newRole, userName });
  };

  const selectableUsers = useMemo(
    () => displayedProfiles.filter(u => u.user_id !== currentProfile?.user_id),
    [displayedProfiles, currentProfile?.user_id]
  );

  const allSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every(u => selectedUsers.has(u.user_id));
  const someSelected = selectableUsers.some(u => selectedUsers.has(u.user_id));

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectableUsers.map(u => u.user_id)));
    }
  }, [allSelected, selectableUsers]);

  const toggleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const selectedProfiles = useMemo(
    () => displayedProfiles.filter(p => selectedUsers.has(p.user_id)),
    [displayedProfiles, selectedUsers]
  );
  const selectedUnverifiedCount = selectedProfiles.filter(
    p => !p.is_verified
  ).length;
  const selectedActiveProfiles = selectedProfiles.filter(
    p => !p.is_suspended
  );

  const handleBulkVerify = async () => {
    setBulkProcessing(true);
    const targets = selectedProfiles.filter(p => !p.is_verified);
    const results = await Promise.allSettled(
      targets.map(p =>
        verifyMutation.mutateAsync({ userId: p.user_id, verified: true })
      )
    );
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (succeeded > 0) {
      toast.success(t('users.toasts.bulkVerifySuccess', { count: succeeded }));
    }
    if (failed > 0) {
      toast.error(t('users.toasts.bulkVerifyError', { count: failed }));
    }
    setSelectedUsers(new Set());
    setBulkProcessing(false);
  };

  const clearSelectionAndClose = () => {
    setSelectedUsers(new Set());
    setBulkSuspendOpen(false);
    setBulkDeleteOpen(false);
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tLayout('groups.admin')}
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <UserCog className="h-6 w-6" />
              {t('users.title')}
            </h1>
            <p className="text-muted-foreground">{t('users.subtitle')}</p>
          </div>
        </div>
      </div>

      <RoleLegendCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('users.listTitle')}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? t('users.loading')
              : t('users.totalRegistered', { count: total })}
            {unverifiedCount > 0 && !isLoading && (
              <span className="ml-2 text-amber-600">
                {t('users.pendingInline', { count: unverifiedCount })}
              </span>
            )}
          </CardDescription>
          {unverifiedCount > 0 && (
            <Button
              variant={showUnverifiedOnly ? 'default' : 'outline'}
              size="sm"
              className="w-fit"
              onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {showUnverifiedOnly
                ? t('users.showAll')
                : t('users.pendingVerify', { count: unverifiedCount })}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading || error ? (
            <QueryBoundary
              isLoading={isLoading}
              error={error}
              errorTitle={tCommon('routeErrors.adminUsers')}
              onRetry={() => window.location.reload()}
              skeletonRows={3}
              surface="plain"
            >
              {null}
            </QueryBoundary>
          ) : displayedProfiles.length > 0 ? (
            <>
              <UsersTable
                users={displayedProfiles}
                currentUserId={currentProfile?.user_id}
                selectedUsers={selectedUsers}
                allSelected={allSelected}
                someSelected={someSelected}
                onToggleSelectAll={toggleSelectAll}
                onToggleSelectUser={toggleSelectUser}
                onRoleChange={handleRoleChange}
                onMapTree={setMappingUser}
                onSuspend={setSuspendUser}
                onDelete={setDeleteUser}
              />

              {selectedUsers.size > 0 && (
                <BulkActionBar
                  selectedCount={selectedUsers.size}
                  unverifiedCount={selectedUnverifiedCount}
                  activeCount={selectedActiveProfiles.length}
                  processing={bulkProcessing}
                  onVerify={handleBulkVerify}
                  onSuspend={() => setBulkSuspendOpen(true)}
                  onDelete={() => setBulkDeleteOpen(true)}
                  onDeselect={() => setSelectedUsers(new Set())}
                />
              )}

              <div className="mt-4">
                <ListPagination
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  itemLabel={t('users.countLabel')}
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title={t('users.empty')}
              surface="plain"
            />
          )}
        </CardContent>
      </Card>

      <RoleChangeDialog
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
      <SuspendUserDialog
        user={suspendUser}
        onClose={() => setSuspendUser(null)}
      />
      <DeleteUserDialog
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
      />
      <BulkSuspendDialog
        open={bulkSuspendOpen}
        targets={selectedActiveProfiles}
        onClose={() => setBulkSuspendOpen(false)}
        onDone={clearSelectionAndClose}
      />
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        targets={selectedProfiles}
        onClose={() => setBulkDeleteOpen(false)}
        onDone={clearSelectionAndClose}
      />

      {mappingUser && (
        <TreeMappingDialog
          user={mappingUser}
          open={!!mappingUser}
          onOpenChange={open => {
            if (!open) setMappingUser(null);
          }}
        />
      )}
    </div>
  );
}
