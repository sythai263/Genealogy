/**
 * @project AncestorTree
 * @file src/components/people/person-form-contact-section.tsx
 * @description PersonForm "contact" section — phone, email, zalo, facebook,
 *              address
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import { PersonTextField } from './person-form-fields';

export function PersonFormContactSection() {
  const t = useTranslations('People');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('form.sections.contact')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PersonTextField
            name="phone"
            label={t('form.phone')}
            placeholder={t('form.placeholders.phone')}
          />
          <PersonTextField
            name="email"
            label={t('form.email')}
            type="email"
            placeholder={t('form.placeholders.email')}
          />
          <PersonTextField
            name="zalo"
            label={t('form.zalo')}
            placeholder={t('form.placeholders.phone')}
          />
          <PersonTextField
            name="facebook"
            label={t('form.facebook')}
            placeholder={t('form.placeholders.facebook')}
          />
        </div>
        <PersonTextField
          name="address"
          label={t('form.address')}
          placeholder={t('form.placeholders.address')}
        />
      </CardContent>
    </Card>
  );
}
