/**
 * @project AncestorTree
 * @file src/i18n/global.ts
 * @description Type augmentation for next-intl AppConfig
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppLocale } from './config';
import type { AppMessages } from '@messages/types';

declare module 'next-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: AppMessages;
  }
}
