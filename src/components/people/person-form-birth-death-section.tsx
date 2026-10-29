/**
 * @project AncestorTree
 * @file src/components/people/person-form-birth-death-section.tsx
 * @description PersonForm "birth & death" section — birth info, death fields
 *              shown when the person is not living, hometown
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import type { PersonFormData } from '@schemas';
import { PersonNumberField, PersonTextField } from './person-form-fields';

export function PersonFormBirthDeathSection() {
  const t = useTranslations('People');
  const { watch } = useFormContext<PersonFormData>();
  const isLiving = watch('is_living');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('form.sections.birthDeath')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PersonNumberField
            name="birth_year"
            label={t('form.birthYear')}
            placeholder={t('form.placeholders.birthYear')}
          />
          <PersonTextField
            name="birth_date"
            label={t('form.birthDate')}
            type="date"
          />
          <PersonTextField
            name="birth_place"
            label={t('form.birthPlace')}
            placeholder={t('form.placeholders.birthPlace')}
          />
        </div>

        {!isLiving && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <PersonNumberField
              name="death_year"
              label={t('form.deathYear')}
              placeholder={t('form.placeholders.deathYear')}
            />
            <PersonTextField
              name="death_date"
              label={t('form.deathDate')}
              type="date"
            />
            <PersonTextField
              name="death_lunar"
              label={t('form.deathLunar')}
              placeholder={t('form.placeholders.deathLunar')}
              description={t('form.deathLunarHint')}
            />
            <PersonTextField
              name="death_place"
              label={t('form.deathPlace')}
              placeholder={t('form.placeholders.deathPlace')}
            />
          </div>
        )}

        <PersonTextField
          name="hometown"
          label={t('form.hometown')}
          placeholder={t('form.placeholders.hometown')}
        />
      </CardContent>
    </Card>
  );
}
