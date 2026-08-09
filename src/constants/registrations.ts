/**
 * @project AncestorTree
 * @file src/constants/registrations.ts
 * @description Shared constants for member registration admin UI
 * @version 1.0.0
 * @updated 2026-07-31
 */

export const REGISTRATION_STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: { label: 'Chờ duyệt', variant: 'default' },
  approved: { label: 'Đã duyệt', variant: 'secondary' },
  rejected: { label: 'Từ chối', variant: 'destructive' },
};

export const REGISTRATION_STATUS_FILTER_ALL = 'all';
export const REGISTRATION_DEFAULT_STATUS_FILTER = 'pending';

export const REGISTRATION_STATUS_FILTER_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: REGISTRATION_STATUS_FILTER_ALL, label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
];
