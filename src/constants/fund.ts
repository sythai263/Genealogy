/**
 * @project AncestorTree
 * @file src/constants/fund.ts
 * @description Shared constants for education fund (quỹ khuyến học)
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { ScholarshipStatus, ScholarshipType } from '@types';

export const FUND_SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> =
  {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    paid: 'Đã cấp',
  };

export const FUND_SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipType, string> = {
  hoc_bong: 'Học bổng',
  khen_thuong: 'Khen thưởng',
};

export const FUND_SCHOLARSHIP_STATUS_CLASSES: Record<ScholarshipStatus, string> =
  {
    pending: '',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  };

export const FUND_REPORT_CLAN_NAME = 'CHI TỘC Lê Sỹ';
