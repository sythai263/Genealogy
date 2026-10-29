/**
 * @project AncestorTree
 * @file src/components/users/role-change-dialog.tsx
 * @description Confirm dialog for changing a user's role — owns its mutation,
 *              pending state and toasts
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui';
import { useUpdateUserRole } from '@hooks';
import type { UserRole } from '@types';
import { UserRoleBadge } from './user-role-badge';

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
