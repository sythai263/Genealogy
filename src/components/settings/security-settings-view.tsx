/**
 * @project AncestorTree
 * @file src/components/settings/security-settings-view.tsx
 * @description MFA (TOTP) self-service security settings
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Info,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@components/ui';
import {
  MFA_FACTORS_QUERY_KEY,
  MFA_FRIENDLY_NAME,
  MFA_ISSUER,
} from '@constants';
import { supabase } from '@lib';
import type { MfaEnrollState, TotpFactor } from '@types';
import { mapTotpFactors } from './map-totp-factors';
import { MfaEnrollPanel } from './mfa-enroll-panel';
import { MfaUnenrollDialog } from './mfa-unenroll-dialog';

export function SecuritySettingsView() {
  const t = useTranslations('Settings');
  const tLayout = useTranslations('Layout');
  const queryClient = useQueryClient();
  const { data: factors = [], isLoading: isLoadingFactors } = useQuery({
    queryKey: MFA_FACTORS_QUERY_KEY,
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return mapTotpFactors(user?.factors);
    },
  });
  const [enrollState, setEnrollState] = useState<MfaEnrollState | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [unenrollId, setUnenrollId] = useState<string | null>(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  async function handleEnroll() {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: MFA_ISSUER,
        friendlyName: MFA_FRIENDLY_NAME,
      });
      if (error) throw error;
      setEnrollState({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch {
      toast.error(t('security.toastEnableError'));
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleVerifyEnroll(code: string) {
    if (!enrollState) return;
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollState.factorId,
        code,
      });
      if (error) throw error;
      toast.success(t('security.toastEnableSuccess'));
      // Use the user data already returned by challengeAndVerify() — avoids calling
      // getUser() immediately after verify, which would deadlock against the auth lock
      // still held by the concurrent onAuthStateChange handler.
      const totp = mapTotpFactors(data.user.factors);
      queryClient.setQueryData(
        MFA_FACTORS_QUERY_KEY,
        totp.length > 0
          ? totp
          : [
              {
                id: enrollState.factorId,
                friendly_name: MFA_FRIENDLY_NAME,
                status: 'verified',
              },
            ]
      );
      setEnrollState(null);
    } catch {
      toast.error(t('security.toastInvalidCode'));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleCancelEnroll() {
    if (enrollState) {
      await supabase.auth.mfa
        .unenroll({ factorId: enrollState.factorId })
        .catch(() => null);
    }
    setEnrollState(null);
  }

  async function handleUnenroll() {
    if (!unenrollId) return;
    setIsUnenrolling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: unenrollId,
      });
      if (error) throw error;
      toast.success(t('security.toastDisableSuccess'));
      // Optimistic update — avoids a getUser() call while the auth lock may still be held
      queryClient.setQueryData<TotpFactor[]>(MFA_FACTORS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((factor) => factor.id !== unenrollId)
      );
      setUnenrollId(null);
    } catch {
      toast.error(t('security.toastDisableError'));
    } finally {
      setIsUnenrolling(false);
    }
  }

  const verifiedFactors = factors.filter(
    (factor) => factor.status === 'verified'
  );
  const hasVerifiedMfa = verifiedFactors.length > 0;

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tLayout('nav.home')}
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6" />
            {t('security.pageTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('security.pageSubtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" />
            {t('security.totpTitle')}
          </CardTitle>
          <CardDescription>{t('security.totpDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFactors ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-9 w-40" />
            </div>
          ) : enrollState ? (
            <MfaEnrollPanel
              enrollState={enrollState}
              isVerifying={isVerifying}
              onVerify={handleVerifyEnroll}
              onCancel={handleCancelEnroll}
            />
          ) : hasVerifiedMfa ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="border-green-200 bg-green-100 text-green-800">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {t('security.active')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('security.mfaEnabledActive')}
                </span>
              </div>
              <div className="space-y-2">
                {verifiedFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {factor.friendly_name || MFA_FRIENDLY_NAME}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setUnenrollId(factor.id)}
                    >
                      <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                      {t('security.disableShort')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('security.mfaDisabledHint')}
              </p>
              <Button onClick={handleEnroll} disabled={isEnrolling}>
                {isEnrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('security.enrolling')}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {t('security.enable')}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-4">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t('security.info')}</p>
          </div>
        </CardContent>
      </Card>

      <MfaUnenrollDialog
        open={!!unenrollId}
        isUnenrolling={isUnenrolling}
        onOpenChange={(open) => {
          if (!open) setUnenrollId(null);
        }}
        onConfirm={handleUnenroll}
      />
    </div>
  );
}
