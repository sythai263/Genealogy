/**
 * @project AncestorTree
 * @file src/components/achievements/achievement-form.tsx
 * @description Achievement create/edit form with searchable person picker
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonCombobox } from '@components/people';
import {
  Button,
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
  Switch,
  Textarea,
} from '@components/ui';
import { usePerson } from '@hooks';
import {
  createAchievementSchema,
  defaultAchievementValues,
  type AchievementFormData,
} from '@schemas';
import { ACHIEVEMENT_FORM_CATEGORY_VALUES } from '@constants';
import type { Achievement, Person } from '@types';

interface AchievementFormProps {
  achievement?: Achievement;
  onSubmit: (data: AchievementFormData) => void;
  isPending: boolean;
}

export function AchievementForm({
  achievement,
  onSubmit,
  isPending,
}: AchievementFormProps) {
  const t = useTranslations('Achievements');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = useMemo(
    () => createAchievementSchema(tValidation),
    [tValidation]
  );
  const { data: loadedPerson } = usePerson(achievement?.person_id);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const form = useForm<AchievementFormData>({
    resolver: zodResolver(schema),
    defaultValues: achievement
      ? {
          person_id: achievement.person_id,
          title: achievement.title,
          category: achievement.category,
          description: achievement.description ?? '',
          year: achievement.year?.toString() ?? '',
          awarded_by: achievement.awarded_by ?? '',
          is_featured: achievement.is_featured,
        }
      : defaultAchievementValues,
  });

  useEffect(() => {
    if (loadedPerson) {
      setSelectedPerson(loadedPerson);
    }
  }, [loadedPerson]);

  function handlePersonSelect(person: Person | null) {
    setSelectedPerson(person);
    form.setValue('person_id', person?.id ?? '', { shouldValidate: true });
  }

  function handleSubmit(data: AchievementFormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="person_id"
          render={() => (
            <FormItem>
              <FormControl>
                <PersonCombobox
                  label={`${t('form.person')} *`}
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.title')} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('form.titlePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.category')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACHIEVEMENT_FORM_CATEGORY_VALUES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`categories.${category}`)}
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
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.year')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="awarded_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.awardedBy')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('form.awardedByPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description')}</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{t('form.isFeatured')}</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? tCommon('saving')
            : achievement
              ? tCommon('update')
              : tCommon('create')}
        </Button>
      </form>
    </Form>
  );
}
