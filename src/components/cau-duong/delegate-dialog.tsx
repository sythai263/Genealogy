/**
 * @project AncestorTree
 * @file src/components/cau-duong/delegate-dialog.tsx
 * @description Dialog ủy quyền Cầu đương
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { UserCheck } from 'lucide-react';
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
  Textarea,
} from '@components/ui';
import {
  createCauDuongDelegateSchema,
  defaultCauDuongDelegateValues,
  type CauDuongDelegateFormData,
} from '@schemas';
import type { CauDuongEligibleMember } from '@types';

interface DelegateDialogProps {
  eligibleMembers: CauDuongEligibleMember[];
  onConfirm: (actualHostId: string, reason: string) => void;
  isPending: boolean;
}

export function DelegateDialog({
  eligibleMembers,
  onConfirm,
  isPending,
}: DelegateDialogProps) {
  const t = useTranslations('CauDuong');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = createCauDuongDelegateSchema(tValidation);

  const [open, setOpen] = useState(false);
  const form = useForm<CauDuongDelegateFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultCauDuongDelegateValues,
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset(defaultCauDuongDelegateValues);
    }
  }

  function handleSubmit(data: CauDuongDelegateFormData) {
    onConfirm(data.actual_host_id, data.reason?.trim() ?? '');
    setOpen(false);
    form.reset(defaultCauDuongDelegateValues);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <UserCheck className='mr-1 h-3.5 w-3.5' />
          {t('actions.delegate')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delegateTitle')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'>
            <FormField
              control={form.control}
              name='actual_host_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.delegateHostRequired')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectMember')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleMembers.map(member => (
                        <SelectItem
                          key={member.person.id}
                          value={member.person.id}>
                          {member.person.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.reason')}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder={t('form.reasonDelegatePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isPending} className='w-full'>
              {isPending ? tCommon('saving') : t('confirmDelegate')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
