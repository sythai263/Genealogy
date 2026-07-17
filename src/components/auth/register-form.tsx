'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { registerSchema, type RegisterFormData } from '@schemas';

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const signUp = useSignUp();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
          toast.error(error.message || 'Đăng ký thất bại');
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
            <CardTitle>Kiểm tra email</CardTitle>
            <CardDescription>
              Chúng tôi đã gửi email xác nhận đến{' '}
              <strong>{registeredEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Vui lòng nhấp vào liên kết trong email để xác nhận tài khoản. Sau
              khi xác nhận email, quản trị viên sẽ duyệt tài khoản của bạn.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Đã xác nhận? Đăng nhập</Link>
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
          <CardTitle>Đăng ký</CardTitle>
          <CardDescription>
            Tạo tài khoản để truy cập Gia Phả Điện Tử
          </CardDescription>
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
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu</FormLabel>
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
                {signUp.isPending ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link href="/login" className="text-emerald-600 hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
