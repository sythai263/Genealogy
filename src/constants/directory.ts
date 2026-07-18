/**
 * @project AncestorTree
 * @file src/constants/directory.ts
 * @description Shared constants for family directory filters
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { DirectoryGenderFilter, DirectoryStatusFilter } from '@types';

export const DIRECTORY_GENDER_FILTER_OPTIONS: {
  value: DirectoryGenderFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tất cả' },
  { value: '1', label: 'Nam' },
  { value: '2', label: 'Nữ' },
];

export const DIRECTORY_STATUS_FILTER_OPTIONS: {
  value: DirectoryStatusFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'living', label: 'Còn sống' },
  { value: 'deceased', label: 'Đã mất' },
];

export const DIRECTORY_GENDER_LABELS: Record<1 | 2, string> = {
  1: 'Nam',
  2: 'Nữ',
};

export function isDirectoryGenderFilter(
  value: string
): value is DirectoryGenderFilter {
  return DIRECTORY_GENDER_FILTER_OPTIONS.some(
    (option) => option.value === value
  );
}

export function isDirectoryStatusFilter(
  value: string
): value is DirectoryStatusFilter {
  return DIRECTORY_STATUS_FILTER_OPTIONS.some(
    (option) => option.value === value
  );
}
