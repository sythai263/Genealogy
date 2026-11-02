/**
 * @project AncestorTree
 * @file src/components/names/name-form-dialog.tsx
 * @description Admin add/edit name dialog — name, gender, meanings
 *              (one per line, optional)
 * @version 1.1.0
 * @updated 2026-10-30
 */

'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
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
} from '@components/ui';
import { createAdminNameSchema } from '@schemas';
import { useCreateName, useUpdateName } from '@hooks';
import type { NameEntry, NameStatus } from '@types';
import type { z } from 'zod';

type NameFormValues = z.infer<ReturnType<typeof createAdminNameSchema>>;

interface NameFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null → create (approved); a row → edit it. */
  target: NameEntry | null;
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
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(createAdminNameSchema(tv)),
    defaultValues: {
      name: target?.name ?? '',
      gender: target?.gender ?? 'male',
      meanings:
        target?.meanings.map((m) => ({ value: m.meaning })) ?? [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'meanings',
  });

  const isPending = create.isPending || update.isPending;

  function onSubmit(values: NameFormValues) {
    const input = {
      name: values.name,
      gender: values.gender,
      meanings: (values.meanings ?? [])
        .map((m) => m.value.trim())
        .filter(Boolean),
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
            <Label>{t('admin.meanings')}</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={t('admin.meaningPlaceholder')}
                      {...register(`meanings.${index}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground"
                      onClick={() => remove(index)}
                      aria-label={t('admin.delete')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.meanings?.[index]?.value && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.meanings[index]?.value?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: '' })}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t('admin.addMeaning')}
            </Button>
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
