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

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Họ và tên là bắt buộc')
      .max(100, 'Họ và tên quá dài'),
    email: z
      .string()
      .min(1, 'Email là bắt buộc')
      .email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
