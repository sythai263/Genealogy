'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { KeyRound, Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { OtpEmailForm } from '@components/auth/otp-email-form';
import { PasswordLoginForm } from '@components/auth/password-login-form';
import { TotpStep } from '@components/auth/totp-step';
import { useAuth } from '@components/auth';
import {
  useClanSettings,
  useSignOutAuth,
  useVerifiedTotpFactor,
} from '@hooks';
import { CLAN_NAME, cn, getLoginLockoutSec } from '@lib';
import type { LoginPasswordFormData } from '@schemas';
import type { LoginMethod } from '@types';

export function LoginForm() {
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { data: cs } = useClanSettings();
  const clanName = cs?.clan_name ?? CLAN_NAME;
  const parts = clanName.trim().split(' ');
  const clanInitial =
    parts.length > 1
      ? (parts[parts.length - 1][0] ?? '?')
      : (parts[0][0] ?? '?');

  const enabledMethods: LoginMethod[] = cs?.login_config?.methods ?? [
    'email_password',
    'email_otp',
  ];
  const hasPassword = enabledMethods.includes('email_password');
  const hasOtp = enabledMethods.includes('email_otp');

  const defaultTab: 'password' | 'otp' = hasPassword ? 'password' : 'otp';
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>(defaultTab);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);

  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);

  const verifiedTotp = useVerifiedTotpFactor();
  const signOut = useSignOutAuth();

  useEffect(() => {
    if (lockedUntil <= 0) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemainingSec(left);
      if (left === 0) setLockedUntil(0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil > Date.now();

  useEffect(() => {
    if (searchParams.get('error') === 'suspended') {
      toast.error(
        'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên.'
      );
    }
  }, [searchParams]);

  async function onPasswordSubmit(data: LoginPasswordFormData) {
    if (isLocked) return;
    setIsLoading(true);

    try {
      await signIn(data.email, data.password);
      setFailCount(0);
      setLockedUntil(0);

      const totpId = await verifiedTotp.mutateAsync();
      if (totpId) {
        setTotpFactorId(totpId);
        setIsLoading(false);
        return;
      }

      toast.success('Đăng nhập thành công!');
      window.location.replace('/admin');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Đăng nhập thất bại';
      const newFails = failCount + 1;
      setFailCount(newFails);
      const lockSec = getLoginLockoutSec(newFails);
      if (lockSec > 0) {
        setLockedUntil(Date.now() + lockSec * 1000);
        toast.error(
          `Sai thông tin đăng nhập nhiều lần. Thử lại sau ${lockSec} giây.`
        );
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleTotpSuccess() {
    window.location.replace('/admin');
  }

  async function handleTotpBack() {
    await signOut.mutateAsync();
    setTotpFactorId(null);
  }

  let cardTitle = 'Đăng nhập';
  let cardDescription = 'Cổng thông tin gia phả';
  if (totpFactorId) {
    cardTitle = 'Xác thực 2 bước';
    cardDescription = 'Nhập mã từ ứng dụng xác thực';
  } else if (activeTab === 'otp') {
    cardTitle = 'Đăng nhập bằng mã OTP';
    cardDescription = 'Không cần mật khẩu';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-xl font-bold text-white">
            {clanInitial}
          </div>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {totpFactorId ? (
            <TotpStep
              factorId={totpFactorId}
              onSuccess={handleTotpSuccess}
              onBack={handleTotpBack}
            />
          ) : (
            <>
              {hasPassword && hasOtp && (
                <div className="mb-5 flex gap-1 rounded-lg border bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('password')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === 'password'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('otp')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === 'otp'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Mã OTP
                  </button>
                </div>
              )}

              {activeTab === 'password' && hasPassword && (
                <PasswordLoginForm
                  isLoading={isLoading}
                  isLocked={isLocked}
                  remainingSec={remainingSec}
                  onSubmit={onPasswordSubmit}
                />
              )}

              {activeTab === 'otp' && hasOtp && (
                <OtpEmailForm onBack={() => setActiveTab('password')} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
