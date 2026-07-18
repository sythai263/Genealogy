/**
 * @project AncestorTree
 * @file src/constants/people.ts
 * @description Shared constants for people list filters
 * @version 1.0.0
 * @updated 2026-07-18
 */

export type PeopleStatusFilter = 'all' | 'living' | 'deceased';

export const PEOPLE_STATUS_FILTER_OPTIONS: {
  value: PeopleStatusFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'living', label: 'Còn sống' },
  { value: 'deceased', label: 'Đã mất' },
];

export function isPeopleStatusFilter(
  value: string
): value is PeopleStatusFilter {
  return PEOPLE_STATUS_FILTER_OPTIONS.some((option) => option.value === value);
}
