/**
 * @project AncestorTree
 * @file src/components/users/user-row-actions.tsx
 * @description Per-row action buttons in the users table — verify, map tree,
 *              suspend/unsuspend and delete. Verify/unsuspend own their
 *              mutations + toasts; suspend/delete delegate to parent dialogs.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Ban, Link2, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@components/ui';
import { useUnsuspendUser, useVerifyUser } from '@hooks';
import type { Profile } from '@types';

interface UserRowActionsProps {
  user: Profile;
  isSelf: boolean;
  onMapTree: (user: Profile) => void;
  onSuspend: (user: Profile) => void;
  onDelete: (user: Profile) => void;
}

export function UserRowActions({
  user,
  isSelf,
  onMapTree,
  onSuspend,
  onDelete,
}: UserRowActionsProps) {
  const t = useTranslations('Admin');
  const verifyMutation = useVerifyUser();
  const unsuspendMutation = useUnsuspendUser();
  const displayName = user.full_name || user.email;

  async function handleVerify() {
    try {
      await verifyMutation.mutateAsync({
        userId: user.user_id,
        verified: true,
      });
      toast.success(t('users.toasts.verifySuccess', { name: displayName }));
    } catch {
      toast.error(t('users.toasts.verifyError'));
    }
  }

  async function handleUnsuspend() {
    try {
      await unsuspendMutation.mutateAsync(user.user_id);
      toast.success(
        t('users.toasts.unsuspendSuccess', { name: displayName })
      );
    } catch (err) {
      toast.error(t('users.toasts.unsuspendError'));
      console.error(err);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {!isSelf && !user.is_verified && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-green-600 border-green-200 hover:bg-green-50"
          onClick={handleVerify}
          disabled={verifyMutation.isPending}
          title={t('users.actions.verifyAccount')}
        >
          {verifyMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {t('users.actions.verify')}
            </>
          )}
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onMapTree(user)}
        title={t('users.actions.mapTree')}
        disabled={isSelf}
      >
        <Link2 className="h-3.5 w-3.5" />
      </Button>

      {!isSelf &&
        (user.is_suspended ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
            onClick={handleUnsuspend}
            disabled={unsuspendMutation.isPending}
            title={t('users.actions.unsuspendAccount')}
          >
            {unsuspendMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={() => onSuspend(user)}
            title={t('users.actions.suspendAccount')}
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
        ))}

      {!isSelf && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => onDelete(user)}
          title={t('users.actions.deleteAccount')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
