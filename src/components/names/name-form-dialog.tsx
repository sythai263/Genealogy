/**
 * @project AncestorTree
 * @file src/components/names/name-form-dialog.tsx
 * @description Admin add/edit name dialog — name, gender, meaning (+ status
 *              on edit)
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import { createNameSubmissionSchema } from '@schemas';
import { useCreateName, useUpdateName } from '@hooks';
import type { NameMeaning, NameStatus } from '@types';
import type { z } from 'zod';

type NameFormValues = z.infer<ReturnType<typeof createNameSubmissionSchema>>;

interface NameFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null → create (approved); a row → edit it. */
  target: NameMeaning | null;
}

export function NameFormDialog({
  open,
  onOpenChange,
  target,
}: NameFormDialogProps) {
  const t = useTranslations('Names');
  const tv = useTranslations('Validation');
  const create = useCreateName();
  const update = useUpdateName();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(createNameSubmissionSchema(tv)),
    defaultValues: {
      name: target?.name ?? '',
      gender: target?.gender ?? 'male',
      meaning: target?.meaning ?? '',
      contributor_name: target?.contributor_name ?? undefined,
    },
  });

  const isPending = create.isPending || update.isPending;

  function onSubmit(values: NameFormValues) {
    const input = {
      name: values.name,
      gender: values.gender,
      meaning: values.meaning,
      status: (target?.status ?? 'approved') as NameStatus,
    };
    if (target) {
      update.mutate(
        { id: target.id, input },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>
            {target ? t('admin.edit') : t('admin.add')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('contribute.name')}</Label>
            <Input {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t('contribute.gender')}</Label>
            <Select
              value={watch('gender')}
              onValueChange={(v) =>
                setValue('gender', v as NameFormValues['gender'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('filters.male')}</SelectItem>
                <SelectItem value="female">{t('filters.female')}</SelectItem>
                <SelectItem value="both">{t('card.both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('contribute.meaning')}</Label>
            <Textarea rows={3} {...register('meaning')} />
            {errors.meaning && (
              <p className="text-xs text-destructive">
                {errors.meaning.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {t('contribute.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
