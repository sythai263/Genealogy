/**
 * @project AncestorTree
 * @file src/constants/fund.ts
 * @description Shared constants for education fund (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { ScholarshipStatus, ScholarshipType } from '@types';

export const FUND_SCHOLARSHIP_STATUS_ORDER: ScholarshipStatus[] = [
  'pending',
  'approved',
  'paid',
];

export const FUND_SCHOLARSHIP_TYPE_ORDER: ScholarshipType[] = [
  'hoc_bong',
  'khen_thuong',
];

export const FUND_SCHOLARSHIP_STATUS_CLASSES: Record<ScholarshipStatus, string> =
  {
    pending: '',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  };
