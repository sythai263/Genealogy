export type MediaType = 'photo' | 'document' | 'video';

export interface Media {
  id: string;
  person_id: string;
  type: MediaType;
  url: string;
  caption?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export type CreateMediaInput = Omit<Media, 'id' | 'created_at'>;

/** Where an uploaded image ends up — selects the matching compression preset */
export type ImageUploadKind = 'avatar' | 'gallery' | 'feed';

export interface ImageCompressionOptions {
  /** Longest edge of the output image, in pixels */
  maxDimension: number;
  /** Starting WebP encoder quality, between 0 and 1 */
  quality: number;
  /** Encoder retries at lower quality until the result fits this budget */
  targetBytes: number;
}
