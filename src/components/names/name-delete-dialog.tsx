/**
 * @project AncestorTree
 * @file src/components/names/name-delete-dialog.tsx
 * @description Confirm dialog for deleting a name dictionary entry
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useTranslations } from 'next-intl';
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
import type { NameEntry } from '@types';

interface NameDeleteDialogProps {
  target: NameEntry | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function NameDeleteDialog({
  target,
  onClose,
  onConfirm,
  isPending,
}: NameDeleteDialogProps) {
  const t = useTranslations('Names');
  const tc = useTranslations('Common');

  return (
    <AlertDialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.deleteConfirm', { name: target?.name ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {t('admin.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
