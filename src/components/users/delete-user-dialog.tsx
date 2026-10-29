/**
 * @project AncestorTree
 * @file src/components/users/delete-user-dialog.tsx
 * @description Confirm dialog for permanently deleting a user account — owns
 *              its mutation, pending state and toasts
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
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
import { useDeleteUser } from '@hooks';
import type { Profile } from '@types';

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
