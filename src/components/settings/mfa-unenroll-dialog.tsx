/**
 * @project AncestorTree
 * @file src/components/settings/mfa-unenroll-dialog.tsx
 * @description Confirm dialog for disabling MFA
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Loader2, ShieldOff } from 'lucide-react';
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

interface MfaUnenrollDialogProps {
  open: boolean;
  isUnenrolling: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function MfaUnenrollDialog({
  open,
  isUnenrolling,
  onOpenChange,
  onConfirm,
}: MfaUnenrollDialogProps) {
  const t = useTranslations('Settings');
  const tCommon = useTranslations('Common');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-destructive" />
            {t('security.unenrollTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('security.unenrollDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUnenrolling}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isUnenrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('security.unenrolling')}
              </>
            ) : (
              t('security.disable')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
