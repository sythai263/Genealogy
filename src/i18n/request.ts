/**
 * @project AncestorTree
 * @file src/i18n/request.ts
 * @description next-intl request config — locale from cookie, messages from TS modules
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from './config';

async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case 'en':
      return (await import('@messages/en')).en;
    case 'vi':
    default:
      return (await import('@messages/vi')).vi;
  }
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get(localeCookieName)?.value;
  const locale: AppLocale =
    raw && isAppLocale(raw) ? raw : defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
