/**
 * @project AncestorTree
 * @file src/lib/api/files.ts
 * @description Upload validation shared by file-accepting API routes
 * @version 2.0.0
 * @updated 2026-08-09
 */

import type { NextResponse } from 'next/server';
import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import type { UploadValidationOptions } from '@types';
import { apiError } from './responses';

function formatMegabytes(bytes: number): string {
  return String(Math.round(bytes / 1024 / 1024));
}

/**
 * SEC-CRIT-01 / SEC-CRIT-02: enforces size limit and MIME allowlist.
 * Returns a `NextResponse` to short-circuit on failure, `null` when valid.
 */
export function validateUpload(
  file: File | null,
  { maxSize, allowedMimeTypes }: UploadValidationOptions
): NextResponse | null {
  if (!file) {
    return apiError(API_ERROR_MESSAGES.noFile, API_STATUS.badRequest);
  }

  if (file.size > maxSize) {
    return apiError(
      `${API_ERROR_MESSAGES.fileTooLarge}. Giới hạn tối đa là ${formatMegabytes(maxSize)} MB`,
      API_STATUS.payloadTooLarge
    );
  }

  if (allowedMimeTypes && !allowedMimeTypes.has(file.type)) {
    return apiError(
      `${API_ERROR_MESSAGES.unsupportedFileType}: ${file.type || 'unknown'}`,
      API_STATUS.unsupportedMediaType
    );
  }

  return null;
}
