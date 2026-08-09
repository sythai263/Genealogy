/**
 * @project AncestorTree
 * @file src/components/auth/otp-email-form.tsx
 * @description Email OTP login flow (send + verify)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  createLoginOtpCodeSchema,
  createLoginOtpEmailSchema,
  type LoginOtpCodeFormData,
  type LoginOtpEmailFormData,
} from '@schemas';

interface OtpEmailFormProps {
  onBack: () => void;
}

export function OtpEmailForm({ onBack }: OtpEmailFormProps) {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const sendOtp = useSendLoginOtp();
  const verifyOtp = useVerifyLoginOtp();

  const emailSchema = createLoginOtpEmailSchema(tValidation);
  const codeSchema = createLoginOtpCodeSchema(tValidation);

  const emailForm = useForm<LoginOtpEmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<LoginOtpCodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  function onSendOtp(data: LoginOtpEmailFormData) {
    const email = data.email.trim();
    sendOtp.mutate(email, {
      onSuccess: () => {
        setOtpEmail(email);
        setOtpStep('code');
        toast.success(t('otp.codeSent'));
      },
      onError: (error: Error) => {
        if (error.message.toLowerCase().includes('signups not allowed')) {
          toast.error(t('otp.noAccount'));
          return;
        }
        toast.error(error.message || t('otp.sendFailed'));
      },
    });
  }

  function onVerifyOtp(data: LoginOtpCodeFormData) {
    verifyOtp.mutate(
      { email: otpEmail, token: data.code },
      {
        onSuccess: () => {
          toast.success(t('login.success'));
          window.location.replace('/admin');
        },
        onError: (error: Error) => {
          const is422 = isAuthServiceError(error) && error.status === 422;
          toast.error(
            is422 ? t('otp.expiredCode') : error.message || t('otp.invalidCode')
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
              {t.rich('otp.codeSentBanner', {
                email: () => <strong>{otpEmail}</strong>,
              })}
            </p>
          </div>
          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('otp.codeLabelDigits')}</FormLabel>
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
                <p className="text-xs text-muted-foreground">{t('otp.validFor')}</p>
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
                {t('totp.confirming')}
              </>
            ) : (
              t('login.submit')
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
            {t('otp.changeEmail')}
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
          <p className="text-sm text-blue-800">{t('otp.emailHint')}</p>
        </div>
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.email')}</FormLabel>
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
              {t('otp.sendingCode')}
            </>
          ) : (
            t('otp.sendCode')
          )}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('otp.passwordLogin')}
        </Button>
      </form>
    </Form>
  );
}
