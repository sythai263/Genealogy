/**
 * @project AncestorTree
 * @file src/lib/i18n-api.ts
 * @description Resolve API error messages via next-intl for route handlers
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';

export type ApiErrorKey =
  | 'badRequest'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'serverMisconfigured'
  | 'serverError'
  | 'noFile'
  | 'fileTooLarge'
  | 'unsupportedFileType'
  | 'backupFailed'
  | 'restoreFailed'
  | 'exportFailed'
  | 'notImplemented';

export async function apiErrorMessage(key: ApiErrorKey): Promise<string> {
  const t = await getTranslations('Common');
  return t(`apiErrors.${key}`);
}
