/**
 * @project AncestorTree
 * @file src/constants/registrations.ts
 * @description Shared constants for member registration admin UI
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const REGISTRATION_STATUS_MAP: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: { variant: 'default' },
  approved: { variant: 'secondary' },
  rejected: { variant: 'destructive' },
};

export const REGISTRATION_STATUS_FILTER_ALL = 'all';
export const REGISTRATION_DEFAULT_STATUS_FILTER = 'pending';

/** Filter values (labels via Admin.registrations.filters) */
export const REGISTRATION_STATUS_FILTER_VALUES = [
  REGISTRATION_STATUS_FILTER_ALL,
  'pending',
  'approved',
  'rejected',
] as const;

export type RegistrationStatusFilter =
  (typeof REGISTRATION_STATUS_FILTER_VALUES)[number];
