/**
 * @project AncestorTree
 * @file src/lib/api/files.ts
 * @description Path traversal guard and upload validation shared by file routes
 * @version 1.0.0
 * @updated 2026-08-09
 */

import path from 'path';
import type { NextResponse } from 'next/server';
import {
  API_ERROR_MESSAGES,
  API_STATUS,
  MEDIA_EXT_MIME_TYPES,
  MEDIA_FALLBACK_MIME_TYPE,
} from '@constants';
import type { UploadValidationOptions } from '@types';
import { apiError } from './responses';

/**
 * Resolves `segments` under `root`, returning `null` when the result escapes
 * the root directory (path traversal attempt).
 */
export function resolveSafePath(root: string, segments: string[]): string | null {
  const resolved = path.resolve(root, ...segments);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }
  return resolved;
}

/** Content-Type for a local file, derived from its extension */
export function mimeTypeForPath(filePath: string): string {
  return MEDIA_EXT_MIME_TYPES[path.extname(filePath).toLowerCase()] ?? MEDIA_FALLBACK_MIME_TYPE;
}

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
