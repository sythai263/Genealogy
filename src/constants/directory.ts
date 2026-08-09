/**
 * @project AncestorTree
 * @file src/constants/directory.ts
 * @description Shared constants for family directory filters (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type {
  DirectoryContactDisplay,
  DirectoryGenderFilter,
  DirectoryStatusFilter,
} from '@types';

export const DIRECTORY_MASKED_CONTACT: DirectoryContactDisplay = {
  phone: null,
  email: null,
  address: null,
  zalo: null,
  facebook: null,
  masked: true,
};

export const DIRECTORY_GENDER_FILTER_VALUES: DirectoryGenderFilter[] = [
  'all',
  '1',
  '2',
];

export const DIRECTORY_STATUS_FILTER_VALUES: DirectoryStatusFilter[] = [
  'all',
  'living',
  'deceased',
];

export function isDirectoryGenderFilter(
  value: string
): value is DirectoryGenderFilter {
  return DIRECTORY_GENDER_FILTER_VALUES.some((option) => option === value);
}

export function isDirectoryStatusFilter(
  value: string
): value is DirectoryStatusFilter {
  return DIRECTORY_STATUS_FILTER_VALUES.some((option) => option === value);
}
