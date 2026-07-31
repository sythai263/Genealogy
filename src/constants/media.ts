/**
 * @project AncestorTree
 * @file src/constants/media.ts
 * @description Shared constants for media upload and desktop file serving
 * @version 1.0.0
 * @updated 2026-07-31
 */

import os from 'os';
import path from 'path';

/** SEC-CRIT-01: Maximum upload file size for desktop media API (50 MB) */
export const MEDIA_API_MAX_FILE_SIZE = 50 * 1024 * 1024;

/** SEC-CRIT-02: Allowlist of permitted MIME types for desktop media API upload */
export const MEDIA_API_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/** Local filesystem root for desktop-mode media storage */
export const MEDIA_DESKTOP_ROOT = path.join(os.homedir(), 'AncestorTree', 'media');

/** Maximum file size for Supabase Storage uploads (5 MB) */
export const MEDIA_STORAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed MIME types for Supabase Storage uploads */
export const MEDIA_STORAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
