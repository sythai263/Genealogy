/**
 * @project AncestorTree
 * @file src/components/users/bulk-suspend-dialog.tsx
 * @description Confirm dialog for suspending multiple users at once (with
 *              optional shared reason) — owns its mutation, pending state
 *              and per-result toasts
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

interface BulkSuspendDialogProps {
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
}: BulkSuspendDialogProps) {
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
