/**
 * @project AncestorTree
 * @file src/components/auth/pending-verification-view.tsx
 * @description Pending verification screen for unverified users
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Auth');
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
          <CardTitle className="text-xl">{t('pendingVerification.title')}</CardTitle>
          <CardDescription className="text-base">
            {t('pendingVerification.registeredSuccess')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('pendingVerification.waitMessage')}
          </p>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              {t('pendingVerification.contactIfError')}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            {t('pendingVerification.logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
