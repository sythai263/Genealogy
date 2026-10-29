/**
 * @project AncestorTree
 * @file src/components/people/person-form-bio-section.tsx
 * @description PersonForm "bio" section — occupation, biography, notes,
 *              avatar URL
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import { PersonTextareaField, PersonTextField } from './person-form-fields';

export function PersonFormBioSection() {
  const t = useTranslations('People');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('form.sections.bio')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PersonTextField
          name="occupation"
          label={t('form.occupation')}
          placeholder={t('form.placeholders.occupation')}
        />
        <PersonTextareaField
          name="biography"
          label={t('form.biography')}
          placeholder={t('form.placeholders.biography')}
          rows={4}
        />
        <PersonTextareaField
          name="notes"
          label={t('form.notes')}
          placeholder={t('form.placeholders.notes')}
          rows={3}
        />
        <PersonTextField
          name="avatar_url"
          label={t('form.avatarUrl')}
          placeholder={t('form.placeholders.avatarUrl')}
        />
      </CardContent>
    </Card>
  );
}
