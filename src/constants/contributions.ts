/**
 * @project AncestorTree
 * @file src/constants/contributions.ts
 * @description Shared constants for contribution UI (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';
import type { ChangeType, ContributionStatus } from '@types';

export const CONTRIBUTION_STATUS_ORDER: ContributionStatus[] = [
  'pending',
  'approved',
  'rejected',
];

export const CONTRIBUTION_STATUS_COLORS: Record<ContributionStatus, string> = {
  pending: 'text-amber-600',
  approved: 'text-green-600',
  rejected: 'text-destructive',
};

export const CONTRIBUTION_STATUS_ICONS: Record<ContributionStatus, LucideIcon> =
  {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };

export const CONTRIBUTION_STATUS_VARIANTS: Record<
  ContributionStatus,
  'default' | 'secondary' | 'destructive'
> = {
  pending: 'default',
  approved: 'secondary',
  rejected: 'destructive',
};

export const CONTRIBUTION_CHANGE_TYPE_ORDER: ChangeType[] = [
  'update',
  'create',
  'delete',
];

export const CONTRIBUTION_FIELD_KEYS = [
  'display_name',
  'phone',
  'email',
  'address',
  'birth_year',
  'death_year',
  'death_lunar',
  'occupation',
  'biography',
  'notes',
] as const;

export type ContributionFieldKey = (typeof CONTRIBUTION_FIELD_KEYS)[number];

export function isContributionFieldKey(
  value: string
): value is ContributionFieldKey {
  return CONTRIBUTION_FIELD_KEYS.some((key) => key === value);
}

export function isChangeType(value: string): value is ChangeType {
  for (const changeType of CONTRIBUTION_CHANGE_TYPE_ORDER) {
    if (changeType === value) return true;
  }
  return false;
}
