/**
 * @project AncestorTree
 * @file src/components/settings/profile-settings-view.tsx
 * @description Profile settings page layout — info + password cards
 * @version 1.0.0
 * @updated 2026-07-18
 */

import Link from 'next/link';
import { ArrowLeft, KeyRound, User } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { PasswordForm } from './password-form';
import { ProfileForm } from './profile-form';

export function ProfileSettingsView() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trang chủ
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <User className="h-6 w-6" />
            Hồ sơ cá nhân
          </h1>
          <p className="text-sm text-muted-foreground">
            Thông tin tài khoản và cài đặt cá nhân
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Cập nhật tên hiển thị của bạn trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Mật khẩu mới phải có ít nhất 8 ký tự.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
