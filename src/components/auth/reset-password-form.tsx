'use client';

import { useRouter } from 'next/navigation';
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
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@schemas';

export function ResetPasswordForm() {
  const router = useRouter();
  const { isReady } = usePasswordRecoveryReady();
  const updatePasswordMutation = useUpdatePassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(data: ResetPasswordFormData) {
    updatePasswordMutation.mutate(data.password, {
      onSuccess: () => {
        toast.success('Đặt lại mật khẩu thành công!');
        router.push('/');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Đặt lại mật khẩu thất bại');
      },
    });
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center text-muted-foreground">
            Đang xác thực link đặt lại mật khẩu...
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
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập mật khẩu mới cho tài khoản của bạn
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
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
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending
                  ? 'Đang cập nhật...'
                  : 'Đặt lại mật khẩu'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
