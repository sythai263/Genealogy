export type AchievementCategory = 'hoc_tap' | 'su_nghiep' | 'cong_hien' | 'other';

export interface Achievement {
  id: string;
  person_id: string;
  title: string;
  category: AchievementCategory;
  description?: string;
  year?: number;
  awarded_by?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateAchievementInput = Omit<Achievement, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAchievementInput = Partial<CreateAchievementInput>;
