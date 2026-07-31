/**
 * @project AncestorTree
 * @file src/components/settings/password-form.tsx
 * @description Change-password form for profile settings
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

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
  changePasswordSchema,
  defaultChangePasswordValues,
  type ChangePasswordFormData,
} from '@schemas';

export function PasswordForm() {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: defaultChangePasswordValues,
  });

  async function onSubmit(data: ChangePasswordFormData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
      toast.success('Đã đổi mật khẩu thành công');
      form.reset(defaultChangePasswordValues);
    } catch {
      toast.error('Lỗi khi đổi mật khẩu');
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
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
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
              <FormLabel>Xác nhận mật khẩu mới</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
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
              Đang đổi...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Đổi mật khẩu
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
