/**
 * @project AncestorTree
 * @file src/components/users/bulk-delete-dialog.tsx
 * @description Confirm dialog for permanently deleting multiple user
 *              accounts at once — owns its mutation, pending state and
 *              per-result toasts
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
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

interface BulkDeleteDialogProps {
  open: boolean;
  targets: Profile[];
  onClose: () => void;
  onDone: () => void;
}

export function BulkDeleteDialog({
  open,
  targets,
  onClose,
  onDone,
}: BulkDeleteDialogProps) {
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
