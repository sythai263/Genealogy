'use client';

import Link from 'next/link';
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
  loginPasswordSchema,
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
  const form = useForm<LoginPasswordFormData>({
    resolver: zodResolver(loginPasswordSchema),
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
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Mật khẩu</FormLabel>
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
              Quên mật khẩu?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isLocked}
          >
            {isLoading
              ? 'Đang đăng nhập...'
              : isLocked
                ? `Thử lại sau ${remainingSec}s`
                : 'Đăng nhập'}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Chưa có tài khoản? </span>
        <Link href="/register" className="text-emerald-600 hover:underline">
          Đăng ký
        </Link>
      </div>
    </>
  );
}
