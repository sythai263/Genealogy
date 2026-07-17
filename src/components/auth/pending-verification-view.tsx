'use client';

import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useAuth } from '@components/auth';

export function PendingVerificationView() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <ShieldCheck className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Chờ xác nhận tài khoản</CardTitle>
          <CardDescription className="text-base">
            Tài khoản của bạn đã được đăng ký thành công.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vui lòng chờ quản trị viên xác nhận tài khoản để truy cập đầy đủ hệ
            thống gia phả. Bạn sẽ được thông báo khi tài khoản được kích hoạt.
          </p>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Nếu bạn cho rằng đây là lỗi, hãy liên hệ quản trị viên dòng họ.
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
