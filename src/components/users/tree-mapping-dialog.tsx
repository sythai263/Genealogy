/**
 * @project AncestorTree
 * @file src/components/users/tree-mapping-dialog.tsx
 * @description Dialog to link a user account to tree people (linked + edit root)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import {
  usePerson,
  useUpdateEditRootPerson,
  useUpdateLinkedPerson,
} from '@hooks';
import type { Person, Profile, UserRole } from '@types';

interface TreeMappingDialogProps {
  user: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function roleLabel(
  role: UserRole,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  const labels: Record<UserRole, string> = {
    admin: t('users.roles.admin.label'),
    editor: t('users.roles.editor.label'),
    viewer: t('users.roles.viewer.label'),
  };
  return labels[role];
}

export function TreeMappingDialog({
  user,
  open,
  onOpenChange,
}: TreeMappingDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const { data: initialLinked } = usePerson(user.linked_person);
  const { data: initialEditRoot } = usePerson(user.edit_root_person_id);

  const [linkedPerson, setLinkedPerson] = useState<Person | null>(null);
  const [editRootPerson, setEditRootPerson] = useState<Person | null>(null);
  const [initialized, setInitialized] = useState(false);

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

  const displayName = user.full_name || user.email;

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
      toast.success(t('users.toasts.treeMapSuccess', { name: displayName }));
      handleClose();
    } catch (err) {
      toast.error(t('users.toasts.treeMapError'));
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
            {t('users.treeMap.title')}
          </DialogTitle>
          <DialogDescription>
            <strong>{displayName}</strong> {t('users.treeMap.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 py-2'>
          <PersonCombobox
            label={t('users.treeMap.personLabel')}
            hint={t('users.treeMap.personHint')}
            selected={linkedPerson}
            onSelect={setLinkedPerson}
          />

          {user.role === 'editor' && (
            <PersonCombobox
              label={t('users.treeMap.editScopeLabel')}
              hint={t('users.treeMap.editScopeHint')}
              selected={editRootPerson}
              onSelect={setEditRootPerson}
            />
          )}

          {user.role !== 'editor' && (
            <p className='text-xs text-muted-foreground bg-muted rounded-md p-3'>
              {t('users.treeMap.editorOnlyHint')}{' '}
              <strong>{t('users.roles.editor.label')}</strong>.{' '}
              {t('users.treeMap.currentRoleIs', {
                role: roleLabel(user.role, t),
              })}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSaving}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                {t('users.treeMap.saving')}
              </>
            ) : (
              <>
                <CheckCircle className='h-4 w-4 mr-2' />
                {t('users.treeMap.save')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
