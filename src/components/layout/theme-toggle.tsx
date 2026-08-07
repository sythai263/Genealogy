/**
 * @project AncestorTree
 * @file src/components/layout/theme-toggle.tsx
 * @description Theme switcher — light / dark / system
 * @version 1.1.0
 * @updated 2026-08-07
 */

'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@components/ui';
import { THEME_OPTIONS } from '@constants';

const FALLBACK_THEME = THEME_OPTIONS[2];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // next-themes reads localStorage on the client before paint; keep a stable
  // fallback until mounted so SSR HTML matches the hydrated tree.
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
          title="Chế độ giao diện"
          className="gap-1.5"
          disabled={!mounted}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Giao diện</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mounted ? (theme ?? 'system') : 'system'}
          onValueChange={setTheme}
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
