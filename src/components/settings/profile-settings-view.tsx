/**
 * @project AncestorTree
 * @file src/components/settings/profile-settings-view.tsx
 * @description Profile settings page layout — info + password cards
 * @version 1.1.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, KeyRound, Languages, User } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { LocaleSwitcher } from '@components/layout';
import { PasswordForm } from './password-form';
import { ProfileForm } from './profile-form';

export async function ProfileSettingsView() {
  const t = await getTranslations('Settings');
  const tLayout = await getTranslations('Layout');

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tLayout('nav.home')}
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <User className="h-6 w-6" />
            {t('profile.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="h-4 w-4" />
            {t('profile.language')}
          </CardTitle>
          <CardDescription>{t('profile.languageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LocaleSwitcher size="default" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {t('profile.title')}
          </CardTitle>
          <CardDescription>{t('profile.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            {t('password.title')}
          </CardTitle>
          <CardDescription>{t('password.title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
