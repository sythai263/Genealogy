/**
 * @project AncestorTree
 * @file src/constants/layout.ts
 * @description Shared layout and navigation constants
 * @version 1.0.0
 * @updated 2026-07-31
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
  label: string;
  icon: LucideIcon;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Sáng', icon: Sun },
  { value: 'dark', label: 'Tối', icon: Moon },
  { value: 'system', label: 'Hệ thống', icon: Monitor },
];
