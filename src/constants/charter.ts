/**
 * @project AncestorTree
 * @file src/constants/charter.ts
 * @description Shared constants for Hương ước (clan charter)
 * @version 1.0.0
 * @updated 2026-07-18
 */

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

export const CHARTER_FEATURED_EXCERPT_LENGTH = 200;

export function isClanArticleCategory(
  value: string
): value is ClanArticleCategory {
  for (const category of CHARTER_CATEGORY_ORDER) {
    if (category === value) return true;
  }
  return false;
}
