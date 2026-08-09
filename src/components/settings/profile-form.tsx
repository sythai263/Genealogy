/**
 * @project AncestorTree
 * @file src/components/settings/profile-form.tsx
 * @description Profile display-name form with account info
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
import { PROFILE_ROLE_COLORS } from '@constants';
import { useUpdateProfile } from '@hooks';
import { cn, getInitials, supabase } from '@lib';
import {
  createProfileFormSchema,
  type ProfileFormData,
} from '@schemas';
import type { UserRole } from '@types';

export function ProfileForm() {
  const t = useTranslations('Settings');
  const tValidation = useTranslations('Validation');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { user, profile, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  const schema = useMemo(
    () => createProfileFormSchema(tValidation),
    [tValidation]
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  });

  useEffect(() => {
    form.reset({ full_name: profile?.full_name ?? '' });
  }, [profile?.full_name, form]);

  const role: UserRole = profile?.role ?? 'viewer';
  const roleLabel = t(`roles.${role}`);
  const roleColor = PROFILE_ROLE_COLORS[role];
  const initialsSource = profile?.full_name?.trim() || user?.email || '?';

  async function onSubmit(data: ProfileFormData) {
    if (!profile?.user_id) return;
    try {
      await updateProfile.mutateAsync({
        userId: profile.user_id,
        input: { full_name: data.full_name },
      });
      await supabase.auth.updateUser({ data: { full_name: data.full_name } });
      await refreshProfile();
      toast.success(t('profile.toastSuccess'));
      form.reset({ full_name: data.full_name });
    } catch {
      toast.error(t('profile.toastError'));
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
              {profile?.full_name || t('profile.nameUnset')}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge className={cn('mt-1 text-xs', roleColor)}>{roleLabel}</Badge>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.fullName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('profile.fullNamePlaceholder')}
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
            {t('profile.email')}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={user?.email ?? ''}
              readOnly
              className="cursor-not-allowed bg-muted"
            />
            {user?.email_confirmed_at && (
              <span title={t('profile.emailVerified')}>
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('profile.emailReadonly')}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            {t('profile.role')}
          </Label>
          <div className="flex h-9 items-center gap-2 rounded-md border bg-muted px-3 text-sm">
            <Badge className={cn('text-xs', roleColor)}>{roleLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              {t('profile.roleHint')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-0.5 text-xs font-medium text-foreground">
              {t('profile.createdAt')}
            </p>
            <p>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString(locale)
                : '—'}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium text-foreground">
              {t('profile.updatedAt')}
            </p>
            <p>
              {profile?.updated_at
                ? new Date(profile.updated_at).toLocaleDateString(locale)
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
              {tCommon('saving')}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('profile.save')}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
