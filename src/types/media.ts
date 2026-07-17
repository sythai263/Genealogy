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
