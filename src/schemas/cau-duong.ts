/**
 * @project AncestorTree
 * @file src/schemas/cau-duong.ts
 * @description Zod schemas for Cầu đương forms (i18n via Validation factory)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

export function createCauDuongPoolSchema(t: ValidationT) {
  return z.object({
    name: z.string().min(1, t('cauDuong.poolNameRequired')),
    ancestor_id: z.string().min(1, t('cauDuong.ancestorRequired')),
    min_generation: z.number().int().min(1, t('cauDuong.minGeneration')),
    max_age_lunar: z
      .number()
      .int()
      .min(1, t('cauDuong.maxAgeMin'))
      .max(120, t('cauDuong.maxAgeMax')),
    require_married: z.boolean(),
    description: z.string().max(2000).optional(),
  });
}

export type CauDuongPoolFormData = z.infer<
  ReturnType<typeof createCauDuongPoolSchema>
>;

export const defaultCauDuongPoolValues: CauDuongPoolFormData = {
  name: '',
  ancestor_id: '',
  min_generation: 12,
  max_age_lunar: 70,
  require_married: true,
  description: '',
};

export function createCauDuongDelegateSchema(t: ValidationT) {
  return z.object({
    actual_host_id: z.string().min(1, t('cauDuong.delegateHostRequired')),
    reason: z.string().max(1000).optional(),
  });
}

export type CauDuongDelegateFormData = z.infer<
  ReturnType<typeof createCauDuongDelegateSchema>
>;

export const defaultCauDuongDelegateValues: CauDuongDelegateFormData = {
  actual_host_id: '',
  reason: '',
};

export function createCauDuongRescheduleSchema(t: ValidationT) {
  return z.object({
    actual_date: z.string().min(1, t('cauDuong.rescheduleDateRequired')),
    reason: z.string().max(1000).optional(),
  });
}

export type CauDuongRescheduleFormData = z.infer<
  ReturnType<typeof createCauDuongRescheduleSchema>
>;

export const defaultCauDuongRescheduleValues: CauDuongRescheduleFormData = {
  actual_date: '',
  reason: '',
};

export function createCauDuongAssignSchema(t: ValidationT) {
  return z.object({
    person_id: z.string().min(1, t('cauDuong.assignPersonRequired')),
  });
}

export type CauDuongAssignFormData = z.infer<
  ReturnType<typeof createCauDuongAssignSchema>
>;
