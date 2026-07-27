/**
 * @project AncestorTree
 * @file src/types/document.ts
 * @description Type definitions for clan documents (kho tài liệu)
 * @version 1.1.0
 * @updated 2026-07-18
 */

export type DocumentCategory =
  | 'anh_lich_su'
  | 'giay_to'
  | 'ban_do'
  | 'video'
  | 'bai_viet'
  | 'khac';

export interface ClanDocument {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  category: DocumentCategory;
  tags?: string;
  person_id?: string;
  uploaded_by?: string;
  /** 0=public, 1=members only, 2=admin only */
  privacy_level: number;
  created_at: string;
  updated_at: string;
}

export type CreateClanDocumentInput = Omit<
  ClanDocument,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateClanDocumentInput = Partial<CreateClanDocumentInput>;

export interface DocumentsListFilters {
  category?: DocumentCategory;
  search?: string;
  page: number;
  pageSize: 20 | 30 | 50;
}
