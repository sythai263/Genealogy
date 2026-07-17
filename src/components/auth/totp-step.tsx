'use client';

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
import { totpCodeSchema, type TotpCodeFormData } from '@schemas';

interface TotpStepProps {
  factorId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function TotpStep({ factorId, onSuccess, onBack }: TotpStepProps) {
  const challengeQuery = useMfaChallenge(factorId);
  const refreshChallenge = useRefreshMfaChallenge();
  const verifyMfa = useVerifyMfaCode();
  const challengeId = refreshChallenge.data ?? challengeQuery.data ?? null;

  const form = useForm<TotpCodeFormData>({
    resolver: zodResolver(totpCodeSchema),
    defaultValues: { code: '' },
  });

  function onSubmit(data: TotpCodeFormData) {
    verifyMfa.mutate(
      { factorId, code: data.code, challengeId },
      {
        onSuccess: () => {
          toast.success('Xác thực 2 bước thành công!');
          onSuccess();
        },
        onError: (error: Error) => {
          void refreshChallenge.mutateAsync(factorId).catch((refreshError: Error) => {
            console.error('[MFA] challenge error:', refreshError.message);
          });
          const is422 = isAuthServiceError(error) && error.status === 422;
          toast.error(
            is422
              ? 'Mã không đúng hoặc đã hết hạn. Kiểm tra đồng hồ thiết bị và thử lại.'
              : error.message
          );
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
          <p className="text-sm text-emerald-800">
            Nhập mã 6 chữ số từ ứng dụng xác thực (Google Authenticator).
          </p>
        </div>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã xác thực</FormLabel>
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
              Đang xác thực...
            </>
          ) : (
            'Xác nhận'
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
          Quay lại đăng nhập
        </Button>
      </form>
    </Form>
  );
}
