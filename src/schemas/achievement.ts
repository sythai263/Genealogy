/**
 * @project AncestorTree
 * @file src/schemas/achievement.ts
 * @description Zod schema for achievement forms (i18n via Validation factory)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

export function createAchievementSchema(t: ValidationT) {
  return z.object({
    person_id: z.string().min(1, t('achievement.personRequired')),
    title: z
      .string()
      .min(1, t('achievement.titleRequired'))
      .max(200, t('achievement.titleTooLong')),
    category: z.enum(['hoc_tap', 'su_nghiep', 'cong_hien', 'other']),
    description: z.string().max(2000).optional(),
    year: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}$/.test(val), {
        message: t('achievement.yearFormat'),
      }),
    awarded_by: z.string().max(200).optional(),
    is_featured: z.boolean(),
  });
}

export type AchievementFormData = z.infer<
  ReturnType<typeof createAchievementSchema>
>;

export const defaultAchievementValues: AchievementFormData = {
  person_id: '',
  title: '',
  category: 'hoc_tap',
  description: '',
  year: '',
  awarded_by: '',
  is_featured: false,
};
