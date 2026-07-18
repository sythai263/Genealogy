/**
 * @project AncestorTree
 * @file src/components/settings/profile-form.tsx
 * @description Profile display-name form with account info
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Separator,
} from '@components/ui';
import { PROFILE_ROLE_LABELS } from '@constants';
import { useUpdateProfile } from '@hooks';
import { getInitials } from '@lib/format-utils';
import { supabase } from '@lib/supabase';
import { cn } from '@lib/utils';
import {
  profileFormSchema,
  type ProfileFormData,
} from '@schemas';
import type { UserRole } from '@types';

export function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  });

  useEffect(() => {
    form.reset({ full_name: profile?.full_name ?? '' });
  }, [profile?.full_name, form]);

  const role: UserRole = profile?.role ?? 'viewer';
  const roleInfo = PROFILE_ROLE_LABELS[role];
  const initialsSource =
    profile?.full_name?.trim() || user?.email || '?';

  async function onSubmit(data: ProfileFormData) {
    if (!profile?.user_id) return;
    try {
      await updateProfile.mutateAsync({
        userId: profile.user_id,
        input: { full_name: data.full_name },
      });
      await supabase.auth.updateUser({ data: { full_name: data.full_name } });
      await refreshProfile();
      toast.success('Đã lưu thông tin cá nhân');
      form.reset({ full_name: data.full_name });
    } catch {
      toast.error('Lỗi khi lưu');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-emerald-600 text-xl font-bold text-white">
              {getInitials(initialsSource)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">
              {profile?.full_name || 'Chưa cập nhật tên'}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge className={cn('mt-1 text-xs', roleInfo.color)}>
              {roleInfo.label}
            </Badge>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nguyễn Văn A"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={user?.email ?? ''}
              readOnly
              className="cursor-not-allowed bg-muted"
            />
            {user?.email_confirmed_at && (
              <span title="Email đã xác thực">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Email không thể thay đổi qua giao diện này.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Vai trò
          </Label>
          <div className="flex h-9 items-center gap-2 rounded-md border bg-muted px-3 text-sm">
            <Badge className={cn('text-xs', roleInfo.color)}>
              {roleInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              — do quản trị viên phân quyền
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-0.5 text-xs font-medium text-foreground">
              Ngày tạo
            </p>
            <p>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('vi-VN')
                : '—'}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium text-foreground">
              Cập nhật lần cuối
            </p>
            <p>
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleDateString('vi-VN')
                : '—'}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!form.formState.isDirty || updateProfile.isPending}
          className="w-full sm:w-auto"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
