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

export const FUND_REPORT_CLAN_NAME = 'CHI TỘC ĐẶNG ĐÌNH';
