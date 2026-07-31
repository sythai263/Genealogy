import {
  Briefcase,
  GraduationCap,
  Heart,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { AchievementCategory } from '@types';

export interface AchievementCategoryOption {
  value: AchievementCategory | 'all';
  label: string;
  icon: LucideIcon;
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategoryOption[] = [
  { value: 'all', label: 'Tất cả', icon: Trophy },
  { value: 'hoc_tap', label: 'Học tập', icon: GraduationCap },
  { value: 'su_nghiep', label: 'Sự nghiệp', icon: Briefcase },
  { value: 'cong_hien', label: 'Cống hiến', icon: Heart },
];

export const ACHIEVEMENT_CATEGORY_ICONS: Record<AchievementCategory, LucideIcon> =
  {
    hoc_tap: GraduationCap,
    su_nghiep: Briefcase,
    cong_hien: Heart,
    other: Trophy,
  };

export function getAchievementCategoryIcon(
  category: AchievementCategory
): LucideIcon {
  return ACHIEVEMENT_CATEGORY_ICONS[category] ?? Trophy;
}

export function getAchievementCategoryLabel(
  category: AchievementCategory
): string {
  switch (category) {
    case 'hoc_tap':
      return 'Học tập';
    case 'su_nghiep':
      return 'Sự nghiệp';
    case 'cong_hien':
      return 'Cống hiến';
    default:
      return 'Khác';
  }
}

export const ACHIEVEMENT_FORM_CATEGORIES: {
  value: AchievementCategory;
  label: string;
}[] = [
  { value: 'hoc_tap', label: 'Học tập' },
  { value: 'su_nghiep', label: 'Sự nghiệp' },
  { value: 'cong_hien', label: 'Cống hiến' },
  { value: 'other', label: 'Khác' },
];
