/**
 * @project AncestorTree
 * @file src/schemas/profile.ts
 * @description Zod schemas for profile and password forms (i18n via Validation factory)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

export function createProfileFormSchema(t: ValidationT) {
  return z.object({
    full_name: z
      .string()
      .trim()
      .min(1, t('profile.displayNameRequired'))
      .max(100, t('profile.displayNameTooLong')),
  });
}

export type ProfileFormData = z.infer<ReturnType<typeof createProfileFormSchema>>;

export function createChangePasswordSchema(t: ValidationT) {
  return z
    .object({
      newPassword: z.string().min(8, t('profile.passwordMin8')),
      confirmPassword: z.string().min(1, t('profile.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('profile.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type ChangePasswordFormData = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

export const defaultChangePasswordValues: ChangePasswordFormData = {
  newPassword: '',
  confirmPassword: '',
};
