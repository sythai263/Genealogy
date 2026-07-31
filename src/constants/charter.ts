/**
 * @project AncestorTree
 * @file src/constants/charter.ts
 * @description Shared constants for Hương ước (clan charter)
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { BookOpen, MessageCircle, ScrollText, type LucideIcon } from 'lucide-react';
import type { ClanArticleCategory } from '@types';

export const CHARTER_CATEGORY_LABELS: Record<ClanArticleCategory, string> = {
  gia_huan: 'Gia huấn',
  quy_uoc: 'Quy ước',
  loi_dan: 'Lời dặn con cháu',
};

export const CHARTER_CATEGORY_ORDER: ClanArticleCategory[] = [
  'gia_huan',
  'quy_uoc',
  'loi_dan',
];

export const CHARTER_CATEGORY_OPTIONS = CHARTER_CATEGORY_ORDER.map(
  (value) => ({
    value,
    label: CHARTER_CATEGORY_LABELS[value],
  })
);

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
