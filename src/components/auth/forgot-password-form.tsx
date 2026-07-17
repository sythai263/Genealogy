'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@schemas';

export function ForgotPasswordForm() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPassword.mutate(data.email, {
      onSuccess: () => {
        setSentEmail(data.email);
        toast.success('Email đặt lại mật khẩu đã được gửi!');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Gửi email thất bại');
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
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email để nhận link đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentEmail ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Email đặt lại mật khẩu đã được gửi đến{' '}
                <strong>{sentEmail}</strong>. Vui lòng kiểm tra hộp thư (bao gồm
                thư rác).
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={forgotPassword.isPending}
                  >
                    {forgotPassword.isPending
                      ? 'Đang gửi...'
                      : 'Gửi link đặt lại mật khẩu'}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center text-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center text-emerald-600 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
