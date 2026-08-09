/**
 * @project AncestorTree
 * @file src/schemas/contribution.ts
 * @description Zod schema for contribution form (i18n via Validation factory)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

export function createContributionFormSchema(t: ValidationT) {
  return z.object({
    change_type: z.enum(['create', 'update', 'delete']),
    target_person: z.string().min(1, t('contribution.targetPersonRequired')),
    reason: z.string().max(2000).optional(),
    changes: z
      .record(z.string(), z.string())
      .refine((value) => Object.keys(value).length > 0, {
        message: t('contribution.changesRequired'),
      }),
  });
}

export type ContributionFormData = z.infer<
  ReturnType<typeof createContributionFormSchema>
>;

export const defaultContributionFormValues: ContributionFormData = {
  change_type: 'update',
  target_person: '',
  reason: '',
  changes: {},
};
