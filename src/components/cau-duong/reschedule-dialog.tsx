/**
 * @project AncestorTree
 * @file src/components/cau-duong/reschedule-dialog.tsx
 * @description Dialog đổi ngày thực hiện Cầu đương
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { CalendarClock } from 'lucide-react';
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
  Input,
  Textarea,
} from '@components/ui';
import {
  createCauDuongRescheduleSchema,
  defaultCauDuongRescheduleValues,
  type CauDuongRescheduleFormData,
} from '@schemas';

interface RescheduleDialogProps {
  onConfirm: (actualDate: string, reason: string) => void;
  isPending: boolean;
}

export function RescheduleDialog({
  onConfirm,
  isPending,
}: RescheduleDialogProps) {
  const t = useTranslations('CauDuong');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = createCauDuongRescheduleSchema(tValidation);

  const [open, setOpen] = useState(false);
  const form = useForm<CauDuongRescheduleFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultCauDuongRescheduleValues,
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset(defaultCauDuongRescheduleValues);
    }
  }

  function handleSubmit(data: CauDuongRescheduleFormData) {
    onConfirm(data.actual_date, data.reason?.trim() ?? '');
    setOpen(false);
    form.reset(defaultCauDuongRescheduleValues);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <CalendarClock className='mr-1 h-3.5 w-3.5' />
          {t('actions.reschedule')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('rescheduleTitle')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'>
            <FormField
              control={form.control}
              name='actual_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.actualDateRequired')}</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
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
                      placeholder={t('form.reasonReschedulePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isPending} className='w-full'>
              {isPending ? tCommon('saving') : t('confirmReschedule')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
