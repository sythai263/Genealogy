/**
 * @project AncestorTree
 * @file src/components/cau-duong/pool-form.tsx
 * @description Form tạo / sửa nhóm Cầu đương
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { PersonCombobox } from '@components/people';
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePerson } from '@hooks';
import {
  createCauDuongPoolSchema,
  defaultCauDuongPoolValues,
  type CauDuongPoolFormData,
} from '@schemas';
import type { CauDuongPool, Person } from '@types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface PoolFormProps {
  pool?: CauDuongPool;
  onSubmit: (data: CauDuongPoolFormData) => void;
  isPending: boolean;
}

export function PoolForm({ pool, onSubmit, isPending }: PoolFormProps) {
  const t = useTranslations('CauDuong');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = createCauDuongPoolSchema(tValidation);

  const { data: loadedAncestor } = usePerson(pool?.ancestor_id);
  // `undefined` = user has not touched the picker yet, so fall back to the
  // ancestor loaded from the pool being edited.
  const [pickedAncestor, setPickedAncestor] = useState<
    Person | null | undefined
  >();

  const selectedAncestor =
    pickedAncestor !== undefined ? pickedAncestor : (loadedAncestor ?? null);

  const form = useForm<CauDuongPoolFormData>({
    resolver: zodResolver(schema),
    defaultValues: pool
      ? {
          name: pool.name,
          ancestor_id: pool.ancestor_id,
          min_generation: pool.min_generation,
          max_age_lunar: pool.max_age_lunar,
          require_married: pool.require_married,
          description: pool.description ?? '',
        }
      : defaultCauDuongPoolValues,
  });

  function handleAncestorSelect(person: Person | null) {
    setPickedAncestor(person);
    form.setValue('ancestor_id', person?.id ?? '', { shouldValidate: true });
  }

  function handleSubmit(data: CauDuongPoolFormData) {
    onSubmit({
      ...data,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.poolNameRequired')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('form.poolNamePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='ancestor_id'
          render={() => (
            <FormItem>
              <FormControl>
                <PersonCombobox
                  label={t('form.ancestorLabel')}
                  selected={selectedAncestor}
                  onSelect={handleAncestorSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='min_generation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.minGeneration')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={1}
                    value={field.value}
                    onChange={event =>
                      field.onChange(event.target.valueAsNumber || 1)
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='max_age_lunar'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.maxAgeLunarUnder')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={1}
                    max={120}
                    value={field.value}
                    onChange={event =>
                      field.onChange(event.target.valueAsNumber || 1)
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='require_married'
          render={({ field }) => (
            <FormItem className='flex items-center gap-2 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={checked =>
                    field.onChange(checked === true)
                  }
                />
              </FormControl>
              <FormLabel className='cursor-pointer font-normal'>
                {t('form.requireMarriedDetail')}
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description')}</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder={t('form.descriptionPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending} className='w-full'>
          {isPending
            ? tCommon('saving')
            : pool
              ? tCommon('update')
              : t('actions.createPool')}
        </Button>
      </form>
    </Form>
  );
}
