/**
 * @project AncestorTree
 * @file src/lib/supabase-storage.ts
 * @description Supabase Storage utilities for image upload/delete
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { supabase } from './supabase';
import { compressImage } from './image-compression';
import {
  IMAGE_COMPRESSION_PRESETS,
  MEDIA_BUCKET,
  MEDIA_STORAGE_ALLOWED_TYPES,
  MEDIA_STORAGE_MAX_FILE_SIZE,
} from '@constants';
import type { ImageUploadKind } from '@types';

const BUCKET_NAME = MEDIA_BUCKET;

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

type AllowedMimeType = (typeof MEDIA_STORAGE_ALLOWED_TYPES)[number];

/** Checked against the original file so unsupported formats fail before any work */
function assertAllowedType(file: File): void {
  if (!MEDIA_STORAGE_ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    throw new StorageError(
      'Định dạng không hỗ trợ. Chấp nhận: JPEG, PNG, WebP, GIF.'
    );
  }
}

function extensionOf(file: File): string {
  return file.name.split('.').pop() || 'jpg';
}

/**
 * Shrinks the image for its destination, then uploads it. Size is validated
 * after compression so a large camera photo is resized rather than rejected.
 */
async function prepareUpload(file: File, kind: ImageUploadKind): Promise<File> {
  assertAllowedType(file);

  const optimised = await compressImage(file, IMAGE_COMPRESSION_PRESETS[kind]);

  if (optimised.size > MEDIA_STORAGE_MAX_FILE_SIZE) {
    throw new StorageError('File quá lớn. Tối đa 5MB.');
  }

  return optimised;
}

async function uploadToBucket(path: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new StorageError(error.message);

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export async function uploadFile(
  file: File,
  personId: string,
  kind: ImageUploadKind
): Promise<string> {
  const optimised = await prepareUpload(file, kind);
  const path = `people/${personId}/${Date.now()}.${extensionOf(optimised)}`;

  return uploadToBucket(path, optimised);
}

export async function uploadFeedImage(file: File): Promise<string> {
  const optimised = await prepareUpload(file, 'feed');
  const suffix = Math.random().toString(36).slice(2);
  const path = `feed/${Date.now()}-${suffix}.${extensionOf(optimised)}`;

  return uploadToBucket(path, optimised);
}

export async function deleteFile(url: string): Promise<void> {
  // Extract path from public URL
  const bucketUrl = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const idx = url.indexOf(bucketUrl);
  if (idx === -1) {
    console.warn(`[Storage] Cannot parse storage path from URL: ${url}`);
    return;
  }

  const path = decodeURIComponent(url.slice(idx + bucketUrl.length));
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw new StorageError(error.message);
}
