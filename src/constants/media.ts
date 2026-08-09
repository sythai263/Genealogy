/**
 * @project AncestorTree
 * @file src/constants/media.ts
 * @description Shared constants for Supabase Storage media uploads
 * @version 2.0.0
 * @updated 2026-08-09
 */

/** Maximum file size for Supabase Storage uploads (5 MB) */
export const MEDIA_STORAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed MIME types for Supabase Storage uploads */
export const MEDIA_STORAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;
