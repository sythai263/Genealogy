/**
 * @project AncestorTree
 * @file src/schemas/profile.ts
 * @description Zod schemas for profile and password change forms
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { z } from 'zod';

export const profileFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Tên hiển thị là bắt buộc')
    .max(100, 'Tên hiển thị quá dài'),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const defaultChangePasswordValues: ChangePasswordFormData = {
  newPassword: '',
  confirmPassword: '',
};
