/**
 * @project AncestorTree
 * @file src/components/settings/mfa-enroll-panel.tsx
 * @description MFA enrollment QR + TOTP verification form
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, QrCode } from 'lucide-react';
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
import { MFA_TOTP_CODE_LENGTH } from '@constants';
import { createTotpCodeSchema, type TotpCodeFormData } from '@schemas';
import type { MfaEnrollState } from '@types';

interface MfaEnrollPanelProps {
  enrollState: MfaEnrollState;
  isVerifying: boolean;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

export function MfaEnrollPanel({
  enrollState,
  isVerifying,
  onVerify,
  onCancel,
}: MfaEnrollPanelProps) {
  const t = useTranslations('Settings');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = useMemo(
    () => createTotpCodeSchema(tValidation),
    [tValidation]
  );
  const form = useForm<TotpCodeFormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  async function onSubmit(data: TotpCodeFormData) {
    await onVerify(data.code);
    form.reset({ code: '' });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="space-y-1 text-sm text-blue-800">
          <p className="font-medium">{t('security.step1Title')}</p>
          <p>{t('security.step1Body')}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <Image
            src={enrollState.qrCode}
            alt={t('security.qrAlt')}
            width={180}
            height={180}
            // Inline data: URL from the MFA enrolment response — nothing to optimise
            unoptimized
          />
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          {t('security.manualEntry')}
        </summary>
        <div className="mt-2 select-all break-all rounded bg-muted p-2 font-mono text-xs">
          {enrollState.secret}
        </div>
      </details>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('security.step2Label', { count: MFA_TOTP_CODE_LENGTH })}
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={MFA_TOTP_CODE_LENGTH}
                    placeholder="000000"
                    autoFocus
                    className="max-w-45 text-center font-mono text-xl tracking-[0.4em]"
                    {...field}
                    onChange={(event) => {
                      const next = event.target.value
                        .replace(/\D/g, '')
                        .slice(0, MFA_TOTP_CODE_LENGTH);
                      field.onChange(next);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                isVerifying ||
                form.watch('code').length !== MFA_TOTP_CODE_LENGTH
              }
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('security.verifying')}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('security.confirmEnable')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isVerifying}
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
