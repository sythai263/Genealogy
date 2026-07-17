'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@components/ui';
import { useSendLoginOtp, useVerifyLoginOtp } from '@hooks';
import { isAuthServiceError } from '@services';
import {
  loginOtpCodeSchema,
  loginOtpEmailSchema,
  type LoginOtpCodeFormData,
  type LoginOtpEmailFormData,
} from '@schemas';

interface OtpEmailFormProps {
  onBack: () => void;
}

export function OtpEmailForm({ onBack }: OtpEmailFormProps) {
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const sendOtp = useSendLoginOtp();
  const verifyOtp = useVerifyLoginOtp();

  const emailForm = useForm<LoginOtpEmailFormData>({
    resolver: zodResolver(loginOtpEmailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<LoginOtpCodeFormData>({
    resolver: zodResolver(loginOtpCodeSchema),
    defaultValues: { code: '' },
  });

  function onSendOtp(data: LoginOtpEmailFormData) {
    const email = data.email.trim();
    sendOtp.mutate(email, {
      onSuccess: () => {
        setOtpEmail(email);
        setOtpStep('code');
        toast.success('Mã OTP đã được gửi đến email của bạn');
      },
      onError: (error: Error) => {
        if (error.message.toLowerCase().includes('signups not allowed')) {
          toast.error('Email này chưa có tài khoản. Vui lòng đăng ký trước.');
          return;
        }
        toast.error(error.message || 'Không thể gửi mã OTP');
      },
    });
  }

  function onVerifyOtp(data: LoginOtpCodeFormData) {
    verifyOtp.mutate(
      { email: otpEmail, token: data.code },
      {
        onSuccess: () => {
          toast.success('Đăng nhập thành công!');
          window.location.replace('/');
        },
        onError: (error: Error) => {
          const is422 = isAuthServiceError(error) && error.status === 422;
          toast.error(
            is422
              ? 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.'
              : error.message || 'Mã OTP không hợp lệ'
          );
          codeForm.setValue('code', '');
        },
      }
    );
  }

  if (otpStep === 'code') {
    return (
      <Form {...codeForm}>
        <form
          onSubmit={codeForm.handleSubmit(onVerifyOtp)}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Mail className="h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">
              Mã OTP đã gửi đến <strong>{otpEmail}</strong>. Kiểm tra hộp thư
              (kể cả spam).
            </p>
          </div>
          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã OTP (6 chữ số)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                    className="text-center font-mono text-2xl tracking-[0.5em]"
                    {...field}
                    onChange={(event) => {
                      field.onChange(
                        event.target.value.replace(/\D/g, '').slice(0, 6)
                      );
                    }}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Mã có hiệu lực trong 15 phút
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={
              verifyOtp.isPending || codeForm.watch('code').length !== 6
            }
          >
            {verifyOtp.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setOtpStep('email');
              codeForm.setValue('code', '');
            }}
            disabled={verifyOtp.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Đổi email
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...emailForm}>
      <form
        onSubmit={emailForm.handleSubmit(onSendOtp)}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Mail className="h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-800">
            Nhập email đã đăng ký — chúng tôi sẽ gửi mã OTP 6 chữ số để đăng nhập
            ngay, không cần mật khẩu.
          </p>
        </div>
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={sendOtp.isPending}>
          {sendOtp.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi mã...
            </>
          ) : (
            'Gửi mã OTP'
          )}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Đăng nhập bằng mật khẩu
        </Button>
      </form>
    </Form>
  );
}
