/**
 * @project AncestorTree
 * @file src/components/auth/forgot-password-form.tsx
 * @description Forgot password request form
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
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
import { useForgotPassword } from '@hooks';
import { CLAN_INITIAL } from '@lib';
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@schemas';

export function ForgotPasswordForm() {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();
  const schema = createForgotPasswordSchema(tValidation);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPassword.mutate(data.email, {
      onSuccess: () => {
        setSentEmail(data.email);
        toast.success(t('forgotPassword.success'));
      },
      onError: (error: Error) => {
        toast.error(error.message || t('forgotPassword.failed'));
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-xl font-bold text-white">
            {CLAN_INITIAL}
          </div>
          <CardTitle>{t('forgotPassword.title')}</CardTitle>
          <CardDescription>{t('forgotPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sentEmail ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t.rich('forgotPassword.sentTo', {
                  email: () => <strong>{sentEmail}</strong>,
                })}
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('forgotPassword.backToLogin')}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forgotPassword.email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={forgotPassword.isPending}
                  >
                    {forgotPassword.isPending
                      ? t('forgotPassword.submitting')
                      : t('forgotPassword.submit')}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center text-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center text-emerald-600 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
