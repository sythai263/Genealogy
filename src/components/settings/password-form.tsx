/**
 * @project AncestorTree
 * @file src/components/settings/password-form.tsx
 * @description Change-password form for profile settings
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { supabase } from '@lib';
import {
  createChangePasswordSchema,
  defaultChangePasswordValues,
  type ChangePasswordFormData,
} from '@schemas';

export function PasswordForm() {
  const t = useTranslations('Settings');
  const tValidation = useTranslations('Validation');
  const schema = useMemo(
    () => createChangePasswordSchema(tValidation),
    [tValidation]
  );

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultChangePasswordValues,
  });

  async function onSubmit(data: ChangePasswordFormData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
      toast.success(t('password.toastSuccess'));
      form.reset(defaultChangePasswordValues);
    } catch {
      toast.error(t('password.toastError'));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password.newPassword')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('password.newPasswordPlaceholder')}
                  {...field}
                />
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
              <FormLabel>{t('password.confirmPassword')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('password.confirmPasswordPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('password.submitting')}
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              {t('password.submit')}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
