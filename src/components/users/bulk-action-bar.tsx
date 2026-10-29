/**
 * @project AncestorTree
 * @file src/components/users/bulk-action-bar.tsx
 * @description Floating bar shown when users are selected — bulk verify,
 *              suspend and delete entry points
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Ban,
  CheckSquare,
  Loader2,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  unverifiedCount: number;
  activeCount: number;
  processing: boolean;
  onVerify: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onDeselect: () => void;
}

export function BulkActionBar({
  selectedCount,
  unverifiedCount,
  activeCount,
  processing,
  onVerify,
  onSuspend,
  onDelete,
  onDeselect,
}: BulkActionBarProps) {
  const t = useTranslations('Admin');

  return (
    <div className="sticky bottom-4 mx-auto mt-4 flex w-fit items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CheckSquare className="h-4 w-4 text-primary" />
        {t('users.bulk.selected', { count: selectedCount })}
      </div>
      <div className="h-5 w-px bg-border" />
      {unverifiedCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-green-600 border-green-200 hover:bg-green-50"
          onClick={onVerify}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
          )}
          {t('users.bulk.verifyCount', { count: unverifiedCount })}
        </Button>
      )}
      {activeCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={onSuspend}
          disabled={processing}
        >
          <Ban className="h-3.5 w-3.5 mr-1.5" />
          {t('users.bulk.suspendCount', { count: activeCount })}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={onDelete}
        disabled={processing}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        {t('users.bulk.deleteCount', { count: selectedCount })}
      </Button>
      <div className="h-5 w-px bg-border" />
      <Button
        size="sm"
        variant="ghost"
        className="h-8"
        onClick={onDeselect}
      >
        <X className="h-3.5 w-3.5 mr-1" />
        {t('users.bulk.deselect')}
      </Button>
    </div>
  );
}
