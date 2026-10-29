/**
 * @project AncestorTree
 * @file src/components/users/user-dialogs.tsx
 * @description Confirmation dialogs for user-management actions — role change,
 *              suspend, delete, and their bulk variants. Each dialog owns its
 *              mutation, pending state and toasts.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Ban, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Label,
  Textarea,
} from '@components/ui';
import {
  useDeleteUser,
  useSuspendUser,
  useUpdateUserRole,
} from '@hooks';
import type { Profile, UserRole } from '@types';
import { UserRoleBadge } from './user-role-badge';

// ─── Role change ─────────────────────────────────────────────────────────────

interface RoleChangeDialogProps {
  dialog: {
    userId: string;
    currentRole: UserRole;
    newRole: UserRole;
    userName: string;
  } | null;
  onClose: () => void;
}

export function RoleChangeDialog({ dialog, onClose }: RoleChangeDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const updateRole = useUpdateUserRole();

  async function confirm() {
    if (!dialog) return;
    try {
      await updateRole.mutateAsync({
        userId: dialog.userId,
        role: dialog.newRole,
      });
      toast.success(
        t('users.toasts.roleSuccess', { name: dialog.userName })
      );
    } catch (err) {
      toast.error(t('users.toasts.roleError'));
      console.error(err);
    } finally {
      onClose();
    }
  }

  return (
    <AlertDialog open={!!dialog} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('users.roleDialog.confirmTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.roleDialog.confirmPrompt', {
              name: dialog?.userName ?? '',
            })}{' '}
            {t('users.roleDialog.from')}{' '}
            <UserRoleBadge role={dialog?.currentRole ?? 'viewer'} />{' '}
            {t('users.roleDialog.to')}{' '}
            <UserRoleBadge role={dialog?.newRole ?? 'viewer'} />?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={updateRole.isPending}>
            {updateRole.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {tCommon('confirm')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Suspend ─────────────────────────────────────────────────────────────────

interface SuspendUserDialogProps {
  user: Profile | null;
  onClose: () => void;
}

export function SuspendUserDialog({ user, onClose }: SuspendUserDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const suspendMutation = useSuspendUser();
  const [reason, setReason] = useState('');
  const userId = user?.user_id ?? null;
  const [prevUserId, setPrevUserId] = useState(userId);

  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setReason('');
  }

  function handleClose() {
    setReason('');
    onClose();
  }

  async function confirm() {
    if (!user) return;
    const name = user.full_name || user.email;
    try {
      await suspendMutation.mutateAsync({
        userId: user.user_id,
        reason: reason.trim() || undefined,
      });
      toast.success(t('users.toasts.suspendSuccess', { name }));
    } catch (err) {
      toast.error(t('users.toasts.suspendError'));
      console.error(err);
    } finally {
      handleClose();
    }
  }

  return (
    <AlertDialog
      open={!!user}
      onOpenChange={(open) => !open && handleClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-amber-600" />
            {t('users.suspendDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.suspendDialog.description', {
              name: user?.full_name || user?.email || '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-1 py-2">
          <Label htmlFor="suspend-reason" className="text-sm font-medium">
            {t('users.suspendDialog.reasonOptional')}
          </Label>
          <Textarea
            id="suspend-reason"
            className="mt-1.5"
            placeholder={t('users.suspendDialog.reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={suspendMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {suspendMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                {t('users.suspendDialog.confirm')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Delete ──────────────────────────────────────────────────────────────────

interface DeleteUserDialogProps {
  user: Profile | null;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const deleteMutation = useDeleteUser();

  async function confirm() {
    if (!user) return;
    const name = user.full_name || user.email;
    try {
      await deleteMutation.mutateAsync(user.user_id);
      toast.success(t('users.toasts.deleteSuccess', { name }));
    } catch (err) {
      toast.error(t('users.toasts.deleteError'));
      console.error(err);
    } finally {
      onClose();
    }
  }

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('users.deleteDialog.titlePermanent')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.deleteDialog.descriptionNamed', {
              name: user?.full_name || user?.email || '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('deleting')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('users.actions.deleteAccount')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Bulk suspend ────────────────────────────────────────────────────────────

interface BulkUserDialogProps {
  open: boolean;
  targets: Profile[];
  onClose: () => void;
  onDone: () => void;
}

export function BulkSuspendDialog({
  open,
  targets,
  onClose,
  onDone,
}: BulkUserDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const suspendMutation = useSuspendUser();
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  function handleClose() {
    setReason('');
    onClose();
  }

  async function confirm() {
    setProcessing(true);
    const results = await Promise.allSettled(
      targets.map((p) =>
        suspendMutation.mutateAsync({
          userId: p.user_id,
          reason: reason.trim() || undefined,
        })
      )
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (succeeded > 0) {
      toast.success(t('users.toasts.bulkSuspendSuccess', { count: succeeded }));
    }
    if (failed > 0) {
      toast.error(t('users.toasts.bulkSuspendError', { count: failed }));
    }
    setProcessing(false);
    setReason('');
    onDone();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => !v && handleClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-amber-600" />
            {t('users.bulkSuspendDialog.title', { count: targets.length })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.bulkSuspendDialog.description')}
            <span className="block mt-2 text-sm font-medium text-foreground max-h-24 overflow-y-auto">
              {targets.map((p) => p.full_name || p.email).join(', ')}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-1 py-2">
          <Label htmlFor="bulk-suspend-reason" className="text-sm font-medium">
            {t('users.suspendDialog.reasonOptional')}
          </Label>
          <Textarea
            id="bulk-suspend-reason"
            className="mt-1.5"
            placeholder={t('users.suspendDialog.reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={processing}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                {t('users.bulkSuspendDialog.confirm', {
                  count: targets.length,
                })}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Bulk delete ─────────────────────────────────────────────────────────────

export function BulkDeleteDialog({
  open,
  targets,
  onClose,
  onDone,
}: BulkUserDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const deleteMutation = useDeleteUser();
  const [processing, setProcessing] = useState(false);

  async function confirm() {
    setProcessing(true);
    const results = await Promise.allSettled(
      targets.map((p) => deleteMutation.mutateAsync(p.user_id))
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (succeeded > 0) {
      toast.success(t('users.toasts.bulkDeleteSuccess', { count: succeeded }));
    }
    if (failed > 0) {
      toast.error(t('users.toasts.bulkDeleteError', { count: failed }));
    }
    setProcessing(false);
    onDone();
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('users.bulkDeleteDialog.title', { count: targets.length })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.bulkDeleteDialog.description')}
            <span className="block mt-2 text-sm font-medium text-foreground max-h-24 overflow-y-auto">
              {targets.map((p) => p.full_name || p.email).join(', ')}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={processing}
            className="bg-destructive hover:bg-destructive/90"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('deleting')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('users.bulkDeleteDialog.confirm', {
                  count: targets.length,
                })}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
