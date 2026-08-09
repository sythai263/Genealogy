/**
 * @project AncestorTree
 * @file src/components/auth/reset-password-form.tsx
 * @description Reset password form after recovery link
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@components/ui';
import { usePasswordRecoveryReady, useUpdatePassword } from '@hooks';
import { CLAN_INITIAL } from '@lib';
import {
  createResetPasswordSchema,
  type ResetPasswordFormData,
} from '@schemas';

export function ResetPasswordForm() {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const router = useRouter();
  const { isReady } = usePasswordRecoveryReady();
  const updatePasswordMutation = useUpdatePassword();
  const schema = createResetPasswordSchema(tValidation);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: ResetPasswordFormData) {
    updatePasswordMutation.mutate(data.password, {
      onSuccess: () => {
        toast.success(t('resetPassword.success'));
        router.push('/admin');
      },
      onError: (error: Error) => {
        toast.error(error.message || t('resetPassword.failed'));
      },
    });
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('resetPassword.verifyingLink')}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-xl font-bold text-white">
            {CLAN_INITIAL}
          </div>
          <CardTitle>{t('resetPassword.title')}</CardTitle>
          <CardDescription>{t('resetPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resetPassword.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resetPassword.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending
                  ? t('resetPassword.updating')
                  : t('resetPassword.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
