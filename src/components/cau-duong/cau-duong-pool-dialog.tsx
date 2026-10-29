/**
 * @project AncestorTree
 * @file src/components/cau-duong/cau-duong-pool-dialog.tsx
 * @description Dialog tạo/chỉnh sửa nhóm Cầu đương — wraps PoolForm, owns
 *              create/update pool mutations + toasts
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui';
import {
  useCreateCauDuongPool,
  useUpdateCauDuongPool,
} from '@hooks';
import type { CauDuongPoolFormData } from '@schemas';
import type { CauDuongPool } from '@types';
import { PoolForm } from './pool-form';

interface CauDuongPoolDialogProps {
  /** Current first pool — drives trigger button label */
  pool: CauDuongPool | undefined;
  /** Pool being edited (set when opening via the pencil button) */
  editingPool: CauDuongPool | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CauDuongPoolDialog({
  pool,
  editingPool,
  open,
  onOpenChange,
}: CauDuongPoolDialogProps) {
  const t = useTranslations('Admin');
  const tCauDuong = useTranslations('CauDuong');
  const createPoolMutation = useCreateCauDuongPool();
  const updatePoolMutation = useUpdateCauDuongPool();

  function handleCreate(data: CauDuongPoolFormData) {
    createPoolMutation.mutate(
      { ...data, is_active: true },
      {
        onSuccess: () => {
          toast.success(tCauDuong('toasts.createPoolSuccess'));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(tCauDuong('toasts.createPoolError'));
        },
      }
    );
  }

  function handleUpdate(data: CauDuongPoolFormData) {
    if (!editingPool) return;
    updatePoolMutation.mutate(
      {
        id: editingPool.id,
        input: { ...data, is_active: editingPool.is_active },
      },
      {
        onSuccess: () => {
          toast.success(tCauDuong('toasts.updatePoolSuccess'));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(tCauDuong('toasts.updatePoolError'));
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {pool
            ? t('features.cauDuong.editPool')
            : t('features.cauDuong.createPool')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingPool
              ? t('features.cauDuong.editPoolTitle')
              : t('features.cauDuong.createPoolTitle')}
          </DialogTitle>
        </DialogHeader>
        <PoolForm
          key={editingPool?.id || 'new'}
          pool={editingPool}
          onSubmit={editingPool ? handleUpdate : handleCreate}
          isPending={
            createPoolMutation.isPending || updatePoolMutation.isPending
          }
        />
      </DialogContent>
    </Dialog>
  );
}
