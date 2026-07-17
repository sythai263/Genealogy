import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const loginPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export type LoginPasswordFormData = z.infer<typeof loginPasswordSchema>;

export const loginOtpEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
});

export type LoginOtpEmailFormData = z.infer<typeof loginOtpEmailSchema>;

export const loginOtpCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Mã OTP phải có 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ gồm chữ số'),
});

export type LoginOtpCodeFormData = z.infer<typeof loginOtpCodeSchema>;

export const totpCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Mã xác thực phải có 6 chữ số')
    .regex(/^\d{6}$/, 'Mã xác thực chỉ gồm chữ số'),
});

export type TotpCodeFormData = z.infer<typeof totpCodeSchema>;
