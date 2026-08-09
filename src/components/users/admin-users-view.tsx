/**
 * @project AncestorTree
 * @file src/components/users/admin-users-view.tsx
 * @description Admin user management — role + tree mapping + bulk actions (FR-507~509)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  CheckSquare,
  Clock,
  GitBranch,
  Link2,
  Loader2,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import { EmptyState, ListPagination, QueryBoundary } from '@components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  USER_ROLE_COLORS,
  USER_ROLE_ORDER,
  type ListPageSize,
} from '@constants';
import {
  useDeleteUser,
  useProfilesPage,
  useResettablePage,
  useSuspendUser,
  useUnsuspendUser,
  useUnverifiedProfilesCount,
  useUpdateUserRole,
  useVerifyUser,
} from '@hooks';
import type { Profile, UserRole } from '@types';
import { PersonName } from './person-name';
import { TreeMappingDialog } from './tree-mapping-dialog';

function roleLabel(
  role: UserRole,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  const labels: Record<UserRole, string> = {
    admin: t('users.roles.admin.label'),
    editor: t('users.roles.editor.label'),
    viewer: t('users.roles.viewer.label'),
  };
  return labels[role];
}

function roleDescription(
  role: UserRole,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  const descriptions: Record<UserRole, string> = {
    admin: t('users.roles.admin.description'),
    editor: t('users.roles.editor.description'),
    viewer: t('users.roles.viewer.description'),
  };
  return descriptions[role];
}

export function AdminUsersView() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const tLayout = useTranslations('Layout');
  const locale = useLocale();
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
  const updateRole = useUpdateUserRole();
  const suspendMutation = useSuspendUser();
  const unsuspendMutation = useUnsuspendUser();
  const deleteMutation = useDeleteUser();
  const verifyMutation = useVerifyUser();

  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean;
    user: Profile;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: Profile;
  } | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkSuspendDialog, setBulkSuspendDialog] = useState(false);
  const [bulkSuspendReason, setBulkSuspendReason] = useState('');
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const selectionResetKey = `${showUnverifiedOnly}|${page}|${pageSize}`;
  const [prevSelectionKey, setPrevSelectionKey] = useState(selectionResetKey);

  if (prevSelectionKey !== selectionResetKey) {
    setPrevSelectionKey(selectionResetKey);
    setSelectedUsers(new Set());
  }

  const displayedProfiles = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    currentRole: UserRole;
    newRole: UserRole;
    userName: string;
  } | null>(null);

  const [mappingUser, setMappingUser] = useState<Profile | null>(null);

  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  const handleRoleChange = (
    userId: string,
    newRole: UserRole,
    currentRole: UserRole,
    userName: string
  ) => {
    if (newRole === currentRole) return;
    setConfirmDialog({ open: true, userId, currentRole, newRole, userName });
  };

  const confirmRoleChange = async () => {
    if (!confirmDialog) return;
    try {
      await updateRole.mutateAsync({
        userId: confirmDialog.userId,
        role: confirmDialog.newRole,
      });
      toast.success(
        t('users.toasts.roleSuccess', { name: confirmDialog.userName })
      );
    } catch (err) {
      toast.error(t('users.toasts.roleError'));
      console.error(err);
    } finally {
      setConfirmDialog(null);
    }
  };

  const confirmSuspend = async () => {
    if (!suspendDialog) return;
    const name =
      suspendDialog.user.full_name || suspendDialog.user.email;
    try {
      await suspendMutation.mutateAsync({
        userId: suspendDialog.user.user_id,
        reason: suspendReason.trim() || undefined,
      });
      toast.success(t('users.toasts.suspendSuccess', { name }));
    } catch (err) {
      toast.error(t('users.toasts.suspendError'));
      console.error(err);
    } finally {
      setSuspendDialog(null);
      setSuspendReason('');
    }
  };

  const confirmUnsuspend = async (user: Profile) => {
    const name = user.full_name || user.email;
    try {
      await unsuspendMutation.mutateAsync(user.user_id);
      toast.success(t('users.toasts.unsuspendSuccess', { name }));
    } catch (err) {
      toast.error(t('users.toasts.unsuspendError'));
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    const name = deleteDialog.user.full_name || deleteDialog.user.email;
    try {
      await deleteMutation.mutateAsync(deleteDialog.user.user_id);
      toast.success(t('users.toasts.deleteSuccess', { name }));
    } catch (err) {
      toast.error(t('users.toasts.deleteError'));
      console.error(err);
    } finally {
      setDeleteDialog(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const isSelf = (user: Profile) => user.user_id === currentProfile?.user_id;

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
  const selectedActiveCount = selectedProfiles.filter(
    p => !p.is_suspended
  ).length;

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

  const handleBulkSuspend = async () => {
    setBulkProcessing(true);
    const targets = selectedProfiles.filter(p => !p.is_suspended);
    const results = await Promise.allSettled(
      targets.map(p =>
        suspendMutation.mutateAsync({
          userId: p.user_id,
          reason: bulkSuspendReason.trim() || undefined,
        })
      )
    );
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (succeeded > 0) {
      toast.success(t('users.toasts.bulkSuspendSuccess', { count: succeeded }));
    }
    if (failed > 0) {
      toast.error(t('users.toasts.bulkSuspendError', { count: failed }));
    }
    setSelectedUsers(new Set());
    setBulkSuspendDialog(false);
    setBulkSuspendReason('');
    setBulkProcessing(false);
  };

  const handleBulkDelete = async () => {
    setBulkProcessing(true);
    const results = await Promise.allSettled(
      selectedProfiles.map(p => deleteMutation.mutateAsync(p.user_id))
    );
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (succeeded > 0) {
      toast.success(t('users.toasts.bulkDeleteSuccess', { count: succeeded }));
    }
    if (failed > 0) {
      toast.error(t('users.toasts.bulkDeleteError', { count: failed }));
    }
    setSelectedUsers(new Set());
    setBulkDeleteDialog(false);
    setBulkProcessing(false);
  };

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button asChild variant='ghost' size='sm'>
            <Link href='/admin'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              {tLayout('groups.admin')}
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold flex items-center gap-2'>
              <UserCog className='h-6 w-6' />
              {t('users.title')}
            </h1>
            <p className='text-muted-foreground'>{t('users.subtitle')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            {t('users.roleLegend.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {USER_ROLE_ORDER.map(role => (
              <div
                key={role}
                className='flex items-start gap-3 p-3 rounded-lg border'>
                <Badge className={USER_ROLE_COLORS[role]}>
                  {roleLabel(role, t)}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  {roleDescription(role, t)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Users className='h-4 w-4' />
            {t('users.listTitle')}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? t('users.loading')
              : t('users.totalRegistered', { count: total })}
            {unverifiedCount > 0 && !isLoading && (
              <span className='ml-2 text-amber-600'>
                {t('users.pendingInline', { count: unverifiedCount })}
              </span>
            )}
          </CardDescription>
          {unverifiedCount > 0 && (
            <Button
              variant={showUnverifiedOnly ? 'default' : 'outline'}
              size='sm'
              className='w-fit'
              onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}>
              <Clock className='h-3.5 w-3.5 mr-1.5' />
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
              surface='plain'>
              {null}
            </QueryBoundary>
          ) : displayedProfiles.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10'>
                      <Checkbox
                        checked={
                          allSelected
                            ? true
                            : someSelected
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label={t('users.selectAll')}
                      />
                    </TableHead>
                    <TableHead>{t('users.columns.user')}</TableHead>
                    <TableHead className='hidden sm:table-cell'>
                      {t('users.columns.email')}
                    </TableHead>
                    <TableHead>{t('users.columns.role')}</TableHead>
                    <TableHead>{t('users.columns.status')}</TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      {t('users.columns.tree')}
                    </TableHead>
                    <TableHead className='hidden md:table-cell'>
                      {t('users.columns.createdAt')}
                    </TableHead>
                    <TableHead className='text-right'>
                      {t('users.columns.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedProfiles.map(user => {
                    const displayName = user.full_name || user.email;
                    return (
                      <TableRow
                        key={user.id}
                        className={
                          selectedUsers.has(user.user_id) ? 'bg-accent/50' : ''
                        }>
                        <TableCell>
                          {isSelf(user) ? (
                            <div className='w-4' />
                          ) : (
                            <Checkbox
                              checked={selectedUsers.has(user.user_id)}
                              onCheckedChange={() =>
                                toggleSelectUser(user.user_id)
                              }
                              aria-label={t('users.selectUser', {
                                name: displayName,
                              })}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-9 w-9'>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium flex items-center gap-1.5'>
                                {user.full_name || t('users.notUpdated')}
                                {user.is_suspended && (
                                  <Badge
                                    variant='destructive'
                                    className='text-[10px] px-1 py-0 h-4'>
                                    {t('users.status.suspended')}
                                  </Badge>
                                )}
                              </p>
                              <p className='text-xs text-muted-foreground sm:hidden'>
                                {user.email}
                              </p>
                              {user.is_suspended && user.suspension_reason && (
                                <p className='text-xs text-destructive mt-0.5 truncate max-w-45'>
                                  {user.suspension_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {isSelf(user) ? (
                            <Badge className={USER_ROLE_COLORS[user.role]}>
                              {roleLabel(user.role, t)}
                            </Badge>
                          ) : (
                            <Select
                              value={user.role}
                              onValueChange={value =>
                                handleRoleChange(
                                  user.user_id,
                                  value as UserRole,
                                  user.role,
                                  displayName
                                )
                              }>
                              <SelectTrigger className='w-35 h-8'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {USER_ROLE_ORDER.map(role => (
                                  <SelectItem key={role} value={role}>
                                    <span className='flex items-center gap-2'>
                                      <span
                                        className={`h-2 w-2 rounded-full ${
                                          role === 'admin'
                                            ? 'bg-red-500'
                                            : role === 'editor'
                                              ? 'bg-blue-500'
                                              : 'bg-gray-500'
                                        }`}
                                      />
                                      {roleLabel(role, t)}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_verified ? (
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              <CheckCircle className='h-3 w-3 mr-1' />
                              {t('users.columns.verified')}
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='text-amber-600 border-amber-300'>
                              <Clock className='h-3 w-3 mr-1' />
                              {t('users.status.pending')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          <div className='space-y-0.5'>
                            {user.linked_person ? (
                              <div className='flex items-center gap-1 text-xs'>
                                <Link2 className='h-3 w-3 text-green-600 shrink-0' />
                                <PersonName personId={user.linked_person} />
                              </div>
                            ) : (
                              <span className='text-xs text-muted-foreground'>
                                {t('users.notLinked')}
                              </span>
                            )}
                            {user.edit_root_person_id && (
                              <div className='flex items-center gap-1 text-xs text-blue-600'>
                                <GitBranch className='h-3 w-3 shrink-0' />
                                <PersonName
                                  personId={user.edit_root_person_id}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            {!isSelf(user) && !user.is_verified && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 px-2.5 text-green-600 border-green-200 hover:bg-green-50'
                                onClick={async () => {
                                  try {
                                    await verifyMutation.mutateAsync({
                                      userId: user.user_id,
                                      verified: true,
                                    });
                                    toast.success(
                                      t('users.toasts.verifySuccess', {
                                        name: displayName,
                                      })
                                    );
                                  } catch {
                                    toast.error(t('users.toasts.verifyError'));
                                  }
                                }}
                                disabled={verifyMutation.isPending}
                                title={t('users.actions.verifyAccount')}>
                                {verifyMutation.isPending ? (
                                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                ) : (
                                  <>
                                    <ShieldCheck className='h-3.5 w-3.5 mr-1' />
                                    {t('users.actions.verify')}
                                  </>
                                )}
                              </Button>
                            )}

                            <Button
                              variant='outline'
                              size='sm'
                              className='h-8 w-8 p-0'
                              onClick={() => setMappingUser(user)}
                              title={t('users.actions.mapTree')}
                              disabled={isSelf(user)}>
                              <Link2 className='h-3.5 w-3.5' />
                            </Button>

                            {!isSelf(user) &&
                              (user.is_suspended ? (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50'
                                  onClick={() => confirmUnsuspend(user)}
                                  disabled={unsuspendMutation.isPending}
                                  title={t('users.actions.unsuspendAccount')}>
                                  {unsuspendMutation.isPending ? (
                                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                  ) : (
                                    <ShieldCheck className='h-3.5 w-3.5' />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='h-8 w-8 p-0 text-amber-600 border-amber-200 hover:bg-amber-50'
                                  onClick={() => {
                                    setSuspendReason('');
                                    setSuspendDialog({ open: true, user });
                                  }}
                                  title={t('users.actions.suspendAccount')}>
                                  <Ban className='h-3.5 w-3.5' />
                                </Button>
                              ))}

                            {!isSelf(user) && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10'
                                onClick={() =>
                                  setDeleteDialog({ open: true, user })
                                }
                                title={t('users.actions.deleteAccount')}>
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {selectedUsers.size > 0 && (
                <div className='sticky bottom-4 mt-4 mx-auto w-fit flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <CheckSquare className='h-4 w-4 text-primary' />
                    {t('users.bulk.selected', { count: selectedUsers.size })}
                  </div>
                  <div className='h-5 w-px bg-border' />
                  {selectedUnverifiedCount > 0 && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-8 text-green-600 border-green-200 hover:bg-green-50'
                      onClick={handleBulkVerify}
                      disabled={bulkProcessing}>
                      {bulkProcessing ? (
                        <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />
                      ) : (
                        <ShieldCheck className='h-3.5 w-3.5 mr-1.5' />
                      )}
                      {t('users.bulk.verifyCount', {
                        count: selectedUnverifiedCount,
                      })}
                    </Button>
                  )}
                  {selectedActiveCount > 0 && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-8 text-amber-600 border-amber-200 hover:bg-amber-50'
                      onClick={() => {
                        setBulkSuspendReason('');
                        setBulkSuspendDialog(true);
                      }}
                      disabled={bulkProcessing}>
                      <Ban className='h-3.5 w-3.5 mr-1.5' />
                      {t('users.bulk.suspendCount', {
                        count: selectedActiveCount,
                      })}
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-8 text-destructive border-destructive/30 hover:bg-destructive/10'
                    onClick={() => setBulkDeleteDialog(true)}
                    disabled={bulkProcessing}>
                    <Trash2 className='h-3.5 w-3.5 mr-1.5' />
                    {t('users.bulk.deleteCount', { count: selectedUsers.size })}
                  </Button>
                  <div className='h-5 w-px bg-border' />
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-8'
                    onClick={() => setSelectedUsers(new Set())}>
                    <X className='h-3.5 w-3.5 mr-1' />
                    {t('users.bulk.deselect')}
                  </Button>
                </div>
              )}

              <div className='mt-4'>
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
              surface='plain'
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog?.open}
        onOpenChange={open => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.roleDialog.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.roleDialog.confirmPrompt', {
                name: confirmDialog?.userName ?? '',
              })}{' '}
              {t('users.roleDialog.from')}{' '}
              <Badge
                className={
                  USER_ROLE_COLORS[confirmDialog?.currentRole ?? 'viewer']
                }>
                {roleLabel(confirmDialog?.currentRole ?? 'viewer', t)}
              </Badge>{' '}
              {t('users.roleDialog.to')}{' '}
              <Badge
                className={USER_ROLE_COLORS[confirmDialog?.newRole ?? 'viewer']}>
                {roleLabel(confirmDialog?.newRole ?? 'viewer', t)}
              </Badge>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              disabled={updateRole.isPending}>
              {updateRole.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {tCommon('loading')}
                </>
              ) : (
                <>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  {tCommon('confirm')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={suspendDialog?.open}
        onOpenChange={open => {
          if (!open) {
            setSuspendDialog(null);
            setSuspendReason('');
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Ban className='h-5 w-5 text-amber-600' />
              {t('users.suspendDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.suspendDialog.description', {
                name:
                  suspendDialog?.user.full_name ||
                  suspendDialog?.user.email ||
                  '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='px-1 py-2'>
            <Label htmlFor='suspend-reason' className='text-sm font-medium'>
              {t('users.suspendDialog.reasonOptional')}
            </Label>
            <Textarea
              id='suspend-reason'
              className='mt-1.5'
              placeholder={t('users.suspendDialog.reasonPlaceholder')}
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              disabled={suspendMutation.isPending}
              className='bg-amber-600 hover:bg-amber-700'>
              {suspendMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {tCommon('loading')}
                </>
              ) : (
                <>
                  <Ban className='h-4 w-4 mr-2' />
                  {t('users.suspendDialog.confirm')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteDialog?.open}
        onOpenChange={open => {
          if (!open) setDeleteDialog(null);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
              <Trash2 className='h-5 w-5' />
              {t('users.deleteDialog.titlePermanent')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.deleteDialog.descriptionNamed', {
                name:
                  deleteDialog?.user.full_name ||
                  deleteDialog?.user.email ||
                  '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className='bg-destructive hover:bg-destructive/90'>
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {tCommon('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className='h-4 w-4 mr-2' />
                  {t('users.actions.deleteAccount')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkSuspendDialog}
        onOpenChange={open => {
          if (!open) {
            setBulkSuspendDialog(false);
            setBulkSuspendReason('');
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Ban className='h-5 w-5 text-amber-600' />
              {t('users.bulkSuspendDialog.title', {
                count: selectedActiveCount,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.bulkSuspendDialog.description')}
              <span className='block mt-2 text-sm font-medium text-foreground max-h-24 overflow-y-auto'>
                {selectedProfiles
                  .filter(p => !p.is_suspended)
                  .map(p => p.full_name || p.email)
                  .join(', ')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='px-1 py-2'>
            <Label
              htmlFor='bulk-suspend-reason'
              className='text-sm font-medium'>
              {t('users.suspendDialog.reasonOptional')}
            </Label>
            <Textarea
              id='bulk-suspend-reason'
              className='mt-1.5'
              placeholder={t('users.suspendDialog.reasonPlaceholder')}
              value={bulkSuspendReason}
              onChange={e => setBulkSuspendReason(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkProcessing}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkSuspend}
              disabled={bulkProcessing}
              className='bg-amber-600 hover:bg-amber-700'>
              {bulkProcessing ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {tCommon('loading')}
                </>
              ) : (
                <>
                  <Ban className='h-4 w-4 mr-2' />
                  {t('users.bulkSuspendDialog.confirm', {
                    count: selectedActiveCount,
                  })}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialog}
        onOpenChange={open => {
          if (!open) setBulkDeleteDialog(false);
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
              <Trash2 className='h-5 w-5' />
              {t('users.bulkDeleteDialog.title', {
                count: selectedUsers.size,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.bulkDeleteDialog.description')}
              <span className='block mt-2 text-sm font-medium text-foreground max-h-24 overflow-y-auto'>
                {selectedProfiles.map(p => p.full_name || p.email).join(', ')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkProcessing}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className='bg-destructive hover:bg-destructive/90'>
              {bulkProcessing ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {tCommon('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className='h-4 w-4 mr-2' />
                  {t('users.bulkDeleteDialog.confirm', {
                    count: selectedUsers.size,
                  })}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
