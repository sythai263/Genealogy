/**
 * @project AncestorTree
 * @file src/components/settings/mfa-enroll-panel.tsx
 * @description MFA enrollment QR + TOTP verification form
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import Image from 'next/image';
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
import { totpCodeSchema, type TotpCodeFormData } from '@schemas';
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
  const form = useForm<TotpCodeFormData>({
    resolver: zodResolver(totpCodeSchema),
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
          <p className="font-medium">Bước 1: Quét mã QR</p>
          <p>
            Mở Google Authenticator → Thêm tài khoản → Quét mã QR bên dưới.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <Image
            src={enrollState.qrCode}
            alt="QR code cho Google Authenticator"
            width={180}
            height={180}
            unoptimized
          />
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Không quét được mã QR? Nhập thủ công
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
                  Bước 2: Nhập mã xác thực ({MFA_TOTP_CODE_LENGTH} chữ số)
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={MFA_TOTP_CODE_LENGTH}
                    placeholder="000000"
                    autoFocus
                    className="max-w-[180px] text-center font-mono text-xl tracking-[0.4em]"
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
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Xác nhận & Bật
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
