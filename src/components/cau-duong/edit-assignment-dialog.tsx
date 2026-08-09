/**
 * @project AncestorTree
 * @file src/components/cau-duong/edit-assignment-dialog.tsx
 * @description Dialog sửa người được phân công Cầu đương
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
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
import type {
  CauDuongAssignmentWithPeople,
  CauDuongEligibleMember,
} from '@types';

interface EditAssignmentDialogProps {
  assignment: CauDuongAssignmentWithPeople;
  eligibleMembers: CauDuongEligibleMember[];
  onConfirm: (hostPersonId: string) => void;
  isPending: boolean;
}

export function EditAssignmentDialog({
  assignment,
  eligibleMembers,
  onConfirm,
  isPending,
}: EditAssignmentDialogProps) {
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
  const selectedName =
    eligibleMembers.find(member => member.person.id === selectedId)?.person
      .display_name ?? '...';

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({ person_id: assignment.host_person_id ?? '' });
    }
  }

  function handleSubmit(data: CauDuongAssignFormData) {
    onConfirm(data.person_id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Pencil className='mr-1 h-3.5 w-3.5' />
          {tCommon('edit')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editAssignment')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'>
            <div>
              <FormLabel>
                {t('currentHost')}{' '}
                <span className='font-medium'>
                  {assignment.host_person?.display_name ?? '—'}
                </span>
              </FormLabel>
            </div>
            <FormField
              control={form.control}
              name='person_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('changeTo')}</FormLabel>
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
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={
                isPending ||
                !selectedId ||
                selectedId === (assignment.host_person_id ?? '')
              }
              className='w-full'>
              {isPending
                ? tCommon('saving')
                : t('changeToConfirm', { name: selectedName })}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
