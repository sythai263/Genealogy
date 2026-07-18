/**
 * @project AncestorTree
 * @file src/constants/cau-duong.ts
 * @description Shared constants for Cầu đương
 * @version 1.1.0
 * @updated 2026-07-18
 */

import type { CauDuongCeremonyType, CauDuongStatus } from '@types';

const currentYear = new Date().getFullYear();

export const CAU_DUONG_YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, index) => currentYear - 1 + index
);

export const CAU_DUONG_STATUS_LABELS: Record<CauDuongStatus, string> = {
  scheduled: 'Đã phân công',
  completed: 'Đã hoàn thành',
  delegated: 'Đã ủy quyền',
  rescheduled: 'Đổi ngày',
  cancelled: 'Đã hủy',
};

export const CAU_DUONG_CEREMONY_LABELS: Record<CauDuongCeremonyType, string> = {
  tet: 'Tết Nguyên Đán (1/1 AL)',
  ram_thang_gieng: 'Rằm tháng Giêng (15/1 AL)',
  gio_to: 'Giỗ tổ Can Thăng (15/3 AL)',
  ram_thang_bay: 'Rằm tháng Bảy (15/7 AL)',
};

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
