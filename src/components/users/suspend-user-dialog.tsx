/**
 * @project AncestorTree
 * @file src/components/users/suspend-user-dialog.tsx
 * @description Confirm dialog for suspending a user (with optional reason) —
 *              owns its mutation, pending state and toasts
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Ban, Loader2 } from 'lucide-react';
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
import { useSuspendUser } from '@hooks';
import type { Profile } from '@types';

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
