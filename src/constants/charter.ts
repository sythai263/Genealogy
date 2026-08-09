/**
 * @project AncestorTree
 * @file src/constants/charter.ts
 * @description Shared constants for Hương ước (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { BookOpen, MessageCircle, ScrollText, type LucideIcon } from 'lucide-react';
import type { ClanArticleCategory } from '@types';

export const CHARTER_CATEGORY_ORDER: ClanArticleCategory[] = [
  'gia_huan',
  'quy_uoc',
  'loi_dan',
];

export const CHARTER_TAB_ICONS: Record<ClanArticleCategory, LucideIcon> = {
  gia_huan: BookOpen,
  quy_uoc: ScrollText,
  loi_dan: MessageCircle,
};

export const CHARTER_FEATURED_EXCERPT_LENGTH = 200;

export function isClanArticleCategory(
  value: string
): value is ClanArticleCategory {
  for (const category of CHARTER_CATEGORY_ORDER) {
    if (category === value) return true;
  }
  return false;
}
