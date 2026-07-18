/**
 * @project AncestorTree
 * @file src/components/settings/mfa-unenroll-dialog.tsx
 * @description Confirm dialog for disabling MFA
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-destructive" />
            Tắt xác thực 2 bước?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sau khi tắt, tài khoản chỉ được bảo vệ bằng mật khẩu. Bạn có thể
            bật lại bất cứ lúc nào.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUnenrolling}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isUnenrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tắt...
              </>
            ) : (
              'Tắt xác thực 2 bước'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
