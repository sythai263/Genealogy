/**
 * @project AncestorTree
 * @file src/schemas/auth.ts
 * @description Auth form Zod schemas (i18n via Validation translator factory)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

export function createForgotPasswordSchema(t: ValidationT) {
  return z.object({
    email: z
      .string()
      .min(1, t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
  });
}

export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export function createLoginPasswordSchema(t: ValidationT) {
  return z.object({
    email: z
      .string()
      .min(1, t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
    password: z.string().min(1, t('auth.passwordRequired')),
  });
}

export type LoginPasswordFormData = z.infer<
  ReturnType<typeof createLoginPasswordSchema>
>;

export function createLoginOtpEmailSchema(t: ValidationT) {
  return z.object({
    email: z
      .string()
      .min(1, t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
  });
}

export type LoginOtpEmailFormData = z.infer<
  ReturnType<typeof createLoginOtpEmailSchema>
>;

export function createLoginOtpCodeSchema(t: ValidationT) {
  return z.object({
    code: z
      .string()
      .length(6, t('auth.otpLength'))
      .regex(/^\d{6}$/, t('auth.otpDigitsOnly')),
  });
}

export type LoginOtpCodeFormData = z.infer<
  ReturnType<typeof createLoginOtpCodeSchema>
>;

export function createTotpCodeSchema(t: ValidationT) {
  return z.object({
    code: z
      .string()
      .length(6, t('auth.totpLength'))
      .regex(/^\d{6}$/, t('auth.totpDigitsOnly')),
  });
}

export type TotpCodeFormData = z.infer<ReturnType<typeof createTotpCodeSchema>>;

export function createRegisterSchema(t: ValidationT) {
  return z
    .object({
      fullName: z
        .string()
        .min(1, t('auth.fullNameRequired'))
        .max(100, t('auth.fullNameTooLong')),
      email: z
        .string()
        .min(1, t('auth.emailRequired'))
        .email(t('auth.emailInvalid')),
      password: z.string().min(8, t('auth.passwordMin8')),
      confirmPassword: z.string().min(1, t('auth.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

export function createResetPasswordSchema(t: ValidationT) {
  return z
    .object({
      password: z.string().min(6, t('auth.passwordMin6')),
      confirmPassword: z.string().min(1, t('auth.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type ResetPasswordFormData = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
