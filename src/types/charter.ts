export type ClanArticleCategory = 'gia_huan' | 'quy_uoc' | 'loi_dan';

export interface ClanArticle {
  id: string;
  title: string;
  content: string;
  category: ClanArticleCategory;
  sort_order: number;
  is_featured: boolean;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export type CreateClanArticleInput = Omit<ClanArticle, 'id' | 'created_at' | 'updated_at'>;
export type UpdateClanArticleInput = Partial<CreateClanArticleInput>;

export interface ClanArticlesListFilters {
  category?: ClanArticleCategory;
  page: number;
  pageSize: 20 | 30 | 50;
}
