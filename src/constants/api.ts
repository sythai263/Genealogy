/**
 * @project AncestorTree
 * @file src/constants/api.ts
 * @description Shared API status codes and error message keys (copy via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { vi } from '@messages/vi';

export const API_STATUS = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  payloadTooLarge: 413,
  unsupportedMediaType: 415,
  tooManyRequests: 429,
  serverError: 500,
  notImplemented: 501,
} as const;

/**
 * Default (Vietnamese) API error strings — single source with Common.apiErrors.
 * Prefer `apiErrorMessage(key)` in route handlers for locale-aware responses.
 */
export const API_ERROR_MESSAGES = vi.Common.apiErrors;

/** Roles allowed to run privileged export/admin API operations */
export const API_ADMIN_ROLES = ['admin', 'editor'] as const;
