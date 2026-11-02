/**
 * @project AncestorTree
 * @file src/components/names/name-contribute-dialog.tsx
 * @description Community submission dialog — name + gender + meaning via
 *              RHF + Zod; inserts a pending row awaiting admin approval
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
  DialogDescription,
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
import { useSubmitName } from '@hooks';
import type { z } from 'zod';

type NameSubmissionForm = z.infer<ReturnType<typeof createNameSubmissionSchema>>;

interface NameContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NameContributeDialog({
  open,
  onOpenChange,
}: NameContributeDialogProps) {
  const t = useTranslations('Names');
  const tv = useTranslations('Validation');
  const submit = useSubmitName();
  const schema = createNameSubmissionSchema(tv);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NameSubmissionForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', gender: 'male', meaning: '' },
  });

  function onSubmit(values: NameSubmissionForm) {
    submit.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>{t('contribute.title')}</DialogTitle>
          <DialogDescription>{t('contribute.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('contribute.name')}</Label>
            <Input
              id="name"
              placeholder={t('contribute.namePlaceholder')}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t('contribute.gender')}</Label>
            <Select
              value={watch('gender')}
              onValueChange={(v) =>
                setValue('gender', v as NameSubmissionForm['gender'])
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
            <Label htmlFor="meaning">{t('contribute.meaning')}</Label>
            <Textarea
              id="meaning"
              rows={3}
              placeholder={t('contribute.meaningPlaceholder')}
              {...register('meaning')}
            />
            {errors.meaning && (
              <p className="text-xs text-destructive">
                {errors.meaning.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contributor">{t('contribute.contributor')}</Label>
            <Input id="contributor" {...register('contributor_name')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submit.isPending}>
              {t('contribute.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
