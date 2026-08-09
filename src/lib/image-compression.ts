/**
 * @project AncestorTree
 * @file src/lib/image-compression.ts
 * @description Browser-side downscaling and WebP re-encoding applied before upload
 * @version 1.0.0
 * @updated 2026-08-09
 */

import {
  IMAGE_COMPRESSION_MIN_QUALITY,
  IMAGE_COMPRESSION_OUTPUT_EXTENSION,
  IMAGE_COMPRESSION_OUTPUT_TYPE,
  IMAGE_COMPRESSION_QUALITY_STEP,
  IMAGE_COMPRESSION_SKIP_TYPES,
} from '@constants';
import type { ImageCompressionOptions } from '@types';

interface Dimensions {
  width: number;
  height: number;
}

interface CanvasTarget {
  encode: (quality: number) => Promise<Blob | null>;
}

function scaleToFit(source: Dimensions, maxDimension: number): Dimensions {
  const longestEdge = Math.max(source.width, source.height);
  // Ratio is capped at 1 so a source smaller than the target is never upscaled
  const ratio = Math.min(1, maxDimension / longestEdge);
  return {
    width: Math.max(1, Math.round(source.width * ratio)),
    height: Math.max(1, Math.round(source.height * ratio)),
  };
}

/**
 * Draws the bitmap once and returns an encoder, so retrying at a lower quality
 * does not repeat the (expensive) rasterisation step.
 */
function drawToCanvas(
  bitmap: ImageBitmap,
  { width, height }: Dimensions
): CanvasTarget | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(bitmap, 0, 0, width, height);
    return {
      encode: (quality) =>
        canvas.convertToBlob({
          type: IMAGE_COMPRESSION_OUTPUT_TYPE,
          quality,
        }),
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(bitmap, 0, 0, width, height);
  return {
    encode: (quality) =>
      new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, IMAGE_COMPRESSION_OUTPUT_TYPE, quality);
      }),
  };
}

async function encodeWithinBudget(
  canvas: CanvasTarget,
  startQuality: number,
  targetBytes: number
): Promise<Blob | null> {
  let blob: Blob | null = null;

  for (
    let quality = startQuality;
    quality >= IMAGE_COMPRESSION_MIN_QUALITY;
    quality -= IMAGE_COMPRESSION_QUALITY_STEP
  ) {
    blob = await canvas.encode(quality);
    if (!blob || blob.size <= targetBytes) break;
  }

  return blob;
}

function replaceExtension(filename: string): string {
  const base = filename.replace(/\.[^./\\]+$/, '') || 'image';
  return `${base}.${IMAGE_COMPRESSION_OUTPUT_EXTENSION}`;
}

/**
 * Returns a downscaled WebP copy of `file`, or the original file whenever
 * compression is unsupported, fails, or would not actually save any bytes.
 */
export async function compressImage(
  file: File,
  { maxDimension, quality, targetBytes }: ImageCompressionOptions
): Promise<File> {
  if (IMAGE_COMPRESSION_SKIP_TYPES.includes(file.type)) return file;
  if (typeof createImageBitmap !== 'function') return file;

  let bitmap: ImageBitmap;
  try {
    // Phone cameras record rotation in EXIF rather than rotating the pixels;
    // without this option portrait shots get re-encoded sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }

  const target = scaleToFit(
    { width: bitmap.width, height: bitmap.height },
    maxDimension
  );
  const canvas = drawToCanvas(bitmap, target);
  bitmap.close();
  if (!canvas) return file;

  const blob = await encodeWithinBudget(canvas, quality, targetBytes);

  // Re-encoding an already optimised source can grow it — keep the smaller one
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], replaceExtension(file.name), {
    type: IMAGE_COMPRESSION_OUTPUT_TYPE,
    lastModified: Date.now(),
  });
}
