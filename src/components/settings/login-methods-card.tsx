/**
 * @project AncestorTree
 * @file src/components/settings/login-methods-card.tsx
 * @description Login methods card — toggles email/password and email/OTP
 *              sign-in methods for the clan site
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Loader2, Lock, Save } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
} from '@components/ui';
import type { LoginMethod } from '@types';

interface LoginMethodsCardProps {
  methods: LoginMethod[];
  onMethodsChange: (methods: LoginMethod[]) => void;
  onSave: () => void;
  isSaving: boolean;
  canSubmit: boolean;
}

export function LoginMethodsCard({
  methods,
  onMethodsChange,
  onSave,
  isSaving,
  canSubmit,
}: LoginMethodsCardProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');

  const toggle = (method: LoginMethod, enabled: boolean) => {
    onMethodsChange(
      enabled
        ? [...methods, method]
        : methods.filter((m) => m !== method)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {t('settings.login.title')}
        </CardTitle>
        <CardDescription>{t('settings.login.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
            <Checkbox
              checked={methods.includes('email_password')}
              onCheckedChange={(checked) =>
                toggle('email_password', checked === true)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {t('settings.login.emailPassword.title')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('settings.login.emailPassword.description')}
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
            <Checkbox
              checked={methods.includes('email_otp')}
              onCheckedChange={(checked) =>
                toggle('email_otp', checked === true)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {t('settings.login.emailOtp.title')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('settings.login.emailOtp.description')}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {t('settings.login.emailOtp.badge')}
              </p>
            </div>
          </label>
        </div>

        {methods.length === 0 && (
          <p className="text-xs text-destructive">
            {t('settings.loginRequiredInline')}
          </p>
        )}

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isSaving || methods.length === 0 || !canSubmit}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon('saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('settings.saveLoginConfig')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
