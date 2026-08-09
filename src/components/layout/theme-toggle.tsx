/**
 * @project AncestorTree
 * @file src/components/layout/theme-toggle.tsx
 * @description Theme switcher — light / dark / system
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@components/ui';

interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  labelKey: 'light' | 'dark' | 'system';
  icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
];

const FALLBACK_THEME = THEME_OPTIONS[2];

export function ThemeToggle() {
  const t = useTranslations('Layout');
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const current = mounted
    ? (THEME_OPTIONS.find((option) => option.value === theme) ?? FALLBACK_THEME)
    : FALLBACK_THEME;
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title={t('theme.modeTitle')}
          className="gap-1.5"
          disabled={!mounted}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">
            {t(`theme.${current.labelKey}`)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('theme.label')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mounted ? (theme ?? 'system') : 'system'}
          onValueChange={setTheme}
        >
          {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="h-4 w-4" />
              {t(`theme.${labelKey}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
