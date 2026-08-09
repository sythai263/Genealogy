/**
 * @project AncestorTree
 * @file src/i18n/config.ts
 * @description Locale config for next-intl (cookie-based, no URL prefix)
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const locales = ['vi', 'en'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'vi';

/** Cookie storing the active locale (no URL prefix) */
export const localeCookieName = 'NEXT_LOCALE';

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
