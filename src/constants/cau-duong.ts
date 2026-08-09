/**
 * @project AncestorTree
 * @file src/constants/cau-duong.ts
 * @description Shared constants for Cầu đương (labels via next-intl)
 * @version 1.2.0
 * @updated 2026-08-09
 */

import type { CauDuongCeremonyType, CauDuongStatus } from '@types';

const currentYear = new Date().getFullYear();

export const CAU_DUONG_YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, index) => currentYear - 1 + index
);

export const CAU_DUONG_STATUS_ORDER: CauDuongStatus[] = [
  'scheduled',
  'completed',
  'delegated',
  'rescheduled',
  'cancelled',
];

export const CAU_DUONG_CEREMONY_ORDER: CauDuongCeremonyType[] = [
  'tet',
  'ram_thang_gieng',
  'gio_to',
  'ram_thang_bay',
];

export const CAU_DUONG_STATUS_VARIANTS: Record<
  CauDuongStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  scheduled: 'secondary',
  completed: 'default',
  delegated: 'outline',
  rescheduled: 'outline',
  cancelled: 'destructive',
};

export function getCauDuongCurrentYear(): number {
  return currentYear;
}
