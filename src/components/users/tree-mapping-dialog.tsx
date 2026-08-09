/**
 * @project AncestorTree
 * @file src/components/users/tree-mapping-dialog.tsx
 * @description Dialog to link a user account to tree people (linked + edit root)
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Link2, Loader2 } from 'lucide-react';
import { PersonCombobox } from '@components/people';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui';
import { USER_ROLE_META } from '@constants';
import {
  usePerson,
  useUpdateEditRootPerson,
  useUpdateLinkedPerson,
} from '@hooks';
import type { Person, Profile } from '@types';

interface TreeMappingDialogProps {
  user: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TreeMappingDialog({
  user,
  open,
  onOpenChange,
}: TreeMappingDialogProps) {
  const { data: initialLinked } = usePerson(user.linked_person);
  const { data: initialEditRoot } = usePerson(user.edit_root_person_id);

  const [linkedPerson, setLinkedPerson] = useState<Person | null>(null);
  const [editRootPerson, setEditRootPerson] = useState<Person | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialise selections from current profile values when dialog opens (ISS-09)
  // Wait for BOTH queries to resolve before initializing
  const linkedReady = initialLinked !== undefined || !user.linked_person;
  const editRootReady =
    initialEditRoot !== undefined || !user.edit_root_person_id;
  if (open && !initialized && linkedReady && editRootReady) {
    setLinkedPerson(initialLinked ?? null);
    setEditRootPerson(initialEditRoot ?? null);
    setInitialized(true);
  }

  const handleClose = () => {
    setInitialized(false);
    onOpenChange(false);
  };

  const updateLinked = useUpdateLinkedPerson();
  const updateEditRoot = useUpdateEditRootPerson();

  const handleSave = async () => {
    try {
      await Promise.all([
        updateLinked.mutateAsync({
          userId: user.user_id,
          personId: linkedPerson?.id ?? null,
        }),
        updateEditRoot.mutateAsync({
          userId: user.user_id,
          personId: editRootPerson?.id ?? null,
        }),
      ]);
      toast.success(`Đã lưu cài đặt cây cho ${user.full_name || user.email}`);
      handleClose();
    } catch (err) {
      toast.error('Lỗi khi lưu cài đặt');
      console.error(err);
    }
  };

  const isSaving = updateLinked.isPending || updateEditRoot.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) handleClose();
      }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Link2 className='h-4 w-4' />
            Gắn vào cây gia phả
          </DialogTitle>
          <DialogDescription>
            <strong>{user.full_name || user.email}</strong> — Liên kết tài khoản
            với thành viên trong cây.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 py-2'>
          <PersonCombobox
            label='Thành viên tương ứng'
            hint='Người này là ai trong cây gia phả? Họ có thể tự sửa hồ sơ của mình.'
            selected={linkedPerson}
            onSelect={setLinkedPerson}
          />

          {user.role === 'editor' && (
            <PersonCombobox
              label='Phạm vi sửa (tùy chọn)'
              hint='Chỉ sửa được người này và toàn bộ con cháu. Để trống = sửa toàn bộ cây.'
              selected={editRootPerson}
              onSelect={setEditRootPerson}
            />
          )}

          {user.role !== 'editor' && (
            <p className='text-xs text-muted-foreground bg-muted rounded-md p-3'>
              Phạm vi sửa chỉ áp dụng cho vai trò <strong>Biên tập viên</strong>
              . Hiện tại người dùng này là{' '}
              <strong>{USER_ROLE_META[user.role].label}</strong>.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle className='h-4 w-4 mr-2' />
                Lưu cài đặt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
