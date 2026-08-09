/**
 * @project AncestorTree
 * @file src/components/auth/password-login-form.tsx
 * @description Email/password login form fields
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  createLoginPasswordSchema,
  type LoginPasswordFormData,
} from '@schemas';

interface PasswordLoginFormProps {
  isLoading: boolean;
  isLocked: boolean;
  remainingSec: number;
  onSubmit: (data: LoginPasswordFormData) => void;
}

export function PasswordLoginForm({
  isLoading,
  isLocked,
  remainingSec,
  onSubmit,
}: PasswordLoginFormProps) {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const schema = createLoginPasswordSchema(tValidation);

  const form = useForm<LoginPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.email')}</FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-emerald-600 hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isLocked}
          >
            {isLoading
              ? t('login.submitting')
              : isLocked
                ? t('login.retryAfter', { seconds: remainingSec })
                : t('login.submit')}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">{t('login.noAccount')} </span>
        <Link href="/register" className="text-emerald-600 hover:underline">
          {t('login.registerLink')}
        </Link>
      </div>
    </>
  );
}
