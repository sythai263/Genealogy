/**
 * @project AncestorTree
 * @file src/components/people/person-form-basic-section.tsx
 * @description PersonForm "basic" section — names, gender, generation, chi,
 *              privacy level, living/patrilineal flags
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import type { PersonFormData } from '@schemas';
import {
  PersonCheckboxField,
  PersonNumberField,
  PersonTextField,
} from './person-form-fields';

interface PersonFormBasicSectionProps {
  lockedGeneration?: number;
}

export function PersonFormBasicSection({
  lockedGeneration,
}: PersonFormBasicSectionProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const { control } = useFormContext<PersonFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('form.sections.basic')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PersonTextField
            name="display_name"
            label={`${t('form.displayName')} *`}
            placeholder={t('form.placeholders.displayName')}
          />
          <PersonTextField
            name="handle"
            label={`${t('form.handle')} *`}
            placeholder={t('form.placeholders.handle')}
            description={t('form.handleHint')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PersonTextField
            name="surname"
            label={t('form.surname')}
            placeholder={t('form.placeholders.surname')}
          />
          <PersonTextField
            name="middle_name"
            label={t('form.middleName')}
            placeholder={t('form.placeholders.middleName')}
          />
          <PersonTextField
            name="first_name"
            label={t('form.firstName')}
            placeholder={t('form.placeholders.firstName')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PersonTextField
            name="pen_name"
            label={t('form.penName')}
            placeholder={t('form.placeholders.penName')}
            description={t('form.penNameHint')}
          />
          <PersonTextField
            name="taboo_name"
            label={t('form.tabooName')}
            placeholder={t('form.placeholders.tabooName')}
            description={t('form.tabooNameHint')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.gender')} *</FormLabel>
                <Select
                  onValueChange={(v) =>
                    field.onChange(parseInt(v, 10) as 1 | 2)
                  }
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('form.placeholders.select')}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">{tCommon('male')}</SelectItem>
                    <SelectItem value="2">{tCommon('female')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <PersonNumberField
            name="generation"
            label={`${t('form.generation')} *`}
            min={1}
            max={20}
            disabled={lockedGeneration !== undefined}
            className={
              lockedGeneration !== undefined
                ? 'bg-muted text-muted-foreground'
                : ''
            }
            description={
              lockedGeneration !== undefined
                ? t('form.generationLocked')
                : undefined
            }
          />

          <PersonNumberField name="chi" label={t('form.chi')} min={1} max={10} />

          <FormField
            control={control}
            name="privacy_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.privacy')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">{t('form.privacyPublic')}</SelectItem>
                    <SelectItem value="1">{t('form.privacyMembers')}</SelectItem>
                    <SelectItem value="2">{t('form.privacyPrivate')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-6">
          <PersonCheckboxField name="is_living" label={t('form.isLiving')} />
          <PersonCheckboxField
            name="is_patrilineal"
            label={t('form.isPatrilineal')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
