/**
 * @project AncestorTree
 * @file src/components/contributions/contribution-form.tsx
 * @description Form to submit a new contribution suggestion
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Plus, Send } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@components/auth';
import { PersonCombobox } from '@components/people';
import {
  Button,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  CONTRIBUTION_CHANGE_TYPE_ORDER,
  CONTRIBUTION_FIELD_KEYS,
  isChangeType,
  isContributionFieldKey,
  type ContributionFieldKey,
} from '@constants';
import { useCreateContribution } from '@hooks';
import {
  createContributionFormSchema,
  defaultContributionFormValues,
  type ContributionFormData,
} from '@schemas';
import type { Person } from '@types';

interface ContributionFormProps {
  onClose: () => void;
}

export function ContributionForm({ onClose }: ContributionFormProps) {
  const t = useTranslations('Contributions');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = useMemo(
    () => createContributionFormSchema(tValidation),
    [tValidation]
  );
  const { profile } = useAuth();
  const createContribution = useCreateContribution();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultContributionFormValues,
  });

  const changes = form.watch('changes');

  function fieldLabel(key: string): string {
    if (isContributionFieldKey(key)) {
      return t(`fields.${key}`);
    }
    return key;
  }

  function addChange() {
    if (!fieldName.trim() || !fieldValue.trim()) return;
    const nextChanges = {
      ...form.getValues('changes'),
      [fieldName.trim()]: fieldValue.trim(),
    };
    form.setValue('changes', nextChanges, { shouldValidate: true });
    setFieldName('');
    setFieldValue('');
  }

  function handlePersonSelect(person: Person | null) {
    setSelectedPerson(person);
    form.setValue('target_person', person?.id ?? '', { shouldValidate: true });
  }

  function removeChange(key: string) {
    const nextChanges = { ...form.getValues('changes') };
    delete nextChanges[key];
    form.setValue('changes', nextChanges, { shouldValidate: true });
  }

  function handleSubmit(data: ContributionFormData) {
    if (!profile) {
      toast.error(t('toasts.needLogin'));
      return;
    }

    createContribution.mutate(
      {
        author_id: profile.id,
        target_person: data.target_person,
        change_type: data.change_type,
        changes: data.changes,
        reason: data.reason?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('toasts.success'));
          onClose();
        },
        onError: () => {
          toast.error(t('toasts.error'));
        },
      }
    );
  }

  const availableFields = CONTRIBUTION_FIELD_KEYS.filter(
    (key: ContributionFieldKey) => !changes[key]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="change_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.changeType')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (isChangeType(value)) field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTRIBUTION_CHANGE_TYPE_ORDER.map((changeType) => (
                    <SelectItem key={changeType} value={changeType}>
                      {t(`changeTypeForm.${changeType}`)}
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
          name="target_person"
          render={() => (
            <FormItem>
              <FormControl>
                <PersonCombobox
                  label={t('form.targetPerson')}
                  selected={selectedPerson}
                  onSelect={handlePersonSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="changes"
          render={() => (
            <FormItem>
              <FormLabel>{t('form.changes')}</FormLabel>
              {Object.entries(changes).length > 0 && (
                <div className="mb-3 space-y-2">
                  {Object.entries(changes).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm"
                    >
                      <span className="font-medium">{fieldLabel(key)}:</span>
                      <span className="flex-1 truncate">{value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => removeChange(key)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Select value={fieldName} onValueChange={setFieldName}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('form.fieldPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`fields.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={fieldValue}
                  onChange={(event) => setFieldValue(event.target.value)}
                  placeholder={t('form.valuePlaceholder')}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addChange}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.reason')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('form.reasonPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createContribution.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {createContribution.isPending ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
