/**
 * @project AncestorTree
 * @file src/components/people/add-relation-dialog.tsx
 * @description Dialog for adding a spouse or child — either creating a new
 *              person inline or linking an existing one via PersonCombobox
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import {
  useAddChildToFamilyMutation,
  useCreatePerson,
  useCreateSpouseFamily,
} from '@hooks';
import {
  buildPersonHandle,
  buildSpousePersonInput,
  splitVietnameseName,
} from '@lib';
import type { Person } from '@types';
import { PersonCombobox } from './person-combobox';
import { QuickPersonForm, type QuickPersonData } from './quick-person-form';

export type AddRelationDialogMode = 'spouse' | 'child';

interface AddRelationDialogProps {
  open: boolean;
  onClose: () => void;
  mode: AddRelationDialogMode;
  currentPerson: Person;
  targetFamilyId?: string;
  targetSpouse?: Person | null;
  excludePersonIds?: string[];
  onSuccess: () => void;
}

export function AddRelationDialog({
  open,
  onClose,
  mode,
  currentPerson,
  targetFamilyId,
  targetSpouse,
  excludePersonIds = [],
  onSuccess,
}: AddRelationDialogProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const [tab, setTab] = useState<'new' | 'existing'>('new');
  const [isSaving, setIsSaving] = useState(false);
  const createPersonMutation = useCreatePerson();
  const createSpouseFamilyMutation = useCreateSpouseFamily();
  const addChildMutation = useAddChildToFamilyMutation(currentPerson.id);

  const defaultGender: 1 | 2 =
    mode === 'spouse' ? (currentPerson.gender === 1 ? 2 : 1) : 1;
  const defaultGeneration =
    mode === 'spouse'
      ? currentPerson.generation
      : currentPerson.generation + 1;

  async function linkSpouse(spouseId: string) {
    await createSpouseFamilyMutation.mutateAsync({
      personId: currentPerson.id,
      personGender: currentPerson.gender,
      spouseId,
      targetFamilyId: mode === 'spouse' ? targetFamilyId : undefined,
    });
  }

  async function linkChild(childPersonId: string) {
    await addChildMutation.mutateAsync({
      familyId: targetFamilyId,
      childPersonId,
      parentPersonId: currentPerson.id,
      parentGender: currentPerson.gender,
    });
  }

  async function handleCreateNew(data: QuickPersonData) {
    setIsSaving(true);
    try {
      const birthYear = data.birth_year ? Number(data.birth_year) : undefined;
      const newPerson = await createPersonMutation.mutateAsync(
        mode === 'spouse'
          ? buildSpousePersonInput({
              fullName: data.display_name,
              birthYear,
              marriedTo: currentPerson,
            })
          : {
              handle: buildPersonHandle(data.display_name),
              display_name: data.display_name,
              ...splitVietnameseName(data.display_name),
              gender: data.gender,
              generation: data.generation,
              chi: currentPerson.chi,
              birth_year: birthYear,
              is_living: true,
              is_patrilineal: data.gender === 1,
              privacy_level: currentPerson.privacy_level,
            }
      );

      if (mode === 'spouse') {
        await linkSpouse(newPerson.id);
      } else {
        await linkChild(newPerson.id);
      }

      toast.success(
        mode === 'spouse'
          ? t('relations.toastAddSpouse')
          : t('relations.toastAddChild')
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('relations.toastError')
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectExisting(person: Person) {
    setIsSaving(true);
    try {
      if (mode === 'spouse') {
        await linkSpouse(person.id);
      } else {
        await linkChild(person.id);
      }

      toast.success(
        mode === 'spouse'
          ? t('relations.toastLinkSpouse')
          : t('relations.toastLinkChild')
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('relations.toastError')
      );
    } finally {
      setIsSaving(false);
    }
  }

  const spouseLabel =
    currentPerson.gender === 1
      ? t('relations.wife').toLowerCase()
      : t('relations.husband').toLowerCase();
  const title =
    mode === 'spouse'
      ? t('relations.addSpouseFor', {
          role: spouseLabel,
          name: currentPerson.display_name,
        })
      : targetSpouse
        ? t('relations.addChildForCouple', {
            name: currentPerson.display_name,
            spouse: targetSpouse.display_name,
          })
        : t('relations.addChildFor', { name: currentPerson.display_name });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {mode === 'child' && (
          <p className="text-sm text-muted-foreground">
            {t('relations.childFamilyHint')}{' '}
            <span className="font-medium text-foreground">
              {currentPerson.gender === 1
                ? `${currentPerson.display_name}${targetSpouse ? ` & ${targetSpouse.display_name}` : ''}`
                : `${targetSpouse ? `${targetSpouse.display_name} & ` : ''}${currentPerson.display_name}`}
            </span>
          </p>
        )}

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'new' | 'existing')}
        >
          <TabsList className="w-full">
            <TabsTrigger value="new" className="flex-1">
              <UserPlus className="mr-2 h-4 w-4" />
              {tCommon('create')}
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              {t('relations.selectExisting')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-4">
            <QuickPersonForm
              defaultGender={defaultGender}
              defaultGeneration={defaultGeneration}
              onSubmit={handleCreateNew}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value="existing" className="mt-4">
            <PersonCombobox
              selected={null}
              excludeIds={[currentPerson.id, ...excludePersonIds]}
              onSelect={(person) => {
                if (person) void handleSelectExisting(person);
              }}
              disabled={isSaving}
              placeholder={t('relations.searchPlaceholder')}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
