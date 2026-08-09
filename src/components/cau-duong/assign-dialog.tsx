/**
 * @project AncestorTree
 * @file src/components/cau-duong/assign-dialog.tsx
 * @description Dialog phân công chủ lễ Cầu đương
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  createCauDuongAssignSchema,
  type CauDuongAssignFormData,
} from '@schemas';
import type { CauDuongEligibleMember } from '@types';

interface AssignDialogProps {
  ceremonyLabel: string;
  eligibleMembers: CauDuongEligibleMember[];
  defaultPersonId?: string;
  onConfirm: (personId: string) => void;
  isPending: boolean;
}

export function AssignDialog({
  ceremonyLabel,
  eligibleMembers,
  defaultPersonId,
  onConfirm,
  isPending,
}: AssignDialogProps) {
  const t = useTranslations('CauDuong');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = createCauDuongAssignSchema(tValidation);

  const [open, setOpen] = useState(false);
  const form = useForm<CauDuongAssignFormData>({
    resolver: zodResolver(schema),
    defaultValues: { person_id: '' },
  });

  const selectedId = form.watch('person_id');
  const selectedMember = eligibleMembers.find(
    member => member.person.id === selectedId
  );

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({
        person_id: defaultPersonId || eligibleMembers[0]?.person.id || '',
      });
    }
  }

  function handleSubmit(data: CauDuongAssignFormData) {
    onConfirm(data.person_id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Zap className='mr-1 h-3.5 w-3.5' />
          {t('actions.assign')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('assignTitle', { ceremony: ceremonyLabel })}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'>
            <FormField
              control={form.control}
              name='person_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.assignPersonRequired')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectMember')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleMembers.map((member, index) => (
                        <SelectItem
                          key={member.person.id}
                          value={member.person.id}>
                          {index + 1}. {member.person.display_name}
                          {member.person.generation
                            ? ` (${t('generationLabel', {
                                generation: member.person.generation,
                              })})`
                            : ''}
                          {member.ageLunar > 0
                            ? ` — ${t('ageYears', { age: member.ageLunar })}`
                            : ''}
                          {member.person.id === defaultPersonId
                            ? t('defaultSuffix')
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMember?.person.id === defaultPersonId && (
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {t('nextInRotation')}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={isPending || !selectedId}
              className='w-full'>
              {isPending
                ? tCommon('saving')
                : t('assignConfirm', {
                    name: selectedMember?.person.display_name ?? '...',
                  })}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
