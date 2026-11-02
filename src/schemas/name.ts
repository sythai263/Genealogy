/**
 * @project AncestorTree
 * @file src/schemas/name.ts
 * @description Zod schema for the name-contribution form (i18n factory)
 * @version 1.0.0
 * @updated 2026-10-30
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

export function createNameSubmissionSchema(t: ValidationT) {
  return z.object({
    name: z
      .string()
      .min(1, t('common.required'))
      .max(60, t('common.tooLong')),
    gender: z.enum(['male', 'female', 'both']),
    meaning: z
      .string()
      .min(1, t('common.required'))
      .max(500, t('common.tooLong')),
    contributor_name: z.string().max(100, t('common.tooLong')).optional(),
    contributor_note: z.string().max(300, t('common.tooLong')).optional(),
  });
}

/** Admin form — meanings as a repeatable list of inputs. */
export function createAdminNameSchema(t: ValidationT) {
  return z.object({
    name: z
      .string()
      .min(1, t('common.required'))
      .max(60, t('common.tooLong')),
    gender: z.enum(['male', 'female', 'both']),
    meanings: z
      .array(
        z.object({ value: z.string().max(500, t('common.tooLong')) })
      )
      .optional(),
  });
}
