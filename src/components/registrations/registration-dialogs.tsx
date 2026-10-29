/**
 * @project AncestorTree
 * @file src/components/registrations/registration-dialogs.tsx
 * @description Confirmation dialogs for registration actions — reject (with
 *              reason) and delete. Each owns its mutation + pending state.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Textarea,
} from '@components/ui';
import { useDeleteRegistration, useRejectRegistration } from '@hooks';
import type { MemberRegistration } from '@types';

interface RegistrationDialogProps {
  registration: MemberRegistration | null;
  onClose: () => void;
}

export function RejectRegistrationDialog({
  registration,
  onClose,
}: RegistrationDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const rejectMutation = useRejectRegistration();
  const [reason, setReason] = useState('');
  const regId = registration?.id ?? null;
  const [prevRegId, setPrevRegId] = useState(regId);

  if (regId !== prevRegId) {
    setPrevRegId(regId);
    setReason('');
  }

  function handleClose() {
    setReason('');
    onClose();
  }

  async function handleReject() {
    if (!registration || !reason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        id: registration.id,
        reason,
      });
      toast.success(
        t('registrations.toasts.rejectSuccess', {
          name: registration.full_name,
        })
      );
      handleClose();
    } catch {
      toast.error(t('registrations.toasts.rejectError'));
    }
  }

  return (
    <AlertDialog
      open={!!registration}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('registrations.rejectDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('registrations.rejectDialog.description', {
              name: registration?.full_name ?? '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t('registrations.rejectDialog.reasonPlaceholder')}
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void handleReject()}
            disabled={!reason.trim() || rejectMutation.isPending}
          >
            {rejectMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('registrations.actions.reject')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteRegistrationDialog({
  registration,
  onClose,
}: RegistrationDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const deleteMutation = useDeleteRegistration();

  async function handleDelete() {
    if (!registration) return;
    try {
      await deleteMutation.mutateAsync(registration.id);
      toast.success(t('registrations.toasts.deleteSuccess'));
      onClose();
    } catch {
      toast.error(t('registrations.toasts.deleteError'));
    }
  }

  return (
    <AlertDialog
      open={!!registration}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('registrations.deleteDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('registrations.deleteDialog.description', {
              name: registration?.full_name ?? '',
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
  );
}
