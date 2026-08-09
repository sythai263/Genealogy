/**
 * @project AncestorTree
 * @file src/constants/media.ts
 * @description Shared constants for Supabase Storage uploads and image compression
 * @version 3.0.0
 * @updated 2026-08-09
 */

import type { ImageCompressionOptions, ImageUploadKind } from '@types';

/** Public bucket: avatars, person photos, feed images */
export const MEDIA_BUCKET = 'media';

/** Private bucket: clan documents, reached only through signed URLs */
export const DOCUMENTS_BUCKET = 'documents';

/** Lifetime of a document signed URL (1 hour) */
export const DOCUMENT_SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Maximum file size for Supabase Storage uploads (5 MB) */
export const MEDIA_STORAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed MIME types for Supabase Storage uploads */
export const MEDIA_STORAGE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** WebP is roughly 30% smaller than JPEG at a comparable perceived quality */
export const IMAGE_COMPRESSION_OUTPUT_TYPE = 'image/webp';
export const IMAGE_COMPRESSION_OUTPUT_EXTENSION = 'webp';

/** Animated GIFs lose their animation when redrawn onto a canvas, so they bypass compression */
export const IMAGE_COMPRESSION_SKIP_TYPES: readonly string[] = ['image/gif'];

/** Each retry lowers the encoder quality by this step, never going below the floor */
export const IMAGE_COMPRESSION_QUALITY_STEP = 0.1;
export const IMAGE_COMPRESSION_MIN_QUALITY = 0.5;

/**
 * Presets are sized against where the image is actually rendered, doubled for
 * high-DPI screens. Storing anything larger costs space without looking sharper.
 */
export const IMAGE_COMPRESSION_PRESETS: Record<
  ImageUploadKind,
  ImageCompressionOptions
> = {
  // Rendered at 96px at most (h-24 w-24)
  avatar: { maxDimension: 512, quality: 0.85, targetBytes: 60 * 1024 },
  // Rendered up to 800px wide in the preview dialog
  gallery: { maxDimension: 1600, quality: 0.8, targetBytes: 250 * 1024 },
  // Rendered up to 800px wide in the post card
  feed: { maxDimension: 1600, quality: 0.78, targetBytes: 200 * 1024 },
};
