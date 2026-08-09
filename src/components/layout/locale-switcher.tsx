/**
 * @project AncestorTree
 * @file src/components/layout/locale-switcher.tsx
 * @description Cookie-based locale switcher (no URL prefix change)
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import { localeCookieName, locales, type AppLocale } from '@i18n/config';
import { cn } from '@lib/utils';

interface LocaleSwitcherProps {
  className?: string;
  /** Compact trigger for nav bars */
  size?: 'sm' | 'default';
}

export function LocaleSwitcher({
  className,
  size = 'sm',
}: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Common');

  function setLocale(next: AppLocale) {
    document.cookie = `${localeCookieName}=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (locales.includes(value as AppLocale)) {
          setLocale(value as AppLocale);
        }
      }}
    >
      <SelectTrigger
        aria-label={t('locale.label')}
        className={cn(
          size === 'sm' && 'h-8 w-[7.5rem] text-xs',
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="vi">{t('locale.vi')}</SelectItem>
        <SelectItem value="en">{t('locale.en')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
