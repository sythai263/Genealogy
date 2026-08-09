/**
 * @project AncestorTree
 * @file src/constants/layout.ts
 * @description Shared layout and navigation constants (theme labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

/** Core nav URLs shown in elderly mode (simplified sidebar) */
export const ELDERLY_NAV_URLS = new Set([
  '/admin',
  '/tree',
  '/people',
  '/events',
  '/help',
]);

/** Admin nav URLs shown in elderly mode (essential only) */
export const ELDERLY_ADMIN_URLS = new Set([
  '/admin',
  '/admin/users',
  '/admin/contributions',
]);

export interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  /** Message key under Layout.theme — resolve with useTranslations */
  labelKey: 'light' | 'dark' | 'system';
  icon: LucideIcon;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
];
