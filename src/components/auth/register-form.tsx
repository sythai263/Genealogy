/**
 * @project AncestorTree
 * @file src/components/auth/register-form.tsx
 * @description User registration form
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
import { Mail } from 'lucide-react';
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
import { useSignUp } from '@hooks';
import { CLAN_INITIAL } from '@lib';
import { createRegisterSchema, type RegisterFormData } from '@schemas';

export function RegisterForm() {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Validation');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const signUp = useSignUp();
  const schema = createRegisterSchema(tValidation);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: RegisterFormData) {
    signUp.mutate(
      {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
        },
        onError: (error: Error) => {
          toast.error(error.message || t('register.failed'));
        },
      }
    );
  }

  if (registeredEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle>{t('register.checkEmailTitle')}</CardTitle>
            <CardDescription>
              {t.rich('register.checkEmailSentTo', {
                email: () => <strong>{registeredEmail}</strong>,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('register.checkEmailAdminNote')}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">{t('register.alreadyVerified')}</Link>
            </Button>
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
          <CardTitle>{t('register.title')}</CardTitle>
          <CardDescription>{t('register.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.fullName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('register.fullNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.email')}</FormLabel>
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
                    <FormLabel>{t('register.password')}</FormLabel>
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
                    <FormLabel>{t('register.confirmPassword')}</FormLabel>
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
                disabled={signUp.isPending}
              >
                {signUp.isPending
                  ? t('register.submitting')
                  : t('register.submit')}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {t('register.hasAccount')}{' '}
            </span>
            <Link href="/login" className="text-emerald-600 hover:underline">
              {t('register.loginLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
