/**
 * @project AncestorTree
 * @file src/components/auth/totp-step.tsx
 * @description MFA TOTP verification step after password login
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
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
import {
  useMfaChallenge,
  useRefreshMfaChallenge,
  useVerifyMfaCode,
} from '@hooks';
import { isAuthServiceError } from '@services';
import { createTotpCodeSchema, type TotpCodeFormData } from '@schemas';

interface TotpStepProps {
  factorId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function TotpStep({ factorId, onSuccess, onBack }: TotpStepProps) {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const challengeQuery = useMfaChallenge(factorId);
  const refreshChallenge = useRefreshMfaChallenge();
  const verifyMfa = useVerifyMfaCode();
  const challengeId = refreshChallenge.data ?? challengeQuery.data ?? null;
  const schema = createTotpCodeSchema(tValidation);

  const form = useForm<TotpCodeFormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  function onSubmit(data: TotpCodeFormData) {
    verifyMfa.mutate(
      { factorId, code: data.code, challengeId },
      {
        onSuccess: () => {
          toast.success(t('totp.success'));
          onSuccess();
        },
        onError: (error: Error) => {
          void refreshChallenge.mutateAsync(factorId).catch((refreshError: Error) => {
            console.error('[MFA] challenge error:', refreshError.message);
          });
          const is422 = isAuthServiceError(error) && error.status === 422;
          toast.error(is422 ? t('totp.invalidCode') : error.message);
          form.setValue('code', '');
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">{t('totp.hint')}</p>
        </div>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('totp.codeLabel')}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  className="text-center font-mono text-xl tracking-[0.4em]"
                  {...field}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value.replace(/\D/g, '').slice(0, 6)
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={verifyMfa.isPending || form.watch('code').length !== 6}
        >
          {verifyMfa.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('totp.verifying')}
            </>
          ) : (
            t('totp.confirm')
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={verifyMfa.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('totp.backToLogin')}
        </Button>
      </form>
    </Form>
  );
}
