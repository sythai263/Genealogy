/**
 * @project AncestorTree
 * @file src/components/layout/locale-switcher.tsx
 * @description Cookie-based locale switcher (no URL prefix change)
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { Globe } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@components/ui';
import { localeCookieName, locales, type AppLocale } from '@i18n/config';
import { cn } from '@lib';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Common');

  function setLocale(next: AppLocale) {
    document.cookie = `${localeCookieName}=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('locale.label')}
          className={cn('h-8 w-8', className)}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            if (locales.includes(value as AppLocale)) {
              setLocale(value as AppLocale);
            }
          }}
        >
          <DropdownMenuRadioItem value="vi">
            {t('locale.vi')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">
            {t('locale.en')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
