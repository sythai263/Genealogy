/**
 * @project AncestorTree
 * @file src/constants/achievements.ts
 * @description Shared constants for achievements (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import {
  Briefcase,
  GraduationCap,
  Heart,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { AchievementCategory } from '@types';

export type AchievementFilterCategory = AchievementCategory | 'all';

export const ACHIEVEMENT_FILTER_VALUES: AchievementFilterCategory[] = [
  'all',
  'hoc_tap',
  'su_nghiep',
  'cong_hien',
];

export const ACHIEVEMENT_FORM_CATEGORY_VALUES: AchievementCategory[] = [
  'hoc_tap',
  'su_nghiep',
  'cong_hien',
  'other',
];

export const ACHIEVEMENT_CATEGORY_ICONS: Record<
  AchievementFilterCategory,
  LucideIcon
> = {
  all: Trophy,
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
