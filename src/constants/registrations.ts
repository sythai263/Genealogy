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
